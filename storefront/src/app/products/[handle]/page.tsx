import React, { Suspense } from "react"
import Link from "next/link"
import { Metadata } from "next"
import { getCatalogProduct, getCatalogProducts } from "@/lib/medusa"
import { ProductShowcase } from "@/components/product/ProductShowcase"
import { ProductDetailSkeleton } from "@/components/product/ProductDetailSkeleton"

interface PageProps {
  params: Promise<{ handle: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params
  const product = await getCatalogProduct(handle)

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
  const [product, allProducts] = await Promise.all([
    getCatalogProduct(handle),
    getCatalogProducts({ limit: 100 }),
  ])

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

  // Sibling formats for the current compound
  const currentCompoundSlug =
    product.compound ||
    product.handle
      .replace(/-pen-set$/, "")
      .replace(/-cartridge$/, "")
      .replace(/-vial$/, "")
      .replace(/^pen-system-/, "")

  const penSetProduct = allProducts.find(
    (p) =>
      p.format === "complete-pen-set" &&
      (p.compound === currentCompoundSlug || p.handle.startsWith(currentCompoundSlug) || p.handle.includes(currentCompoundSlug))
  ) || null

  const cartridgeProduct = allProducts.find(
    (p) =>
      p.format === "refill-cartridge" &&
      (p.compound === currentCompoundSlug || p.handle.startsWith(currentCompoundSlug) || p.handle.includes(currentCompoundSlug))
  ) || null

  const vialProduct = allProducts.find(
    (p) =>
      p.format === "freeze-dried-vial" &&
      (p.compound === currentCompoundSlug || p.handle.startsWith(currentCompoundSlug) || p.handle.includes(currentCompoundSlug))
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
