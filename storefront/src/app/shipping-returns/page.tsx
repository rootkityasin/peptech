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

      {/* Logistics Dispatch Card */}
      <div className="bg-[#f8fafc] rounded-3xl border border-[#e2e8f0] p-6 shadow-xs space-y-3 text-xs">
        <span className="text-[10px] font-bold text-[#16a6a3] font-mono uppercase tracking-wider">
          COLD-CHAIN DISPATCH HUB
        </span>
        <h5 className="font-bold text-[#0b1f3a]">PEPTECH Fulfillment Center</h5>
        <p className="text-[#64748b] leading-relaxed">
          Royal Mail Tracked 24 Hub<br />
          Cambridge Science Park, UK
        </p>
        <div className="pt-2 border-t border-[#e2e8f0] flex justify-between items-center text-[11px]">
          <span className="text-[#64748b]">Same-day cutoff:</span>
          <span className="font-mono font-bold text-[#0b1f3a]">14:00 GMT</span>
        </div>
      </div>
    </aside>
  )
}

export default function ShippingReturnsPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      {/* 01 Breadcrumb Bar */}
      <div className="bg-white border-b border-[#e2e8f0] py-3.5">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-[13px] text-[#64748b]">
            <Link href="/" className="hover:text-[#0b1f3a] transition-colors">Home</Link>
            <span>/</span>
            <span className="font-semibold text-[#0b1f3a]">Shipping &amp; Returns</span>
          </div>
        </div>
      </div>

      {/* 02 Header Hero */}
      <section className="bg-white border-b border-[#e2e8f0] py-12 sm:py-16">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-4">


          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0b1f3a]">
            Shipping, Cold-Chain &amp; Returns
          </h1>

          <p className="text-sm sm:text-base text-[#475569] max-w-3xl leading-relaxed">
            Every shipment dispatched by PEPTECH is engineered with discreet external packaging, validated thermal insulation, and full Royal Mail tracking milestones to safeguard laboratory confidentiality and compound stability.
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
              
              {/* Shipping Rates Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#16a6a3] uppercase font-mono">DOMESTIC UK</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">Priority</span>
                  </div>
                  <div className="font-mono text-2xl sm:text-3xl font-black text-[#0b1f3a]">£4.95 GBP</div>
                  <div className="font-semibold text-xs text-[#0b1f3a]">Royal Mail Tracked 24</div>
                  <p className="text-xs text-[#64748b]">Free on orders over £100. Delivery typically within 24 hours of dispatch with SMS milestone notifications.</p>
                </div>

                <div className="p-6 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#16a6a3] uppercase font-mono">WORLDWIDE &amp; USA</span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">Airmail</span>
                  </div>
                  <div className="font-mono text-2xl sm:text-3xl font-black text-[#0b1f3a]">£15.00 GBP</div>
                  <div className="font-semibold text-xs text-[#0b1f3a]">Royal Mail International Tracked</div>
                  <p className="text-xs text-[#64748b]">Door-to-door tracking. Delivered to North America and Europe typically within 3–7 business days.</p>
                </div>
              </div>

              {/* Section 1 */}
              <section className="space-y-3 border-b border-[#f1f5f9] pb-6">
                <h3 className="text-lg font-bold text-[#0b1f3a] flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#16a6a3] bg-[#16a6a3]/10 px-2 py-0.5 rounded-md">01</span>
                  Discreet Outer Packaging Standard
                </h3>
                <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
                  <p className="text-xs text-[#0b1f3a] font-semibold">
                    Confidentiality &amp; Security Commitment:
                  </p>
                  <p className="text-xs text-[#64748b] leading-relaxed">
                    All orders are shipped in plain, durable, unmarked protective cardboard outer boxes. The external postal label contains only courier barcode data, destination address, and a compliant return PO box. <strong>Zero mention of "peptides", chemical compounds, or PEPTECH® branding appears on the exterior package.</strong>
                  </p>
                  <p className="text-xs text-[#64748b] leading-relaxed">
                    All PEPTECH branded presentation boxes, serialized Device Passports, and Certificates of Analysis are packaged exclusively inside the sealed carton.
                  </p>
                </div>
              </section>

              {/* Section 2 */}
              <section className="space-y-3 border-b border-[#f1f5f9] pb-6">
                <h3 className="text-lg font-bold text-[#0b1f3a] flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#16a6a3] bg-[#16a6a3]/10 px-2 py-0.5 rounded-md">02</span>
                  Cold-Chain Transit &amp; Thermal Protection
                </h3>
                <p>
                  Pre-filled cartridges and lyophilised vials are packed with thermal insulation and cold-packs when transit temperatures require:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs text-[#64748b]">
                  <li><strong>Freeze-Dried Lyophilised Vials</strong>: While lyophilised peptides demonstrate exceptional stability at ambient temperatures during typical transit periods, vials should be stored at 2°C–8°C or frozen at -20°C upon receipt.</li>
                  <li><strong>Prefilled Liquid Cartridges</strong>: Formulated under inert nitrogen gas and shipped with thermal barrier padding. We recommend refrigeration at 2°C–8°C immediately upon delivery.</li>
                  <li><strong>Reception Advice</strong>: In institutional laboratories, inform receiving docks that packages require cold storage transfer upon delivery.</li>
                </ul>
              </section>

              {/* Section 3 */}
              <section className="space-y-3 border-b border-[#f1f5f9] pb-6">
                <h3 className="text-lg font-bold text-[#0b1f3a] flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#16a6a3] bg-[#16a6a3]/10 px-2 py-0.5 rounded-md">03</span>
                  Fulfillment &amp; Dispatch Cutoff Times
                </h3>
                <p>
                  Orders received before <strong>14:00 GMT (Monday through Friday)</strong> are fulfilled and handed to Royal Mail the same business day. Orders placed after 14:00 GMT or over the weekend will dispatch the following business morning to prevent parcels from dwelling uncooled in courier sorting facilities over weekends.
                </p>
              </section>

              {/* Section 4 */}
              <section className="space-y-3 border-b border-[#f1f5f9] pb-6">
                <h3 className="text-lg font-bold text-[#0b1f3a] flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#16a6a3] bg-[#16a6a3]/10 px-2 py-0.5 rounded-md">04</span>
                  Returns &amp; Replacement Criteria
                </h3>
                <p>
                  Due to regulatory compliance and the sterile nature of research chemicals:
                </p>
                <div className="space-y-3 pt-1">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                    <strong className="text-emerald-900 block font-bold">✓ Damaged in Transit (Full Replacement)</strong>
                    <span className="text-emerald-800 leading-relaxed">
                      If your shipment arrives damaged or temperature-compromised, email <a href="mailto:info@peptech.bio" className="underline font-bold">info@peptech.bio</a> within 48 hours of courier delivery with lot photos. A replacement will be dispatched immediately via Royal Mail Tracked 24.
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs">
                    <strong className="text-[#0b1f3a] block font-bold">✓ Complete Pen Sets (14-Day Return Window)</strong>
                    <span className="text-[#64748b] leading-relaxed">
                      Unopened Complete Pen Sets with intact tamper-evident seals on the presentation box may be returned within 14 calendar days of delivery.
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs">
                    <strong className="text-red-900 block font-bold">✕ Compromised Sterile Peptides (Non-Returnable)</strong>
                    <span className="text-red-800 leading-relaxed">
                      Vials or cartridges whose sterile aluminum flip-off caps, rubber septa, or tamper seals have been opened cannot be returned under any circumstances due to scientific contamination and regulatory health protocols.
                    </span>
                  </div>
                </div>
              </section>

              {/* Section 5 */}
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-[#0b1f3a] flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#16a6a3] bg-[#16a6a3]/10 px-2 py-0.5 rounded-md">05</span>
                  International Customs &amp; Regulatory Duties
                </h3>
                <p>
                  All shipments are cleared under UK export regulations. International customers are responsible for ensuring that research peptides may be lawfully imported into their country or territory, and are responsible for any applicable customs clearance fees, VAT, or import tariffs.
                </p>
              </section>

            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
