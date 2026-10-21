import { MetadataRoute } from "next"
import { getCatalogProducts } from "@/lib/medusa"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://peptech.bio"
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pen-sets`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/refills`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/vials`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/lab-reports`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/verify`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/research-disclaimer`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms-of-sale`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/shipping-returns`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ]

  let productRoutes: MetadataRoute.Sitemap = []
  try {
    const products = await getCatalogProducts({ limit: 100 })
    productRoutes = products.map((p) => ({
      url: `${baseUrl}/products/${p.handle}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    }))
  } catch (err) {
    console.warn("[Sitemap] Failed to fetch catalog products for sitemap:", err)
  }

  return [...staticRoutes, ...productRoutes]
}

