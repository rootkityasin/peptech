import type { NextConfig } from "next";

const medusaBackendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
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
