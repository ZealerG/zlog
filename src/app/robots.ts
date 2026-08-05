import type { MetadataRoute } from "next"
import { getSiteUrl } from "@/lib/content/site-url"

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl()

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/search-index.json"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
