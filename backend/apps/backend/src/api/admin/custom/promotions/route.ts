import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://ubzoovlhbnztjwemvrwo.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_API_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";

function getSupabase() {
  if (!SUPABASE_KEY) {
    throw new Error("SUPABASE_API_KEY environment variable is not defined");
  }
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

// GET /admin/custom/promotions - List all promotions with linked order usage tracking
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const sb = getSupabase();

    // 1. Fetch promotions
    const { data: promotions, error: promoErr } = await sb
      .from("promotion")
      .select("id, code, type, is_automatic, status, limit, used, metadata, created_at, updated_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (promoErr) {
      throw new Error(`Failed to fetch promotions: ${promoErr.message}`);
    }

    // 2. Fetch application methods
    const { data: methods } = await sb
      .from("promotion_application_method")
      .select("id, promotion_id, type, target_type, value, allocation, currency_code")
      .is("deleted_at", null);

    const methodMap = new Map<string, any>((methods || []).map((m: any) => [m.promotion_id, m]));

    // 3. Fetch all order_promotion links
    const { data: orderPromos } = await sb
      .from("order_promotion")
      .select("order_id, promotion_id, created_at")
      .is("deleted_at", null);

    // 4. Fetch orders details for linked promotions
    const orderIds = Array.from(new Set((orderPromos || []).map((op: any) => op.order_id)));
    let orderMap = new Map<string, any>();

    if (orderIds.length > 0) {
      const { data: orders } = await sb
        .from("order")
        .select("id, display_id, email, currency_code, status, metadata, created_at")
        .in("id", orderIds);

      const { data: summaries } = await sb
        .from("order_summary")
        .select("order_id, totals")
        .in("order_id", orderIds);

      const summaryMap = new Map<string, any>((summaries || []).map((s: any) => [s.order_id, s.totals]));

      orderMap = new Map<string, any>(
        (orders || []).map((o: any) => {
          const totals = summaryMap.get(o.id) || {};
          return [
            o.id,
            {
              id: o.id,
              display_id: o.display_id,
              order_number: `PEP-${o.display_id}`,
              email: o.email,
              currency_code: o.currency_code,
              status: o.status,
              total: totals.total || o.metadata?.total || 0,
              subtotal: totals.subtotal || o.metadata?.subtotal || 0,
              placed_at: o.metadata?.placed_at || o.created_at,
              metadata: o.metadata || {},
            },
          ];
        })
      );
    }

    // 5. Build enriched promotion list with order tracking
    let totalDiscountedOrders = 0;

    const enrichedPromotions = (promotions || []).map((p: any) => {
      const method = methodMap.get(p.id) || {};
      const linkedOrderRecords = (orderPromos || []).filter((op: any) => op.promotion_id === p.id);
      
      const orders = linkedOrderRecords
        .map((op: any) => orderMap.get(op.order_id))
        .filter(Boolean);

      totalDiscountedOrders += orders.length;

      return {
        id: p.id,
        code: p.code,
        title: p.metadata?.title || (p.code === "SUB28-10" ? "Subscribe & Save (28-Day Protocol)" : p.code),
        type: p.type,
        is_automatic: Boolean(p.is_automatic),
        status: p.status,
        discount_value: Number(method.value || 10),
        discount_type: method.type || "percentage",
        allocation: method.allocation || "across",
        currency_code: method.currency_code || "gbp",
        used_count: orders.length || p.used || 0,
        orders,
        created_at: p.created_at,
        updated_at: p.updated_at,
      };
    });

    return res.status(200).json({
      success: true,
      summary: {
        total_promotions: enrichedPromotions.length,
        active_promotions: enrichedPromotions.filter((p: any) => p.status === "active").length,
        total_orders_discounted: totalDiscountedOrders,
      },
      promotions: enrichedPromotions,
    });
  } catch (err: any) {
    console.error("[PEPTECH PROMOTIONS API ERROR]:", err);
    return res.status(500).json({ message: err.message || "Failed to retrieve promotions" });
  }
}

// POST /admin/custom/promotions - Manually link an order to a promotion or toggle promotion status
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const sb = getSupabase();
    const { action, promotion_id, order_id, status } = req.body as any;

    if (action === "toggle_status" && promotion_id) {
      const { data, error } = await sb
        .from("promotion")
        .update({ status: status || "active", updated_at: new Date().toISOString() })
        .eq("id", promotion_id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ success: true, promotion: data });
    }

    if (action === "link_order" && promotion_id && order_id) {
      const opId = `ordpromo_${Math.random().toString(36).substring(2, 9)}${Date.now().toString(36)}`;
      await sb
        .from("order_promotion")
        .insert({
          id: opId,
          order_id,
          promotion_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      // Increment promotion.used
      const { data: curPromo } = await sb.from("promotion").select("used").eq("id", promotion_id).single();
      const newUsed = Number(curPromo?.used || 0) + 1;
      await sb.from("promotion").update({ used: newUsed, updated_at: new Date().toISOString() }).eq("id", promotion_id);

      return res.status(200).json({ success: true, message: `Linked order ${order_id} to promotion ${promotion_id}` });
    }

    return res.status(400).json({ message: "Invalid action or missing parameters" });
  } catch (err: any) {
    console.error("[PEPTECH PROMOTIONS UPDATE ERROR]:", err);
    return res.status(500).json({ message: err.message });
  }
}
