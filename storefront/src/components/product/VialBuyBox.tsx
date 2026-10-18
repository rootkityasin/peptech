"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useCart, type CartConflict } from "@/components/cart/CartContext"
import { CatalogProduct } from "@/data/catalog"
import { ProductAccordions } from "./ProductAccordions"

interface VialBuyBoxProps {
  product: CatalogProduct
}

export function VialBuyBox({ product }: VialBuyBoxProps) {
  const { addItem, switchItemSubscription, setIsDrawerOpen, autoSavings } = useCart()
  const [purchaseType, setPurchaseType] = useState<"one-time" | "subscription">("one-time")
  const [quantity, setQuantity] = useState(1)
  const [conflictError, setConflictError] = useState<CartConflict | null>(null)

  useEffect(() => {
    setConflictError(null)
  }, [purchaseType])

  const oneTimePrice = product.price
  const subscribePrice = autoSavings.discountType === "percentage"
    ? Number((oneTimePrice * (1 - autoSavings.discountValue / 100)).toFixed(2))
    : Math.max(0, Number((oneTimePrice - autoSavings.discountValue).toFixed(2)))
  const activePrice = purchaseType === "subscription" ? subscribePrice : oneTimePrice
  const totalPrice = activePrice * quantity

  const batchCode = product.sku || (product.handle ? `VIAL-${product.handle.toUpperCase()}` : "PEPTECH-VIAL")

  const getCandidateItem = () => ({
    id: `${product.id}-${purchaseType}`,
    title: product.name,
    variantId: product.variantId,
    productHandle: product.handle,
    format: "vial" as const,
    strength: product.categoryLabel,
    price: purchaseType === "subscription" ? subscribePrice : product.price,
    isSubscription: purchaseType === "subscription",
    subscriptionIntervalDays: purchaseType === "subscription" ? 28 : undefined,
    discountPercent: autoSavings.discountType === "percentage" ? autoSavings.discountValue : undefined,
    sku: product.sku || "",
    image: product.image,
    options: [
      { label: "Purchase Type", value: purchaseType === "subscription" ? "28-Day Automated Protocol" : "One-Time Order" },
      { label: "Format", value: product.formatLabel || "Freeze-Dried Vial" },
    ],
  })

  const handleAddToCart = () => {
    if (!product.variantId || !product.inStock) return
    const candidate = getCandidateItem()
    const res = addItem(candidate, quantity)
    if (!res.success && res.conflict) {
      setConflictError(res.conflict)
    } else {
      setConflictError(null)
    }
  }

  const handleSwitchOption = () => {
    if (!conflictError) return
    const candidate = getCandidateItem()
    switchItemSubscription(conflictError.existingItem, candidate, quantity)
    setConflictError(null)
  }

  return (
    <div className="flex flex-col gap-[18px] items-start w-full max-w-[600px]">
      
      {/* Review Rating */}
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-[6px] items-center">
          <div className="flex gap-[2px] items-center" aria-label="5 out of 5 stars">
            {[...Array(5)].map((_, i) => (
              <img
                key={i}
                src="/images/figma/88eae9699ccc8253cd275735cdc60b0ad6111f88.svg"
                alt="Star"
                className="size-[13px]"
              />
            ))}
          </div>
          <span className="font-medium text-[#475569] text-[12px]">
            4.9 (284 reviews)
          </span>
        </div>
      </div>

      {/* Product Name Header */}
      <div className="flex flex-col gap-[4px] items-start w-full">
        <h1 className="font-extrabold text-[#0b1f3a] text-[28px] sm:text-[34px] leading-[36px] sm:leading-[40px] tracking-tight">
          {product.name}
        </h1>
        {product.contents ? (
          <p
            className="font-bold text-[15px] sm:text-[16px] tracking-tight"
            style={{ color: product.accentColor || "#16a6a3" }}
          >
            {product.contents}
          </p>
        ) : (
          <p className="font-semibold text-[#16a6a3] text-[14px]">
            {product.categoryLabel} • Analytical Research Powder
          </p>
        )}
      </div>

      {/* Description */}
      {product.description && (
        <p className="font-normal text-[#475569] text-[13px] leading-[22px]">
          {product.description}
        </p>
      )}

      {/* Lab Purity Verification Badge (RegenMed Benchmark) */}
      <div className="flex items-center justify-between w-full p-2.5 rounded-lg bg-[#f0f6fa] border border-[#e2e8f0]/80 text-[12px]">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center size-5 rounded-full bg-[#10b981]/15 text-[#10b981] font-bold text-[11px]">
            ✓
          </span>
          <span className="font-semibold text-[#0b1f3a]">
            {product.technicalSpecs?.purity || "≥ 99.0% Purity"} · HPLC Verified Batch
          </span>
        </div>
        <Link
          href={`/lab-reports?search=${encodeURIComponent(product.technicalSpecs?.compoundName || product.name)}`}
          className="font-bold text-[#16a6a3] hover:text-[#0b1f3a] transition-colors hover:underline text-[11.5px] shrink-0"
        >
          View Certificate →
        </Link>
      </div>

      {/* Reconstitution & Storage Advisory */}
      <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] p-3.5 w-full flex items-start gap-3">
        <div className="size-[20px] rounded-full bg-[#0b1f3a] text-white flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-bold">
          ℹ
        </div>
        <div className="flex-1 text-[12px] text-[#0b1f3a]">
          <p className="font-semibold">Storage &amp; Handling Protocol</p>
          <p className="text-[#475569] mt-0.5">
            Store lyophilised powder at -20°C for up to 24 months. Reconstitute with sterile bacteriostatic water for in-vitro analytical research.
          </p>
        </div>
      </div>

      {/* Price Display */}
      <div className="flex items-baseline gap-2 pt-1">
        <span className="font-bold text-[#0b1f3a] text-[30px] tracking-tight">
          £{totalPrice.toFixed(2)}
        </span>
        {purchaseType === "subscription" && (
          <span className="text-[#64748b] text-[13px] font-medium">
            every 28 days ({autoSavings.saveText.toLowerCase()})
          </span>
        )}
      </div>

      {/* Purchase Options Selector */}
      <div className="flex flex-col gap-[10px] items-start w-full">
        
        {/* Option 1: One-Time Purchase */}
        <div
          onClick={() => setPurchaseType("one-time")}
          className={`h-[52px] rounded-[8px] px-[16px] flex items-center justify-between w-full cursor-pointer transition-all ${
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
              One-Time Purchase
            </span>
          </div>
          <span className="font-bold text-[#0b1f3a] text-[14px]">
            £{oneTimePrice.toFixed(2)}
          </span>
        </div>

        {/* Option 2: Subscribe & Save 10% */}
        <div
          onClick={() => setPurchaseType("subscription")}
          className={`h-[62px] rounded-[8px] px-[16px] flex items-center justify-between w-full cursor-pointer transition-all ${
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
                  Subscribe &amp; Deliver
                </span>
                <span className="bg-[#e0f2fe] text-[#0369a1] text-[11px] font-bold px-[6px] py-[2px] rounded-[4px]">
                  28-Day Protocol
                </span>
              </div>
              <span className="text-[#64748b] text-[12px]">
                Replenished every 28 days • Pause or cancel anytime
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end shrink-0 ml-2">
            <span className="font-bold text-[#0b1f3a] text-[14px]">
              £{subscribePrice.toFixed(2)}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600">
              {autoSavings.saveText}
            </span>
          </div>
        </div>

      </div>

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

      {/* Quantity & Add to Cart Controls */}
      <div className="flex items-center gap-3 w-full pt-1">
        {/* Quantity selector */}
        <div className="h-[50px] bg-white border border-[#cbd5e1] rounded-xl flex items-center justify-between px-3 w-[110px] shrink-0">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="size-7 flex items-center justify-center text-[#64748b] hover:text-[#0b1f3a] font-bold text-[16px] cursor-pointer"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="font-bold text-[#0b1f3a] text-[14px]">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="size-7 flex items-center justify-center text-[#64748b] hover:text-[#0b1f3a] font-bold text-[16px] cursor-pointer"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        {/* Add to Cart Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={product.inStock === false}
          className={`btn-shimmer btn-press flex-1 ${product.inStock === false ? "bg-slate-200 cursor-not-allowed text-slate-400 border border-slate-300 shadow-none" : "bg-[#0b1f3a] hover:bg-[#162e52] cursor-pointer text-white shadow-md hover:shadow-xl"} flex gap-[10px] h-[50px] items-center justify-center rounded-xl transition-all font-semibold text-[15px] group`}
        >
          <img
            src="/images/figma/64d8de74a83e1fb14e8e8745813821f2e7537253.svg"
            alt=""
            className={`size-[18px] transition-transform duration-200 ${product.inStock === false ? "opacity-40" : "group-hover:scale-110"}`}
          />
          <span>{product.inStock === false ? "Out of Stock" : `Add to Cart • £${totalPrice.toFixed(2)}`}</span>
        </button>
      </div>

      {/* Stock & Lab Report Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2 pt-1 border-t border-slate-100">
        <div className="flex gap-[8px] items-center">
          <div className={`size-[8px] rounded-full ${product.inStock === false ? "bg-[#ef4444]" : "bg-[#10b981]"}`} />
          <span className={`font-medium text-[13px] ${product.inStock === false ? "text-red-600 font-semibold" : "text-[#0b1f3a]"}`}>
            {product.inStock === false ? "Out of Stock · Laboratory Synthesis Pending" : "In Stock — Ships within 1-2 business days"}
          </span>
        </div>
        <Link
          href={`/lab-reports?search=${encodeURIComponent(product.name)}`}
          className="text-[#16a6a3] hover:underline font-semibold text-[12px] flex items-center gap-1"
        >
          <span>View Batch COA Report</span>
          <span>→</span>
        </Link>
      </div>

      {/* Micro Value Props */}
      <div className="border-t border-[#f1f5f9] flex items-start justify-between pt-[14px] w-full">
        <div className="flex flex-col gap-[3px] items-center text-center w-[135px]">
          <img src="/images/figma/4390b9070d822ecd5eca4fa40b80170724518a5e.svg" alt="" className="size-[20px]" />
          <span className="font-bold text-[#0b1f3a] text-[12px]">Discreet Packaging</span>
          <span className="font-normal text-[#64748b] text-[10px]">Plain outer box</span>
        </div>
        <div className="flex flex-col gap-[3px] items-center text-center w-[135px]">
          <img src="/images/figma/416aaa518d7e3b2366ccb720558673a93ab6bde4.svg" alt="" className="size-[20px]" />
          <span className="font-bold text-[#0b1f3a] text-[12px]">Royal Mail Tracked</span>
          <span className="font-normal text-[#64748b] text-[10px]">£4.95 UK / £15 Int&apos;l</span>
        </div>
        <div className="flex flex-col gap-[3px] items-center text-center w-[135px]">
          <img src="/images/figma/5a5cf195bb5ca3a772d64cd94711197cd2748bd6.svg" alt="" className="size-[20px]" />
          <span className="font-bold text-[#0b1f3a] text-[12px]">Lab Tested</span>
          <span className="font-normal text-[#64748b] text-[10px]">HPLC certified</span>
        </div>
        <div className="flex flex-col gap-[3px] items-center text-center w-[135px]">
          <img src="/images/figma/62bff5b65f283bcf5397c72f82c6a2b3ed8693c2.svg" alt="" className="size-[20px]" />
          <span className="font-bold text-[#0b1f3a] text-[12px]">Dedicated Support</span>
          <span className="font-normal text-[#64748b] text-[10px]">support@peptech.bio</span>
        </div>
      </div>

      {/* RegenMed-Style Research & Logistics Accordion Tabs */}
      <ProductAccordions product={product} />

    </div>
  )
}
