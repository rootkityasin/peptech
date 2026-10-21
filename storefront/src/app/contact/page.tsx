"use client"

import React, { useState } from "react"
import Link from "next/link"
import { CustomSelect } from "@/components/ui/CustomSelect"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    institution: "",
    email: "",
    inquiryType: "order_support",
    referenceId: "",
    message: "",
    ruoAgreement: false,
  })

  const [honeypot, setHoneypot] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [ticketRef, setTicketRef] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) return
    if (!formData.ruoAgreement) {
      setErrorMessage("Please confirm the 18+ Research Use Only compliance policy.")
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          _fax_verification: honeypot,
        }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to submit laboratory inquiry. Please try again.")
      }

      setTicketRef(data.ticketRef || "PEP-INQ-" + Math.floor(10000 + Math.random() * 90000))
      setSubmitted(true)
    } catch (err: any) {
      setErrorMessage(err.message || "Connection error. Please try again or email support@peptech.bio directly.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* 01 Breadcrumb Bar */}
      <div className="bg-[#f8fafc] border-b border-[#e2e8f0] py-3.5">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-[13px] text-[#64748b]">
            <Link href="/" className="hover:text-[#0b1f3a] transition-colors">Home</Link>
            <span>/</span>
            <span className="font-semibold text-[#0b1f3a]">Contact Us</span>
          </div>
        </div>
      </div>

      {/* 02 Header Section */}
      <section className="bg-gradient-to-b from-[#f8fafc] to-white border-b border-[#e2e8f0] py-12 sm:py-16">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="inline-block text-[12px] font-bold text-[#16A6A3] tracking-[1.2px] uppercase">
            LABORATORY SUPPORT
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#0B1F3A] leading-[1.15] tracking-tight uppercase">
            Contact PEPTECH Laboratory Support
          </h1>

          <p className="text-xs sm:text-[14px] text-[#64748B] leading-[22px] max-w-2xl">
            Have questions regarding batch lots, cold-chain logistics, institutional Net-30 purchase orders, or hardware compatibility? Our laboratory support team is on hand.
          </p>
        </div>
      </section>

      {/* 03 Main Contact Grid */}
      <section className="py-12 sm:py-16">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left: Contact Form Column */}
            <div className="lg:col-span-7">
              {submitted ? (
                <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-3xl p-8 sm:p-10 space-y-6 text-center animate-in fade-in zoom-in-95">
                  <div className="w-16 h-16 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center text-3xl font-bold shadow-md">
                    ✓
                  </div>
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest">
                      INQUIRY LOGGED &amp; DISPATCHED
                    </span>
                    <h3 className="text-2xl font-extrabold text-[#0b1f3a]">Thank You, {formData.name}</h3>
                    <p className="text-xs sm:text-sm text-[#475569] max-w-md mx-auto leading-relaxed">
                      Your inquiry has been assigned ticket reference <strong className="text-[#0b1f3a]">{ticketRef}</strong>. A scientific support coordinator will review your request and reply to <span className="font-semibold text-[#0b1f3a]">{formData.email}</span> within 2 hours.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-[#bbf7d0] text-xs text-[#64748b] text-left max-w-md mx-auto space-y-1">
                    <div className="flex justify-between"><span>Reference:</span> <span className="font-bold text-[#0b1f3a]">{ticketRef}</span></div>
                    <div className="flex justify-between"><span>Category:</span> <span className="capitalize">{formData.inquiryType.replace("_", " ")}</span></div>
                    <div className="flex justify-between"><span>Status:</span> <span className="text-emerald-600 font-bold">In Laboratory Queue</span></div>
                  </div>

                  <button
                    onClick={() => {
                      setSubmitted(false)
                      setErrorMessage(null)
                      setHoneypot("")
                      setFormData({
                        name: "",
                        institution: "",
                        email: "",
                        inquiryType: "order_support",
                        referenceId: "",
                        message: "",
                        ruoAgreement: false,
                      })
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#0b1f3a] hover:bg-[#16a6a3] text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white border border-[#e2e8f0] rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
                  {/* Honeypot field invisible to humans for bot protection */}
                  <input
                    type="text"
                    name="_fax_verification"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    style={{ display: "none" }}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                  />

                  <div className="space-y-1 border-b border-[#e2e8f0] pb-4">
                    <h3 className="text-xl font-bold text-[#0b1f3a]">Send a Laboratory Inquiry</h3>
                    <p className="text-xs text-[#64748b]">Fill in your research facility details below for prompt review.</p>
                  </div>

                  {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-4 rounded-xl flex items-start gap-2.5 animate-in fade-in duration-200">
                      <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0b1f3a] uppercase tracking-wider block">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Dr. Jane Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-xs focus:outline-hidden focus:border-[#16a6a3] focus:ring-1 focus:ring-[#16a6a3]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0b1f3a] uppercase tracking-wider block">
                        Work / Academic Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="researcher@institution.ac.uk"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-xs focus:outline-hidden focus:border-[#16a6a3] focus:ring-1 focus:ring-[#16a6a3]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0b1f3a] uppercase tracking-wider block">
                        Institution / Laboratory
                      </label>
                      <input
                        type="text"
                        placeholder="Biomedical Science Park Lab"
                        value={formData.institution}
                        onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-xs focus:outline-hidden focus:border-[#16a6a3] focus:ring-1 focus:ring-[#16a6a3]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0b1f3a] uppercase tracking-wider block">
                        Inquiry Category *
                      </label>
                      <CustomSelect
                        value={formData.inquiryType}
                        onChange={(val) => setFormData({ ...formData, inquiryType: val })}
                        options={[
                          { value: "order_support", label: "Active Order & Delivery Status" },
                          { value: "coa_batch", label: "Certificate of Analysis (COA) / Batch Verification" },
                          { value: "institutional_po", label: "Institutional Purchase Order (Net-30 PO)" },
                          { value: "hardware_specs", label: "Reusable Pen Hardware & Cartridge Specs" },
                          { value: "bulk_trial", label: "Bulk Research Trial Procurement" },
                          { value: "other", label: "General Scientific Support" },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#0b1f3a] uppercase tracking-wider block">
                      Order Number or Batch ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. #PEP-89241 or RT-2609A"
                      value={formData.referenceId}
                      onChange={(e) => setFormData({ ...formData, referenceId: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-xs focus:outline-hidden focus:border-[#16a6a3] focus:ring-1 focus:ring-[#16a6a3]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#0b1f3a] uppercase tracking-wider block">
                      Message &amp; Inquiry Details *
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Please specify your question, trial requirements, or order inquiry..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-xs focus:outline-hidden focus:border-[#16a6a3] focus:ring-1 focus:ring-[#16a6a3]"
                    />
                  </div>

                  {/* RUO Confirmation Checkbox */}
                  <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={formData.ruoAgreement}
                        onChange={(e) => setFormData({ ...formData, ruoAgreement: e.target.checked })}
                        className="mt-0.5 rounded text-[#16a6a3] focus:ring-[#16a6a3]"
                      />
                      <span className="text-xs text-[#475569] leading-relaxed">
                        I confirm that this inquiry pertains strictly to <strong>in-vitro scientific, educational, or laboratory research</strong>, and agree to PEPTECH's 18+ research use compliance policy.
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-[#0b1f3a] hover:bg-[#16a6a3] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <span>Submit Laboratory Inquiry</span>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Right: Direct Contacts & Laboratory Info */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Facility Details Box */}
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 space-y-6">
                {/* Structured Header */}
                <div className="border-b border-[#e2e8f0] pb-5 space-y-1">
                  <span className="text-[11px] font-bold tracking-widest text-[#16a6a3] uppercase block">
                    DIRECT CONTACT &amp; TRADING ENTITY
                  </span>
                  <h4 className="text-xl font-bold text-black tracking-tight">
                    PEPTECH®
                  </h4>
                  <p className="text-xs text-slate-600">
                    PEPTECH LTD
                  </p>
                </div>

                {/* Structured Info Rows with Black Icons */}
                <div className="space-y-4 text-xs">
                  {/* Direct Email */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-lg border border-[#e2e8f0] bg-white flex items-center justify-center text-black shrink-0 shadow-2xs">
                      <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <strong className="block text-black font-semibold">Direct Support Email</strong>
                      <a href="mailto:support@peptech.bio" className="text-black font-medium hover:underline text-xs mt-0.5 block">
                        support@peptech.bio
                      </a>
                    </div>
                  </div>

                  {/* Laboratory Support Hours */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-lg border border-[#e2e8f0] bg-white flex items-center justify-center text-black shrink-0 shadow-2xs">
                      <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <strong className="block text-black font-semibold">Laboratory Support Hours</strong>
                      <span className="text-slate-600 block mt-0.5">Monday – Friday: 08:00 – 18:00 GMT</span>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">Average response SLA: &lt; 2 Hours</p>
                    </div>
                  </div>

                  {/* Registered Trading Address */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-lg border border-[#e2e8f0] bg-white flex items-center justify-center text-black shrink-0 shadow-2xs">
                      <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <strong className="block text-black font-semibold">Registered Correspondence Address</strong>
                      <address className="not-italic text-slate-600 leading-relaxed block mt-0.5">
                        PEPTECH LTD<br />
                        Office 17 Ips Innovate, Chartermark Way<br />
                        Colburn Business Park, DL9 4QJ, Colburn<br />
                        United Kingdom
                      </address>
                    </div>
                  </div>
                </div>

                {/* Quick Link Cards */}
                <div className="pt-2 grid grid-cols-2 gap-3 border-t border-[#e2e8f0]">
                  <Link
                    href="/account?tab=orders"
                    className="p-3 rounded-xl bg-white border border-[#e2e8f0] hover:border-black text-center transition-all block group"
                  >
                    <span className="block text-[10px] font-bold text-slate-500 uppercase">Orders</span>
                    <span className="text-xs font-bold text-black group-hover:underline">Track Parcel</span>
                  </Link>
                  <Link
                    href="/verify"
                    className="p-3 rounded-xl bg-white border border-[#e2e8f0] hover:border-black text-center transition-all block group"
                  >
                    <span className="block text-[10px] font-bold text-slate-500 uppercase">Packaging</span>
                    <span className="text-xs font-bold text-black group-hover:underline">Verify Batch</span>
                  </Link>
                </div>
              </div>

              {/* Net-30 Purchase Orders Box (No #0B1F3A, No INSTITUTIONAL BILLING, clean black text) */}
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 space-y-3">
                <h5 className="font-bold text-base text-black">Net-30 Purchase Orders</h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  We support accredited academic universities, clinical trial centres, and registered biopharma companies with institutional Net-30 purchase orders. Submit your formal PO with billing contact to <a href="mailto:support@peptech.bio" className="font-medium text-black underline hover:text-slate-800">support@peptech.bio</a>.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
