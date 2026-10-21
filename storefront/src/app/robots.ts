import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/cart",
          "/checkout",
          "/checkout/*",
          "/account",
          "/account/*",
          "/receipt",
          "/receipt/*",
          "/api/*",
          "/admin",
          "/admin/*",
        ],
      },
    ],
    sitemap: "https://peptech.bio/sitemap.xml",
  }
}
