import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Button, IconButton, Input, Textarea, Badge, toast, Toaster } from "@medusajs/ui"
import { Plus, Trash, ArrowPath } from "@medusajs/icons"
import { useState, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { sdk, adminFetch } from "../lib/sdk"

export interface SpecRow {
  id: string
  label: string
  value: string
}

interface ProductWidgetProps {
  data?: any
}

const DEFAULT_STANDARD_SPECS = [
  { label: "Compound Name", value: "" },
  { label: "Contents / Strength", value: "" },
  { label: "Peptide Class", value: "" },
  { label: "Molecular Weight", value: "" },
  { label: "CAS Number", value: "" },
  { label: "Sequence / Formula", value: "" },
  { label: "Recommended Storage", value: "" },
  { label: "Purity Standard", value: "" },
]

function generateRowId(): string {
  return "spec_" + Math.random().toString(36).slice(2, 9)
}

function parseInitialSpecs(product: any): SpecRow[] {
  if (!product) return []
  const meta = product.metadata || {}

  // 1. Check if technical_specs or custom_specs array is stored in metadata
  const raw = meta.technical_specs || meta.custom_specs
  if (raw) {
    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
          .filter((item) => item && (item.label || item.key))
          .map((item) => ({
            id: generateRowId(),
            label: String(item.label || item.key || "").trim(),
            value: String(item.value || "").trim(),
          }))
      }
    } catch {
      // ignore parse error, fallback to legacy
    }
  }

  // 2. Legacy / Individual metadata keys check
  const rows: SpecRow[] = []
  if (meta.compound_name) rows.push({ id: generateRowId(), label: "Compound Name", value: String(meta.compound_name) })
  if (meta.contents) rows.push({ id: generateRowId(), label: "Contents / Strength", value: String(meta.contents) })
  if (meta.peptide_class) rows.push({ id: generateRowId(), label: "Peptide Class", value: String(meta.peptide_class) })
  if (meta.molecular_weight) rows.push({ id: generateRowId(), label: "Molecular Weight", value: String(meta.molecular_weight) })
  if (meta.cas_number) rows.push({ id: generateRowId(), label: "CAS Number", value: String(meta.cas_number) })
  if (meta.sequence) rows.push({ id: generateRowId(), label: "Sequence / Formula", value: String(meta.sequence) })
  if (meta.storage) rows.push({ id: generateRowId(), label: "Recommended Storage", value: String(meta.storage) })
  if (meta.purity) rows.push({ id: generateRowId(), label: "Purity Standard", value: String(meta.purity) })

  return rows
}

