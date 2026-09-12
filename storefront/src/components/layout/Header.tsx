"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "../cart/CartContext"

export function Header() {
  const { itemCount, setIsDrawerOpen } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/vials?search=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-[var(--color-background)]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Mobile Hamburger & Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative h-9 sm:h-11 w-32 sm:w-44 bg-[var(--color-brand-navy)] px-2.5 py-1.5 rounded-xl flex items-center justify-center border border-zinc-700/80 shadow-xs transition-transform group-hover:scale-[1.02]">
              <Image
                src="/logo.webp"
                alt="PEPTECH®"
                width={150}
                height={32}
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation (Screenshot 2 Structure) */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
          <Link
            href="/pen-sets"
            className="hover:text-[var(--color-brand-teal)] transition-colors py-1 flex items-center gap-1.5"
          >
            <span>Pen Sets</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold lowercase">
              1st purchase
            </span>
          </Link>
          <Link
            href="/refills"
            className="hover:text-[var(--color-brand-teal)] transition-colors py-1 flex items-center gap-1.5"
          >
            <span>Refills</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[var(--color-brand-teal)]/10 text-[var(--color-brand-teal)] font-bold lowercase">
              -10% sub
            </span>
          </Link>
          <Link
            href="/vials"
            className="hover:text-[var(--color-brand-teal)] transition-colors py-1 flex items-center gap-1.5"
          >
            <span>Freeze-Dried Vials</span>
          </Link>
          <Link
            href="/lab-reports"
            className="hover:text-[var(--color-brand-teal)] transition-colors py-1 flex items-center gap-1"
          >
            <span>Lab Reports</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">
              COA
            </span>
          </Link>
          <Link
            href="/verify"
            className="hover:text-[var(--color-brand-teal)] transition-colors py-1"
          >
            Verify QR
          </Link>
          <Link
            href="/how-it-works"
            className="hover:text-[var(--color-brand-teal)] transition-colors py-1 text-zinc-400"
          >
            How It Works
          </Link>
        </nav>

        {/* Right: Actions (Search, Admin Portal, Cart with Badge) */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Search Trigger Button */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            aria-label="Search Catalog"
            title="Search by compound or SKU"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Admin Dashboard Pill */}
          <a
            href="http://localhost:9000/app"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-brand-navy)] hover:bg-[var(--color-brand-slate)] text-white text-xs font-semibold transition-all shadow-xs border border-zinc-700"
            title="Open Native Medusa 2.0 Admin Dashboard"
          >
            <span>Admin</span>
            <span className="text-[10px] text-[var(--color-brand-teal)]">↗</span>
          </a>

          {/* Shopping Bag / Cart Button (Screenshot 1 Layout) */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 flex items-center gap-2 text-xs font-bold transition-all relative cursor-pointer"
            aria-label="View Shopping Cart"
          >
            <svg className="w-5 h-5 text-zinc-800 dark:text-zinc-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="hidden md:inline">Order</span>
            {itemCount > 0 && (
              <span className="bg-[var(--color-brand-teal)] text-white rounded-full px-1.5 py-0.2 text-[10px] font-black min-w-4.5 text-center shadow-xs">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Quick Search Overlay Dropdown */}
      {searchOpen && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 bg-[var(--color-background)] px-4 py-3 shadow-lg">
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                🔍
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search compounds (e.g., Retatrutide, Tirzepatide, BPC-157, GHK-CU)..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-[var(--color-brand-teal)]"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[var(--color-brand-teal)] hover:bg-[var(--color-brand-teal-hover)] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              ✕
            </button>
          </form>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-200 dark:border-zinc-800 bg-[var(--color-background)] px-4 py-4 space-y-3 shadow-xl animate-in slide-in-from-top-2">
          <div className="grid grid-cols-1 gap-1 text-sm font-semibold">
            <Link
              href="/pen-sets"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 flex justify-between items-center"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🖊️</span>
                <span>1. Complete Pen Sets</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 font-bold">1st Purchase</span>
            </Link>
            <Link
              href="/refills"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 flex justify-between items-center"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🔄</span>
                <span>2. Refill Cartridges</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-brand-teal)]/10 text-[var(--color-brand-teal)] font-bold">-10% Sub</span>
            </Link>
            <Link
              href="/vials"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 flex justify-between items-center"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🧪</span>
                <span>3. Freeze-Dried Vials</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 font-bold">50+ Vials</span>
            </Link>
            <Link
              href="/lab-reports"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 flex justify-between items-center"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">📋</span>
                <span>Search Lab Reports (COA)</span>
              </div>
              <span className="text-[10px] text-zinc-400">HPLC / MS</span>
            </Link>
            <Link
              href="/verify"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 flex justify-between items-center"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">📱</span>
                <span>QR Packaging Verification</span>
              </div>
              <span className="text-[10px] text-zinc-400">Scan</span>
            </Link>
            <Link
              href="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 flex justify-between items-center text-zinc-500"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">ℹ️</span>
                <span>How System Works</span>
              </div>
              <span className="text-[10px]">3 Steps</span>
            </Link>
          </div>

          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-xs">
            <span className="text-zinc-500 font-mono text-[11px]">Royal Mail: £4.95 UK / £15 INTL</span>
            <a
              href="http://localhost:9000/app"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-[var(--color-brand-teal)] hover:underline flex items-center gap-1"
            >
              <span>Admin Portal</span>
              <span>↗</span>
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
