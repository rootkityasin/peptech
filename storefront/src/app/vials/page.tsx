"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/components/cart/CartContext"
import { FREEZE_DRIED_VIALS } from "@/data/products"

export default function FreezeDriedVialsPage() {
  const { addItem, setIsDrawerOpen } = useCart()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredVials = FREEZE_DRIED_VIALS.filter((v) =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddToCart = (vial: typeof FREEZE_DRIED_VIALS[0]) => {
    addItem({
      id: vial.id,
      title: vial.name,
      format: "vial",
      strength: vial.tag,
      price: vial.price,
      isSubscription: false,
      sku: `PEP-VIAL-${vial.name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}`,
      batch: "VIAL-2026-B1",
    })
    setIsDrawerOpen(true)
  }

  return (
    <main className="bg-white min-h-screen text-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Breadcrumb */}
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <Link href="/" className="hover:text-[#0B1F3A]">Home</Link>
          <span>&gt;</span>
          <Link href="/products/complete-pen-set" className="hover:text-[#0B1F3A]">Shop</Link>
          <span>&gt;</span>
          <span className="font-semibold text-slate-900">Freeze-Dried Vials</span>
        </div>

        {/* Header Title & Search */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold text-[#00A896] tracking-wider uppercase">
              LABORATORY REAGENTS
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-[#0B1F3A] tracking-tight">
              Freeze-Dried Vials
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              For laboratory and professional use. High purity. Verified quality with independent HPLC batch certification.
            </p>
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search vial grades..."
              className="w-full px-4 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
            />
          </div>
        </div>

        {/* Grid of Vials */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {filteredVials.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-lg transition-all text-center"
            >
              <div>
                <div className="relative w-full aspect-square rounded-xl bg-slate-50 overflow-hidden mb-3 p-3 flex items-center justify-center">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={180}
                    height={180}
                    className="object-contain"
                  />
                </div>
                <h3 className="font-black text-sm text-[#0B1F3A]">{item.name}</h3>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">{item.tag}</div>
                <div className="text-base font-black text-[#0B1F3A] mt-2">${item.price.toFixed(2)}</div>
              </div>

              <button
                onClick={() => handleAddToCart(item)}
                className="mt-4 w-full py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#15345d] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>🛒</span>
                <span>Add to Cart</span>
              </button>
            </div>
          ))}
        </div>

        {/* Lab Trust Banner */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
          <span className="text-2xl">🔬</span>
          <h4 className="font-bold text-sm text-[#0B1F3A]">Strict Research Use Only (RUO)</h4>
          <p className="text-xs text-slate-500 max-w-2xl mx-auto leading-relaxed">
            All lyophilised compounds are packaged in sealed glass vials under sterile nitrogen atmosphere. For in-vitro scientific research and assay standardization only.
          </p>
        </div>

      </div>
    </main>
  )
}
