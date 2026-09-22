"use client"

import React, { useState } from "react"
import Image from "next/image"

interface ProductGalleryProps {
  images?: string[]
}

const DEFAULT_GALLERY_IMAGES = [
  "/images/figma/2fc8ae919de84fe5269092b52f019438e68ce3c8.png", // Main pen set packaging
  "/images/figma/6c45f3de1f0106a2749cbba78c5dfd998544baeb.png", // Pen angled with cartridge
  "/images/figma/e52a6d3cac1aaae7fca44b96749f223772cf90a4.png", // Pen presentation close-up
  "/images/figma/6ae689249c306b3f6b31d8744c7c961d01964ca0.png", // Cartridge clear detail
  "/images/figma/c99c3796c997feceff8871b362c4b941211ea971.png", // Accessories kit
  "/images/figma/hero-presentation-box.png", // Full box showcase
]

export function ProductGallery({ images }: ProductGalleryProps) {
  const displayImages = images && images.length > 0 ? images : DEFAULT_GALLERY_IMAGES
  const [activeIndex, setActiveIndex] = useState(0)

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="flex flex-col gap-[16px] items-start w-full max-w-[580px]">
      {/* Main Image Box - Figma Node 8:41075 */}
      <div className="bg-[#f4f8fb] border border-[#e2e8f0] h-[440px] sm:h-[520px] overflow-hidden relative rounded-[16px] w-full flex items-center justify-center">
        <div className="relative w-full h-full p-6">
          <Image
            src={displayImages[activeIndex]}
            alt="PEPTECH® Complete Pen Set"
            fill
            className="object-contain p-4 transition-all duration-300"
            priority
          />
        </div>

        {/* Prev & Next Buttons (Only if multiple images) */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              type="button"
              aria-label="Previous Image"
              className="absolute bg-white border border-[#e2e8f0] flex items-center justify-center left-[15px] rounded-full size-[36px] top-1/2 -translate-y-1/2 hover:bg-slate-50 transition-colors cursor-pointer shadow-xs z-10"
            >
              <img src="/images/figma/4dfb2f4b53f3415909efe7e80dddcf2a15e5c197.svg" alt="Previous" className="size-[16px]" />
            </button>
            <button
              onClick={handleNext}
              type="button"
              aria-label="Next Image"
              className="absolute bg-white border border-[#e2e8f0] flex items-center justify-center right-[15px] rounded-full size-[36px] top-1/2 -translate-y-1/2 hover:bg-slate-50 transition-colors cursor-pointer shadow-xs z-10"
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
              className={`bg-white flex h-[64px] sm:h-[74px] items-center justify-center overflow-hidden relative rounded-[8px] cursor-pointer transition-all p-1 ${
                activeIndex === idx
                  ? "border-2 border-[#16a6a3] shadow-xs"
                  : "border border-[#e2e8f0] hover:border-slate-300 opacity-80 hover:opacity-100"
              }`}
            >
              <div className="relative size-full">
                <Image
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
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
