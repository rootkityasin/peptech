/**
 * In-memory catalog revision tracker for Next.js runtime.
 * Bumping this revision forces all clients to invalidate their local storage
 * and forces Hostinger Edge / Next.js ISR caches to yield fresh content.
 */

// Global across hot reloads in Node.js runtime
const globalForCatalog = globalThis as unknown as {
  __peptech_catalog_revision?: number
}

// In Node.js server runtime, initialize once per server process.
// In the browser, do NOT initialize with Date.now() to prevent React SSR hydration mismatches.
if (!globalForCatalog.__peptech_catalog_revision && typeof window === "undefined") {
  globalForCatalog.__peptech_catalog_revision = Date.now()
}

export function getCatalogRevision(): number {
  if (typeof window !== "undefined") {
    return globalForCatalog.__peptech_catalog_revision || 0
  }
  return globalForCatalog.__peptech_catalog_revision || Date.now()
}

export function bumpCatalogRevision(): number {
  globalForCatalog.__peptech_catalog_revision = Date.now()
  return globalForCatalog.__peptech_catalog_revision
}

export function setCatalogRevision(rev: number): void {
  globalForCatalog.__peptech_catalog_revision = rev
}
