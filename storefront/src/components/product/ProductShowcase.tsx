"use client"

import React, { useState } from "react"
import Link from "next/link"
import { CatalogProduct } from "@/data/catalog"
import { ProductGallery } from "./ProductGallery"
import { ProductBuyBox } from "./ProductBuyBox"
import { RefillBuyBox } from "./RefillBuyBox"
import { VialBuyBox } from "./VialBuyBox"
import { ProductFormatSwitcher } from "./ProductFormatSwitcher"
import { ProductTechnicalSpecs } from "./ProductTechnicalSpecs"
import { PeptechJourney } from "./PeptechJourney"
import { CompleteSetsSection } from "./CompleteSetsSection"
import { RefillsSection } from "./RefillsSection"
import { VialsSection } from "./VialsSection"
import { TrustBadgesStrip } from "./TrustBadgesStrip"
import { VerifiedReviewsSection } from "./VerifiedReviewsSection"
import { ResourceCardsSection } from "./ResourceCardsSection"

interface ProductShowcaseProps {
  initialProduct: CatalogProduct
  penSetProduct?: CatalogProduct | null
  cartridgeProduct?: CatalogProduct | null
  vialProduct?: CatalogProduct | null
  allProducts?: CatalogProduct[]
}

export function ProductShowcase({
  initialProduct,
  penSetProduct,
  cartridgeProduct,
  vialProduct,
  allProducts,
}: ProductShowcaseProps) {
  const [currentProduct, setCurrentProduct] = useState<CatalogProduct>(initialProduct)

  const handleSelectFormat = (newProduct: CatalogProduct) => {
    setCurrentProduct(newProduct)
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `/products/${newProduct.handle}`)
    }
  }

  const categoryHref =
    currentProduct.format === "refill-cartridge"
      ? "/refills"
      : currentProduct.format === "freeze-dried-vial"
      ? "/vials"
      : "/pen-sets"

  const categoryName =
    currentProduct.format === "refill-cartridge"
      ? "Refill Cartridges"
      : currentProduct.format === "freeze-dried-vial"
      ? "Freeze-Dried Vials"
      : "Complete Pen Sets"

  const galleryImages =
    currentProduct.images && currentProduct.images.length > 0
      ? currentProduct.images
      : currentProduct.format === "complete-pen-set"
      ? [
          currentProduct.image || "/images/figma/hero-presentation-box.png",
          "/images/figma/2fc8ae919de84fe5269092b52f019438e68ce3c8.png",
          "/images/peptech/pen.webp",
          "/images/peptech/cartridge.webp",
        ]
      : currentProduct.format === "refill-cartridge"
      ? [
          currentProduct.image || "/images/peptech/cartridge.webp",
          "/images/figma/0e71e8560b9bae80ee21a3d08905300075c266b7.png",
          "/images/peptech/cartridge.webp",
          "/images/figma/6ae689249c306b3f6b31d8744c7c961d01964ca0.png",
          "/images/peptech/back.webp",
        ]
      : [
          currentProduct.image || "/images/peptech/mockup2.webp",
          "/images/figma/2d7803f97be6d80d5630dfb42abba84289ed1bb5.png",
          "/images/figma/9eac22019fa5ef074776d7d27b3528efdcf1708e.png",
        ]

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
              {currentProduct.name.replace("\n", " ")}
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

          {/* Right: Buy Box */}
          <div className="w-full lg:w-[600px] shrink-0">
            <ProductFormatSwitcher
              currentFormat={currentProduct.format}
              penSet={penSetProduct || undefined}
              cartridge={cartridgeProduct || undefined}
              vial={vialProduct || undefined}
              onSelectFormat={handleSelectFormat}
              accentColor={currentProduct.accentColor}
            />

            {currentProduct.format === "freeze-dried-vial" ? (
              <VialBuyBox product={currentProduct} />
            ) : currentProduct.format === "refill-cartridge" ? (
              <ProductBuyBox
                product={currentProduct}
                title={currentProduct.name}
                subtitle={currentProduct.contents || ""}
                description={currentProduct.description || ""}
                price={currentProduct.price}
                subscribePrice={currentProduct.subscribePrice}
                tag="REFILL CARTRIDGE"
              />
            ) : (
              <ProductBuyBox
                product={currentProduct}
                title={currentProduct.name}
                subtitle={currentProduct.contents || ""}
                description={currentProduct.description || ""}
                price={currentProduct.price}
                subscribePrice={currentProduct.subscribePrice}
                tag="COMPLETE PEN SET"
              />
            )}
          </div>

        </div>
      </section>

      {/* Format-Specific Specifications & Cross-Link Sections */}
      <ProductTechnicalSpecs product={currentProduct} />

      {currentProduct.format === "complete-pen-set" && (
        <>
          <PeptechJourney />
          <RefillsSection excludeHandle={cartridgeProduct?.handle} products={allProducts} />
          <VialsSection excludeHandle={vialProduct?.handle} products={allProducts} />
        </>
      )}

      {currentProduct.format === "refill-cartridge" && (
        <>
          <CompleteSetsSection excludeHandle={penSetProduct?.handle} products={allProducts} />
          <VialsSection excludeHandle={vialProduct?.handle} products={allProducts} />
        </>
      )}

      {currentProduct.format === "freeze-dried-vial" && (
        <>
          <RefillsSection excludeHandle={cartridgeProduct?.handle} products={allProducts} />
          <CompleteSetsSection excludeHandle={penSetProduct?.handle} products={allProducts} />
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
