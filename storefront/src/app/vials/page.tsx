import { Suspense } from "react"
import { ShopCatalog } from "@/components/catalog/ShopCatalog"

export const metadata = {
  title: "Freeze-Dried Vials | PEPTECH® Laboratory Peptides",
  description: "Lyophilised research peptides in laboratory-grade glass vials. Research Use Only.",
}

export default function FreezeDriedVialsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc]" />}>
      <ShopCatalog initialCategory="vials" />
    </Suspense>
  )
}

