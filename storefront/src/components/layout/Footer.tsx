"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

export function Footer() {
  const pathname = usePathname()
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)

  // Do not show global footer on checkout funnel or receipt pages
  if (pathname?.startsWith("/checkout") || pathname?.startsWith("/receipt")) return null

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail("")
    }
  }

  const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/[^0-9]/g, "")
  const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}` : null

  return (
    <footer className="bg-white border-t border-[#E2E8F0] pt-10 sm:pt-16 pb-8 sm:pb-10 text-[#64748B] text-xs print:hidden">
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
                  style={{ width: "auto", height: "auto" }}
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
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-center text-[#0B1F3A] hover:bg-[#16A6A3] hover:border-[#16A6A3] hover:text-white transition-all duration-200 hover:scale-110 shadow-2xs cursor-pointer"
                  aria-label="WhatsApp"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 2a13.93 13.93 0 0 0-12.07 20.92L2 30l7.26-1.9A13.93 13.93 0 1 0 16 2zm0 25.55a11.58 11.58 0 0 1-5.9-1.62l-.42-.25-4.38 1.15 1.17-4.27-.27-.44A11.62 11.62 0 1 1 16 27.55zm6.37-8.68c-.35-.18-2.07-1-2.39-1.12s-.56-.17-.79.17-.91 1.12-1.11 1.36-.41.26-.76.09a9.58 9.58 0 0 1-2.82-1.74 10.57 10.57 0 0 1-1.95-2.43c-.2-.35 0-.54.16-.71s.35-.41.53-.61a2.38 2.38 0 0 0 .35-.59.65.65 0 0 0 0-.62c-.09-.17-.79-1.91-1.08-2.61s-.58-.59-.79-.6h-.68a1.3 1.3 0 0 0-.94.44 3.94 3.94 0 0 0-1.23 2.93c0 1.73 1.26 3.4 1.44 3.64s2.48 3.79 6 5.31c.84.36 1.49.58 2 .74.84.27 1.61.23 2.22.14.68-.1 2.07-.85 2.36-1.66s.29-1.52.21-1.66-.33-.24-.68-.42z" />
                  </svg>
                </a>
              )}
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

        {/* Bottom Copyright & Legal Links */}
        <div className="border-t border-[#E2E8F0] pt-6 sm:pt-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-[#64748B]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[#94A3B8]">© 2026 PEPTECH®. All rights reserved.</span>
            <span className="text-[#CBD5E1]">|</span>
            <Link href="/privacy-policy" className="hover:text-[#0B1F3A] transition-colors">
              Privacy Policy
            </Link>
            <span className="text-[#CBD5E1]">|</span>
            <Link href="/terms-of-sale" className="hover:text-[#0B1F3A] transition-colors">
              Terms of Sale
            </Link>
            <span className="text-[#CBD5E1]">|</span>
            <Link href="/shipping-returns" className="hover:text-[#0B1F3A] transition-colors">
              Shipping &amp; Returns
            </Link>
            <span className="text-[#CBD5E1]">|</span>
            <Link href="/research-disclaimer" className="hover:text-[#0B1F3A] transition-colors">
              RUO Disclaimer
            </Link>
          </div>
          <p className="font-semibold text-[#0B1F3A] tracking-wide text-xs">
            Quality. Safety. Precision.
          </p>
        </div>

        {/* UK Statutory Trading & Company Disclosure */}
        <div className="pt-4 pb-2 text-[11px] text-[#94A3B8] leading-relaxed border-t border-[#F1F5F9] mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p>
            PEPTECH® is operated by <strong className="text-[#64748B]">PEPTECH LTD</strong>. 
            Registered address: Office 17 Ips Innovate, Chartermark Way, Colburn Business Park, DL9 4QJ, Colburn, United Kingdom.
          </p>
          <p className="text-[10px] text-[#A0AEC0] sm:text-right shrink-0">
            For Laboratory &amp; Scientific Research Use Only (RUO). 18+ Age Restricted.
          </p>
        </div>
      </div>
    </footer>
  )
}
