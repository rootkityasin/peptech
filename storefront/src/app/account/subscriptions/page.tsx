"use client"

import React, { useState } from "react"
import Link from "next/link"

interface Subscription {
  id: string
  productTitle: string
  format: string
  strength: string
  frequency: string
  price: number
  nextRenewalDate: string
  status: "Active" | "Paused" | "Skipped"
}

export default function SubscriptionsDashboardPage() {
  const [subs, setSubs] = useState<Subscription[]>([
    {
      id: "sub-101",
      productTitle: "PEPTECH Refill Cartridge — Retatrutide",
      format: "Refill Cartridge",
      strength: "10mg",
      frequency: "Every 28 Days",
      price: 21.60,
      nextRenewalDate: "10 October 2026",
      status: "Active",
    },
    {
      id: "sub-102",
      productTitle: "Semaglutide Lyophilised Vial",
      format: "Freeze-Dried Vial",
      strength: "10mg",
      frequency: "Every 28 Days",
      price: 12.96,
      nextRenewalDate: "14 October 2026",
      status: "Active",
    },
  ])

  const [message, setMessage] = useState<string | null>(null)

  const handleAction = (id: string, action: "pause" | "resume" | "skip" | "cancel") => {
    setSubs((prev) =>
      prev
        .map((sub) => {
          if (sub.id !== id) return sub
          if (action === "pause") {
            setMessage(`Subscription ${sub.productTitle} has been paused.`)
            return { ...sub, status: "Paused" as const }
          }
          if (action === "resume") {
            setMessage(`Subscription ${sub.productTitle} resumed. Next renewal: ${sub.nextRenewalDate}.`)
            return { ...sub, status: "Active" as const }
          }
          if (action === "skip") {
            setMessage(`Upcoming dispatch on ${sub.nextRenewalDate} has been skipped.`)
            return { ...sub, status: "Skipped" as const }
          }
          if (action === "cancel") {
            setMessage(`Subscription ${sub.productTitle} cancelled successfully.`)
            return null
          }
          return sub
        })
        .filter(Boolean) as Subscription[]
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[var(--color-brand-teal)]/10 text-[var(--color-brand-teal)] uppercase tracking-wider font-mono inline-block">
          CUSTOMER SELF-SERVICE PORTAL
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Manage 28-Day Subscriptions
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500">
          Self-service controls to pause, skip, adjust dates, or cancel recurring research orders without contacting customer support.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex justify-between items-center animate-in fade-in">
          <span>✓ {message}</span>
          <button onClick={() => setMessage(null)} className="text-xs text-zinc-400 hover:text-zinc-600">✕</button>
        </div>
      )}

      {/* Subscription Cards */}
      <div className="space-y-4">
        {subs.map((sub) => (
          <div
            key={sub.id}
            className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{sub.productTitle}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                      sub.status === "Active"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : sub.status === "Paused"
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-zinc-500/10 text-zinc-500"
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>
                <div className="text-xs text-zinc-500 font-mono mt-0.5">
                  Format: {sub.format} • Strength: {sub.strength} • Frequency: {sub.frequency}
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="font-mono font-black text-base text-[var(--color-brand-navy)] dark:text-zinc-100">
                  £{sub.price.toFixed(2)}
                </span>
                <span className="text-[10px] text-zinc-400 block font-mono">10% Subscribe &amp; Save</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-xs flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <span className="text-zinc-500">
                Next Scheduled Charge &amp; Royal Mail Dispatch: <strong className="text-zinc-900 dark:text-zinc-100 font-mono">{sub.nextRenewalDate}</strong>
              </span>
              <span className="text-[10px] text-zinc-400">Email reminder sent 3 days prior</span>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
              {sub.status === "Active" ? (
                <button
                  onClick={() => handleAction(sub.id, "pause")}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold"
                >
                  Pause Subscription
                </button>
              ) : (
                <button
                  onClick={() => handleAction(sub.id, "resume")}
                  className="px-3 py-1.5 rounded-lg bg-[var(--color-brand-teal)] text-white font-semibold"
                >
                  Resume Subscription
                </button>
              )}

              <button
                onClick={() => handleAction(sub.id, "skip")}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold"
              >
                Skip Next Shipment
              </button>

              <button
                onClick={() => handleAction(sub.id, "cancel")}
                className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-semibold ml-auto"
              >
                Cancel Subscription
              </button>
            </div>
          </div>
        ))}

        {subs.length === 0 && (
          <div className="p-12 text-center rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 space-y-3">
            <div className="text-3xl">📦</div>
            <h3 className="font-bold text-base">You have no active subscriptions</h3>
            <p className="text-xs text-zinc-500">
              Refill Cartridges and Freeze-Dried Vials can be subscribed to for 10% automatic recurring savings.
            </p>
            <div className="pt-2">
              <Link href="/refills" className="px-5 py-2.5 rounded-xl bg-[var(--color-brand-teal)] text-white font-bold text-xs inline-block">
                Browse Refill Cartridges →
              </Link>
            </div>
          </div>
        )}
      </div>

    </main>
  )
}
