"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import Link from "next/link"
import { useCart, type CartConflict } from "@/components/cart/CartContext"
import { CatalogProduct } from "@/data/catalog"
import { useLiveProducts } from "@/hooks/useLiveProducts"
import { ProductAccordions } from "./ProductAccordions"
import { resolveProductImage } from "@/lib/product-images"

interface ProductBuyBoxProps {
  product?: CatalogProduct
  title?: string
  subtitle?: string
  description?: string
  price?: number
  subscribePrice?: number
  tag?: string
  allProducts?: CatalogProduct[]
  defaultCartridge?: CatalogProduct | null
}

export function ProductBuyBox({
  product,
  title,
  subtitle,
  description,
  price,
  subscribePrice,
  tag = "PEN SYSTEM",
  allProducts,
  defaultCartridge,
}: ProductBuyBoxProps) {
  const { addItem, switchItemSubscription, setIsDrawerOpen, autoSavings } = useCart()
  const [purchaseType, setPurchaseType] = useState<"one-time" | "subscription">("one-time")
  const [conflictError, setConflictError] = useState<CartConflict | null>(null)
  
  const format = product?.format
  const isVial =
    format === "freeze-dried-vial" ||
    tag === "FREEZE-DRIED VIAL" ||
    Boolean(product?.handle?.includes("vial")) ||
    (typeof title === "string" && title.toLowerCase().includes("vial"))

  const isRefill =
    !isVial &&
    (format === "refill-cartridge" ||
      tag === "REFILL CARTRIDGE" ||
      Boolean(product?.handle?.includes("cartridge")) ||
      (typeof title === "string" && title.toLowerCase().includes("cartridge")))

  const isPenSet = !isVial && !isRefill
  const isSubscriptionEligible = isRefill || isVial

  // Fetch live products for dynamic cartridge choices (hydrates from allProducts or localStorage in 0ms)
  const { products: liveProducts } = useLiveProducts(allProducts || [])

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

  // Fixed default cartridge resolution (strictly locked 1:1 to this pen set)
  const activeCartridge = useMemo(() => {
    if (defaultCartridge) return defaultCartridge
    if (availableCartridges.length === 0) return null

    const pHandle = (product?.handle || "").toLowerCase()
    const pCompound = (product?.compound || "").toLowerCase()

    const match = availableCartridges.find((c) => {
      if (pCompound && c.compound && pCompound === c.compound.toLowerCase()) {
        return true
      }
      const cHandle = c.handle.toLowerCase()
      const cName = c.name.toLowerCase()

      // Exact 1:1 handle transformation (e.g. retatrutide-pen-set -> retatrutide-cartridge)
      if (pHandle.replace(/-pen-set$/, "-cartridge") === cHandle) return true
      if (pHandle.replace(/^pen-system-/, "").replace(/-pen-set$/, "") === cHandle.replace(/-cartridge$/, "")) return true

      const cleanToken = pHandle.replace(/^pen-system-/, "").replace(/-pen-set$/, "").replace(/[^a-z0-9]/g, "")
      return cleanToken.length > 2 && (cHandle.includes(cleanToken) || cName.replace(/[^a-z0-9]/g, "").includes(cleanToken))
    })

    return match || availableCartridges[0] || null
  }, [defaultCartridge, availableCartridges, product?.handle, product?.compound])

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

  useEffect(() => {
    setConflictError(null)
  }, [purchaseType])

  const getCandidateItem = () => {
    const targetVariantId = product?.variantId || product?.id || ""
    const recurring = isSubscriptionEligible && purchaseType === "subscription"
    const resolvedFormat: "pen-set" | "refill" | "vial" = isVial ? "vial" : isRefill ? "refill" : "pen-set"
    
    const options = isPenSet && activeCartridge
      ? [
          { label: "Included Cartridge", value: activeCartridge.name },
          ...(activeCartridge.contents ? [{ label: "Specification", value: activeCartridge.contents }] : []),
        ]
      : isVial
      ? [
          { label: "Format", value: "Vacuum Freeze-Dried Lyophilised Vial" },
        ]
      : isRefill
      ? [
          { label: "Format", value: "1.5 mL Borosilicate Refill Cartridge" },
        ]
      : undefined

    return {
      id: `${targetVariantId}-${recurring ? "subscription" : "one-time"}${activeCartridge && isPenSet ? `-${activeCartridge.id}` : ""}`,
      variantId: targetVariantId,
      productHandle: product?.handle || (isVial ? "vial" : isRefill ? "cartridge" : "pen-system"),
      title: displayTitle.replace("\n", " "),
      format: resolvedFormat,
      strength: product?.categoryLabel || "Precision Research",
      price: recurring ? currentSubscribePrice : currentOneTimePrice,
      isSubscription: recurring,
      subscriptionIntervalDays: recurring ? 28 : undefined,
      discountPercent: autoSavings.discountType === "percentage" ? autoSavings.discountValue : undefined,
      sku: product?.sku || "",
      image: resolveProductImage(product),
      options,
    }
  }

  const handleAddToCart = () => {
    const candidate = getCandidateItem()
    const res = addItem(candidate)
    if (!res.success && res.conflict) {
      setConflictError(res.conflict)
    } else {
      setConflictError(null)
    }
  }

  const handleSwitchOption = () => {
    if (!conflictError) return
    const candidate = getCandidateItem()
    switchItemSubscription(conflictError.existingItem, candidate)
    setConflictError(null)
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
          <div className="flex gap-[2px] items-center" aria-label="5 out of 5 stars">
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
      <div className="flex items-center justify-between w-full p-2 sm:p-2.5 rounded-lg bg-[#f0f6fa] border border-[#e2e8f0]/80 text-[11.5px] sm:text-[12px] gap-2 min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="flex items-center justify-center size-4.5 sm:size-5 rounded-full bg-[#10b981]/15 text-[#10b981] font-bold text-[10px] sm:text-[11px] shrink-0">
            ✓
          </span>
          <span className="font-semibold text-[#0b1f3a] truncate">
            {product?.technicalSpecs?.purity || "≥ 99.0% Purity"} <span className="hidden min-[360px]:inline">· HPLC Verified</span>
          </span>
        </div>
        <Link
          href={`/lab-reports?search=${encodeURIComponent(product?.technicalSpecs?.compoundName || product?.name || "")}`}
          className="font-bold text-[#16a6a3] hover:text-[#0b1f3a] transition-colors hover:underline text-[11px] sm:text-[11.5px] shrink-0 whitespace-nowrap"
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

      {/* Format-Specific Middle Specification Card (Structurally Identical for All Formats) */}
      {isPenSet && activeCartridge && (
        <div className="w-full flex flex-col gap-2 min-w-0">
          <div className="flex items-center justify-between w-full gap-1.5 sm:gap-2 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="text-[11.5px] sm:text-[13px] font-bold text-[#0b1f3a] truncate sm:whitespace-nowrap">
                Included Cartridge
              </span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9.5px] sm:text-[10.5px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap shrink-0">
                1x Included
              </span>
            </div>
            <span className="text-[10px] sm:text-[11.5px] text-[#64748b] whitespace-nowrap text-right shrink-0">
              <span className="hidden sm:inline">1.5 mL Borosilicate </span>Pre-filled
            </span>
          </div>

          <div className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] p-2.5 sm:p-3 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="size-9 sm:size-10 rounded-lg bg-white border border-[#e2e8f0] flex items-center justify-center shrink-0 p-1 overflow-hidden">
                <img
                  src={resolveProductImage(activeCartridge)}
                  alt=""
                  className="size-full object-contain"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] sm:text-[13.5px] font-bold text-[#0b1f3a] truncate">
                  {activeCartridge.name}
                </span>
                <span className="text-[11px] sm:text-[11.5px] text-[#16a6a3] font-medium truncate">
                  {activeCartridge.categoryLabel || "Precision Research Cartridge"} • 1.5 mL
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {isRefill && (
        <div className="w-full flex flex-col gap-2 min-w-0">
          <div className="flex items-center justify-between w-full gap-1.5 sm:gap-2 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="text-[11.5px] sm:text-[13px] font-bold text-[#0b1f3a] truncate sm:whitespace-nowrap">
                <span className="hidden sm:inline">Format Specification</span>
                <span className="sm:hidden">Format</span>
              </span>
              <span className="bg-teal-50 text-teal-700 border border-teal-200 text-[9.5px] sm:text-[10.5px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap shrink-0">
                Refill Cartridge
              </span>
            </div>
            <span className="text-[10px] sm:text-[11.5px] text-[#64748b] whitespace-nowrap text-right shrink-0">
              <span className="hidden sm:inline">1.5 mL Borosilicate </span>Type I Glass
            </span>
          </div>

          <div className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] p-2.5 sm:p-3 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="size-9 sm:size-10 rounded-lg bg-white border border-[#e2e8f0] flex items-center justify-center shrink-0 p-1 overflow-hidden">
                <img
                  src={resolveProductImage(product)}
                  alt=""
                  className="size-full object-contain"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] sm:text-[13.5px] font-bold text-[#0b1f3a] truncate">
                  {displayTitle}
                </span>
                <span className="text-[11px] sm:text-[11.5px] text-[#16a6a3] font-medium truncate">
                  {product?.contents || `${product?.categoryLabel || "Precision Research Cartridge"} • 1.5 mL Volume`}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {isVial && (
        <div className="w-full flex flex-col gap-2 min-w-0">
          <div className="flex items-center justify-between w-full gap-1.5 sm:gap-2 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="text-[11.5px] sm:text-[13px] font-bold text-[#0b1f3a] truncate sm:whitespace-nowrap">
                <span className="hidden sm:inline">Format Specification</span>
                <span className="sm:hidden">Format</span>
              </span>
              <span className="bg-sky-50 text-sky-700 border border-sky-200 text-[9.5px] sm:text-[10.5px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap shrink-0">
                Freeze-Dried Vial
              </span>
            </div>
            <span className="text-[10px] sm:text-[11.5px] text-[#64748b] whitespace-nowrap text-right shrink-0">
              <span className="hidden sm:inline">Vacuum-Sealed </span>Laboratory Grade
            </span>
          </div>

          <div className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] p-2.5 sm:p-3 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="size-9 sm:size-10 rounded-lg bg-white border border-[#e2e8f0] flex items-center justify-center shrink-0 p-1 overflow-hidden">
                <img
                  src={resolveProductImage(product)}
                  alt=""
                  className="size-full object-contain"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] sm:text-[13.5px] font-bold text-[#0b1f3a] truncate">
                  {displayTitle}
                </span>
                <span className="text-[11px] sm:text-[11.5px] text-[#16a6a3] font-medium truncate">
                  {product?.contents || `${product?.categoryLabel || "Lyophilised Research Standard"} • Store at 2°C–8°C / -20°C`}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Options Box - Figma Node 8:41116 */}
      <div className="flex flex-col gap-[10px] items-start w-full">
        
        {/* Option 1: One-Time Purchase */}
        <div
          onClick={() => setPurchaseType("one-time")}
          className={`h-[52px] rounded-[8px] px-3 sm:px-[18px] flex items-center justify-between w-full cursor-pointer transition-all ${
            purchaseType === "one-time"
              ? "bg-[#f8fafc] border-[1.5px] border-[#0b1f3a]"
              : "bg-white border border-[#e2e8f0] hover:border-slate-300"
          }`}
        >
          <div className="flex gap-2.5 sm:gap-[12px] items-center min-w-0">
            <div className={`size-[18px] rounded-full border flex items-center justify-center shrink-0 ${
              purchaseType === "one-time"
                ? "border-[#0b1f3a] bg-white border-2"
                : "border-[#94a3b8] border-[1.5px]"
            }`}>
              {purchaseType === "one-time" && (
                <div className="size-[8px] rounded-full bg-[#0b1f3a]" />
              )}
            </div>
            <span className="font-semibold text-[#0b1f3a] text-[13.5px] sm:text-[14px] truncate">
              One-time purchase
            </span>
          </div>
          <span className="font-bold text-[#0b1f3a] text-[13.5px] sm:text-[14px] shrink-0 ml-2">
            £{currentOneTimePrice.toFixed(2)}
          </span>
        </div>

        {/* Option 2: Subscribe & Save 10% (Refills & Vials) */}
        {isSubscriptionEligible && (
          <div
            onClick={() => setPurchaseType("subscription")}
            className={`min-h-[60px] py-2.5 rounded-[8px] px-3 sm:px-[18px] flex items-center justify-between w-full cursor-pointer transition-all ${
              purchaseType === "subscription"
                ? "bg-[#f8fafc] border-[1.5px] border-[#0b1f3a]"
                : "bg-white border border-[#e2e8f0] hover:border-slate-300"
            }`}
          >
            <div className="flex gap-2.5 sm:gap-[12px] items-center min-w-0">
              <div className={`size-[18px] rounded-full border flex items-center justify-center shrink-0 ${
                purchaseType === "subscription"
                  ? "border-[#0b1f3a] bg-white border-2"
                  : "border-[#94a3b8] border-[1.5px]"
              }`}>
                {purchaseType === "subscription" && (
                  <div className="size-[8px] rounded-full bg-[#0b1f3a]" />
                )}
              </div>
              <div className="flex flex-col gap-[2px] items-start min-w-0">
                <div className="flex flex-wrap sm:flex-nowrap gap-1.5 sm:gap-[8px] items-center">
                  <span className="font-semibold text-[#0b1f3a] text-[13px] sm:text-[14px] whitespace-nowrap">
                    Subscribe &amp; Deliver
                  </span>
                  <span className="bg-[#e0f2fe] text-[#0369a1] text-[10px] sm:text-[11px] font-bold px-[6px] py-[1.5px] rounded-[4px] shrink-0">
                    28-Day Protocol
                  </span>
                </div>
                <span className="text-[#64748b] text-[11px] sm:text-[12px] line-clamp-1 sm:line-clamp-none">
                  Every 28 days automated delivery • Pause or cancel anytime
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end shrink-0 ml-2">
              <span className="font-bold text-[#0b1f3a] text-[13.5px] sm:text-[14px]">
                £{currentSubscribePrice.toFixed(2)}
              </span>
              <span className="text-[10.5px] sm:text-[11px] font-semibold text-emerald-600 whitespace-nowrap">
                {autoSavings.saveText}
              </span>
            </div>
          </div>
        )}

      </div>

      {/* Navigation Cross-Links */}
      {isPenSet ? (
        <div className="flex items-center justify-between w-full text-[11px] sm:text-[12.5px] text-[#64748b] px-0.5 gap-2 min-w-0">
          <span className="truncate min-w-0">
            Need <span className="hidden sm:inline">additional </span>refill cartridges?
          </span>
          <Link
            href={
              product?.compound === "klow"
                ? "/products/klow-stack-refill-cartridge"
                : product?.compound === "wolverine"
                ? "/products/wolverine-stack-refill-cartridge"
                : product?.compound
                ? `/products/${product.compound}-refill-cartridge`
                : "/refills"
            }
            className="font-semibold text-[#16a6a3] hover:text-[#0b1f3a] transition-colors hover:underline whitespace-nowrap shrink-0"
          >
            Shop <span className="hidden sm:inline">Compatible </span>Refills →
          </Link>
        </div>
      ) : isRefill ? (
        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] px-2.5 sm:px-4 py-2 sm:py-3 flex items-center justify-between w-full gap-2 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="inline-block size-2 rounded-full bg-[#16a6a3] animate-pulse shrink-0" />
            <span className="text-[11px] sm:text-[12.5px] text-[#0b1f3a] font-medium truncate">
              Fits PEPTECH® <span className="hidden sm:inline">Reusable Precision </span>Pen System
            </span>
          </div>
          <Link
            href={
              product?.compound === "klow"
                ? "/products/klow-stack-pen-set"
                : product?.compound === "wolverine"
                ? "/products/wolverine-stack-pen-set"
                : product?.compound
                ? `/products/${product.compound}-pen-set`
                : "/pen-sets"
            }
            className="text-[11px] sm:text-[12px] font-semibold text-[#16a6a3] hover:text-[#0b1f3a] transition-colors hover:underline whitespace-nowrap shrink-0 ml-1.5"
          >
            Need pen? →
          </Link>
        </div>
      ) : (
        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] px-2.5 sm:px-4 py-2 sm:py-3 flex items-center justify-between w-full gap-2 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="inline-block size-2 rounded-full bg-[#0284c7] animate-pulse shrink-0" />
            <span className="text-[11px] sm:text-[12.5px] text-[#0b1f3a] font-medium truncate">
              Standard 3mL <span className="hidden sm:inline">Crimp </span>Laboratory Vial
            </span>
          </div>
          <Link
            href={
              product?.compound === "klow"
                ? "/products/klow-stack-pen-set"
                : product?.compound === "wolverine"
                ? "/products/wolverine-stack-pen-set"
                : product?.compound
                ? `/products/${product.compound}-pen-set`
                : "/pen-sets"
            }
            className="text-[11px] sm:text-[12px] font-semibold text-[#16a6a3] hover:text-[#0b1f3a] transition-colors hover:underline whitespace-nowrap shrink-0 ml-1.5"
          >
            Prefer pen? →
          </Link>
        </div>
      )}

      {/* Mutual Exclusivity Error Alert */}
      {conflictError && (
        <div className="w-full bg-amber-50/95 border border-amber-300 rounded-xl p-3.5 flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-1 shadow-xs">
          <div className="flex items-start gap-2.5">
            <div className="size-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold shadow-xs">
              !
            </div>
            <div className="flex-1 text-[12.5px] text-amber-950 leading-snug font-medium">
              {conflictError.message}
            </div>
          </div>
          
          <div className="flex items-center gap-3 pt-2 border-t border-amber-200/80">
            <button
              type="button"
              onClick={handleSwitchOption}
              className="text-xs font-bold text-amber-950 bg-amber-200/90 hover:bg-amber-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs active:scale-95"
            >
              {conflictError.actionLabel}
            </button>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="text-xs font-semibold text-amber-900 hover:text-amber-950 underline cursor-pointer"
            >
              View Basket
            </button>
          </div>
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
      <div className="border-t border-[#f1f5f9] grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2 pt-[14px] w-full">
        
        <div className="flex flex-col gap-[2px] sm:gap-[4px] items-center text-center w-full p-1 min-w-0">
          <img src="/images/figma/4390b9070d822ecd5eca4fa40b80170724518a5e.svg" alt="" className="size-[18px] sm:size-[20px]" />
          <span className="font-bold text-[#0b1f3a] text-[11px] sm:text-[12px] leading-tight">Free Shipping</span>
          <span className="font-normal text-[#64748b] text-[9.5px] sm:text-[10px] leading-tight">Orders over £100</span>
        </div>

        <div className="flex flex-col gap-[2px] sm:gap-[4px] items-center text-center w-full p-1 min-w-0">
          <img src="/images/figma/416aaa518d7e3b2366ccb720558673a93ab6bde4.svg" alt="" className="size-[18px] sm:size-[20px]" />
          <span className="font-bold text-[#0b1f3a] text-[11px] sm:text-[12px] leading-tight">Secure Checkout</span>
          <span className="font-normal text-[#64748b] text-[9.5px] sm:text-[10px] leading-tight">256-bit encryption</span>
        </div>

        <div className="flex flex-col gap-[2px] sm:gap-[4px] items-center text-center w-full p-1 min-w-0">
          <img src="/images/figma/5a5cf195bb5ca3a772d64cd94711197cd2748bd6.svg" alt="" className="size-[18px] sm:size-[20px]" />
          <span className="font-bold text-[#0b1f3a] text-[11px] sm:text-[12px] leading-tight">14-Day Return</span>
          <span className="font-normal text-[#64748b] text-[9.5px] sm:text-[10px] leading-tight">Hardware Sealed</span>
        </div>

        <div className="flex flex-col gap-[2px] sm:gap-[4px] items-center text-center w-full p-1 min-w-0">
          <img src="/images/figma/62bff5b65f283bcf5397c72f82c6a2b3ed8693c2.svg" alt="" className="size-[18px] sm:size-[20px]" />
          <span className="font-bold text-[#0b1f3a] text-[11px] sm:text-[12px] leading-tight">Dedicated Support</span>
          <span className="font-normal text-[#64748b] text-[9.5px] sm:text-[10px] leading-tight">Here to help</span>
        </div>

      </div>

      {/* RegenMed-Style Research & Logistics Accordion Tabs */}
      <ProductAccordions product={product} />

    </div>
  )
}
