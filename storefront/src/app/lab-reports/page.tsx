"use client"

import React, { useState, useMemo, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CatalogSkeleton } from "@/components/ui/Skeletons"

interface LabReport {
  id: string
  productName: string
  category: "pen-sets" | "refills" | "vials"
  compoundCode: string
  batchNumber: string
  synthesisDate: string
  testDate: string
  laboratory: string
  methodology: string
  theoreticalMw: number
  observedMw: number | null
  purityPercent: number | null
  status: "verified" | "pending"
  pdfUrl?: string
  aliases?: string
}

const sampleReports: LabReport[] = [
  {
    id: "rep-1",
    productName: "Retatrutide (GLP-1/GIP/GCGR)",
    category: "refills",
    compoundCode: "RT",
    batchNumber: "RT-2609A",
    synthesisDate: "August 2026",
    testDate: "Report Pending",
    laboratory: "Independent Analytical Partner (Pending Upload)",
    methodology: "HPLC & Mass Spectrometry (Scheduled)",
    theoreticalMw: 4755.2,
    observedMw: null,
    purityPercent: null,
    status: "pending",
    aliases: "LY3437943 Retatrutide GIP GLP-1 GCGR Triple Agonist",
  },
  {
    id: "rep-2",
    productName: "Tirzepatide Dual-Agonist",
    category: "pen-sets",
    compoundCode: "TR",
    batchNumber: "TR-2609B",
    synthesisDate: "August 2026",
    testDate: "Report Pending",
    laboratory: "Independent Analytical Partner (Pending Upload)",
    methodology: "HPLC & Mass Spectrometry (Scheduled)",
    theoreticalMw: 4813.5,
    observedMw: null,
    purityPercent: null,
    status: "pending",
    aliases: "LY3298176 Tirzepatide GIP GLP-1 Dual Agonist",
  },
  {
    id: "rep-4",
    productName: "GHK-Cu (Copper Peptide Complex)",
    category: "vials",
    compoundCode: "Cu50",
    batchNumber: "CU-2608C",
    synthesisDate: "August 2026",
    testDate: "Report Pending",
    laboratory: "Independent Analytical Partner (Pending Upload)",
    methodology: "HPLC & Mass Spectrometry (Scheduled)",
    theoreticalMw: 404.0,
    observedMw: null,
    purityPercent: null,
    status: "pending",
    aliases: "Copper Tripeptide-1 GHK Copper KLOW GLOW Stack",
  },
  {
    id: "rep-5",
    productName: "BPC-157 Pentadecapeptide",
    category: "vials",
    compoundCode: "BPC",
    batchNumber: "BPC-2608A",
    synthesisDate: "August 2026",
    testDate: "Report Pending",
    laboratory: "Independent Analytical Partner (Pending Upload)",
    methodology: "HPLC & Mass Spectrometry (Scheduled)",
    theoreticalMw: 1419.5,
    observedMw: null,
    purityPercent: null,
    status: "pending",
    aliases: "PL 14736 PL-10 Bepecin Body Protection Compound Wolverine KLOW GLOW Stack",
  },
  {
    id: "rep-6",
    productName: "TB-500 (Thymosin Beta-4)",
    category: "vials",
    compoundCode: "TB",
    batchNumber: "TB-2608B",
    synthesisDate: "August 2026",
    testDate: "Report Pending",
    laboratory: "Independent Analytical Partner (Pending Upload)",
    methodology: "HPLC & Mass Spectrometry (Scheduled)",
    theoreticalMw: 4963.5,
    observedMw: null,
    purityPercent: null,
    status: "pending",
    aliases: "Thymosin Beta-4 TB500 Wolverine KLOW GLOW Stack",
  },
  {
    id: "rep-7",
    productName: "Cagrilintide Amylin Analogue",
    category: "refills",
    compoundCode: "CGL",
    batchNumber: "CGL-2609X",
    synthesisDate: "September 2026",
    testDate: "Report Pending",
    laboratory: "Independent Analytical Partner (Pending Upload)",
    methodology: "HPLC & Mass Spectrometry (Scheduled)",
    theoreticalMw: 4078.6,
    observedMw: null,
    purityPercent: null,
    status: "pending",
    aliases: "NN9838 Cagrilintide Amylin Calcitonin",
  },
  {
    id: "rep-8",
    productName: "Tesamorelin (trans-3-Hexenoyl GHRH)",
    category: "pen-sets",
    compoundCode: "TSM",
    batchNumber: "TSM-2609A",
    synthesisDate: "August 2026",
    testDate: "Report Pending",
    laboratory: "Independent Analytical Partner (Pending Upload)",
    methodology: "HPLC & Mass Spectrometry (Scheduled)",
    theoreticalMw: 5136.0,
    observedMw: null,
    purityPercent: null,
    status: "pending",
    aliases: "Tesamorelin trans-3-Hexenoyl-hGHRH GHRH Analogue",
  },
  {
    id: "rep-9",
    productName: "PT-141 (Bremelanotide MC3R/MC4R)",
    category: "pen-sets",
    compoundCode: "PT",
    batchNumber: "PT-2608D",
    synthesisDate: "August 2026",
    testDate: "Report Pending",
    laboratory: "Independent Analytical Partner (Pending Upload)",
    methodology: "HPLC & Mass Spectrometry (Scheduled)",
    theoreticalMw: 1025.2,
    observedMw: null,
    purityPercent: null,
    status: "pending",
    aliases: "PT-141 PT141 Bremelanotide Melanocortin",
  },
  {
    id: "rep-10",
    productName: "Melanotan II (MT-2 Cyclic Lactam)",
    category: "pen-sets",
    compoundCode: "MT2",
    batchNumber: "MT-2608E",
    synthesisDate: "August 2026",
    testDate: "Report Pending",
    laboratory: "Independent Analytical Partner (Pending Upload)",
    methodology: "HPLC & Mass Spectrometry (Scheduled)",
    theoreticalMw: 1024.2,
    observedMw: null,
    purityPercent: null,
    status: "pending",
    aliases: "Melanotan II MT-2 MT2 MT-II Melanocortin",
  },
]

