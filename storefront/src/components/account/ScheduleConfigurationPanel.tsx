"use client"

import React, { useState, useEffect } from "react"

export interface ScheduleConfigurationPanelProps {
  subscription: any
  onClose: () => void
  onSaveSchedule: (cadenceDays: number, targetDate?: string) => Promise<void>
  onPause: (months: number) => Promise<void>
  onCancelSub: () => Promise<void>
  isBusy: boolean
}

export function ScheduleConfigurationPanel({
  subscription,
  onClose,
  onSaveSchedule,
  onPause,
  onCancelSub,
  isBusy,
}: ScheduleConfigurationPanelProps) {
  const [selectedCadence, setSelectedCadence] = useState<number>(28)
  const [selectedDelayOption, setSelectedDelayOption] = useState<"standard" | "plus1" | "plus2" | "custom">("standard")
  const [customDate, setCustomDate] = useState<string>("")
  const [showPausePrompt, setShowPausePrompt] = useState<boolean>(false)
  const [pauseMonths, setPauseMonths] = useState<number>(1)
  const [showCancelPrompt, setShowCancelPrompt] = useState<boolean>(false)

  useEffect(() => {
    if (subscription) {
      setSelectedCadence(subscription.cadence_days || 28)
      setSelectedDelayOption("standard")
      setCustomDate("")
      setShowPausePrompt(false)
      setShowCancelPrompt(false)
    }
  }, [subscription])

  if (!subscription) return null

  // Calculate base next dispatch date
  const baseBillingSecs = subscription.next_billing_at || Math.floor(Date.now() / 1000) + 14 * 86400
  const baseDispatchDate = new Date((baseBillingSecs + 86400) * 1000)

  const datePlus1 = new Date(baseDispatchDate)
  datePlus1.setDate(datePlus1.getDate() + 7)

  const datePlus2 = new Date(baseDispatchDate)
  datePlus2.setDate(datePlus2.getDate() + 14)

  const formatChipDate = (d: Date) =>
    d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })

  const handleSave = async () => {
    let targetIso: string | undefined
    if (selectedDelayOption === "plus1") {
      const billDate = new Date(baseBillingSecs * 1000)
      billDate.setDate(billDate.getDate() + 7)
      targetIso = billDate.toISOString()
    } else if (selectedDelayOption === "plus2") {
      const billDate = new Date(baseBillingSecs * 1000)
      billDate.setDate(billDate.getDate() + 14)
      targetIso = billDate.toISOString()
    } else if (selectedDelayOption === "custom" && customDate) {
      targetIso = new Date(`${customDate}T12:00:00Z`).toISOString()
    }

    await onSaveSchedule(selectedCadence, targetIso)
  }

  const destinationFacility =
    subscription.recipient_facility ||
    subscription.shipping_address?.company ||
    (subscription.shipping_address?.address_1
      ? `${subscription.shipping_address.address_1}, ${subscription.shipping_address.postal_code || ""}`
      : "Cambridge Science Park Lab, Suite 4B, CB4 0GZ")

  return (
    <div className="bg-white rounded-2xl border-2 border-[#16A6A3]/40 shadow-xs overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-3 bg-slate-50/50">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#0B1F3A]">
            Refill Schedule Configuration
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Adjust automated cadence, upcoming dispatch dates, and facility receiving hours.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer shrink-0 shadow-2xs"
          aria-label="Close schedule panel"
        >
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="hidden xs:inline">Close Schedule</span>
        </button>
      </div>

      {/* Content Body */}
      <div className="p-4 sm:p-6 space-y-6 text-sm text-slate-700">
        {/* Section 1: Automated Refill Frequency */}
        <div>
          <label className="block text-xs font-bold text-[#0B1F3A] uppercase tracking-wider mb-3">
            1. Automated Refill Frequency
          </label>
          <div className="space-y-2.5">
            {/* Option 28 Days */}
            <div
              onClick={() => setSelectedCadence(28)}
              className={`p-3.5 sm:p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                selectedCadence === 28
                  ? "border-[#16A6A3] bg-[#E6FFFA]/40 shadow-xs"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                    selectedCadence === 28
                      ? "border-[#16A6A3] bg-[#16A6A3] text-white"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {selectedCadence === 28 && (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div>
                  <span className="font-bold text-[#0B1F3A] text-xs sm:text-sm block">Every 28 Days (Standard Cycle)</span>
                  <span className="text-[11.5px] sm:text-xs text-slate-500">Weekly 0.25mg titration protocol · 4 doses per cycle</span>
                </div>
              </div>
              {selectedCadence === 28 && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#16A6A3] bg-[#16A6A3]/10 px-2 py-0.5 rounded shrink-0 whitespace-nowrap">
                  CURRENT CADENCE
                </span>
              )}
            </div>

            {/* Option 14 Days */}
            <div
              onClick={() => setSelectedCadence(14)}
              className={`p-3.5 sm:p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                selectedCadence === 14
                  ? "border-[#16A6A3] bg-[#E6FFFA]/40 shadow-xs"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                    selectedCadence === 14
                      ? "border-[#16A6A3] bg-[#16A6A3] text-white"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {selectedCadence === 14 && (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div>
                  <span className="font-bold text-[#0B1F3A] text-xs sm:text-sm block">Every 14 Days (Accelerated Protocol)</span>
                  <span className="text-[11.5px] sm:text-xs text-slate-500">Bi-weekly automated dispatch for dual-subject parallel protocols</span>
                </div>
              </div>
              {selectedCadence === 14 && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#16A6A3] bg-[#16A6A3]/10 px-2 py-0.5 rounded shrink-0 whitespace-nowrap">
                  SELECTED
                </span>
              )}
            </div>

            {/* Option 56 Days */}
            <div
              onClick={() => setSelectedCadence(56)}
              className={`p-3.5 sm:p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                selectedCadence === 56
                  ? "border-[#16A6A3] bg-[#E6FFFA]/40 shadow-xs"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                    selectedCadence === 56
                      ? "border-[#16A6A3] bg-[#16A6A3] text-white"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {selectedCadence === 56 && (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div>
                  <span className="font-bold text-[#0B1F3A] text-xs sm:text-sm block">Every 56 Days (8-Week Maintenance)</span>
                  <span className="text-[11.5px] sm:text-xs text-slate-500">Extended bimonthly replenishment for steady-state dosage maintenance</span>
                </div>
              </div>
              {selectedCadence === 56 && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#16A6A3] bg-[#16A6A3]/10 px-2 py-0.5 rounded shrink-0 whitespace-nowrap">
                  SELECTED
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Upcoming Cold-Chain Dispatch Date */}
        <div>
          <label className="block text-xs font-bold text-[#0B1F3A] uppercase tracking-wider mb-3">
            2. Upcoming Cold-Chain Dispatch Date
          </label>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Standard Scheduled Date */}
            <button
              type="button"
              onClick={() => {
                setSelectedDelayOption("standard")
                setCustomDate("")
              }}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedDelayOption === "standard"
                  ? "bg-[#0B1F3A] text-white border-[#0B1F3A] shadow-xs"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <span className="font-bold text-xs leading-tight">{formatChipDate(baseDispatchDate)}</span>
              <span
                className={`text-[10px] font-medium mt-2 ${
                  selectedDelayOption === "standard" ? "text-[#00C5A0]" : "text-slate-500"
                }`}
              >
                Scheduled Dispatch
              </span>
            </button>

            {/* +1 Week Delay */}
            <button
              type="button"
              onClick={() => {
                setSelectedDelayOption("plus1")
                setCustomDate("")
              }}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedDelayOption === "plus1"
                  ? "bg-[#0B1F3A] text-white border-[#0B1F3A] shadow-xs"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <span className="font-bold text-xs leading-tight">{formatChipDate(datePlus1)}</span>
              <span
                className={`text-[10px] font-medium mt-2 ${
                  selectedDelayOption === "plus1" ? "text-[#00C5A0]" : "text-slate-500"
                }`}
              >
                +1 Week Delay
              </span>
            </button>

            {/* +2 Weeks Delay */}
            <button
              type="button"
              onClick={() => {
                setSelectedDelayOption("plus2")
                setCustomDate("")
              }}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedDelayOption === "plus2"
                  ? "bg-[#0B1F3A] text-white border-[#0B1F3A] shadow-xs"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <span className="font-bold text-xs leading-tight">{formatChipDate(datePlus2)}</span>
              <span
                className={`text-[10px] font-medium mt-2 ${
                  selectedDelayOption === "plus2" ? "text-[#00C5A0]" : "text-slate-500"
                }`}
              >
                +2 Weeks Delay
              </span>
            </button>

            {/* Custom Date */}
            <button
              type="button"
              onClick={() => setSelectedDelayOption("custom")}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedDelayOption === "custom"
                  ? "bg-[#0B1F3A] text-white border-[#0B1F3A] shadow-xs"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <span className="font-bold text-xs leading-tight">
                {customDate ? new Date(customDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Select Custom Date"}
              </span>
              <span
                className={`text-[10px] font-medium mt-2 flex items-center gap-1 ${
                  selectedDelayOption === "custom" ? "text-[#00C5A0]" : "text-slate-500"
                }`}
              >
                Calendar Picker 📅
              </span>
            </button>
          </div>

          {selectedDelayOption === "custom" && (
            <div className="mt-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <label className="text-xs text-slate-700 font-semibold shrink-0">Choose Dispatch Date:</label>
              <input
                type="date"
                min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                max={new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0]}
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-[#16A6A3] w-full sm:w-auto"
              />
            </div>
          )}
        </div>

        {/* Section 3: Destination Facility & Authorized Receiving Window */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/80 p-4 rounded-xl border border-slate-100 text-xs">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Destination Facility:
            </span>
            <p className="font-semibold text-[#0B1F3A] leading-relaxed">{destinationFacility}</p>
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Authorized Receiving Window:
            </span>
            <p className="text-slate-600 leading-relaxed">{subscription.receiving_window || "Tuesday – Thursday · 08:00 – 14:00 GMT (Lab Reception Handover)"}</p>
          </div>
        </div>

        {/* Inline Pause Configuration Prompt */}
        {showPausePrompt && (
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-3 animate-in fade-in duration-200">
            <h4 className="font-bold text-sm text-[#0B1F3A]">Pause Automated Refill Protocol</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Select duration to pause future shipments. Your locked 10% subscriber discount and protocol settings will remain preserved.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPauseMonths(m)}
                  className={`py-2 px-3 rounded-lg border text-xs font-bold transition-colors cursor-pointer text-center ${
                    pauseMonths === m
                      ? "bg-[#0B1F3A] text-white border-[#0B1F3A]"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {m} Month{m > 1 ? "s" : ""}
                </button>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <button
                type="button"
                disabled={isBusy}
                onClick={async () => {
                  await onPause(pauseMonths)
                  setShowPausePrompt(false)
                }}
                className="bg-[#16A6A3] hover:bg-[#138d8a] text-white text-xs font-semibold px-4 py-2.5 rounded-lg cursor-pointer text-center"
              >
                {isBusy ? "Pausing..." : `Confirm ${pauseMonths} Month Pause`}
              </button>
              <button
                type="button"
                onClick={() => setShowPausePrompt(false)}
                className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer text-center border border-slate-200 sm:border-transparent rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Inline Cancel Confirmation Prompt */}
        {showCancelPrompt && (
          <div className="p-4 bg-red-50/80 border border-red-200 rounded-xl space-y-3 animate-in fade-in duration-200">
            <h4 className="font-bold text-sm text-red-700">Cancel Refill Protocol?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to end automated replenishment for this protocol? Any already scheduled batch currently in transit will complete normally.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <button
                type="button"
                disabled={isBusy}
                onClick={async () => {
                  await onCancelSub()
                  setShowCancelPrompt(false)
                }}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg cursor-pointer text-center"
              >
                {isBusy ? "Cancelling..." : "Yes, Cancel Subscription"}
              </button>
              <button
                type="button"
                onClick={() => setShowCancelPrompt(false)}
                className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer text-center border border-slate-200 sm:border-transparent rounded-lg"
              >
                Keep Active
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 sm:p-6 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <button
            type="button"
            disabled={isBusy}
            onClick={handleSave}
            className="bg-[#0B1F3A] hover:bg-[#132a4a] text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 text-center"
          >
            {isBusy ? "Saving..." : "Save Schedule Changes"}
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={onClose}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer text-center"
          >
            Cancel
          </button>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 text-xs pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
          <button
            type="button"
            onClick={() => {
              setShowPausePrompt(true)
              setShowCancelPrompt(false)
            }}
            className="text-[#16A6A3] hover:text-[#138d8a] font-semibold underline cursor-pointer"
          >
            Pause Protocol for 1–3 Months →
          </button>
          <button
            type="button"
            onClick={() => {
              setShowCancelPrompt(true)
              setShowPausePrompt(false)
            }}
            className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
