/**
 * In-memory catalog revision tracker for Next.js runtime.
 * Bumping this revision forces all clients to invalidate their local storage
 * and forces Hostinger Edge / Next.js ISR caches to yield fresh content.
 */

// Global across hot reloads in Node.js runtime
const globalForCatalog = globalThis as unknown as {
  __peptech_catalog_revision?: number
}

/**
 * Deterministic revision getter across server SSR and client hydration.
 * Defaults to 0 so that URLs remain stable across SSR and client renders,
 * preventing React hydration attribute mismatches.
 */
export function getCatalogRevision(): number {
  return globalForCatalog.__peptech_catalog_revision || 0
}

export function bumpCatalogRevision(): number {
  globalForCatalog.__peptech_catalog_revision = Date.now()
  return globalForCatalog.__peptech_catalog_revision
}

export function setCatalogRevision(rev: number): void {
  globalForCatalog.__peptech_catalog_revision = rev
}