const STOP_WORDS = new Set([
  "complete", "pen", "set", "sets", "refill", "refills", "vial", "vials",
  "cartridge", "cartridges", "kit", "stack", "pack", "dose", "mg", "ml", "the", "and"
])

function matchesTokenized(report: LabReport, queryString: string): boolean {
  if (!queryString.trim()) return true

  // Strip leading/trailing whitespace, "#", and "Lot #" / "Lot"
  const normalizedQuery = queryString
    .replace(/\blot\s*#?\s*/gi, "")
    .replace(/#/g, "")
    .trim()
    .toLowerCase()

  if (!normalizedQuery) return true

  // Check exact substring match on primary fields first
  const primaryFields = [
    report.productName,
    report.batchNumber,
    report.compoundCode,
    report.laboratory,
    report.aliases || "",
  ].map((f) => f.toLowerCase())

  if (primaryFields.some((f) => f.includes(normalizedQuery))) {
    return true
  }

  // Tokenize query by whitespace and delimiters (e.g. "Retatrutide (LY3437943)" -> ["retatrutide", "ly3437943"])
  const allTokens = normalizedQuery
    .split(/[\s,()\/[\]+]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0)

  if (allTokens.length === 0) return true

  // Compound codes match exact token (e.g. "RT", "TR", "TB", "CGL", "TSM", "PT", "MT2")
  const codeLower = report.compoundCode.toLowerCase()
  if (allTokens.some((t) => t === codeLower)) {
    return true
  }

  // Batch numbers match exact token or hyphen-insensitive token (e.g. "RT2609A" matches "RT-2609A")
  const batchLower = report.batchNumber.toLowerCase()
  const cleanBatch = batchLower.replace(/[-_]/g, "")
  if (allTokens.some((t) => t === batchLower || (t.length >= 4 && cleanBatch === t.replace(/[-_]/g, "")))) {
    return true
  }

  // Filter out generic ecommerce descriptors if specific chemical/batch tokens exist
  const substantiveTokens = allTokens.filter((t) => !STOP_WORDS.has(t))
  const activeTokens = substantiveTokens.length > 0 ? substantiveTokens : allTokens

  const reportText = `${report.productName} ${report.batchNumber} ${report.compoundCode} ${report.laboratory} ${report.aliases || ""}`.toLowerCase()

  return activeTokens.some((token) => {
    if (token.length >= 3) {
      // Avoid false-positive substring matches for common sub-words (e.g. "pen" inside "pentadecapeptide")
      if (STOP_WORDS.has(token)) {
        const regex = new RegExp(`\\b${token}\\b`, "i")
        return regex.test(reportText)
      }
      return reportText.includes(token)
    }
    return false
  })
}

function LabReportsContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("search") || searchParams.get("batch") || ""
  const [query, setQuery] = useState(initialQuery)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  useEffect(() => {
    const q = searchParams.get("search") || searchParams.get("batch")
    if (q) {
      setQuery(q)
    }
  }, [searchParams])

  const filteredReports = useMemo(() => {
    return sampleReports.filter((r) => {
      const matchesSearch = matchesTokenized(r, query)
      const matchesCat =
        selectedCategory === "all" || r.category === selectedCategory

      return matchesSearch && matchesCat
    })
  }, [query, selectedCategory])

  return (
    <main className="min-h-screen bg-white">
      {/* 01 Breadcrumb Bar */}
      <div className="bg-[#f8fafc] border-b border-[#e2e8f0] py-3.5">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] text-[#64748b]">
            <Link
              href="/"
              className="hover:text-[#0b1f3a] transition-colors rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16a6a3]"
            >
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span className="font-semibold text-[#0b1f3a]">Lab Reports &amp; COA</span>
          </nav>
        </div>
      </div>

      {/* 02 Header Section */}
      <section className="bg-gradient-to-b from-[#f8fafc] to-white border-b border-[#e2e8f0] py-12 sm:py-16">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="inline-block text-[12px] font-bold text-[#16A6A3] tracking-[1.2px] uppercase">
            THIRD-PARTY ANALYTICAL VERIFICATION
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#0B1F3A] leading-[1.15] tracking-tight uppercase">
            Certificates of Analysis (COA)
          </h1>

          <p className="text-xs sm:text-[14px] text-[#64748B] max-w-3xl leading-[22px]">
            Search our central analytical repository by product name or production lot. Independent verification is conducted via High-Performance Liquid Chromatography (HPLC) and Mass Spectrometry (MS). Batches awaiting final analytical upload are transparently marked <em>&ldquo;Report Pending&rdquo;</em>.
          </p>
        </div>
      </section>

      {/* 03 Main Repository Explorer */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
        
        {/* Search & Filter Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="w-full md:max-w-md relative">
            <label htmlFor="coa-search" className="sr-only">
              Search Certificates of Analysis by batch lot or compound
            </label>
            <input
              id="coa-search"
              type="text"
              placeholder="Search by lot (e.g. RT-2609A) or compound..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] text-xs sm:text-sm text-[#0b1f3a] placeholder-[#94a3b8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16a6a3] focus:border-[#16a6a3] focus:bg-white transition-all shadow-xs"
            />
            <span className="absolute left-3.5 top-3.5 text-[#94a3b8] pointer-events-none" aria-hidden="true">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="absolute right-3.5 top-3.5 text-xs text-[#94a3b8] hover:text-[#0b1f3a] rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16a6a3]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {[
              { id: "all", label: "All Formats" },
              { id: "pen-sets", label: "Complete Pen Sets" },
              { id: "refills", label: "Refill Cartridges" },
              { id: "vials", label: "Freeze-Dried Vials" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                aria-pressed={selectedCategory === tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16a6a3] ${
                  selectedCategory === tab.id
                    ? "bg-[#0b1f3a] text-white shadow-xs"
                    : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0] hover:text-[#0b1f3a]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <article
              key={report.id}
              className="bg-white rounded-3xl border border-[#e2e8f0] p-6 sm:p-7 shadow-xs hover:border-[#16a6a3] transition-all flex flex-col justify-between gap-6 group"
            >
              <header className="space-y-4">
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className="font-bold text-[#0b1f3a] px-2.5 py-1 rounded-lg bg-[#f1f5f9]">
                    Lot #{report.batchNumber}
                  </span>
                  {report.status === "verified" && report.purityPercent !== null ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200 flex items-center gap-1">
                      <span aria-hidden="true">✓</span>
                      <span>HPLC {report.purityPercent}%</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200 inline-flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                      </svg>
                      <span>Report Pending</span>
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="font-extrabold text-base sm:text-lg text-[#0b1f3a] group-hover:text-[#16a6a3] transition-colors">
                    {report.productName}
                  </h2>
                  <p className="text-[11px] text-[#64748b] font-medium mt-0.5">
                    Compound ID: {report.compoundCode} • {report.category.toUpperCase()}
                  </p>
                </div>
              </header>

              <dl className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2 text-xs text-[#64748b]">
                <div className="flex justify-between gap-3">
                  <dt className="text-[#94a3b8] shrink-0">Analytical Lab:</dt>
                  <dd className="font-semibold text-[#0b1f3a] text-right">{report.laboratory}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#94a3b8] shrink-0">Synthesis Date:</dt>
                  <dd className="text-[#0b1f3a] font-medium text-right">{report.synthesisDate}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#94a3b8] shrink-0">COA Status:</dt>
                  <dd className="text-[#0b1f3a] font-medium text-right">{report.testDate}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#94a3b8] shrink-0">Theoretical MW:</dt>
                  <dd className="text-[#0b1f3a] font-semibold text-right">{report.theoreticalMw} Da</dd>
                </div>
              </dl>

              <footer className="pt-2 flex flex-col gap-2">
                {report.status === "verified" && report.pdfUrl ? (
                  <div className="flex items-center gap-2">
                    <a
                      href={report.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-1/2 py-2.5 rounded-xl bg-[#0b1f3a] hover:bg-[#16a6a3] text-white text-xs font-bold transition-colors text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16a6a3]"
                    >
                      Download COA PDF
                    </a>
                    <Link
                      href={`/verify?batch=${encodeURIComponent(report.batchNumber)}`}
                      className="w-1/2 py-2.5 rounded-xl bg-[#f1f5f9] hover:bg-[#e2e8f0] text-xs font-semibold text-[#0b1f3a] text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16a6a3]"
                    >
                      Verify Batch Status →
                    </Link>
                  </div>
                ) : (
                  <>
                    <p className="p-2.5 rounded-xl bg-[#f8fafc] border border-dashed border-[#cbd5e1] text-center text-[11px] text-[#64748b]">
                      Analytical COA Pending Upload
                    </p>
                    <Link
                      href={`/verify?batch=${encodeURIComponent(report.batchNumber)}`}
                      className="w-full py-2.5 rounded-xl bg-[#0b1f3a] hover:bg-[#16a6a3] text-white text-xs font-bold transition-colors text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16a6a3]"
                    >
                      Verify Batch Status →
                    </Link>
                  </>
                )}
              </footer>
            </article>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <div className="p-16 text-center rounded-3xl border border-dashed border-[#cbd5e1] bg-white space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center text-[#64748b]" aria-hidden="true">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="font-bold text-base text-[#0b1f3a]">No COA reports match &ldquo;{query}&rdquo;</h2>
            <p className="text-xs text-[#64748b] max-w-sm mx-auto">
              Please check your batch number on your product label or contact support at{" "}
              <a
                href="mailto:support@peptech.bio"
                className="text-[#16a6a3] underline rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16a6a3]"
              >
                support@peptech.bio
              </a>.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}

export default function LabReportsPage() {
  return (
    <Suspense fallback={<CatalogSkeleton category="lab-reports" />}>
      <LabReportsContent />
    </Suspense>
  )
}
