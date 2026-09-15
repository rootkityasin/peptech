"use client"

import React, { use } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { COMPLETE_PEN_SET } from "@/data/products"
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

  const title = modelQuery
    ? `${modelQuery} PEPTECH® Pen System`
    : COMPLETE_PEN_SET.name

  return (
    <div className="bg-white min-h-screen text-slate-900">
      
      {/* Breadcrumb Navigation (from Mockup 2) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-xs text-slate-500 flex items-center gap-2 border-b border-slate-100">
        <Link href="/" className="hover:text-[#0B1F3A] transition-colors">Home</Link>
        <span>&gt;</span>
        <Link href="/products/complete-pen-set" className="hover:text-[#0B1F3A] transition-colors">Shop</Link>
        <span>&gt;</span>
        <span className="hover:text-[#0B1F3A] transition-colors">Pen Systems</span>
        <span>&gt;</span>
        <span className="font-semibold text-slate-900">{title}</span>
      </div>

      {/* Main Product Split (Gallery + Buy Box) */}
      <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left: Product Gallery */}
          <div className="lg:col-span-7">
            <ProductGallery images={COMPLETE_PEN_SET.images} />
          </div>

          {/* Right: Buy Box */}
          <div className="lg:col-span-5">
            <ProductBuyBox
              title={title}
              subtitle={COMPLETE_PEN_SET.subtitle}
              description={COMPLETE_PEN_SET.description}
              price={COMPLETE_PEN_SET.price}
              subscribePrice={COMPLETE_PEN_SET.subscribePrice}
              tag={COMPLETE_PEN_SET.tag}
            />
          </div>

        </div>
      </section>

      {/* 3-Card Technical Grid (What's Included, Specs, Lab Tested) */}
      <ProductSpecsGrid />

      {/* Your PEPTECH Journey (3 Steps) */}
      <PeptechJourney />

      {/* Complete Pen Sets Cross-Sell */}
      <CompleteSetsSection />

      {/* Refill Cartridges Section */}
      <RefillsSection />

      {/* Freeze-Dried Vials Section */}
      <VialsSection />

      {/* 5 Guarantee Badges Strip */}
      <TrustBadgesStrip />

      {/* Verified Customer Reviews */}
      <VerifiedReviewsSection />

      {/* 3 Action Resource Cards */}
      <ResourceCardsSection />

    </div>
  )
}
