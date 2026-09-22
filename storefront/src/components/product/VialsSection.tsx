"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/components/cart/CartContext"

const FIGMA_VIALS = [
  {
    id: "vial-retatrutide-10mg",
    name: "Retatrutide 10mg",
    handle: "vial-retatrutide-10mg",
    spec: "Research Grade • 10mg Lyophilised",
    price: 69.99,
    subPrice: 62.99,
    image: "/images/figma/2d7803f97be6d80d5630dfb42abba84289ed1bb5.png",
  },
  {
    id: "vial-tirzepatide-15mg",
    name: "Tirzepatide 15mg",
    handle: "vial-tirzepatide-15mg",
    spec: "Research Grade • 15mg Lyophilised",
    price: 79.99,
    subPrice: 71.99,
    image: "/images/figma/2d7803f97be6d80d5630dfb42abba84289ed1bb5.png",
  },
  {
    id: "vial-semaglutide-10mg",
    name: "Semaglutide 10mg",
    handle: "vial-semaglutide-10mg",
    spec: "Research Grade • 10mg Lyophilised",
    price: 59.99,
    subPrice: 53.99,
    image: "/images/figma/2d7803f97be6d80d5630dfb42abba84289ed1bb5.png",
  },
  {
    id: "vial-bpc157-10mg",
    name: "BPC-157 10mg",
    handle: "vial-bpc157-10mg",
    spec: "Research Grade • 10mg Lyophilised",
    price: 39.99,
    subPrice: 35.99,
    image: "/images/figma/2d7803f97be6d80d5630dfb42abba84289ed1bb5.png",
  },
]

export function VialsSection() {
  const { addItem, setIsDrawerOpen } = useCart()

  const handleAddVial = (item: typeof FIGMA_VIALS[0]) => {
    addItem({
      id: item.id,
      title: `${item.name} Lyophilised Vial`,
      format: "vial",
      strength: item.spec,
      price: item.subPrice,
      isSubscription: true,
      subscriptionIntervalDays: 28,
      discountPercent: 10,
      sku: `PEP-VIAL-${item.id.replace("vial-", "").toUpperCase()}`,
      batch: "VIAL-2026-B1",
      image: item.image,
    })
    setIsDrawerOpen(true)
  }

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
          <div className="lg:col-span-3 bg-[#f0f6fa] rounded-[12px] p-[20px] sm:p-[24px] flex flex-col justify-between h-[380px] shadow-xs">
            <div className="flex items-start gap-4 h-full">
              <div className="w-[88px] h-full relative shrink-0">
                <Image
                  src="/images/figma/2d7803f97be6d80d5630dfb42abba84289ed1bb5.png"
                  alt="PEPTECH Freeze-Dried Vial"
                  fill
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
          <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {FIGMA_VIALS.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#e2e8f0] rounded-[12px] p-[16px] flex flex-col justify-between h-[390px] hover:shadow-md transition-shadow text-center group"
              >
                <Link href={`/products/${item.handle}`} className="block flex-1">
                  {/* Vial Photo */}
                  <div className="h-[160px] w-full relative mb-3 bg-[#f8fafc] rounded-lg group-hover:bg-slate-100 transition-colors">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-2 group-hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Info */}
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-[#0b1f3a] text-[15px] group-hover:text-[#16a6a3] transition-colors">
                      {item.name}
                    </h4>
                    <p className="font-normal text-[#64748b] text-[11px]">
                      {item.spec}
                    </p>
                    <p className="font-bold text-[#0b1f3a] text-[15px] pt-1">
                      £{item.price.toFixed(2)}
                    </p>
                    <div className="flex items-center justify-center gap-1 text-[11px]">
                      <span className="text-[#64748b]">Subscribe &amp; Save</span>
                      <span className="font-bold text-[#0d7b78] bg-[#e6fffa] px-1 py-0.5 rounded text-[10px]">£{item.subPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </Link>

                {/* Actions: View Details & Quick Add */}
                <div className="flex items-center gap-2 mt-3 pt-1 border-t border-slate-100">
                  <Link
                    href={`/products/${item.handle}`}
                    className="btn-shimmer btn-press flex-1 bg-[#0b1f3a] hover:bg-[#16a6a3] text-white flex items-center justify-center py-2 rounded-lg text-[12px] font-semibold transition-all"
                  >
                    <span>Details</span>
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleAddVial(item)
                    }}
                    title="Quick Add to Cart"
                    aria-label={`Quick Add ${item.name} to Cart`}
                    className="group size-[34px] rounded-lg border border-[#cbd5e1] hover:border-[#0b1f3a] hover:bg-slate-50 flex items-center justify-center shrink-0 transition-colors cursor-pointer text-[#0b1f3a]"
                  >
                    <svg
                      className="size-[15px] text-[#0b1f3a] group-hover:text-[#16a6a3] group-hover:scale-110 transition-all"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M6 14.6667C6.36819 14.6667 6.66667 14.3682 6.66667 14C6.66667 13.6318 6.36819 13.3333 6 13.3333C5.63181 13.3333 5.33333 13.6318 5.33333 14C5.33333 14.3682 5.63181 14.6667 6 14.6667Z"
                        stroke="currentColor"
                        strokeWidth="1.33333"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M13.3333 14.6667C13.7015 14.6667 14 14.3682 14 14C14 13.6318 13.7015 13.3333 13.3333 13.3333C12.9651 13.3333 12.6667 13.6318 12.6667 14C12.6667 14.3682 12.9651 14.6667 13.3333 14.6667Z"
                        stroke="currentColor"
                        strokeWidth="1.33333"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M0.666666 0.666666H3.33333L5.12 9.59333C5.18096 9.90026 5.34794 10.176 5.5917 10.3722C5.83546 10.5684 6.14047 10.6727 6.45333 10.6667H12.9333C13.2462 10.6727 13.5512 10.5684 13.795 10.3722C14.0387 10.176 14.2057 9.90026 14.2667 9.59333L15.3333 4H4"
                        stroke="currentColor"
                        strokeWidth="1.33333"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  )
}
