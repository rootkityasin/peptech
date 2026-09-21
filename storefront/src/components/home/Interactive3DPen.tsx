"use client"

import React, { useState, useRef, useEffect } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"

// Dynamically import Three.js 3D WebGL Canvas without SSR
const Pen3DCanvas = dynamic(
  () => import("./Pen3DCanvas").then((mod) => mod.Pen3DCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[180px] sm:h-[210px] flex items-center justify-center">
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
  const [viewMode, setViewMode] = useState<"3d" | "photo">("3d")
  const [autoRotate, setAutoRotate] = useState(true)
  const [resetTrigger, setResetTrigger] = useState(0)

  // 2.5D Perspective Mode State
  const containerRef = useRef<HTMLDivElement>(null)
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 })
  const [isSpinning, setIsSpinning] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const updateAngles = (clientX: number, clientY: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const px = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const py = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))

    const rotX = (0.5 - py) * 22
    const rotY = (px - 0.5) * 36

    setRotate({ x: rotX, y: rotY })
    setGlare({ x: px * 100, y: py * 100, opacity: 0.75 })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y
      setRotate({
        x: Math.max(-20, Math.min(20, -deltaY * 0.4)),
        y: Math.max(-40, Math.min(40, deltaX * 0.4)),
      })
      return
    }
    updateAngles(e.clientX, e.clientY)
    setIsHovered(true)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
    setIsHovered(false)
    setRotate({ x: 0, y: 0 })
    setGlare((prev) => ({ ...prev, opacity: 0 }))
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      updateAngles(e.touches[0].clientX, e.touches[0].clientY)
      setIsHovered(true)
    }
  }

  const trigger360Spin = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isSpinning) return
    setIsSpinning(true)
    setTimeout(() => {
      setIsSpinning(false)
      setRotate({ x: 0, y: 0 })
    }, 1800)
  }

  const handleTouchEnd = () => {
    setIsHovered(false)
    setRotate({ x: 0, y: 0 })
    setGlare((prev) => ({ ...prev, opacity: 0 }))
  }

  return (
    <div id="peptech-3d-pen-section" className="w-full flex flex-col items-center select-none py-1">
      {/* View Mode Toggle Pill Bar */}
      <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#F0F5FD] border border-[#D2DFED] mb-2 shadow-2xs">
        <button
          onClick={() => setViewMode("3d")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            viewMode === "3d"
              ? "bg-[#0B1F3A] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#0B1F3A]"
          }`}
        >
          <svg className="w-3.5 h-3.5 text-[#16A6A3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
          <span>3D WebGL Mesh</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A6A3] animate-pulse hidden sm:inline-block" />
        </button>

        <button
          onClick={() => setViewMode("photo")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            viewMode === "photo"
              ? "bg-[#0B1F3A] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#0B1F3A]"
          }`}
        >
          <svg className="w-3.5 h-3.5 text-[#64748B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span>Studio Photo</span>
        </button>
      </div>

      {/* Stage Container */}
      <div className="w-full max-w-[1040px] relative flex items-center justify-center">
        {/* Soft Ambient Radial Backlight */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
          <div className="w-[75%] h-[90px] sm:h-[120px] bg-gradient-to-r from-transparent via-[#16A6A3]/20 to-transparent blur-3xl rounded-full" />
        </div>

        {/* 1. Real 3D WebGL Mesh Mode */}
        {viewMode === "3d" && (
          <div className="w-full flex flex-col items-center">
            {isMounted && (
              <Pen3DCanvas
                autoRotate={autoRotate}
                resetTrigger={resetTrigger}
                className="h-[200px] sm:h-[240px]"
              />
            )}

            {/* 3D Model Dynamic Ground Shadow */}
            <div className="w-[82%] max-w-[820px] h-[16px] sm:h-[18px] -mt-2 rounded-full bg-[#0B1F3A]/25 blur-md pointer-events-none" />

            {/* 3D Action Strip */}
            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold tracking-wider uppercase transition-all cursor-pointer shadow-2xs ${
                  autoRotate
                    ? "bg-[#E6F8F6] border-[#16A6A3] text-[#0B1F3A]"
                    : "bg-white border-[#D2DFED] text-[#64748B] hover:text-[#0B1F3A]"
                }`}
              >
                <svg
                  className={`w-3 h-3 text-[#16A6A3] ${autoRotate ? "animate-spin" : ""}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 21h5v-5" />
                </svg>
                {autoRotate ? "Auto-Rotate: On" : "Auto-Rotate: Paused"}
              </button>

              <button
                onClick={() => setResetTrigger((c) => c + 1)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-[#F0F5FD] border border-[#D2DFED] text-[11px] font-semibold text-[#0B1F3A] tracking-wider uppercase shadow-2xs hover:border-[#16A6A3] hover:text-[#16A6A3] transition-all cursor-pointer"
              >
                <svg className="w-3 h-3 text-[#16A6A3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                Reset View
              </button>

              <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                <span className="hidden sm:inline">•</span>
                <span>Drag to inspect 360° in real-time</span>
              </span>
            </div>
          </div>
        )}

        {/* 2. High-Res Studio Photo 2.5D Mode */}
        {viewMode === "photo" && (
          <div className="w-full flex flex-col items-center">
            <div
              id="peptech-3d-pen-stage"
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="w-full h-[170px] sm:h-[190px] relative flex items-center justify-center cursor-grab active:cursor-grabbing group"
              style={{ perspective: "1200px" }}
            >
              {/* 3D Tilting Pen Vessel */}
              <div
                className={`relative w-full h-[140px] sm:h-[150px] flex items-center justify-center ${
                  isSpinning
                    ? "animate-[spin3d_1.8s_cubic-bezier(0.2,0.8,0.2,1)]"
                    : !isHovered
                    ? "animate-[float3d_6s_ease-in-out_infinite]"
                    : ""
                }`}
                style={{
                  transformStyle: "preserve-3d",
                  transform:
                    !isSpinning && isHovered
                      ? `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1.06, 1.06, 1.06) translateZ(25px)`
                      : undefined,
                  transition: isDragging || isSpinning ? "none" : "transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)",
                }}
              >
                {/* Main Pen Image */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src="/images/figma/peptech-pen-horizontal.png"
                    alt="PEPTECH® Reusable Injection Pen System - Precision 3D View"
                    fill
                    priority
                    className="object-contain filter drop-shadow-[0_12px_16px_rgba(11,31,58,0.22)] drop-shadow-[0_24px_38px_rgba(22,166,163,0.18)] transition-all duration-300"
                  />

                  {/* Specular Glare / Metallic Sheen Sweep Overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none rounded-full transition-opacity duration-300 mix-blend-screen"
                    style={{
                      opacity: glare.opacity,
                      background: `radial-gradient(ellipse 60% 40% at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.15) 35%, transparent 70%)`,
                    }}
                  />
                </div>
              </div>

              {/* Physical Ground Shadow */}
              <div
                className="absolute -bottom-1 sm:bottom-0 w-[78%] max-w-[820px] h-[16px] sm:h-[18px] rounded-full bg-[#0B1F3A]/25 blur-md pointer-events-none transition-all duration-300"
                style={{
                  transform: `translateX(${rotate.y * -0.9}px) scaleX(${
                    isHovered ? 0.92 : 1
                  }) scaleY(${isHovered ? 0.8 : 1})`,
                  opacity: isHovered ? 0.45 : 0.3,
                }}
              />
            </div>

            {/* Photo Mode Controls */}
            <div className="mt-1 flex flex-wrap items-center justify-center gap-2.5">
              <button
                onClick={trigger360Spin}
                disabled={isSpinning}
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white hover:bg-[#F0F5FD] border border-[#D2DFED] text-[11px] font-semibold text-[#0B1F3A] tracking-wider uppercase shadow-2xs hover:border-[#16A6A3] hover:text-[#16A6A3] transition-all cursor-pointer disabled:opacity-50"
              >
                <svg
                  className={`w-3 h-3 text-[#16A6A3] ${isSpinning ? "animate-spin" : ""}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 21h5v-5" />
                </svg>
                {isSpinning ? "Inspecting 360°..." : "360° Precision View"}
              </button>
              <span className="text-[11px] text-[#64748B] hidden sm:inline">
                • Hover or drag to inspect 3D depth & angles
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Inline Keyframes for continuous 3D idle floating and 360 spin */}
      <style jsx global>{`
        @keyframes float3d {
          0%,
          100% {
            transform: translateY(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale3d(1, 1, 1);
          }
          25% {
            transform: translateY(-7px) rotateX(2.5deg) rotateY(-2.5deg) rotateZ(-0.4deg) scale3d(1.02, 1.02, 1.02);
          }
          50% {
            transform: translateY(-11px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale3d(1.03, 1.03, 1.03);
          }
          75% {
            transform: translateY(-5px) rotateX(-2.5deg) rotateY(2.5deg) rotateZ(0.4deg) scale3d(1.02, 1.02, 1.02);
          }
        }
        @keyframes spin3d {
          0% {
            transform: rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1);
          }
          50% {
            transform: translateY(-14px) rotateX(12deg) rotateY(180deg) scale3d(1.08, 1.08, 1.08);
          }
          100% {
            transform: translateY(0px) rotateX(0deg) rotateY(360deg) scale3d(1, 1, 1);
          }
        }
      `}</style>
    </div>
  )
}
