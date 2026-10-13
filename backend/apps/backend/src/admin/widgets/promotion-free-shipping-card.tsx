import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { EllipsisHorizontal, PencilSquare } from "@medusajs/icons"
import {
  Container,
  Heading,
  Text,
  StatusBadge,
  Button,
  Input,
  Label,
  Select,
  Drawer,
  DropdownMenu,
  IconButton,
  Toaster,
  toast,
} from "@medusajs/ui"
import { useEffect, useState } from "react"
import { adminFetch } from "../lib/sdk"

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

  const initialDeliveryMethod = String(
    promotion?.metadata?.delivery_method || "Royal Mail Tracked 24"
  )

  const initialStorefrontMessage = String(
    promotion?.metadata?.storefront_message || "Add {remaining} more for Free Tracked 24 Shipping"
  )

  const initialRuleOperator = String(
    promotion?.metadata?.rule_operator ||
    promotion?.rules?.find((r) => r.attribute === "subtotal")?.operator ||
    "gte"
  )

  const [threshold, setThreshold] = useState<number>(initialThreshold)
  const [deliveryMethod, setDeliveryMethod] = useState<string>(initialDeliveryMethod)
  const [storefrontMessage, setStorefrontMessage] = useState<string>(initialStorefrontMessage)
  const [ruleOperator, setRuleOperator] = useState<string>(initialRuleOperator)
  const [enabled, setEnabled] = useState<boolean>(promotion?.status === "active")

  // Drawer Edit Form States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editThreshold, setEditThreshold] = useState<string>(String(initialThreshold))
  const [editStorefrontMessage, setEditStorefrontMessage] = useState<string>(initialStorefrontMessage)
  const [editRuleOperator, setEditRuleOperator] = useState<string>(initialRuleOperator)
  const [editEnabled, setEditEnabled] = useState<boolean>(promotion?.status === "active")
  const [isSaving, setIsSaving] = useState(false)

  // Sync state if promotion prop updates
  useEffect(() => {
    if (promotion) {
      const val = Number(
        promotion.metadata?.threshold ||
        promotion.rules?.find((r) => r.attribute === "subtotal")?.values?.[0]?.value ||
        150
      )
      const dMethod = String(promotion.metadata?.delivery_method || "Royal Mail Tracked 24")
      const sMsg = String(promotion.metadata?.storefront_message || "Add {remaining} more for Free Tracked 24 Shipping")
      const rOp = String(
        promotion.metadata?.rule_operator ||
        promotion.rules?.find((r) => r.attribute === "subtotal")?.operator ||
        "gte"
      )
      const isAct = promotion.status === "active"

      setThreshold(val)
      setDeliveryMethod(dMethod)
      setStorefrontMessage(sMsg)
      setRuleOperator(rOp)
      setEnabled(isAct)

      setEditThreshold(String(val))
      setEditStorefrontMessage(sMsg)
      setEditRuleOperator(rOp)
      setEditEnabled(isAct)
    }
  }, [promotion])

  // If this is NOT a free shipping promotion, do not render this widget
  if (!isFreeShipping || !promotion) {
    return null
  }

  const handleOpenDrawer = () => {
    setEditThreshold(String(threshold))
    setEditStorefrontMessage(storefrontMessage)
    setEditRuleOperator(ruleOperator)
    setEditEnabled(enabled)
    setIsDrawerOpen(true)
  }

  const handleSave = async () => {
    const num = Number(editThreshold)
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
          delivery_method: deliveryMethod || "Royal Mail Tracked 24",
          storefront_message: editStorefrontMessage.trim() || "Add {remaining} more for Free Tracked 24 Shipping",
          rule_operator: editRuleOperator || "gte",
          enabled: editEnabled,
          title: `Free Tracked 24 Shipping over £${num}`,
        }),
      })

      if (res.ok) {
        setThreshold(num)
        setStorefrontMessage(editStorefrontMessage.trim() || "Add {remaining} more for Free Tracked 24 Shipping")
        setRuleOperator(editRuleOperator || "gte")
        setEnabled(editEnabled)
        toast.success(`Free Shipping settings updated successfully (${editEnabled ? "Active" : "Disabled"})`)
        setIsDrawerOpen(false)
      } else {
        const data = await res.json()
        toast.error(data.message || "Failed to update Free Shipping settings")
      }
    } catch (err: any) {
      toast.error(err.message || "Network error updating Free Shipping settings")
    } finally {
      setIsSaving(false)
    }
  }

  // Operator display label
  const operatorSymbol = ruleOperator === "gt" ? ">" : "≥"

  // Dynamic preview text for storefront progress bar
  const sampleRemaining = `£${(Math.max(0, threshold - 25.2)).toFixed(2)}`
  const previewProgressMsg = storefrontMessage.includes("{remaining}")
    ? storefrontMessage.replace("{remaining}", sampleRemaining)
    : storefrontMessage

  return (
    <Container className="divide-y p-0 mb-6">
      <Toaster />

      {/* Header - Standard Medusa Admin Card Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Free Shipping Spend Threshold</Heading>
        <div className="flex items-center gap-x-2">
          <StatusBadge color={enabled ? "green" : "grey"}>
            {enabled ? "Active" : "Disabled"}
          </StatusBadge>
          <DropdownMenu>
            <DropdownMenu.Trigger asChild>
              <IconButton size="small" variant="transparent" title="Actions" aria-label="Actions">
                <EllipsisHorizontal />
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item className="gap-x-2" onClick={handleOpenDrawer}>
                <PencilSquare className="text-ui-fg-subtle" />
                Edit
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu>
        </div>
      </div>

      {/* Row 1: Spend Threshold */}
      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4 text-small">
        <Text size="small" weight="plus" leading="compact">
          Spend Threshold
        </Text>
        <Text size="small" leading="compact" className="text-ui-fg-base">
          £{threshold.toFixed(2)} GBP
        </Text>
      </div>

      {/* Row 2: Qualification Rule */}
      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4 text-small">
        <Text size="small" weight="plus" leading="compact">
          Qualification Rule
        </Text>
        <Text size="small" leading="compact" className="text-ui-fg-base font-mono">
          Cart Subtotal {operatorSymbol} £{threshold.toFixed(2)}
        </Text>
      </div>

      {/* Row 3: Storefront Progress Bar Message */}
      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4 text-small">
        <Text size="small" weight="plus" leading="compact">
          Storefront Progress Bar
        </Text>
        <Text size="small" leading="compact" className="text-ui-fg-base">
          &ldquo;{previewProgressMsg}&rdquo;
        </Text>
      </div>

      {/* Row 4: Eligible Delivery Method */}
      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4 text-small">
        <Text size="small" weight="plus" leading="compact">
          Delivery Method
        </Text>
        <Text size="small" leading="compact" className="text-ui-fg-base">
          {deliveryMethod} (Waived to £0.00)
        </Text>
      </div>

      {/* Drawer for editing - Native Medusa Admin Drawer with full information control */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Edit Free Shipping Spend Threshold</Drawer.Title>
            <Drawer.Description>
              Configure the minimum order subtotal, qualification rule condition, and storefront cart message.
            </Drawer.Description>
          </Drawer.Header>

          <Drawer.Body className="flex flex-col gap-y-5 p-6 overflow-y-auto">
            {/* Field 1: Minimum Spend Threshold */}
            <div className="flex flex-col gap-y-2">
              <Label size="small" weight="plus">
                Minimum Spend Threshold (GBP £)
              </Label>
              <Input
                size="small"
                type="number"
                step="1"
                min="0"
                value={editThreshold}
                onChange={(e) => setEditThreshold(e.target.value)}
                placeholder="150"
              />
              <Text size="small" leading="compact" className="text-ui-fg-subtle text-xs">
                Carts meeting or exceeding this subtotal qualify for free delivery.
              </Text>
            </div>

            {/* Field 2: Qualification Rule Operator */}
            <div className="flex flex-col gap-y-2">
              <Label size="small" weight="plus">
                Qualification Rule Condition
              </Label>
              <Select
                size="small"
                value={editRuleOperator}
                onValueChange={(val) => setEditRuleOperator(val)}
              >
                <Select.Trigger>
                  <Select.Value placeholder="Select operator" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="gte">
                    Cart Subtotal &ge; (Greater than or equal to)
                  </Select.Item>
                  <Select.Item value="gt">
                    Cart Subtotal &gt; (Strictly greater than)
                  </Select.Item>
                </Select.Content>
              </Select>
              <Text size="small" leading="compact" className="text-ui-fg-subtle text-xs">
                Operator applied when checking qualifying cart value.
              </Text>
            </div>

            {/* Field 4: Storefront Progress Bar Message */}
            <div className="flex flex-col gap-y-2">
              <Label size="small" weight="plus">
                Storefront Cart Drawer Message
              </Label>
              <Input
                size="small"
                value={editStorefrontMessage}
                onChange={(e) => setEditStorefrontMessage(e.target.value)}
                placeholder="Add {remaining} more for Free Tracked 24 Shipping"
              />
              <Text size="small" leading="compact" className="text-ui-fg-subtle text-xs">
                Use <code className="bg-ui-bg-subtle px-1 rounded font-mono">&#123;remaining&#125;</code> as the placeholder for the remaining spend amount.
              </Text>
            </div>

            {/* Field 5: Auto-Waiver Status */}
            <div className="flex flex-col gap-y-2 pt-2 border-t border-ui-border-base">
              <Label size="small" weight="plus">
                Auto-Waiver Status
              </Label>
              <div className="flex items-center gap-x-2">
                <Button
                  size="small"
                  variant={editEnabled ? "primary" : "secondary"}
                  onClick={() => setEditEnabled(true)}
                  type="button"
                >
                  Active
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
              <Text size="small" leading="compact" className="text-ui-fg-subtle text-xs">
                Enable or disable automated shipping fee waiver across the store.
              </Text>
            </div>
          </Drawer.Body>

          <Drawer.Footer>
            <div className="flex items-center justify-end gap-x-2">
              <Drawer.Close asChild>
                <Button size="small" variant="secondary" disabled={isSaving}>
                  Cancel
                </Button>
              </Drawer.Close>
              <Button
                size="small"
                variant="primary"
                disabled={isSaving || !editThreshold}
                onClick={handleSave}
                isLoading={isSaving}
              >
                Save
              </Button>
            </div>
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
