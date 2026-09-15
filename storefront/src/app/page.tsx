"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/components/cart/CartContext"

// Featured Pen Systems from Mockup 1
const FEATURED_PEN_SETS = [
  {
    id: "pen-set-rt40",
    name: "RT40",
    tag: "PEN SYSTEM",
    application: "Food Safety Testing",
    price: 249.00,
    image: "/images/peptech/front.webp",
  },
  {
    id: "pen-set-cc1236",
    name: "C.C-1236",
    tag: "PEN SYSTEM",
    application: "Environmental Testing",
    price: 249.00,
    image: "/images/peptech/front.webp",
  },
  {
    id: "pen-set-tbs30",
    name: "TB-S30",
    tag: "PEN SYSTEM",
    application: "Healthcare Testing",
    price: 249.00,
    image: "/images/peptech/front.webp",
  },
  {
    id: "pen-set-ifc137",
    name: "IFC-137",
    tag: "PEN SYSTEM",
    application: "Industrial Hygiene",
    price: 249.00,
    image: "/images/peptech/front.webp",
  },
  {
    id: "pen-set-gvk0050",
    name: "GVK-00 50",
    tag: "PEN SYSTEM",
    application: "Water Quality Testing",
    price: 249.00,
    image: "/images/peptech/front.webp",
  },
  {
    id: "pen-set-melatonin2",
    name: "Melatonin II",
    tag: "PEN SYSTEM",
    application: "Mycotoxin Detection",
    price: 249.00,
    image: "/images/peptech/front.webp",
  },
]

// Individual Cartridges from Mockup 1
const INDIVIDUAL_CARTRIDGES = [
  {
    id: "cartridge-rt40",
    name: "RT40",
    type: "Test Cartridge",
    price: 39.00,
    image: "/images/peptech/cartridge.webp",
  },
  {
    id: "cartridge-cc1236",
    name: "C.C-1236",
    type: "Test Cartridge",
    price: 39.00,
    image: "/images/peptech/cartridge.webp",
  },
  {
    id: "cartridge-tbs30",
    name: "TB-S30",
    type: "Test Cartridge",
    price: 25.00,
    image: "/images/peptech/cartridge.webp",
  },
  {
    id: "cartridge-ifc137",
    name: "IFC-137",
    type: "Test Cartridge",
    price: 39.00,
    image: "/images/peptech/cartridge.webp",
  },
  {
    id: "cartridge-gvk0050",
    name: "GVK-00 50",
    type: "Test Cartridge",
    price: 35.00,
    image: "/images/peptech/cartridge.webp",
  },
  {
    id: "cartridge-melatonin2",
    name: "Melatonin II",
    type: "Test Cartridge",
    price: 33.00,
    image: "/images/peptech/cartridge.webp",
  },
]

// Applications from Mockup 1
const APPLICATIONS = [
  {
    title: "Food Safety",
    image: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600&auto=format&fit=crop&q=80",
    desc: "Rapid pathogen and contaminant screening for food production facilities.",
  },
  {
    title: "Water Quality",
    image: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=600&auto=format&fit=crop&q=80",
    desc: "Precision microbial and chemical assay testing for water treatment plants.",
  },
  {
    title: "Environmental",
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop&q=80",
    desc: "On-site soil and ecological analysis with laboratory-grade consistency.",
  },
  {
    title: "Healthcare",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80",
    desc: "Point-of-care clinical research, biomarker evaluation and diagnostic protocols.",
  },
  {
    title: "Industrial Hygiene",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80",
    desc: "Cleanroom surface monitoring and bio-load verification across manufacturing.",
  },
  {
    title: "Agriculture & Feed",
    image: "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=600&auto=format&fit=crop&q=80",
    desc: "High-sensitivity screening for crop health, livestock nutrients and mycotoxins.",
  },
]

