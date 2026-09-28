import type {AuthenticatedMedusaRequest,MedusaResponse} from "@medusajs/framework/http"
import {actor,commerce,endpoint} from "../../../../lib/commerce/http"
import {stripeContext} from "../../../../lib/commerce/stripe"
import {recordId} from "../../../../modules/peptech-commerce/service"
import {fail} from "../../../../lib/commerce/policy"
export async function POST(req:AuthenticatedMedusaRequest,res:MedusaResponse) {
  return endpoint(res,async()=>{
    const context=stripeContext();const customer=actor(req)
    const mapping=await commerce(req).get(recordId("customer",context.profile,customer))
    if(!mapping) fail("No billing account exists yet",404)
    if(!process.env.STRIPE_PORTAL_CONFIGURATION_ID) fail("Billing portal requires configuration",503)
    const configuration=await context.stripe.billingPortal.configurations.retrieve(process.env.STRIPE_PORTAL_CONFIGURATION_ID)
    if(!configuration.active||configuration.features.subscription_update?.enabled||configuration.features.subscription_cancel?.enabled||configuration.features.customer_update?.enabled)fail("Use a payment-method and invoice-only portal configuration; manage subscriptions in your account",503)
    const session=await context.stripe.billingPortal.sessions.create({customer:mapping.data.stripe_id,
      configuration:process.env.STRIPE_PORTAL_CONFIGURATION_ID,
      return_url:`${process.env.STRIPE_STOREFRONT_URL}/account?tab=subscriptions`})
    return {url:session.url}
  })
}
