"use client"

import React, { use, useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { COMPLETE_PEN_SET } from "@/data/products"
import { getProduct, getProductPrice, StoreProduct } from "@/lib/medusa"
import { ProductGallery } from "@/components/product/ProductGallery"
import { ProductBuyBox } from "@/components/product/ProductBuyBox"
import { ProductSpecsGrid } from "@/components/product/ProductSpecsGrid"
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

  const [product, setProduct] = useState<StoreProduct | null>(null)
  const [livePrice, setLivePrice] = useState<number>(COMPLETE_PEN_SET.price)

  useEffect(() => {
    async function loadLiveProduct() {
      try {
        const handleToFetch = resolvedParams.handle || "complete-pen-set"
        const live = await getProduct(handleToFetch)
        if (live) {
          setProduct(live)
          const variant = live.variants?.[0]
          const price = getProductPrice(variant, "usd")
          if (price > 0) setLivePrice(price)
        }
      } catch (err) {
        console.warn("Using default catalog specs for product details", err)
      }
    }
    loadLiveProduct()
  }, [resolvedParams.handle])

  const title = product?.title
    ? product.title
    : modelQuery
    ? `${modelQuery} PEPTECH® Pen System`
    : COMPLETE_PEN_SET.name

  const description = product?.description || COMPLETE_PEN_SET.description
  const subscribePrice = Number((livePrice * 0.9).toFixed(2))

  return (
    <div className="bg-white min-h-screen text-slate-900">
      
      {/* Breadcrumbs Section (Figma Node 8:41063) */}
      <div className="bg-white flex items-start justify-center py-[18px] w-full border-b border-[#e2e8f0]" data-node-id="8:41063" data-name="Breadcrumbs Section">
        <div className="flex items-center justify-between max-w-[1240px] w-full px-4 sm:px-6 overflow-x-auto whitespace-nowrap" data-node-id="8:41064" data-name="Breadcrumb Inner">
          <div className="flex items-center gap-[8px]">
            <Link href="/" className="font-normal text-[#64748b] text-[13px] hover:text-[#0b1f3a] transition-colors">
              Home
            </Link>
            <span className="font-normal text-[#cbd5e1] text-[12px]">{`>`}</span>
            <Link href="/products/complete-pen-set" className="font-normal text-[#64748b] text-[13px] hover:text-[#0b1f3a] transition-colors">
              Shop
            </Link>
            <span className="font-normal text-[#cbd5e1] text-[12px]">{`>`}</span>
            <Link href="/pen-sets" className="font-normal text-[#64748b] text-[13px] hover:text-[#0b1f3a] transition-colors">
              Pen Systems
            </Link>
            <span className="font-normal text-[#cbd5e1] text-[12px]">{`>`}</span>
            <span className="font-medium text-[#0b1f3a] text-[13px]">
              {title}
            </span>
          </div>
        </div>
      </div>

      {/* Main Product Showcase (Figma Node 8:41072) */}
      <section className="bg-white flex flex-col items-center justify-center pb-[48px] pt-[24px] w-full" data-node-id="8:41072" data-name="Main Product Showcase">
        <div className="flex flex-col lg:flex-row items-start justify-between max-w-[1240px] w-full px-4 sm:px-6 gap-[40px] lg:gap-[60px]" data-node-id="8:41073" data-name="Showcase Inner">
          
          {/* Left: Product Gallery (580px) */}
          <div className="w-full lg:w-[580px] shrink-0">
            <ProductGallery images={COMPLETE_PEN_SET.images} />
          </div>

          {/* Right: Buy Box (600px) */}
          <div className="w-full lg:w-[600px] shrink-0">
            <ProductBuyBox
              title={title}
              subtitle={COMPLETE_PEN_SET.subtitle}
              description={description}
              price={livePrice}
              subscribePrice={subscribePrice}
              tag={COMPLETE_PEN_SET.tag}
            />
          </div>

        </div>
      </section>

      {/* 3-Card Technical Grid (What's Included, Specs, Lab Tested - Node 8:41169) */}
      <ProductSpecsGrid />

      {/* Your PEPTECH Journey (3 Steps - Node 8:41277) */}
      <PeptechJourney />

      {/* Complete Pen Sets Section (Node 8:41322) */}
      <CompleteSetsSection />

      {/* Refill Cartridges Section (Node 8:41432) */}
      <RefillsSection />

      {/* Freeze-Dried Vials Section (Node 8:41537) */}
      <VialsSection />

      {/* 5 Guarantee Badges Strip (Node 8:41646) */}
      <TrustBadgesStrip />

      {/* Verified Customer Reviews (Node 8:41686) */}
      <VerifiedReviewsSection />

      {/* 3 Action Resource Cards (Node 8:41773) */}
      <ResourceCardsSection />

    </div>
  )
}

