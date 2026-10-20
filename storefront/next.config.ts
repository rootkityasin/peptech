import type { NextConfig } from "next";
import fs from "fs";
import path from "path";
import { loadEnvConfig } from "@next/env";

// Automatically load the single unified root .env into Next.js
const workspaceRoot = path.resolve(__dirname, "..");
loadEnvConfig(workspaceRoot);

// If the shell has an empty public env var, @next/env will not override it.
// Force the storefront-critical public keys from the unified root .env.
const rootEnvPath = path.join(workspaceRoot, ".env");
if (fs.existsSync(rootEnvPath)) {
  const rootEnv = fs.readFileSync(rootEnvPath, "utf8");
  for (const key of [
    "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_MEDUSA_BACKEND_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_URL",
    "SUPABASE_STORAGE_URL",
    "NEXT_PUBLIC_WHATSAPP_NUMBER",
  ]) {
    const match = rootEnv.match(new RegExp(`^${key}=([^\\r\\n]*)`, "m"));
    const value = match?.[1]?.replace(/^['\"]|['\"]$/g, "").trim();
    if (value) {
      process.env[key] = value;
    }
  }
}

const isProd = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
const medusaBackendUrl =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  (isProd ? "https://admin.peptech.bio" : "http://localhost:9000");

const supabaseStorageBase =
  process.env.SUPABASE_STORAGE_URL ||
  (process.env.NEXT_PUBLIC_SUPABASE_URL
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products`
    : process.env.SUPABASE_URL
    ? `${process.env.SUPABASE_URL}/storage/v1/object/public/products`
    : "");

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
    NEXT_PUBLIC_MEDUSA_BACKEND_URL: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    NEXT_PUBLIC_SUPABASE_STORAGE_URL: supabaseStorageBase,
    NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,

    remotePatterns: [
      ...(!isProd
        ? [
            {
              protocol: "http" as const,
              hostname: "localhost",
            },
            {
              protocol: "http" as const,
              hostname: "127.0.0.1",
            },
            {
              protocol: "https" as const,
              hostname: "localhost",
            },
          ]
        : []),
      {
        protocol: "https",
        hostname: "admin.peptech.bio",
      },
      {
        protocol: "https",
        hostname: "peptech.bio",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
      {
        source: "/api/catalog",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate, s-maxage=604800, stale-while-revalidate=86400",
          },
          {
            key: "CDN-Cache-Control",
            value: "public, s-maxage=604800",
          },
          {
            key: "X-LiteSpeed-Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/products/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate, s-maxage=604800, stale-while-revalidate=86400",
          },
          {
            key: "CDN-Cache-Control",
            value: "public, s-maxage=604800",
          },
          {
            key: "X-LiteSpeed-Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/:path(shop|pen-sets|refills|vials)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate, s-maxage=604800, stale-while-revalidate=86400",
          },
          {
            key: "CDN-Cache-Control",
            value: "public, s-maxage=604800",
          },
          {
            key: "X-LiteSpeed-Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "X-LiteSpeed-Cache-Control",
            value: "public, max-age=31536000",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/static/products/:path*",
        destination: "/images/products/:path*",
      },
      {
        source: "/static/:path*",
        destination: "/images/:path*",
      },
      {
        source: "/store/:path*",
        destination: `${medusaBackendUrl}/store/:path*`,
      },
      {
        source: "/auth/:path*",
        destination: `${medusaBackendUrl}/auth/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/privacy",
        destination: "/privacy-policy",
        permanent: true,
      },
      {
        source: "/admin",
        destination: `${medusaBackendUrl}/app`,
        permanent: false,
      },
      {
        source: "/app",
        destination: `${medusaBackendUrl}/app`,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
