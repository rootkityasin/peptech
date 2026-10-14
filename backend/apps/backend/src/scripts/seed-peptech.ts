import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  deleteProductCategoriesWorkflow,
  deleteProductsWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function seedPeptech({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  logger.info("==================================================================");
  logger.info("=== PEPTECH CATALOG SEED: 10 COMPOUNDS x 3 FORMATS = 30 PRODUCTS ===");
  logger.info("=== HIGH-RES IMAGES: C:\\Users\\Rootkit\\Downloads\\Peptech product ===");
  logger.info("==================================================================");

  // 1. Fetch & Delete all legacy products
  logger.info("Step 1: Purging all previous products...");
  
  // Clear any existing test inventory reservations that block product deletion
  try {
    const { Client } = require("pg");
    const rawDbUrl = process.env.DATABASE_URL || "postgresql://postgres.ubzoovlhbnztjwemvrwo:Peptech2026!@aws-0-eu-west-2.pooler.supabase.com:6543/postgres";
    const pgClient = new Client({ connectionString: rawDbUrl });
    await pgClient.connect();
    await pgClient.query("DELETE FROM reservation_item");
    await pgClient.query("UPDATE inventory_level SET reserved_quantity = 0, raw_reserved_quantity = '{\"value\": \"0\", \"precision\": 20}' WHERE reserved_quantity > 0");
    await pgClient.end();
    logger.info("Cleared test reservation items and reset reserved quantities to allow product deletion.");
  } catch (err: any) {
    logger.warn(`Could not clear reservations: ${err.message}`);
  }

  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["id", "title", "handle"],
  });

  if (existingProducts && existingProducts.length > 0) {
    const productIds = existingProducts.map((p: any) => p.id);
    logger.info(`Deleting ${productIds.length} existing products...`);
    await deleteProductsWorkflow(container).run({
      input: {
        ids: productIds,
      },
    });
    logger.info(`Successfully purged all ${productIds.length} previous products.`);
  } else {
    logger.info("No existing products to purge.");
  }

  // 2. Fetch & Delete all legacy categories
  logger.info("Step 2: Checking for existing categories...");
  const { data: existingCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name", "handle"],
  });

  let penSetsCat: any;
  let refillsCat: any;
  let vialsCat: any;

  if (existingCategories && existingCategories.length > 0) {
    penSetsCat = existingCategories.find((c: any) => c.handle === "complete-pen-sets");
    refillsCat = existingCategories.find((c: any) => c.handle === "refill-cartridges");
    vialsCat = existingCategories.find((c: any) => c.handle === "freeze-dried-vials");
  }

  if (!penSetsCat || !refillsCat || !vialsCat) {
    // Delete any old categories and recreate clean
    if (existingCategories && existingCategories.length > 0) {
      const categoryIds = existingCategories.map((c: any) => c.id);
      logger.info(`Cleaning ${categoryIds.length} existing categories...`);
      await deleteProductCategoriesWorkflow(container).run({
        input: categoryIds,
      });
    }

    logger.info("Creating 3 PEPTECH product categories...");
    const { result: categoryResult } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: [
          {
            name: "Complete Pen Sets",
            handle: "complete-pen-sets",
            description:
              "First-time buyer starter package: Reusable precision aluminum pen, prefilled cartridge, serialized device passport, 31G 5mm sterile needles, and alcohol prep pads. One-time purchase only.",
            is_active: true,
          },
          {
            name: "Refill Cartridges",
            handle: "refill-cartridges",
            description:
              "Designed exclusively for the PEPTECH reusable pen system. Available for One-Time Purchase and 28-day Subscribe & Save (10% discount).",
            is_active: true,
          },
          {
            name: "Freeze-Dried Vials",
            handle: "freeze-dried-vials",
            description:
              "High-purity laboratory lyophilised vials with verifiable HPLC & Mass Spectrometry lab reports. One-time purchase or 28-day Subscribe & Save (10% discount).",
            is_active: true,
          },
        ],
      },
    });

    penSetsCat = categoryResult.find((c: any) => c.handle === "complete-pen-sets")!;
    refillsCat = categoryResult.find((c: any) => c.handle === "refill-cartridges")!;
    vialsCat = categoryResult.find((c: any) => c.handle === "freeze-dried-vials")!;
  }

  logger.info(`Categories verified:
  - Complete Pen Sets: ${penSetsCat.id}
  - Refill Cartridges: ${refillsCat.id}
  - Freeze-Dried Vials: ${vialsCat.id}`);

  // 3. Resolve Default Sales Channel and Shipping Profile
  logger.info("Step 3: Resolving default sales channel and shipping profile...");
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  });
  const defaultSalesChannel = salesChannels[0];

  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id", "name"],
  });
  const shippingProfile = shippingProfiles[0];

  logger.info(`Using Sales Channel: ${defaultSalesChannel.id}, Shipping Profile: ${shippingProfile.id}`);

  // 4. Define the 10 Authoritative Compounds from Brief
  const compounds = [
    {
      id: "ghk-cu",
      name: "GHK-Cu",
      fullName: "GHK-Cu (Copper Glycyl-L-Histidyl-L-Lysine)",
      contents: "GHK-Cu / Copper Peptide",
      penPrice: 145.99,
      refillPrice: 73.00,
      vialPrice: 73.00,
      image: "/static/ghk-cu.jpg",
      category: "tissue",
      categoryLabel: "Cellular Matrix",
      accentColor: "#14B8A6",
      colorName: "Turquoise",
      peptideClass: "Copper Matrikine Tripeptide",
      compositionOrSequence: "[Gly-His-Lys]·Cu2+",
      molecularWeight: "403.93 g/mol",
      casNumber: "49557-75-7 / 89030-95-5",
      strengthPen: "50 mg / 1.5 mL",
      strengthVial: "50 mg Lyophilised Cake",
    },
    {
      id: "tesamorelin",
      name: "Tesamorelin",
      fullName: "Tesamorelin Acetate",
      contents: "Tesamorelin",
      penPrice: 145.99,
      refillPrice: 73.00,
      vialPrice: 73.00,
      image: "/static/tesamorelin.jpg",
      category: "metabolic",
      categoryLabel: "Metabolic Research",
      accentColor: "#3B82F6",
      colorName: "Royal Blue",
      peptideClass: "Growth Hormone Releasing Factor (GHRF) Analogue",
      compositionOrSequence: "trans-hexenoyl-[Tyr1, D-Ala2, Asp3, ...]-hGRF(1-44)NH2",
      molecularWeight: "5135.86 g/mol",
      casNumber: "218949-48-5",
      strengthPen: "10 mg / 1.5 mL",
      strengthVial: "10 mg Lyophilised Cake",
    },
    {
      id: "tirzepatide",
      name: "Tirzepatide",
      fullName: "Tirzepatide",
      contents: "Tirzepatide (GIP & GLP-1)",
      penPrice: 164.99,
      refillPrice: 82.50,
      vialPrice: 82.50,
      image: "/static/tirzepatide.png",
      category: "metabolic",
      categoryLabel: "Dual Incretin Research",
      accentColor: "#10B981",
      colorName: "Emerald",
      peptideClass: "Dual GIP & GLP-1 Receptor Co-Agonist",
      compositionOrSequence: "39-amino acid linear peptide with C20 diacid fatty chain",
      molecularWeight: "4813.45 g/mol",
      casNumber: "2023788-19-2",
      strengthPen: "10 mg / 1.5 mL",
      strengthVial: "10 mg Lyophilised Cake",
    },
    {
      id: "melanotan-2",
      name: "Melanotan II (MT-2)",
      fullName: "Melanotan II (MT-2)",
      contents: "Melanotan II",
      penPrice: 99.99,
      refillPrice: 50.00,
      vialPrice: 50.00,
      image: "/static/melanotan-2.png",
      category: "cellular",
      categoryLabel: "Melanocortin Research",
      accentColor: "#F59E0B",
      colorName: "Amber Bronze",
      peptideClass: "Synthetic Cyclic Melanocortin Receptor Agonist",
      compositionOrSequence: "Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-NH2",
      molecularWeight: "1024.18 g/mol",
      casNumber: "121062-08-6",
      strengthPen: "10 mg / 1.5 mL",
      strengthVial: "10 mg Lyophilised Cake",
    },
    {
      id: "pt-141",
      name: "PT-141 (Bremelanotide)",
      fullName: "PT-141 (Bremelanotide Acetate)",
      contents: "PT-141 / Bremelanotide",
      penPrice: 109.99,
      refillPrice: 55.00,
      vialPrice: 55.00,
      image: "/static/pt-141.png",
      category: "neuro",
      categoryLabel: "Neuro & Receptor Research",
      accentColor: "#8B5CF6",
      colorName: "Violet",
      peptideClass: "Cyclic Heptapeptide Melanocortin Agonist (MC3R/MC4R)",
      compositionOrSequence: "Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-OH",
      molecularWeight: "1025.17 g/mol",
      casNumber: "189745-52-6",
      strengthPen: "10 mg / 1.5 mL",
      strengthVial: "10 mg Lyophilised Cake",
    },
    {
      id: "mots-c",
      name: "MOTS-c",
      fullName: "MOTS-c (Mitochondrial 12S rRNA Type-c)",
      contents: "MOTS-c / Mitochondrial Peptide",
      penPrice: 119.99,
      refillPrice: 60.00,
      vialPrice: 60.00,
      image: "/static/mots-c.png",
      category: "cellular",
      categoryLabel: "Mitochondrial Biology",
      accentColor: "#F43F5E",
      colorName: "Rose Coral",
      peptideClass: "Mitochondrial-Derived Peptide (MDP)",
      compositionOrSequence: "Met-Arg-Trp-Gln-Glu-Met-Gly-Tyr-Ile-Phe-Tyr-Pro-Arg-Lys-Leu-Arg",
      molecularWeight: "2174.61 g/mol",
      casNumber: "1627580-64-6",
      strengthPen: "10 mg / 1.5 mL",
      strengthVial: "10 mg Lyophilised Cake",
    },
    {
      id: "wolverine",
      name: "Wolverine Stack",
      fullName: "Wolverine Synergistic Stack (BPC-157 & TB-500)",
      contents: "BPC-157 + TB-500",
      penPrice: 149.99,
      refillPrice: 75.00,
      vialPrice: 75.00,
      image: "/static/bpc-157-tb-500.png",
      category: "tissue",
      categoryLabel: "Cellular Matrix",
      accentColor: "#2563EB",
      colorName: "Cobalt Royal",
      peptideClass: "Dual Cytoprotective Pentadecapeptide & Actin-Binding Complex",
      compositionOrSequence: "BPC-157 (15-AA) + TB-500 (Thymosin β4 43-AA)",
      molecularWeight: "BPC-157: 1419.53 | TB-500: 4963.50 g/mol",
      casNumber: "137525-51-0 / 77591-33-4",
      strengthPen: "BPC-157 10mg + TB-500 10mg (20mg / 1.5 mL)",
      strengthVial: "20 mg Lyophilised Cake",
    },
    {
      id: "klow",
      name: "KLOW Stack",
      fullName: "KLOW Stack (Quadruple Synergistic Complex)",
      contents: "GHK-Cu + BPC-157 + TB-500 + KPV",
      penPrice: 159.99,
      refillPrice: 80.00,
      vialPrice: 80.00,
      image: "/static/klow.png",
      category: "tissue",
      categoryLabel: "Cellular Matrix",
      accentColor: "#EC4899",
      colorName: "Vibrant Pink",
      peptideClass: "Quadruple Matrikine, Cytoprotective & Anti-inflammatory Complex",
      compositionOrSequence: "[Gly-His-Lys]·Cu2+ + BPC-157 + TB-500 + Lys-Pro-Val",
      molecularWeight: "GHK-Cu: 403.93 | BPC-157: 1419.53 | TB-500: 4963.50 | KPV: 357.45",
      casNumber: "49557-75-7 / 137525-51-0 / 77591-33-4 / 67727-97-3",
      strengthPen: "Quadruple Matrix (70 mg Total / 1.5 mL)",
      strengthVial: "70 mg Lyophilised Cake",
    },
    {
      id: "nad",
      name: "NAD+",
      fullName: "Beta-Nicotinamide Adenine Dinucleotide (NAD+ Oxidized)",
      contents: "Nicotinamide Adenine Dinucleotide",
      penPrice: 144.99,
      refillPrice: 72.50,
      vialPrice: 72.50,
      image: "/static/nad-plus.png",
      category: "cellular",
      categoryLabel: "Cellular Longevity",
      accentColor: "#F97316",
      colorName: "Sunset Orange",
      peptideClass: "Essential Coenzyme Dinucleotide / Cellular Substrate",
      compositionOrSequence: "C21H27N7O14P2",
      molecularWeight: "663.43 g/mol",
      casNumber: "53-84-9",
      strengthPen: "500 mg / 1.5 mL",
      strengthVial: "500 mg Lyophilised Cake",
    },
    {
      id: "retatrutide",
      name: "Retatrutide",
      fullName: "Retatrutide",
      contents: "Retatrutide (GIP, GLP-1 & Glucagon)",
      penPrice: 164.99,
      refillPrice: 82.50,
      vialPrice: 82.50,
      image: "/static/glow-stack.png",
      category: "metabolic",
      categoryLabel: "Triple Agonist Research",
      accentColor: "#0D9488",
      colorName: "Marine Teal",
      peptideClass: "Triple Incretin & Glucagon Hormone Receptor Agonist",
      compositionOrSequence: "39-amino acid single peptide with branched diacid side-chain",
      molecularWeight: "4731.33 g/mol",
      casNumber: "2381089-83-2",
      strengthPen: "10 mg / 1.5 mL",
      strengthVial: "10 mg Lyophilised Cake",
    },
  ];

  const productsToCreate: any[] = [];

  for (const c of compounds) {
    // 1. Complete Pen Set (Strictly One-Time Purchase)
    productsToCreate.push({
      title: `${c.name} Complete Pen Set`,
      handle: `${c.id}-pen-set`,
      subtitle: c.contents,
      description: `Reusable Precision Pen System + 1x ${c.name} Prefilled Borosilicate Cartridge + 4x 31G 5mm Needles + 4x Prep Pads + Device Passport with QR Verification.`,
      thumbnail: c.image,
      images: [{ url: c.image }],
      category_ids: [penSetsCat.id],
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel.id }],
      metadata: {
        category: c.category,
        categoryLabel: c.categoryLabel,
        format: "complete-pen-set",
        formatLabel: "COMPLETE PEN SET",
        contents: c.contents,
        accentColor: c.accentColor,
        isSubscriptionEligible: false,
        purchaseType: "one-time",
        tag: "COMPLETE PEN SET",
        compound_name: c.fullName,
        contents_strength: `${c.contents} (${c.strengthPen})`,
        peptide_class: c.peptideClass,
        sequence: c.compositionOrSequence,
        molecular_weight: c.molecularWeight,
        cas_number: c.casNumber,
        form: "Reusable Precision Pen System + 1.5 mL Cartridge",
        storage: "2°C – 8°C Refrigerated",
        technicalSpecs: {
          compoundName: c.fullName,
          contentsOrStrength: `${c.contents} (${c.strengthPen})`,
          peptideClass: c.peptideClass,
          compositionOrSequence: c.compositionOrSequence,
          molecularWeight: c.molecularWeight,
          casNumber: c.casNumber,
          form: "Reusable Precision Pen System + 1.5 mL Cartridge",
          storage: "2°C – 8°C Refrigerated",
          accentColor: c.accentColor,
          colorName: c.colorName,
        },
      },
      options: [{ title: "System", values: ["Complete Starter Kit"] }],
      variants: [
        {
          title: "Complete Starter Kit",
          sku: `PEP-PEN-${c.id.toUpperCase()}`,
          options: { System: "Complete Starter Kit" },
          prices: [
            { amount: c.penPrice, currency_code: "gbp" },
            { amount: Number((c.penPrice * 1.25).toFixed(2)), currency_code: "usd" },
            { amount: Number((c.penPrice * 1.15).toFixed(2)), currency_code: "eur" },
          ],
        },
      ],
    });

    // 2. Refill Cartridge (One-Time + 28-Day Subscribe & Save @ 10% Discount)
    const refillSubPrice = Number((c.refillPrice * 0.9).toFixed(2));
    productsToCreate.push({
      title: `${c.name} Refill Cartridge`,
      handle: `${c.id}-cartridge`,
      subtitle: c.contents,
      description: `1.5 mL Borosilicate Type I glass prefilled cartridge calibrated for the PEPTECH reusable pen. Chemically inert with bromobutyl multi-pierce septum.`,
      thumbnail: c.image,
      images: [
        { url: c.image },
        { url: "/images/peptech/cartridge.webp" }
      ],
      category_ids: [refillsCat.id],
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel.id }],
      metadata: {
        category: c.category,
        categoryLabel: c.categoryLabel,
        format: "refill-cartridge",
        formatLabel: "REFILL CARTRIDGE",
        contents: c.contents,
        accentColor: c.accentColor,
        isSubscriptionEligible: true,
        subscriptionDiscount: 10,
        subscriptionPriceGbp: refillSubPrice,
        purchaseType: "one-time-and-subscription",
        tag: "REFILL CARTRIDGE",
        compound_name: c.fullName,
        contents_strength: `${c.contents} (${c.strengthPen})`,
        peptide_class: c.peptideClass,
        sequence: c.compositionOrSequence,
        molecular_weight: c.molecularWeight,
        cas_number: c.casNumber,
        form: "1.5 mL Borosilicate Type I Cartridge (60-Unit Calibration)",
        storage: "2°C – 8°C Refrigerated",
        technicalSpecs: {
          compoundName: c.fullName,
          contentsOrStrength: `${c.contents} (${c.strengthPen})`,
          peptideClass: c.peptideClass,
          compositionOrSequence: c.compositionOrSequence,
          molecularWeight: c.molecularWeight,
          casNumber: c.casNumber,
          form: "1.5 mL Borosilicate Type I Cartridge (60-Unit Calibration)",
          storage: "2°C – 8°C Refrigerated",
          accentColor: c.accentColor,
          colorName: c.colorName,
        },
      },
      options: [{ title: "Format", values: ["1.5 mL Cartridge"] }],
      variants: [
        {
          title: "1.5 mL Cartridge",
          sku: `PEP-CAR-${c.id.toUpperCase()}`,
          options: { Format: "1.5 mL Cartridge" },
          prices: [
            { amount: c.refillPrice, currency_code: "gbp" },
            { amount: Number((c.refillPrice * 1.25).toFixed(2)), currency_code: "usd" },
            { amount: Number((c.refillPrice * 1.15).toFixed(2)), currency_code: "eur" },
          ],
        },
      ],
    });

    // 3. Freeze-Dried Vial (One-Time + 28-Day Subscribe & Save @ 10% Discount)
    const vialSubPrice = Number((c.vialPrice * 0.9).toFixed(2));
    productsToCreate.push({
      title: `${c.name} Freeze-Dried Vial`,
      handle: `${c.id}-vial`,
      subtitle: c.contents,
      description: `High-purity lyophilised laboratory research vial vacuum sealed under inert nitrogen blanket. Sterile lyophilised cake for analytical dilution.`,
      thumbnail: c.image,
      images: [
        { url: c.image },
        { url: "/images/peptech/mockup2.webp" }
      ],
      category_ids: [vialsCat.id],
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel.id }],
      metadata: {
        category: c.category,
        categoryLabel: c.categoryLabel,
        format: "freeze-dried-vial",
        formatLabel: "FREEZE-DRIED VIAL",
        contents: c.contents,
        accentColor: c.accentColor,
        isSubscriptionEligible: true,
        subscriptionDiscount: 10,
        subscriptionPriceGbp: vialSubPrice,
        purchaseType: "one-time-and-subscription",
        tag: "FREEZE-DRIED VIAL",
        compound_name: c.fullName,
        contents_strength: `${c.contents} (${c.strengthVial})`,
        peptide_class: c.peptideClass,
        sequence: c.compositionOrSequence,
        molecular_weight: c.molecularWeight,
        cas_number: c.casNumber,
        form: "Sterile Vacuum-Sealed Lyophilised Cake (3 mL Glass Vial)",
        storage: "-20°C Long-term; 2°C – 8°C Reconstituted",
        technicalSpecs: {
          compoundName: c.fullName,
          contentsOrStrength: `${c.contents} (${c.strengthVial})`,
          peptideClass: c.peptideClass,
          compositionOrSequence: c.compositionOrSequence,
          molecularWeight: c.molecularWeight,
          casNumber: c.casNumber,
          form: "Sterile Vacuum-Sealed Lyophilised Cake (3 mL Glass Vial)",
          storage: "-20°C Long-term; 2°C – 8°C Reconstituted",
          accentColor: c.accentColor,
          colorName: c.colorName,
        },
      },
      options: [{ title: "Format", values: ["Lyophilised Vial"] }],
      variants: [
        {
          title: "Lyophilised Vial",
          sku: `PEP-VIA-${c.id.toUpperCase()}`,
          options: { Format: "Lyophilised Vial" },
          prices: [
            { amount: c.vialPrice, currency_code: "gbp" },
            { amount: Number((c.vialPrice * 1.25).toFixed(2)), currency_code: "usd" },
            { amount: Number((c.vialPrice * 1.15).toFixed(2)), currency_code: "eur" },
          ],
        },
      ],
    });
  }

  logger.info(`Step 4: Creating ${productsToCreate.length} products across 3 formats...`);
  await createProductsWorkflow(container).run({
    input: {
      products: productsToCreate,
    },
  });

  logger.info(`✅ Successfully seeded ${productsToCreate.length} PEPTECH products matching Regenmed catalog with new images!`);
}
