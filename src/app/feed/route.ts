import { getAllPosts } from "@/lib/content/load"
import { getSiteConfig } from "@/lib/content/site"
import { getSiteUrl } from "@/lib/content/site-url"

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}

export function GET() {
  const site = getSiteConfig()
  const base = getSiteUrl()
  const posts = getAllPosts()

  const items = posts
    .map((post) => {
      const link = `${base}/posts/${post.slug}`
      const description = post.summary ?? ""
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escapeXml(description)}</description>
    </item>`
    })
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(site.title)}</title>
    <link>${escapeXml(base)}</link>
    <description>${escapeXml(site.description)}</description>
    <language>${escapeXml(site.locale)}</language>
${items}
  </channel>
</rss>
`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  })
}