export default function HomePage() {
  const { addItem, setIsDrawerOpen } = useCart()

  const handleAddPenSet = (set: typeof FEATURED_PEN_SETS[0]) => {
    addItem({
      id: set.id,
      title: `${set.name} Complete Pen System`,
      format: "pen-set",
      strength: set.application,
      price: set.price,
      isSubscription: false,
      sku: `PEP-PEN-${set.name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}`,
      batch: "PT-2026-01",
    })
    setIsDrawerOpen(true)
  }

  const handleAddCartridge = (cartridge: typeof INDIVIDUAL_CARTRIDGES[0]) => {
    addItem({
      id: cartridge.id,
      title: `${cartridge.name} Test Cartridge`,
      format: "refill",
      strength: cartridge.type,
      price: cartridge.price,
      isSubscription: false,
      sku: `PEP-CRT-${cartridge.name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}`,
      batch: "CRT-2026-B1",
    })
    setIsDrawerOpen(true)
  }

  return (
    <div className="bg-white min-h-screen text-slate-900">
      
      {/* 1. HERO SECTION (Same as Page 1 Mockup) */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-slate-100 bg-gradient-to-b from-slate-50/70 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Hero Text & CTAs */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200/60 text-[#00A896] text-xs font-bold tracking-wider uppercase">
                <span>Rapid Testing. Real Impact.</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0B1F3A] leading-[1.1]">
                THE COMPLETE <br className="hidden sm:inline" />
                PEPTECH® SYSTEM
              </h1>

              <p className="text-base sm:text-lg font-semibold text-slate-800 leading-snug">
                One reusable pen. Multiple test cartridges. Accurate. Reliable. Convenient.
              </p>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                PEPTECH® delivers premium, ready-to-use kits and reagents designed for precision, consistency and trusted results across multiple industries.
              </p>

              {/* Action CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/products/complete-pen-set"
                  className="px-7 py-3.5 rounded-lg bg-[#0B1F3A] hover:bg-[#15345d] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 group"
                >
                  <span>Shop All Products</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>

                <a
                  href="#pen-showcase"
                  className="px-7 py-3.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white text-slate-800 text-sm font-bold hover:bg-slate-50 transition-all"
                >
                  Learn More
                </a>
              </div>

              {/* 4 Feature Metrics Row */}
              <div className="pt-8 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🎯</span>
                  <div className="text-xs font-bold text-slate-800">High<br />Accuracy</div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">⚡</span>
                  <div className="text-xs font-bold text-slate-800">Fast<br />Results</div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🧪</span>
                  <div className="text-xs font-bold text-slate-800">Easy<br />to Use</div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🛡️</span>
                  <div className="text-xs font-bold text-slate-800">Reliable &amp;<br />Consistent</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Kit Showcase Mockup */}
            <div className="lg:col-span-6 relative flex flex-col items-center justify-center">
              <div className="relative w-full max-w-lg aspect-4/3 rounded-2xl overflow-hidden shadow-2xl border border-slate-200/80 bg-white">
                <Image
                  src="/images/peptech/mockup1.webp"
                  alt="PEPTECH Complete Reusable Pen System Kit"
                  fill
                  className="object-cover"
                  priority
                />

                {/* Floating "Reusable Pen Reusable up to 2 years" Badge */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-xs border border-slate-200/80 shadow-lg rounded-xl p-2 sm:p-2.5 flex items-center gap-2.5 max-w-[200px]">
                  <div className="relative w-9 h-9 shrink-0">
                    <Image
                      src="/images/peptech/badge.webp"
                      alt="Quality Badge"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-[#0B1F3A] leading-tight">Reusable Pen</div>
                    <div className="text-[9px] text-slate-500 font-medium">Reusable up to 2 years</div>
                  </div>
                </div>
              </div>

              {/* Signature Script under Hero Image */}
              <div className="mt-4 text-center">
                <span className="text-slate-500 text-xs sm:text-sm italic font-serif">
                  A Healthier World. Together.™
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. FOUR TRUST VALUE CARDS (Mockup 1) */}
      <section className="py-10 bg-slate-50/50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-start gap-4">
              <span className="text-2xl p-2 bg-blue-50 text-blue-600 rounded-lg">🛡️</span>
              <div>
                <h4 className="font-bold text-sm text-[#0B1F3A]">Trusted Technology</h4>
                <p className="text-xs text-slate-500 mt-0.5">Backed by research and real-world results</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-start gap-4">
              <span className="text-2xl p-2 bg-teal-50 text-teal-600 rounded-lg">🔬</span>
              <div>
                <h4 className="font-bold text-sm text-[#0B1F3A]">Wide Test Menu</h4>
                <p className="text-xs text-slate-500 mt-0.5">For multiple applications and industries</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-start gap-4">
              <span className="text-2xl p-2 bg-indigo-50 text-indigo-600 rounded-lg">🌐</span>
              <div>
                <h4 className="font-bold text-sm text-[#0B1F3A]">Global Standards</h4>
                <p className="text-xs text-slate-500 mt-0.5">Quality you can rely on</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-start gap-4">
              <span className="text-2xl p-2 bg-emerald-50 text-emerald-600 rounded-lg">📞</span>
              <div>
                <h4 className="font-bold text-sm text-[#0B1F3A]">Dedicated Support</h4>
                <p className="text-xs text-slate-500 mt-0.5">Here when you need us</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS: START WITH A PREMIUM PEPTECH® SET (Mockup 1) */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-[var(--color-brand-teal)] uppercase tracking-wider block mb-1">
              FEATURED PRODUCTS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B1F3A] tracking-tight">
              Start with a premium PEPTECH® set
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Each set includes everything you need to begin testing with confidence.
            </p>
          </div>
          <Link
            href="/products/complete-pen-set"
            className="text-xs sm:text-sm font-bold text-[#0B1F3A] hover:text-[var(--color-brand-teal)] transition-colors flex items-center gap-1 group"
          >
            <span>View All Products</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {/* 6 Pen Sets Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {FEATURED_PEN_SETS.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col justify-between hover:shadow-lg transition-all group"
            >
              <Link href={`/products/complete-pen-set?model=${encodeURIComponent(product.name)}`} className="block">
                <div className="relative w-full aspect-square rounded-lg bg-slate-50 overflow-hidden mb-3 border border-slate-100 flex items-center justify-center p-2">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={180}
                    height={180}
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="font-black text-sm text-[#0B1F3A] tracking-tight">{product.name}</h3>
                  <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{product.tag}</div>
                  <div className="text-[11px] text-slate-500 line-clamp-1">{product.application}</div>
                  <div className="text-sm font-bold text-[#0B1F3A] pt-1">
                    ${product.price.toFixed(2)}
                  </div>
                </div>
              </Link>

              <button
                onClick={() => handleAddPenSet(product)}
                className="mt-3 w-full py-2 px-2 rounded-lg bg-[#0B1F3A] hover:bg-[#15345d] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>🛒</span>
                <span>Add to Cart</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 4. INDIVIDUAL CARTRIDGES: JUST REPLACE THE CARTRIDGE (Mockup 1) */}
      <section className="py-12 bg-slate-50/70 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Promo Card */}
            <div className="lg:col-span-3 bg-gradient-to-br from-cyan-50 to-blue-50/40 p-6 rounded-2xl border border-cyan-200/70 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#00A896] uppercase tracking-wider">
                  INDIVIDUAL CARTRIDGES
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#0B1F3A] leading-tight">
                  Just replace the cartridge.
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Our test cartridges are designed for quick, reliable and consistent results across all applications.
                </p>
              </div>

              <Link
                href="/refills"
                className="mt-6 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#0B1F3A] hover:bg-[#15345d] text-white text-xs font-bold transition-all shadow-xs"
              >
                <span>Shop All Cartridges</span>
                <span>→</span>
              </Link>
            </div>

            {/* Right 6 Cartridges Grid */}
            <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {INDIVIDUAL_CARTRIDGES.map((cartridge) => (
                <div
                  key={cartridge.id}
                  className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col justify-between hover:shadow-md transition-all text-center"
                >
                  <div className="relative w-full aspect-square rounded-lg bg-slate-50/60 overflow-hidden mb-2 border border-slate-100 flex items-center justify-center p-2">
                    <Image
                      src={cartridge.image}
                      alt={cartridge.name}
                      width={140}
                      height={140}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-[#0B1F3A]">{cartridge.name}</h4>
                    <div className="text-[10px] text-slate-400 font-medium">{cartridge.type}</div>
                    <div className="text-xs font-bold text-[#0B1F3A] mt-1">
                      ${cartridge.price.toFixed(2)}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddCartridge(cartridge)}
                    className="mt-2.5 w-full py-1.5 px-2 rounded-lg bg-[#0B1F3A] hover:bg-[#15345d] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    title={`Add ${cartridge.name} Cartridge to Cart`}
                  >
                    <span>🛒</span>
                  </button>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 5. HARDWARE SHOWCASE: ONE PEN. MULTIPLE POSSIBILITIES. (Mockup 1) */}
      <section id="pen-showcase" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl sm:text-4xl font-black text-[#0B1F3A] tracking-tight">
            ONE PEN. MULTIPLE POSSIBILITIES.
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            Engineered for precision. Designed for performance.
          </p>
        </div>

        {/* 4 Feature Highlight Points */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
          <div className="text-center space-y-1">
            <span className="text-2xl inline-block mb-1">🔄</span>
            <h4 className="font-black text-xs sm:text-sm text-[#0B1F3A]">Reusable Pen</h4>
            <p className="text-[11px] text-slate-500">Cost-effective and sustainable</p>
          </div>
          <div className="text-center space-y-1">
            <span className="text-2xl inline-block mb-1">💧</span>
            <h4 className="font-black text-xs sm:text-sm text-[#0B1F3A]">Simple Workflow</h4>
            <p className="text-[11px] text-slate-500">Minimal training required</p>
          </div>
          <div className="text-center space-y-1">
            <span className="text-2xl inline-block mb-1">📈</span>
            <h4 className="font-black text-xs sm:text-sm text-[#0B1F3A]">Reliable Results</h4>
            <p className="text-[11px] text-slate-500">Consistent and reproducible</p>
          </div>
          <div className="text-center space-y-1">
            <span className="text-2xl inline-block mb-1">🔲</span>
            <h4 className="font-black text-xs sm:text-sm text-[#0B1F3A]">Multiple Applications</h4>
            <p className="text-[11px] text-slate-500">One platform, wider possibilities</p>
          </div>
        </div>

        {/* Sleek Horizontal Pen Shot */}
        <div className="relative w-full max-w-4xl mx-auto aspect-[16/6] bg-slate-50/60 rounded-2xl border border-slate-200/80 p-6 flex items-center justify-center overflow-hidden shadow-inner">
          <Image
            src="/images/peptech/pen.webp"
            alt="PEPTECH Aerospace-Grade Reusable Injection Pen"
            fill
            className="object-contain p-4"
          />
        </div>
      </section>

      {/* 6. APPLICATIONS: MULTIPLE INDUSTRIES. REAL IMPACT. (Mockup 1) */}
      <section id="applications" className="py-16 bg-slate-50/70 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <span className="text-xs font-bold text-[var(--color-brand-teal)] uppercase tracking-wider block mb-1">
              APPLICATIONS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B1F3A] tracking-tight">
              Multiple Industries. Real Impact.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Trusted by professionals in laboratories, industries and research institutions worldwide.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
            {APPLICATIONS.map((app) => (
              <div
                key={app.title}
                className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-shadow group flex flex-col"
              >
                <div className="relative h-32 w-full overflow-hidden bg-slate-200">
                  <Image
                    src={app.image}
                    alt={app.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <h4 className="font-black text-xs sm:text-sm text-[#0B1F3A]">{app.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{app.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. TRUSTED BY PROFESSIONALS: CERTIFICATION LOGOS (Mockup 1) */}
      <section className="py-14 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">
            TRUSTED BY PROFESSIONALS
          </h3>
          <p className="text-xs text-slate-500 mb-8">
            Used by leading laboratories, industries and research institutions worldwide.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-85">
            {/* NSF */}
            <div className="flex items-center gap-1 text-slate-700 font-black text-xl tracking-tighter border-2 border-slate-700 rounded-full px-3 py-1">
              <span>NSF</span>
            </div>

            {/* ISO 9001 */}
            <div className="flex flex-col items-center">
              <div className="font-black text-slate-800 text-lg leading-tight">ISO</div>
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">CERTIFIED</div>
            </div>

            {/* CE */}
            <div className="font-serif font-black text-slate-800 text-3xl tracking-tight">
              CE
            </div>

            {/* FDA */}
            <div className="font-mono font-black text-slate-800 text-2xl tracking-tight">
              FDA
            </div>

            {/* World Health Organization */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌐</span>
              <div className="text-left leading-tight">
                <div className="text-[10px] font-bold text-slate-800 uppercase">World Health</div>
                <div className="text-[9px] text-slate-500 uppercase">Organization</div>
              </div>
            </div>

            {/* AOAC */}
            <div className="text-left leading-tight">
              <div className="text-sm font-black text-slate-800">AOAC</div>
              <div className="text-[9px] text-slate-500 font-mono">INTERNATIONAL</div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. ADVANCING A HEALTHIER WORLD: CTA BANNER (Mockup 1) */}
      <section className="py-16 bg-[#0B1F3A] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            <div className="md:col-span-8 space-y-4">
              <div className="text-xs font-bold text-[var(--color-brand-teal)] uppercase tracking-wider">
                ADVANCING A HEALTHIER WORLD
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Better Testing <br />
                for a Safer Tomorrow
              </h2>
              <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                Discover how PEPTECH® helps you achieve accurate, reliable and efficient testing — every day.
              </p>
              <div className="pt-2">
                <Link
                  href="/products/complete-pen-set"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-white text-[#0B1F3A] text-xs font-bold hover:bg-slate-100 transition-colors shadow-lg"
                >
                  <span>Get Started</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            <div className="md:col-span-4 bg-white/5 rounded-2xl p-6 border border-white/10 text-center space-y-2 backdrop-blur-xs">
              <span className="text-3xl">🛡️</span>
              <div className="font-bold text-sm text-white">Accurate. Reliable. Everywhere.</div>
              <div className="text-xs text-slate-400 italic">Small Testing. A Bigger Tomorrow.</div>
            </div>

          </div>
        </div>
      </section>

    </div>
  )
}
