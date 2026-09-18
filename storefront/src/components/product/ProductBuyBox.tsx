"use client"

import React, { useState } from "react"
import { useCart } from "@/components/cart/CartContext"

interface ProductBuyBoxProps {
  title?: string
  subtitle?: string
  description?: string
  price?: number
  subscribePrice?: number
  tag?: string
}

const CARTRIDGE_OPTIONS = [
  { id: "trz-10", name: "Tirzepatide Cartridge (10mg) · Batch #TRZ-2026-08B", badge: "INCLUDED", priceDelta: 0 },
  { id: "smg-5", name: "Semaglutide Cartridge (5mg) · Batch #SMG-2026-04A", badge: "INCLUDED", priceDelta: 0 },
  { id: "rtt-10", name: "Retatrutide Cartridge (10mg) · Batch #RTT-2026-02C", badge: "INCLUDED", priceDelta: 0 },
  { id: "bpc-10", name: "BPC-157 Cartridge (10mg) · Batch #BPC-2026-09A", badge: "INCLUDED", priceDelta: 0 },
]

const VIAL_OPTIONS = [
  { id: "bac-30", name: "Bacteriostatic Water USP (30ml Multi-Dose Vial)", badge: "+$18.00", priceDelta: 18.00 },
  { id: "sterile-10", name: "Sterile Water for Injection (10ml Ampoule)", badge: "+$12.00", priceDelta: 12.00 },
  { id: "none", name: "None (Pen & Cartridge Only)", badge: "$0.00", priceDelta: 0 },
]

