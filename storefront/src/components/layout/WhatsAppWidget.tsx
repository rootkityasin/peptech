"use client"

import React from "react"

interface WhatsAppWidgetProps {
  phoneNumber?: string
  message?: string
}

export function WhatsAppWidget({
  phoneNumber = "447756915215",
  message = "Hello PEPTECH, I have an inquiry regarding your research products.",
}: WhatsAppWidgetProps) {
  // Clean phone number (digits only)
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, "")
  const encodedMessage = encodeURIComponent(message)
  const whatsappUrl = `https://wa.me/${cleanNumber}${encodedMessage ? `?text=${encodedMessage}` : ""}`

  return (
    <aside
      aria-label="WhatsApp Support"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 select-none print:hidden pointer-events-auto"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact PEPTECH on WhatsApp"
        className="group flex items-center gap-2.5 bg-white hover:bg-slate-50/95 pl-1.5 pr-4 py-1.5 rounded-full border border-slate-200/90 shadow-[0_4px_20px_rgba(11,31,58,0.12)] hover:shadow-[0_8px_28px_rgba(11,31,58,0.18)] hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
      >
        {/* Single WhatsApp Green Circular Icon */}
        <div className="relative size-10 rounded-full bg-[#25D366] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-200">
          <svg
            viewBox="0 0 32 32"
            className="size-5 fill-white drop-shadow-xs"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M16 2a13.93 13.93 0 0 0-12.07 20.92L2 30l7.26-1.9A13.93 13.93 0 1 0 16 2zm0 25.55a11.58 11.58 0 0 1-5.9-1.62l-.42-.25-4.38 1.15 1.17-4.27-.27-.44A11.62 11.62 0 1 1 16 27.55zm6.37-8.68c-.35-.18-2.07-1-2.39-1.12s-.56-.17-.79.17-.91 1.12-1.11 1.36-.41.26-.76.09a9.58 9.58 0 0 1-2.82-1.74 10.57 10.57 0 0 1-1.95-2.43c-.2-.35 0-.54.16-.71s.35-.41.53-.61a2.38 2.38 0 0 0 .35-.59.65.65 0 0 0 0-.62c-.09-.17-.79-1.91-1.08-2.61s-.58-.59-.79-.6h-.68a1.3 1.3 0 0 0-.94.44 3.94 3.94 0 0 0-1.23 2.93c0 1.73 1.26 3.4 1.44 3.64s2.48 3.79 6 5.31c.84.36 1.49.58 2 .74.84.27 1.61.23 2.22.14.68-.1 2.07-.85 2.36-1.66s.29-1.52.21-1.66-.33-.24-.68-.42z" />
          </svg>
          {/* Subtle online pulse indicator */}
          <span className="absolute top-0 right-0 size-2.5 rounded-full bg-[#10b981] ring-2 ring-white">
            <span className="absolute inset-0 rounded-full bg-[#10b981] animate-ping opacity-75" />
          </span>
        </div>

        {/* Text Label matching reference screenshot */}
        <span className="text-[14.5px] font-bold text-[#0B1F3A] tracking-tight group-hover:text-[#16A6A3] transition-colors pr-1 font-sans">
          Whatsapp us!
        </span>
      </a>
    </aside>
  )
}
