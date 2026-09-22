"use client"

import React, { useState, useEffect } from "react"

export function ResearchDisclaimerModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    try {
      const acknowledged = localStorage.getItem("peptech_ruo_ack")
      if (!acknowledged) {
        setIsOpen(true)
      }
    } catch {
      setIsOpen(true)
    }
  }, [])

  const handleAccept = () => {
    try {
      localStorage.setItem("peptech_ruo_ack", "true")
    } catch {
      // ignore
    }
    setIsOpen(false)
  }

  const handleDecline = () => {
    window.location.href = "https://www.google.com"
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0b1523] border border-white/10 rounded-2xl sm:rounded-3xl max-w-[420px] w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden text-center flex flex-col items-center gap-5 animate-in zoom-in-95 duration-200">
        
        {/* Subtle Top Teal Accent Hairline */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00c5a0] to-transparent" />

        {/* Circular White Icon with Plus / Cross Symbol */}
        <div className="size-[52px] sm:size-[56px] rounded-full bg-white flex items-center justify-center shadow-lg text-[#0b1523] shrink-0">
          <svg
            className="size-6 text-[#0b1523]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="9" strokeWidth="2" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-white text-[22px] sm:text-[24px] font-extrabold uppercase tracking-tight leading-tight">
            RESEARCH ACCESS ONLY
          </h2>
        </div>

        {/* Structured Body Notice */}
        <div className="space-y-2 text-slate-300 text-[13px] sm:text-[14px] leading-relaxed max-w-[340px]">
          <p>
            This site contains research-grade compounds for in-vitro laboratory use.
          </p>
          <p className="text-slate-400 text-[12px] sm:text-[13px]">
            You must be <strong className="text-white font-bold">21 years or older</strong> and a qualified researcher to enter.
          </p>
        </div>

        {/* Two Pill Buttons Side-by-Side */}
        <div className="grid grid-cols-2 gap-3 w-full pt-1">
          <button
            type="button"
            onClick={handleAccept}
            className="btn-press bg-white hover:bg-slate-100 text-[#0b1523] font-bold text-[12px] sm:text-[13px] py-3.5 px-2 sm:px-3 rounded-full transition-all shadow-md flex items-center justify-center text-center cursor-pointer leading-snug"
          >
            <span>I am 21+ &amp; a researcher</span>
          </button>
          <button
            type="button"
            onClick={handleDecline}
            className="btn-press bg-transparent border border-white/20 hover:border-white/40 hover:bg-white/5 text-slate-300 hover:text-white font-medium text-[12px] sm:text-[13px] py-3.5 px-2 sm:px-3 rounded-full transition-all flex items-center justify-center text-center cursor-pointer leading-snug"
          >
            <span>I am under 21</span>
          </button>
        </div>

        {/* Structured Bottom Disclaimer */}
        <div className="pt-4 border-t border-white/10 w-full text-slate-400 text-[11px] sm:text-[11.5px] leading-relaxed text-center max-w-[340px]">
          <p>
            By entering you confirm you are a qualified researcher. All products are for in-vitro use only and not intended for human or veterinary consumption.
          </p>
        </div>

      </div>
    </div>
  )
}
