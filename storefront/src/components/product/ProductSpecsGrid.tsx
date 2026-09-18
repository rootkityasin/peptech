"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"

const WHATS_INCLUDED = [
  {
    title: "Reusable PEPTECH® pen",
    desc: "Precision engineered",
    icon: "/images/figma/f7e11058d1753109f40f4579d5a46a9f287d2f2d.svg",
  },
  {
    title: "1 × Compatible cartridge",
    desc: "Pre-filled and ready to use",
    icon: "/images/figma/298fba2a8f49bbc8af7bea655eafec9240750d9e.svg",
  },
  {
    title: "Instruction guide",
    desc: "Step-by-step with illustrations",
    icon: "/images/figma/e447f75c001f7ad49918c6dd48d0219d69a220e1.svg",
  },
  {
    title: "Starter accessories",
    desc: "Needles, caps and components",
    icon: "/images/figma/a83ffce70a350043217c379ed1e6ac5bf3ed89aa.svg",
  },
  {
    title: "Device passport / batch card",
    desc: "With QR verification",
    icon: "/images/figma/76231626c15b815c695ea47c5d56c318fc3efe2b.svg",
  },
  {
    title: "Premium storage box",
    desc: "Keep everything organized",
    icon: "/images/figma/f4da166c1fb9f9ef9a1afb3b3c95c5b5f13207a0.svg",
  },
]

const SPECIFICATIONS = [
  { label: "Compatibility", value: "PEPTECH® refill cartridges" },
  { label: "Dosage format", value: "0.5 mL per cartridge" },
  { label: "Materials", value: "Medical-grade aluminum & polymer" },
  { label: "Storage", value: "Room temperature (15-30°C)" },
  { label: "Batch no.", value: "PT-PS-001" },
  { label: "SKU", value: "PPS-1000" },
  { label: "Quality verified", value: "✓ Lab tested & certified", isVerified: true },
]

export function ProductSpecsGrid() {
  return (
    <section className="bg-white py-[40px] sm:py-[60px] flex items-center justify-center border-t border-[#e2e8f0]">
      <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Card 1: What's Included - Figma Node 8:41171 */}
          <div className="bg-[#f0f6fa] rounded-[16px] p-[24px] flex flex-col justify-between h-[440px]">
            <h3 className="font-bold text-[#0b1f3a] text-[18px]">
              What&apos;s Included
            </h3>
            
            <div className="flex flex-col gap-[14px]">
              {WHATS_INCLUDED.map((item) => (
                <div key={item.title} className="flex gap-[14px] items-center">
                  <div className="size-[22px] shrink-0 flex items-center justify-center">
                    <img src={item.icon} alt="" className="size-full object-contain" />
                  </div>
                  <div className="flex flex-col gap-[2px]">
                    <p className="font-bold text-[#0b1f3a] text-[13px] leading-tight">
                      {item.title}
                    </p>
                    <p className="font-normal text-[#64748b] text-[11px] leading-tight">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div />
          </div>

          {/* Card 2: Product Specifications - Figma Node 8:41219 */}
          <div className="bg-[#f0f6fa] rounded-[16px] p-[24px] flex flex-col justify-between h-[440px]">
            <h3 className="font-bold text-[#0b1f3a] text-[18px]">
              Product Specifications
            </h3>

            {/* Spec Table */}
            <div className="bg-white border border-[#e2e8f0] rounded-[8px] divide-y divide-[#f1f5f9] text-[12px] overflow-hidden">
              {SPECIFICATIONS.map((spec) => (
                <div key={spec.label} className="h-[38px] px-[12px] flex items-center justify-between">
                  <span className="font-bold text-[#0b1f3a]">{spec.label}</span>
                  <span className={spec.isVerified ? "font-semibold text-[#10b981]" : "font-normal text-[#475569]"}>
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Spec Actions */}
            <div className="flex flex-col gap-[10px] items-center w-full">
              <Link
                href="/how-it-works"
                className="bg-white border-[1.5px] border-[#0b1f3a] hover:bg-slate-50 transition-colors h-[40px] rounded-[8px] w-full flex items-center justify-center font-semibold text-[#0b1f3a] text-[13px]"
              >
                View Instructions
              </Link>
              <Link
                href="/lab-reports"
                className="flex items-center justify-center gap-[6px] text-[#0b1f3a] font-bold text-[12px] hover:underline"
              >
                <img src="/images/figma/da58770694e401a2ec342338375af2dcbb0245e7.svg" alt="" className="size-[16px]" />
                <span>Download Spec Sheet</span>
              </Link>
            </div>
          </div>

          {/* Card 3: Lab Tested. Trusted Worldwide. - Figma Node 8:41254 */}
          <div className="bg-[#f0f6fa] rounded-[16px] p-[24px] flex flex-col justify-between h-[440px]">
            
            {/* Header Row */}
            <div className="flex gap-[14px] items-center">
              <div className="size-[56px] relative shrink-0">
                <Image
                  src="/images/figma/193d65bceacadbc722edc3f3480325e2589acdd5.png"
                  alt="Quality Shield"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="font-bold text-[#0b1f3a] text-[18px] leading-[24px]">
                <p className="mb-0">Lab Tested.</p>
                <p>Trusted Worldwide.</p>
              </div>
            </div>

            {/* Text description */}
            <p className="font-normal text-[#475569] text-[13px] leading-[20px]">
              Each PEPTECH® system is manufactured to the highest standards and undergoes rigorous quality control.
            </p>

            {/* Certifications Box */}
            <div className="flex flex-col gap-[18px] items-start pt-[10px] w-full">
              
              {/* Row 1: ISO, FDA, CE */}
              <div className="flex items-center justify-between w-full">
                <div className="h-[46px] w-[75px] relative">
                  <Image
                    src="/images/figma/d6bd95c062c2ee427e921e165a1f427fe65cdee7.png"
                    alt="ISO 9001 Certified"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="w-px h-[36px] bg-[#d1e0ed]" />
                <div className="h-[46px] w-[105px] relative">
                  <Image
                    src="/images/figma/eb63da58b5d162a3095f09aec9680e6c3185d7d2.png"
                    alt="FDA Registered Facility"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="w-px h-[36px] bg-[#d1e0ed]" />
                <div className="h-[42px] w-[65px] relative">
                  <Image
                    src="/images/figma/490a0cba1a3627d46d9eaf115d0d21770c5db3d6.png"
                    alt="CE Mark"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Row 2: GMP Certified + Facility Notice */}
              <div className="flex gap-[18px] items-center justify-center w-full">
                <div className="size-[56px] relative shrink-0">
                  <Image
                    src="/images/figma/1dc687223f02fed54dba36db7e7bf6b45a6f76f8.png"
                    alt="GMP Certified"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="w-px h-[44px] bg-[#d1e0ed]" />
                <div className="flex flex-col gap-[2px] items-start leading-tight text-[#0b1f3a]">
                  <p className="font-semibold text-[10px] tracking-[0.8px]">
                    MADE IN A
                  </p>
                  <p className="font-bold text-[13px] tracking-[0.6px]">
                    FDA REGISTERED
                  </p>
                  <p className="font-semibold text-[10px] tracking-[0.8px]">
                    FACILITY
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
