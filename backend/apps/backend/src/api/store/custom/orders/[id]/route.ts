import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { actor, commerce, endpoint } from "../../../../../lib/commerce/http"
import { fail, sanitizeStoreOrderMetadata } from "../../../../../lib/commerce/policy"

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

    // Fallback: match customer-owned Bank Transfer attempt (pending or resolved to order_id)
    if (!order) {
      const ledger = commerce(req)
      const attempts = await ledger.list("attempt", { owner: customerId, limit: 100 }).catch(() => [])
      const cleanRaw = rawId.toUpperCase()
      const cleanNoPep = rawId.replace(/^PEP-?/i, "").toUpperCase()
      const matchedAttempt = attempts.find((a: any) => {
        const ref = String(a.data?.transfer_reference || a.data?.order_number || "").toUpperCase()
        return (
          a.id === rawId ||
          ref === cleanRaw ||
          (cleanNoPep && ref === `PEP-${cleanNoPep}`)
        )
      })
      if (matchedAttempt?.data?.order_id) {
        try {
          const { data: [settledOrder] = [] } = await orderQuery.graph({
            entity: "order",
            fields: orderFields,
            filters: { id: matchedAttempt.data.order_id },
          })
          order = settledOrder || null
        } catch {}
      } else if (matchedAttempt && matchedAttempt.state === "awaiting_transfer") {
        const settingsRecord = await ledger.get("commerce_settings").catch(() => null)
        const liveBankInstructions = settingsRecord?.data?.bank_instructions || null
        return { order: mapPendingAttemptToOrder(matchedAttempt, liveBankInstructions) }
      }
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
          metadata: sanitizeStoreOrderMetadata(order.metadata),
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

