import { Suspense } from "react"
import { ShopCatalog } from "@/components/catalog/ShopCatalog"

export const metadata = {
  title: "PEPTECH® Shop Catalog | Research Peptide Systems & Cartridges",
  description: "Browse the complete PEPTECH® laboratory catalog: Complete Pen Systems, Refill Cartridges, and Freeze-Dried Vials for Research Use Only.",
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc]" />}>
      <ShopCatalog initialCategory="all" />
    </Suspense>
  )
}
