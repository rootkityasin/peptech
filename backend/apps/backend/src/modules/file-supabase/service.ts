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
    const url = options?.url || process.env.SUPABASE_URL || "https://ubzoovlhbnztjwemvrwo.supabase.co"
    const apiKey =
      options?.apiKey ||
      process.env.SUPABASE_API_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      ""
    this.bucket_ = options?.bucket || process.env.SUPABASE_STORAGE_BUCKET || "products"

    this.enableOptimization_ =
      options?.enableOptimization ?? (process.env.IMAGE_AUTO_OPTIMIZE !== "false")
    this.maxDimension_ =
      options?.maxDimension ?? (Number(process.env.IMAGE_MAX_DIMENSION) || 1600)
    this.quality_ =
      options?.quality ?? (Number(process.env.IMAGE_QUALITY) || 82)

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
   * Resizes large photos to max 1600px retina standard and applies MozJPEG / PNG-9 / WebP compression.
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

      // Constrain to maximum retina dimension without enlarging smaller images
      const pipeline = sharp(buffer).resize({
        width: this.maxDimension_,
        height: this.maxDimension_,
        fit: "inside",
        withoutEnlargement: true,
      })

      let optimizedBuffer: Buffer | null = null
      let outputMime = mimeType || "application/octet-stream"

      if (ext === ".png" || mimeType === "image/png") {
        optimizedBuffer = await pipeline
          .png({
            quality: 85,
            compressionLevel: 9,
            effort: 7,
          })
          .toBuffer()
        outputMime = "image/png"
      } else if (ext === ".jpg" || ext === ".jpeg" || mimeType === "image/jpeg") {
        optimizedBuffer = await pipeline
          .jpeg({
            quality: this.quality_,
            mozjpeg: true,
          })
          .toBuffer()
        outputMime = "image/jpeg"
      } else if (ext === ".webp" || mimeType === "image/webp") {
        optimizedBuffer = await pipeline
          .webp({
            quality: 85,
            effort: 6,
          })
          .toBuffer()
        outputMime = "image/webp"
      } else {
        optimizedBuffer = await pipeline.toBuffer()
      }

      if (optimizedBuffer && optimizedBuffer.length < buffer.length) {
        const savedPct = (((buffer.length - optimizedBuffer.length) / buffer.length) * 100).toFixed(1)
        this.logger_?.info?.(
          `[SupabaseFileService] ⚡ Auto-optimized ${filename} (${meta.width}x${meta.height}): ${(buffer.length / 1024).toFixed(1)}KB -> ${(optimizedBuffer.length / 1024).toFixed(1)}KB (-${savedPct}%)`
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

    const fileKey = this.getFileKey(file.filename, file.access || "public")
    const rawBuffer = decodeFileContent(file.content, file.mimeType)

    // Automatically optimize image before uploading to Supabase Storage
    const { buffer, mimeType } = await this.optimizeImage(rawBuffer, file.filename, file.mimeType)

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

    const fileKey = this.getFileKey(fileData.filename, fileData.access || "public")
    const pass = new PassThrough()
    const chunks: Buffer[] = []

    pass.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    })

    const { data: initialUrl } = this.client_.storage.from(this.bucket_).getPublicUrl(fileKey)

    const promise = new Promise<ProviderFileResultDTO>((resolve, reject) => {
      pass.on("end", async () => {
        try {
          const rawBuffer = Buffer.concat(chunks)

          // Automatically optimize stream buffer before uploading to Supabase Storage
          const { buffer, mimeType } = await this.optimizeImage(rawBuffer, fileData.filename, fileData.mimeType)

          const { error } = await this.client_.storage
            .from(this.bucket_)
            .upload(fileKey, buffer, {
              contentType: mimeType || "application/octet-stream",
              upsert: true,
            })

          if (error) {
            reject(new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `Stream upload failed: ${error.message}`))
            return
          }

          const { data } = this.client_.storage.from(this.bucket_).getPublicUrl(fileKey)
          resolve({
            url: data.publicUrl,
            key: fileKey,
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
      fileKey,
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
