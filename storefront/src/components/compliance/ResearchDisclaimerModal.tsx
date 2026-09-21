"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1F3A]/75 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white border border-slate-200/90 rounded-2xl max-w-[420px] w-full p-6 sm:p-7 shadow-2xl relative overflow-hidden text-center space-y-4 animate-in zoom-in-95 duration-200">
        {/* Subtle Brand Gradient Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0B1F3A] via-[#00C5A0] to-[#0B1F3A]" />

        {/* Brand Logo & Verification Pill */}
        <div className="flex flex-col items-center gap-2.5 pt-1">
          <Image
            src="/images/figma/peptech-logo.png"
            alt="PEPTECH®"
            width={130}
            height={27}
            className="object-contain"
            priority
          />
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#00C5A0]/10 border border-[#00C5A0]/25 text-[#0F766E] text-[11px] font-semibold tracking-wide uppercase">
            <span className="size-1.5 rounded-full bg-[#00C5A0]" />
            <span>18+ • Research Use Only</span>
          </div>
        </div>

        {/* Short, Concise Notice */}
        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-[#0B1F3A] tracking-tight">
            Scientific Laboratory Portal
          </h2>
          <p className="text-[13px] text-slate-600 leading-relaxed max-w-[320px] mx-auto">
            All materials are strictly for in-vitro scientific research. Not for human or veterinary consumption.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={handleAccept}
            className="btn-press w-full py-3 px-4 rounded-xl bg-[#0B1F3A] hover:bg-[#16A6A3] text-white font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>I Am 18+ • Enter Site</span>
            <span>→</span>
          </button>
          <button
            type="button"
            onClick={handleDecline}
            className="w-full py-1.5 text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            I Do Not Agree / Exit
          </button>
        </div>
      </div>
    </div>
  )
}
