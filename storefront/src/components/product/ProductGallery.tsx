"use client"

import React, { useState } from "react"
import Image from "next/image"

interface ProductGalleryProps {
  images?: string[]
  title?: string
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const validImages = (images || [])
    .filter(Boolean)
    .filter((img) => !img.includes("cartridge.webp") && !img.includes("mockup2.webp"))
  const displayImages =
    validImages.length > 0
      ? Array.from(new Set(validImages))
      : ["/images/products/placeholder.png"]
  const [activeIndex, setActiveIndex] = useState(0)

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="flex flex-col gap-[16px] items-start w-full max-w-[580px]">
      {/* Main Image Box */}
      <div className="bg-gradient-to-b from-[#fbfcfe] via-white to-[#f4f7fb] border border-[#e2e8f0] h-[340px] xs:h-[400px] sm:h-[450px] lg:h-[480px] min-h-[320px] overflow-hidden relative rounded-[16px] w-full flex items-center justify-center shadow-xs group">
        {/* Ambient blurred backdrop matching the image color tones for seamless blending */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          <Image
            src={displayImages[activeIndex]}
            alt=""
            fill
            sizes="120px"
            className="object-cover scale-150 blur-3xl opacity-20 filter"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-transparent to-white/70" />
        </div>

        {/* Foreground Product Image (Fitted cleanly without cutting original edges) */}
        <div className="relative w-full h-full p-4 sm:p-6 z-1 flex items-center justify-center">
          <Image
            src={displayImages[activeIndex]}
            alt={title || "PEPTECH® Precision Research"}
            fill
            sizes="(max-width: 768px) 100vw, 580px"
            className="object-contain transition-transform duration-500 group-hover:scale-105"
            priority
            loading="eager"
          />
        </div>

        {/* Prev & Next Buttons (Only if multiple images) */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              type="button"
              aria-label="Previous Image"
              className="absolute bg-white/90 backdrop-blur-xs border border-[#e2e8f0] flex items-center justify-center left-[15px] rounded-full size-[36px] top-1/2 -translate-y-1/2 hover:bg-white transition-colors cursor-pointer shadow-sm z-10"
            >
              <img src="/images/figma/4dfb2f4b53f3415909efe7e80dddcf2a15e5c197.svg" alt="Previous" className="size-[16px]" />
            </button>
            <button
              onClick={handleNext}
              type="button"
              aria-label="Next Image"
              className="absolute bg-white/90 backdrop-blur-xs border border-[#e2e8f0] flex items-center justify-center right-[15px] rounded-full size-[36px] top-1/2 -translate-y-1/2 hover:bg-white transition-colors cursor-pointer shadow-sm z-10"
            >
              <img src="/images/figma/95de1cd2974339673dc3948d0a6a252ac00ba2f8.svg" alt="Next" className="size-[16px]" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row (Only if multiple images) */}
      {displayImages.length > 1 && (
        <div
          className={`grid gap-2 sm:gap-3 w-full ${
            displayImages.length === 2
              ? "grid-cols-2"
              : displayImages.length === 3
              ? "grid-cols-3"
              : displayImages.length === 4
              ? "grid-cols-4"
              : displayImages.length === 5
              ? "grid-cols-5"
              : "grid-cols-6"
          }`}
        >
          {displayImages.slice(0, 6).map((img, idx) => (
            <button
              key={img + idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`bg-gradient-to-b from-white to-[#f8fafc] flex h-[64px] sm:h-[74px] items-center justify-center overflow-hidden relative rounded-[8px] cursor-pointer transition-all ${
                activeIndex === idx
                  ? "border-2 border-[#16a6a3] shadow-xs"
                  : "border border-[#e2e8f0] hover:border-slate-300 opacity-80 hover:opacity-100"
              }`}
            >
              <div className="relative size-full p-1.5">
                <Image
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  sizes="(max-width: 640px) 16vw, 80px"
                  className="object-contain"
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
