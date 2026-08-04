import fs from "node:fs"
import path from "node:path"
import { cache } from "react"
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
import { computeIncrementalFingerprint } from "./cache-meta"
import {
  GRAPH_OUTPUT_RELATIVE_PATH,
  deserializeContentGraph,
} from "./serialize"
import { perfEnabled } from "@/lib/perf"

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

function isVisible(published: boolean, draftsIncluded: boolean): boolean {
  return published === true || draftsIncluded
}

const CONTENT_KINDS = [
  "posts",
  "updates",
  "glimpses",
  "pages",
  "projects",
  "friends",
  "bookmarks",
] as const

/** Path + mtime + size fingerprint for live content loading.
 * Change detection remains O(n); production snapshots bypass this scan. */
export function contentFingerprint(contentRoot: string): string {
  const allFiles: string[] = []
  for (const kind of CONTENT_KINDS) {
    const dir = path.join(/* turbopackIgnore: true */ contentRoot, kind)
    allFiles.push(...listMarkdownFiles(dir))
  }

  const { fingerprint, changed } = computeIncrementalFingerprint(
    contentRoot,
    allFiles,
  )

  // verbose logging in dev
  if (
    process.env.NODE_ENV === "development" &&
    changed.length > 0 &&
    process.env.DEBUG_CONTENT
  ) {
    for (const f of changed) {
      console.log(`[content] changed: ${path.relative(contentRoot, f)}`)
    }
  }

  return fingerprint
}

export type ContentGraph = {
  contentRoot: string
  fingerprint: string
  draftsIncluded: boolean
  posts: Post[]
  postsBySlug: Map<string, Post>
  updates: Update[]
  glimpses: Glimpse[]
  pages: PageDoc[]
  projects: Project[]
  friends: Friend[]
  bookmarks: Bookmark[]
}

type GraphCacheEntry = {
  fingerprint: string
  graph: ContentGraph
  source: "live" | "snapshot"
}

/** Process-level graph cache keyed by content root. Invalidates via fingerprint. */
const graphCacheByRoot = new Map<string, GraphCacheEntry>()

export function clearContentGraphCache() {
  graphCacheByRoot.clear()
}

function sortByDateDesc<T extends { date: string }>(items: T[]): T[] {
  return [...items].sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : 0,
  )
}

