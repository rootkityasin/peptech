"use client"

import React, { useState } from "react"
import Link from "next/link"

interface CompoundSpec {
  name: string
  code: string
  casNumber: string
  formula: string
  molecularWeight: string
  purity: string
  storage: string
  appearance: string
  testingLab: string
  batch: string
  method: string
  sequence: string
}

const SPECS: CompoundSpec[] = [
  {
    name: "Retatrutide",
    code: "RT-10",
    casNumber: "2381089-83-2",
    formula: "C223H343N53O70",
    molecularWeight: "4731.33 g/mol",
    purity: "≥ 99.4% (HPLC)",
    storage: "-20°C dry & dark (protect from light)",
    appearance: "White to off-white lyophilised powder",
    testingLab: "Alliance Analytical Services UK",
    batch: "RT-2609A",
    method: "Reversed-Phase HPLC / Electrospray Ionization MS",
    sequence: "Tyr-Aib-Glu-Gly-Thr-Phe-Thr-Ser-Asp-Val-Ser-Ser-Tyr-Leu-Glu-Gly-Gln-Ala-Ala-Lys(AEEAc-AEEAc-γ-Glu-C20-diacid)-Glu-Phe-Ile-Ala-Trp-Leu-Val-Arg-Gly-Arg-Gly",
  },
  {
    name: "Tirzepatide",
    code: "TR-15",
    casNumber: "2023788-19-2",
    formula: "C225H348N48O68",
    molecularWeight: "4813.45 g/mol",
    purity: "≥ 99.2% (HPLC)",
    storage: "-20°C dry & dark (protect from light)",
    appearance: "White to off-white lyophilised powder",
    testingLab: "Alliance Analytical Services UK",
    batch: "TR-2609B",
    method: "Reversed-Phase HPLC / Mass Spectrometry",
    sequence: "Tyr-Aib-Glu-Gly-Thr-Phe-Thr-Ser-Asp-Tyr-Ser-Ile-Aib-Leu-Asp-Lys-Ile-Ala-Gln-Lys(AEEAc-AEEAc-γ-Glu-C20-diacid)-Ala-Phe-Val-Gln-Trp-Leu-Ile-Ala-Gly-Gly-Pro-Ser-Ser-Gly-Ala-Pro-Pro-Pro-Ser-NH2",
  },
  {
    name: "Semaglutide",
    code: "SM-10",
    casNumber: "910463-68-2",
    formula: "C187H291N45O59",
    molecularWeight: "4113.58 g/mol",
    purity: "≥ 99.5% (HPLC)",
    storage: "-20°C dry & dark (protect from light)",
    appearance: "White to off-white lyophilised powder",
    testingLab: "Alliance Analytical Services UK",
    batch: "SM-2609A",
    method: "Reversed-Phase HPLC / MS ESI+",
    sequence: "His-Aib-Glu-Gly-Thr-Phe-Thr-Ser-Asp-Val-Ser-Ser-Tyr-Leu-Glu-Gly-Gln-Ala-Ala-Lys(AEEAc-AEEAc-γ-Glu-C18-diacid)-Glu-Phe-Ile-Ala-Trp-Leu-Val-Arg-Gly-Arg-Gly",
  },
  {
    name: "BPC-157",
    code: "BC5",
    casNumber: "137525-51-0",
    formula: "C62H98N16O22",
    molecularWeight: "1419.53 g/mol",
    purity: "≥ 99.1% (HPLC)",
    storage: "-20°C dry & dark",
    appearance: "Lyophilised crystalline solid",
    testingLab: "Alliance Analytical Services UK",
    batch: "BC-2609",
    method: "HPLC-UV / MS",
    sequence: "Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val",
  },
]

export function CompoundSpecCard() {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const spec = SPECS[selectedIdx]

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Section Header */}
      <div className="text-center sm:text-left space-y-1">
        <div className="text-[11px] font-bold text-[var(--color-brand-teal)] uppercase tracking-wider">
          Scientific Transparency &amp; Assay Data
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
          Compound Technical Specifications
        </h2>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
          Analytical laboratory characterization data for chemical identification and reproducibility.
        </p>
      </div>

      {/* Compound Switcher Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {SPECS.map((s, idx) => (
          <button
            key={s.code}
            onClick={() => setSelectedIdx(idx)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedIdx === idx
                ? "bg-[var(--color-brand-navy)] text-white shadow-xs"
                : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50"
            }`}
          >
            {s.name} ({s.purity})
          </button>
        ))}
      </div>

      {/* Main Spec Card (Screenshot 2 Architecture) */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-md p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Spec Data Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div>
              <span className="text-[10px] font-mono text-zinc-400">BATCH IDENTIFIER</span>
              <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100">{spec.name} — {spec.batch}</h3>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              Verified {spec.purity}
            </span>
          </div>

          {/* Key Metric Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 space-y-0.5">
              <span className="text-[10px] font-mono text-zinc-400 block">CAS REGISTRY NUMBER</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">{spec.casNumber}</span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 space-y-0.5">
              <span className="text-[10px] font-mono text-zinc-400 block">MOLECULAR WEIGHT</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">{spec.molecularWeight}</span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 space-y-0.5">
              <span className="text-[10px] font-mono text-zinc-400 block">CHEMICAL FORMULA</span>
              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{spec.formula}</span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 space-y-0.5">
              <span className="text-[10px] font-mono text-zinc-400 block">RECOMMENDED STORAGE</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">{spec.storage}</span>
            </div>
          </div>

          {/* Sequence string */}
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 space-y-1">
            <span className="text-[10px] font-mono text-zinc-400 block uppercase">Peptide Amino Acid Sequence</span>
            <p className="font-mono text-[10px] text-zinc-600 dark:text-zinc-300 break-all leading-relaxed">
              {spec.sequence}
            </p>
          </div>
        </div>

        {/* Right Column: Chemical Structure & Lab Report Action */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700/60 space-y-4 text-center flex flex-col justify-between">
          <div className="space-y-2">
            <div className="aspect-16/9 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center p-4">
              {/* Chemical Structure Icon / Diagram */}
              <div className="text-4xl mb-1">⬡─⬡─⬡</div>
              <span className="text-[10px] font-mono text-zinc-400">
                Molecular Structure Diagram ({spec.code})
              </span>
              <span className="text-[9px] text-emerald-600 font-semibold mt-1">
                Validated via {spec.method}
              </span>
            </div>

            <div className="text-xs text-zinc-500 space-y-0.5 pt-1">
              <div>Laboratory: <strong className="text-zinc-800 dark:text-zinc-200">{spec.testingLab}</strong></div>
              <div>Batch Number: <strong className="font-mono text-zinc-800 dark:text-zinc-200">{spec.batch}</strong></div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Link
              href="/lab-reports"
              className="w-full py-2.5 rounded-xl bg-[var(--color-brand-navy)] hover:bg-[var(--color-brand-slate)] text-white text-xs font-bold transition-all shadow-xs block text-center"
            >
              Download Verified COA PDF ↗
            </Link>
            <Link
              href="/verify"
              className="w-full py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 block text-center text-zinc-700 dark:text-zinc-300"
            >
              Scan Packaging QR Code
            </Link>
          </div>
        </div>

      </div>

    </section>
  )
}
