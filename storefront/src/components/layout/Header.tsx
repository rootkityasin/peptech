"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "../cart/CartContext"

export function Header() {
  const { itemCount, setIsDrawerOpen } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-[var(--color-background)]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        
        {/* Left: Mobile Hamburger & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>

          <Link href="/" className="flex items-center">
            <div className="relative h-9 sm:h-10 w-36 sm:w-44 bg-black px-2.5 py-1 rounded-lg flex items-center justify-center border border-zinc-800">
              <Image
                src="/logo.webp"
                alt="PEPTECH"
                width={160}
                height={36}
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation (The 3 Core Categories + Reports & Journey) */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
          <Link
            href="/pen-sets"
            className="hover:text-[var(--color-brand-teal)] transition-colors py-1 flex items-center gap-1.5"
          >
            <span>Pen Sets</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold lowercase">1st purchase</span>
          </Link>
          <Link
            href="/refills"
            className="hover:text-[var(--color-brand-teal)] transition-colors py-1 flex items-center gap-1.5"
          >
            <span>Refills</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-[var(--color-brand-teal)]/10 text-[var(--color-brand-teal)] font-bold lowercase">-10% sub</span>
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
            <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-600 font-bold">COA</span>
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

        {/* Right: Actions (Search, Admin Portal, Cart) */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            href="/lab-reports"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
          >
            <span>🔍</span>
            <span className="text-zinc-500">Search batch...</span>
          </Link>

          <a
            href="http://localhost:9000/app"
            target="_blank"
            rel="noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-brand-navy)] hover:bg-[var(--color-brand-slate)] text-white text-xs font-semibold transition-all shadow-xs"
            title="Open Native Medusa 2.0 Admin Dashboard"
          >
            <span>Admin</span>
            <span className="text-[10px] opacity-75">↗</span>
          </a>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 sm:px-3 sm:py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100 flex items-center gap-2 text-xs font-bold transition-all relative"
            aria-label="Open Cart"
          >
            <span>🛒</span>
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 && (
              <span className="bg-[var(--color-brand-teal)] text-white rounded-full px-1.5 py-0.2 text-[10px] font-black min-w-4 text-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-[var(--color-background)] px-4 py-4 space-y-3 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-1 gap-1 text-sm font-semibold">
            <Link
              href="/pen-sets"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex justify-between items-center"
            >
              <span>1. Complete Pen Sets</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 font-bold">1st Purchase</span>
            </Link>
            <Link
              href="/refills"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex justify-between items-center"
            >
              <span>2. Refill Cartridges</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-brand-teal)]/10 text-[var(--color-brand-teal)] font-bold">-10% Sub</span>
            </Link>
            <Link
              href="/vials"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex justify-between items-center"
            >
              <span>3. Freeze-Dried Vials</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-600 font-bold">All 50+ Vials</span>
            </Link>
            <Link
              href="/lab-reports"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex justify-between items-center"
            >
              <span>Search Lab Reports (COA)</span>
              <span className="text-[10px] text-zinc-400">HPLC / MS</span>
            </Link>
            <Link
              href="/verify"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex justify-between items-center"
            >
              <span>QR Authenticity Scan</span>
              <span className="text-[10px] text-zinc-400">Packaging</span>
            </Link>
            <Link
              href="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex justify-between items-center text-zinc-500"
            >
              <span>How the System Works</span>
              <span className="text-[10px]">3 Steps</span>
            </Link>
          </div>
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-xs">
            <span className="text-zinc-500 font-mono">Royal Mail: £4.95 UK / £15 INTL</span>
            <a
              href="http://localhost:9000/app"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-[var(--color-brand-teal)]"
            >
              Admin Dashboard ↗
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
