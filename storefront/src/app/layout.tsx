import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/components/cart/CartContext"
import { CartDrawer } from "@/components/cart/CartDrawer"
import { ResearchDisclaimerModal } from "@/components/compliance/ResearchDisclaimerModal"
import { Header } from "@/components/layout/Header"
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
  title: "PEPTECH® | Quality. Safety. Precision. | Rapid Testing Systems",
  description: "The Complete PEPTECH® System. Reusable precision pen systems, individual test cartridges, and laboratory reagents.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        <CartProvider>
          <ResearchDisclaimerModal />
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  )
}
