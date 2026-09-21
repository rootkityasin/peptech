"use client"

import React, { useState, useMemo, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { useCart } from "@/components/cart/CartContext"
import { CATALOG_PRODUCTS, CatalogProduct } from "@/data/catalog"

interface ShopCatalogProps {
  initialCategory?: "all" | "pen-sets" | "refills" | "vials"
}

export function ShopCatalog({ initialCategory = "all" }: ShopCatalogProps) {
  const { addItem, setIsDrawerOpen } = useCart()
  const searchParams = useSearchParams()
  const urlSearch = searchParams?.get("search") || ""

  // State
  const [activeTab, setActiveTab] = useState<"all" | "pen-sets" | "refills" | "vials">(initialCategory)
  const [searchQuery, setSearchQuery] = useState(urlSearch)
  const [selectedSort, setSelectedSort] = useState<"popular" | "price-asc" | "price-desc" | "name">("popular")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [showShopSuggestions, setShowShopSuggestions] = useState(false)
  const shopSearchContainerRef = useRef<HTMLDivElement>(null)

  // Sync searchQuery when URL search parameter changes (e.g. from navbar search)
  useEffect(() => {
    const q = searchParams?.get("search")
    if (q !== null && q !== undefined) {
      setSearchQuery(q)
    }
  }, [searchParams])

  // Dismiss suggestions on outside click, Escape key, or scroll
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (shopSearchContainerRef.current && !shopSearchContainerRef.current.contains(e.target as Node)) {
        setShowShopSuggestions(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowShopSuggestions(false)
      }
    }
    const handleScroll = () => {
      setShowShopSuggestions(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside, { passive: true })
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Sidebar filter states
  const [availability, setAvailability] = useState<"in-stock" | "all">("in-stock")
  const [selectedFormats, setSelectedFormats] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedPurchaseType, setSelectedPurchaseType] = useState<"all" | "sub" | "one-time">("all")

  // Counts
  const penSetsCount = CATALOG_PRODUCTS.filter((p) => p.format === "complete-pen-set").length
  const refillsCount = CATALOG_PRODUCTS.filter((p) => p.format === "refill-cartridge").length
  const vialsCount = CATALOG_PRODUCTS.filter((p) => p.format === "freeze-dried-vial").length
  const metabolicCount = CATALOG_PRODUCTS.filter((p) => p.category === "metabolic").length
  const tissueCount = CATALOG_PRODUCTS.filter((p) => p.category === "tissue").length
  const cellularCount = CATALOG_PRODUCTS.filter((p) => p.category === "cellular").length
  const neuroCount = CATALOG_PRODUCTS.filter((p) => p.category === "neuro").length
  const subCount = CATALOG_PRODUCTS.filter((p) => p.isSubscriptionEligible).length
  const totalCount = CATALOG_PRODUCTS.length

  // Filter logic
  const filteredProducts = useMemo(() => {
    return CATALOG_PRODUCTS.filter((product) => {
      // Tab filter
      if (activeTab === "pen-sets" && product.format !== "complete-pen-set") return false
      if (activeTab === "refills" && product.format !== "refill-cartridge") return false
      if (activeTab === "vials" && product.format !== "freeze-dried-vial") return false

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesName = product.name.toLowerCase().includes(q)
        const matchesDesc = product.description.toLowerCase().includes(q)
        const matchesCategory = product.categoryLabel.toLowerCase().includes(q)
        if (!matchesName && !matchesDesc && !matchesCategory) return false
      }

      // Availability filter
      if (availability === "in-stock" && !product.inStock) return false

      // Format sidebar filter
      if (selectedFormats.length > 0 && !selectedFormats.includes(product.format)) return false

      // Research Category sidebar filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) return false

      // Purchase type
      if (selectedPurchaseType === "sub" && !product.isSubscriptionEligible) return false

      return true
    }).sort((a, b) => {
      if (selectedSort === "price-asc") return a.price - b.price
      if (selectedSort === "price-desc") return b.price - a.price
      if (selectedSort === "name") return a.name.localeCompare(b.name)
      return 0 // popular / default
    })
  }, [activeTab, searchQuery, availability, selectedFormats, selectedCategories, selectedPurchaseType, selectedSort])

  // Active filters list for chips
  const activeFilterChips = useMemo(() => {
    const chips: { label: string; onRemove: () => void }[] = []
    if (availability === "in-stock") {
      chips.push({ label: "In Stock", onRemove: () => setAvailability("all") })
    }
    if (activeTab !== "all") {
      chips.push({
        label: activeTab === "pen-sets" ? "Complete Pen Sets" : activeTab === "refills" ? "Refill Cartridges" : "Freeze-Dried Vials",
        onRemove: () => setActiveTab("all"),
      })
    }
    selectedFormats.forEach((fmt) => {
      chips.push({
        label: fmt === "complete-pen-set" ? "Pen Sets" : fmt === "refill-cartridge" ? "Refills" : "Vials",
        onRemove: () => setSelectedFormats((prev) => prev.filter((f) => f !== fmt)),
      })
    })
    selectedCategories.forEach((cat) => {
      chips.push({
        label: cat === "metabolic" ? "Metabolic" : cat === "tissue" ? "Tissue Recovery" : cat === "cellular" ? "Cellular" : "Neuropeptides",
        onRemove: () => setSelectedCategories((prev) => prev.filter((c) => c !== cat)),
      })
    })
    if (selectedPurchaseType === "sub") {
      chips.push({ label: "Subscribe & Save", onRemove: () => setSelectedPurchaseType("all") })
    }
    return chips
  }, [availability, activeTab, selectedFormats, selectedCategories, selectedPurchaseType])

  // Live autocomplete suggestions for the shop page search input
  const shopSearchSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return []
    return CATALOG_PRODUCTS.filter((product) => {
      return (
        product.name.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q) ||
        product.categoryLabel.toLowerCase().includes(q) ||
        product.formatLabel.toLowerCase().includes(q)
      )
    }).slice(0, 5)
  }, [searchQuery])

  const resetAllFilters = () => {
    setActiveTab("all")
    setSearchQuery("")
    setAvailability("all")
    setSelectedFormats([])
    setSelectedCategories([])
    setSelectedPurchaseType("all")
  }

  const handleAddToCart = (product: CatalogProduct) => {
    addItem({
      id: product.id,
      title: product.name,
      format: product.format === "complete-pen-set" ? "pen-set" : product.format === "refill-cartridge" ? "refill" : "vial",
      strength: product.categoryLabel,
      price: product.subscribePrice && product.isSubscriptionEligible ? product.subscribePrice : product.price,
      isSubscription: product.isSubscriptionEligible,
      subscriptionIntervalDays: product.isSubscriptionEligible ? 28 : undefined,
      discountPercent: product.isSubscriptionEligible ? 10 : undefined,
      sku: `PEP-${product.id.toUpperCase()}`,
      batch: "LAB-2026-B1",
    })
    setIsDrawerOpen(true)
  }

  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen" data-node-id="37:5499" data-name="PEPTECH - Shop Catalog Prototype">
      
      {/* 03 Clean Breadcrumbs & Shop Header (Figma Node 37:5547) */}
      <div className="bg-white flex flex-col items-start pb-[14px] pt-[20px] px-4 sm:px-8 lg:px-[80px] w-full border-b border-[#e2e8f0]" data-node-id="37:5547" data-name="03 Clean Breadcrumbs & Shop Header">
        <div className="flex gap-[8px] items-center text-[13px] leading-normal whitespace-nowrap mb-3" data-name="Breadcrumbs">
          <Link href="/" className="font-normal text-[#64748b] hover:text-[#0b1f3a] transition-colors">
            Home
          </Link>
          <span className="font-normal text-[#94a3b8]">/</span>
          <span className="font-semibold text-[#0b1f3a]">
            Shop
          </span>
          {activeTab !== "all" && (
            <>
              <span className="font-normal text-[#94a3b8]">/</span>
              <span className="font-semibold text-[#16a6a3]">
                {activeTab === "pen-sets" ? "Complete Pen Sets" : activeTab === "refills" ? "Refill Cartridges" : "Freeze-Dried Vials"}
              </span>
            </>
          )}
        </div>
        <div>
          <h1 className="text-[24px] sm:text-[28px] font-bold text-[#0b1f3a] tracking-tight">
            {activeTab === "all"
              ? "PEPTECH® Master Catalog"
              : activeTab === "pen-sets"
              ? "Complete Precision Pen Sets"
              : activeTab === "refills"
              ? "Compatible Refill Cartridges"
              : "Lyophilised Research Vials"}
          </h1>
          <p className="text-[13px] text-[#64748b] mt-1">
            Precision-engineered laboratory research systems, cartridges, and pure lyophilised peptides.
          </p>
        </div>
      </div>

      {/* 04 Category Quick Tabs & Controls (Figma Node 37:5553) */}
      <div className="bg-white flex flex-col gap-3 px-4 sm:px-8 lg:px-[80px] py-[16px] w-full border-b border-[#e2e8f0]" data-node-id="37:5553" data-name="04 Category Quick Tabs & Controls">
        
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-stretch lg:items-center justify-between w-full">
          {/* Tabs Group - Horizontal swipeable on mobile */}
          <div className="flex items-center gap-[8px] overflow-x-auto scrollbar-none flex-nowrap w-full lg:w-auto pb-1 -mb-1" data-name="Tabs Group">
            <button
              onClick={() => setActiveTab("all")}
              className={`shrink-0 flex gap-[6px] items-center px-[14px] py-[8px] rounded-[6px] transition-colors whitespace-nowrap ${
                activeTab === "all"
                  ? "bg-[#0b1f3a] text-white font-semibold"
                  : "bg-[#f1f5f9] text-[#0b1f3a] font-medium hover:bg-slate-200"
              }`}
              data-name="Tab - All Products"
            >
              <span className="text-[13px]">All Products</span>
              <span className={`text-[12px] ${activeTab === "all" ? "text-[#cbd5e1]" : "text-[#64748b]"}`}>
                ({totalCount})
              </span>
            </button>

            <button
              onClick={() => setActiveTab("pen-sets")}
              className={`shrink-0 flex gap-[6px] items-center px-[14px] py-[8px] rounded-[6px] transition-colors whitespace-nowrap ${
                activeTab === "pen-sets"
                  ? "bg-[#0b1f3a] text-white font-semibold"
                  : "bg-[#f1f5f9] text-[#0b1f3a] font-medium hover:bg-slate-200"
              }`}
              data-name="Tab - Complete Pen Sets"
            >
              <span className="text-[13px]">Complete Pen Sets</span>
              <span className={`text-[12px] ${activeTab === "pen-sets" ? "text-[#cbd5e1]" : "text-[#64748b]"}`}>
                ({penSetsCount})
              </span>
            </button>

            <button
              onClick={() => setActiveTab("refills")}
              className={`shrink-0 flex gap-[6px] items-center px-[14px] py-[8px] rounded-[6px] transition-colors whitespace-nowrap ${
                activeTab === "refills"
                  ? "bg-[#0b1f3a] text-white font-semibold"
                  : "bg-[#f1f5f9] text-[#0b1f3a] font-medium hover:bg-slate-200"
              }`}
              data-name="Tab - Refill Cartridges"
            >
              <span className="text-[13px]">Refill Cartridges</span>
              <span className={`text-[12px] ${activeTab === "refills" ? "text-[#cbd5e1]" : "text-[#64748b]"}`}>
                ({refillsCount})
              </span>
            </button>

            <button
              onClick={() => setActiveTab("vials")}
              className={`shrink-0 flex gap-[6px] items-center px-[14px] py-[8px] rounded-[6px] transition-colors whitespace-nowrap ${
                activeTab === "vials"
                  ? "bg-[#0b1f3a] text-white font-semibold"
                  : "bg-[#f1f5f9] text-[#0b1f3a] font-medium hover:bg-slate-200"
              }`}
              data-name="Tab - Freeze-Dried Vials"
            >
              <span className="text-[13px]">Freeze-Dried Vials</span>
              <span className={`text-[12px] ${activeTab === "vials" ? "text-[#cbd5e1]" : "text-[#64748b]"}`}>
                ({vialsCount})
              </span>
            </button>
          </div>

          {/* Controls Group */}
          <div className="flex gap-[8px] items-center w-full lg:w-auto" data-name="Controls Group">
            {/* Search Box with same search icon & live suggestions */}
            <div 
              ref={shopSearchContainerRef}
              className="relative bg-[#f8fafc] border border-[#e2e8f0] focus-within:border-[#16a6a3] focus-within:bg-white flex gap-[8px] items-center px-[12px] py-[8px] rounded-[6px] flex-1 min-w-0 sm:w-[240px] transition-all" 
              data-name="Search Box"
            >
              {/* Exact same search icon as navbar */}
              <div className="size-[16px] shrink-0 flex items-center justify-center pointer-events-none">
                <img
                  src="/images/figma/ebf52f91842a916d1e0249efbfba1688ac4e3863.svg"
                  alt="Search"
                  className="size-full object-contain"
                />
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowShopSuggestions(true)
                }}
                onFocus={() => setShowShopSuggestions(true)}
                className="bg-transparent text-[12px] text-[#0b1f3a] placeholder-[#64748b] focus:outline-hidden w-full min-w-0"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("")
                    setShowShopSuggestions(false)
                  }}
                  className="text-[#94a3b8] hover:text-[#0b1f3a] text-[12px] shrink-0 font-bold px-0.5 cursor-pointer"
                  title="Clear search"
                >
                  ✕
                </button>
              )}

              {/* Shop Page Live Suggestions Dropdown */}
              {showShopSuggestions && searchQuery.trim().length > 0 && (
                <div 
                  className="absolute top-full left-0 w-[min(calc(100vw-36px),340px)] mt-1.5 bg-white border border-[#e2e8f0] rounded-xl shadow-xl z-30 p-2 max-h-[320px] overflow-y-auto animate-in fade-in duration-150"
                  data-testid="shop-search-suggestions"
                >
                  <div className="px-2 py-1 flex items-center justify-between border-b border-[#f1f5f9] mb-1">
                    <span className="text-[10px] font-bold text-[#64748b] tracking-wider uppercase">
                      Suggestions ({shopSearchSuggestions.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowShopSuggestions(false)}
                      className="text-[10px] text-[#94a3b8] hover:text-[#0b1f3a] cursor-pointer"
                    >
                      Close
                    </button>
                  </div>

                  {shopSearchSuggestions.length > 0 ? (
                    <div className="space-y-1">
                      {shopSearchSuggestions.map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.handle}`}
                          onClick={() => setShowShopSuggestions(false)}
                          className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#f8fafc] transition-colors group cursor-pointer"
                        >
                          <div className="relative size-9 rounded-md bg-[#f8fafc] border border-[#e2e8f0] p-1 shrink-0 overflow-hidden flex items-center justify-center">
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={30}
                              height={30}
                              className="object-contain size-full"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-[12px] font-semibold text-[#0b1f3a] group-hover:text-[#16a6a3] transition-colors truncate">
                              {product.name}
                            </h5>
                            <div className="flex items-center justify-between mt-0.5">
                              <span className="text-[10px] text-[#64748b]">
                                {product.format === "complete-pen-set"
                                  ? "Pen Set"
                                  : product.format === "refill-cartridge"
                                  ? "Refill"
                                  : "Vial"}
                              </span>
                              <span className="text-[11.5px] font-bold text-[#0b1f3a]">
                                £{product.price.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-center text-[12px] text-[#64748b]">
                      No products match &ldquo;{searchQuery}&rdquo;
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sort Box */}
            <div className="bg-[#f8fafc] border border-[#e2e8f0] flex gap-[6px] items-center px-[12px] py-[8px] rounded-[6px] shrink-0" data-name="Sort Box">
              <span className="font-medium text-[#64748b] text-[12px] whitespace-nowrap hidden sm:inline">
                Sort by:
              </span>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value as any)}
                className="bg-transparent font-semibold text-[#0b1f3a] text-[12px] focus:outline-hidden cursor-pointer"
              >
                <option value="popular">Most Popular</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Product Name (A-Z)</option>
              </select>
            </div>

            {/* Mobile Filter Toggle Button on Right Side */}
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className={`lg:hidden flex items-center justify-center gap-1.5 px-[12px] py-[8px] rounded-[6px] border transition-all shrink-0 cursor-pointer ${
                mobileFiltersOpen
                  ? "bg-[#0b1f3a] text-white border-[#0b1f3a] shadow-xs"
                  : activeFilterChips.length > 0
                  ? "bg-[#e6fffa] text-[#0d7b78] border-[#99f6e4] font-medium"
                  : "bg-[#f8fafc] text-[#0b1f3a] border-[#e2e8f0] hover:bg-slate-100"
              }`}
              aria-label="Filter products"
              aria-expanded={mobileFiltersOpen}
              title="Filter products"
            >
              {/* Funnel/Filter Icon */}
              <svg className="size-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {/* Active Filter Count Badge */}
              {activeFilterChips.length > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  mobileFiltersOpen ? "bg-[#16a6a3] text-white" : "bg-[#16a6a3] text-white"
                }`}>
                  {activeFilterChips.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Filter Extension Panel (Accordion / Extension Feeling) */}
        {mobileFiltersOpen && (
          <div className="lg:hidden w-full pt-4 mt-2 border-t border-[#e2e8f0] flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200" data-name="Mobile Filter Extension">
            {/* Header Strip */}
            <div className="flex items-center justify-between pb-1 border-b border-[#f1f5f9]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#0b1f3a] text-[15px]">Filters &amp; Refinements</span>
                <span className="text-[12px] text-[#64748b]">({filteredProducts.length} matching)</span>
              </div>
              <div className="flex items-center gap-3">
                {activeFilterChips.length > 0 && (
                  <button
                    onClick={resetAllFilters}
                    className="text-[12px] font-semibold text-[#16a6a3] hover:underline cursor-pointer"
                  >
                    Reset All
                  </button>
                )}
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 rounded-md text-[#64748b] hover:text-[#0b1f3a] hover:bg-slate-100 transition-colors"
                  aria-label="Close filters"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Active Filters Box (if any) */}
            {activeFilterChips.length > 0 && (
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] p-[12px] flex flex-col gap-[8px] w-full">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-[#64748b] text-[10px] tracking-wider uppercase">
                    ACTIVE FILTERS
                  </p>
                  <span className="text-[11px] text-[#64748b]">{activeFilterChips.length} active</span>
                </div>
                <div className="flex flex-wrap gap-[6px] items-start w-full">
                  {activeFilterChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={chip.onRemove}
                      className="bg-white border border-[#cbd5e1] hover:border-[#16a6a3] flex gap-[6px] items-center px-[8px] py-[4px] rounded-[4px] transition-colors shadow-2xs"
                    >
                      <span className="font-medium text-[#0b1f3a] text-[11px]">{chip.label}</span>
                      <span className="font-semibold text-[#64748b] hover:text-[#0b1f3a] text-[10px]">✕</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Structured Filter Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {/* Availability Box */}
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] p-[14px] flex flex-col gap-[10px] w-full">
                <p className="font-bold text-[#64748b] text-[11px] tracking-wider uppercase">
                  AVAILABILITY
                </p>
                <label className="flex items-center justify-between cursor-pointer group py-0.5">
                  <div className="flex gap-[10px] items-center">
                    <input
                      type="radio"
                      name="mobile-availability"
                      checked={availability === "in-stock"}
                      onChange={() => setAvailability("in-stock")}
                      className="accent-[#0b1f3a] size-[15px]"
                    />
                    <span className="font-medium text-[#0b1f3a] text-[13px]">In Stock</span>
                  </div>
                  <span className="font-normal text-[#64748b] text-[12px] bg-white px-2 py-0.5 rounded border border-[#e2e8f0]">({totalCount})</span>
                </label>
                <label className="flex items-center justify-between cursor-pointer group py-0.5">
                  <div className="flex gap-[10px] items-center">
                    <input
                      type="radio"
                      name="mobile-availability"
                      checked={availability === "all"}
                      onChange={() => setAvailability("all")}
                      className="accent-[#0b1f3a] size-[15px]"
                    />
                    <span className="font-medium text-[#0b1f3a] text-[13px]">All</span>
                  </div>
                  <span className="font-normal text-[#64748b] text-[12px] bg-white px-2 py-0.5 rounded border border-[#e2e8f0]">({totalCount})</span>
                </label>
              </div>

              {/* Product Format Box */}
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] p-[14px] flex flex-col gap-[10px] w-full">
                <p className="font-bold text-[#64748b] text-[10px] tracking-wider uppercase">
                  PRODUCT FORMAT
                </p>
                {[
                  { id: "complete-pen-set", label: "Complete Pen Sets", count: penSetsCount },
                  { id: "refill-cartridge", label: "Refill Cartridges", count: refillsCount },
                  { id: "freeze-dried-vial", label: "Freeze-Dried Vials", count: vialsCount },
                ].map((f) => {
                  const checked = selectedFormats.includes(f.id)
                  return (
                    <label key={f.id} className="flex items-center justify-between cursor-pointer py-0.5">
                      <div className="flex gap-[10px] items-center">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setSelectedFormats((prev) =>
                              checked ? prev.filter((item) => item !== f.id) : [...prev, f.id]
                            )
                          }}
                          className="accent-[#0b1f3a] size-[15px] rounded"
                        />
                        <span className="font-medium text-[#0b1f3a] text-[13px]">{f.label}</span>
                      </div>
                      <span className="font-normal text-[#64748b] text-[12px] bg-white px-2 py-0.5 rounded border border-[#e2e8f0]">({f.count})</span>
                    </label>
                  )
                })}
              </div>

              {/* Research Category Box */}
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] p-[14px] flex flex-col gap-[10px] w-full">
                <p className="font-bold text-[#64748b] text-[10px] tracking-wider uppercase">
                  CATEGORY
                </p>
                {[
                  { id: "metabolic", label: "Metabolic & Glucose", count: metabolicCount },
                  { id: "tissue", label: "Tissue Recovery", count: tissueCount },
                  { id: "cellular", label: "Cellular Longevity", count: cellularCount },
                  { id: "neuro", label: "Neuropeptides", count: neuroCount },
                ].map((cat) => {
                  const checked = selectedCategories.includes(cat.id)
                  return (
                    <label key={cat.id} className="flex items-center justify-between cursor-pointer py-0.5">
                      <div className="flex gap-[8px] items-center">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setSelectedCategories((prev) =>
                              checked ? prev.filter((item) => item !== cat.id) : [...prev, cat.id]
                            )
                          }}
                          className="accent-[#0b1f3a] size-[15px] rounded"
                        />
                        <span className="font-normal text-[#475569] text-[12px]">{cat.label}</span>
                      </div>
                      <span className="font-normal text-[#64748b] text-[11px] bg-white px-2 py-0.5 rounded border border-[#e2e8f0]">({cat.count})</span>
                    </label>
                  )
                })}
              </div>

              {/* Purchase Type Box */}
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] p-[14px] flex flex-col gap-[10px] w-full">
                <p className="font-bold text-[#64748b] text-[10px] tracking-wider uppercase">
                  PURCHASE TYPE
                </p>
                <label className="flex items-center justify-between cursor-pointer py-0.5">
                  <div className="flex gap-[8px] items-center">
                    <input
                      type="radio"
                      name="mobile-purchaseType"
                      checked={selectedPurchaseType === "sub"}
                      onChange={() => setSelectedPurchaseType("sub")}
                      className="accent-[#0b1f3a] size-[15px]"
                    />
                    <span className="font-semibold text-[#0b1f3a] text-[12px]">Subscribe &amp; Save (10% off)</span>
                  </div>
                  <span className="font-normal text-[#64748b] text-[11px] bg-white px-2 py-0.5 rounded border border-[#e2e8f0]">({subCount})</span>
                </label>
                <label className="flex items-center justify-between cursor-pointer py-0.5">
                  <div className="flex gap-[8px] items-center">
                    <input
                      type="radio"
                      name="mobile-purchaseType"
                      checked={selectedPurchaseType === "all"}
                      onChange={() => setSelectedPurchaseType("all")}
                      className="accent-[#0b1f3a] size-[15px]"
                    />
                    <span className="font-normal text-[#475569] text-[12px]">All Purchase Options</span>
                  </div>
                  <span className="font-normal text-[#64748b] text-[11px] bg-white px-2 py-0.5 rounded border border-[#e2e8f0]">({totalCount})</span>
                </label>
              </div>
            </div>

            {/* Bottom Action Strip */}
            <div className="pt-2 pb-1 flex items-center justify-between gap-3 border-t border-[#f1f5f9]">
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-4 py-2.5 rounded-lg border border-[#cbd5e1] text-[#64748b] hover:text-[#0b1f3a] text-[12px] font-semibold transition-colors shrink-0"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 bg-[#0b1f3a] hover:bg-[#16a6a3] text-white py-2.5 px-4 rounded-lg font-semibold text-[13px] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View {filteredProducts.length} Products</span>
                <span className="text-white/70">→</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 05 Main Catalog Section (Figma Node 37:5574) */}
      <div className="flex flex-col lg:flex-row gap-[24px] items-start pb-[48px] pt-[32px] px-4 sm:px-8 lg:px-[80px] w-full" data-node-id="37:5574" data-name="05 Main Catalog Section">
        
        {/* Left Filter Sidebar (hidden on mobile, visible on lg) */}
        <aside className="hidden lg:flex lg:w-[240px] shrink-0 flex-col gap-[14px]" data-name="Filter Sidebar">
          
          {/* Filter Header */}
          <div className="flex items-center justify-between w-full" data-name="Filter Header">
            <p className="font-bold text-[#0b1f3a] text-[16px]">
              Filters
            </p>
            {activeFilterChips.length > 0 && (
              <button
                onClick={resetAllFilters}
                className="font-medium text-[#64748b] hover:text-[#0b1f3a] text-[12px] transition-colors"
                data-name="Reset All Button"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Active Filters Box */}
          {activeFilterChips.length > 0 && (
            <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-[14px] flex flex-col gap-[10px] w-full" data-name="Filter Box - Active Filters">
              <p className="font-bold text-[#64748b] text-[10px] tracking-wider uppercase">
                ACTIVE FILTERS
              </p>
              <div className="flex flex-wrap gap-[6px] items-start w-full">
                {activeFilterChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={chip.onRemove}
                    className="bg-[#f1f5f9] border border-[#e2e8f0] flex gap-[6px] items-center px-[8px] py-[4px] rounded-[4px] hover:bg-slate-200 transition-colors"
                  >
                    <span className="font-medium text-[#0b1f3a] text-[11px]">{chip.label}</span>
                    <span className="font-normal text-[#64748b] text-[9px]">✕</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Availability Box */}
          <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-[14px] flex flex-col gap-[10px] w-full" data-name="Filter Box - Availability">
            <p className="font-bold text-[#64748b] text-[11px] tracking-wider uppercase">
              AVAILABILITY
            </p>
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex gap-[10px] items-center">
                <input
                  type="radio"
                  name="availability"
                  checked={availability === "in-stock"}
                  onChange={() => setAvailability("in-stock")}
                  className="accent-[#0b1f3a] size-[15px]"
                />
                <span className="font-medium text-[#0b1f3a] text-[13px]">In Stock</span>
              </div>
              <span className="font-normal text-[#64748b] text-[12px]">({totalCount})</span>
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex gap-[10px] items-center">
                <input
                  type="radio"
                  name="availability"
                  checked={availability === "all"}
                  onChange={() => setAvailability("all")}
                  className="accent-[#0b1f3a] size-[15px]"
                />
                <span className="font-medium text-[#0b1f3a] text-[13px]">All</span>
              </div>
              <span className="font-normal text-[#64748b] text-[12px]">({totalCount})</span>
            </label>
          </div>

          {/* Product Format Box */}
          <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-[14px] flex flex-col gap-[10px] w-full" data-name="Filter Box - Product Format">
            <p className="font-bold text-[#64748b] text-[10px] tracking-wider uppercase">
              PRODUCT FORMAT
            </p>
            {[
              { id: "complete-pen-set", label: "Complete Pen Sets", count: penSetsCount },
              { id: "refill-cartridge", label: "Refill Cartridges", count: refillsCount },
              { id: "freeze-dried-vial", label: "Freeze-Dried Vials", count: vialsCount },
            ].map((f) => {
              const checked = selectedFormats.includes(f.id)
              return (
                <label key={f.id} className="flex items-center justify-between cursor-pointer">
                  <div className="flex gap-[10px] items-center">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setSelectedFormats((prev) =>
                          checked ? prev.filter((item) => item !== f.id) : [...prev, f.id]
                        )
                      }}
                      className="accent-[#0b1f3a] size-[15px] rounded"
                    />
                    <span className="font-medium text-[#0b1f3a] text-[13px]">{f.label}</span>
                  </div>
                  <span className="font-normal text-[#64748b] text-[12px]">({f.count})</span>
                </label>
              )
            })}
          </div>

          {/* Research Category Box */}
          <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-[14px] flex flex-col gap-[10px] w-full" data-name="Filter Box - Research Category">
            <p className="font-bold text-[#64748b] text-[10px] tracking-wider uppercase">
              CATEGORY
            </p>
            {[
              { id: "metabolic", label: "Metabolic & Glucose", count: metabolicCount },
              { id: "tissue", label: "Tissue Recovery", count: tissueCount },
              { id: "cellular", label: "Cellular Longevity", count: cellularCount },
              { id: "neuro", label: "Neuropeptides", count: neuroCount },
            ].map((cat) => {
              const checked = selectedCategories.includes(cat.id)
              return (
                <label key={cat.id} className="flex items-center justify-between cursor-pointer">
                  <div className="flex gap-[8px] items-center">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setSelectedCategories((prev) =>
                          checked ? prev.filter((item) => item !== cat.id) : [...prev, cat.id]
                        )
                      }}
                      className="accent-[#0b1f3a] size-[15px] rounded"
                    />
                    <span className="font-normal text-[#475569] text-[12px]">{cat.label}</span>
                  </div>
                  <span className="font-normal text-[#94a3b8] text-[11px]">({cat.count})</span>
                </label>
              )
            })}
          </div>

          {/* Purchase Type Box */}
          <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-[14px] flex flex-col gap-[10px] w-full" data-name="Filter Box - Purchase Model">
            <p className="font-bold text-[#64748b] text-[10px] tracking-wider uppercase">
              PURCHASE TYPE
            </p>
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex gap-[8px] items-center">
                <input
                  type="radio"
                  name="purchaseType"
                  checked={selectedPurchaseType === "sub"}
                  onChange={() => setSelectedPurchaseType("sub")}
                  className="accent-[#0b1f3a] size-[15px]"
                />
                <span className="font-semibold text-[#0b1f3a] text-[12px]">Subscribe &amp; Save (10% off)</span>
              </div>
              <span className="font-normal text-[#94a3b8] text-[11px]">({subCount})</span>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex gap-[8px] items-center">
                <input
                  type="radio"
                  name="purchaseType"
                  checked={selectedPurchaseType === "all"}
                  onChange={() => setSelectedPurchaseType("all")}
                  className="accent-[#0b1f3a] size-[15px]"
                />
                <span className="font-normal text-[#475569] text-[12px]">All Purchase Options</span>
              </div>
              <span className="font-normal text-[#94a3b8] text-[11px]">({totalCount})</span>
            </label>
          </div>

        </aside>

        {/* Right Main Catalog Grid */}
        <main className="flex-1 w-full flex flex-col gap-[20px]" data-name="Products Grid Container">
          
          {/* Results Summary Strip */}
          <div className="flex items-center justify-between w-full" data-name="Results Summary Strip">
            <p className="font-medium text-[#64748b] text-[13px]">
              Showing {filteredProducts.length} of {totalCount} products
            </p>

            <div className="flex gap-[8px] items-center" data-name="View Switcher Container">
              <span className="font-medium text-[#64748b] text-[12px]">View:</span>
              <div className="bg-[#f1f5f9] border border-[#e2e8f0] flex gap-[2px] items-center p-[3px] rounded-[6px]">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1 rounded-[4px] transition-colors ${
                    viewMode === "grid" ? "bg-white shadow-xs border border-[#cbd5e1]" : ""
                  }`}
                  aria-label="Grid View"
                >
                  <div className="grid grid-cols-2 gap-[2px] size-[12px]">
                    <div className="bg-[#0b1f3a] size-[5px] rounded-[1px]" />
                    <div className="bg-[#0b1f3a] size-[5px] rounded-[1px]" />
                    <div className="bg-[#0b1f3a] size-[5px] rounded-[1px]" />
                    <div className="bg-[#0b1f3a] size-[5px] rounded-[1px]" />
                  </div>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1 rounded-[4px] transition-colors ${
                    viewMode === "list" ? "bg-white shadow-xs border border-[#cbd5e1]" : ""
                  }`}
                  aria-label="List View"
                >
                  <div className="flex flex-col gap-[2px] w-[12px] h-[10px] justify-center">
                    <div className="bg-[#94a3b8] h-[2px] w-full rounded-[1px]" />
                    <div className="bg-[#94a3b8] h-[2px] w-full rounded-[1px]" />
                    <div className="bg-[#94a3b8] h-[2px] w-full rounded-[1px]" />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Product Cards Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-12 text-center flex flex-col items-center justify-center gap-3">
              <p className="text-[16px] font-bold text-[#0b1f3a]">No products match your current filters</p>
              <p className="text-[13px] text-[#64748b]">Try searching with a different term or reset your active filters.</p>
              <button
                onClick={resetAllFilters}
                className="mt-2 bg-[#0b1f3a] text-white px-4 py-2 rounded-[6px] text-[12px] font-semibold hover:bg-[#16a6a3] transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[20px] w-full">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border border-[#e2e8f0] rounded-[8px] p-[12px] flex flex-col justify-between h-[350px] hover:shadow-md transition-shadow text-center group"
                >
                  {/* Image Box */}
                  <Link href={`/products/${product.handle}`} className="bg-[#f8fafc] rounded-[6px] h-[145px] w-full flex items-center justify-center relative overflow-hidden mb-2">
                    <div className="h-[130px] w-[180px] relative">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain p-2 group-hover:scale-105 transition-transform"
                      />
                    </div>
                  </Link>

                  {/* Info Block */}
                  <div className="flex flex-col gap-[3px] items-center text-center w-full">
                    <Link href={`/products/${product.handle}`} className="font-bold text-[#0b1f3a] text-[15px] hover:text-[#16a6a3] transition-colors line-clamp-1">
                      {product.name}
                    </Link>
                    <p className="font-semibold text-[#64748b] text-[10px] tracking-wide uppercase">
                      {product.formatLabel}
                    </p>
                    <p className="font-normal text-[#475569] text-[11px] line-clamp-1">
                      {product.description}
                    </p>

                    {/* Price Row */}
                    <div className="flex gap-[6px] items-center justify-center pt-1 whitespace-nowrap">
                      {product.isSubscriptionEligible && product.subscribePrice ? (
                        <>
                          <span className="font-bold text-[#0b1f3a] text-[15px]">
                            £{product.subscribePrice.toFixed(2)}
                          </span>
                          <span className="font-normal text-[#64748b] text-[11px]">
                            / 28 days
                          </span>
                          <div className="bg-[#e6fffa] border border-[#99f6e4] px-[5px] py-[2px] rounded-[4px]">
                            <span className="font-bold text-[#0d7b78] text-[9px]">
                              Save 10%
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="font-bold text-[#0b1f3a] text-[15px]">
                            £{product.price.toFixed(2)}
                          </span>
                          <span className="font-normal text-[#64748b] text-[11px]">
                            One-Time Purchase
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  {product.format === "complete-pen-set" ? (
                    <Link
                      href={`/products/${product.handle}`}
                      className="btn-shimmer btn-press bg-[#0b1f3a] hover:bg-[#16a6a3] text-white flex gap-[6px] items-center justify-center px-[12px] py-[10px] rounded-xl text-[12px] font-semibold transition-all shadow-xs hover:shadow-md mt-2 group cursor-pointer"
                    >
                      <div className="size-[15px] shrink-0 transition-transform duration-200 group-hover:scale-110">
                        <img alt="" className="size-full" src="/images/figma/27b4991e9b952fe1e43fac289265fda55a606a7f.svg" />
                      </div>
                      <span>View Pen Set</span>
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="btn-shimmer btn-press bg-[#0b1f3a] hover:bg-[#16a6a3] text-white flex gap-[6px] items-center justify-center px-[12px] py-[10px] rounded-xl text-[12px] font-semibold transition-all shadow-xs hover:shadow-md mt-2 group cursor-pointer"
                    >
                      <div className="size-[15px] shrink-0 transition-transform duration-200 group-hover:scale-110">
                        <img alt="" className="size-full" src="/images/figma/27b4991e9b952fe1e43fac289265fda55a606a7f.svg" />
                      </div>
                      <span>Add to Cart</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="flex flex-col gap-3 w-full">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border border-[#e2e8f0] rounded-[8px] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-[#f8fafc] rounded-[6px] size-[80px] relative shrink-0 p-1">
                      <Image src={product.image} alt={product.name} fill className="object-contain" />
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] font-semibold text-[#64748b] tracking-wide uppercase">
                        {product.formatLabel}
                      </span>
                      <h4 className="text-[15px] font-bold text-[#0b1f3a]">{product.name}</h4>
                      <p className="text-[12px] text-[#475569]">{product.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-[16px] font-bold text-[#0b1f3a]">
                        £{(product.subscribePrice || product.price).toFixed(2)}
                      </div>
                      {product.isSubscriptionEligible && (
                        <span className="text-[10px] font-bold text-[#0d7b78] bg-[#e6fffa] px-1.5 py-0.5 rounded border border-[#99f6e4]">
                          Save 10%
                        </span>
                      )}
                    </div>
                    {product.format === "complete-pen-set" ? (
                      <Link
                        href={`/products/${product.handle}`}
                        className="btn-shimmer btn-press bg-[#0b1f3a] hover:bg-[#16a6a3] text-white px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-all shadow-xs hover:shadow-md cursor-pointer"
                      >
                        View Pen Set
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="btn-shimmer btn-press bg-[#0b1f3a] hover:bg-[#16a6a3] text-white px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-all shadow-xs hover:shadow-md cursor-pointer"
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </main>
      </div>

    </div>
  )
}
