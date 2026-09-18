"use client"

import React from "react"

export function PeptechJourney() {
  return (
    <section className="bg-white py-[20px] pb-[60px] flex items-center justify-center">
      <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="bg-[#f0f6fa] rounded-[16px] p-[24px] sm:p-[32px] flex flex-col gap-[28px] items-start w-full">
          
          {/* Journey Header - Figma Node 8:41279 */}
          <div className="flex flex-col gap-[6px] items-start">
            <h2 className="font-bold text-[#0b1f3a] text-[22px] sm:text-[24px]">
              Your PEPTECH® Journey
            </h2>
            <p className="font-normal text-[#64748b] text-[13px]">
              Simple. Sustainable. Designed for the long term.
            </p>
          </div>

          {/* Steps Row - Figma Node 8:41282 */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 w-full">
            
            {/* Step 1 */}
            <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[18px] flex gap-[16px] items-center h-auto sm:h-[124px] w-full lg:w-[352px] shadow-xs">
              <div className="flex flex-col gap-[8px] items-center shrink-0">
                <div className="bg-[#0b1f3a] text-white size-[26px] rounded-full flex items-center justify-center font-bold text-[13px]">
                  1
                </div>
                <div className="bg-[#e8f5fc] size-[42px] rounded-full flex items-center justify-center">
                  <img src="/images/figma/1b75e610f624c5efcb536e24301bfe76b23e33c8.svg" alt="" className="size-[20px]" />
                </div>
              </div>
              <div className="flex flex-col gap-[4px] items-start">
                <h4 className="font-bold text-[#0b1f3a] text-[15px] leading-[22px]">
                  Buy your Complete<br className="hidden sm:inline" /> Pen Set once
                </h4>
                <p className="font-normal text-[#64748b] text-[12px] leading-[18px]">
                  Get everything you need to get started.
                </p>
              </div>
            </div>

            {/* Chevron 1 */}
            <div className="hidden lg:flex size-[20px] shrink-0 items-center justify-center">
              <img src="/images/figma/1fdf488f3116d53907ccc08806441a8b89df2669.svg" alt="" className="size-full" />
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[18px] flex gap-[16px] items-center h-auto sm:h-[124px] w-full lg:w-[352px] shadow-xs">
              <div className="flex flex-col gap-[8px] items-center shrink-0">
                <div className="bg-[#0b1f3a] text-white size-[26px] rounded-full flex items-center justify-center font-bold text-[13px]">
                  2
                </div>
                <div className="bg-[#e8f5fc] size-[42px] rounded-full flex items-center justify-center">
                  <img src="/images/figma/f048e39ad3c157a714574a1cd54c3b7ebe55819f.svg" alt="" className="size-[20px]" />
                </div>
              </div>
              <div className="flex flex-col gap-[4px] items-start">
                <h4 className="font-bold text-[#0b1f3a] text-[15px] leading-[22px]">
                  Use your reusable<br className="hidden sm:inline" /> PEPTECH® pen
                </h4>
                <p className="font-normal text-[#64748b] text-[12px] leading-[18px]">
                  Accurate. Reliable. Built to last.
                </p>
              </div>
            </div>

            {/* Chevron 2 */}
            <div className="hidden lg:flex size-[20px] shrink-0 items-center justify-center">
              <img src="/images/figma/1fdf488f3116d53907ccc08806441a8b89df2669.svg" alt="" className="size-full" />
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[18px] flex gap-[16px] items-center h-auto sm:h-[124px] w-full lg:w-[352px] shadow-xs">
              <div className="flex flex-col gap-[8px] items-center shrink-0">
                <div className="bg-[#0b1f3a] text-white size-[26px] rounded-full flex items-center justify-center font-bold text-[13px]">
                  3
                </div>
                <div className="bg-[#e8f5fc] size-[42px] rounded-full flex items-center justify-center">
                  <img src="/images/figma/08577dad19be4865945dc30e801ea891a60a9862.svg" alt="" className="w-[18px] h-[22px]" />
                </div>
              </div>
              <div className="flex flex-col gap-[4px] items-start">
                <h4 className="font-bold text-[#0b1f3a] text-[15px] leading-[22px]">
                  Return to order<br className="hidden sm:inline" /> Refill Cartridges
                </h4>
                <p className="font-normal text-[#64748b] text-[12px] leading-[18px]">
                  When needed. Save with subscription options.
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  )
}
