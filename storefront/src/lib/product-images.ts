import { getCatalogRevision } from "./catalog-version"
/**
 * PEPTECH® Product Image Resolver
 * 
 * Accurately maps products, cart items, order items, and subscriptions to their
 * verified local product imagery (/images/products/pen-sets, /refills, /vials).
 */

export type ProductCategory = "pen-sets" | "refills" | "vials"

export interface ProductLike {
  id?: string
  title?: string
  name?: string
  product_name?: string
  subtitle?: string
  variant_title?: string
  handle?: string
  thumbnail?: string | null
  image?: string | null
  category?: string
  format?: string
  description?: string
  product_description?: string
  options?: Array<{ label?: string; value?: string }>
  metadata?: Record<string, any>
}

const COMPOUND_SLUGS = [
  "ghk-cu",
  "tesamorelin",
  "tirzepatide",
  "retatrutide",
  "bpc-157-tb-500",
  "mots-c",
  "nad-plus",
  "pt-141",
  "melanotan-2",
  "glow-stack",
  "barbie-glow",
  "klow",
] as const

export type CompoundSlug = typeof COMPOUND_SLUGS[number]

export const SUPABASE_STORAGE_BASE =
  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL ||
  (process.env.NEXT_PUBLIC_SUPABASE_URL
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products`
    : "/images/products")

/**
 * Normalizes an existing URL/path if valid
 */
function cleanExistingUrl(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null
  const trimmed = url.trim()
  if (
    !trimmed ||
    trimmed === "null" ||
    trimmed === "undefined" ||
    trimmed.includes("placeholder.png") ||
    trimmed.includes("placeholder.svg") ||
    trimmed.includes("/placeholder") ||
    trimmed.includes("Screenshot") ||
    trimmed.includes("/static/") // Ignore dead local/ephemeral uploads
  ) {
    return null
  }
  // Strip localhost origin if present
  let clean = trimmed.replace(/^https?:\/\/localhost:\d+/, "")
  if (clean.includes("/static/")) {
    return null
  }

  // Map any Supabase Storage URL directly to local static assets to eliminate Supabase bandwidth/egress
  const supabaseStorageMatch = clean.match(
    /\/storage\/v1\/object\/public\/products\/(.+)$/
  )
  if (supabaseStorageMatch) {
    const rawPath = supabaseStorageMatch[1].split("?")[0]
    if (rawPath.startsWith("pen-sets/") || rawPath.startsWith("refills/") || rawPath.startsWith("vials/")) {
      return `/images/products/${rawPath}`
    }
    if (rawPath.startsWith("about/") || rawPath.startsWith("how-it-works/") || rawPath.startsWith("reviews/") || rawPath.startsWith("figma/") || rawPath.startsWith("payment/")) {
      return `/images/${rawPath}`
    }
    // Newly uploaded images return the Supabase public CDN URL.
    // Next.js Image optimizer automatically caches it on Hostinger's disk after the first view.
    return clean
  }

  // If it's already a Supabase Storage CDN URL (e.g. ad-hoc new upload not yet on disk), return as is
  if (clean.includes("supabase.co")) {
    return clean
  }
  // Keep local /images/products paths local (ZERO Supabase egress)
  const match = clean.match(/\/images\/products\/(pen-sets|refills|vials)\/([a-zA-Z0-9_.-]+)/)
  if (match) {
    return `/images/products/${match[1]}/${match[2]}`
  }
  if (clean.startsWith("/images/products/")) {
    return clean
  }

  const isImageFile = /\.(png|jpe?g|webp|svg|gif|avif)($|\?)/i.test(clean)
  const isKnownImagePath = clean.startsWith("/images/") || clean.startsWith("/_next/") || clean.startsWith("/storage/")

  // If it's an absolute URL (e.g. CDN or S3), return as is if it looks like an image
  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    if (isImageFile || clean.includes("supabase") || clean.includes("cloudinary") || clean.includes("s3") || clean.includes("cdn")) {
      return clean
    }
    return null
  }

  if (isKnownImagePath || isImageFile) {
    return clean.startsWith("/") ? clean : `/${clean}`
  }

  // Not an image file/path (likely a lot number, product title, or slug)
  return null
}

/**
 * Detects whether the item is a Complete Pen Set, Refill Cartridge, or Freeze-Dried Vial
 */
export function resolveItemCategory(item?: ProductLike | string): ProductCategory {
  if (!item) return "pen-sets"
  
  if (typeof item === "string") {
    const s = item.toLowerCase()
    if (s.includes("vial") || s.includes("lyophilised") || s.includes("lyophilized") || s.includes("freeze-dried") || s.includes("cake") || s.includes("powder")) {
      return "vials"
    }
    if (s.includes("cartridge") || s.includes("refill") || s.includes("pre-filled") || s.includes("prefilled")) {
      return "refills"
    }
    return "pen-sets"
  }

  // Check explicit category or format
  const format = (item.format || item.category || item.metadata?.format || item.metadata?.category || "").toLowerCase()
  if (format === "vials" || format === "freeze-dried-vial" || format === "vial") return "vials"
  if (format === "refills" || format === "refill-cartridge" || format === "cartridge" || format === "refill") return "refills"
  if (format === "pen-sets" || format === "complete-pen-set" || format === "pen-set") return "pen-sets"

  // Primary check: Title / Name has highest priority
  const title = (item.title || item.name || item.product_name || "").toLowerCase()
  if (title.includes("pen") || title.includes("set") || title.includes("starter") || title.includes("system")) {
    return "pen-sets"
  }
  if (title.includes("vial") || title.includes("lyophilised") || title.includes("lyophilized") || title.includes("freeze-dried")) {
    return "vials"
  }
  if (title.includes("cartridge") || title.includes("refill")) {
    return "refills"
  }

  // Secondary check: Handle
  const handle = (item.handle || "").toLowerCase()
  if (handle.includes("vial")) return "vials"
  if (handle.includes("cartridge") || handle.includes("refill")) return "refills"
  if (handle.includes("pen")) return "pen-sets"

  // Subtitle / Variant check
  const sub = (item.subtitle || item.variant_title || "").toLowerCase()
  if (sub.includes("vial") || sub.includes("lyophilised")) return "vials"
  if (sub.includes("cartridge") || sub.includes("refill")) return "refills"

  return "pen-sets"
}

/**
 * Resolves the compound slug (e.g. ghk-cu, tesamorelin, tirzepatide)
 */
export function resolveCompoundSlug(item?: ProductLike | string): CompoundSlug {
  if (!item) return "ghk-cu"

  let text = ""
  if (typeof item === "string") {
    text = item.toLowerCase()
  } else {
    const optionValues = (item.options || []).map((o) => o?.value || "").join(" ")
    text = [
      item.title,
      item.name,
      item.product_name,
      item.handle,
      item.subtitle,
      item.variant_title,
      item.description,
      item.product_description,
      item.metadata?.compound,
      item.metadata?.compound_name,
      item.metadata?.cartridge_name,
      optionValues,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
  }

  if (text.includes("ghk") || text.includes("copper") || text.includes("gvk") || text.includes("cu-")) return "ghk-cu"
  if (text.includes("tesamorelin") || text.includes("tesa") || text.includes("tsm-")) return "tesamorelin"
  if (text.includes("retatrutide") || text.includes("reta") || text.includes("rt-")) return "retatrutide"
  if (text.includes("tirzepatide") || text.includes("tirz") || text.includes("trz-") || text.includes("glp") || text.includes("gip") || text.includes("mounjaro")) return "tirzepatide"
  if (text.includes("bpc") || text.includes("tb-500") || text.includes("tb500") || text.includes("wolverine") || text.includes("bc-")) return "bpc-157-tb-500"
  if (text.includes("mots") || text.includes("mots-c")) return "mots-c"
  if (text.includes("nad+") || text.includes("nad plus") || text.includes("nad-plus") || text.includes("nicotinamide") || text.includes("nj-")) return "nad-plus"
  if (text.includes("pt-141") || text.includes("pt141") || text.includes("bremelanotide") || text.includes("pt-")) return "pt-141"
  if (text.includes("melanotan") || text.includes("melatonin") || text.includes("mt-2") || text.includes("mt2") || text.includes("mt-ii") || text.includes("mt-")) return "melanotan-2"
  if (text.includes("glow") || text.includes("barbie")) return "glow-stack"
  if (text.includes("klow")) return "klow"
  if (text.includes("semaglutide") || text.includes("smg-") || text.includes("sm-")) return "tirzepatide"

  return "ghk-cu"
}

/**
 * Returns the exact public asset path for the compound in the given category
 */
export function getProductImagePath(category: ProductCategory, slug: CompoundSlug): string {
  const assetSlug = slug === "glow-stack" ? "barbie-glow" : slug

  if (category === "pen-sets") {
    // Note: ghk-cu and tesamorelin pen sets use .jpg; others use .png
    if (slug === "ghk-cu") return `/images/products/pen-sets/ghk-cu.jpg`
    if (slug === "tesamorelin") return `/images/products/pen-sets/tesamorelin.jpg`
    return `/images/products/pen-sets/${assetSlug}.png`
  }

  if (category === "refills") {
    return `/images/products/refills/${assetSlug}.png`
  }

  if (category === "vials") {
    return `/images/products/vials/${assetSlug}.png`
  }

  return `/images/products/pen-sets/ghk-cu.jpg`
}

/**
 * Appends the active catalog revision to product image URLs.
 * Bypasses Next.js Image Optimizer and browser immutable caches whenever an image is updated or deleted.
 */
export function appendRevision(url?: string | null): string {
  if (!url || typeof url !== "string") return "/images/placeholder.svg"
  if (url === "/images/placeholder.svg" || url.endsWith(".svg")) return url
  // Only remote / uploaded images (e.g. Supabase storage, CDN) need query cache-busting
  // Local static bundled assets in /public do not change at runtime without a redeploy
  if (url.startsWith("/") && !url.startsWith("/api/")) return url
  try {
    const isAbsolute = /^https?:\/\//i.test(url)
    const base = isAbsolute ? undefined : "https://peptech.bio"
    const parsed = new URL(url, base)

    // If the URL already contains a version parameter 'v', preserve it.
    // Overwriting it with a different timestamp on client hydration causes React SSR mismatches.
    if (parsed.searchParams.has("v")) {
      return url
    }

    const rev = getCatalogRevision()
    if (!rev) return url
    parsed.searchParams.set("v", String(rev))
    return isAbsolute ? parsed.toString() : `${parsed.pathname}${parsed.search}`
  } catch {
    return url
  }
}

/**
 * Master Product Image Resolver.
 * Resolves verified product imagery across the store, cart, checkout, customer accounts,
 * and order history. Guaranteed to display valid product photography without broken placeholders.
 */
export function resolveProductImage(item?: ProductLike | string | null): string {
  if (!item) return `/images/products/pen-sets/ghk-cu.jpg`

  if (typeof item === "string") {
    const clean = cleanExistingUrl(item)
    if (clean) return appendRevision(clean)
    // Non-URL string: interpret as compound name, lot/batch number, or title
    const category = resolveItemCategory(item)
    const slug = resolveCompoundSlug(item)
    const fallbackPath = getProductImagePath(category, slug)
    if (fallbackPath && !fallbackPath.includes("placeholder")) {
      return fallbackPath
    }
    return `/images/products/pen-sets/ghk-cu.jpg`
  }

  // 1. Try explicit image or thumbnail first if valid (and not a placeholder)
  const existingImage = cleanExistingUrl(item.image)
  if (existingImage) return appendRevision(existingImage)

  const existingThumb = cleanExistingUrl(item.thumbnail)
  if (existingThumb) return appendRevision(existingThumb)

  // 2. Try nested Medusa variant/product thumbnail if available
  const itemAny = item as any
  const variantThumb = cleanExistingUrl(itemAny.variant?.product?.thumbnail || itemAny.variant?.thumbnail)
  if (variantThumb) return appendRevision(variantThumb)

  const variantImage = cleanExistingUrl(itemAny.variant?.product?.images?.[0]?.url || itemAny.variant?.images?.[0]?.url)
  if (variantImage) return appendRevision(variantImage)

  // 3. Intelligent fallback: determine category and compound slug from product attributes
  const category = resolveItemCategory(item)
  const slug = resolveCompoundSlug(item)
  const resolved = getProductImagePath(category, slug)
  if (resolved && !resolved.includes("placeholder")) {
    return resolved
  }

  return `/images/products/pen-sets/ghk-cu.jpg`
}
