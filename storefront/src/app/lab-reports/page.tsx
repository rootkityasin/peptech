"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"

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
  observedMw: number
  purityPercent: number | null
  status: "verified" | "pending"
  pdfUrl?: string
}

const sampleReports: LabReport[] = [
  {
    id: "rep-1",
    productName: "Retatrutide (GLP-1/GIP/GCGR)",
    category: "refills",
    compoundCode: "RT",
    batchNumber: "RT-2609A",
    synthesisDate: "August 2026",
    testDate: "02 September 2026",
    laboratory: "Alliance Analytical Testing UK",
    methodology: "HPLC (Reversed Phase C18) & ESI-TOF Mass Spectrometry",
    theoreticalMw: 4755.2,
    observedMw: 4755.4,
    purityPercent: 99.4,
    status: "verified",
  },
  {
    id: "rep-2",
    productName: "Tirzepatide Dual-Agonist",
    category: "pen-sets",
    compoundCode: "TR",
    batchNumber: "TR-2609B",
    synthesisDate: "August 2026",
    testDate: "04 September 2026",
    laboratory: "Alliance Analytical Testing UK",
    methodology: "HPLC & High-Resolution Electrospray MS",
    theoreticalMw: 4813.5,
    observedMw: 4813.2,
    purityPercent: 99.2,
    status: "verified",
  },
  {
    id: "rep-3",
    productName: "Semaglutide GLP-1 Analogue",
    category: "refills",
    compoundCode: "SM",
    batchNumber: "SM-2609A",
    synthesisDate: "July 2026",
    testDate: "28 August 2026",
    laboratory: "Prime BioAnalytics Lab UK",
    methodology: "HPLC & Matrix-Assisted Laser Desorption MS",
    theoreticalMw: 4113.6,
    observedMw: 4113.8,
    purityPercent: 99.5,
    status: "verified",
  },
  {
    id: "rep-4",
    productName: "GHK-Cu (Copper Peptide Complex)",
    category: "vials",
    compoundCode: "Cu50",
    batchNumber: "CU-2608C",
    synthesisDate: "August 2026",
    testDate: "15 August 2026",
    laboratory: "Alliance Analytical Testing UK",
    methodology: "Reversed-Phase HPLC Spectrometry",
    theoreticalMw: 404.0,
    observedMw: 404.1,
    purityPercent: 99.1,
    status: "verified",
  },
  {
    id: "rep-5",
    productName: "BPC-157 Pentadecapeptide",
    category: "vials",
    compoundCode: "BPC",
    batchNumber: "BPC-2608A",
    synthesisDate: "August 2026",
    testDate: "18 August 2026",
    laboratory: "Alliance Analytical Testing UK",
    methodology: "HPLC (0.1% TFA Acetonitrile Gradient) & MS",
    theoreticalMw: 1419.5,
    observedMw: 1419.6,
    purityPercent: 99.6,
    status: "verified",
  },
  {
    id: "rep-6",
    productName: "TB-500 (Thymosin Beta-4)",
    category: "vials",
    compoundCode: "TB",
    batchNumber: "TB-2608B",
    synthesisDate: "August 2026",
    testDate: "22 August 2026",
    laboratory: "Prime BioAnalytics Lab UK",
    methodology: "HPLC & ESI-TOF Mass Spectrometry",
    theoreticalMw: 4963.5,
    observedMw: 4963.8,
    purityPercent: 99.3,
    status: "verified",
  },
  {
    id: "rep-7",
    productName: "Cagrilintide Amylin Analogue",
    category: "refills",
    compoundCode: "CGL",
    batchNumber: "CGL-2609X",
    synthesisDate: "September 2026",
    testDate: "Testing Cycle Active",
    laboratory: "Alliance Analytical Testing UK",
    methodology: "HPLC / MS In Progress",
    theoreticalMw: 4078.6,
    observedMw: 4078.6,
    purityPercent: null,
    status: "pending",
  },
]

