"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"

export default function VerifyQRPage() {
  const [batchInput, setBatchInput] = useState("")
  const [serialInput, setSerialInput] = useState("")
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [hasSearched, setHasSearched] = useState(false)

  // Read URL params if opened from physical QR code
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const batch = params.get("batch")
      const serial = params.get("serial")
      if (batch) {
        setBatchInput(batch)
        if (serial) setSerialInput(serial)
        performVerification(batch, serial || undefined)
      }
    }
  }, [])

  const performVerification = (batch: string, serial?: string) => {
    setHasSearched(true)
    const normalized = batch.trim().toUpperCase()

    // Verified database mock matching official lots
    if (normalized === "RT-2609A" || normalized.startsWith("RT")) {
      setVerificationResult({
        status: "authentic",
        compound: "Retatrutide (Research Grade)",
        batch: "RT-2609A",
        serialNumber: serial || "PT-984128",
        synthesisDate: "August 2026",
        testDate: "02 September 2026",
        lab: "Alliance Analytical UK",
        purity: "99.4% HPLC",
        methodology: "HPLC / ESI-MS",
        devicePassport: "Genuine PEPTECH Precision Reusable System",
      })
    } else if (normalized === "TR-2609B" || normalized.startsWith("TR")) {
      setVerificationResult({
        status: "authentic",
        compound: "Tirzepatide (Research Grade)",
        batch: "TR-2609B",
        serialNumber: serial || "PT-771829",
        synthesisDate: "August 2026",
        testDate: "04 September 2026",
        lab: "Alliance Analytical UK",
        purity: "99.2% HPLC",
        methodology: "HPLC / Mass Spectrometry",
        devicePassport: "Genuine PEPTECH Precision Reusable System",
      })
    } else {
      setVerificationResult({
        status: "unverified",
        batch: normalized,
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (batchInput) performVerification(batchInput, serialInput)
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-brand-teal)]/10 text-[var(--color-brand-teal)] text-xs font-bold font-mono">
          <span>QR &amp; SERIAL SECURITY SYSTEM</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
          Packaging QR Authenticity Verification
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-lg mx-auto">
          Scan the QR code printed on your PEPTECH box or enter the serial and batch numbers from your Device Passport below.
        </p>
      </div>

      {/* Manual Verification Form */}
      <form
        onSubmit={handleSubmit}
        className="p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Batch Lot Number *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. RT-2609A"
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-xs sm:text-sm font-mono text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-[var(--color-brand-teal)]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Device Passport / Serial (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. PT-984128"
              value={serialInput}
              onChange={(e) => setSerialInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-xs sm:text-sm font-mono text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-[var(--color-brand-teal)]"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-[var(--color-brand-navy)] hover:bg-[var(--color-brand-slate)] text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
        >
          <span>Verify Lot Authenticity</span>
          <span>🛡️</span>
        </button>
      </form>

      {/* Result Display */}
      {hasSearched && verificationResult && (
        <div className="animate-in fade-in zoom-in-95">
          {verificationResult.status === "authentic" ? (
            <div className="p-6 sm:p-8 rounded-3xl border-2 border-emerald-500/30 bg-emerald-500/5 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center text-2xl font-black">
                  ✓
                </div>
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 uppercase tracking-wider font-mono">
                    Authentic Verified Lot
                  </span>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                    {verificationResult.compound}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-500/20 text-xs">
                <div>
                  <span className="text-zinc-400 block text-[10px]">BATCH NUMBER</span>
                  <span className="font-mono font-bold">{verificationResult.batch}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px]">VERIFIED PURITY</span>
                  <span className="font-mono font-bold text-emerald-600">{verificationResult.purity}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px]">DEVICE PASSPORT</span>
                  <span className="font-mono font-bold text-indigo-600">{verificationResult.serialNumber}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px]">TEST DATE</span>
                  <span className="font-mono">{verificationResult.testDate}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px]">LABORATORY</span>
                  <span>{verificationResult.lab}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px]">METHODOLOGY</span>
                  <span>{verificationResult.methodology}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs pt-2">
                <span className="text-zinc-500">Official Certificate of Analysis ready for download.</span>
                <Link
                  href="/lab-reports"
                  className="px-4 py-2 rounded-xl bg-[var(--color-brand-teal)] hover:bg-[var(--color-brand-teal-hover)] text-white font-bold transition-colors"
                >
                  Download COA PDF ↗
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-8 rounded-3xl border-2 border-red-500/30 bg-red-500/5 space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-600 flex items-center justify-center text-2xl font-black mx-auto">
                ⚠️
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Unverified Batch Number ({verificationResult.batch})
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                  The entered lot number could not be authenticated against our active master synthesis records. If you believe this is in error, please inspect the box label or contact laboratory support immediately.
                </p>
              </div>
              <div className="pt-2">
                <a
                  href="mailto:info@peptech.bio"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold inline-block"
                >
                  Report Tampered / Unknown Lot to info@peptech.bio
                </a>
              </div>
            </div>
          )}
        </div>
      )}

    </main>
  )
}
