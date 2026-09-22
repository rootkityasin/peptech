"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/components/cart/CartContext"
import { Interactive3DPen } from "@/components/home/Interactive3DPen"
import { TrustedBySection } from "@/components/common/TrustedBySection"

// Featured Complete Pen Sets from Figma (Node 2:29339)
const FIGMA_FEATURED_PEN_SETS = [
  {
    id: "pen-set-rt40",
    name: "RT40",
    handle: "pen-system-rt40",
    tag: "PEN SYSTEM",
    application: "Food Safety Testing",
    price: 249.00,
    image: "/images/figma/product-set-rt40.png",
  },
  {
    id: "pen-set-cc1236",
    name: "C.C-1236",
    handle: "pen-system-cc1236",
    tag: "PEN SYSTEM",
    application: "Environmental Testing",
    price: 249.00,
    image: "/images/figma/product-set-cc1236.png",
  },
  {
    id: "pen-set-tbs30",
    name: "TB-S30",
    handle: "pen-system-tbs30",
    tag: "PEN SYSTEM",
    application: "Healthcare Testing",
    price: 249.00,
    image: "/images/figma/product-set-tbs30.png",
  },
  {
    id: "pen-set-ifc137",
    name: "IFC-137",
    handle: "pen-system-ifc137",
    tag: "PEN SYSTEM",
    application: "Industrial Hygiene",
    price: 249.00,
    image: "/images/figma/product-set-ifc137.png",
  },
  {
    id: "pen-set-gvk0050",
    name: "GVK-00 50",
    handle: "pen-system-gvk0050",
    tag: "PEN SYSTEM",
    application: "Water Quality Testing",
    price: 249.00,
    image: "/images/figma/product-set-gvk0050.png",
  },
  {
    id: "pen-set-melatoxin2",
    name: "Melatoxin II",
    handle: "pen-system-melatoxin2",
    tag: "PEN SYSTEM",
    application: "Mycotoxin Detection",
    price: 249.00,
    image: "/images/figma/product-set-melatoxin2.png",
  },
]

// Individual Cartridges from Figma (Node 2:29436)
const FIGMA_CARTRIDGES = [
  {
    id: "cartridge-rt40",
    name: "RT40",
    handle: "cartridge-rt40",
    type: "Test Cartridge",
    price: 39.00,
    image: "/images/figma/cartridge-clear.png",
  },
  {
    id: "cartridge-cc1236",
    name: "C.C-1236",
    handle: "cartridge-cc1236",
    type: "Test Cartridge",
    price: 39.00,
    image: "/images/figma/cartridge-clear.png",
  },
  {
    id: "cartridge-tbs30",
    name: "TB-S30",
    handle: "cartridge-tbs30",
    type: "Test Cartridge",
    price: 25.00,
    image: "/images/figma/cartridge-clear.png",
  },
  {
    id: "cartridge-ifc137",
    name: "IFC-137",
    handle: "cartridge-ifc137",
    type: "Test Cartridge",
    price: 39.00,
    image: "/images/figma/cartridge-clear.png",
  },
  {
    id: "cartridge-gvk0050",
    name: "GVK-00 50",
    handle: "cartridge-gvk0050",
    type: "Test Cartridge",
    price: 35.00,
    image: "/images/figma/cartridge-clear.png",
  },
  {
    id: "cartridge-melatoxin2",
    name: "Melatoxin II",
    handle: "cartridge-melatoxin2",
    type: "Test Cartridge",
    price: 33.00,
    image: "/images/figma/cartridge-clear.png",
  },
]

