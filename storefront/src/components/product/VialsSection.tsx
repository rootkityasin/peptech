"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"

import { CatalogProduct } from "@/data/catalog"
import { useLiveProducts } from "@/hooks/useLiveProducts"

interface VialsSectionProps {
  excludeHandle?: string
  products?: CatalogProduct[]
}

export function VialsSection({ excludeHandle, products: propProducts }: VialsSectionProps = {}) {
  const { products: liveProducts } = useLiveProducts(propProducts || [])
  const products = propProducts && propProducts.length > 0 ? propProducts : liveProducts
  const displayVials = products.filter(
    (p) => p.format === "freeze-dried-vial" && (!excludeHandle || p.handle !== excludeHandle)
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
          <div className="lg:col-span-3 bg-[#f0f6fa] rounded-[12px] p-[20px] sm:p-[24px] flex flex-col justify-between min-h-[360px] h-full shadow-xs">
            <div className="flex items-start gap-4 h-full">
              <div className="w-[88px] h-[300px] min-h-[300px] relative shrink-0">
                <Image
                  src={displayVials[0]?.image || "/images/products/vials/pt-141.png"}
                  alt="PEPTECH Freeze-Dried Vial"
                  fill
                  sizes="88px"
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col justify-between h-full py-2">
                <div>
                  <h3 className="font-bold text-[#0b1f3a] text-[16px] leading-[22px]">
                    Freeze-Dried<br />Vials
                  </h3>
                  
                  <div className="flex flex-col gap-[10px] pt-4 text-[11px] text-[#475469]">
                    <div className="flex items-start gap-2">
                      <span className="text-[#16a6a3] font-bold">✓</span>
                      <span>High purity research grade</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#16a6a3] font-bold">✓</span>
                      <span>Third-party tested &amp; verified</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#16a6a3] font-bold">✓</span>
                      <span>28-Day subscription available</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#16a6a3] font-bold">✓</span>
                      <span>Discreet protective packaging</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/vials"
                  className="text-[12px] font-bold text-[#0b1f3a] hover:text-[#16a6a3] transition-colors"
                >
                  Shop All Vials →
                </Link>
              </div>
            </div>
          </div>

          {/* Right 4 Vials */}
          <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
            {displayVials.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#e2e8f0] rounded-[12px] p-3 sm:p-[16px] flex flex-col justify-between h-full min-h-[360px] sm:min-h-[380px] hover:shadow-md transition-shadow text-center group"
              >
                <Link href={`/products/${item.handle}`} className="block flex-1 flex flex-col">
                  {/* Vial Photo */}
                  <div className="h-[145px] sm:h-[160px] min-h-[145px] w-full relative mb-2.5 bg-[#f8fafc] rounded-lg group-hover:bg-slate-100 transition-colors flex items-center justify-center shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 220px"
                      className="object-contain p-2 group-hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Info */}
                  <div className="space-y-0.5 grow flex flex-col justify-center">
                    <h4 className="font-bold text-[#0b1f3a] text-[13px] sm:text-[14px] group-hover:text-[#16a6a3] transition-colors line-clamp-2 min-h-[36px] sm:min-h-[40px] flex items-center justify-center">
                      {item.name}
                    </h4>
                    <p className="font-medium text-[#16a6a3] text-[11px] truncate">
                      {item.contents || "Lyophilised Research Powder"}
                    </p>
                    <p className="font-bold text-[#0b1f3a] text-[14px] sm:text-[15px] pt-0.5">
                      £{item.price.toFixed(2)}
                    </p>
                    <div className="flex items-center justify-center gap-1 text-[11px] pt-0.5">
                      <span className="text-[#64748b] text-[10.5px]">Sub &amp; Save</span>
                      <span className="font-bold text-[#0d7b78] bg-[#e6fffa] px-1 py-0.5 rounded text-[10px]">
                        £{(item.subscribePrice || item.price * 0.9).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Actions: View Details */}
                <div className="mt-auto pt-2 border-t border-slate-100">
                  <Link
                    href={`/products/${item.handle}`}
                    className="btn-shimmer btn-press w-full bg-[#0b1f3a] hover:bg-[#16a6a3] text-white flex items-center justify-center py-2 rounded-lg text-[12px] font-semibold transition-all shadow-xs"
                  >
                    <span>Details</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  )
}
