import { Suspense } from "react"
import ReactDOM from "react-dom"
import { getCatalogProducts } from "@/lib/medusa"
import { HomeContent, HomePageSkeleton } from "@/components/home/HomeContent"

// Pure Event-Driven ISR: Cached indefinitely until revalidatePath is called by Medusa Admin
export const revalidate = false

export default async function HomePage() {
  // Prioritize Hero Poster & Video in HTTP <head> before below-the-fold assets
  ReactDOM.preload("/images/system-showcase-poster.webp", {
    as: "image",
    fetchPriority: "high",
  })

  const initialProducts = await getCatalogProducts({ limit: 100 }).catch(() => [])

  return (
    <>
      <link
        rel="preload"
        href="/videos/peptech-system-showcase.mp4"
        as="video"
        type="video/mp4"
        fetchPriority="high"
      />
      <Suspense fallback={<HomePageSkeleton />}>
        <HomeContent initialProducts={initialProducts} />
      </Suspense>
    </>
  )
}
