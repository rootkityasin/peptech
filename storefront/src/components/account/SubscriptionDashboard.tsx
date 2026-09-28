"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { commerceRequest } from "@/lib/stripe-checkout"
import { ScheduleConfigurationPanel } from "./ScheduleConfigurationPanel"
import { DosageProtocolModal } from "./DosageProtocolModal"
import { VisaBadge, MastercardBadge, AmexBadge, JcbBadge } from "@/components/ui/PaymentBadges"

function CardBrandBadge({ brand, className = "w-[36px] h-[22px]" }: { brand?: string; className?: string }) {
  const b = (brand || "").toLowerCase()
  if (b.includes("mastercard") || b.includes("mc")) {
    return <MastercardBadge className={className} monochrome />
  }
  if (b.includes("amex") || b.includes("american express")) {
    return <AmexBadge className={className} monochrome />
  }
  if (b.includes("jcb")) {
    return <JcbBadge className={className} monochrome />
  }
  return <VisaBadge className={className} monochrome />
}

export interface SubscriptionDashboardProps {
  token: string
  onSwitchTab?: (tab: any) => void
}

export function SubscriptionDashboard({ token, onSwitchTab }: SubscriptionDashboardProps) {
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [savedAddresses, setSavedAddresses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [busySubId, setBusySubId] = useState<string | null>(null)

  // Filters: "active" | "paused" | "past"
  const [filter, setFilter] = useState<"active" | "paused" | "past">("active")

  // Expanded Inline Schedule State (sub ID)
  const [expandedScheduleSubId, setExpandedScheduleSubId] = useState<string | null>(null)

  // Dosage Modal state
  const [selectedSubForDosage, setSelectedSubForDosage] = useState<any | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError("")
    try {
      const [subsRes, pmsRes, addrsRes] = await Promise.all([
        commerceRequest("/store/custom/subscriptions", token).catch(() => ({ subscriptions: [] })),
        commerceRequest("/store/custom/payment-methods", token).catch(() => ({ payment_methods: [] })),
        commerceRequest("/store/customers/me/addresses", token).catch(() => ({ addresses: [] })),
      ])

      if (Array.isArray(subsRes?.subscriptions)) {
        setSubscriptions(subsRes.subscriptions)
      }
      if (Array.isArray(pmsRes?.payment_methods)) {
        setPaymentMethods(pmsRes.payment_methods)
      }
      if (Array.isArray(addrsRes?.addresses)) {
        setSavedAddresses(addrsRes.addresses)
      }
    } catch (e: any) {
      setError(e instanceof Error ? e.message : "Failed to load subscription protocols")
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Execute subscription command (pause, resume, skip, cancel, change_cadence, change_date, update_dosage)
  const handleCommand = async (subId: string, action: string, extraPayload: Record<string, any> = {}) => {
    setBusySubId(subId)
    setError("")
    setSuccessMsg("")

    const operationId = crypto.randomUUID()
    try {
      const res = await commerceRequest(
        "/store/custom/subscriptions",
        token,
        {
          subscription_id: subId,
          operation_id: operationId,
          action,
          ...extraPayload,
        },
        "PUT"
      )

      if (res?.subscription) {
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === subId ? { ...s, ...res.subscription } : s))
        )
      }
      setSuccessMsg(`Subscription protocol ${action.replace("_", " ")} completed successfully.`)
      setExpandedScheduleSubId(null)
      setSelectedSubForDosage(null)
    } catch (e: any) {
      setError(e instanceof Error ? e.message : `Failed to execute ${action}`)
    } finally {
      setBusySubId(null)
    }
  }

  // Filter subscriptions
  const activeSubs = subscriptions.filter((s) => s.control !== "paused" && !["canceled", "incomplete_expired"].includes(s.status))
  const pausedSubs = subscriptions.filter((s) => s.control === "paused")
  const pastSubs = subscriptions.filter((s) => ["canceled", "incomplete_expired"].includes(s.status) || s.control === "canceling")

  const displayedSubs =
    filter === "active" ? activeSubs : filter === "paused" ? pausedSubs : pastSubs

  const primarySub = displayedSubs[0] || subscriptions[0] || null
  const defaultCard = paymentMethods[0] || null
  const defaultAddress = savedAddresses[0] || null

  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full animate-in fade-in duration-200">
      {/* Top Filter Pills & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* Filter Pills with horizontal smooth scroll on mobile */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
          <button
            type="button"
            onClick={() => setFilter("active")}
            className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 border ${
              filter === "active"
                ? "bg-[#0B1F3A] text-white border-[#0B1F3A] shadow-xs"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            Active Protocols ({activeSubs.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("paused")}
            className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 border ${
              filter === "paused"
                ? "bg-[#0B1F3A] text-white border-[#0B1F3A] shadow-xs"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            Paused ({pausedSubs.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("past")}
            className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 border ${
              filter === "past"
                ? "bg-[#0B1F3A] text-white border-[#0B1F3A] shadow-xs"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            Past / Ended ({pastSubs.length})
          </button>
        </div>

        {/* Add Refill CTA Button */}
        <Link
          href="/refills"
          className="inline-flex items-center justify-center gap-2 bg-[#0B1F3A] hover:bg-[#132a4a] text-white font-bold text-xs px-4 sm:px-5 py-2.5 rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs w-full sm:w-auto"
        >
          <span className="text-sm font-normal">+</span>
          <span>Add Cartridge Refill</span>
        </Link>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-4 rounded-xl">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="bg-[#E6FFFA] border border-[#16A6A3] text-[#0B1F3A] text-xs font-semibold p-4 rounded-xl">
          ✓ {successMsg}
        </div>
      )}

      {/* Main 2-Column Dashboard Grid */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-100 flex items-center justify-center text-slate-500 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-[#16A6A3] border-t-transparent rounded-full animate-spin" />
            <span>Loading active research subscriptions...</span>
          </div>
        </div>
      ) : displayedSubs.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-100 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-slate-50 flex items-center justify-center text-[#16A6A3]">
            <svg className="w-6 sm:w-7 h-6 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h3 className="font-bold text-[#0B1F3A] text-base sm:text-lg">
            No {filter === "active" ? "Active" : filter === "paused" ? "Paused" : "Past"} Subscriptions
          </h3>
          <p className="text-slate-500 text-xs max-w-md leading-relaxed">
            Automated 28-day replenishment locks in continuous cold-chain stock allocation with a 10% discount on refill cartridges and laboratory vials.
          </p>
          <Link
            href="/refills"
            className="mt-2 bg-[#16A6A3] hover:bg-[#138d8a] text-white text-xs font-semibold px-6 py-2.5 rounded-lg transition-colors"
          >
            Explore Compatible Refills →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* ========================================================================= */}
          {/* LEFT COLUMN: Subscription Protocol Cards (lg:col-span-8)                 */}
          {/* ========================================================================= */}
          <div className="lg:col-span-8 space-y-6">
            {displayedSubs.map((sub) => {
              const cardLast4 = sub.payment_method?.last4 || defaultCard?.last4 || "1234"
              const cardBrand = sub.payment_method?.brand || defaultCard?.brand || "visa"
              const isExpanded = expandedScheduleSubId === sub.id

              return (
                <div key={sub.id} className="space-y-3">
                  {/* Protocol Card Container */}
                  <div className="bg-white rounded-2xl p-5 sm:p-7 lg:p-8 border border-slate-200/80 shadow-xs space-y-5">
                    {/* Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-[#0B1F3A]">{sub.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {sub.cadence_days || 28}-Day Automated Cycle · Subscription ID #{sub.sub_display_id || sub.id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                      <span className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-full self-start sm:self-auto border ${
                        sub.control === "paused"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-[#E6FFFA] text-[#0B1F3A] border-[#16A6A3]/40"
                      }`}>
                        {sub.control === "paused" ? "Paused Subscription" : "Active Subscription"}
                      </span>
                    </div>

                    {/* Nested Product Box */}
                    <div className="bg-slate-50/70 rounded-xl p-4 sm:p-5 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                        <div className="w-12 sm:w-14 h-12 sm:h-14 bg-white rounded-lg border border-slate-200/80 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                          <Image
                            src="/images/figma/0e71e8560b9bae80ee21a3d08905300075c266b7.png"
                            alt={sub.product_name || "Product"}
                            width={48}
                            height={48}
                            className="object-contain h-full w-auto"
                          />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-[#0B1F3A] truncate">{sub.product_name || sub.title}</h4>
                          <p className="text-[11.5px] sm:text-xs text-slate-500 leading-snug">
                            Protocol: {sub.protocol_info || "0.25mg Weekly Escalation Protocol · 4 Doses / Refill"}
                          </p>
                          <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                            Ships to: {sub.recipient_facility || "Cambridge Science Park"} ({sub.recipient_name || "Primary Investigator"})
                          </p>
                        </div>
                      </div>

                      <div className="text-left sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between">
                        <p className="font-bold text-sm sm:text-base text-[#0B1F3A]">£{Number(sub.price || 0).toFixed(2)}</p>
                        <span className="text-[10.5px] sm:text-[11px] text-[#16A6A3] font-semibold block">
                          per {sub.cadence_days || 28}-day cycle (-{sub.locked_discount_pct || 10}%)
                        </span>
                      </div>
                    </div>

                    {/* Next Cold-Chain Dispatch & Auto-Billing Highlight Banner */}
                    <div className="bg-[#E6FFFA]/80 border border-[#16A6A3]/30 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 sm:gap-2 text-xs font-semibold text-[#0B1F3A]">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-[#16A6A3] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Next Cold-Chain Dispatch: {sub.nextDispatchDate || "Wednesday, 14 October 2026"}</span>
                      </div>
                      <span className="text-slate-600 font-normal text-[11.5px] sm:text-xs">
                        Auto-billed to {cardBrand.toUpperCase()} ...{cardLast4} on {sub.autoBillDate || sub.nextBillingDate || "13 Oct"}
                      </span>
                    </div>

                    {/* Action Buttons Row - Mobile Optimized */}
                    <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
                      <button
                        type="button"
                        disabled={busySubId === sub.id}
                        onClick={() => setExpandedScheduleSubId(isExpanded ? null : sub.id)}
                        className={`font-bold text-xs px-4 sm:px-5 py-2.5 rounded-lg transition-all cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2 w-full sm:w-auto ${
                          isExpanded
                            ? "bg-[#16A6A3] text-white shadow-xs"
                            : "bg-[#0B1F3A] hover:bg-[#132a4a] text-white"
                        }`}
                      >
                        <span>{isExpanded ? "Close Schedule Panel" : "Manage Refill Schedule"}</span>
                        <svg
                          className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        disabled={busySubId === sub.id}
                        onClick={() => handleCommand(sub.id, "skip")}
                        className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 text-center w-full sm:w-auto"
                      >
                        {busySubId === sub.id ? "Processing..." : "Skip Next Cycle"}
                      </button>
                      <button
                        type="button"
                        disabled={busySubId === sub.id}
                        onClick={() => setSelectedSubForDosage(sub)}
                        className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 text-center w-full sm:w-auto"
                      >
                        Update Dosage Protocol
                      </button>
                      {sub.control === "paused" && (
                        <button
                          type="button"
                          disabled={busySubId === sub.id}
                          onClick={() => handleCommand(sub.id, "resume")}
                          className="bg-[#16A6A3] hover:bg-[#138d8a] text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer text-center w-full sm:w-auto"
                        >
                          Resume Protocol →
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Smooth Animated Inline Expansion Container */}
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isExpanded
                        ? "grid-rows-[1fr] opacity-100 mt-2"
                        : "grid-rows-[0fr] opacity-0 pointer-events-none"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <ScheduleConfigurationPanel
                        subscription={sub}
                        onClose={() => setExpandedScheduleSubId(null)}
                        onSaveSchedule={async (cadence, targetDate) => {
                          await handleCommand(sub.id, targetDate ? "change_date" : "change_cadence", {
                            cadence_days: cadence,
                            ...(targetDate ? { date: targetDate } : {}),
                          })
                          setExpandedScheduleSubId(null)
                        }}
                        onPause={async (months) => {
                          await handleCommand(sub.id, "pause", { pause_duration_months: months })
                          setExpandedScheduleSubId(null)
                        }}
                        onCancelSub={async () => {
                          await handleCommand(sub.id, "cancel")
                          setExpandedScheduleSubId(null)
                        }}
                        isBusy={busySubId === sub.id}
                      />
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Active Subscriber Protection & Benefits Section */}
            <div className="bg-white rounded-2xl p-5 sm:p-7 lg:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <h4 className="font-bold text-sm text-[#0B1F3A] tracking-tight">Active Subscriber Protection & Benefits</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-xs font-bold text-[#0B1F3A] flex items-center gap-1.5">
                    <span className="text-[#16A6A3]">✓</span> Guaranteed Cold Stock
                  </span>
                  <p className="text-[11.5px] text-slate-500 leading-relaxed">
                    Reserved batch vials prioritized before public catalog availability.
                  </p>
                </div>
                <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-xs font-bold text-[#0B1F3A] flex items-center gap-1.5">
                    <span className="text-[#16A6A3]">✓</span> Free Tracked 24 Cold-Chain
                  </span>
                  <p className="text-[11.5px] text-slate-500 leading-relaxed">
                    Refrigerated thermal shipper included free on every 28-day cycle.
                  </p>
                </div>
                <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-xs font-bold text-[#0B1F3A] flex items-center gap-1.5">
                    <span className="text-[#16A6A3]">✓</span> -10% Locked Pricing
                  </span>
                  <p className="text-[11.5px] text-slate-500 leading-relaxed">
                    Discounted subscription rate locked for the lifetime of the active protocol.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: Sidebar Widgets (lg:col-span-4)                              */}
          {/* ========================================================================= */}
          <div className="lg:col-span-4 space-y-6">
            {/* Widget 1: Refill Subscription Overview */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-[#0B1F3A]">Refill Subscription Overview</h4>
                <span className="text-[10px] font-bold text-[#16A6A3] bg-[#E6FFFA] px-2 py-0.5 rounded-full border border-[#16A6A3]/30">
                  {activeSubs.length} ACTIVE
                </span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Active Cycles</span>
                  <span className="font-bold text-[#0B1F3A]">{activeSubs.length} Protocol{activeSubs.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Replenishment Cycle</span>
                  <span className="font-bold text-[#0B1F3A]">Every {primarySub?.cadence_days || 28} Days</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Next Billing Date</span>
                  <span className="font-bold text-[#0B1F3A]">{primarySub?.nextBillingDate || "13 Oct 2026"}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Estimated Delivery</span>
                  <span className="font-bold text-[#0B1F3A]">{primarySub?.estimatedDeliveryDate || "15 Oct 2026"}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Recurring Total</span>
                  <span className="font-extrabold text-sm text-[#0B1F3A]">
                    £{displayedSubs.reduce((sum, s) => sum + Number(s.price || 0), 0).toFixed(2)} / cycle
                  </span>
                </div>
              </div>
            </div>

            {/* Widget 2: Delivery Address */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-[#0B1F3A]">Delivery Address</h4>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  DEFAULT
                </span>
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <p className="font-bold text-[#0B1F3A]">
                  {primarySub?.recipient_name || `${defaultAddress?.first_name || "Dr. Alexander"} ${defaultAddress?.last_name || "Wright"}`}
                </p>
                <p className="text-slate-500">
                  {primarySub?.recipient_facility || defaultAddress?.company || "Dept. of Molecular Pharmacology"}
                </p>
                <p>
                  {defaultAddress?.address_1 || primarySub?.shipping_address?.address_1 || "Cambridge Science Park, Milton Rd"}
                </p>
                <p>
                  {defaultAddress?.city || primarySub?.shipping_address?.city || "Cambridge"},{" "}
                  {defaultAddress?.postal_code || primarySub?.shipping_address?.postal_code || "CB4 0GZ"}
                </p>
                <p className="text-slate-400">United Kingdom</p>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onSwitchTab?.("addresses")}
                  className="text-xs text-[#16A6A3] hover:text-[#138d8a] font-semibold underline cursor-pointer"
                >
                  Edit Delivery Address →
                </button>
              </div>
            </div>

            {/* Widget 3: Payment & Billing */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-[#0B1F3A]">Payment & Billing</h4>
                <span className="text-[10px] font-bold text-[#16A6A3] bg-[#E6FFFA] px-2 py-0.5 rounded-full border border-[#16A6A3]/30">
                  ACTIVE
                </span>
              </div>
              <div className="flex items-center gap-3 py-1">
                <CardBrandBadge brand={defaultCard?.brand || "visa"} />
                <div className="text-xs">
                  <p className="font-bold text-[#0B1F3A] capitalize">
                    {defaultCard?.brand || "Visa"} ending in ...{defaultCard?.last4 || "1234"}
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Expires: {defaultCard?.exp_month ? `${String(defaultCard.exp_month).padStart(2, "0")}/${defaultCard.exp_year}` : "08/2028"}
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onSwitchTab?.("payment")}
                  className="text-xs text-[#16A6A3] hover:text-[#138d8a] font-semibold underline cursor-pointer"
                >
                  Manage Payment Methods →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dosage Protocol Switcher Modal */}
      {selectedSubForDosage && (
        <DosageProtocolModal
          subscription={selectedSubForDosage}
          isOpen={!!selectedSubForDosage}
          onClose={() => setSelectedSubForDosage(null)}
          onUpdateDosage={async (strength) => {
            await handleCommand(selectedSubForDosage.id, "update_dosage", { strength })
          }}
          isBusy={busySubId === selectedSubForDosage?.id}
        />
      )}
    </div>
  )
}
