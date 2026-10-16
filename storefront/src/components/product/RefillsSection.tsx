"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/components/cart/CartContext"

import { CatalogProduct } from "@/data/catalog"
import { useLiveProducts } from "@/hooks/useLiveProducts"

interface RefillsSectionProps {
  excludeHandle?: string
  products?: CatalogProduct[]
}

export function RefillsSection({ excludeHandle, products: propProducts }: RefillsSectionProps = {}) {
  const { autoSavings } = useCart()
  const { products: liveProducts } = useLiveProducts(propProducts || [])
  const products = propProducts && propProducts.length > 0 ? propProducts : liveProducts
  const displayRefills = products.filter(
    (p) => p.format === "refill-cartridge" && (!excludeHandle || p.handle !== excludeHandle)
  ).slice(0, 4)

  return (
    <section className="bg-white py-[20px] pb-[60px] flex items-center justify-center border-t border-[#e2e8f0]">
      <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 flex flex-col gap-[24px]">
        
        {/* Header Row - Figma Node 8:41434 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-[4px]">
            <h2 className="font-bold text-[#0b1f3a] text-[22px] sm:text-[24px]">
              Refill Cartridges
            </h2>
            <p className="font-normal text-[#64748b] text-[13px]">
              For existing PEPTECH® customers. Direct replacement cartridges with 28-day subscription options.
            </p>
          </div>
          <Link
            href="/refills"
            className="flex items-center gap-[6px] text-[#0b1f3a] hover:text-[#16a6a3] transition-colors font-bold text-[13px] shrink-0"
          >
            <span>View All Cartridges</span>
            <img src="/images/figma/59e312c7b3a78ddca79d47b884a0992dc4142203.svg" alt="" className="size-[16px]" />
          </Link>
        </div>

        {/* Products Row - Figma Node 8:41443 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Left Feature Box (lg:col-span-3) - Figma Node 8:41444 */}
          <div className="lg:col-span-3 bg-[#f0f6fa] rounded-[12px] p-[20px] sm:p-[24px] flex flex-col justify-between min-h-[360px] h-full shadow-xs">
            <div className="flex items-start gap-4 h-full">
              <div className="w-[88px] h-[300px] min-h-[300px] relative shrink-0">
                <Image
                  src={displayRefills[0]?.image || "/images/products/refills/pt-141.png"}
                  alt="PEPTECH Refill Cartridge"
                  fill
                  sizes="88px"
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col justify-between h-full py-2">
                <div>
                  <h3 className="font-bold text-[#0b1f3a] text-[16px] leading-[22px]">
                    PEPTECH®<br />Refill Cartridge
                  </h3>
                  
                  <div className="flex flex-col gap-[10px] pt-4 text-[11px] text-[#475469]">
                    <div className="flex items-start gap-2">
                      <span className="text-[#16a6a3] font-bold">✓</span>
                      <span>Compatible with PEPTECH® pen</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#16a6a3] font-bold">✓</span>
                      <span>Multiple strengths available</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#16a6a3] font-bold">✓</span>
                      <span>Save with subscription</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#16a6a3] font-bold">✓</span>
                      <span>Same high quality standards</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/refills"
                  className="text-[12px] font-bold text-[#0b1f3a] hover:text-[#16a6a3] transition-colors"
                >
                  Shop All Refills →
                </Link>
              </div>
            </div>
          </div>

          {/* Right 4 Cartridges (lg:col-span-9) */}
          <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
            {displayRefills.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#e2e8f0] rounded-[12px] p-3 sm:p-[16px] flex flex-col justify-between h-full min-h-[360px] sm:min-h-[380px] hover:shadow-md transition-shadow text-center group"
              >
                <Link href={`/products/${item.handle}`} className="block flex-1 flex flex-col">
                  {/* Cartridge Photo */}
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
                      {item.contents || "1.5 mL Refill Cartridge"}
                    </p>
                    <p className="font-bold text-[#0b1f3a] text-[14px] sm:text-[15px] pt-0.5">
                      £{item.price.toFixed(2)}
                    </p>
                    <div className="flex items-center justify-center gap-1 text-[11px] pt-0.5">
                      <span className="text-[#64748b] text-[10.5px]">Sub &amp; Save</span>
                      <span className="font-bold text-[#0d7b78] bg-[#e6fffa] px-1 py-0.5 rounded text-[10px]">
                        £{(autoSavings.discountType === "percentage"
                          ? Number((item.price * (1 - autoSavings.discountValue / 100)).toFixed(2))
                          : Math.max(0, Number((item.price - autoSavings.discountValue).toFixed(2)))
                        ).toFixed(2)}
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

        {/* Subscription Callout Banner - Figma Node 8:41531 */}
        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] h-[48px] w-full flex items-center justify-center gap-[10px] px-4">
          <img src="/images/figma/5a5cf195bb5ca3a772d64cd94711197cd2748bd6.svg" alt="" className="size-[18px]" />
          <p className="font-medium text-[#0b1f3a] text-[13px] text-center">
            Flexible subscriptions — pause, skip or cancel anytime. {autoSavings.saveText} on every order.
          </p>
        </div>

      </div>
    </section>
  )
}
