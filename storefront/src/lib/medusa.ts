import Medusa from "@medusajs/js-sdk"

export interface StoreProduct {
  id: string
  title: string
  description?: string | null
  thumbnail?: string | null
  handle?: string
  variants?: Array<{
    id: string
    title: string
    prices?: Array<{
      amount: number
      currency_code: string
    }>
  }>
  [key: string]: unknown
}

/**
 * Medusa 2.0 JavaScript / TypeScript SDK Client
 * Connects your Next.js storefront directly to the Medusa backend & admin.
 */
export const medusa = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
  debug: process.env.NODE_ENV === "development",
})

/**
 * Helper: Fetch all published products for your custom storefront
 */
export async function getProducts(queryParams: Record<string, unknown> = {}): Promise<StoreProduct[]> {
  try {
    const response = await medusa.store.product.list(queryParams)
    return (response.products as unknown as StoreProduct[]) || []
  } catch (error) {
    console.error("Failed to fetch products from Medusa:", error)
    return []
  }
}

/**
 * Helper: Fetch product by handle or ID
 */
export async function getProduct(idOrHandle: string): Promise<StoreProduct | null> {
  try {
    const response = await medusa.store.product.retrieve(idOrHandle)
    return (response.product as unknown as StoreProduct) || null
  } catch (error) {
    console.error(`Failed to fetch product ${idOrHandle}:`, error)
    return null
  }
}

/**
 * Helper: Fetch collections for category navigation
 */
export async function getCollections(): Promise<Array<{ id: string; title: string; handle?: string }>> {
  try {
    const response = await medusa.store.collection.list()
    return (response.collections as unknown as Array<{ id: string; title: string; handle?: string }>) || []
  } catch (error) {
    console.error("Failed to fetch collections:", error)
    return []
  }
}
