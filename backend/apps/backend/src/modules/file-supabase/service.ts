import { AbstractFileProviderService, MedusaError } from "@medusajs/framework/utils"
import type {
  ProviderFileResultDTO,
  ProviderGetFileDTO,
  ProviderDeleteFileDTO,
  ProviderUploadFileDTO,
  ProviderUploadStreamDTO,
} from "@medusajs/types"
import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { PassThrough, Readable } from "stream"
import path from "path"
import fs from "fs"

let sharp: any = null
try {
  sharp = require("sharp")
} catch {
  // sharp is an optional dependency for image optimization
}

export interface SupabaseFileServiceOptions {
  url?: string
  apiKey?: string
  bucket?: string
  enableOptimization?: boolean
  maxDimension?: number
  quality?: number
}

function decodeFileContent(content: string, mimeType?: string): Buffer {
  const decodedBase64 = Buffer.from(content, "base64")
  if (decodedBase64.toString("base64") === content) {
    return decodedBase64
  }
  const isTextContent =
    mimeType?.startsWith("text/") ||
    mimeType?.includes("csv") ||
    mimeType?.includes("json") ||
    mimeType?.includes("xml")
  return isTextContent
    ? Buffer.from(content, "utf8")
    : Buffer.from(content, "binary")
}

function sanitizeFileName(filename: string): string {
  const clean = filename.replace(/\\/g, "/").replace(/^\/+/, "")
  return clean.replace(/[^a-zA-Z0-9._/-]/g, "_")
}

function getWorkspaceRoot(startDir = process.cwd()) {
  let dir = path.resolve(startDir)
  while (true) {
    const pkgPath = path.join(dir, "package.json")
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"))
        if (pkg.name === "peptech") return dir
      } catch {}
    }
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
}

function syncToLocalDisk(fileKey: string, buffer: Buffer, logger?: any) {
  try {
    const root = getWorkspaceRoot()
    if (!root) return
    const targetPath = path.join(root, "storefront", "public", "images", "products", fileKey)
    const targetDir = path.dirname(targetPath)
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }
    fs.writeFileSync(targetPath, buffer)
    logger?.info?.(
      `[SupabaseFileService] 💾 Mirrored to local storefront disk: ${fileKey} (${(buffer.length / 1024).toFixed(1)}KB)`
    )
  } catch (err: any) {
    logger?.warn?.(`[SupabaseFileService] ⚠️ Local disk mirror failed for ${fileKey}: ${err?.message}`)
  }
}

function removeFromLocalDisk(fileKey: string, logger?: any) {
  try {
    const root = getWorkspaceRoot()
    if (!root) return
    const targetPath = path.join(root, "storefront", "public", "images", "products", fileKey)
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath)
      logger?.info?.(`[SupabaseFileService] 🗑️ Removed from local storefront disk: ${fileKey}`)
    }
  } catch (err: any) {
    logger?.warn?.(`[SupabaseFileService] ⚠️ Local disk deletion failed for ${fileKey}: ${err?.message}`)
  }
}

export class SupabaseFileService extends AbstractFileProviderService {
  static identifier = "supabase"
  protected client_: SupabaseClient
  protected bucket_: string
  protected logger_: any
  protected enableOptimization_: boolean
  protected maxDimension_: number
  protected quality_: number

