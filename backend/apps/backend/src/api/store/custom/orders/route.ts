import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://ubzoovlhbnztjwemvrwo.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_API_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";

function getSupabase() {
  if (!SUPABASE_KEY) {
    throw new Error("SUPABASE_API_KEY environment variable is not defined");
  }
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const orderModule = req.scope.resolve(Modules.ORDER);
    const customerId = req.query.customer_id as string;
    const email = req.query.email as string;

    if (!customerId && !email) {
      return res.status(200).json({ orders: [], count: 0 });
    }

    const filters: any = {};
    if (customerId) {
      filters.customer_id = customerId;
    } else if (email) {
      filters.email = email;
    }

    const [orders, count] = await orderModule.listAndCountOrders(filters, {
      relations: ["items", "shipping_address", "billing_address", "summary"],
      order: { created_at: "DESC" },
    });

    return res.status(200).json({ orders, count });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const orderModule = req.scope.resolve(Modules.ORDER);
    const body = req.body as any;

    if (!body.customer_id && !body.email) {
      return res.status(400).json({ message: "customer_id or email is required." });
    }

    const hasSubscription = (body.items || []).some(
      (it: any) => it.metadata?.is_subscription || it.is_subscription
    );
    const orderMetadata = { ...(body.metadata || {}) };

    if (hasSubscription && !orderMetadata.promotion) {
      orderMetadata.promotion = {
        id: "promo_01M39GXX8Y0V26WT6W5DJT6J3A",
        code: "SUB28-10",
        name: "Subscribe & Save (28-Day Protocol)",
        discount_percent: 10,
      };
    }

    const createdOrder = await orderModule.createOrders({
      customer_id: body.customer_id || null,
      email: body.email,
      currency_code: (body.currency_code || "gbp").toLowerCase(),
      status: (body.status || "pending") as any,
      metadata: orderMetadata,
      shipping_address: body.shipping_address as any,
      billing_address: (body.billing_address || body.shipping_address) as any,
      items: (body.items || []) as any,
      shipping_methods: (body.shipping_methods || []) as any,
    });

    // Link to Medusa order_promotion table and increment promotion.used
    if (orderMetadata.promotion) {
      try {
        const sb = getSupabase();
        const promoId = orderMetadata.promotion.id || "promo_01M39GXX8Y0V26WT6W5DJT6J3A";
        const opId = `ordpromo_${Math.random().toString(36).substring(2, 9)}${Date.now().toString(36)}`;
        
        await sb.from("order_promotion").insert({
          id: opId,
          order_id: createdOrder.id,
          promotion_id: promoId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        const { data: curPromo } = await sb
          .from("promotion")
          .select("used")
          .eq("id", promoId)
          .maybeSingle();

        if (curPromo) {
          const newUsed = Number(curPromo.used || 0) + 1;
          await sb
            .from("promotion")
            .update({ used: newUsed, updated_at: new Date().toISOString() })
            .eq("id", promoId);
        }
      } catch (pErr: any) {
        console.warn("[PEPTECH PROMO ATTACH WARN]:", pErr.message);
      }
    }

    return res.status(201).json({ order: createdOrder });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
}
