import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { invalidateProductsCache } from "@/lib/medusa"
import { getCatalogRevision, bumpCatalogRevision } from "@/lib/catalog-version"

export const dynamic = "force-dynamic"

function isAuthorized(request: Request): boolean {
  const secretHeader = request.headers.get("x-revalidate-secret")
  const { searchParams } = new URL(request.url)
  const secretQuery = searchParams.get("secret")
  const expectedSecret =
    process.env.REVALIDATION_SECRET || "peptech_revalidate_secret_8f49a7c2b3d1490e91a0"

  return (
    Boolean(expectedSecret) &&
    (secretHeader === expectedSecret || secretQuery === expectedSecret)
  )
}

async function handleRevalidation(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing revalidation secret" },
      { status: 401 }
    )
  }

  // 1. Invalidate Medusa SDK in-memory catalog cache & bump revision
  invalidateProductsCache()
  const newRevision = bumpCatalogRevision()

  // 2. Next.js App Router ISR Invalidation
  try {
    // Purges the entire site's pre-rendered pages (Homepage, Shop, Category routes, Product detail pages)
    revalidatePath("/", "layout")
    revalidatePath("/api/catalog")
  } catch (err) {
    console.warn("[REVALIDATE] Next.js ISR path revalidation warning:", err)
  }

  // 3. Respond with LiteSpeed & Hostinger Edge cache purge directives
  return NextResponse.json(
    {
      revalidated: true,
      revision: newRevision,
      timestamp: Date.now(),
      message: "Storefront caches, ISR paths, and Hostinger LiteSpeed edge cache purged successfully.",
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
