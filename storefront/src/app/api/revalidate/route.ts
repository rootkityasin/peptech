import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { invalidateProductsCache } from "@/lib/medusa"
import { getCatalogRevision, bumpCatalogRevision } from "@/lib/catalog-version"

export const dynamic = "force-dynamic"

function isAuthorized(request: Request): boolean {
  const secretHeader = request.headers.get("x-revalidate-secret")
  const { searchParams } = new URL(request.url)
  const secretQuery = searchParams.get("secret")
  const candidateSecret = secretHeader || secretQuery

  if (!candidateSecret) {
    return false
  }

  const validSecrets = [
    process.env.REVALIDATION_SECRET,
    process.env.COMMERCE_CRON_SECRET,
    process.env.STRIPE_COMMERCE_SIGNING_SECRET,
  ].filter((s): s is string => Boolean(s && s.length >= 8))

  if (validSecrets.length === 0) {
    return false
  }

  return validSecrets.includes(candidateSecret)
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
    let entityId: string | undefined
    try {
      const cloned = request.clone()
      const body = await cloned.json().catch(() => null)
      entityId = body?.data?.id || body?.data?.handle
    } catch {}

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
    if (entityId) {
      revalidatePath(`/products/${entityId}`, "page")
    }
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
