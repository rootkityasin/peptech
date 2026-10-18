"use client"

import React, { useState } from "react"
import Image from "next/image"
import { resolveProductImage } from "@/lib/product-images"

interface ProductGalleryProps {
  images?: string[]
  title?: string
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const validImages = (images || [])
    .filter(Boolean)
    .filter((img) => !img.includes("cartridge.webp") && !img.includes("mockup2.webp") && !img.includes("placeholder.png"))
  const cleanedImages = validImages.map((img) => resolveProductImage(img))
  const displayImages =
    cleanedImages.length > 0
      ? Array.from(new Set(cleanedImages))
      : [resolveProductImage({ title })]
  const [activeIndex, setActiveIndex] = useState(0)

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="flex flex-col gap-[16px] items-start w-full max-w-[580px]">
      {/* Main Image Box - 1:1 Aspect Ratio (580x580 on desktop, 100vw on mobile, 100% fill) */}
      <div className="w-full aspect-square relative rounded-[16px] overflow-hidden border border-[#e2e8f0] bg-white shadow-xs group flex items-center justify-center">
        <Image
          src={displayImages[activeIndex]}
          alt={title || "PEPTECH® Precision Research"}
          fill
          sizes="(max-width: 768px) 100vw, 580px"
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          priority
          loading="eager"
        />

        {/* Prev & Next Buttons (Only if multiple images) */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              type="button"
              aria-label="Previous Image"
              className="absolute bg-white/90 backdrop-blur-xs border border-[#e2e8f0] flex items-center justify-center left-[15px] rounded-full size-[36px] top-1/2 -translate-y-1/2 hover:bg-white transition-colors cursor-pointer shadow-sm z-20"
            >
              <img src="/images/figma/4dfb2f4b53f3415909efe7e80dddcf2a15e5c197.svg" alt="Previous" className="size-[16px]" />
            </button>
            <button
              onClick={handleNext}
              type="button"
              aria-label="Next Image"
              className="absolute bg-white/90 backdrop-blur-xs border border-[#e2e8f0] flex items-center justify-center right-[15px] rounded-full size-[36px] top-1/2 -translate-y-1/2 hover:bg-white transition-colors cursor-pointer shadow-sm z-20"
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
              className={`aspect-square bg-white flex items-center justify-center overflow-hidden relative rounded-[10px] cursor-pointer transition-all ${
                activeIndex === idx
                  ? "border-2 border-[#16a6a3] shadow-xs"
                  : "border border-[#e2e8f0] hover:border-slate-300 opacity-80 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                fill
                sizes="(max-width: 640px) 16vw, 80px"
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
