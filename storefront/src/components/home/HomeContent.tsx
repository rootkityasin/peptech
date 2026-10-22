"use client"

import React, { Suspense, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSound } from "@/context/SoundContext"
import { Interactive3DPen } from "@/components/home/Interactive3DPen"
import { TrustedBySection } from "@/components/common/TrustedBySection"
import { useLiveProducts } from "@/hooks/useLiveProducts"
import { resolveProductImage } from "@/lib/product-images"
import { sortProductsByPriority } from "@/lib/medusa"
import { CatalogProduct } from "@/data/catalog"
import { HeroScrollingPhrases } from "./HeroScrollingPhrases"

// ---------------------------------------------------------------------------
// Suspense Skeleton Fallbacks
// ---------------------------------------------------------------------------

export function ProductCardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-[#E2E8F0] rounded-[8px] p-3 flex flex-col justify-between animate-pulse"
        >
          <div className="h-[125px] min-h-[125px] w-full bg-slate-100 rounded-md mb-2 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-slate-200/70" />
          </div>
          <div className="text-center space-y-1.5 mb-3">
            <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto" />
            <div className="h-2.5 bg-slate-100 rounded w-1/2 mx-auto" />
            <div className="h-3 bg-slate-100 rounded w-2/3 mx-auto" />
            <div className="h-4 bg-slate-200 rounded w-1/3 mx-auto pt-1" />
          </div>
          <div className="w-full h-[36px] bg-slate-200 rounded-[6px]" />
        </div>
      ))}
    </div>
  )
}

export function CartridgeCardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-3.5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-[#E2E8F0] rounded-[8px] p-2.5 sm:p-3 flex flex-col justify-between h-full min-h-[360px] sm:min-h-[380px] animate-pulse"
        >
          <div className="h-[150px] xs:h-[160px] sm:h-[160px] lg:h-[150px] xl:h-[160px] min-h-[150px] w-full bg-[#f8fafc] rounded-lg mb-2 flex items-center justify-center">
            <div className="w-10 h-20 bg-slate-200/70 rounded-md" />
          </div>
          <div className="text-center space-y-1.5 my-2">
            <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto" />
            <div className="h-3 bg-slate-100 rounded w-1/2 mx-auto" />
            <div className="h-4 bg-slate-200 rounded w-1/3 mx-auto" />
          </div>
          <div className="w-full h-[36px] bg-slate-200 rounded-[6px] mt-auto" />
        </div>
      ))}
    </div>
  )
}

