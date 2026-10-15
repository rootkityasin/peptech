import React from "react"

/**
 * PEPTECH® Clinical-Grade Skeleton Fallbacks for React Suspense
 * Matching Navy (#0B1F3A) and Teal (#16A6A3) design language.
 */

export function AccountSkeleton() {
  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 px-4 sm:px-6 lg:px-8 font-sans animate-pulse">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-slate-200/80 shrink-0" />
            <div className="space-y-2">
              <div className="h-5 w-44 bg-slate-200 rounded-md" />
              <div className="h-3.5 w-60 bg-slate-100 rounded-md" />
            </div>
          </div>
          <div className="h-8 w-28 bg-[#16A6A3]/15 rounded-full" />
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <div className="h-9 w-24 bg-slate-200 rounded-xl shrink-0" />
          <div className="h-9 w-28 bg-slate-100 rounded-xl shrink-0" />
          <div className="h-9 w-32 bg-slate-100 rounded-xl shrink-0" />
          <div className="h-9 w-28 bg-slate-100 rounded-xl shrink-0" />
          <div className="h-9 w-24 bg-slate-100 rounded-xl shrink-0" />
        </div>

        {/* 3 Stats Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-5 space-y-2">
              <div className="h-3.5 w-28 bg-slate-100 rounded" />
              <div className="h-7 w-20 bg-slate-200 rounded" />
              <div className="h-3 w-36 bg-slate-100 rounded" />
            </div>
          ))}
        </div>

        {/* Main Content Skeleton (e.g. Orders / Subscriptions Table) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="h-5 w-36 bg-slate-200 rounded" />
            <div className="h-8 w-24 bg-slate-100 rounded-lg" />
          </div>
          <div className="space-y-3 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-200 shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-32 bg-slate-200 rounded" />
                    <div className="h-3 w-48 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="h-4 w-16 bg-slate-200 rounded" />
                  <div className="h-7 w-20 bg-slate-200 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export function CatalogSkeleton({ category = "all" }: { category?: string }) {
  return (
    <div className="min-h-screen bg-[#F4F7FA] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans animate-pulse">
      <div className="max-w-[1240px] mx-auto space-y-8">
        
        {/* Catalog Banner Skeleton */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="h-3.5 w-32 bg-[#16A6A3]/25 rounded" />
          <div className="h-8 w-72 bg-slate-200 rounded-lg" />
          <div className="h-4 w-96 max-w-full bg-slate-100 rounded" />

          {/* Search & Tabs Row */}
          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-slate-100">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <div className="h-9 w-20 bg-slate-200 rounded-xl shrink-0" />
              <div className="h-9 w-36 bg-slate-100 rounded-xl shrink-0" />
              <div className="h-9 w-32 bg-slate-100 rounded-xl shrink-0" />
              <div className="h-9 w-36 bg-slate-100 rounded-xl shrink-0" />
            </div>
            <div className="h-10 w-full sm:w-64 bg-slate-100 rounded-xl" />
          </div>
        </div>

        {/* 8 Product Cards Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex flex-col justify-between h-[380px] shadow-xs"
            >
              <div className="h-[180px] w-full bg-[#f8fafc] rounded-lg mb-3 flex items-center justify-center">
                <div className="w-16 h-28 bg-slate-200/60 rounded-md" />
              </div>
              <div className="space-y-2 text-center my-auto">
                <div className="h-4 w-3/4 bg-slate-200 rounded mx-auto" />
                <div className="h-3 w-1/2 bg-slate-100 rounded mx-auto" />
                <div className="h-4 w-20 bg-slate-200 rounded mx-auto pt-1" />
              </div>
              <div className="h-9 w-full bg-slate-200 rounded-lg mt-3" />
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export function CheckoutSkeleton() {
  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans animate-pulse">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Breadcrumb / Title */}
        <div className="space-y-2">
          <div className="h-3.5 w-28 bg-[#16A6A3]/20 rounded" />
          <div className="h-7 w-56 bg-slate-200 rounded-lg" />
        </div>

        {/* 2-Column Funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (Forms) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Customer Details Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="h-5 w-40 bg-slate-200 rounded" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-10 bg-slate-100 rounded-lg" />
                <div className="h-10 bg-slate-100 rounded-lg" />
              </div>
              <div className="h-10 bg-slate-100 rounded-lg" />
            </div>

            {/* Delivery Destination Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="h-5 w-44 bg-slate-200 rounded" />
              <div className="h-10 bg-slate-100 rounded-lg" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-10 bg-slate-100 rounded-lg" />
                <div className="h-10 bg-slate-100 rounded-lg" />
              </div>
            </div>

            {/* Shipping Method Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
              <div className="h-5 w-36 bg-slate-200 rounded" />
              <div className="h-12 bg-slate-100 rounded-xl" />
              <div className="h-12 bg-slate-100 rounded-xl" />
            </div>
          </div>

          {/* Right Column (Order Summary) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
            <div className="h-5 w-36 bg-slate-200 rounded" />
            
            {/* Item rows */}
            <div className="space-y-3 pb-4 border-b border-slate-100">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 w-3/4 bg-slate-200 rounded" />
                    <div className="h-3 w-1/2 bg-slate-100 rounded" />
                  </div>
                  <div className="h-4 w-12 bg-slate-200 rounded" />
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2.5 pb-4 border-b border-slate-100">
              <div className="flex justify-between">
                <div className="h-3.5 w-20 bg-slate-100 rounded" />
                <div className="h-3.5 w-14 bg-slate-100 rounded" />
              </div>
              <div className="flex justify-between">
                <div className="h-3.5 w-24 bg-slate-100 rounded" />
                <div className="h-3.5 w-16 bg-slate-100 rounded" />
              </div>
              <div className="flex justify-between pt-2">
                <div className="h-5 w-28 bg-slate-200 rounded" />
                <div className="h-5 w-20 bg-slate-200 rounded" />
              </div>
            </div>

            {/* CTA Button */}
            <div className="h-12 w-full bg-slate-300 rounded-xl" />
          </div>

        </div>

      </div>
    </div>
  )
}

