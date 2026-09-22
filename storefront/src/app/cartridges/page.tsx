import { Suspense } from "react"
import { ShopCatalog } from "@/components/catalog/ShopCatalog"

export const metadata = {
  title: "Refill Cartridges | PEPTECH® Reusable System",
  description: "Pre-filled precision refill cartridges for the PEPTECH® reusable pen system. Research Use Only.",
}

export default function CartridgesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc]" />}>
      <ShopCatalog initialCategory="refills" />
    </Suspense>
  )
}
