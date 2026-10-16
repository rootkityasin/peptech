"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { VerifySkeleton } from "@/components/ui/Skeletons"
import { verifyProductIdentifier, VerificationResult } from "@/lib/customer-api"

function VerifyContent() {
  const searchParams = useSearchParams()
  const initialQuery =
    searchParams.get("serial") ||
    searchParams.get("batch") ||
    searchParams.get("code") ||
    searchParams.get("id") ||
    ""

  const [inputCode, setInputCode] = useState(initialQuery)
  const [activeCode, setActiveCode] = useState(initialQuery)
  const [loading, setLoading] = useState(false)
  const [resultState, setResultState] = useState<"none" | "verified" | "revoked" | "unverified">(
    "none"
  )
  const [verifyData, setVerifyData] = useState<VerificationResult | null>(null)

  const handleVerify = async (query: string) => {
    const trimmed = query.trim()
    if (!trimmed) {
      setResultState("none")
      setVerifyData(null)
      return
    }

    setActiveCode(trimmed)
    setLoading(true)

    try {
      const res = await verifyProductIdentifier(trimmed)
      setVerifyData(res)

      if (res.verified) {
        setResultState("verified")
      } else if (res.revoked) {
        setResultState("revoked")
      } else {
        setResultState("unverified")
      }
    } catch (e) {
      console.error("Verification error:", e)
      setResultState("unverified")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialQuery) {
      setInputCode(initialQuery)
      handleVerify(initialQuery)
    }
  }, [searchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleVerify(inputCode)
  }

  return (
    <div className="bg-[#f8fafc] flex flex-col items-center w-full min-h-[calc(100vh-118px)]">
      {/* Verify Hero Section */}
      <section
        className={`w-full flex flex-col gap-[32px] items-center justify-center px-4 sm:px-8 pt-[60px] sm:pt-[80px] transition-all duration-300 ${
          resultState === "none" ? "pb-[380px] lg:pb-[460px]" : "pb-[80px]"
        }`}
      >
        {/* Section Heading */}
        <div className="flex flex-col items-center justify-center text-center space-y-2 max-w-2xl">
          <span className="inline-block text-[12px] font-bold text-[#16A6A3] tracking-[1.4px] uppercase">
            AUTHENTICITY &amp; DEVICE VERIFICATION
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#0B1F3A] leading-[1.15] tracking-tight uppercase">
            Verify Your PEPTECH® Product
          </h1>
          <p className="text-sm text-slate-500 max-w-lg">
            Enter your Device Passport Serial Number or Batch Lot Number to authenticate genuine laboratory equipment.
          </p>
        </div>

        {/* Search Form Container */}
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
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Enter Serial Number or Batch ID..."
                className="w-full h-full bg-transparent border-none outline-hidden text-[#0b1f3a] text-[15px] placeholder-[#94a3b8] font-normal"
              />
              {inputCode && (
                <button
                  type="button"
                  onClick={() => {
                    setInputCode("")
                    setResultState("none")
                    setVerifyData(null)
                  }}
                  className="text-slate-400 hover:text-slate-600 text-xs px-1"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#0b1f3a] hover:bg-[#162a45] active:scale-[0.99] transition-all flex h-[52px] items-center justify-center px-[32px] rounded-[10px] shrink-0 cursor-pointer shadow-xs disabled:opacity-75"
            >
              <span className="font-semibold text-[15px] text-center text-white whitespace-nowrap">
                {loading ? "Verifying..." : "Verify"}
              </span>
            </button>
          </form>
        </div>

        {/* Sample Code Helper */}
        {resultState === "none" && (
          <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap justify-center">
            <span>Sample batch lot numbers:</span>
            <button
              type="button"
              onClick={() => {
                setInputCode("RT-2609A")
                handleVerify("RT-2609A")
              }}
              className="px-3 py-1 bg-white border border-slate-200 hover:border-[#16a6a3] rounded-full text-[#0b1f3a] text-[12px] font-semibold transition-colors"
            >
              RT-2609A
            </button>
            <button
              type="button"
              onClick={() => {
                setInputCode("TRZ-2026-08B")
                handleVerify("TRZ-2026-08B")
              }}
              className="px-3 py-1 bg-white border border-slate-200 hover:border-[#16a6a3] rounded-full text-[#0b1f3a] text-[12px] font-semibold transition-colors"
            >
              TRZ-2026-08B
            </button>
          </div>
        )}

        {/* VERIFIED RESULT CARD */}
        {resultState === "verified" && (
          <div className="w-full max-w-[720px] bg-white rounded-[20px] pb-[36px] pt-[40px] px-5 sm:px-[32px] shadow-sm flex flex-col gap-[24px] items-center animate-in fade-in zoom-in-95 duration-200 border border-emerald-100">
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
                  {verifyData?.type === "device_passport" ? "AUTHENTIC DEVICE PASSPORT" : "AUTHENTIC RESEARCH PRODUCT"}
                </p>
                <p className="font-extrabold text-[#10b981] text-[28px] sm:text-[32px] tracking-[3.5px]">
                  VERIFIED
                </p>
              </div>

              {/* Subtitle */}
              <div className="font-medium text-[#64748b] text-[13px] sm:text-[13.5px] text-center leading-[20px] max-w-md">
                <p className="mb-0">Thank you for authenticating your PEPTECH® product.</p>
                <p>
                  {verifyData?.type === "device_passport"
                    ? "Individually identified precision device passport registered in our official master database."
                    : "Genuine research peptide lot manufactured under strict laboratory standards."}
                </p>
              </div>
            </div>

            {/* 4 Trust Pillars Strip */}
            <div className="bg-[#f8fafc] w-full max-w-[656px] min-h-[76px] py-2 rounded-[12px] grid grid-cols-2 sm:grid-cols-4 items-center justify-between px-[10px] gap-2 border border-slate-100">
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
                  <p className="mb-0">NFC &amp; QR</p>
                  <p>ENCRYPTED</p>
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
                  <p className="mb-0">RUO QUALITY</p>
                  <p>STANDARDS</p>
                </div>
              </div>
            </div>

            {/* Product Details Container */}
            <div className="bg-[#f8fafc] w-full max-w-[656px] rounded-[16px] px-4 sm:px-[24px] py-[20px] flex flex-col gap-[14px] border border-slate-100">
              {/* Details Header */}
              <div className="flex gap-[16px] h-[20px] items-center justify-center w-full">
                <div className="h-px flex-1 bg-[#e2e8f0]" />
                <p className="font-bold text-[#0b1f3a] text-[11.5px] tracking-[2px] whitespace-nowrap">
                  AUTHENTICATION DETAILS
                </p>
                <div className="h-px flex-1 bg-[#e2e8f0]" />
              </div>

              {/* Row - Serial Number / Identifier */}
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
                      {verifyData?.type === "device_passport" ? "Device Passport Serial" : "Identifier Code"}
                    </p>
                    <p className="font-mono font-bold text-[#0b1f3a] text-[15px] tracking-[0.5px]">
                      {verifyData?.serial_number || activeCode}
                    </p>
                  </div>
                </div>
                <div className="bg-[#ecfdf5] flex items-center px-[12px] py-[5px] rounded-[14px] shrink-0 border border-emerald-200">
                  <p className="font-bold text-[#059669] text-[10.5px] tracking-[0.5px]">
                    ✓ &nbsp;VERIFIED
                  </p>
                </div>
              </div>

              <div className="h-px w-full bg-[#e2e8f0]" />

              {/* Row - Product Name / Model */}
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
                      Product Model / System
                    </p>
                    <p className="font-bold text-[#0b1f3a] text-[14px] tracking-[0.2px]">
                      {verifyData?.product_name || "PEPTECH® Reusable Precision Pen 1.0"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-px w-full bg-[#e2e8f0]" />

              {/* Row - Batch Lot Number */}
              <div className="flex h-[28px] items-center justify-between w-full">
                <div className="flex gap-[14px] items-center">
                  <p className="font-normal text-[#64748b] text-[13px]">
                    Associated Batch Lot #
                  </p>
                </div>
                <p className="font-mono font-semibold text-[#0b1f3a] text-[14px]">
                  {verifyData?.batch_number || "RT-2609A"}
                </p>
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
                  {verifyData?.manufacture_date || "01/2026"}
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
                    Expiry / Validity Date
                  </p>
                </div>
                <p className="font-semibold text-[#0b1f3a] text-[14px]">
                  {verifyData?.expiry_date || "01/2029"}
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
                    Registry Status
                  </p>
                </div>
                <p className="font-bold text-[#059669] text-[14px]">
                  {verifyData?.status || "Authentic & Safe"}
                </p>
              </div>
            </div>

            {/* Showcase Row: Product Kit Image + Holographic Seal */}
            <div className="flex flex-col sm:flex-row gap-[16px] w-full max-w-[656px]">
              {/* Product Kit Image Card */}
              <div className="relative rounded-[14px] bg-gradient-to-b from-[#fbfcfe] via-white to-[#f4f7fb] w-full sm:w-[448px] h-[185px] overflow-hidden border border-slate-200 shadow-2xs p-3 flex items-center justify-center">
                <img
                  alt="PEPTECH Product Kit"
                  className="w-full h-full object-contain"
                  src="/images/products/pen-sets/pt-141.png"
                />
              </div>

              {/* Holographic Security Seal Card */}
              <div className="bg-[#f8fafc] flex flex-col gap-[8px] h-[185px] items-center justify-center pb-[12px] pt-[14px] rounded-[14px] w-full sm:w-[192px] shrink-0 border border-slate-100">
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
                  <p className="font-extrabold text-[#0b1f3a] text-[8.5px] tracking-[1.2px] whitespace-nowrap">
                    SCAN TO VERIFY
                  </p>
                </div>
                <p className="font-bold text-[#64748b] text-[8.5px] tracking-[0.8px] whitespace-nowrap">
                  HOLOGRAPHIC SECURITY SEAL
                </p>
              </div>
            </div>

            {/* Quality & Research Assurance Callout */}
            <div className="bg-[#f0fdf4] flex flex-col sm:flex-row gap-[16px] items-start sm:items-center px-[20px] py-[16px] rounded-[14px] w-full max-w-[656px] border border-emerald-200">
              <div className="bg-[#10b981] overflow-hidden rounded-full shrink-0 w-[38px] h-[38px] flex items-center justify-center">
                <img
                  alt="Security Check"
                  className="w-[38px] h-[38px]"
                  src="/images/figma/2f3d62df04c1949f14cdcdbfffe94d942390706c.svg"
                />
              </div>
              <div className="flex flex-col gap-[3px] items-start">
                <p className="font-bold text-[#065f46] text-[12px] tracking-[1.5px]">
                  PEPTECH® QUALITY GUARANTEE
                </p>
                <div className="font-normal text-[#475569] text-[11.5px] leading-[16px]">
                  <p className="mb-0">
                    Every genuine PEPTECH® precision pen is individually serialised and paired with a physical Device Passport.
                  </p>
                  <p>All items are for laboratory research use only (RUO).</p>
                </div>
              </div>
            </div>

            {/* Bottom Actions Link */}
            <div className="flex items-center justify-between w-full max-w-[656px] pt-2 text-xs">
              <Link
                href="/lab-reports"
                className="text-[#16a6a3] hover:text-[#0b1f3a] font-semibold transition-colors flex items-center gap-1.5"
              >
                <span>View Full HPLC / Mass Spectrometry Reports</span>
                <span>→</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setResultState("none")
                  setInputCode("")
                  setVerifyData(null)
                }}
                className="text-slate-400 hover:text-slate-600 font-medium transition-colors"
              >
                Search Another Serial / Batch
              </button>
            </div>
          </div>
        )}

        {/* REVOKED PASSPORT STATE */}
        {resultState === "revoked" && (
          <div className="w-full max-w-[680px] bg-white rounded-[20px] p-8 sm:p-10 shadow-sm border border-amber-300 flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-2xl font-bold">
              ⚠️
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0b1f3a]">
                Device Passport Flagged or Revoked ({activeCode})
              </h2>
              <p className="text-slate-600 text-sm mt-2 max-w-md mx-auto leading-relaxed">
                {verifyData?.message ||
                  `The serial number "${activeCode}" was located in our database but has been marked as revoked or quarantined by PEPTECH Quality Assurance.`}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setResultState("none")
                  setInputCode("")
                  setVerifyData(null)
                }}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
              >
                Verify Another Serial
              </button>
              <a
                href={`mailto:support@peptech.bio?subject=Revoked%20Device%20Passport%20Inquiry%20${encodeURIComponent(activeCode)}`}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors"
              >
                Contact PEPTECH Support
              </a>
            </div>
          </div>
        )}

        {/* UNVERIFIED STATE */}
        {resultState === "unverified" && (
          <div className="w-full max-w-[680px] bg-white rounded-[20px] p-8 sm:p-10 shadow-sm border border-rose-200 flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-2xl font-bold">
              ✕
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0b1f3a]">
                Identifier Not Recognized ({activeCode})
              </h2>
              <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto leading-relaxed">
                The serial number or batch code you entered could not be authenticated in the official PEPTECH® registry. Please verify the exact code printed on your physical Device Passport card or packaging QR seal.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setResultState("none")
                  setInputCode("")
                  setVerifyData(null)
                }}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
              >
                Try Another Code
              </button>
              <a
                href={`mailto:support@peptech.bio?subject=Counterfeit%20or%20Unverified%20Serial%20Inquiry%20${encodeURIComponent(activeCode)}`}
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
    <Suspense fallback={<VerifySkeleton />}>
      <VerifyContent />
    </Suspense>
  )
}
