"use client"

import React from "react"

const reviews = [
  {
    quote1: "Excellent product and service. Highly",
    quote2: "recommended for any research lab.",
    name: "Michael T.",
  },
  {
    quote1: "The quality is outstanding. Fast shipping",
    quote2: "and great customer support.",
    name: "Dr. Emily R.",
  },
  {
    quote1: "Easy to use and very reliable. Will",
    quote2: "continue to order.",
    name: "James L.",
  },
]

export function VerifiedReviewsSection() {
  return (
    <div className="bg-white flex items-center justify-center pb-[40px] pt-[36px] w-full" data-node-id="8:41686" data-name="Verified Customer Reviews Section">
      <div className="flex flex-col lg:flex-row items-center justify-between max-w-[1240px] w-full px-4 sm:px-6 gap-6" data-node-id="8:41687" data-name="Reviews Inner">
        {/* Reviews Summary Column */}
        <div className="flex flex-col gap-[10px] items-start w-full lg:w-[250px] shrink-0" data-node-id="8:41688" data-name="Reviews Summary Column">
          <p className="font-bold leading-[26px] text-[#0b1f3a] text-[20px] whitespace-nowrap">
            Verified Customer Reviews
          </p>
          <div className="flex gap-[3px] items-start" data-name="Stars">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="size-[14px] shrink-0">
                <img alt="" className="size-full" src="/images/figma/88eae9699ccc8253cd275735cdc60b0ad6111f88.svg" />
              </div>
            ))}
          </div>
          <p className="font-normal text-[#475569] text-[13px] whitespace-nowrap">
            4.9 out of 5 (284 reviews)
          </p>
          <a href="#reviews" className="flex gap-[6px] items-center pt-[6px] text-[#0b1f3a] hover:opacity-80 transition-opacity" data-name="View All">
            <p className="font-bold text-[#0b1f3a] text-[13px] whitespace-nowrap">
              View All Reviews
            </p>
            <div className="size-[16px] shrink-0">
              <img alt="" className="size-full" src="/images/figma/59e312c7b3a78ddca79d47b884a0992dc4142203.svg" />
            </div>
          </a>
        </div>

        {/* 3 Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[15px] w-full lg:w-auto">
          {reviews.map((r) => (
            <div
              key={r.name}
              className="bg-white border border-[#e2e8f0] flex flex-col h-[165px] items-start justify-between p-[18px] rounded-[12px] shrink-0 w-full sm:w-[310px]"
              data-name={`Review Card - ${r.name}`}
            >
              <div className="flex flex-col gap-[8px] items-start w-full" data-name="Top Group">
                <div className="flex gap-[2px] items-start" data-name="Stars">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="size-[12px] shrink-0">
                      <img alt="" className="size-full" src="/images/figma/5bd97b26a01958d8c69784c4a4ae764ab9860fb1.svg" />
                    </div>
                  ))}
                </div>
                <div className="font-normal text-[#475569] text-[12px] leading-[18px]">
                  <p className="mb-0">{r.quote1}</p>
                  <p className="mb-0">{r.quote2}</p>
                </div>
              </div>

              <div className="flex gap-[8px] items-center w-full" data-name="Author Row">
                <div className="rounded-[14px] size-[28px] shrink-0 overflow-hidden">
                  <img
                    alt=""
                    className="size-full object-cover rounded-[14px]"
                    src="/images/figma/138573664d114462601fdac5ccec165f33058ecc.png"
                  />
                </div>
                <p className="font-bold text-[#0b1f3a] text-[12px] whitespace-nowrap">
                  {r.name}
                </p>
                <div className="flex gap-[4px] items-center ml-auto sm:ml-0" data-name="Verified Badge">
                  <div className="size-[16px] shrink-0">
                    <img alt="" className="size-full" src="/images/figma/0ee7fe88aee11b9b1b7822b9ae473035446e5d9c.svg" />
                  </div>
                  <p className="font-normal text-[#64748b] text-[11px] whitespace-nowrap">
                    Verified Buyer
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

