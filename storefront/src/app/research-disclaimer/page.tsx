"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

function LegalSidebar() {
  const pathname = usePathname()
  const links = [
    { href: "/terms-of-sale", label: "Terms of Sale & Subscriptions", badge: "Commercial" },
    { href: "/privacy-policy", label: "Privacy & GDPR Policy", badge: "Data Protection" },
    { href: "/shipping-returns", label: "Shipping, Cold-Chain & Returns", badge: "Logistics" },
    { href: "/research-disclaimer", label: "Research Use Only (RUO)", badge: "18+ Statutory" },
  ]

  return (
    <aside className="space-y-6">
      <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-xs space-y-4">
        <h4 className="text-xs font-bold text-[#0b1f3a] uppercase tracking-wider font-mono">
          LEGAL &amp; COMPLIANCE DIRECTORY
        </h4>
        <nav className="space-y-1.5">
          {links.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? "bg-[#0b1f3a] text-white shadow-xs"
                    : "text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0b1f3a]"
                }`}
              >
                <span>{link.label}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                  active ? "bg-white/20 text-white" : "bg-[#f1f5f9] text-[#64748b]"
                }`}>
                  {link.badge}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Compliance Officer Card */}
      <div className="bg-[#f8fafc] rounded-3xl border border-[#e2e8f0] p-6 shadow-xs space-y-3 text-xs">
        <span className="text-[10px] font-bold text-amber-600 font-mono uppercase tracking-wider">
          STATUTORY RUO OVERSIGHT
        </span>
        <h5 className="font-bold text-[#0b1f3a]">Regulatory Affairs Liaison</h5>
        <p className="text-[#64748b] leading-relaxed">
          PEPTECH BioSciences Ltd<br />
          Cambridge Science Park, UK
        </p>
        <div className="pt-2 border-t border-[#e2e8f0]">
          <Link
            href="/lab-reports"
            className="text-xs font-bold text-[#16a6a3] hover:underline block"
          >
            Inspect COA Repository →
          </Link>
        </div>
      </div>
    </aside>
  )
}

