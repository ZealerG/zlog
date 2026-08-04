import { afterEach, describe, expect, it, vi } from "vitest"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import {
  clearContentGraphCache,
  contentFingerprint,
  getAllPosts,
  getAllUpdates,
  getAllGlimpses,
  getAllPages,
  getPostBySlug,
  getTimelineEntries,
  loadContentGraph,
} from "@/lib/content/load"
import {
  clearMarkdownFileCache,
  extractMarkdownImages,
  extractWikilinks,
} from "@/lib/content/parse"
import { clearCacheMeta } from "@/lib/content/cache-meta"
import {
  GRAPH_OUTPUT_RELATIVE_PATH,
  serializeContentGraph,
} from "@/lib/content/serialize"

const contentRoot = path.join(process.cwd(), "content")
const tmpDirs: string[] = []

function makeTempContentRoot(): string {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "zlog-content-"))
  const root = path.join(base, "content")
  tmpDirs.push(base)
  fs.mkdirSync(path.join(root, "posts"), { recursive: true })
  return root
}

function writePost(
  root: string,
  relativePath: string,
  {
    title,
    slug,
    published = true,
    body = "body",
  }: {
    title: string
    slug?: string
    published?: boolean
    body?: string
  },
): string {
  const filePath = path.join(root, "posts", relativePath)
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  const slugLine = slug ? `slug: ${slug}\n` : ""
  fs.writeFileSync(
    filePath,
    `---
title: ${title}
${slugLine}date: 2026-08-04
published: ${published}
---

${body}
`,
  )
  return filePath
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  while (tmpDirs.length > 0) {
    const dir = tmpDirs.pop()
    if (dir) fs.rmSync(dir, { recursive: true, force: true })
  }
  clearContentGraphCache()
  clearMarkdownFileCache()
})

