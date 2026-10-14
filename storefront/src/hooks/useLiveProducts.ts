"use client"

import { useState, useEffect } from "react"
import { CatalogProduct } from "@/data/catalog"
import { getProducts, mapMedusaToCatalogProduct } from "@/lib/medusa"

/**
 * React Hook: SWR Live Product Hook for Client Components
 * Only published API catalogue entries can enter the purchase flow.
 * Connects directly to Medusa Store API and maps to CatalogProduct.
 */
export function useLiveProducts(initialFallback: CatalogProduct[] = []) {
  const [products, setProducts] = useState<CatalogProduct[]>(initialFallback)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true
    getProducts({ limit: 100 })
      .then((medusaProducts) => {
        if (isMounted) {
          const mapped = medusaProducts.map(mapMedusaToCatalogProduct)
          setProducts(mapped)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        console.warn("[Medusa] Store API product listing failed:", err)
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  return {
    products,
    isLoading,
    refresh: () => getProducts({ limit: 100 }, true),
  }
}
