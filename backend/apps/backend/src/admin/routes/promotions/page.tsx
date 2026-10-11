import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Tag, ArrowPath, CheckCircle, ExclamationCircle, InformationCircle } from "@medusajs/icons"
import {
  Container,
  Heading,
  Text,
  Badge,
  StatusBadge,
  Button,
  Table,
  Toaster,
  toast,
} from "@medusajs/ui"
import { useEffect, useState } from "react"
import { adminFetch } from "../../lib/sdk"
import "../../styles/custom.css"

interface PromotionRecord {
  id: string
  code: string
  title: string
  type: string
  is_automatic: boolean
  status: "active" | "disabled" | string
  discount_value: number
  discount_type: "percentage" | "fixed" | string
  allocation: string
  currency_code: string
  used_count: number
  orders: any[]
  created_at: string
}

interface FreeShippingRecord {
  id: string
  code: string
  enabled: boolean
  threshold: number
  title: string
}

interface PromotionSummary {
  total_promotions: number
  active_promotions: number
  total_orders_discounted: number
  free_shipping?: FreeShippingRecord
}

const PromotionsPage = () => {
  const [promotions, setPromotions] = useState<PromotionRecord[]>([])
  const [summary, setSummary] = useState<PromotionSummary>({
    total_promotions: 0,
    active_promotions: 0,
    total_orders_discounted: 0,
  })
  const [freeShipping, setFreeShipping] = useState<FreeShippingRecord>({
    id: "promo_01M4N0Z5NDS97Y18JSA5T7YBZ3",
    code: "FREESHIP150",
    enabled: true,
    threshold: 150,
    title: "Free Tracked 24 Shipping over £150",
  })
  const [editThreshold, setEditThreshold] = useState<string>("150")
  const [isSavingShipping, setIsSavingShipping] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchPromotions = async () => {
    try {
      setIsLoading(true)
      const res = await adminFetch("/admin/custom/promotions")
      if (res.ok) {
        const data = await res.json()
        setPromotions(data.promotions || [])
        setSummary(
          data.summary || {
            total_promotions: (data.promotions || []).length,
            active_promotions: (data.promotions || []).filter((p: any) => p.status === "active").length,
            total_orders_discounted: data.summary?.total_orders_discounted || 0,
          }
        )
        if (data.summary?.free_shipping) {
          setFreeShipping(data.summary.free_shipping)
          setEditThreshold(String(data.summary.free_shipping.threshold || 150))
        }
      } else {
        toast.error("Failed to load promotions")
      }
    } catch (err: any) {
      console.error("Failed to fetch promotions:", err)
      toast.error(err.message || "Network error loading promotions")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPromotions()
  }, [])

  const handleSaveFreeShipping = async (newThresholdVal?: string, newEnabledVal?: boolean) => {
    setIsSavingShipping(true)
    const thresholdNum = Number(newThresholdVal ?? editThreshold) || 150
    const enabledBool = newEnabledVal !== undefined ? newEnabledVal : freeShipping.enabled

    try {
      const res = await adminFetch("/admin/custom/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_free_shipping",
          threshold: thresholdNum,
          enabled: enabledBool,
          title: `Free Tracked 24 Shipping over £${thresholdNum}`,
        }),
      })
      if (res.ok) {
        toast.success(`Free Shipping spend threshold updated to £${thresholdNum.toFixed(2)} (${enabledBool ? "Active" : "Disabled"})`)
        await fetchPromotions()
      } else {
        const err = await res.json()
        toast.error(err.message || "Failed to update Free Shipping")
      }
    } catch (err: any) {
      toast.error(err.message || "Network error updating Free Shipping")
    } finally {
      setIsSavingShipping(false)
    }
  }

  const handleToggleStatus = async (promo: PromotionRecord) => {
    const nextStatus = promo.status === "active" ? "disabled" : "active"
    setUpdatingId(promo.id)
    try {
      const res = await adminFetch("/admin/custom/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_status",
          promotion_id: promo.id,
          status: nextStatus,
        }),
      })
      if (res.ok) {
        toast.success(`Promo code ${promo.code} is now ${nextStatus}`)
        await fetchPromotions()
      } else {
        const err = await res.json()
        toast.error(err.message || "Failed to update promotion status")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle status")
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <Container className="p-8 space-y-8">
      <Toaster />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e2e8f0] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-[#0b1f3a] text-white flex items-center justify-center shadow-xs">
              <Tag className="w-5 h-5 text-[#00c5a0]" />
            </div>
            <div>
              <Heading level="h1" className="text-2xl font-bold text-[#0b1f3a]">
                Promotions &amp; Discounts
              </Heading>
              <Text className="text-xs text-[#64748b]">
                Manage promotional discount codes, enforce manual user entry, and track usage.
              </Text>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="small"
            variant="secondary"
            onClick={fetchPromotions}
            disabled={isLoading}
            className="flex items-center gap-1.5"
          >
            <ArrowPath className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-xs flex items-center justify-between">
          <div>
            <Text className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-1">
              Total Promotions
            </Text>
            <Text className="text-2xl font-black text-[#0b1f3a]">
              {summary.total_promotions}
            </Text>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600">
            <Tag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-xs flex items-center justify-between">
          <div>
            <Text className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-1">
              Active Codes
            </Text>
            <Text className="text-2xl font-black text-emerald-600">
              {summary.active_promotions}
            </Text>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-xs flex items-center justify-between">
          <div>
            <Text className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-1">
              Orders Discounted
            </Text>
            <Text className="text-2xl font-black text-[#16a6a3]">
              {summary.total_orders_discounted}
            </Text>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#16a6a3]">
            <InformationCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Free Shipping Spend Threshold & Auto-Waiver Manager */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#f1f5f9] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-[#16a6a3] flex items-center justify-center text-lg">
              🚚
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Heading level="h2" className="text-base font-bold text-[#0b1f3a]">
                  Free Shipping Spend Threshold &amp; Auto-Waiver
                </Heading>
                <StatusBadge color={freeShipping.enabled ? "green" : "red"}>
                  {freeShipping.enabled ? "Active" : "Disabled"}
                </StatusBadge>
              </div>
              <Text className="text-xs text-[#64748b]">
                Medusa automatically waives Royal Mail Tracked 24 to £0.00 (FREE) when the customer&apos;s cart subtotal meets or exceeds this spend threshold.
              </Text>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="small"
              variant={freeShipping.enabled ? "danger" : "secondary"}
              disabled={isSavingShipping}
              onClick={() => handleSaveFreeShipping(undefined, !freeShipping.enabled)}
            >
              {freeShipping.enabled ? "Disable Free Shipping" : "Enable Free Shipping"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-1.5 md:col-span-2">
            <Text className="text-xs font-semibold text-[#0b1f3a]">
              Minimum Spend Threshold (GBP £)
            </Text>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#64748b]">
                  £
                </span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={editThreshold}
                  onChange={(e) => setEditThreshold(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-[#cbd5e1] rounded-lg text-sm font-bold text-[#0b1f3a] focus:outline-none focus:ring-2 focus:ring-[#16a6a3]/20 focus:border-[#16a6a3]"
                  placeholder="150"
                />
              </div>
              <Button
                size="small"
                disabled={isSavingShipping || !editThreshold}
                onClick={() => handleSaveFreeShipping(editThreshold, freeShipping.enabled)}
                className="bg-[#0b1f3a] hover:bg-[#132c4e] text-white flex items-center gap-1.5"
              >
                {isSavingShipping ? (
                  <>
                    <ArrowPath className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Threshold</span>
                )}
              </Button>
            </div>
            <Text className="text-[11px] text-[#64748b]">
              Current threshold: <strong className="text-[#0b1f3a]">£{freeShipping.threshold.toFixed(2)}</strong>. Enter 100, 120, 150, 200, etc. Updates the storefront Cart Drawer progress bar and checkout quote instantly.
            </Text>
          </div>

          <div className="bg-[#f8fafc] rounded-xl border border-[#e2e8f0] p-4 text-xs space-y-1">
            <div className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">
              Storefront Progress Bar Preview
            </div>
            <div className="text-[#0b1f3a] font-medium">
              &quot;Add £{(Math.max(0, freeShipping.threshold - 25.2)).toFixed(2)} more for Free Tracked 24 Shipping&quot;
            </div>
            <div className="text-[11px] text-[#64748b]">
              Rule: <code className="bg-slate-200/60 px-1 py-0.5 rounded text-[10px]">Cart Subtotal &ge; £{freeShipping.threshold}</code>
            </div>
          </div>
        </div>
      </div>

      {/* Promotion Policy Notice */}
      <div className="rounded-xl bg-sky-50/80 border border-sky-200/80 p-4 text-xs text-sky-900 flex items-start gap-3">
        <InformationCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Manual Entry Policy Active:</span> All promo codes require explicit customer entry at checkout. Automatic application is disabled across all product routes and recurring subscription orders.
        </div>
      </div>

      {/* Promotions Table */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
          <Heading level="h2" className="text-base font-bold text-[#0b1f3a]">
            Promotional Codes List
          </Heading>
          <Text className="text-xs text-[#64748b]">
            {promotions.length} code{promotions.length === 1 ? "" : "s"} configured
          </Text>
        </div>

        <Table>
          <Table.Header>
            <Table.Row className="bg-[#f8fafc] text-xs font-bold text-[#64748b]">
              <Table.HeaderCell>Code</Table.HeaderCell>
              <Table.HeaderCell>Title / Description</Table.HeaderCell>
              <Table.HeaderCell>Discount</Table.HeaderCell>
              <Table.HeaderCell>Auto-Apply</Table.HeaderCell>
              <Table.HeaderCell>Redemptions</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell className="text-right">Action</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {isLoading ? (
              <Table.Row>
                <Table.Cell colSpan={7} className="text-center py-12 text-xs text-[#64748b]">
                  <ArrowPath className="w-5 h-5 animate-spin mx-auto mb-2 text-[#16a6a3]" />
                  Loading promotions...
                </Table.Cell>
              </Table.Row>
            ) : promotions.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={7} className="text-center py-12 text-xs text-[#64748b]">
                  No promotional codes configured yet.
                </Table.Cell>
              </Table.Row>
            ) : (
              promotions.map((promo) => (
                <Table.Row key={promo.id} className="hover:bg-slate-50/60 transition-colors">
                  <Table.Cell className="font-mono font-bold text-[#0b1f3a] text-sm">
                    {promo.code}
                  </Table.Cell>
                  <Table.Cell className="text-xs text-[#334155]">
                    {promo.title}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color="green" size="small">
                      {promo.discount_type === "shipping"
                        ? "100% OFF Shipping (FREE)"
                        : promo.discount_type === "percentage"
                        ? `${promo.discount_value}% OFF`
                        : `£${promo.discount_value} OFF`}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={promo.is_automatic ? "blue" : "grey"} size="small">
                      {promo.discount_type === "shipping"
                        ? `Automatic (Spend ≥ £${promo.metadata?.threshold || 150})`
                        : promo.is_automatic
                        ? "Automatic"
                        : "Manual Entry Required"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell className="text-xs font-semibold text-[#0b1f3a]">
                    {promo.used_count || 0} used
                  </Table.Cell>
                  <Table.Cell>
                    <StatusBadge color={promo.status === "active" ? "green" : "red"}>
                      {promo.status === "active" ? "Active" : "Disabled"}
                    </StatusBadge>
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    <Button
                      size="small"
                      variant={promo.status === "active" ? "danger" : "secondary"}
                      disabled={updatingId === promo.id}
                      onClick={() => handleToggleStatus(promo)}
                      className="text-xs font-semibold"
                    >
                      {updatingId === promo.id
                        ? "Saving..."
                        : promo.status === "active"
                        ? "Disable"
                        : "Activate"}
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </div>
    </Container>
  )
}

export default PromotionsPage

export const config = defineRouteConfig({
  label: "Promotions",
  icon: Tag,
})
