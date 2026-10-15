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
  for (const key of ["NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY", "NEXT_PUBLIC_MEDUSA_BACKEND_URL"]) {
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

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
    NEXT_PUBLIC_MEDUSA_BACKEND_URL: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "",
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
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
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
    ];
  },
  async rewrites() {
    return [
      {
        source: "/store/:path*",
        destination: `${medusaBackendUrl}/store/:path*`,
      },
      {
        source: "/auth/:path*",
        destination: `${medusaBackendUrl}/auth/:path*`,
      },
      {
        source: "/static/:path*",
        destination: `${medusaBackendUrl}/static/:path*`,
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
