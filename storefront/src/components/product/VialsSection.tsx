"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/components/cart/CartContext"

const FIGMA_VIALS = [
  {
    id: "vial-retatrutide-10",
    name: "Retatrutide",
    spec: "Research Grade • 10mg",
    price: 39.00,
    subPrice: 35.10,
    image: "/images/figma/138573664d114462601fdac5ccec165f33058ecc.png",
  },
  {
    id: "vial-tirzepatide-15",
    name: "Tirzepatide",
    spec: "Research Grade • 15mg",
    price: 39.00,
    subPrice: 35.10,
    image: "/images/figma/138573664d114462601fdac5ccec165f33058ecc.png",
  },
  {
    id: "vial-semaglutide-10",
    name: "Semaglutide",
    spec: "Research Grade • 10mg",
    price: 39.00,
    subPrice: 35.10,
    image: "/images/figma/138573664d114462601fdac5ccec165f33058ecc.png",
  },
  {
    id: "vial-bpc157-10",
    name: "BPC-157",
    spec: "Research Grade • 10mg",
    price: 39.00,
    subPrice: 35.10,
    image: "/images/figma/138573664d114462601fdac5ccec165f33058ecc.png",
  },
]

export function VialsSection() {
  const { addItem, setIsDrawerOpen } = useCart()

  const handleAddVial = (item: typeof FIGMA_VIALS[0]) => {
    addItem({
      id: item.id,
      title: `${item.name} (${item.spec})`,
      format: "vial",
      strength: item.spec,
      price: item.price,
      isSubscription: false,
      sku: `PEP-VIAL-${item.name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}`,
      batch: "VIAL-2026-B1",
    })
    setIsDrawerOpen(true)
  }

  return (
    <section className="bg-white py-[20px] pb-[60px] flex items-center justify-center border-t border-[#e2e8f0]">
      <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 flex flex-col gap-[24px]">
        
        {/* Header Row - Figma Node 8:41539 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-[4px]">
            <h2 className="font-bold text-[#0b1f3a] text-[22px] sm:text-[24px]">
              Freeze-Dried Vials
            </h2>
            <p className="font-normal text-[#64748b] text-[13px]">
              For laboratory and professional applications. High purity guaranteed.
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

        {/* Products Row - Figma Node 8:41548 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Left Feature Box (lg:col-span-3) - Figma Node 8:41549 */}
          <div className="lg:col-span-3 bg-[#f0f6fa] rounded-[12px] p-[20px] sm:p-[24px] flex flex-col justify-between h-[380px] shadow-xs">
            <div className="flex items-start gap-4 h-full">
              <div className="w-[88px] h-full relative shrink-0">
                <Image
                  src="/images/figma/9eac22019fa5ef074776d7d27b3528efdcf1708e.png"
                  alt="PEPTECH Freeze-Dried Vials"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col justify-between h-full py-2">
                <div>
                  <h3 className="font-bold text-[#0b1f3a] text-[16px] leading-[22px]">
                    PEPTECH®<br />Freeze-Dried Vials
                  </h3>
                  
                  <div className="flex flex-col gap-[8px] pt-3 text-[11px] text-[#475469]">
                    <div className="flex items-start gap-2">
                      <span className="text-[#16a6a3] font-bold">✓</span>
                      <span>Multiple strengths available</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#16a6a3] font-bold">✓</span>
                      <span>Long shelf life</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#16a6a3] font-bold">✓</span>
                      <span>Laboratory tested</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#16a6a3] font-bold">✓</span>
                      <span>Secure, batch-tracked</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#16a6a3] font-bold">✓</span>
                      <span>For research &amp; professional use</span>
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

          {/* Right 4 Vials (lg:col-span-9) */}
          <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {FIGMA_VIALS.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#e2e8f0] rounded-[12px] p-[16px] flex flex-col justify-between h-[380px] hover:shadow-md transition-shadow text-center"
              >
                <div>
                  {/* Vial Photo */}
                  <div className="h-[160px] w-full relative mb-3 flex items-center justify-center">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-2 hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Info */}
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-[#0b1f3a] text-[15px]">
                      {item.name}
                    </h4>
                    <p className="font-normal text-[#64748b] text-[11px]">
                      {item.spec}
                    </p>
                    <p className="font-bold text-[#0b1f3a] text-[15px] pt-1">
                      ${item.price.toFixed(2)}
                    </p>
                    <div className="flex items-center justify-center gap-1 text-[11px]">
                      <span className="text-[#64748b]">Subscribe &amp; Save 10%</span>
                      <span className="font-bold text-[#0b1f3a]">${item.subPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  type="button"
                  onClick={() => handleAddVial(item)}
                  className="btn-shimmer btn-press bg-[#0b1f3a] hover:bg-[#162e52] cursor-pointer flex items-center justify-center gap-[6px] h-[38px] rounded-lg w-full text-white font-semibold text-[12px] transition-all shadow-2xs hover:shadow-md mt-3 group"
                >
                  <img src="/images/figma/64d8de74a83e1fb14e8e8745813821f2e7537253.svg" alt="" className="size-[14px] transition-transform duration-200 group-hover:scale-110" />
                  <span>Add to Cart</span>
                </button>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  )
}
