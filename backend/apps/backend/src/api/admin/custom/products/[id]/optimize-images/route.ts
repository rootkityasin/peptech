import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createClient } from "@supabase/supabase-js"
import sharp from "sharp"
import path from "path"

const SUPABASE_URL = process.env.SUPABASE_URL 
const SUPABASE_KEY =
  process.env.SUPABASE_API_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  ""
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "products"

export interface ImageDetailDTO {
  url: string
  storageKey: string | null
  isSupabase: boolean
  sizeBytes: number
  sizeKB: string
  sizeMB: string
  dimensions: string
  format: string
  isOptimized: boolean
}

export interface OptimizationResultItemDTO {
  url: string
  storageKey?: string
  status: "optimized" | "optimal" | "skipped" | "error"
  dimensions?: string
  beforeKB?: string
  afterKB?: string
  savedPct?: string
  reason?: string
  error?: string
}

function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("SUPABASE_URL or SUPABASE_API_KEY is not defined in environment")
  }
  return createClient(SUPABASE_URL, SUPABASE_KEY)
}

function extractStorageKey(rawUrl: string): string | null {
  if (!rawUrl) return null
  const cleanUrl = rawUrl.split("?")[0]
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const idx = cleanUrl.indexOf(marker)
  if (idx !== -1) {
    return decodeURIComponent(cleanUrl.slice(idx + marker.length))
  }
  if (cleanUrl.startsWith("/")) {
    return cleanUrl.replace(/^\/+/, "")
  }
  return null
}

async function optimizeBuffer(buf: Buffer, ext: string, maxDim = 1600, quality = 82) {
  const initialMeta = await sharp(buf).metadata()
  if (!initialMeta.width || !initialMeta.height) {
    return { optimized: buf, contentType: "application/octet-stream", isOptimized: false, meta: initialMeta }
  }

  const maxSide = Math.max(initialMeta.width, initialMeta.height)
  const targetDim = Math.min(maxSide, maxDim)

  const pipeline = sharp(buf).resize({
    width: targetDim,
    height: targetDim,
    fit: "contain",
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  })

  let optimized: Buffer | null = null
  let contentType = "application/octet-stream"

  if (ext === ".png") {
    optimized = await pipeline
      .png({
        quality: 85,
        compressionLevel: 9,
        effort: 7,
      })
      .toBuffer()
    contentType = "image/png"
  } else if (ext === ".jpg" || ext === ".jpeg") {
    optimized = await pipeline
      .jpeg({
        quality,
        mozjpeg: true,
      })
      .toBuffer()
    contentType = "image/jpeg"
  } else if (ext === ".webp") {
    optimized = await pipeline
      .webp({
        quality: 85,
        effort: 6,
      })
      .toBuffer()
    contentType = "image/webp"
  } else {
    optimized = await pipeline.toBuffer()
  }

  const isOptimized = optimized !== null && optimized.length < buf.length
  const finalMeta = isOptimized ? await sharp(optimized).metadata() : initialMeta

  return {
    optimized: isOptimized && optimized ? optimized : buf,
    contentType,
    isOptimized,
    meta: finalMeta,
  }
}

// GET /admin/custom/products/:id/optimize-images - Inspect product images
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  try {
    const productId = req.params.id
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" })
    }

    const query = req.scope.resolve("query")
    const { data: [product] } = await query.graph({
      entity: "product",
      fields: ["id", "title", "thumbnail", "images.url"],
      filters: { id: productId },
    })

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    const allUrls = new Set<string>()
    if (product.thumbnail) allUrls.add(product.thumbnail)
    for (const img of (product.images as any[]) || []) {
      if (img?.url) allUrls.add(img.url)
    }

    const sb = getSupabase()
    const imageDetails: ImageDetailDTO[] = []

    for (const url of allUrls) {
      const storageKey = extractStorageKey(url)
      let sizeBytes = 0
      let dimensions = ""
      let format = ""
      let isSupabase = false

      if (storageKey) {
        isSupabase = true
        const { data: blob } = await sb.storage.from(BUCKET).download(storageKey)
        if (blob) {
          const buf = Buffer.from(await blob.arrayBuffer())
          sizeBytes = buf.length
          try {
            const meta = await sharp(buf).metadata()
            dimensions = `${meta.width}x${meta.height}`
            format = meta.format || ""
          } catch {}
        }
      }

      imageDetails.push({
        url,
        storageKey,
        isSupabase,
        sizeBytes,
        sizeKB: (sizeBytes / 1024).toFixed(1) + " KB",
        sizeMB: (sizeBytes / (1024 * 1024)).toFixed(2) + " MB",
        dimensions: dimensions || "N/A",
        format: format || path.extname(url.split("?")[0]).slice(1) || "unknown",
        isOptimized: sizeBytes > 0 && sizeBytes < 1200 * 1024,
      })
    }

    return res.status(200).json({
      productId,
      title: product.title,
      totalImages: imageDetails.length,
      images: imageDetails,
      autoOptimizeEnabled: process.env.IMAGE_AUTO_OPTIMIZE !== "false",
      bucket: BUCKET,
    })
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Failed to inspect images" })
  }
}

