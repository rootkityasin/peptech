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

  logger.info("=== PEPTECH CATALOG SEED INITIALIZATION ===");

  // 1. Fetch & Delete all legacy/demo products
  logger.info("Step 1: Checking for existing products to purge...");
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
    logger.info("Successfully purged all existing products.");
  } else {
    logger.info("No existing products to purge.");
  }

  // 2. Fetch & Delete all legacy/demo categories
  logger.info("Step 2: Checking for existing categories to purge...");
  const { data: existingCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name"],
  });

  if (existingCategories && existingCategories.length > 0) {
    const categoryIds = existingCategories.map((c: any) => c.id);
    logger.info(`Deleting ${categoryIds.length} existing categories...`);
    await deleteProductCategoriesWorkflow(container).run({
      input: categoryIds,
    });
    logger.info("Successfully purged all existing categories.");
  } else {
    logger.info("No existing categories to purge.");
  }

  // 3. Create the 3 PEPTECH Product Categories
  logger.info("Step 3: Creating 3 PEPTECH product categories...");
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
            "High-purity laboratory lyophilised vials with verifiable HPLC & Mass Spectrometry lab reports. One-time purchase or 28-day Subscribe & Save.",
          is_active: true,
        },
      ],
    },
  });

  const penSetsCat = categoryResult.find((c: any) => c.name === "Complete Pen Sets")!;
  const refillsCat = categoryResult.find((c: any) => c.name === "Refill Cartridges")!;
  const vialsCat = categoryResult.find((c: any) => c.name === "Freeze-Dried Vials")!;

  logger.info(`Created categories:
  - Complete Pen Sets: ${penSetsCat.id}
  - Refill Cartridges: ${refillsCat.id}
  - Freeze-Dried Vials: ${vialsCat.id}`);

  // 4. Retrieve Default Sales Channel and Shipping Profile
  logger.info("Step 4: Resolving default sales channel and shipping profile...");
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

  // 5. Build PEPTECH Products Catalog
  logger.info("Step 5: Seeding PEPTECH products...");

  const productsToCreate: any[] = [
    // --- Category 1: Complete Pen Sets (Strictly One-Time) ---
    {
      title: "PEPTECH Reusable Pen Set — Retatrutide 10mg",
      handle: "pen-retatrutide-10",
      description:
        "The complete starter package for laboratory research. Each set includes our medical-grade reusable precision aluminum pen, a prefilled certified 10mg Retatrutide cartridge (HPLC 99.4%), serialized device passport card, 5x sterile 31G 5mm ultra-fine needles, and 10x alcohol prep pads. One-time purchase only.",
      category_ids: [penSetsCat.id],
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel.id }],
      metadata: {
        category: "complete-pen-sets",
        format: "pen-set",
        strength: "10mg Cartridge",
        batch: "RT-2609A",
        purity: "99.4%",
        labReportUrl: "/lab-reports/RT-2609A.pdf",
        compatibleRefillSku: "REF-RT-10",
        purchaseType: "one-time",
      },
      options: [
        {
          title: "Specification",
          values: ["10mg Complete Starter Set"],
        },
      ],
      variants: [
        {
          title: "10mg Complete Starter Set",
          sku: "PEN-RT-10",
          options: {
            Specification: "10mg Complete Starter Set",
          },
          prices: [
            { amount: 45, currency_code: "gbp" },
            { amount: 54, currency_code: "eur" },
            { amount: 58, currency_code: "usd" },
          ],
        },
      ],
    },
    {
      title: "PEPTECH Reusable Pen Set — Tirzepatide 15mg",
      handle: "pen-tirzepatide-15",
      description:
        "The complete starter package for laboratory research. Each set includes our medical-grade reusable precision aluminum pen, a prefilled certified 15mg Tirzepatide cartridge (HPLC 99.2%), serialized device passport card, 5x sterile 31G 5mm ultra-fine needles, and 10x alcohol prep pads. One-time purchase only.",
      category_ids: [penSetsCat.id],
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel.id }],
      metadata: {
        category: "complete-pen-sets",
        format: "pen-set",
        strength: "15mg Cartridge",
        batch: "TR-2609B",
        purity: "99.2%",
        labReportUrl: "/lab-reports/TR-2609B.pdf",
        compatibleRefillSku: "REF-TR-15",
        purchaseType: "one-time",
      },
      options: [
        {
          title: "Specification",
          values: ["15mg Complete Starter Set"],
        },
      ],
      variants: [
        {
          title: "15mg Complete Starter Set",
          sku: "PEN-TR-15",
          options: {
            Specification: "15mg Complete Starter Set",
          },
          prices: [
            { amount: 48, currency_code: "gbp" },
            { amount: 58, currency_code: "eur" },
            { amount: 62, currency_code: "usd" },
          ],
        },
      ],
    },
    {
      title: "PEPTECH Reusable Pen Set — Semaglutide 10mg",
      handle: "pen-semaglutide-10",
      description:
        "The complete starter package for laboratory research. Each set includes our medical-grade reusable precision aluminum pen, a prefilled certified 10mg Semaglutide cartridge (HPLC 99.5%), serialized device passport card, 5x sterile 31G 5mm ultra-fine needles, and 10x alcohol prep pads. One-time purchase only.",
      category_ids: [penSetsCat.id],
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel.id }],
      metadata: {
        category: "complete-pen-sets",
        format: "pen-set",
        strength: "10mg Cartridge",
        batch: "SM-2609A",
        purity: "99.5%",
        labReportUrl: "/lab-reports/SM-2609A.pdf",
        compatibleRefillSku: "REF-SM-10",
        purchaseType: "one-time",
      },
      options: [
        {
          title: "Specification",
          values: ["10mg Complete Starter Set"],
        },
      ],
      variants: [
        {
          title: "10mg Complete Starter Set",
          sku: "PEN-SM-10",
          options: {
            Specification: "10mg Complete Starter Set",
          },
          prices: [
            { amount: 42, currency_code: "gbp" },
            { amount: 50, currency_code: "eur" },
            { amount: 55, currency_code: "usd" },
          ],
        },
      ],
    },

    // --- Category 2: Refill Cartridges (One-Time & 28-day Subscribe & Save 10%) ---
    {
      title: "PEPTECH Refill Cartridge — Retatrutide 10mg",
      handle: "refill-retatrutide-10",
      description:
        "High-purity prefilled replacement cartridge designed exclusively for the reusable PEPTECH precision pen system. Batch-certified HPLC 99.4%. Order single replacements or choose Subscribe & Save every 28 days for automated dispatch and 10% savings.",
      category_ids: [refillsCat.id],
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel.id }],
      metadata: {
        category: "refill-cartridges",
        format: "refill",
        strength: "10mg",
        batch: "RT-2609A",
        purity: "99.4%",
        compatibility: "Compatible exclusively with the PEPTECH Reusable Pen",
        matchingPenSetSku: "PEN-RT-10",
        subscriptionDiscount: 10,
        subscriptionIntervalDays: 28,
        subscriptionPriceGbp: 21.60,
      },
      options: [
        {
          title: "Strength",
          values: ["10mg Cartridge"],
        },
      ],
      variants: [
        {
          title: "10mg Cartridge",
          sku: "REF-RT-10",
          options: {
            Strength: "10mg Cartridge",
          },
          prices: [
            { amount: 24, currency_code: "gbp" },
            { amount: 29, currency_code: "eur" },
            { amount: 31, currency_code: "usd" },
          ],
        },
      ],
    },
    {
      title: "PEPTECH Refill Cartridge — Tirzepatide 15mg",
      handle: "refill-tirzepatide-15",
      description:
        "High-purity prefilled replacement cartridge designed exclusively for the reusable PEPTECH precision pen system. Batch-certified HPLC 99.2%. Order single replacements or choose Subscribe & Save every 28 days for automated dispatch and 10% savings.",
      category_ids: [refillsCat.id],
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: defaultSalesChannel.id }],
      metadata: {
        category: "refill-cartridges",
        format: "refill",
        strength: "15mg",
        batch: "TR-2609B",
        purity: "99.2%",
        compatibility: "Compatible exclusively with the PEPTECH Reusable Pen",
        matchingPenSetSku: "PEN-TR-15",
        subscriptionDiscount: 10,
        subscriptionIntervalDays: 28,
        subscriptionPriceGbp: 23.40,
      },
      options: [
        {
          title: "Strength",
          values: ["15mg Cartridge"],
        },
      ],
      variants: [
        {
          title: "15mg Cartridge",
          sku: "REF-TR-15",
          options: {
            Strength: "15mg Cartridge",
          },
          prices: [
            { amount: 26, currency_code: "gbp" },
            { amount: 31, currency_code: "eur" },
            { amount: 34, currency_code: "usd" },
          ],
        },
      ],
    },

    // --- Category 3: Freeze-Dried Vials (Schedule of 12 Compounds) ---
    ...[
      { name: "Retatrutide", code: "RT", strength: "5mg", price: 8.4 },
      { name: "Retatrutide", code: "RT", strength: "10mg", price: 15.6 },
      { name: "Tirzepatide", code: "TR", strength: "5mg", price: 8.4 },
      { name: "Tirzepatide", code: "TR", strength: "10mg", price: 14.4 },
      { name: "Semaglutide", code: "SM", strength: "5mg", price: 8.4 },
      { name: "Semaglutide", code: "SM", strength: "10mg", price: 14.4 },
      { name: "GHK-CU", code: "Cu50", strength: "50mg", price: 8.4 },
      { name: "GHK-CU", code: "Cu100", strength: "100mg", price: 12.0 },
      { name: "BPC-157", code: "BC5", strength: "5mg", price: 9.6 },
      { name: "TB500", code: "TB5", strength: "5mg", price: 20.4 },
      { name: "NAD+", code: "NJ500", strength: "500mg", price: 19.2 },
      { name: "Cagrilintide", code: "CGL5", strength: "5mg", price: 31.2 },
    ].map((v) => {
      const cleanName = v.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const cleanStrength = v.strength.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const slug = `${cleanName}-${cleanStrength}`.replace(/-+/g, "-");
      const cleanSkuCode = v.code.toUpperCase().replace(/[^A-Z0-9]+/g, "");
      const sku = `VIA-${cleanSkuCode}-${v.strength.toUpperCase()}`;
      const subPrice = Number((v.price * 0.9).toFixed(2));

      return {
        title: `${v.name} ${v.strength} Lyophilised Vial`,
        handle: `vial-${slug}`,
        description: `Individually vacuum-sealed, lyophilised ${v.name} peptide vial (${v.strength}) for laboratory research. Certified batch testing via HPLC and Mass Spectrometry. Available for One-Time purchase or Subscribe & Save every 28 days with 10% discount.`,
        category_ids: [vialsCat.id],
        status: ProductStatus.PUBLISHED,
        shipping_profile_id: shippingProfile.id,
        sales_channels: [{ id: defaultSalesChannel.id }],
        metadata: {
          category: "freeze-dried-vials",
          format: "vial",
          compound: v.name,
          code: v.code,
          strength: v.strength,
          batch: `${v.code}-2609`,
          subscriptionDiscount: 10,
          subscriptionIntervalDays: 28,
          subscriptionPriceGbp: subPrice,
        },
        options: [
          {
            title: "Strength",
            values: [v.strength],
          },
        ],
        variants: [
          {
            title: `${v.strength} Single Vial`,
            sku,
            options: {
              Strength: v.strength,
            },
            prices: [
              { amount: v.price, currency_code: "gbp" },
              { amount: Number((v.price * 1.2).toFixed(2)), currency_code: "eur" },
              { amount: Number((v.price * 1.3).toFixed(2)), currency_code: "usd" },
            ],
          },
        ],
      };
    }),
  ];

  logger.info(`Creating ${productsToCreate.length} PEPTECH products in Medusa...`);
  const { result: createdProducts } = await createProductsWorkflow(container).run({
    input: {
      products: productsToCreate,
    },
  });

  logger.info(`Successfully created ${createdProducts.length} PEPTECH products!`);
  createdProducts.forEach((p: any) => {
    logger.info(`✓ [${p.id}] ${p.title} (${p.handle})`);
  });

  logger.info("=== PEPTECH CATALOG SEED COMPLETED SUCCESSFULLY ===");
}
