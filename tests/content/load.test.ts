import { describe, it, expect, afterEach } from "vitest"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import {
  getAllPosts,
  getAllUpdates,
  getAllGlimpses,
  getAllPages,
  getPostBySlug,
} from "@/lib/content/load"

const contentRoot = path.join(process.cwd(), "content")
const tmpRoots: string[] = []

function makeTempContentRoot(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "zlog-content-"))
  tmpRoots.push(root)
  fs.mkdirSync(path.join(root, "posts"), { recursive: true })
  return root
}

afterEach(() => {
  while (tmpRoots.length > 0) {
    const root = tmpRoots.pop()
    if (root) fs.rmSync(root, { recursive: true, force: true })
  }
})

describe("content load", () => {
  it("returns only published posts", () => {
    // vitest runs with NODE_ENV=test → drafts stay hidden
    expect(process.env.NODE_ENV).not.toBe("development")
    const posts = getAllPosts(contentRoot)
    expect(posts.some((p) => p.slug === "hello-world")).toBe(true)
    expect(posts.some((p) => p.title === "草稿不该出现")).toBe(false)
  })

  it("includes drafts when SHOW_DRAFTS=1", () => {
    const prev = process.env.SHOW_DRAFTS
    process.env.SHOW_DRAFTS = "1"
    try {
      const posts = getAllPosts(contentRoot)
      expect(posts.some((p) => p.title === "草稿不该出现")).toBe(true)
    } finally {
      if (prev === undefined) delete process.env.SHOW_DRAFTS
      else process.env.SHOW_DRAFTS = prev
    }
  })

  it("loads post by slug", () => {
    const post = getPostBySlug("hello-world", contentRoot)
    expect(post?.title).toBe("你好，世界")
    expect(post?.body).toContain("第一篇")
  })

  it("loads updates and glimpses and pages", () => {
    expect(getAllUpdates(contentRoot).length).toBeGreaterThan(0)
    expect(getAllGlimpses(contentRoot).length).toBeGreaterThan(0)
    // pages/ may be empty; loader should still return an array
    expect(Array.isArray(getAllPages(contentRoot))).toBe(true)
  })

  it("throws on duplicate post slugs", () => {
    const root = makeTempContentRoot()
    const postsDir = path.join(root, "posts")
    const body = `---
title: One
slug: same-slug
date: 2026-07-12
published: true
---

body
`
    fs.writeFileSync(path.join(postsDir, "a.md"), body)
    fs.writeFileSync(path.join(postsDir, "b.md"), body)

    expect(() => getAllPosts(root)).toThrow(/Duplicate post slug "same-slug"/)
  })

  it("skips published posts missing title", () => {
    const root = makeTempContentRoot()
    const postsDir = path.join(root, "posts")
    fs.writeFileSync(
      path.join(postsDir, "no-title.md"),
      `---
date: 2026-07-12
published: true
---

missing title
`,
    )
    fs.writeFileSync(
      path.join(postsDir, "ok.md"),
      `---
title: Valid
slug: valid
date: 2026-07-12
published: true
---

ok
`,
    )

    const posts = getAllPosts(root)
    expect(posts).toHaveLength(1)
    expect(posts[0]?.slug).toBe("valid")
    expect(posts.some((p) => p.filePath.includes("no-title"))).toBe(false)
  })

  it("supports Obsidian draft/description/categories frontmatter", () => {
    const root = makeTempContentRoot()
    const postsDir = path.join(root, "posts")
    fs.writeFileSync(
      path.join(postsDir, "obsidian.md"),
      `---
title: Obsidian Note
date: 2026-04-07 16:53
description: hello summary
draft: false
categories: 笔记
tags:
  - 学习
---

body text
`,
    )
    fs.writeFileSync(
      path.join(postsDir, "draft-obsidian.md"),
      `---
title: Hidden Draft
date: 2026-04-07
draft: true
---

nope
`,
    )

    const posts = getAllPosts(root)
    expect(posts.some((p) => p.title === "Obsidian Note")).toBe(true)
    expect(posts.find((p) => p.title === "Obsidian Note")?.summary).toBe(
      "hello summary",
    )
    expect(posts.find((p) => p.title === "Obsidian Note")?.category).toBe(
      "笔记",
    )
    expect(posts.some((p) => p.title === "Hidden Draft")).toBe(false)
  })

  it("splits memo dumps into updates", () => {
    const root = makeTempContentRoot()
    const glimpsesDir = path.join(root, "glimpses")
    fs.mkdirSync(glimpsesDir, { recursive: true })
    fs.writeFileSync(
      path.join(glimpsesDir, "memos.md"),
      `---
title: 我的微语
date: 2026-01-24 12:00:00
---
## 2026-06-23 11:43
first memo

## 2026-05-30 21:26
second memo
`,
    )

    const updates = getAllUpdates(root)
    expect(updates.length).toBeGreaterThanOrEqual(2)
    expect(updates.some((u) => u.body.includes("first memo"))).toBe(true)
    expect(updates.some((u) => u.body.includes("second memo"))).toBe(true)
  })

  it("includes all memos in updates (text + image)", () => {
    const root = makeTempContentRoot()
    const glimpsesDir = path.join(root, "glimpses")
    fs.mkdirSync(glimpsesDir, { recursive: true })
    fs.writeFileSync(
      path.join(glimpsesDir, "memos.md"),
      `---
title: 我的微语
date: 2026-01-24 12:00:00
---
## 2026-06-23 11:43
text only memo

## 2026-05-21 17:10
photo moment
![x](https://example.com/a.jpg)
`,
    )

    const updates = getAllUpdates(root)
    expect(updates.some((u) => u.body.includes("text only memo"))).toBe(true)
    expect(updates.some((u) => u.body.includes("photo moment"))).toBe(true)
  })
})
