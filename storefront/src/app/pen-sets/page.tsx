import { Suspense } from "react"
import { ShopCatalog } from "@/components/catalog/ShopCatalog"
import { CatalogSkeleton } from "@/components/ui/Skeletons"
import { getCatalogProducts } from "@/lib/medusa"

export const revalidate = 300

export const metadata = {
  title: "Complete Pen Sets | PEPTECH® Reusable System",
  description: "First-time buyer laboratory packages: Reusable precision pen, prefilled cartridge, device passport, sterile needles, and alcohol prep pads.",
}

export default async function PenSetsPage() {
  const products = await getCatalogProducts({ limit: 100 }).catch(() => [])

  return (
    <Suspense fallback={<CatalogSkeleton category="pen-sets" />}>
      <ShopCatalog initialCategory="pen-sets" initialProducts={products} />
    </Suspense>
  )
}

