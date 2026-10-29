// storefront/src/lib/tracking.ts
/**
 * PEPTECH® E-Commerce Tracking & DataLayer Engine
 * Compliant with GA4 e-commerce standards, Meta Conversions API (CAPI),
 * and TikTok Events API with 100% event_id deduplication.
 */

export interface TrackingItem {
  item_id: string
  item_name: string
  item_category?: string
  price: number
  quantity: number
  subscription_type?: "one_time" | "28_day_subscription"
  discount?: number
  compound?: string
  format?: "pen-set" | "refill" | "vial"
}

export interface TrackingCustomerData {
  email?: string | null
  phone?: string | null
  firstName?: string | null
  lastName?: string | null
  city?: string | null
  postalCode?: string | null
  country?: string | null
}

export interface TrackingOrder {
  transaction_id: string
  value: number
  tax?: number
  shipping?: number
  currency?: string
  items: TrackingItem[]
  customer?: TrackingCustomerData
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, any>>
    fbq?: (...args: any[]) => void
    ttq?: {
      track: (eventName: string, data?: Record<string, any>, options?: { event_id?: string }) => void
      page: () => void
      identify: (data: Record<string, any>) => void
      [key: string]: any
    }
  }
}

/**
 * Generate a deterministic event_id for 1:1 Browser Pixel <-> Server CAPI Deduplication
 */
export function generateEventId(prefix: string, referenceId?: string): string {
  if (referenceId) {
    // Sanitize reference ID (e.g. order_123 -> purchase_order_123)
    const cleanRef = referenceId.replace(/[^a-zA-Z0-9_-]/g, "")
    return `${prefix}_${cleanRef}`
  }
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 9)
  return `${prefix}_${timestamp}_${randomStr}`
}

/**
 * Push clean event payload to window.dataLayer
 */
export function pushToDataLayer(payload: Record<string, any>) {
  if (typeof window === "undefined") return

  window.dataLayer = window.dataLayer || []

  // GA4 Recommendation: Clear the previous ecommerce object before pushing a new one
  if (payload.ecommerce) {
    window.dataLayer.push({ ecommerce: null })
  }

  window.dataLayer.push(payload)
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp("(^|;\\s*)" + name + "=([^;]*)"))
  return match ? decodeURIComponent(match[2]) : null
}

/**
 * Dispatch server-to-server CAPI event to internal Next.js API route
 * Fully non-blocking with keepalive for seamless browser <-> server deduplication.
 */
function dispatchCapiEvent(payload: {
  event_name: string
  event_id: string
  user_data?: TrackingCustomerData
  custom_data?: Record<string, any>
}) {
  if (typeof window === "undefined") return

  try {
    const fbp = getCookie("_fbp")
    const fbc = getCookie("_fbc")
    const ttclid = getCookie("ttclid")
    const ttp = getCookie("_ttp")

    const body = {
      event_name: payload.event_name,
      event_id: payload.event_id,
      event_source_url: window.location.href,
      user_data: {
        email: payload.user_data?.email,
        phone: payload.user_data?.phone,
        firstName: payload.user_data?.firstName,
        lastName: payload.user_data?.lastName,
        city: payload.user_data?.city,
        postalCode: payload.user_data?.postalCode,
        country: payload.user_data?.country,
        fbp: fbp || undefined,
        fbc: fbc || undefined,
        ttclid: ttclid || undefined,
        ttp: ttp || undefined,
      },
      custom_data: payload.custom_data,
    }

    fetch("/api/tracking/meta-capi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {
      // Background ping - fail silently
    })
  } catch {
    // Fail silently on restricted environments
  }
}

/**
 * Dispatch client-side Meta Browser Pixel event with 1:1 eventID matching server CAPI
 */
function dispatchBrowserPixel(eventName: string, data?: Record<string, any>, eventId?: string) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return

  try {
    if (eventId) {
      window.fbq("track", eventName, data, { eventID: eventId })
    } else {
      window.fbq("track", eventName, data)
    }
  } catch {
    // Fail silently
  }
}

/**
 * Dispatch client-side TikTok Browser Pixel event with 1:1 event_id matching server Events API
 */
function dispatchTikTokPixel(eventName: string, data?: Record<string, any>, eventId?: string) {
  if (typeof window === "undefined" || !window.ttq || typeof window.ttq.track !== "function") return

  try {
    if (eventId) {
      window.ttq.track(eventName, data, { event_id: eventId })
    } else {
      window.ttq.track(eventName, data)
    }
  } catch {
    // Fail silently
  }
}

/**
 * 1. View Item List (Catalog / Category Browsing)
 */
export function trackViewItemList(items: TrackingItem[], listName = "Catalog") {
  const event_id = generateEventId("view_item_list")
  pushToDataLayer({
    event: "view_item_list",
    event_id,
    ecommerce: {
      item_list_name: listName,
      items: items.map((it, idx) => ({
        item_id: it.item_id,
        item_name: it.item_name,
        item_category: it.item_category || "Peptides",
        price: it.price,
        index: idx + 1,
        quantity: it.quantity || 1,
        subscription_type: it.subscription_type || "one_time",
      })),
    },
  })
}

/**
 * 2. View Item (Product Detail Page)
 */
export function trackViewItem(item: TrackingItem) {
  const event_id = generateEventId("view_item", item.item_id)
  const itemValue = Number((item.price * (item.quantity || 1)).toFixed(2))

  pushToDataLayer({
    event: "view_item",
    event_id,
    ecommerce: {
      currency: "GBP",
      value: itemValue,
      items: [
        {
          item_id: item.item_id,
          item_name: item.item_name,
          item_category: itFormatToCategory(item.format, item.item_category),
          price: item.price,
          quantity: item.quantity || 1,
          subscription_type: item.subscription_type || "one_time",
        },
      ],
    },
  })

  dispatchBrowserPixel(
    "ViewContent",
    {
      content_type: "product",
      content_ids: [item.item_id],
      content_name: item.item_name,
      content_category: itFormatToCategory(item.format, item.item_category),
      value: itemValue,
      currency: "GBP",
    },
    event_id
  )

  dispatchTikTokPixel(
    "ViewContent",
    {
      content_id: item.item_id,
      content_type: "product",
      content_name: item.item_name,
      content_category: itFormatToCategory(item.format, item.item_category),
      value: itemValue,
      currency: "GBP",
      quantity: item.quantity || 1,
      price: item.price,
    },
    event_id
  )

  dispatchCapiEvent({
    event_name: "ViewContent",
    event_id,
    custom_data: {
      currency: "GBP",
      value: itemValue,
      content_type: "product",
      contents: [
        {
          id: item.item_id,
          quantity: item.quantity || 1,
          item_price: item.price,
        },
      ],
    },
  })
}

/**
 * 3. Add to Cart
 */
export function trackAddToCart(item: TrackingItem) {
  const event_id = generateEventId("add_to_cart", item.item_id)
  const itemValue = Number((item.price * (item.quantity || 1)).toFixed(2))

  pushToDataLayer({
    event: "add_to_cart",
    event_id,
    ecommerce: {
      currency: "GBP",
      value: itemValue,
      items: [
        {
          item_id: item.item_id,
          item_name: item.item_name,
          item_category: itFormatToCategory(item.format, item.item_category),
          price: item.price,
          quantity: item.quantity || 1,
          subscription_type: item.subscription_type || "one_time",
        },
      ],
    },
  })

  dispatchBrowserPixel(
    "AddToCart",
    {
      content_type: "product",
      content_ids: [item.item_id],
      content_name: item.item_name,
      value: itemValue,
      currency: "GBP",
    },
    event_id
  )

  dispatchTikTokPixel(
    "AddToCart",
    {
      content_id: item.item_id,
      content_type: "product",
      content_name: item.item_name,
      value: itemValue,
      currency: "GBP",
      quantity: item.quantity || 1,
      price: item.price,
    },
    event_id
  )

  dispatchCapiEvent({
    event_name: "AddToCart",
    event_id,
    custom_data: {
      currency: "GBP",
      value: itemValue,
      content_type: "product",
      contents: [
        {
          id: item.item_id,
          quantity: item.quantity || 1,
          item_price: item.price,
        },
      ],
    },
  })
}

/**
 * 4. Remove from Cart
 */
export function trackRemoveFromCart(item: TrackingItem) {
  const event_id = generateEventId("remove_from_cart", item.item_id)
  pushToDataLayer({
    event: "remove_from_cart",
    event_id,
    ecommerce: {
      currency: "GBP",
      value: Number((item.price * (item.quantity || 1)).toFixed(2)),
      items: [
        {
          item_id: item.item_id,
          item_name: item.item_name,
          item_category: itFormatToCategory(item.format, item.item_category),
          price: item.price,
          quantity: item.quantity || 1,
          subscription_type: item.subscription_type || "one_time",
        },
      ],
    },
  })
}

/**
 * 5. Begin Checkout
 */
export function trackBeginCheckout(items: TrackingItem[], totalValue: number) {
  const event_id = generateEventId("begin_checkout")
  const valueFormatted = Number(totalValue.toFixed(2))

  pushToDataLayer({
    event: "begin_checkout",
    event_id,
    ecommerce: {
      currency: "GBP",
      value: valueFormatted,
      items: items.map((it) => ({
        item_id: it.item_id,
        item_name: it.item_name,
        item_category: itFormatToCategory(it.format, it.item_category),
        price: it.price,
        quantity: it.quantity || 1,
        subscription_type: it.subscription_type || "one_time",
      })),
    },
  })

  dispatchBrowserPixel(
    "InitiateCheckout",
    {
      content_type: "product",
      contents: items.map((it) => ({
        id: it.item_id,
        quantity: it.quantity || 1,
        item_price: it.price,
      })),
      num_items: items.length,
      value: valueFormatted,
      currency: "GBP",
    },
    event_id
  )

  dispatchTikTokPixel(
    "InitiateCheckout",
    {
      contents: items.map((it) => ({
        content_id: it.item_id,
        content_type: "product",
        content_name: it.item_name,
        quantity: it.quantity || 1,
        price: it.price,
      })),
      value: valueFormatted,
      currency: "GBP",
    },
    event_id
  )

  dispatchCapiEvent({
    event_name: "InitiateCheckout",
    event_id,
    custom_data: {
      currency: "GBP",
      value: valueFormatted,
      content_type: "product",
      contents: items.map((it) => ({
        id: it.item_id,
        quantity: it.quantity || 1,
        item_price: it.price,
      })),
    },
  })
}

