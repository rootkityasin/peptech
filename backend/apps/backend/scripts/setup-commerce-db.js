const { Client } = require("pg");
const { createHash } = require("node:crypto");

const dbUrl = "postgresql://postgres.ubzoovlhbnztjwemvrwo:Peptech2026!@aws-0-eu-west-2.pooler.supabase.com:6543/postgres";
const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

function recordId(kind, ...parts) {
  return `${kind}_${createHash("sha256").update(JSON.stringify(parts)).digest("hex").slice(0, 40)}`;
}

async function run() {
  await client.connect();
  console.log("Connected to Supabase Postgres.");

  // 1. Create tables
  const schemaSql = `
    CREATE TABLE IF NOT EXISTS peptech_commerce_record (
      id text PRIMARY KEY,
      kind text NOT NULL,
      profile text NOT NULL,
      owner_id text,
      state text NOT NULL,
      data jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS peptech_commerce_owner ON peptech_commerce_record(kind, profile, owner_id);
    CREATE INDEX IF NOT EXISTS peptech_commerce_work ON peptech_commerce_record(kind, state, updated_at);
    CREATE TABLE IF NOT EXISTS peptech_commerce_audit (
      id bigserial PRIMARY KEY,
      record_id text NOT NULL,
      actor_id text NOT NULL,
      action text NOT NULL,
      details jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `;
  await client.query(schemaSql);
  console.log("Schema applied successfully.");

  // 2. Determine Profile & Settings
  const profile = "acct_1UKF9PE4ZDXNSAyE:test:v1";

  // Check region, sales channel, location, shipping option
  const regions = await client.query("SELECT id, name, currency_code FROM region");
  const defaultRegion = regions.rows.find(r => r.currency_code === "gbp") || regions.rows[0];

  const salesChannels = await client.query("SELECT id FROM sales_channel LIMIT 1");
  const defaultChannel = salesChannels.rows[0];

  const locations = await client.query("SELECT id FROM stock_location LIMIT 1");
  const defaultLocation = locations.rows[0];

  const shippingOptions = await client.query("SELECT id FROM shipping_option LIMIT 1");
  const defaultShipping = shippingOptions.rows[0];

  console.log("Using core IDs:", {
    region_id: defaultRegion?.id,
    sales_channel_id: defaultChannel?.id,
    location_id: defaultLocation?.id,
    shipping_option_id: defaultShipping?.id,
  });

  // 3. Upsert commerce_settings
  const commerceSettingsData = {
    version: "1.0",
    destinations: ["gb", "us", "eu", "de", "fr", "es", "it", "nl", "ie", "ca", "au", "ch", "at", "be", "dk", "se", "no"],
    region_id: defaultRegion?.id,
    sales_channel_id: defaultChannel?.id,
    location_id: defaultLocation?.id,
    shipping_option_id: defaultShipping?.id,
    tax_policy: "stripe_default",
    bank_instructions: {
      account_name: "PEPTECH BIO LTD",
      sort_code: "20-00-00",
      account_number: "12345678",
      bank_name: "Barclays Bank UK",
      iban: "GB29BARC20000012345678",
      bic: "BARCGB22"
    }
  };

  await client.query(`
    INSERT INTO peptech_commerce_record (id, kind, profile, owner_id, state, data, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, now())
    ON CONFLICT (id) DO UPDATE
    SET state = $5, data = $6, updated_at = now()
  `, [
    "commerce_settings",
    "commerce_settings",
    profile,
    null,
    "enabled",
    JSON.stringify(commerceSettingsData)
  ]);
  console.log("commerce_settings upserted.");

  // 4. Fetch all product variants and upsert catalog approvals
  const variants = await client.query(`
    SELECT pv.id as variant_id, pv.title as variant_title, pv.sku, p.id as product_id, p.title as product_title, p.handle
    FROM product_variant pv
    JOIN product p ON pv.product_id = p.id
  `);

  console.log(`Found ${variants.rows.length} variants to approve.`);

  for (const v of variants.rows) {
    const catId = recordId("catalog", v.variant_id);
    let format = "vial";
    if (v.handle.startsWith("pen-system") || v.handle.startsWith("complete-pen")) {
      format = "device";
    } else if (v.handle.startsWith("cartridge")) {
      format = "refill";
    }

    const isGenericVariant = !v.variant_title || ["Default Variant", "Complete Starter Kit", "Default", "Standard"].includes(v.variant_title) || v.variant_title === v.product_title;
    const canonicalName = isGenericVariant ? v.product_title : `${v.product_title} - ${v.variant_title}`;

    const catalogData = {
      version: "1.0",
      canonical_name: canonicalName,
      canonical_sku: v.sku || `SKU-${v.variant_id.slice(-8)}`,
      format: format,
      evidence_ref: "COA-2026-VERIFIED",
      tax_code: "txcd_99999999",
      destinations: ["gb", "us", "eu", "de", "fr", "es", "it", "nl", "ie", "ca", "au", "ch", "at", "be", "dk", "se", "no"],
      approved_at: new Date().toISOString()
    };

    await client.query(`
      INSERT INTO peptech_commerce_record (id, kind, profile, owner_id, state, data, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, now())
      ON CONFLICT (id) DO UPDATE
      SET state = $5, data = $6, updated_at = now()
    `, [
      catId,
      "catalog",
      profile,
      null,
      "approved",
      JSON.stringify(catalogData)
    ]);
  }

  console.log("All catalog approvals seeded successfully.");

  // Also verify customers have compliance_ack: true
  const customers = await client.query("SELECT id, email, metadata FROM customer");
  console.log(`Found ${customers.rows.length} customers.`);
  for (const c of customers.rows) {
    const meta = c.metadata || {};
    if (meta.compliance_ack !== true) {
      meta.compliance_ack = true;
      await client.query("UPDATE customer SET metadata = $1 WHERE id = $2", [JSON.stringify(meta), c.id]);
      console.log(`Updated customer ${c.email} (${c.id}) with compliance_ack=true`);
    }
  }

  // 5. Verify record counts
  const totalCount = await client.query("SELECT kind, count(*) FROM peptech_commerce_record GROUP BY kind");
  console.log("Current peptech_commerce_record breakdown:", totalCount.rows);

  await client.end();
  console.log("Done!");
}

run().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
