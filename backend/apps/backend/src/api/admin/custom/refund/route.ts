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

function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}${Date.now().toString(36)}`;
}

// GET /admin/custom/refund - Retrieve available refund reasons
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const sb = getSupabase();
    const { data: reasons, error } = await sb
      .from("refund_reason")
      .select("id, code, label, description")
      .is("deleted_at", null)
      .order("label", { ascending: true });

    if (error) {
      console.warn("[PEPTECH REFUND] Could not fetch reasons from Supabase, returning defaults:", error.message);
      return res.status(200).json({
        refund_reasons: [
          { id: "refr_shipping_issue", code: "shipping_issue", label: "Shipping Issue", description: "Lost, delayed, or misdelivered shipment" },
          { id: "refr_customer_care", code: "customer_care_adjustment", label: "Customer Care Adjustment", description: "Goodwill accommodation" },
          { id: "refr_pricing_error", code: "pricing_error", label: "Pricing Error", description: "Correction of overcharge or discount" },
          { id: "refr_product_defect", code: "product_defect", label: "Product Defect / Return", description: "Damaged vial or device returned" },
        ],
      });
    }

    return res.status(200).json({ refund_reasons: reasons || [] });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
}

// POST /admin/custom/refund - Issue full or partial refund
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const {
      order_id,
      amount,
      refund_reason_id,
      reason_label,
      items = [],
      note = "",
      restock = false,
      shipping_refund = 0,
    } = req.body as any;

    if (!order_id) {
      return res.status(400).json({ message: "order_id is required" });
    }

    const refundAmount = Number(amount);
    if (isNaN(refundAmount) || refundAmount <= 0) {
      return res.status(400).json({ message: "amount must be a positive number greater than 0" });
    }

    const sb = getSupabase();

    // 1. Fetch Order from Supabase
    const { data: order, error: orderErr } = await sb
      .from("order")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderErr || !order) {
      return res.status(404).json({ message: `Order not found: ${order_id}` });
    }

    const meta = order.metadata || {};
    const previousRefunds = Array.isArray(meta.refunds) ? meta.refunds : [];
    const currentRefundedTotal = Number(meta.refunded_total || 0);
    const newRefundedTotal = Number((currentRefundedTotal + refundAmount).toFixed(2));

    // Determine total order amount
    let orderTotal = Number(meta.total || 0);
    if (!orderTotal) {
      // Check order_summary
      const { data: summary } = await sb
        .from("order_summary")
        .select("totals")
        .eq("order_id", order_id)
        .single();
      if (summary?.totals?.original_order_total) {
        orderTotal = Number(summary.totals.original_order_total);
      }
    }
    if (!orderTotal && meta.subtotal) {
      orderTotal = Number(meta.subtotal) + (Number(meta.shipping_total) || 4.95);
    }
    if (!orderTotal) {
      orderTotal = refundAmount; // fallback
    }

    const isFullRefund = newRefundedTotal >= (orderTotal - 0.05); // slight float tolerance
    const newPaymentStatus = isFullRefund ? "refunded" : "partially_refunded";

    // 2. Ensure PaymentCollection and Payment record exist for Foreign Key integrity
    let paymentId: string | null = null;
    const { data: opcList } = await sb
      .from("order_payment_collection")
      .select("payment_collection_id")
      .eq("order_id", order_id);

    let paymentColId = opcList && opcList.length > 0 ? opcList[0].payment_collection_id : null;

    if (!paymentColId) {
      paymentColId = generateId("paycol");
      await sb.from("payment_collection").insert({
        id: paymentColId,
        amount: orderTotal,
        raw_amount: { value: String(orderTotal), precision: 20 },
        currency_code: order.currency_code || "gbp",
        status: "completed",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      await sb.from("order_payment_collection").insert({
        order_id: order_id,
        payment_collection_id: paymentColId,
      });
    }

    // Check if Payment row exists
    const { data: payList } = await sb
      .from("payment")
      .select("id")
      .eq("payment_collection_id", paymentColId)
      .limit(1);

    if (payList && payList.length > 0) {
      paymentId = payList[0].id;
    } else {
      paymentId = generateId("pay");
      await sb.from("payment").insert({
        id: paymentId,
        amount: orderTotal,
        raw_amount: { value: String(orderTotal), precision: 20 },
        currency_code: order.currency_code || "gbp",
        provider_id: "pp_system_default",
        payment_collection_id: paymentColId,
        payment_session_id: generateId("payses"),
        captured_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // 3. Insert record into public.refund
    const refundId = generateId("ref");
    const { error: refundInsertErr } = await sb.from("refund").insert({
      id: refundId,
      amount: refundAmount,
      raw_amount: { value: String(refundAmount), precision: 20 },
      payment_id: paymentId,
      refund_reason_id: refund_reason_id || null,
      note: note || null,
      created_by: "admin",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (refundInsertErr) {
      console.warn("[PEPTECH REFUND] Failed to insert into public.refund:", refundInsertErr.message);
    } else {
      console.log(`[PEPTECH REFUND] Successfully inserted refund ${refundId} into public.refund`);
    }

    // 4. Update order_summary if exists
    try {
      const { data: summary } = await sb
        .from("order_summary")
        .select("id, totals")
        .eq("order_id", order_id)
        .single();

      if (summary) {
        const oldTotals = summary.totals || {};
        const newTotals = {
          ...oldTotals,
          refunded_total: newRefundedTotal,
          raw_refunded_total: { value: String(newRefundedTotal), precision: 20 },
          pending_difference: Number((orderTotal - newRefundedTotal).toFixed(2)),
        };
        await sb
          .from("order_summary")
          .update({ totals: newTotals, updated_at: new Date().toISOString() })
          .eq("id", summary.id);
      }
    } catch (sumErr: any) {
      console.warn("[PEPTECH REFUND] Could not update order_summary:", sumErr.message);
    }

    // 5. Update Order Metadata
    const newRefundEntry = {
      id: refundId,
      amount: refundAmount,
      refund_reason_id: refund_reason_id || null,
      reason_label: reason_label || "Other / Adjustment",
      note: note || "",
      items: items || [],
      shipping_refund: Number(shipping_refund) || 0,
      restocked: !!restock,
      created_at: new Date().toISOString(),
      created_by: "Admin",
    };

    const updatedRefunds = [...previousRefunds, newRefundEntry];

    const timelineItem = {
      id: generateId("tl"),
      title: isFullRefund ? "Order fully refunded" : "Partial refund issued",
      description: `Refunded £${refundAmount.toFixed(2)}${reason_label ? ` (${reason_label})` : ""}${note ? ` — "${note}"` : ""}`,
      created_at: new Date().toISOString(),
      type: "refund",
    };

    const previousTimeline = Array.isArray(meta.timeline) ? meta.timeline : [];
    const updatedTimeline = [timelineItem, ...previousTimeline];

    const updatedMetadata = {
      ...meta,
      payment_status: newPaymentStatus,
      refunded_total: newRefundedTotal,
      refunds: updatedRefunds,
      timeline: updatedTimeline,
      last_refunded_at: new Date().toISOString(),
    };

    const { error: updateOrderErr } = await sb
      .from("order")
      .update({
        metadata: updatedMetadata,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order_id);

    if (updateOrderErr) {
      throw new Error(`Failed to update order metadata: ${updateOrderErr.message}`);
    }

    console.log(`[PEPTECH REFUND] Order ${order_id} updated. Payment status: ${newPaymentStatus}, Refunded Total: £${newRefundedTotal}`);

    return res.status(200).json({
      success: true,
      refund_id: refundId,
      order_id,
      payment_status: newPaymentStatus,
      refunded_total: newRefundedTotal,
      refund: newRefundEntry,
    });
  } catch (err: any) {
    console.error("[PEPTECH REFUND ERROR]:", err);
    return res.status(500).json({ message: err.message || "Failed to process refund" });
  }
}
