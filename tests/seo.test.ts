import { afterEach, describe, expect, it, vi } from "vitest"
import robots from "@/app/robots"
import sitemap from "@/app/sitemap"
import {
  createArticleJsonLd,
  createArticleMetadata,
  createPageMetadata,
  serializeJsonLd,
} from "@/lib/seo"
import type { Post } from "@/lib/content/types"

const post: Post = {
  title: "文章标题",
  slug: "notes/example",
  date: "2026-08-01T00:00:00.000Z",
  updated: "2026-08-02T00:00:00.000Z",
  tags: ["Next.js", "博客"],
  summary: "文章摘要",
  cover: "/cover.png",
  published: true,
  body: "正文",
  filePath: "/tmp/example.md",
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("SEO metadata", () => {
  it("builds canonical metadata and noindex for filtered pages", () => {
    const metadata = createPageMetadata({
      path: "/posts",
      title: "篇章",
      description: "全部文章",
      noIndex: true,
    })

    expect(metadata.alternates?.canonical).toBe("/posts")
    expect(metadata.robots).toMatchObject({ index: false, follow: true })
    expect(metadata.openGraph).toMatchObject({ url: "/posts", type: "website" })
  })

  it("builds article metadata and structured data with absolute URLs", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://blog.example.com")

    const metadata = createArticleMetadata(post)
    const jsonLd = createArticleJsonLd(post)

    expect(metadata.alternates?.canonical).toBe("/posts/notes/example")
    expect(metadata.openGraph).toMatchObject({
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated,
    })
    expect(jsonLd).toMatchObject({
      "@type": "BlogPosting",
      mainEntityOfPage: "https://blog.example.com/posts/notes/example",
      image: ["https://blog.example.com/cover.png"],
    })
  })

  it("escapes HTML starts in JSON-LD", () => {
    const serialized = serializeJsonLd({ title: "</script><script>" })

    expect(serialized).not.toContain("<")
    expect(serialized).toContain("\\u003c/script>")
  })

  it("publishes all public routes and a matching robots sitemap", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://blog.example.com")

    const urls = sitemap().map((entry) => entry.url)
    expect(urls).toEqual(
      expect.arrayContaining([
        "https://blog.example.com/projects",
        "https://blog.example.com/friends",
        "https://blog.example.com/bookmarks",
      ]),
    )
    expect(robots().sitemap).toBe("https://blog.example.com/sitemap.xml")
  })
})
