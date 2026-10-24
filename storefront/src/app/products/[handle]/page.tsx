import React, { Suspense, cache } from "react"
import Link from "next/link"
import { Metadata } from "next"
import { getCatalogProduct, getCatalogProducts, isMatchingProductCompound } from "@/lib/medusa"
import { ProductShowcase } from "@/components/product/ProductShowcase"
import { ProductDetailSkeleton } from "@/components/product/ProductDetailSkeleton"

// Pure Event-Driven ISR: Cached indefinitely until revalidatePath is called by Medusa Admin
export const revalidate = false

interface PageProps {
  params: Promise<{ handle: string }>
}

// React cache to deduplicate catalog fetch across generateMetadata and Page
const getCachedCatalog = cache(async () => {
  return getCatalogProducts({ limit: 100 }).catch(() => [])
})

export async function generateStaticParams() {
  const products = await getCachedCatalog()
  return products.map((p) => ({ handle: p.handle }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params
  const allProducts = await getCachedCatalog()
  let product = allProducts.find((p) => p.handle === handle || p.id === handle) || null
  if (!product) {
    product = await getCatalogProduct(handle).catch(() => null)
  }

  if (!product) {
    return {
      title: "Product Not Found | PEPTECH® Precision Reusable System",
      description: "The requested laboratory research product is not active in the current catalog.",
    }
  }

  return {
    title: `${product.name} | PEPTECH® Precision Research`,
    description: product.description || "PEPTECH® analytical reference research peptide with verified certificate of analysis.",
    openGraph: {
      title: `${product.name} | PEPTECH® Precision System`,
      description: product.description,
      images: product.image ? [{ url: product.image }] : [],
    },
  }
}

async function ProductDetailAsync({ handle }: { handle: string }) {
  // Fetch full catalog once (reused from cache without duplicate network hits)
  const allProducts = await getCachedCatalog()

  // Resolve matching product in 0ms from cached catalog
  let product = allProducts.find((p) => p.handle === handle || p.id === handle) || null

  // Fallback if not found in catalog list
  if (!product) {
    product = await getCatalogProduct(handle).catch(() => null)
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-white">
        <div className="max-w-md space-y-4">
          <span className="text-xs font-bold text-[#16A6A3] uppercase tracking-wider">
            Catalogue Notice
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A]">
            Product Unavailable
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            The requested compound or format ({handle}) is currently inactive or undergoing laboratory batch certification.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0B1F3A] hover:bg-[#162e52] text-white text-sm font-semibold transition-all shadow-md"
            >
              <span>Browse Active Catalogue</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Sibling formats for the current compound with first-naming (SKU) & slug normalization
  const normalizeSlug = (slug: string) =>
    slug
      .toLowerCase()
      .replace(/-stack$/, "")
      .replace(/-pen-set$/, "")
      .replace(/-cartridge$/, "")
      .replace(/-vial$/, "")
      .replace(/^pen-system-/, "")

  const baseCompound = normalizeSlug(product.compound || product.handle)

  const matchesCompound = (p: any) => {
    if (isMatchingProductCompound(product, p)) return true
    const pSlug = normalizeSlug(p.compound || p.handle)
    return pSlug === baseCompound || pSlug.startsWith(baseCompound) || baseCompound.startsWith(pSlug)
  }

  const penSetProduct = allProducts.find(
    (p) => p.format === "complete-pen-set" && matchesCompound(p)
  ) || null

  const cartridgeProduct = allProducts.find(
    (p) => p.format === "refill-cartridge" && matchesCompound(p)
  ) || null

  const vialProduct = allProducts.find(
    (p) => p.format === "freeze-dried-vial" && matchesCompound(p)
  ) || null

  return (
    <ProductShowcase
      initialProduct={product}
      penSetProduct={penSetProduct}
      cartridgeProduct={cartridgeProduct}
      vialProduct={vialProduct}
      allProducts={allProducts}
    />
  )
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { handle } = await params

  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetailAsync handle={handle} />
    </Suspense>
  )
}