export default function ResearchDisclaimerPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      {/* 01 Breadcrumb Bar */}
      <div className="bg-white border-b border-[#e2e8f0] py-3.5">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-[13px] text-[#64748b]">
            <Link href="/" className="hover:text-[#0b1f3a] transition-colors">Home</Link>
            <span>/</span>
            <span className="font-semibold text-[#0b1f3a]">Research Disclaimer</span>
          </div>
        </div>
      </div>

      {/* 02 Header Hero */}
      <section className="bg-white border-b border-[#e2e8f0] py-12 sm:py-16">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-4">


          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0b1f3a]">
            Research Use Only (RUO) Disclaimer
          </h1>

          <p className="text-sm sm:text-base text-[#475569] max-w-3xl leading-relaxed">
            All biochemical formulations, prefilled cartridges, and lyophilised peptides supplied by PEPTECH® are manufactured and supplied strictly for in-vitro scientific, educational, and laboratory research purposes.
          </p>
        </div>
      </section>

      {/* 03 Two-Column Layout */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sticky Sidebar */}
          <div className="lg:col-span-4 sticky top-24">
            <LegalSidebar />
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 sm:p-10 shadow-xs space-y-8 text-xs sm:text-sm text-[#475569] leading-relaxed">
              
              {/* Highlight Warning Box */}
              <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-950 space-y-3">
                <div className="flex items-center gap-2 font-black text-sm text-amber-900 tracking-wide uppercase">
                  <span>⚠️</span>
                  <span>MANDATORY STATUTORY REGULATORY NOTICE</span>
                </div>
                <p className="text-xs sm:text-sm text-amber-950 leading-relaxed">
                  The products listed on <strong>PEPTECH® (peptech.bio)</strong> are <strong>NOT DRUGS, COSMETICS, FOOD ADDITIVES, OR MEDICAL DEVICES</strong>. They have not been approved by the UK Medicines and Healthcare products Regulatory Agency (MHRA), the European Medicines Agency (EMA), or the United States Food and Drug Administration (FDA) for human or veterinary use.
                </p>
                <p className="text-xs font-bold text-amber-900">
                  UNDER NO CIRCUMSTANCES SHOULD ANY PRODUCT SOLD BY PEPTECH BE ADMINISTERED TO HUMANS OR ANIMALS.
                </p>
              </div>

              {/* Section 1 */}
              <section className="space-y-3 border-b border-[#f1f5f9] pb-6">
                <h3 className="text-lg font-bold text-[#0b1f3a] flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#16a6a3] bg-[#16a6a3]/10 px-2 py-0.5 rounded-md">01</span>
                  Age Requirement &amp; Purchaser Qualifications
                </h3>
                <p>
                  You must be at least <strong>eighteen (18) years of age</strong> to browse, verify, or purchase products from PEPTECH®. By submitting an order, the purchaser certifies that:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs text-[#64748b]">
                  <li>They are an adult aged 18 or older with legal authority to enter commercial agreements.</li>
                  <li>They represent a recognized academic institution, clinical research trial, or analytical testing laboratory, or possess verified competence in handling chemical research reagents.</li>
                  <li>They operate appropriate chemical storage facilities including 2°C–8°C temperature monitoring and sterile containment equipment.</li>
                </ul>
              </section>

              {/* Section 2 */}
              <section className="space-y-3 border-b border-[#f1f5f9] pb-6">
                <h3 className="text-lg font-bold text-[#0b1f3a] flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#16a6a3] bg-[#16a6a3]/10 px-2 py-0.5 rounded-md">02</span>
                  Strict Prohibition of Human &amp; Veterinary Administration
                </h3>
                <p>
                  The introduction of these materials into humans or animals is strictly prohibited by law and violates our Terms of Sale:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs text-[#64748b]">
                  <li>Compounds must <strong>never be ingested, injected, inhaled, or applied topically</strong> to any human or animal subject.</li>
                  <li>These compounds are intended strictly for <em>in-vitro</em> cell culture assays, chromatographic analysis, spectrometry validation, receptor binding characterization, and scientific calibration.</li>
                  <li>Any customer communication suggesting human consumption will result in immediate termination of account access and cancellation of active subscriptions.</li>
                </ul>
              </section>

              {/* Section 3 */}
              <section className="space-y-3 border-b border-[#f1f5f9] pb-6">
                <h3 className="text-lg font-bold text-[#0b1f3a] flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#16a6a3] bg-[#16a6a3]/10 px-2 py-0.5 rounded-md">03</span>
                  Zero Dosing Protocols or Medical Claims
                </h3>
                <p>
                  PEPTECH® does not provide, publish, or endorse dosing guidelines, therapeutic protocols, injection advice, or reconstitution instructions for clinical administration.
                </p>
                <p className="text-xs text-[#64748b]">
                  All molecular weight calculations, amino acid sequences, and HPLC purity figures displayed on this website are scientific data attributes intended purely for chemical reference and analytical comparison.
                </p>
              </section>

              {/* Section 4 */}
              <section className="space-y-3 border-b border-[#f1f5f9] pb-6">
                <h3 className="text-lg font-bold text-[#0b1f3a] flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#16a6a3] bg-[#16a6a3]/10 px-2 py-0.5 rounded-md">04</span>
                  Laboratory Safety, Hazard Handling &amp; Disposal
                </h3>
                <p>
                  All synthetic peptide reagents must be handled with appropriate personal protective equipment (PPE), including lab coats, chemical-resistant nitrile gloves, and eye protection under certified fume hoods or laminar flow cabinets where appropriate.
                </p>
                <p className="text-xs text-[#64748b]">
                  Disposal of spent cartridges, borosilicate glass vials, and solvent residues must be carried out in compliance with local environmental and biohazardous waste regulations.
                </p>
              </section>

              {/* Section 5 */}
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-[#0b1f3a] flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#16a6a3] bg-[#16a6a3]/10 px-2 py-0.5 rounded-md">05</span>
                  Indemnification &amp; Limitation of Liability
                </h3>
                <p>
                  The purchaser agrees to indemnify, defend, and hold harmless PEPTECH BioSciences Ltd, its directors, officers, chemists, and affiliates against any and all claims, liabilities, losses, damages, or legal expenses arising from or related to the handling, storage, misuse, resale, or disposal of any compounds purchased through this service.
                </p>
              </section>

            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
