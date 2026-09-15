"use client"

import React from "react"
import { CUSTOMER_REVIEWS } from "@/data/products"

export function VerifiedReviewsSection() {
  return (
    <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Rating Summary */}
        <div className="lg:col-span-3 space-y-2">
          <h3 className="text-xl font-black text-[#0B1F3A] tracking-tight">
            Verified Customer Reviews
          </h3>
          <div className="flex text-amber-400 text-base">★★★★★</div>
          <div className="text-sm font-bold text-slate-800">
            4.9 out of 5 <span className="font-normal text-slate-500">(284 reviews)</span>
          </div>
          <a href="#reviews" className="text-xs font-bold text-[#0B1F3A] hover:underline block pt-2">
            View All Reviews →
          </a>
        </div>

        {/* Right 3 Review Cards */}
        <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-4">
          {CUSTOMER_REVIEWS.map((r) => (
            <div
              key={r.name}
              className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs"
            >
              <div className="flex text-amber-400 text-xs">★★★★★</div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                &ldquo;{r.quote}&rdquo;
              </p>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                  {r.name.charAt(0)}
                </div>
                <div className="text-xs font-bold text-[#0B1F3A]">{r.name}</div>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                  Verified Buyer
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
