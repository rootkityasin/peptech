"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"

export function Footer() {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail("")
    }
  }

  return (
    <footer className="bg-slate-50 border-t border-slate-200 text-slate-600 text-xs">
      {/* Main 4-Column Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-12 gap-10">
        
        {/* Column 1: Brand Info & Mission */}
        <div className="md:col-span-4 space-y-4">
          <Link href="/" className="inline-block">
            <div className="relative h-10 w-44 flex items-center">
              <Image
                src="/logo.webp"
                alt="PEPTECH®"
                width={170}
                height={42}
                className="object-contain"
              />
            </div>
          </Link>
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            One system. A healthier world.
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
            PEPTECH® is committed to advancing global health and safety through innovative testing solutions.
          </p>
          {/* Social Icons */}
          <div className="flex items-center gap-3 pt-2 text-slate-600">
            <a href="#" className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-[#0B1F3A] hover:text-white transition-colors" aria-label="LinkedIn">
              <span className="font-bold text-xs">in</span>
            </a>
            <a href="#" className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-[#0B1F3A] hover:text-white transition-colors" aria-label="Facebook">
              <span className="font-bold text-xs">f</span>
            </a>
            <a href="#" className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-[#0B1F3A] hover:text-white transition-colors" aria-label="YouTube">
              <span className="text-xs">▶</span>
            </a>
            <a href="#" className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-[#0B1F3A] hover:text-white transition-colors" aria-label="Instagram">
              <span className="text-xs">📷</span>
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-2 text-xs text-slate-500">
            <li><Link href="/products/complete-pen-set" className="hover:text-[#0B1F3A] transition-colors">Shop</Link></li>
            <li><Link href="/#applications" className="hover:text-[#0B1F3A] transition-colors">Applications</Link></li>
            <li><Link href="/about" className="hover:text-[#0B1F3A] transition-colors">About Us</Link></li>
            <li><Link href="/quality" className="hover:text-[#0B1F3A] transition-colors">Quality</Link></li>
            <li><Link href="/lab-reports" className="hover:text-[#0B1F3A] transition-colors">Resources</Link></li>
            <li><Link href="/contact" className="hover:text-[#0B1F3A] transition-colors">Contact</Link></li>
          </ul>
        </div>

        {/* Column 3: Support */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Support</h4>
          <ul className="space-y-2 text-xs text-slate-500">
            <li><Link href="/how-it-works#faqs" className="hover:text-[#0B1F3A] transition-colors">FAQs</Link></li>
            <li><Link href="/account" className="hover:text-[#0B1F3A] transition-colors">Track Order</Link></li>
            <li><Link href="/shipping-returns" className="hover:text-[#0B1F3A] transition-colors">Shipping Policy</Link></li>
            <li><Link href="/shipping-returns#returns" className="hover:text-[#0B1F3A] transition-colors">Returns &amp; Warranty</Link></li>
            <li><Link href="/contact" className="hover:text-[#0B1F3A] transition-colors">Technical Support</Link></li>
          </ul>
        </div>

        {/* Column 4: Stay Updated Newsletter */}
        <div className="md:col-span-4 space-y-3">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Stay Updated</h4>
          <p className="text-xs text-slate-500">
            Get the latest updates, new products and resources.
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#0B1F3A] text-white text-xs font-bold hover:bg-[#162e52] transition-colors cursor-pointer"
            >
              Subscribe
            </button>
          </form>
          {subscribed && (
            <p className="text-[11px] text-emerald-600 font-medium">Thank you for subscribing!</p>
          )}
          <p className="text-[11px] text-slate-400">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </div>

      </div>

      {/* Mandatory Statutory Compliance Notice */}
      <div className="border-t border-slate-200 bg-slate-100/70 px-4 py-4 text-center text-[11px] text-slate-500">
        <p className="max-w-4xl mx-auto">
          <strong>RESEARCH USE ONLY (RUO):</strong> All products offered by PEPTECH® are intended solely for lawful in-vitro laboratory, scientific, and educational research purposes. Not for human or veterinary administration.
        </p>
      </div>

      {/* Bottom Bar: Copyright & Legal */}
      <div className="border-t border-slate-200 px-4 sm:px-8 py-5 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
        <div>© 2026 PEPTECH®. All rights reserved.</div>
        <div className="flex items-center gap-4">
          <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
          <span>|</span>
          <Link href="/terms-of-sale" className="hover:underline">Terms of Service</Link>
          <span>|</span>
          <Link href="/research-disclaimer" className="hover:underline">Sitemap</Link>
        </div>
        <div className="text-slate-600 font-medium italic">A Healthier World. Together.™</div>
      </div>
    </footer>
  )
}
