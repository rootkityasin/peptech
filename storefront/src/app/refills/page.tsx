import { Suspense } from "react"
import { ShopCatalog } from "@/components/catalog/ShopCatalog"
import { CatalogSkeleton } from "@/components/ui/Skeletons"
import { getCatalogProducts } from "@/lib/medusa"

export const revalidate = false

export const metadata = {
  title: "Refill Cartridges | PEPTECH® Reusable System",
  description: "Pre-filled precision refill cartridges for the PEPTECH® reusable pen system. Research Use Only.",
}

export default async function RefillsPage() {
  const products = await getCatalogProducts({ limit: 100 }).catch(() => [])

  return (
    <Suspense fallback={<CatalogSkeleton category="refills" />}>
      <ShopCatalog initialCategory="refills" initialProducts={products} />
    </Suspense>
  )
}

