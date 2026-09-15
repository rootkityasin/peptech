"use client"

import React from "react"
import { COMPLETE_PEN_SET } from "@/data/products"

export function ProductSpecsGrid() {
  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: What's Included */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black text-[#0B1F3A] tracking-tight mb-4">
              What&apos;s Included
            </h3>
            <ul className="space-y-3.5">
              {COMPLETE_PEN_SET.whatsIncluded.map((item) => (
                <li key={item.title} className="flex items-start gap-3">
                  <span className="text-lg shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <div className="text-xs font-bold text-slate-800">{item.title}</div>
                    <div className="text-[11px] text-slate-500">{item.desc}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Card 2: Product Specifications */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black text-[#0B1F3A] tracking-tight mb-4">
              Product Specifications
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              {COMPLETE_PEN_SET.specifications.map((spec) => (
                <div key={spec.label} className="py-2 flex justify-between gap-2">
                  <span className="text-slate-500 font-medium">{spec.label}</span>
                  <span className="font-semibold text-slate-800 text-right">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-5 border-t border-slate-100 grid grid-cols-2 gap-2">
            <button className="py-2 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-[11px] font-bold text-slate-700 transition-colors text-center cursor-pointer">
              View Instructions
            </button>
            <button className="py-2 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-[11px] font-bold text-slate-700 transition-colors flex items-center justify-center gap-1 cursor-pointer">
              <span>📥</span>
              <span>Download Spec Sheet</span>
            </button>
          </div>
        </div>

        {/* Card 3: Lab Tested. Trusted Worldwide. */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between text-center">
          <div className="space-y-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex flex-col items-center justify-center p-1 shadow-md">
              <div className="text-[9px] font-extrabold uppercase leading-none">PEPTECH</div>
              <div className="text-xs font-black">QUALITY</div>
              <div className="text-[8px] opacity-80 leading-none">ASSURED</div>
            </div>

            <div>
              <h3 className="text-base font-black text-[#0B1F3A] tracking-tight">
                Lab Tested. <br />
                Trusted Worldwide.
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Each PEPTECH® system is manufactured to the highest standards and undergoes rigorous quality control.
              </p>
            </div>

            {/* Regulatory and Standard Badges */}
            <div className="grid grid-cols-3 gap-3 pt-2 items-center justify-center opacity-85">
              <div className="border border-slate-200 rounded-lg py-1.5 px-1 text-center">
                <div className="font-black text-slate-800 text-xs">ISO</div>
                <div className="text-[8px] text-slate-500">9001</div>
              </div>
              <div className="border border-slate-200 rounded-lg py-1.5 px-1 text-center">
                <div className="font-mono font-black text-slate-800 text-xs">FDA</div>
                <div className="text-[7px] text-slate-500">FACILITY</div>
              </div>
              <div className="border border-slate-200 rounded-lg py-1.5 px-1 text-center">
                <div className="font-serif font-black text-slate-800 text-xs">CE</div>
                <div className="text-[8px] text-slate-500">EUROPE</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            MADE IN A FDA REGISTERED FACILITY • GMP COMPLIANT
          </div>
        </div>

      </div>
    </section>
  )
}
