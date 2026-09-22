"use client"

import React from "react"
import Link from "next/link"
import { CatalogProduct } from "@/data/catalog"

interface ProductTechnicalSpecsProps {
  product: CatalogProduct
}

export function ProductTechnicalSpecs({ product }: ProductTechnicalSpecsProps) {
  if (product.format === "refill-cartridge") {
    return (
      <section className="bg-white py-[40px] sm:py-[60px] flex items-center justify-center border-t border-[#e2e8f0]">
        <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            
            {/* Card 1: Cartridge Engineering */}
            <div className="bg-[#f0f6fa] rounded-[16px] p-[24px] flex flex-col justify-between h-[420px]">
              <div>
                <h3 className="font-bold text-[#0b1f3a] text-[18px]">
                  Cartridge Engineering
                </h3>
                <p className="text-[12px] text-[#64748b] mt-1">
                  Precision-molded for the PEPTECH® Pen System
                </p>
                <div className="flex flex-col gap-[12px] mt-5">
                  <div className="flex items-start gap-3">
                    <span className="text-[#16a6a3] font-bold text-[14px]">✓</span>
                    <div>
                      <p className="font-bold text-[#0b1f3a] text-[13px]">Borosilicate Type I Glass</p>
                      <p className="text-[#64748b] text-[11px]">Chemically inert, zero leaching glass chamber</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#16a6a3] font-bold text-[14px]">✓</span>
                    <div>
                      <p className="font-bold text-[#0b1f3a] text-[13px]">1.5 mL Precision Volume</p>
                      <p className="text-[#64748b] text-[11px]">Factory filled under sterile laminar airflow</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#16a6a3] font-bold text-[14px]">✓</span>
                    <div>
                      <p className="font-bold text-[#0b1f3a] text-[13px]">60-Unit Calibration</p>
                      <p className="text-[#64748b] text-[11px]">Matches PEPTECH reusable pen mechanical dial</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#16a6a3] font-bold text-[14px]">✓</span>
                    <div>
                      <p className="font-bold text-[#0b1f3a] text-[13px]">High-Resilience Septum</p>
                      <p className="text-[#64748b] text-[11px]">Bromobutyl rubber septum with multi-pierce seal</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-[#dce6ee]">
                <span className="text-[11px] font-semibold text-[#0b1f3a]">
                  Form Factor: Refill Cartridge (28-Day Standard)
                </span>
              </div>
            </div>

            {/* Card 2: Chemical & Quality Profile */}
            <div className="bg-[#f0f6fa] rounded-[16px] p-[24px] flex flex-col justify-between h-[420px]">
              <div>
                <h3 className="font-bold text-[#0b1f3a] text-[18px]">
                  Quality &amp; Specifications
                </h3>
                <p className="text-[12px] text-[#64748b] mt-1">
                  Verified by independent third-party laboratories
                </p>
                <div className="flex flex-col gap-[10px] mt-5">
                  <div className="flex items-center justify-between py-1 border-b border-[#e2e8f0]/60 text-[12px]">
                    <span className="text-[#64748b]">HPLC Purity</span>
                    <span className="font-bold text-[#16a6a3]">≥ 99.0% Certified</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[#e2e8f0]/60 text-[12px]">
                    <span className="text-[#64748b]">Analytical Mass</span>
                    <span className="font-bold text-[#0b1f3a]">Sequence Confirmed (MS)</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[#e2e8f0]/60 text-[12px]">
                    <span className="text-[#64748b]">Endotoxin Testing</span>
                    <span className="font-bold text-[#0b1f3a]">&lt; 0.05 EU/mg</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[#e2e8f0]/60 text-[12px]">
                    <span className="text-[#64748b]">Recommended Storage</span>
                    <span className="font-bold text-[#0b1f3a]">2°C – 8°C (Refrigerated)</span>
                  </div>
                  <div className="flex items-center justify-between py-1 text-[12px]">
                    <span className="text-[#64748b]">Batch Code</span>
                    <span className="font-mono font-bold text-[#0b1f3a]">CRT-2026-08B</span>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-[#dce6ee]">
                <Link
                  href={`/lab-reports?search=${encodeURIComponent(product.name)}`}
                  className="text-[12px] font-bold text-[#16a6a3] hover:underline flex items-center gap-1"
                >
                  <span>Search HPLC Certificate of Analysis</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Card 3: Lab Verification & Compliance */}
            <div className="bg-[#0b1f3a] text-white rounded-[16px] p-[24px] flex flex-col justify-between h-[420px] shadow-sm">
              <div>
                <span className="bg-[#00c5a0]/20 text-[#00c5a0] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  RUO COMPLIANCE
                </span>
                <h3 className="font-bold text-white text-[18px] mt-2">
                  Scientific Research Standard
                </h3>
                <p className="text-[12px] text-slate-300 mt-1 leading-[18px]">
                  All PEPTECH® items are strictly distributed for in-vitro laboratory analysis, molecular modeling, and scientific evaluation.
                </p>
                <div className="flex flex-col gap-2.5 mt-5">
                  <div className="bg-white/10 rounded-lg p-2.5 flex items-center gap-2.5">
                    <span className="text-[#00c5a0] text-[16px] font-bold">🔒</span>
                    <span className="text-[12px] text-slate-200">18+ Age Restricted Scientific Portal</span>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2.5 flex items-center gap-2.5">
                    <span className="text-[#00c5a0] text-[16px] font-bold">📱</span>
                    <span className="text-[12px] text-slate-200">QR Batch Authentication on Packaging</span>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2.5 flex items-center gap-2.5">
                    <span className="text-[#00c5a0] text-[16px] font-bold">📦</span>
                    <span className="text-[12px] text-slate-200">Discreet Protective Outer Packaging</span>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <Link href="/verify" className="text-[12px] font-bold text-[#00c5a0] hover:underline flex items-center gap-1">
                  <span>Verify Packaging QR</span>
                  <span>→</span>
                </Link>
                <span className="text-[11px] text-slate-400">peptech.bio</span>
              </div>
            </div>

          </div>
        </div>
      </section>
    )
  }

  if (product.format === "freeze-dried-vial") {
    return (
      <section className="bg-white py-[40px] sm:py-[60px] flex items-center justify-center border-t border-[#e2e8f0]">
        <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            
            {/* Card 1: Lyophilised Formulation */}
            <div className="bg-[#f0f6fa] rounded-[16px] p-[24px] flex flex-col justify-between h-[420px]">
              <div>
                <h3 className="font-bold text-[#0b1f3a] text-[18px]">
                  Lyophilised Formulation
                </h3>
                <p className="text-[12px] text-[#64748b] mt-1">
                  Vacuum freeze-dried scientific cake
                </p>
                <div className="flex flex-col gap-[12px] mt-5">
                  <div className="flex items-start gap-3">
                    <span className="text-[#16a6a3] font-bold text-[14px]">✓</span>
                    <div>
                      <p className="font-bold text-[#0b1f3a] text-[13px]">Pure Peptide Cake</p>
                      <p className="text-[#64748b] text-[11px]">Free of excessive excipients or binders</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#16a6a3] font-bold text-[14px]">✓</span>
                    <div>
                      <p className="font-bold text-[#0b1f3a] text-[13px]">Inert Nitrogen Crimp</p>
                      <p className="text-[#64748b] text-[11px]">Prevents oxidative degradation during transport</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#16a6a3] font-bold text-[14px]">✓</span>
                    <div>
                      <p className="font-bold text-[#0b1f3a] text-[13px]">Chlorobutyl Stopper</p>
                      <p className="text-[#64748b] text-[11px]">Sterile multi-dose reconstitution compatibility</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#16a6a3] font-bold text-[14px]">✓</span>
                    <div>
                      <p className="font-bold text-[#0b1f3a] text-[13px]">Standard Diluent Soluble</p>
                      <p className="text-[#64748b] text-[11px]">Easily reconstitutes in bacteriostatic water</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-[#dce6ee]">
                <span className="text-[11px] font-semibold text-[#0b1f3a]">
                  Form Factor: Lyophilised Powder (Sealed Glass Vial)
                </span>
              </div>
            </div>

            {/* Card 2: Quality & Storage */}
            <div className="bg-[#f0f6fa] rounded-[16px] p-[24px] flex flex-col justify-between h-[420px]">
              <div>
                <h3 className="font-bold text-[#0b1f3a] text-[18px]">
                  Quality &amp; Handling
                </h3>
                <p className="text-[12px] text-[#64748b] mt-1">
                  Analytical storage and stability specifications
                </p>
                <div className="flex flex-col gap-[10px] mt-5">
                  <div className="flex items-center justify-between py-1 border-b border-[#e2e8f0]/60 text-[12px]">
                    <span className="text-[#64748b]">HPLC Purity</span>
                    <span className="font-bold text-[#16a6a3]">≥ 99.2% Certified</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[#e2e8f0]/60 text-[12px]">
                    <span className="text-[#64748b]">Long-Term Storage</span>
                    <span className="font-bold text-[#0b1f3a]">-20°C (Up to 24 Months)</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[#e2e8f0]/60 text-[12px]">
                    <span className="text-[#64748b]">Reconstituted Storage</span>
                    <span className="font-bold text-[#0b1f3a]">2°C – 8°C (Use within 28 days)</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[#e2e8f0]/60 text-[12px]">
                    <span className="text-[#64748b]">Testing Standard</span>
                    <span className="font-bold text-[#0b1f3a]">HPLC + LC-MS Validated</span>
                  </div>
                  <div className="flex items-center justify-between py-1 text-[12px]">
                    <span className="text-[#64748b]">Batch Code</span>
                    <span className="font-mono font-bold text-[#0b1f3a]">VIAL-2026-04A</span>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-[#dce6ee]">
                <Link
                  href={`/lab-reports?search=${encodeURIComponent(product.name)}`}
                  className="text-[12px] font-bold text-[#16a6a3] hover:underline flex items-center gap-1"
                >
                  <span>Search HPLC Certificate of Analysis</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Card 3: RUO Compliance */}
            <div className="bg-[#0b1f3a] text-white rounded-[16px] p-[24px] flex flex-col justify-between h-[420px] shadow-sm">
              <div>
                <span className="bg-[#00c5a0]/20 text-[#00c5a0] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  RUO COMPLIANCE
                </span>
                <h3 className="font-bold text-white text-[18px] mt-2">
                  Laboratory Research Notice
                </h3>
                <p className="text-[12px] text-slate-300 mt-1 leading-[18px]">
                  Lyophilised vials are intended solely for qualified researchers and scientific laboratories. Zero human consumption or therapeutic claims.
                </p>
                <div className="flex flex-col gap-2.5 mt-5">
                  <div className="bg-white/10 rounded-lg p-2.5 flex items-center gap-2.5">
                    <span className="text-[#00c5a0] text-[16px] font-bold">🧪</span>
                    <span className="text-[12px] text-slate-200">Analytical Reference Standard</span>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2.5 flex items-center gap-2.5">
                    <span className="text-[#00c5a0] text-[16px] font-bold">📋</span>
                    <span className="text-[12px] text-slate-200">Batch COA Available Online</span>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2.5 flex items-center gap-2.5">
                    <span className="text-[#00c5a0] text-[16px] font-bold">❄️</span>
                    <span className="text-[12px] text-slate-200">Thermal Controlled Dispatch Available</span>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <Link href="/verify" className="text-[12px] font-bold text-[#00c5a0] hover:underline flex items-center gap-1">
                  <span>Verify Batch Authenticity</span>
                  <span>→</span>
                </Link>
                <span className="text-[11px] text-slate-400">peptech.bio</span>
              </div>
            </div>

          </div>
        </div>
      </section>
    )
  }

  // Fallback to Pen Set Specs Grid
  return null
}
