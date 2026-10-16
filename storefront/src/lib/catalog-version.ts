/**
 * In-memory catalog revision tracker for Next.js runtime.
 * Bumping this revision forces all clients to invalidate their local storage
 * and forces Hostinger Edge / Next.js ISR caches to yield fresh content.
 */

// Global across hot reloads in Node.js runtime
const globalForCatalog = globalThis as unknown as {
  __peptech_catalog_revision?: number
}

if (!globalForCatalog.__peptech_catalog_revision) {
  globalForCatalog.__peptech_catalog_revision = Date.now()
}

export function getCatalogRevision(): number {
  return globalForCatalog.__peptech_catalog_revision || Date.now()
}

export function bumpCatalogRevision(): number {
  globalForCatalog.__peptech_catalog_revision = Date.now()
  return globalForCatalog.__peptech_catalog_revision
}
