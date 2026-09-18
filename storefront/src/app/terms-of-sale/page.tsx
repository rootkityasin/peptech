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

      {/* Support & Legal Officer Card */}
      <div className="bg-[#f8fafc] rounded-3xl border border-[#e2e8f0] p-6 shadow-xs space-y-3 text-xs">
        <span className="text-[10px] font-bold text-[#16a6a3] font-mono uppercase tracking-wider">
          LEGAL COUNSEL &amp; DPO
        </span>
        <h5 className="font-bold text-[#0b1f3a]">PEPTECH BioSciences Ltd</h5>
        <p className="text-[#64748b] leading-relaxed">
          Cambridge Science Park, Milton Road<br />
          Cambridge CB4 0FW, United Kingdom
        </p>
        <div className="pt-2 border-t border-[#e2e8f0]">
          <a
            href="mailto:info@peptech.bio"
            className="font-mono text-[#16a6a3] hover:underline font-semibold"
          >
            info@peptech.bio
          </a>
        </div>
      </div>
    </aside>
  )
}

export default function TermsOfSalePage() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      {/* 01 Breadcrumb Bar */}
      <div className="bg-white border-b border-[#e2e8f0] py-3.5">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-[13px] text-[#64748b]">
            <Link href="/" className="hover:text-[#0b1f3a] transition-colors">Home</Link>
            <span>/</span>
            <span className="font-semibold text-[#0b1f3a]">Terms of Sale</span>
          </div>
        </div>
      </div>

      {/* 02 Header Hero */}
      <section className="bg-white border-b border-[#e2e8f0] py-12 sm:py-16">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-4">


          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0b1f3a]">
            Terms of Sale &amp; Service
          </h1>

          <p className="text-sm sm:text-base text-[#475569] max-w-3xl leading-relaxed">
            Please review these terms carefully before placing an order on <code>peptech.bio</code>. These terms govern all purchases of research peptide systems, prefilled cartridges, and automated subscription replenishment.
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
              
              {/* Mandatory RUO Alert Box */}
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                  <span>⚠️</span>
                  <span>18+ Research &amp; Scientific Purposes Only</span>
                </div>
                <p className="text-xs text-amber-900/90 leading-relaxed">
                  All products sold on <code>peptech.bio</code> are intended exclusively for in-vitro laboratory research and scientific trials. By purchasing, you represent that you are at least 18 years of age and will not introduce these compounds into humans or animals.
                </p>
              </div>

              {/* Section 1 */}
              <section className="space-y-3 border-b border-[#f1f5f9] pb-6">
                <h3 className="text-lg font-bold text-[#0b1f3a] flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#16a6a3] bg-[#16a6a3]/10 px-2 py-0.5 rounded-md">01</span>
                  Eligibility &amp; Customer Representations
                </h3>
                <p>
                  By completing an order or subscription, you represent, warrant, and certify that:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs text-[#64748b]">
                  <li>You are at least <strong>eighteen (18) years of age</strong> and have full legal capacity to enter into binding contracts.</li>
                  <li>All materials purchased are intended solely for <strong>in-vitro scientific investigation, chemical synthesis, or educational laboratory research</strong>.</li>
                  <li>You possess the requisite scientific competency, protective equipment, and facilities to safely store and handle peptide materials.</li>
                  <li>Any attempt to purchase products for personal, domestic, medical, veterinary, or human consumption will result in immediate cancellation and forfeiture.</li>
                </ul>
              </section>

              {/* Section 2 */}
              <section className="space-y-3 border-b border-[#f1f5f9] pb-6">
                <h3 className="text-lg font-bold text-[#0b1f3a] flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#16a6a3] bg-[#16a6a3]/10 px-2 py-0.5 rounded-md">02</span>
                  28-Day Subscribe &amp; Save Terms
                </h3>
                <p>
                  Refill Cartridges and Freeze-Dried Vials are eligible for our automated 28-day replenishment protocol, granting an automatic <strong>10% recurring discount</strong>:
                </p>
                <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2 text-xs">
                  <div className="font-semibold text-[#0b1f3a]">Subscription Rules &amp; Transparency:</div>
                  <ul className="list-disc list-inside space-y-1 text-[#64748b]">
                    <li><strong>Pre-Charge Notifications</strong>: An automated email reminder is dispatched 3 calendar days prior to every recurring renewal.</li>
                    <li><strong>Self-Service Autonomy</strong>: You may pause, skip, reschedule cadence (14, 28, or 56 days), or cancel your subscription at any time via <Link href="/account?tab=subscriptions" className="text-[#16a6a3] underline font-semibold">Account Subscriptions</Link> without contacting support.</li>
                    <li><strong>Smart Retry Billing</strong>: In the event of a failed authorization, our billing processor executes secure retries over 7 business days before pausing fulfillment.</li>
                  </ul>
                </div>
              </section>

              {/* Section 3 */}
              <section className="space-y-3 border-b border-[#f1f5f9] pb-6">
                <h3 className="text-lg font-bold text-[#0b1f3a] flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#16a6a3] bg-[#16a6a3]/10 px-2 py-0.5 rounded-md">03</span>
                  Payment Security &amp; High-Risk Gateway Compliance
                </h3>
                <p>
                  All transactions are handled through certified payment acquirers specialized in research and analytical biochemical commerce:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs text-[#64748b]">
                  <li><strong>Mandatory 3-D Secure (SCA)</strong>: Strong Customer Authentication (SCA) is enforced for all card settlements to eliminate fraudulent transactions.</li>
                  <li><strong>Zero Raw Card Storage</strong>: PEPTECH never stores raw credit or debit card PAN numbers or CVV codes on our servers. Payment tokens are encrypted in PCI-DSS Level 1 vaults.</li>
                  <li><strong>UK Faster Payments</strong>: Instant institutional bank transfer settlements are supported with automated remittance reconciliation.</li>
                </ul>
              </section>

              {/* Section 4 */}
              <section className="space-y-3 border-b border-[#f1f5f9] pb-6">
                <h3 className="text-lg font-bold text-[#0b1f3a] flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#16a6a3] bg-[#16a6a3]/10 px-2 py-0.5 rounded-md">04</span>
                  Royal Mail Shipping &amp; Cold-Chain Dispatch
                </h3>
                <p>
                  All orders are dispatched via Royal Mail Tracked services from our Cambridge fulfillment centre:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs text-[#64748b]">
                  <li><strong>UK Domestic</strong>: Royal Mail Tracked 24 (£4.95, or Free on orders over £100).</li>
                  <li><strong>Worldwide &amp; USA</strong>: Royal Mail International Tracked (£15.00 flat rate).</li>
                  <li><strong>Discreet Outer Packaging</strong>: Heavyweight unbranded cartons with zero chemical or peptide nomenclature on the external carton.</li>
                  <li><strong>Customs &amp; Tariffs</strong>: International researchers are solely responsible for local customs import clearance and duties in their jurisdiction.</li>
                </ul>
              </section>

              {/* Section 5 */}
              <section className="space-y-3 border-b border-[#f1f5f9] pb-6">
                <h3 className="text-lg font-bold text-[#0b1f3a] flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#16a6a3] bg-[#16a6a3]/10 px-2 py-0.5 rounded-md">05</span>
                  Returns, Warranties &amp; Tamper Seals
                </h3>
                <p>
                  Due to the sterile, temperature-regulated, and chemically pure nature of peptide formulations:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs text-[#64748b]">
                  <li><strong>Unopened Hardware</strong>: Complete Pen Sets with intact tamper-evident seals may be returned within 14 days of delivery for a full refund.</li>
                  <li><strong>Compromised Sterile Vials &amp; Cartridges</strong>: Items whose security seals, caps, or borosilicate membranes have been punctured or altered cannot be returned for safety and contamination reasons.</li>
                  <li><strong>Damaged in Transit</strong>: If cold-chain packaging or glass arrives fractured, notify us within 48 hours of courier delivery with lot photos for an immediate replacement dispatch.</li>
                </ul>
              </section>

              {/* Section 6 */}
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-[#0b1f3a] flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#16a6a3] bg-[#16a6a3]/10 px-2 py-0.5 rounded-md">06</span>
                  Governing Law &amp; Jurisdiction
                </h3>
                <p>
                  These Terms of Sale and any non-contractual obligations arising out of or in connection with them are governed by and construed in accordance with the laws of <strong>England and Wales</strong>. The courts of England shall have exclusive jurisdiction over any disputes.
                </p>
              </section>

            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
