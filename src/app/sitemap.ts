import type { MetadataRoute } from "next"
import { getAllPosts } from "@/lib/content/load"
import { getSiteUrl } from "@/lib/content/site-url"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl()
  const posts = getAllPosts()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/posts`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/graph`, changeFrequency: "weekly", priority: 0.65 },
    { url: `${base}/updates`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/timeline`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/more`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/projects`, changeFrequency: "monthly", priority: 0.65 },
    { url: `${base}/friends`, changeFrequency: "monthly", priority: 0.45 },
    { url: `${base}/bookmarks`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/tokens`, changeFrequency: "daily", priority: 0.55 },
  ]

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${base}/posts/${post.slug}`,
    lastModified: post.updated ?? post.date,
    changeFrequency: "monthly",
    priority: 0.8,
  }))

  return [...staticRoutes, ...postRoutes]
}
