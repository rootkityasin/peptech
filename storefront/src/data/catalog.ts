export interface CatalogProduct {
  id: string
  name: string
  handle: string
  format: "complete-pen-set" | "refill-cartridge" | "freeze-dried-vial"
  formatLabel: string
  category: "metabolic" | "tissue" | "cellular" | "neuro"
  categoryLabel: string
  description: string
  price: number
  subscribePrice?: number
  inStock: boolean
  isSubscriptionEligible: boolean
  image: string
}

export const CATALOG_PRODUCTS: CatalogProduct[] = [
  // --- 1. Complete Pen Sets (6 items) ---
  {
    id: "pen-set-semaglutide",
    name: "Semaglutide 5mg Pen Set",
    handle: "complete-pen-set?model=Semaglutide",
    format: "complete-pen-set",
    formatLabel: "COMPLETE PEN SET",
    category: "metabolic",
    categoryLabel: "Metabolic & Glucose",
    description: "Reusable Pen + Cartridge + 10x 31G Needles",
    price: 129.99,
    inStock: true,
    isSubscriptionEligible: false,
    image: "/images/figma/152e353c4afaa5945905ac686de871b57ec2a770.png",
  },
  {
    id: "pen-set-tirzepatide",
    name: "Tirzepatide 10mg Pen Set",
    handle: "complete-pen-set?model=Tirzepatide",
    format: "complete-pen-set",
    formatLabel: "COMPLETE PEN SET",
    category: "metabolic",
    categoryLabel: "Metabolic & Glucose",
    description: "Reusable Pen + 10mg Cartridge • Dual Agonist",
    price: 169.99,
    inStock: true,
    isSubscriptionEligible: false,
    image: "/images/figma/152e353c4afaa5945905ac686de871b57ec2a770.png",
  },
  {
    id: "pen-set-retatrutide",
    name: "Retatrutide 10mg Pen Set",
    handle: "complete-pen-set?model=Retatrutide",
    format: "complete-pen-set",
    formatLabel: "COMPLETE PEN SET",
    category: "metabolic",
    categoryLabel: "Metabolic & Glucose",
    description: "Reusable Pen + 10mg Cartridge • Triple Agonist",
    price: 189.99,
    inStock: true,
    isSubscriptionEligible: false,
    image: "/images/figma/152e353c4afaa5945905ac686de871b57ec2a770.png",
  },
  {
    id: "pen-set-bpc157",
    name: "BPC-157 10mg Pen Set",
    handle: "complete-pen-set?model=BPC-157",
    format: "complete-pen-set",
    formatLabel: "COMPLETE PEN SET",
    category: "tissue",
    categoryLabel: "Tissue Recovery",
    description: "Reusable Pen + 10mg Cartridge • High Purity Peptide",
    price: 139.99,
    inStock: true,
    isSubscriptionEligible: false,
    image: "/images/figma/152e353c4afaa5945905ac686de871b57ec2a770.png",
  },
  {
    id: "pen-set-tb500",
    name: "TB-500 10mg Pen Set",
    handle: "complete-pen-set?model=TB-500",
    format: "complete-pen-set",
    formatLabel: "COMPLETE PEN SET",
    category: "tissue",
    categoryLabel: "Tissue Recovery",
    description: "Reusable Pen + 10mg Cartridge • Laboratory Research",
    price: 149.99,
    inStock: true,
    isSubscriptionEligible: false,
    image: "/images/figma/152e353c4afaa5945905ac686de871b57ec2a770.png",
  },
  {
    id: "pen-set-nad",
    name: "NAD+ 500mg Pen Set",
    handle: "complete-pen-set?model=NAD+",
    format: "complete-pen-set",
    formatLabel: "COMPLETE PEN SET",
    category: "cellular",
    categoryLabel: "Cellular Longevity",
    description: "Reusable Pen + 500mg Cartridge • Coenzyme Research",
    price: 159.99,
    inStock: true,
    isSubscriptionEligible: false,
    image: "/images/figma/152e353c4afaa5945905ac686de871b57ec2a770.png",
  },
  {
    id: "pen-set-rt40",
    name: "RT40 Complete Pen Set",
    handle: "pen-system-rt40",
    format: "complete-pen-set",
    formatLabel: "COMPLETE PEN SET",
    category: "metabolic",
    categoryLabel: "Food Safety Testing",
    description: "Reusable Precision Pen + RT40 Cartridge + 10x Needles",
    price: 249.00,
    inStock: true,
    isSubscriptionEligible: false,
    image: "/images/figma/product-set-rt40.png",
  },
  {
    id: "pen-set-cc1236",
    name: "C.C-1236 Complete Pen Set",
    handle: "pen-system-cc1236",
    format: "complete-pen-set",
    formatLabel: "COMPLETE PEN SET",
    category: "metabolic",
    categoryLabel: "Environmental Testing",
    description: "Reusable Precision Pen + C.C-1236 Cartridge + 10x Needles",
    price: 249.00,
    inStock: true,
    isSubscriptionEligible: false,
    image: "/images/figma/product-set-cc1236.png",
  },
  {
    id: "pen-set-tbs30",
    name: "TB-S30 Complete Pen Set",
    handle: "pen-system-tbs30",
    format: "complete-pen-set",
    formatLabel: "COMPLETE PEN SET",
    category: "tissue",
    categoryLabel: "Healthcare Testing",
    description: "Reusable Precision Pen + TB-S30 Cartridge + 10x Needles",
    price: 249.00,
    inStock: true,
    isSubscriptionEligible: false,
    image: "/images/figma/product-set-tbs30.png",
  },
  {
    id: "pen-set-ifc137",
    name: "IFC-137 Complete Pen Set",
    handle: "pen-system-ifc137",
    format: "complete-pen-set",
    formatLabel: "COMPLETE PEN SET",
    category: "metabolic",
    categoryLabel: "Industrial Hygiene",
    description: "Reusable Precision Pen + IFC-137 Cartridge + 10x Needles",
    price: 249.00,
    inStock: true,
    isSubscriptionEligible: false,
    image: "/images/figma/product-set-ifc137.png",
  },
  {
    id: "pen-set-gvk0050",
    name: "GVK-00 50 Complete Pen Set",
    handle: "pen-system-gvk0050",
    format: "complete-pen-set",
    formatLabel: "COMPLETE PEN SET",
    category: "metabolic",
    categoryLabel: "Water Quality Testing",
    description: "Reusable Precision Pen + GVK-00 50 Cartridge + 10x Needles",
    price: 249.00,
    inStock: true,
    isSubscriptionEligible: false,
    image: "/images/figma/product-set-gvk0050.png",
  },
  {
    id: "pen-set-melatoxin2",
    name: "Melatoxin II Complete Pen Set",
    handle: "pen-system-melatoxin2",
    format: "complete-pen-set",
    formatLabel: "COMPLETE PEN SET",
    category: "tissue",
    categoryLabel: "Mycotoxin Detection",
    description: "Reusable Precision Pen + Melatoxin II Cartridge + 10x Needles",
    price: 249.00,
    inStock: true,
    isSubscriptionEligible: false,
    image: "/images/figma/product-set-melatoxin2.png",
  },

  // --- 2. Refill Cartridges (16 items) ---
  {
    id: "cartridge-semaglutide-5mg",
    name: "Semaglutide 5mg Refill",
    handle: "semaglutide-5mg-cartridge",
    format: "refill-cartridge",
    formatLabel: "REFILL CARTRIDGE • FITS PEPTECH PEN",
    category: "metabolic",
    categoryLabel: "Metabolic & Glucose",
    description: "1.5ml Pre-filled Cartridge • 99.4% HPLC",
    price: 69.99,
    subscribePrice: 62.99,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/figma/0e71e8560b9bae80ee21a3d08905300075c266b7.png",
  },
  {
    id: "cartridge-tirzepatide-10mg",
    name: "Tirzepatide 10mg Refill",
    handle: "tirzepatide-10mg-cartridge",
    format: "refill-cartridge",
    formatLabel: "REFILL CARTRIDGE • FITS PEPTECH PEN",
    category: "metabolic",
    categoryLabel: "Metabolic & Glucose",
    description: "1.5ml Pre-filled Cartridge • 99.2% HPLC",
    price: 89.99,
    subscribePrice: 80.99,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/figma/0e71e8560b9bae80ee21a3d08905300075c266b7.png",
  },
  {
    id: "cartridge-retatrutide-10mg",
    name: "Retatrutide 10mg Refill",
    handle: "retatrutide-10mg-cartridge",
    format: "refill-cartridge",
    formatLabel: "REFILL CARTRIDGE • FITS PEPTECH PEN",
    category: "metabolic",
    categoryLabel: "Metabolic & Glucose",
    description: "1.5ml Pre-filled Cartridge • 99.5% HPLC",
    price: 99.99,
    subscribePrice: 89.99,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/figma/0e71e8560b9bae80ee21a3d08905300075c266b7.png",
  },
  {
    id: "cartridge-bpc157-10mg",
    name: "BPC-157 10mg Refill",
    handle: "bpc157-10mg-cartridge",
    format: "refill-cartridge",
    formatLabel: "REFILL CARTRIDGE • FITS PEPTECH PEN",
    category: "tissue",
    categoryLabel: "Tissue Recovery",
    description: "1.5ml Pre-filled Cartridge • 99.8% HPLC",
    price: 59.99,
    subscribePrice: 53.99,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/figma/0e71e8560b9bae80ee21a3d08905300075c266b7.png",
  },
  {
    id: "cartridge-tb500-10mg",
    name: "TB-500 10mg Refill",
    handle: "tb500-10mg-cartridge",
    format: "refill-cartridge",
    formatLabel: "REFILL CARTRIDGE • FITS PEPTECH PEN",
    category: "tissue",
    categoryLabel: "Tissue Recovery",
    description: "1.5ml Pre-filled Cartridge • 99.1% HPLC",
    price: 64.99,
    subscribePrice: 58.49,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/figma/0e71e8560b9bae80ee21a3d08905300075c266b7.png",
  },
  {
    id: "cartridge-ghkcu-50mg",
    name: "GHK-Cu 50mg Refill",
    handle: "ghkcu-50mg-cartridge",
    format: "refill-cartridge",
    formatLabel: "REFILL CARTRIDGE • FITS PEPTECH PEN",
    category: "tissue",
    categoryLabel: "Tissue Recovery",
    description: "1.5ml Copper Peptide Solution • 99.0% Purity",
    price: 54.99,
    subscribePrice: 49.49,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/figma/0e71e8560b9bae80ee21a3d08905300075c266b7.png",
  },
  {
    id: "cartridge-epithalon-10mg",
    name: "Epithalon 10mg Refill",
    handle: "epithalon-10mg-cartridge",
    format: "refill-cartridge",
    formatLabel: "REFILL CARTRIDGE • FITS PEPTECH PEN",
    category: "cellular",
    categoryLabel: "Cellular Longevity",
    description: "1.5ml Pre-filled Cartridge • Synthetic Tetrapeptide",
    price: 69.99,
    subscribePrice: 62.99,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/figma/0e71e8560b9bae80ee21a3d08905300075c266b7.png",
  },
  {
    id: "cartridge-motsc-10mg",
    name: "MOTS-c 10mg Refill",
    handle: "motsc-10mg-cartridge",
    format: "refill-cartridge",
    formatLabel: "REFILL CARTRIDGE • FITS PEPTECH PEN",
    category: "cellular",
    categoryLabel: "Cellular Longevity",
    description: "1.5ml Mitochondrial Derived Peptide • 99.3%",
    price: 79.99,
    subscribePrice: 71.99,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/figma/0e71e8560b9bae80ee21a3d08905300075c266b7.png",
  },
  {
    id: "cartridge-semax-30mg",
    name: "Semax 30mg Refill",
    handle: "semax-30mg-cartridge",
    format: "refill-cartridge",
    formatLabel: "REFILL CARTRIDGE • FITS PEPTECH PEN",
    category: "neuro",
    categoryLabel: "Neuropeptides",
    description: "1.5ml Heptapeptide Solution • 99.6% HPLC",
    price: 59.99,
    subscribePrice: 53.99,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/figma/0e71e8560b9bae80ee21a3d08905300075c266b7.png",
  },
  {
    id: "cartridge-selank-30mg",
    name: "Selank 30mg Refill",
    handle: "selank-30mg-cartridge",
    format: "refill-cartridge",
    formatLabel: "REFILL CARTRIDGE • FITS PEPTECH PEN",
    category: "neuro",
    categoryLabel: "Neuropeptides",
    description: "1.5ml Regulatory Peptide • Laboratory Standard",
    price: 59.99,
    subscribePrice: 53.99,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/figma/0e71e8560b9bae80ee21a3d08905300075c266b7.png",
  },
  {
    id: "cartridge-rt40",
    name: "RT40 Test Cartridge",
    handle: "cartridge-rt40",
    format: "refill-cartridge",
    formatLabel: "REFILL CARTRIDGE • FITS PEPTECH PEN",
    category: "metabolic",
    categoryLabel: "Food Safety Testing",
    description: "1.5ml Pre-filled Test Cartridge for Food Safety Testing",
    price: 39.00,
    subscribePrice: 35.10,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/figma/cartridge-clear.png",
  },
  {
    id: "cartridge-cc1236",
    name: "C.C-1236 Test Cartridge",
    handle: "cartridge-cc1236",
    format: "refill-cartridge",
    formatLabel: "REFILL CARTRIDGE • FITS PEPTECH PEN",
    category: "metabolic",
    categoryLabel: "Environmental Testing",
    description: "1.5ml Pre-filled Test Cartridge for Environmental Testing",
    price: 39.00,
    subscribePrice: 35.10,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/figma/cartridge-clear.png",
  },
  {
    id: "cartridge-tbs30",
    name: "TB-S30 Test Cartridge",
    handle: "cartridge-tbs30",
    format: "refill-cartridge",
    formatLabel: "REFILL CARTRIDGE • FITS PEPTECH PEN",
    category: "tissue",
    categoryLabel: "Healthcare Testing",
    description: "1.5ml Pre-filled Test Cartridge for Healthcare Testing",
    price: 25.00,
    subscribePrice: 22.50,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/figma/cartridge-clear.png",
  },
  {
    id: "cartridge-ifc137",
    name: "IFC-137 Test Cartridge",
    handle: "cartridge-ifc137",
    format: "refill-cartridge",
    formatLabel: "REFILL CARTRIDGE • FITS PEPTECH PEN",
    category: "metabolic",
    categoryLabel: "Industrial Hygiene",
    description: "1.5ml Pre-filled Test Cartridge for Industrial Hygiene",
    price: 39.00,
    subscribePrice: 35.10,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/figma/cartridge-clear.png",
  },
  {
    id: "cartridge-gvk0050",
    name: "GVK-00 50 Test Cartridge",
    handle: "cartridge-gvk0050",
    format: "refill-cartridge",
    formatLabel: "REFILL CARTRIDGE • FITS PEPTECH PEN",
    category: "metabolic",
    categoryLabel: "Water Quality Testing",
    description: "1.5ml Pre-filled Test Cartridge for Water Quality Testing",
    price: 35.00,
    subscribePrice: 31.50,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/figma/cartridge-clear.png",
  },
  {
    id: "cartridge-melatoxin2",
    name: "Melatoxin II Test Cartridge",
    handle: "cartridge-melatoxin2",
    format: "refill-cartridge",
    formatLabel: "REFILL CARTRIDGE • FITS PEPTECH PEN",
    category: "tissue",
    categoryLabel: "Mycotoxin Detection",
    description: "1.5ml Pre-filled Test Cartridge for Mycotoxin Detection",
    price: 33.00,
    subscribePrice: 29.70,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/figma/cartridge-clear.png",
  },

  // --- 3. Freeze-Dried Vials (8 items) ---
  {
    id: "vial-retatrutide-10mg",
    name: "Retatrutide 10mg Lyophilised Vial",
    handle: "vial-retatrutide-10mg",
    format: "freeze-dried-vial",
    formatLabel: "FREEZE-DRIED VIAL • 99.5% PURITY",
    category: "metabolic",
    categoryLabel: "Metabolic & Glucose",
    description: "Pure Lyophilised Research Powder • Laboratory Sealed",
    price: 69.99,
    subscribePrice: 62.99,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/figma/2d7803f97be6d80d5630dfb42abba84289ed1bb5.png",
  },
  {
    id: "vial-tirzepatide-15mg",
    name: "Tirzepatide 15mg Lyophilised Vial",
    handle: "vial-tirzepatide-15mg",
    format: "freeze-dried-vial",
    formatLabel: "FREEZE-DRIED VIAL • 99.2% PURITY",
    category: "metabolic",
    categoryLabel: "Metabolic & Glucose",
    description: "Pure Lyophilised Research Powder • Batch Verified",
    price: 79.99,
    subscribePrice: 71.99,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/figma/2d7803f97be6d80d5630dfb42abba84289ed1bb5.png",
  },
  {
    id: "vial-semaglutide-10mg",
    name: "Semaglutide 10mg Lyophilised Vial",
    handle: "vial-semaglutide-10mg",
    format: "freeze-dried-vial",
    formatLabel: "FREEZE-DRIED VIAL • 99.4% PURITY",
    category: "metabolic",
    categoryLabel: "Metabolic & Glucose",
    description: "Pure Lyophilised Research Powder • Sealed Glass Vial",
    price: 59.99,
    subscribePrice: 53.99,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/figma/2d7803f97be6d80d5630dfb42abba84289ed1bb5.png",
  },
  {
    id: "vial-bpc157-10mg",
    name: "BPC-157 10mg Lyophilised Vial",
    handle: "vial-bpc157-10mg",
    format: "freeze-dried-vial",
    formatLabel: "FREEZE-DRIED VIAL • 99.8% PURITY",
    category: "tissue",
    categoryLabel: "Tissue Recovery",
    description: "Pure Synthetic Pentadecapeptide • Ultra High Purity",
    price: 39.99,
    subscribePrice: 35.99,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/figma/2d7803f97be6d80d5630dfb42abba84289ed1bb5.png",
  },
  {
    id: "vial-tb500-10mg",
    name: "TB-500 10mg Lyophilised Vial",
    handle: "vial-tb500-10mg",
    format: "freeze-dried-vial",
    formatLabel: "FREEZE-DRIED VIAL • 99.1% PURITY",
    category: "tissue",
    categoryLabel: "Tissue Recovery",
    description: "Thymosin Beta-4 Derivative • Laboratory Analytical Lot",
    price: 44.99,
    subscribePrice: 40.49,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/figma/2d7803f97be6d80d5630dfb42abba84289ed1bb5.png",
  },
  {
    id: "vial-epithalon-20mg",
    name: "Epithalon 20mg Lyophilised Vial",
    handle: "vial-epithalon-20mg",
    format: "freeze-dried-vial",
    formatLabel: "FREEZE-DRIED VIAL • 99.0% PURITY",
    category: "cellular",
    categoryLabel: "Cellular Longevity",
    description: "Pineal Peptide Bioregulator • Analytical Standard",
    price: 49.99,
    subscribePrice: 44.99,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/figma/2d7803f97be6d80d5630dfb42abba84289ed1bb5.png",
  },
  {
    id: "vial-semax-30mg",
    name: "Semax 30mg Lyophilised Vial",
    handle: "vial-semax-30mg",
    format: "freeze-dried-vial",
    formatLabel: "FREEZE-DRIED VIAL • 99.6% PURITY",
    category: "neuro",
    categoryLabel: "Neuropeptides",
    description: "ACTH(4-10) Analog Peptide • Laboratory Research",
    price: 49.99,
    subscribePrice: 44.99,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/figma/2d7803f97be6d80d5630dfb42abba84289ed1bb5.png",
  },
  {
    id: "vial-selank-30mg",
    name: "Selank 30mg Lyophilised Vial",
    handle: "vial-selank-30mg",
    format: "freeze-dried-vial",
    formatLabel: "FREEZE-DRIED VIAL • 99.3% PURITY",
    category: "neuro",
    categoryLabel: "Neuropeptides",
    description: "Tuftsin Analog Peptide • Certified Laboratory Lot",
    price: 49.99,
    subscribePrice: 44.99,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/figma/2d7803f97be6d80d5630dfb42abba84289ed1bb5.png",
  },
]

