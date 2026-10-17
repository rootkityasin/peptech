import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Text,
  Label,
  Input,
  Button,
  Table,
  Badge,
  Switch,
  toast,
} from "@medusajs/ui"
import { useEffect, useState } from "react"
import { adminFetch } from "../lib/sdk"

interface ServiceZoneEntry {
  id: string
  name: string
  countries: string[]
  rates: {
    pen_set_gbp: string
    refill_gbp: string
    vial_gbp: string
  }
}

const LocationShippingConfigurationWidget = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [serviceZones, setServiceZones] = useState<ServiceZoneEntry[]>([])
  const [freeShippingThresholdGbp, setFreeShippingThresholdGbp] = useState("150.00")
  const [subscriptionFirstOrderFree, setSubscriptionFirstOrderFree] = useState(true)

  const loadZonesAndSettings = async () => {
    try {
      setLoading(true)
      const res = await adminFetch("/admin/custom/shipping-zones")
      const data = await res.json()
      if (res.ok && data) {
        if (data.free_shipping_threshold_minor !== undefined) {
          setFreeShippingThresholdGbp((Number(data.free_shipping_threshold_minor) / 100).toFixed(2))
        }
        if (data.subscription_first_order_free !== undefined) {
          setSubscriptionFirstOrderFree(Boolean(data.subscription_first_order_free))
        }
        if (Array.isArray(data.service_zones)) {
          setServiceZones(
            data.service_zones.map((zone: any) => ({
              id: zone.id,
              name: zone.name || "Unnamed Zone",
              countries: Array.isArray(zone.countries) ? zone.countries : [],
              rates: {
                pen_set_gbp: (Number(zone.rates?.pen_set_minor ?? 495) / 100).toFixed(2),
                refill_gbp: (Number(zone.rates?.refill_minor ?? 395) / 100).toFixed(2),
                vial_gbp: (Number(zone.rates?.vial_minor ?? 395) / 100).toFixed(2),
              },
            }))
          )
        }
      }
    } catch (err: any) {
      console.error("[PEPTECH Shipping Zones Widget] Failed to load data:", err)
      toast.error("Failed to load shipping configuration", {
        description: err.message || "Could not retrieve service zones",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadZonesAndSettings()
  }, [])

  const handleRateChange = (zoneId: string, field: "pen_set_gbp" | "refill_gbp" | "vial_gbp", value: string) => {
    setServiceZones((prev) =>
      prev.map((zone) =>
        zone.id === zoneId
          ? {
              ...zone,
              rates: {
                ...zone.rates,
                [field]: value,
              },
            }
          : zone
      )
    )
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const ratesPayload: Record<string, { pen_set_minor: number; refill_minor: number; vial_minor: number }> = {}
      for (const zone of serviceZones) {
        ratesPayload[zone.id] = {
          pen_set_minor: Math.round(parseFloat(zone.rates.pen_set_gbp || "0") * 100),
          refill_minor: Math.round(parseFloat(zone.rates.refill_gbp || "0") * 100),
          vial_minor: Math.round(parseFloat(zone.rates.vial_gbp || "0") * 100),
        }
      }

      const thresholdMinor = Math.round(parseFloat(freeShippingThresholdGbp || "150.00") * 100)

      const res = await adminFetch("/admin/custom/shipping-zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_zone_rates: ratesPayload,
          free_shipping_threshold_minor: thresholdMinor,
          subscription_first_order_free: subscriptionFirstOrderFree,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || "Failed to save shipping configuration")
      }

      toast.success("Shipping Configuration Saved", {
        description: "Category delivery rates and policies updated across all service zones.",
      })
    } catch (err: any) {
      toast.error("Save Failed", {
        description: err.message || "An unexpected error occurred while saving.",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container className="p-0 overflow-hidden divide-y divide-ui-border-base mt-4">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <Heading level="h2" className="text-base font-semibold text-ui-fg-base">
            Category &amp; Regional Shipping Rules
          </Heading>
          <Text className="text-xs text-ui-fg-muted mt-0.5">
            Dynamic delivery charges mapped to your Medusa Service Zones. On mixed carts, highest tier applies.
          </Text>
        </div>
        <Button
          size="small"
          variant="secondary"
          disabled={loading || saving}
          onClick={loadZonesAndSettings}
        >
          {loading ? "Refreshing..." : "Refresh Zones"}
        </Button>
      </div>

      <form onSubmit={handleSave} className="p-6 flex flex-col gap-6">
        {/* Global Delivery Threshold & Subscription Policy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-ui-bg-subtle p-4 rounded-xl border border-ui-border-base">
          <div>
            <Label className="text-xs font-semibold">Free Shipping Threshold (£ GBP)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={freeShippingThresholdGbp}
              onChange={(e) => setFreeShippingThresholdGbp(e.target.value)}
              placeholder="150.00"
              disabled={loading || saving}
              className="mt-1.5"
            />
            <Text className="text-[11px] text-ui-fg-muted mt-1">
              Baskets with items subtotal at or above this amount automatically receive free delivery worldwide.
            </Text>
          </div>

          <div className="flex flex-col justify-start">
            <div className="flex items-center justify-between mt-1">
              <Label className="cursor-pointer text-xs font-semibold" htmlFor="sub-first-order-switch">
                Free Shipping on 1st Subscription Order
              </Label>
              <Switch
                id="sub-first-order-switch"
                checked={subscriptionFirstOrderFree}
                onCheckedChange={setSubscriptionFirstOrderFree}
                disabled={loading || saving}
              />
            </div>
            <Text className="text-[11px] text-ui-fg-muted mt-2">
              When enabled, 100% Subscribe &amp; Save carts ship free on initial checkout. Subsequent 28-day renewals are always free (£0) everywhere regardless.
            </Text>
          </div>
        </div>

        {/* Dynamic Service Zones Table */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-semibold">Service Zone Category Rates</Label>
              <Text className="text-xs text-ui-fg-muted">
                Each Service Zone created in Location &amp; Shipping automatically populates below with category rates.
              </Text>
            </div>
            <Badge color="blue" size="small">
              {serviceZones.length} Active Zone{serviceZones.length === 1 ? "" : "s"}
            </Badge>
          </div>

          {loading ? (
            <div className="rounded-xl border border-ui-border-base p-6 text-center text-sm text-ui-fg-muted animate-pulse">
              Loading Medusa Service Zones and category rates&hellip;
            </div>
          ) : serviceZones.length === 0 ? (
            <div className="rounded-xl border border-ui-border-base bg-ui-bg-subtle p-6 text-center text-sm text-ui-fg-muted">
              No service zones found on your stock location. Add a Service Zone in the location details above to customize category delivery rates.
            </div>
          ) : (
            <div className="rounded-xl border border-ui-border-base overflow-hidden bg-ui-bg-base">
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell className="w-1/3">Service Zone &amp; Coverage</Table.HeaderCell>
                    <Table.HeaderCell>Complete Pen Sets (£)</Table.HeaderCell>
                    <Table.HeaderCell>Refill Cartridges (£)</Table.HeaderCell>
                    <Table.HeaderCell>Freeze-Dried Vials (£)</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {serviceZones.map((zone) => {
                    const isUkZone = zone.countries.includes("gb")
                    return (
                      <Table.Row key={zone.id}>
                        <Table.Cell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-ui-fg-base">{zone.name}</span>
                              {isUkZone && (
                                <Badge color="green" size="small">UK Domestic</Badge>
                              )}
                            </div>
                            <div className="text-xs text-ui-fg-muted flex flex-wrap gap-1 items-center">
                              {zone.countries.length === 0 ? (
                                <span>No countries assigned</span>
                              ) : zone.countries.length <= 6 ? (
                                zone.countries.map((c) => (
                                  <span key={c} className="uppercase bg-ui-bg-subtle px-1 rounded text-[10px] font-mono">
                                    {c}
                                  </span>
                                ))
                              ) : (
                                <span>
                                  {zone.countries.slice(0, 5).map((c) => c.toUpperCase()).join(", ")} + {zone.countries.length - 5} more
                                </span>
                              )}
                            </div>
                          </div>
                        </Table.Cell>

                        <Table.Cell>
                          <div className="flex items-center gap-1.5 max-w-[110px]">
                            <span className="text-ui-fg-muted text-xs">£</span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={zone.rates.pen_set_gbp}
                              onChange={(e) => handleRateChange(zone.id, "pen_set_gbp", e.target.value)}
                              disabled={saving}
                              className="h-8 text-xs font-medium"
                            />
                          </div>
                        </Table.Cell>

                        <Table.Cell>
                          <div className="flex items-center gap-1.5 max-w-[110px]">
                            <span className="text-ui-fg-muted text-xs">£</span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={zone.rates.refill_gbp}
                              onChange={(e) => handleRateChange(zone.id, "refill_gbp", e.target.value)}
                              disabled={saving}
                              className="h-8 text-xs font-medium"
                            />
                          </div>
                        </Table.Cell>

                        <Table.Cell>
                          <div className="flex items-center gap-1.5 max-w-[110px]">
                            <span className="text-ui-fg-muted text-xs">£</span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={zone.rates.vial_gbp}
                              onChange={(e) => handleRateChange(zone.id, "vial_gbp", e.target.value)}
                              disabled={saving}
                              className="h-8 text-xs font-medium"
                            />
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    )
                  })}
                </Table.Body>
              </Table>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={loading || saving}
          >
            {saving ? "Saving Configuration..." : "Save Shipping Configuration"}
          </Button>
        </div>
      </form>
    </Container>
  )
}

export default LocationShippingConfigurationWidget

export const config = defineWidgetConfig({
  zone: "location.list.after",
})

