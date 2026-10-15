"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import Link from "next/link"
import { useCart } from "@/components/cart/CartContext"
import { CatalogProduct } from "@/data/catalog"
import { useLiveProducts } from "@/hooks/useLiveProducts"
import { ProductAccordions } from "./ProductAccordions"

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
  title,
  subtitle,
  description,
  price,
  subscribePrice,
  tag = "PEN SYSTEM",
}: ProductBuyBoxProps) {
  const { addItem, setIsDrawerOpen, autoSavings } = useCart()
  const [purchaseType, setPurchaseType] = useState<"one-time" | "subscription">("one-time")
  
  const isRefill =
    product?.format === "refill-cartridge" ||
    (product?.format !== "complete-pen-set" && (
      tag === "REFILL CARTRIDGE" ||
      product?.handle?.includes("cartridge") ||
      (typeof title === "string" && title.toLowerCase().includes("cartridge"))
    ))

  // Fetch live products for dynamic cartridge choices
  const { products: liveProducts } = useLiveProducts()

  // Filter available refill cartridges
  const availableCartridges = useMemo(() => {
    const source = liveProducts
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
      if (product?.compound && c.compound && product.compound.toLowerCase() === c.compound.toLowerCase()) {
        return true
      }
      const cHandle = c.handle.toLowerCase()
      const cName = c.name.toLowerCase()

      // Exact 1:1 handle transformation (e.g. klow-stack-pen-set -> klow-stack-cartridge)
      if (pHandle.replace(/-pen-set$/, "-cartridge") === cHandle) return true
      if (pHandle.replace(/^pen-system-/, "").replace(/-pen-set$/, "") === cHandle.replace(/-cartridge$/, "")) return true

      const cleanToken = pHandle.replace(/^pen-system-/, "").replace(/-pen-set$/, "").replace(/[^a-z0-9]/g, "")
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

  const currentOneTimePrice = product?.price ?? price ?? 0
  const dynamicSubPrice = autoSavings.discountType === "percentage"
    ? Number((currentOneTimePrice * (1 - autoSavings.discountValue / 100)).toFixed(2))
    : Math.max(0, Number((currentOneTimePrice - autoSavings.discountValue).toFixed(2)))
  const currentSubscribePrice = dynamicSubPrice
  const totalPrice = purchaseType === "subscription" ? currentSubscribePrice : currentOneTimePrice

  // Determine dynamic title, subtitle, and description directly from product
  const displayTitle = (product?.name || title || "").trim()
  const displaySubtitle = (product?.contents || subtitle || "").trim()
  const displayDescription = (product?.description || description || "").trim()

  const handleAddToCart = () => {
    const targetVariantId = product?.variantId || product?.id || ""
    const recurring = isRefill && purchaseType === "subscription"
    
    const options = !isRefill && activeCartridge
      ? [
          { label: "Included Cartridge", value: activeCartridge.name },
          ...(activeCartridge.contents ? [{ label: "Specification", value: activeCartridge.contents }] : []),
        ]
      : undefined

    addItem({
      id: `${targetVariantId}-${recurring ? "subscription" : "one-time"}${activeCartridge && !isRefill ? `-${activeCartridge.id}` : ""}`,
      variantId: targetVariantId,
      productHandle: product?.handle || "pen-system",
      title: displayTitle.replace("\n", " "),
      format: isRefill ? "refill" : "pen-set",
      strength: product?.categoryLabel || "Precision Research",
      price: recurring ? currentSubscribePrice : currentOneTimePrice,
      isSubscription: recurring,
      subscriptionIntervalDays: recurring ? 28 : undefined,
      discountPercent: autoSavings.discountType === "percentage" ? autoSavings.discountValue : undefined,
      sku: product?.sku || "",
      image: product?.image || "/images/products/placeholder.png",
      options,
    })
    setIsDrawerOpen(true)
  }

  return (
    <div className="flex flex-col gap-[18px] items-start w-full max-w-[600px]">
      

      {/* Title & Review Rating Block */}
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

        {/* Product Contents Subtitle */}
        {product?.contents && (
          <p
            className="font-bold text-[15px] sm:text-[16px] tracking-tight"
            style={{ color: product.accentColor || "#16a6a3" }}
          >
            {product.contents}
          </p>
        )}
        
        <div className="flex gap-[8px] items-center pt-0.5">
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

      {/* Description */}
      <p className="font-normal text-[#475569] text-[13px] leading-[21px] max-w-[580px]">
        {displayDescription}
      </p>

      {/* Lab Purity Verification Badge (RegenMed Benchmark) */}
      <div className="flex items-center justify-between w-full p-2.5 rounded-lg bg-[#f0f6fa] border border-[#e2e8f0]/80 text-[12px]">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center size-5 rounded-full bg-[#10b981]/15 text-[#10b981] font-bold text-[11px]">
            ✓
          </span>
          <span className="font-semibold text-[#0b1f3a]">
            {product?.technicalSpecs?.purity || "≥ 99.0% Purity"} · HPLC Verified Batch
          </span>
        </div>
        <Link
          href={`/lab-reports?search=${encodeURIComponent(product?.technicalSpecs?.compoundName || product?.name || "")}`}
          className="font-bold text-[#16a6a3] hover:text-[#0b1f3a] transition-colors hover:underline text-[11.5px] shrink-0"
        >
          View Certificate →
        </Link>
      </div>

      {/* Primary Price */}
      <div className="flex items-baseline gap-3">
        <span className="font-bold text-[#0b1f3a] text-[28px] tracking-tight">
          £{totalPrice.toFixed(2)}
        </span>
        {purchaseType === "subscription" && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            {autoSavings.discountType === "percentage" ? `${autoSavings.discountValue}% Subscribe & Save` : `${autoSavings.badgeText} Subscribe & Save`}
          </span>
        )}
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
                  src={activeCartridge?.image || "/images/products/placeholder.png"}
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
                          src={cartridge.image || "/images/products/placeholder.png"}
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
            className={`min-h-[60px] py-2.5 rounded-[8px] px-[18px] flex items-center justify-between w-full cursor-pointer transition-all ${
              purchaseType === "subscription"
                ? "bg-[#f8fafc] border-[1.5px] border-[#0b1f3a]"
                : "bg-white border border-[#e2e8f0] hover:border-slate-300"
            }`}
          >
            <div className="flex gap-[12px] items-center">
              <div className={`size-[18px] rounded-full border flex items-center justify-center shrink-0 ${
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
                    Subscribe &amp; Deliver
                  </span>
                  <span className="bg-[#e0f2fe] text-[#0369a1] text-[11px] font-bold px-[6px] py-[2px] rounded-[4px]">
                    28-Day Protocol
                  </span>
                </div>
                <span className="text-[#64748b] text-[12px]">
                  Every 28 days automated delivery • Pause or cancel anytime
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end shrink-0 ml-2">
              <span className="font-bold text-[#0b1f3a] text-[14px]">
                £{currentSubscribePrice.toFixed(2)}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600">
                {autoSavings.saveText}
              </span>
            </div>
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
            href={product?.compound ? `/products/${product.compound}-pen-set` : "/pen-sets"}
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
        className={`btn-shimmer btn-press ${product?.inStock === false ? "bg-slate-200 cursor-not-allowed text-slate-400 border border-slate-300 shadow-none" : "bg-[#0b1f3a] hover:bg-[#162e52] cursor-pointer text-white shadow-md hover:shadow-xl"} flex gap-[10px] h-[50px] items-center justify-center rounded-xl w-full transition-all font-semibold text-[15px] group`}
      >
        <img src="/images/figma/64d8de74a83e1fb14e8e8745813821f2e7537253.svg" alt="" className={`size-[18px] transition-transform duration-200 ${product?.inStock === false ? "opacity-40" : "group-hover:scale-110"}`} />
        <span>{product?.inStock === false ? "Out of Stock" : "Add to Cart"}</span>
      </button>

      {/* Stock Notice - Figma Node 8:41139 */}
      <div className="flex gap-[8px] items-center">
        <div className={`size-[8px] rounded-full ${product?.inStock === false ? "bg-[#ef4444]" : "bg-[#10b981]"}`} />
        <span className={`font-medium text-[13px] ${product?.inStock === false ? "text-red-600 font-semibold" : "text-[#0b1f3a]"}`}>
          {product?.inStock === false ? "Out of Stock · Laboratory Synthesis Pending" : "In Stock — Ships within 1-2 business days"}
        </span>
      </div>

      {/* Micro Value Props - Responsive 2x2 on Mobile, 4-col on Tablet/Desktop */}
      <div className="border-t border-[#f1f5f9] grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-2 pt-[14px] w-full">
        
        <div className="flex flex-col gap-[4px] items-center text-center w-full p-1">
          <img src="/images/figma/4390b9070d822ecd5eca4fa40b80170724518a5e.svg" alt="" className="size-[20px]" />
          <span className="font-bold text-[#0b1f3a] text-[12px]">Free Shipping</span>
          <span className="font-normal text-[#64748b] text-[10px]">Orders over £100</span>
        </div>

        <div className="flex flex-col gap-[4px] items-center text-center w-full p-1">
          <img src="/images/figma/416aaa518d7e3b2366ccb720558673a93ab6bde4.svg" alt="" className="size-[20px]" />
          <span className="font-bold text-[#0b1f3a] text-[12px]">Secure Checkout</span>
          <span className="font-normal text-[#64748b] text-[10px]">256-bit encryption</span>
        </div>

        <div className="flex flex-col gap-[4px] items-center text-center w-full p-1">
          <img src="/images/figma/5a5cf195bb5ca3a772d64cd94711197cd2748bd6.svg" alt="" className="size-[20px]" />
          <span className="font-bold text-[#0b1f3a] text-[12px]">30-Day Returns</span>
          <span className="font-normal text-[#64748b] text-[10px]">Hassle-free</span>
        </div>

        <div className="flex flex-col gap-[4px] items-center text-center w-full p-1">
          <img src="/images/figma/62bff5b65f283bcf5397c72f82c6a2b3ed8693c2.svg" alt="" className="size-[20px]" />
          <span className="font-bold text-[#0b1f3a] text-[12px]">Dedicated Support</span>
          <span className="font-normal text-[#64748b] text-[10px]">Here when you need us</span>
        </div>

      </div>

      {/* RegenMed-Style Research & Logistics Accordion Tabs */}
      <ProductAccordions product={product} />

    </div>
  )
}
