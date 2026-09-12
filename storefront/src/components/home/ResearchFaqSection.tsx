"use client"

import React, { useState } from "react"

interface FaqItem {
  question: string
  answer: string
}

const FAQS: FaqItem[] = [
  {
    question: "How does the PEPTECH reusable pen system work?",
    answer:
      "First-time researchers order the Complete Pen Set, which includes our durable aerospace-grade precision aluminum pen, prefilled cartridge, needles, and device passport. Keep the pen in your laboratory and reorder only the compatible Refill Cartridges as needed—either as one-off orders or on our 28-day Subscribe & Save schedule with 10% savings.",
  },
  {
    question: "What does the discreet outer packaging look like?",
    answer:
      "All orders are shipped in plain, unmarked, tamper-evident protective outer boxes. There is zero peptide, chemical, or PEPTECH branding on the exterior label. The package appears as standard parcels dispatched via Royal Mail Tracked (£4.95 UK / £15 Worldwide).",
  },
  {
    question: "How do 28-day subscriptions work? Can I pause or cancel?",
    answer:
      "Subscriptions apply to Refill Cartridges and Freeze-Dried Vials at a 10% discount. Orders automatically renew and dispatch every 28 days. You have full self-service control inside your Customer Account to pause, skip an upcoming delivery, change your next dispatch date, or cancel at any time with zero cancellation fees.",
  },
  {
    question: "How do I verify the authenticity and purity of my batch?",
    answer:
      "Each unit features a serialized batch number and packaging QR code. Visit our searchable Lab Reports Library (/lab-reports) or scan your box with our Mobile QR Scanner (/verify) to instantly view and download third-party HPLC and Mass Spectrometry certificates showing verified purity ≥99%.",
  },
  {
    question: "What are the storage guidelines for peptides in transit?",
    answer:
      "Lyophilised (freeze-dried) peptide vials are stable at ambient room temperatures during standard Royal Mail 24/48h transit. Upon arrival at your research facility, compounds should be stored in a dry, dark environment at -20°C for maximum long-term stability.",
  },
  {
    question: "What is the legal classification and compliance policy?",
    answer:
      "All PEPTECH products are sold strictly for in-vitro laboratory research, scientific inquiry, and analytical evaluation. Products are strictly not for human or animal consumption, diagnostic, medical, or therapeutic use. Buyers must be 18+ and acknowledge research terms at checkout.",
  },
]

export function ResearchFaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx)
  }

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
      <div className="text-center space-y-1">
        <div className="text-[11px] font-bold text-[var(--color-brand-teal)] uppercase tracking-wider">
          Support &amp; Protocols
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
          Everything you need to know regarding dispatch, the reusable pen system, and laboratory compliance.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIdx === idx
          return (
            <div
              key={idx}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden transition-all shadow-xs"
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 hover:text-[var(--color-brand-teal)] transition-colors cursor-pointer"
              >
                <span>{faq.question}</span>
                <span className={`text-zinc-400 transform transition-transform duration-200 ${isOpen ? "rotate-180 text-[var(--color-brand-teal)]" : ""}`}>
                  ▼
                </span>
              </button>

              {isOpen && (
                <div className="px-4 pb-5 sm:px-5 sm:pb-6 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800 pt-3 animate-in fade-in">
                  {faq.answer}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
