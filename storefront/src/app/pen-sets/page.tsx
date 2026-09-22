import { Suspense } from "react"
import { ShopCatalog } from "@/components/catalog/ShopCatalog"

export const metadata = {
  title: "Complete Pen Sets | PEPTECH® Reusable System",
  description: "First-time buyer laboratory packages: Reusable precision pen, prefilled cartridge, device passport, sterile needles, and alcohol prep pads.",
}

export default function PenSetsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc]" />}>
      <ShopCatalog initialCategory="pen-sets" />
    </Suspense>
  )
}

