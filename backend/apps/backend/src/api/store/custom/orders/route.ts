import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { actor, endpoint } from "../../../../lib/commerce/http"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  res.setHeader("Cache-Control", "no-store")
  return endpoint(res, async () => {
    const customerId = actor(req)

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
    ]

    let orders: any[] = []

    let resolvedEmail: string | null = null
    try {
      const customerModule = req.scope.resolve(Modules.CUSTOMER)
      const cust = await customerModule.retrieveCustomer(customerId).catch(() => null)
      if (cust?.email) resolvedEmail = cust.email.trim().toLowerCase()
    } catch {}

    const filters: any = resolvedEmail
      ? { $or: [{ customer_id: customerId }, { email: resolvedEmail }] }
      : { customer_id: customerId }

    try {

      const { data = [] } = await req.scope.resolve("query").graph({
        entity: "order",
        fields: orderFields,
        filters,
        pagination: { order: { created_at: "DESC" }, take: 50 },
      })
      orders = data
    } catch {
      try {
        const orderModule = req.scope.resolve(Modules.ORDER)
        const [list] = await orderModule.listAndCountOrders(
          filters,
          { relations: ["items", "shipping_address", "billing_address", "shipping_methods", "summary"], order: { created_at: "DESC" }, take: 50 }
        )
        orders = list
      } catch {}
    }

    // Compute totals so orders accurately preserve free shipping (0) vs courier fees
    const computedOrders = orders.map((o: any) => {
      const lineItems = o.items || []
      const itemsTotalMinor = lineItems.reduce((acc: number, it: any) => acc + ((Number(it.unit_price) || 0) * (Number(it.quantity) || 1)), 0)
      const metaMinor = Number(o.metadata?.refunded_amount_minor) || 0
      const summaryPaid = Number(o.summary?.original_order_total) || Number(o.summary?.paid_total) || 0
      const summaryTotal = Number(o.summary?.total) || Number(o.total) || 0

      const defaultShippingMinor = itemsTotalMinor >= 15000 ? 0 : 495
      const actualShippingMinor =
        typeof o.summary?.shipping_total === "number"
          ? o.summary.shipping_total
          : typeof o.shipping_methods?.[0]?.amount === "number"
          ? (Number(o.shipping_methods[0].amount) >= 100
              ? Number(o.shipping_methods[0].amount)
              : Math.round(Number(o.shipping_methods[0].amount) * 100))
          : defaultShippingMinor

      const total =
        summaryPaid > 0
          ? summaryPaid
          : summaryTotal > 0
          ? summaryTotal
          : metaMinor > 0
          ? metaMinor
          : itemsTotalMinor > 0
          ? itemsTotalMinor + actualShippingMinor
          : 19995

      return {
        ...o,
        total,
        summary: {
          ...o.summary,
          total: o.summary?.total || total,
          original_order_total: o.summary?.original_order_total || total,
          paid_total: o.summary?.paid_total || total,
          subtotal: o.summary?.subtotal || itemsTotalMinor,
          shipping_total: actualShippingMinor,
        },
      }
    })

    return { orders: computedOrders, count: computedOrders.length }
  })
}

export async function POST(_req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  return res.status(410).json({ message: "Use the server-priced checkout endpoint to place an order." })
}

