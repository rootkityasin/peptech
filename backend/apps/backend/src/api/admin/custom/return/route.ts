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

// GET /admin/custom/return - Retrieve available return reasons
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const sb = getSupabase();
    const { data: reasons, error } = await sb
      .from("return_reason")
      .select("id, value, label, description")
      .is("deleted_at", null)
      .order("label", { ascending: true });

    if (error || !reasons || reasons.length === 0) {
      return res.status(200).json({
        return_reasons: [
          { id: "ret_reason_damaged", value: "damaged_in_transit", label: "Damaged in Transit", description: "Outer packaging crushed, temperature tag compromised, or vial broken" },
          { id: "ret_reason_defective", value: "defective_device", label: "Defective Precision Pen Device", description: "Dosing dial mechanism or cartridge plunger locked" },
          { id: "ret_reason_wrong_item", value: "incorrect_item", label: "Incorrect Item Received", description: "Vial concentration or product variant mismatch" },
          { id: "ret_reason_unopened", value: "customer_cancellation", label: "Unopened Parcel Return", description: "Customer requested return within allowable RUO policy" },
          { id: "ret_reason_other", value: "other", label: "Other Reason", description: "Staff-approved return" },
        ],
      });
    }

    return res.status(200).json({ return_reasons: reasons });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
}