export function Interactive3DPenSkeleton() {
  return (
    <div className="w-full h-[165px] xs:h-[185px] sm:h-[170px] lg:h-[160px] flex items-center justify-center select-none">
      <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/95 border border-[#D2DFED] text-xs font-semibold text-[#0B1F3A] shadow-xs animate-pulse">
        <span className="w-2 h-2 rounded-full bg-[#16A6A3] animate-ping" />
        <span>Loading Interactive 3D Architecture...</span>
      </div>
    </div>
  )
}

export function HomePageSkeleton() {
  return (
    <main className="bg-white min-h-screen text-slate-900 overflow-x-hidden font-sans animate-pulse">
      {/* Hero Skeleton */}
      <section className="bg-[#F4F7FA] pt-6 pb-12 lg:py-16 border-b border-[#E2E8F0]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="h-3 bg-[#16A6A3]/30 rounded w-36" />
              <div className="h-10 bg-slate-200 rounded w-3/4" />
              <div className="h-5 bg-slate-200 rounded w-full" />
              <div className="h-4 bg-slate-100 rounded w-2/3" />
              <div className="flex gap-3 pt-2">
                <div className="h-11 w-40 bg-slate-300 rounded-xl" />
                <div className="h-11 w-32 bg-slate-200 rounded-xl" />
              </div>
            </div>
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-[500px] h-[340px] bg-slate-200/60 rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section Skeleton */}
      <section className="py-16 max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2">
          <div className="h-3 bg-[#16A6A3]/30 rounded w-32" />
          <div className="h-7 bg-slate-200 rounded w-72" />
          <div className="h-4 bg-slate-100 rounded w-96" />
        </div>
        <ProductCardsSkeleton count={6} />
      </section>
    </main>
  )
}

// ---------------------------------------------------------------------------
// Section Display Grids
// ---------------------------------------------------------------------------

interface PenSetCardItem {
  id: string
  name: string
  handle: string
  tag: string
  application: string
  price: number
  image: string
  accentColor?: string
}

function FeaturedPenSetsGrid({
  products,
  isLoading,
}: {
  products: PenSetCardItem[]
  isLoading: boolean
}) {
  if (isLoading && products.length === 0) {
    return <ProductCardsSkeleton count={6} />
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
      {products.map((p) => (
        <div
          key={p.id}
          className="bg-white border border-[#E2E8F0] rounded-[8px] p-2.5 sm:p-3 flex flex-col justify-between hover:shadow-md transition-shadow group h-full"
        >
          {/* Product Box Image */}
          <Link href={`/products/${p.handle}`} className="block">
            <div className="h-[125px] min-h-[125px] w-full relative flex items-center justify-center mb-2">
              <Image
                src={p.image}
                alt={p.name}
                fill
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 160px"
                className="object-contain p-1 group-hover:scale-105 transition-transform"
              />
            </div>
          </Link>

          {/* Info Block */}
          <div className="text-center space-y-0.5 mb-2 sm:mb-3 grow flex flex-col justify-center">
            <Link href={`/products/${p.handle}`}>
              <h3 className="text-[13px] sm:text-[14px] font-bold text-[#0B1F3A] hover:text-[#16A6A3] transition-colors line-clamp-2 min-h-[36px] sm:min-h-[40px] flex items-center justify-center">
                {p.name}
              </h3>
            </Link>
            <p className="text-[10px] font-semibold text-[#64748B] tracking-[0.5px]">
              {p.tag}
            </p>
            <p className="text-[11px] text-[#475569] truncate">
              {p.application}
            </p>
            <p className="text-[14px] sm:text-[15px] font-bold text-[#0B1F3A] pt-0.5">
              £{p.price.toFixed(2)}
            </p>
          </div>

          {/* Actions Row */}
          <div className="w-full mt-auto pt-1">
            <Link
              href={`/products/${p.handle}`}
              className="btn-shimmer btn-press w-full h-[36px] bg-[#0B1F3A] hover:bg-[#16A6A3] text-white rounded-[6px] text-[12px] font-semibold flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <span>Details</span>
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

interface CartridgeCardItem {
  id: string
  name: string
  handle: string
  type: string
  price: number
  image: string
  accentColor?: string
}

function CartridgesGrid({
  cartridges,
  isLoading,
}: {
  cartridges: CartridgeCardItem[]
  isLoading: boolean
}) {
  if (isLoading && cartridges.length === 0) {
    return <CartridgeCardsSkeleton count={6} />
  }

  return (
    <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-3.5">
      {cartridges.map((c) => (
        <div
          key={c.id}
          className="bg-white border border-[#E2E8F0] rounded-[8px] p-2.5 sm:p-3 flex flex-col justify-between h-full min-h-[360px] sm:min-h-[380px] hover:shadow-md transition-shadow group"
        >
          {/* Cartridge Clear Photo */}
          <Link href={`/products/${c.handle}`} className="block">
            <div className="h-[150px] xs:h-[160px] sm:h-[160px] lg:h-[150px] xl:h-[160px] min-h-[150px] w-full relative flex items-center justify-center bg-[#f8fafc] rounded-lg group-hover:bg-slate-100 transition-colors">
              <Image
                src={c.image}
                alt={c.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
                className="object-contain p-2 group-hover:scale-105 transition-transform"
              />
            </div>
          </Link>

          {/* Info Block */}
          <div className="text-center space-y-0.5 my-2 grow flex flex-col justify-center">
            <Link href={`/products/${c.handle}`}>
              <h3 className="text-[13px] sm:text-[14px] font-bold text-[#0B1F3A] hover:text-[#16A6A3] transition-colors line-clamp-2 min-h-[36px] sm:min-h-[40px] flex items-center justify-center">
                {c.name}
              </h3>
            </Link>
            <p className="text-[11px] text-[#64748B] truncate">
              {c.type}
            </p>
            <p className="text-[14px] font-bold text-[#0B1F3A] pt-0.5">
              £{c.price.toFixed(2)}
            </p>
          </div>

          {/* Actions Row */}
          <div className="w-full mt-auto pt-1">
            <Link
              href={`/products/${c.handle}`}
              className="btn-shimmer btn-press w-full h-[36px] bg-[#0B1F3A] hover:bg-[#16A6A3] text-white rounded-[6px] text-[12px] font-semibold flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <span>Details</span>
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

export function HomeContent({
  initialProducts = [],
}: {
  initialProducts?: CatalogProduct[]
}) {
  const { products, isLoading } = useLiveProducts(initialProducts)
  const { registerVideoElement } = useSound()
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      registerVideoElement(video)
      return () => {
        try {
          video.pause()
          video.muted = true
        } catch {}
        registerVideoElement(null)
      }
    }
  }, [registerVideoElement])

  const sourceProducts = products

  const displayPenSets = sortProductsByPriority(
    sourceProducts.filter((p) => p.format === "complete-pen-set")
  )
    .slice(0, 6)
    .map((p) => ({
      id: p.id,
      name: p.name,
      handle: p.handle,
      tag: "COMPLETE PEN SET",
      application: p.contents || p.categoryLabel || "Research Peptide",
      price: p.price,
      image: p.image || resolveProductImage(p),
      accentColor: p.accentColor,
    }))

  const displayCartridges = sortProductsByPriority(
    sourceProducts.filter((p) => p.format === "refill-cartridge")
  )
    .slice(0, 6)
    .map((c) => ({
      id: c.id,
      name: c.name,
      handle: c.handle,
      type: c.contents || c.categoryLabel || "Refill Cartridge",
      price: c.price,
      image: c.image || resolveProductImage(c),
      accentColor: c.accentColor,
    }))

  return (
    <main className="bg-white text-slate-900 overflow-x-hidden font-sans">
      
      {/* 01. HERO SECTION WITH FULL-WIDTH IMMERSIVE BACKGROUND VIDEO */}
      <section className="relative overflow-hidden h-[calc(100vh-118px)] h-[calc(100dvh-118px)] min-h-[540px] sm:h-auto sm:min-h-[660px] lg:min-h-[720px] xl:min-h-[760px] flex flex-col justify-between lg:block pt-7 xs:pt-8 sm:pt-16 lg:pt-24 xl:pt-28 pb-3 xs:pb-4 sm:pb-10 lg:pb-28 border-b border-[#0f284e] bg-[#051329] text-white">
        {/* Full-Width Cinematic Background Video Canvas with Centering & Vignette Fills */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none flex items-center justify-center">
          {/* Centered Portrait Video Canvas on Mobile, Full Edge-to-Edge Cover on Desktop */}
          <div className="relative w-full aspect-[4/5] sm:aspect-[4/5] max-h-full lg:w-full lg:h-full lg:aspect-auto flex items-center justify-center">
            <video
              ref={videoRef}
              id="peptech-hero-video"
              src="/videos/peptech-system-showcase.mp4"
              poster="/images/system-showcase-poster.webp"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="w-full h-full object-cover object-center opacity-92 sm:opacity-95 transition-opacity duration-700"
            />

            {/* Mobile Video Edge Blender: Anchored directly onto the portrait video bounds to guarantee 100% seamless transition to the background fill */}
            <div
              className="absolute inset-0 lg:hidden pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, #051329 0%, rgba(5,19,41,0.7) 8%, rgba(5,19,41,0) 18%, rgba(5,19,41,0) 82%, rgba(5,19,41,0.7) 92%, #051329 100%)",
              }}
            />
          </div>

          {/* Desktop Scrim: Protects typography readability on left while keeping edge-to-edge video wide, vibrant and clear */}
          <div
            className="absolute inset-0 hidden lg:block pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, rgba(5,19,41,0.86) 0%, rgba(5,19,41,0.58) 40%, rgba(5,19,41,0.18) 64%, rgba(5,19,41,0.38) 100%)",
            }}
          />

          {/* Mobile Hero Top & Bottom Atmospheric Fills: Gently blankets the outer hero spaces so the entire section feels unified */}
          <div
            className="absolute inset-0 lg:hidden pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(5,19,41,0.6) 0%, rgba(5,19,41,0) 15%, rgba(5,19,41,0) 85%, rgba(5,19,41,0.6) 100%)",
            }}
          />
        </div>

        {/* Hero Content Container: Expanded to max-w-[1440px] 2xl:max-w-[1560px] */}
        <div className="relative z-10 w-full max-w-[1440px] 2xl:max-w-[1560px] mx-auto px-4 xs:px-6 sm:px-8 lg:px-12 xl:px-14 flex-1 flex flex-col justify-between lg:block">
          
          {/* Main Hero Content (2-Column Grid on Desktop) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start w-full">
            
            {/* Left Column: Anchored Left & Upper */}
            <div className="lg:col-span-7 xl:col-span-7 flex flex-col items-start">
              <h1 className="text-[28px] xs:text-3xl sm:text-4xl lg:text-[46px] xl:text-[52px] font-extrabold text-white leading-[1.1] tracking-tight uppercase drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] mb-5 xs:mb-6 sm:mb-7 lg:mb-9">
                THE COMPLETE<br className="hidden sm:inline" /> PEPTECH® SYSTEM
              </h1>

              <p className="text-[10px] xs:text-[10.5px] sm:text-[13.5px] lg:text-[15px] text-slate-200 leading-[1.65] sm:leading-relaxed max-w-xl font-normal drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)] tracking-wide mb-1.5 xs:mb-2.5 lg:mb-10">
                <span className="sm:hidden">
                  PEPTECH® delivers premium, ready-to-use kits and reagents designed for precision, consistency, and trusted scientific results.
                </span>
                <span className="hidden sm:inline">
                  PEPTECH® delivers premium, ready-to-use kits and reagents designed for precision, consistency, and trusted scientific results across research disciplines.
                </span>
              </p>

              {/* Desktop Action Buttons: Exactly as Before on Desktop */}
              <div className="hidden lg:flex flex-wrap items-center gap-4 sm:gap-5">
                <Link
                  href="/shop"
                  className="btn-shimmer btn-press px-6 py-3.5 rounded-xl bg-[#16A6A3] hover:bg-[#138e8c] text-white text-[14px] font-bold transition-all shadow-lg shadow-teal-950/40 hover:shadow-cyan-500/25 inline-flex items-center gap-2 group cursor-pointer"
                >
                  <span>Shop All Products</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </Link>

                <Link
                  href="/how-it-works"
                  className="btn-press px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/25 text-[14px] font-semibold transition-all backdrop-blur-xs inline-flex items-center cursor-pointer shadow-md"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Desktop Right Column: In the Right Side, Centered in Middle, Aligned with Subheader */}
            <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 justify-center items-start w-full pt-[95px] lg:pt-[105px] xl:pt-[118px]">
              <HeroScrollingPhrases />
            </div>

          </div>

          {/* Mobile-Only Action Block: Changing Div in the Middle, Buttons at the Bottom ("most bottom"), Middle-Aligned & Compact */}
          <div className="lg:hidden w-full pt-2 xs:pt-3 pb-1 flex flex-col items-center">
            
            {/* Centered Action Group on Mobile */}
            <div className="flex flex-col items-center gap-2.5 xs:gap-3">
              
              {/* Changing Div in the Middle on Mobile */}
              <div className="flex justify-center items-center">
                <HeroScrollingPhrases />
              </div>

              {/* Mobile Buttons at Bottom of that Div (Middle-Aligned, Slightly Reduced Size) */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
                <Link
                  href="/shop"
                  className="btn-shimmer btn-press px-4 sm:px-4.5 py-2.5 rounded-lg sm:rounded-xl bg-[#16A6A3] hover:bg-[#138e8c] text-white text-[12.5px] sm:text-[13px] font-bold transition-all shadow-md shadow-teal-950/40 hover:shadow-cyan-500/25 inline-flex items-center gap-1.5 group cursor-pointer"
                >
                  <span>Shop All Products</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </Link>

                <Link
                  href="/how-it-works"
                  className="btn-press px-4 sm:px-4.5 py-2.5 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/25 text-[12.5px] sm:text-[13px] font-semibold transition-all backdrop-blur-xs inline-flex items-center cursor-pointer shadow-sm"
                >
                  Learn More
                </Link>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 01b. PEPTECH CLINICAL VALUES (White Background Below Video) */}
      <section className="bg-white py-7 sm:py-9 border-b border-[#E2E8F0]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-4 sm:gap-6">
            
            {/* High Accuracy */}
            <div className="flex flex-col items-center text-center gap-2.5">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-teal-50 border border-[#16A6A3]/20 flex items-center justify-center text-[#16A6A3] shadow-xs">
                <svg className="w-5.5 h-5.5 sm:w-6 sm:h-6" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 15C12.7614 15 15 12.7614 15 10C15 7.23858 12.7614 5 10 5C7.23858 5 5 7.23858 5 10C5 12.7614 7.23858 15 10 15Z" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 11.6667C10.9205 11.6667 11.6667 10.9205 11.6667 10C11.6667 9.07953 10.9205 8.33333 10 8.33333C9.07953 8.33333 8.33333 9.07953 8.33333 10C8.33333 10.9205 9.07953 11.6667 10 11.6667Z" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-[13px] sm:text-[14px] font-bold text-[#0B1F3A] leading-tight">
                High Accuracy
              </span>
            </div>

            {/* Fast Results */}
            <div className="flex flex-col items-center text-center gap-2.5">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-cyan-50 border border-[#16A6A3]/20 flex items-center justify-center text-[#16A6A3] shadow-xs">
                <svg className="w-5.5 h-5.5 sm:w-6 sm:h-6" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.8333 1.66667L2.5 11.6667H10L9.16667 18.3333L17.5 8.33333H10L10.8333 1.66667Z" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-[13px] sm:text-[14px] font-bold text-[#0B1F3A] leading-tight">
                Fast Results
              </span>
            </div>

            {/* Easy to Use */}
            <div className="flex flex-col items-center text-center gap-2.5">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-emerald-50 border border-[#16A6A3]/20 flex items-center justify-center text-[#16A6A3] shadow-xs">
                <svg className="w-5.5 h-5.5 sm:w-6 sm:h-6" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 9.16667V5C15 4.55797 14.8244 4.13405 14.5118 3.82149C14.1993 3.50893 13.7754 3.33333 13.3333 3.33333C12.8913 3.33333 12.4674 3.50893 12.1548 3.82149C11.8423 4.13405 11.6667 4.55797 11.6667 5" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M11.6667 8.33333V3.33333C11.6667 2.89131 11.4911 2.46738 11.1785 2.15482C10.8659 1.84226 10.442 1.66667 10 1.66667C9.55797 1.66667 9.13405 1.84226 8.82149 2.15482C8.50893 2.46738 8.33333 2.89131 8.33333 3.33333V5" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8.33333 8.75V5C8.33333 4.55797 8.15774 4.13405 7.84518 3.82149C7.53262 3.50893 7.10869 3.33333 6.66667 3.33333C6.22464 3.33333 5.80072 3.50893 5.48816 3.82149C5.17559 4.13405 5 4.55797 5 5V11.6667" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 6.66667C15 6.22464 15.1756 5.80072 15.4882 5.48816C15.8007 5.17559 16.2246 5 16.6667 5C17.1087 5 17.5326 5.17559 17.8452 5.48816C18.1577 5.80072 18.3333 6.22464 18.3333 6.66667V11.6667C18.3333 13.4348 17.631 15.1305 16.3807 16.3807C15.1305 17.631 13.4348 18.3333 11.6667 18.3333H10C7.66667 18.3333 6.25 17.6167 5.00833 16.3833L2.00833 13.3833C1.72161 13.0658 1.56799 12.6501 1.57927 12.2225C1.59055 11.7948 1.76587 11.3878 2.06893 11.0858C2.372 10.7838 2.77958 10.6099 3.20731 10.6002C3.63504 10.5904 4.05014 10.7455 4.36667 11.0333L5.83333 12.5" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-[13px] sm:text-[14px] font-bold text-[#0B1F3A] leading-tight">
                Easy to Use
              </span>
            </div>

            {/* Reliable & Consistent */}
            <div className="flex flex-col items-center text-center gap-2.5">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-teal-50 border border-[#16A6A3]/20 flex items-center justify-center text-[#16A6A3] shadow-xs">
                <svg className="w-5.5 h-5.5 sm:w-6 sm:h-6" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 18.3333C10 18.3333 16.6667 15 16.6667 10V4.16667L10 1.66667L3.33333 4.16667V10C3.33333 15 10 18.3333 10 18.3333Z" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7.5 10L9.16667 11.6667L12.5 8.33333" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-[13px] sm:text-[14px] font-bold text-[#0B1F3A] leading-tight">
                Reliable &amp; Consistent
              </span>
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
                <img src="/images/figma/icon-trusted-tech.svg" alt="Technology" className="w-5 h-5 sm:w-6 sm:h-6" loading="lazy" decoding="async" />
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
                <img src="/images/figma/icon-wide-menu.svg" alt="Menu" className="w-5 h-5 sm:w-6 sm:h-6" loading="lazy" decoding="async" />
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
                <img src="/images/figma/icon-global-standards.svg" alt="Standards" className="w-5 h-5 sm:w-6 sm:h-6" loading="lazy" decoding="async" />
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
                <img src="/images/figma/icon-dedicated-support.svg" alt="Support" className="w-5 h-5 sm:w-6 sm:h-6" loading="lazy" decoding="async" />
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
              href="/shop"
              className="text-[14px] font-semibold text-[#0B1F3A] hover:text-[#16A6A3] transition-colors inline-flex items-center gap-1.5 shrink-0"
            >
              <span>View All Products</span>
              <span>→</span>
            </Link>
          </div>

          {/* 6 Product Cards Grid */}
          <FeaturedPenSetsGrid products={displayPenSets} isLoading={isLoading} />

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
            <CartridgesGrid cartridges={displayCartridges} isLoading={isLoading} />

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
                    <img src="/images/figma/icon-reusable-pen.svg" alt="Reusable Pen" className="w-full h-full object-contain" loading="lazy" decoding="async" />
                  </div>
                  <p className="font-bold text-[#0b1f3a] text-[13px]">Reusable Pen</p>
                  <div className="text-[#64748b] text-[11px] leading-[15px]">
                    <p className="mb-0">Cost-effective</p>
                    <p>and sustainable</p>
                  </div>
                </div>

                <div className="flex flex-col gap-[8px] items-center text-center">
                  <div className="w-[22px] h-[22px]">
                    <img src="/images/figma/icon-simple-workflow.svg" alt="Simple Workflow" className="w-full h-full object-contain" loading="lazy" decoding="async" />
                  </div>
                  <p className="font-bold text-[#0b1f3a] text-[13px]">Simple Workflow</p>
                  <div className="text-[#64748b] text-[11px] leading-[15px]">
                    <p className="mb-0">Minimal training</p>
                    <p>required</p>
                  </div>
                </div>

                <div className="flex flex-col gap-[8px] items-center text-center">
                  <div className="w-[22px] h-[22px]">
                    <img src="/images/figma/icon-reliable-results.svg" alt="Reliable Results" className="w-full h-full object-contain" loading="lazy" decoding="async" />
                  </div>
                  <p className="font-bold text-[#0b1f3a] text-[13px]">Reliable Results</p>
                  <div className="text-[#64748b] text-[11px] leading-[15px]">
                    <p className="mb-0">Consistent and</p>
                    <p>reproducible</p>
                  </div>
                </div>

                <div className="flex flex-col gap-[8px] items-center text-center">
                  <div className="w-[22px] h-[22px]">
                    <img src="/images/figma/icon-multiple-apps.svg" alt="Multiple Applications" className="w-full h-full object-contain" loading="lazy" decoding="async" />
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
            <Suspense fallback={<Interactive3DPenSkeleton />}>
              <Interactive3DPen />
            </Suspense>
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
            <div className="relative w-full lg:w-[970px] h-[320px] sm:h-[300px] lg:h-[280px] min-h-[280px] overflow-hidden shrink-0">
              <Image
                src="/images/figma/lab-banner-photo.png"
                alt="Laboratory research background"
                fill
                sizes="(max-width: 1024px) 100vw, 970px"
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
                    href="/pen-sets"
                    className="bg-white hover:bg-slate-100 flex gap-[8px] items-center justify-center px-[22px] py-[12px] rounded-[6px] text-[#0b1f3a] text-[13px] font-semibold transition-colors shadow-sm"
                  >
                    <span>Get Started</span>
                    <img src="/images/figma/icon-arrow.svg" alt="" className="w-4 h-4" loading="lazy" decoding="async" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right / Bottom Solid Value Block */}
            <div className="bg-[#001845] lg:bg-[#001f54] border-t lg:border-t-0 lg:border-l border-[#0b2b6b] flex flex-col justify-center px-4 sm:px-8 py-5 sm:py-6 lg:py-[44px] lg:px-[32px] w-full lg:w-[270px] h-auto lg:h-[280px] shrink-0">
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 lg:gap-[18px]">
                <div className="bg-white/[0.05] lg:bg-transparent p-3.5 sm:p-4 lg:p-0 rounded-xl border border-white/[0.08] lg:border-none flex flex-col sm:flex-row lg:flex-row items-start gap-2.5 sm:gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#00C5A0]/15 border border-[#00C5A0]/30 flex items-center justify-center shrink-0">
                    <img src="/images/figma/icon-banner-shield.svg" alt="Shield" className="w-[18px] h-[18px]" loading="lazy" decoding="async" />
                  </div>
                  <div>
                    <div className="font-bold text-[13px] sm:text-[14px] text-white leading-[18px] sm:leading-[20px]">
                      <p className="mb-0">Accurate.</p>
                      <p className="mb-0">Reliable.</p>
                      <p className="text-[#00d2ff]">Everywhere.</p>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:block bg-[#00d2ff] h-[2px] w-[44px]" />

                <div className="bg-white/[0.05] lg:bg-transparent p-3.5 sm:p-4 lg:p-0 rounded-xl border border-white/[0.08] lg:border-none flex flex-col sm:flex-row lg:flex-row items-start gap-2.5 sm:gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#00C5A0]/15 border border-[#00C5A0]/30 flex items-center justify-center shrink-0">
                    <img src="/images/figma/icon-banner-target.svg" alt="Target" className="w-[18px] h-[18px]" loading="lazy" decoding="async" />
                  </div>
                  <div>
                    <div className="font-bold text-[13px] sm:text-[14px] text-white leading-[18px] sm:leading-[20px]">
                      <p className="mb-0">Small Testing.</p>
                    </div>
                    <p className="text-[#94a3b8] text-[12px] sm:text-[13px] font-medium leading-[16px] sm:leading-[18px] mt-0.5">
                      A Bigger Tomorrow.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
