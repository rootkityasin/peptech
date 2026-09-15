"use client"

import React from "react"
import Link from "next/link"

export function ResourceCardsSection() {
  return (
    <section className="py-14 bg-slate-50/70 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Lab Reports & Certificates */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <span className="text-3xl">📄</span>
              <h3 className="font-black text-sm text-[#0B1F3A]">
                Lab Reports &amp; Certificates
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Access our latest quality certificates, COAs and compliance documents.
              </p>
            </div>
            <Link
              href="/lab-reports"
              className="mt-5 text-xs font-bold text-[#0B1F3A] hover:text-[var(--color-brand-teal)] transition-colors flex items-center gap-1"
            >
              <span>View Documents</span>
              <span>→</span>
            </Link>
          </div>

          {/* Card 2: Verify Authenticity */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <span className="text-3xl">📱</span>
              <h3 className="font-black text-sm text-[#0B1F3A]">
                Verify Authenticity
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Scan your QR code to verify product authenticity and batch information.
              </p>
            </div>
            <Link
              href="/verify"
              className="mt-5 text-xs font-bold text-[#0B1F3A] hover:text-[var(--color-brand-teal)] transition-colors flex items-center gap-1"
            >
              <span>Learn More</span>
              <span>→</span>
            </Link>
          </div>

          {/* Card 3: Need Help? */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <span className="text-3xl">💬</span>
              <h3 className="font-black text-sm text-[#0B1F3A]">
                Need Help?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our technical support team is here to assist your research laboratory.
              </p>
            </div>
            <div className="mt-5 flex items-center gap-4 text-xs font-bold text-[#0B1F3A]">
              <Link href="/contact" className="hover:underline">Chat Live</Link>
              <span className="text-slate-300">|</span>
              <a href="mailto:info@peptech.bio" className="hover:underline">Email Us</a>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-normal">+1 (800) 123-4567</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
