import { Suspense } from "react"
import { ShopCatalog } from "@/components/catalog/ShopCatalog"
import { CatalogSkeleton } from "@/components/ui/Skeletons"

export const metadata = {
  title: "PEPTECH® Shop Catalog | Research Peptide Systems & Cartridges",
  description: "Browse the complete PEPTECH® laboratory catalog: Complete Pen Systems, Refill Cartridges, and Freeze-Dried Vials for Research Use Only.",
}

export default function ShopPage() {
  return (
    <Suspense fallback={<CatalogSkeleton category="all" />}>
      <ShopCatalog initialCategory="all" />
    </Suspense>
  )
}