describe("content load", () => {
  it("returns only published posts", () => {
    const root = makeTempContentRoot()
    writePost(root, "published.md", {
      title: "Published",
      slug: "published",
    })
    writePost(root, "draft.md", {
      title: "Draft",
      slug: "draft",
      published: false,
    })

    expect(getAllPosts(root).map((post) => post.slug)).toEqual(["published"])
  })

  it("includes drafts when SHOW_DRAFTS=1", () => {
    const root = makeTempContentRoot()
    writePost(root, "published.md", {
      title: "Published",
      slug: "published",
    })
    writePost(root, "draft.md", {
      title: "Draft",
      slug: "draft",
      published: false,
    })
    const prev = process.env.SHOW_DRAFTS
    process.env.SHOW_DRAFTS = "1"
    try {
      expect(getAllPosts(root).map((post) => post.slug).sort()).toEqual([
        "draft",
        "published",
      ])
    } finally {
      if (prev === undefined) delete process.env.SHOW_DRAFTS
      else process.env.SHOW_DRAFTS = prev
    }
  })

  it("loads post by slug", () => {
    const root = makeTempContentRoot()
    writePost(root, "hello.md", {
      title: "Hello",
      slug: "hello-world",
      body: "first post",
    })

    const post = getPostBySlug("hello-world", root)
    expect(post?.title).toBe("Hello")
    expect(post?.body).toContain("first post")
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
    const photo = updates.find((u) => u.body.includes("photo moment"))
    expect(photo?.images).toEqual(["https://example.com/a.jpg"])
    const textOnly = updates.find((u) => u.body.includes("text only memo"))
    expect(textOnly?.images).toEqual([])
  })

  it("loadContentGraph builds postsBySlug and reuses fingerprint cache", () => {
    const root = makeTempContentRoot()
    const postsDir = path.join(root, "posts")
    fs.writeFileSync(
      path.join(postsDir, "a.md"),
      `---
title: Alpha
slug: alpha
date: 2026-07-01
published: true
---

alpha body
`,
    )

    const g1 = loadContentGraph(root)
    const g2 = loadContentGraph(root)
    expect(g1).toBe(g2)
    expect(g1.postsBySlug.get("alpha")?.title).toBe("Alpha")
    expect(getPostBySlug("alpha", root)?.title).toBe("Alpha")
  })

  it("invalidates graph cache when a file changes", () => {
    const root = makeTempContentRoot()
    const postsDir = path.join(root, "posts")
    const file = path.join(postsDir, "a.md")
    fs.writeFileSync(
      file,
      `---
title: Before
slug: alpha
date: 2026-07-01
published: true
---

before
`,
    )

    expect(getPostBySlug("alpha", root)?.title).toBe("Before")

    // ensure mtime advances on fast FS
    const past = new Date(Date.now() + 2000)
    fs.writeFileSync(
      file,
      `---
title: After
slug: alpha
date: 2026-07-01
published: true
---

after
`,
    )
    fs.utimesSync(file, past, past)

    expect(getPostBySlug("alpha", root)?.title).toBe("After")
  })

  it("loads the private production snapshot before scanning content", () => {
    const root = makeTempContentRoot()
    const base = path.dirname(root)
    writePost(root, "snapshot.md", {
      title: "Snapshot",
      slug: "snapshot",
    })
    vi.stubEnv("SHOW_DRAFTS", "0")

    const liveGraph = loadContentGraph(root, { preferSnapshot: false })
    const snapshotPath = path.join(base, GRAPH_OUTPUT_RELATIVE_PATH)
    fs.mkdirSync(path.dirname(snapshotPath), { recursive: true })
    fs.writeFileSync(snapshotPath, serializeContentGraph(liveGraph))

    clearContentGraphCache()
    clearMarkdownFileCache()
    clearCacheMeta(root)
    fs.rmSync(root, { recursive: true, force: true })
    vi.spyOn(process, "cwd").mockReturnValue(base)
    vi.stubEnv("NODE_ENV", "production")

    const graph = loadContentGraph(path.join(base, "content"))
    expect(graph.posts.map((post) => post.slug)).toEqual(["snapshot"])
    expect(fs.existsSync(path.join(base, ".content-cache"))).toBe(false)
  })

  it("does not use the default production snapshot for a custom root", () => {
    const defaultRoot = makeTempContentRoot()
    const base = path.dirname(defaultRoot)
    writePost(defaultRoot, "default.md", {
      title: "Default",
      slug: "default",
    })
    vi.stubEnv("SHOW_DRAFTS", "0")
    const defaultGraph = loadContentGraph(defaultRoot, {
      preferSnapshot: false,
    })
    const snapshotPath = path.join(base, GRAPH_OUTPUT_RELATIVE_PATH)
    fs.mkdirSync(path.dirname(snapshotPath), { recursive: true })
    fs.writeFileSync(snapshotPath, serializeContentGraph(defaultGraph))

    const customRoot = path.join(base, "custom-content")
    writePost(customRoot, "sentinel.md", {
      title: "Sentinel",
      slug: "sentinel",
    })
    clearContentGraphCache()
    clearMarkdownFileCache()
    clearCacheMeta(customRoot)
    vi.spyOn(process, "cwd").mockReturnValue(base)
    vi.stubEnv("NODE_ENV", "production")

    const graph = loadContentGraph(customRoot)
    expect(graph.posts.map((post) => post.slug)).toEqual(["sentinel"])
  })

  it("can force a live rebuild when a production snapshot exists", () => {
    const root = makeTempContentRoot()
    const base = path.dirname(root)
    const file = writePost(root, "post.md", {
      title: "Stale",
      slug: "post",
    })
    vi.stubEnv("SHOW_DRAFTS", "0")
    const staleGraph = loadContentGraph(root, { preferSnapshot: false })
    const snapshotPath = path.join(base, GRAPH_OUTPUT_RELATIVE_PATH)
    fs.mkdirSync(path.dirname(snapshotPath), { recursive: true })
    fs.writeFileSync(snapshotPath, serializeContentGraph(staleGraph))

    writePost(root, "post.md", {
      title: "Fresh",
      slug: "post",
    })
    const future = new Date(Date.now() + 2000)
    fs.utimesSync(file, future, future)
    clearContentGraphCache()
    clearMarkdownFileCache()
    vi.spyOn(process, "cwd").mockReturnValue(base)
    vi.stubEnv("NODE_ENV", "production")

    expect(
      loadContentGraph(root, { preferSnapshot: false }).posts[0]?.title,
    ).toBe("Fresh")
  })

  it("continues when fingerprint metadata cannot be written", () => {
    const root = makeTempContentRoot()
    writePost(root, "post.md", {
      title: "Read only",
      slug: "read-only",
    })
    clearCacheMeta(root)
    vi.spyOn(fs, "writeFileSync").mockImplementationOnce(() => {
      throw Object.assign(new Error("read only"), { code: "EROFS" })
    })

    expect(() => contentFingerprint(root)).not.toThrow()
  })

  it("extractMarkdownImages preserves order and uniques", () => {
    expect(
      extractMarkdownImages(
        "![a](https://a.com/1.jpg)![b](https://a.com/2.jpg)![c](https://a.com/1.jpg)",
      ),
    ).toEqual(["https://a.com/1.jpg", "https://a.com/2.jpg"])
  })

  it("extracts Wiki links without changing slug case or nested paths", () => {
    const markdown = [
      "[[Folder/My Note.md#Heading|Alias]]",
      "[[CaseSensitive.mdx]]",
      "[[#local-heading]]",
      "![[embed.png]]",
      "`[[inline-code]]`",
      "```md",
      "[[fenced-code]]",
      "```",
    ].join("\n")

    expect(extractWikilinks(markdown)).toEqual([
      "Folder/My-Note",
      "CaseSensitive",
    ])
  })

  it("builds backlinks without duplicates or self references", () => {
    const root = makeTempContentRoot()
    writePost(root, "Folder/My Note.md", {
      title: "Target",
      body: "[[Folder/My Note]]",
    })
    writePost(root, "Source.md", {
      title: "Source",
      slug: "SourceNote",
      body: [
        "[[Folder/My Note.md#Details]]",
        "[[Folder/My Note|Again]]",
        "`[[Folder/My Note]]`",
      ].join("\n"),
    })

    expect(getPostBySlug("Folder/My-Note", root)?.backlinks).toEqual([
      { slug: "SourceNote", title: "Source" },
    ])
    expect(getPostBySlug("SourceNote", root)?.body).toContain(
      "[[Folder/My Note.md#Details]]",
    )
  })

  it("normalizes explicit post slugs consistently with Wiki links", () => {
    const root = makeTempContentRoot()
    writePost(root, "target.md", {
      title: "Target",
      slug: "Folder/Custom Note.md",
    })
    writePost(root, "source.md", {
      title: "Source",
      body: "[[Folder/Custom Note.md]]",
    })

    expect(getPostBySlug("Folder/Custom-Note", root)?.backlinks).toEqual([
      { slug: "source", title: "Source" },
    ])
  })

  it("getTimelineEntries uses one graph (posts + updates + glimpses)", () => {
    const root = makeTempContentRoot()
    fs.writeFileSync(
      path.join(root, "posts", "p.md"),
      `---
title: Post
slug: p1
date: 2026-07-10
published: true
---

hi
`,
    )
    fs.mkdirSync(path.join(root, "updates"), { recursive: true })
    fs.writeFileSync(
      path.join(root, "updates", "u.md"),
      `---
date: 2026-07-11
published: true
---

update body
`,
    )
    fs.mkdirSync(path.join(root, "glimpses"), { recursive: true })
    fs.writeFileSync(
      path.join(root, "glimpses", "g.md"),
      `---
date: 2026-07-12
caption: shot
images:
  - https://example.com/x.jpg
published: true
---
`,
    )

    const entries = getTimelineEntries(root)
    expect(entries.some((e) => e.kind === "post" && e.title === "Post")).toBe(
      true,
    )
    expect(entries.some((e) => e.kind === "update")).toBe(true)
    expect(entries.some((e) => e.kind === "glimpse" && e.title === "shot")).toBe(
      true,
    )
  })
})
