"use client"

import React, { useState } from "react"
import Image from "next/image"

interface ProductGalleryProps {
  images: string[]
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="space-y-4">
      {/* Main Showcase Image */}
      <div className="relative w-full aspect-square sm:aspect-4/3 rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm flex items-center justify-center p-4">
        <Image
          src={images[activeIndex] || images[0]}
          alt="PEPTECH Pen System"
          fill
          className="object-contain p-4 transition-all duration-300"
          priority
        />

        {/* Carousel Arrow Controls (from Mockup 2) */}
        <button
          onClick={handlePrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-white hover:shadow-md transition-all cursor-pointer"
          aria-label="Previous Image"
        >
          ‹
        </button>
        <button
          onClick={handleNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-white hover:shadow-md transition-all cursor-pointer"
          aria-label="Next Image"
        >
          ›
        </button>
      </div>

      {/* 4 Thumbnails Row */}
      <div className="grid grid-cols-5 gap-3">
        {images.slice(0, 5).map((img, idx) => (
          <button
            key={img + idx}
            onClick={() => setActiveIndex(idx)}
            className={`relative aspect-square rounded-xl bg-white border-2 overflow-hidden transition-all p-1 cursor-pointer ${
              activeIndex === idx
                ? "border-[#0B1F3A] ring-2 ring-[#0B1F3A]/10 shadow-xs"
                : "border-slate-200 hover:border-slate-300 opacity-75 hover:opacity-100"
            }`}
          >
            <Image
              src={img}
              alt={`Thumbnail ${idx + 1}`}
              fill
              className="object-contain p-1"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
