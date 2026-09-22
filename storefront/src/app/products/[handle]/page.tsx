"use client"

import React, { use, useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { COMPLETE_PEN_SET } from "@/data/products"
import { findCatalogProduct, CatalogProduct, CATALOG_PRODUCTS } from "@/data/catalog"
import { getProduct, getProductPrice, StoreProduct } from "@/lib/medusa"
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

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const resolvedParams = use(params)
  const searchParams = useSearchParams()
  const modelQuery = searchParams.get("model")

  const [medusaProduct, setMedusaProduct] = useState<StoreProduct | null>(null)
  const [livePrice, setLivePrice] = useState<number | null>(null)

  // 1. Resolve from central catalog
  const catalogProduct: CatalogProduct =
    findCatalogProduct(resolvedParams.handle, modelQuery) || {
      id: "complete-pen-set",
      name: COMPLETE_PEN_SET.name,
      handle: "complete-pen-set",
      format: "complete-pen-set",
      formatLabel: "COMPLETE PEN SET",
      category: "metabolic",
      categoryLabel: "Laboratory Research Pen System",
      description: COMPLETE_PEN_SET.description,
      price: COMPLETE_PEN_SET.price,
      subscribePrice: COMPLETE_PEN_SET.subscribePrice,
      inStock: true,
      isSubscriptionEligible: false,
      image: "/images/figma/152e353c4afaa5945905ac686de871b57ec2a770.png",
    }

  // 2. Fetch live Medusa product data if configured
  useEffect(() => {
    async function loadLiveProduct() {
      try {
        const handleToFetch = resolvedParams.handle || catalogProduct.handle
        const live = await getProduct(handleToFetch)
        if (live) {
          setMedusaProduct(live)
          const variant = live.variants?.[0]
          const price = getProductPrice(variant, "gbp") || getProductPrice(variant, "usd")
          if (price > 0) setLivePrice(price)
        }
      } catch (err) {
        console.warn("Using catalog specs for product details", err)
      }
    }
    loadLiveProduct()
  }, [resolvedParams.handle, catalogProduct.handle])

  const title = medusaProduct?.title || catalogProduct.name
  const description = medusaProduct?.description || catalogProduct.description
  const activePrice = livePrice || catalogProduct.price
  const subscribePrice =
    catalogProduct.subscribePrice || Number((activePrice * 0.9).toFixed(2))

  // Determine gallery images based on product format
  const galleryImages =
    catalogProduct.format === "complete-pen-set"
      ? COMPLETE_PEN_SET.images
      : catalogProduct.format === "refill-cartridge"
      ? [
          catalogProduct.image,
          "/images/figma/0e71e8560b9bae80ee21a3d08905300075c266b7.png",
          "/images/figma/6ae689249c306b3f6b31d8744c7c961d01964ca0.png",
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
              {title}
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
            {catalogProduct.format === "refill-cartridge" ? (
              <RefillBuyBox product={catalogProduct} />
            ) : catalogProduct.format === "freeze-dried-vial" ? (
              <VialBuyBox product={catalogProduct} />
            ) : (
              <ProductBuyBox
                title={title}
                subtitle="One system. Multiple possibilities."
                description={description}
                price={activePrice}
                subscribePrice={subscribePrice}
                tag="PEN SYSTEM"
              />
            )}
          </div>

        </div>
      </section>

      {/* Format-Specific Specifications */}
      {catalogProduct.format === "complete-pen-set" ? (
        <>
          <ProductSpecsGrid />
          <PeptechJourney />
          <RefillsSection />
          <VialsSection />
        </>
      ) : (
        <>
          <ProductTechnicalSpecs product={catalogProduct} />
          {/* If Refill, cross-link to pen set and other refills */}
          {catalogProduct.format === "refill-cartridge" && (
            <>
              <CompleteSetsSection />
              <RefillsSection />
            </>
          )}
          {/* If Vial, cross-link to other vials and pen set */}
          {catalogProduct.format === "freeze-dried-vial" && (
            <>
              <VialsSection />
              <CompleteSetsSection />
            </>
          )}
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
