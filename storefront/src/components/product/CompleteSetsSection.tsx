"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/components/cart/CartContext"

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
    <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0B1F3A] tracking-tight">
            Complete Pen Sets
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Everything you need to get started. Professional-grade. Trusted worldwide.
          </p>
        </div>
        <Link
          href="/products/complete-pen-set"
          className="text-xs sm:text-sm font-bold text-[#0B1F3A] hover:text-[var(--color-brand-teal)] transition-colors flex items-center gap-1"
        >
          <span>View All Pen Systems</span>
          <span>→</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Product Card with MOST POPULAR */}
        <div className="bg-white rounded-2xl border-2 border-[#00C5A0]/40 p-4 shadow-sm relative flex flex-col justify-between">
          <div className="absolute top-3 right-3 bg-[#00C5A0] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
            MOST POPULAR
          </div>

          <div>
            <div className="relative w-full aspect-square rounded-xl bg-slate-50 overflow-hidden mb-3 p-2">
              <Image
                src="/images/peptech/mockup2.webp"
                alt="PEPTECH Complete Pen Set"
                fill
                className="object-contain"
              />
            </div>
            <h4 className="font-black text-sm text-[#0B1F3A]">PEPTECH® Complete Pen Set</h4>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <span className="text-amber-400">★★★★★</span>
              <span className="font-bold text-slate-800">4.9</span>
              <span>(264)</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Includes reusable pen, prefilled cartridge, all accessories and instructions.
            </p>
            <div className="text-base font-black text-[#0B1F3A] mt-2">
              $249.00
            </div>
          </div>

          <button
            onClick={handleAddSet}
            className="mt-4 w-full py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#15345d] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>🛒</span>
            <span>Add to Cart</span>
          </button>
        </div>

        {/* Card 2: Feature Points */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col justify-around">
          <div className="flex items-center gap-3">
            <span className="text-xl">🎯</span>
            <div>
              <div className="text-xs font-bold text-[#0B1F3A]">Accurate Results</div>
              <div className="text-[10px] text-slate-500">Professional precision</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl">⚡</span>
            <div>
              <div className="text-xs font-bold text-[#0B1F3A]">Easy to Use</div>
              <div className="text-[10px] text-slate-500">Simple setup</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl">🔄</span>
            <div>
              <div className="text-xs font-bold text-[#0B1F3A]">Reusable Design</div>
              <div className="text-[10px] text-slate-500">Up to 2 years</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl">🌐</span>
            <div>
              <div className="text-xs font-bold text-[#0B1F3A]">Trusted Worldwide</div>
              <div className="text-[10px] text-slate-500">Used in 50+ countries</div>
            </div>
          </div>
        </div>

        {/* Card 3: Testimonial Quote */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="text-2xl text-slate-300 font-serif leading-none">&ldquo;</div>
            <p className="text-xs text-slate-600 italic leading-relaxed">
              Exceptional quality and easy to use. The complete set had everything I needed and the instructions were clear.
            </p>
            <div className="flex text-amber-400 text-xs">★★★★★</div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="text-xs font-black text-[#0B1F3A]">Dr. Sarah M.</div>
            <div className="text-[10px] text-slate-400">Research Laboratory</div>
          </div>
        </div>

        {/* Card 4: One Pen. Multiple Possibilities Showcase */}
        <div className="bg-gradient-to-br from-slate-900 to-[#0B1F3A] rounded-2xl p-5 text-white flex flex-col justify-between">
          <div>
            <h4 className="font-black text-sm tracking-tight text-white">
              One Pen. <br />
              Multiple Possibilities.
            </h4>
            <p className="text-[10px] text-slate-300 mt-1">
              Engineered for precision. Designed for a healthier tomorrow.
            </p>
          </div>

          <div className="relative w-full h-24 my-2">
            <Image
              src="/images/peptech/pen.webp"
              alt="PEPTECH Pen"
              fill
              className="object-contain"
            />
          </div>

          <div className="text-[10px] font-bold text-[var(--color-brand-teal)] text-right">
            Learn More →
          </div>
        </div>

      </div>
    </section>
  )
}
