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

      {/* DPO Card */}
      <div className="bg-[#f8fafc] rounded-3xl border border-[#e2e8f0] p-6 shadow-xs space-y-3 text-xs">
        <span className="text-[10px] font-bold text-[#16a6a3] font-mono uppercase tracking-wider">
          DATA PROTECTION OFFICER (DPO)
        </span>
        <h5 className="font-bold text-[#0b1f3a]">PEPTECH BioSciences Ltd</h5>
        <p className="text-[#64748b] leading-relaxed">
          ICO Registration Ref: ZB841920<br />
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

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      {/* 01 Breadcrumb Bar */}
      <div className="bg-white border-b border-[#e2e8f0] py-3.5">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-[13px] text-[#64748b]">
            <Link href="/" className="hover:text-[#0b1f3a] transition-colors">Home</Link>
            <span>/</span>
            <span className="font-semibold text-[#0b1f3a]">Privacy Policy</span>
          </div>
        </div>
      </div>

      {/* 02 Header Hero */}
      <section className="bg-white border-b border-[#e2e8f0] py-12 sm:py-16">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-4">


          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0b1f3a]">
            Privacy &amp; Cookie Policy
          </h1>

          <p className="text-sm sm:text-base text-[#475569] max-w-3xl leading-relaxed">
            PEPTECH BioSciences Ltd is committed to protecting your privacy and upholding the highest standards of data security in accordance with the UK General Data Protection Regulation (UK GDPR) and Data Protection Act 2018.
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
              
              {/* Data Controller Notice */}
              <div className="p-5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1 text-xs">
                <span className="font-mono text-[10px] text-[#16a6a3] font-bold uppercase tracking-wider block">
                  STATUTORY DATA CONTROLLER IDENTIFICATION
                </span>
                <p className="text-[#0b1f3a] font-semibold">
                  PEPTECH BioSciences Ltd (Company No. 15894120), Cambridge Science Park, Milton Road, Cambridge CB4 0FW, United Kingdom.
                </p>
              </div>

              {/* Section 1 */}
              <section className="space-y-3 border-b border-[#f1f5f9] pb-6">
                <h3 className="text-lg font-bold text-[#0b1f3a] flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#16a6a3] bg-[#16a6a3]/10 px-2 py-0.5 rounded-md">01</span>
                  Information We Collect &amp; Process
                </h3>
                <p>
                  To fulfill orders, verify laboratory age requirements, and comply with UK commercial record-keeping laws, we process the following categories of personal data:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs text-[#64748b]">
                  <li><strong>Contact &amp; Identification</strong>: Full name, title, academic/institutional affiliation, email address, and telephone number (used strictly for Royal Mail delivery alerts).</li>
                  <li><strong>Fulfillment Addresses</strong>: Delivery address, laboratory suite, and billing address.</li>
                  <li><strong>Order History &amp; Batch Audits</strong>: Products purchased, batch lot numbers assigned, and COA downloads linked to your account.</li>
                  <li><strong>Age &amp; RUO Verification</strong>: Cryptographic record of your 18+ research disclaimer acknowledgement timestamp.</li>
                </ul>
              </section>

              {/* Section 2 */}
              <section className="space-y-3 border-b border-[#f1f5f9] pb-6">
                <h3 className="text-lg font-bold text-[#0b1f3a] flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#16a6a3] bg-[#16a6a3]/10 px-2 py-0.5 rounded-md">02</span>
                  Zero Raw Card Data Retention Policy
                </h3>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs text-emerald-950">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                    <span>🛡️</span>
                    <span>PCI-DSS Level 1 Encryption</span>
                  </div>
                  <p className="leading-relaxed">
                    PEPTECH <strong>never stores, sees, or logs raw credit card numbers, expiry dates, or CVV security codes</strong> on its servers. All payments are securely tokenized through Level 1 PCI-DSS compliant acquiring gateways with 3-D Secure authentication.
                  </p>
                </div>
              </section>

              {/* Section 3 */}
              <section className="space-y-3 border-b border-[#f1f5f9] pb-6">
                <h3 className="text-lg font-bold text-[#0b1f3a] flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#16a6a3] bg-[#16a6a3]/10 px-2 py-0.5 rounded-md">03</span>
                  Cookies &amp; Local Storage Usage
                </h3>
                <p>
                  We operate a privacy-first website. We do NOT deploy invasive third-party cross-site advertising trackers. We utilize:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs text-[#64748b]">
                  <li><strong>Essential Cookies</strong>: Session management, CSRF protection, and cart persistence across browser tabs.</li>
                  <li><strong>Compliance Tokens</strong>: Local storage flag (<code>peptech_ruo_ack</code>) recording your 18+ research acknowledgement to prevent redundant modal interruptions.</li>
                  <li><strong>Telemetry &amp; Security</strong>: Anonymous rate-limiting headers to defend against brute-force payment bots.</li>
                </ul>
              </section>

              {/* Section 4 */}
              <section className="space-y-3 border-b border-[#f1f5f9] pb-6">
                <h3 className="text-lg font-bold text-[#0b1f3a] flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#16a6a3] bg-[#16a6a3]/10 px-2 py-0.5 rounded-md">04</span>
                  Third-Party Data Disclosures
                </h3>
                <p>
                  We never sell, rent, or monetize your personal information. We disclose data solely to essential service partners:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs text-[#64748b]">
                  <li><strong>Logistics Partners</strong>: Royal Mail Click &amp; Drop API (recipient address and dispatch phone for tracking SMS).</li>
                  <li><strong>Payment Acquirers</strong>: Regulated UK banking processors for card settlement and 3-D Secure authorization.</li>
                  <li><strong>Regulatory Bodies</strong>: Only when strictly mandated by UK statutory law or court order.</li>
                </ul>
              </section>

              {/* Section 5 */}
              <section className="space-y-3 border-b border-[#f1f5f9] pb-6">
                <h3 className="text-lg font-bold text-[#0b1f3a] flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#16a6a3] bg-[#16a6a3]/10 px-2 py-0.5 rounded-md">05</span>
                  Your Rights Under UK GDPR
                </h3>
                <p>
                  As an individual researcher or institution, you hold full statutory rights under UK GDPR:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                    <strong className="text-[#0b1f3a] block">Right of Access</strong>
                    <span className="text-[#64748b]">Request an export of all personal records held by PEPTECH.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                    <strong className="text-[#0b1f3a] block">Right to Rectification</strong>
                    <span className="text-[#64748b]">Update your laboratory delivery address or contact details at any time.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                    <strong className="text-[#0b1f3a] block">Right to Erasure</strong>
                    <span className="text-[#64748b]">Request deletion of marketing records, subject to statutory tax laws.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                    <strong className="text-[#0b1f3a] block">Right to Restrict</strong>
                    <span className="text-[#64748b]">Temporarily pause non-essential automated data processing.</span>
                  </div>
                </div>
              </section>

              {/* Section 6 */}
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-[#0b1f3a] flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#16a6a3] bg-[#16a6a3]/10 px-2 py-0.5 rounded-md">06</span>
                  Exercising Your Rights &amp; ICO Complaints
                </h3>
                <p>
                  To make a Subject Access Request (SAR) or exercise any of your data rights, contact our Data Protection Officer at <a href="mailto:info@peptech.bio" className="text-[#16a6a3] underline font-semibold">info@peptech.bio</a>. You also have the right to lodge a complaint with the UK Information Commissioner’s Office (ICO) at <code>ico.org.uk</code>.
                </p>
              </section>

            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
