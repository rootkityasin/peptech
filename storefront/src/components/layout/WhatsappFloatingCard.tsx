"use client"

import React, { useState } from "react"
import { usePathname } from "next/navigation"

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
  const pathname = usePathname()

  // Hide on the first page (homepage). Display from the 2nd page onwards.
  if (!pathname || pathname === "/") {
    return null
  }

  // Suppress on checkout flow to avoid covering inputs or CTA on mobile
  if (pathname.startsWith("/checkout")) {
    return null
  }

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
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-4 sm:bottom-6 sm:right-6 z-40 select-none print:hidden pointer-events-auto"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Chat with us on WhatsApp"
        className="group relative flex items-center h-[48px] sm:h-[58px] min-w-[155px] sm:min-w-[188px] px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-[#FFFFFF] rounded-full border border-black/[0.06] shadow-[0_6px_20px_-3px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] sm:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_-4px_rgba(0,0,0,0.12),0_4px_10px_-1px_rgba(0,0,0,0.06)] cursor-pointer select-none overflow-hidden transition-all duration-300 pointer-events-auto"
      >
        {/* Only WhatsApp Green Icon on the Left */}
        <div className="relative size-[34px] sm:size-[42px] rounded-full bg-[#25D366] ring-2 ring-white flex items-center justify-center shrink-0 shadow-xs transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-105">
          <svg
            viewBox="0 0 32 32"
            className="size-[18px] sm:size-[22px] fill-white drop-shadow-xs"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M16.002 2C8.28 2 2 8.28 2 16.002c0 2.576.696 5.094 2.016 7.302L2 30l6.906-1.992c2.14 1.236 4.59 1.896 7.096 1.896 7.722 0 14.002-6.28 14.002-14.002C30.004 8.28 23.724 2 16.002 2zm0 25.56c-2.22 0-4.39-.594-6.29-1.722l-.45-.27-4.1 1.182 1.1-3.996-.294-.468A11.528 11.528 0 0 1 4.444 16c0-6.374 5.186-11.56 11.558-11.56 6.374 0 11.56 5.186 11.56 11.56 0 6.374-5.186 11.56-11.56 11.56zm6.34-8.67c-.348-.174-2.058-1.014-2.376-1.13-.318-.116-.55-.174-.78.174-.232.348-.898 1.13-1.102 1.362-.202.232-.406.26-.754.086-.348-.174-1.468-.54-2.796-1.724-1.034-.922-1.732-2.062-1.936-2.41-.202-.348-.022-.536.152-.71.156-.156.348-.406.522-.61.174-.202.232-.348.348-.58.116-.232.058-.434-.03-.61-.086-.174-.78-1.88-1.07-2.576-.282-.676-.57-.584-.78-.594-.202-.01-.434-.012-.666-.012-.232 0-.61.086-.928.434-.318.348-1.218 1.19-1.218 2.902s1.246 3.364 1.42 3.596c.174.232 2.454 3.748 5.946 5.254.83.358 1.48.572 1.986.732.834.266 1.592.228 2.19.14.668-.1 2.058-.84 2.348-1.652.29-.812.29-1.508.202-1.652-.086-.144-.318-.232-.666-.406z" />
          </svg>
        </div>

        {/* Text Container with Slide Animations */}
        <div className="relative flex flex-col justify-center overflow-hidden h-[30px] sm:h-[36px] ml-2.5 sm:ml-3 pr-1.5 sm:pr-2 w-full">
          <span
            className={`font-semibold text-[12.5px] sm:text-[13.5px] leading-tight text-[#0B1F3A] transition-all duration-300 ease-out whitespace-nowrap ${
              isHovered
                ? "-translate-y-5 sm:-translate-y-6 opacity-0"
                : "translate-y-0 opacity-100"
            }`}
          >
            {defaultText}
          </span>
          <span
            className={`absolute font-bold text-[12.5px] sm:text-[13.5px] leading-tight text-[#16A6A3] transition-all duration-300 ease-out whitespace-nowrap ${
              isHovered
                ? "translate-y-0 opacity-100"
                : "translate-y-5 sm:translate-y-6 opacity-0"
            }`}
          >
            {hoverText}
          </span>
        </div>
      </a>
    </aside>
  )
}
