"use client"

import React from "react"
import Link from "next/link"

export function QualityAssuranceSection() {
  const pillars = [
    {
      title: "Analytical Purity Guaranteed",
      desc: "Every synthesis batch undergoes independent third-party HPLC & Mass Spectrometry testing prior to release.",
      badge: "HPLC Certified",
      icon: "/images/figma/0ee7fe88aee11b9b1b7822b9ae473035446e5d9c.svg",
    },
    {
      title: "Verified Order Verification",
      desc: "Client reviews are collected exclusively from authenticated purchasers following confirmed delivery.",
      badge: "Verified Research",
      icon: "/images/figma/0ee7fe88aee11b9b1b7822b9ae473035446e5d9c.svg",
    },
    {
      title: "Full Batch Traceability",
      desc: "Packaging QR codes link directly to batch-specific analytical certificates and device passport serials.",
      badge: "Traceable Batch",
      icon: "/images/figma/0ee7fe88aee11b9b1b7822b9ae473035446e5d9c.svg",
    },
  ]

  return (
    <div className="bg-white flex items-center justify-center pb-[40px] pt-[36px] w-full border-t border-slate-100" data-name="Quality Assurance Section">
      <div className="flex flex-col lg:flex-row items-center justify-between max-w-[1240px] w-full px-4 sm:px-6 gap-6">
        {/* Reviews Summary Column */}
        <div className="flex flex-col gap-[10px] items-start w-full lg:w-[280px] shrink-0">
          <p className="font-bold leading-[26px] text-[#0b1f3a] text-[20px]">
            Verified Research Standards
          </p>
          <div className="flex gap-[3px] items-center" aria-label="100% Verified Quality Standards">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="size-[14px] shrink-0">
                <img alt="" className="size-full" src="/images/figma/88eae9699ccc8253cd275735cdc60b0ad6111f88.svg" />
              </div>
            ))}
            <span className="text-xs font-semibold text-[#16A6A3] ml-1.5">RUO Standard</span>
          </div>
          <p className="font-normal text-[#475569] text-[13px] leading-relaxed">
            Authentic batch quality assurance. Customer reviews are accepted exclusively from verified laboratory orders.
          </p>
          <Link href="/lab-reports" className="flex gap-[6px] items-center pt-[6px] text-[#0b1f3a] hover:text-[#16A6A3] transition-colors">
            <p className="font-bold text-[13px] whitespace-nowrap">
              Search Lab Reports Library →
            </p>
          </Link>
        </div>

        {/* 3 Authentic Standard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[15px] w-full lg:w-auto flex-1">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col min-h-[165px] h-auto items-start justify-between p-[18px] rounded-[12px] shrink-0 w-full hover:border-[#16A6A3]/30 transition-colors"
            >
              <div className="flex flex-col gap-[8px] items-start w-full">
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-bold text-[#16A6A3] bg-[#16A6A3]/10 px-2 py-0.5 rounded uppercase tracking-wider">
                    {pillar.badge}
                  </span>
                  <div className="size-[16px] shrink-0">
                    <img alt="" className="size-full" src={pillar.icon} />
                  </div>
                </div>
                <p className="font-bold text-[#0b1f3a] text-[14px] mt-1">
                  {pillar.title}
                </p>
                <p className="font-normal text-[#475569] text-[12px] leading-[18px]">
                  {pillar.desc}
                </p>
              </div>

              <div className="flex gap-[8px] items-center w-full pt-3 border-t border-slate-200/60 mt-3">
                <span className="text-[11px] font-medium text-slate-500">PEPTECH® Quality Assurance</span>
                <span className="ml-auto text-[11px] font-semibold text-[#0B1F3A]">Strict RUO</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