const ProductTechnicalSpecsWidget = ({ data: product }: ProductWidgetProps) => {
  const queryClient = useQueryClient()
  const [rows, setRows] = useState<SpecRow[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (product) {
      setRows(parseInitialSpecs(product))
      setHasLoaded(true)
    }
  }, [product?.id, product?.metadata])

  if (!product) {
    return null
  }

  // Add a new blank row
  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: generateRowId(),
        label: "",
        value: "",
      },
    ])
  }

  // Remove a row by ID
  const handleRemoveRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id))
  }

  // Update a row's label or value
  const handleUpdateRow = (id: string, field: "label" | "value", newValue: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: newValue } : r))
    )
  }

  // Populate standard peptide template (preserving existing values where matched)
  const handleLoadStandardTemplate = () => {
    const existingMap = new Map<string, string>()
    for (const r of rows) {
      if (r.label.trim()) {
        existingMap.set(r.label.trim().toLowerCase(), r.value)
      }
    }

    const newRows: SpecRow[] = DEFAULT_STANDARD_SPECS.map((tmpl) => {
      const matchVal = existingMap.get(tmpl.label.toLowerCase()) || ""
      return {
        id: generateRowId(),
        label: tmpl.label,
        value: matchVal,
      }
    })

    // Also keep any custom fields that were not part of the standard template
    for (const r of rows) {
      const isStandard = DEFAULT_STANDARD_SPECS.some(
        (s) => s.label.toLowerCase() === r.label.trim().toLowerCase()
      )
      if (!isStandard && r.label.trim()) {
        newRows.push(r)
      }
    }

    setRows(newRows)
    toast.info("Standard peptide template loaded")
  }

  // Reset to current database state
  const handleReset = () => {
    setRows(parseInitialSpecs(product))
    toast.info("Specifications reset to saved values")
  }

  // Save changes to product metadata
  const handleSave = async () => {
    if (!product?.id) return
    setIsSaving(true)

    try {
      // Filter out rows where both label and value are empty
      const cleanRows = rows
        .map((r) => ({ label: r.label.trim(), value: r.value.trim() }))
        .filter((r) => r.label.length > 0 || r.value.length > 0)

      // Ensure every row has a label
      const invalidRow = cleanRows.find((r) => !r.label && r.value)
      if (invalidRow) {
        toast.error("Every specification must have a field name.")
        setIsSaving(false)
        return
      }

      const specsPayload = cleanRows.map((r) => ({
        label: r.label,
        value: r.value,
      }))

      // Prepare updated metadata object
      const currentMetadata = (product.metadata || {}) as Record<string, any>
      const updatedMetadata: Record<string, any> = {
        ...currentMetadata,
        technical_specs: JSON.stringify(specsPayload),
      }

      // Sync standard helper keys for backward compatibility
      const findVal = (regex: RegExp) => {
        const item = specsPayload.find((s) => regex.test(s.label.toLowerCase()))
        return item ? item.value : ""
      }

      updatedMetadata.compound_name = findVal(/compound/)
      updatedMetadata.contents = findVal(/content|strength/)
      updatedMetadata.peptide_class = findVal(/peptide\s*class|class/)
      updatedMetadata.molecular_weight = findVal(/molecular\s*weight|mw/)
      updatedMetadata.cas_number = findVal(/cas/)
      updatedMetadata.sequence = findVal(/sequence|formula/)
      updatedMetadata.storage = findVal(/storage/)
      updatedMetadata.purity = findVal(/purity/)

      // Save via Medusa SDK with adminFetch fallback
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
          throw new Error(errJson.message || err.message || "Failed to update product specifications")
        }
      }

      // Invalidate queries to refresh dashboard UI and trigger subscribers
      await queryClient.invalidateQueries({ queryKey: ["product", product.id] })
      await queryClient.invalidateQueries({ queryKey: ["products"] })

      toast.success("Technical Specifications Saved", {
        description: `Successfully updated ${specsPayload.length} specifications for this product.`,
      })
    } catch (err: any) {
      toast.error(err.message || "Failed to save technical specifications")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Container className="p-0 overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-base shadow-sm">
      <Toaster />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-ui-bg-subtle border-b border-ui-border-base gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Heading level="h2" className="text-sm font-semibold text-ui-fg-base">
              Technical Specifications
            </Heading>
            <Badge size="small" color={rows.length > 0 ? "green" : "grey"}>
              {rows.length} {rows.length === 1 ? "Field" : "Fields"}
            </Badge>
          </div>
          <Text size="small" leading="compact" className="text-ui-fg-subtle mt-0.5">
            Dynamic analytical specifications, chemical formulas, and laboratory characteristics displayed on the storefront.
          </Text>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="small"
            variant="secondary"
            onClick={handleLoadStandardTemplate}
            disabled={isSaving}
          >
            <ArrowPath className="size-3.5 mr-1" />
            Load Standard Template
          </Button>
          <Button
            size="small"
            variant="secondary"
            onClick={handleAddRow}
            disabled={isSaving}
          >
            <Plus className="size-3.5 mr-1" />
            Add Field
          </Button>
        </div>
      </div>

      {/* Rows Container */}
      <div className="p-4 space-y-3">
        {rows.length === 0 ? (
          <div className="py-8 text-center text-ui-fg-muted flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-ui-border-base bg-ui-bg-subtle/40 p-6">
            <Text size="small" leading="compact" weight="plus" className="text-ui-fg-base">
              No specifications defined
            </Text>
            <Text size="small" leading="compact" className="text-ui-fg-subtle max-w-md">
              This product currently uses automated catalog defaults. You can load standard peptide fields or create custom fields.
            </Text>
            <div className="flex items-center gap-2 mt-2">
              <Button size="small" variant="secondary" onClick={handleLoadStandardTemplate}>
                <ArrowPath className="size-3.5 mr-1" />
                Load Standard Template
              </Button>
              <Button size="small" variant="primary" onClick={handleAddRow}>
                <Plus className="size-3.5 mr-1" />
                Add Field
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Table Header labels */}
            <div className="grid grid-cols-12 gap-3 px-2 text-[11px] font-semibold text-ui-fg-muted uppercase tracking-wider">
              <div className="col-span-4">Field Name / Label</div>
              <div className="col-span-7">Value / Analytical Metric</div>
              <div className="col-span-1 text-right">Action</div>
            </div>

            {/* List of Spec Rows */}
            {rows.map((row) => {
              const isSequence =
                row.label.toLowerCase().includes("sequence") ||
                row.label.toLowerCase().includes("formula")

              return (
                <div
                  key={row.id}
                  className="grid grid-cols-12 gap-3 items-start p-2.5 rounded-lg border border-ui-border-base bg-ui-bg-field hover:bg-ui-bg-subtle/60 transition-colors"
                >
                  {/* Field Name Input */}
                  <div className="col-span-4">
                    <Input
                      size="small"
                      placeholder="e.g. Molecular Weight"
                      value={row.label}
                      onChange={(e) => handleUpdateRow(row.id, "label", e.target.value)}
                      disabled={isSaving}
                      className="bg-ui-bg-base"
                    />
                  </div>

                  {/* Field Value Input */}
                  <div className="col-span-7">
                    {isSequence ? (
                      <Textarea
                        rows={2}
                        placeholder="e.g. 39-amino acid linear peptide with C20 diacid fatty chain"
                        value={row.value}
                        onChange={(e) => handleUpdateRow(row.id, "value", e.target.value)}
                        disabled={isSaving}
                        className="bg-ui-bg-base font-mono text-xs leading-relaxed"
                      />
                    ) : (
                      <Input
                        size="small"
                        placeholder="e.g. 4813.45 g/mol"
                        value={row.value}
                        onChange={(e) => handleUpdateRow(row.id, "value", e.target.value)}
                        disabled={isSaving}
                        className="bg-ui-bg-base"
                      />
                    )}
                  </div>

                  {/* Remove Button */}
                  <div className="col-span-1 flex items-center justify-end pt-1">
                    <IconButton
                      size="small"
                      variant="transparent"
                      onClick={() => handleRemoveRow(row.id)}
                      disabled={isSaving}
                      className="text-ui-fg-muted hover:text-ui-fg-error"
                      title="Remove field"
                    >
                      <Trash className="size-4" />
                    </IconButton>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer Bar */}
      <div className="flex items-center justify-between p-4 bg-ui-bg-subtle border-t border-ui-border-base">
        <div className="flex items-center gap-2">
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            {rows.length} {rows.length === 1 ? "specification row" : "specification rows"}
          </Text>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="small"
            variant="secondary"
            onClick={handleReset}
            disabled={isSaving}
          >
            Reset
          </Button>
          <Button
            size="small"
            variant="primary"
            onClick={handleSave}
            isLoading={isSaving}
            disabled={isSaving}
          >
            Save Specifications
          </Button>
        </div>
      </div>
    </Container>
  )
}

export default ProductTechnicalSpecsWidget

export const config = defineWidgetConfig({
  zone: "product.details.after",
})
