import { getBackendUrl, PUBLISHABLE_KEY } from "@/lib/customer-api"

interface StoreVariantPrice {
  amount?: number | null
  currency_code?: string | null
}

interface StoreCalculatedPrice {
  amount?: number | null
  calculated_amount?: number | null
}

interface StoreVariantPricing {
  id?: string | null
  calculated_price?: StoreCalculatedPrice | null
  prices?: StoreVariantPrice[] | null
}

interface StoreProductPricing {
  variants?: StoreVariantPricing[] | null
}

function resolveVariantAmount(variant: StoreVariantPricing, currencyCode: string): number | null {
  const calculated = variant?.calculated_price
  const calculatedAmount = calculated?.calculated_amount ?? calculated?.amount
  if (typeof calculatedAmount === "number") return calculatedAmount

  const matchingPrice = Array.isArray(variant?.prices)
    ? variant.prices.find((price) => price?.currency_code?.toLowerCase() === currencyCode.toLowerCase())
    : null

  return typeof matchingPrice?.amount === "number" ? matchingPrice.amount : null
}

export async function fetchRegionVariantPrices(regionId: string, currencyCode: string): Promise<Map<string, number>> {
  const pubKey = PUBLISHABLE_KEY
  const headers: Record<string, string> = {}
  if (pubKey) headers["x-publishable-api-key"] = pubKey

  const query = new URLSearchParams({
    region_id: regionId,
    fields: "id,handle,*variants,*variants.calculated_price,*variants.prices",
    limit: "100",
  })

  const request = async (url: string) => {
    const response = await fetch(url, { headers, cache: "no-store" })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(data?.message || "Failed to retrieve Medusa region prices.")
    }
    return Array.isArray(data?.products) ? data.products : []
  }

  const base = getBackendUrl()
  let products: StoreProductPricing[]
  try {
    products = await request(`${base}/store/products?${query.toString()}`)
  } catch (error) {
    if (!base) throw error
    products = await request(`/store/products?${query.toString()}`)
  }

  const prices = new Map<string, number>()
  for (const product of products) {
    for (const variant of product?.variants || []) {
      const amount = resolveVariantAmount(variant, currencyCode)
      if (variant?.id && amount !== null) {
        prices.set(variant.id, amount)
      }
    }
  }

  return prices
}
