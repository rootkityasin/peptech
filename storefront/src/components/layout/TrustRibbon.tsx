"use client"

import React from "react"

export function TrustRibbon() {
  return (
    <section className="bg-[var(--color-brand-navy-dark)] text-white border-b border-zinc-800/80 py-2.5 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-3 gap-2 text-center text-[10px] sm:text-xs">
        
        {/* Metric 1 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-zinc-300">
          <span className="text-base sm:text-lg">🚚</span>
          <div className="leading-tight">
            <span className="font-bold text-white block sm:inline">Royal Mail Tracked</span>
            <span className="text-zinc-400 block sm:inline sm:ml-1 text-[9px] sm:text-[11px] whitespace-nowrap">
              (£4.95 UK / Free £60+)
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-zinc-300 border-x border-zinc-800 px-1">
          <span className="text-base sm:text-lg text-[var(--color-brand-teal)]">🔬</span>
          <div className="leading-tight">
            <span className="font-bold text-white block sm:inline">Batch Certified</span>
            <span className="text-zinc-400 block sm:inline sm:ml-1 text-[9px] sm:text-[11px] whitespace-nowrap">
              HPLC ≥ 99% Purity
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-zinc-300">
          <span className="text-base sm:text-lg text-emerald-400">🛡️</span>
          <div className="leading-tight">
            <span className="font-bold text-white block sm:inline">Discreet Packaging</span>
            <span className="text-zinc-400 block sm:inline sm:ml-1 text-[9px] sm:text-[11px] whitespace-nowrap">
              100% Plain Outer Box
            </span>
          </div>
        </div>

      </div>
    </section>
  )
}
