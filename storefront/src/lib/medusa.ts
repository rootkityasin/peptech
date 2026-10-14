import Medusa from "@medusajs/js-sdk"
import { getBackendUrl } from "./customer-api"
import { useState, useEffect } from "react"
import { CATALOG_PRODUCTS, findCatalogProduct, type CatalogProduct } from "@/data/catalog"

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
const publishableKey = (
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
  "pk_556de0f5ea4724394f147569c8b5066ecda7a0d39bd60eb15b2550b2d5c52246"
).trim()
if (!publishableKey && process.env.NODE_ENV === "production" && typeof window !== "undefined") {
  console.error("[PEPTECH CRITICAL] Missing NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY environment variable.")
}

/**
 * Dynamically resolves the Medusa backend URL.
 * In a browser environment on a production domain (e.g., https://peptech.bio),
 * returns the current origin to use same-origin Next.js rewrites, preventing
 * Private Network Access (PNA loopback) and CORS blocks.
 */
export function getMedusaBackendUrl(): string {
  // Catalogue, authentication and checkout must use the same backend.
  return getBackendUrl() || (typeof window!=="undefined"?window.location.origin:DEFAULT_BACKEND_URL)
}

/**
 * Medusa 2.0 JavaScript / TypeScript SDK Client
 * Connects Next.js storefront directly to Medusa backend & admin.
 */
export const medusa = new Medusa({
  baseUrl: getMedusaBackendUrl(),
  publishableKey,
  debug: process.env.NODE_ENV === "development",
})

/**
 * Ensures the SDK client baseUrl and publishableKey match the runtime configuration
 */
function ensureRuntimeBaseUrl() {
  const client = (medusa as any)?.client
  if (client?.config) {
    if (typeof window !== "undefined") {
      const activeUrl = getMedusaBackendUrl()
      if (client.config.baseUrl !== activeUrl) {
        client.config.baseUrl = activeUrl
      }
    }
    if (!client.config.publishableKey || client.config.publishableKey === "") {
      client.config.publishableKey = publishableKey
    }
  }
}

// In-memory caching and promise deduplication
const CACHE_TTL_MS = 60 * 1000 // 60 seconds

let cachedStoreProducts: StoreProduct[] | null = null
let cachedCatalogProducts: CatalogProduct[] | null = null
let lastFetchedTimestamp = 0
let inFlightProductsPromise: Promise<StoreProduct[]> | null = null

const productByHandleCache = new Map<string, { data: StoreProduct; timestamp: number }>()
const inFlightHandlePromises = new Map<string, Promise<StoreProduct | null>>()

/**
 * Invalidate in-memory product cache (e.g. after cart mutation or manual reload)
 */
export function invalidateProductsCache(): void {
  cachedStoreProducts = null
  cachedCatalogProducts = null
  lastFetchedTimestamp = 0
  productByHandleCache.clear()
}

/**
 * Helper: Fetch all published products with variants and categories
 * Uses in-memory TTL caching and deduplicates concurrent in-flight requests.
 */
export async function getProducts(queryParams: Record<string, unknown> = {}, forceRefresh = false): Promise<StoreProduct[]> {
  ensureRuntimeBaseUrl()

  const isDefaultList =
    !queryParams ||
    Object.keys(queryParams).length === 0 ||
    (Object.keys(queryParams).length === 1 && queryParams.limit === 100)

  if (!forceRefresh && isDefaultList) {
    if (cachedStoreProducts && Date.now() - lastFetchedTimestamp < CACHE_TTL_MS) {
      return cachedStoreProducts
    }
    if (inFlightProductsPromise) {
      return inFlightProductsPromise
    }
  }

  const fetchPromise = (async () => {
    try {
      const response = await medusa.store.product.list({
        fields: "*categories,*variants,*variants.prices,*images",
        limit: 100,
        ...queryParams,
      })
      const products = (response.products as unknown as StoreProduct[]) || []
      if (isDefaultList && products.length > 0) {
        cachedStoreProducts = products
        cachedCatalogProducts = products.map(mapMedusaToCatalogProduct)
        lastFetchedTimestamp = Date.now()
        // Prime handle cache with all retrieved products
        products.forEach((p) => {
          if (p.id) productByHandleCache.set(p.id, { data: p, timestamp: Date.now() })
          if (p.handle) productByHandleCache.set(p.handle, { data: p, timestamp: Date.now() })
        })
      }
      return products
    } catch (error) {
      console.error("Failed to fetch products from Medusa:", error)
      return cachedStoreProducts || []
    } finally {
      if (isDefaultList) {
        inFlightProductsPromise = null
      }
    }
  })()

  if (isDefaultList) {
    inFlightProductsPromise = fetchPromise
  }

  return fetchPromise
}

