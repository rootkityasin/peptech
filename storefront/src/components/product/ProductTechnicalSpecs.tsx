"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { CatalogProduct } from "@/data/catalog"

interface ProductTechnicalSpecsProps {
  product: CatalogProduct
}

const KIT_ICONS = {
  pen: "/images/figma/f7e11058d1753109f40f4579d5a46a9f287d2f2d.svg",
  cartridge: "/images/figma/298fba2a8f49bbc8af7bea655eafec9240750d9e.svg",
  needle: "/images/figma/a83ffce70a350043217c379ed1e6ac5bf3ed89aa.svg",
  prep: "/images/figma/e447f75c001f7ad49918c6dd48d0219d69a220e1.svg",
  passport: "/images/figma/76231626c15b815c695ea47c5d56c318fc3efe2b.svg",
  vial: "/images/figma/298fba2a8f49bbc8af7bea655eafec9240750d9e.svg",
}

export function ProductTechnicalSpecs({ product }: ProductTechnicalSpecsProps) {
  const specs = product.technicalSpecs
  const format = product.format

  const sectionHeading =
    format === "complete-pen-set"
      ? "Inside the Pen"
      : format === "refill-cartridge"
      ? "Inside the Refill Cartridge"
      : "Inside the Vial"

  const sectionSubtitle =
    format === "complete-pen-set"
      ? "The molecular profile, verified analytical characteristics, and precision engineering tolerances."
      : format === "refill-cartridge"
      ? "Borosilicate Type I glass engineering tolerances and verified compound analytical profile."
      : "Pure vacuum freeze-dried scientific cake, molecular characteristics, and storage requirements."

  return (
    <section className="bg-white py-[48px] sm:py-[64px] flex items-center justify-center border-t border-[#e2e8f0]">
      <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-[36px] sm:mb-[48px]">
          <h2 className="font-extrabold text-[#0b1f3a] text-[26px] sm:text-[34px] tracking-tight">
            {sectionHeading}
          </h2>
          <p className="text-[13px] sm:text-[14px] text-[#64748b] max-w-[680px] mt-2 leading-[22px]">
            {sectionSubtitle}
          </p>
        </div>

        {/* 3-Card Technical Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Card 1: Hardware / Delivery System / Formulation */}
          {format === "complete-pen-set" && (
            <div className="bg-[#f0f6fa] rounded-[16px] p-[24px] sm:p-[28px] flex flex-col justify-between min-h-[460px] border border-[#e2e8f0]/80 shadow-2xs">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[#0b1f3a] text-[18px]">
                    PEPTECH® Precision Kit
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#0b1f3a] border border-[#cbd5e1]">
                    COMPLETE KIT
                  </span>
                </div>
                <p className="text-[12px] text-[#64748b] mt-1.5">
                  Reusable precision laboratory device &amp; testing hardware
                </p>

                <div className="flex flex-col gap-[18px] sm:gap-[20px] mt-6">
                  <div className="flex items-start gap-3.5">
                    <div className="size-[22px] shrink-0 mt-0.5 flex items-center justify-center">
                      <img src={KIT_ICONS.pen} alt="" className="size-full object-contain" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-[#0b1f3a] text-[13px] leading-snug">Reusable Precision Pen</p>
                      <p className="text-[#64748b] text-[11.5px] leading-relaxed">Aircraft-grade anodized aluminum body with micro-click dial</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3.5">
                    <div className="size-[22px] shrink-0 mt-0.5 flex items-center justify-center">
                      <img src={KIT_ICONS.cartridge} alt="" className="size-full object-contain" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-[#0b1f3a] text-[13px] leading-snug">1× Pre-filled Cartridge</p>
                      <p className="text-[#64748b] text-[11.5px] leading-relaxed">1.5 mL Borosilicate Type I glass pre-loaded under laminar airflow</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3.5">
                    <div className="size-[22px] shrink-0 mt-0.5 flex items-center justify-center">
                      <img src={KIT_ICONS.needle} alt="" className="size-full object-contain" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-[#0b1f3a] text-[13px] leading-snug">4× 31G 5mm Sterile Needles</p>
                      <p className="text-[#64748b] text-[11.5px] leading-relaxed">Ultra-fine, individually blister-sealed laboratory needles</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3.5">
                    <div className="size-[22px] shrink-0 mt-0.5 flex items-center justify-center">
                      <img src={KIT_ICONS.prep} alt="" className="size-full object-contain" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-[#0b1f3a] text-[13px] leading-snug">4× Alcohol Prep Pads</p>
                      <p className="text-[#64748b] text-[11.5px] leading-relaxed">70% Isopropyl USP grade laboratory surface prep pads</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3.5">
                    <div className="size-[22px] shrink-0 mt-0.5 flex items-center justify-center">
                      <img src={KIT_ICONS.passport} alt="" className="size-full object-contain" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-[#0b1f3a] text-[13px] leading-snug">Device Passport &amp; Storage Case</p>
                      <p className="text-[#64748b] text-[11.5px] leading-relaxed">Serial authenticity card with packaging QR verification</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-[#dce6ee] flex items-center justify-between text-[11.5px]">
                <span className="font-semibold text-[#0b1f3a]">
                  Format: Complete Reusable Pen Kit
                </span>
                <span className="text-[#16a6a3] font-bold">One-Time Only</span>
              </div>
            </div>
          )}

          {format === "refill-cartridge" && (
            <div className="bg-[#f0f6fa] rounded-[16px] p-[24px] sm:p-[28px] flex flex-col justify-between min-h-[460px] border border-[#e2e8f0]/80 shadow-2xs">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[#0b1f3a] text-[18px]">
                    Cartridge Engineering
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#0b1f3a] border border-[#cbd5e1]">
                    BOROSILICATE TYPE I
                  </span>
                </div>
                <p className="text-[12px] text-[#64748b] mt-1.5">
                  Precision-molded for the PEPTECH® Reusable Pen System
                </p>

                <div className="flex flex-col gap-[20px] sm:gap-[24px] mt-6">
                  <div className="flex items-start gap-3.5">
                    <div className="size-[22px] shrink-0 mt-0.5 flex items-center justify-center">
                      <img src={KIT_ICONS.cartridge} alt="" className="size-full object-contain" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-[#0b1f3a] text-[13px] leading-snug">Borosilicate Type I Glass</p>
                      <p className="text-[#64748b] text-[11.5px] leading-relaxed">Chemically inert, zero-leaching pharmaceutical glass chamber</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3.5">
                    <div className="size-[22px] shrink-0 mt-0.5 flex items-center justify-center">
                      <img src={KIT_ICONS.cartridge} alt="" className="size-full object-contain" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-[#0b1f3a] text-[13px] leading-snug">1.5 mL Precision Volume</p>
                      <p className="text-[#64748b] text-[11.5px] leading-relaxed">Pre-filled under sterile ISO 5 laminar airflow environment</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3.5">
                    <div className="size-[22px] shrink-0 mt-0.5 flex items-center justify-center">
                      <img src={KIT_ICONS.pen} alt="" className="size-full object-contain" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-[#0b1f3a] text-[13px] leading-snug">60-Unit Calibration</p>
                      <p className="text-[#64748b] text-[11.5px] leading-relaxed">Exact mechanical match for PEPTECH reusable pen dial</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3.5">
                    <div className="size-[22px] shrink-0 mt-0.5 flex items-center justify-center">
                      <img src={KIT_ICONS.needle} alt="" className="size-full object-contain" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-[#0b1f3a] text-[13px] leading-snug">Multi-Pierce Septum</p>
                      <p className="text-[#64748b] text-[11.5px] leading-relaxed">Medical-grade bromobutyl rubber septum with reseal memory</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-[#dce6ee] flex items-center justify-between text-[11.5px]">
                <span className="font-semibold text-[#0b1f3a]">
                  Compatibility: PEPTECH Reusable Pen
                </span>
                <span className="text-[#16a6a3] font-bold">28-Day Sub Available</span>
              </div>
            </div>
          )}

          {format === "freeze-dried-vial" && (
            <div className="bg-[#f0f6fa] rounded-[16px] p-[24px] sm:p-[28px] flex flex-col justify-between min-h-[460px] border border-[#e2e8f0]/80 shadow-2xs">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[#0b1f3a] text-[18px]">
                    Lyophilised Formulation
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#0b1f3a] border border-[#cbd5e1]">
                    NITROGEN CRIMPT
                  </span>
                </div>
                <p className="text-[12px] text-[#64748b] mt-1.5">
                  Vacuum freeze-dried scientific reference cake
                </p>

                <div className="flex flex-col gap-[20px] sm:gap-[24px] mt-6">
                  <div className="flex items-start gap-3.5">
                    <div className="size-[22px] shrink-0 mt-0.5 flex items-center justify-center">
                      <img src={KIT_ICONS.vial} alt="" className="size-full object-contain" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-[#0b1f3a] text-[13px] leading-snug">Pure Peptide Cake</p>
                      <p className="text-[#64748b] text-[11.5px] leading-relaxed">Free of excessive excipients, binders, or unverified stabilizers</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3.5">
                    <div className="size-[22px] shrink-0 mt-0.5 flex items-center justify-center">
                      <img src={KIT_ICONS.vial} alt="" className="size-full object-contain" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-[#0b1f3a] text-[13px] leading-snug">Inert Nitrogen Atmosphere</p>
                      <p className="text-[#64748b] text-[11.5px] leading-relaxed">Hermetically sealed under dry nitrogen to prevent oxidation</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3.5">
                    <div className="size-[22px] shrink-0 mt-0.5 flex items-center justify-center">
                      <img src={KIT_ICONS.needle} alt="" className="size-full object-contain" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-[#0b1f3a] text-[13px] leading-snug">Chlorobutyl Stopper</p>
                      <p className="text-[#64748b] text-[11.5px] leading-relaxed">Multi-entry sterile elastomer stopper with aluminum flip-off cap</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3.5">
                    <div className="size-[22px] shrink-0 mt-0.5 flex items-center justify-center">
                      <img src={KIT_ICONS.prep} alt="" className="size-full object-contain" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-[#0b1f3a] text-[13px] leading-snug">Rapid Reconstitution</p>
                      <p className="text-[#64748b] text-[11.5px] leading-relaxed">Dissolves clearly with standard bacteriostatic water USP</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-[#dce6ee] flex items-center justify-between text-[11.5px]">
                <span className="font-semibold text-[#0b1f3a]">
                  Form Factor: Lyophilised Glass Vial
                </span>
                <span className="text-[#16a6a3] font-bold">28-Day Sub Available</span>
              </div>
            </div>
          )}

          {/* Card 2: Technical Specifications Table */}
          <div className="bg-[#f0f6fa] rounded-[16px] p-[24px] sm:p-[28px] flex flex-col justify-between min-h-[460px] border border-[#e2e8f0]/80 shadow-2xs">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#0b1f3a] text-[18px]">
                  Technical Specifications
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#0b1f3a] border border-[#cbd5e1]">
                  ≥ 99.0% HPLC
                </span>
              </div>
              <p className="text-[12px] text-[#64748b] mt-1">
                Verified laboratory analytical characteristics
              </p>

              {/* Clean White Specification Table */}
              <div className="bg-white border border-[#e2e8f0] rounded-[12px] divide-y divide-[#edf2f7] text-[12px] sm:text-[12.5px] overflow-hidden mt-4 shadow-2xs">
                {/* Compound */}
                <div className="py-2.5 sm:py-3 px-3.5 sm:px-4 flex items-start justify-between gap-3">
                  <span className="font-bold text-[#0b1f3a] shrink-0">Compound</span>
                  <span className="text-[#334155] font-semibold text-right break-words flex-1 pl-3">
                    {specs?.compoundName || product.name}
                  </span>
                </div>

                {/* Ratio (if exists) */}
                {specs?.ratio && (
                  <div className="py-2.5 sm:py-3 px-3.5 sm:px-4 flex items-center justify-between gap-3">
                    <span className="font-bold text-[#0b1f3a] shrink-0">Ratio</span>
                    <span className="text-[#16a6a3] font-bold text-right">
                      {specs.ratio}
                    </span>
                  </div>
                )}

                {/* Total Content (if exists) */}
                {specs?.totalContent && (
                  <div className="py-2.5 sm:py-3 px-3.5 sm:px-4 flex items-center justify-between gap-3">
                    <span className="font-bold text-[#0b1f3a] shrink-0">Total Content</span>
                    <span className="text-[#334155] font-medium text-right">
                      {specs.totalContent}
                    </span>
                  </div>
                )}

                {/* Contents / Strength */}
                <div className="py-2.5 sm:py-3 px-3.5 sm:px-4 flex items-start justify-between gap-3">
                  <span className="font-bold text-[#0b1f3a] shrink-0">Contents / Strength</span>
                  <span className="text-[#334155] font-medium text-right leading-snug break-words flex-1 pl-3">
                    {specs?.contentsOrStrength || product.contents || "Specification Pending"}
                  </span>
                </div>

                {/* Peptide Class */}
                <div className="py-2.5 sm:py-3 px-3.5 sm:px-4 flex items-start justify-between gap-3">
                  <span className="font-bold text-[#0b1f3a] shrink-0">Peptide Class</span>
                  <span className="text-[#334155] font-medium text-right leading-snug break-words flex-1 pl-3">
                    {specs?.peptideClass || "Specification Pending"}
                  </span>
                </div>

                {/* Molecular Weight */}
                <div className="py-2.5 sm:py-3 px-3.5 sm:px-4 flex items-center justify-between gap-3">
                  <span className="font-bold text-[#0b1f3a] shrink-0">Molecular Weight</span>
                  <span className="font-semibold text-[#0b1f3a] text-right">
                    {specs?.molecularWeight || "Specification Pending"}
                  </span>
                </div>

                {/* CAS Number */}
                <div className="py-2.5 sm:py-3 px-3.5 sm:px-4 flex items-center justify-between gap-3">
                  <span className="font-bold text-[#0b1f3a] shrink-0">CAS Number</span>
                  <span className="font-mono text-[#334155] font-medium text-[11.5px] text-right bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
                    {specs?.casNumber || "Specification Pending"}
                  </span>
                </div>

                {/* Sequence / Formula */}
                <div className="py-2.5 sm:py-3 px-3.5 sm:px-4 flex flex-col gap-1.5 bg-[#f8fafc]/50">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0b1f3a]">Sequence / Formula</span>
                    <span className="text-[10px] font-bold text-[#16a6a3] uppercase tracking-wider">
                      HPLC Verified
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-[#334155] leading-relaxed break-words bg-white p-2 rounded-[6px] border border-[#e2e8f0]/80">
                    {specs?.compositionOrSequence || "Specification Pending"}
                  </div>
                </div>

                {/* Recommended Storage */}
                <div className="py-2.5 sm:py-3 px-3.5 sm:px-4 flex items-center justify-between gap-3">
                  <span className="font-bold text-[#0b1f3a] shrink-0">Recommended Storage</span>
                  <span className="text-[#059669] font-semibold text-right text-[11.5px] inline-flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/70">
                    <span className="size-1.5 rounded-full bg-[#10b981] shrink-0" />
                    {specs?.storage || "2°C – 8°C Refrigerated"}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#dce6ee]">
              <Link
                href={`/lab-reports?search=${encodeURIComponent(specs?.compoundName || product.name)}`}
                className="text-[12px] font-bold text-[#0b1f3a] hover:text-[#16a6a3] transition-colors flex items-center justify-between group"
              >
                <span>Search HPLC Certificate of Analysis</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>

          {/* Card 3: Quality Certified & Verified Worldwide (Unified Figma Styling) */}
          <div className="bg-[#f0f6fa] rounded-[16px] p-[24px] sm:p-[28px] flex flex-col justify-between min-h-[460px] border border-[#e2e8f0]/80 shadow-2xs">
            <div>
              {/* Header with Quality Shield Icon */}
              <div className="flex gap-[14px] items-center">
                <div className="w-[50px] h-[50px] relative shrink-0">
                  <Image
                    src="/images/figma/193d65bceacadbc722edc3f3480325e2589acdd5.png"
                    alt="Quality Shield"
                    fill
                    sizes="50px"
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-[#0b1f3a] text-[18px] leading-tight">
                    Lab Tested &amp; Certified
                  </h3>
                  <p className="text-[12px] text-[#64748b] mt-0.5">
                    Rigorous third-party quality control
                  </p>
                </div>
              </div>

              {/* Research Protocol Table */}
              <div className="bg-white border border-[#e2e8f0] rounded-[12px] divide-y divide-[#edf2f7] text-[12px] sm:text-[12.5px] overflow-hidden mt-6 shadow-2xs">
                <div className="py-3.5 sm:py-4 px-3.5 sm:px-4 flex items-center justify-between gap-3">
                  <span className="font-bold text-[#0b1f3a] shrink-0">Compliance Standard</span>
                  <span className="text-[#475569] font-medium text-right">18+ Research Only (In-Vitro)</span>
                </div>
                <div className="py-3.5 sm:py-4 px-3.5 sm:px-4 flex items-center justify-between gap-3">
                  <span className="font-bold text-[#0b1f3a] shrink-0">QR Batch Verification</span>
                  <span className="text-[#10b981] font-semibold text-right inline-flex items-center gap-1">
                    <span>✓</span> Packaging Scan Enabled
                  </span>
                </div>
                <div className="py-3.5 sm:py-4 px-3.5 sm:px-4 flex items-center justify-between gap-3">
                  <span className="font-bold text-[#0b1f3a] shrink-0">Outer Packaging</span>
                  <span className="text-[#475569] font-medium text-right">Discreet Protective Box</span>
                </div>
                <div className="py-3.5 sm:py-4 px-3.5 sm:px-4 flex items-center justify-between gap-3">
                  <span className="font-bold text-[#0b1f3a] shrink-0">Logistics Dispatch</span>
                  <span className="text-[#475569] font-medium text-right">Royal Mail Tracked (£4.95 UK)</span>
                </div>
              </div>

              {/* Official Figma Certification Logos Row */}
              <div className="flex items-center justify-between w-full pt-8 sm:pt-10 mt-2">
                <div className="h-[40px] w-[65px] flex items-center justify-center shrink-0">
                  <img
                    src="/images/figma/logo-iso.svg"
                    alt="ISO 9001 Certified"
                    className="h-[34px] w-auto max-w-[60px] object-contain"
                  />
                </div>
                <div className="w-px h-[28px] bg-[#d1e0ed]" />
                <div className="h-[40px] w-[65px] flex items-center justify-center shrink-0">
                  <img
                    src="/images/figma/logo-nsf.svg"
                    alt="NSF Certified"
                    className="h-[34px] w-auto max-w-[50px] object-contain"
                  />
                </div>
                <div className="w-px h-[28px] bg-[#d1e0ed]" />
                <div className="h-[40px] w-[55px] flex items-center justify-center shrink-0">
                  <img
                    src="/images/figma/logo-ce.svg"
                    alt="CE Mark"
                    className="h-[32px] w-auto max-w-[50px] object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Verification Link */}
            <div className="pt-4 mt-8 border-t border-[#dce6ee] flex items-center justify-between">
              <Link
                href="/verify"
                className="text-[12px] font-bold text-[#0b1f3a] hover:text-[#16a6a3] transition-colors flex items-center gap-1 group"
              >
                <span>Verify Packaging QR</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <span className="text-[11px] text-[#64748b] font-mono">peptech.bio</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
