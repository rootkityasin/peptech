import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { invalidateProductsCache } from "@/lib/medusa"
import { bumpCatalogRevision } from "@/lib/catalog-version"
import crypto from "crypto"

export const dynamic = "force-dynamic"

// In-memory sliding-window rate limit for /api/revalidate (30 requests per minute max per IP)
const revalidateRateLimitMap = new Map<string, number[]>()
const REVALIDATE_WINDOW_MS = 60 * 1000
const MAX_REVALIDATE_PER_MIN = 30

function checkRevalidateRateLimit(ip: string): boolean {
  const now = Date.now()
  const timestamps = revalidateRateLimitMap.get(ip) || []
  const recent = timestamps.filter((t) => now - t < REVALIDATE_WINDOW_MS)
  if (recent.length >= MAX_REVALIDATE_PER_MIN) {
    revalidateRateLimitMap.set(ip, recent)
    return false
  }
  recent.push(now)
  revalidateRateLimitMap.set(ip, recent)
  return true
}

function safeCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false
  const bufA = Buffer.from(a, "utf8")
  const bufB = Buffer.from(b, "utf8")
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}

function isAuthorized(request: Request): boolean {
  // Reject URL query parameter secrets to prevent credential leakage in web server access logs
  const candidateSecret = request.headers.get("x-revalidate-secret")?.trim()

  if (!candidateSecret) {
    return false
  }

  const validSecrets = [
    process.env.REVALIDATION_SECRET,
    process.env.COMMERCE_CRON_SECRET,
    process.env.STRIPE_COMMERCE_SIGNING_SECRET,
    process.env.INTERNAL_REVALIDATE_SECRET,
  ].filter((s): s is string => Boolean(s && s.length >= 8))

  if (validSecrets.length === 0) {
    return false
  }

  return validSecrets.some((secret) => safeCompare(candidateSecret, secret))
}

async function handleRevalidation(request: Request) {
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1"

  if (!checkRevalidateRateLimit(clientIp)) {
    return NextResponse.json(
      { error: "Too many revalidation requests. Please retry in 1 minute." },
      { status: 429 }
    )
  }

  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing revalidation secret header" },
      { status: 401 }
    )
  }

  // 1. Invalidate Medusa SDK in-memory catalog cache & bump revision
  invalidateProductsCache()
  const newRevision = bumpCatalogRevision()

  let event: string | undefined
  let fileKeys: string[] = []
  let entityId: string | undefined
  let handle: string | undefined
  let categories: string[] = []

  try {
    const cloned = request.clone()
    const body = await cloned.json().catch(() => null)
    event = body?.event
    if (Array.isArray(body?.fileKeys)) {
      fileKeys = body.fileKeys
    }
    entityId = body?.productId || body?.data?.id
    handle = body?.handle || body?.data?.handle
    if (Array.isArray(body?.categories)) {
      categories = body.categories
    }
  } catch {}

  console.log(
    `[REVALIDATE] Purging storefront cache for event: ${event || "manual"} (entity: ${entityId || "none"}, handle: ${handle || "all"}, fileKeys: ${fileKeys.join(", ") || "none"})`
  )

  // 2. Next.js App Router ISR Invalidation
  try {
    // Purge dynamic product route templates & layouts
    revalidatePath("/products/[handle]", "page")
    revalidatePath("/products/[handle]", "layout")

    // Purge category & catalog pages
    revalidatePath("/shop", "page")
    revalidatePath("/refills", "page")
    revalidatePath("/pen-sets", "page")
    revalidatePath("/vials", "page")
    revalidatePath("/", "page")
    revalidatePath("/", "layout")
    revalidatePath("/api/catalog")

    // If specific product handle or ID is present, revalidate its literal path
    if (handle) {
      revalidatePath(`/products/${handle}`, "page")
      revalidatePath(`/products/${handle}`, "layout")
    }
    if (entityId) {
      revalidatePath(`/products/${entityId}`, "page")
    }
  } catch (err) {
    console.warn("[REVALIDATE] Next.js ISR path revalidation warning:", err)
  }

  // 3. Eager Cache Warming: Pre-fetch refreshed catalog and product page in the background
  // This guarantees the next visitor gets 100% freshly rendered HTML in 0ms without waiting for stale-while-revalidate
  const origin = new URL(request.url).origin
  const warmTargets: string[] = [
    `${origin}/api/catalog?refresh=1`,
    `${origin}/shop`,
  ]

  if (handle) {
    warmTargets.push(`${origin}/products/${handle}`)
  }

  if (Array.isArray(categories) && categories.length > 0) {
    for (const cat of categories) {
      if (cat.includes("refill")) warmTargets.push(`${origin}/refills`)
      if (cat.includes("pen")) warmTargets.push(`${origin}/pen-sets`)
      if (cat.includes("vial")) warmTargets.push(`${origin}/vials`)
    }
  } else {
    warmTargets.push(`${origin}/refills`, `${origin}/pen-sets`, `${origin}/vials`)
  }

  const authSecret =
    request.headers.get("x-revalidate-secret") ||
    process.env.REVALIDATION_SECRET ||
    process.env.COMMERCE_CRON_SECRET ||
    process.env.INTERNAL_REVALIDATE_SECRET ||
    process.env.JWT_SECRET ||
    ""

  // Fire eager warming in background without blocking the revalidation HTTP response
  Promise.allSettled(
    warmTargets.map((url) =>
      fetch(url, {
        headers: {
          "x-eager-warm": "1",
          "Cache-Control": "no-cache",
          ...(authSecret ? { "x-revalidate-secret": authSecret } : {}),
        },
        cache: "no-store",
      }).catch(() => null)
    )
  ).catch(() => null)

  // 4. Respond with LiteSpeed & Hostinger Edge cache purge directives
  return NextResponse.json(
    {
      revalidated: true,
      revision: newRevision,
      event,
      fileKeys,
      entityId,
      handle,
      warmedTargets: warmTargets,
      timestamp: Date.now(),
      message: "Storefront caches, ISR paths, and Hostinger LiteSpeed edge cache purged and eagerly re-warmed.",
    },
    {
      status: 200,
      headers: {
        // LiteSpeed Cache Purge Header: instructs Hostinger LiteSpeed reverse proxy to flush cached items
        "X-LiteSpeed-Purge": "*",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        "Pragma": "no-cache",
      },
    }
  )
}

export async function POST(request: Request) {
  return handleRevalidation(request)
}

export async function GET(request: Request) {
  return handleRevalidation(request)
}
