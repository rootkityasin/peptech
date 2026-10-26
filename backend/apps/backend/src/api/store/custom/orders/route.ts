import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { actor, endpoint } from "../../../../lib/commerce/http"

function resolveItemThumbnail(it: any): string {
  let thumb = it?.thumbnail || it?.variant?.product?.thumbnail || it?.variant?.thumbnail
  if (thumb && typeof thumb === "string" && !thumb.includes("null") && !thumb.includes("placeholder")) {
    return thumb.replace(/^https?:\/\/localhost:\d+/, "")
  }
  return ""
}

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
      const lineItems = (o.items || []).map((it: any) => ({
        ...it,
        thumbnail: resolveItemThumbnail(it),
      }))
      const itemsTotal = lineItems.reduce((acc: number, it: any) => {
        const raw = Number(it.unit_price) || 0
        const pounds = raw > 1000 && Number.isInteger(raw) ? raw / 100 : raw
        return acc + pounds * (Number(it.quantity) || 1)
      }, 0)

      const rawShipping =
        typeof o.summary?.shipping_total === "number"
          ? o.summary.shipping_total
          : typeof o.shipping_methods?.[0]?.amount === "number"
          ? o.shipping_methods[0].amount
          : undefined

      const defaultShipping = itemsTotal >= 150 ? 0 : 4.95
      const actualShipping =
        typeof rawShipping === "number"
          ? (rawShipping > 50 && Number.isInteger(rawShipping) ? rawShipping / 100 : rawShipping)
          : defaultShipping

      const rawPaid = Number(o.summary?.original_order_total) || Number(o.summary?.paid_total) || 0
      const rawSummaryTotal = Number(o.summary?.total) || Number(o.total) || 0
      const metaRefunded = Number(o.metadata?.refunded_amount_minor) ? Number(o.metadata.refunded_amount_minor) / 100 : 0

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
        ...o,
        total,
        summary: {
          ...o.summary,
          total: summaryTotalPounds > 0 ? summaryTotalPounds : total,
          original_order_total: paidPounds > 0 ? paidPounds : total,
          paid_total: paidPounds > 0 ? paidPounds : total,
          subtotal: itemsTotal > 0 ? itemsTotal : (o.summary?.subtotal || itemsTotal),
          shipping_total: actualShipping,
        },
      }
    })

    return { orders: computedOrders, count: computedOrders.length }
  })
}

export async function POST(_req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  return res.status(410).json({ message: "Use the server-priced checkout endpoint to place an order." })
}

