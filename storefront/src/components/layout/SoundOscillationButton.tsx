"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { useSound } from "@/context/SoundContext"

export function SoundOscillationButton() {
  const { isMuted, volume, toggleMute, isAudioAvailable } = useSound()
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  // Only display when audio is available (or on homepage where hero video lives)
  if (!isAudioAvailable && !isHomePage) {
    return null
  }

  const isAudioActive = !isMuted && volume > 0

  return (
    <div className="relative flex items-center">
      {/* Sound Wave Indicator Button (Matches Theme & Design Reference) */}
      <button
        type="button"
        onClick={toggleMute}
        aria-label={isAudioActive ? "Audio ON - Click to Mute" : "Audio OFF - Click to Turn On"}
        title={isAudioActive ? "Audio ON - Click to Mute" : "Audio OFF - Click to Turn On"}
        className={`group relative px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg flex flex-col items-center justify-center gap-[2px] cursor-pointer transition-all duration-200 active:scale-95 select-none ${
          isAudioActive
            ? "hover:bg-[#16A6A3]/10"
            : "hover:bg-slate-100"
        }`}
      >
        {/* Oscillating Wave Line Container */}
        <div className="w-[38px] sm:w-[42px] h-[13px] overflow-hidden relative flex items-center justify-center">
          {/* Subtle Harmonic Wave Layer (Depth & Clinical Realism) */}
          {isAudioActive && (
            <svg
              className="w-[84px] h-[13px] absolute left-0 animate-audio-wave-harmonic opacity-40 pointer-events-none"
              viewBox="0 0 84 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 0 6.5 Q 6 1.5, 12 6.5 T 24 6.5 T 36 6.5 T 48 6.5 T 60 6.5 T 72 6.5 T 84 6.5"
                stroke="#16A6A3"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}

          {/* Primary Oscillating Wave */}
          <svg
            className={`w-[84px] h-[13px] absolute left-0 ${
              isAudioActive ? "animate-audio-wave-oscillate" : ""
            }`}
            viewBox="0 0 84 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 0 6.5 Q 6 1.5, 12 6.5 T 24 6.5 T 36 6.5 T 48 6.5 T 60 6.5 T 72 6.5 T 84 6.5"
              stroke={isAudioActive ? "#00C5A0" : "#94A3B8"}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Audio Status Label: "Audio ON" / "Audio OFF" */}
        <div
          className={`text-[10px] sm:text-[10.5px] tracking-tight leading-none transition-colors ${
            isAudioActive ? "text-[#00C5A0]" : "text-[#64748B]"
          }`}
        >
          <span className="font-medium">Audio </span>
          <span className="font-extrabold">{isAudioActive ? "ON" : "OFF"}</span>
        </div>
      </button>
    </div>
  )
}