// POST /admin/custom/return - Handle request, receive, or cancel return
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const {
      action = "request", // "request" | "receive" | "cancel"
      order_id,
      return_id,
      items = [], // [{ id, title, quantity, unit_price, reason_id, reason_label }]
      reason_id,
      reason_label,
      carrier = "Royal Mail Tracked Return",
      tracking_number = "",
      note = "",
      restock = true,
      issue_refund = false,
      refund_amount = 0,
    } = req.body as any;

    if (!order_id) {
      return res.status(400).json({ message: "order_id is required" });
    }

    const sb = getSupabase();

    // Fetch current order
    const { data: order, error: orderErr } = await sb
      .from("order")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderErr || !order) {
      return res.status(404).json({ message: `Order not found: ${order_id}` });
    }

    const meta = order.metadata || {};
    const existingReturns = Array.isArray(meta.returns) ? meta.returns : [];
    const timeline = Array.isArray(meta.timeline) ? meta.timeline : [];

    // ==========================================
    // ACTION 1: REQUEST RETURN
    // ==========================================
    if (action === "request") {
      if (!items || items.length === 0) {
        return res.status(400).json({ message: "At least one item must be selected for return" });
      }

      const retId = generateId("ret");
      const displayId = (existingReturns.length + 1);

      // Calculate total value of items being returned
      const itemsValue = items.reduce((acc: number, it: any) => acc + (Number(it.unit_price || 0) * Number(it.quantity || 1)), 0);

      // Insert into public.return
      const { error: returnErr } = await sb.from("return").insert({
        id: retId,
        order_id: order_id,
        order_version: 1,
        display_id: displayId,
        status: "open",
        refund_amount: Number(itemsValue.toFixed(2)),
        raw_refund_amount: { value: String(itemsValue), precision: 20 },
        requested_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "admin",
        metadata: {
          carrier,
          tracking_number,
          note,
          reason_label,
          reason_id,
        },
      });

      if (returnErr) {
        console.warn("[PEPTECH RETURN] Failed to insert into public.return:", returnErr.message);
      }

      // Insert return items into public.return_item
      for (const item of items) {
        const retiId = generateId("reti");
        await sb.from("return_item").insert({
          id: retiId,
          return_id: retId,
          item_id: item.id,
          quantity: item.quantity,
          raw_quantity: { value: String(item.quantity), precision: 20 },
          received_quantity: 0,
          raw_received_quantity: { value: "0", precision: 20 },
          reason_id: item.reason_id || reason_id || null,
          note: note || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      const returnEntry = {
        id: retId,
        display_id: displayId,
        status: "open", // "open" | "received" | "canceled"
        carrier,
        tracking_number,
        note,
        reason_id,
        reason_label: reason_label || "Other Reason",
        items,
        items_value: itemsValue,
        requested_at: new Date().toISOString(),
      };

      const updatedReturns = [...existingReturns, returnEntry];

      const newTimelineItem = {
        id: generateId("tl"),
        title: `Return #${displayId} requested`,
        description: `${items.length} item(s) scheduled for return via ${carrier}${tracking_number ? ` (Track: ${tracking_number})` : ""}${reason_label ? ` — Reason: ${reason_label}` : ""}`,
        created_at: new Date().toISOString(),
        type: "return_requested",
      };

      const updatedMetadata = {
        ...meta,
        return_status: "return_requested",
        returns: updatedReturns,
        timeline: [newTimelineItem, ...timeline],
        last_return_at: new Date().toISOString(),
      };

      await sb.from("order").update({ metadata: updatedMetadata, updated_at: new Date().toISOString() }).eq("id", order_id);

      return res.status(200).json({
        success: true,
        action: "request",
        return: returnEntry,
        return_status: "return_requested",
      });
    }

    // ==========================================
    // ACTION 2: RECEIVE RETURN
    // ==========================================
    if (action === "receive") {
      const targetRetId = return_id || (existingReturns[existingReturns.length - 1]?.id);
      if (!targetRetId) {
        return res.status(400).json({ message: "return_id is required to mark return as received" });
      }

      // Update public.return table
      await sb
        .from("return")
        .update({
          status: "received",
          received_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", targetRetId);

      // Update public.return_item table
      await sb
        .from("return_item")
        .update({
          received_quantity: 1, // updated based on received
          updated_at: new Date().toISOString(),
        })
        .eq("return_id", targetRetId);

      const targetReturn = existingReturns.find((r: any) => r.id === targetRetId);

      // Restock items back into active inventory levels in Supabase
      if (restock && targetReturn?.items?.length > 0) {
        for (const retIt of targetReturn.items) {
          try {
            const qtyToRestock = Number(retIt.quantity || 1);
            // 1. Try to find inventory item linked to this variant
            const { data: pvii } = await sb
              .from("product_variant_inventory_item")
              .select("inventory_item_id")
              .eq("variant_id", retIt.id)
              .is("deleted_at", null)
              .maybeSingle();

            const targetInvId = pvii?.inventory_item_id || retIt.inventory_item_id;

            if (targetInvId) {
              const { data: lvl } = await sb
                .from("inventory_level")
                .select("id, stocked_quantity")
                .eq("inventory_item_id", targetInvId)
                .is("deleted_at", null)
                .maybeSingle();

              if (lvl) {
                const updatedQty = Number(lvl.stocked_quantity || 0) + qtyToRestock;
                await sb
                  .from("inventory_level")
                  .update({
                    stocked_quantity: updatedQty,
                    raw_stocked_quantity: { value: String(updatedQty), precision: 20 },
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", lvl.id);
                console.log(`[PEPTECH RESTOCK] Restocked ${qtyToRestock} units for inventory item ${targetInvId}. New stock: ${updatedQty}`);
              }
            }
          } catch (restockErr: any) {
            console.warn("[PEPTECH RESTOCK WARN]:", restockErr.message);
          }
        }
      }

      const updatedReturns = existingReturns.map((r: any) => {
        if (r.id === targetRetId) {
          return {
            ...r,
            status: "received",
            received_at: new Date().toISOString(),
            restocked: !!restock,
            refund_issued: !!issue_refund,
          };
        }
        return r;
      });

      const anyOpenRemaining = updatedReturns.some((r: any) => r.status === "open");
      const newReturnStatus = anyOpenRemaining ? "return_requested" : "returned";

      const newTimelineItem = {
        id: generateId("tl"),
        title: `Return #${targetReturn?.display_id || 1} received by lab`,
        description: `Items physically inspected & verified at warehouse.${restock ? " Items restocked to inventory." : ""}${issue_refund ? ` Refund of £${Number(refund_amount || 0).toFixed(2)} issued.` : ""}`,
        created_at: new Date().toISOString(),
        type: "return_received",
      };

      let updatedMetadata = {
        ...meta,
        return_status: newReturnStatus,
        returns: updatedReturns,
        timeline: [newTimelineItem, ...timeline],
        last_return_received_at: new Date().toISOString(),
      };

      // If issue_refund is true, execute refund logic
      if (issue_refund && Number(refund_amount) > 0) {
        const refundVal = Number(Number(refund_amount).toFixed(2));
        const currentRefunded = Number(meta.refunded_total || 0);
        const newRefundedTotal = Number((currentRefunded + refundVal).toFixed(2));
        const orderTotal = Number(meta.total || meta.subtotal || 0);
        const isFull = newRefundedTotal >= (orderTotal - 0.05);

        const refundEntry = {
          id: generateId("ref"),
          amount: refundVal,
          reason_label: `Return #${targetReturn?.display_id || 1} Refund (${targetReturn?.reason_label || "Received"})`,
          note: note || "Refund issued automatically upon receiving returned items",
          items: targetReturn?.items || [],
          restocked: !!restock,
          created_at: new Date().toISOString(),
          created_by: "Admin",
        };

        const existingRefunds = Array.isArray(meta.refunds) ? meta.refunds : [];
        updatedMetadata = {
          ...updatedMetadata,
          payment_status: isFull ? "refunded" : "partially_refunded",
          refunded_total: newRefundedTotal,
          refunds: [...existingRefunds, refundEntry],
        };

        // Record in public.refund
        try {
          const { data: payList } = await sb.from("payment").select("id").limit(1);
          await sb.from("refund").insert({
            id: refundEntry.id,
            amount: refundVal,
            raw_amount: { value: String(refundVal), precision: 20 },
            payment_id: payList?.[0]?.id || generateId("pay"),
            note: refundEntry.note,
            created_by: "admin",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } catch (e: any) {
          console.warn("[PEPTECH RETURN REFUND] Note:", e.message);
        }
      }

      await sb.from("order").update({ metadata: updatedMetadata, updated_at: new Date().toISOString() }).eq("id", order_id);

      return res.status(200).json({
        success: true,
        action: "receive",
        return_id: targetRetId,
        return_status: newReturnStatus,
      });
    }

    // ==========================================
    // ACTION 3: CANCEL RETURN
    // ==========================================
    if (action === "cancel") {
      const targetRetId = return_id || (existingReturns[existingReturns.length - 1]?.id);
      if (!targetRetId) {
        return res.status(400).json({ message: "return_id is required to cancel return" });
      }

      await sb
        .from("return")
        .update({
          status: "canceled",
          canceled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", targetRetId);

      const targetReturn = existingReturns.find((r: any) => r.id === targetRetId);
      const updatedReturns = existingReturns.map((r: any) => {
        if (r.id === targetRetId) {
          return {
            ...r,
            status: "canceled",
            canceled_at: new Date().toISOString(),
          };
        }
        return r;
      });

      const anyOpenRemaining = updatedReturns.some((r: any) => r.status === "open");
      const newReturnStatus = anyOpenRemaining ? "return_requested" : null;

      const newTimelineItem = {
        id: generateId("tl"),
        title: `Return #${targetReturn?.display_id || 1} cancelled`,
        description: `Return request was cancelled. Reason: ${note || "Customer kept items / order resolved"}`,
        created_at: new Date().toISOString(),
        type: "return_canceled",
      };

      const updatedMetadata = {
        ...meta,
        return_status: newReturnStatus,
        returns: updatedReturns,
        timeline: [newTimelineItem, ...timeline],
      };

      await sb.from("order").update({ metadata: updatedMetadata, updated_at: new Date().toISOString() }).eq("id", order_id);

      return res.status(200).json({
        success: true,
        action: "cancel",
        return_id: targetRetId,
        return_status: newReturnStatus,
      });
    }

    return res.status(400).json({ message: `Unknown action: ${action}` });
  } catch (err: any) {
    console.error("[PEPTECH RETURN ERROR]:", err);
    return res.status(500).json({ message: err.message || "Failed to process return" });
  }
}
