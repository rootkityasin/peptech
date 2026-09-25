import Medusa from "@medusajs/js-sdk"

export interface StoreProductVariant {
  id: string
  title: string
  sku?: string
  options?: Array<{
    id: string
    value: string
    option_id: string
  }>
  prices?: Array<{
    id: string
    amount: number
    currency_code: string
  }>
}

export interface StoreProductCategory {
  id: string
  name: string
  handle: string
  description?: string | null
}

export interface StoreProduct {
  id: string
  title: string
  description?: string | null
  thumbnail?: string | null
  handle?: string
  status?: string
  categories?: StoreProductCategory[]
  variants?: StoreProductVariant[]
  metadata?: Record<string, unknown> | null
  [key: string]: unknown
}

const DEFAULT_BACKEND_URL = "http://localhost:9000"
const DEFAULT_PUBLISHABLE_KEY = "pk_556de0f5ea4724394f147569c8b5066ecda7a0d39bd60eb15b2550b2d5c52246"

/**
 * Dynamically resolves the Medusa backend URL.
 * In a browser environment on a production domain (e.g., https://peptech.bio),
 * returns the current origin to use same-origin Next.js rewrites, preventing
 * Private Network Access (PNA loopback) and CORS blocks.
 */
export function getMedusaBackendUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
    return envUrl.replace(/\/$/, "")
  }

  // In the browser, on production domains (e.g. https://peptech.bio), connect directly to the Medusa API at admin.peptech.bio
  if (typeof window !== "undefined") {
    const origin = window.location.origin
    if (!origin.includes("localhost") && !origin.includes("127.0.0.1")) {
      return "https://admin.peptech.bio"
    }
  }

  if (process.env.NODE_ENV === "production") {
    return "https://admin.peptech.bio"
  }

  return envUrl || DEFAULT_BACKEND_URL
}

/**
 * Medusa 2.0 JavaScript / TypeScript SDK Client
 * Connects Next.js storefront directly to Medusa backend & admin.
 */
export const medusa = new Medusa({
  baseUrl: getMedusaBackendUrl(),
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || DEFAULT_PUBLISHABLE_KEY,
  debug: process.env.NODE_ENV === "development",
})

/**
 * Ensures the SDK client baseUrl matches the runtime origin in browser
 */
function ensureRuntimeBaseUrl() {
  if (typeof window !== "undefined") {
    const client = (medusa as any)?.client
    if (client?.config) {
      const activeUrl = getMedusaBackendUrl()
      if (client.config.baseUrl !== activeUrl) {
        client.config.baseUrl = activeUrl
      }
    }
  }
}

/**
 * Helper: Fetch all published products with variants and categories
 */
export async function getProducts(queryParams: Record<string, unknown> = {}): Promise<StoreProduct[]> {
  ensureRuntimeBaseUrl()
  try {
    const response = await medusa.store.product.list({
      fields: "*categories,*variants,*variants.prices",
      ...queryParams,
    })
    return (response.products as unknown as StoreProduct[]) || []
  } catch (error) {
    console.error("Failed to fetch products from Medusa:", error)
    return []
  }
}

/**
 * Helper: Fetch products by category handle ('complete-pen-sets', 'refill-cartridges', 'freeze-dried-vials')
 */
export async function getProductsByCategory(categoryHandle: string): Promise<StoreProduct[]> {
  ensureRuntimeBaseUrl()
  try {
    const response = await medusa.store.product.list({
      fields: "*categories,*variants,*variants.prices",
      limit: 100,
    })
    const products = (response.products as unknown as StoreProduct[]) || []
    return products.filter((p) => p.categories?.some((c) => c.handle === categoryHandle))
  } catch (error) {
    console.error(`Failed to fetch products for category ${categoryHandle}:`, error)
    return []
  }
}

/**
 * Helper: Fetch product by handle or ID
 */
export async function getProduct(idOrHandle: string): Promise<StoreProduct | null> {
  ensureRuntimeBaseUrl()
  try {
    if (idOrHandle.startsWith("prod_")) {
      const response = await medusa.store.product.retrieve(idOrHandle, {
        fields: "*categories,*variants,*variants.prices",
      })
      return (response.product as unknown as StoreProduct) || null
    }

    const response = await medusa.store.product.list({
      handle: idOrHandle,
      fields: "*categories,*variants,*variants.prices",
      limit: 1,
    })
    const products = (response.products as unknown as StoreProduct[]) || []
    return products[0] || null
  } catch (error) {
    console.warn(`Could not load Medusa product for ${idOrHandle}:`, error)
    return null
  }
}

/**
 * Helper: Fetch all product categories
 */
export async function getProductCategories(): Promise<StoreProductCategory[]> {
  ensureRuntimeBaseUrl()
  try {
    const response = await medusa.store.category.list()
    return (response.product_categories as unknown as StoreProductCategory[]) || []
  } catch (error) {
    console.error("Failed to fetch categories from Medusa:", error)
    return []
  }
}


/**
 * Helper: Get price in specified currency (defaults to GBP)
 */
export function getProductPrice(variant?: StoreProductVariant, currency = "gbp"): number {
  if (!variant || !variant.prices || variant.prices.length === 0) return 0
  const match = variant.prices.find((p) => p.currency_code.toLowerCase() === currency.toLowerCase())
  return match ? match.amount : variant.prices[0].amount
}
