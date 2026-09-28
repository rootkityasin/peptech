"use client"

import React, { useState } from "react"

export interface DosageProtocolModalProps {
  subscription: any
  isOpen: boolean
  onClose: () => void
  onUpdateDosage: (variantId: string) => Promise<void>
  isBusy: boolean
}

export function DosageProtocolModal({
  subscription,
  isOpen,
  onClose,
  onUpdateDosage,
  isBusy,
}: DosageProtocolModalProps) {
  const [selectedStrength, setSelectedStrength] = useState<string>("5mg")

  if (!isOpen || !subscription) return null

  const STRENGTH_OPTIONS = [
    {
      id: "5mg",
      label: "5mg Multi-Dose Cartridge",
      desc: "Standard 0.25mg / 0.50mg weekly escalation protocol · 4 doses",
      active: subscription.strength === "5mg" || subscription.title?.includes("5mg"),
    },
    {
      id: "10mg",
      label: "10mg Multi-Dose Cartridge",
      desc: "High-concentration 1.0mg / 1.7mg maintenance protocol · 4 doses",
      active: subscription.strength === "10mg" || subscription.title?.includes("10mg"),
    },
    {
      id: "15mg",
      label: "15mg Multi-Dose Cartridge",
      desc: "Maximum titration 2.4mg steady-state research protocol · 4 doses",
      active: subscription.strength === "15mg" || subscription.title?.includes("15mg"),
    },
  ]

  const handleConfirm = async () => {
    await onUpdateDosage(selectedStrength)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#0B1F3A]">Update Dosage Protocol</h2>
            <p className="text-xs text-slate-500 mt-1">
              Switch cartridge strength for your upcoming automated replenishment cycles.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-sm font-semibold p-1.5 cursor-pointer"
            aria-label="Close dosage modal"
          >
            ✕
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-2.5 sm:space-y-3">
          {STRENGTH_OPTIONS.map((opt) => (
            <div
              key={opt.id}
              onClick={() => setSelectedStrength(opt.id)}
              className={`p-3.5 sm:p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                selectedStrength === opt.id
                  ? "border-[#16A6A3] bg-[#E6FFFA]/40 shadow-xs"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                    selectedStrength === opt.id
                      ? "border-[#16A6A3] bg-[#16A6A3] text-white"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {selectedStrength === opt.id && (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div>
                  <span className="font-bold text-[#0B1F3A] text-xs sm:text-sm block">{opt.label}</span>
                  <span className="text-[11.5px] sm:text-xs text-slate-500 leading-snug">{opt.desc}</span>
                </div>
              </div>
              {opt.active && (
                <span className="text-[10px] font-bold text-[#16A6A3] bg-[#16A6A3]/10 px-2 py-0.5 rounded shrink-0 whitespace-nowrap">
                  CURRENT
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 sm:p-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-lg border border-slate-200 sm:border-transparent text-center cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={handleConfirm}
            className="bg-[#0B1F3A] hover:bg-[#132a4a] text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 text-center"
          >
            {isBusy ? "Updating..." : "Confirm Protocol Update"}
          </button>
        </div>
      </div>
    </div>
  )
}
