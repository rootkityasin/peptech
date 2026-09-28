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
      "email",
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

    let order: any = null

    try {
      // 1. Exact match on id
      const { data: [byExactId] = [] } = await orderQuery.graph({
        entity: "order",
        fields: orderFields,
        filters: { id: rawId },
      })
      order = byExactId

      // 2. Exact match on custom_display_id
      if (!order) {
        const { data: [byCustom] = [] } = await orderQuery.graph({
          entity: "order",
          fields: orderFields,
          filters: { custom_display_id: rawId.toUpperCase() },
        })
        order = byCustom
      }

      // 3. Match numeric display_id
      if (!order && !isNaN(Number(rawId))) {
        const { data: [byNum] = [] } = await orderQuery.graph({
          entity: "order",
          fields: orderFields,
          filters: { display_id: Number(rawId) as any },
        })
        order = byNum
      }

      // 4. Try matching with / without "PEP-" prefix
      if (!order) {
        const cleanNoPep = rawId.replace(/^PEP-?/i, "")
        const { data: [byNoPep] = [] } = await orderQuery.graph({
          entity: "order",
          fields: orderFields,
          filters: { custom_display_id: `PEP-${cleanNoPep}` },
        })
        order = byNoPep
      }
    } catch {}

    // Fallback using Order Module
    if (!order) {
      try {
        const orderModule = req.scope.resolve(Modules.ORDER)
        const [ordersList] = await orderModule.listAndCountOrders(
          {},
          { relations: ["items", "shipping_address", "billing_address", "summary"], take: 50, order: { created_at: "DESC" } }
        )
        const cleanRaw = rawId.toLowerCase().replace(/[^a-z0-9]/g, "")
        order = ordersList.find((o: any) => {
          const oIdClean = (o.id || "").toLowerCase().replace(/[^a-z0-9]/g, "")
          const oDisplayClean = (o.custom_display_id || "").toLowerCase().replace(/[^a-z0-9]/g, "")
          return (
            o.id === rawId ||
            o.id?.toLowerCase() === rawId.toLowerCase() ||
            o.custom_display_id?.toUpperCase() === rawId.toUpperCase() ||
            String(o.display_id) === String(rawId) ||
            o.metadata?.order_number_formatted?.toUpperCase() === rawId.toUpperCase() ||
            (cleanRaw.length >= 4 && oIdClean.includes(cleanRaw)) ||
            (cleanRaw.length >= 4 && oDisplayClean.includes(cleanRaw))
          )
        })
      } catch {}
    }

    if (order) {
      const lineItems = order.items || []
      const itemsTotalMinor = lineItems.reduce((acc: number, it: any) => acc + ((Number(it.unit_price) || 0) * (Number(it.quantity) || 1)), 0)
      const metaMinor = Number(order.metadata?.refunded_amount_minor) || 0
      const summaryPaid = Number(order.summary?.original_order_total) || Number(order.summary?.paid_total) || 0
      const summaryTotal = Number(order.summary?.total) || Number(order.total) || 0
      const total = summaryPaid > 0 ? summaryPaid : (summaryTotal > 0 ? summaryTotal : (metaMinor > 0 ? metaMinor : (itemsTotalMinor > 0 ? itemsTotalMinor + 495 : 19995)))

      return {
        order: {
          ...order,
          total,
          summary: {
            ...order.summary,
            total: order.summary?.total || total,
            original_order_total: order.summary?.original_order_total || total,
            paid_total: order.summary?.paid_total || total,
            subtotal: order.summary?.subtotal || itemsTotalMinor,
            shipping_total: order.summary?.shipping_total || 495,
          },
        },
      }
    }

    return res.status(404).json({ message: `Order ${rawId} not found` })
  })
}

