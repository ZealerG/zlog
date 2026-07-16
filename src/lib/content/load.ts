import path from "node:path"
import type {
  Bookmark,
  Friend,
  Glimpse,
  PageDoc,
  Post,
  Project,
  Update,
} from "./types"
import { defaultContentRoot } from "./paths"
import {
  assertNoDuplicateSlugs,
  listMarkdownFiles,
  parseBookmark,
  parseFriend,
  parseGlimpse,
  parseMemoDump,
  parsePage,
  parsePost,
  parseProject,
  parseUpdate,
  readMarkdownFile,
} from "./parse"
import { plainTextSnippet } from "./plain-text"

function relativeSlugPath(filePath: string, kindDir: string): string {
  return path.relative(kindDir, filePath)
}

function isMemoDumpFile(filePath: string): boolean {
  try {
    const { content } = readMarkdownFile(filePath)
    return /^##\s+\d{4}-\d{2}-\d{2}/m.test(content)
  } catch {
    return false
  }
}

/**
 * Show drafts when:
 * - `SHOW_DRAFTS=1` (explicit), or
 * - running `next dev` (`NODE_ENV=development`)
 * Production build / tests hide drafts by default.
 */
export function includeDrafts(): boolean {
  if (process.env.SHOW_DRAFTS === "1" || process.env.SHOW_DRAFTS === "true") {
    return true
  }
  if (process.env.SHOW_DRAFTS === "0" || process.env.SHOW_DRAFTS === "false") {
    return false
  }
  return process.env.NODE_ENV === "development"
}

function isVisible(published: boolean): boolean {
  return published === true || includeDrafts()
}

export function getAllPosts(contentRoot = defaultContentRoot()): Post[] {
  const kindDir = path.join(contentRoot, "posts")
  const files = listMarkdownFiles(kindDir)
  const posts = files
    .map((filePath) => parsePost(filePath, relativeSlugPath(filePath, kindDir)))
    .filter((p): p is Post => p !== null)

  assertNoDuplicateSlugs(posts, "post")

  return posts
    .filter((p) => isVisible(p.published))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}

export function getPostBySlug(
  slug: string,
  contentRoot = defaultContentRoot(),
): Post | undefined {
  return getAllPosts(contentRoot).find((p) => p.slug === slug)
}

/** 足迹：全部 memo（含图文）+ updates 目录短动态 */
export function getAllUpdates(contentRoot = defaultContentRoot()): Update[] {
  const updatesDir = path.join(contentRoot, "updates")
  const glimpsesDir = path.join(contentRoot, "glimpses")

  const fromUpdates = listMarkdownFiles(updatesDir).flatMap((filePath) => {
    const rel = relativeSlugPath(filePath, updatesDir)
    if (isMemoDumpFile(filePath)) return parseMemoDump(filePath, rel)
    const one = parseUpdate(filePath, rel)
    return one ? [one] : []
  })

  // Obsidian 微语 dump 常放在 glimpses/：全部进足迹
  const fromGlimpses = listMarkdownFiles(glimpsesDir).flatMap((filePath) => {
    if (!isMemoDumpFile(filePath)) return []
    return parseMemoDump(filePath, relativeSlugPath(filePath, glimpsesDir))
  })

  const updates = [...fromUpdates, ...fromGlimpses]
  assertNoDuplicateSlugs(updates, "update")

  return updates
    .filter((u) => isVisible(u.published))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}

/** 独立拾光文件（可选影像补充） */
export function getAllGlimpses(contentRoot = defaultContentRoot()): Glimpse[] {
  const kindDir = path.join(contentRoot, "glimpses")
  const files = listMarkdownFiles(kindDir)
  const glimpses = files
    .filter((filePath) => !isMemoDumpFile(filePath))
    .map((filePath) =>
      parseGlimpse(filePath, relativeSlugPath(filePath, kindDir)),
    )
    .filter((g): g is Glimpse => g !== null)

  assertNoDuplicateSlugs(glimpses, "glimpse")

  return glimpses
    .filter((g) => isVisible(g.published) && g.images.length > 0)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}

