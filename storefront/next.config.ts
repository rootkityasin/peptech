import type { NextConfig } from "next";
import path from "path";

const isProd = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
const medusaBackendUrl =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  (isProd ? "https://admin.peptech.bio" : "http://localhost:9000");

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
      {
        protocol: "https",
        hostname: "localhost",
      },
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

