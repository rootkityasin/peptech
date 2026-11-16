"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { CatalogProduct } from "@/data/catalog"
import { getProducts, mapMedusaToCatalogProduct, sortProductsByPriority } from "@/lib/medusa"

const CATALOG_CACHE_KEY = "peptech_catalog_cache"
const CACHE_TIMESTAMP_KEY = "peptech_catalog_cache_timestamp"
const CACHE_REVISION_KEY = "peptech_catalog_revision"
const CATALOG_FRESH_MS = 60_000
const MOUNT_REVALIDATE_DELAY_MS = 3000

let sharedProducts: CatalogProduct[] | null = null
let sharedFetchedAt = 0
let sharedInFlight: Promise<void> | null = null

/**
 * React Hook: SWR Live Product Hook for Client Components
 * Connects to cached /api/catalog and deduplicates concurrent callers at module scope.
 * Seeds immediately from SSR initialFallback or localStorage, then defers background revalidation.
 */
export function useLiveProducts(initialFallback: CatalogProduct[] = []) {
  // Initial state mirrors SSR initialFallback identically on both server and client (0ms tick-0 hydration)
  const [products, setProducts] = useState<CatalogProduct[]>(initialFallback)
  const [isLoading, setIsLoading] = useState<boolean>(!(initialFallback && initialFallback.length > 0))

  const isMountedRef = useRef(true)

  const revalidateCatalog = useCallback(async (force = false) => {
    if (!force && sharedProducts && sharedProducts.length > 0 && Date.now() - sharedFetchedAt < CATALOG_FRESH_MS) {
      if (isMountedRef.current) {
        setProducts((prev) => (prev === sharedProducts ? prev : sharedProducts!))
        setIsLoading(false)
      }
      return
    }

    if (sharedInFlight) {
      await sharedInFlight
      if (isMountedRef.current && sharedProducts && sharedProducts.length > 0) {
        setProducts((prev) => (prev === sharedProducts ? prev : sharedProducts!))
        setIsLoading(false)
      }
      return
    }

    sharedInFlight = (async () => {
      try {
        const url = force ? "/api/catalog?refresh=1" : "/api/catalog"
        const res = await fetch(url, {
          cache: force ? "no-store" : "default",
        })

        if (res.ok) {
          const serverRevision = res.headers.get("x-catalog-revision") || ""
          const data = await res.json()

          if (Array.isArray(data) && data.length > 0) {
            sharedProducts = data
            sharedFetchedAt = Date.now()

            if (typeof window !== "undefined") {
              const localRevision = localStorage.getItem(CACHE_REVISION_KEY) || ""
              const currentCacheStr = localStorage.getItem(CATALOG_CACHE_KEY) || ""
              const newCacheStr = JSON.stringify(data)

              if (force || serverRevision !== localRevision || currentCacheStr !== newCacheStr) {
                try {
                  localStorage.setItem(CATALOG_CACHE_KEY, newCacheStr)
                  localStorage.setItem(CACHE_TIMESTAMP_KEY, sharedFetchedAt.toString())
                  if (serverRevision) {
                    localStorage.setItem(CACHE_REVISION_KEY, serverRevision)
                  }
                } catch {}
                window.dispatchEvent(
                  new CustomEvent("peptech_catalog_updated", { detail: data })
                )
              }
            }
            return
          }

          // Server answered cleanly with [] (e.g. backend unavailable); skip redundant client fallback unless forced
          if (!force) {
            sharedFetchedAt = Date.now()
            return
          }
        }
      } catch {
        // Fallback directly to Medusa Store API if internal endpoint is unavailable
      }

      // Direct Medusa Store API Fallback
      try {
        const medusaProducts = await getProducts({ limit: 100 }, force)
        const mapped = sortProductsByPriority(medusaProducts.map(mapMedusaToCatalogProduct))
        if (mapped.length > 0) {
          sharedProducts = mapped
          sharedFetchedAt = Date.now()
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify(mapped))
              localStorage.setItem(CACHE_TIMESTAMP_KEY, sharedFetchedAt.toString())
            } catch {}
            window.dispatchEvent(
              new CustomEvent("peptech_catalog_updated", { detail: mapped })
            )
          }
        }
      } catch (err) {
        console.warn("[Medusa] Fallback product listing failed:", err)
      }
    })()

    try {
      await sharedInFlight
    } finally {
      sharedInFlight = null
      if (isMountedRef.current) {
        if (sharedProducts && sharedProducts.length > 0) {
          setProducts((prev) => (prev === sharedProducts ? prev : sharedProducts!))
        }
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    // Seed shared cache immediately whenever SSR supplies catalog products
    if (!initialFallback || initialFallback.length === 0) return
    if (sharedProducts === initialFallback) return

    const now = Date.now()
    sharedProducts = initialFallback
    sharedFetchedAt = now
    try {
      localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify(initialFallback))
      localStorage.setItem(CACHE_TIMESTAMP_KEY, now.toString())
    } catch {}
    window.dispatchEvent(
      new CustomEvent("peptech_catalog_updated", { detail: initialFallback })
    )
  }, [initialFallback])

  useEffect(() => {
    isMountedRef.current = true

    // Hydrate client-only consumers (e.g. Header with [] fallback) from shared memory or localStorage
    if (!sharedProducts || sharedProducts.length === 0) {
      try {
        const cached = localStorage.getItem(CATALOG_CACHE_KEY)
        if (cached) {
          const parsed = JSON.parse(cached)
          if (Array.isArray(parsed) && parsed.length > 0) {
            const cachedAt = Number(localStorage.getItem(CACHE_TIMESTAMP_KEY) || "0")
            sharedProducts = parsed
            if (cachedAt > 0) {
              sharedFetchedAt = cachedAt
            }
          }
        }
      } catch {}
    }

    if (sharedProducts && sharedProducts.length > 0) {
      const snapshot = sharedProducts
      queueMicrotask(() => {
        if (!isMountedRef.current) return
        setProducts((prev) => (prev === snapshot ? prev : snapshot))
        setIsLoading(false)
      })
    }

    // 1. Defer background revalidation so critical hydration, fonts & LCP complete uncontested
    const revalidateTimer = window.setTimeout(() => {
      if (isMountedRef.current) {
        void revalidateCatalog(false)
      }
    }, MOUNT_REVALIDATE_DELAY_MS)

    // 2. Window focus revalidation (shared 60s freshness guard prevents duplicate bursts)
    const handleFocus = () => {
      void revalidateCatalog(false)
    }

    // 3. Multi-tab & same-page synchronization
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<CatalogProduct[]>
      if (Array.isArray(customEvent.detail) && customEvent.detail.length > 0) {
        setProducts((prev) => (prev === customEvent.detail ? prev : customEvent.detail))
        setIsLoading(false)
      }
    }

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === CATALOG_CACHE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          if (Array.isArray(parsed) && parsed.length > 0) {
            sharedProducts = parsed
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
      window.clearTimeout(revalidateTimer)
      window.removeEventListener("focus", handleFocus)
      window.removeEventListener("peptech_catalog_updated", handleCustomEvent)
      window.removeEventListener("storage", handleStorageEvent)
    }
  }, [revalidateCatalog])

  const ensureFresh = useCallback(async () => {
    await revalidateCatalog(false)
  }, [revalidateCatalog])

  return {
    products,
    isLoading,
    ensureFresh,
    refresh: async () => {
      await revalidateCatalog(true)
    },
  }
}
