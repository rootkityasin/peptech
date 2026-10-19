"use client"

import React, { useState } from "react"

export interface WhatsappFloatingCardProps {
  phoneNumber?: string
  defaultText?: string
  hoverText?: string
}

export function WhatsappFloatingCard({
  phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
  defaultText = "Need help!",
  hoverText = "Whatsapp us!",
}: WhatsappFloatingCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Clean phone number for WhatsApp URL (digits only)
  const cleanNumber = (phoneNumber || "").replace(/[^0-9]/g, "")
  if (!cleanNumber) {
    return null
  }
  const whatsappUrl = `https://wa.me/${cleanNumber}`

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    window.open(whatsappUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <aside
      aria-label="WhatsApp Support"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 select-none print:hidden pointer-events-auto"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Chat with us on WhatsApp"
        className="group relative flex items-center h-[58px] min-w-[188px] px-3.5 py-2 bg-[#FFFFFF] rounded-full border border-black/[0.06] shadow-[0_8px_24px_-4px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_-4px_rgba(0,0,0,0.12),0_4px_10px_-1px_rgba(0,0,0,0.06)] cursor-pointer select-none overflow-hidden transition-all duration-300 pointer-events-auto"
      >
        {/* Only WhatsApp Green Icon on the Left */}
        <div className="relative size-[42px] rounded-full bg-[#25D366] ring-2 ring-white flex items-center justify-center shrink-0 shadow-xs transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-105">
          <svg
            viewBox="0 0 32 32"
            className="size-[22px] fill-white drop-shadow-xs"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M16 2a13.93 13.93 0 0 0-12.07 20.92L2 30l7.26-1.9A13.93 13.93 0 1 0 16 2zm0 25.55a11.58 11.58 0 0 1-5.9-1.62l-.42-.25-4.38 1.15 1.17-4.27-.27-.44A11.62 11.62 0 1 1 16 27.55zm6.37-8.68c-.35-.18-2.07-1-2.39-1.12s-.56-.17-.79.17-.91 1.12-1.11 1.36-.41.26-.76.09a9.58 9.58 0 0 1-2.82-1.74 10.57 10.57 0 0 1-1.95-2.43c-.2-.35 0-.54.16-.71s.35-.41.53-.61a2.38 2.38 0 0 0 .35-.59.65.65 0 0 0 0-.62c-.09-.17-.79-1.91-1.08-2.61s-.58-.59-.79-.6h-.68a1.3 1.3 0 0 0-.94.44 3.94 3.94 0 0 0-1.23 2.93c0 1.73 1.26 3.4 1.44 3.64s2.48 3.79 6 5.31c.84.36 1.49.58 2 .74.84.27 1.61.23 2.22.14.68-.1 2.07-.85 2.36-1.66s.29-1.52.21-1.66-.33-.24-.68-.42z" />
          </svg>
        </div>

        {/* Right Section: Default "Need help!" & Hover "Whatsapp us!" Swap */}
        <div className="flex-1 overflow-hidden whitespace-nowrap ml-3 relative h-[26px] flex items-center pr-2">
          {/* Default State: "Need help!" */}
          <span
            className={`absolute inset-0 flex items-center text-[16px] font-medium text-[#18181B] font-sans transition-all duration-200 ease-out ${
              isHovered
                ? "-translate-y-5 opacity-0 pointer-events-none"
                : "translate-y-0 opacity-100"
            }`}
          >
            {defaultText}
          </span>

          {/* Hover State: "Whatsapp us!" */}
          <span
            className={`absolute inset-0 flex items-center text-[16px] font-bold italic tracking-tight text-[#111827] font-sans transition-all duration-200 ease-out ${
              isHovered
                ? "translate-y-0 opacity-100"
                : "translate-y-5 opacity-0 pointer-events-none"
            }`}
          >
            {hoverText}
          </span>
        </div>
      </a>
    </aside>
  )
}
