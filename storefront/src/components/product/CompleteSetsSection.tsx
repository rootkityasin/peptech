"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/components/cart/CartContext"

const CORE_FEATURES = [
  {
    title: "Accurate Results",
    desc: "Professional precision",
    icon: "/images/figma/e64be28a18784ca8d2ba6e8e66907ba561fcb01c.svg",
  },
  {
    title: "Easy to Use",
    desc: "Simple setup",
    icon: "/images/figma/ffc7dd240eb4dce10948a3950e631406ffce5060.svg",
  },
  {
    title: "Reusable Design",
    desc: "Up to 2 years",
    icon: "/images/figma/f6d6196c0151d5b41eab63640c97bbd484ec530e.svg",
  },
  {
    title: "Lab Verified",
    desc: "99.8% Certified purity",
    icon: "/images/figma/8fb21197492107b68c5085ceacd58527740d74c5.svg",
  },
  {
    title: "Trusted Worldwide",
    desc: "Used in 50+ countries",
    icon: "/images/figma/c98fc6565b7dade125c6c2f0ce2a341a67591863.svg",
  },
  {
    title: "Discreet Delivery",
    desc: "1-2 day dispatch",
    icon: "/images/figma/386f8cc9901c91ee31e859666bf8f2ec18a098f0.svg",
  },
]