export type TimelineEntry = {
  kind: "post" | "update" | "glimpse"
  date: string
  title: string
  summary?: string
  href: string
  images?: string[]
  draft?: boolean
}

/** 拾光时间线 = 篇章 + 足迹（+ 可选独立影像） */
export function getTimelineEntries(
  contentRoot = defaultContentRoot(),
): TimelineEntry[] {
  const posts = getAllPosts(contentRoot).map((p) => ({
    kind: "post" as const,
    date: p.date,
    title: p.title,
    summary: p.summary,
    href: `/posts/${p.slug}`,
    draft: !p.published,
  }))

  const updates = getAllUpdates(contentRoot).map((u) => {
    const images = Array.from(
      u.body.matchAll(/!\[[^\]]*\]\((https?:[^)\s]+)\)/g),
    ).map((m) => m[1])
    const text = plainTextSnippet(u.body, 160)
    return {
      kind: "update" as const,
      date: u.date,
      title: plainTextSnippet(u.body, 72) || "动态",
      summary: text || undefined,
      href: `/updates#${u.slug}`,
      images: images.length ? images : undefined,
    }
  })

  const glimpses = getAllGlimpses(contentRoot).map((g) => ({
    kind: "glimpse" as const,
    date: g.date,
    title: g.caption || "拾光",
    summary: g.body?.slice(0, 120),
    href: `/timeline#${g.slug}`,
    images: g.images,
  }))

  return [...posts, ...updates, ...glimpses].sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : 0,
  )
}

export function getAllPages(contentRoot = defaultContentRoot()): PageDoc[] {
  const kindDir = path.join(contentRoot, "pages")
  const files = listMarkdownFiles(kindDir)
  const pages = files
    .map((filePath) => parsePage(filePath, relativeSlugPath(filePath, kindDir)))
    .filter((p): p is PageDoc => p !== null)

  assertNoDuplicateSlugs(pages, "page")

  return pages
    .filter((p) => isVisible(p.published))
    .sort((a, b) => a.order - b.order)
}

export function getAllProjects(contentRoot = defaultContentRoot()): Project[] {
  const kindDir = path.join(contentRoot, "projects")
  const files = listMarkdownFiles(kindDir)
  const items = files
    .map((filePath) =>
      parseProject(filePath, relativeSlugPath(filePath, kindDir)),
    )
    .filter((p): p is Project => p !== null)
  assertNoDuplicateSlugs(items, "project")
  return items
    .filter((p) => isVisible(p.published))
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
}

export function getAllFriends(contentRoot = defaultContentRoot()): Friend[] {
  const kindDir = path.join(contentRoot, "friends")
  const files = listMarkdownFiles(kindDir)
  const items = files
    .map((filePath) =>
      parseFriend(filePath, relativeSlugPath(filePath, kindDir)),
    )
    .filter((p): p is Friend => p !== null)
  assertNoDuplicateSlugs(items, "friend")
  return items
    .filter((p) => isVisible(p.published))
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
}

export function getAllBookmarks(
  contentRoot = defaultContentRoot(),
): Bookmark[] {
  const kindDir = path.join(contentRoot, "bookmarks")
  const files = listMarkdownFiles(kindDir)
  const items = files
    .map((filePath) =>
      parseBookmark(filePath, relativeSlugPath(filePath, kindDir)),
    )
    .filter((p): p is Bookmark => p !== null)
  assertNoDuplicateSlugs(items, "bookmark")
  return items
    .filter((p) => isVisible(p.published))
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
}

export function getBookmarksByCategory(
  contentRoot = defaultContentRoot(),
): { category: string; items: Bookmark[] }[] {
  const all = getAllBookmarks(contentRoot)
  const map = new Map<string, Bookmark[]>()
  for (const b of all) {
    const cat = b.category?.trim() || "未分类"
    if (!map.has(cat)) map.set(cat, [])
    map.get(cat)!.push(b)
  }
  return [...map.entries()].map(([category, items]) => ({ category, items }))
}
