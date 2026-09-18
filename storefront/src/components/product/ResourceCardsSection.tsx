"use client"

import React from "react"
import Link from "next/link"

export function ResourceCardsSection() {
  return (
    <div className="bg-white flex items-start justify-center pb-[60px] pt-[20px] w-full" data-node-id="8:41773" data-name="Help and Support Section">
      <div className="flex flex-col lg:flex-row items-stretch justify-between max-w-[1240px] w-full px-4 sm:px-6 gap-[20px]" data-node-id="8:41774" data-name="Support Inner">
        
        {/* Card 1: Lab Reports & Certificates */}
        <div className="bg-[#f0f6fa] flex flex-col h-[160px] items-start justify-between p-[22px] rounded-[16px] w-full lg:w-[390px] shrink-0" data-name="Help Card - Lab Reports">
          <div className="flex gap-[12px] items-start">
            <div className="size-[22px] shrink-0">
              <img alt="" className="size-full" src="/images/figma/e447f75c001f7ad49918c6dd48d0219d69a220e1.svg" />
            </div>
            <div className="flex flex-col gap-[4px] items-start">
              <p className="font-bold text-[#0b1f3a] text-[14px] leading-tight">
                Lab Reports &amp; Certificates
              </p>
              <div className="font-normal text-[#64748b] text-[12px] leading-[17px]">
                <p className="mb-0">Access our latest quality certificates,</p>
                <p className="mb-0">COAs and compliance documents.</p>
              </div>
            </div>
          </div>
          <Link
            href="/lab-reports"
            className="bg-white border-[#0b1f3a] border-[1.5px] border-solid flex gap-[6px] h-[34px] items-center justify-center px-[14px] rounded-[6px] hover:bg-slate-50 transition-colors"
            data-name="Btn"
          >
            <span className="font-semibold text-[#0b1f3a] text-[12px] whitespace-nowrap">
              View Documents
            </span>
            <div className="size-[16px] shrink-0">
              <img alt="" className="size-full" src="/images/figma/59e312c7b3a78ddca79d47b884a0992dc4142203.svg" />
            </div>
          </Link>
        </div>

        {/* Card 2: Verify Authenticity */}
        <div className="bg-[#f0f6fa] flex flex-col h-[160px] items-start justify-between p-[22px] rounded-[16px] w-full lg:w-[390px] shrink-0" data-name="Help Card - Authenticity">
          <div className="flex gap-[12px] items-start">
            <div className="size-[22px] shrink-0">
              <img alt="" className="size-full" src="/images/figma/76231626c15b815c695ea47c5d56c318fc3efe2b.svg" />
            </div>
            <div className="flex flex-col gap-[4px] items-start">
              <p className="font-bold text-[#0b1f3a] text-[14px] leading-tight">
                Verify Authenticity
              </p>
              <div className="font-normal text-[#64748b] text-[12px] leading-[17px]">
                <p className="mb-0">Scan your QR code to verify</p>
                <p className="mb-0">product authenticity and batch information.</p>
              </div>
            </div>
          </div>
          <Link
            href="/verify"
            className="bg-white border-[#0b1f3a] border-[1.5px] border-solid flex gap-[6px] h-[34px] items-center justify-center px-[14px] rounded-[6px] hover:bg-slate-50 transition-colors"
            data-name="Btn"
          >
            <span className="font-semibold text-[#0b1f3a] text-[12px] whitespace-nowrap">
              Learn More
            </span>
            <div className="size-[16px] shrink-0">
              <img alt="" className="size-full" src="/images/figma/59e312c7b3a78ddca79d47b884a0992dc4142203.svg" />
            </div>
          </Link>
        </div>

        {/* Card 3: Need Help? */}
        <div className="bg-[#f0f6fa] flex flex-col h-[160px] items-start justify-between p-[22px] rounded-[16px] w-full lg:w-[390px] shrink-0" data-name="Help Card - Contact">
          <div className="flex gap-[12px] items-start">
            <div className="size-[22px] shrink-0">
              <img alt="" className="size-full" src="/images/figma/b00dbfc31bf617a6c5a02915924d1f5ace8c8c45.svg" />
            </div>
            <div className="flex flex-col gap-[4px] items-start">
              <p className="font-bold text-[#0b1f3a] text-[14px] leading-tight">
                Need Help?
              </p>
              <p className="font-normal text-[#64748b] text-[12px]">
                Our team is here to support you.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between w-full max-w-[346px]" data-name="Contact Links Row">
            <button
              onClick={() => alert("Connecting to PEPTECH Lab Support Chat...")}
              className="flex gap-[4px] items-center hover:opacity-80 transition-opacity"
            >
              <div className="size-[22px] shrink-0">
                <img alt="" className="size-full" src="/images/figma/b00dbfc31bf617a6c5a02915924d1f5ace8c8c45.svg" />
              </div>
              <span className="font-medium text-[#0b1f3a] text-[11px] whitespace-nowrap">
                Chat Live
              </span>
            </button>
            <a
              href="mailto:info@peptech.bio"
              className="flex gap-[4px] items-center hover:opacity-80 transition-opacity"
            >
              <div className="size-[22px] shrink-0">
                <img alt="" className="size-full" src="/images/figma/c4a6280f711b3d1aba2486c8a03800c3802a2ef1.svg" />
              </div>
              <span className="font-medium text-[#0b1f3a] text-[11px] whitespace-nowrap">
                Email Us
              </span>
            </a>
            <a
              href="tel:+18001234567"
              className="flex gap-[4px] items-center hover:opacity-80 transition-opacity"
            >
              <div className="size-[22px] shrink-0">
                <img alt="" className="size-full" src="/images/figma/6ae6020cc789a7710eede2f5fe4ca66dfcd7648c.svg" />
              </div>
              <span className="font-medium text-[#0b1f3a] text-[11px] whitespace-nowrap">
                +1 (800) 123-4567
              </span>
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}

