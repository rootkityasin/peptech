import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { actor, endpoint } from "../../../../../lib/commerce/http"
import { fail } from "../../../../../lib/commerce/policy"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  return endpoint(res, async () => {
    const customerId = actor(req)
    const rawId = req.params.id
    if (!rawId) {
      fail("Order ID is required", 400)
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
      "shipping_methods.*",
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
          { customer_id: customerId },
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
      let customerEmail: string | null = null
      try {
        const customerModule = req.scope.resolve(Modules.CUSTOMER)
        const cust = await customerModule.retrieveCustomer(customerId).catch(() => null)
        if (cust?.email) customerEmail = cust.email.trim().toLowerCase()
      } catch {}

      const orderEmail = (order.email || "").trim().toLowerCase()
      const isOwner = order.customer_id === customerId || (customerEmail && orderEmail === customerEmail)
      if (!isOwner) {
        fail("Order not found.", 404)
      }

      const lineItems = order.items || []
      const itemsTotal = lineItems.reduce((acc: number, it: any) => {
        const raw = Number(it.unit_price) || 0
        const pounds = raw > 1000 && Number.isInteger(raw) ? raw / 100 : raw
        return acc + pounds * (Number(it.quantity) || 1)
      }, 0)

      const rawShipping =
        typeof order.summary?.shipping_total === "number"
          ? order.summary.shipping_total
          : typeof order.shipping_methods?.[0]?.amount === "number"
          ? order.shipping_methods[0].amount
          : undefined

      const defaultShipping = itemsTotal >= 150 ? 0 : 4.95
      const actualShipping =
        typeof rawShipping === "number"
          ? (rawShipping > 50 && Number.isInteger(rawShipping) ? rawShipping / 100 : rawShipping)
          : defaultShipping

      const rawPaid = Number(order.summary?.original_order_total) || Number(order.summary?.paid_total) || 0
      const rawSummaryTotal = Number(order.summary?.total) || Number(order.total) || 0
      const metaRefunded = Number(order.metadata?.refunded_amount_minor) ? Number(order.metadata.refunded_amount_minor) / 100 : 0

      const paidPounds = rawPaid > 1000 && Number.isInteger(rawPaid) ? rawPaid / 100 : rawPaid
      const summaryTotalPounds = rawSummaryTotal > 1000 && Number.isInteger(rawSummaryTotal) ? rawSummaryTotal / 100 : rawSummaryTotal

      const total =
        paidPounds > 0
          ? paidPounds
          : summaryTotalPounds > 0
          ? summaryTotalPounds
          : metaRefunded > 0
          ? metaRefunded
          : itemsTotal > 0
          ? itemsTotal + actualShipping
          : 199.95

      return {
        order: {
          ...order,
          total,
          summary: {
            ...order.summary,
            total: summaryTotalPounds > 0 ? summaryTotalPounds : total,
            original_order_total: paidPounds > 0 ? paidPounds : total,
            paid_total: paidPounds > 0 ? paidPounds : total,
            subtotal: itemsTotal > 0 ? itemsTotal : (order.summary?.subtotal || itemsTotal),
            shipping_total: actualShipping,
          },
        },
      }
    }

    fail("Order not found.", 404)
  })
}

