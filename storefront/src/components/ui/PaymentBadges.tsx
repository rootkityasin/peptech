import React from "react"

/**
 * Official Authentic Apple Logo SVG
 */
export function AppleLogo({ className = "w-4 h-4", fill = "currentColor" }: { className?: string; fill?: string }) {
  return (
    <svg
      viewBox="0 0 814 1000"
      className={className}
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Apple"
    >
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 790.7 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
    </svg>
  )
}

/**
 * Official Google 'G' Multicolor Logo
 */
export function GoogleLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} xmlns="http://www.w3.org/2000/svg" aria-label="Google">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  )
}

/**
 * Official Visa Vector Badge
 */
export function VisaBadge({
  className = "w-[30px] h-[19px]",
  monochrome = false,
}: {
  className?: string
  monochrome?: boolean
}) {
  return (
    <div
      className={`bg-white border border-[#CBD5E1] rounded-[3px] flex items-center justify-center p-0.5 shadow-2xs shrink-0 ${className}`}
    >
      <svg
        viewBox="0 0 1000 324.68"
        className="w-full h-full max-h-[13px] object-contain"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Visa"
      >
        <path
          fill={monochrome ? "#0B1F3A" : "#1434CB"}
          d="m651.19.5c-70.93,0-134.32,36.77-134.32,104.69,0,77.9,112.42,83.28,112.42,122.42,0,16.48-18.88,31.23-51.14,31.23-45.77,0-79.98-20.61-79.98-20.61l-14.64,68.55s39.41,17.41,91.73,17.41c77.55,0,138.58-38.57,138.58-107.66,0-82.32-112.89-87.54-112.89-123.86,0-12.91,15.5-27.05,47.66-27.05,36.29,0,65.89,14.99,65.89,14.99l14.33-66.2S696.61.5,651.18.5h0ZM2.22,5.5L.5,15.49s29.84,5.46,56.72,16.36c34.61,12.49,37.07,19.77,42.9,42.35l63.51,244.83h85.14L379.93,5.5h-84.94l-84.28,213.17-34.39-180.7c-3.15-20.68-19.13-32.48-38.68-32.48,0,0-135.41,0-135.41,0Zm411.87,0l-66.63,313.53h81L494.85,5.5h-80.76Zm451.76,0c-19.53,0-29.88,10.46-37.47,28.73l-118.67,284.8h84.94l16.43-47.47h103.48l9.99,47.47h74.95L934.12,5.5h-68.27Zm11.05,84.71l25.18,117.65h-67.45l42.28-117.65h0Z"
        />
      </svg>
    </div>
  )
}

/**
 * Official Mastercard Vector Badge
 */
export function MastercardBadge({
  className = "w-[30px] h-[19px]",
  monochrome = false,
}: {
  className?: string
  monochrome?: boolean
}) {
  if (monochrome) {
    return (
      <div
        className={`bg-white border border-[#CBD5E1] rounded-[3px] flex items-center justify-center p-0.5 shadow-2xs shrink-0 ${className}`}
      >
        <svg
          viewBox="0 0 1000 618"
          className="w-full h-full max-h-[14px] object-contain"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Mastercard"
        >
          <circle cx="382" cy="309" r="309" fill="#0B1F3A" fillOpacity="0.85" />
          <circle cx="618" cy="309" r="309" fill="#0B1F3A" fillOpacity="0.35" />
        </svg>
      </div>
    )
  }

  return (
    <div
      className={`bg-[#1A1A1A] border border-[#CBD5E1] rounded-[3px] flex items-center justify-center p-0.5 shadow-2xs shrink-0 ${className}`}
    >
      <svg
        viewBox="0 0 1000 618"
        className="w-full h-full max-h-[14px] object-contain"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Mastercard"
      >
        <rect x="364" y="66.1" fill="#FF5A00" width="270.4" height="485.8" />
        <path
          fill="#EB001B"
          d="M382,309c0-98.7,46.4-186.3,117.6-242.9C447.2,24.9,381.1,0,309,0C138.2,0,0,138.2,0,309s138.2,309,309,309c72.1,0,138.2-24.9,190.6-66.1C428.3,496.1,382,407.7,382,309z"
        />
        <path
          fill="#F79E1B"
          d="M999.2,309c0,170.8-138.2,309-309,309c-72.1,0-138.2-24.9-190.6-66.1c72.1-56.7,117.6-144.2,117.6-242.9S570.8,122.7,499.6,66.1C551.9,24.9,618,0,690.1,0C861,0,999.2,139.1,999.2,309z"
        />
      </svg>
    </div>
  )
}