export default function LabReportsPage() {
  const [query, setQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [inspectingReport, setInspectingReport] = useState<LabReport | null>(null)
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null)

  const filteredReports = useMemo(() => {
    return sampleReports.filter((r) => {
      const matchesSearch =
        r.productName.toLowerCase().includes(query.toLowerCase()) ||
        r.batchNumber.toLowerCase().includes(query.toLowerCase()) ||
        r.compoundCode.toLowerCase().includes(query.toLowerCase())
      
      const matchesCat =
        selectedCategory === "all" || r.category === selectedCategory

      return matchesSearch && matchesCat
    })
  }, [query, selectedCategory])

  const handleDownload = (batch: string) => {
    setDownloadSuccess(batch)
    setTimeout(() => {
      setDownloadSuccess(null)
    }, 4000)
  }

  return (
    <main className="min-h-screen bg-white">
      {/* 01 Breadcrumb Bar */}
      <div className="bg-[#f8fafc] border-b border-[#e2e8f0] py-3.5">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-[13px] text-[#64748b]">
            <Link href="/" className="hover:text-[#0b1f3a] transition-colors">Home</Link>
            <span>/</span>
            <span className="font-semibold text-[#0b1f3a]">Lab Reports &amp; COA</span>
          </div>
        </div>
      </div>

      {/* 02 Header Section */}
      <section className="bg-gradient-to-b from-[#f8fafc] to-white border-b border-[#e2e8f0] py-12 sm:py-16">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-4">

          
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0b1f3a]">
            Certificates of Analysis (COA)
          </h1>

          <p className="text-sm sm:text-base text-[#475569] max-w-3xl leading-relaxed">
            Search our central analytical repository by product name or production lot. Every batch is tested via High-Performance Liquid Chromatography (HPLC) and Mass Spectrometry (MS). Batches currently in analytical processing are transparently designated as <em>"Report Pending"</em>.
          </p>
        </div>
      </section>

      {/* 03 Main Repository Explorer */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
        
        {/* Search & Filter Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="w-full md:max-w-md relative">
            <input
              type="text"
              placeholder="Search by lot (e.g. RT-2609A) or compound..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] text-xs sm:text-sm text-[#0b1f3a] placeholder-[#94a3b8] focus:outline-hidden focus:border-[#16a6a3] focus:bg-white transition-all shadow-xs"
            />
            <span className="absolute left-3.5 top-3.5 text-sm text-[#94a3b8]">🔍</span>
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3.5 top-3.5 text-xs text-[#94a3b8] hover:text-[#0b1f3a]"
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
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
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

        {/* Download notification pill */}
        {downloadSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center justify-between animate-in fade-in">
            <span>✓ Official Certified COA PDF for Batch #{downloadSuccess} initiated.</span>
            <span className="font-mono text-[10px] text-emerald-600">Secure Hash Verified</span>
          </div>
        )}

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-3xl border border-[#e2e8f0] p-6 sm:p-7 shadow-xs hover:border-[#16a6a3] transition-all flex flex-col justify-between space-y-6 group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-[#0b1f3a] px-2.5 py-1 rounded-lg bg-[#f1f5f9]">
                    Lot #{report.batchNumber}
                  </span>
                  {report.status === "verified" ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200 flex items-center gap-1">
                      <span>✓</span>
                      <span>HPLC {report.purityPercent}%</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200 flex items-center gap-1">
                      <span>⏳</span>
                      <span>Report Pending</span>
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-[#0b1f3a] group-hover:text-[#16a6a3] transition-colors">
                    {report.productName}
                  </h3>
                  <p className="text-[11px] text-[#64748b] font-mono mt-0.5">
                    Compound ID: {report.compoundCode} • {report.category.toUpperCase()}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2 text-xs text-[#64748b]">
                  <div className="flex justify-between">
                    <span className="text-[#94a3b8]">Accredited Lab:</span>
                    <span className="font-semibold text-[#0b1f3a]">{report.laboratory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#94a3b8]">Synthesis Date:</span>
                    <span className="text-[#0b1f3a] font-mono">{report.synthesisDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#94a3b8]">Test Date:</span>
                    <span className="text-[#0b1f3a] font-mono">{report.testDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#94a3b8]">Theoretical MW:</span>
                    <span className="font-mono text-[#0b1f3a]">{report.theoreticalMw} Da</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                {report.status === "verified" ? (
                  <>
                    <button
                      onClick={() => setInspectingReport(report)}
                      className="w-full py-2.5 rounded-xl bg-[#0b1f3a] hover:bg-[#16a6a3] text-white text-xs font-bold transition-all text-center shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <span>Inspect Lab Certificate</span>
                      <span>↗</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(report.batchNumber)}
                        className="w-1/2 py-2 rounded-xl bg-white border border-[#e2e8f0] hover:border-[#0b1f3a] text-xs font-semibold text-[#0b1f3a] transition-colors"
                      >
                        Download PDF
                      </button>
                      <Link
                        href={`/verify?batch=${report.batchNumber}`}
                        className="w-1/2 py-2 rounded-xl bg-[#f1f5f9] hover:bg-[#e2e8f0] text-xs font-semibold text-[#0b1f3a] text-center transition-colors"
                      >
                        Verify Seal
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="p-3 rounded-xl bg-[#f8fafc] border border-dashed border-[#cbd5e1] text-center text-xs text-[#94a3b8]">
                    Chromatography In Active Analysis
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <div className="p-16 text-center rounded-3xl border border-dashed border-[#cbd5e1] bg-white space-y-3">
            <div className="text-4xl">📄</div>
            <h3 className="font-bold text-base text-[#0b1f3a]">No COA reports match "{query}"</h3>
            <p className="text-xs text-[#64748b] max-w-sm mx-auto">
              Please check your batch number on your product label or contact support at <a href="mailto:info@peptech.bio" className="text-[#16a6a3] underline">info@peptech.bio</a>.
            </p>
          </div>
        )}
      </div>

      {/* 04 Interactive COA Inspection Modal */}
      {inspectingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1f3a]/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#e2e8f0] max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#e2e8f0] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#16a6a3]/10 text-[#16a6a3] font-mono uppercase">
                    CERTIFIED LAB AUDIT
                  </span>
                  <span className="text-xs text-[#64748b] font-mono">Lot #{inspectingReport.batchNumber}</span>
                </div>
                <h3 className="text-xl font-black text-[#0b1f3a] mt-1">{inspectingReport.productName}</h3>
              </div>
              <button
                onClick={() => setInspectingReport(null)}
                className="w-8 h-8 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#64748b] flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Test Specifications Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-0.5">
                <span className="text-[10px] font-semibold text-[#94a3b8] uppercase">Purity (HPLC)</span>
                <div className="font-mono text-base font-bold text-emerald-600">{inspectingReport.purityPercent}%</div>
              </div>
              <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-0.5">
                <span className="text-[10px] font-semibold text-[#94a3b8] uppercase">Theoretical MW</span>
                <div className="font-mono text-base font-bold text-[#0b1f3a]">{inspectingReport.theoreticalMw} Da</div>
              </div>
              <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-0.5">
                <span className="text-[10px] font-semibold text-[#94a3b8] uppercase">Observed MW</span>
                <div className="font-mono text-base font-bold text-[#0b1f3a]">{inspectingReport.observedMw} Da</div>
              </div>
              <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-0.5">
                <span className="text-[10px] font-semibold text-[#94a3b8] uppercase">Analysis Date</span>
                <div className="font-mono text-xs font-bold text-[#0b1f3a] pt-1">{inspectingReport.testDate}</div>
              </div>
            </div>

            {/* Simulated HPLC Chromatogram Curve */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#0b1f3a]">HPLC Chromatogram (Reversed-Phase C18)</span>
                <span className="font-mono text-emerald-600 font-semibold">Single Sharp Peak • No Secondary Contaminants</span>
              </div>
              <div className="h-40 rounded-2xl bg-[#0b1f3a] p-4 flex flex-col justify-between relative overflow-hidden">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>mAU (Absorbance @ 214nm)</span>
                  <span>Retention Time: 14.82 min</span>
                </div>
                {/* SVG Curve Graphic */}
                <svg className="w-full h-24 overflow-visible" viewBox="0 0 500 100" preserveAspectRatio="none">
                  <path
                    d="M 0,95 L 180,95 Q 230,94 240,70 Q 250,5 252,5 Q 254,5 264,70 Q 274,94 320,95 L 500,95"
                    fill="none"
                    stroke="#16a6a3"
                    strokeWidth="3"
                  />
                  <path
                    d="M 180,95 Q 230,94 240,70 Q 250,5 252,5 Q 254,5 264,70 Q 274,94 320,95 Z"
                    fill="rgba(22, 166, 163, 0.15)"
                  />
                </svg>
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>0 min</span>
                  <span>Peak Area: {inspectingReport.purityPercent}%</span>
                  <span>30 min</span>
                </div>
              </div>
            </div>

            {/* Laboratory Sign-off & Seal */}
            <div className="p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="font-bold text-[#0b1f3a]">{inspectingReport.laboratory}</div>
                <div className="text-[#64748b]">Analytical Testing Department • Certified by Lead Chemist Dr. P. Thorne, CChem MRSC</div>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold font-mono text-xs border border-emerald-300 shrink-0">
                AUDITED &amp; APPROVED ✓
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  handleDownload(inspectingReport.batchNumber)
                  setInspectingReport(null)
                }}
                className="w-1/2 py-3 rounded-xl bg-[#0b1f3a] hover:bg-[#16a6a3] text-white font-bold text-xs transition-colors text-center"
              >
                Download Certified COA PDF
              </button>
              <Link
                href={`/verify?batch=${inspectingReport.batchNumber}`}
                className="w-1/2 py-3 rounded-xl bg-[#16a6a3] hover:bg-[#138e8c] text-white font-bold text-xs transition-colors text-center shadow-xs"
              >
                Inspect Packaging Security Seal →
              </Link>
            </div>

          </div>
        </div>
      )}
    </main>
  )
}
