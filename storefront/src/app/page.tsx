import { Suspense } from "react"
import ReactDOM from "react-dom"
import { getCatalogProducts } from "@/lib/medusa"
import { getStorefrontSettings } from "@/lib/storefront-settings"
import { HomeContent, HomePageSkeleton } from "@/components/home/HomeContent"

// Pure Event-Driven ISR: Cached indefinitely until revalidatePath is called by Medusa Admin
export const revalidate = false

export default async function HomePage() {
  // Prioritize Hero Poster & Video in HTTP <head> before below-the-fold assets
  ReactDOM.preload("/images/system-showcase-poster.webp", {
    as: "image",
    fetchPriority: "high",
  })

  const [initialProducts, storefrontSettings] = await Promise.all([
    getCatalogProducts({ limit: 100 }).catch(() => []),
    getStorefrontSettings().catch(() => ({ show_lab_quality_section: true })),
  ])

  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomeContent
        initialProducts={initialProducts}
        showLabQualitySection={storefrontSettings.show_lab_quality_section}
      />
    </Suspense>
  )
}
