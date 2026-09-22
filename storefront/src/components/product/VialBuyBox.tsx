"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useCart } from "@/components/cart/CartContext"
import { CatalogProduct } from "@/data/catalog"

interface VialBuyBoxProps {
  product: CatalogProduct
}

export function VialBuyBox({ product }: VialBuyBoxProps) {
  const { addItem, setIsDrawerOpen } = useCart()
  const [purchaseType, setPurchaseType] = useState<"one-time" | "subscription">("one-time")
  const [quantity, setQuantity] = useState(1)

  const oneTimePrice = product.price
  const subscribePrice = product.subscribePrice || Number((product.price * 0.9).toFixed(2))
  const activePrice = purchaseType === "subscription" ? subscribePrice : oneTimePrice
  const totalPrice = activePrice * quantity

  const batchCode = `VIAL-${product.category.toUpperCase().slice(0, 3)}-2026-04A`

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: `${product.id}-${purchaseType}`,
        title: product.name,
        format: "vial",
        strength: product.categoryLabel,
        price: activePrice,
        isSubscription: purchaseType === "subscription",
        subscriptionIntervalDays: purchaseType === "subscription" ? 28 : undefined,
        discountPercent: purchaseType === "subscription" ? 10 : undefined,
        sku: `PEP-VIAL-${product.id.replace("vial-", "").toUpperCase()}`,
        batch: batchCode,
        image: product.image,
        options: [
          { label: "Purchase Type", value: purchaseType === "subscription" ? "28-Day Subscription (10% off)" : "One-Time Order" },
          { label: "Format", value: "Lyophilised Research Vial" },
          { label: "Reconstitution", value: "Compatible with Bacteriostatic Water USP" },
        ],
      })
    }
    setIsDrawerOpen(true)
  }

  return (
    <div className="flex flex-col gap-[18px] items-start w-full max-w-[600px]">
      
      {/* Format Pill & Rating */}
      <div className="flex items-center justify-between w-full">
        <span className="bg-[#f0f5fa] text-[#0b1f3a] border border-[#cbd5e1] text-[11px] font-bold px-2.5 py-1 rounded-[4px] uppercase tracking-wider">
          {product.formatLabel}
        </span>
        <div className="flex gap-[6px] items-center">
          <div className="flex gap-[2px] items-center">
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
            4.9 (142 reviews)
          </span>
        </div>
      </div>

      {/* Product Name Header */}
      <div className="flex flex-col gap-[4px] items-start w-full">
        <h1 className="font-bold text-[#0b1f3a] text-[28px] sm:text-[32px] leading-[34px] sm:leading-[38px] tracking-tight">
          {product.name}
        </h1>
        <p className="font-semibold text-[#16a6a3] text-[14px]">
          {product.categoryLabel} • Analytical Research Powder
        </p>
      </div>

      {/* Description */}
      <p className="font-normal text-[#475569] text-[13px] leading-[22px]">
        {product.description}. High-purity lyophilised peptide cake supplied in a sterile, vacuum-crimped borosilicate glass vial. Sealed under nitrogen atmosphere for maximum scientific stability.
      </p>

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
            every 28 days (save 10%)
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
                  Subscribe &amp; Save
                </span>
                <span className="bg-[#dcfce7] text-[#15803d] text-[11px] font-bold px-[6px] py-[2px] rounded-[4px]">
                  10% OFF
                </span>
              </div>
              <span className="text-[#64748b] text-[12px]">
                Replenished every 28 days • Pause or cancel anytime
              </span>
            </div>
          </div>
          <span className="font-bold text-[#0b1f3a] text-[14px]">
            £{subscribePrice.toFixed(2)}
          </span>
        </div>

      </div>

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
          className="btn-shimmer btn-press flex-1 bg-[#0b1f3a] hover:bg-[#162e52] cursor-pointer flex gap-[10px] h-[50px] items-center justify-center rounded-xl transition-all text-white font-semibold text-[15px] shadow-md hover:shadow-xl group"
        >
          <img
            src="/images/figma/64d8de74a83e1fb14e8e8745813821f2e7537253.svg"
            alt=""
            className="size-[18px] transition-transform duration-200 group-hover:scale-110"
          />
          <span>Add to Cart • £{totalPrice.toFixed(2)}</span>
        </button>
      </div>

      {/* Stock & Lab Report Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2 pt-1 border-t border-slate-100">
        <div className="flex gap-[8px] items-center">
          <div className="size-[8px] rounded-full bg-[#10b981]" />
          <span className="font-medium text-[#0b1f3a] text-[13px]">
            In Stock — Ships within 1-2 business days
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
          <span className="font-normal text-[#64748b] text-[10px]">info@peptech.bio</span>
        </div>
      </div>

    </div>
  )
}
