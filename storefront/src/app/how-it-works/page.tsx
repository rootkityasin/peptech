"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"

const faqs = [
  {
    q: "What is the difference between Complete Pen Sets, Refill Cartridges, and Freeze-Dried Vials?",
    a: "The Complete Pen Set is designed for first-time researchers who require the reusable precision CNC-machined aluminum pen hardware, an initial prefilled cartridge, 31G 5mm sterile needles, and an authenticated Device Passport. Refill Cartridges are prefilled replacement cartridges manufactured exclusively for that reusable pen body. Freeze-Dried Vials are traditional laboratory lyophilised glass vials for laboratories with existing reconstitution workflows."
  },
  {
    q: "Are Complete Pen Sets available on recurring subscription?",
    a: "No. Complete Pen Sets are strictly one-time purchases because the aluminum precision pen chassis is built for multi-year durability across thousands of trial cycles. When your cartridge is finished, you simply reorder Refill Cartridges, which ARE available on an automated 28-day Subscribe & Save schedule with a 10% discount."
  },
  {
    q: "How does the 28-Day Subscribe & Save discount work?",
    a: "Available on Refill Cartridges and Freeze-Dried Vials, Subscribe & Save automatically renews and dispatches your selected compound every 28 days with an automatic 10% discount locked into your account. You can pause, skip an upcoming delivery, change your renewal cadence (14, 28, or 56 days), or cancel at any time directly through your customer account portal without contacting support."
  },
  {
    q: "What couriers do you use and how fast is delivery?",
    a: "All orders are dispatched via Royal Mail Tracked. UK orders ship via Royal Mail Tracked 24 (£4.95, or Free on orders over £100) with complete SMS and email milestone notifications. Worldwide and USA shipments are fulfilled via Royal Mail International Tracked (£15.00). Orders placed before 2:00 PM GMT ship the same business day."
  },
  {
    q: "Is packaging discreet for laboratory privacy?",
    a: "Yes. All shipments are packed in plain, unmarked protective cardboard outer boxes. There is zero peptide, biochemical, or PEPTECH branding on the exterior shipping carton. Brand packaging, Device Passports, and COAs remain strictly inside the box."
  },
  {
    q: "Where do I find the Certificate of Analysis (COA) for my compound?",
    a: "You can visit our central /lab-reports repository to search any batch lot number, or scan the packaging QR code on your product box via /verify to instantly inspect the third-party HPLC chromatogram and Mass Spectrometry report on your phone or desktop."
  },
  {
    q: "What are the storage guidelines for PEPTECH compounds?",
    a: "Prefilled cartridges and lyophilised vials should be stored refrigerated at 2°C to 8°C upon arrival, protected from direct UV light. Lyophilised vials can also be frozen at -20°C for long-term multi-year stability."
  },
  {
    q: "Are these compounds approved for human consumption or medical therapy?",
    a: "STRICTLY NO. All PEPTECH® compounds, cartridges, and materials are sold exclusively for in-vitro scientific research, laboratory trials, and educational investigation. Any human, veterinary, therapeutic, or bodybuilding administration is strictly prohibited under our terms of sale."
  }
]

