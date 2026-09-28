import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { actor, commerce, endpoint } from "../../../../lib/commerce/http"
import { stripeContext } from "../../../../lib/commerce/stripe"
import { recordId } from "../../../../modules/peptech-commerce/service"
import { fail } from "../../../../lib/commerce/policy"

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  return endpoint(res, async () => {
    const context = stripeContext()
    const customer = actor(req)
    const ledger = commerce(req)

    let mapping = await ledger.get(recordId("customer", context.profile, customer))
    let stripeId = mapping?.data?.stripe_id

    if (!stripeId) {
      try {
        const customerModule = req.scope.resolve(Modules.CUSTOMER)
        const medusaCustomer = await customerModule.retrieveCustomer(customer)
        if (medusaCustomer?.email) {
          const list = await context.stripe.customers.list({ email: medusaCustomer.email, limit: 1 })
          if (list.data.length > 0) {
            stripeId = list.data[0].id
            const custKey = recordId("customer", context.profile, customer)
            await ledger.create({
              id: custKey,
              kind: "customer",
              profile: context.profile,
              owner_id: customer,
              state: "active",
              data: { stripe_id: stripeId },
            }).catch(async () => {
              await ledger.patch(custKey, { stripe_id: stripeId }, "active").catch(() => {})
            })
          }
        }
      } catch {}
    }

    if (!stripeId) fail("No billing account exists yet. Complete a checkout first.", 404)

    const storefrontUrl = (process.env.STRIPE_STOREFRONT_URL || "http://localhost:3000").replace(/\/$/, "")

    if (process.env.STRIPE_PORTAL_CONFIGURATION_ID) {
      try {
        const configuration = await context.stripe.billingPortal.configurations.retrieve(process.env.STRIPE_PORTAL_CONFIGURATION_ID)
        if (!configuration.active || configuration.features.subscription_update?.enabled || configuration.features.subscription_cancel?.enabled || configuration.features.customer_update?.enabled) {
          fail("Use a payment-method and invoice-only portal configuration; manage subscriptions in your account", 503)
        }
        const session = await context.stripe.billingPortal.sessions.create({
          customer: stripeId,
          configuration: process.env.STRIPE_PORTAL_CONFIGURATION_ID,
          return_url: `${storefrontUrl}/account?tab=payment`,
        })
        return { url: session.url }
      } catch (err: any) {
        if (err?.status === 503) throw err
      }
    }

    // Default portal session if specific config ID not set
    const session = await context.stripe.billingPortal.sessions.create({
      customer: stripeId,
      return_url: `${storefrontUrl}/account?tab=payment`,
    })
    return { url: session.url }
  })
}
