import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { actor, commerce, endpoint } from "../../../../lib/commerce/http"
import { stripeContext, objectId } from "../../../../lib/commerce/stripe"
import { recordId } from "../../../../modules/peptech-commerce/service"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  res.setHeader("Cache-Control", "no-store")
  return endpoint(res, async () => {
    const customerId = (req.query?.customer_id as string) || req.auth_context?.actor_id || (req.body as any)?.customer_id
    if (!customerId) return { payment_methods: [] }

    const context = stripeContext()
    const ledger = commerce(req)
    let stripeCustomerId: string | null = null

    // Look up Medusa customer strictly by customerId
    let medusaCustomer: any = null
    try {
      const customerModule = req.scope.resolve(Modules.CUSTOMER)
      if (customerId.startsWith("cus_")) {
        medusaCustomer = await customerModule.retrieveCustomer(customerId).catch(() => null)
      }
    } catch {}

    // 1. Check if we have customer mapping in commerce ledger
    const mapping = await ledger.get(recordId("customer", context.profile, customerId))
    if (mapping?.data?.stripe_id) {
      stripeCustomerId = mapping.data.stripe_id
    }

    // 2. Look in customer's recent checkout attempts
    if (!stripeCustomerId) {
      const attempts = await ledger.list("attempt", {
        owner: customerId,
        profile: context.profile,
        limit: 10,
      })
      for (const att of attempts) {
        if (att.data?.stripe_customer_id) {
          stripeCustomerId = att.data.stripe_customer_id
          break
        }
        if (att.data?.session_id) {
          try {
            const sess = await context.stripe.checkout.sessions.retrieve(att.data.session_id)
            if (sess.customer) {
              stripeCustomerId = objectId(sess.customer)
              break
            }
          } catch {}
        }
      }
    }

    // 3. If not found, look up in Stripe by customer email
    if (!stripeCustomerId && medusaCustomer?.email) {
      try {
        const list = await context.stripe.customers.list({
          email: medusaCustomer.email.trim().toLowerCase(),
          limit: 1,
        })
        if (list.data.length > 0) {
          stripeCustomerId = list.data[0].id
        }
      } catch {}
    }

    if (stripeCustomerId) {
      const custKey = recordId("customer", context.profile, customerId)
      await ledger.create({
        id: custKey,
        kind: "customer",
        profile: context.profile,
        owner_id: customerId,
        state: "active",
        data: { stripe_id: stripeCustomerId },
      }).catch(async () => {
        await ledger.patch(custKey, { stripe_id: stripeCustomerId }, "active").catch(() => {})
      })
    }

    if (!stripeCustomerId) {
      return { payment_methods: [] }
    }

    // 4. Retrieve payment methods from Stripe
    let defaultPmId: string | null = null
    try {
      const stripeCustomer = await context.stripe.customers.retrieve(stripeCustomerId)
      if (typeof stripeCustomer === "object" && !stripeCustomer.deleted) {
        defaultPmId = objectId(stripeCustomer.invoice_settings?.default_payment_method)
      }
    } catch {}

    const pms = await context.stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: "card",
    })

    const formatted: any[] = []
    const seenFingerprints = new Set<string>()

    for (const pm of pms.data) {
      if (pm.card) {
        const cardFingerprint = `${pm.card.brand || "card"}_${pm.card.last4}_${pm.card.exp_month}_${pm.card.exp_year}`.toLowerCase()
        if (!seenFingerprints.has(cardFingerprint)) {
          seenFingerprints.add(cardFingerprint)
          formatted.push({
            id: pm.id,
            type: "card",
            brand: (pm.card.brand || "card").toLowerCase(),
            last4: pm.card.last4 || "••••",
            exp_month: pm.card.exp_month,
            exp_year: pm.card.exp_year,
            expiry: `${String(pm.card.exp_month).padStart(2, "0")}/${String(pm.card.exp_year).slice(-2)}`,
            funding: pm.card.funding || "credit",
            is_default: pm.id === defaultPmId || formatted.length === 0,
            created_at: pm.created ? new Date(pm.created * 1000).toISOString() : new Date().toISOString(),
          })
        }
      }
    }

    // 5. If no attached payment methods found yet, check recent PaymentIntents
    if (formatted.length === 0) {
      try {
        const pis = await context.stripe.paymentIntents.list({
          customer: stripeCustomerId,
          limit: 5,
        })
        for (const pi of pis.data) {
          if (pi.payment_method) {
            const pmId = typeof pi.payment_method === "string" ? pi.payment_method : pi.payment_method.id
            const pm = typeof pi.payment_method === "object" ? pi.payment_method : await context.stripe.paymentMethods.retrieve(pmId)
            if (pm.card) {
              const cardFingerprint = `${pm.card.brand || "card"}_${pm.card.last4}_${pm.card.exp_month}_${pm.card.exp_year}`.toLowerCase()
              if (!seenFingerprints.has(cardFingerprint)) {
                seenFingerprints.add(cardFingerprint)
                formatted.push({
                  id: pm.id,
                  type: "card",
                  brand: (pm.card.brand || "card").toLowerCase(),
                  last4: pm.card.last4 || "••••",
                  exp_month: pm.card.exp_month,
                  exp_year: pm.card.exp_year,
                  expiry: `${String(pm.card.exp_month).padStart(2, "0")}/${String(pm.card.exp_year).slice(-2)}`,
                  funding: pm.card.funding || "credit",
                  is_default: formatted.length === 0,
                  created_at: pm.created ? new Date(pm.created * 1000).toISOString() : new Date().toISOString(),
                })
              }
            }
          }
        }
      } catch {}
    }

    return { payment_methods: formatted }
  })
}

export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  return endpoint(res, async () => {
    const customerId = actor(req)
    const context = stripeContext()
    const ledger = commerce(req)
    const { payment_method_id } = (req.body as any) || (req.query as any) || {}

    if (!payment_method_id) {
      return res.status(400).json({ message: "payment_method_id is required" })
    }

    const pm = await context.stripe.paymentMethods.retrieve(payment_method_id)
    if (!pm) {
      return res.status(404).json({ message: "Payment method not found" })
    }

    // Verify ownership
    const mapping = await ledger.get(recordId("customer", context.profile, customerId))
    if (!mapping?.data?.stripe_id || objectId(pm.customer) !== mapping.data.stripe_id) {
      return res.status(403).json({ message: "Unauthorized payment method access" })
    }

    await context.stripe.paymentMethods.detach(payment_method_id)
    return { success: true }
  })
}
