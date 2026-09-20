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
    <footer className="bg-white border-t border-[#E2E8F0] pt-10 sm:pt-16 pb-8 sm:pb-10 text-[#64748B] text-xs">
      {/* Main 4-Column Footer Container - Figma Node 2:29623 */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-10 pb-8 sm:pb-12">
          
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-3.5 sm:space-y-4">
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
            <p className="text-[13px] text-[#64748B] leading-[22px] max-w-[320px]">
              One system. A healthier world. PEPTECH® is committed to advancing global health and safety through innovative testing solutions.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-1.5">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-center text-[#0B1F3A] hover:bg-[#16A6A3] hover:border-[#16A6A3] hover:text-white transition-all duration-200 hover:scale-110 shadow-2xs cursor-pointer"
                aria-label="LinkedIn"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.0833 1.75C11.3928 1.75 11.6895 1.87292 11.9083 2.09171C12.1271 2.3105 12.25 2.60725 12.25 2.91667V11.0833C12.25 11.3928 12.1271 11.6895 11.9083 11.9083C11.6895 12.1271 11.3928 12.25 11.0833 12.25H2.91667C2.60725 12.25 2.3105 12.1271 2.09171 11.9083C1.87292 11.6895 1.75 11.3928 1.75 11.0833V2.91667C1.75 2.60725 1.87292 2.3105 2.09171 2.09171C2.3105 1.87292 2.60725 1.75 2.91667 1.75H11.0833ZM10.7917 10.7917V7.7C10.7917 7.19565 10.5913 6.71195 10.2347 6.35532C9.87805 5.99869 9.39435 5.79833 8.89 5.79833C8.39417 5.79833 7.81667 6.10167 7.56 6.55667V5.90917H5.9325V10.7917H7.56V7.91583C7.56 7.46667 7.92167 7.09917 8.37083 7.09917C8.58743 7.09917 8.79515 7.18521 8.9483 7.33836C9.10146 7.49152 9.1875 7.69924 9.1875 7.91583V10.7917H10.7917ZM3.76833 5.11C4.33417 5.11 4.78917 4.64917 4.78917 4.08333C4.78917 3.5175 4.33417 3.0625 3.76833 3.0625C3.2025 3.0625 2.74167 3.5175 2.74167 4.08333C2.74167 4.64917 3.2025 5.11 3.76833 5.11ZM4.57917 10.7917V5.90917H2.9575V10.7917H4.57917Z" />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-center text-[#0B1F3A] hover:bg-[#16A6A3] hover:border-[#16A6A3] hover:text-white transition-all duration-200 hover:scale-110 shadow-2xs cursor-pointer"
                aria-label="Facebook"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.8333 7C12.8333 3.78 10.22 1.16667 7 1.16667C3.78 1.16667 1.16667 3.78 1.16667 7C1.16667 9.82333 3.17333 12.1742 5.83333 12.7167V8.75H4.66667V7H5.83333V5.54167C5.83333 4.41583 6.74917 3.5 7.875 3.5H9.33333V5.25H8.16667C7.84583 5.25 7.58333 5.5125 7.58333 5.83333V7H9.33333V8.75H7.58333V12.8042C10.5292 12.5125 12.8333 10.0275 12.8333 7Z" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-center text-[#0B1F3A] hover:bg-[#16A6A3] hover:border-[#16A6A3] hover:text-white transition-all duration-200 hover:scale-110 shadow-2xs cursor-pointer"
                aria-label="YouTube"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5.83333 8.75L8.86083 7L5.83333 5.25V8.75ZM12.5767 4.1825C12.6525 4.45667 12.705 4.82417 12.74 5.29083C12.7808 5.7575 12.7983 6.16 12.7983 6.51L12.8333 7C12.8333 8.2775 12.74 9.21667 12.5767 9.8175C12.4308 10.3425 12.0925 10.6808 11.5675 10.8267C11.2933 10.9025 10.7917 10.955 10.0217 10.99C9.26333 11.0308 8.56917 11.0483 7.9275 11.0483L7 11.0833C4.55583 11.0833 3.03333 10.99 2.4325 10.8267C1.9075 10.6808 1.56917 10.3425 1.42333 9.8175C1.3475 9.54333 1.295 9.17583 1.26 8.70917C1.21917 8.2425 1.20167 7.84 1.20167 7.49L1.16667 7C1.16667 5.7225 1.26 4.78333 1.42333 4.1825C1.56917 3.6575 1.9075 3.31917 2.4325 3.17333C2.70667 3.0975 3.20833 3.045 3.97833 3.01C4.73667 2.96917 5.43083 2.95167 6.0725 2.95167L7 2.91667C9.44417 2.91667 10.9667 3.01 11.5675 3.17333C12.0925 3.31917 12.4308 3.6575 12.5767 4.1825Z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-center text-[#0B1F3A] hover:bg-[#16A6A3] hover:border-[#16A6A3] hover:text-white transition-all duration-200 hover:scale-110 shadow-2xs cursor-pointer"
                aria-label="Instagram"
              >
                <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 14 14" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.91667 1.16667H4.08333C2.4725 1.16667 1.16667 2.4725 1.16667 4.08333V9.91667C1.16667 11.5275 2.4725 12.8333 4.08333 12.8333H9.91667C11.5275 12.8333 12.8333 11.5275 12.8333 9.91667V4.08333C12.8333 2.4725 11.5275 1.16667 9.91667 1.16667Z" />
                  <path d="M9.33333 6.6325C9.40532 7.11798 9.3224 7.61379 9.09636 8.04943C8.87032 8.48506 8.51267 8.83832 8.07428 9.05898C7.6359 9.27963 7.13909 9.35643 6.65454 9.27846C6.16999 9.20049 5.72236 8.97172 5.37532 8.62468C5.02828 8.27764 4.79951 7.83001 4.72154 7.34546C4.64357 6.86091 4.72037 6.36411 4.94102 5.92572C5.16168 5.48733 5.51494 5.12968 5.95057 4.90364C6.38621 4.6776 6.88202 4.59468 7.3675 4.66667C7.8627 4.7401 8.32116 4.97085 8.67515 5.32485C9.02915 5.67884 9.2599 6.1373 9.33333 6.6325Z" />
                  <path d="M10.2083 3.79167H10.2142" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links & Support Columns (Side-by-side on mobile, 4 columns on desktop) */}
          <div className="col-span-1 md:col-span-4 grid grid-cols-2 gap-8 sm:gap-10">
            {/* Quick Links Column */}
            <div className="space-y-3 sm:space-y-3.5">
              <h4 className="font-bold text-[#0B1F3A] text-[15px] tracking-tight">Quick Links</h4>
              <ul className="space-y-2.5 text-[13px] text-[#475569]">
                <li><Link href="/shop" className="hover:text-[#16A6A3] transition-colors">Shop</Link></li>
                <li><Link href="/about" className="hover:text-[#16A6A3] transition-colors">About Us</Link></li>
                <li><Link href="/how-it-works" className="hover:text-[#16A6A3] transition-colors">How It Works</Link></li>
                <li><Link href="/verify" className="hover:text-[#16A6A3] transition-colors">Verify Your Batch</Link></li>
                <li><Link href="/contact" className="hover:text-[#16A6A3] transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Support Column */}
            <div className="space-y-3 sm:space-y-3.5">
              <h4 className="font-bold text-[#0B1F3A] text-[15px] tracking-tight">Support</h4>
              <ul className="space-y-2.5 text-[13px] text-[#475569]">
                <li><Link href="/how-it-works#faqs" className="hover:text-[#16A6A3] transition-colors">FAQs</Link></li>
                <li><Link href="/account?tab=orders" className="hover:text-[#16A6A3] transition-colors">Track Order</Link></li>
                <li><Link href="/shipping-returns" className="hover:text-[#16A6A3] transition-colors">Shipping Policy</Link></li>
                <li><Link href="/terms-of-sale" className="hover:text-[#16A6A3] transition-colors">Returns &amp; Warranty</Link></li>
                <li><Link href="/contact" className="hover:text-[#16A6A3] transition-colors">Laboratory Support</Link></li>
              </ul>
            </div>
          </div>

          {/* Stay Updated Card */}
          <div className="md:col-span-4 bg-[#F0F5FD] p-6 sm:p-7 rounded-[18px] space-y-4">
            <h4 className="font-bold text-[#0B1F3A] text-[16px]">Stay Updated</h4>
            <p className="text-[13px] text-[#4E657E] leading-[21px]">
              Get the latest updates, new products and resources.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2.5 pt-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="flex-1 px-3.5 py-2.5 text-xs rounded-lg border border-[#D2DFED] bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-[#0B1F3A] text-white text-[13px] font-semibold hover:bg-[#162e52] transition-colors cursor-pointer shrink-0"
              >
                Subscribe
              </button>
            </form>
            {subscribed ? (
              <p className="text-[11px] text-emerald-600 font-medium pt-0.5">Thank you for subscribing!</p>
            ) : (
              <p className="text-[11px] text-[#8B9EAF] pt-0.5">
                We respect your privacy. Unsubscribe anytime.
              </p>
            )}
          </div>

        </div>

        {/* Bottom Copyright & Legal Links - Figma Node 2:29669 */}
        <div className="border-t border-[#E2E8F0] pt-6 sm:pt-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-[#64748B]">
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
