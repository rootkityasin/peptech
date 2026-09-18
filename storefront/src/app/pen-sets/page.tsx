import { ShopCatalog } from "@/components/catalog/ShopCatalog"

export const metadata = {
  title: "Complete Pen Sets | PEPTECH® Reusable System",
  description: "First-time buyer laboratory packages: Reusable precision pen, prefilled cartridge, device passport, sterile needles, and alcohol prep pads.",
}

export default function PenSetsPage() {
  return <ShopCatalog initialCategory="pen-sets" />
}

