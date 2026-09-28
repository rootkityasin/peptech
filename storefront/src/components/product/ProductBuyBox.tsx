"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import Link from "next/link"
import { useCart } from "@/components/cart/CartContext"
import { CatalogProduct, CATALOG_PRODUCTS } from "@/data/catalog"
import { useLiveProducts } from "@/lib/medusa"

interface ProductBuyBoxProps {
  product?: CatalogProduct
  title?: string
  subtitle?: string
  description?: string
  price?: number
  subscribePrice?: number
  tag?: string
}

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
  
  const isRefill =
    product?.format === "refill-cartridge" ||
    tag === "REFILL CARTRIDGE" ||
    product?.handle?.includes("cartridge") ||
    (typeof title === "string" && title.toLowerCase().includes("cartridge"))

  // Fetch live products for dynamic cartridge choices
  const { products: liveProducts } = useLiveProducts()

  // Filter available refill cartridges
  const availableCartridges = useMemo(() => {
    const source = liveProducts.length > 0 ? liveProducts : CATALOG_PRODUCTS
    const cartridges = source.filter(
      (p) =>
        p.format === "refill-cartridge" ||
        p.handle.includes("cartridge") ||
        p.name.toLowerCase().includes("cartridge")
    )
    return cartridges.length > 0 ? cartridges : source
  }, [liveProducts])

  // Cartridge selection state for pen starter sets
  const [selectedCartridgeId, setSelectedCartridgeId] = useState<string>("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Automatically select matching cartridge for the current pen model
  useEffect(() => {
    if (availableCartridges.length === 0) return

    // If currently selected ID is valid, maintain user selection
    if (selectedCartridgeId && availableCartridges.some((c) => c.id === selectedCartridgeId)) {
      return
    }

    const pHandle = (product?.handle || "").toLowerCase()
    const pName = (product?.name || "").toLowerCase()

    const match = availableCartridges.find((c) => {
      const cHandle = c.handle.toLowerCase()
      const cName = c.name.toLowerCase()

      if (pHandle.includes("cc1236") && (cHandle.includes("cc1236") || cName.includes("c.c-1236") || cName.includes("cc1236"))) return true
      if (pHandle.includes("rt40") && (cHandle.includes("rt40") || cName.includes("rt40"))) return true
      if (pHandle.includes("tbs30") && (cHandle.includes("tbs30") || cName.includes("tb-s30") || cName.includes("tbs30"))) return true
      if (pHandle.includes("ifc137") && (cHandle.includes("ifc137") || cName.includes("ifc-137") || cName.includes("ifc137"))) return true
      if (pHandle.includes("gvk0050") && (cHandle.includes("gvk0050") || cName.includes("gvk-00") || cName.includes("gvk0050"))) return true
      if (pHandle.includes("melatonin2") && (cHandle.includes("melatonin2") || cName.includes("melatonin"))) return true

      const cleanToken = pHandle.replace(/^pen-system-/, "").replace(/[^a-z0-9]/g, "")
      return cleanToken.length > 2 && (cHandle.includes(cleanToken) || cName.replace(/[^a-z0-9]/g, "").includes(cleanToken))
    })

    if (match) {
      setSelectedCartridgeId(match.id)
    } else {
      setSelectedCartridgeId(availableCartridges[0].id)
    }
  }, [availableCartridges, product?.handle, product?.name, selectedCartridgeId])

  const activeCartridge = availableCartridges.find((c) => c.id === selectedCartridgeId) || availableCartridges[0]

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isDropdownOpen])

  const currentOneTimePrice = product?.price ?? price
  const currentSubscribePrice = product?.subscribePrice ?? Number((currentOneTimePrice * 0.9).toFixed(2))
  const totalPrice = isRefill && purchaseType === "subscription" ? currentSubscribePrice : currentOneTimePrice

  // Determine title with balanced line break matching "Complete PEPTECH®\nPen Set"
  const rawTitle = title || (isRefill ? (product?.name || "Refill Cartridge") : "Complete PEPTECH®\nPen Set")
  const displayTitle = rawTitle.includes("\n")
    ? rawTitle
    : rawTitle.includes("Refill")
    ? rawTitle.replace(/ (Refill|Cartridge|Refill Cartridge)$/i, "\n$1")
    : rawTitle

  const displaySubtitle = subtitle || (isRefill ? "Pre-filled 1.5 mL Cartridge • Fits PEPTECH® Precision Pen" : "One system. Multiple possibilities.")
  const displayDescription = description || (isRefill ? (product?.description || "Precision engineered pre-filled cartridge compatible with PEPTECH reusable precision pens.") : "Get started with the complete PEPTECH® system. Includes reusable pen, a compatible prefilled cartridge, 14 instructions and all accessories you need for accurate, reliable testing.")

  const handleAddToCart = () => {
    const targetVariantId = product?.variantId || product?.id || "pen-system-starter"
    const recurring = isRefill && purchaseType === "subscription"
    
    const options = !isRefill && activeCartridge
      ? [
          { label: "Included Cartridge", value: activeCartridge.name },
          { label: "Specification", value: "1.5 mL Borosilicate Pre-filled • 99%+ HPLC" },
        ]
      : undefined

    addItem({
      id: `${targetVariantId}-${recurring ? "subscription" : "one-time"}${activeCartridge && !isRefill ? `-${activeCartridge.id}` : ""}`,
      variantId: targetVariantId,
      productHandle: product?.handle || "pen-system",
      title: product?.name || title.replace("\n", " "),
      format: isRefill ? "refill" : "pen-set",
      strength: product?.categoryLabel || "Precision Research",
      price: product?.price ?? price,
      isSubscription: recurring,
      subscriptionIntervalDays: recurring ? 28 : undefined,
      discountPercent: recurring ? 10 : undefined,
      sku: product?.sku || "",
      image: product?.image || "/images/peptech/mockup1.webp",
      options,
    })
    setIsDrawerOpen(true)
  }

  return (
    <div className="flex flex-col gap-[18px] items-start w-full max-w-[600px]">
      
      {/* Title & Review Rating Block - Figma Node 8:41097 */}
      <div className="flex flex-col gap-[6px] items-start w-full">
        <h1 className="font-extrabold text-[#0b1f3a] text-[28px] sm:text-[34px] leading-[36px] sm:leading-[40px] tracking-tight">
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

      {/* Complete Pen Set Cartridge Selector Dropdown */}
      {!isRefill && (
        <div className="w-full flex flex-col gap-2 relative" ref={dropdownRef}>
          <div className="flex items-center justify-between w-full">
            <label className="text-[13px] font-bold text-[#0b1f3a] flex items-center gap-2">
              <span>Included Cartridge</span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10.5px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                1x Included
              </span>
            </label>
            <span className="text-[11.5px] text-[#64748b]">
              1.5 mL Borosilicate Pre-filled
            </span>
          </div>

          {/* Trigger Button */}
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`w-full bg-white border ${
              isDropdownOpen ? "border-[#0b1f3a] ring-2 ring-[#0b1f3a]/10" : "border-[#e2e8f0] hover:border-[#94a3b8]"
            } rounded-[10px] p-3 flex items-center justify-between cursor-pointer transition-all shadow-xs text-left group`}
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-10 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center shrink-0 p-1 overflow-hidden">
                <img
                  src={activeCartridge?.image || "/images/peptech/cartridge.webp"}
                  alt=""
                  className="size-full object-contain"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13.5px] font-bold text-[#0b1f3a] truncate">
                  {activeCartridge?.name || "Select Cartridge"}
                </span>
                <span className="text-[11.5px] text-[#16a6a3] font-medium truncate">
                  {activeCartridge?.categoryLabel || "Precision Research Cartridge"} • 1.5 mL
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-2">
              <span className="text-[12px] font-semibold text-[#0b1f3a] group-hover:text-[#16a6a3] transition-colors hidden sm:inline">
                Change
              </span>
              <svg
                className={`size-4 text-[#64748b] transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-40 bg-white border border-[#cbd5e1] rounded-xl shadow-2xl p-2 max-h-[300px] overflow-y-auto space-y-1 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2 py-1 text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">
                Select Pre-filled Cartridge
              </div>
              {availableCartridges.map((cartridge) => {
                const isSelected = cartridge.id === selectedCartridgeId
                return (
                  <div
                    key={cartridge.id}
                    onClick={() => {
                      setSelectedCartridgeId(cartridge.id)
                      setIsDropdownOpen(false)
                    }}
                    className={`w-full px-3 py-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#f0f9ff] text-[#0b1f3a] font-semibold border border-[#bae6fd]"
                        : "hover:bg-[#f8fafc] text-[#334155] border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-8 rounded-md bg-white border border-[#e2e8f0] flex items-center justify-center shrink-0 p-0.5 overflow-hidden">
                        <img
                          src={cartridge.image || "/images/peptech/cartridge.webp"}
                          alt=""
                          className="size-full object-contain"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[13px] leading-tight truncate">
                          {cartridge.name}
                        </span>
                        <span className="text-[11px] text-[#64748b] leading-tight truncate">
                          {cartridge.categoryLabel} • 1.5 mL
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="size-5 rounded-full bg-[#16a6a3] text-white flex items-center justify-center shrink-0 ml-2">
                        <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

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

        {/* Option 2: Subscribe & Save 10% (Refills only) */}
        {isRefill && (
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
                  Every 28 days • Delivery charged separately
                </span>
              </div>
            </div>
            <span className="font-bold text-[#0b1f3a] text-[14px]">
              £{currentSubscribePrice.toFixed(2)}
            </span>
          </div>
        )}

      </div>

      {/* Navigation Cross-Links */}
      {!isRefill ? (
        <div className="flex items-center justify-between w-full text-[12.5px] text-[#64748b] px-0.5">
          <span>Need additional replacement cartridges?</span>
          <Link
            href="/refills"
            className="font-semibold text-[#16a6a3] hover:text-[#0b1f3a] transition-colors hover:underline"
          >
            Shop Refills →
          </Link>
        </div>
      ) : (
        /* Cartridge Compatibility Badge & Reusable Pen Cross-Link */
        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] px-4 py-3 flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#16a6a3] animate-pulse" />
            <span className="text-[12.5px] text-[#0b1f3a] font-medium">
              Fits PEPTECH® Reusable Precision Pen System
            </span>
          </div>
          <Link
            href="/products/complete-pen-set"
            className="text-[12px] font-semibold text-[#16a6a3] hover:text-[#0b1f3a] transition-colors hover:underline shrink-0 ml-2"
          >
            Need the pen? →
          </Link>
        </div>
      )}

      {/* Add to Cart Main Button - Figma Node 8:41133 */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={product ? product.inStock === false : false}
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
