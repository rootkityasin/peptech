import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

// GET /admin/custom/promotions - List all promotions with linked order usage tracking
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY) || req.scope.resolve("query")

    // 1. Fetch promotions with application methods via Medusa 2.0 query graph
    const { data: promotions = [] } = await query.graph({
      entity: "promotion",
      fields: [
        "id",
        "code",
        "type",
        "is_automatic",
        "status",
        "limit",
        "used",
        "metadata",
        "created_at",
        "updated_at",
        "application_method.*",
      ],
      pagination: {
        order: { created_at: "DESC" },
      },
    })

    // 2. Fetch order promotions link
    let orderPromos: any[] = []
    try {
      const { data = [] } = await query.graph({
        entity: "order_promotion",
        fields: ["order_id", "promotion_id", "created_at"],
      })
      orderPromos = data
    } catch {
      // Graceful fallback if link table is queried through custom table
    }

    const orderIds = Array.from(new Set((orderPromos || []).map((op: any) => op.order_id))).filter(Boolean)
    let orderMap = new Map<string, any>()

    if (orderIds.length > 0) {
      try {
        const { data: orders = [] } = await query.graph({
          entity: "order",
          fields: ["id", "display_id", "email", "currency_code", "status", "metadata", "total", "subtotal", "created_at"],
          filters: { id: orderIds },
        })
        orderMap = new Map(
          orders.map((o: any) => [
            o.id,
            {
              id: o.id,
              display_id: o.display_id,
              order_number: `PEP-${o.display_id}`,
              email: o.email,
              currency_code: o.currency_code,
              status: o.status,
              total: o.total || o.metadata?.total || 0,
              subtotal: o.subtotal || o.metadata?.subtotal || 0,
              placed_at: o.metadata?.placed_at || o.created_at,
              metadata: o.metadata || {},
            },
          ])
        )
      } catch {}
    }

    // 3. Build enriched promotion list with order tracking
    let totalDiscountedOrders = 0

    const enrichedPromotions = promotions.map((p: any) => {
      const method = p.application_method || {}
      const linkedOrderRecords = (orderPromos || []).filter((op: any) => op.promotion_id === p.id)

      const orders = linkedOrderRecords
        .map((op: any) => orderMap.get(op.order_id))
        .filter(Boolean)

      totalDiscountedOrders += orders.length

      const isShipping = method.target_type === "shipping_methods" || p.code === "FREESHIP150"
      return {
        id: p.id,
        code: p.code,
        title: p.metadata?.title || (p.code === "SUB28-10" ? "Subscribe & Save (28-Day Protocol)" : p.code),
        type: p.type,
        is_automatic: Boolean(p.is_automatic),
        status: p.status,
        discount_value: Number(method.value || 10),
        discount_type: isShipping ? "shipping" : (method.type || "percentage"),
        target_type: method.target_type || "items",
        allocation: method.allocation || "across",
        currency_code: method.currency_code || "gbp",
        used_count: orders.length || p.used || 0,
        metadata: p.metadata || {},
        orders,
        created_at: p.created_at,
        updated_at: p.updated_at,
      }
    })

    const freeShipRecord = enrichedPromotions.find((p: any) => p.code === "FREESHIP150" || p.discount_type === "shipping")

    return res.status(200).json({
      success: true,
      summary: {
        total_promotions: enrichedPromotions.length,
        active_promotions: enrichedPromotions.filter((p: any) => p.status === "active").length,
        total_orders_discounted: totalDiscountedOrders,
        free_shipping: {
          id: freeShipRecord?.id || "promo_01M4N0Z5NDS97Y18JSA5T7YBZ3",
          code: "FREESHIP150",
          enabled: freeShipRecord ? freeShipRecord.status === "active" : true,
          threshold: Number(freeShipRecord?.metadata?.threshold || 150),
          title: freeShipRecord?.metadata?.title || "Free Tracked 24 Shipping over £150",
        },
      },
      promotions: enrichedPromotions,
    })
  } catch (err: any) {
    console.error("[PEPTECH PROMOTIONS API ERROR]:", err)
    return res.status(500).json({ message: err.message || "Failed to retrieve promotions" })
  }
}

// POST /admin/custom/promotions - Manually link an order to a promotion, update free shipping, or toggle promotion status
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { action, promotion_id, order_id, status, threshold, enabled, title } = req.body as any

    if (action === "update_free_shipping") {
      const promotionModule = req.scope.resolve(Modules.PROMOTION)
      const query = req.scope.resolve(ContainerRegistrationKeys.QUERY) || req.scope.resolve("query")

      const filter = promotion_id ? { id: promotion_id } : { code: "FREESHIP150" }
      const { data: promos = [] } = await query.graph({
        entity: "promotion",
        fields: ["id", "code", "status", "metadata", "application_method.*", "rules.*"],
        filters: filter,
      })

      const promoId = promos[0]?.id || promotion_id || "promo_01M4N0Z5NDS97Y18JSA5T7YBZ3"
      const numThreshold = Number(threshold || 150)
      const isEnabled = enabled !== undefined ? Boolean(enabled) : true
      const displayTitle = title || `Free Tracked 24 Shipping over £${numThreshold}`

      await (promotionModule as any).updatePromotions({
        id: promoId,
        status: isEnabled ? "active" : "disabled",
        metadata: {
          title: displayTitle,
          threshold: numThreshold,
        },
      })

      if (promos[0]?.rules?.[0]?.id) {
        try {
          await (promotionModule as any).updatePromotionRules([
            {
              id: promos[0].rules[0].id,
              values: [String(numThreshold)],
            },
          ])
        } catch {}
      }

      return res.status(200).json({
        success: true,
        free_shipping: {
          id: promoId,
          code: "FREESHIP150",
          enabled: isEnabled,
          threshold: numThreshold,
          title: displayTitle,
        },
      })
    }

    if (action === "toggle_status" && promotion_id) {
      const promotionModule = req.scope.resolve(Modules.PROMOTION)
      const updated = await promotionModule.updatePromotions({
        id: promotion_id,
        status: status || "active",
      })
      return res.status(200).json({ success: true, promotion: updated })
    }

    if (action === "link_order" && promotion_id && order_id) {
      const link = req.scope.resolve(ContainerRegistrationKeys.LINK) || req.scope.resolve("link")
      if (link) {
        await link.create({
          [Modules.ORDER]: { order_id },
          [Modules.PROMOTION]: { promotion_id },
        })
      }
      const promotionModule = req.scope.resolve(Modules.PROMOTION)
      const promo = await promotionModule.retrievePromotion(promotion_id)
      const newUsed = Number(promo?.used || 0) + 1
      await (promotionModule as any).updatePromotions({ id: promotion_id, used: newUsed } as any)

      return res.status(200).json({ success: true, message: `Linked order ${order_id} to promotion ${promotion_id}` })
    }

    return res.status(400).json({ message: "Invalid action or missing parameters" })
  } catch (err: any) {
    console.error("[PEPTECH PROMOTIONS UPDATE ERROR]:", err)
    return res.status(500).json({ message: err.message })
  }
}
