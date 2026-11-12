import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Text,
  StatusBadge,
  Button,
  Switch,
  Label,
  toast,
} from "@medusajs/ui"
import { Eye, EyeSlash, ArrowPath, Sparkles } from "@medusajs/icons"
import { useState, useEffect, useCallback } from "react"
import { adminFetch } from "../lib/sdk"

interface StorefrontSettings {
  show_lab_quality_section: boolean
  updated_at?: string
}

const StorefrontSectionsWidget = () => {
  const [settings, setSettings] = useState<StorefrontSettings>({
    show_lab_quality_section: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true)
      const res = await adminFetch("/admin/custom/storefront-settings")
      if (res.ok) {
        const data = await res.json()
        if (data.settings) {
          setSettings(data.settings)
        }
      }
    } catch {
      // widget fails silently on background network error
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleToggle = async (nextState: boolean) => {
    try {
      setSaving(true)
      const res = await adminFetch("/admin/custom/storefront-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ show_lab_quality_section: nextState }),
      })

      if (res.ok) {
        const data = await res.json()
        setSettings(data.settings)
        toast.success(
          nextState
            ? "Laboratory Quality section turned ON"
            : "Laboratory Quality section turned OFF"
        )
      } else {
        toast.error("Failed to update section visibility")
      }
    } catch (err: any) {
      toast.error(err?.message || "Network error updating section visibility")
    } finally {
      setSaving(false)
    }
  }

  const isEnabled = settings.show_lab_quality_section

  return (
    <Container className="p-6">
      <div className="flex items-center justify-between border-b border-ui-border-base pb-3 mb-4">
        <div className="flex items-center gap-x-2">
          <Sparkles className="text-ui-fg-interactive" />
          <Heading level="h2" className="text-base font-semibold text-ui-fg-base">
            Storefront Homepage Modules
          </Heading>
        </div>
        <Button
          variant="transparent"
          size="small"
          onClick={fetchSettings}
          disabled={loading || saving}
          className="size-7 p-0"
        >
          <ArrowPath className={loading ? "animate-spin size-4" : "size-4"} />
        </Button>
      </div>

      <div className="bg-ui-bg-subtle border border-ui-border-base rounded-xl p-4 flex flex-col gap-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-x-2">
              <Text weight="plus" className="text-sm font-semibold text-ui-fg-base">
                Quality and Safety in Our Laboratory Showcase
              </Text>
              {isEnabled ? (
                <StatusBadge color="green">Active</StatusBadge>
              ) : (
                <StatusBadge color="grey">Hidden</StatusBadge>
              )}
            </div>
            <Text className="text-ui-fg-subtle text-xs mt-0.5">
              4-card cleanroom video showcase and "Shop All Products" CTA button.
            </Text>
          </div>

          <div className="flex items-center gap-x-2 shrink-0">
            <div className="flex items-center gap-x-2 bg-ui-bg-base border border-ui-border-base px-2.5 py-1 rounded-lg">
              <Label htmlFor="widget-lab-toggle" className="text-xs cursor-pointer text-ui-fg-subtle">
                {isEnabled ? "Visible" : "Hidden"}
              </Label>
              <Switch
                id="widget-lab-toggle"
                checked={isEnabled}
                onCheckedChange={(checked) => handleToggle(checked)}
                disabled={loading || saving}
              />
            </div>

            {isEnabled ? (
              <Button
                variant="danger"
                size="small"
                onClick={() => handleToggle(false)}
                disabled={loading || saving}
              >
                <EyeSlash />
                Turn Off
              </Button>
            ) : (
              <Button
                variant="primary"
                size="small"
                onClick={() => handleToggle(true)}
                disabled={loading || saving}
              >
                <Eye />
                Turn On
              </Button>
            )}
          </div>
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "store.details.after",
})

export default StorefrontSectionsWidget
