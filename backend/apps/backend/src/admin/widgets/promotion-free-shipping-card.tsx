import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { FlyingBox, PencilSquare, ArrowPath, InformationCircle } from "@medusajs/icons"
import {
  Container,
  Heading,
  Text,
  StatusBadge,
  Button,
  Input,
  Label,
  Drawer,
  Toaster,
  toast,
} from "@medusajs/ui"
import { useEffect, useState } from "react"
import { adminFetch } from "../lib/sdk"
import "../styles/custom.css"

interface PromotionWidgetProps {
  data?: {
    id: string
    code?: string
    status?: string
    type?: string
    metadata?: Record<string, any>
    application_method?: {
      id?: string
      type?: string
      target_type?: string
      value?: number
      currency_code?: string
    }
    rules?: Array<{
      id: string
      attribute?: string
      operator?: string
      values?: Array<{ value: string }>
    }>
  }
}

const FreeShippingDetailWidget = ({ data: promotion }: PromotionWidgetProps) => {
  // Check if this promotion is a Free Shipping promotion
  const isFreeShipping = Boolean(
    promotion?.application_method?.target_type === "shipping_methods" ||
    promotion?.code?.toUpperCase().includes("SHIP") ||
    promotion?.metadata?.threshold !== undefined ||
    promotion?.metadata?.title?.toLowerCase().includes("shipping")
  )

  // Initial threshold resolution from metadata or rules
  const initialThreshold = Number(
    promotion?.metadata?.threshold ||
    promotion?.rules?.find((r) => r.attribute === "subtotal")?.values?.[0]?.value ||
    150
  )

  const [threshold, setThreshold] = useState<number>(initialThreshold)
  const [enabled, setEnabled] = useState<boolean>(promotion?.status === "active")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editValue, setEditValue] = useState<string>(String(initialThreshold))
  const [editEnabled, setEditEnabled] = useState<boolean>(promotion?.status === "active")
  const [isSaving, setIsSaving] = useState(false)

  // Keep state in sync if promotion prop updates
  useEffect(() => {
    if (promotion) {
      const val = Number(
        promotion.metadata?.threshold ||
        promotion.rules?.find((r) => r.attribute === "subtotal")?.values?.[0]?.value ||
        150
      )
      setThreshold(val)
      setEditValue(String(val))
      setEnabled(promotion.status === "active")
      setEditEnabled(promotion.status === "active")
    }
  }, [promotion])

  // If this is NOT a free shipping promotion, do not render this widget
  if (!isFreeShipping || !promotion) {
    return null
  }

  const handleSave = async () => {
    const num = Number(editValue)
    if (isNaN(num) || num < 0) {
      toast.error("Please enter a valid minimum spend threshold amount.")
      return
    }

    setIsSaving(true)
    try {
      const res = await adminFetch("/admin/custom/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_free_shipping",
          promotion_id: promotion.id,
          threshold: num,
          enabled: editEnabled,
          title: `Free Tracked 24 Shipping over £${num}`,
        }),
      })

      if (res.ok) {
        setThreshold(num)
        setEnabled(editEnabled)
        toast.success(`Free Shipping spend threshold updated to £${num.toFixed(2)} (${editEnabled ? "Active" : "Disabled"})`)
        setIsDrawerOpen(false)
      } else {
        const data = await res.json()
        toast.error(data.message || "Failed to update Free Shipping threshold")
      }
    } catch (err: any) {
      toast.error(err.message || "Network error updating Free Shipping threshold")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Container className="p-0 overflow-hidden divide-y divide-ui-border-base bg-ui-bg-base border border-ui-border-base rounded-xl shadow-xs mb-6">
      <Toaster />

      {/* Header following Medusa Design System guidelines */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 bg-ui-bg-base">
        <div className="flex items-center gap-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ui-bg-subtle text-ui-fg-subtle border border-ui-border-base shrink-0">
            <FlyingBox className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-x-2">
              <Text size="small" leading="compact" weight="plus" className="text-ui-fg-base font-semibold">
                Free Shipping Spend Threshold
              </Text>
              <StatusBadge color={enabled ? "green" : "red"}>
                {enabled ? "Active" : "Disabled"}
              </StatusBadge>
            </div>
            <Text size="small" leading="compact" className="text-ui-fg-subtle text-xs mt-0.5">
              Customers receive free Royal Mail Tracked 24 shipping when their order subtotal meets or exceeds this amount.
            </Text>
          </div>
        </div>

        <div className="flex items-center gap-x-2">
          <Button
            size="small"
            variant="secondary"
            onClick={() => {
              setEditValue(String(threshold))
              setEditEnabled(enabled)
              setIsDrawerOpen(true)
            }}
            className="flex items-center gap-x-1.5"
          >
            <PencilSquare className="h-3.5 w-3.5" />
            <span>Edit Threshold</span>
          </Button>
        </div>
      </div>

      {/* Field display section */}
      <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-6 bg-ui-bg-base">
        <div className="space-y-1">
          <Text size="small" leading="compact" weight="plus" className="text-ui-fg-subtle text-xs uppercase tracking-wider">
            Spend Threshold
          </Text>
          <div className="flex items-baseline gap-x-1.5">
            <Text size="large" leading="compact" weight="plus" className="text-ui-fg-base text-2xl font-bold">
              £{threshold.toFixed(2)}
            </Text>
            <Text size="xsmall" leading="compact" className="text-ui-fg-muted font-mono font-medium">
              GBP
            </Text>
          </div>
          <Text size="xsmall" leading="compact" className="text-ui-fg-subtle text-[11px]">
            Waiver applies automatically to eligible carts
          </Text>
        </div>

        <div className="space-y-1">
          <Text size="small" leading="compact" weight="plus" className="text-ui-fg-subtle text-xs uppercase tracking-wider">
            Qualification Rule
          </Text>
          <div className="pt-1">
            <code className="text-xs bg-ui-bg-subtle border border-ui-border-base px-2.5 py-1 rounded text-ui-fg-base font-mono inline-block font-semibold">
              Cart Subtotal &ge; £{threshold.toFixed(2)}
            </code>
          </div>
          <Text size="xsmall" leading="compact" className="text-ui-fg-subtle text-[11px]">
            Royal Mail Tracked 24 waived to £0.00
          </Text>
        </div>

        <div className="space-y-1">
          <Text size="small" leading="compact" weight="plus" className="text-ui-fg-subtle text-xs uppercase tracking-wider">
            Storefront Cart Drawer
          </Text>
          <div className="pt-1">
            <Text size="small" leading="compact" className="text-ui-fg-base font-medium">
              &quot;Add £{(Math.max(0, threshold - 25.2)).toFixed(2)} more for Free Tracked 24 Shipping&quot;
            </Text>
          </div>
          <Text size="xsmall" leading="compact" className="text-ui-fg-subtle text-[11px]">
            Dynamic progress bar automatically synced
          </Text>
        </div>
      </div>

      {/* Drawer for editing (Medusa Form Pattern for existing entities) */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Drawer.Content className="z-50 bg-ui-bg-base">
          <Drawer.Header className="border-b border-ui-border-base px-6 py-4">
            <Drawer.Title className="text-base font-semibold text-ui-fg-base">
              Edit Free Shipping Threshold
            </Drawer.Title>
            <Drawer.Description className="text-xs text-ui-fg-subtle mt-1">
              Configure the minimum order subtotal required to qualify for 100% free Royal Mail Tracked 24 shipping.
            </Drawer.Description>
          </Drawer.Header>

          <Drawer.Body className="p-6 space-y-6 flex-1 overflow-auto">
            <div className="space-y-2">
              <Label htmlFor="threshold-input" className="text-xs font-semibold text-ui-fg-base">
                Minimum Spend Threshold (GBP £)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-ui-fg-muted">
                  £
                </span>
                <Input
                  id="threshold-input"
                  type="number"
                  step="1"
                  min="0"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="pl-7 text-sm font-bold text-ui-fg-base"
                  placeholder="150"
                  autoFocus
                />
              </div>
              <Text size="xsmall" leading="compact" className="text-ui-fg-subtle">
                Example: enter <strong>100</strong>, <strong>120</strong>, <strong>150</strong>, or <strong>200</strong>.
              </Text>
            </div>

            <div className="space-y-2 pt-2 border-t border-ui-border-base">
              <Label className="text-xs font-semibold text-ui-fg-base">
                Auto-Waiver Status
              </Label>
              <div className="flex items-center gap-x-3">
                <Button
                  size="small"
                  variant={editEnabled ? "primary" : "secondary"}
                  onClick={() => setEditEnabled(true)}
                  type="button"
                >
                  Active (Auto-Waive)
                </Button>
                <Button
                  size="small"
                  variant={!editEnabled ? "danger" : "secondary"}
                  onClick={() => setEditEnabled(false)}
                  type="button"
                >
                  Disabled
                </Button>
              </div>
              <Text size="xsmall" leading="compact" className="text-ui-fg-subtle">
                When active, carts meeting this threshold will automatically get free shipping during checkout.
              </Text>
            </div>

            <div className="p-4 rounded-lg bg-ui-bg-subtle border border-ui-border-base text-xs space-y-2 text-ui-fg-subtle">
              <div className="flex items-center gap-x-2 text-ui-fg-base font-medium">
                <InformationCircle className="h-4 w-4 text-ui-fg-muted" />
                <span>Immediate Live Sync</span>
              </div>
              <Text size="xsmall" leading="compact" className="text-ui-fg-subtle">
                Updating this threshold immediately synchronizes:
              </Text>
              <ul className="list-disc list-inside space-y-1 text-ui-fg-muted text-[11px]">
                <li>The Storefront Cart Drawer progress bar</li>
                <li>The Medusa checkout quotation engine</li>
                <li>The promotion qualification rules in database</li>
              </ul>
            </div>
          </Drawer.Body>

          <Drawer.Footer className="border-t border-ui-border-base px-6 py-4 flex items-center justify-end gap-x-2">
            <Drawer.Close asChild>
              <Button size="small" variant="secondary" disabled={isSaving}>
                Cancel
              </Button>
            </Drawer.Close>
            <Button
              size="small"
              variant="primary"
              disabled={isSaving || !editValue}
              onClick={handleSave}
              className="flex items-center gap-x-1.5"
            >
              {isSaving ? (
                <>
                  <ArrowPath className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </Container>
  )
}

export default FreeShippingDetailWidget

export const config = defineWidgetConfig({
  zone: ["promotion.details.before"],
})
