"use client"

import React, { useState } from "react"
import Link from "next/link"
import { CatalogProduct } from "@/data/catalog"

interface ProductAccordionsProps {
  product?: CatalogProduct
}

export function ProductAccordions({ product }: ProductAccordionsProps) {
  const [openSection, setOpenSection] = useState<string | null>("how-it-works")

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id)
  }

  const mechanisms = product?.howItWorks || [
    "Receptor Specificity: Engineered for high-affinity binding kinetics in targeted cellular assay models.",
    "Extracellular Scaffolding: Researched for peptide-mediated signaling in tissue regeneration and matrix stabilization.",
    "Analytical Purity: Standardized molecular weight profile verified through reverse-phase HPLC and mass spectrometry.",
  ]

  const storageInfo = product?.technicalSpecs?.storage || "2°C – 8°C Refrigerated, protect from direct light"

  const sections = [
    {
      id: "how-it-works",
      title: "Research Profile & Mechanism",
      content: (
        <div className="space-y-2.5 text-[12.5px] text-[#475569] leading-relaxed">
          <p className="font-medium text-[#0b1f3a]">
            Documented In-Vitro Molecular Activity:
          </p>
          <ul className="space-y-2 list-none">
            {mechanisms.map((mech, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="size-1.5 rounded-full bg-[#16a6a3] shrink-0 mt-2" />
                <span>{mech}</span>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      id: "safety-storage",
      title: "Safety, Handling & Storage",
      content: (
        <div className="space-y-2 text-[12.5px] text-[#475569] leading-relaxed">
          <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/60 text-[#92400e] text-[11.5px] font-medium">
            ⚠️ Strictly for In-Vitro Scientific Research &amp; Laboratory Analysis Only. Not for human or veterinary administration.
          </div>
          <div className="pt-1 space-y-1.5">
            <p>
              <strong className="text-[#0b1f3a]">Storage:</strong> {storageInfo}
            </p>
            <p>
              <strong className="text-[#0b1f3a]">Light Sensitivity:</strong> Store in secondary packaging protected from direct UV exposure.
            </p>
            <p>
              <strong className="text-[#0b1f3a]">Form:</strong> {product?.technicalSpecs?.form || "1.5 mL Borosilicate Type I Glass Cartridge"}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "shipping",
      title: "Shipping & Discreet Logistics",
      content: (
        <div className="space-y-2 text-[12.5px] text-[#475569] leading-relaxed">
          <div className="flex items-center justify-between py-1 border-b border-[#f1f5f9]">
            <span className="font-semibold text-[#0b1f3a]">UK Tracked 24/48</span>
            <span className="text-[#475569]">Royal Mail Tracked (£4.95 · Free over £100)</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-[#f1f5f9]">
            <span className="font-semibold text-[#0b1f3a]">International Tracked</span>
            <span className="text-[#475569]">Royal Mail International (£15.00 Flat Rate)</span>
          </div>
          <p className="text-[11.5px] text-[#64748b] pt-1">
            📦 <strong>Discreet Packaging Guarantee:</strong> All orders are dispatched in robust, unbranded outer boxes with zero peptide terminology on the exterior.
          </p>
        </div>
      ),
    },
    {
      id: "faq",
      title: "Quality Assurance & FAQs",
      content: (
        <div className="space-y-3 text-[12.5px] text-[#475569] leading-relaxed">
          <div>
            <p className="font-bold text-[#0b1f3a]">Is this compound third-party tested?</p>
            <p className="text-[12px] text-[#64748b] mt-0.5">
              Yes. Every synthesis batch is independently assayed by accredited testing laboratories using High-Performance Liquid Chromatography (HPLC) and Mass Spectrometry (MS).
            </p>
          </div>
          <div>
            <p className="font-bold text-[#0b1f3a]">Where can I inspect the Certificate of Analysis?</p>
            <p className="text-[12px] text-[#64748b] mt-0.5">
              Certificates of Analysis are accessible via our{" "}
              <Link href="/lab-reports" className="text-[#16a6a3] font-bold underline">
                Lab Reports Library
              </Link>{" "}
              and verified on delivery by scanning the packaging QR code.
            </p>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="w-full divide-y divide-[#e2e8f0] border-y border-[#e2e8f0] mt-3">
      {sections.map((section) => {
        const isOpen = openSection === section.id
        return (
          <div key={section.id} className="py-1">
            <button
              type="button"
              onClick={() => toggleSection(section.id)}
              className="w-full px-3 py-3 text-left flex items-center justify-between gap-3 rounded-xl hover:bg-[#f8fafc] transition-all duration-200 group cursor-pointer"
              aria-expanded={isOpen}
            >
              <span
                className={`text-[13.5px] sm:text-[14px] font-bold transition-colors duration-200 ${
                  isOpen ? "text-[#16a6a3]" : "text-[#0b1f3a] group-hover:text-[#16a6a3]"
                }`}
              >
                {section.title}
              </span>
              <span
                className={`size-6 sm:size-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                  isOpen
                    ? "bg-[#0b1f3a] text-white shadow-xs scale-105"
                    : "bg-[#f1f5f9] text-[#64748b] group-hover:bg-[#e2e8f0] group-hover:text-[#0b1f3a]"
                }`}
              >
                <svg
                  className={`size-3.5 transition-transform duration-300 ease-in-out transform ${
                    isOpen ? "rotate-180 text-white" : "rotate-0 text-[#64748b] group-hover:text-[#0b1f3a]"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
            {isOpen && (
              <div className="px-3 pt-1 pb-3 animate-in fade-in duration-200">
                {section.content}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
