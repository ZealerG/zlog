import { describe, it, expect, afterEach } from "vitest"
import {
  clearContentGraphCache,
  getAllPosts,
  getPostBySlug,
  getTimelineEntries,
  loadContentGraph,
} from "@/lib/content/load"
import { clearMarkdownFileCache } from "@/lib/content/parse"
import path from "node:path"

const contentRoot = path.join(process.cwd(), "content")

afterEach(() => {
  clearContentGraphCache()
  clearMarkdownFileCache()
})

/**
 * Offline smoke: content graph + critical contracts used by routes.
 * Does not require a running server (CI-friendly).
 */
describe("content graph smoke", () => {
  it("loads graph with site-critical collections", () => {
    const g = loadContentGraph(contentRoot)
    expect(g.posts.length).toBeGreaterThan(0)
    expect(Array.isArray(g.updates)).toBe(true)
    expect(Array.isArray(g.glimpses)).toBe(true)
    expect(g.fingerprint.length).toBeGreaterThan(0)
  })

  it("resolves a loaded post by slug map", () => {
    const first = getAllPosts(contentRoot)[0]
    expect(first).toBeTruthy()
    expect(getPostBySlug(first.slug, contentRoot)).toBe(first)
  })

  it("timeline entries only use known kinds", () => {
    const entries = getTimelineEntries(contentRoot)
    for (const e of entries) {
      expect(["post", "update", "glimpse"]).toContain(e.kind)
      expect(e.date).toBeTruthy()
      expect(e.title).toBeTruthy()
      expect(e.href).toMatch(/^\//)
    }
  })

  it("search-index shape matches posts in graph when generated from same loader", () => {
    const posts = getAllPosts(contentRoot)
    const index = posts.map((p) => ({
      slug: p.slug,
      title: p.title,
      summary: p.summary ?? "",
      tags: p.tags,
      category: p.category ?? "",
    }))
    expect(index.every((e) => e.slug && e.title)).toBe(true)
    expect(new Set(index.map((e) => e.slug)).size).toBe(index.length)
  })
})