/**
 * 6. Add Shipping Info
 */
export function trackAddShippingInfo(items: TrackingItem[], totalValue: number, shippingTier: string) {
  const event_id = generateEventId("add_shipping_info")
  pushToDataLayer({
    event: "add_shipping_info",
    event_id,
    ecommerce: {
      currency: "GBP",
      value: Number(totalValue.toFixed(2)),
      shipping_tier: shippingTier,
      items: items.map((it) => ({
        item_id: it.item_id,
        item_name: it.item_name,
        item_category: itFormatToCategory(it.format, it.item_category),
        price: it.price,
        quantity: it.quantity || 1,
        subscription_type: it.subscription_type || "one_time",
      })),
    },
  })
}

/**
 * 7. Add Payment Info
 */
export function trackAddPaymentInfo(items: TrackingItem[], totalValue: number, paymentType = "card") {
  const event_id = generateEventId("add_payment_info")
  pushToDataLayer({
    event: "add_payment_info",
    event_id,
    ecommerce: {
      currency: "GBP",
      value: Number(totalValue.toFixed(2)),
      payment_type: paymentType,
      items: items.map((it) => ({
        item_id: it.item_id,
        item_name: it.item_name,
        item_category: itFormatToCategory(it.format, it.item_category),
        price: it.price,
        quantity: it.quantity || 1,
        subscription_type: it.subscription_type || "one_time",
      })),
    },
  })
}

/**
 * 8. Purchase (Order Confirmation / Receipt)
 * Includes duplicate firing prevention via sessionStorage.
 */
export function trackPurchase(order: TrackingOrder): boolean {
  if (typeof window === "undefined") return false
  if (!order || !order.transaction_id) return false

  const trackingKey = `peptech_tracked_order_${order.transaction_id}`

  try {
    if (sessionStorage.getItem(trackingKey)) {
      // Already tracked this session — prevent duplicate purchase events
      return false
    }
  } catch {
    // Ignore storage errors in restricted contexts
  }

  const event_id = generateEventId("purchase", order.transaction_id)

  pushToDataLayer({
    event: "purchase",
    event_id,
    ecommerce: {
      transaction_id: order.transaction_id,
      value: Number(order.value.toFixed(2)),
      tax: Number((order.tax || 0).toFixed(2)),
      shipping: Number((order.shipping || 0).toFixed(2)),
      currency: order.currency || "GBP",
      items: order.items.map((it) => ({
        item_id: it.item_id,
        item_name: it.item_name,
        item_category: itFormatToCategory(it.format, it.item_category),
        price: it.price,
        quantity: it.quantity || 1,
        subscription_type: it.subscription_type || "one_time",
      })),
    },
    user_data: order.customer
      ? {
          email: order.customer.email,
          phone: order.customer.phone,
          first_name: order.customer.firstName,
          last_name: order.customer.lastName,
          city: order.customer.city,
          postal_code: order.customer.postalCode,
          country: order.customer.country,
        }
      : undefined,
  })

  dispatchBrowserPixel(
    "Purchase",
    {
      content_type: "product",
      contents: order.items.map((it) => ({
        id: it.item_id,
        quantity: it.quantity || 1,
        item_price: it.price,
      })),
      num_items: order.items.length,
      value: Number(order.value.toFixed(2)),
      currency: order.currency || "GBP",
    },
    event_id
  )

  if (order.customer && typeof window.ttq?.identify === "function") {
    try {
      window.ttq.identify({
        email: order.customer.email || undefined,
        phone_number: order.customer.phone || undefined,
      })
    } catch {
      // Fail silently
    }
  }

  dispatchTikTokPixel(
    "CompletePayment",
    {
      contents: order.items.map((it) => ({
        content_id: it.item_id,
        content_type: "product",
        content_name: it.item_name,
        quantity: it.quantity || 1,
        price: it.price,
      })),
      value: Number(order.value.toFixed(2)),
      currency: order.currency || "GBP",
    },
    event_id
  )

  dispatchCapiEvent({
    event_name: "Purchase",
    event_id,
    user_data: order.customer,
    custom_data: {
      currency: order.currency || "GBP",
      value: Number(order.value.toFixed(2)),
      order_id: order.transaction_id,
      content_type: "product",
      contents: order.items.map((it) => ({
        id: it.item_id,
        quantity: it.quantity || 1,
        item_price: it.price,
      })),
    },
  })

  try {
    sessionStorage.setItem(trackingKey, "1")
  } catch {
    // Ignore storage write errors
  }

  return true
}

function itFormatToCategory(format?: string, fallback?: string): string {
  if (format === "pen-set") return "Complete Pen Sets"
  if (format === "refill") return "Refill Cartridges"
  if (format === "vial") return "Freeze-Dried Vials"
  return fallback || "Peptides"
}
