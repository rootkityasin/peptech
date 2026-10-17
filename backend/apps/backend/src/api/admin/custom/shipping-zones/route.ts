import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { z } from "zod"
import { operator, commerce, endpoint } from "../../../../lib/commerce/http"
import { serviceZoneRateTierSchema } from "../../../../lib/commerce/policy"

const updateSchema = z.object({
  service_zone_rates: z.record(z.string(), serviceZoneRateTierSchema),
  free_shipping_threshold_minor: z.coerce.number().int().nonnegative().optional(),
  subscription_first_order_free: z.boolean().optional(),
})

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  return endpoint(res, async () => {
    operator(req)
    const ledger = commerce(req)
    const settingsRecord = await ledger.get("commerce_settings")
    const policy = settingsRecord?.data || {}

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    let locations: any[] = []
    try {
      const result = await query.graph({
        entity: "stock_locations",
        fields: [
          "id",
          "name",
          "fulfillment_sets.id",
          "fulfillment_sets.name",
          "fulfillment_sets.service_zones.id",
          "fulfillment_sets.service_zones.name",
          "fulfillment_sets.service_zones.geo_zones.id",
          "fulfillment_sets.service_zones.geo_zones.country_code",
          "fulfillment_sets.service_zones.geo_zones.type",
        ],
        filters: policy?.location_id ? { id: policy.location_id } : {},
      })
      locations = result?.data || []
      if (locations.length === 0 && policy?.location_id) {
        // Fallback: list all stock locations if policy location wasn't found
        const fallback = await query.graph({
          entity: "stock_locations",
          fields: [
            "id",
            "name",
            "fulfillment_sets.id",
            "fulfillment_sets.name",
            "fulfillment_sets.service_zones.id",
            "fulfillment_sets.service_zones.name",
            "fulfillment_sets.service_zones.geo_zones.id",
            "fulfillment_sets.service_zones.geo_zones.country_code",
            "fulfillment_sets.service_zones.geo_zones.type",
          ],
        })
        locations = fallback?.data || []
      }
    } catch (err: any) {
      console.warn("[PEPTECH Shipping Zones] Failed to query stock locations:", err?.message || err)
    }

    const zoneMap = new Map<string, { id: string; name: string; countries: string[] }>()
    for (const loc of locations) {
      for (const fset of loc.fulfillment_sets || []) {
        for (const sz of fset.service_zones || []) {
          if (!sz?.id || zoneMap.has(sz.id)) continue
          const countries = (sz.geo_zones || [])
            .map((gz: any) => String(gz?.country_code || "").toLowerCase())
            .filter(Boolean)
          zoneMap.set(sz.id, {
            id: sz.id,
            name: sz.name || "Unnamed Zone",
            countries,
          })
        }
      }
    }

    const configuredRates = policy?.service_zone_rates || {}
    const serviceZones = Array.from(zoneMap.values()).map((zone) => {
      const isUkZone = zone.countries.includes("gb")
      const savedRate = configuredRates[zone.id]
      const rates = savedRate
        ? {
            pen_set_minor: Number(savedRate.pen_set_minor ?? (isUkZone ? 495 : 1800)),
            refill_minor: Number(savedRate.refill_minor ?? (isUkZone ? 395 : 1000)),
            vial_minor: Number(savedRate.vial_minor ?? (isUkZone ? 395 : 1000)),
          }
        : {
            pen_set_minor: isUkZone ? 495 : 1800,
            refill_minor: isUkZone ? 395 : 1000,
            vial_minor: isUkZone ? 395 : 1000,
          }

      return {
        id: zone.id,
        name: zone.name,
        countries: zone.countries,
        rates,
      }
    })

    return {
      service_zones: serviceZones,
      free_shipping_threshold_minor: policy?.free_shipping_threshold_minor ?? 15000,
      subscription_first_order_free: policy?.subscription_first_order_free !== false,
    }
  })
}

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  return endpoint(res, async () => {
    const admin = operator(req)
    const input = updateSchema.parse(req.body)
    const ledger = commerce(req)

    return ledger.locked("commerce_settings", async () => {
      let record = await ledger.get("commerce_settings")
      if (!record) {
        record = await ledger.create({
          id: "commerce_settings",
          kind: "settings",
          profile: "settings",
          owner_id: null,
          state: "enabled",
          data: {},
        })
      }

      record.data = {
        ...record.data,
        service_zone_rates: input.service_zone_rates,
        ...(input.free_shipping_threshold_minor !== undefined
          ? { free_shipping_threshold_minor: input.free_shipping_threshold_minor }
          : {}),
        ...(input.subscription_first_order_free !== undefined
          ? { subscription_first_order_free: input.subscription_first_order_free }
          : {}),
        reviewer: admin,
      }

      await ledger.audit(record.id, admin, "shipping-zones-settings-change", record.data)
      const saved = await ledger.save(record)
      return { success: true, settings: saved.data }
    })
  })
}

