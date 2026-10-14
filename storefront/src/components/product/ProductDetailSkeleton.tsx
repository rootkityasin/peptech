"use client"

import React from "react"

export function ProductDetailSkeleton() {
  return (
    <div className="bg-white min-h-screen text-slate-900 animate-pulse" role="status" aria-label="Loading product details">
      {/* Breadcrumbs Skeleton */}
      <div className="bg-white flex items-center justify-center py-[18px] w-full border-b border-[#e2e8f0]">
        <div className="max-w-[1240px] w-full px-4 sm:px-6">
          <div className="h-4 w-64 bg-slate-200 rounded-md" />
        </div>
      </div>

      {/* Main Showcase Skeleton */}
      <section className="bg-white flex flex-col items-center justify-center pb-[48px] pt-[24px] w-full">
        <div className="flex flex-col lg:flex-row items-start justify-between max-w-[1240px] w-full px-4 sm:px-6 gap-[40px] lg:gap-[60px]">
          
          {/* Left: Gallery Skeleton */}
          <div className="w-full lg:w-[580px] shrink-0">
            <div className="w-full aspect-square bg-slate-100 rounded-2xl border border-slate-200/60" />
            <div className="flex gap-3 mt-4">
              <div className="w-16 h-16 bg-slate-100 rounded-xl border border-slate-200/60" />
              <div className="w-16 h-16 bg-slate-100 rounded-xl border border-slate-200/60" />
              <div className="w-16 h-16 bg-slate-100 rounded-xl border border-slate-200/60" />
            </div>
          </div>

          {/* Right: Buy Box Skeleton */}
          <div className="w-full lg:w-[600px] shrink-0 space-y-5">
            {/* Format Pills */}
            <div className="flex gap-2">
              <div className="h-9 w-32 bg-slate-200 rounded-lg" />
              <div className="h-9 w-32 bg-slate-100 rounded-lg" />
              <div className="h-9 w-32 bg-slate-100 rounded-lg" />
            </div>

            {/* Product Title & Strength */}
            <div className="space-y-2 pt-2">
              <div className="h-8 w-4/5 bg-slate-200 rounded-md" />
              <div className="h-5 w-1/2 bg-slate-100 rounded-md" />
            </div>

            {/* Price Pill */}
            <div className="h-10 w-28 bg-slate-200 rounded-xl" />

            {/* Purchase Options Card */}
            <div className="h-28 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
              <div className="h-4 w-1/3 bg-slate-200 rounded" />
              <div className="h-4 w-2/3 bg-slate-100 rounded" />
            </div>

            {/* CTA Button */}
            <div className="h-14 w-full bg-slate-300 rounded-xl" />

            {/* Quick Guarantees */}
            <div className="h-8 w-3/4 bg-slate-100 rounded-md" />
          </div>

        </div>
      </section>

      {/* Specs Grid Skeleton */}
      <section className="bg-slate-50/50 py-12 border-t border-[#e2e8f0]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="h-6 w-48 bg-slate-200 rounded mx-auto mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-96 bg-white rounded-2xl border border-slate-200/80" />
            <div className="h-96 bg-white rounded-2xl border border-slate-200/80" />
            <div className="h-96 bg-white rounded-2xl border border-slate-200/80" />
          </div>
        </div>
      </section>
    </div>
  )
}
