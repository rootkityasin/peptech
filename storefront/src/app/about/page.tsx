import React from "react"
import Link from "next/link"
import Image from "next/image"
import { TrustedBySection } from "@/components/common/TrustedBySection"

export const metadata = {
  title: "About Us | PEPTECH® Precision Peptide Systems",
  description: "Learn about PEPTECH®, our laboratory research operations, reusable precision pen architecture, and transparent batch documentation.",
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* 01 Breadcrumb Bar */}
      <div className="bg-[#f8fafc] border-b border-[#e2e8f0] py-3.5">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-[13px] text-[#64748b]">
            <Link href="/" className="hover:text-[#0b1f3a] transition-colors">Home</Link>
            <span>/</span>
            <span className="font-semibold text-[#0b1f3a]">About Us</span>
          </div>
        </div>
      </div>

      {/* 02 Hero Section */}
      <section className="bg-gradient-to-b from-[#f8fafc] to-white border-b border-[#e2e8f0] py-16 sm:py-24">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-5">
            <span className="inline-block text-[12px] font-bold text-[#16A6A3] tracking-[1.2px] uppercase">
              ABOUT PEPTECH®
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#0B1F3A] leading-[1.15] tracking-tight uppercase">
              Pioneering Precision Peptide Architecture
            </h1>

            <p className="text-xs sm:text-[14px] text-[#64748B] leading-[22px] max-w-2xl">
              PEPTECH® operates internationally with a singular scientific mission: elevating analytical peptide research through durable reusable engineering, monitored cold-chain integrity, and transparent batch documentation.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/shop"
                className="btn-shimmer btn-press px-6 py-3.5 rounded-xl bg-[#0B1F3A] hover:bg-[#162e52] text-white text-[14px] font-semibold transition-all shadow-md hover:shadow-xl inline-flex items-center gap-2 group cursor-pointer"
              >
                <span>Explore Catalog</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/lab-reports"
                className="btn-press px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#0B1F3A] border border-[#CBD5E1] hover:border-[#0B1F3A] text-[14px] font-semibold transition-all shadow-xs hover:shadow-md inline-flex items-center cursor-pointer"
              >
                Inspect COA Vault
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 03 Institutional Stats Strip */}
      <section className="border-b border-[#e2e8f0] bg-white py-12">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#0B1F3A] tracking-tight">HPLC / MS</div>
              <div className="text-[12px] font-bold text-[#16A6A3] tracking-[1.2px] uppercase">Analytical Assay</div>
              <p className="text-xs sm:text-[13px] text-[#64748B]">Independent batch reporting via Lab Reports.</p>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#0B1F3A] tracking-tight">10,000+</div>
              <div className="text-[12px] font-bold text-[#16A6A3] tracking-[1.2px] uppercase">Dial Calibration Cycles</div>
              <p className="text-xs sm:text-[13px] text-[#64748B]">Aviation-grade aluminum alloy pen body.</p>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#0B1F3A] tracking-tight">100%</div>
              <div className="text-[12px] font-bold text-[#16A6A3] tracking-[1.2px] uppercase">Cryptographic Lots</div>
              <p className="text-xs sm:text-[13px] text-[#64748B]">Holographic seal &amp; QR lot verification.</p>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#0B1F3A] tracking-tight">2°C – 8°C</div>
              <div className="text-[12px] font-bold text-[#16A6A3] tracking-[1.2px] uppercase">Monitored Cold-Chain</div>
              <p className="text-xs sm:text-[13px] text-[#64748B]">Thermal insulation with Royal Mail Tracked.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 04 The Three Core Pillars */}
      <section className="py-16 sm:py-24 bg-[#f8fafc]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[12px] font-bold text-[#16A6A3] tracking-[1.2px] uppercase">OUR FOUNDATION</span>
            <h2 className="text-2xl sm:text-[28px] font-bold text-[#0B1F3A]">
              The Three Pillars of PEPTECH®
            </h2>
            <p className="text-[14px] text-[#64748B]">
              Engineered to replace fragmented, disposable peptide workflows with a cohesive, sustainable laboratory standard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="bg-white rounded-3xl overflow-hidden border border-[#e2e8f0] shadow-xs flex flex-col justify-between group hover:shadow-xl hover:border-[#16a6a3]/40 transition-all min-h-[460px]">
              <div className="relative h-52 min-h-[208px] w-full overflow-hidden bg-slate-100 shrink-0">
                <Image
                  src="/images/about/pillar-purity.jpg"
                  alt="Absolute Chemical Purity"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              <div className="p-8 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <h4 className="text-xl font-bold text-[#0b1f3a]">1. Absolute Chemical Purity</h4>
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                    We formulate each peptide through solid-phase peptide synthesis (SPPS), freeze-dried in vacuum-sealed borosilicate glass. Production batches are submitted to independent third-party analytical partners for HPLC chromatogram and Mass Spectrometry verification, published in our COA repository as reports clear.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <span className="text-xs font-bold text-[#16a6a3]">Zero filler. Zero unverified claims.</span>
                </div>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white rounded-3xl overflow-hidden border border-[#e2e8f0] shadow-xs flex flex-col justify-between group hover:shadow-xl hover:border-[#16a6a3]/40 transition-all min-h-[460px]">
              <div className="relative h-52 min-h-[208px] w-full overflow-hidden bg-slate-100 shrink-0">
                <Image
                  src="/images/about/cnc-lathe.jpg"
                  alt="Reusable Aluminum Architecture"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              <div className="p-8 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <h4 className="text-xl font-bold text-[#0b1f3a]">2. Reusable Aluminum Architecture</h4>
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                    Traditional laboratory workflows often rely on fragile plastic disposables that generate substantial single-use laboratory plastic waste. The PEPTECH pen system uses a CNC-machined aluminum chassis engineered for repeated multi-year use. Researchers purchase the pen once, then simply snap in compatible prefilled refill cartridges.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <span className="text-xs font-bold text-[#16a6a3]">Sustainable hardware lifecycle.</span>
                </div>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white rounded-3xl overflow-hidden border border-[#e2e8f0] shadow-xs flex flex-col justify-between group hover:shadow-xl hover:border-[#16a6a3]/40 transition-all min-h-[460px]">
              <div className="relative h-52 min-h-[208px] w-full overflow-hidden bg-slate-100 shrink-0">
                <Image
                  src="/images/about/hologram-textured.jpg"
                  alt="Cryptographic Traceability"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              <div className="p-8 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <h4 className="text-xl font-bold text-[#0b1f3a]">3. Cryptographic Traceability</h4>
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                    Counterfeiting is a critical issue in modern biochemical supply chains. Every PEPTECH unit carries an iridescent holographic security seal and unique QR code. Researchers can authenticate batch lots and view full analytical certificates in seconds via our mobile-first verification tool.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <span className="text-xs font-bold text-emerald-600">Tamper-evident verification.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 05 Operational & Laboratory Standards */}
      <section className="py-16 sm:py-24 bg-white border-b border-[#e2e8f0]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-5">
              <span className="text-[12px] font-bold text-[#16A6A3] tracking-[1.2px] uppercase">
                LABORATORY &amp; LOGISTICS OPERATIONS
              </span>
              <h2 className="text-2xl sm:text-[28px] font-bold text-[#0B1F3A]">
                Operating with Rigorous Laboratory Standards
              </h2>
              <p className="text-[14px] text-[#64748B] leading-[22px]">
                Operated by PEPTECH LIMITED from our Hong Kong headquarters and UK correspondence and fulfillment office, PEPTECH works alongside independent analytical testing partners, synthesis suppliers, and research laboratories internationally.
              </p>
              
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#16a6a3]/10 text-[#16a6a3] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</div>
                  <div className="text-xs sm:text-sm text-[#475569]">
                    <strong className="text-[#0b1f3a]">Controlled Laminar-Flow Filling</strong>: Automated cartridge handling under controlled laboratory laminar flow hoods.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#16a6a3]/10 text-[#16a6a3] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</div>
                  <div className="text-xs sm:text-sm text-[#475569]">
                    <strong className="text-[#0b1f3a]">Nitrogen Purging</strong>: Borosilicate glass cartridges are purged with dry nitrogen gas to inhibit oxidation.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#16a6a3]/10 text-[#16a6a3] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</div>
                  <div className="text-xs sm:text-sm text-[#475569]">
                    <strong className="text-[#0b1f3a]">Discreet Logistics</strong>: Dedicated fulfillment ensuring zero peptide markings on exterior transit packaging.
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/contact"
                  className="text-xs sm:text-sm font-bold text-[#0b1f3a] hover:text-[#16a6a3] inline-flex items-center gap-1 transition-colors"
                >
                  Contact Laboratory Support <span>→</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-3xl border border-[#e2e8f0] bg-[#f8fafc] p-8 space-y-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-4">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Corporate Entity</span>
                    <h5 className="font-bold text-[#0b1f3a] text-sm">PEPTECH LIMITED</h5>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    RUO 18+ Compliant
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#64748b] block">Registered Office</span>
                    <span className="font-semibold text-[#0b1f3a]">Hung Hom, Hong Kong</span>
                  </div>
                  <div>
                    <span className="text-[#64748b] block">UK Returns &amp; Dispatch</span>
                    <span className="font-semibold text-[#0b1f3a]">Colburn, United Kingdom</span>
                  </div>
                  <div>
                    <span className="text-[#64748b] block">Courier Logistics</span>
                    <span className="font-semibold text-[#0b1f3a]">Royal Mail Tracked</span>
                  </div>
                  <div>
                    <span className="text-[#64748b] block">Inquiries</span>
                    <span className="font-semibold text-[#0b1f3a]">support@peptech.bio</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#e2e8f0] text-xs text-[#64748b] space-y-2.5 leading-relaxed">
                  <div>
                    <p className="font-semibold text-[#0b1f3a]">Hong Kong Registered Office:</p>
                    <p>PEPTECH LIMITED<br />807A, 8/F, Two Harbourfront, 22 Tak Fung Street, Hung Hom, Kowloon, Hong Kong</p>
                  </div>
                  <div className="pt-2 border-t border-[#f1f5f9]">
                    <p className="font-semibold text-[#0b1f3a]">UK Correspondence &amp; Returns Office:</p>
                    <p>Office 17 Ips Innovate, Chartermark Way, Colburn Business Park, DL9 4QJ, Colburn, United Kingdom</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 06 Trusted By Certification Marquee */}
      <TrustedBySection />

      {/* 07 Research Compliance Gate Reminder */}
      <section className="py-12 bg-[#0b1f3a] text-white">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h4 className="text-xl font-bold">Research &amp; Laboratory Use Only (RUO)</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              All PEPTECH® products and compounds are supplied exclusively for in-vitro scientific research, laboratory protocols, and educational investigation. None of our compounds are sold or intended for human or veterinary administration.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Link
              href="/research-disclaimer"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
            >
              Read Disclaimer
            </Link>
            <Link
              href="/terms-of-sale"
              className="px-5 py-2.5 rounded-xl bg-[#16a6a3] hover:bg-[#138e8c] text-white font-bold text-xs transition-colors shadow-sm"
            >
              Terms of Sale
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
