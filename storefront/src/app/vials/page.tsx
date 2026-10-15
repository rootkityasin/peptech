import { Suspense } from "react"
import { ShopCatalog } from "@/components/catalog/ShopCatalog"
import { CatalogSkeleton } from "@/components/ui/Skeletons"

export const metadata = {
  title: "Freeze-Dried Vials | PEPTECH® Laboratory Peptides",
  description: "Lyophilised research peptides in laboratory-grade glass vials. Research Use Only.",
}

export default function FreezeDriedVialsPage() {
  return (
    <Suspense fallback={<CatalogSkeleton category="vials" />}>
      <ShopCatalog initialCategory="vials" />
    </Suspense>
  )
}

