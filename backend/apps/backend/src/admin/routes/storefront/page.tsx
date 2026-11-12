import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Text,
  Badge,
  StatusBadge,
  Button,
  Switch,
  Label,
  toast,
  Toaster,
} from "@medusajs/ui"
import {
  BuildingStorefront,
  Eye,
  EyeSlash,
  ArrowPath,
  Sparkles,
  CheckCircleSolid,
} from "@medusajs/icons"
import { useState, useEffect, useCallback } from "react"
import { adminFetch } from "../../lib/sdk"

interface StorefrontSettings {
  show_lab_quality_section: boolean
  updated_at?: string
  updated_by?: string
}

const CLEANROOM_CARDS = [
  { title: "Inside our laboratory", poster: "/images/cleanroom/corridor-poster.webp" },
  { title: "Checked thoroughly", poster: "/images/cleanroom/vials-poster.webp" },
  { title: "Sterile & safe packaging", poster: "/images/cleanroom/packaging-poster.webp" },
  { title: "Quality at every step", poster: "/images/cleanroom/overview-poster.webp" },
]

const StorefrontManagementPage = () => {
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
    } catch (err: any) {
      toast.error(err?.message || "Failed to load storefront settings")
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
            ? "Laboratory Quality section turned ON (Visible on homepage)"
            : "Laboratory Quality section turned OFF (Hidden from homepage)"
        )
      } else {
        const errData = await res.json().catch(() => ({}))
        toast.error(errData.message || "Failed to update section visibility")
      }
    } catch (err: any) {
      toast.error(err?.message || "Network error updating section visibility")
    } finally {
      setSaving(false)
    }
  }

  const isEnabled = settings.show_lab_quality_section

  return (
    <div className="flex flex-col gap-y-4 max-w-5xl">
      <Toaster />

      {/* Page Header */}
      <Container className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-x-2">
              <Heading level="h1" className="text-xl font-bold text-ui-fg-base">
                Storefront Management
              </Heading>
              <Badge size="small" color="blue">
                PEPTECH® Core
              </Badge>
            </div>
            <Text className="text-ui-fg-subtle text-sm mt-1">
              Configure customer-facing storefront modules, marketing features, and homepage section visibility.
            </Text>
          </div>
          <div className="flex items-center gap-x-2">
            <Button
              variant="secondary"
              size="small"
              onClick={fetchSettings}
              disabled={loading || saving}
              className="flex items-center gap-x-1"
            >
              <ArrowPath className={loading ? "animate-spin" : ""} />
              Refresh
            </Button>
            <Button
              variant="transparent"
              size="small"
              onClick={() => window.open(typeof window !== "undefined" ? window.location.origin.replace(":9000", ":3000") : "http://localhost:3000", "_blank")}
            >
              Preview Storefront ↗
            </Button>
          </div>
        </div>
      </Container>

      {/* Homepage Sections Management */}
      <Container className="p-6">
        <div className="border-b border-ui-border-base pb-4 mb-5 flex items-center justify-between">
          <div>
            <Heading level="h2" className="text-base font-semibold text-ui-fg-base flex items-center gap-x-2">
              <Sparkles className="text-ui-fg-interactive" />
              Homepage Sections & Modules
            </Heading>
            <Text className="text-ui-fg-subtle text-xs mt-0.5">
              Instantly toggle promotional, clinical, and video sections on or off without redeploying code.
            </Text>
          </div>
          <Badge size="small" color="grey">
            Section 04B
          </Badge>
        </div>

        {/* Section 04B: Quality & Safety in Our Laboratory Showcase */}
        <div className="bg-ui-bg-subtle border border-ui-border-base rounded-xl p-5 flex flex-col gap-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-x-2.5">
                <Text weight="plus" className="text-sm font-semibold text-ui-fg-base">
                  Quality and Safety in Our Laboratory
                </Text>
                {isEnabled ? (
                  <StatusBadge color="green">Visible on Homepage</StatusBadge>
                ) : (
                  <StatusBadge color="grey">Hidden from Homepage</StatusBadge>
                )}
              </div>
              <Text className="text-ui-fg-subtle text-xs mt-1 leading-relaxed">
                4-card cleanroom video showcase displaying PEPTECH's cleanroom synthesis, vial inspection,
                and sterile packaging workflow with the animated "Shop All Products" call to action.
              </Text>
            </div>

            {/* Quick Action Buttons & Switch */}
            <div className="flex items-center gap-x-3 shrink-0">
              <div className="flex items-center gap-x-2 bg-ui-bg-base border border-ui-border-base px-3 py-1.5 rounded-lg">
                <Label htmlFor="lab-section-toggle" className="text-xs font-medium cursor-pointer text-ui-fg-subtle">
                  {isEnabled ? "Active" : "Inactive"}
                </Label>
                <Switch
                  id="lab-section-toggle"
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
                  className="flex items-center gap-x-1"
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
                  className="flex items-center gap-x-1"
                >
                  <Eye />
                  Turn On
                </Button>
              )}
            </div>
          </div>

          {/* Miniature Visual Preview of the 4 Video Cards */}
          <div className="pt-3 border-t border-ui-border-base">
            <div className="flex items-center justify-between mb-2">
              <Text className="text-[11px] font-semibold text-ui-fg-muted uppercase tracking-wider">
                Included Videos & Stations
              </Text>
              <Text className="text-[11px] text-ui-fg-muted">
                {isEnabled ? "Rendering below Cartridges Grid" : "Section currently omitted from DOM"}
              </Text>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {CLEANROOM_CARDS.map((card, idx) => (
                <div
                  key={idx}
                  className={`relative rounded-lg border overflow-hidden p-2 flex flex-col justify-between transition-all ${
                    isEnabled
                      ? "bg-ui-bg-base border-ui-border-base opacity-100"
                      : "bg-ui-bg-component border-ui-border-base opacity-50 grayscale"
                  }`}
                >
                  <div className="aspect-[9/12] w-full rounded bg-slate-900 overflow-hidden mb-1.5 relative">
                    <img
                      src={card.poster}
                      alt={card.title}
                      className="size-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                      <span className="text-[10px] text-white font-medium line-clamp-1">
                        {card.title}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-ui-fg-subtle pt-0.5">
                    <span>Video 0{idx + 1}</span>
                    <span className="text-ui-fg-muted">Loop / Mute</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Footer info */}
          <div className="flex items-center justify-between text-xs text-ui-fg-muted pt-2 border-t border-ui-border-base">
            <div className="flex items-center gap-x-1.5">
              <CheckCircleSolid className="text-ui-fg-interactive size-3.5" />
              <span>Instant Next.js ISR on-demand cache revalidation enabled</span>
            </div>
            {settings.updated_at && (
              <span>Last updated: {new Date(settings.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            )}
          </div>
        </div>
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Storefront",
  icon: BuildingStorefront,
  rank: 10,
})

export default StorefrontManagementPage
