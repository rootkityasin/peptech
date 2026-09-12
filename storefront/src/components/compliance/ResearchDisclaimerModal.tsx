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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 text-[var(--color-foreground)] animate-in fade-in zoom-in-95">
        {/* Warning Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl font-bold">
            ⚠️
          </div>
          <div>
            <h2 className="font-extrabold text-base sm:text-lg tracking-tight">Research Peptide Compliance Notice</h2>
            <p className="text-xs text-zinc-500 font-mono">18+ RESTRICTED • LABORATORY USE ONLY</p>
          </div>
        </div>

        {/* Core Disclaimer Text */}
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 space-y-2.5 leading-relaxed">
          <p>
            All products listed on <strong>PEPTECH®</strong> are manufactured, distributed, and supplied solely for{" "}
            <strong className="text-zinc-900 dark:text-zinc-100 underline decoration-amber-500">
              in-vitro laboratory, scientific, and research purposes only
            </strong>.
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
            <li>These compounds are strictly <strong>NOT for human or veterinary use</strong>, injection, ingestion, or consumption.</li>
            <li>No medical, therapeutic, diagnostic, or bodybuilding claims are made or implied.</li>
            <li>You must be at least <strong>18 years of age</strong> to browse, verify, or purchase research materials.</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={handleAccept}
            className="w-full py-3 rounded-xl bg-[var(--color-brand-navy)] hover:bg-[var(--color-brand-slate)] text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span>I Am 18+ &amp; Acknowledge Research Use Only</span>
            <span>✓</span>
          </button>
          <button
            onClick={handleDecline}
            className="w-full py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-medium text-xs transition-colors"
          >
            I Do Not Agree / Exit Site
          </button>
        </div>

        <div className="text-center text-[10px] text-zinc-400 pt-1">
          By proceeding, you verify compliance with UK scientific research regulations.
        </div>
      </div>
    </div>
  )
}
