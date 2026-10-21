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
  // If it's an absolute URL (e.g. CDN or S3), return as is
  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    return clean
  }
  if (clean.startsWith("/")) {
    return clean
  }
  return `/${clean}`
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

  if (text.includes("ghk") || text.includes("copper")) return "ghk-cu"
  if (text.includes("tesamorelin") || text.includes("tesa")) return "tesamorelin"
  if (text.includes("retatrutide") || text.includes("reta")) return "retatrutide"
  if (text.includes("tirzepatide") || text.includes("tirz") || text.includes("glp")) return "tirzepatide"
  if (text.includes("bpc") || text.includes("tb-500") || text.includes("tb500") || text.includes("wolverine")) return "bpc-157-tb-500"
  if (text.includes("mots") || text.includes("mots-c")) return "mots-c"
  if (text.includes("nad+") || text.includes("nad plus") || text.includes("nad-plus") || text.includes("nicotinamide")) return "nad-plus"
  if (text.includes("pt-141") || text.includes("pt141") || text.includes("bremelanotide")) return "pt-141"
  if (text.includes("melanotan") || text.includes("mt-2") || text.includes("mt2")) return "melanotan-2"
  if (text.includes("glow") || text.includes("barbie")) return "glow-stack"
  if (text.includes("klow")) return "klow"

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

  return `/images/placeholder.svg`
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
    const rev = getCatalogRevision()
    if (!rev) return url
    if (url.includes("v=")) {
      return url.replace(/([?&])v=[^&]*/, `$1v=${rev}`)
    }
    const separator = url.includes("?") ? "&" : "?"
    return `${url}${separator}v=${rev}`
  } catch {
    return url
  }
}

/**
 * Master Product Image Resolver.
 * Uses the product's explicit Medusa image/thumbnail, or returns a clean placeholder.
 * Never guesses or forces hardcoded seeded compound images if the merchant deleted the image.
 */
export function resolveProductImage(item?: ProductLike | string | null): string {
  if (!item) return `/images/placeholder.svg`

  if (typeof item === "string") {
    const clean = cleanExistingUrl(item)
    if (clean) return appendRevision(clean)
    return `/images/placeholder.svg`
  }

  // 1. Try explicit image or thumbnail first if valid
  const existingImage = cleanExistingUrl(item.image)
  if (existingImage) return appendRevision(existingImage)

  const existingThumb = cleanExistingUrl(item.thumbnail)
  if (existingThumb) return appendRevision(existingThumb)

  // 2. If no image or thumbnail is set in Medusa, return placeholder (no fake seeded image)
  return `/images/placeholder.svg`
}