export function CompleteSetsSection() {
  const { addItem, setIsDrawerOpen } = useCart()

  const handleAddSet = () => {
    addItem({
      id: "complete-pen-set",
      title: "PEPTECH® Complete Pen Set",
      format: "pen-set",
      strength: "PEN SYSTEM",
      price: 249.00,
      isSubscription: false,
      sku: "PPS-1000",
      batch: "PT-PS-001",
    })
    setIsDrawerOpen(true)
  }

  return (
    <section className="bg-white py-[20px] pb-[60px] flex items-center justify-center border-t border-[#e2e8f0]">
      <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 flex flex-col gap-[24px]">
        
        {/* Header Row - Figma Node 8:41324 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-[4px]">
            <h2 className="font-bold text-[#0b1f3a] text-[22px] sm:text-[24px]">
              Complete Pen Sets
            </h2>
            <p className="font-normal text-[#64748b] text-[13px]">
              Everything you need to get started. Professional-grade. Trusted worldwide.
            </p>
          </div>
          <Link
            href="/products/complete-pen-set"
            className="flex items-center gap-[6px] text-[#0b1f3a] hover:text-[#16a6a3] transition-colors font-bold text-[13px] shrink-0"
          >
            <span>View All Pen Systems</span>
            <img src="/images/figma/59e312c7b3a78ddca79d47b884a0992dc4142203.svg" alt="" className="size-[16px]" />
          </Link>
        </div>

        {/* Content Row - Figma Node 8:41333 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left: Complete Pen Set Product Card (lg:col-span-4) - Figma Node 8:41334 */}
          <div className="lg:col-span-4 bg-white border border-[#e2e8f0] rounded-[12px] p-[16px] flex flex-col justify-between shadow-xs">
            
            {/* Top Box Image & Badge */}
            <div>
              <div className="bg-[#f8fafc] h-[200px] rounded-[8px] relative overflow-hidden flex items-center justify-center mb-3">
                <Image
                  src="/images/figma/2fc8ae919de84fe5269092b52f019438e68ce3c8.png"
                  alt="PEPTECH Complete Pen Set"
                  fill
                  className="object-contain p-2"
                />
                <div className="absolute top-[12px] right-[12px] bg-[#16a6a3] px-[10px] py-[4px] rounded-[4px]">
                  <span className="font-bold text-[10px] text-white uppercase tracking-wider">
                    MOST POPULAR
                  </span>
                </div>
              </div>

              {/* Title, Rating & Copy */}
              <div className="space-y-1.5">
                <h3 className="font-bold text-[#0b1f3a] text-[15px]">
                  PEPTECH® Complete Pen Set
                </h3>
                
                <div className="flex items-center gap-[6px]">
                  <div className="flex gap-[2px]">
                    {[...Array(5)].map((_, i) => (
                      <img
                        key={i}
                        src="/images/figma/5bd97b26a01958d8c69784c4a4ae764ab9860fb1.svg"
                        alt=""
                        className="size-[12px]"
                      />
                    ))}
                  </div>
                  <span className="font-medium text-[#475569] text-[12px]">
                    4.9 (284)
                  </span>
                </div>

                <p className="font-normal text-[#64748b] text-[12px] leading-[18px]">
                  Includes reusable pen, prefilled cartridge, all accessories and instructions.
                </p>
              </div>
            </div>

            {/* Price & Add to Cart */}
            <div className="pt-4 space-y-3">
              <div className="font-bold text-[#0b1f3a] text-[18px]">
                $249.00
              </div>
              <button
                type="button"
                onClick={handleAddSet}
                className="btn-shimmer btn-press bg-[#0b1f3a] hover:bg-[#162e52] cursor-pointer flex items-center justify-center gap-[8px] h-[42px] rounded-xl w-full text-white font-semibold text-[13px] transition-all shadow-xs hover:shadow-md group"
              >
                <img src="/images/figma/64d8de74a83e1fb14e8e8745813821f2e7537253.svg" alt="" className="size-[16px] transition-transform duration-200 group-hover:scale-110" />
                <span>Add to Cart</span>
              </button>
            </div>

          </div>

          {/* Middle: 3x2 Features Grid & Testimonial Card (lg:col-span-5) - Figma Node 8:41361 */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            
            {/* 3x2 Grid */}
            <div className="grid grid-cols-3 gap-3">
              {CORE_FEATURES.map((f) => (
                <div key={f.title} className="flex flex-col gap-[6px] items-center text-center p-2">
                  <div className="bg-[#e8f5fc] rounded-full size-[44px] flex items-center justify-center shrink-0">
                    <img src={f.icon} alt="" className="size-[22px]" />
                  </div>
                  <p className="font-bold text-[#0b1f3a] text-[13px] leading-tight">
                    {f.title}
                  </p>
                  <p className="font-normal text-[#64748b] text-[11px] leading-tight">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Testimonial Card */}
            <div className="bg-gradient-to-r from-[#f0f7fc] to-[rgba(227,242,250,0.7)] p-[20px] rounded-[14px] flex flex-col gap-[12px]">
              <p className="font-medium text-[#0b1f3a] text-[13px] leading-[20px]">
                &quot;Exceptional quality and easy to use. The complete set had everything I needed and the instructions were clear.&quot;
              </p>
              
              <div className="flex gap-[2px]">
                {[...Array(5)].map((_, i) => (
                  <img
                    key={i}
                    src="/images/figma/5bd97b26a01958d8c69784c4a4ae764ab9860fb1.svg"
                    alt=""
                    className="size-[12px]"
                  />
                ))}
              </div>

              <div className="flex items-center gap-[10px]">
                <div className="bg-[#0b1f3a] text-white font-bold text-[12px] size-[36px] rounded-full flex items-center justify-center shrink-0">
                  SM
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="font-bold text-[#0b1f3a] text-[12px]">Dr. Sarah M.</span>
                  <span className="font-normal text-[#64748b] text-[11px]">Research Laboratory</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right: One Pen Showcase Card (lg:col-span-3) - Figma Node 8:41429 */}
          <div className="lg:col-span-3 h-[420px] sm:h-[470px] rounded-[12px] overflow-hidden relative flex flex-col justify-end p-[24px] pb-[32px] text-center shadow-xs">
            <Image
              src="/images/figma/a899cee28c9a7dbe981b12963dd7556e80bb5a76.png"
              alt="One Pen Multiple Possibilities"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/40 to-transparent" />
            
            <div className="relative z-10 space-y-1">
              <h3 className="font-bold text-[#0b1f3a] text-[18px] leading-[24px]">
                One Pen.<br />Multiple Possibilities.
              </h3>
              <p className="font-normal text-[#64748b] text-[12px] leading-[18px]">
                Engineered for precision.<br />Designed for a healthier tomorrow.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
