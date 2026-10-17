export interface TechnicalSpecs {
  compoundName: string
  contentsOrStrength: string
  peptideClass: string
  compositionOrSequence: string
  molecularWeight: string
  casNumber: string
  form: string
  storage: string
  accentColor: string
  colorName: string
  ratio?: string
  totalContent?: string
  volume?: string
  purity?: string
}

export interface CatalogProduct {
  variantId?: string
  sku?: string
  id: string
  name: string
  handle: string
  compound?: string
  format: "complete-pen-set" | "refill-cartridge" | "freeze-dried-vial"
  formatLabel: string
  category: "tissue" | "cellular" | "metabolic" | "neuro"
  categoryLabel: string
  contents?: string
  description: string
  price: number
  subscribePrice?: number
  inStock: boolean
  isSubscriptionEligible: boolean
  image: string
  images?: string[]
  accentColor?: string
  technicalSpecs?: TechnicalSpecs
  howItWorks?: string[]
  keyFeatures?: string[]
  priority?: number
  customSpecs?: Array<{ label: string; value: string }>
}

/**
 * @deprecated
 * Static catalog array has been retired.
 * All products, variants, prices, and metadata are fetched live from the Medusa Store API.
 * Maintained as an empty array for backward compatibility with component signatures.
 */
export const CATALOG_PRODUCTS: CatalogProduct[] = []

/**
 * @deprecated
 * Use getCatalogProduct(handle) from @/lib/medusa instead.
 */
export function findCatalogProduct(
  _handleOrId: string,
  _modelQuery?: string | null
): CatalogProduct | null {
  return null
}
