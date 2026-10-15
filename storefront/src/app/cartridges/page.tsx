import { Suspense } from "react"
import { ShopCatalog } from "@/components/catalog/ShopCatalog"
import { CatalogSkeleton } from "@/components/ui/Skeletons"

export const metadata = {
  title: "Refill Cartridges | PEPTECH® Reusable System",
  description: "Pre-filled precision refill cartridges for the PEPTECH® reusable pen system. Research Use Only.",
}

export default function CartridgesPage() {
  return (
    <Suspense fallback={<CatalogSkeleton category="refills" />}>
      <ShopCatalog initialCategory="refills" />
    </Suspense>
  )
}