function buildContentGraph(contentRoot: string, fingerprint: string): ContentGraph {
  const perfStart = performance.now()
  const draftsIncluded = includeDrafts()
  const postsDir = path.join(/* turbopackIgnore: true */ contentRoot, "posts")
  const updatesDir = path.join(/* turbopackIgnore: true */ contentRoot, "updates")
  const glimpsesDir = path.join(/* turbopackIgnore: true */ contentRoot, "glimpses")
  const pagesDir = path.join(/* turbopackIgnore: true */ contentRoot, "pages")
  const projectsDir = path.join(/* turbopackIgnore: true */ contentRoot, "projects")
  const friendsDir = path.join(/* turbopackIgnore: true */ contentRoot, "friends")
  const bookmarksDir = path.join(/* turbopackIgnore: true */ contentRoot, "bookmarks")

  // --- posts ---
  const postFiles = listMarkdownFiles(postsDir)
  const postsRaw = postFiles
    .map((filePath) => parsePost(filePath, relativeSlugPath(filePath, postsDir)))
    .filter((p): p is Post => p !== null)
  assertNoDuplicateSlugs(postsRaw, "post")
  const posts = sortByDateDesc(
    postsRaw.filter((p) => isVisible(p.published, draftsIncluded)),
  )
  const postsBySlug = new Map(posts.map((p) => [p.slug, p]))

  // --- build backlinks index ---
  const backlinksIndex = new Map<string, { slug: string; title: string }[]>()
  for (const post of posts) {
    for (const target of post.wikilinks ?? []) {
      if (target === post.slug) continue
      if (!backlinksIndex.has(target)) {
        backlinksIndex.set(target, [])
      }
      backlinksIndex.get(target)!.push({
        slug: post.slug,
        title: post.title,
      })
    }
  }
  for (const post of posts) {
    const refs = backlinksIndex.get(post.slug)
    if (refs && refs.length > 0) {
      post.backlinks = refs.sort((a, b) => a.slug.localeCompare(b.slug))
    }
  }

  // --- updates + glimpses: each directory listed once; memo dumps classified once ---
  const glimpseFiles = listMarkdownFiles(glimpsesDir)
  const updateFiles = listMarkdownFiles(updatesDir)

  const fromUpdates = updateFiles.flatMap((filePath) => {
    const rel = relativeSlugPath(filePath, updatesDir)
    if (isMemoDumpFile(filePath)) return parseMemoDump(filePath, rel)
    const one = parseUpdate(filePath, rel)
    return one ? [one] : []
  })

  const glimpseClassified = glimpseFiles.map((filePath) => ({
    filePath,
    isMemo: isMemoDumpFile(filePath),
  }))

  const fromGlimpsesMemos = glimpseClassified.flatMap(({ filePath, isMemo }) => {
    if (!isMemo) return []
    return parseMemoDump(filePath, relativeSlugPath(filePath, glimpsesDir))
  })

  const updatesRaw = [...fromUpdates, ...fromGlimpsesMemos]
  assertNoDuplicateSlugs(updatesRaw, "update")
  const updates = sortByDateDesc(
    updatesRaw.filter((u) => isVisible(u.published, draftsIncluded)),
  )

  const glimpsesRaw = glimpseClassified
    .filter((x) => !x.isMemo)
    .map(({ filePath }) =>
      parseGlimpse(filePath, relativeSlugPath(filePath, glimpsesDir)),
    )
    .filter((g): g is Glimpse => g !== null)
  assertNoDuplicateSlugs(glimpsesRaw, "glimpse")
  const glimpses = sortByDateDesc(
    glimpsesRaw.filter(
      (g) => isVisible(g.published, draftsIncluded) && g.images.length > 0,
    ),
  )

  // --- other kinds ---
  const pagesRaw = listMarkdownFiles(pagesDir)
    .map((filePath) => parsePage(filePath, relativeSlugPath(filePath, pagesDir)))
    .filter((p): p is PageDoc => p !== null)
  assertNoDuplicateSlugs(pagesRaw, "page")
  const pages = pagesRaw
    .filter((p) => isVisible(p.published, draftsIncluded))
    .sort((a, b) => a.order - b.order)

  const projectsRaw = listMarkdownFiles(projectsDir)
    .map((filePath) =>
      parseProject(filePath, relativeSlugPath(filePath, projectsDir)),
    )
    .filter((p): p is Project => p !== null)
  assertNoDuplicateSlugs(projectsRaw, "project")
  const projects = projectsRaw
    .filter((p) => isVisible(p.published, draftsIncluded))
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))

  const friendsRaw = listMarkdownFiles(friendsDir)
    .map((filePath) =>
      parseFriend(filePath, relativeSlugPath(filePath, friendsDir)),
    )
    .filter((p): p is Friend => p !== null)
  assertNoDuplicateSlugs(friendsRaw, "friend")
  const friends = friendsRaw
    .filter((p) => isVisible(p.published, draftsIncluded))
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))

  const bookmarksRaw = listMarkdownFiles(bookmarksDir)
    .map((filePath) =>
      parseBookmark(filePath, relativeSlugPath(filePath, bookmarksDir)),
    )
    .filter((p): p is Bookmark => p !== null)
  assertNoDuplicateSlugs(bookmarksRaw, "bookmark")
  const bookmarks = bookmarksRaw
    .filter((p) => isVisible(p.published, draftsIncluded))
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))

  const graph = {
    contentRoot,
    fingerprint,
    draftsIncluded,
    posts,
    postsBySlug,
    updates,
    glimpses,
    pages,
    projects,
    friends,
    bookmarks,
  }
  if (perfEnabled()) {
    console.log(
      `[perf] buildContentGraph: ${(performance.now() - perfStart).toFixed(1)}ms`,
    )
  }
  return graph
}

/**
 * Load full content graph once per contentRoot fingerprint.
 * Safe for tests (unique temp roots) and dev (mtime fingerprint invalidates).
 *
 * Production uses the immutable build-time snapshot for the default content
 * root. Set `ZLOG_LIVE_GRAPH=1` or `preferSnapshot: false` for live content.
 */
export type LoadContentGraphOptions = {
  preferSnapshot?: boolean
}

