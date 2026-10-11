import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { ArrowPath, CheckCircle, InformationCircle } from "@medusajs/icons"
import {
  Container,
  Heading,
  Text,
  StatusBadge,
  Button,
  Toaster,
  toast,
} from "@medusajs/ui"
import { useEffect, useState } from "react"
import { adminFetch } from "../lib/sdk"
import "../styles/custom.css"

interface FreeShippingRecord {
  id: string
  code: string
  enabled: boolean
  threshold: number
  title: string
}

const FreeShippingWidget = () => {
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

  const fetchFreeShippingConfig = async () => {
    try {
      setIsLoading(true)
      const res = await adminFetch("/admin/custom/promotions")
      if (res.ok) {
        const data = await res.json()
        if (data.summary?.free_shipping) {
          setFreeShipping(data.summary.free_shipping)
          setEditThreshold(String(data.summary.free_shipping.threshold || 150))
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch free shipping config:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFreeShippingConfig()
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
        await fetchFreeShippingConfig()
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

  return (
    <Container className="p-6 mb-6 bg-white rounded-2xl border border-[#e2e8f0] shadow-xs space-y-5">
      <Toaster />
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
            disabled={isSavingShipping || isLoading}
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
              disabled={isSavingShipping || !editThreshold || isLoading}
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
            Storefront Progress Bar
          </div>
          <div className="text-[#0b1f3a] font-medium">
            &quot;Add £{(Math.max(0, freeShipping.threshold - 25.2)).toFixed(2)} more for Free Tracked 24 Shipping&quot;
          </div>
          <div className="text-[11px] text-[#64748b]">
            Active Rule: <code className="bg-slate-200/60 px-1 py-0.5 rounded text-[10px]">Cart Subtotal &ge; £{freeShipping.threshold}</code>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default FreeShippingWidget

export const config = defineWidgetConfig({
  zone: ["promotion.list.before", "promotion.details.before"],
})
