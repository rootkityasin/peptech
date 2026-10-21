import { loadEnv, defineConfig, MedusaError } from '@medusajs/framework/utils'
const fs = require('fs')
const path = require('path')

// Auto-load workspace root .env
function loadRootEnv(startDir = __dirname) {
  let dir = startDir
  while (true) {
    const pkgPath = path.join(dir, 'package.json')
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
        if (pkg.name === 'peptech') {
          const envFile = path.join(dir, '.env')
          if (fs.existsSync(envFile)) {
            const content = fs.readFileSync(envFile, 'utf8')
            for (const line of content.split('\n')) {
              const trimmed = line.trim()
              if (!trimmed || trimmed.startsWith('#')) continue
              const idx = trimmed.indexOf('=')
              if (idx !== -1) {
                const key = trimmed.slice(0, idx).trim()
                let val = trimmed.slice(idx + 1).trim()
                if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                  val = val.slice(1, -1)
                }
                process.env[key] = val
              }
            }
          }
          return
        }
      } catch {}
    }
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}
loadRootEnv()

const { loadStripeEnv, stripeModules, commerceRuntimeModules, commerceEmailModules, resolveRedisUrl } = require("./src/lib/stripe-config")
loadStripeEnv()

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// In-memory sessions disappear on every development restart. Native dashboard
// and custom screens share an isolated bearer token by default instead.
process.env.ADMIN_AUTH_TYPE ||= "jwt"
process.env.ADMIN_JWT_TOKEN_STORAGE_KEY ||= "peptech_admin_token"

if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
  throw new MedusaError(MedusaError.Types.INVALID_DATA, "DATABASE_URL must be set in production")
}
const rawDbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || 'postgresql://localhost:5432/peptech'
const dbUrl = rawDbUrl.replace(/([?&])sslmode=[^&]*(&|$)/gi, (match: string, prefix: string, suffix: string) => {
  if (prefix === '?' && suffix === '&') return '?'
  if (prefix === '?' && suffix === '') return ''
  if (prefix === '&') return suffix
  return ''
})
process.env.DATABASE_URL = dbUrl

const caCert = process.env.DATABASE_CA_CERT
  ? (fs.existsSync(process.env.DATABASE_CA_CERT)
      ? fs.readFileSync(process.env.DATABASE_CA_CERT, "utf8")
      : process.env.DATABASE_CA_CERT)
  : undefined

const resolvedRedisUrl = resolveRedisUrl(process.env)

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: dbUrl,
    redisUrl: resolvedRedisUrl,
    databaseDriverOptions: dbUrl?.includes('localhost') || dbUrl?.includes('127.0.0.1')
      ? { connection: { ssl: false } }
      : {
          ssl: caCert
            ? { ca: caCert, rejectUnauthorized: true }
            : { rejectUnauthorized: false },
          connection: {
            ssl: caCert
              ? { ca: caCert, rejectUnauthorized: true }
              : { rejectUnauthorized: false },
          },
          pool: {
            min: 1,
            max: 5,
            idleTimeoutMillis: 30000,
          },
        },
    http: {
      storeCors: process.env.STORE_CORS || '/^https?:\\/\\/(localhost|127\\.0\\.0\\.1)(:\\d+)?$|^https?:\\/\\/(?:[a-zA-Z0-9-]+\\.)*peptech\\.bio$|^https?:\\/\\/docs\\.medusajs\\.com$/',
      adminCors: process.env.ADMIN_CORS || '/^https?:\\/\\/(localhost|127\\.0\\.0\\.1)(:\\d+)?$|^https?:\\/\\/(?:[a-zA-Z0-9-]+\\.)*peptech\\.bio$|^https?:\\/\\/docs\\.medusajs\\.com$/',
      authCors: process.env.AUTH_CORS || '/^https?:\\/\\/(localhost|127\\.0\\.0\\.1)(:\\d+)?$|^https?:\\/\\/(?:[a-zA-Z0-9-]+\\.)*peptech\\.bio$|^https?:\\/\\/docs\\.medusajs\\.com$/',
      jwtSecret: process.env.JWT_SECRET || (() => { throw new MedusaError(MedusaError.Types.INVALID_DATA, 'JWT_SECRET must be configured') })(),
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
      cookieSecret: process.env.COOKIE_SECRET || (() => { throw new MedusaError(MedusaError.Types.INVALID_DATA, 'COOKIE_SECRET must be configured') })(),
    },
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax',
    },
    sessionOptions: {
      name: "peptech.sid",
      resave: false,
      rolling: true,
    },
  },
  admin: {
    disable: false,
  },
  modules: [
    {
      resolve: "@medusajs/medusa/auth",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/auth-emailpass",
            id: "emailpass",
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "./src/modules/file-supabase",
            id: "supabase",
            options: {
              url: process.env.SUPABASE_URL,
              apiKey: process.env.SUPABASE_SERVICE_ROLE_KEY ,
              bucket: process.env.SUPABASE_STORAGE_BUCKET,
            },
          },
        ],
      },
    },
    { key: "peptechCommerce", resolve: "./src/modules/peptech-commerce", options: { databaseUrl: process.env.STRIPE_COMMERCE_DATABASE_URL || rawDbUrl } },
    ...stripeModules(),
    ...commerceRuntimeModules(),
    ...commerceEmailModules(),
  ],
})
