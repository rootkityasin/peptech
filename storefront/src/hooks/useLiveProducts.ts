"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { CatalogProduct } from "@/data/catalog"
import { getProducts, mapMedusaToCatalogProduct, sortProductsByPriority } from "@/lib/medusa"

const CATALOG_CACHE_KEY = "peptech_catalog_cache"
const CACHE_TIMESTAMP_KEY = "peptech_catalog_cache_timestamp"
const CACHE_REVISION_KEY = "peptech_catalog_revision"

/**
 * React Hook: SWR Live Product Hook for Client Components
 * Connects to Hostinger-cached /api/catalog and falls back to Medusa Store API.
 * Hydrates synchronously from localStorage for 0ms perceived load time,
 * and performs silent background revalidation on mount, window focus, and cross-tab sync.
 */
export function useLiveProducts(initialFallback: CatalogProduct[] = []) {
  // Synchronous initial state resolution (0ms tick-0 hydration)
  const [products, setProducts] = useState<CatalogProduct[]>(() => {
    if (initialFallback && initialFallback.length > 0) {
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify(initialFallback))
          localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
        } catch {}
      }
      return initialFallback
    }
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(CATALOG_CACHE_KEY)
        if (cached) {
          const parsed = JSON.parse(cached)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
      } catch {}
    }
    return []
  })

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (initialFallback && initialFallback.length > 0) return false
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(CATALOG_CACHE_KEY)
        if (cached) {
          const parsed = JSON.parse(cached)
          if (Array.isArray(parsed) && parsed.length > 0) return false
        }
      } catch {}
    }
    return true
  })

  const inFlightRef = useRef(false)
  const isMountedRef = useRef(true)

  const revalidateCatalog = useCallback(async (force = false) => {
    if (inFlightRef.current) return
    inFlightRef.current = true

    try {
      const url = force ? "/api/catalog?refresh=1" : "/api/catalog"
      const res = await fetch(url, {
        cache: force ? "no-store" : "default",
      })

      if (res.ok) {
        const serverRevision = res.headers.get("x-catalog-revision") || ""
        const data = await res.json()

        if (Array.isArray(data) && data.length > 0) {
          if (typeof window !== "undefined") {
            const localRevision = localStorage.getItem(CACHE_REVISION_KEY) || ""
            const currentCacheStr = localStorage.getItem(CATALOG_CACHE_KEY) || ""
            const newCacheStr = JSON.stringify(data)

            // If revision changed or data contents differed, update state
            if (force || serverRevision !== localRevision || currentCacheStr !== newCacheStr) {
              if (isMountedRef.current) {
                setProducts(data)
              }
              try {
                localStorage.setItem(CATALOG_CACHE_KEY, newCacheStr)
                localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
                if (serverRevision) {
                  localStorage.setItem(CACHE_REVISION_KEY, serverRevision)
                }
                // Notify other tabs and components in real time
                window.dispatchEvent(
                  new CustomEvent("peptech_catalog_updated", { detail: data })
                )
              } catch {}
            }
          }
          if (isMountedRef.current) setIsLoading(false)
          return
        }
      }
    } catch {
      // Fallback directly to Medusa Store API if internal endpoint is unavailable
    } finally {
      inFlightRef.current = false
    }

    // Direct Medusa Store API Fallback
    try {
      const medusaProducts = await getProducts({ limit: 100 }, force)
      if (isMountedRef.current) {
        const mapped = sortProductsByPriority(medusaProducts.map(mapMedusaToCatalogProduct))
        if (mapped.length > 0) {
          setProducts(mapped)
          try {
            localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify(mapped))
            localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
          } catch {}
        }
        setIsLoading(false)
      }
    } catch (err) {
      console.warn("[Medusa] Fallback product listing failed:", err)
      if (isMountedRef.current) setIsLoading(false)
    } finally {
      inFlightRef.current = false
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true

    // 1. Silent background revalidation on component mount
    void revalidateCatalog(false)

    // 2. Window focus revalidation: when admin switches back from Medusa Admin tab
    const handleFocus = () => {
      void revalidateCatalog(false)
    }

    // 3. Multi-tab synchronization: when another tab updates the catalog
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<CatalogProduct[]>
      if (Array.isArray(customEvent.detail) && customEvent.detail.length > 0) {
        setProducts(customEvent.detail)
        setIsLoading(false)
      }
    }

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === CATALOG_CACHE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProducts(parsed)
            setIsLoading(false)
          }
        } catch {}
      }
    }

    window.addEventListener("focus", handleFocus)
    window.addEventListener("peptech_catalog_updated", handleCustomEvent)
    window.addEventListener("storage", handleStorageEvent)

    return () => {
      isMountedRef.current = false
      window.removeEventListener("focus", handleFocus)
      window.removeEventListener("peptech_catalog_updated", handleCustomEvent)
      window.removeEventListener("storage", handleStorageEvent)
    }
  }, [revalidateCatalog])

  return {
    products,
    isLoading,
    refresh: async () => {
      await revalidateCatalog(true)
    },
  }
}
