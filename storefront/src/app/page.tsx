import { Suspense } from "react"
import { getCatalogProducts } from "@/lib/medusa"
import { HomeContent, HomePageSkeleton } from "@/components/home/HomeContent"

// Pure Event-Driven ISR: Cached indefinitely until revalidatePath is called by Medusa Admin
export const revalidate = false

export default async function HomePage() {
  const initialProducts = await getCatalogProducts({ limit: 100 }).catch(() => [])

  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomeContent initialProducts={initialProducts} />
    </Suspense>
  )
}
