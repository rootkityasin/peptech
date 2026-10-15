/**
 * PEPTECH® Scientific Chemical Reference Profiles
 * Strict Laboratory & Analytical Research Standards (RUO)
 * 
 * Used as intelligent defaults for compounds in the catalog.
 * Note: Any value entered in the Medusa Admin panel (product.description, product.subtitle,
 * and product.metadata.*) ALWAYS takes immediate 100% precedence.
 */

export interface ChemicalProfile {
  title: string
  subtitle: string
  compoundName: string
  contents: string
  peptideClass: string
  sequence: string
  molecularWeight: string
  casNumber: string
  form: string
  storage: string
  ratio?: string
  totalContent?: string
  accentColor: string
  description: string
  howItWorks: string[]
  keyFeatures: string[]
}

export const CHEMICAL_PROFILES: Record<string, ChemicalProfile> = {
  "ghk-cu": {
    title: "GHK-Cu Complete Pen Set",
    subtitle: "Copper Tripeptide (50 mg / 1.5 mL)",
    compoundName: "GHK-Cu (Copper Glycyl-L-Histidyl-L-Lysine)",
    contents: "50 mg / 1.5 mL",
    peptideClass: "Copper(II) Tripeptide Matrikine Complex",
    sequence: "Gly-His-Lys · Cu(II)",
    molecularWeight: "≈ 403.93 g/mol",
    casNumber: "89030-95-5 / 49557-75-7",
    form: "1.5 mL Borosilicate Type I Cartridge",
    storage: "2°C – 8°C Refrigerated, protect from direct light",
    accentColor: "#16a6a3",
    description:
      "GHK-Cu is an analytical-grade copper(II) chelate of the endogenous tripeptide glycyl-L-histidyl-L-lysine, naturally isolated from biological plasma. Extensively investigated in peer-reviewed scientific literature for extracellular matrix remodeling, collagen and glycosaminoglycan synthesis regulation, and cellular protective signaling. Engineered for precision laboratory delivery in Type I borosilicate chambers. Exclusively for in-vitro scientific research and molecular analysis.",
    howItWorks: [
      "Copper(II) Chelation: Binds ionic copper with high picomolar affinity, serving as an analytical biological carrier complex.",
      "Matrix Remodeling Signaling: Extensively evaluated for modulating metalloproteinase activity and collagen/elastin extracellular deposition.",
      "Transcriptional Regulation: Investigated in genome-wide expression models for modulating thousands of human genetic pathways.",
    ],
    keyFeatures: [
      "≥ 99.0% Certified Purity by Independent HPLC Analysis",
      "Type I Borosilicate Glass Cartridge for Zero Chemical Leaching",
      "Calibrated for PEPTECH® Reusable Precision Pen System",
      "Independently Verified Batch Certificate of Analysis Included",
    ],
  },
  "klow-stack": {
    title: "KLOW Stack Complete Pen Set",
    subtitle: "GHK-Cu + BPC-157 + TB-500 + KPV (80 mg)",
    compoundName: "GHK-Cu + BPC-157 + TB-500 + KPV",
    ratio: "5 : 1 : 1 : 1",
    totalContent: "80 mg total research peptide",
    contents: "80 mg total active compound / 1.5 mL",
    peptideClass: "Quad-Peptide Regenerative Research Stack",
    sequence: "KPV: Lys-Pro-Val · GHK-Cu: Gly-His-Lys·Cu",
    molecularWeight: "Multi-compound calibrated matrix",
    casNumber: "Multiple analytical standards (Batch COA)",
    form: "1.5 mL Borosilicate Type I Cartridge",
    storage: "2°C – 8°C Refrigerated, protect from direct light",
    accentColor: "#8b5cf6",
    description:
      "The KLOW multi-peptide research formulation combines GHK-Cu, BPC-157, TB-500, and KPV at a calibrated 5:1:1:1 analytical ratio (80 mg total active compound). Distinguished by the integration of KPV—an alpha-MSH tripeptide fragment documented for microvascular and anti-inflammatory cellular pathways—alongside matrix-remodeling peptides. Pre-loaded into borosilicate glass for high-precision laboratory investigations. Certified HPLC purity per synthesis lot.",
    howItWorks: [
      "Extracellular Remodeling: GHK-Cu investigated for tissue scaffolding, glycosaminoglycan, and collagen synthesis pathways.",
      "Vascular & Cellular Migration: BPC-157 and TB-500 studied in combination for cellular motility and angiogenic signaling.",
      "Anti-Inflammatory Modulation: KPV tripeptide researched for NF-κB nuclear translocation inhibition in cell culture models.",
    ],
    keyFeatures: [
      "Calibrated 5:1:1:1 Ratio (50mg GHK-Cu, 10mg BPC-157, 10mg TB-500, 10mg KPV)",
      "High Concentration 80 mg Matrix in 1.5 mL Precision Volume",
      "Multi-pierce Bromobutyl Septum with Reseal Memory",
      "Strict In-Vitro Laboratory Research Standard",
    ],
  },
  "wolverine-stack": {
    title: "Wolverine Stack Complete Pen Set",
    subtitle: "BPC-157 + TB-500 (1:1 Ratio, 20 mg)",
    compoundName: "BPC-157 + TB-500 (1:1 Analytical Blend)",
    ratio: "1 : 1",
    totalContent: "20 mg total peptide content",
    contents: "20 mg (10 mg BPC-157 + 10 mg TB-500)",
    peptideClass: "Dual Tissue Repair & Angiogenic Research Matrix",
    sequence: "BPC-157: Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val | TB-500: Ac-LKKTETQ",
    molecularWeight: "BPC-157: 1419.5 g/mol · TB-500: 4963.5 g/mol",
    casNumber: "137525-51-0 (BPC) / 77591-33-4 (TB)",
    form: "1.5 mL Borosilicate Type I Cartridge",
    storage: "2°C – 8°C Refrigerated, protect from direct light",
    accentColor: "#f59e0b",
    description:
      "A dual-compound research matrix providing synthetic pentadecapeptide BPC-157 and Thymosin Beta-4 active fragment TB-500 in an equimolar 1:1 ratio (20 mg total content). Widely examined in tandem across cellular repair, angiogenesis, and tissue regeneration research models. Formulated into sterile, calibrated borosilicate delivery systems for verified in-vitro comparative evaluation.",
    howItWorks: [
      "Nitric Oxide & Angiogenesis: BPC-157 studied for modulating VEGFR2 expression and early growth response factors.",
      "Actin Sequestration: TB-500 researched for its ability to regulate G-actin polymerization and accelerate cellular migration.",
      "Dual-Path Synergy: Investigated together to observe simultaneous cellular mobility and extracellular stabilization.",
    ],
    keyFeatures: [
      "Balanced 1:1 Equimolar Ratio (10 mg BPC-157 + 10 mg TB-500)",
      "Synthesized via Solid-Phase Peptide Synthesis (SPPS)",
      "Batch Traceable via Packaging QR Code & Device Passport",
      "Complete Starter Kit with Reusable Precision Pen Included",
    ],
  },
  "glow": {
    title: "GLOW Stack Complete Pen Set",
    subtitle: "GHK-Cu + BPC-157 + TB-500 (70 mg)",
    compoundName: "GHK-Cu + BPC-157 + TB-500 (Triple Research Stack)",
    ratio: "5 : 1 : 1",
    totalContent: "70 mg total research peptide",
    contents: "70 mg total active compound / 1.5 mL",
    peptideClass: "Triple Peptide Tissue Remodeling Stack",
    sequence: "GHK-Cu (50 mg) + BPC-157 (10 mg) + TB-500 (10 mg)",
    molecularWeight: "Multi-compound calibrated matrix",
    casNumber: "Multiple analytical standards (Batch COA)",
    form: "1.5 mL Borosilicate Type I Cartridge",
    storage: "2°C – 8°C Refrigerated, protect from direct light",
    accentColor: "#14b8a6",
    description:
      "The GLOW research matrix combines GHK-Cu, BPC-157, and TB-500 in a calibrated 5:1:1 ratio (70 mg total compound). Integrates copper tripeptide matrix signaling with angiogenic and cellular migration research peptides, providing an established triple-peptide model for tissue regeneration analysis.",
    howItWorks: [
      "Extracellular Scaffolding: Copper tripeptide examined for dermal matrix remodeling and collagen stimulation.",
      "Angiogenesis Signaling: BPC-157 evaluated in microvascular tissue formation and granulation tissue models.",
      "Cellular Motility: TB-500 studied for actin filament reorganization and cellular migration speed.",
    ],
    keyFeatures: [
      "Triple Multi-Target Formula (50mg GHK-Cu, 10mg BPC-157, 10mg TB-500)",
      "Aseptic Fill in Class 100 Cleanroom Environment",
      "Borosilicate Type I Chamber Designed for 60-Unit Precision Dosing",
      "Independent HPLC and Mass Spectrometry Verification",
    ],
  },
  "tesamorelin": {
    title: "Tesamorelin Complete Pen Set",
    subtitle: "GHRH Analogue (10 mg / 1.5 mL)",
    compoundName: "Tesamorelin (trans-3-Hexenoyl-hGHRH 1-44)",
    contents: "10 mg / 1.5 mL",
    peptideClass: "Synthetic Growth Hormone-Releasing Factor (GHRH)",
    sequence: "trans-3-Hexenoyl-[Tyr1, Ala2]-hGHRH(1-44) amide",
    molecularWeight: "≈ 5136.0 g/mol",
    casNumber: "218949-48-5",
    form: "1.5 mL Borosilicate Type I Cartridge",
    storage: "2°C – 8°C Refrigerated, protect from direct light",
    accentColor: "#06b6d4",
    description:
      "Tesamorelin is a synthetic 44-amino-acid growth hormone-releasing factor (GHRH) analogue stabilized with a trans-3-hexenoyl N-terminal group. Extensively documented in endocrine pharmacology for selective binding at pituitary GHRH receptors, endogenous GH secretagogue pathways, and downstream IGF-1 cellular signaling. Standardized for precise laboratory evaluation with third-party analytical verification.",
    howItWorks: [
      "Pituitary GHRH Receptor Agonism: Highly selective activation of GHRH receptors stimulating somatotrope cyclic AMP synthesis.",
      "Pulsatile GH Cascade: Promotes natural, regulated secretion of endogenous growth hormone in biological models.",
      "Adipose & Metabolic Signaling: Extensively evaluated in published clinical literature for visceral lipid mobilization and IGF-1 elevation.",
    ],
    keyFeatures: [
      "N-Terminal Trans-3-Hexenoyl Chemical Stabilization",
      "Full 44-Amino-Acid Native GHRH Sequence Analogue",
      "≥ 99% HPLC Purity with Minimal Deamidation Degradation",
      "Cold-Chain Stored and Dispatched in Temperature-Controlled Packaging",
    ],
  },
  "tirzepatide": {
    title: "Tirzepatide Complete Pen Set",
    subtitle: "Dual GIP & GLP-1 Receptor Agonist (30 mg)",
    compoundName: "Tirzepatide (LY3298176)",
    contents: "30 mg / 1.5 mL",
    peptideClass: "Dual GIP / GLP-1 Incretin Receptor Agonist",
    sequence: "39-amino-acid synthetic peptide with C20 fatty diacid moiety",
    molecularWeight: "≈ 4813.45 g/mol",
    casNumber: "2023788-19-2",
    form: "1.5 mL Borosilicate Type I Cartridge",
    storage: "2°C – 8°C Refrigerated, protect from direct light",
    accentColor: "#ec4899",
    description:
      "Tirzepatide (LY3298176) is a synthetic 39-amino-acid peptide engineered as a dual agonist at the glucose-dependent insulinotropic polypeptide (GIP) and glucagon-like peptide-1 (GLP-1) receptor systems. Recognized in modern metabolic and incretin signaling literature for its dual-pathway affinity profile. Provided in laboratory-calibrated delivery systems for in-vitro metabolic investigation.",
    howItWorks: [
      "Dual Incretin Binding: Concurrently engages both GIP and GLP-1 receptor complexes with distinct pharmacological kinetics.",
      "Glucose-Dependent Secretion: Researched for stimulating beta-cell insulin secretion while suppressing glucagon during hyperglycemia models.",
      "Central Satiety Pathways: Extensively investigated in metabolic literature for modulating hypothalamic appetite circuits.",
    ],
    keyFeatures: [
      "Dual Receptor Agonist with High Affinity at GIP and GLP-1 Sites",
      "C20 Diacid Side-Chain for Extended Albumin-Binding Stability",
      "Ultra-Pure Incretin Reference Standard for In-Vitro Bioassays",
      "Compatible with PEPTECH Reusable Micro-Click System",
    ],
  },
  "retatrutide": {
    title: "Retatrutide Complete Pen Set",
    subtitle: "Triple GIP / GLP-1 / Glucagon Agonist (30 mg)",
    compoundName: "Retatrutide (LY3437943)",
    contents: "30 mg / 1.5 mL",
    peptideClass: "Unimolecular Triple Incretin Receptor Agonist",
    sequence: "39-amino-acid peptide containing alpha-methyl-L-leucine and C20 diacid",
    molecularWeight: "≈ 4731.33 g/mol",
    casNumber: "2381089-83-2",
    form: "1.5 mL Borosilicate Type I Cartridge",
    storage: "2°C – 8°C Refrigerated, protect from direct light",
    accentColor: "#3b82f6",
    description:
      "Retatrutide (LY3437943) is an advanced synthetic unimolecular triple agonist targeting the GIP, GLP-1, and glucagon (GCGR) receptor complexes. Characterized in receptor pharmacology studies for its multi-target activation kinetics and energy balance research profiles. Prepared in high-purity borosilicate delivery cartridges with full analytical batch traceability.",
    howItWorks: [
      "Triple Receptor Synergism: Balanced co-agonism at GIP, GLP-1, and glucagon receptors optimizing metabolic signaling.",
      "Glucagon Receptor Agonism: Differentiates from dual incretins by elevating hepatic energy expenditure and lipid oxidation pathways.",
      "Insulinotropic Modulation: Glucose-dependent insulin regulation mediated through dual incretin receptor cooperativity.",
    ],
    keyFeatures: [
      "First-in-Class Triple Incretin Receptor Unimolecular Agonist",
      "Precision-Engineered 39-Residue Backbone with Fatty Diacid Acylation",
      "Rigorous Third-Party HPLC Assayed Above 99.0% Purity",
      "Hermetically Sealed Borosilicate Glass Chamber",
    ],
  },
  "melanotan-2": {
    title: "Melanotan II Complete Pen Set",
    subtitle: "Synthetic Melanocortin Agonist (10 mg)",
    compoundName: "Melanotan II (MT-2 / MT-II)",
    contents: "10 mg / 1.5 mL",
    peptideClass: "Cyclic Heptapeptide Melanocortin Receptor Agonist",
    sequence: "Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-NH2",
    molecularWeight: "≈ 1024.18 g/mol",
    casNumber: "121062-08-6",
    form: "1.5 mL Borosilicate Type I Cartridge",
    storage: "2°C – 8°C Refrigerated, protect from direct light",
    accentColor: "#f97316",
    description:
      "Melanotan II (MT-2) is a synthetic, cyclic lactam analogue of alpha-melanocyte stimulating hormone (α-MSH) displaying non-selective agonist affinity across MC1R, MC3R, MC4R, and MC5R melanocortin receptor subtypes. Investigated in cellular receptor profiling and melanogenesis pathway research. Supplied in batch-verified sterile laboratory containers.",
    howItWorks: [
      "Broad Melanocortin Agonism: Stimulates MC1R, MC3R, MC4R, and MC5R with nanomolar binding affinity.",
      "Eumelanin Biosynthesis: Evaluated in melanocyte cell culture for up-regulating tyrosinase and melanin photoprotective synthesis.",
      "Central Receptor Interactions: Researched for central nervous system melanocortin signaling pathways.",
    ],
    keyFeatures: [
      "Cyclic Lactam Bridge Providing High Enzymatic Resistance",
      "Non-Selective Melanocortin Affinity across MC1R through MC5R",
      "Lyophilized and Pre-loaded under Laminar Airflow Conditions",
      "Batch-Specific Chromatographic Purity Certificate",
    ],
  },
  "pt-141": {
    title: "PT-141 Complete Pen Set",
    subtitle: "Selective MC3R/MC4R Agonist (10 mg)",
    compoundName: "PT-141 (Bremelanotide)",
    contents: "10 mg / 1.5 mL",
    peptideClass: "Cyclic Melanocortin Receptor Agonist",
    sequence: "Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-OH",
    molecularWeight: "≈ 1025.18 g/mol",
    casNumber: "189745-66-9",
    form: "1.5 mL Borosilicate Type I Cartridge",
    storage: "2°C – 8°C Refrigerated, protect from direct light",
    accentColor: "#d946ef",
    description:
      "PT-141 (Bremelanotide) is a synthetic cyclic heptapeptide melanocortin agonist with preferential binding affinity for central MC3R and MC4R pathways. Possesses a free C-terminal carboxylate distinguishing its pharmacological profile from MT-2. Formulated for controlled scientific investigation in laboratory models.",
    howItWorks: [
      "Selective MC4R/MC3R Binding: Displays narrower receptor selectivity compared to parent cyclic analogues.",
      "CNS Neurological Modulation: Investigated for crossing the blood-brain barrier to trigger hypothalamic dopamine signaling.",
      "Non-Vascular Mechanism: Operates independently of peripheral vascular dilation models in laboratory research.",
    ],
    keyFeatures: [
      "Free C-Terminal Carboxyl Group for Distinct Receptor Affinity",
      "Highly Specific Central Melanocortin Model Receptor Tool",
      "Packaged in Type I Borosilicate Glass Cartridges",
      "Complete Authentication Passport with Packaging QR Verification",
    ],
  },
  "mots-c": {
    title: "MOTS-c Complete Pen Set",
    subtitle: "Mitochondrial-Derived Peptide (32 mg)",
    compoundName: "MOTS-c (Mitochondrial ORF of the 12S rRNA Type-c)",
    contents: "32 mg / 1.5 mL",
    peptideClass: "Mitochondrial-Derived Peptide (MDP)",
    sequence: "Met-Arg-Trp-Gln-Glu-Met-Gly-Tyr-Ile-Phe-Tyr-Pro-Arg-Lys-Leu-Arg",
    molecularWeight: "≈ 2174.62 g/mol",
    casNumber: "1627580-64-6",
    totalContent: "32 mg active standard",
    form: "1.5 mL Borosilicate Type I Cartridge",
    storage: "2°C – 8°C Refrigerated, protect from direct light",
    accentColor: "#10b981",
    description:
      "MOTS-c is a 16-amino-acid mitochondrial-derived peptide (MDP) encoded within the 12S ribosomal RNA sequence of the mitochondrial genome. Heavily researched as an intracellular metabolic regulator acting via the AMPK signaling cascade and cellular glucose uptake pathways. Calibrated to 32 mg total active research standard.",
    howItWorks: [
      "Mitochondrial Genome Origin: Naturally expressed from mitochondrial DNA rather than nuclear chromosomes.",
      "AMPK Activation: Directly stimulates AMP-activated protein kinase without depleting cellular ATP pools.",
      "Glucose Utilization Signaling: Studied for enhancing insulin sensitivity and cellular metabolic flexibility in vitro.",
    ],
    keyFeatures: [
      "Native 16-Residue Mitochondrial-Derived Sequence",
      "Active Investigational Tool for Cellular Bioenergetics and AMPK Cascades",
      "High Chemical Purity Standard (≥ 99% HPLC)",
      "Refrigerated Cold-Chain Storage Standard",
    ],
  },
  "nad-plus": {
    title: "NAD+ Complete Pen Set",
    subtitle: "Nicotinamide Adenine Dinucleotide (500 mg)",
    compoundName: "Nicotinamide Adenine Dinucleotide (NAD+)",
    contents: "500 mg / 1.5 mL",
    peptideClass: "Cellular Dinucleotide Coenzyme",
    sequence: "Adenine-ribose-phosphate-phosphate-ribose-nicotinamide",
    molecularWeight: "≈ 663.43 g/mol",
    casNumber: "53-84-9",
    totalContent: "500 mg active coenzyme",
    form: "1.5 mL Borosilicate Type I Cartridge",
    storage: "2°C – 8°C Refrigerated, protect from direct light",
    accentColor: "#6366f1",
    description:
      "Nicotinamide Adenine Dinucleotide (NAD+) is an essential pyridine dinucleotide coenzyme participating as an indispensable electron carrier in cellular redox biochemistry and as a rate-limiting substrate for sirtuins and PARP enzymes. Formulated to high analytical purity for cellular bioenergetics and enzyme kinetics investigations.",
    howItWorks: [
      "Redox Bioenergetics: Central hydride acceptor/donor in glycolysis, Krebs cycle, and oxidative phosphorylation.",
      "Sirtuin Activation (SIRT1-7): Rate-limiting co-substrate required for sirtuin-mediated protein deacetylation.",
      "PARP DNA Repair: Substrate consumed by poly(ADP-ribose) polymerases during genomic maintenance cascades.",
    ],
    keyFeatures: [
      "High Potency 500 mg Formulation in Stable Solution",
      "Critical Electron Transfer Coenzyme for Bioenergetics Assays",
      "Essential Sirtuin (SIRT1) and PARP Co-Substrate Standard",
      "Supplied in Calibrated PEPTECH Cartridge System",
    ],
  },
}

/**
 * Helper to retrieve chemical profile by handle or compound name
 */
export function getChemicalProfile(slugOrHandle: string): ChemicalProfile | null {
  if (!slugOrHandle) return null
  const clean = slugOrHandle
    .toLowerCase()
    .replace(/^pen-system-/, "")
    .replace(/-pen-set$/, "")
    .replace(/-cartridge$/, "")
    .replace(/-vial$/, "")
    .trim()

  if (CHEMICAL_PROFILES[clean]) return CHEMICAL_PROFILES[clean]

  // Fuzzy match
  for (const [key, profile] of Object.entries(CHEMICAL_PROFILES)) {
    if (clean.includes(key) || key.includes(clean)) {
      return profile
    }
  }

  return null
}