/**
 * Helper: Fetch products by category handle ('complete-pen-sets', 'refill-cartridges', 'freeze-dried-vials')
 */
export async function getProductsByCategory(categoryHandle: string): Promise<StoreProduct[]> {
  const allProducts = await getProducts({ limit: 100 })
  return allProducts.filter((p) => p.categories?.some((c) => c.handle === categoryHandle))
}

/**
 * Helper: Synchronously get product from memory cache if available
 */
export function getCachedProduct(idOrHandle: string): CatalogProduct | null {
  const cached = productByHandleCache.get(idOrHandle)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return mapMedusaToCatalogProduct(cached.data)
  }
  if (cachedStoreProducts && Date.now() - lastFetchedTimestamp < CACHE_TTL_MS) {
    const found = cachedStoreProducts.find((p) => p.id === idOrHandle || p.handle === idOrHandle)
    if (found) {
      return mapMedusaToCatalogProduct(found)
    }
  }
  return null
}

/**
 * Helper: Fetch product by handle or ID
 * Fast-paths to in-memory cached catalog if already populated.
 */
export async function getProduct(idOrHandle: string, forceRefresh = false): Promise<StoreProduct | null> {
  if (!forceRefresh) {
    // 1. Check direct handle/id cache
    const cached = productByHandleCache.get(idOrHandle)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data
    }

    // 2. Check full product list cache
    if (cachedStoreProducts && Date.now() - lastFetchedTimestamp < CACHE_TTL_MS) {
      const found = cachedStoreProducts.find((p) => p.id === idOrHandle || p.handle === idOrHandle)
      if (found) {
        productByHandleCache.set(idOrHandle, { data: found, timestamp: Date.now() })
        return found
      }
    }

    // 3. Deduplicate in-flight single product requests
    if (inFlightHandlePromises.has(idOrHandle)) {
      return inFlightHandlePromises.get(idOrHandle)!
    }
  }

  ensureRuntimeBaseUrl()

  const handlePromise = (async () => {
    try {
      let product: StoreProduct | null = null
      if (idOrHandle.startsWith("prod_")) {
        const response = await medusa.store.product.retrieve(idOrHandle, {
          fields: "*categories,*variants,*variants.prices,*images",
        })
        product = (response.product as unknown as StoreProduct) || null
      } else {
        const cleanHandle = idOrHandle.replace(/^\//, "")
        let response = await medusa.store.product.list({
          handle: cleanHandle,
          fields: "*categories,*variants,*variants.prices,*images",
          limit: 1,
        })
        let products = (response.products as unknown as StoreProduct[]) || []
        if (products.length === 0) {
          response = await medusa.store.product.list({
            handle: `/${cleanHandle}`,
            fields: "*categories,*variants,*variants.prices,*images",
            limit: 1,
          })
          products = (response.products as unknown as StoreProduct[]) || []
        }
        product = products[0] || null
      }

      if (product) {
        productByHandleCache.set(idOrHandle, { data: product, timestamp: Date.now() })
        if (product.id) productByHandleCache.set(product.id, { data: product, timestamp: Date.now() })
        if (product.handle) productByHandleCache.set(product.handle, { data: product, timestamp: Date.now() })
      }
      return product
    } catch (error) {
      console.warn(`Could not load Medusa product for ${idOrHandle}:`, error)
      return null
    } finally {
      inFlightHandlePromises.delete(idOrHandle)
    }
  })()

  inFlightHandlePromises.set(idOrHandle, handlePromise)
  return handlePromise
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

/**
 * Domain Adapter: Maps Medusa 2.0 API StoreProduct to the CatalogProduct interface.
 */
export function mapMedusaToCatalogProduct(p: StoreProduct): CatalogProduct {
  const metadata = (p.metadata || {}) as Record<string, any>

  // 1. Resolve price from variants
  let rawPrice = 0
  if (p.variants && p.variants.length > 0) {
    for (const v of p.variants) {
      if (v.prices && v.prices.length > 0) {
        const gbpPrice = v.prices.find((pr) => pr.currency_code?.toLowerCase() === "gbp")
        rawPrice = gbpPrice ? gbpPrice.amount : v.prices[0].amount
        break
      }
    }
  }

  const staticFallback = findCatalogProduct(p.handle || p.id)
  if (rawPrice === 0 && staticFallback) {
    rawPrice = staticFallback.price
  }

  // 2. Resolve format
  const handleLower = (p.handle || p.title || "").toLowerCase()
  let format: "complete-pen-set" | "refill-cartridge" | "freeze-dried-vial" = "complete-pen-set"
  if (
    metadata.format === "refill" ||
    metadata.format === "refill-cartridge" ||
    handleLower.includes("refill") ||
    handleLower.includes("cartridge")
  ) {
    format = "refill-cartridge"
  } else if (
    metadata.format === "vial" ||
    metadata.format === "freeze-dried-vial" ||
    handleLower.includes("vial") ||
    handleLower.includes("lyophilised")
  ) {
    format = "freeze-dried-vial"
  }

  const formatLabel =
    format === "complete-pen-set"
      ? "COMPLETE PEN SET"
      : format === "refill-cartridge"
      ? "REFILL CARTRIDGE"
      : "FREEZE-DRIED VIAL"

  // 3. Resolve category
  let category: "metabolic" | "tissue" | "cellular" | "neuro" = "metabolic"
  if (metadata.category === "tissue" || handleLower.includes("ghk") || handleLower.includes("bpc")) {
    category = "tissue"
  } else if (metadata.category === "cellular" || handleLower.includes("epithalon") || handleLower.includes("nad")) {
    category = "cellular"
  } else if (metadata.category === "neuro" || handleLower.includes("selank") || handleLower.includes("semax")) {
    category = "neuro"
  }

  const categoryLabelMap = {
    metabolic: "Metabolic & Glucose",
    tissue: "Cellular Matrix",
    cellular: "Cellular Longevity",
    neuro: "Neuro & Cognitive",
  }

  // 4. Resolve subscription eligibility & price
  const isSubscriptionEligible = format !== "complete-pen-set"
  const discountPercent = Number(metadata.subscriptionDiscount || metadata.subDiscountPercent || 10)
  const subscribePrice = isSubscriptionEligible
    ? metadata.subscriptionPriceGbp
      ? Number(metadata.subscriptionPriceGbp)
      : Number((rawPrice * (1 - discountPercent / 100)).toFixed(2))
    : undefined

  // 5. Resolve image thumbnail & gallery images from Admin Media
  const rawImages = (p.images as Array<{ url: string } | string>) || []
  const mappedImages = rawImages
    .map((img) => (typeof img === "string" ? img : img?.url))
    .filter((url): url is string => Boolean(url && !url.includes("null") && !url.includes("Screenshot")))

  let image = mappedImages[0] || (p.thumbnail as string)
  if (!image || image === "null" || image.includes("Screenshot")) {
    image =
      format === "complete-pen-set"
        ? "/images/peptech/mockup1.webp"
        : format === "refill-cartridge"
        ? "/images/peptech/cartridge.webp"
        : "/images/peptech/mockup2.webp"
  }

  const contents =
    (p.subtitle as string) ||
    (metadata.contents as string) ||
    (metadata.subtitle as string) ||
    staticFallback?.contents ||
    p.title
  const accentColor = (metadata.accentColor as string) || staticFallback?.accentColor || "#16a6a3"
  const technicalSpecs = metadata.technicalSpecs || {
    compoundName: (metadata.compound_name as string) || staticFallback?.technicalSpecs?.compoundName || p.title,
    contentsOrStrength: (metadata.contents as string) || (p.subtitle as string) || staticFallback?.technicalSpecs?.contentsOrStrength || staticFallback?.contents || "Research Standard",
    peptideClass: (metadata.peptide_class as string) || staticFallback?.technicalSpecs?.peptideClass || "Research Reagent",
    compositionOrSequence: (metadata.sequence as string) || (metadata.formula as string) || staticFallback?.technicalSpecs?.compositionOrSequence || "Analytical Reference",
    molecularWeight: (metadata.molecular_weight as string) || (metadata.mw as string) || staticFallback?.technicalSpecs?.molecularWeight || "Verified MS",
    casNumber: (metadata.cas_number as string) || (metadata.cas as string) || staticFallback?.technicalSpecs?.casNumber || "Laboratory Standard",
    form: (metadata.form as string) || staticFallback?.technicalSpecs?.form || (format === "complete-pen-set" ? "1.5 mL Borosilicate Cartridge in Pen System" : format === "refill-cartridge" ? "1.5 mL Pre-filled Glass Cartridge" : "Vacuum Freeze-Dried Lyophilised Cake"),
    storage: (metadata.storage as string) || staticFallback?.technicalSpecs?.storage || (format === "freeze-dried-vial" ? "-20°C (Up to 24 Months)" : "2°C – 8°C (Refrigerated)"),
    accentColor,
    colorName: staticFallback?.technicalSpecs?.colorName || "Teal",
  }

  return {
    id: p.id,
    variantId: p.variants && p.variants.length > 0 ? p.variants[0].id : p.id,
    sku: p.variants && p.variants.length > 0 ? p.variants[0].sku : undefined,
    name: p.title,
    handle: (p.handle || p.id).replace(/^\//, ""),
    format,
    formatLabel,
    category,
    categoryLabel: metadata.categoryLabel || categoryLabelMap[category],
    contents,
    accentColor,
    technicalSpecs,
    description:
      (p.description as string) ||
      (metadata.description as string) ||
      staticFallback?.description ||
      "Laboratory Grade Research Peptide • 99%+ Purity Verified",
    price: rawPrice,
    subscribePrice,
    inStock: p.status !== "draft" && p.status !== "proposed",
    isSubscriptionEligible,
    image,
    images: mappedImages.length > 0 ? mappedImages : undefined,
  }
}

/**
 * Prefetch and cache all published products in the background
 */
export function prefetchProducts(): Promise<StoreProduct[]> {
  return getProducts({ limit: 100 })
}

/**
 * React Hook: SWR Live Product Hook
 * Only published API catalogue entries can enter the purchase flow.
 * Returns synchronous cache immediately on mount if available, avoiding hydration delay and duplicate fetches.
 */
export function useLiveProducts(initialFallback: CatalogProduct[] = CATALOG_PRODUCTS) {
  const [products, setProducts] = useState<CatalogProduct[]>(() => {
    if (cachedCatalogProducts !== null && typeof Date !== "undefined" && Date.now() - lastFetchedTimestamp < CACHE_TTL_MS) {
      return cachedCatalogProducts
    }
    return []
  })
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return !(cachedCatalogProducts !== null && typeof Date !== "undefined" && Date.now() - lastFetchedTimestamp < CACHE_TTL_MS)
  })

  useEffect(() => {
    let isMounted = true
    getProducts({ limit: 100 })
      .then((medusaProducts) => {
        if (isMounted) {
          const mapped = medusaProducts.map(mapMedusaToCatalogProduct)
          setProducts(mapped)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        console.warn("[Medusa] Revalidating from static catalog fallback:", err)
        if (isMounted) {
          if (products.length === 0 && initialFallback.length > 0) {
            setProducts(initialFallback)
          }
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  return {
    products,
    isLoading,
    refresh: () => getProducts({ limit: 100 }, true),
  }
}
