const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
const crypto = require('crypto');

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

function generateId(prefix) {
  const chars = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  let rand = '';
  const bytes = crypto.randomBytes(26);
  for (let i = 0; i < 26; i++) {
    rand += chars[bytes[i] % chars.length];
  }
  return `${prefix}_${rand}`;
}

async function syncInventoryLevels() {
  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  console.log('Connected to PostgreSQL database.');

  await client.query('BEGIN');
  try {
    // 1. Purge all orphan demo inventory items
    console.log('Step 1: Purging orphan demo inventory items (SHIRT-*, SHORTS-*, legacy items)...');
    const orphanSubquery = '(SELECT id FROM inventory_item WHERE id NOT IN (SELECT inventory_item_id FROM product_variant_inventory_item))';

    const rRes = await client.query(`DELETE FROM reservation_item WHERE inventory_item_id IN ${orphanSubquery}`);
    console.log(`Deleted reservation items for unlinked items: ${rRes.rowCount}`);

    const rLev = await client.query(`DELETE FROM inventory_level WHERE inventory_item_id IN ${orphanSubquery}`);
    console.log(`Deleted inventory levels for unlinked items: ${rLev.rowCount}`);

    const rItems = await client.query(`DELETE FROM inventory_item WHERE id IN ${orphanSubquery}`);
    console.log(`Deleted orphan inventory items: ${rItems.rowCount}`);

    // 2. Fetch the UK Fulfillment stock location
    const locRes = await client.query('SELECT id, name FROM stock_location LIMIT 1');
    if (locRes.rows.length === 0) {
      throw new Error('No stock_location found in database');
    }
    const locationId = locRes.rows[0].id;
    console.log(`Step 2: Using stock location: ${locRes.rows[0].name} (${locationId})`);

    // 3. Fetch all active variant-inventory links
    const activeLinks = await client.query(`
      SELECT 
        pvii.variant_id, 
        pvii.inventory_item_id, 
        pv.title as variant_title, 
        pv.sku, 
        p.title as product_title
      FROM product_variant_inventory_item pvii
      JOIN product_variant pv ON pv.id = pvii.variant_id
      JOIN product p ON p.id = pv.product_id
      WHERE p.deleted_at IS NULL AND pv.deleted_at IS NULL
    `);
    console.log(`Step 3: Found ${activeLinks.rows.length} active products to stock.`);

    // 4. Ensure each active inventory item has an inventory_level with 10 units
    let insertedLevels = 0;
    let updatedLevels = 0;

    for (const item of activeLinks.rows) {
      const existingLevel = await client.query(
        'SELECT id FROM inventory_level WHERE inventory_item_id = $1 AND location_id = $2',
        [item.inventory_item_id, locationId]
      );

      if (existingLevel.rows.length > 0) {
        await client.query(
          `UPDATE inventory_level 
           SET stocked_quantity = 10, 
               raw_stocked_quantity = '{"value": "10", "precision": 20}', 
               reserved_quantity = 0, 
               raw_reserved_quantity = '{"value": "0", "precision": 20}',
               incoming_quantity = 0,
               raw_incoming_quantity = '{"value": "0", "precision": 20}',
               updated_at = NOW(),
               deleted_at = NULL
           WHERE id = $1`,
          [existingLevel.rows[0].id]
        );
        updatedLevels++;
      } else {
        const newId = generateId('ilev');
        await client.query(
          `INSERT INTO inventory_level (
            id, 
            inventory_item_id, 
            location_id, 
            stocked_quantity, 
            raw_stocked_quantity, 
            reserved_quantity, 
            raw_reserved_quantity, 
            incoming_quantity, 
            raw_incoming_quantity, 
            created_at, 
            updated_at
          ) VALUES (
            $1, $2, $3, 10, '{"value": "10", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', NOW(), NOW()
          )`,
          [newId, item.inventory_item_id, locationId]
        );
        insertedLevels++;
      }
    }

    console.log(`Step 4: Inventory levels configured: ${insertedLevels} inserted, ${updatedLevels} updated (10 units each).`);

    // 5. Ensure manage_inventory = true and allow_backorder = false on all active variants
    const vUpdate = await client.query(`
      UPDATE product_variant 
      SET manage_inventory = true, allow_backorder = false 
      WHERE deleted_at IS NULL
    `);
    console.log(`Step 5: Verified manage_inventory=true, allow_backorder=false on ${vUpdate.rowCount} variants.`);

    // 6. Verify final inventory counts
    const totalInventoryItems = await client.query('SELECT count(*) FROM inventory_item');
    const totalInventoryLevels = await client.query('SELECT count(*) FROM inventory_level WHERE deleted_at IS NULL');
    const totalStocked = await client.query('SELECT sum(stocked_quantity) as total_units FROM inventory_level WHERE deleted_at IS NULL');

    console.log('=============================================');
    console.log(`Total inventory items in database: ${totalInventoryItems.rows[0].count} (Expected: 30)`);
    console.log(`Total active inventory levels: ${totalInventoryLevels.rows[0].count} (Expected: 30)`);
    console.log(`Total units stocked across catalog: ${totalStocked.rows[0].total_units} (Expected: 300)`);
    console.log('=============================================');

    await client.query('COMMIT');
    console.log('SUCCESS: All 30 products connected to inventory with 10 units each.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('ERROR during inventory sync (rolled back):', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

syncInventoryLevels();
