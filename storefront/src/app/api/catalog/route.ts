import { NextResponse } from "next/server"
import { getCatalogProducts, invalidateProductsCache } from "@/lib/medusa"
import { getCatalogRevision } from "@/lib/catalog-version"

export const dynamic = "force-dynamic"

/**
 * GET /api/catalog
 * Optimized server-side catalog endpoint configured for Hostinger Cache Manager & Edge CDN.
 * Returns mapped CatalogProduct[] with Cache-Control, LiteSpeed cache headers, and Revision tracking.
 */
let lastRefreshTime = 0
const REFRESH_COOLDOWN_MS = 60000

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const wantsRefresh = searchParams.get("refresh") === "1"

    const internalSecret =
      request.headers.get("x-internal-secret") ||
      request.headers.get("x-revalidate-secret")
    const expectedSecret =
      process.env.REVALIDATION_SECRET || process.env.COMMERCE_CRON_SECRET

    const isAuthorized = Boolean(expectedSecret && internalSecret === expectedSecret)
    const now = Date.now()
    const canRefresh = wantsRefresh && (isAuthorized || now - lastRefreshTime > REFRESH_COOLDOWN_MS)

    if (canRefresh) {
      lastRefreshTime = now
      invalidateProductsCache()
    }

    const forceRefresh = canRefresh
    const products = await getCatalogProducts({ limit: 100 }, forceRefresh)
    const revision = getCatalogRevision()

    return NextResponse.json(products, {
      status: 200,
      headers: {
        // Hostinger Cache Manager / LiteSpeed Reverse Proxy headers
        "Cache-Control": forceRefresh
          ? "no-cache, no-store, must-revalidate, max-age=0"
          : "public, max-age=10, s-maxage=60, stale-while-revalidate=300",
        "CDN-Cache-Control": forceRefresh ? "no-cache" : "public, s-maxage=60",
        "X-LiteSpeed-Cache-Control": forceRefresh
          ? "no-cache"
          : "public, max-age=60, stale-while-revalidate=300",
        "X-Hostinger-Cache": "ENABLE",
        "X-Catalog-Revision": revision.toString(),
        "ETag": `W/"catalog-${revision}"`,
        "Vary": "Accept-Encoding",
      },
    })
  } catch (error) {
    console.error("[PEPTECH CATALOG API] Failed to fetch catalog:", error)
    return NextResponse.json([], {
      status: 500,
      headers: {
        "Cache-Control": "no-store",
      },
    })
  }
}
