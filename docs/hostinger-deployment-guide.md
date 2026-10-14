# PEPTECH® Hostinger Production Deployment Guide

This guide details how to build, deploy, and maintain PEPTECH® (Medusa 2.0 Backend and Next.js Storefront) on a **Hostinger Web Hosting (Shared/Cloud)** plan without hitting memory timeouts or breaking automated 28-day subscriptions.

---

## 1. Architecture Overview on Hostinger

* **Storefront**: Next.js 15 App Router deployed under your main domain (`peptech.bio`).
* **Backend**: Medusa 2.0 deployed under your subdomain (`admin.peptech.bio`).
* **Database**: Managed PostgreSQL on Supabase (persistent, external).
* **Redis**: Free 30MB instance on [Redis Cloud (redis.io)](https://redis.io) (`rediss://...`).
* **Email Mailer**: Hostinger Titan Email via `smtp.hostinger.com:465` (SSL).
* **Scheduler/Worker**: Hostinger hPanel Cron Job triggering `/hooks/peptech-commerce-tick` every 15 minutes to keep Node.js warm and process 28-day renewals.

---

## 2. Pre-Requisites & Environment Configuration

Ensure your production `.env` file on Hostinger contains the required production keys:

```env
# ========================================================
# PEPTECH® Hostinger Production Environment Configuration
# ========================================================

# Supabase PostgreSQL Database
DATABASE_URL="postgresql://postgres:your_password@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Redis Cloud (redis.io TLS connection)
REDIS_URL="rediss://default:your_redis_cloud_password@your_endpoint.redislabs.com:6379"

# Stripe Payment Gateway
STRIPE_ACCOUNT_ID="acct_your_account_id"
STRIPE_API_KEY="sk_live_your_live_key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_your_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
STRIPE_LIVE_APPROVED="true"
STRIPE_STOREFRONT_URL="https://peptech.bio"

# Security & Secrets (at least 32 characters each)
JWT_SECRET="your_secure_random_jwt_secret_min_32_characters"
COOKIE_SECRET="your_secure_random_cookie_secret_min_32_characters"
STRIPE_COMMERCE_SIGNING_SECRET="your_secure_random_signing_secret_min_32_characters"
MEDUSA_ADMIN_ONBOARDING_TYPE="default"

# Background Commerce Wake-up & Renewal Cron Secret
COMMERCE_CRON_SECRET="your_secure_cron_secret_min_16_characters"

# Hostinger Titan Email SMTP Configuration
STRIPE_EMAIL_HOST="smtp.hostinger.com"
STRIPE_EMAIL_PORT="465"
STRIPE_EMAIL_USER="support@peptech.bio"
STRIPE_EMAIL_PASSWORD="your_titan_email_password"
STRIPE_EMAIL_FROM="Peptech Research <support@peptech.bio>"

# Public Next.js Storefront Configuration
NEXT_PUBLIC_MEDUSA_BACKEND_URL="https://admin.peptech.bio"
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY="pk_your_medusa_publishable_key"
```

---

## 3. Local Pre-Compilation (Crucial for Hostinger Shared Hosting)

> [!IMPORTANT]
> Running `npm run build` directly on Hostinger Web Hosting will often be killed by CloudLinux due to the 512MB–1GB RAM limits.
> Always build the project locally (or via GitHub Actions) and upload the compiled bundle.

### Step 3.1: Build Medusa Backend
In your local terminal:
```bash
cd backend/apps/backend
npm install
npm run build
```
This compiles the backend into the `.medusa/server` distribution folder.

### Step 3.2: Build Next.js Storefront
In your local terminal:
```bash
cd storefront
npm install
npm run build
```
This compiles the Next.js storefront into `.next/standalone` (if standalone output is enabled) or `.next`.

---

## 4. Deploying to Hostinger hPanel

### 4.1: Deploy Backend (`admin.peptech.bio`)
1. In Hostinger hPanel, create a Subdomain: `admin.peptech.bio`.
2. Go to **Websites → Manage → Node.js** (or Application Manager).
3. Set:
   * **Node.js version**: `20.x` or `22.x`
   * **Application root**: `public_html/admin` (or subdomain folder)
   * **Application startup file**: `server.js`
4. Upload:
   * `.medusa/server` (compiled bundle)
   * `package.json` and `node_modules` (or run `npm install --omit=dev` via Hostinger SSH)
   * `server.js`
   * `.env` file (configured in Step 2)
5. Start or Restart the Node.js application in hPanel.

### 4.2: Deploy Storefront (`peptech.bio`)
1. In Hostinger hPanel, open your main domain `peptech.bio`.
2. Configure Node.js application:
   * **Node.js version**: `20.x` or `22.x`
   * **Application startup file**: `server.js` (from `.next/standalone`) or run via PM2/npm start.
3. Upload the built `.next` output and `public/` assets.
4. Restart the application.

---

## 5. Setting Up the Hostinger Cron Job

Because Hostinger shared hosting spins down inactive Node.js processes, set up an hPanel cron job to wake up the server and process 28-day subscription renewals.

1. In hPanel, go to **Advanced → Cron Jobs**.
2. Select **Custom** schedule.
3. Frequency: `*/15 * * * *` (Every 15 minutes).
4. Command:
   ```bash
   curl -s -X POST https://admin.peptech.bio/hooks/peptech-commerce-tick -H "x-cron-secret: eac8278a003786636b14efec0dee6cc4"
   ```

---

## 6. Verifying the Deployment

### Test 1: Verify SMTP Mailer
Run the diagnostic tool from your terminal:
```bash
node scripts/test-smtp.cjs support@peptech.bio
```
*Expected: "✅ SMTP Connection & Authentication Successful! Test email delivered successfully."*

### Test 2: Verify Commerce Cron Endpoint
Send a curl request to your live backend:
```bash
curl -i -X POST https://admin.peptech.bio/hooks/peptech-commerce-tick \
  -H "x-cron-secret: YOUR_COMMERCE_CRON_SECRET"
```
*Expected HTTP Response:*
```json
{
  "status": "success",
  "message": "PEPTECH commerce tick executed successfully.",
  "duration_ms": 142,
  "timestamp": "2026-10-14T15:25:00.000Z"
}
```

### Test 3: Stripe Webhook Configuration
In the **Stripe Dashboard → Developers → Webhooks**:
* Add Endpoint: `https://admin.peptech.bio/hooks/peptech-stripe`
* Select Events:
  * `checkout.session.completed`
  * `invoice.paid`
  * `invoice.payment_failed`
  * `customer.subscription.created`
  * `customer.subscription.updated`
  * `customer.subscription.deleted`
  * `charge.dispute.created`
  * `charge.refunded`
* Copy the signing secret (`whsec_...`) into `STRIPE_WEBHOOK_SECRET` in `.env`.
