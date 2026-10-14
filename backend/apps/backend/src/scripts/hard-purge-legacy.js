const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

const rootEnvPath = path.resolve(__dirname, '../../../../..', '.env');
dotenv.config({ path: rootEnvPath });
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
}

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL not found in .env');
  process.exit(1);
}

async function hardPurgeLegacy() {
  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  console.log('Connected to PostgreSQL database.');

  await client.query('BEGIN');
  try {
    const deletedProductSubquery = '(SELECT id FROM product WHERE deleted_at IS NOT NULL)';
    const deletedVariantSubquery = '(SELECT id FROM product_variant WHERE deleted_at IS NOT NULL OR product_id IN (SELECT id FROM product WHERE deleted_at IS NOT NULL))';

    // 1. Delete variant options
    const r1 = await client.query(`DELETE FROM product_variant_option WHERE variant_id IN ${deletedVariantSubquery}`);
    console.log(`Deleted product_variant_option: ${r1.rowCount}`);

    // 2. Delete variant price sets
    const r2 = await client.query(`DELETE FROM product_variant_price_set WHERE variant_id IN ${deletedVariantSubquery}`);
    console.log(`Deleted product_variant_price_set: ${r2.rowCount}`);

    // 3. Delete variant inventory items
    const r3 = await client.query(`DELETE FROM product_variant_inventory_item WHERE variant_id IN ${deletedVariantSubquery}`);
    console.log(`Deleted product_variant_inventory_item: ${r3.rowCount}`);

    // 4. Delete product category links
    const r4 = await client.query(`DELETE FROM product_category_product WHERE product_id IN ${deletedProductSubquery}`);
    console.log(`Deleted product_category_product: ${r4.rowCount}`);

    // 5. Delete product images
    const r5 = await client.query(`DELETE FROM image WHERE product_id IN ${deletedProductSubquery}`);
    console.log(`Deleted image: ${r5.rowCount}`);

    // 6. Delete sales channels
    const r6 = await client.query(`DELETE FROM product_sales_channel WHERE product_id IN ${deletedProductSubquery}`);
    console.log(`Deleted product_sales_channel: ${r6.rowCount}`);

    // 7. Delete shipping profiles
    const r7 = await client.query(`DELETE FROM product_shipping_profile WHERE product_id IN ${deletedProductSubquery}`);
    console.log(`Deleted product_shipping_profile: ${r7.rowCount}`);

    // 8. Delete product tags
    const r8 = await client.query(`DELETE FROM product_tags WHERE product_id IN ${deletedProductSubquery}`);
    console.log(`Deleted product_tags: ${r8.rowCount}`);

    // 9. Delete product options
    const r9 = await client.query(`DELETE FROM product_product_option WHERE product_id IN ${deletedProductSubquery}`);
    console.log(`Deleted product_product_option: ${r9.rowCount}`);

    // 10. Delete variants
    const r10 = await client.query(`DELETE FROM product_variant WHERE id IN ${deletedVariantSubquery}`);
    console.log(`Deleted product_variant: ${r10.rowCount}`);

    // 11. Delete products
    const r11 = await client.query(`DELETE FROM product WHERE id IN ${deletedProductSubquery}`);
    console.log(`Deleted product: ${r11.rowCount}`);

    // Final checks
    const totalRemaining = await client.query('SELECT count(*) FROM product');
    const softDeletedRemaining = await client.query('SELECT count(*) FROM product WHERE deleted_at IS NOT NULL');
    console.log(`=============================================`);
    console.log(`Total active products in database: ${totalRemaining.rows[0].count}`);
    console.log(`Soft-deleted products in database: ${softDeletedRemaining.rows[0].count}`);
    console.log(`=============================================`);

    await client.query('COMMIT');
    console.log('SUCCESS: All legacy records hard-purged and transaction committed.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('ERROR during hard purge (transaction rolled back):', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

hardPurgeLegacy();
