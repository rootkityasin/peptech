import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Button, Input, Badge, toast, Toaster } from "@medusajs/ui"
import { ListBullet } from "@medusajs/icons"
import { useState, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { sdk, adminFetch } from "../lib/sdk"

interface ProductWidgetProps {
  data?: any
}

const ProductPriorityWidget = ({ data: product }: ProductWidgetProps) => {
  const queryClient = useQueryClient()
  const [priority, setPriority] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (product) {
      const rawPri =
        product?.metadata?.priority ??
        product?.metadata?.sort_order ??
        product?.variants?.[0]?.metadata?.priority ??
        ""
      setPriority(rawPri ? String(rawPri) : "")
    }
  }, [product?.id, product?.metadata])

  if (!product) {
    return null
  }

  const handleSave = async () => {
    if (!product?.id) return
    setIsSaving(true)

    try {
      const rawPri = priority !== "" ? parseInt(priority.trim(), 10) : null
      const priorityNum = rawPri && !isNaN(rawPri) && rawPri > 0 ? rawPri : null

      const currentMetadata = (product.metadata || {}) as Record<string, any>
      const updatedMetadata: Record<string, any> = {
        ...currentMetadata,
        priority: priorityNum,
      }

      try {
        await sdk.admin.product.update(product.id, { metadata: updatedMetadata })
      } catch (err: any) {
        const res = await adminFetch(`/admin/products/${product.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ metadata: updatedMetadata }),
        })
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}))
          throw new Error(errJson.message || err.message || "Failed to update product priority")
        }
      }

      await queryClient.invalidateQueries({ queryKey: ["product", product.id] })
      await queryClient.invalidateQueries({ queryKey: ["products"] })

      toast.success("Priority Saved", {
        description: priorityNum
          ? `Product ranked as #${priorityNum} in store catalog.`
          : "Priority cleared. Product will use default sorting.",
      })
    } catch (err: any) {
      toast.error(err.message || "Failed to save priority")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Container className="p-4 rounded-lg border border-ui-border-base bg-ui-bg-base shadow-sm">
      <Toaster />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-md bg-ui-bg-subtle flex items-center justify-center border border-ui-border-base shrink-0 mt-0.5">
            <ListBullet className="size-4 text-ui-fg-muted" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Heading level="h2" className="text-sm font-semibold text-ui-fg-base">
                Catalog Display Priority
              </Heading>
              {priority ? (
                <Badge size="small" color="blue">
                  Rank #{priority}
                </Badge>
              ) : (
                <Badge size="small" color="grey">
                  Unranked
                </Badge>
              )}
            </div>
            <Text size="small" leading="compact" className="text-ui-fg-subtle mt-0.5">
              Choose the order this product displays in the store. <strong>1</strong> shows first, followed by 2, 3, etc.
            </Text>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-ui-bg-field border border-ui-border-base px-2.5 py-1 rounded-md shadow-2xs">
            <Text size="small" leading="compact" weight="plus" className="text-ui-fg-base text-xs">
              Priority:
            </Text>
            <Input
              type="number"
              min={1}
              placeholder="e.g. 1"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              disabled={isSaving}
              className="w-20 h-7 text-xs bg-ui-bg-base"
            />
          </div>

          <Button
            size="small"
            variant="primary"
            onClick={handleSave}
            isLoading={isSaving}
            disabled={isSaving}
          >
            Save Priority
          </Button>
        </div>
      </div>
    </Container>
  )
}

export default ProductPriorityWidget

export const config = defineWidgetConfig({
  zone: "product.details.before",
})
