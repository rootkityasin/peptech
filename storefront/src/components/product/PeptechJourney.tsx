"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"

interface StepItem {
  number: number
  title: string
  subtitle: string
  detail: string
  badge: string
  icon: string
  iconAlt: string
  actionLabel?: string
  actionHref?: string
}

const STEPS: StepItem[] = [
  {
    number: 1,
    title: "Buy your Complete Pen Set once",
    subtitle: "Get everything you need to get started.",
    detail: "Includes reusable applicator, 1x prefilled cartridge, 4x sterile needles & travel pouch.",
    badge: "INITIAL SETUP",
    icon: "/images/figma/1b75e610f624c5efcb536e24301bfe76b23e33c8.svg",
    iconAlt: "Shopping cart",
    actionLabel: "Shop Pen Sets",
    actionHref: "/pen-sets",
  },
  {
    number: 2,
    title: "Use your reusable PEPTECH® pen",
    subtitle: "Accurate. Reliable. Built to last.",
    detail: "Permanent hardware with Swiss 0.01ml micro-dial dosing mechanism. Never discarded.",
    badge: "LIFETIME HARDWARE",
    icon: "/images/figma/f048e39ad3c157a714574a1cd54c3b7ebe55819f.svg",
    iconAlt: "Reusable precision pen",
  },
  {
    number: 3,
    title: "Return to order Refill Cartridges",
    subtitle: "When needed. Save with subscription options.",
    detail: "Quick click-in 28-day refill cartridges with 10% Subscribe & Save discount.",
    badge: "10% OFF REFILLS",
    icon: "/images/figma/08577dad19be4865945dc30e801ea891a60a9862.svg",
    iconAlt: "Refill cartridge",
    actionLabel: "Order Refills",
    actionHref: "/refills",
  },
]

/**
 * Animated number component:
 * When triggered or scrolled to, the number counts up from 0 to target
 * with a smooth upward slide animation ("numbers are going up").
 */