export default function HowItWorksPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <main className="min-h-screen bg-white">
      {/* 01 Breadcrumb Bar */}
      <div className="bg-[#f8fafc] border-b border-[#e2e8f0] py-3.5">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-[13px] text-[#64748b]">
            <Link href="/" className="hover:text-[#0b1f3a] transition-colors">Home</Link>
            <span>/</span>
            <span className="font-semibold text-[#0b1f3a]">How The System Works</span>
          </div>
        </div>
      </div>

      {/* 02 Hero Section */}
      <section className="bg-gradient-to-b from-[#f8fafc] to-white border-b border-[#e2e8f0] py-16 sm:py-24 text-center">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-4 max-w-3xl">


          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0b1f3a] leading-tight">
            How The PEPTECH® System Works
          </h1>

          <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
            Our reusable precision delivery system was created to bridge laboratory durability with repeatable scientific accuracy, eliminating disposable plastic waste while locking in pure research consistency.
          </p>
        </div>
      </section>

      {/* 03 Visual 3-Step Lifecycle */}
      <section className="py-16 sm:py-20 border-b border-[#e2e8f0] bg-white">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0b1f3a]">
              One Pen. Endless Compatible Compounds.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-8 space-y-5 flex flex-col justify-between relative shadow-xs hover:border-[#0b1f3a] transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#0b1f3a] text-white flex items-center justify-center font-mono font-black text-lg shadow-sm">
                  01
                </div>
                <h4 className="text-lg font-bold text-[#0b1f3a]">
                  Step 1: Order Your Complete Pen Set
                </h4>
                <p className="text-xs sm:text-sm text-[#64748b] leading-relaxed">
                  First-time researchers order a Complete Pen Set. You receive the CNC-machined aluminum pen chassis, your chosen prefilled cartridge, 31G 5mm sterile needles, and your serialized Device Passport.
                </p>
              </div>
              <div className="pt-4 border-t border-[#e2e8f0]">
                <Link
                  href="/pen-sets"
                  className="text-xs font-bold text-[#0b1f3a] hover:text-[#16a6a3] inline-flex items-center gap-1 transition-colors"
                >
                  Explore Complete Pen Sets <span>→</span>
                </Link>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-8 space-y-5 flex flex-col justify-between relative shadow-xs hover:border-[#16a6a3] transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#16a6a3] text-white flex items-center justify-center font-mono font-black text-lg shadow-sm">
                  02
                </div>
                <h4 className="text-lg font-bold text-[#0b1f3a]">
                  Step 2: Keep The Reusable Pen Body
                </h4>
                <p className="text-xs sm:text-sm text-[#64748b] leading-relaxed">
                  Never discard your metal pen chassis. Built from aviation-grade aluminum alloy with micro-stepping precision, the pen is calibrated for over 10,000 trial cycles. Simply unscrew the spent cartridge.
                </p>
              </div>
              <div className="pt-4 border-t border-[#e2e8f0]">
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <span>✓</span> Multi-Year Hardware Lifespan
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-8 space-y-5 flex flex-col justify-between relative shadow-xs hover:border-[#00c5a0] transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#0e2a47] text-[#00c5a0] flex items-center justify-center font-mono font-black text-lg shadow-sm border border-[#00c5a0]/20">
                  03
                </div>
                <h4 className="text-lg font-bold text-[#0b1f3a]">
                  Step 3: Reorder Refill Cartridges
                </h4>
                <p className="text-xs sm:text-sm text-[#64748b] leading-relaxed">
                  Whenever you require replacement compounds, order compatible Refill Cartridges. Each cartridge screws directly into your pen. Subscribe every 28 days for automated replenishment and 10% savings.
                </p>
              </div>
              <div className="pt-4 border-t border-[#e2e8f0]">
                <Link
                  href="/refills"
                  className="text-xs font-bold text-[#16a6a3] hover:text-[#0b1f3a] inline-flex items-center gap-1 transition-colors"
                >
                  Shop Refill Cartridges (10% Off) <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 04 Hardware Engineering Specifications */}
      <section className="py-16 sm:py-20 bg-[#f8fafc] border-b border-[#e2e8f0]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0b1f3a]">
              Engineered for Clinical Repeatability
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Precision Dialing */}
            <div className="bg-white rounded-3xl overflow-hidden border border-[#e2e8f0] shadow-xs flex flex-col group hover:shadow-xl hover:border-[#16a6a3]/40 transition-all">
              <div className="relative h-44 w-full overflow-hidden bg-slate-900 shrink-0 border-b border-slate-100">
                <Image
                  src="/images/how-it-works/precision-dialing.jpg"
                  alt="Precision Dialing Mechanism"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="p-6 space-y-2 flex-1 flex flex-col justify-start">
                <h5 className="font-bold text-base text-[#0b1f3a]">Precision Dialing</h5>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Smooth mechanical micro-stepping mechanism with audible tactile clicks for micro-increment adjustments.
                </p>
              </div>
            </div>

            {/* Card 2: Anodized Alloy */}
            <div className="bg-white rounded-3xl overflow-hidden border border-[#e2e8f0] shadow-xs flex flex-col group hover:shadow-xl hover:border-[#16a6a3]/40 transition-all">
              <div className="relative h-44 w-full overflow-hidden bg-slate-900 shrink-0 border-b border-slate-100">
                <Image
                  src="/images/about/cnc-lathe.jpg"
                  alt="6061-T6 Anodized Aluminum Alloy"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="p-6 space-y-2 flex-1 flex flex-col justify-start">
                <h5 className="font-bold text-base text-[#0b1f3a]">Anodized Alloy</h5>
                <p className="text-xs text-[#475569] leading-relaxed">
                  6061-T6 aviation aluminum with corrosion-resistant matte anodized finish, easily sterilized with alcohol wipes.
                </p>
              </div>
            </div>

            {/* Card 3: Type I Borosilicate */}
            <div className="bg-white rounded-3xl overflow-hidden border border-[#e2e8f0] shadow-xs flex flex-col group hover:shadow-xl hover:border-[#16a6a3]/40 transition-all">
              <div className="relative h-44 w-full overflow-hidden bg-slate-900 shrink-0 border-b border-slate-100">
                <Image
                  src="/images/how-it-works/borosilicate-vials.jpg"
                  alt="Type I Neutral Borosilicate Cartridge"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="p-6 space-y-2 flex-1 flex flex-col justify-start">
                <h5 className="font-bold text-base text-[#0b1f3a]">Type I Borosilicate</h5>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Cartridges are formed from neutral hydrolytic Type I glass, eliminating leaching or interaction with peptides.
                </p>
              </div>
            </div>

            {/* Card 4: Insulated Transit */}
            <div className="bg-white rounded-3xl overflow-hidden border border-[#e2e8f0] shadow-xs flex flex-col group hover:shadow-xl hover:border-[#16a6a3]/40 transition-all">
              <div className="relative h-44 w-full overflow-hidden bg-slate-900 shrink-0 border-b border-slate-100">
                <Image
                  src="/images/how-it-works/cold-chain-packaging.jpg"
                  alt="Thermal Insulated Cold-Chain Transit"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="p-6 space-y-2 flex-1 flex flex-col justify-start">
                <h5 className="font-bold text-base text-[#0b1f3a]">Insulated Transit</h5>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Shipped with thermal cold-pack insulation via Royal Mail Tracked 24 cold-chain priority dispatch.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 05 Comprehensive FAQ Accordion */}
      <section className="py-16 sm:py-24 bg-white" id="faqs">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <h3 className="text-2xl sm:text-4xl font-extrabold text-[#0b1f3a]">
              Everything You Need to Know
            </h3>
            <p className="text-xs sm:text-sm text-[#64748b]">
              Have questions regarding orders, hardware maintenance, or analytical purity?
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border bg-white overflow-hidden shadow-xs transition-all duration-300 ${
                    isOpen ? "border-[#16a6a3]/40 shadow-sm ring-1 ring-[#16a6a3]/10" : "border-[#e2e8f0] hover:border-slate-300"
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-[#f8fafc]/80 transition-colors group cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className={`font-bold text-sm sm:text-[15px] transition-colors duration-300 ${
                      isOpen ? "text-[#16a6a3]" : "text-[#0b1f3a] group-hover:text-[#16a6a3]"
                    }`}>
                      {faq.q}
                    </span>
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ease-out ${
                        isOpen
                          ? "bg-[#0b1f3a] text-white shadow-xs scale-105"
                          : "bg-[#f1f5f9] text-[#64748b] group-hover:bg-[#e2e8f0] group-hover:text-[#0b1f3a]"
                      }`}
                    >
                      <svg
                        className={`w-3.5 h-3.5 transition-transform duration-500 ease-in-out transform ${
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

                  {/* Smooth height animation via CSS Grid */}
                  <div
                    className={`grid transition-all duration-500 ease-in-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-6 pb-6 pt-3 text-xs sm:text-sm text-[#475569] leading-relaxed border-t border-[#f1f5f9] bg-[#f8fafc]/40">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="text-center pt-4">
            <p className="text-xs text-[#64748b]">
              Still have questions? Reach out to our scientific liaison team at{" "}
              <Link href="/contact" className="text-[#16a6a3] font-bold underline">
                Cambridge Laboratory Support
              </Link>.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
