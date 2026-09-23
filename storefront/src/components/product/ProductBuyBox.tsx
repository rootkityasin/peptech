"use client"

import React, { useState, useEffect, useRef } from "react"
import { useCart } from "@/components/cart/CartContext"
import { CatalogProduct } from "@/data/catalog"

interface ProductBuyBoxProps {
  product?: CatalogProduct
  title?: string
  subtitle?: string
  description?: string
  price?: number
  subscribePrice?: number
  tag?: string
}

const CARTRIDGE_OPTIONS = [
  { id: "smg-5", name: "Semaglutide Cartridge (5mg) · Batch #SMG-2026-04A", badge: "INCLUDED", price: 69.99, subscribePrice: 62.99, handle: "semaglutide-5mg-cartridge" },
  { id: "trz-10", name: "Tirzepatide Cartridge (10mg) · Batch #TRZ-2026-08B", badge: "INCLUDED", price: 89.99, subscribePrice: 80.99, handle: "tirzepatide-10mg-cartridge" },
  { id: "rtt-10", name: "Retatrutide Cartridge (10mg) · Batch #RTT-2026-02C", badge: "INCLUDED", price: 99.99, subscribePrice: 89.99, handle: "retatrutide-10mg-cartridge" },
  { id: "bpc-10", name: "BPC-157 Cartridge (10mg) · Batch #BPC-2026-09A", badge: "INCLUDED", price: 74.99, subscribePrice: 67.49, handle: "bpc157-10mg-cartridge" },
  { id: "tb-10", name: "TB-500 Cartridge (10mg) · Batch #TB-2026-05A", badge: "INCLUDED", price: 79.99, subscribePrice: 71.99, handle: "tb500-10mg-cartridge" },
  { id: "nad-500", name: "NAD+ Cartridge (500mg) · Batch #NAD-2026-01D", badge: "INCLUDED", price: 84.99, subscribePrice: 76.49, handle: "nad-500mg-cartridge" },
]

