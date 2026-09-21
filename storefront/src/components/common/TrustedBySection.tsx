import React from "react"

export const TRUSTED_LOGOS = [
  {
    name: "NSF Certified",
    src: "/images/figma/logo-nsf.svg",
    className: "h-[42px] sm:h-[46px] w-auto max-w-[48px] object-contain",
  },
  {
    name: "ISO 9001 Certified",
    src: "/images/figma/logo-iso.svg",
    className: "h-[40px] sm:h-[44px] w-auto max-w-[56px] object-contain",
  },
  {
    name: "CE Mark",
    src: "/images/figma/logo-ce.svg",
    className: "h-[38px] sm:h-[42px] w-auto max-w-[62px] object-contain",
  },
  {
    name: "FDA Facility Registered",
    src: "/images/figma/logo-fda.svg",
    className: "h-[32px] sm:h-[34px] w-auto max-w-[92px] object-contain",
  },
  {
    name: "World Health Organization",
    src: "/images/figma/logo-who.svg",
    className: "h-[34px] sm:h-[36px] w-auto max-w-[130px] object-contain",
  },
  {
    name: "AOAC International",
    src: "/images/figma/logo-aoac-official.png",
    className: "h-[42px] sm:h-[46px] w-auto max-w-[60px] object-contain",
  },
]

interface TrustedBySectionProps {
  className?: string
  showBorderTop?: boolean
  showBorderBottom?: boolean
}

export function TrustedBySection({
  className = "",
  showBorderTop = true,
  showBorderBottom = false,
}: TrustedBySectionProps) {
  // We double the set for the first half, and repeat again for the second half
  // so the marquee loops infinitely at -50% with zero stutter on screens of any width.
  const logoSet = [...TRUSTED_LOGOS, ...TRUSTED_LOGOS]

  return (
    <section
      className={`bg-white py-[40px] sm:py-[48px] flex flex-col items-center justify-center overflow-hidden ${
        showBorderTop ? "border-t border-[#e2e8f0]" : ""
      } ${showBorderBottom ? "border-b border-[#e2e8f0]" : ""} ${className}`}
      data-name="Trusted By Section"
    >
      <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 flex flex-col gap-[24px] sm:gap-[32px] items-center">
        {/* Heading & Subtitle */}
        <div className="flex flex-col gap-2 items-center text-center max-w-[800px]">
          <h2 className="text-2xl sm:text-[28px] font-bold text-[#0B1F3A] tracking-tight uppercase">
            TRUSTED BY PROFESSIONALS
          </h2>
          <p className="text-[14px] sm:text-[15px] text-[#64748B]">
            Used by leading laboratories, industries and research institutions worldwide.
          </p>
        </div>

        {/* 1 Single Row Continuous Marquee (Right-to-Left) */}
        <div className="w-full relative overflow-hidden py-2">
          {/* Subtle Left & Right Edge Vignette Fades */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-white to-transparent z-10" />

          {/* Marquee Track: Moves right-to-left in 1 uninterrupted row */}
          <div className="animate-marquee flex items-center flex-nowrap gap-10 sm:gap-14">
            {/* First sequence (0% to 50%) */}
            <div className="flex items-center flex-nowrap gap-10 sm:gap-14 shrink-0">
              {logoSet.map((logo, index) => (
                <div
                  key={`logo-a-${index}`}
                  className="h-[52px] w-[130px] sm:w-[145px] flex items-center justify-center shrink-0 grayscale hover:grayscale-0 opacity-85 hover:opacity-100 transition-all duration-300"
                >
                  <img
                    src={logo.src}
                    alt={logo.name}
                    className={logo.className}
                  />
                </div>
              ))}
            </div>

            {/* Second identical sequence (50% to 100%) for seamless infinite loop */}
            <div className="flex items-center flex-nowrap gap-10 sm:gap-14 shrink-0" aria-hidden="true">
              {logoSet.map((logo, index) => (
                <div
                  key={`logo-b-${index}`}
                  className="h-[52px] w-[130px] sm:w-[145px] flex items-center justify-center shrink-0 grayscale hover:grayscale-0 opacity-85 hover:opacity-100 transition-all duration-300"
                >
                  <img
                    src={logo.src}
                    alt={logo.name}
                    className={logo.className}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
