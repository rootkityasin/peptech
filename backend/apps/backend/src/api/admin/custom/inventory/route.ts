import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL || "https://ubzoovlhbnztjwemvrwo.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_API_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";

function getSupabase() {
  if (!SUPABASE_KEY) {
    throw new Error("SUPABASE_API_KEY environment variable is not defined");
  }
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

// GET /admin/custom/inventory - Retrieve inventory overview and stock levels
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const sb = getSupabase();

    // 1. Fetch stock location
    const { data: locations, error: locErr } = await sb
      .from("stock_location")
      .select("*, stock_location_address(*)")
      .is("deleted_at", null);

    const primaryLocation = (locations && locations.length > 0 ? locations[0] : null) || {
      id: "sloc_01M2AQBJBGCFENNWHR7VJDHPCZ",
      name: "PEPTECH UK Laboratory & Fulfillment Center",
    };

    // 2. Fetch inventory items and levels
    const { data: items, error: itemErr } = await sb
      .from("inventory_item")
      .select("id, sku, title, description, thumbnail, material, weight, unit_of_measure, metadata, created_at, updated_at")
      .is("deleted_at", null)
      .order("sku", { ascending: true });

    if (itemErr) {
      throw new Error(`Failed to fetch inventory items: ${itemErr.message}`);
    }

    const { data: levels, error: levelErr } = await sb
      .from("inventory_level")
      .select("*")
      .is("deleted_at", null);

    if (levelErr) {
      throw new Error(`Failed to fetch inventory levels: ${levelErr.message}`);
    }

    // 3. Fetch linked variants and products
    const { data: pvii } = await sb
      .from("product_variant_inventory_item")
      .select("variant_id, inventory_item_id")
      .is("deleted_at", null);

    const { data: variants } = await sb
      .from("product_variant")
      .select("id, title, sku, product_id, manage_inventory, allow_backorder")
      .is("deleted_at", null);

    const { data: products } = await sb
      .from("product")
      .select("id, title, handle, thumbnail, metadata")
      .is("deleted_at", null);

    const variantMap = new Map<string, any>((variants || []).map((v: any) => [v.id, v]));
    const productMap = new Map<string, any>((products || []).map((p: any) => [p.id, p]));
    const pviiMap = new Map<string, any>((pvii || []).map((l: any) => [l.inventory_item_id, l.variant_id]));
    const levelMap = new Map<string, any>((levels || []).map((lvl: any) => [lvl.inventory_item_id, lvl]));

    let totalUnitsStocked = 0;
    let totalUnitsReserved = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const enrichedItems = (items || []).map((item: any) => {
      const lvl: any = levelMap.get(item.id);
      const stocked = Number(lvl?.stocked_quantity || 0);
      const reserved = Number(lvl?.reserved_quantity || 0);
      const available = Math.max(0, stocked - reserved);
      const safetyThreshold = Number(lvl?.metadata?.safety_stock_threshold || 20);

      totalUnitsStocked += stocked;
      totalUnitsReserved += reserved;

      if (stocked <= 0) {
        outOfStockCount++;
      } else if (stocked <= safetyThreshold) {
        lowStockCount++;
      }

      const variantId = pviiMap.get(item.id);
      const variant: any = variantId ? variantMap.get(variantId) : null;
      const product: any = variant?.product_id ? productMap.get(variant.product_id) : null;

      return {
        id: item.id,
        sku: item.sku,
        title: item.title || product?.title || item.sku,
        description: item.description,
        thumbnail: item.thumbnail || product?.thumbnail,
        category: product?.metadata?.category || product?.metadata?.format || "Standard",
        stocked_quantity: stocked,
        reserved_quantity: reserved,
        available_quantity: available,
        safety_stock_threshold: safetyThreshold,
        is_low_stock: stocked > 0 && stocked <= safetyThreshold,
        is_out_of_stock: stocked <= 0,
        location_id: lvl?.location_id || primaryLocation.id,
        location_name: primaryLocation.name,
        manage_inventory: variant ? Boolean(variant.manage_inventory) : true,
        allow_backorder: variant ? Boolean(variant.allow_backorder) : true,
        updated_at: lvl?.updated_at || item.updated_at,
      };
    });

    return res.status(200).json({
      success: true,
      overview: {
        total_items: enrichedItems.length,
        total_units_stocked: totalUnitsStocked,
        total_units_reserved: totalUnitsReserved,
        total_units_available: Math.max(0, totalUnitsStocked - totalUnitsReserved),
        low_stock_count: lowStockCount,
        out_of_stock_count: outOfStockCount,
        primary_location: {
          id: primaryLocation.id,
          name: primaryLocation.name,
          address: primaryLocation.stock_location_address || "Oxford Science Park, Oxford, OX4 4GA, United Kingdom",
          courier: "Royal Mail Tracked",
        },
      },
      items: enrichedItems,
    });
  } catch (err: any) {
    console.error("[PEPTECH INVENTORY ERROR]:", err);
    return res.status(500).json({ message: err.message || "Failed to retrieve inventory" });
  }
}

