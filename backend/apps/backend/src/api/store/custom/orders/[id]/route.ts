import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { endpoint } from "../../../../../lib/commerce/http"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  return endpoint(res, async () => {
    const rawId = req.params.id
    if (!rawId) {
      return res.status(400).json({ message: "Order ID is required" })
    }

    const orderQuery = req.scope.resolve("query")
    const orderFields = [
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
      "customer.*",
    ]

    try {
      // 1. Try finding by order.id
      let { data: [order] = [] } = await orderQuery.graph({
        entity: "order",
        fields: orderFields,
        filters: { id: rawId },
      })

      // 2. If not found, try finding by custom_display_id (e.g. PEP-138289)
      if (!order) {
        const cleanId = rawId.toUpperCase()
        const { data: [byCustom] = [] } = await orderQuery.graph({
          entity: "order",
          fields: orderFields,
          filters: { custom_display_id: cleanId },
        })
        order = byCustom
      }

      // 3. If still not found and is a numeric display_id
      if (!order && !isNaN(Number(rawId))) {
        const { data: [byDisplayId] = [] } = await orderQuery.graph({
          entity: "order",
          fields: orderFields,
          filters: { display_id: Number(rawId) as any },
        })
        order = byDisplayId
      }

      if (order) {
        return { order }
      }
    } catch {
      // Fallback using Order Module
      try {
        const orderModule = req.scope.resolve(Modules.ORDER)
        const order = await orderModule.retrieveOrder(rawId, {
          relations: ["items", "shipping_address", "billing_address", "summary"],
        })
        if (order) {
          return { order }
        }
      } catch {}
    }

    return res.status(404).json({ message: `Order ${rawId} not found` })
  })
}