export function loadContentGraph(
  contentRoot = defaultContentRoot(),
  options: LoadContentGraphOptions = {},
): ContentGraph {
  const cacheKey = path.resolve(/* turbopackIgnore: true */ contentRoot)
  const defaultRoot = path.resolve(
    /* turbopackIgnore: true */ defaultContentRoot(),
  )
  const liveGraphRequested =
    process.env.ZLOG_LIVE_GRAPH === "1" ||
    process.env.ZLOG_LIVE_GRAPH === "true"
  const useSnapshot =
    options.preferSnapshot !== false &&
    process.env.NODE_ENV === "production" &&
    !liveGraphRequested &&
    cacheKey === defaultRoot

  if (useSnapshot) {
    const hit = graphCacheByRoot.get(cacheKey)
    if (hit) return hit.graph

    try {
      const snapshotPath = path.join(
        /* turbopackIgnore: true */ process.cwd(),
        GRAPH_OUTPUT_RELATIVE_PATH,
      )
      const json = fs.readFileSync(
        /* turbopackIgnore: true */ snapshotPath,
        "utf8",
      )
      const graph = deserializeContentGraph(json, contentRoot)
      if (graph && graph.draftsIncluded === includeDrafts()) {
        graphCacheByRoot.set(cacheKey, {
          fingerprint: graph.fingerprint,
          graph,
          source: "snapshot",
        })
        return graph
      }
      console.warn(
        "[content] content graph snapshot invalid, falling back to live scan",
      )
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        console.warn(
          "[content] content graph snapshot unreadable, falling back to live scan",
        )
      }
    }
  }

  const fingerprint = contentFingerprint(contentRoot)
  const hit = graphCacheByRoot.get(cacheKey)
  if (
    hit &&
    hit.source === "live" &&
    hit.fingerprint === fingerprint
  ) {
    return hit.graph
  }

  const graph = buildContentGraph(contentRoot, fingerprint)
  graphCacheByRoot.set(cacheKey, { fingerprint, graph, source: "live" })
  return graph
}

/** Request-scoped graph for the default content root (RSC layout + page share one load). */
const getDefaultContentGraph = cache(() => loadContentGraph(defaultContentRoot()))

function resolveGraph(contentRoot?: string): ContentGraph {
  const root = contentRoot ?? defaultContentRoot()
  if (contentRoot === undefined || root === defaultContentRoot()) {
    return getDefaultContentGraph()
  }
  return loadContentGraph(root)
}

export function getAllPosts(contentRoot = defaultContentRoot()): Post[] {
  return resolveGraph(contentRoot).posts
}

export function getPostBySlug(
  slug: string,
  contentRoot = defaultContentRoot(),
): Post | undefined {
  return resolveGraph(contentRoot).postsBySlug.get(slug)
}

/** 足迹：全部 memo（含图文）+ updates 目录短动态 */
export function getAllUpdates(contentRoot = defaultContentRoot()): Update[] {
  return resolveGraph(contentRoot).updates
}

/** 独立拾光文件（可选影像补充） */
export function getAllGlimpses(contentRoot = defaultContentRoot()): Glimpse[] {
  return resolveGraph(contentRoot).glimpses
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
  const { posts, updates, glimpses } = resolveGraph(contentRoot)

  const postEntries = posts.map((p) => ({
    kind: "post" as const,
    date: p.date,
    title: p.title,
    summary: p.summary,
    href: `/posts/${p.slug}`,
    draft: !p.published,
  }))

  const updateEntries = updates.map((u) => {
    const text = plainTextSnippet(u.body, 160)
    return {
      kind: "update" as const,
      date: u.date,
      title: plainTextSnippet(u.body, 72) || "动态",
      summary: text || undefined,
      href: `/updates#${u.slug}`,
      images: u.images.length ? u.images : undefined,
    }
  })

  const glimpseEntries = glimpses.map((g) => ({
    kind: "glimpse" as const,
    date: g.date,
    title: g.caption || "拾光",
    summary: g.body?.slice(0, 120),
    href: `/timeline#${g.slug}`,
    images: g.images,
  }))

  return [...postEntries, ...updateEntries, ...glimpseEntries].sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : 0,
  )
}

export function getAllPages(contentRoot = defaultContentRoot()): PageDoc[] {
  return resolveGraph(contentRoot).pages
}

export function getAllProjects(contentRoot = defaultContentRoot()): Project[] {
  return resolveGraph(contentRoot).projects
}

export function getAllFriends(contentRoot = defaultContentRoot()): Friend[] {
  return resolveGraph(contentRoot).friends
}

export function getAllBookmarks(
  contentRoot = defaultContentRoot(),
): Bookmark[] {
  return resolveGraph(contentRoot).bookmarks
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
