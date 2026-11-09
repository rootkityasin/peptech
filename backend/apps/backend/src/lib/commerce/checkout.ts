import { checkoutTaxQuote } from "./stripe-tax-quote"
import { createHash, randomBytes } from "node:crypto"
import { Modules } from "@medusajs/framework/utils"
import CommerceService, { recordId, LedgerRecord } from "../../modules/peptech-commerce/service"
import { assertStripeAccount } from "./stripe"
import { checkoutSchema, fail, owned } from "./policy"
import { buildQuote, reserveQuote, releaseQuote, Quote } from "./quote"
import { getPaymentGateway, isCardGatewayActive } from "./gateways/registry"
import { resolveStorefrontOrigin } from "./http"

export async function prepareCheckout(scope: any, ledger: CommerceService, customerId: string, body: unknown, req?: any) {
  const input = checkoutSchema.parse(body)
  const paymentMethod = input.payment_method || "bank_transfer"
  const isBankTransfer = paymentMethod === "bank_transfer"
  const isStripeMethod = paymentMethod === "stripe" || paymentMethod === "card"

  let context: Awaited<ReturnType<typeof assertStripeAccount>> | null = null
  let profile = "bank_transfer:v1"

  if (isBankTransfer) {
    if (input.items.some((item) => item.recurring)) {
      fail("28-day recurring subscriptions require an active card payment gateway. Switch items to one-time purchase to pay via UK Faster Payments (Bank Transfer).", 400)
    }
    profile = "bank_transfer:v1"
  } else if (isStripeMethod) {
    if (!isCardGatewayActive()) {
      fail("Card payment processing is temporarily unavailable. Please complete your order via UK Faster Payments (Bank Transfer).", 503)
    }
    context = await assertStripeAccount()
    if (context.mode === "live") {
      const settings = await ledger.get("commerce_settings")
      if (
        !settings?.data.stripe_scope_evidence_ref ||
        !process.env.REDIS_URL ||
        !process.env.STRIPE_EMAIL_HOST ||
        !process.env.STRIPE_EMAIL_FROM ||
        (process.env.STRIPE_COMMERCE_SIGNING_SECRET || "").length < 32 ||
        !(process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_CHECKOUT_WEBHOOK_SECRET) ||
        !process.env.JWT_SECRET ||
        process.env.JWT_SECRET === "supersecret" ||
        !process.env.COOKIE_SECRET ||
        process.env.COOKIE_SECRET === "supersecret"
      ) {
        fail("Production payment prerequisites have not been cleared", 503)
      }
    }
    profile = context.profile
  } else {
    getPaymentGateway(paymentMethod)
    profile = `${paymentMethod}:v1`
  }

  const id = recordId("attempt", profile, customerId, input.revision)
  return ledger.locked(`customer-checkout:${customerId}`, async () => {
    const hash = createHash("sha256").update(JSON.stringify(input)).digest("hex")
    const settingsRecord = await ledger.get("commerce_settings").catch(() => null)
    const liveBankInstructions = settingsRecord?.data?.bank_instructions || null

    let attempt = await ledger.get(id)
    if (attempt && attempt.data.request_hash !== hash) fail("Basket changed. Use a new checkout revision.", 409)

    const active = await ledger.list("attempt", { owner: customerId, profile, limit: 500 })
    for (const other of active.filter((a) => a.id !== id && ["creating", "open", "processing"].includes(a.state))) {
      if (!other.data.session_id || isBankTransfer || !context) {
        other.state = "failed"
        await ledger.save(other)
        await releaseQuote(scope, other.id)
        continue
      }
      try {
        const session = await context.stripe.checkout.sessions.retrieve(other.data.session_id)
        if (session.status !== "expired" && session.payment_status === "paid") {
          try {
            const { reconcileSession } = await import("./events.js")
            await reconcileSession(scope, ledger, session.id)
            continue
          } catch {
            fail("A previous payment is awaiting confirmation. Check your orders before retrying.", 409)
          }
        } else if (session.status === "open") {
          // Release prior open checkout attempts for this customer to avoid inventory exhaustion
          try {
            await context.stripe.checkout.sessions.expire(session.id)
          } catch (expireErr: any) {
            console.warn("Could not expire previous card checkout session:", expireErr?.message)
          }
          other.state = "expired"
          await ledger.save(other)
          await releaseQuote(scope, other.id)
          continue
        } else if (session.status === "expired") {
          other.state = "expired"
          await ledger.save(other)
          await releaseQuote(scope, other.id)
        }
      } catch (e: any) {
        if (e?.status === 409) throw e
      }
    }

    if (!attempt) {
      const recent = active.filter((a) => Date.now() - new Date(a.created_at).getTime() < 3600000)
      if (recent.length >= 30) fail("Too many checkout attempts. Please try again later.", 429)
      const quote = await buildQuote(scope, ledger, customerId, input, id)
      if (isBankTransfer && quote.lines.some((l) => l.recurring)) {
        fail("28-day recurring subscriptions require an active card payment gateway. Switch items to one-time purchase to pay via UK Faster Payments (Bank Transfer).", 400)
      }
      attempt = await ledger.create({
        id,
        kind: "attempt",
        profile,
        owner_id: customerId,
        state: "creating",
        data: {
          request_hash: hash,
          quote,
          revision: input.revision,
          payment_method: paymentMethod,
          ...(isBankTransfer ? { bank_instructions: liveBankInstructions } : {}),
          integration_identifier: `peptech_${Array.from(randomBytes(8), (b) => String.fromCharCode(97 + (b % 26))).join("")}`,
          consent: { ruo: true, recurring: input.recurring_accepted, version: "checkout-v1", accepted_at: new Date().toISOString() },
          expires_at: Math.floor(Date.now() / 1000) + (isBankTransfer ? 7 * 86400 : 900),
        },
      })
    }

    owned(attempt, customerId, profile)
    if (["paid", "confirmed", "held", "awaiting_transfer"].includes(attempt.state)) {
      if (attempt.state === "awaiting_transfer") {
        const quote = attempt.data.quote as Quote
        await reserveQuote(scope, quote, id)
      }
      return publicAttempt(attempt, liveBankInstructions)
    }
    if (["expired", "failed"].includes(attempt.state)) fail("Checkout has expired. Refresh your basket.", 409)
    if (attempt.state === "review") fail("Checkout needs operator reconciliation before another payment", 409)

    const quote = attempt.data.quote as Quote
    await reserveQuote(scope, quote, id)

    const gateway = getPaymentGateway(paymentMethod)
    const origin = resolveStorefrontOrigin(req)

    let customerObj: any = null
    try {
      const customerModule = scope.resolve(Modules.CUSTOMER)
      customerObj = await customerModule.retrieveCustomer(customerId)
      if (input.ruo_accepted && customerObj && !customerObj.metadata?.compliance_ack) {
        await customerModule.updateCustomers(customerObj.id, {
          metadata: {
            ...(customerObj.metadata || {}),
            compliance_ack: true,
            compliance_ack_at: new Date().toISOString(),
          },
        }).catch((err: any) => console.warn("[PEPTECH] Could not persist compliance_ack:", err?.message))
      }
    } catch {
      customerObj = { id: customerId, email: quote.email }
    }

    if (isBankTransfer) {
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
      attempt.data.transfer_reference = result.transferReference
      attempt.data.order_number = result.transferReference
      attempt.data.display_id = result.transferReference
      attempt.data.bank_instructions = liveBankInstructions
      attempt.data.expires_at = result.expiresAt
      attempt.state = result.state
      await ledger.save(attempt)
      await ledger.audit(attempt.id, customerId, "bank-transfer-created", {
        transfer_reference: result.transferReference,
        total_minor: quote.total_minor,
      }).catch(() => {})
      return publicAttempt(attempt, liveBankInstructions)
    }

    if (!context) {
      fail("Selected payment gateway is not ready for session settlement.", 503)
    }

    let session: any = attempt.data.session_id ? await context.stripe.checkout.sessions.retrieve(attempt.data.session_id) : null

    if (!session) {
      if (Date.now() - new Date(attempt.created_at).getTime() > 23 * 3600000) fail("Checkout needs reconciliation before retry", 409)
      if (attempt.data.expires_at <= Math.floor(Date.now() / 1000) + 60) fail("Checkout has expired. Refresh your basket.", 409)

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
      if (session.livemode !== (context.mode === "live")) fail("Card gateway environment mismatch", 503)
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

export function publicAttempt(attempt: LedgerRecord, liveBankInstructions?: any) {
  const q = attempt.data.quote as Quote
  const bankInstructions = liveBankInstructions !== undefined
    ? liveBankInstructions
    : (attempt.data.bank_instructions || null)
  const rawReceiptUrl = attempt.data.receipt_url || attempt.data.stripe_receipt_url || null
  const receiptUrl = rawReceiptUrl && !/stripe/i.test(String(rawReceiptUrl)) ? rawReceiptUrl : null
  return {
    attemptId: attempt.id,
    state: attempt.state,
    orderId: attempt.data.order_id || null,
    orderNumber: attempt.data.order_number || attempt.data.display_id || attempt.data.transfer_reference || null,
    transferReference: attempt.data.transfer_reference || null,
    bankInstructions,
    receiptUrl,
    revision: attempt.data.revision,
    ...(q.stripe_tax_status ? { taxStatus: q.stripe_tax_status } : {}),
    total: q.total_minor / 100,
    currency: q.currency,
    renewalTotal: q.renewal_minor / 100,
    items: q.lines.map((l) => ({
      name: l.name,
      sku: l.sku,
      quantity: l.quantity,
      recurring: l.recurring,
      unitPrice: l.unit_minor / 100,
    })),
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
