"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"

import { CatalogProduct } from "@/data/catalog"
import { useLiveProducts } from "@/hooks/useLiveProducts"
import { orderSuggestionsForProduct } from "@/lib/medusa"

interface VialsSectionProps {
  currentProduct?: CatalogProduct | null
  excludeHandle?: string
  products?: CatalogProduct[]
}

export function VialsSection({
  currentProduct,
  excludeHandle,
  products: propProducts,
}: VialsSectionProps = {}) {
  const { products: liveProducts } = useLiveProducts(propProducts || [])
  const products = propProducts && propProducts.length > 0 ? propProducts : liveProducts
  const displayVials = orderSuggestionsForProduct(
    products,
    "freeze-dried-vial",
    currentProduct,
    excludeHandle
  ).slice(0, 4)

  return (
    <section className="bg-white py-[20px] pb-[60px] flex items-center justify-center border-t border-[#e2e8f0]">
      <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 flex flex-col gap-[24px]">
        
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-[4px]">
            <h2 className="font-bold text-[#0b1f3a] text-[22px] sm:text-[24px]">
              Freeze-Dried Vials
            </h2>
            <p className="font-normal text-[#64748b] text-[13px]">
              Laboratory research vials with third-party testing reports. Reconstitution diluent available separately.
            </p>
          </div>
          <Link
            href="/vials"
            className="flex items-center gap-[6px] text-[#0b1f3a] hover:text-[#16a6a3] transition-colors font-bold text-[13px] shrink-0"
          >
            <span>View All Vials</span>
            <img src="/images/figma/59e312c7b3a78ddca79d47b884a0992dc4142203.svg" alt="" className="size-[16px]" />
          </Link>
        </div>

        {/* Products Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Left Feature Box */}
          <div className="lg:col-span-3 bg-[#f0f6fa] rounded-[14px] p-5 sm:p-6 flex flex-col justify-between shadow-xs lg:min-h-[380px] h-full">
            <div className="flex flex-col h-full justify-between">
              <div>
                <span className="text-[10.5px] font-bold text-[#16a6a3] tracking-[1.2px] uppercase">
                  LABORATORY REAGENTS
                </span>
                <h3 className="font-extrabold text-[#0b1f3a] text-[18px] sm:text-[20px] leading-[24px] mt-1 mb-2">
                  Freeze-Dried<br className="hidden lg:inline" /> Vials
                </h3>
                
                {/* Large Prominent Image Showcase */}
                <div className="w-full h-[180px] sm:h-[200px] relative my-2 flex items-center justify-center">
                  <Image
                    src={displayVials[0]?.image || "/images/products/vials/pt-141.png"}
                    alt="PEPTECH Freeze-Dried Vial"
                    fill
                    sizes="(max-width: 1024px) 100vw, 280px"
                    className="object-contain"
                  />
                </div>

                {/* Features List */}
                <div className="flex flex-col gap-2.5 text-[12px] text-[#475469] mt-3">
                  <div className="flex items-start gap-2">
                    <span className="text-[#16a6a3] font-bold shrink-0">✓</span>
                    <span className="leading-snug">High purity research grade</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#16a6a3] font-bold shrink-0">✓</span>
                    <span className="leading-snug">Third-party tested &amp; verified</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#16a6a3] font-bold shrink-0">✓</span>
                    <span className="leading-snug">28-Day subscription available</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#16a6a3] font-bold shrink-0">✓</span>
                    <span className="leading-snug">Discreet protective packaging</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#dce8f2]">
                <Link
                  href="/vials"
                  className="text-[12.5px] font-bold text-[#0b1f3a] hover:text-[#16a6a3] transition-colors inline-flex items-center gap-1.5 group"
                >
                  <span>Shop All Vials</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right 4 Vials */}
          <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
            {displayVials.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#e2e8f0] rounded-[14px] overflow-hidden flex flex-col justify-between h-full hover:shadow-md transition-shadow text-center group shadow-xs"
              >
                <Link href={`/products/${item.handle}`} className="block w-full">
                  {/* Vial Photo - Edge to Edge at Top, Left, and Right */}
                  <div className="h-[200px] sm:h-[220px] w-full relative overflow-hidden bg-white flex items-center justify-center shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 240px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>

                {/* Content Block */}
                <div className="p-3.5 sm:p-4 pt-3 flex flex-col justify-between grow">
                  <div className="space-y-1">
                    <Link href={`/products/${item.handle}`}>
                      <h4 className="font-bold text-[#0b1f3a] text-[13px] sm:text-[14px] group-hover:text-[#16a6a3] transition-colors line-clamp-2 min-h-[38px] flex items-center justify-center">
                        {item.name}
                      </h4>
                    </Link>
                    <p className="font-medium text-[#16a6a3] text-[11px] truncate">
                      {item.contents || "Lyophilised Research Powder"}
                    </p>
                    <div className="pt-1.5 flex flex-col items-center gap-1">
                      <span className="font-extrabold text-[#0b1f3a] text-[16px] tracking-tight">
                        £{item.price.toFixed(2)}
                      </span>
                      <div className="flex items-center justify-center gap-1 text-[11px]">
                        <span className="text-[#64748b] text-[10px]">Sub &amp; Save</span>
                        <span className="font-bold text-[#0d7b78] bg-[#e6fffa] px-1.5 py-0.5 rounded text-[10px] border border-[#16a6a3]/20">
                          £{(item.subscribePrice || item.price * 0.9).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: View Details */}
                  <div className="mt-3.5 pt-3 border-t border-[#f1f5f9]">
                    <Link
                      href={`/products/${item.handle}`}
                      className="btn-shimmer btn-press w-full bg-[#0b1f3a] hover:bg-[#162e52] text-white flex items-center justify-center h-[38px] rounded-xl text-[12.5px] font-semibold transition-all shadow-xs group-hover:shadow-md"
                    >
                      <span>Details</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>        </div>

      </div>
    </section>
  )
}
