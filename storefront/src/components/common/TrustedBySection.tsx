import React from "react"

export const ANALYTICAL_PILLARS = [
  {
    code: "RUO 18+",
    title: "Research Use Only",
    detail: "Supplied strictly for in-vitro laboratory and scientific analysis.",
  },
  {
    code: "HPLC / MS",
    title: "Chromatographic Verification",
    detail: "Batch analytical identity and assay reporting published per lot.",
  },
  {
    code: "QR TRACE",
    title: "Packaging & Serial Check",
    detail: "Verify pen passports and reagent batch records online.",
  },
  {
    code: "2°C–8°C",
    title: "Monitored Cold-Chain",
    detail: "Discreet unbranded outer cartons via Royal Mail Tracked.",
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
  return (
    <section
      className={`bg-white py-[40px] sm:py-[48px] flex flex-col items-center justify-center ${
        showBorderTop ? "border-t border-[#e2e8f0]" : ""
      } ${showBorderBottom ? "border-b border-[#e2e8f0]" : ""} ${className}`}
      data-name="Trusted By Section"
    >
      <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 flex flex-col gap-[24px] sm:gap-[32px] items-center">
        <div className="flex flex-col gap-2 items-center text-center max-w-[800px]">
          <h2 className="text-2xl sm:text-[28px] font-bold text-[#0B1F3A] tracking-tight uppercase">
            ANALYTICAL &amp; COMPLIANCE STANDARDS
          </h2>
          <p className="text-[14px] sm:text-[15px] text-[#64748B]">
            Engineered for academic institutions, analytical testing facilities, and qualified laboratories worldwide.
          </p>
        </div>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ANALYTICAL_PILLARS.map((item) => (
            <article
              key={item.code}
              className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-5 flex flex-col gap-2 text-left"
            >
              <span className="inline-block w-fit text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-md bg-[#0B1F3A] text-[#00C5A0]">
                {item.code}
              </span>
              <h3 className="text-[15px] font-bold text-[#0B1F3A] leading-snug">
                {item.title}
              </h3>
              <p className="text-[12.5px] text-[#64748B] leading-relaxed">
                {item.detail}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
