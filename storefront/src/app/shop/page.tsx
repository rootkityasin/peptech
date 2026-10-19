import { Suspense } from "react"
import { ShopCatalog } from "@/components/catalog/ShopCatalog"
import { CatalogSkeleton } from "@/components/ui/Skeletons"
import { getCatalogProducts } from "@/lib/medusa"

export const revalidate = false

export const metadata = {
  title: "PEPTECH® Shop Catalog | Research Peptide Systems & Cartridges",
  description: "Browse the complete PEPTECH® laboratory catalog: Complete Pen Systems, Refill Cartridges, and Freeze-Dried Vials for Research Use Only.",
}

export default async function ShopPage() {
  const products = await getCatalogProducts({ limit: 100 }).catch(() => [])

  return (
    <Suspense fallback={<CatalogSkeleton category="all" />}>
      <ShopCatalog initialCategory="all" initialProducts={products} />
    </Suspense>
  )
}
