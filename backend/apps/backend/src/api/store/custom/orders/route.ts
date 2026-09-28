import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { actor, endpoint } from "../../../../lib/commerce/http"
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  return endpoint(res, async () => {
    const customerId = actor(req)
    try {
      const { data: orders = [], metadata = {} } = await req.scope.resolve("query").graph({
        entity: "order",
        fields: [
          "id",
          "custom_display_id",
          "display_id",
          "status",
          "fulfillment_status",
          "payment_status",
          "created_at",
          "updated_at",
          "currency_code",
          "total",
          "subtotal",
          "tax_total",
          "discount_total",
          "shipping_total",
          "summary.*",
          "items.*",
          "shipping_address.*",
          "billing_address.*",
          "metadata",
        ],
        filters: { customer_id: customerId },
        pagination: { order: { created_at: "DESC" }, take: 50 },
      })
      return { orders, count: (metadata as any)?.count ?? orders.length }
    } catch {
      const [orders, count] = await req.scope.resolve(Modules.ORDER).listAndCountOrders(
        { customer_id: customerId },
        { relations: ["items", "shipping_address", "billing_address", "summary"], order: { created_at: "DESC" }, take: 50 }
      )
      return { orders, count }
    }
  })
}
export async function POST(_req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  return res.status(410).json({ message: "Use the server-priced checkout endpoint to place an order." })
}
