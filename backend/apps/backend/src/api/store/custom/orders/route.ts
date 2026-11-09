import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { actor, commerce, endpoint } from "../../../../lib/commerce/http"
import { sanitizeStoreOrderMetadata } from "../../../../lib/commerce/policy"

function resolveItemThumbnail(it: any): string {
  let thumb = it?.thumbnail || it?.variant?.product?.thumbnail || it?.variant?.thumbnail
  if (thumb && typeof thumb === "string" && !thumb.includes("null") && !thumb.includes("placeholder")) {
    return thumb.replace(/^https?:\/\/localhost:\d+/, "")
  }
  return ""
}

function mapPendingAttemptToOrder(attempt: any, liveBankInstructions: any) {
  const q = attempt.data?.quote || {}
  const lines = Array.isArray(q.lines) ? q.lines : []
  const items = lines.map((l: any, idx: number) => {
    const unitPrice = (Number(l.unit_minor) || 0) / 100
    const qty = Number(l.quantity) || 1
    return {
      id: l.line_id || `${attempt.id}_li_${idx}`,
      variant_id: l.variant_id,
      title: l.name,
      variant_sku: l.sku,
      quantity: qty,
      unit_price: unitPrice,
      subtotal: unitPrice * qty,
      total: unitPrice * qty,
      thumbnail: "",
      metadata: l.metadata || {},
    }
  })
  const itemsSubtotal = items.reduce((sum: number, it: any) => sum + it.subtotal, 0)
  const shippingTotal = (Number(q.shipping_minor) || 0) / 100
  const total = typeof q.total_minor === "number" ? q.total_minor / 100 : itemsSubtotal + shippingTotal
  const transferRef = attempt.data?.transfer_reference || attempt.data?.order_number || attempt.id
  return {
    id: transferRef,
    custom_display_id: transferRef,
    display_id: transferRef,
    status: "pending",
    fulfillment_status: "not_fulfilled",
    payment_status: "awaiting",
    email: q.email || null,
    created_at: attempt.created_at || new Date().toISOString(),
    updated_at: attempt.updated_at || attempt.created_at || new Date().toISOString(),
    currency_code: q.currency || "gbp",
    total,
    subtotal: itemsSubtotal,
    tax_total: (Number(q.tax_minor) || 0) / 100,
    discount_total: (Number(q.promo?.discount_minor) || 0) / 100,
    shipping_total: shippingTotal,
    summary: {
      total,
      original_order_total: total,
      paid_total: 0,
      subtotal: itemsSubtotal,
      shipping_total: shippingTotal,
    },
    items,
    shipping_address: q.address || null,
    billing_address: q.billing_address || q.address || null,
    shipping_methods: q.shipping_option_name
      ? [{ name: q.shipping_option_name, amount: shippingTotal, shipping_option_id: q.shipping_option_id }]
      : [],
    metadata: {
      payment_gateway: "bank_transfer",
      payment_method: "UK Faster Payments (Bank Transfer)",
      transfer_reference: transferRef,
      attempt_id: attempt.id,
      awaiting_transfer: true,
      bank_instructions: liveBankInstructions || attempt.data?.bank_instructions || null,
    },
  }
}

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  res.setHeader("Cache-Control", "no-store")
  return endpoint(res, async () => {
    const customerId = actor(req)
    const ledger = commerce(req)

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
        metadata: sanitizeStoreOrderMetadata(o.metadata),
        items: lineItems,
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

    const settledAttemptIds = new Set(orders.map((o: any) => o.metadata?.peptech_attempt).filter(Boolean))
    const awaitingAttempts = await ledger.list("attempt", { owner: customerId, state: "awaiting_transfer", limit: 50 }).catch(() => [])
    const settingsRecord = awaitingAttempts.length ? await ledger.get("commerce_settings").catch(() => null) : null
    const liveBankInstructions = settingsRecord?.data?.bank_instructions || null

    const pendingBankOrders = awaitingAttempts
      .filter((a: any) => !a.data?.order_id && !settledAttemptIds.has(a.id))
      .map((a: any) => mapPendingAttemptToOrder(a, liveBankInstructions))

    const combined = [...pendingBankOrders, ...computedOrders].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return { orders: combined, count: combined.length }
  })
}

export async function POST(_req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  return res.status(410).json({ message: "Use the server-priced checkout endpoint to place an order." })
}

