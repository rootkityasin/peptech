import { Suspense } from "react"
import { ShopCatalog } from "@/components/catalog/ShopCatalog"
import { CatalogSkeleton } from "@/components/ui/Skeletons"
import { getCatalogProducts } from "@/lib/medusa"

export const revalidate = 300

export const metadata = {
  title: "Freeze-Dried Vials | PEPTECH® Laboratory Peptides",
  description: "Lyophilised research peptides in laboratory-grade glass vials. Research Use Only.",
}

export default async function FreezeDriedVialsPage() {
  const products = await getCatalogProducts({ limit: 100 }).catch(() => [])

  return (
    <Suspense fallback={<CatalogSkeleton category="vials" />}>
      <ShopCatalog initialCategory="vials" initialProducts={products} />
    </Suspense>
  )
}

