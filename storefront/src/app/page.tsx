import { Suspense } from "react"
import { getCatalogProducts } from "@/lib/medusa"
import { HomeContent, HomePageSkeleton } from "@/components/home/HomeContent"

// Hostinger Cache Manager & Edge CDN ISR: Revalidate every 5 minutes in background
export const revalidate = 300

export default async function HomePage() {
  const initialProducts = await getCatalogProducts({ limit: 100 }).catch(() => [])

  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomeContent initialProducts={initialProducts} />
    </Suspense>
  )
}
