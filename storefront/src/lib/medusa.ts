import Medusa from "@medusajs/js-sdk"
import { getBackendUrl } from "./customer-api"
import { type CatalogProduct, type TechnicalSpecs } from "@/data/catalog"
import { getChemicalProfile } from "./chemical-catalog"
import { resolveProductImage } from "./product-images"
import { bumpCatalogRevision } from "./catalog-version"

export interface StoreProductVariant {
  id: string
  title: string
  sku?: string
  manage_inventory?: boolean
  allow_backorder?: boolean
  inventory_quantity?: number
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
const publishableKey = (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "").trim()
if (!publishableKey && typeof window !== "undefined") {
  console.warn("[PEPTECH WARNING] Missing NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY environment variable.")
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
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes in-memory TTL (Hostinger & local session)

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
  bumpCatalogRevision()
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
        fields: "+metadata,*categories,*variants,*variants.prices,*images,+variants.inventory_quantity",
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
          fields: "+metadata,*categories,*variants,*variants.prices,*images,+variants.inventory_quantity",
        })
        product = (response.product as unknown as StoreProduct) || null
      } else {
        const cleanHandle = idOrHandle.replace(/^\//, "")
        let response = await medusa.store.product.list({
          handle: cleanHandle,
          fields: "+metadata,*categories,*variants,*variants.prices,*images,+variants.inventory_quantity",
          limit: 1,
        })
        let products = (response.products as unknown as StoreProduct[]) || []
        if (products.length === 0) {
          response = await medusa.store.product.list({
            handle: `/${cleanHandle}`,
            fields: "+metadata,*categories,*variants,*variants.prices,*images,+variants.inventory_quantity",
            limit: 1,
          })
          products = (response.products as unknown as StoreProduct[]) || []
        }
        if (products.length === 0) {
          const aliasMap: Record<string, string> = {
            "glow-stack-pen-set": "barbie-glow-pen-set",
            "glow-stack-cartridge": "barbie-glow-cartridge",
            "glow-stack-vial": "barbie-glow-vial",
            "bpc-157-tb-500-pen-set": "wolverine-stack-pen-set",
            "bpc-157-tb-500-cartridge": "wolverine-cartridge",
            "bpc-157-tb-500-vial": "wolverine-vial",
            "klow-pen-set": "klow-stack-pen-set",
            "klow-stack-cartridge": "klow-cartridge",
            "klow-stack-vial": "klow-vial",
            "wolverine-pen-set": "wolverine-stack-pen-set",
            "wolverine-stack-cartridge": "wolverine-cartridge",
            "wolverine-stack-vial": "wolverine-vial",
          }
          const alias = aliasMap[cleanHandle]
          if (alias) {
            response = await medusa.store.product.list({
              handle: alias,
              fields: "+metadata,*categories,*variants,*variants.prices,*images,+variants.inventory_quantity",
              limit: 1,
            })
            products = (response.products as unknown as StoreProduct[]) || []
          }
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

  // 2. Resolve format
  const categories = (p.categories || []) as StoreProductCategory[]
  const hasPenSetCat = categories.some((c) => c.handle === "complete-pen-sets" || c.name?.toLowerCase().includes("pen"))
  const hasRefillCat = categories.some((c) => c.handle === "refill-cartridges" || c.name?.toLowerCase().includes("refill"))
  const hasVialCat = categories.some((c) => c.handle === "freeze-dried-vials" || c.name?.toLowerCase().includes("vial"))

  const handleLower = (p.handle || p.title || "").toLowerCase()
  let format: "complete-pen-set" | "refill-cartridge" | "freeze-dried-vial" = "complete-pen-set"
  if (
    hasRefillCat ||
    metadata.format === "refill" ||
    metadata.format === "refill-cartridge" ||
    handleLower.includes("refill") ||
    handleLower.includes("cartridge")
  ) {
    format = "refill-cartridge"
  } else if (
    hasVialCat ||
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
    .filter((url): url is string => Boolean(url && !url.includes("null") && !url.includes("Screenshot") && !url.includes("cartridge.webp") && !url.includes("mockup2.webp")))

  let image = mappedImages[0] || (p.thumbnail as string) || ""
  if (!image || image === "null" || image.includes("Screenshot") || image.includes("placeholder.png")) {
    image = resolveProductImage({
      id: p.id,
      title: p.title,
      handle: p.handle,
      subtitle: typeof p.subtitle === "string" ? p.subtitle : undefined,
      format,
      metadata: (p.metadata as Record<string, any>) || undefined,
    })
  }

  const compoundSlug =
    (metadata.compound as string) ||
    (p.handle || p.id)
      .replace(/-pen-set$/, "")
      .replace(/-cartridge$/, "")
      .replace(/-vial$/, "")
      .replace(/^pen-system-/, "")

  const fallbackProfile = getChemicalProfile(compoundSlug)

  const contents =
    (p.subtitle as string) ||
    (metadata.contents as string) ||
    (metadata.subtitle as string) ||
    fallbackProfile?.contents ||
    ""
  const accentColor = (metadata.accentColor as string) || fallbackProfile?.accentColor || "#16a6a3"
  const technicalSpecs: TechnicalSpecs = {
    compoundName: (metadata.compound_name as string) || (metadata.technicalSpecs as any)?.compoundName || fallbackProfile?.compoundName || p.title,
    contentsOrStrength: (metadata.contents as string) || (p.subtitle as string) || (metadata.technicalSpecs as any)?.contentsOrStrength || fallbackProfile?.contents || "Specification Pending",
    peptideClass: (metadata.peptide_class as string) || (metadata.technicalSpecs as any)?.peptideClass || fallbackProfile?.peptideClass || "Research Peptide Standard",
    compositionOrSequence: (metadata.sequence as string) || (metadata.formula as string) || (metadata.technicalSpecs as any)?.compositionOrSequence || fallbackProfile?.sequence || "Sequence Confirmed by HPLC",
    molecularWeight: (metadata.molecular_weight as string) || (metadata.mw as string) || (metadata.technicalSpecs as any)?.molecularWeight || fallbackProfile?.molecularWeight || "Verified Analytical Batch",
    casNumber: (metadata.cas_number as string) || (metadata.cas as string) || (metadata.technicalSpecs as any)?.casNumber || fallbackProfile?.casNumber || "Reference Standard",
    form: (metadata.form as string) || (metadata.technicalSpecs as any)?.form || fallbackProfile?.form || (format === "complete-pen-set" ? "1.5 mL Borosilicate Cartridge in Pen System" : format === "refill-cartridge" ? "1.5 mL Pre-filled Glass Cartridge" : "Vacuum Freeze-Dried Lyophilised Cake"),
    storage: (metadata.storage as string) || (metadata.technicalSpecs as any)?.storage || fallbackProfile?.storage || "2°C – 8°C Refrigerated, protect from direct light",
    ratio: (metadata.ratio as string) || fallbackProfile?.ratio,
    totalContent: (metadata.total_content as string) || fallbackProfile?.totalContent,
    volume: (metadata.volume as string) || "1.5 mL Precision Volume",
    purity: (metadata.purity as string) || "≥ 99.0% HPLC",
    accentColor,
    colorName: (metadata.colorName as string) || (metadata.technicalSpecs as any)?.colorName || "Teal",
  }

  // Admin description has 100% precedence unless it contains old test placeholder words like "water quality"
  const adminDesc = (p.description as string) || (metadata.description as string) || ""
  const description =
    adminDesc && !adminDesc.toLowerCase().includes("water quality")
      ? adminDesc
      : fallbackProfile?.description ||
        "PEPTECH® analytical reference research peptide verified for laboratory and scientific research. Manufactured under ISO 9001 standards."

  const howItWorks = (metadata.how_it_works as string[]) || fallbackProfile?.howItWorks
  const keyFeatures = (metadata.key_features as string[]) || fallbackProfile?.keyFeatures

  return {
    id: p.id,
    variantId: p.variants && p.variants.length > 0 ? p.variants[0].id : p.id,
    sku: p.variants && p.variants.length > 0 ? p.variants[0].sku : undefined,
    name: p.title,
    handle: (p.handle || p.id).replace(/^\//, ""),
    compound: compoundSlug,
    format,
    formatLabel,
    category,
    categoryLabel: metadata.categoryLabel || categoryLabelMap[category] || "Research Peptide",
    contents,
    accentColor,
    technicalSpecs,
    description,
    howItWorks,
    keyFeatures,
    price: rawPrice,
    subscribePrice,
    inStock: (() => {
      if (p.status === "draft" || p.status === "proposed") return false
      if (!p.variants || p.variants.length === 0) return true
      return p.variants.some((v) => {
        if (!v.manage_inventory || v.allow_backorder) return true
        return typeof v.inventory_quantity === "number" ? v.inventory_quantity > 0 : true
      })
    })(),
    isSubscriptionEligible,
    image,
    images: mappedImages.length > 0 ? mappedImages : image ? [image] : [],
  }
}

/**
 * Helper: Fetch single mapped CatalogProduct by handle or ID
 */
export async function getCatalogProduct(idOrHandle: string): Promise<CatalogProduct | null> {
  const storeProduct = await getProduct(idOrHandle)
  if (!storeProduct) return null
  return mapMedusaToCatalogProduct(storeProduct)
}

/**
 * Helper: Fetch all mapped CatalogProducts from Medusa Store API
 */
export async function getCatalogProducts(queryParams: Record<string, unknown> = {}, forceRefresh = false): Promise<CatalogProduct[]> {
  const storeProducts = await getProducts(queryParams, forceRefresh)
  return storeProducts.map(mapMedusaToCatalogProduct)
}

/**
 * Prefetch and cache all published products in the background
 */
export function prefetchProducts(): Promise<StoreProduct[]> {
  return getProducts({ limit: 100 })
}


