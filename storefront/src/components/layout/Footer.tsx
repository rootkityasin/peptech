"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

export function Footer() {
  const pathname = usePathname()
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)

  // Do not show global footer on checkout funnel pages (Figma Node 50:8021 / 52:8419)
  if (pathname?.startsWith("/checkout")) return null

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail("")
    }
  }

  return (
    <footer className="bg-white border-t border-[#E2E8F0] pt-16 pb-8 text-[#64748B] text-xs">
      {/* Main 4-Column Footer Container - Figma Node 2:29623 */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12">
          
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/" className="inline-block">
              <div className="relative h-[26px] w-[125px] flex items-center">
                <Image
                  src="/images/figma/peptech-logo.png"
                  alt="PEPTECH®"
                  width={125}
                  height={26}
                  className="object-contain"
                />
              </div>
            </Link>
            <div className="text-[9px] font-semibold text-[#16A6A3] tracking-[0.5px] uppercase">
              Quality. Safety. Precision.
            </div>
            <p className="text-[13px] text-[#64748B] leading-[20px] max-w-[300px]">
              One system. A healthier world. PEPTECH® is committed to advancing global health and safety through innovative testing solutions.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="#"
                className="w-8 h-8 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-center hover:bg-[#0B1F3A] hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <img src="/images/figma/189a1b54f2809ec497713a2c330e657d0bb0057f.svg" alt="LinkedIn" className="w-3.5 h-3.5" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-center hover:bg-[#0B1F3A] hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <img src="/images/figma/680d766dfd6a77333880ba90d321fcece6270899.svg" alt="Facebook" className="w-3.5 h-3.5" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-center hover:bg-[#0B1F3A] hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <img src="/images/figma/50be120ee695cd24a28f94519716b1677fcd739c.svg" alt="YouTube" className="w-3.5 h-3.5" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-center hover:bg-[#0B1F3A] hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <img src="/images/figma/e6f3de6cfc9585fcd8e15dd8bdbca9f20814d8d1.svg" alt="Instagram" className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-bold text-[#0B1F3A] text-[14px]">Quick Links</h4>
            <ul className="space-y-3 text-[13px] text-[#475569]">
              <li><Link href="/shop" className="hover:text-[#16A6A3] transition-colors">Shop</Link></li>
              <li><Link href="/about" className="hover:text-[#16A6A3] transition-colors">About Us</Link></li>
              <li><Link href="/how-it-works" className="hover:text-[#16A6A3] transition-colors">How It Works</Link></li>
              <li><Link href="/verify" className="hover:text-[#16A6A3] transition-colors">Verify Your Batch</Link></li>
              <li><Link href="/contact" className="hover:text-[#16A6A3] transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Support Column */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-bold text-[#0B1F3A] text-[14px]">Support</h4>
            <ul className="space-y-3 text-[13px] text-[#475569]">
              <li><Link href="/how-it-works#faqs" className="hover:text-[#16A6A3] transition-colors">FAQs</Link></li>
              <li><Link href="/account?tab=orders" className="hover:text-[#16A6A3] transition-colors">Track Order</Link></li>
              <li><Link href="/shipping-returns" className="hover:text-[#16A6A3] transition-colors">Shipping Policy</Link></li>
              <li><Link href="/terms-of-sale" className="hover:text-[#16A6A3] transition-colors">Returns &amp; Warranty</Link></li>
              <li><Link href="/contact" className="hover:text-[#16A6A3] transition-colors">Laboratory Support</Link></li>
            </ul>
          </div>

          {/* Stay Updated Card */}
          <div className="md:col-span-4 bg-[#F0F5FD] p-6 rounded-[16px] space-y-3.5">
            <h4 className="font-bold text-[#0B1F3A] text-[16px]">Stay Updated</h4>
            <p className="text-[13px] text-[#4E657E] leading-[19px]">
              Get the latest updates, new products and resources.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="flex-1 px-3.5 py-2 text-xs rounded-lg border border-[#D2DFED] bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
              />
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-[#0B1F3A] text-white text-[13px] font-semibold hover:bg-[#162e52] transition-colors cursor-pointer shrink-0"
              >
                Subscribe
              </button>
            </form>
            {subscribed ? (
              <p className="text-[11px] text-emerald-600 font-medium">Thank you for subscribing!</p>
            ) : (
              <p className="text-[11px] text-[#8B9EAF]">
                We respect your privacy. Unsubscribe anytime.
              </p>
            )}
          </div>

        </div>

        {/* Bottom Copyright & Legal Links - Figma Node 2:29669 */}
        <div className="border-t border-[#E2E8F0] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-[#64748B]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[#94A3B8]">© 2026 PEPTECH®. All rights reserved.</span>
            <span className="text-[#CBD5E1]">|</span>
            <Link href="/privacy-policy" className="hover:text-[#0B1F3A] transition-colors">
              Privacy Policy
            </Link>
            <span className="text-[#CBD5E1]">|</span>
            <Link href="/terms-of-sale" className="hover:text-[#0B1F3A] transition-colors">
              Terms of Service
            </Link>
            <span className="text-[#CBD5E1]">|</span>
            <Link href="/research-disclaimer" className="hover:text-[#0B1F3A] transition-colors">
              Sitemap
            </Link>
          </div>
          <p className="font-medium text-[#0B1F3A]">
            A Healthier World. Together.™
          </p>
        </div>
      </div>
    </footer>
  )
}
