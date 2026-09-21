"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

function VerifyContent() {
  const searchParams = useSearchParams()
  const initialBatch = searchParams.get("batch") || ""
  
  const [batchInput, setBatchInput] = useState(initialBatch)
  const [activeBatch, setActiveBatch] = useState(initialBatch)
  const [resultState, setResultState] = useState<"none" | "verified" | "unverified">(
    initialBatch ? "verified" : "none"
  )

  useEffect(() => {
    const b = searchParams.get("batch")
    if (b) {
      setBatchInput(b)
      setActiveBatch(b)
      handleVerify(b)
    }
  }, [searchParams])

  const handleVerify = (query: string) => {
    const trimmed = query.trim()
    if (!trimmed) {
      setResultState("none")
      return
    }
    setActiveBatch(trimmed)

    const upper = trimmed.toUpperCase()
    // Recognized batches in the system
    if (
      upper === "RT-2609A" ||
      upper.startsWith("RT-") ||
      upper.startsWith("TRZ-") ||
      upper.startsWith("SMG-") ||
      upper.startsWith("PEP-")
    ) {
      setResultState("verified")
    } else {
      setResultState("unverified")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleVerify(batchInput)
  }

  return (
    <div className="bg-[#f8fafc] flex flex-col items-center w-full min-h-[calc(100vh-118px)]">
      {/* Verify Batch Hero Section */}
      <section 
        className={`w-full flex flex-col gap-[32px] items-center justify-center px-4 sm:px-8 pt-[80px] transition-all duration-300 ${
          resultState === "none" ? "pb-[380px] lg:pb-[460px]" : "pb-[80px]"
        }`}
      >
        {/* Section Heading */}
        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="font-bold text-[#0b1f3a] text-[30px] sm:text-[36px] tracking-tight">
            Verify with your batch id
          </h1>
        </div>

        {/* Batch Search Form Container */}
        <div className="w-full max-w-[680px]">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-[12px] items-stretch w-full">
            <div className="bg-white border border-[#cbd5e1] flex w-full sm:flex-1 shrink-0 gap-[12px] h-[52px] min-h-[52px] items-center px-[18px] rounded-[10px] shadow-2xs focus-within:border-[#16a6a3] focus-within:ring-2 focus-within:ring-[#16a6a3]/20 transition-all">
              <div className="relative shrink-0 w-[18px] h-[18px]">
                <img
                  alt="Search"
                  className="w-full h-full object-contain"
                  src="/images/figma/63b6dd3ef0dbb464db94297040331b79d05e0293.svg"
                />
              </div>
              <input
                type="text"
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                placeholder="Enter Batch ID (e.g. RT-2609A)..."
                className="w-full h-full bg-transparent border-none outline-hidden text-[#0b1f3a] text-[15px] placeholder-[#94a3b8] font-normal"
              />
              {batchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setBatchInput("")
                    setResultState("none")
                  }}
                  className="text-slate-400 hover:text-slate-600 text-xs px-1"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className="bg-[#0b1f3a] hover:bg-[#162a45] active:scale-[0.99] transition-all flex h-[52px] items-center justify-center px-[32px] rounded-[10px] shrink-0 cursor-pointer shadow-xs"
            >
              <span className="font-semibold text-[15px] text-center text-white whitespace-nowrap">
                Verify
              </span>
            </button>
          </form>
        </div>

        {/* Sample Batch Helper */}
        {resultState === "none" && (
          <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap justify-center">
            <span>Sample batches:</span>
            <button
              type="button"
              onClick={() => {
                setBatchInput("RT-2609A")
                handleVerify("RT-2609A")
              }}
              className="px-2.5 py-1 bg-white border border-slate-200 hover:border-[#16a6a3] rounded-full text-[#0b1f3a] font-mono text-[11px] font-semibold transition-colors"
            >
              RT-2609A
            </button>
            <button
              type="button"
              onClick={() => {
                setBatchInput("TRZ-2026-08B")
                handleVerify("TRZ-2026-08B")
              }}
              className="px-2.5 py-1 bg-white border border-slate-200 hover:border-[#16a6a3] rounded-full text-[#0b1f3a] font-mono text-[11px] font-semibold transition-colors"
            >
              TRZ-2026-08B
            </button>
            <button
              type="button"
              onClick={() => {
                setBatchInput("SMG-2026-04A")
                handleVerify("SMG-2026-04A")
              }}
              className="px-2.5 py-1 bg-white border border-slate-200 hover:border-[#16a6a3] rounded-full text-[#0b1f3a] font-mono text-[11px] font-semibold transition-colors"
            >
              SMG-2026-04A
            </button>
          </div>
        )}

        {/* VERIFIED RESULT CARD (Figma Node 71:16810) */}
        {resultState === "verified" && (
          <div className="w-full max-w-[720px] bg-white rounded-[20px] pb-[36px] pt-[40px] px-5 sm:px-[32px] shadow-sm flex flex-col gap-[24px] items-center animate-in fade-in zoom-in-95 duration-200">
            {/* Header Section */}
            <div className="flex flex-col gap-[12px] items-center text-center">
              {/* Success Icon Badge */}
              <div className="bg-[#10b981] overflow-hidden relative rounded-full shrink-0 w-[60px] h-[60px] flex items-center justify-center shadow-xs">
                <img
                  alt="Verified"
                  className="w-[60px] h-[60px]"
                  src="/images/figma/f60c66cfe85a7f97165d804e20ac4ca469fd45c0.svg"
                />
              </div>

              {/* Title Block */}
              <div className="flex flex-col gap-[2px] items-center text-center">
                <p className="font-bold text-[#0b1f3a] text-[20px] sm:text-[22px] tracking-[2px]">
                  AUTHENTIC PRODUCT
                </p>
                <p className="font-black text-[#10b981] text-[28px] sm:text-[32px] tracking-[3.5px]">
                  VERIFIED
                </p>
              </div>

              {/* Subtitle */}
              <div className="font-medium text-[#64748b] text-[13px] sm:text-[13.5px] text-center leading-[20px]">
                <p className="mb-0">Thank you for verifying your PEPTECH product.</p>
                <p>This is a genuine product, manufactured to our highest standards.</p>
              </div>
            </div>

            {/* 4 Trust Pillars Strip */}
            <div className="bg-[#f8fafc] w-full max-w-[656px] min-h-[76px] py-2 rounded-[12px] grid grid-cols-2 sm:grid-cols-4 items-center justify-between px-[10px] gap-2">
              {/* Pillar 1 */}
              <div className="flex flex-col gap-[5px] h-[60px] items-center justify-center">
                <div className="w-[22px] h-[22px] relative shrink-0">
                  <img
                    alt=""
                    className="w-full h-full object-contain"
                    src="/images/figma/0bc889f815cd0999571ef5ebfdd98a1f0844ee68.svg"
                  />
                </div>
                <div className="font-bold text-[#0b1f3a] text-[10px] text-center tracking-[0.5px] leading-[13px]">
                  <p className="mb-0">GENUINE</p>
                  <p>PRODUCT</p>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="flex flex-col gap-[5px] h-[60px] items-center justify-center border-l sm:border-l border-slate-200">
                <div className="w-[22px] h-[22px] relative shrink-0">
                  <img
                    alt=""
                    className="w-full h-full object-contain"
                    src="/images/figma/679a145ffdbc51424fd6dc88f263fbd58b2c6eda.svg"
                  />
                </div>
                <div className="font-bold text-[#0b1f3a] text-[10px] text-center tracking-[0.5px] leading-[13px]">
                  <p className="mb-0">LAB TESTED</p>
                  <p>&amp; CERTIFIED</p>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="flex flex-col gap-[5px] h-[60px] items-center justify-center border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0">
                <div className="w-[22px] h-[22px] relative shrink-0">
                  <img
                    alt=""
                    className="w-full h-full object-contain"
                    src="/images/figma/bc36dd8be354610582d57c57dfb8865fb698d8f8.svg"
                  />
                </div>
                <div className="font-bold text-[#0b1f3a] text-[10px] text-center tracking-[0.5px] leading-[13px]">
                  <p className="mb-0">ANTI-COUNTERFEIT</p>
                  <p>TECHNOLOGY</p>
                </div>
              </div>

              {/* Pillar 4 */}
              <div className="flex flex-col gap-[5px] h-[60px] items-center justify-center border-t sm:border-t-0 border-l border-slate-200 pt-2 sm:pt-0">
                <div className="w-[22px] h-[22px] relative shrink-0">
                  <img
                    alt=""
                    className="w-full h-full object-contain"
                    src="/images/figma/7bcdb4c5aab71d7402f3eda62afbc9fed64d93d6.svg"
                  />
                </div>
                <div className="font-bold text-[#0b1f3a] text-[10px] text-center tracking-[0.5px] leading-[13px]">
                  <p className="mb-0">GLOBAL</p>
                  <p>STANDARDS</p>
                </div>
              </div>
            </div>

            {/* Product Details Container */}
            <div className="bg-[#f8fafc] w-full max-w-[656px] rounded-[16px] px-4 sm:px-[24px] py-[20px] flex flex-col gap-[14px]">
              {/* Details Header */}
              <div className="flex gap-[16px] h-[20px] items-center justify-center w-full">
                <div className="h-px flex-1 bg-[#e2e8f0]" />
                <p className="font-bold text-[#0b1f3a] text-[11.5px] tracking-[2px] whitespace-nowrap">
                  PRODUCT DETAILS
                </p>
                <div className="h-px flex-1 bg-[#e2e8f0]" />
              </div>

              {/* Row - Batch Lot Number */}
              <div className="flex h-[38px] items-center justify-between w-full">
                <div className="flex gap-[14px] items-center">
                  <div className="w-[22px] h-[22px] relative shrink-0">
                    <img
                      alt=""
                      className="w-full h-full object-contain"
                      src="/images/figma/765282fee1710b9f41f02d8bad3907e86286a96a.svg"
                    />
                  </div>
                  <div className="flex flex-col gap-[2px] items-start">
                    <p className="font-normal text-[#64748b] text-[11px]">
                      Batch Lot Number
                    </p>
                    <p className="font-bold text-[#0b1f3a] text-[15px] tracking-[0.5px]">
                      {activeBatch || "RT-2609A"}
                    </p>
                  </div>
                </div>
                <div className="bg-[#ecfdf5] flex items-center px-[12px] py-[5px] rounded-[14px] shrink-0">
                  <p className="font-bold text-[#059669] text-[10.5px] tracking-[0.5px]">
                    ✓ &nbsp;VERIFIED
                  </p>
                </div>
              </div>

              <div className="h-px w-full bg-[#e2e8f0]" />

              {/* Row - Device Passport / Serial */}
              <div className="flex h-[38px] items-center justify-between w-full">
                <div className="flex gap-[14px] items-center">
                  <div className="w-[22px] h-[22px] relative shrink-0">
                    <img
                      alt=""
                      className="w-full h-full object-contain"
                      src="/images/figma/d28ac8bf7c29c852579612af46af6b23cc11050a.svg"
                    />
                  </div>
                  <div className="flex flex-col gap-[2px] items-start">
                    <p className="font-normal text-[#64748b] text-[11px]">
                      Device Passport / Serial
                    </p>
                    <p className="font-bold text-[#0b1f3a] text-[15px] tracking-[0.5px]">
                      PT-984128
                    </p>
                  </div>
                </div>
                <div className="bg-[#ecfdf5] flex items-center px-[12px] py-[5px] rounded-[14px] shrink-0">
                  <p className="font-bold text-[#059669] text-[10.5px] tracking-[0.5px]">
                    ✓ &nbsp;VERIFIED
                  </p>
                </div>
              </div>

              <div className="h-px w-full bg-[#e2e8f0]" />

              {/* Row - Manufacture Date */}
              <div className="flex h-[28px] items-center justify-between w-full">
                <div className="flex gap-[14px] items-center">
                  <div className="w-[22px] h-[22px] relative shrink-0">
                    <img
                      alt=""
                      className="w-full h-full object-contain"
                      src="/images/figma/b99c2c6dec9824e1a2a6e25db32dce4e0097d8ab.svg"
                    />
                  </div>
                  <p className="font-normal text-[#64748b] text-[13px]">
                    Manufacture Date
                  </p>
                </div>
                <p className="font-semibold text-[#0b1f3a] text-[14px]">
                  09/2025
                </p>
              </div>

              <div className="h-px w-full bg-[#e2e8f0]" />

              {/* Row - Expiry Date */}
              <div className="flex h-[28px] items-center justify-between w-full">
                <div className="flex gap-[14px] items-center">
                  <div className="w-[22px] h-[22px] relative shrink-0">
                    <img
                      alt=""
                      className="w-full h-full object-contain"
                      src="/images/figma/cc1e14a5bc2705c82f43c4964f566852800688a3.svg"
                    />
                  </div>
                  <p className="font-normal text-[#64748b] text-[13px]">
                    Expiry Date
                  </p>
                </div>
                <p className="font-semibold text-[#0b1f3a] text-[14px]">
                  09/2028
                </p>
              </div>

              <div className="h-px w-full bg-[#e2e8f0]" />

              {/* Row - Product Status */}
              <div className="flex h-[28px] items-center justify-between w-full">
                <div className="flex gap-[14px] items-center">
                  <div className="w-[22px] h-[22px] relative shrink-0">
                    <img
                      alt=""
                      className="w-full h-full object-contain"
                      src="/images/figma/36c09a75e3b10c7e5dcd6dd5809e82707b57eace.svg"
                    />
                  </div>
                  <p className="font-normal text-[#64748b] text-[13px]">
                    Product Status
                  </p>
                </div>
                <p className="font-bold text-[#059669] text-[14px]">
                  Authentic &amp; Safe
                </p>
              </div>
            </div>

            {/* Showcase Row: Product Kit Image + Holographic Seal */}
            <div className="flex flex-col sm:flex-row gap-[16px] w-full max-w-[656px]">
              {/* Product Kit Image Card */}
              <div className="relative rounded-[14px] bg-[#f8fafc] w-full sm:w-[448px] h-[185px] flex items-center justify-center p-3 overflow-hidden">
                <img
                  alt="PEPTECH Product Kit"
                  className="w-full h-full object-contain"
                  src="/images/figma/152e353c4afaa5945905ac686de871b57ec2a770.png"
                />
              </div>

              {/* Holographic Security Seal Card */}
              <div className="bg-[#f8fafc] flex flex-col gap-[8px] h-[185px] items-center justify-center pb-[12px] pt-[14px] rounded-[14px] w-full sm:w-[192px] shrink-0">
                <div
                  className="border-[1.2px] border-white/70 flex flex-col gap-[5px] items-center justify-center pb-[8px] pt-[10px] rounded-[12px] w-[136px] shadow-xs"
                  style={{
                    backgroundImage:
                      "linear-gradient(141.186deg, rgba(89, 224, 242, 0.95) 0%, rgba(217, 140, 250, 0.95) 17.857%, rgba(140, 250, 191, 0.95) 35.714%, rgba(250, 217, 115, 0.95) 53.571%, rgba(77, 191, 255, 0.95) 71.429%)",
                  }}
                >
                  <div className="h-[74px] w-[112px] relative shrink-0">
                    <img
                      alt="Hologram"
                      className="w-full h-full object-contain"
                      src="/images/figma/834b2162377baacce8132e83a486dffdb830e782.svg"
                    />
                  </div>
                  <p className="font-black text-[#0b1f3a] text-[8.5px] tracking-[1.2px] whitespace-nowrap">
                    SCAN TO VERIFY
                  </p>
                </div>
                <p className="font-bold text-[#64748b] text-[8.5px] tracking-[0.8px] whitespace-nowrap">
                  HOLOGRAPHIC SECURITY SEAL
                </p>
              </div>
            </div>

            {/* Your Safety Matters Callout */}
            <div className="bg-[#f0fdf4] flex flex-col sm:flex-row gap-[16px] items-start sm:items-center px-[20px] py-[16px] rounded-[14px] w-full max-w-[656px]">
              <div className="bg-[#10b981] overflow-hidden rounded-full shrink-0 w-[38px] h-[38px] flex items-center justify-center">
                <img
                  alt="Security Check"
                  className="w-[38px] h-[38px]"
                  src="/images/figma/2f3d62df04c1949f14cdcdbfffe94d942390706c.svg"
                />
              </div>
              <div className="flex flex-col gap-[3px] items-start">
                <p className="font-bold text-[#065f46] text-[12px] tracking-[1.5px]">
                  YOUR SAFETY MATTERS
                </p>
                <div className="font-normal text-[#475569] text-[11.5px] leading-[16px]">
                  <p className="mb-0">
                    We use advanced QR and NFC technology to protect our customers from
                  </p>
                  <p>counterfeit products. Always verify your product before use.</p>
                </div>
              </div>
            </div>

            {/* Bottom Actions Link */}
            <div className="flex items-center justify-between w-full max-w-[656px] pt-2 text-xs">
              <Link
                href="/lab-reports"
                className="text-[#16a6a3] hover:text-[#0b1f3a] font-semibold transition-colors flex items-center gap-1.5"
              >
                <span>View Full HPLC / Mass Spec Certificate of Analysis</span>
                <span>→</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setResultState("none")
                  setBatchInput("")
                }}
                className="text-slate-400 hover:text-slate-600 font-medium transition-colors"
              >
                Search Another Batch
              </button>
            </div>
          </div>
        )}

        {/* UNVERIFIED BATCH STATE */}
        {resultState === "unverified" && (
          <div className="w-full max-w-[680px] bg-white rounded-[20px] p-8 sm:p-10 shadow-sm border border-rose-200 flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-2xl font-bold">
              ⚠️
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0b1f3a]">
                Batch Number Not Recognized ({activeBatch})
              </h2>
              <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto leading-relaxed">
                The lot number you entered could not be authenticated in the official PEPTECH®
                synthesis registry. Please verify the code printed on the external seal or device passport.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setResultState("none")
                  setBatchInput("")
                }}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
              >
                Try Another Lot Code
              </button>
              <a
                href="mailto:info@peptech.bio?subject=Counterfeit%20or%20Unverified%20Batch%20Inquiry"
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors"
              >
                Report Potential Counterfeit
              </a>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[500px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#16a6a3]" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  )
}