// POST /admin/custom/products/:id/optimize-images - Optimize product images on demand
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  try {
    const productId = req.params.id
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" })
    }

    const maxDimension = Number((req.body as any)?.maxDimension) || 1600
    const quality = Number((req.body as any)?.quality) || 82

    const query = req.scope.resolve("query")
    const { data: [product] } = await query.graph({
      entity: "product",
      fields: ["id", "title", "thumbnail", "images.url"],
      filters: { id: productId },
    })

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    const allUrls = new Set<string>()
    if (product.thumbnail) allUrls.add(product.thumbnail)
    for (const img of (product.images as any[]) || []) {
      if (img?.url) allUrls.add(img.url)
    }

    const sb = getSupabase()
    let initialBytes = 0
    let finalBytes = 0
    let optimizedCount = 0
    let skippedCount = 0
    const results: OptimizationResultItemDTO[] = []

    for (const url of allUrls) {
      const storageKey = extractStorageKey(url)
      if (!storageKey) {
        results.push({ url, status: "skipped", reason: "Not a Supabase storage URL" })
        skippedCount++
        continue
      }

      const ext = path.extname(storageKey).toLowerCase()
      if (ext === ".svg") {
        results.push({ url, status: "skipped", reason: "Vector SVG" })
        skippedCount++
        continue
      }

      // Download from Supabase Storage
      const { data: blob, error: dlErr } = await sb.storage.from(BUCKET).download(storageKey)
      if (dlErr || !blob) {
        results.push({ url, status: "error", error: dlErr?.message || "Download failed" })
        continue
      }

      const inputBuf = Buffer.from(await blob.arrayBuffer())
      initialBytes += inputBuf.length

      const { optimized, contentType, isOptimized, meta } = await optimizeBuffer(
        inputBuf,
        ext,
        maxDimension,
        quality
      )

      if (isOptimized && optimized.length < inputBuf.length) {
        const { error: upErr } = await sb.storage.from(BUCKET).upload(storageKey, optimized, {
          contentType,
          upsert: true,
        })

        if (upErr) {
          results.push({ url, status: "error", error: upErr.message })
          finalBytes += inputBuf.length
        } else {
          finalBytes += optimized.length
          optimizedCount++
          const saved = (((inputBuf.length - optimized.length) / inputBuf.length) * 100).toFixed(1)
          results.push({
            url,
            storageKey,
            status: "optimized",
            dimensions: `${meta.width}x${meta.height}`,
            beforeKB: (inputBuf.length / 1024).toFixed(1) + " KB",
            afterKB: (optimized.length / 1024).toFixed(1) + " KB",
            savedPct: `${saved}%`,
          })
        }
      } else {
        finalBytes += inputBuf.length
        skippedCount++
        results.push({
          url,
          storageKey,
          status: "optimal",
          beforeKB: (inputBuf.length / 1024).toFixed(1) + " KB",
          reason: "Already optimal size",
        })
      }
    }

    const savedBytes = Math.max(0, initialBytes - finalBytes)
    const savedPct = initialBytes > 0 ? ((savedBytes / initialBytes) * 100).toFixed(1) : "0"

    return res.status(200).json({
      success: true,
      productId,
      totalImages: allUrls.size,
      optimizedCount,
      skippedCount,
      initialMB: (initialBytes / (1024 * 1024)).toFixed(2) + " MB",
      finalMB: (finalBytes / (1024 * 1024)).toFixed(2) + " MB",
      savedMB: (savedBytes / (1024 * 1024)).toFixed(2) + " MB",
      savedPct: `${savedPct}%`,
      results,
    })
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Optimization failed" })
  }
}