export default function HomePage() {
  const { addItem, setIsDrawerOpen } = useCart()

  // Handle Add to Cart for Complete Pen Sets
  const handleAddPenSet = (product: typeof FIGMA_FEATURED_PEN_SETS[0]) => {
    addItem({
      id: product.id,
      title: `${product.name} Complete Pen Set`,
      format: "pen-set",
      strength: product.application,
      price: product.price,
      isSubscription: false,
      sku: `PEP-PEN-${product.name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}`,
      batch: "PT-2026-B1",
      image: product.image,
    })
    setIsDrawerOpen(true)
  }

  // Handle Add to Cart for Cartridges
  const handleAddCartridge = (cartridge: typeof FIGMA_CARTRIDGES[0]) => {
    addItem({
      id: cartridge.id,
      title: `${cartridge.name} Test Cartridge`,
      format: "refill",
      strength: cartridge.type,
      price: cartridge.price,
      isSubscription: false,
      sku: `PEP-CRT-${cartridge.name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}`,
      batch: "CRT-2026-B1",
      image: cartridge.image,
    })
    setIsDrawerOpen(true)
  }

  return (
    <main className="bg-white text-slate-900 overflow-x-hidden font-sans">
      
      {/* 01. HERO SECTION - Figma Node 2:29257 */}
      <section className="bg-[#F4F7FA] pt-6 pb-12 sm:py-16 border-b border-[#E2E8F0] relative">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            
            {/* Left Column on Desktop, Second on Mobile: Value Proposition */}
            <div className="order-2 lg:order-1 lg:col-span-6 space-y-5">
              <span className="inline-block text-[12px] font-bold text-[#16A6A3] tracking-[1.2px] uppercase">
                RAPID TESTING. REAL IMPACT.
              </span>
              
              <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#0B1F3A] leading-[1.15] tracking-tight uppercase">
                THE COMPLETE<br className="hidden sm:inline" /> PEPTECH® SYSTEM
              </h1>

              <p className="text-sm sm:text-base font-bold text-[#0B1F3A] leading-relaxed">
                One reusable pen. Multiple test cartridges. Accurate. Reliable. Convenient.
              </p>

              <p className="text-xs sm:text-[14px] text-[#64748B] leading-[22px] max-w-lg">
                PEPTECH® delivers premium, ready-to-use kits and reagents designed for precision, consistency and trusted results across multiple industries.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  href="/products/complete-pen-set"
                  className="btn-shimmer btn-press px-6 py-3.5 rounded-xl bg-[#0B1F3A] hover:bg-[#162e52] text-white text-[14px] font-semibold transition-all shadow-md hover:shadow-xl inline-flex items-center gap-2 group cursor-pointer"
                >
                  <span>Shop All Products</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </Link>
                
                <Link
                  href="/how-it-works"
                  className="btn-press px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#0B1F3A] border border-[#CBD5E1] hover:border-[#0B1F3A] text-[14px] font-semibold transition-all shadow-xs hover:shadow-md inline-flex items-center cursor-pointer"
                >
                  Learn More
                </Link>
              </div>

              {/* 4 Micro Value Props Row - Figma Node I2:29725;2:29272 */}
              <div className="pt-6 border-t border-[#E2E8F0] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center max-w-[520px]">
                <div className="flex flex-col items-center text-center">
                  <img src="/images/figma/icon-target.svg" alt="Accuracy" className="w-5 h-5 mb-2" />
                  <span className="text-[12px] font-bold text-[#0B1F3A] leading-tight">High Accuracy</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <img src="/images/figma/icon-lightning.svg" alt="Results" className="w-5 h-5 mb-2" />
                  <span className="text-[12px] font-bold text-[#0B1F3A] leading-tight">Fast Results</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <img src="/images/figma/icon-hand.svg" alt="Usage" className="w-5 h-5 mb-2" />
                  <span className="text-[12px] font-bold text-[#0B1F3A] leading-tight">Easy to Use</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <img src="/images/figma/icon-shield.svg" alt="Consistency" className="w-5 h-5 mb-2" />
                  <span className="text-[12px] font-bold text-[#0B1F3A] leading-tight">Reliable &amp; Consistent</span>
                </div>
              </div>
            </div>

            {/* Right Column on Desktop, First on Mobile: Hero Presentation Kit Mockup */}
            <div className="order-1 lg:order-2 lg:col-span-6 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[580px] h-[260px] xs:h-[300px] sm:h-[400px] lg:h-[440px] flex items-center justify-center">
                <Image
                  src="/images/figma/hero-presentation-box.png"
                  alt="PEPTECH® Reusable Injection Pen System Kit Presentation"
                  fill
                  className="object-contain drop-shadow-xl"
                  priority
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 02. TRUST BADGES STRIP - Figma Node 2:29297 */}
      <section className="bg-white py-7 sm:py-10 border-b border-[#E2E8F0]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-4 sm:gap-6">
            
            <div className="flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2 sm:gap-3.5">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <img src="/images/figma/icon-trusted-tech.svg" alt="Technology" className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="text-[13px] sm:text-[14px] font-bold text-[#0B1F3A] leading-tight">
                  <span className="sm:hidden">Trusted Tech</span>
                  <span className="hidden sm:inline">Trusted Technology</span>
                </h4>
                <p className="text-[11px] sm:text-[12px] text-[#64748B] mt-0.5 sm:mt-0 leading-tight">
                  <span className="sm:hidden">Research-backed</span>
                  <span className="hidden sm:inline">Backed by research and real-world results</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2 sm:gap-3.5">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-cyan-50 flex items-center justify-center shrink-0">
                <img src="/images/figma/icon-wide-menu.svg" alt="Menu" className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="text-[13px] sm:text-[14px] font-bold text-[#0B1F3A] leading-tight">
                  <span className="sm:hidden">Wide Menu</span>
                  <span className="hidden sm:inline">Wide Test Menu</span>
                </h4>
                <p className="text-[11px] sm:text-[12px] text-[#64748B] mt-0.5 sm:mt-0 leading-tight">
                  <span className="sm:hidden">Multi-industry</span>
                  <span className="hidden sm:inline">For multiple applications and industries</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2 sm:gap-3.5">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                <img src="/images/figma/icon-global-standards.svg" alt="Standards" className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="text-[13px] sm:text-[14px] font-bold text-[#0B1F3A] leading-tight">
                  Global Standards
                </h4>
                <p className="text-[11px] sm:text-[12px] text-[#64748B] mt-0.5 sm:mt-0 leading-tight">
                  <span className="sm:hidden">Verified quality</span>
                  <span className="hidden sm:inline">Quality you can rely on</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-2 sm:gap-3.5">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-sky-50 flex items-center justify-center shrink-0">
                <img src="/images/figma/icon-dedicated-support.svg" alt="Support" className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="text-[13px] sm:text-[14px] font-bold text-[#0B1F3A] leading-tight">
                  Dedicated Support
                </h4>
                <p className="text-[11px] sm:text-[12px] text-[#64748B] mt-0.5 sm:mt-0 leading-tight">
                  <span className="sm:hidden">Always available</span>
                  <span className="hidden sm:inline">Here when you need us</span>
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 03. FEATURED PRODUCTS SECTION - Figma Node 2:29339 */}
      <section className="bg-white py-16">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-[12px] font-bold text-[#16A6A3] tracking-[1.2px] uppercase">
                FEATURED PRODUCTS
              </span>
              <h2 className="text-2xl sm:text-[28px] font-bold text-[#0B1F3A]">
                Start with a premium PEPTECH® set
              </h2>
              <p className="text-[14px] text-[#64748B]">
                Each set includes everything you need to begin testing with confidence.
              </p>
            </div>
            <Link
              href="/products/complete-pen-set"
              className="text-[14px] font-semibold text-[#0B1F3A] hover:text-[#16A6A3] transition-colors inline-flex items-center gap-1.5 shrink-0"
            >
              <span>View All Products</span>
              <span>→</span>
            </Link>
          </div>

          {/* 6 Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {FIGMA_FEATURED_PEN_SETS.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-[#E2E8F0] rounded-[8px] p-3 flex flex-col justify-between hover:shadow-md transition-shadow group"
              >
                {/* Product Box Image */}
                <Link href={`/products/${p.handle}`} className="block">
                  <div className="h-[125px] w-full relative flex items-center justify-center mb-2">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      className="object-contain p-1 group-hover:scale-105 transition-transform"
                    />
                  </div>
                </Link>

                {/* Info Block */}
                <div className="text-center space-y-0.5 mb-3">
                  <Link href={`/products/${p.handle}`}>
                    <h3 className="text-[15px] font-bold text-[#0B1F3A] hover:text-[#16A6A3] transition-colors">
                      {p.name}
                    </h3>
                  </Link>
                  <p className="text-[10px] font-semibold text-[#64748B] tracking-[0.5px]">
                    {p.tag}
                  </p>
                  <p className="text-[11px] text-[#475569] truncate">
                    {p.application}
                  </p>
                  <p className="text-[15px] font-bold text-[#0B1F3A] pt-1">
                    ${p.price.toFixed(2)}
                  </p>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddPenSet(p)}
                  className="w-full py-2 bg-[#0B1F3A] hover:bg-[#162e52] text-white rounded-[6px] text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <img src="/images/figma/icon-cart.svg" alt="" className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 04. INDIVIDUAL CARTRIDGES SECTION - Figma Node 2:29436 */}
      <section className="bg-white py-12 border-t border-[#E2E8F0]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Spotlight Container */}
            <div className="lg:col-span-3 bg-[#EEF5F9] rounded-[12px] p-5 sm:p-7 flex flex-col justify-start lg:justify-between lg:h-full lg:min-h-[400px]">
              <div className="space-y-2 sm:space-y-3">
                <span className="text-[11px] font-bold text-[#16A6A3] tracking-[1.2px] uppercase">
                  INDIVIDUAL CARTRIDGES
                </span>
                <h2 className="text-[24px] sm:text-[26px] font-bold text-[#0B1F3A] leading-[30px] sm:leading-[32px]">
                  Just replace<br />the cartridge.
                </h2>
                <p className="text-[13px] text-[#475569] leading-[20px]">
                  Our test cartridges are designed for quick, reliable and consistent results across all applications.
                </p>
              </div>

              <Link
                href="/refills"
                className="w-full py-3 px-4 bg-[#0B1F3A] hover:bg-[#162e52] text-white rounded-[6px] text-[12px] font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer mt-4 sm:mt-5 lg:mt-auto"
              >
                <span>Shop All Cartridges</span>
                <span>→</span>
              </Link>
            </div>

            {/* Right 6-Card Cartridge Grid */}
            <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {FIGMA_CARTRIDGES.map((c) => (
                <div
                  key={c.id}
                  className="bg-white border border-[#E2E8F0] rounded-[8px] p-3 flex flex-col justify-between h-[420px] hover:shadow-md transition-shadow group"
                >
                  {/* Cartridge Clear Photo */}
                  <Link href={`/products/${c.handle}`} className="block">
                    <div className="h-[220px] w-full relative flex items-center justify-center bg-[#f8fafc] rounded-lg group-hover:bg-slate-100 transition-colors">
                      <Image
                        src={c.image}
                        alt={c.name}
                        fill
                        className="object-contain p-2 group-hover:scale-105 transition-transform"
                      />
                    </div>
                  </Link>

                  {/* Info Block */}
                  <div className="text-center space-y-0.5 my-2">
                    <Link href={`/products/${c.handle}`}>
                      <h3 className="text-[14px] font-bold text-[#0B1F3A] hover:text-[#16A6A3] transition-colors">
                        {c.name}
                      </h3>
                    </Link>
                    <p className="text-[11px] text-[#64748B]">
                      {c.type}
                    </p>
                    <p className="text-[14px] font-bold text-[#0B1F3A] pt-0.5">
                      ${c.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-1.5 w-full">
                    <Link
                      href={`/products/${c.handle}`}
                      className="flex-1 h-[36px] bg-[#0B1F3A] hover:bg-[#162e52] text-white rounded-[6px] text-[11px] font-semibold flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <span>View</span>
                      <span className="ml-0.5">→</span>
                    </Link>
                    <button
                      onClick={() => handleAddCartridge(c)}
                      title="Add to Cart"
                      className="size-[36px] border border-[#CBD5E1] hover:border-[#0B1F3A] hover:bg-slate-50 text-[#0B1F3A] rounded-[6px] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    >
                      <img src="/images/figma/icon-cart.svg" alt="" className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 05. ONE PEN ARCHITECTURE SECTION - Figma Node 2:29527 */}
      <section className="bg-white py-[40px] flex items-center justify-center">
        <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="bg-[#f2f7fa] flex flex-col gap-[18px] sm:gap-[24px] items-center px-[24px] sm:px-[40px] pt-[28px] sm:pt-[34px] pb-[18px] sm:pb-[22px] rounded-[16px]">
            {/* Top Row: Left Header + Right 4 Features */}
            <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-[1160px] gap-8">
              {/* Left Header */}
              <div className="flex flex-col gap-[6px] items-start w-full lg:w-[440px]">
                <div className="font-bold text-[#0b1f3a] text-[24px] sm:text-[26px] tracking-[0.5px] leading-[32px]">
                  <p className="mb-0">ONE PEN.</p>
                  <p>MULTIPLE POSSIBILITIES.</p>
                </div>
                <p className="text-[#64748b] text-[13px]">
                  Engineered for precision. Designed for performance.
                </p>
              </div>

              {/* Right Architecture Features Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 items-center justify-between w-full lg:w-[680px]">
                <div className="flex flex-col gap-[8px] items-center text-center">
                  <div className="w-[22px] h-[22px]">
                    <img src="/images/figma/icon-reusable-pen.svg" alt="Reusable Pen" className="w-full h-full object-contain" />
                  </div>
                  <p className="font-bold text-[#0b1f3a] text-[13px]">Reusable Pen</p>
                  <div className="text-[#64748b] text-[11px] leading-[15px]">
                    <p className="mb-0">Cost-effective</p>
                    <p>and sustainable</p>
                  </div>
                </div>

                <div className="flex flex-col gap-[8px] items-center text-center">
                  <div className="w-[22px] h-[22px]">
                    <img src="/images/figma/icon-simple-workflow.svg" alt="Simple Workflow" className="w-full h-full object-contain" />
                  </div>
                  <p className="font-bold text-[#0b1f3a] text-[13px]">Simple Workflow</p>
                  <div className="text-[#64748b] text-[11px] leading-[15px]">
                    <p className="mb-0">Minimal training</p>
                    <p>required</p>
                  </div>
                </div>

                <div className="flex flex-col gap-[8px] items-center text-center">
                  <div className="w-[22px] h-[22px]">
                    <img src="/images/figma/icon-reliable-results.svg" alt="Reliable Results" className="w-full h-full object-contain" />
                  </div>
                  <p className="font-bold text-[#0b1f3a] text-[13px]">Reliable Results</p>
                  <div className="text-[#64748b] text-[11px] leading-[15px]">
                    <p className="mb-0">Consistent and</p>
                    <p>reproducible</p>
                  </div>
                </div>

                <div className="flex flex-col gap-[8px] items-center text-center">
                  <div className="w-[22px] h-[22px]">
                    <img src="/images/figma/icon-multiple-apps.svg" alt="Multiple Applications" className="w-full h-full object-contain" />
                  </div>
                  <p className="font-bold text-[#0b1f3a] text-[13px]">Multiple Applications</p>
                  <div className="text-[#64748b] text-[11px] leading-[15px]">
                    <p className="mb-0">One platform,</p>
                    <p>wider possibilities</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive 3D Pen Centerpiece Box */}
            <Interactive3DPen />
          </div>
        </div>
      </section>

      {/* 06. TRUSTED BY PROFESSIONALS LOGOS - Figma Node 2:29589 */}
      <TrustedBySection />

      {/* 07. BOTTOM CTA BANNER - Figma Node 2:29601 */}
      <section className="bg-white py-[40px] flex items-center justify-center">
        <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="bg-[#001845] flex flex-col lg:flex-row h-auto lg:h-[280px] items-center justify-between overflow-hidden rounded-[16px] w-full shadow-xl">
            {/* Left Photo Banner */}
            <div className="relative w-full lg:w-[970px] h-[280px] overflow-hidden shrink-0">
              <Image
                src="/images/figma/lab-banner-photo.png"
                alt="Laboratory research background"
                fill
                className="object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: "linear-gradient(90deg, rgba(3, 31, 97, 0.95) 0%, rgba(3, 38, 115, 0.82) 50%, rgba(3, 26, 82, 0.4) 80%, rgba(3, 20, 71, 0.75) 100%)",
                }}
              />
              <div className="absolute inset-0 flex flex-col gap-[14px] items-start pl-[32px] sm:pl-[48px] pr-[24px] sm:pr-[40px] py-[36px]">
                <p className="font-bold text-[#93c5fd] text-[11px] tracking-[1.5px] uppercase">
                  ADVANCING A HEALTHIER WORLD
                </p>
                <div className="font-bold text-[28px] sm:text-[34px] text-white leading-[34px] sm:leading-[40px]">
                  <p className="mb-0">Better Testing</p>
                  <p>for a Safer Tomorrow</p>
                </div>
                <p className="text-[#e2e8f0] text-[13px] leading-[22px] max-w-[520px]">
                  Discover how PEPTECH® helps you achieve accurate, reliable and efficient testing — every day.
                </p>
                <div className="pt-1">
                  <Link
                    href="/products/complete-pen-set"
                    className="bg-white hover:bg-slate-100 flex gap-[8px] items-center justify-center px-[22px] py-[12px] rounded-[6px] text-[#0b1f3a] text-[13px] font-semibold transition-colors shadow-sm"
                  >
                    <span>Get Started</span>
                    <img src="/images/figma/icon-arrow.svg" alt="" className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Solid Value Block */}
            <div className="bg-[#001f54] border-t lg:border-t-0 lg:border-l border-[#0b2b6b] flex flex-col gap-[18px] items-start px-[32px] py-[36px] lg:py-[44px] w-full lg:w-[270px] h-auto lg:h-[280px] shrink-0">
              <div className="flex gap-[12px] items-center">
                <img src="/images/figma/icon-banner-shield.svg" alt="Shield" className="w-[24px] h-[24px]" />
                <div className="font-bold text-[14px] text-white leading-[20px]">
                  <p className="mb-0">Accurate.</p>
                  <p className="mb-0">Reliable.</p>
                  <p>Everywhere.</p>
                </div>
              </div>
              <div className="bg-[#00d2ff] h-[2px] w-[44px]" />
              <div className="text-[#e2e8f0] text-[13px] font-medium leading-[18px]">
                <p className="mb-0">Small Testing.</p>
                <p>A Bigger Tomorrow.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
