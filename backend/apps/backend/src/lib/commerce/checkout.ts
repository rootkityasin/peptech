import { checkoutTaxQuote } from "./stripe-tax-quote"
import { createHash, randomBytes } from "node:crypto"
import { Modules } from "@medusajs/framework/utils"
import CommerceService, { recordId, LedgerRecord } from "../../modules/peptech-commerce/service"
import { assertStripeAccount, stripeContext } from "./stripe"
import { checkoutSchema, fail, owned } from "./policy"
import { buildQuote, reserveQuote, releaseQuote, Quote } from "./quote"
import { getPaymentGateway } from "./gateways/registry"

export async function prepareCheckout(scope: any, ledger: CommerceService, customerId: string, body: unknown) {
  const input = checkoutSchema.parse(body)
  const context = await assertStripeAccount()
  if (context.mode === "live") {
    const settings = await ledger.get("commerce_settings")
    if (
      !settings?.data.stripe_scope_evidence_ref ||
      !process.env.REDIS_URL ||
      !process.env.STRIPE_EMAIL_HOST ||
      !process.env.STRIPE_EMAIL_FROM ||
      (process.env.STRIPE_COMMERCE_SIGNING_SECRET || "").length < 32 ||
      !process.env.STRIPE_CHECKOUT_WEBHOOK_SECRET ||
      !process.env.JWT_SECRET ||
      process.env.JWT_SECRET === "supersecret" ||
      !process.env.COOKIE_SECRET ||
      process.env.COOKIE_SECRET === "supersecret"
    ) {
      fail("Production payment prerequisites have not been cleared", 503)
    }
  }

  const id = recordId("attempt", context.profile, customerId, input.revision)
  return ledger.locked(`customer-checkout:${customerId}`, async () => {
    const hash = createHash("sha256").update(JSON.stringify(input)).digest("hex")
    let attempt = await ledger.get(id)
    if (attempt && attempt.data.request_hash !== hash) fail("Basket changed. Use a new checkout revision.", 409)

    const active = await ledger.list("attempt", { owner: customerId, profile: context.profile, limit: 500 })
    for (const other of active.filter((a) => a.id !== id && ["creating", "open", "processing"].includes(a.state))) {
      if (!other.data.session_id) {
        other.state = "failed"
        await ledger.save(other)
        await releaseQuote(scope, other.id)
        continue
      }
      try {
        const session = await context.stripe.checkout.sessions.retrieve(other.data.session_id)
        if (session.status === "open") await context.stripe.checkout.sessions.expire(session.id)
        else if (session.status !== "expired" && session.payment_status === "paid") {
          try {
            const { reconcileSession } = await import("./events.js")
            await reconcileSession(scope, ledger, session.id)
            continue
          } catch {
            fail("A previous payment is awaiting confirmation. Check your orders before retrying.", 409)
          }
        }
      } catch (e: any) {
        if (e?.status === 409) throw e
      }
      other.state = "expired"
      await ledger.save(other)
      await releaseQuote(scope, other.id)
    }

    if (!attempt) {
      const recent = active.filter((a) => Date.now() - new Date(a.created_at).getTime() < 3600000)
      if (recent.length >= 12) fail("Too many checkout attempts. Please try again later.", 429)
      const quote = await buildQuote(scope, ledger, customerId, input, id)
      attempt = await ledger.create({
        id,
        kind: "attempt",
        profile: context.profile,
        owner_id: customerId,
        state: "creating",
        data: {
          request_hash: hash,
          quote,
          revision: input.revision,
          payment_method: input.payment_method,
          integration_identifier: `peptech_${Array.from(randomBytes(8), (b) => String.fromCharCode(97 + (b % 26))).join("")}`,
          consent: { ruo: true, recurring: input.recurring_accepted, version: "checkout-v1", accepted_at: new Date().toISOString() },
          expires_at: Math.floor(Date.now() / 1000) + 3600,
        },
      })
    }

    owned(attempt, customerId, context.profile)
    if (["paid", "confirmed", "held"].includes(attempt.state)) return publicAttempt(attempt)
    if (["expired", "failed"].includes(attempt.state)) fail("Checkout has expired. Refresh your basket.", 409)
    if (attempt.state === "review") fail("Checkout needs operator reconciliation before another payment", 409)

    const quote = attempt.data.quote as Quote
    await reserveQuote(scope, quote, id)

    const gateway = getPaymentGateway(input.payment_method || "stripe")
    const origin = process.env.STRIPE_STOREFRONT_URL || "http://localhost:3000"

    let customerObj: any = null
    try {
      customerObj = await scope.resolve(Modules.CUSTOMER).retrieveCustomer(customerId)
    } catch {
      customerObj = { id: customerId, email: quote.email }
    }

    let session: any = attempt.data.session_id ? await context.stripe.checkout.sessions.retrieve(attempt.data.session_id) : null

    if (!session) {
      if (Date.now() - new Date(attempt.created_at).getTime() > 23 * 3600000) fail("Checkout needs reconciliation before retry", 409)
      if (attempt.data.expires_at < Math.floor(Date.now() / 1000) + 1800) fail("Checkout is awaiting expiry reconciliation. Please retry shortly.", 409)

      try {
        const result = await gateway.createCheckoutSession({
          attemptId: id,
          customer: {
            id: customerId,
            email: quote.email,
            firstName: customerObj?.first_name,
            lastName: customerObj?.last_name,
            phone: customerObj?.phone,
            companyName: customerObj?.company_name,
            address: quote.address,
          },
          quote,
          revision: input.revision,
          origin,
          uiMode: input.ui_mode || "embedded",
        })

        attempt.data.session_id = result.sessionId
        attempt.data.stripe_customer_id = result.stripeCustomerId
        attempt.data.client_secret = result.clientSecret
        attempt.data.checkout_url = result.checkoutUrl
        attempt.data.publishable_key = result.publishableKey
        attempt.state = result.state

        if (customerId && result.stripeCustomerId) {
          const custKey = recordId("customer", context.profile, customerId)
          await ledger.create({
            id: custKey,
            kind: "customer",
            profile: context.profile,
            owner_id: customerId,
            state: "active",
            data: { stripe_id: result.stripeCustomerId },
          }).catch(async () => {
            await ledger.patch(custKey, { stripe_id: result.stripeCustomerId }, "active").catch(() => {})
          })
        }

        session = await context.stripe.checkout.sessions.retrieve(result.sessionId)
      } catch (error: any) {
        if (error.type === "StripeInvalidRequestError") {
          attempt.state = "failed"
          await ledger.save(attempt)
          await releaseQuote(scope, attempt.id)
        }
        throw error
      }
    }

    if (quote.tax_policy === "stripe_default" && session && session.automatic_tax?.status !== "requires_location_inputs") {
      attempt.data.quote = await checkoutTaxQuote(context.stripe, session, quote)
    }

    if (session) {
      if (session.livemode !== (context.mode === "live")) fail("Stripe environment mismatch", 503)
      attempt.state =
        session.status === "expired"
          ? "expired"
          : session.payment_status === "paid" || session.status === "complete"
          ? "processing"
          : "open"
      attempt.data.checkout_url = session.url || attempt.data.checkout_url
      attempt.data.client_secret = session.client_secret || attempt.data.client_secret
    }

    await ledger.save(attempt)
    return publicAttempt(attempt)
  })
}

