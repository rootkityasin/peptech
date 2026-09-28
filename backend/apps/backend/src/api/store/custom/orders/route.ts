import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { actor, endpoint } from "../../../../lib/commerce/http"
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  return endpoint(res, async () => {
    const [orders, count] = await req.scope.resolve(Modules.ORDER).listAndCountOrders(
      { customer_id: actor(req) }, { relations: ["items", "shipping_address", "billing_address", "summary"],
        order: { created_at: "DESC" }, take: 50 })
    return { orders, count }
  })
}
export async function POST(_req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  return res.status(410).json({ message: "Use the server-priced checkout endpoint to place an order." })
}
