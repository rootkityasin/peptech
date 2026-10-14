"use client"

import React from "react"
import { CatalogProduct } from "@/data/catalog"

interface ProductFormatSwitcherProps {
  currentFormat: "complete-pen-set" | "refill-cartridge" | "freeze-dried-vial"
  penSet?: CatalogProduct | null
  cartridge?: CatalogProduct | null
  vial?: CatalogProduct | null
  onSelectFormat: (product: CatalogProduct) => void
  accentColor?: string
}

export function ProductFormatSwitcher({
  currentFormat,
  penSet,
  cartridge,
  vial,
  onSelectFormat,
  accentColor = "#16a6a3",
}: ProductFormatSwitcherProps) {
  const formats = [
    {
      format: "complete-pen-set" as const,
      label: "Complete Pen Set",
      subtitle: "Reusable Pen + Cartridge + Kit",
      product: penSet,
    },
    {
      format: "refill-cartridge" as const,
      label: "Refill Cartridge",
      subtitle: "1.5 mL Borosilicate Cartridge",
      product: cartridge,
    },
    {
      format: "freeze-dried-vial" as const,
      label: "Freeze-Dried Vial",
      subtitle: "Lyophilised Research Vial",
      product: vial,
    },
  ]

  // Only render if at least 2 formats exist for this compound
  const availableCount = [penSet, cartridge, vial].filter(Boolean).length
  if (availableCount < 2) return null

  return (
    <div className="w-full flex flex-col gap-2 pb-3 mb-2 border-b border-[#e2e8f0]">
      <div className="flex items-center justify-between">
        <label className="text-[11.5px] font-bold text-[#0b1f3a] tracking-wider uppercase flex items-center gap-1.5">
          <span>Choose Format:</span>
        </label>
        <span className="text-[11px] font-medium text-[#64748b]">
          3 Formats Available
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
        {formats.map((f) => {
          if (!f.product) return null
          const isSelected = currentFormat === f.format
          return (
            <button
              key={f.format}
              type="button"
              onClick={() => onSelectFormat(f.product!)}
              className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                isSelected
                  ? "bg-[#f0f9f9] border-[#16a6a3] shadow-xs ring-1 ring-[#16a6a3]"
                  : "bg-white border-[#e2e8f0] hover:border-slate-300 hover:bg-slate-50/60"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-[12px] font-bold ${isSelected ? "text-[#0b1f3a]" : "text-[#334155]"}`}>
                  {f.label}
                </span>
                <span
                  className={`size-3 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected ? "border-[#16a6a3] bg-[#16a6a3]" : "border-[#cbd5e1] bg-white"
                  }`}
                >
                  {isSelected && <span className="size-1 rounded-full bg-white" />}
                </span>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-[13px] font-extrabold text-[#0b1f3a]">
                  £{f.product.price.toFixed(2)}
                </span>
                {f.product.isSubscriptionEligible && (
                  <span className="text-[10px] font-semibold text-[#16a6a3]">
                    (Sub £{f.product.subscribePrice?.toFixed(2)})
                  </span>
                )}
              </div>
              <span className="text-[10px] text-[#64748b] mt-0.5 line-clamp-1">
                {f.subtitle}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