  constructor({ logger }: any, options: SupabaseFileServiceOptions) {
    super()
    this.logger_ = logger
    const url = options?.url || process.env.SUPABASE_URL 
    const apiKey =
      options?.apiKey ||
      process.env.SUPABASE_API_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      ""
    this.bucket_ = options?.bucket || process.env.SUPABASE_STORAGE_BUCKET || "products"

    this.enableOptimization_ =
      options?.enableOptimization ?? (process.env.IMAGE_AUTO_OPTIMIZE !== "false")
    this.maxDimension_ =
      options?.maxDimension ?? (Number(process.env.IMAGE_MAX_DIMENSION) || 1200)
    this.quality_ =
      options?.quality ?? (Number(process.env.IMAGE_QUALITY) || 80)

    if (!url || !apiKey) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Supabase URL and API Key are required for SupabaseFileService"
      )
    }

    this.client_ = createClient(url, apiKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }

  /**
   * Pre-upload image optimization using Sharp.
   * Resizes large photos to max 1200px retina standard and encodes to WebP @ 80%.
   * Guarantees massive Supabase storage space savings before upload.
   */
  async optimizeImage(
    buffer: Buffer,
    filename: string,
    mimeType?: string
  ): Promise<{ buffer: Buffer; mimeType: string }> {
    if (!this.enableOptimization_ || !sharp) {
      return { buffer, mimeType: mimeType || "application/octet-stream" }
    }

    const ext = path.extname(filename).toLowerCase()
    const isRaster =
      /\.(png|jpe?g|webp|gif|avif)$/i.test(filename) ||
      (mimeType && /^image\/(png|jpe?g|webp|gif|avif)/i.test(mimeType))

    // Never alter vector SVGs, PDFs, CSVs, or non-raster files
    if (!isRaster || ext === ".svg" || mimeType?.includes("svg")) {
      return { buffer, mimeType: mimeType || "application/octet-stream" }
    }

    try {
      const meta = await sharp(buffer).metadata()
      if (!meta.width || !meta.height) {
        return { buffer, mimeType: mimeType || "application/octet-stream" }
      }

      // Enforce 1:1 square aspect ratio with clinical white background (#FFFFFF)
      // Caps maximum dimension at this.maxDimension_ (default 1200px retina)
      const maxSide = Math.max(meta.width, meta.height)
      const targetDim = Math.min(maxSide, this.maxDimension_)

      const pipeline = sharp(buffer).resize({
        width: targetDim,
        height: targetDim,
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })

      // Convert all raster images to WebP @ 80% for maximum bandwidth & storage efficiency
      const optimizedBuffer = await pipeline
        .webp({
          quality: this.quality_,
          effort: 6,
        })
        .toBuffer()
      const outputMime = "image/webp"

      if (optimizedBuffer && (optimizedBuffer.length < buffer.length || ext !== ".webp")) {
        const savedPct = buffer.length > optimizedBuffer.length
          ? (((buffer.length - optimizedBuffer.length) / buffer.length) * 100).toFixed(1)
          : "0"
        this.logger_?.info?.(
          `[SupabaseFileService] ⚡ Auto-optimized ${filename} (${meta.width}x${meta.height}): ${(buffer.length / 1024).toFixed(1)}KB -> ${(optimizedBuffer.length / 1024).toFixed(1)}KB (-${savedPct}%) [WebP 1200px]`
        )
        return { buffer: optimizedBuffer, mimeType: outputMime }
      } else {
        this.logger_?.info?.(
          `[SupabaseFileService] ⏭️ ${filename} already optimal (${(buffer.length / 1024).toFixed(1)}KB)`
        )
        return { buffer, mimeType: outputMime }
      }
    } catch (err: any) {
      this.logger_?.warn?.(
        `[SupabaseFileService] ⚠️ Sharp optimization skipped for ${filename}: ${err?.message}`
      )
      return { buffer, mimeType: mimeType || "application/octet-stream" }
    }
  }

  protected getFileKey(filename: string, access?: string): string {
    const sanitized = sanitizeFileName(filename)
    const parsed = path.posix.parse(sanitized)
    const prefix = access === "public" ? "" : "private-"
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    return `${parsed.dir ? `${parsed.dir}/` : ""}${prefix}${unique}-${parsed.base}`
  }

  async upload(file: ProviderUploadFileDTO): Promise<ProviderFileResultDTO> {
    if (!file) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "No file provided")
    }
    if (!file.filename) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "No filename provided")
    }

    const rawBuffer = decodeFileContent(file.content, file.mimeType)

    // Automatically optimize image before uploading to Supabase Storage
    const { buffer, mimeType } = await this.optimizeImage(rawBuffer, file.filename, file.mimeType)
    const effectiveFilename =
      mimeType === "image/webp" && !file.filename.toLowerCase().endsWith(".webp")
        ? file.filename.replace(/\.[^.]+$/, ".webp")
        : file.filename

    const fileKey = this.getFileKey(effectiveFilename, file.access || "public")

    const { error } = await this.client_.storage
      .from(this.bucket_)
      .upload(fileKey, buffer, {
        contentType: mimeType || "application/octet-stream",
        upsert: true,
      })

    if (error) {
      this.logger_?.error?.(`Supabase upload failed: ${error.message}`)
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `Upload failed: ${error.message}`)
    }

    const { data } = this.client_.storage.from(this.bucket_).getPublicUrl(fileKey)

    // Mirror to local storefront disk immediately (ZERO Supabase egress on storefront views)
    syncToLocalDisk(fileKey, buffer, this.logger_)

    return {
      url: data.publicUrl,
      key: fileKey,
    }
  }

  async getUploadStream(fileData: ProviderUploadStreamDTO): Promise<{
    writeStream: PassThrough
    promise: Promise<ProviderFileResultDTO>
    url: string
    fileKey: string
  }> {
    if (!fileData?.filename) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "No filename provided")
    }

    const initialKey = this.getFileKey(
      fileData.filename.replace(/\.[^.]+$/, ".webp"),
      fileData.access || "public"
    )
    const { data: initialUrl } = this.client_.storage.from(this.bucket_).getPublicUrl(initialKey)

    const pass = new PassThrough()
    const chunks: Buffer[] = []

    pass.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    })

    const promise = new Promise<ProviderFileResultDTO>((resolve, reject) => {
      pass.on("end", async () => {
        try {
          const rawBuffer = Buffer.concat(chunks)

          // Automatically optimize stream buffer before uploading to Supabase Storage
          const { buffer, mimeType } = await this.optimizeImage(rawBuffer, fileData.filename, fileData.mimeType)

          const { error } = await this.client_.storage
            .from(this.bucket_)
            .upload(initialKey, buffer, {
              contentType: mimeType || "application/octet-stream",
              upsert: true,
            })

          if (error) {
            reject(new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `Stream upload failed: ${error.message}`))
            return
          }

          // Mirror to local storefront disk immediately (ZERO Supabase egress on storefront views)
          syncToLocalDisk(initialKey, buffer, this.logger_)

          const { data } = this.client_.storage.from(this.bucket_).getPublicUrl(initialKey)
          resolve({
            url: data.publicUrl,
            key: initialKey,
          })
        } catch (err) {
          reject(err)
        }
      })

      pass.on("error", reject)
    })

    return {
      writeStream: pass,
      promise,
      url: initialUrl.publicUrl,
      fileKey: initialKey,
    }
  }

  async delete(files: ProviderDeleteFileDTO | ProviderDeleteFileDTO[]): Promise<void> {
    const list = Array.isArray(files) ? files : [files]
    const keys = list.map((f) => f.fileKey).filter(Boolean)

    if (keys.length === 0) return

    try {
      await this.client_.storage.from(this.bucket_).remove(keys)
    } catch (e: any) {
      this.logger_?.error?.(`Supabase delete failed: ${e?.message}`)
    }

    // Mirror deletion to local storefront disk immediately
    for (const key of keys) {
      removeFromLocalDisk(key, this.logger_)
    }

    // Trigger instant storefront & LiteSpeed cache invalidation
    await this.notifyStorefront("file.deleted", keys)
  }

  protected async notifyStorefront(event: string, keys: string[]): Promise<void> {
    const isProd =
      process.env.NODE_ENV === "production" ||
      process.env.MEDUSA_ADMIN_ONBOARDING_TYPE === "default" ||
      Boolean(process.env.MEDUSA_BACKEND_URL?.includes("peptech.bio"))

    const storefrontUrl =
      process.env.STRIPE_STOREFRONT_URL ||
      process.env.NEXT_PUBLIC_STOREFRONT_URL ||
      (isProd ? "https://peptech.bio" : "http://localhost:3000")

    const revalidateSecret =
      process.env.REVALIDATION_SECRET ||
      process.env.COMMERCE_CRON_SECRET ||
      process.env.STRIPE_COMMERCE_SIGNING_SECRET

    if (!revalidateSecret) {
      this.logger_?.warn?.(
        "[SupabaseFileService] Neither REVALIDATION_SECRET, COMMERCE_CRON_SECRET, nor STRIPE_COMMERCE_SIGNING_SECRET is configured. Skipping storefront cache purge."
      )
      return
    }

    try {
      const res = await fetch(`${storefrontUrl}/api/revalidate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-revalidate-secret": revalidateSecret,
        },
        body: JSON.stringify({
          event,
          fileKeys: keys,
          timestamp: Date.now(),
        }),
      })

      if (res.ok) {
        this.logger_?.info?.(
          `[SupabaseFileService] ✓ Storefront & LiteSpeed edge cache purged for file change (${event}): ${keys.join(", ")}`
        )
      } else {
        const text = await res.text()
        this.logger_?.warn?.(
          `[SupabaseFileService] ⚠️ Storefront cache purge returned status ${res.status}: ${text}`
        )
      }
    } catch (err: any) {
      this.logger_?.warn?.(
        `[SupabaseFileService] ⚠️ Failed to reach storefront revalidate endpoint at ${storefrontUrl}: ${err?.message || err}`
      )
    }
  }

  async getAsBuffer(fileData: ProviderGetFileDTO): Promise<Buffer> {
    const { data, error } = await this.client_.storage.from(this.bucket_).download(fileData.fileKey)
    if (error || !data) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `File ${fileData.fileKey} not found in Supabase storage`
      )
    }
    const arrayBuffer = await data.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }

  async getDownloadStream(fileData: ProviderGetFileDTO): Promise<Readable> {
    const buffer = await this.getAsBuffer(fileData)
    return Readable.from(buffer)
  }

  async getPresignedDownloadUrl(fileData: ProviderGetFileDTO): Promise<string> {
    const { data, error } = await this.client_.storage
      .from(this.bucket_)
      .createSignedUrl(fileData.fileKey, 3600)

    if (error || !data?.signedUrl) {
      const { data: pub } = this.client_.storage.from(this.bucket_).getPublicUrl(fileData.fileKey)
      return pub.publicUrl
    }

    return data.signedUrl
  }
}

export default SupabaseFileService