export function ProductBuyBox({
  title = "Complete PEPTECH®\nPen Set",
  subtitle = "One system. Multiple possibilities.",
  description = "Get started with the complete PEPTECH® system. Includes reusable pen, a compatible prefilled cartridge, full instructions and all accessories you need for accurate, reliable testing.",
  price = 249.00,
  subscribePrice = 224.10,
  tag = "PEN SYSTEM",
}: ProductBuyBoxProps) {
  const { addItem, setIsDrawerOpen } = useCart()
  const [purchaseType, setPurchaseType] = useState<"one-time" | "subscription">("one-time")
  const [selectedCartridge, setSelectedCartridge] = useState(CARTRIDGE_OPTIONS[0])
  const [selectedVial, setSelectedVial] = useState(VIAL_OPTIONS[0])
  const [isCartridgeOpen, setIsCartridgeOpen] = useState(false)
  const [isVialOpen, setIsVialOpen] = useState(false)

  const basePrice = purchaseType === "subscription" ? subscribePrice : price
  const totalPrice = basePrice + selectedVial.priceDelta

  const handleAddToCart = () => {
    addItem({
      id: `complete-pen-set-${selectedCartridge.id}`,
      title: "Complete PEPTECH® Pen Set",
      format: "pen-set",
      strength: `${selectedCartridge.name.split("·")[0].trim()}`,
      price: totalPrice,
      isSubscription: purchaseType === "subscription",
      subscriptionIntervalDays: purchaseType === "subscription" ? 28 : undefined,
      discountPercent: purchaseType === "subscription" ? 10 : undefined,
      sku: "PPS-1000",
      batch: "PT-PS-001",
    })
    setIsDrawerOpen(true)
  }

  return (
    <div className="flex flex-col gap-[18px] items-start w-full max-w-[600px]">
      
      {/* Title & Review Rating Block - Figma Node 8:41097 */}
      <div className="flex flex-col gap-[6px] items-start w-full">
        <h1 className="font-bold text-[#0b1f3a] text-[30px] sm:text-[32px] leading-[36px] sm:leading-[38px] tracking-tight">
          Complete PEPTECH®<br />Pen Set
        </h1>
        
        <div className="flex gap-[8px] items-center pt-1">
          <div className="flex gap-[2px] items-center">
            {[...Array(5)].map((_, i) => (
              <img
                key={i}
                src="/images/figma/88eae9699ccc8253cd275735cdc60b0ad6111f88.svg"
                alt="Star"
                className="size-[14px]"
              />
            ))}
          </div>
          <span className="font-medium text-[#475569] text-[13px]">
            4.9 (284 reviews)
          </span>
        </div>
      </div>

      {/* Subtitle */}
      <p className="font-semibold text-[#0b1f3a] text-[16px]">
        {subtitle}
      </p>

      {/* Description */}
      <p className="font-normal text-[#475569] text-[13px] leading-[21px] max-w-[580px]">
        {description}
      </p>

      {/* Primary Price */}
      <div className="font-bold text-[#0b1f3a] text-[28px] tracking-tight">
        ${totalPrice.toFixed(2)}
      </div>

      {/* Purchase Options Box - Figma Node 8:41116 */}
      <div className="flex flex-col gap-[10px] items-start w-full">
        
        {/* Option 1: One-Time Purchase */}
        <div
          onClick={() => setPurchaseType("one-time")}
          className={`h-[52px] rounded-[8px] px-[18px] flex items-center justify-between w-full cursor-pointer transition-all ${
            purchaseType === "one-time"
              ? "bg-[#f8fafc] border-[1.5px] border-[#0b1f3a]"
              : "bg-white border border-[#e2e8f0] hover:border-slate-300"
          }`}
        >
          <div className="flex gap-[12px] items-center">
            <div className={`size-[18px] rounded-full border flex items-center justify-center ${
              purchaseType === "one-time"
                ? "border-[#0b1f3a] bg-white border-2"
                : "border-[#94a3b8] border-[1.5px]"
            }`}>
              {purchaseType === "one-time" && (
                <div className="size-[8px] rounded-full bg-[#0b1f3a]" />
              )}
            </div>
            <span className="font-semibold text-[#0b1f3a] text-[14px]">
              One-time purchase
            </span>
          </div>
          <span className="font-bold text-[#0b1f3a] text-[14px]">
            ${(price + selectedVial.priceDelta).toFixed(2)}
          </span>
        </div>

        {/* Option 2: Subscribe & Save 10% */}
        <div
          onClick={() => setPurchaseType("subscription")}
          className={`h-[60px] rounded-[8px] px-[18px] flex items-center justify-between w-full cursor-pointer transition-all ${
            purchaseType === "subscription"
              ? "bg-[#f8fafc] border-[1.5px] border-[#0b1f3a]"
              : "bg-white border border-[#e2e8f0] hover:border-slate-300"
          }`}
        >
          <div className="flex gap-[12px] items-center">
            <div className={`size-[18px] rounded-full border flex items-center justify-center ${
              purchaseType === "subscription"
                ? "border-[#0b1f3a] bg-white border-2"
                : "border-[#94a3b8] border-[1.5px]"
            }`}>
              {purchaseType === "subscription" && (
                <div className="size-[8px] rounded-full bg-[#0b1f3a]" />
              )}
            </div>
            <div className="flex flex-col gap-[2px] items-start">
              <div className="flex gap-[8px] items-center">
                <span className="font-semibold text-[#0b1f3a] text-[14px]">
                  Subscribe &amp; Save
                </span>
                <span className="bg-[#dcfce7] text-[#15803d] text-[11px] font-bold px-[6px] py-[2px] rounded-[4px]">
                  10%
                </span>
              </div>
              <span className="text-[#64748b] text-[12px]">
                Free shipping • Cancel anytime
              </span>
            </div>
          </div>
          <span className="font-bold text-[#0b1f3a] text-[14px]">
            ${(subscribePrice + selectedVial.priceDelta).toFixed(2)}
          </span>
        </div>

      </div>

      {/* Product Dropdowns Container - Figma Node 60:11970 */}
      <div className="flex flex-col gap-[14px] items-start w-full relative z-20">
        
        {/* Dropdown 1: Select Prefilled Cartridge */}
        <div className="flex flex-col gap-[6px] items-start w-full relative">
          <label className="font-semibold text-[#0a1f3b] text-[12px]">
            1. Select Prefilled Cartridge (28-Day Refill)
          </label>
          <div
            onClick={() => {
              setIsCartridgeOpen(!isCartridgeOpen)
              setIsVialOpen(false)
            }}
            className="bg-white border-[#e3e8f0] border-[1.5px] rounded-[8px] px-[16px] py-[11px] flex items-center justify-between w-full cursor-pointer hover:border-slate-400 transition-colors"
          >
            <span className="font-medium text-[#0a1f3b] text-[13px] truncate pr-2">
              {selectedCartridge.name}
            </span>
            <div className="flex gap-[10px] items-center shrink-0">
              <span className="bg-[#e6fffa] text-[#17a6a3] text-[10px] font-semibold px-[8px] py-[3px] rounded-[4px]">
                {selectedCartridge.badge}
              </span>
              <img
                src="/images/figma/c0856f3300fb92c49494e087adbcfe6165132c56.svg"
                alt=""
                className={`size-[16px] transition-transform ${isCartridgeOpen ? "rotate-180" : ""}`}
              />
            </div>
          </div>

          {/* Cartridge Options Menu */}
          {isCartridgeOpen && (
            <div className="absolute top-[68px] left-0 w-full bg-white border border-[#e2e8f0] rounded-[8px] shadow-lg z-30 py-1 divide-y divide-slate-100">
              {CARTRIDGE_OPTIONS.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedCartridge(c)
                    setIsCartridgeOpen(false)
                  }}
                  className={`px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors ${
                    selectedCartridge.id === c.id ? "bg-cyan-50/50" : ""
                  }`}
                >
                  <span className="text-[13px] font-medium text-[#0b1f3a]">{c.name}</span>
                  <span className="bg-[#e6fffa] text-[#17a6a3] text-[10px] font-semibold px-[6px] py-[2px] rounded">
                    {c.badge}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dropdown 2: Select Freeze-Dried Vial */}
        <div className="flex flex-col gap-[6px] items-start w-full relative">
          <label className="font-semibold text-[#0a1f3b] text-[12px]">
            2. Select Freeze-Dried Vial / Reconstitution Diluent
          </label>
          <div
            onClick={() => {
              setIsVialOpen(!isVialOpen)
              setIsCartridgeOpen(false)
            }}
            className="bg-white border-[#e3e8f0] border-[1.5px] rounded-[8px] px-[16px] py-[11px] flex items-center justify-between w-full cursor-pointer hover:border-slate-400 transition-colors"
          >
            <span className="font-medium text-[#0a1f3b] text-[13px] truncate pr-2">
              {selectedVial.name}
            </span>
            <div className="flex gap-[10px] items-center shrink-0">
              <span className="bg-[#f0f5fa] text-[#475469] text-[10px] font-semibold px-[8px] py-[3px] rounded-[4px]">
                {selectedVial.badge}
              </span>
              <img
                src="/images/figma/c0856f3300fb92c49494e087adbcfe6165132c56.svg"
                alt=""
                className={`size-[16px] transition-transform ${isVialOpen ? "rotate-180" : ""}`}
              />
            </div>
          </div>

          {/* Vial Options Menu */}
          {isVialOpen && (
            <div className="absolute top-[68px] left-0 w-full bg-white border border-[#e2e8f0] rounded-[8px] shadow-lg z-30 py-1 divide-y divide-slate-100">
              {VIAL_OPTIONS.map((v) => (
                <div
                  key={v.id}
                  onClick={() => {
                    setSelectedVial(v)
                    setIsVialOpen(false)
                  }}
                  className={`px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors ${
                    selectedVial.id === v.id ? "bg-slate-50" : ""
                  }`}
                >
                  <span className="text-[13px] font-medium text-[#0b1f3a]">{v.name}</span>
                  <span className="bg-[#f0f5fa] text-[#475469] text-[10px] font-semibold px-[6px] py-[2px] rounded">
                    {v.badge}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Add to Cart Main Button - Figma Node 8:41133 */}
      <button
        type="button"
        onClick={handleAddToCart}
        className="btn-shimmer btn-press bg-[#0b1f3a] hover:bg-[#162e52] cursor-pointer flex gap-[10px] h-[50px] items-center justify-center rounded-xl w-full transition-all text-white font-semibold text-[15px] shadow-md hover:shadow-xl group"
      >
        <img src="/images/figma/64d8de74a83e1fb14e8e8745813821f2e7537253.svg" alt="" className="size-[18px] transition-transform duration-200 group-hover:scale-110" />
        <span>Add to Cart</span>
      </button>

      {/* Stock Notice - Figma Node 8:41139 */}
      <div className="flex gap-[8px] items-center">
        <div className="size-[8px] rounded-full bg-[#10b981]" />
        <span className="font-medium text-[#0b1f3a] text-[13px]">
          In Stock — Ships within 1-2 business days
        </span>
      </div>

      {/* Micro Value Props - Figma Node 8:41142 */}
      <div className="border-t border-[#f1f5f9] flex items-start justify-between pt-[14px] w-full">
        
        <div className="flex flex-col gap-[4px] items-center text-center w-[135px]">
          <img src="/images/figma/4390b9070d822ecd5eca4fa40b80170724518a5e.svg" alt="" className="size-[20px]" />
          <span className="font-bold text-[#0b1f3a] text-[12px]">Free Shipping</span>
          <span className="font-normal text-[#64748b] text-[10px]">Orders over $200</span>
        </div>

        <div className="flex flex-col gap-[4px] items-center text-center w-[135px]">
          <img src="/images/figma/416aaa518d7e3b2366ccb720558673a93ab6bde4.svg" alt="" className="size-[20px]" />
          <span className="font-bold text-[#0b1f3a] text-[12px]">Secure Checkout</span>
          <span className="font-normal text-[#64748b] text-[10px]">256-bit encryption</span>
        </div>

        <div className="flex flex-col gap-[4px] items-center text-center w-[135px]">
          <img src="/images/figma/5a5cf195bb5ca3a772d64cd94711197cd2748bd6.svg" alt="" className="size-[20px]" />
          <span className="font-bold text-[#0b1f3a] text-[12px]">30-Day Returns</span>
          <span className="font-normal text-[#64748b] text-[10px]">Hassle-free</span>
        </div>

        <div className="flex flex-col gap-[4px] items-center text-center w-[135px]">
          <img src="/images/figma/62bff5b65f283bcf5397c72f82c6a2b3ed8693c2.svg" alt="" className="size-[20px]" />
          <span className="font-bold text-[#0b1f3a] text-[12px]">Dedicated Support</span>
          <span className="font-normal text-[#64748b] text-[10px]">Here when you need us</span>
        </div>

      </div>

    </div>
  )
}
