"use client"

import React from "react"

export function TrustBadgesStrip() {
  const badges = [
    { icon: "📦", title: "Discreet Delivery", desc: "Plain packaging worldwide" },
    { icon: "🚚", title: "Track Your Order", desc: "Real-time shipping updates" },
    { icon: "👤", title: "Manage Your Account", desc: "Subscriptions & orders" },
    { icon: "🎧", title: "Expert Support", desc: "Chat, email or phone" },
    { icon: "🔒", title: "Secure Checkout", desc: "Your data is protected" },
  ]

  return (
    <section className="py-8 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {badges.map((b) => (
            <div key={b.title} className="flex items-center gap-3 p-2">
              <span className="text-2xl shrink-0">{b.icon}</span>
              <div>
                <div className="text-xs font-bold text-[#0B1F3A]">{b.title}</div>
                <div className="text-[10px] text-slate-500">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
