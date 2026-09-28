import type { CartItem } from "@/components/cart/CartContext"
import { getBackendUrl } from "./customer-api"

const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

export type CheckoutSession = {
  attemptId: string
  checkoutUrl?: string
  clientSecret?: string
  publishableKey?: string
  state: string
  orderId?: string
  orderNumber?: string
  stripeReceiptUrl?: string | null
  revision: string
  taxStatus?: string
  tax: number
  taxInclusive: boolean
  total: number
  currency: string
  renewalTotal: number
  shipping: number
  paymentMethod: string
  reference: string
  items: { name: string; quantity: number; recurring: boolean; unitPrice: number }[]
  subscriptionId?: string
}

export type CheckoutAddress = {
  id?: string
  first_name?: string
  last_name?: string
  company?: string
  address_1: string
  address_2?: string
  city: string
  postal_code: string
  country_code: string
  province?: string
  phone?: string
}

export async function commerceRequest(path: string, token: string, body?: unknown, method = "POST") {
  const response = await fetch(`${getBackendUrl()}${path}`, {
    method: body === undefined ? "GET" : method,
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": publishableKey,
      Authorization: `Bearer ${token}`,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    cache: "no-store",
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || "The operation could not finish. Retry the same request.")
  }
  return data
}

export async function prepareStripeCheckout(input: {
  items: CartItem[]
  address?: CheckoutAddress
  countryCode?: string
  email: string
  token: string
  ruoAccepted: boolean
  recurringAccepted?: boolean
  paymentMethod?: "stripe"
  uiMode?: "embedded" | "hosted_page"
}): Promise<CheckoutSession> {
  const items = await Promise.all(
    input.items.map(async (item) => {
      let variantId = item.variantId
      if (!variantId) {
        const handle = item.productHandle || item.id.replace(/-(one-time|subscription)$/, " ").trim()
        if (handle.includes("?")) throw new Error(`Please re-add ${item.title} from the current catalogue.`)
        const selector = handle.startsWith("prod_") ? `id=${encodeURIComponent(handle)}` : `handle=${encodeURIComponent(handle)}`
        const result = await commerceRequest(`/store/products?${selector}&fields=*variants&limit=2`, input.token)
        if (result.products.length !== 1 || result.products[0].variants?.length !== 1) {
          throw new Error(`${item.title} is no longer available in the connected catalogue. Remove it from your basket and choose a current product.`)
        }
        variantId = result.products[0].variants[0].id
      }
      return {
        variant_id: variantId,
        quantity: item.quantity,
        recurring: item.isSubscription,
        metadata: {
          title: item.title,
          format: item.format,
          strength: item.strength,
          options: item.options,
          cartridge_name: item.options?.find((o) => o.label?.toLowerCase().includes("cartridge"))?.value,
        },
      }
    })
  )

  const cleanedAddress = input.address && input.address.address_1?.trim()
    ? {
        id: input.address.id || undefined,
        first_name: input.address.first_name?.trim() || "",
        last_name: input.address.last_name?.trim() || "",
        company: input.address.company?.trim() || undefined,
        address_1: input.address.address_1.trim(),
        address_2: input.address.address_2?.trim() || undefined,
        city: input.address.city?.trim() || "",
        postal_code: input.address.postal_code?.trim() || "",
        country_code: (input.address.country_code || input.countryCode || "gb").trim().toLowerCase(),
        province: input.address.province?.trim() || undefined,
        phone: input.address.phone?.trim() || undefined,
      }
    : undefined

  const resolvedCountry = (input.countryCode || cleanedAddress?.country_code || "gb").trim().toLowerCase()

  const body = {
    items,
    ...(cleanedAddress ? { address: cleanedAddress } : {}),
    country_code: resolvedCountry,
    ruo_accepted: input.ruoAccepted,
    recurring_accepted: input.recurringAccepted === true,
    payment_method: input.paymentMethod || "stripe",
    ui_mode: input.uiMode || "embedded",
  }

  const fingerprint = JSON.stringify({ body, email: input.email })
  let saved: { fingerprint: string; revision: string } | null = null
  try {
    saved = JSON.parse(localStorage.getItem("peptech_checkout_revision") || "null")
  } catch {}

  const revision = saved?.fingerprint === fingerprint ? saved.revision : crypto.randomUUID()
  localStorage.setItem("peptech_checkout_revision", JSON.stringify({ fingerprint, revision }))

  let result: CheckoutSession
  try {
    result = await commerceRequest("/store/custom/checkout", input.token, { ...body, revision })
  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    if (
      errorMsg.includes("already processing") ||
      errorMsg.includes("Basket changed") ||
      errorMsg.startsWith("Checkout has expired")
    ) {
      // Rotate revision and retry once after a brief 500ms backoff
      await new Promise((resolve) => setTimeout(resolve, 500))
      const freshRevision = crypto.randomUUID()
      localStorage.setItem("peptech_checkout_revision", JSON.stringify({ fingerprint, revision: freshRevision }))
      try {
        result = await commerceRequest("/store/custom/checkout", input.token, { ...body, revision: freshRevision })
      } catch (retryError) {
        localStorage.removeItem("peptech_checkout_revision")
        throw retryError
      }
    } else {
      localStorage.removeItem("peptech_checkout_revision")
      throw error
    }
  }

  if (result.state === "expired") {
    localStorage.removeItem("peptech_checkout_revision")
    throw new Error("Checkout expired. Please continue again to create a new payment session.")
  }

  sessionStorage.setItem(`peptech_checkout_cart:${result.attemptId}`, JSON.stringify(input.items))
  return result
}

export async function checkoutStatus(attemptId: string, token: string): Promise<CheckoutSession> {
  return commerceRequest(`/store/custom/checkout?attempt_id=${encodeURIComponent(attemptId)}`, token)
}

export async function completeStripeCheckout(cartId: string, token: string) {
  const result = await commerceRequest(`/store/carts/${encodeURIComponent(cartId)}/complete`, token, {})
  if (result.type !== "order") throw new Error("Payment confirmation is pending. Do not start another payment.")
  return result.order
}