/**
 * Official American Express (AMEX) Vector Badge
 */
export function AmexBadge({
  className = "w-[30px] h-[19px]",
  monochrome = false,
}: {
  className?: string
  monochrome?: boolean
}) {
  return (
    <div
      className={`${
        monochrome ? "bg-[#0B1F3A]" : "bg-[#006FCF]"
      } border border-[#CBD5E1] rounded-[3px] flex items-center justify-center p-0.5 shadow-2xs shrink-0 ${className}`}
    >
      <svg
        viewBox="0 0 54 36"
        className="w-full h-full object-contain"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="American Express"
      >
        <rect width="54" height="36" fill={monochrome ? "#0B1F3A" : "#006FCF"} rx="3" />
        <text
          x="27"
          y="16"
          fill="#FFFFFF"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="7.5"
          letterSpacing="0.8"
          textAnchor="middle"
        >
          AMERICAN
        </text>
        <text
          x="27"
          y="25"
          fill="#FFFFFF"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="7.5"
          letterSpacing="0.8"
          textAnchor="middle"
        >
          EXPRESS
        </text>
      </svg>
    </div>
  )
}

/**
 * Official JCB Vector Badge
 */
export function JcbBadge({
  className = "w-[30px] h-[19px]",
  monochrome = false,
}: {
  className?: string
  monochrome?: boolean
}) {
  if (monochrome) {
    return (
      <div
        className={`bg-white border border-[#CBD5E1] rounded-[3px] flex items-center justify-center p-0.5 shadow-2xs shrink-0 ${className}`}
      >
        <svg
          viewBox="0 0 45 28"
          className="w-full h-full object-contain"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="JCB"
        >
          <rect x="3" y="3" width="11" height="22" rx="3" fill="#0B1F3A" fillOpacity="0.9" />
          <rect x="17" y="3" width="11" height="22" rx="3" fill="#0B1F3A" fillOpacity="0.6" />
          <rect x="31" y="3" width="11" height="22" rx="3" fill="#0B1F3A" fillOpacity="0.3" />
          <text x="8.5" y="18" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="11" textAnchor="middle">
            J
          </text>
          <text x="22.5" y="18" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="11" textAnchor="middle">
            C
          </text>
          <text x="36.5" y="18" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="11" textAnchor="middle">
            B
          </text>
        </svg>
      </div>
    )
  }

  return (
    <div
      className={`bg-white border border-[#CBD5E1] rounded-[3px] flex items-center justify-center p-0.5 shadow-2xs shrink-0 ${className}`}
    >
      <svg
        viewBox="0 0 45 28"
        className="w-full h-full object-contain"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="JCB"
      >
        <rect x="3" y="3" width="11" height="22" rx="3" fill="#0E7B35" />
        <rect x="17" y="3" width="11" height="22" rx="3" fill="#D32F2F" />
        <rect x="31" y="3" width="11" height="22" rx="3" fill="#1565C0" />
        <text x="8.5" y="18" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="11" textAnchor="middle">
          J
        </text>
        <text x="22.5" y="18" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="11" textAnchor="middle">
          C
        </text>
        <text x="36.5" y="18" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="11" textAnchor="middle">
          B
        </text>
      </svg>
    </div>
  )
}

/**
 * Credit Cards Row (Visa, Mastercard, AMEX, JCB)
 */
export function CreditCardBadgesRow({
  className = "flex items-center gap-1.5",
  monochrome = false,
}: {
  className?: string
  monochrome?: boolean
}) {
  return (
    <div className={className}>
      <VisaBadge monochrome={monochrome} />
      <MastercardBadge monochrome={monochrome} />
      <AmexBadge monochrome={monochrome} />
      <JcbBadge monochrome={monochrome} />
    </div>
  )
}
