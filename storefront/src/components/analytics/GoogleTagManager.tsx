// storefront/src/components/analytics/GoogleTagManager.tsx
"use client"

import React from "react"
import Script from "next/script"

export function GoogleTagManager() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID?.trim()
  // Optional first-party Server-Side GTM container endpoint (e.g. https://sgtm.peptech.bio)
  const gtmHost = (process.env.NEXT_PUBLIC_GTM_SERVER_URL?.trim() || "https://www.googletagmanager.com").replace(/\/+$/, "")

  // If no GTM ID is configured yet, do not render broken tags in HTML
  if (!gtmId) {
    return null
  }

  return (
    <>
      <Script
        id="gtm-loader"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            '${gtmHost}/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `,
        }}
      />
      <noscript>
        <iframe
          src={`${gtmHost}/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager"
        />
      </noscript>
    </>
  )
}

