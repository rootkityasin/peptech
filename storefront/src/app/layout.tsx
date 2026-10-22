import type { Metadata, Viewport } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { CustomerProvider } from "@/context/CustomerContext"
import { SoundProvider } from "@/context/SoundContext"
import { CartProvider } from "@/components/cart/CartContext"
import { CartDrawer } from "@/components/cart/CartDrawer"
import { ResearchDisclaimerModal } from "@/components/compliance/ResearchDisclaimerModal"
import { CustomDialogProvider } from "@/components/ui/CustomDialog"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { WhatsappFloatingCard } from "@/components/layout/WhatsappFloatingCard"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: false,
})

export const metadata: Metadata = {
  metadataBase: new URL("https://peptech.bio"),
  title: {
    default: "PEPTECH® | Quality. Safety. Precision.",
    template: "%s | PEPTECH®",
  },
  description: "The Complete PEPTECH® System. Reusable precision pen systems, prefilled refill cartridges, and laboratory freeze-dried vials. Research Use Only.",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://peptech.bio",
    siteName: "PEPTECH®",
    title: "PEPTECH® | Quality. Safety. Precision.",
    description: "The Complete PEPTECH® System. Reusable precision pen systems, prefilled refill cartridges, and analytical laboratory freeze-dried vials.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PEPTECH® | Quality. Safety. Precision.",
    description: "The Complete PEPTECH® System. Reusable precision pen systems, prefilled refill cartridges, and analytical laboratory freeze-dried vials.",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} h-full antialiased font-sans`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-white text-slate-900 font-sans overflow-x-hidden max-w-full"
        suppressHydrationWarning
      >
        <CustomDialogProvider>
          <CustomerProvider>
            <CartProvider>
              <SoundProvider>
                <ResearchDisclaimerModal />
                <Header />
                <div className="flex-1">{children}</div>
                <Footer />
                <CartDrawer />
                <WhatsappFloatingCard />
              </SoundProvider>
            </CartProvider>
          </CustomerProvider>
        </CustomDialogProvider>
      </body>
    </html>
  )
}
