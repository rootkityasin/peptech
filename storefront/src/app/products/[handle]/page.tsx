"use client"

import React, { use, useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { COMPLETE_PEN_SET } from "@/data/products"
import { findCatalogProduct, CatalogProduct, CATALOG_PRODUCTS } from "@/data/catalog"
import { getProduct, getCachedProduct, mapMedusaToCatalogProduct } from "@/lib/medusa"
import { ProductGallery } from "@/components/product/ProductGallery"
import { ProductBuyBox } from "@/components/product/ProductBuyBox"
import { RefillBuyBox } from "@/components/product/RefillBuyBox"
import { VialBuyBox } from "@/components/product/VialBuyBox"
import { ProductSpecsGrid } from "@/components/product/ProductSpecsGrid"
import { ProductTechnicalSpecs } from "@/components/product/ProductTechnicalSpecs"
import { PeptechJourney } from "@/components/product/PeptechJourney"
import { CompleteSetsSection } from "@/components/product/CompleteSetsSection"
import { RefillsSection } from "@/components/product/RefillsSection"
import { VialsSection } from "@/components/product/VialsSection"
import { TrustBadgesStrip } from "@/components/product/TrustBadgesStrip"
import { VerifiedReviewsSection } from "@/components/product/VerifiedReviewsSection"
import { ResourceCardsSection } from "@/components/product/ResourceCardsSection"

function ProductDetailContent({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const resolvedParams = use(params)
  const searchParams = useSearchParams()
  const modelQuery = searchParams.get("model")

  // Synchronously initialize from cache or static catalog to prevent loading flash
  const initialProduct = getCachedProduct(resolvedParams.handle) || (!modelQuery ? findCatalogProduct(resolvedParams.handle) : null)
  const [catalogProduct, setCatalogProduct] = useState<CatalogProduct | null>(initialProduct)
  const [loading, setLoading] = useState(!initialProduct)

  useEffect(() => {
    let active = true
    if (modelQuery) {
      setLoading(false)
      return
    }
    getProduct(resolvedParams.handle).then((product) => {
      if (active) {
        if (product) {
          setCatalogProduct(mapMedusaToCatalogProduct(product))
        }
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [resolvedParams.handle, modelQuery])

  if (loading) return <p role="status" className="p-12">Loading product…</p>
  if(!catalogProduct) return <div className="p-12"><h1 className="text-2xl font-bold">Product unavailable</h1><p className="my-4">This product is not in the current catalogue.</p><Link href="/shop" className="underline">Browse current products</Link></div>
  const title=catalogProduct.name
  const activePrice=catalogProduct.price
  const subscribePrice=catalogProduct.subscribePrice

  // Determine gallery images based on product format
  const galleryImages =
    catalogProduct.format === "complete-pen-set"
      ? COMPLETE_PEN_SET.images
      : catalogProduct.format === "refill-cartridge"
      ? [
          catalogProduct.image || "/images/peptech/cartridge.webp",
          "/images/figma/0e71e8560b9bae80ee21a3d08905300075c266b7.png",
          "/images/peptech/cartridge.webp",
          "/images/figma/6ae689249c306b3f6b31d8744c7c961d01964ca0.png",
          "/images/peptech/back.webp",
        ]
      : [
          catalogProduct.image,
          "/images/figma/2d7803f97be6d80d5630dfb42abba84289ed1bb5.png",
          "/images/figma/9eac22019fa5ef074776d7d27b3528efdcf1708e.png",
        ]

  // Category breadcrumb details
  const categoryHref =
    catalogProduct.format === "refill-cartridge"
      ? "/refills"
      : catalogProduct.format === "freeze-dried-vial"
      ? "/vials"
      : "/pen-sets"

  const categoryName =
    catalogProduct.format === "refill-cartridge"
      ? "Refill Cartridges"
      : catalogProduct.format === "freeze-dried-vial"
      ? "Freeze-Dried Vials"
      : "Complete Pen Sets"

  return (
    <div className="bg-white min-h-screen text-slate-900">
      
      {/* Breadcrumbs Section */}
      <div className="bg-white flex items-start justify-center py-[18px] w-full border-b border-[#e2e8f0]" data-name="Breadcrumbs Section">
        <div className="flex items-center justify-between max-w-[1240px] w-full px-4 sm:px-6 overflow-x-auto whitespace-nowrap no-scrollbar scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden" data-name="Breadcrumb Inner">
          <div className="flex items-center gap-[8px]">
            <Link href="/" className="font-normal text-[#64748b] text-[13px] hover:text-[#0b1f3a] transition-colors">
              Home
            </Link>
            <span className="font-normal text-[#cbd5e1] text-[12px]">{`>`}</span>
            <Link href="/shop" className="font-normal text-[#64748b] text-[13px] hover:text-[#0b1f3a] transition-colors">
              Shop
            </Link>
            <span className="font-normal text-[#cbd5e1] text-[12px]">{`>`}</span>
            <Link href={categoryHref} className="font-normal text-[#64748b] text-[13px] hover:text-[#0b1f3a] transition-colors">
              {categoryName}
            </Link>
            <span className="font-normal text-[#cbd5e1] text-[12px]">{`>`}</span>
            <span className="font-medium text-[#0b1f3a] text-[13px] truncate max-w-[300px]">
              {title.replace("\n", " ")}
            </span>
          </div>
        </div>
      </div>

      {/* Main Product Showcase */}
      <section className="bg-white flex flex-col items-center justify-center pb-[48px] pt-[24px] w-full" data-name="Main Product Showcase">
        <div className="flex flex-col lg:flex-row items-start justify-between max-w-[1240px] w-full px-4 sm:px-6 gap-[40px] lg:gap-[60px]" data-name="Showcase Inner">
          
          {/* Left: Product Gallery */}
          <div className="w-full lg:w-[580px] shrink-0">
            <ProductGallery images={galleryImages} />
          </div>

          {/* Right: Buy Box (Render format-specific buy box) */}
          <div className="w-full lg:w-[600px] shrink-0">
            {catalogProduct.format === "freeze-dried-vial" ? (
              <VialBuyBox product={catalogProduct} />
            ) : catalogProduct.format === "refill-cartridge" ? (
              <ProductBuyBox
                product={catalogProduct}
                title={title}
                subtitle="Pre-filled 1.5 mL Cartridge • Fits PEPTECH® Precision Pen"
                description={catalogProduct.description || "Precision engineered pre-filled cartridge compatible with the PEPTECH reusable precision pen system."}
                price={activePrice}
                subscribePrice={subscribePrice}
                tag="REFILL CARTRIDGE"
              />
            ) : (
              <ProductBuyBox
                product={catalogProduct}
                title={title}
                subtitle="One system. Multiple possibilities."
                description="Get started with the complete PEPTECH® system. Includes reusable pen, a compatible prefilled cartridge, 14 instructions and all accessories you need for accurate, reliable testing."
                price={activePrice}
                subscribePrice={subscribePrice}
                tag="PEN SYSTEM"
              />
            )}
          </div>

        </div>
      </section>

      {/* Format-Specific Specifications & Journey Stack */}
      {catalogProduct.format === "freeze-dried-vial" ? (
        <>
          <ProductTechnicalSpecs product={catalogProduct} />
          <VialsSection />
        </>
      ) : (
        <>
          <ProductSpecsGrid />
          <PeptechJourney />
          <RefillsSection />
          <VialsSection />
        </>
      )}

      {/* 5 Guarantee Badges Strip */}
      <TrustBadgesStrip />

      {/* Verified Customer Reviews */}
      <VerifiedReviewsSection />

      {/* Action Resource Cards */}
      <ResourceCardsSection />

    </div>
  )
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc]" />}>
      <ProductDetailContent params={params} />
    </Suspense>
  )
}
