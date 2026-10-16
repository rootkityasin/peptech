"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

export type DialogType = "info" | "warning" | "danger" | "success" | "statement"

export interface DialogOptions {
  title?: string
  message: string
  type?: DialogType
  confirmText?: string
  cancelText?: string
  isConfirm?: boolean
  onConfirm?: () => void
  onCancel?: () => void
}

interface CustomDialogContextType {
  showAlert: (message: string, title?: string, type?: DialogType, confirmText?: string) => Promise<void>
  showConfirm: (
    message: string,
    title?: string,
    options?: { confirmText?: string; cancelText?: string; danger?: boolean }
  ) => Promise<boolean>
  closeDialog: () => void
}

const CustomDialogContext = createContext<CustomDialogContextType | null>(null)

// Standalone event-based helpers so any function can trigger the dialog without hook context
export function customAlert(
  message: string,
  title = "PEPTECH® Notice",
  type: DialogType = "info",
  confirmText = "OK"
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve()
      return
    }
    const event = new CustomEvent("peptech:dialog", {
      detail: {
        title,
        message,
        type,
        confirmText,
        isConfirm: false,
        onConfirm: () => resolve(),
      },
    })
    window.dispatchEvent(event)
  })
}

export function customConfirm(
  message: string,
  title = "Confirm Action",
  options?: { confirmText?: string; cancelText?: string; danger?: boolean }
): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(true)
      return
    }
    const event = new CustomEvent("peptech:dialog", {
      detail: {
        title,
        message,
        type: options?.danger ? "danger" : "warning",
        confirmText: options?.confirmText || "Confirm",
        cancelText: options?.cancelText || "Cancel",
        isConfirm: true,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      },
    })
    window.dispatchEvent(event)
  })
}

export function CustomDialogProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<DialogOptions | null>(null)

  // Listen to custom window events for seamless imperative triggers
  useEffect(() => {
    const handleCustomDialog = (e: Event) => {
      const customEvent = e as CustomEvent<DialogOptions>
      if (customEvent.detail) {
        setDialog(customEvent.detail)
      }
    }

    window.addEventListener("peptech:dialog", handleCustomDialog)

    // Override system default window.alert with custom pop-up
    const originalAlert = window.alert
    window.alert = (msg?: any) => {
      customAlert(String(msg ?? ""), "PEPTECH® Notice")
    }

    return () => {
      window.removeEventListener("peptech:dialog", handleCustomDialog)
      window.alert = originalAlert
    }
  }, [])

  const closeDialog = useCallback(() => {
    setDialog(null)
  }, [])

  const handleConfirm = useCallback(() => {
    const cb = dialog?.onConfirm
    closeDialog()
    if (cb) cb()
  }, [dialog, closeDialog])

  const handleCancel = useCallback(() => {
    const cb = dialog?.onCancel
    closeDialog()
    if (cb) cb()
  }, [dialog, closeDialog])

  const showAlert = useCallback(
    (message: string, title = "PEPTECH® Notice", type: DialogType = "info", confirmText = "OK") => {
      return new Promise<void>((resolve) => {
        setDialog({
          title,
          message,
          type,
          confirmText,
          isConfirm: false,
          onConfirm: () => resolve(),
        })
      })
    },
    []
  )

  const showConfirm = useCallback(
    (
      message: string,
      title = "Confirm Action",
      options?: { confirmText?: string; cancelText?: string; danger?: boolean }
    ) => {
      return new Promise<boolean>((resolve) => {
        setDialog({
          title,
          message,
          type: options?.danger ? "danger" : "warning",
          confirmText: options?.confirmText || "Confirm",
          cancelText: options?.cancelText || "Cancel",
          isConfirm: true,
          onConfirm: () => resolve(true),
          onCancel: () => resolve(false),
        })
      })
    },
    []
  )

  return (
    <CustomDialogContext.Provider value={{ showAlert, showConfirm, closeDialog }}>
      {children}

      {/* Classic, Small, Polished Custom Pop-Up */}
      {dialog && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              if (dialog.isConfirm) handleCancel()
              else handleConfirm()
            }
          }}
        >
          <div className="w-[90vw] max-w-[370px] bg-white rounded-2xl p-5 sm:p-6 shadow-2xl border border-slate-200/90 relative overflow-hidden flex flex-col gap-3.5 animate-in zoom-in-95 duration-150 text-left">
            {/* Top clinical teal & navy gradient accent bar */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0B1F3A] via-[#16A6A3] to-[#00C5A0]" />

            {/* Header with emblem, category pill, and close button */}
            <div className="flex items-center justify-between gap-3 pt-0.5">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                    dialog.type === "danger"
                      ? "bg-rose-50 border-rose-200 text-rose-600"
                      : dialog.type === "warning"
                      ? "bg-amber-50 border-amber-200 text-amber-700"
                      : dialog.type === "statement"
                      ? "bg-[#F0F9FF] border-[#BAE6FD] text-[#0B1F3A]"
                      : dialog.type === "success"
                      ? "bg-[#E6FFFA] border-[#16A6A3]/30 text-[#16A6A3]"
                      : "bg-[#0B1F3A]/5 border-[#0B1F3A]/10 text-[#0B1F3A]"
                  }`}
                >
                  {dialog.type === "danger" ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  ) : dialog.type === "statement" ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  ) : dialog.type === "success" ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-wider text-[#16A6A3] uppercase block leading-none">
                    PEPTECH® SYSTEM
                  </span>
                  <h3 className="text-sm font-bold text-[#0B1F3A] mt-0.5 leading-snug">
                    {dialog.title || "Notice"}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={dialog.isConfirm ? handleCancel : handleConfirm}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0 -mr-1"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Message Body */}
            <p className="text-[12.5px] sm:text-[13px] text-slate-600 leading-relaxed font-normal whitespace-pre-wrap">
              {dialog.message}
            </p>

            {/* Action Buttons */}
            {dialog.isConfirm ? (
              <div className="flex items-center gap-2.5 pt-1 w-full">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 font-semibold text-xs sm:text-[12.5px] py-2.5 px-3 rounded-xl transition-all cursor-pointer text-center"
                >
                  {dialog.cancelText || "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className={`flex-1 ${
                    dialog.type === "danger"
                      ? "bg-rose-600 hover:bg-rose-700 text-white"
                      : "bg-[#0B1F3A] hover:bg-[#162A45] text-white"
                  } active:scale-[0.98] font-semibold text-xs sm:text-[12.5px] py-2.5 px-3 rounded-xl shadow-xs transition-all cursor-pointer text-center`}
                >
                  {dialog.confirmText || "Confirm"}
                </button>
              </div>
            ) : (
              <div className="pt-1 w-full">
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="w-full bg-[#0B1F3A] hover:bg-[#162A45] active:scale-[0.98] text-white text-xs sm:text-[12.5px] font-semibold py-2.5 px-4 rounded-xl shadow-xs transition-all cursor-pointer text-center"
                >
                  {dialog.confirmText || "OK"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </CustomDialogContext.Provider>
  )
}

export function useCustomDialog() {
  const context = useContext(CustomDialogContext)
  if (!context) {
    // Graceful fallback if invoked outside provider
    return {
      showAlert: customAlert,
      showConfirm: customConfirm,
      closeDialog: () => {},
    }
  }
  return context
}
