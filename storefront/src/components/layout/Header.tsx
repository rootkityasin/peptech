"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "../cart/CartContext"

export function Header() {
  const { itemCount, setIsDrawerOpen } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [shopMenuOpen, setShopMenuOpen] = useState(false)
  const [appMenuOpen, setAppMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/vials?search=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <>
      {/* Top Utility Bar (Screenshot 1 & 2) */}
      <div className="bg-[#08172c] text-white/80 text-[11px] sm:text-xs py-2 px-4 sm:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 truncate">
            <span className="font-medium text-white/90">Precision Today. Better Tomorrow.</span>
            <span className="hidden md:inline text-white/30">|</span>
            <span className="hidden md:inline text-white/70">Trusted by laboratories worldwide</span>
            <span className="hidden lg:inline text-white/30">|</span>
            <span className="hidden lg:inline text-[var(--color-brand-teal)] font-semibold">Free shipping over $200</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 text-white/80 shrink-0 font-medium">
            <Link href="/how-it-works" className="hover:text-white transition-colors hidden sm:inline">Support</Link>
            <Link href="/account" className="hover:text-white transition-colors hidden sm:inline">Track Order</Link>
            <Link href="/lab-reports" className="hover:text-white transition-colors hidden md:inline">Resources</Link>
            <div className="flex items-center gap-1 cursor-pointer hover:text-white">
              <span>🌐</span>
              <span>EN</span>
              <span className="text-[9px]">▾</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Left: Mobile Toggle & PEPTECH Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Toggle Navigation"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative h-10 sm:h-12 w-36 sm:w-44 flex items-center">
                <Image
                  src="/logo.webp"
                  alt="PEPTECH® Quality. Safety. Precision."
                  width={170}
                  height={42}
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation Links (Mockup 1 & 2) */}
          <nav className="hidden lg:flex items-center gap-7 text-[13px] font-semibold text-slate-700">
            {/* Shop Dropdown */}
            <div 
              className="relative py-2 group cursor-pointer"
              onMouseEnter={() => setShopMenuOpen(true)}
              onMouseLeave={() => setShopMenuOpen(false)}
            >
              <div className="flex items-center gap-1 hover:text-[#0B1F3A] transition-colors">
                <span>Shop</span>
                <span className="text-[10px] transition-transform group-hover:translate-y-0.5">▾</span>
              </div>
              {shopMenuOpen && (
                <div className="absolute top-full left-0 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-3 px-2 z-50 animate-in fade-in slide-in-from-top-1">
                  <Link 
                    href="/products/complete-pen-set"
                    className="block px-3 py-2 text-xs font-bold text-[#0B1F3A] hover:bg-slate-50 rounded-lg"
                  >
                    Complete Pen Sets <span className="text-[10px] text-emerald-600 block font-normal">Reusable pen kit + accessories</span>
                  </Link>
                  <Link 
                    href="/refills"
                    className="block px-3 py-2 text-xs font-bold text-[#0B1F3A] hover:bg-slate-50 rounded-lg"
                  >
                    Refill Cartridges <span className="text-[10px] text-[var(--color-brand-teal)] block font-normal">Pre-filled cartridges & 10% Sub</span>
                  </Link>
                  <Link 
                    href="/vials"
                    className="block px-3 py-2 text-xs font-bold text-[#0B1F3A] hover:bg-slate-50 rounded-lg"
                  >
                    Freeze-Dried Vials <span className="text-[10px] text-slate-500 block font-normal">5mg - 50mg laboratory vials</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Applications Dropdown */}
            <div 
              className="relative py-2 group cursor-pointer"
              onMouseEnter={() => setAppMenuOpen(true)}
              onMouseLeave={() => setAppMenuOpen(false)}
            >
              <div className="flex items-center gap-1 hover:text-[#0B1F3A] transition-colors">
                <span>Applications</span>
                <span className="text-[10px] transition-transform group-hover:translate-y-0.5">▾</span>
              </div>
              {appMenuOpen && (
                <div className="absolute top-full left-0 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 px-2 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-md">Food Safety</div>
                  <div className="px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-md">Water Quality</div>
                  <div className="px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-md">Environmental</div>
                  <div className="px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-md">Healthcare</div>
                  <div className="px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-md">Industrial Hygiene</div>
                  <div className="px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-md">Agriculture & Feed</div>
                </div>
              )}
            </div>

            <Link href="/about" className="hover:text-[#0B1F3A] transition-colors">About Us</Link>
            <Link href="/quality" className="hover:text-[#0B1F3A] transition-colors">Quality</Link>
            <Link href="/lab-reports" className="hover:text-[#0B1F3A] transition-colors">Resources</Link>
            <Link href="/contact" className="hover:text-[#0B1F3A] transition-colors">Contact</Link>
          </nav>

          {/* Right: Actions (Search, Account, Cart) */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-slate-600 hover:text-[#0B1F3A] hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              aria-label="Search"
              title="Search test systems & cartridges"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Account */}
            <Link
              href="/account"
              className="p-2 text-slate-600 hover:text-[#0B1F3A] hover:bg-slate-100 rounded-full transition-colors hidden sm:flex items-center justify-center"
              aria-label="Account"
              title="Customer Account"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative p-2 text-slate-700 hover:text-[#0B1F3A] hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              aria-label="Cart"
              title="View Cart"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#00C5A0] text-white text-[10px] font-bold rounded-full h-4.5 w-4.5 flex items-center justify-center shadow-xs">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar Overlay */}
        {searchOpen && (
          <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 shadow-inner">
            <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, systems, or cartridges (e.g., RT40, C.C-1236, TB-S30)..."
                className="flex-1 px-4 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                autoFocus
              />
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-[#0B1F3A] text-white text-xs font-bold hover:bg-[#162e52] transition-colors"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="px-3 py-2 rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-100 text-xs"
              >
                ✕
              </button>
            </form>
          </div>
        )}

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-2">
            <div className="space-y-1 text-sm font-semibold text-slate-800">
              <Link
                href="/products/complete-pen-set"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Pen Systems ($249.00)
              </Link>
              <Link
                href="/refills"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Individual Cartridges ($25 - $39)
              </Link>
              <Link
                href="/vials"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Freeze-Dried Vials
              </Link>
              <Link
                href="/lab-reports"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Resources & COA
              </Link>
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                My Account / Orders
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
