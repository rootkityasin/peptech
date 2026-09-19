"use client"

import React, { useState } from "react"
import Link from "next/link"

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

  const [submitted, setSubmitted] = useState(false)
  const [ticketRef, setTicketRef] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) return

    const generatedRef = "PEP-INQ-" + Math.floor(10000 + Math.random() * 90000)
    setTicketRef(generatedRef)
    setSubmitted(true)
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


          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0b1f3a]">
            Contact Cambridge Research Hub
          </h1>

          <p className="text-sm sm:text-base text-[#475569] max-w-2xl leading-relaxed">
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
                    <span className="text-xs font-bold font-mono text-emerald-700 uppercase tracking-widest">
                      INQUIRY LOGGED &amp; DISPATCHED
                    </span>
                    <h3 className="text-2xl font-black text-[#0b1f3a]">Thank You, {formData.name}</h3>
                    <p className="text-xs sm:text-sm text-[#475569] max-w-md mx-auto leading-relaxed">
                      Your inquiry has been assigned ticket reference <strong className="font-mono text-[#0b1f3a]">{ticketRef}</strong>. A scientific support coordinator will review your request and reply to <span className="font-semibold text-[#0b1f3a]">{formData.email}</span> within 2 hours.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-[#bbf7d0] text-xs text-[#64748b] text-left max-w-md mx-auto space-y-1 font-mono">
                    <div className="flex justify-between"><span>Reference:</span> <span className="font-bold text-[#0b1f3a]">{ticketRef}</span></div>
                    <div className="flex justify-between"><span>Category:</span> <span className="capitalize">{formData.inquiryType.replace("_", " ")}</span></div>
                    <div className="flex justify-between"><span>Status:</span> <span className="text-emerald-600 font-bold">In Laboratory Queue</span></div>
                  </div>

                  <button
                    onClick={() => {
                      setSubmitted(false)
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
                    className="px-6 py-2.5 rounded-xl bg-[#0b1f3a] hover:bg-[#16a6a3] text-white font-bold text-xs transition-colors shadow-xs"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white border border-[#e2e8f0] rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
                  <div className="space-y-1 border-b border-[#e2e8f0] pb-4">
                    <h3 className="text-xl font-bold text-[#0b1f3a]">Send a Laboratory Inquiry</h3>
                    <p className="text-xs text-[#64748b]">Fill in your research facility details below for prompt review.</p>
                  </div>

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
                        placeholder="j.doe@cambridge.ac.uk"
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
                      <select
                        value={formData.inquiryType}
                        onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-xs bg-white focus:outline-hidden focus:border-[#16a6a3] focus:ring-1 focus:ring-[#16a6a3]"
                      >
                        <option value="order_support">Active Order &amp; Delivery Status</option>
                        <option value="coa_batch">Certificate of Analysis (COA) / Batch Verification</option>
                        <option value="institutional_po">Institutional Purchase Order (Net-30 PO)</option>
                        <option value="hardware_specs">Reusable Pen Hardware &amp; Cartridge Specs</option>
                        <option value="bulk_trial">Bulk Research Trial Procurement</option>
                        <option value="other">General Scientific Support</option>
                      </select>
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
                      className="w-full px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-xs font-mono focus:outline-hidden focus:border-[#16a6a3] focus:ring-1 focus:ring-[#16a6a3]"
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
                    className="w-full py-3.5 rounded-xl bg-[#0b1f3a] hover:bg-[#16a6a3] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center"
                  >
                    <span>Submit Laboratory Inquiry</span>
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
                  <span className="text-[11px] font-bold font-mono tracking-widest text-black uppercase block">
                    DIRECT CONTACT
                  </span>
                  <h4 className="text-xl font-bold text-black tracking-tight">
                    PEPTECH BioSciences Ltd
                  </h4>
                  <p className="text-xs text-slate-500">
                    Cambridge Science Park, United Kingdom
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
                      <strong className="block text-black font-semibold">Direct Email</strong>
                      <a href="mailto:info@peptech.bio" className="text-black font-medium hover:underline font-mono text-xs mt-0.5 block">
                        info@peptech.bio
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

                  {/* Facility Address */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-lg border border-[#e2e8f0] bg-white flex items-center justify-center text-black shrink-0 shadow-2xs">
                      <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <strong className="block text-black font-semibold">Facility Address</strong>
                      <address className="not-italic text-slate-600 leading-relaxed block mt-0.5">
                        PEPTECH BioSciences Ltd<br />
                        Cambridge Science Park, Milton Road<br />
                        Cambridge CB4 0FW, United Kingdom
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
                  We support accredited academic universities, clinical trial centres, and registered biopharma companies with institutional Net-30 purchase orders. Submit your formal PO with billing contact to <a href="mailto:info@peptech.bio" className="font-medium text-black underline hover:text-slate-800">info@peptech.bio</a>.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
