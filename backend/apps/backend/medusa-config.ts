import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import { adminOrderOverrides } from './admin-order-overrides'
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

const { loadStripeEnv, stripeModules, commerceRuntimeModules, commerceEmailModules } = require("./src/lib/stripe-config")
loadStripeEnv()

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// In-memory sessions disappear on every development restart. Native dashboard
// and custom screens share an isolated bearer token by default instead.
process.env.ADMIN_AUTH_TYPE ||= "jwt"
process.env.ADMIN_JWT_TOKEN_STORAGE_KEY ||= "peptech_admin_token"

const defaultDatabaseUrl = 'postgresql://localhost:5432/peptech'
const rawDbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || defaultDatabaseUrl
const dbUrl = rawDbUrl.replace(/([?&])sslmode=[^&]*(&|$)/gi, (match: string, prefix: string, suffix: string) => {
  if (prefix === '?' && suffix === '&') return '?'
  if (prefix === '?' && suffix === '') return ''
  if (prefix === '&') return suffix
  return ''
})
process.env.DATABASE_URL = dbUrl

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: dbUrl,
    redisUrl: process.env.REDIS_URL,
    databaseDriverOptions: dbUrl?.includes('localhost') || dbUrl?.includes('127.0.0.1')
      ? { connection: { ssl: false } }
      : { ssl: { rejectUnauthorized: false }, connection: { ssl: { rejectUnauthorized: false } } },
    http: {
      storeCors: process.env.STORE_CORS || '/^https?:\\/\\/(localhost|127\\.0\\.0\\.1)(:\\d+)?$|^https?:\\/\\/(?:[a-zA-Z0-9-]+\\.)*peptech\\.bio$|^https?:\\/\\/docs\\.medusajs\\.com$/',
      adminCors: process.env.ADMIN_CORS || '/^https?:\\/\\/(localhost|127\\.0\\.0\\.1)(:\\d+)?$|^https?:\\/\\/(?:[a-zA-Z0-9-]+\\.)*peptech\\.bio$|^https?:\\/\\/docs\\.medusajs\\.com$/',
      authCors: process.env.AUTH_CORS || '/^https?:\\/\\/(localhost|127\\.0\\.0\\.1)(:\\d+)?$|^https?:\\/\\/(?:[a-zA-Z0-9-]+\\.)*peptech\\.bio$|^https?:\\/\\/docs\\.medusajs\\.com$/',
      jwtSecret: process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? (() => { throw new Error('JWT_SECRET must be set in production') })() : 'dev_jwt_secret_change_in_prod'),
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
      cookieSecret: process.env.COOKIE_SECRET || (process.env.NODE_ENV === 'production' ? (() => { throw new Error('COOKIE_SECRET must be set in production') })() : 'dev_cookie_secret_change_in_prod'),
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
    vite: () => ({
      ...adminOrderOverrides(),
      // Keep Vite's dependency optimizer separate from production artifacts.
      // Do not purge it during builds: a running dev server still references it.
      ...(process.env.NODE_ENV !== "production" && {
        cacheDir: path.resolve(process.cwd(), "node_modules/.vite-medusa-development-orders"),
      }),
    }),
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
            resolve: "@medusajs/medusa/file-local",
            id: "local",
            options: {
              upload_dir: "static",
              backend_url: `${process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"}/static`,
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
