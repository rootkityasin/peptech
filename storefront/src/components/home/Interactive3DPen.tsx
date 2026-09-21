"use client"

import React, { useState, useEffect } from "react"
import dynamic from "next/dynamic"

// Dynamically import Three.js 3D WebGL Canvas without SSR
const Pen3DCanvas = dynamic(
  () => import("./Pen3DCanvas").then((mod) => mod.Pen3DCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[140px] sm:h-[170px] flex items-center justify-center">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-[#D2DFED] text-xs font-medium text-[#0B1F3A] shadow-xs">
          <svg
            className="w-3.5 h-3.5 text-[#16A6A3] animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" strokeDasharray="30" strokeDashoffset="10" />
          </svg>
          <span>Loading 3D WebGL Engine...</span>
        </div>
      </div>
    ),
  }
)

export function Interactive3DPen() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div id="peptech-3d-pen-section" className="w-full flex flex-col items-center select-none">
      {/* Stage Container */}
      <div className="w-full max-w-[1040px] relative flex items-center justify-center">
        {/* Soft Ambient Radial Backlight */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
          <div className="w-[75%] h-[80px] sm:h-[100px] bg-gradient-to-r from-transparent via-[#16A6A3]/20 to-transparent blur-3xl rounded-full" />
        </div>

        {/* 3D WebGL Mesh Centerpiece */}
        <div className="w-full relative flex flex-col items-center">
          {isMounted && (
            <Pen3DCanvas
              autoRotate={true}
              className="h-[130px] sm:h-[150px]"
            />
          )}

          {/* 3D Model Dynamic Ground Shadow right under the pen body */}
          <div className="w-[56%] max-w-[580px] h-[10px] sm:h-[12px] -mt-[46px] sm:-mt-[54px] rounded-full bg-[#0B1F3A]/22 blur-md pointer-events-none mb-1 sm:mb-2" />
        </div>
      </div>
    </div>
  )
}
