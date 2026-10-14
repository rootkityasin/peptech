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
}

export interface CatalogProduct {
  variantId?: string
  sku?: string
  id: string
  name: string
  handle: string
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
}

// ============================================================================
// 10 Authoritative Compounds across 3 Formats = 30 Products
// Complete Pen Set = Regenmed Complete Set Price (One-Time Only)
// Refill Cartridge = 50% of Complete Set Price (One-Time & 28-Day Sub @ 10% off)
// Freeze-Dried Vial = Same price as Refill (One-Time & 28-Day Sub @ 10% off)
// ============================================================================

export const CATALOG_PRODUCTS: CatalogProduct[] = [
  // ==========================================================================
  // FORMAT 1: COMPLETE PEN SETS (10 items - Strictly One-Time Purchase)
  // ==========================================================================
  {
    id: "pen-set-ghk-cu",
    name: "GHK-Cu Complete Pen Set",
    handle: "ghk-cu-pen-set",
    format: "complete-pen-set",
    formatLabel: "COMPLETE PEN SET",
    category: "tissue",
    categoryLabel: "Cellular Matrix",
    contents: "GHK-Cu / Copper Peptide",
    description: "Reusable Precision Pen System + 1x GHK-Cu Prefilled Borosilicate Cartridge + 4x 31G 5mm Needles + 4x Prep Pads + Device Passport with QR Batch Verification.",
    price: 145.99,
    inStock: true,
    isSubscriptionEligible: false,
    image: "/images/products/ghk-cu.jpg",
    accentColor: "#14B8A6",
    technicalSpecs: {
      compoundName: "GHK-Cu (Copper Glycyl-L-Histidyl-L-Lysine)",
      contentsOrStrength: "GHK-Cu / Copper Peptide (50 mg / 1.5 mL)",
      peptideClass: "Copper Matrikine Tripeptide",
      compositionOrSequence: "[Gly-His-Lys]·Cu2+",
      molecularWeight: "403.93 g/mol",
      casNumber: "49557-75-7 / 89030-95-5",
      form: "Reusable Pen System + 1.5 mL Cartridge",
      storage: "2°C – 8°C Refrigerated, protect from direct light",
      accentColor: "#14B8A6",
      colorName: "Turquoise",
    },
  },
  {
    id: "pen-set-tesamorelin",
    name: "Tesamorelin Complete Pen Set",
    handle: "tesamorelin-pen-set",
    format: "complete-pen-set",
    formatLabel: "COMPLETE PEN SET",
    category: "metabolic",
    categoryLabel: "Metabolic Research",
    contents: "Tesamorelin",
    description: "Reusable Precision Pen System + 1x Tesamorelin Prefilled Borosilicate Cartridge + 4x 31G 5mm Needles + 4x Prep Pads + Device Passport with QR Verification.",
    price: 145.99,
    inStock: true,
    isSubscriptionEligible: false,
    image: "/images/products/tesamorelin.jpg",
    accentColor: "#3B82F6",
    technicalSpecs: {
      compoundName: "Tesamorelin Acetate",
      contentsOrStrength: "Tesamorelin Synthetic Analogue (10 mg / 1.5 mL)",
      peptideClass: "Growth Hormone Releasing Factor (GHRF) Analogue",
      compositionOrSequence: "trans-hexenoyl-[Tyr1, D-Ala2, Asp3, ...]-hGRF(1-44)NH2",
      molecularWeight: "5135.86 g/mol",
      casNumber: "218949-48-5",
      form: "Reusable Pen System + 1.5 mL Cartridge",
      storage: "2°C – 8°C Refrigerated, protect from heat & light",
      accentColor: "#3B82F6",
      colorName: "Royal Blue",
    },
  },
  {
    id: "pen-set-tirzepatide",
    name: "Tirzepatide Complete Pen Set",
    handle: "tirzepatide-pen-set",
    format: "complete-pen-set",
    formatLabel: "COMPLETE PEN SET",
    category: "metabolic",
    categoryLabel: "Dual Incretin Research",
    contents: "Tirzepatide (GIP & GLP-1)",
    description: "Reusable Precision Pen System + 1x Tirzepatide Prefilled Borosilicate Cartridge + 4x 31G 5mm Needles + 4x Prep Pads + Device Passport with QR Verification.",
    price: 164.99,
    inStock: true,
    isSubscriptionEligible: false,
    image: "/images/products/tirzepatide.png",
    accentColor: "#10B981",
    technicalSpecs: {
      compoundName: "Tirzepatide",
      contentsOrStrength: "Tirzepatide (GIP & GLP-1 Dual Agonist, 10 mg / 1.5 mL)",
      peptideClass: "Dual GIP & GLP-1 Receptor Co-Agonist",
      compositionOrSequence: "39-amino acid linear peptide with C20 diacid fatty chain",
      molecularWeight: "4813.45 g/mol",
      casNumber: "2023788-19-2",
      form: "Reusable Pen System + 1.5 mL Cartridge",
      storage: "2°C – 8°C Refrigerated, do not freeze",
      accentColor: "#10B981",
      colorName: "Emerald",
    },
  },
  {
    id: "pen-set-melanotan-2",
    name: "Melanotan II Complete Pen Set",
    handle: "melanotan-2-pen-set",
    format: "complete-pen-set",
    formatLabel: "COMPLETE PEN SET",
    category: "cellular",
    categoryLabel: "Melanocortin Research",
    contents: "Melanotan II",
    description: "Reusable Precision Pen System + 1x Melanotan II (MT-2) Prefilled Cartridge + 4x 31G 5mm Needles + 4x Prep Pads + Device Passport with QR Verification.",
    price: 99.99,
    inStock: true,
    isSubscriptionEligible: false,
    image: "/images/products/melanotan-2.png",
    accentColor: "#F59E0B",
    technicalSpecs: {
      compoundName: "Melanotan II (MT-2)",
      contentsOrStrength: "Melanotan II (10 mg / 1.5 mL)",
      peptideClass: "Synthetic Cyclic Melanocortin Receptor Agonist",
      compositionOrSequence: "Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-NH2",
      molecularWeight: "1024.18 g/mol",
      casNumber: "121062-08-6",
      form: "Reusable Pen System + 1.5 mL Cartridge",
      storage: "2°C – 8°C Refrigerated, protect from direct sunlight",
      accentColor: "#F59E0B",
      colorName: "Amber Bronze",
    },
  },
  {
    id: "pen-set-pt-141",
    name: "PT-141 Complete Pen Set",
    handle: "pt-141-pen-set",
    format: "complete-pen-set",
    formatLabel: "COMPLETE PEN SET",
    category: "neuro",
    categoryLabel: "Neuro & Receptor Research",
    contents: "PT-141 / Bremelanotide",
    description: "Reusable Precision Pen System + 1x PT-141 (Bremelanotide) Prefilled Cartridge + 4x 31G 5mm Needles + 4x Prep Pads + Device Passport with QR Verification.",
    price: 109.99,
    inStock: true,
    isSubscriptionEligible: false,
    image: "/images/products/pt-141.png",
    accentColor: "#8B5CF6",
    technicalSpecs: {
      compoundName: "PT-141 (Bremelanotide Acetate)",
      contentsOrStrength: "PT-141 / Bremelanotide (10 mg / 1.5 mL)",
      peptideClass: "Cyclic Heptapeptide Melanocortin Agonist (MC3R/MC4R)",
      compositionOrSequence: "Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-OH",
      molecularWeight: "1025.17 g/mol",
      casNumber: "189745-52-6",
      form: "Reusable Pen System + 1.5 mL Cartridge",
      storage: "2°C – 8°C Refrigerated",
      accentColor: "#8B5CF6",
      colorName: "Violet",
    },
  },
  {
    id: "pen-set-mots-c",
    name: "MOTS-c Complete Pen Set",
    handle: "mots-c-pen-set",
    format: "complete-pen-set",
    formatLabel: "COMPLETE PEN SET",
    category: "cellular",
    categoryLabel: "Mitochondrial Biology",
    contents: "MOTS-c / Mitochondrial Peptide",
    description: "Reusable Precision Pen System + 1x MOTS-c Prefilled Borosilicate Cartridge + 4x 31G 5mm Needles + 4x Prep Pads + Device Passport with QR Verification.",
    price: 119.99,
    inStock: true,
    isSubscriptionEligible: false,
    image: "/images/products/mots-c.png",
    accentColor: "#F43F5E",
    technicalSpecs: {
      compoundName: "MOTS-c (Mitochondrial 12S rRNA Type-c)",
      contentsOrStrength: "MOTS-c / Mitochondrial Peptide (10 mg / 1.5 mL)",
      peptideClass: "Mitochondrial-Derived Peptide (MDP)",
      compositionOrSequence: "Met-Arg-Trp-Gln-Glu-Met-Gly-Tyr-Ile-Phe-Tyr-Pro-Arg-Lys-Leu-Arg",
      molecularWeight: "2174.61 g/mol",
      casNumber: "1627580-64-6",
      form: "Reusable Pen System + 1.5 mL Cartridge",
      storage: "2°C – 8°C Refrigerated",
      accentColor: "#F43F5E",
      colorName: "Rose Coral",
    },
  },
  {
    id: "pen-set-wolverine",
    name: "Wolverine Stack Complete Pen Set",
    handle: "wolverine-stack-pen-set",
    format: "complete-pen-set",
    formatLabel: "COMPLETE PEN SET",
    category: "tissue",
    categoryLabel: "Cellular Matrix",
    contents: "BPC-157 + TB-500",
    description: "Reusable Precision Pen System + 1x Wolverine Stack (BPC-157 10mg + TB-500 10mg) Prefilled Cartridge + 4x 31G Needles + 4x Prep Pads + Device Passport.",
    price: 149.99,
    inStock: true,
    isSubscriptionEligible: false,
    image: "/images/products/bpc-157-tb-500.png",
    accentColor: "#2563EB",
    technicalSpecs: {
      compoundName: "Wolverine Synergistic Stack (BPC-157 & TB-500)",
      contentsOrStrength: "BPC-157 (10 mg) + TB-500 (10 mg) Dual Formulation",
      peptideClass: "Dual Cytoprotective Pentadecapeptide & Actin-Binding Complex",
      compositionOrSequence: "BPC-157 (Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val) + TB-500 (Thymosin β4 43-AA)",
      molecularWeight: "BPC-157: 1419.53 g/mol | TB-500: 4963.50 g/mol",
      casNumber: "137525-51-0 (BPC-157) / 77591-33-4 (TB-500)",
      form: "Reusable Pen System + 1.5 mL Cartridge",
      storage: "2°C – 8°C Refrigerated, protect from light",
      accentColor: "#2563EB",
      colorName: "Cobalt Royal",
    },
  },
  {
    id: "pen-set-klow",
    name: "KLOW Stack Complete Pen Set",
    handle: "klow-stack-pen-set",
    format: "complete-pen-set",
    formatLabel: "COMPLETE PEN SET",
    category: "tissue",
    categoryLabel: "Cellular Matrix",
    contents: "GHK-Cu + BPC-157 + TB-500 + KPV",
    description: "Reusable Precision Pen System + 1x KLOW Stack (GHK-Cu + BPC-157 + TB-500 + KPV) Prefilled Cartridge + 4x 31G Needles + 4x Prep Pads + Device Passport.",
    price: 159.99,
    inStock: true,
    isSubscriptionEligible: false,
    image: "/images/products/klow.png",
    accentColor: "#EC4899",
    technicalSpecs: {
      compoundName: "KLOW Stack (Quadruple Synergistic Complex)",
      contentsOrStrength: "GHK-Cu + BPC-157 + TB-500 + KPV Quad Blend (70 mg Total)",
      peptideClass: "Quadruple Matrikine, Cytoprotective & Anti-inflammatory Complex",
      compositionOrSequence: "[Gly-His-Lys]·Cu2+ + BPC-157 + TB-500 + Lys-Pro-Val",
      molecularWeight: "GHK-Cu: 403.93 | BPC-157: 1419.53 | TB-500: 4963.50 | KPV: 357.45 g/mol",
      casNumber: "49557-75-7 / 137525-51-0 / 77591-33-4 / 67727-97-3",
      form: "Reusable Pen System + 1.5 mL Cartridge",
      storage: "2°C – 8°C Refrigerated",
      accentColor: "#EC4899",
      colorName: "Vibrant Pink",
    },
  },
  {
    id: "pen-set-nad",
    name: "NAD+ Complete Pen Set",
    handle: "nad-pen-set",
    format: "complete-pen-set",
    formatLabel: "COMPLETE PEN SET",
    category: "cellular",
    categoryLabel: "Cellular Longevity",
    contents: "Nicotinamide Adenine Dinucleotide",
    description: "Reusable Precision Pen System + 1x NAD+ (Nicotinamide Adenine Dinucleotide 500mg) Prefilled Cartridge + 4x 31G Needles + 4x Prep Pads + Device Passport.",
    price: 144.99,
    inStock: true,
    isSubscriptionEligible: false,
    image: "/images/products/nad-plus.png",
    accentColor: "#F97316",
    technicalSpecs: {
      compoundName: "Beta-Nicotinamide Adenine Dinucleotide (NAD+ Oxidized)",
      contentsOrStrength: "NAD+ / Nicotinamide Adenine Dinucleotide (500 mg / 1.5 mL)",
      peptideClass: "Essential Coenzyme Dinucleotide / Cellular Substrate",
      compositionOrSequence: "C21H27N7O14P2",
      molecularWeight: "663.43 g/mol",
      casNumber: "53-84-9",
      form: "Reusable Pen System + 1.5 mL Cartridge",
      storage: "2°C – 8°C Refrigerated, protect from heat & light",
      accentColor: "#F97316",
      colorName: "Sunset Orange",
    },
  },
  {
    id: "pen-set-retatrutide",
    name: "Retatrutide Complete Pen Set",
    handle: "retatrutide-pen-set",
    format: "complete-pen-set",
    formatLabel: "COMPLETE PEN SET",
    category: "metabolic",
    categoryLabel: "Triple Agonist Research",
    contents: "Retatrutide (GIP, GLP-1 & Glucagon)",
    description: "Reusable Precision Pen System + 1x Retatrutide Prefilled Borosilicate Cartridge + 4x 31G 5mm Needles + 4x Prep Pads + Device Passport with QR Verification.",
    price: 164.99,
    inStock: true,
    isSubscriptionEligible: false,
    image: "/images/products/glow-stack.png",
    accentColor: "#0D9488",
    technicalSpecs: {
      compoundName: "Retatrutide",
      contentsOrStrength: "Retatrutide (GIP, GLP-1 & Glucagon Triple Agonist, 10 mg / 1.5 mL)",
      peptideClass: "Triple Incretin & Glucagon Hormone Receptor Agonist",
      compositionOrSequence: "39-amino acid single peptide with branched diacid side-chain",
      molecularWeight: "4731.33 g/mol",
      casNumber: "2381089-83-2",
      form: "Reusable Precision Pen System + 1.5 mL Cartridge",
      storage: "2°C – 8°C Refrigerated, protect from moisture & light",
      accentColor: "#0D9488",
      colorName: "Marine Teal",
    },
  },

  // ==========================================================================
  // FORMAT 2: REFILL CARTRIDGES (10 items - Approx 50% Price, 10% Sub Discount)
  // ==========================================================================
  {
    id: "cartridge-ghk-cu",
    name: "GHK-Cu Refill Cartridge",
    handle: "ghk-cu-cartridge",
    format: "refill-cartridge",
    formatLabel: "REFILL CARTRIDGE",
    category: "tissue",
    categoryLabel: "Cellular Matrix",
    contents: "GHK-Cu / Copper Peptide",
    description: "1.5 mL Borosilicate Type I glass prefilled cartridge calibrated for the PEPTECH reusable pen. Chemically inert with bromobutyl multi-pierce septum.",
    price: 73.00,
    subscribePrice: 65.70,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/products/ghk-cu.jpg",
    accentColor: "#14B8A6",
    technicalSpecs: {
      compoundName: "GHK-Cu (Copper Glycyl-L-Histidyl-L-Lysine)",
      contentsOrStrength: "GHK-Cu / Copper Peptide (50 mg / 1.5 mL)",
      peptideClass: "Copper Matrikine Tripeptide",
      compositionOrSequence: "[Gly-His-Lys]·Cu2+",
      molecularWeight: "403.93 g/mol",
      casNumber: "49557-75-7 / 89030-95-5",
      form: "1.5 mL Borosilicate Type I Cartridge (60-Unit Calibration)",
      storage: "2°C – 8°C Refrigerated, protect from direct light",
      accentColor: "#14B8A6",
      colorName: "Turquoise",
    },
  },
  {
    id: "cartridge-tesamorelin",
    name: "Tesamorelin Refill Cartridge",
    handle: "tesamorelin-cartridge",
    format: "refill-cartridge",
    formatLabel: "REFILL CARTRIDGE",
    category: "metabolic",
    categoryLabel: "Metabolic Research",
    contents: "Tesamorelin",
    description: "1.5 mL Borosilicate Type I glass prefilled cartridge calibrated for the PEPTECH reusable pen. Sterile laminar air-filled with multi-pierce septum.",
    price: 73.00,
    subscribePrice: 65.70,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/products/tesamorelin.jpg",
    accentColor: "#3B82F6",
    technicalSpecs: {
      compoundName: "Tesamorelin Acetate",
      contentsOrStrength: "Tesamorelin Synthetic Analogue (10 mg / 1.5 mL)",
      peptideClass: "Growth Hormone Releasing Factor (GHRF) Analogue",
      compositionOrSequence: "trans-hexenoyl-[Tyr1, D-Ala2, Asp3, ...]-hGRF(1-44)NH2",
      molecularWeight: "5135.86 g/mol",
      casNumber: "218949-48-5",
      form: "1.5 mL Borosilicate Type I Cartridge (60-Unit Calibration)",
      storage: "2°C – 8°C Refrigerated, protect from heat & light",
      accentColor: "#3B82F6",
      colorName: "Royal Blue",
    },
  },
  {
    id: "cartridge-tirzepatide",
    name: "Tirzepatide Refill Cartridge",
    handle: "tirzepatide-cartridge",
    format: "refill-cartridge",
    formatLabel: "REFILL CARTRIDGE",
    category: "metabolic",
    categoryLabel: "Dual Incretin Research",
    contents: "Tirzepatide (GIP & GLP-1)",
    description: "1.5 mL Borosilicate Type I glass prefilled cartridge calibrated for the PEPTECH reusable pen. Pure dual incretin agonist formulation.",
    price: 82.50,
    subscribePrice: 74.25,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/products/tirzepatide.png",
    accentColor: "#10B981",
    technicalSpecs: {
      compoundName: "Tirzepatide",
      contentsOrStrength: "Tirzepatide (GIP & GLP-1 Dual Agonist, 10 mg / 1.5 mL)",
      peptideClass: "Dual GIP & GLP-1 Receptor Co-Agonist",
      compositionOrSequence: "39-amino acid linear peptide with C20 diacid fatty chain",
      molecularWeight: "4813.45 g/mol",
      casNumber: "2023788-19-2",
      form: "1.5 mL Borosilicate Type I Cartridge (60-Unit Calibration)",
      storage: "2°C – 8°C Refrigerated, do not freeze",
      accentColor: "#10B981",
      colorName: "Emerald",
    },
  },
  {
    id: "cartridge-melanotan-2",
    name: "Melanotan II Refill Cartridge",
    handle: "melanotan-2-cartridge",
    format: "refill-cartridge",
    formatLabel: "REFILL CARTRIDGE",
    category: "cellular",
    categoryLabel: "Melanocortin Research",
    contents: "Melanotan II",
    description: "1.5 mL Borosilicate Type I glass prefilled cartridge calibrated for the PEPTECH reusable pen. Cyclic melanocortin receptor agonist formulation.",
    price: 50.00,
    subscribePrice: 45.00,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/products/melanotan-2.png",
    accentColor: "#F59E0B",
    technicalSpecs: {
      compoundName: "Melanotan II (MT-2)",
      contentsOrStrength: "Melanotan II (10 mg / 1.5 mL)",
      peptideClass: "Synthetic Cyclic Melanocortin Receptor Agonist",
      compositionOrSequence: "Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-NH2",
      molecularWeight: "1024.18 g/mol",
      casNumber: "121062-08-6",
      form: "1.5 mL Borosilicate Type I Cartridge (60-Unit Calibration)",
      storage: "2°C – 8°C Refrigerated, protect from direct sunlight",
      accentColor: "#F59E0B",
      colorName: "Amber Bronze",
    },
  },
  {
    id: "cartridge-pt-141",
    name: "PT-141 Refill Cartridge",
    handle: "pt-141-cartridge",
    format: "refill-cartridge",
    formatLabel: "REFILL CARTRIDGE",
    category: "neuro",
    categoryLabel: "Neuro & Receptor Research",
    contents: "PT-141 / Bremelanotide",
    description: "1.5 mL Borosilicate Type I glass prefilled cartridge calibrated for the PEPTECH reusable pen. High-precision cyclic peptide solution.",
    price: 55.00,
    subscribePrice: 49.50,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/products/pt-141.png",
    accentColor: "#8B5CF6",
    technicalSpecs: {
      compoundName: "PT-141 (Bremelanotide Acetate)",
      contentsOrStrength: "PT-141 / Bremelanotide (10 mg / 1.5 mL)",
      peptideClass: "Cyclic Heptapeptide Melanocortin Agonist (MC3R/MC4R)",
      compositionOrSequence: "Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-OH",
      molecularWeight: "1025.17 g/mol",
      casNumber: "189745-52-6",
      form: "1.5 mL Borosilicate Type I Cartridge (60-Unit Calibration)",
      storage: "2°C – 8°C Refrigerated",
      accentColor: "#8B5CF6",
      colorName: "Violet",
    },
  },
  {
    id: "cartridge-mots-c",
    name: "MOTS-c Refill Cartridge",
    handle: "mots-c-cartridge",
    format: "refill-cartridge",
    formatLabel: "REFILL CARTRIDGE",
    category: "cellular",
    categoryLabel: "Mitochondrial Biology",
    contents: "MOTS-c / Mitochondrial Peptide",
    description: "1.5 mL Borosilicate Type I glass prefilled cartridge calibrated for the PEPTECH reusable pen. Pure mitochondrial open-reading frame peptide.",
    price: 60.00,
    subscribePrice: 54.00,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/products/mots-c.png",
    accentColor: "#F43F5E",
    technicalSpecs: {
      compoundName: "MOTS-c (Mitochondrial 12S rRNA Type-c)",
      contentsOrStrength: "MOTS-c / Mitochondrial Peptide (10 mg / 1.5 mL)",
      peptideClass: "Mitochondrial-Derived Peptide (MDP)",
      compositionOrSequence: "Met-Arg-Trp-Gln-Glu-Met-Gly-Tyr-Ile-Phe-Tyr-Pro-Arg-Lys-Leu-Arg",
      molecularWeight: "2174.61 g/mol",
      casNumber: "1627580-64-6",
      form: "1.5 mL Borosilicate Type I Cartridge (60-Unit Calibration)",
      storage: "2°C – 8°C Refrigerated",
      accentColor: "#F43F5E",
      colorName: "Rose Coral",
    },
  },
  {
    id: "cartridge-wolverine",
    name: "Wolverine Stack Refill Cartridge",
    handle: "wolverine-stack-cartridge",
    format: "refill-cartridge",
    formatLabel: "REFILL CARTRIDGE",
    category: "tissue",
    categoryLabel: "Cellular Matrix",
    contents: "BPC-157 + TB-500",
    description: "1.5 mL Borosilicate Type I glass prefilled cartridge calibrated for the PEPTECH reusable pen. Synergistic BPC-157 + TB-500 dual formulation.",
    price: 75.00,
    subscribePrice: 67.50,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/products/bpc-157-tb-500.png",
    accentColor: "#2563EB",
    technicalSpecs: {
      compoundName: "Wolverine Synergistic Stack (BPC-157 & TB-500)",
      contentsOrStrength: "BPC-157 (10 mg) + TB-500 (10 mg) Dual Formulation",
      peptideClass: "Dual Cytoprotective Pentadecapeptide & Actin-Binding Complex",
      compositionOrSequence: "BPC-157 (15-AA) + TB-500 (Thymosin β4 43-AA)",
      molecularWeight: "BPC-157: 1419.53 g/mol | TB-500: 4963.50 g/mol",
      casNumber: "137525-51-0 (BPC-157) / 77591-33-4 (TB-500)",
      form: "1.5 mL Borosilicate Type I Cartridge (60-Unit Calibration)",
      storage: "2°C – 8°C Refrigerated, protect from light",
      accentColor: "#2563EB",
      colorName: "Cobalt Royal",
    },
  },
  {
    id: "cartridge-klow",
    name: "KLOW Stack Refill Cartridge",
    handle: "klow-stack-cartridge",
    format: "refill-cartridge",
    formatLabel: "REFILL CARTRIDGE",
    category: "tissue",
    categoryLabel: "Cellular Matrix",
    contents: "GHK-Cu + BPC-157 + TB-500 + KPV",
    description: "1.5 mL Borosilicate Type I glass prefilled cartridge calibrated for the PEPTECH reusable pen. Quadruple complex: GHK-Cu, BPC-157, TB-500, KPV.",
    price: 80.00,
    subscribePrice: 72.00,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/products/klow.png",
    accentColor: "#EC4899",
    technicalSpecs: {
      compoundName: "KLOW Stack (Quadruple Synergistic Complex)",
      contentsOrStrength: "GHK-Cu + BPC-157 + TB-500 + KPV Quad Blend (70 mg Total)",
      peptideClass: "Quadruple Matrikine, Cytoprotective & Anti-inflammatory Complex",
      compositionOrSequence: "[Gly-His-Lys]·Cu2+ + BPC-157 + TB-500 + Lys-Pro-Val",
      molecularWeight: "GHK-Cu: 403.93 | BPC-157: 1419.53 | TB-500: 4963.50 | KPV: 357.45 g/mol",
      casNumber: "49557-75-7 / 137525-51-0 / 77591-33-4 / 67727-97-3",
      form: "1.5 mL Borosilicate Type I Cartridge (60-Unit Calibration)",
      storage: "2°C – 8°C Refrigerated",
      accentColor: "#EC4899",
      colorName: "Vibrant Pink",
    },
  },
  {
    id: "cartridge-nad",
    name: "NAD+ Refill Cartridge",
    handle: "nad-cartridge",
    format: "refill-cartridge",
    formatLabel: "REFILL CARTRIDGE",
    category: "cellular",
    categoryLabel: "Cellular Longevity",
    contents: "Nicotinamide Adenine Dinucleotide",
    description: "1.5 mL Borosilicate Type I glass prefilled cartridge calibrated for the PEPTECH reusable pen. Concentrated 500 mg NAD+ coenzyme solution.",
    price: 72.50,
    subscribePrice: 65.25,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/products/nad-plus.png",
    accentColor: "#F97316",
    technicalSpecs: {
      compoundName: "Beta-Nicotinamide Adenine Dinucleotide (NAD+ Oxidized)",
      contentsOrStrength: "NAD+ / Nicotinamide Adenine Dinucleotide (500 mg / 1.5 mL)",
      peptideClass: "Essential Coenzyme Dinucleotide / Cellular Substrate",
      compositionOrSequence: "C21H27N7O14P2",
      molecularWeight: "663.43 g/mol",
      casNumber: "53-84-9",
      form: "1.5 mL Borosilicate Type I Cartridge (60-Unit Calibration)",
      storage: "2°C – 8°C Refrigerated, protect from heat & light",
      accentColor: "#F97316",
      colorName: "Sunset Orange",
    },
  },
  {
    id: "cartridge-retatrutide",
    name: "Retatrutide Refill Cartridge",
    handle: "retatrutide-cartridge",
    format: "refill-cartridge",
    formatLabel: "REFILL CARTRIDGE",
    category: "metabolic",
    categoryLabel: "Triple Agonist Research",
    contents: "Retatrutide (GIP, GLP-1 & Glucagon)",
    description: "1.5 mL Borosilicate Type I glass prefilled cartridge calibrated for the PEPTECH reusable pen. High-purity triple hormone receptor agonist.",
    price: 82.50,
    subscribePrice: 74.25,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/products/glow-stack.png",
    accentColor: "#0D9488",
    technicalSpecs: {
      compoundName: "Retatrutide",
      contentsOrStrength: "Retatrutide (GIP, GLP-1 & Glucagon Triple Agonist, 10 mg / 1.5 mL)",
      peptideClass: "Triple Incretin & Glucagon Hormone Receptor Agonist",
      compositionOrSequence: "39-amino acid single peptide with branched diacid side-chain",
      molecularWeight: "4731.33 g/mol",
      casNumber: "2381089-83-2",
      form: "1.5 mL Borosilicate Type I Cartridge (60-Unit Calibration)",
      storage: "2°C – 8°C Refrigerated, protect from moisture & light",
      accentColor: "#0D9488",
      colorName: "Marine Teal",
    },
  },

  // ==========================================================================
  // FORMAT 3: FREEZE-DRIED VIALS (10 items - Same Price as Refill, 10% Sub Discount)
  // ==========================================================================
  {
    id: "vial-ghk-cu",
    name: "GHK-Cu Freeze-Dried Vial",
    handle: "ghk-cu-vial",
    format: "freeze-dried-vial",
    formatLabel: "FREEZE-DRIED VIAL",
    category: "tissue",
    categoryLabel: "Cellular Matrix",
    contents: "GHK-Cu / Copper Peptide",
    description: "High-purity lyophilised laboratory research vial vacuum sealed under inert nitrogen blanket. Chlorobutyl stopper with aluminum flip-off seal.",
    price: 73.00,
    subscribePrice: 65.70,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/products/ghk-cu.jpg",
    accentColor: "#14B8A6",
    technicalSpecs: {
      compoundName: "GHK-Cu (Copper Glycyl-L-Histidyl-L-Lysine)",
      contentsOrStrength: "GHK-Cu / Copper Peptide (50 mg Lyophilised Cake)",
      peptideClass: "Copper Matrikine Tripeptide",
      compositionOrSequence: "[Gly-His-Lys]·Cu2+",
      molecularWeight: "403.93 g/mol",
      casNumber: "49557-75-7 / 89030-95-5",
      form: "Sterile Vacuum-Sealed Lyophilised Cake (3 mL Glass Vial)",
      storage: "-20°C Long-term; 2°C – 8°C Reconstituted",
      accentColor: "#14B8A6",
      colorName: "Turquoise",
    },
  },
  {
    id: "vial-tesamorelin",
    name: "Tesamorelin Freeze-Dried Vial",
    handle: "tesamorelin-vial",
    format: "freeze-dried-vial",
    formatLabel: "FREEZE-DRIED VIAL",
    category: "metabolic",
    categoryLabel: "Metabolic Research",
    contents: "Tesamorelin",
    description: "High-purity lyophilised laboratory research vial vacuum sealed under inert nitrogen blanket. Sterile lyophilised cake ready for analytical dilution.",
    price: 73.00,
    subscribePrice: 65.70,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/products/tesamorelin.jpg",
    accentColor: "#3B82F6",
    technicalSpecs: {
      compoundName: "Tesamorelin Acetate",
      contentsOrStrength: "Tesamorelin Synthetic Analogue (10 mg Lyophilised Cake)",
      peptideClass: "Growth Hormone Releasing Factor (GHRF) Analogue",
      compositionOrSequence: "trans-hexenoyl-[Tyr1, D-Ala2, Asp3, ...]-hGRF(1-44)NH2",
      molecularWeight: "5135.86 g/mol",
      casNumber: "218949-48-5",
      form: "Sterile Vacuum-Sealed Lyophilised Cake (3 mL Glass Vial)",
      storage: "-20°C Long-term; 2°C – 8°C Reconstituted",
      accentColor: "#3B82F6",
      colorName: "Royal Blue",
    },
  },
  {
    id: "vial-tirzepatide",
    name: "Tirzepatide Freeze-Dried Vial",
    handle: "tirzepatide-vial",
    format: "freeze-dried-vial",
    formatLabel: "FREEZE-DRIED VIAL",
    category: "metabolic",
    categoryLabel: "Dual Incretin Research",
    contents: "Tirzepatide (GIP & GLP-1)",
    description: "High-purity lyophilised laboratory research vial vacuum sealed under inert nitrogen blanket. Dual GIP / GLP-1 agonist lyophilised reference standard.",
    price: 82.50,
    subscribePrice: 74.25,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/products/tirzepatide.png",
    accentColor: "#10B981",
    technicalSpecs: {
      compoundName: "Tirzepatide",
      contentsOrStrength: "Tirzepatide (10 mg Lyophilised Cake)",
      peptideClass: "Dual GIP & GLP-1 Receptor Co-Agonist",
      compositionOrSequence: "39-amino acid linear peptide with C20 diacid fatty chain",
      molecularWeight: "4813.45 g/mol",
      casNumber: "2023788-19-2",
      form: "Sterile Vacuum-Sealed Lyophilised Cake (3 mL Glass Vial)",
      storage: "-20°C Long-term; 2°C – 8°C Reconstituted",
      accentColor: "#10B981",
      colorName: "Emerald",
    },
  },
  {
    id: "vial-melanotan-2",
    name: "Melanotan II Freeze-Dried Vial",
    handle: "melanotan-2-vial",
    format: "freeze-dried-vial",
    formatLabel: "FREEZE-DRIED VIAL",
    category: "cellular",
    categoryLabel: "Melanocortin Research",
    contents: "Melanotan II",
    description: "High-purity lyophilised laboratory research vial vacuum sealed under inert nitrogen blanket. Pure cyclic melanocortin receptor agonist cake.",
    price: 50.00,
    subscribePrice: 45.00,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/products/melanotan-2.png",
    accentColor: "#F59E0B",
    technicalSpecs: {
      compoundName: "Melanotan II (MT-2)",
      contentsOrStrength: "Melanotan II (10 mg Lyophilised Cake)",
      peptideClass: "Synthetic Cyclic Melanocortin Receptor Agonist",
      compositionOrSequence: "Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-NH2",
      molecularWeight: "1024.18 g/mol",
      casNumber: "121062-08-6",
      form: "Sterile Vacuum-Sealed Lyophilised Cake (3 mL Glass Vial)",
      storage: "-20°C Lyophilised; 2°C – 8°C Reconstituted",
      accentColor: "#F59E0B",
      colorName: "Amber Bronze",
    },
  },
  {
    id: "vial-pt-141",
    name: "PT-141 Freeze-Dried Vial",
    handle: "pt-141-vial",
    format: "freeze-dried-vial",
    formatLabel: "FREEZE-DRIED VIAL",
    category: "neuro",
    categoryLabel: "Neuro & Receptor Research",
    contents: "PT-141 / Bremelanotide",
    description: "High-purity lyophilised laboratory research vial vacuum sealed under inert nitrogen blanket. Highly stable cyclic heptapeptide cake.",
    price: 55.00,
    subscribePrice: 49.50,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/products/pt-141.png",
    accentColor: "#8B5CF6",
    technicalSpecs: {
      compoundName: "PT-141 (Bremelanotide Acetate)",
      contentsOrStrength: "PT-141 / Bremelanotide (10 mg Lyophilised Cake)",
      peptideClass: "Cyclic Heptapeptide Melanocortin Agonist (MC3R/MC4R)",
      compositionOrSequence: "Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-OH",
      molecularWeight: "1025.17 g/mol",
      casNumber: "189745-52-6",
      form: "Sterile Vacuum-Sealed Lyophilised Cake (3 mL Glass Vial)",
      storage: "-20°C Lyophilised; 2°C – 8°C Reconstituted",
      accentColor: "#8B5CF6",
      colorName: "Violet",
    },
  },
  {
    id: "vial-mots-c",
    name: "MOTS-c Freeze-Dried Vial",
    handle: "mots-c-vial",
    format: "freeze-dried-vial",
    formatLabel: "FREEZE-DRIED VIAL",
    category: "cellular",
    categoryLabel: "Mitochondrial Biology",
    contents: "MOTS-c / Mitochondrial Peptide",
    description: "High-purity lyophilised laboratory research vial vacuum sealed under inert nitrogen blanket. Vacuum desiccated mitochondrial-derived peptide.",
    price: 60.00,
    subscribePrice: 54.00,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/products/mots-c.png",
    accentColor: "#F43F5E",
    technicalSpecs: {
      compoundName: "MOTS-c (Mitochondrial 12S rRNA Type-c)",
      contentsOrStrength: "MOTS-c / Mitochondrial Peptide (10 mg Lyophilised Cake)",
      peptideClass: "Mitochondrial-Derived Peptide (MDP)",
      compositionOrSequence: "Met-Arg-Trp-Gln-Glu-Met-Gly-Tyr-Ile-Phe-Tyr-Pro-Arg-Lys-Leu-Arg",
      molecularWeight: "2174.61 g/mol",
      casNumber: "1627580-64-6",
      form: "Sterile Vacuum-Sealed Lyophilised Cake (3 mL Glass Vial)",
      storage: "-20°C Desiccated; 2°C – 8°C Reconstituted",
      accentColor: "#F43F5E",
      colorName: "Rose Coral",
    },
  },
  {
    id: "vial-wolverine",
    name: "Wolverine Stack Freeze-Dried Vial",
    handle: "wolverine-stack-vial",
    format: "freeze-dried-vial",
    formatLabel: "FREEZE-DRIED VIAL",
    category: "tissue",
    categoryLabel: "Cellular Matrix",
    contents: "BPC-157 + TB-500",
    description: "High-purity lyophilised laboratory research vial vacuum sealed under inert nitrogen blanket. BPC-157 (10 mg) + TB-500 (10 mg) dual peptide cake.",
    price: 75.00,
    subscribePrice: 67.50,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/products/bpc-157-tb-500.png",
    accentColor: "#2563EB",
    technicalSpecs: {
      compoundName: "Wolverine Synergistic Stack (BPC-157 & TB-500)",
      contentsOrStrength: "BPC-157 (10 mg) + TB-500 (10 mg) Dual Blend (20 mg Total)",
      peptideClass: "Dual Cytoprotective Pentadecapeptide & Actin-Binding Complex",
      compositionOrSequence: "BPC-157 (15-AA) + TB-500 (Thymosin β4 43-AA)",
      molecularWeight: "BPC-157: 1419.53 g/mol | TB-500: 4963.50 g/mol",
      casNumber: "137525-51-0 (BPC-157) / 77591-33-4 (TB-500)",
      form: "Sterile Vacuum-Sealed Lyophilised Cake (3 mL Glass Vial)",
      storage: "-20°C Long-term; 2°C – 8°C Reconstituted",
      accentColor: "#2563EB",
      colorName: "Cobalt Royal",
    },
  },
  {
    id: "vial-klow",
    name: "KLOW Stack Freeze-Dried Vial",
    handle: "klow-stack-vial",
    format: "freeze-dried-vial",
    formatLabel: "FREEZE-DRIED VIAL",
    category: "tissue",
    categoryLabel: "Cellular Matrix",
    contents: "GHK-Cu + BPC-157 + TB-500 + KPV",
    description: "High-purity lyophilised laboratory research vial vacuum sealed under inert nitrogen blanket. Quadruple complex: GHK-Cu, BPC-157, TB-500, KPV.",
    price: 80.00,
    subscribePrice: 72.00,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/products/klow.png",
    accentColor: "#EC4899",
    technicalSpecs: {
      compoundName: "KLOW Stack (Quadruple Synergistic Complex)",
      contentsOrStrength: "GHK-Cu + BPC-157 + TB-500 + KPV Quad Blend (70 mg Total)",
      peptideClass: "Quadruple Matrikine, Cytoprotective & Anti-inflammatory Complex",
      compositionOrSequence: "[Gly-His-Lys]·Cu2+ + BPC-157 + TB-500 + Lys-Pro-Val",
      molecularWeight: "GHK-Cu: 403.93 | BPC-157: 1419.53 | TB-500: 4963.50 | KPV: 357.45 g/mol",
      casNumber: "49557-75-7 / 137525-51-0 / 77591-33-4 / 67727-97-3",
      form: "Sterile Vacuum-Sealed Lyophilised Cake (3 mL Glass Vial)",
      storage: "-20°C Long-term; 2°C – 8°C Reconstituted",
      accentColor: "#EC4899",
      colorName: "Vibrant Pink",
    },
  },
  {
    id: "vial-nad",
    name: "NAD+ Freeze-Dried Vial",
    handle: "nad-vial",
    format: "freeze-dried-vial",
    formatLabel: "FREEZE-DRIED VIAL",
    category: "cellular",
    categoryLabel: "Cellular Longevity",
    contents: "Nicotinamide Adenine Dinucleotide",
    description: "High-purity lyophilised laboratory research vial vacuum sealed under inert nitrogen blanket. Lyophilised 500 mg active coenzyme substrate.",
    price: 72.50,
    subscribePrice: 65.25,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/products/nad-plus.png",
    accentColor: "#F97316",
    technicalSpecs: {
      compoundName: "Beta-Nicotinamide Adenine Dinucleotide (NAD+ Oxidized)",
      contentsOrStrength: "NAD+ / Nicotinamide Adenine Dinucleotide (500 mg Lyophilised Cake)",
      peptideClass: "Essential Coenzyme Dinucleotide / Cellular Substrate",
      compositionOrSequence: "C21H27N7O14P2",
      molecularWeight: "663.43 g/mol",
      casNumber: "53-84-9",
      form: "Sterile Vacuum-Sealed Lyophilised Cake (10 mL Glass Vial)",
      storage: "-20°C Desiccated; 2°C – 8°C Reconstituted",
      accentColor: "#F97316",
      colorName: "Sunset Orange",
    },
  },
  {
    id: "vial-retatrutide",
    name: "Retatrutide Freeze-Dried Vial",
    handle: "retatrutide-vial",
    format: "freeze-dried-vial",
    formatLabel: "FREEZE-DRIED VIAL",
    category: "metabolic",
    categoryLabel: "Triple Agonist Research",
    contents: "Retatrutide (GIP, GLP-1 & Glucagon)",
    description: "High-purity lyophilised laboratory research vial vacuum sealed under inert nitrogen blanket. Pure multi-target incretin & glucagon agonist cake.",
    price: 82.50,
    subscribePrice: 74.25,
    inStock: true,
    isSubscriptionEligible: true,
    image: "/images/products/glow-stack.png",
    accentColor: "#0D9488",
    technicalSpecs: {
      compoundName: "Retatrutide",
      contentsOrStrength: "Retatrutide (10 mg Lyophilised Cake)",
      peptideClass: "Triple Incretin & Glucagon Hormone Receptor Agonist",
      compositionOrSequence: "39-amino acid single peptide with branched diacid side-chain",
      molecularWeight: "4731.33 g/mol",
      casNumber: "2381089-83-2",
      form: "Sterile Vacuum-Sealed Lyophilised Cake (3 mL Glass Vial)",
      storage: "-20°C Long-term; 2°C – 8°C Reconstituted",
      accentColor: "#0D9488",
      colorName: "Marine Teal",
    },
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
      return (
        target.includes(pHandle) ||
        pHandle.includes(target) ||
        target.includes(pId) ||
        pId.includes(target) ||
        target.includes(pName) ||
        pName.includes(target)
      )
    })
    if (matched) return matched
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
      return (
        target.includes(pHandle) ||
        pHandle.includes(target) ||
        target.includes(pId) ||
        pId.includes(target) ||
        target.includes(pName) ||
        pName.includes(target)
      )
    })
    if (matched) return matched
    return CATALOG_PRODUCTS.find((p) => p.format === "freeze-dried-vial") || null
  }

  // 4. Handle pen set model queries or generic complete-pen-set
  if (
    cleanHandle === "complete-pen-set" ||
    cleanHandle.includes("pen-set") ||
    cleanHandle.includes("pen-system") ||
    cleanHandle.includes("pen")
  ) {
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
    return (
      pClean.includes(target) ||
      target.includes(pClean) ||
      pIdClean.includes(target) ||
      target.includes(pIdClean)
    )
  })

  return fuzzyMatch || null
}
