import React from "react"
import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-800 text-xs">
      {/* Top Value Propositions */}
      <div className="border-b border-zinc-800/80 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-3">
          <span className="text-2xl">📦</span>
          <div>
            <div className="font-bold text-zinc-100 text-sm">Discreet Packaging Promise</div>
            <div className="text-[11px] text-zinc-500">Unbranded exterior box. PEPTECH branding kept inside.</div>
          </div>
        </div>

        <div className="flex items-center justify-center md:justify-start gap-3">
          <span className="text-2xl">🔬</span>
          <div>
            <div className="font-bold text-zinc-100 text-sm">Batch Verified Testing</div>
            <div className="text-[11px] text-zinc-500">Independent HPLC &amp; Mass Spectrometry reports on every lot.</div>
          </div>
        </div>

        <div className="flex items-center justify-center md:justify-start gap-3">
          <span className="text-2xl">🚚</span>
          <div>
            <div className="font-bold text-zinc-100 text-sm">Royal Mail Tracked</div>
            <div className="text-[11px] text-zinc-500">£4.95 UK Delivery • £15.00 Worldwide Delivery</div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        
        {/* Brand Summary */}
        <div className="col-span-2 space-y-3">
          <div className="relative h-9 w-40 bg-black px-2 py-1 rounded flex items-center justify-center border border-zinc-800">
            <Image
              src="/logo.webp"
              alt="PEPTECH"
              width={140}
              height={32}
              className="object-contain"
            />
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
            PEPTECH® provides high-purity research compounds and reusable precision pen systems strictly for laboratory, scientific, and scientific research purposes.
          </p>
          <div className="text-[11px] text-zinc-400 font-mono">
            Support: <a href="mailto:info@peptech.bio" className="text-[var(--color-brand-teal)] hover:underline">info@peptech.bio</a>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-zinc-100 text-xs uppercase tracking-wider">Product Categories</h4>
          <ul className="space-y-1.5 text-zinc-400">
            <li><Link href="/pen-sets" className="hover:text-white transition-colors">1. Complete Pen Sets</Link></li>
            <li><Link href="/refills" className="hover:text-white transition-colors">2. Refill Cartridges</Link></li>
            <li><Link href="/vials" className="hover:text-white transition-colors">3. Freeze-Dried Vials</Link></li>
            <li><Link href="/how-it-works" className="hover:text-white transition-colors">How the System Works</Link></li>
          </ul>
        </div>

        {/* Verification */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-zinc-100 text-xs uppercase tracking-wider">Lab Verification</h4>
          <ul className="space-y-1.5 text-zinc-400">
            <li><Link href="/lab-reports" className="hover:text-white transition-colors">Search Lab Reports (COA)</Link></li>
            <li><Link href="/verify" className="hover:text-white transition-colors">Packaging QR Verification</Link></li>
            <li><Link href="/how-it-works#testing" className="hover:text-white transition-colors">HPLC Methodology</Link></li>
            <li><a href="http://localhost:9000/app" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors">Admin Dashboard ↗</a></li>
          </ul>
        </div>

        {/* Legal & Compliance */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-zinc-100 text-xs uppercase tracking-wider">Compliance &amp; Legal</h4>
          <ul className="space-y-1.5 text-zinc-400">
            <li><Link href="/research-disclaimer" className="hover:text-white transition-colors">18+ Research Disclaimer</Link></li>
            <li><Link href="/terms-of-sale" className="hover:text-white transition-colors">Terms of Sale</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy (UK GDPR)</Link></li>
            <li><Link href="/shipping-returns" className="hover:text-white transition-colors">Shipping &amp; Returns</Link></li>
          </ul>
        </div>

      </div>

      {/* Mandatory Statutory Notice */}
      <div className="border-t border-zinc-900 bg-black/60 px-4 py-6 text-center text-[11px] text-zinc-500 space-y-2">
        <p className="max-w-4xl mx-auto text-zinc-400">
          <strong>RESEARCH USE ONLY (RUO):</strong> All products offered by PEPTECH® are intended solely for lawful in-vitro laboratory, scientific, and educational research purposes. They are NOT intended for human or veterinary use, injection, diagnosis, treatment, cure, or prevention of any disease.
        </p>
        <p>© {new Date().getFullYear()} PEPTECH®. All rights reserved. Registered UK Trademark.</p>
      </div>
    </footer>
  )
}