export function ReceiptSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 font-sans flex items-center justify-center animate-pulse">
      <div className="max-w-2xl w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="h-6 w-32 bg-slate-200 rounded" />
            <div className="h-3.5 w-48 bg-slate-100 rounded" />
          </div>
          <div className="h-7 w-28 bg-[#16A6A3]/20 rounded-full" />
        </div>

        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="space-y-1.5">
            <div className="h-3 w-20 bg-slate-100 rounded" />
            <div className="h-4 w-36 bg-slate-200 rounded" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-20 bg-slate-100 rounded" />
            <div className="h-4 w-28 bg-slate-200 rounded" />
          </div>
        </div>

        <div className="space-y-3 py-4 border-y border-slate-100">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-4 w-48 bg-slate-200 rounded" />
              <div className="h-4 w-16 bg-slate-200 rounded" />
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-2">
          <div className="h-5 w-28 bg-slate-200 rounded" />
          <div className="h-6 w-24 bg-slate-300 rounded" />
        </div>
      </div>
    </div>
  )
}

export function VerifySkeleton() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 font-sans flex items-center justify-center animate-pulse">
      <div className="max-w-xl w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#16A6A3]/15 mx-auto" />
        <div className="space-y-2">
          <div className="h-6 w-48 bg-slate-200 rounded mx-auto" />
          <div className="h-3.5 w-72 max-w-full bg-slate-100 rounded mx-auto" />
        </div>
        <div className="h-12 w-full bg-slate-100 rounded-xl" />
        <div className="h-11 w-full bg-[#0B1F3A]/20 rounded-xl" />
      </div>
    </div>
  )
}

export function CartSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans animate-pulse">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="space-y-2">
          <div className="h-4 w-28 bg-[#16A6A3]/20 rounded" />
          <div className="h-7 w-48 bg-slate-200 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-4 border-b border-slate-100 last:border-none">
                <div className="w-16 h-16 bg-slate-100 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/2 bg-slate-200 rounded" />
                  <div className="h-3 w-1/3 bg-slate-100 rounded" />
                </div>
                <div className="h-5 w-16 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="h-5 w-32 bg-slate-200 rounded" />
            <div className="space-y-2 py-3 border-y border-slate-100">
              <div className="h-3.5 w-full bg-slate-100 rounded" />
              <div className="h-3.5 w-full bg-slate-100 rounded" />
            </div>
            <div className="h-11 w-full bg-slate-300 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