export function findCatalogProduct(
  handleOrId: string,
  modelQuery?: string | null
): CatalogProduct | null {
  if (!handleOrId) return null
  const decoded = decodeURIComponent(handleOrId).toLowerCase().trim()
  const cleanHandle = decoded.split("?")[0]

  // 1. Exact match on handle, base handle, or id
  const exactMatch = CATALOG_PRODUCTS.find(
    (p) =>
      p.handle.toLowerCase() === decoded ||
      p.handle.toLowerCase().split("?")[0] === cleanHandle ||
      p.id.toLowerCase() === decoded
  )
  if (exactMatch) return exactMatch

  // 2. Specific matching for cartridge / refill requests:
  if (cleanHandle.includes("cartridge") || cleanHandle.includes("refill")) {
    const target = cleanHandle.replace(/[^a-z0-9]/g, "")
    const matched = CATALOG_PRODUCTS.find((p) => {
      if (p.format !== "refill-cartridge") return false
      const pHandle = p.handle.toLowerCase().replace(/[^a-z0-9]/g, "")
      const pId = p.id.toLowerCase().replace(/[^a-z0-9]/g, "")
      const pName = p.name.toLowerCase().replace(/[^a-z0-9]/g, "")
      return target.includes(pHandle) || pHandle.includes(target) || target.includes(pId) || pId.includes(target) || target.includes(pName) || pName.includes(target)
    })
    if (matched) return matched
    // Return first refill cartridge as fallback for generic cartridge handle
    return CATALOG_PRODUCTS.find((p) => p.format === "refill-cartridge") || null
  }

  // 3. Specific matching for vial / lyophilised requests:
  if (cleanHandle.includes("vial") || cleanHandle.includes("lyophilised")) {
    const target = cleanHandle.replace(/[^a-z0-9]/g, "")
    const matched = CATALOG_PRODUCTS.find((p) => {
      if (p.format !== "freeze-dried-vial") return false
      const pHandle = p.handle.toLowerCase().replace(/[^a-z0-9]/g, "")
      const pId = p.id.toLowerCase().replace(/[^a-z0-9]/g, "")
      const pName = p.name.toLowerCase().replace(/[^a-z0-9]/g, "")
      return target.includes(pHandle) || pHandle.includes(target) || target.includes(pId) || pId.includes(target) || target.includes(pName) || pName.includes(target)
    })
    if (matched) return matched
    // Return first freeze-dried vial as fallback
    return CATALOG_PRODUCTS.find((p) => p.format === "freeze-dried-vial") || null
  }

  // 4. Handle pen set model queries or generic complete-pen-set
  if (cleanHandle === "complete-pen-set" || cleanHandle.includes("pen-set") || cleanHandle.includes("pen-system") || cleanHandle.includes("pen")) {
    if (modelQuery) {
      const q = modelQuery.toLowerCase()
      const found = CATALOG_PRODUCTS.find(
        (p) => p.format === "complete-pen-set" && p.name.toLowerCase().includes(q)
      )
      if (found) return found
    }
    const penMatch = CATALOG_PRODUCTS.find((p) => {
      if (p.format !== "complete-pen-set") return false
      const target = cleanHandle.replace(/[^a-z0-9]/g, "")
      const pHandle = p.handle.toLowerCase().replace(/[^a-z0-9]/g, "")
      const pId = p.id.toLowerCase().replace(/[^a-z0-9]/g, "")
      return target.includes(pHandle) || pHandle.includes(target) || target.includes(pId) || pId.includes(target)
    })
    if (penMatch) return penMatch
    return CATALOG_PRODUCTS.find((p) => p.format === "complete-pen-set") || CATALOG_PRODUCTS[0]
  }

  // 5. Fallback matching by alphanumeric normalisation
  const fuzzyMatch = CATALOG_PRODUCTS.find((p) => {
    const pClean = p.handle.toLowerCase().replace(/[^a-z0-9]/g, "")
    const pIdClean = p.id.toLowerCase().replace(/[^a-z0-9]/g, "")
    const target = cleanHandle.replace(/[^a-z0-9]/g, "")
    return pClean.includes(target) || target.includes(pClean) || pIdClean.includes(target) || target.includes(pIdClean)
  })

  return fuzzyMatch || null
}
