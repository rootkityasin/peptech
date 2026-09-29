import type {MedusaContainer} from "@medusajs/framework/types"
import {getStripeConfig} from "../lib/stripe-config"
import {commerceTick} from "../lib/commerce/worker"
export default async function commerceJob(container:MedusaContainer) {
  try {
    if(!getStripeConfig()) return
    await commerceTick(container)
  } catch {
    // If Stripe is not configured or throws, gracefully skip
  }
}
export const config={name:"peptech-commerce-recovery",schedule:"* * * * *"}
