"use client"

import React from "react"

export function PeptechJourney() {
  const steps = [
    {
      num: 1,
      title: "Buy your Complete Pen Set once",
      desc: "Get everything you need to get started.",
      icon: "📦",
    },
    {
      num: 2,
      title: "Use your reusable PEPTECH® pen",
      desc: "Accurate. Reliable. Built to last.",
      icon: "🖊️",
    },
    {
      num: 3,
      title: "Return to order Refill Cartridges",
      desc: "When needed. Save with subscription options.",
      icon: "💧",
    },
  ]

  return (
    <section className="py-14 bg-slate-50/70 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-black text-[#0B1F3A] tracking-tight">
            Your PEPTECH® Journey
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Simple. Sustainable. Designed for the long term.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex items-start gap-4 shadow-xs"
            >
              <div className="w-10 h-10 rounded-full bg-[#0B1F3A] text-white font-black text-sm flex items-center justify-center shrink-0">
                {step.num}
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-[#0B1F3A]">{step.title}</h4>
                <p className="text-xs text-slate-500">{step.desc}</p>
              </div>
              <span className="text-2xl ml-auto opacity-70 shrink-0">{step.icon}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
