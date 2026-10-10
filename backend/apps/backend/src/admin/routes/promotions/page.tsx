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

interface PromotionSummary {
  total_promotions: number
  active_promotions: number
  total_orders_discounted: number
}

const PromotionsPage = () => {
  const [promotions, setPromotions] = useState<PromotionRecord[]>([])
  const [summary, setSummary] = useState<PromotionSummary>({
    total_promotions: 0,
    active_promotions: 0,
    total_orders_discounted: 0,
  })
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
                      {promo.discount_type === "percentage"
                        ? `${promo.discount_value}% OFF`
                        : `£${promo.discount_value} OFF`}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color="grey" size="small">
                      {promo.is_automatic ? "Automatic" : "Manual Entry Required"}
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
