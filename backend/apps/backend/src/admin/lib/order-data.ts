export function paymentStatus(order: any): string {
  const raw = String(order?.payment_status || order?.metadata?.payment_status || "").toLowerCase()
  if (["paid", "captured", "settled", "succeeded"].includes(raw)) return "paid"
  if (["refunded"].includes(raw)) return "refunded"
  if (["partially_refunded"].includes(raw)) return "partially_refunded"
  if (["authorized"].includes(raw)) return "authorized"
  if (["partially_authorized", "partially_captured"].includes(raw)) return "partially_captured"
  return raw || "not_paid"
}

export function statusLabel(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
}

export function fulfillmentStatus(order: any): string {
  return order?.fulfillment_status || "not_fulfilled"
}

export function customerName(order: any): string {
  const customer = order?.customer
  const name = [customer?.first_name, customer?.last_name].filter(Boolean).join(" ")
  const recipient = [order?.shipping_address?.first_name, order?.shipping_address?.last_name].filter(Boolean).join(" ")
  return name || customer?.email || order?.email || recipient || "Customer unavailable"
}

export function isSubscriptionOrder(order: any): boolean {
  return Boolean(order?.metadata?.subscription_id || order?.metadata?.order_type === "subscription_renewal" ||
    order?.items?.some((item: any) => item.metadata?.recurring === true || item.metadata?.is_subscription === true))
}

export const orderFields = "+email,+currency_code,+payment_status,+fulfillment_status,+metadata,+total,+subtotal,+display_id,*customer,*shipping_address,*billing_address,*items,*fulfillments,*shipping_methods,*payment_collections,*payment_collections.payments"
