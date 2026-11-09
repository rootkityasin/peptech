import type {MedusaContainer} from "@medusajs/framework/types"
import {commerceTick} from "../lib/commerce/worker"
export default async function commerceJob(container:MedusaContainer) {
  try {
    await commerceTick(container)
  } catch {
    // Gracefully skip recovery tick errors on cold or offline environments
  }
}
export const config={name:"peptech-commerce-recovery",schedule:"0 3 * * *"}
