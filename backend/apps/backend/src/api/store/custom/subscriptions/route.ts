import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { actor, commerce, endpoint } from "../../../../lib/commerce/http"
import { presentSubscription, subscriptionCommand } from "../../../../lib/commerce/subscriptions"
import { stripeContext, objectId } from "../../../../lib/commerce/stripe"
import { recordId } from "../../../../modules/peptech-commerce/service"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  res.setHeader("Cache-Control", "no-store")
  return endpoint(res, async () => {
    const customerId = (req.query?.customer_id as string) || req.auth_context?.actor_id || (req.body as any)?.customer_id
    if (!customerId) return { subscriptions: [] }

    const ledger = commerce(req)
    const context = stripeContext()

    // Look up Medusa customer strictly by customerId
    let medusaCustomer: any = null
    try {
      const customerModule = req.scope.resolve(Modules.CUSTOMER)
      if (customerId.startsWith("cus_")) {
        medusaCustomer = await customerModule.retrieveCustomer(customerId, { relations: ["addresses"] }).catch(() => null)
      }
    } catch {}

    const rows = await ledger.list("subscription", { owner: customerId })
    const presented: any[] = rows.map(presentSubscription)
    const existingStripeIds = new Set(presented.map((s: any) => s.stripe_id).filter(Boolean))

    // Look up live subscriptions from Stripe for this customerId
    let stripeCustomerId: string | null = null
    const mapping = await ledger.get(recordId("customer", context.profile, customerId))
    if (mapping?.data?.stripe_id) {
      stripeCustomerId = mapping.data.stripe_id
    }

    if (!stripeCustomerId) {
      const attempts = await ledger.list("attempt", { owner: customerId, profile: context.profile, limit: 10 })
      for (const att of attempts) {
        if (att.data?.stripe_customer_id) {
          stripeCustomerId = att.data.stripe_customer_id
          break
        }
      }
    }

    if (!stripeCustomerId && medusaCustomer?.email) {
      try {
        const list = await context.stripe.customers.list({ email: medusaCustomer.email.trim().toLowerCase(), limit: 1 })
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

      try {
        let custName = "Research Investigator"
        let custFacility = "Primary Laboratory Destination"
        let custAddress: any = {}

        try {
          const customerModule = req.scope.resolve(Modules.CUSTOMER)
          const medusaCustomer = await customerModule.retrieveCustomer(customerId, { relations: ["addresses"] }).catch(() => null)
          if (medusaCustomer) {
            if (medusaCustomer.first_name || medusaCustomer.last_name) {
              custName = `${medusaCustomer.first_name || ""} ${medusaCustomer.last_name || ""}`.trim()
            }
            if (medusaCustomer.company_name) {
              custFacility = medusaCustomer.company_name
            }
            if (medusaCustomer.addresses?.[0]) {
              custAddress = medusaCustomer.addresses[0]
            }
          }
        } catch {}

        if (!custAddress.address_1) {
          try {
            const orderModule = req.scope.resolve(Modules.ORDER)
            const result: any = await orderModule.listOrders(
              { customer_id: customerId },
              { relations: ["shipping_address"], take: 1, order: { created_at: "DESC" } }
            ).catch(() => [])
            const latestOrder: any = Array.isArray(result) ? result[0] : null
            if (latestOrder?.shipping_address) {
              custAddress = latestOrder.shipping_address
              if (latestOrder.shipping_address.first_name || latestOrder.shipping_address.last_name) {
                custName = `${latestOrder.shipping_address.first_name || ""} ${latestOrder.shipping_address.last_name || ""}`.trim()
              }
              if (latestOrder.shipping_address.company) {
                custFacility = latestOrder.shipping_address.company
              }
            }
          } catch {}
        }

        const stripeSubs = await context.stripe.subscriptions.list({
          customer: stripeCustomerId,
          status: "all",
          expand: ["data.default_payment_method", "data.items.data.price"],
          limit: 10,
        })

        const productMap = new Map<string, string>()
        const productIdsToFetch = new Set<string>()
        for (const sub of stripeSubs.data) {
          for (const it of sub.items?.data || []) {
            const pId = typeof it.price?.product === "string" ? it.price.product : (it.price?.product as any)?.id
            if (pId) productIdsToFetch.add(pId)
          }
        }

        await Promise.all(
          Array.from(productIdsToFetch).map(async (pId) => {
            try {
              const p = await context.stripe.products.retrieve(pId)
              if (p?.name) productMap.set(pId, p.name)
            } catch {}
          })
        )

        for (const sub of stripeSubs.data) {
          if (existingStripeIds.has(sub.id)) continue
          if (["incomplete_expired"].includes(sub.status)) continue

          const firstItem = sub.items?.data?.[0]
          const firstProdId = typeof firstItem?.price?.product === "string" ? firstItem.price.product : (firstItem?.price?.product as any)?.id
          const prodObj: any = firstItem?.price?.product
          const prodName = productMap.get(firstProdId) || sub.metadata?.product_name || sub.metadata?.title || (typeof prodObj === "object" && prodObj?.name ? prodObj.name : "PEPTECH® Precision Protocol Refill")
          const unitPrice = (firstItem?.price?.unit_amount || 2520) / 100
          const cadenceDays = sub.metadata?.cadence_days ? parseInt(sub.metadata.cadence_days) : 28
          const cadenceLabel = cadenceDays === 14 ? "Accelerated Protocol" : cadenceDays === 56 ? "8-Week Maintenance" : "Standard Cycle"
          const nextBilling = (sub as any).current_period_end || (firstItem as any)?.current_period_end
          const billingDateObj = nextBilling ? new Date(nextBilling * 1000) : null
          const nextBillingDate = billingDateObj ? billingDateObj.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : null
          const autoBillDate = billingDateObj ? billingDateObj.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : null

          let dispatchDateObj: Date | null = null
          let nextDispatchDate: string | null = null
          if (billingDateObj) {
            dispatchDateObj = new Date(billingDateObj)
            dispatchDateObj.setDate(dispatchDateObj.getDate() + 1)
            nextDispatchDate = dispatchDateObj.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
          }

          let estimatedDeliveryDate: string | null = null
          if (dispatchDateObj) {
            const deliveryDateObj = new Date(dispatchDateObj)
            deliveryDateObj.setDate(deliveryDateObj.getDate() + 1)
            estimatedDeliveryDate = deliveryDateObj.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
          }

          const pmCard = (sub.default_payment_method as any)?.card
          const cardEnding = pmCard?.last4 || "4242"
          const shortId = `SUB-${sub.id.slice(-4).toUpperCase()}`

          presented.push({
            id: sub.id,
            stripe_id: sub.id,
            sub_display_id: shortId,
            status: sub.status === "active" ? "Active Subscription" : sub.status === "paused" ? "Paused" : sub.status === "canceled" ? "Canceled" : "Active Subscription",
            title: prodName,
            product_name: prodName,
            format: "cartridge",
            strength: firstItem?.price?.metadata?.strength || "10mg (1.5 mL)",
            protocol_info: `Weekly ${firstItem?.price?.metadata?.strength || "2.5mg"} Escalation Protocol · 4 Doses / Refill`,
            price: unitPrice,
            currency: sub.currency || "gbp",
            quantity: firstItem?.quantity || 1,
            cadence_days: cadenceDays,
            cadence_label: cadenceLabel,
            frequency: `Every ${cadenceDays} Days (${cadenceLabel})`,
            nextBillingDate,
            next_billing_at: nextBilling,
            autoBillDate,
            nextDispatchDate,
            estimatedDeliveryDate,
            receiving_window: "Tuesday – Thursday · 08:00 – 14:00 GMT (Lab Reception Handover)",
            cancel_at_period_end: sub.cancel_at_period_end,
            control: sub.status === "paused" ? "paused" : "active",
            pause_until: null,
            cardEnding,
            shipping_address: custAddress,
            recipient_name: custName,
            recipient_facility: custFacility,
            items: (sub.items?.data || []).map((it: any) => {
              const itProdId = typeof it.price?.product === "string" ? it.price.product : (it.price?.product as any)?.id
              const itemTitle = productMap.get(itProdId) || (typeof it.price?.product === "object" ? it.price.product?.name : null) || it.price?.nickname || prodName
              return {
                title: itemTitle,
                quantity: it.quantity || 1,
                unit_price: (it.price?.unit_amount || 0) / 100,
                metadata: it.price?.metadata || {},
              }
            }),
            shipping_amount: 4.95,
            locked_discount_pct: 10,
          })
        }
      } catch (e) {
        console.warn("Could not query live Stripe subscriptions:", e)
      }
    }

    return { subscriptions: presented }
  })
}

export async function PUT(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  return endpoint(res, async () => ({ subscription: await subscriptionCommand(commerce(req), actor(req), req.body) }))
}

export async function POST(_req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  return res.status(410).json({ message: "Subscriptions require an authorised recurring checkout" })
}

