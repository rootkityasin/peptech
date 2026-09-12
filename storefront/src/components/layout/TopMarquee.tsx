"use client"

import React from "react"

export function TopMarquee() {
  const messages = [
    "FOR RESEARCH PURPOSES ONLY • 18+ AGE RESTRICTED",
    "ROYAL MAIL TRACKED (£4.95 UK / £15 WORLDWIDE)",
    "DISCREET PROTECTIVE PACKAGING • NO EXTERIOR BRANDING",
    "HPLC & MASS SPECTROMETRY BATCH VERIFIED",
    "SUBSCRIBE & SAVE 10% EVERY 28 DAYS ON REFILLS & VIALS",
    "ZERO WORKAROUNDS • COMPLIANT HIGH-RISK PROCESSING",
  ]

  return (
    <div className="bg-[var(--color-brand-slate)] text-white text-[11px] font-mono py-1.5 overflow-hidden border-b border-zinc-800 select-none">
      <div className="flex gap-8 whitespace-nowrap animate-marquee">
        {[...messages, ...messages].map((msg, idx) => (
          <span key={idx} className="inline-flex items-center gap-2">
            <span>{msg}</span>
            <span className="text-[var(--color-brand-teal)]">•</span>
          </span>
        ))}
      </div>
    </div>
  )
}
