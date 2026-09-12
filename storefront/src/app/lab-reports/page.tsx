"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"

interface LabReport {
  id: string
  productName: string
  compoundCode: string
  batchNumber: string
  synthesisDate: string
  testDate: string
  laboratory: string
  methodology: string
  purityPercent: number | null
  status: "verified" | "pending"
  pdfUrl?: string
}

const sampleReports: LabReport[] = [
  {
    id: "rep-1",
    productName: "Retatrutide",
    compoundCode: "RT",
    batchNumber: "RT-2609A",
    synthesisDate: "August 2026",
    testDate: "02 September 2026",
    laboratory: "Alliance Analytical Testing UK",
    methodology: "HPLC (High-Performance Liquid Chromatography) & ESI-MS",
    purityPercent: 99.4,
    status: "verified",
    pdfUrl: "#",
  },
  {
    id: "rep-2",
    productName: "Tirzepatide",
    compoundCode: "TR",
    batchNumber: "TR-2609B",
    synthesisDate: "August 2026",
    testDate: "04 September 2026",
    laboratory: "Alliance Analytical Testing UK",
    methodology: "HPLC / Mass Spectrometry",
    purityPercent: 99.2,
    status: "verified",
    pdfUrl: "#",
  },
  {
    id: "rep-3",
    productName: "Semaglutide",
    compoundCode: "SM",
    batchNumber: "SM-2609A",
    synthesisDate: "July 2026",
    testDate: "28 August 2026",
    laboratory: "Prime BioAnalytics Lab",
    methodology: "HPLC & ESI-TOF Mass Spectrometry",
    purityPercent: 99.5,
    status: "verified",
    pdfUrl: "#",
  },
  {
    id: "rep-4",
    productName: "GHK-CU (Copper Peptide)",
    compoundCode: "Cu50",
    batchNumber: "CU-2608C",
    synthesisDate: "August 2026",
    testDate: "15 August 2026",
    laboratory: "Alliance Analytical Testing UK",
    methodology: "HPLC Spectrometry",
    purityPercent: 99.1,
    status: "verified",
    pdfUrl: "#",
  },
  {
    id: "rep-5",
    productName: "Cagrilintide",
    compoundCode: "CGL5",
    batchNumber: "CGL-2609X",
    synthesisDate: "September 2026",
    testDate: "Pending Test Cycle",
    laboratory: "Alliance Analytical Testing UK",
    methodology: "HPLC / MS In Progress",
    purityPercent: null,
    status: "pending",
  },
]

export default function LabReportsPage() {
  const [query, setQuery] = useState("")

  const filteredReports = useMemo(() => {
    return sampleReports.filter(
      (r) =>
        r.productName.toLowerCase().includes(query.toLowerCase()) ||
        r.batchNumber.toLowerCase().includes(query.toLowerCase()) ||
        r.compoundCode.toLowerCase().includes(query.toLowerCase())
    )
  }, [query])

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Page Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 uppercase tracking-wider">
            Scientific Verification Library
          </span>
          <span className="text-xs text-zinc-500 font-mono">Independent HPLC &amp; Mass Spectrometry</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Certificates of Analysis (COA)
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
          Search our central repository by product name or batch number. Every research formulation is tested by accredited third-party laboratories. If testing for a new batch is currently ongoing, it is clearly designated as <em>"Report Pending"</em>.
        </p>
      </div>

      {/* Search Input */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-3">
        <span className="text-lg text-zinc-400">🔍</span>
        <input
          type="text"
          placeholder="Enter batch number (e.g. RT-2609A) or compound name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full text-xs sm:text-sm bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden"
        />
        {query && (
          <button onClick={() => setQuery("")} className="text-xs text-zinc-400 hover:text-zinc-600">
            ✕
          </button>
        )}
      </div>

      {/* Reports Table / Grid */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200 px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                    Batch #{report.batchNumber}
                  </span>
                  {report.status === "verified" ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
                      ✓ HPLC {report.purityPercent}%
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold">
                      ⏳ Report Pending
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-100">{report.productName}</h3>

                <div className="space-y-1 text-xs text-zinc-500">
                  <div className="flex justify-between">
                    <span>Testing Facility:</span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">{report.laboratory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Test Date:</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">{report.testDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Methodology:</span>
                    <span className="text-zinc-700 dark:text-zinc-300">{report.methodology}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                {report.status === "verified" ? (
                  <a
                    href={`/verify?batch=${report.batchNumber}`}
                    className="w-full py-2.5 rounded-xl bg-[var(--color-brand-navy)] hover:bg-[var(--color-brand-slate)] text-white text-xs font-bold text-center block transition-colors"
                  >
                    View Verified Audit Seal ↗
                  </a>
                ) : (
                  <span className="w-full py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-xs font-medium text-center block">
                    Under Laboratory Review
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 space-y-2">
            <div className="text-3xl">📄</div>
            <h3 className="font-bold text-sm">No report matches "{query}"</h3>
            <p className="text-xs text-zinc-500">
              Please double check the batch number printed on your vial box, or email <a href="mailto:info@peptech.bio" className="text-[var(--color-brand-teal)] underline">info@peptech.bio</a>.
            </p>
          </div>
        )}
      </div>

    </main>
  )
}