export function publicAttempt(attempt: LedgerRecord) {
  const q = attempt.data.quote as Quote
  return {
    attemptId: attempt.id,
    state: attempt.state,
    orderId: attempt.data.order_id || null,
    orderNumber: attempt.data.order_number || attempt.data.display_id || null,
    stripeReceiptUrl: attempt.data.stripe_receipt_url || null,
    revision: attempt.data.revision,
    taxStatus: q.stripe_tax_status,
    total: q.total_minor / 100,
    currency: q.currency,
    renewalTotal: q.renewal_minor / 100,
    items: q.lines.map((l) => ({ name: l.name, quantity: l.quantity, recurring: l.recurring, unitPrice: l.unit_minor / 100 })),
    shipping: q.shipping_minor / 100,
    shippingOptionId: q.shipping_option_id || null,
    shippingOptionName: q.shipping_option_name || null,
    tax: q.tax_minor / 100 || 0,
    taxInclusive: q.tax_inclusive,
    paymentMethod: attempt.data.payment_method,
    reference: attempt.id,
    subscriptionId: attempt.data.subscription_id || null,
    checkoutUrl: attempt.data.checkout_url || undefined,
    clientSecret: attempt.data.client_secret || undefined,
    publishableKey: attempt.data.publishable_key || undefined,
  }
}
