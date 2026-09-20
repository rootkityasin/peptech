"use client"

import React, { useState, useRef, useEffect } from "react"
import Image from "next/image"

export function Interactive3DPen() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 })

  const updateAngles = (clientX: number, clientY: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const px = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const py = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))

    // Max 18 deg X tilt, 28 deg Y tilt for dramatic, natural 3D depth
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

  const [isSpinning, setIsSpinning] = useState(false)

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
    <div id="peptech-3d-pen-section" className="w-full flex flex-col items-center select-none py-2">
      {/* 3D Perspective Stage Container */}
      <div
        id="peptech-3d-pen-stage"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full max-w-[1040px] h-[170px] sm:h-[190px] relative flex items-center justify-center cursor-grab active:cursor-grabbing group"
        style={{ perspective: "1200px" }}
      >
        {/* Soft Ambient Radial Backlight */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
          <div className="w-[75%] h-[90px] sm:h-[110px] bg-gradient-to-r from-transparent via-[#16A6A3]/15 to-transparent blur-3xl rounded-full" />
        </div>

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
          {/* Main Pen Image with High-Depth Multi-Layer Drop Shadows */}
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

        {/* 3D Physical Ground Shadow (Reacts inversely to 3D elevation) */}
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

      {/* Interactive 3D Status Indicator & 360 Spin Action */}
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
            strokeLinecap="round"
            strokeLinejoin="round"
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

