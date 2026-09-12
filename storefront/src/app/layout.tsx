import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/components/cart/CartContext"
import { CartDrawer } from "@/components/cart/CartDrawer"
import { ResearchDisclaimerModal } from "@/components/compliance/ResearchDisclaimerModal"
import { TopMarquee } from "@/components/layout/TopMarquee"
import { Header } from "@/components/layout/Header"
import { TrustRibbon } from "@/components/layout/TrustRibbon"
import { MobileStickyBar } from "@/components/layout/MobileStickyBar"
import { Footer } from "@/components/layout/Footer"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "PEPTECH® | Quality. Safety. Precision. | Research Peptides",
  description: "Laboratory research grade peptides, reusable precision pen systems, prefilled refill cartridges, and lyophilised vials. For in-vitro scientific research only.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--color-background)] text-[var(--color-foreground)]">
        <CartProvider>
          <ResearchDisclaimerModal />
          <TopMarquee />
          <Header />
          <TrustRibbon />
          <div className="flex-1">{children}</div>
          <MobileStickyBar />
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  )
}
