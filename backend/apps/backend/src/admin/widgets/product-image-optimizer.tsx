import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Button, Badge, toast, Toaster } from "@medusajs/ui"
import { ArrowPath, CloudSolid, CheckCircleSolid, Sparkles } from "@medusajs/icons"
import { useState, useEffect, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { adminFetch } from "../lib/sdk"

interface ProductWidgetProps {
  data?: any
}

interface ImageItem {
  url: string
  storageKey?: string
  isSupabase: boolean
  sizeKB: string
  sizeMB: string
  sizeBytes: number
  dimensions: string
  format: string
  isOptimized: boolean
}

const ProductImageOptimizerWidget = ({ data: product }: ProductWidgetProps) => {
  const queryClient = useQueryClient()
  const [images, setImages] = useState<ImageItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  const fetchImageStatus = useCallback(async () => {
    if (!product?.id) return
    setIsLoading(true)
    try {
      const res = await adminFetch(`/admin/custom/products/${product.id}/optimize-images`)
      if (res.ok) {
        const data = await res.json()
        setImages(data.images || [])
      }
    } catch (err: any) {
      console.warn("Could not inspect images:", err.message)
    } finally {
      setIsLoading(false)
    }
  }, [product?.id])

  useEffect(() => {
    fetchImageStatus()
  }, [fetchImageStatus])

  if (!product?.id) {
    return null
  }

  const handleOptimize = async () => {
    setIsOptimizing(true)
    try {
      const res = await adminFetch(`/admin/custom/products/${product.id}/optimize-images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxDimension: 1600, quality: 82 }),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson.message || "Optimization request failed")
      }

      const result = await res.json()
      if (result.optimizedCount > 0) {
        setLastSaved(`Saved ${result.savedMB} (${result.savedPct}) across ${result.optimizedCount} image(s)`)
        toast.success("Images Optimized", {
          description: `Compressed ${result.optimizedCount} image(s), saving ${result.savedMB} (${result.savedPct}) in Supabase.`,
        })
      } else {
        toast.info("Images Already Optimal", {
          description: "All product images are already at peak Sharp retina compression.",
        })
      }

      await fetchImageStatus()
      await queryClient.invalidateQueries({ queryKey: ["product", product.id] })
    } catch (err: any) {
      toast.error("Optimization Error", {
        description: err.message || "Failed to optimize product images.",
      })
    } finally {
      setIsOptimizing(false)
    }
  }

  const totalBytes = images.reduce((sum, img) => sum + (img.sizeBytes || 0), 0)
  const totalDisplay = (totalBytes / (1024 * 1024)).toFixed(2)

  return (
    <Container className="p-0 overflow-hidden border border-ui-border-base rounded-xl shadow-xs">
      <Toaster />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-6 border-b border-ui-border-base bg-ui-bg-subtle">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-ui-bg-base border border-ui-border-base text-ui-fg-subtle shrink-0">
            <CloudSolid className="w-5 h-5 text-ui-fg-muted" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Heading level="h2" className="text-sm font-semibold text-ui-fg-base">
                Media & Cloud Storage Optimization
              </Heading>
              <Badge color="green" size="small" className="gap-1 font-medium">
                <CheckCircleSolid className="w-3 h-3" />
                Auto-Optimize Active
              </Badge>
            </div>
            <Text className="text-xs text-ui-fg-subtle mt-0.5">
              Images uploaded via Medusa Admin are automatically resized (max 1600px) & compressed before sending into Supabase.
            </Text>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="small"
            onClick={fetchImageStatus}
            disabled={isLoading || isOptimizing}
            className="cursor-pointer"
          >
            <ArrowPath className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="primary"
            size="small"
            onClick={handleOptimize}
            disabled={isOptimizing || images.length === 0}
            className="cursor-pointer gap-1.5"
          >
            <ArrowPath className={`w-3.5 h-3.5 ${isOptimizing ? "animate-spin" : ""}`} />
            {isOptimizing ? "Optimizing..." : "Optimize Images"}
          </Button>
        </div>
      </div>

      {/* Optimization Banner / Last Saved */}
      {lastSaved && (
        <div className="px-6 py-2.5 bg-ui-bg-highlight border-b border-ui-border-base flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-ui-fg-interactive font-medium">
            <Sparkles className="w-3.5 h-3.5 text-ui-fg-interactive" />
            {lastSaved}
          </span>
          <button
            onClick={() => setLastSaved(null)}
            className="text-ui-fg-muted hover:text-ui-fg-subtle cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Content Body */}
      <div className="p-6 space-y-4">
        {images.length === 0 ? (
          <div className="py-8 text-center text-ui-fg-muted">
            <Text className="text-xs">
              {isLoading ? "Inspecting product media..." : "No media attached to this product yet. Upload images above to auto-optimize."}
            </Text>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-ui-fg-subtle pb-1 border-b border-ui-border-base">
              <span>{images.length} asset(s) attached</span>
              <span className="font-medium">Total storage: {totalDisplay} MB</span>
            </div>

            <div className="divide-y divide-ui-border-base border border-ui-border-base rounded-lg overflow-hidden bg-ui-bg-base">
              {images.map((img, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 gap-3 hover:bg-ui-bg-subtle transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-md border border-ui-border-base overflow-hidden shrink-0 bg-ui-bg-subtle flex items-center justify-center">
                      <img
                        src={img.url}
                        alt="Product media"
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          ;(e.target as HTMLElement).style.display = "none"
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <Text className="text-xs font-medium text-ui-fg-base truncate max-w-[260px] sm:max-w-md">
                        {img.storageKey || img.url.split("/").pop()}
                      </Text>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-ui-fg-muted">
                        <span>{img.dimensions}</span>
                        <span>•</span>
                        <span className="uppercase">{img.format}</span>
                        {img.isSupabase && (
                          <>
                            <span>•</span>
                            <span className="text-ui-fg-interactive">Supabase CDN</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge color={img.isOptimized ? "green" : "orange"} size="small">
                      {img.sizeKB}
                    </Badge>
                    <a
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-ui-fg-interactive hover:underline cursor-pointer hidden sm:inline"
                    >
                      View
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-ui-fg-muted">
          <span>Engine: Sharp v0.34 (MozJPEG 82 / PNG level 9 / WebP 85)</span>
          <span>Destination: Supabase Storage bucket <code>products</code></span>
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductImageOptimizerWidget
