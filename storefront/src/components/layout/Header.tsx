"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useCart } from "../cart/CartContext"
import { useCustomer } from "@/context/CustomerContext"

export function Header() {
  const pathname = usePathname()
  const { itemCount, setIsDrawerOpen } = useCart()
  const { customer, isAuthenticated } = useCustomer()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [shopMenuOpen, setShopMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Focus input automatically when search opens
  useEffect(() => {
    if (searchOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus()
      }, 70)
      return () => clearTimeout(timer)
    }
  }, [searchOpen])

  // Dismiss on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [searchOpen])

  // Dismiss when clicking outside navbar while search is open
  useEffect(() => {
    if (!searchOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [searchOpen])

  // Do not show global header on checkout funnel pages (Figma Node 50:8021 / 52:8419)
  if (pathname?.startsWith("/checkout")) return null

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/vials?search=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <>
      {/* 01 Top Announcement Bar - Figma Node 2:29210 */}
      <div className="bg-[#0e2a47] text-white text-[12px] h-[38px] flex items-center px-4 sm:px-8 border-b border-white/10 z-50 relative">
        <div className="max-w-[1240px] w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-normal text-[#e2e8f0]">Precision Today. Better Tomorrow.</span>
          </div>
          <div className="flex items-center gap-[16px] text-[#e2e8f0] text-[12px] font-normal shrink-0">
            <Link href="/how-it-works" className="hover:text-white transition-colors hidden sm:inline">
              Support
            </Link>
            <span className="text-[#64748b] hidden sm:inline">|</span>
            <Link href="/account" className="hover:text-white transition-colors hidden sm:inline">
              Track Order
            </Link>
            <span className="text-[#64748b] hidden md:inline">|</span>
            <Link href="/lab-reports" className="hover:text-white transition-colors hidden md:inline">
              Resources
            </Link>
            <span className="text-[#64748b] hidden sm:inline">|</span>
            <div className="flex items-center gap-[6px] cursor-pointer hover:text-white">
              <div className="w-[14px] h-[14px]">
                <img src="/images/figma/d3ec4cde5ca0a92f851ec4f47cdf9bbd626b88c1.svg" alt="Globe" className="w-full h-full" />
              </div>
              <span className="font-medium text-white text-[12px]">EN</span>
            </div>
          </div>
        </div>
      </div>

      {/* 02 Header Navigation - Figma Node 2:29228 */}
      <header className={`bg-white sticky top-0 z-40 shadow-xs h-[80px] flex items-center relative transition-colors ${
        searchOpen ? "border-b-0" : "border-b border-[#E2E8F0]"
      }`}>
        <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* Brand Logo with Slogan */}
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

            <Link href="/" className="flex flex-col gap-[3px] items-start shrink-0 group">
              <div className="h-[27px] w-[130px] relative">
                <Image
                  src="/images/figma/peptech-logo.png"
                  alt="PEPTECH®"
                  width={130}
                  height={27}
                  className="object-contain"
                  priority
                />
              </div>
              <p className="font-semibold text-[#16A6A3] text-[9px] tracking-[0.5px] whitespace-nowrap uppercase">
                Quality. Safety. Precision.
              </p>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-[32px] text-[14px] font-medium text-[#64748b]">
            {/* Shop Dropdown */}
            <div 
              className="relative py-4 group cursor-pointer"
              onMouseEnter={() => setShopMenuOpen(true)}
              onMouseLeave={() => setShopMenuOpen(false)}
            >
              <Link 
                href="/shop" 
                className={`flex items-center gap-1.5 transition-colors ${
                  shopMenuOpen || pathname?.startsWith("/shop") || pathname?.startsWith("/pen-sets") || pathname?.startsWith("/refills") || pathname?.startsWith("/vials")
                    ? "text-[#16A6A3] font-semibold" 
                    : "text-[#64748b] hover:text-[#16A6A3]"
                }`}
              >
                <span>Shop</span>
                {/* Visible animated chevron arrow */}
                <svg 
                  className={`w-3.5 h-3.5 transition-transform duration-300 transform ${
                    shopMenuOpen ? "rotate-180 text-[#16A6A3]" : "text-[#94a3b8] group-hover:text-[#16A6A3]"
                  }`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </Link>

              {/* Classy Animated Mega Dropdown */}
              <div 
                className={`absolute top-full left-0 w-[520px] bg-white border border-[#e2e8f0] rounded-2xl shadow-xl shadow-[#0b1f3a]/8 z-50 overflow-hidden transition-all duration-300 ease-out origin-top-left ${
                  shopMenuOpen 
                    ? "opacity-100 translate-y-1 pointer-events-auto scale-100" 
                    : "opacity-0 translate-y-3 pointer-events-none scale-[0.98]"
                }`}
              >
                {/* Dropdown Header Strip */}
                <div className="px-5 py-3.5 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#64748b] tracking-wider uppercase">
                    Product Categories
                  </span>
                  <Link
                    href="/shop"
                    onClick={() => setShopMenuOpen(false)}
                    className="text-[12px] font-medium text-[#0b1f3a] hover:text-[#16a6a3] transition-colors flex items-center gap-1 group/all"
                  >
                    <span>All Products</span>
                    <span className="transition-transform group-hover/all:translate-x-0.5 text-[#94a3b8]">→</span>
                  </Link>
                </div>

                {/* 3 Structured Category Cards */}
                <div className="p-3 space-y-1.5">
                  {/* Card 1: Complete Pen Sets */}
                  <Link
                    href="/pen-sets"
                    onClick={() => setShopMenuOpen(false)}
                    className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-[#f8fafc] transition-colors group/item"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#f8fafc] group-hover/item:bg-white border border-[#e2e8f0] p-1.5 shrink-0 flex items-center justify-center transition-colors overflow-hidden">
                      <Image
                        src="/images/figma/product-set-rt40.png"
                        alt="Complete Pen Sets"
                        width={36}
                        height={36}
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[13px] font-semibold text-[#0b1f3a] group-hover/item:text-[#16a6a3] transition-colors">
                          Complete Pen Sets
                        </h4>
                        <span className="text-[11.5px] text-[#94a3b8]">From £145</span>
                      </div>
                      <p className="text-[11.5px] text-[#64748b] leading-normal mt-0.5">
                        Reusable precision pen body + prefilled cartridge &amp; accessories.
                      </p>
                    </div>
                  </Link>

                  {/* Card 2: Refill Cartridges */}
                  <Link
                    href="/refills"
                    onClick={() => setShopMenuOpen(false)}
                    className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-[#f8fafc] transition-colors group/item"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#f8fafc] group-hover/item:bg-white border border-[#e2e8f0] p-1.5 shrink-0 flex items-center justify-center transition-colors overflow-hidden">
                      <Image
                        src="/images/figma/cartridge-clear.png"
                        alt="Refill Cartridges"
                        width={36}
                        height={36}
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[13px] font-semibold text-[#0b1f3a] group-hover/item:text-[#16a6a3] transition-colors">
                          Refill Cartridges
                        </h4>
                        <span className="text-[11.5px] text-[#16a6a3] font-medium">From £95 · 10% Sub Discount</span>
                      </div>
                      <p className="text-[11.5px] text-[#64748b] leading-normal mt-0.5">
                        Snap-in cartridges engineered exclusively for the reusable pen body.
                      </p>
                    </div>
                  </Link>

                  {/* Card 3: Freeze-Dried Vials */}
                  <Link
                    href="/vials"
                    onClick={() => setShopMenuOpen(false)}
                    className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-[#f8fafc] transition-colors group/item"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#f8fafc] group-hover/item:bg-white border border-[#e2e8f0] p-1.5 shrink-0 flex items-center justify-center transition-colors overflow-hidden">
                      <Image
                        src="/images/figma/7f278c9d9e9d928a9e34cd536ca8e36bd11a5280.png"
                        alt="Freeze-Dried Vials"
                        width={36}
                        height={36}
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[13px] font-semibold text-[#0b1f3a] group-hover/item:text-[#16a6a3] transition-colors">
                          Freeze-Dried Vials
                        </h4>
                        <span className="text-[11.5px] text-[#94a3b8]">From £48</span>
                      </div>
                      <p className="text-[11.5px] text-[#64748b] leading-normal mt-0.5">
                        Traditional vacuum borosilicate glass vials for laboratory dissolution.
                      </p>
                    </div>
                  </Link>
                </div>

                {/* Dropdown Footer Strip */}
                <div className="px-5 py-2.5 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-between text-[11px] text-[#64748b]">
                  <span>Royal Mail Tracked 24 Cold-Chain · Discreet Carton</span>
                  <Link
                    href="/verify"
                    onClick={() => setShopMenuOpen(false)}
                    className="font-medium text-[#0b1f3a] hover:text-[#16a6a3] transition-colors"
                  >
                    Verify Batch Seal →
                  </Link>
                </div>
              </div>
            </div>

            <Link 
              href="/about" 
              className={pathname === "/about" ? "font-semibold text-[#0b1f3a]" : "hover:text-[#16A6A3] transition-colors"}
            >
              About Us
            </Link>
            <Link 
              href="/how-it-works" 
              className={pathname === "/how-it-works" ? "font-semibold text-[#0b1f3a]" : "hover:text-[#16A6A3] transition-colors"}
            >
              How It Works
            </Link>
            <Link 
              href="/verify" 
              className={pathname === "/verify" ? "font-semibold text-[#0b1f3a]" : "hover:text-[#16A6A3] transition-colors"}
            >
              Verify Your Batch
            </Link>
            <Link 
              href="/contact" 
              className={pathname === "/contact" ? "font-semibold text-[#0b1f3a]" : "hover:text-[#16A6A3] transition-colors"}
            >
              Contact
            </Link>
          </nav>

          {/* Right Utility Icons (Search, Account, Cart) */}
          <div className="flex gap-[22px] items-center">
            {/* Search Button with smooth hover animation */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`group relative w-[36px] h-[36px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 active:scale-95 ${
                searchOpen
                  ? "bg-slate-100 ring-2 ring-[#16a6a3]/30"
                  : "hover:bg-slate-100 hover:ring-2 hover:ring-[#16a6a3]/20"
              }`}
              aria-label="Search"
              title="Search test systems & cartridges"
            >
              <img
                src="/images/figma/ebf52f91842a916d1e0249efbfba1688ac4e3863.svg"
                alt="Search"
                className={`w-[20px] h-[20px] transition-transform duration-300 ease-out ${
                  searchOpen ? "scale-115 rotate-[-8deg]" : "group-hover:scale-115 group-hover:rotate-[-8deg]"
                }`}
              />
            </button>

            {/* Account (Figma Node 52:9001 when authenticated, default icon when unauthenticated) */}
            {isAuthenticated && customer ? (
              <Link
                href="/account"
                className="bg-white border border-[#e2e8f0] hidden sm:flex items-center gap-[8px] pl-[8px] pr-[12px] py-[5px] rounded-[20px] shadow-2xs hover:border-[#16a6a3] transition-colors group"
                title={`${customer.first_name || ""} ${customer.last_name || ""}`}
              >
                <div className="w-[22px] h-[22px] rounded-full overflow-hidden relative shrink-0 border border-slate-200">
                  {customer.metadata?.avatar_url ? (
                    <img
                      src={customer.metadata.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#0b1f3a] text-white font-bold text-[10px] flex items-center justify-center">
                      {((customer.first_name?.[0] || "") + (customer.last_name?.[0] || "")).toUpperCase() || "RU"}
                    </div>
                  )}
                </div>
                <span className="font-semibold text-[#0b1f3a] group-hover:text-[#16a6a3] text-[12.5px] whitespace-nowrap transition-colors">
                  {customer.metadata?.title ? `${customer.metadata.title} ` : ""}{customer.first_name} {customer.last_name ? `${customer.last_name[0]}.` : ""}
                </span>
              </Link>
            ) : (
              <Link
                href="/account"
                className="w-[20px] h-[20px] hidden sm:flex items-center justify-center hover:opacity-80 transition-opacity"
                aria-label="Account"
                title="Customer Account"
              >
                <img src="/images/figma/e93dbfd043d0b35bf52fe04bc07fec31b1b89270.svg" alt="Account" className="w-[20px] h-[20px]" />
              </Link>
            )}

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="btn-press relative w-[36px] h-[36px] rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-all"
              aria-label="Cart"
              title="View Cart"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[20px] h-[20px] transition-transform duration-200 hover:scale-110">
                <path d="M0.833 1.833H4.167L6.4 12.992C6.476 13.375 6.685 13.72 6.99 13.965C7.294 14.21 7.676 14.341 8.067 14.333H16.167C16.558 14.341 16.939 14.21 17.244 13.965C17.548 13.72 17.757 13.375 17.833 12.992L19.167 6H5" stroke="#0B1F3A" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="7.5" cy="17.5" r="1" stroke="#0B1F3A" strokeWidth="1.67"/>
                <circle cx="15.5" cy="17.5" r="1" stroke="#0B1F3A" strokeWidth="1.67"/>
              </svg>
              {itemCount > 0 && (
                <span className="cart-icon-pop absolute -top-[2px] -right-[2px] bg-[#16a6a3] border-[1.5px] border-solid border-white text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center shadow-xs">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar Dropdown Below Navbar (No border separating it from navbar) */}
        <div
          ref={searchContainerRef}
          className={`absolute top-[80px] -mt-[1px] left-0 right-0 bg-white border-b border-[#E2E8F0] shadow-lg shadow-[#0b1f3a]/6 z-30 transition-all duration-300 ease-out ${
            searchOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
        >
          <div className="max-w-[840px] w-full mx-auto px-4 sm:px-6 py-4">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 w-full">
              {/* Input container with embedded icon and submit button */}
              <div className="relative flex-1 flex items-center">
                {/* Search Icon with pop entrance animation */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
                  <img
                    src="/images/figma/ebf52f91842a916d1e0249efbfba1688ac4e3863.svg"
                    alt=""
                    className={`w-[18px] h-[18px] ${searchOpen ? "animate-search-icon-pop" : ""}`}
                  />
                </div>

                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, systems, or cartridges (e.g., RT40, C.C-1236, TB-S30)..."
                  className="w-full h-[48px] rounded-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#16a6a3] focus:bg-white focus:ring-4 focus:ring-[#16a6a3]/10 pl-11 pr-28 text-[13.5px] text-[#0b1f3a] placeholder:text-[#94a3b8] transition-all outline-none"
                />

                {/* Submit Button safely contained INSIDE the input pill */}
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-5 py-2 rounded-full bg-[#0B1F3A] hover:bg-[#16A6A3] text-white text-[12px] font-semibold transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>Search</span>
                </button>
              </div>

              {/* Close Button cleanly outside input */}
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-[#64748b] hover:text-[#0b1f3a] hover:bg-slate-100 transition-all cursor-pointer group shrink-0"
                aria-label="Close search"
                title="Close search (Esc)"
              >
                <svg
                  className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90 text-[#0b1f3a]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-[80px] left-0 right-0 border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-xl z-50">
            <div className="space-y-1 text-sm font-semibold text-slate-800">
              <Link
                href="/products/complete-pen-set"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Complete Pen Sets ($249.00)
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
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                About Us
              </Link>
              <Link
                href="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                How It Works &amp; FAQs
              </Link>
              <Link
                href="/verify"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Verify Your Batch
              </Link>
              <Link
                href="/lab-reports"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Resources &amp; COA
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Contact Us
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