// POST /admin/custom/inventory - Adjust stock levels (single or batch)
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const {
      inventory_item_id,
      adjustments = [],
      note = "",
      location_id = "sloc_01M2AQBJBGCFENNWHR7VJDHPCZ",
    } = req.body as any;

    const sb = getSupabase();
    const adjustmentQueue: any[] = [];

    // Support single item adjustment or batch array
    if (inventory_item_id) {
      adjustmentQueue.push({
        inventory_item_id,
        new_quantity: (req.body as any).new_quantity,
        quantity_change: (req.body as any).quantity_change,
        location_id: location_id || "sloc_01M2AQBJBGCFENNWHR7VJDHPCZ",
        note,
      });
    } else if (Array.isArray(adjustments) && adjustments.length > 0) {
      adjustmentQueue.push(...adjustments);
    } else {
      return res.status(400).json({ message: "Either inventory_item_id or adjustments array is required" });
    }

    const updatedResults: any[] = [];

    for (const adj of adjustmentQueue) {
      const targetItemId = adj.inventory_item_id;
      const targetLocId = adj.location_id || location_id || "sloc_01M2AQBJBGCFENNWHR7VJDHPCZ";

      // Find current level
      const { data: curLevel, error: fetchErr } = await sb
        .from("inventory_level")
        .select("*")
        .eq("inventory_item_id", targetItemId)
        .eq("location_id", targetLocId)
        .is("deleted_at", null)
        .maybeSingle();

      let targetQuantity = 0;

      if (adj.new_quantity !== undefined && adj.new_quantity !== null) {
        targetQuantity = Math.max(0, parseInt(adj.new_quantity, 10) || 0);
      } else if (adj.quantity_change !== undefined && adj.quantity_change !== null) {
        const currentQty = curLevel ? Number(curLevel.stocked_quantity || 0) : 0;
        targetQuantity = Math.max(0, currentQty + (parseInt(adj.quantity_change, 10) || 0));
      } else {
        continue;
      }

      if (curLevel) {
        // Update level
        const { data: upd, error: updErr } = await sb
          .from("inventory_level")
          .update({
            stocked_quantity: targetQuantity,
            raw_stocked_quantity: { value: String(targetQuantity), precision: 20 },
            updated_at: new Date().toISOString(),
          })
          .eq("id", curLevel.id)
          .select()
          .single();

        if (!updErr) {
          updatedResults.push({
            inventory_item_id: targetItemId,
            previous_quantity: curLevel.stocked_quantity,
            new_quantity: targetQuantity,
            note: adj.note || note || "Manual stock adjustment",
          });
        }
      } else {
        // Create level if missing
        const newLevelId = `ilev_${Math.random().toString(36).substring(2, 9)}${Date.now().toString(36)}`;
        const { data: ins, error: insErr } = await sb
          .from("inventory_level")
          .insert({
            id: newLevelId,
            inventory_item_id: targetItemId,
            location_id: targetLocId,
            stocked_quantity: targetQuantity,
            reserved_quantity: 0,
            incoming_quantity: 0,
            raw_stocked_quantity: { value: String(targetQuantity), precision: 20 },
            raw_reserved_quantity: { value: "0", precision: 20 },
            raw_incoming_quantity: { value: "0", precision: 20 },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (!insErr) {
          updatedResults.push({
            inventory_item_id: targetItemId,
            previous_quantity: 0,
            new_quantity: targetQuantity,
            note: adj.note || note || "Initial stock level created",
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: `Successfully adjusted stock for ${updatedResults.length} inventory item(s)`,
      updated: updatedResults,
    });
  } catch (err: any) {
    console.error("[PEPTECH INVENTORY ADJUST ERROR]:", err);
    return res.status(500).json({ message: err.message || "Failed to adjust stock levels" });
  }
}
