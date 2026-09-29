import type { PaymentGatewayAdapter, GatewayCheckoutInput, GatewayCheckoutResult } from "./types"
import { stripeContext, operationKey } from "../stripe"
import { recordId, LedgerRecord } from "../../../modules/peptech-commerce/service"
import { fail } from "../policy"

export class StripeGatewayAdapter implements PaymentGatewayAdapter {
  id = "stripe"
  name = "Stripe Payments & Billing"

  isConfigured(): boolean {
    try {
      const context = stripeContext()
      return Boolean(context && context.apiKey)
    } catch {
      return false
    }
  }

  async createCheckoutSession(input: GatewayCheckoutInput): Promise<GatewayCheckoutResult> {
    const context = stripeContext()
    const { attemptId, customer, quote, origin, uiMode = "embedded" } = input

    if (!origin || (context.mode === "live" && !origin.startsWith("https://"))) {
      fail("Storefront return URL needs configuration", 503)
    }

    const customerKey = recordId("customer", context.profile, customer.id)
    const customerName = `${customer.firstName || quote.address.first_name || ""} ${customer.lastName || quote.address.last_name || ""}`.trim()
    const customerPhone = customer.phone || quote.address.phone || undefined

    const address = {
      line1: quote.address.address_1,
      line2: quote.address.address_2 || undefined,
      city: quote.address.city,
      postal_code: quote.address.postal_code,
      country: quote.address.country_code.toUpperCase(),
      state: quote.address.province || undefined,
    }

    let stripeCustomerId: string
    const existingCustomerList = await context.stripe.customers.list({
      email: quote.email,
      limit: 10,
    })

    if (existingCustomerList.data.length > 0) {
      // Pick the customer that has attached payment methods, or the first
      let chosen = existingCustomerList.data[0]
      for (const c of existingCustomerList.data) {
        const pms = await context.stripe.paymentMethods.list({ customer: c.id, type: "card", limit: 1 })
        if (pms.data.length > 0) {
          chosen = c
          break
        }
      }
      stripeCustomerId = chosen.id

      let defaultPm = chosen.invoice_settings?.default_payment_method
      try {
        const pms = await context.stripe.paymentMethods.list({ customer: chosen.id, type: "card", limit: 10 })
        if (!defaultPm && pms.data.length > 0) {
          defaultPm = pms.data[0].id
        }
        for (const pm of pms.data) {
          if (pm.allow_redisplay !== "always") {
            await context.stripe.paymentMethods.update(pm.id, {
              allow_redisplay: "always",
              billing_details: {
                email: quote.email,
                name: customerName || undefined,
                address: quote.address.address_1 ? address : undefined,
              },
            }).catch(() => {})
          }
        }
      } catch {}

      await context.stripe.customers.update(chosen.id, {
        name: customerName || undefined,
        phone: customerPhone,
        address: quote.address.address_1 ? address : undefined,
        shipping: quote.address.address_1
          ? { name: customerName || "Research Laboratory", address, phone: customerPhone }
          : undefined,
        metadata: { peptech_customer_id: customer.id, peptech_profile: context.profile },
        ...(defaultPm ? { invoice_settings: { default_payment_method: String(defaultPm) } } : {}),
      })
    } else {
      const newStripeCustomer = await context.stripe.customers.create(
        {
          email: quote.email,
          name: customerName || undefined,
          phone: customerPhone,
          address: quote.address.address_1 ? address : undefined,
          shipping: quote.address.address_1
            ? { name: customerName || "Research Laboratory", address, phone: customerPhone }
            : undefined,
          metadata: { peptech_customer_id: customer.id, peptech_profile: context.profile },
        },
        { idempotencyKey: customerKey }
      )
      stripeCustomerId = newStripeCustomer.id
    }

    const recurring = quote.renewal_minor > 0
    let taxRateId: string | undefined

    if (quote.vat_registered && quote.tax_policy !== "stripe_default") {
      const taxKey = recordId(
        "taxrate",
        context.profile,
        String(quote.tax_rate),
        String(quote.tax_inclusive),
        quote.address.country_code
      )
      const existingRates = await context.stripe.taxRates.list({ limit: 10, active: true })
      const matched = existingRates.data.find(
        (r: any) =>
          r.country === quote.address.country_code.toUpperCase() &&
          r.percentage === quote.tax_rate &&
          r.inclusive === quote.tax_inclusive
      )
      if (matched) {
        taxRateId = matched.id
      } else {
        const createdRate = await context.stripe.taxRates.create(
          {
            display_name: "VAT",
            percentage: quote.tax_rate,
            inclusive: quote.tax_inclusive,
            country: quote.address.country_code.toUpperCase(),
          },
          { idempotencyKey: taxKey }
        )
        taxRateId = createdRate.id
      }
    }

    const lineItems: any[] = quote.lines.map((l) => ({
      quantity: l.quantity,
      ...(taxRateId ? { tax_rates: [taxRateId] } : {}),
      price_data: {
        currency: quote.currency,
        unit_amount: l.unit_minor,
        tax_behavior: quote.tax_inclusive ? "inclusive" : "exclusive",
        product_data: {
          name: l.name,
          ...(l.tax_code ? { tax_code: l.tax_code } : {}),
          metadata: {
            variant_id: l.variant_id,
            catalog_version: l.catalog_version,
            recurring: String(l.recurring),
          },
        },
        ...(l.recurring ? { recurring: { interval: "day", interval_count: 28 } } : {}),
      },
    }))

    lineItems.push({
      quantity: 1,
      ...(taxRateId ? { tax_rates: [taxRateId] } : {}),
      price_data: {
        currency: quote.currency,
        unit_amount: quote.shipping_minor,
        tax_behavior: quote.tax_inclusive ? "inclusive" : "exclusive",
        product_data: {
          name: "Royal Mail Tracked delivery",
          tax_code: "txcd_92010001",
          metadata: { peptech_shipping: "true" },
        },
        ...(recurring ? { recurring: { interval: "day", interval_count: 28 } } : {}),
      },
    })

    const isEmbedded = uiMode === "embedded" || uiMode === "embedded_page"
    const returnUrl = `${origin.replace(/\/$/, "")}/checkout/success?attempt_id=${attemptId}&session_id={CHECKOUT_SESSION_ID}`

    const sessionParams: any = {
      ui_mode: isEmbedded ? "embedded" : "hosted",
      billing_address_collection: "auto",
      customer_update: { address: "auto", name: "auto" },
      mode: recurring ? "subscription" : "payment",
      customer: stripeCustomerId,
      saved_payment_method_options: {
        payment_method_save: "enabled",
        allow_redisplay_filters: ["always", "limited", "unspecified"],
      },
      line_items: lineItems,
      automatic_tax: { enabled: quote.stripe_tax_enabled === true },
      client_reference_id: attemptId,
      metadata: { peptech_attempt: attemptId, peptech_profile: context.profile },
      ...(recurring
        ? { subscription_data: { metadata: { peptech_attempt: attemptId, peptech_profile: context.profile } } }
        : { payment_intent_data: { setup_future_usage: "off_session", metadata: { peptech_attempt: attemptId, peptech_profile: context.profile } } }),
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    }

    if (isEmbedded) {
      sessionParams.return_url = returnUrl
    } else {
      sessionParams.cancel_url = `${origin.replace(/\/$/, "")}/checkout?cancelled=1`
      sessionParams.success_url = `${origin.replace(/\/$/, "")}/checkout/success?attempt_id=${attemptId}`
    }

    const session = await context.stripe.checkout.sessions.create(sessionParams, {
      idempotencyKey: operationKey("checkout-v3", attemptId, uiMode),
    })

    if (session.livemode !== (context.mode === "live")) {
      fail("Stripe environment mismatch", 503)
    }

    const state =
      session.status === "expired"
        ? "expired"
        : session.payment_status === "paid" || session.status === "complete"
        ? "processing"
        : "open"

    return {
      sessionId: session.id,
      clientSecret: session.client_secret || undefined,
      checkoutUrl: session.url || undefined,
      publishableKey: context.publishableKey,
      stripeCustomerId,
      expiresAt: session.expires_at || Math.floor(Date.now() / 1000) + 3600,
      state,
    }
  }

  async reconcileSession(sessionId: string): Promise<any> {
    const context = stripeContext()
    return context.stripe.checkout.sessions.retrieve(sessionId)
  }

  async refundPayment(receipt: LedgerRecord, amountMinor: number, note: string): Promise<any> {
    const context = stripeContext()
    if (!receipt.data.payment_intent_id) {
      throw new Error("No verified payment intent linked to receipt")
    }
    return context.stripe.refunds.create({
      payment_intent: receipt.data.payment_intent_id,
      amount: amountMinor,
      metadata: { peptech_receipt_id: receipt.id, note },
    })
  }
}
