import type {MedusaContainer} from "@medusajs/framework/types"
import {getStripeConfig} from "../lib/stripe-config"
import {commerceTick} from "../lib/commerce/worker"
export default async function commerceJob(container:MedusaContainer) {
  if(!getStripeConfig())return
  await commerceTick(container)
}
export const config={name:"peptech-commerce-recovery",schedule:"* * * * *"}
