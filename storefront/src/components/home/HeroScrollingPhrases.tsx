"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"

const PHRASES = [
  "One reusable pen.",
  "Multiple cartridges.",
  "Accurate.",
  "Reliable.",
  "Convenient.",
]

// Repeat 4 sets for infinite seamless physical translation
const REPEATED = [...PHRASES, ...PHRASES, ...PHRASES, ...PHRASES]

const ROW_HEIGHT = 42 // 42px per row
const INITIAL_INDEX = 5 // Set 2, item 0 ("One reusable pen.")

export function HeroScrollingPhrases() {
  const [index, setIndex] = useState(INITIAL_INDEX)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const resetLockRef = useRef(false)

  const nextPhrase = useCallback(() => {
    setIsTransitioning(true)
    setIndex((prev) => prev + 1)
  }, [])

  // Auto-scroll interval: 3.6s per item allows comfortable reading without rushing
  useEffect(() => {
    if (isHovered) return

    const timer = setInterval(() => {
      nextPhrase()
    }, 3600)

    return () => clearInterval(timer)
  }, [isHovered, nextPhrase])

  // Seamless silent loop reset when reaching Set 4 (zero jump, zero flicker)
  const handleTransitionEnd = () => {
    if (index >= 15 && !resetLockRef.current) {
      resetLockRef.current = true
      setIsTransitioning(false)
      setIndex(index - 10) // Rewind by exactly 2 full sets (10 items)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resetLockRef.current = false
        })
      })
    }
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full max-w-[200px] xs:max-w-[220px] sm:max-w-[260px] flex flex-col items-center select-none [--row-h:36px] sm:[--row-h:42px]"
    >
      {/* 1. Center Pill Bar (Glassmorphism like Learn More button, Borderless) */}
      <div
        onClick={nextPhrase}
        title="Click to scroll"
        className="absolute top-[var(--row-h)] z-0 h-[var(--row-h)] w-[140px] xs:w-[155px] sm:w-[195px] rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md shadow-md cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
      />

      {/* 2. Scrolling Viewport: Exactly 3 rows of var(--row-h) */}
      <div
        className="relative z-10 w-full h-[calc(var(--row-h)*3)] overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)",
        }}
      >
        {/* Continuous Physical Upward Track: Smoothly glides from bottom into middle div with ZERO fading and ZERO flickering */}
        <div
          onTransitionEnd={handleTransitionEnd}
          style={{
            transform: `translate3d(0, calc(-1 * var(--row-h) * ${index - 1}), 0)`,
            transition: isTransitioning
              ? "transform 650ms cubic-bezier(0.16, 1, 0.3, 1)"
              : "none",
          }}
          className="will-change-transform"
        >
          {REPEATED.map((phrase, idx) => {
            const isCenter = idx === index
            return (
              <div
                key={idx}
                style={{ height: "var(--row-h)" }}
                onClick={nextPhrase}
                className="flex items-center justify-center text-center cursor-pointer px-2"
              >
                <span
                  className={`transition-colors duration-500 tracking-tight leading-none text-center whitespace-nowrap ${
                    isCenter
                      ? "text-[11.5px] xs:text-[12.5px] sm:text-[14px] font-bold text-white opacity-100"
                      : "text-[9.5px] xs:text-[10.5px] sm:text-[12px] font-medium text-slate-400/55 opacity-60"
                  }`}
                >
                  {phrase}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