export function ProductBuyBox({
  product,
  title = "Complete PEPTECH®\nPen Set",
  subtitle = "One system. Multiple possibilities.",
  description = "Get started with the complete PEPTECH® system. Includes reusable pen, a compatible prefilled cartridge, 14 instructions and all accessories you need for accurate, reliable testing.",
  price = 249.00,
  subscribePrice = 224.10,
  tag = "PEN SYSTEM",
}: ProductBuyBoxProps) {
  const { addItem, setIsDrawerOpen } = useCart()
  const [purchaseType, setPurchaseType] = useState<"one-time" | "subscription">("one-time")
  const [selectedCartridge, setSelectedCartridge] = useState(CARTRIDGE_OPTIONS[0])
  const [isCartridgeOpen, setIsCartridgeOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isRefill =
    product?.format === "refill-cartridge" ||
    tag === "REFILL CARTRIDGE" ||
    product?.handle?.includes("cartridge") ||
    (typeof title === "string" && title.toLowerCase().includes("cartridge"))

  // Click outside listener to smoothly close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCartridgeOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const lookupText = (product?.name || title || "").toLowerCase()
    const match = CARTRIDGE_OPTIONS.find((c) =>
      lookupText.includes(c.name.toLowerCase().split(" ")[0])
    )
    if (match) {
      setSelectedCartridge(match)
    }
  }, [product?.name, title])

  const currentOneTimePrice = isRefill
    ? (product?.price || price || selectedCartridge.price || 69.99)
    : (price || 195.00)

  const currentSubscribePrice = isRefill
    ? (product?.subscribePrice || subscribePrice || Number((currentOneTimePrice * 0.9).toFixed(2)))
    : (subscribePrice || 175.50)

  const totalPrice = purchaseType === "subscription" ? currentSubscribePrice : currentOneTimePrice

  // Determine title with balanced line break matching "Complete PEPTECH®\nPen Set"
  const rawTitle = title || (isRefill ? (product?.name || selectedCartridge.name.split("·")[0].trim()) : "Complete PEPTECH®\nPen Set")
  const displayTitle = rawTitle.includes("\n")
    ? rawTitle
    : rawTitle.includes("Refill")
    ? rawTitle.replace(/ (Refill|Cartridge|Refill Cartridge)$/i, "\n$1")
    : rawTitle

  const displaySubtitle = subtitle || (isRefill ? "Pre-filled 1.5 mL Cartridge • Fits PEPTECH® Precision Pen" : "One system. Multiple possibilities.")
  const displayDescription = description || (isRefill ? (product?.description || "Precision engineered pre-filled cartridge compatible with PEPTECH reusable precision pens.") : "Get started with the complete PEPTECH® system. Includes reusable pen, a compatible prefilled cartridge, 14 instructions and all accessories you need for accurate, reliable testing.")

  const handleAddToCart = () => {
    if (isRefill) {
      const prodTitle = product?.name || title || selectedCartridge.name.split("·")[0].trim()
      const cleanTitle = prodTitle.split("·")[0].trim()
      const batchNum = selectedCartridge.name.includes("Batch")
        ? selectedCartridge.name.split("Batch")[1]?.trim().replace(/^#/, "")
        : "CRT-2026-08B"

      addItem({
        id: product?.id ? `${product.id}-${purchaseType}` : `cartridge-${selectedCartridge.id}-${purchaseType}`,
        title: cleanTitle,
        format: "refill",
        strength: cleanTitle,
        price: totalPrice,
        isSubscription: purchaseType === "subscription",
        subscriptionIntervalDays: purchaseType === "subscription" ? 28 : undefined,
        discountPercent: purchaseType === "subscription" ? 10 : undefined,
        sku: `PEP-CRT-${(product?.id || selectedCartridge.id).toUpperCase().replace(/[^A-Z0-9]/g, "-")}`,
        batch: batchNum,
        image: product?.image || "/images/peptech/cartridge.webp",
        options: [
          {
            label: "Cartridge",
            value: cleanTitle,
          },
          {
            label: "Purchase Type",
            value: purchaseType === "subscription" ? "28-Day Subscription (10% off)" : "One-Time Purchase",
          },
        ],
      })
    } else {
      addItem({
        id: `complete-pen-set-${selectedCartridge.id}`,
        title: "Complete PEPTECH® Pen Set",
        format: "pen-set",
        strength: `${selectedCartridge.name.split("·")[0].trim()}`,
        price: totalPrice,
        isSubscription: purchaseType === "subscription",
        subscriptionIntervalDays: purchaseType === "subscription" ? 28 : undefined,
        discountPercent: purchaseType === "subscription" ? 10 : undefined,
        sku: `PPS-${selectedCartridge.id.toUpperCase()}`,
        batch: selectedCartridge.name.includes("Batch")
          ? selectedCartridge.name.split("Batch")[1]?.trim().replace(/^#/, "")
          : "PT-PS-001",
        image: "/images/figma/152e353c4afaa5945905ac686de871b57ec2a770.png",
        options: [
          {
            label: "Cartridge",
            value: selectedCartridge.name,
          },
        ],
      })
    }
    setIsDrawerOpen(true)
  }

  return (
    <div className="flex flex-col gap-[18px] items-start w-full max-w-[600px]">
      
      {/* Title & Review Rating Block - Figma Node 8:41097 */}
      <div className="flex flex-col gap-[6px] items-start w-full">
        <h1 className="font-bold text-[#0b1f3a] text-[30px] sm:text-[32px] leading-[36px] sm:leading-[38px] tracking-tight">
          {displayTitle.includes("\n") ? (
            displayTitle.split("\n").map((part, i) => (
              <React.Fragment key={i}>
                {part}
                {i < displayTitle.split("\n").length - 1 && <br />}
              </React.Fragment>
            ))
          ) : (
            displayTitle
          )}
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
        {displaySubtitle}
      </p>

      {/* Description */}
      <p className="font-normal text-[#475569] text-[13px] leading-[21px] max-w-[580px]">
        {displayDescription}
      </p>

      {/* Primary Price */}
      <div className="font-bold text-[#0b1f3a] text-[28px] tracking-tight">
        £{totalPrice.toFixed(2)}
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
            £{currentOneTimePrice.toFixed(2)}
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
            £{currentSubscribePrice.toFixed(2)}
          </span>
        </div>

      </div>

      {/* Product Dropdowns Container - Only shown for Complete Pen Set so customer can choose bundled cartridge */}
      {!isRefill && (
        <div className="flex flex-col gap-[14px] items-start w-full relative z-20">
          
          {/* Dropdown: Select Prefilled Cartridge */}
          <div ref={dropdownRef} className="flex flex-col gap-[6px] items-start w-full relative">
            <label className="font-semibold text-[#0a1f3b] text-[12px]">
              Select Prefilled Cartridge (Included with Pen Set)
            </label>
            <div
              onClick={() => setIsCartridgeOpen(!isCartridgeOpen)}
              className={`bg-white border-[1.5px] rounded-[8px] px-[16px] py-[11px] flex items-center justify-between w-full cursor-pointer transition-all duration-300 ${
                isCartridgeOpen
                  ? "border-[#16a6a3] shadow-xs ring-1 ring-[#16a6a3]/20"
                  : "border-[#e3e8f0] hover:border-slate-400"
              }`}
            >
              <span className="font-medium text-[#0a1f3b] text-[13px] truncate pr-2">
                {selectedCartridge.name}
              </span>
              <div className="flex gap-[10px] items-center shrink-0">
                <span className="bg-[#e6fffa] text-[#17a6a3] text-[10px] font-semibold px-[8px] py-[3px] rounded-[4px]">
                  {selectedCartridge.badge}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform duration-500 ease-in-out transform ${
                    isCartridgeOpen ? "rotate-180 text-[#16a6a3]" : "rotate-0 text-[#64748b]"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Cartridge Options Menu with smooth transition */}
            <div
              className={`absolute top-[68px] left-0 w-full bg-white border border-[#e2e8f0] rounded-[8px] shadow-xl z-30 py-1 divide-y divide-slate-100 transition-all duration-500 ease-in-out transform origin-top ${
                isCartridgeOpen
                  ? "opacity-100 scale-y-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
              }`}
            >
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
          </div>

        </div>
      )}

      {/* Cartridge Compatibility Badge & Reusable Pen Cross-Link */}
      {isRefill && (
        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] px-4 py-3 flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#16a6a3] animate-pulse" />
            <span className="text-[12.5px] text-[#0b1f3a] font-medium">
              Fits PEPTECH® Reusable Precision Pen System
            </span>
          </div>
          <a
            href="/products/complete-pen-set"
            className="text-[12px] font-semibold text-[#16a6a3] hover:text-[#0b1f3a] transition-colors hover:underline shrink-0 ml-2"
          >
            Need the pen? →
          </a>
        </div>
      )}

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
          <span className="font-normal text-[#64748b] text-[10px]">Orders over £100</span>
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
