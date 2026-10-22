"use client"

import React, { useState, useRef, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useSound } from "@/context/SoundContext"

export function SoundOscillationButton() {
  const { isMuted, volume, isPlaying, isAudioAvailable, toggleMute, setVolume } = useSound()
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  const [isHovered, setIsHovered] = useState(false)
  const [isMobileSliderOpen, setIsMobileSliderOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Dismiss mobile slider on outside tap
  useEffect(() => {
    if (!isMobileSliderOpen) return
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsMobileSliderOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside, { passive: true })
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [isMobileSliderOpen])

  // Mouse hover enter with debounce
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    setIsHovered(true)
  }

  // Mouse hover leave with slight delay to prevent flickering
  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false)
    }, 280)
  }

  // Handle main button click (mute/unmute + mobile slider toggle)
  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleMute()
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsMobileSliderOpen((prev) => !prev)
    }
  }

  // Only display when audio is available (or on homepage where hero video lives)
  if (!isAudioAvailable && !isHomePage) {
    return null
  }

  const showSlider = isHovered || isMobileSliderOpen
  const isOscillating = !isMuted && volume > 0

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative flex items-center"
    >
      {/* Sound Oscillation & Mute Toggle Button */}
      <button
        type="button"
        onClick={handleButtonClick}
        aria-label={isMuted ? "Unmute system sound" : "Mute system sound"}
        title={isMuted ? "Click to Unmute Sound" : "Click to Mute Sound (Hover for Volume)"}
        className={`group relative w-[36px] h-[36px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 active:scale-90 ${
          !isMuted && volume > 0
            ? "bg-[#16A6A3]/10 text-[#16A6A3] ring-1 ring-[#16A6A3]/30 hover:bg-[#16A6A3]/20 shadow-xs"
            : "hover:bg-slate-100 text-slate-500 hover:text-slate-800"
        }`}
      >
        {isMuted || volume === 0 ? (
          /* Muted Icon: Speaker with strike-through slash */
          <div className="relative flex items-center justify-center w-5 h-5">
            <svg
              className="w-4.5 h-4.5 text-slate-500 transition-colors group-hover:text-slate-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          </div>
        ) : (
          /* Sound Oscillation Equalizer Bars (Live Animated Waveform) */
          <div className="flex items-center justify-center gap-[2.5px] h-[16px] w-[18px]">
            <span
              className={`w-[2.5px] h-[14px] rounded-full bg-[#16A6A3] transition-all ${
                isOscillating ? "sound-bar-anim-1" : "scale-y-[0.3]"
              }`}
            />
            <span
              className={`w-[2.5px] h-[14px] rounded-full bg-[#00C5A0] transition-all ${
                isOscillating ? "sound-bar-anim-2" : "scale-y-[0.5]"
              }`}
            />
            <span
              className={`w-[2.5px] h-[14px] rounded-full bg-[#16A6A3] transition-all ${
                isOscillating ? "sound-bar-anim-3" : "scale-y-[0.3]"
              }`}
            />
            <span
              className={`w-[2.5px] h-[14px] rounded-full bg-[#00C5A0] transition-all ${
                isOscillating ? "sound-bar-anim-4" : "scale-y-[0.2]"
              }`}
            />
          </div>
        )}
      </button>

      {/* Floating Sound Level Slider Bar */}
      <div
        className={`absolute z-50 transition-all duration-200 ease-out ${
          showSlider
            ? "opacity-100 translate-y-0 pointer-events-auto scale-100"
            : "opacity-0 -translate-y-1.5 pointer-events-none scale-95"
        }
        /* Desktop: Floats to the left of the button */
        md:right-full md:mr-2.5 md:top-1/2 md:-translate-y-1/2
        /* Mobile: Floats right below the button, centered to prevent screen overflow */
        top-full mt-2.5 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0
        `}
      >
        <div className="flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-900/10 min-w-[168px] sm:min-w-[185px]">
          {/* Mute / Unmute Quick Toggle Icon inside the bar */}
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
            className="text-[#16A6A3] hover:text-[#0b1f3a] transition-colors p-0.5 shrink-0 cursor-pointer"
          >
            {isMuted || volume === 0 ? (
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 text-[#16A6A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>

          {/* Interactive Volume Slider */}
          <div className="relative flex-1 flex items-center">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              aria-label="Sound Volume Slider"
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#16A6A3] focus:outline-hidden touch-none"
              style={{
                background: `linear-gradient(to right, #16A6A3 0%, #00C5A0 ${
                  isMuted ? 0 : volume * 100
                }%, #E2E8F0 ${isMuted ? 0 : volume * 100}%, #E2E8F0 100%)`,
              }}
            />
          </div>

          {/* Percentage Indicator */}
          <span className="text-[11px] font-bold text-slate-700 w-8 text-right font-mono tabular-nums shrink-0 select-none">
            {isMuted ? "0%" : `${Math.round(volume * 100)}%`}
          </span>
        </div>
      </div>
    </div>
  )
}