function UpwardNumber({
  target,
  isTriggered,
  isActive,
}: {
  target: number
  isTriggered: boolean
  isActive: boolean
}) {
  const [displayNum, setDisplayNum] = useState<number>(0)

  useEffect(() => {
    if (!isTriggered) {
      setDisplayNum(0)
      return
    }

    let current = 0
    const delay = target === 1 ? 130 : target === 2 ? 90 : 65
    const timer = setInterval(() => {
      current += 1
      setDisplayNum(current)
      if (current >= target) {
        clearInterval(timer)
      }
    }, delay)

    return () => clearInterval(timer)
  }, [target, isTriggered])

  return (
    <div className="relative h-[22px] w-[16px] flex items-center justify-center overflow-hidden">
      <span
        key={displayNum}
        className={`inline-block font-bold text-[13px] leading-none transition-all duration-300 ${
          isActive ? "text-white scale-110" : "text-white"
        }`}
        style={{
          animation: "numberSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
      >
        {isTriggered ? displayNum : target}
      </span>
    </div>
  )
}

export function PeptechJourney() {
  const sectionRef = useRef<HTMLElement>(null)
  const [activeStep, setActiveStep] = useState<number>(1)
  const [scrollProgress, setScrollProgress] = useState<number>(0.1)
  const [hasEntered, setHasEntered] = useState<boolean>(false)
  const isLockedRef = useRef<boolean>(false)
  const lockTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Scroll effect & Intersection Observer
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true)
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)

    const handleScroll = () => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight

      // Calculate progress relative to viewport
      const totalSpan = rect.height + windowHeight * 0.5
      const currentPos = windowHeight * 0.75 - rect.top
      const raw = Math.max(0, Math.min(1, currentPos / totalSpan))
      setScrollProgress(raw)

      if (raw > 0.05) {
        setHasEntered(true)
      }

      // Automatically update active step based on scroll position if user hasn't clicked
      if (!isLockedRef.current) {
        if (raw < 0.38) {
          setActiveStep(1)
        } else if (raw < 0.72) {
          setActiveStep(2)
        } else {
          setActiveStep(3)
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", handleScroll)
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current)
    }
  }, [])

  const handleStepClick = (stepNum: number) => {
    setActiveStep(stepNum)
    isLockedRef.current = true
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current)
    lockTimerRef.current = setTimeout(() => {
      isLockedRef.current = false
    }, 4500)
  }

  // Calculate percentage fill for the vertical scroll spine
  const spineHeightPercent = activeStep === 1 ? 28 : activeStep === 2 ? 65 : 100

  return (
    <section
      ref={sectionRef}
      id="peptech-journey-section"
      className="bg-white py-[24px] sm:py-[32px] pb-[56px] flex items-center justify-center relative overflow-hidden"
    >
      <style jsx global>{`
        @keyframes numberSlideUp {
          0% {
            transform: translateY(8px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>

      <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6">
        
        {/* Main Container Card */}
        <div className="bg-[#f0f6fa] border border-[#e2e8f0]/80 rounded-[18px] sm:rounded-[22px] p-[20px] sm:p-[32px] flex flex-col gap-[24px] sm:gap-[28px] items-start w-full relative overflow-hidden shadow-xs transition-colors duration-500">
          
          {/* Subtle decorative ambient glow */}
          <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-[#16a6a3]/8 blur-3xl" />

          {/* Header Row: Title & Dynamic Numbers-Going-Up Stage Counter */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 w-full relative z-10">
            
            {/* Title & Subtitle */}
            <div className="flex flex-col gap-[6px] items-start">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/80 border border-[#16a6a3]/20 shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16a6a3] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16a6a3]" />
                </span>
                <span className="font-mono font-bold text-[10px] uppercase tracking-wider text-[#0b1f3a]">
                  3-Step Protocol
                </span>
              </div>

              <h2 className="font-bold text-[#0b1f3a] text-[22px] sm:text-[25px] tracking-tight">
                Your PEPTECH® Journey
              </h2>
              <p className="font-normal text-[#64748b] text-[13px] sm:text-[13.5px]">
                Simple. Sustainable. Designed for the long term.
              </p>
            </div>

            {/* Interactive Stage Indicator (Numbers slide/go up as user scrolls or taps) */}
            <div className="flex items-center gap-3 bg-white border border-[#e2e8f0] px-3.5 py-2 rounded-[12px] shadow-xs shrink-0 self-start sm:self-auto">
              <div className="flex flex-col items-start">
                <span className="text-[9.5px] font-mono uppercase tracking-wider text-[#64748b]">
                  Current Step
                </span>
                
                {/* Numbers Going Up: Upward Sliding Counter */}
                <div className="flex items-center gap-1">
                  <div className="relative h-[20px] overflow-hidden inline-flex items-center">
                    <span
                      key={activeStep}
                      className="inline-block font-mono font-bold text-[15px] text-[#16a6a3]"
                      style={{
                        animation: "numberSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                      }}
                    >
                      0{activeStep}
                    </span>
                  </div>
                  <span className="text-[#94a3b8] text-[12px] font-medium">/ 03</span>
                </div>
              </div>

              {/* Clickable Step Switcher Dots */}
              <div className="flex items-center gap-1.5 ml-2 border-l border-[#e2e8f0] pl-3">
                {[1, 2, 3].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStepClick(s)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      activeStep === s
                        ? "w-6 bg-[#16a6a3] shadow-xs"
                        : activeStep > s
                        ? "w-2.5 bg-[#0b1f3a]"
                        : "w-2.5 bg-[#cbd5e1] hover:bg-[#94a3b8]"
                    }`}
                    title={`Switch to Step ${s}`}
                    aria-label={`Switch to Step ${s}`}
                  />
                ))}
              </div>
            </div>

          </div>

          {/* Steps Row (Desktop: Horizontal with Beams | Mobile: Vertical Stacked with Connecting Rail) */}
          <div className="w-full relative">
            
            {/* MOBILE ONLY: Vertical Animated Scroll Spine (Connecting line down the left column) */}
            <div
              className="lg:hidden absolute left-[31px] top-[40px] bottom-[40px] w-[2px] pointer-events-none z-0"
              aria-hidden="true"
            >
              {/* Neutral background rail */}
              <div className="absolute inset-0 bg-[#cbd5e1]/50 rounded-full" />
              {/* Dynamic scroll fill */}
              <div
                className="absolute top-0 left-0 w-full bg-gradient-to-b from-[#16a6a3] via-[#00c5a0] to-[#16a6a3] rounded-full transition-all duration-500 ease-out"
                style={{
                  height: `${spineHeightPercent}%`,
                }}
              >
                {/* Glowing laser head */}
                <div className="absolute -bottom-1 -left-[3px] size-2 rounded-full bg-[#00c5a0] shadow-[0_0_8px_#00c5a0] ring-2 ring-white" />
              </div>
            </div>

            {/* Cards Row */}
            <div className="flex flex-col lg:flex-row items-stretch justify-between gap-4 w-full relative z-10">
              
              {STEPS.map((step, idx) => {
                const isActive = activeStep === step.number
                const isPast = activeStep > step.number
                const isTriggered = hasEntered && (activeStep >= step.number || scrollProgress >= (idx * 0.28))

                return (
                  <React.Fragment key={step.number}>
                    
                    {/* Step Card */}
                    <div
                      onClick={() => handleStepClick(step.number)}
                      className={`group bg-white border rounded-[14px] p-[16px] sm:p-[18px] flex gap-[14px] sm:gap-[16px] items-start w-full lg:w-[352px] transition-all duration-300 cursor-pointer ${
                        isActive
                          ? "border-[#16a6a3] shadow-[0_10px_25px_-5px_rgba(22,166,163,0.18)] ring-2 ring-[#16a6a3]/20 bg-gradient-to-b from-white to-[#f4fcfb] lg:-translate-y-1"
                          : isPast
                          ? "border-[#cbd5e1] hover:border-[#16a6a3]/50 shadow-xs"
                          : "border-[#e2e8f0] hover:border-slate-300 shadow-xs"
                      }`}
                      data-name={`Journey Step ${step.number}`}
                    >
                      {/* Left Column: Number Badge Vertically Above Icon (Faithful to Figma & Screenshot) */}
                      <div className="flex flex-col gap-[8px] items-center shrink-0">
                        {/* Number Badge with Animated Count Up */}
                        <div className="relative">
                          <div
                            className={`size-[26px] sm:size-[28px] rounded-full flex items-center justify-center font-bold text-[13px] transition-all duration-500 ${
                              isActive
                                ? "bg-gradient-to-br from-[#16a6a3] to-[#0d827f] text-white shadow-md shadow-[#16a6a3]/35 ring-4 ring-[#16a6a3]/20 scale-105"
                                : isPast
                                ? "bg-[#0b1f3a] text-white ring-2 ring-[#0b1f3a]/20"
                                : "bg-[#0b1f3a] text-white"
                            }`}
                          >
                            <UpwardNumber
                              target={step.number}
                              isTriggered={isTriggered}
                              isActive={isActive}
                            />
                          </div>

                          {/* Upward pulse radar when active */}
                          {isActive && (
                            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16a6a3] opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16a6a3]" />
                            </span>
                          )}
                        </div>

                        {/* Icon Circle */}
                        <div
                          className={`size-[42px] rounded-full flex items-center justify-center transition-all duration-300 ${
                            isActive
                              ? "bg-[#e0f4f4] scale-105 shadow-inner"
                              : "bg-[#e8f5fc] group-hover:bg-[#dbeafe]"
                          }`}
                        >
                          <img
                            src={step.icon}
                            alt={step.iconAlt}
                            className={`transition-transform duration-300 ${
                              isActive ? "scale-110" : "group-hover:scale-105"
                            } ${step.number === 3 ? "w-[18px] h-[22px]" : "size-[20px]"}`}
                          />
                        </div>
                      </div>

                      {/* Right Column: Title + Subtitle + Interactive Details */}
                      <div className="flex flex-col gap-[4px] items-start flex-1 min-w-0">
                        
                        <div className="flex items-center justify-between w-full gap-2">
                          <h3 className="font-bold text-[#0b1f3a] text-[15px] sm:text-[15.5px] leading-[22px] transition-colors group-hover:text-[#0b1f3a]">
                            {step.title}
                          </h3>
                        </div>

                        <p className="font-normal text-[#64748b] text-[12px] sm:text-[12.5px] leading-[18px]">
                          {step.subtitle}
                        </p>

                        {/* Micro-detail expandable pill on hover/active */}
                        <div
                          className={`mt-2 pt-2 border-t border-[#f1f5f9] flex items-center justify-between w-full text-[11px] transition-all duration-300 ${
                            isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                          }`}
                        >
                          <span className="text-[#64748b] line-clamp-1 pr-2">
                            {step.detail}
                          </span>

                          {step.actionLabel && step.actionHref ? (
                            <Link
                              href={step.actionHref}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 font-bold text-[#16a6a3] hover:text-[#0b1f3a] hover:underline shrink-0 whitespace-nowrap"
                            >
                              <span>{step.actionLabel}</span>
                              <span className="text-[12px]">→</span>
                            </Link>
                          ) : (
                            <span className="text-[10px] font-mono font-bold text-[#0b1f3a] bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                              LIFETIME
                            </span>
                          )}
                        </div>

                      </div>
                    </div>

                    {/* DESKTOP CONNECTOR BEAM WITH CHEVRON (Hidden on Mobile) */}
                    {idx < STEPS.length - 1 && (
                      <div
                        className="hidden lg:flex flex-col items-center justify-center shrink-0 w-[28px] relative self-center"
                        aria-hidden="true"
                      >
                        {/* Connecting Flow Beam */}
                        <div className="w-full h-[2px] bg-[#e2e8f0] relative overflow-hidden rounded-full mb-1">
                          <div
                            className={`h-full bg-gradient-to-r from-[#16a6a3] to-[#00c5a0] transition-all duration-500 ease-out ${
                              activeStep > step.number ? "w-full" : "w-0"
                            }`}
                          />
                        </div>

                        {/* Chevron Icon with Glow */}
                        <div
                          className={`size-[20px] flex items-center justify-center transition-all duration-500 ${
                            activeStep > step.number
                              ? "opacity-100 scale-110 drop-shadow-[0_0_6px_rgba(22,166,163,0.5)] text-[#16a6a3]"
                              : "opacity-40"
                          }`}
                        >
                          <img
                            src="/images/figma/1fdf488f3116d53907ccc08806441a8b89df2669.svg"
                            alt=""
                            className="size-full"
                          />
                        </div>
                      </div>
                    )}

                  </React.Fragment>
                )
              })}

            </div>
          </div>

          {/* Bottom Trust Guarantee Strip */}
          <div className="w-full pt-1 sm:pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-[#e2e8f0]/80 text-[11.5px] text-[#64748b]">
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-[#16a6a3]" />
              <span>
                <strong className="text-[#0b1f3a] font-semibold">1 Reusable Precision Pen</strong> serves all compatible 28-day refill cartridges.
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-[#0b1f3a] font-medium">
                <span className="text-[#16a6a3] font-bold">✓</span> Zero Single-Use Plastic Waste
              </span>
              <span className="flex items-center gap-1 text-[#0b1f3a] font-medium">
                <span className="text-[#16a6a3] font-bold">✓</span> 10% Subscriber Savings
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
