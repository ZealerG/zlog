import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import remarkParse from "remark-parse"
import { unified } from "unified"
import { visit } from "unist-util-visit"
import type {
  Bookmark,
  Friend,
  Glimpse,
  PageDoc,
  Post,
  Project,
  Update,
} from "./types"
import { parseContentDate } from "@/lib/datetime"
import {
  matchWikilinks,
  normalizeSlugPath,
  parseWikilinkTarget,
} from "./wikilink"

type ParsedMarkdownFile = ReturnType<typeof matter>

type MarkdownFileCacheEntry = {
  mtimeMs: number
  ctimeMs: number
  size: number
  result: ParsedMarkdownFile
}

/** Process-local stat cache — parse once per file revision. */
const markdownFileCache = new Map<string, MarkdownFileCacheEntry>()

export function clearMarkdownFileCache() {
  markdownFileCache.clear()
}

export function readMarkdownFile(filePath: string): ParsedMarkdownFile {
  const stat = fs.statSync(/* turbopackIgnore: true */ filePath)
  const hit = markdownFileCache.get(filePath)
  if (
    hit &&
    hit.mtimeMs === stat.mtimeMs &&
    hit.ctimeMs === stat.ctimeMs &&
    hit.size === stat.size
  ) {
    return hit.result
  }

  let raw = fs.readFileSync(/* turbopackIgnore: true */ filePath, "utf8")
  // strip BOM + leading blank lines so Obsidian exports still parse
  raw = raw.replace(/^\uFEFF/, "").replace(/^\s+/, "")
  const result = matter(raw)
  markdownFileCache.set(filePath, {
    mtimeMs: stat.mtimeMs,
    ctimeMs: stat.ctimeMs,
    size: stat.size,
    result,
  })
  return result
}

/** Normalize frontmatter dates; naive values are Asia/Shanghai wall time. */
function normalizeDate(value: unknown): string | null {
  return parseContentDate(value)
}

function slugFromRelative(relativePath: string): string {
  return normalizeSlugPath(relativePath)
}

function asStringArray(value: unknown): string[] {
  if (typeof value === "string" && value.trim()) {
    return value
      .split(/[,，]/)
      .map((s) => s.trim())
      .filter(Boolean)
  }
  if (!Array.isArray(value)) return []
  return value
    .map((v) => (typeof v === "string" ? v : v == null ? "" : String(v)))
    .map((v) => v.trim())
    .filter(Boolean)
}

function firstCategory(data: Record<string, unknown>): string | undefined {
  if (typeof data.category === "string" && data.category.trim()) {
    return data.category.trim()
  }
  if (typeof data.categories === "string" && data.categories.trim()) {
    return data.categories.trim()
  }
  if (Array.isArray(data.categories)) {
    const first = data.categories.find((c) => typeof c === "string" && c.trim())
    return typeof first === "string" ? first.trim() : undefined
  }
  return undefined
}

/** Obsidian/Hexo: draft:true hides; published:false hides; default publish when neither set. */
export function resolvePublished(data: Record<string, unknown>): boolean {
  if (typeof data.published === "boolean") return data.published
  if (typeof data.draft === "boolean") return !data.draft
  return true
}

function resolveSummary(data: Record<string, unknown>): string | undefined {
  if (typeof data.summary === "string" && data.summary.trim()) {
    return data.summary.trim()
  }
  if (typeof data.description === "string" && data.description.trim()) {
    return data.description.trim()
  }
  return undefined
}

/** Light Obsidian cleanup for web rendering. */
export function normalizeMarkdownBody(body: string): string {
  return body
    .replace(/!\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, (_m, name: string) => {
      const file = String(name).trim()
      return `*[本地附件未发布: ${file}]*`
    })
    .replace(/<aside>\s*💡?/gi, "> ")
    .replace(/<\/aside>/gi, "")
    .trim()
}

/** Extract remote image URLs from markdown image syntax (order preserved, unique). */
export function extractMarkdownImages(body: string): string[] {
  const urls = Array.from(
    body.matchAll(/!\[[^\]]*\]\((https?:[^)\s]+)\)/g),
  ).map((match) => match[1])
  return [...new Set(urls)]
}

/** Extract Wiki-link targets from Markdown text nodes, excluding code and embeds. */
export function extractWikilinks(body: string): string[] {
  const targets = new Set<string>()
  const tree = unified().use(remarkParse).parse(body)

  visit(tree, "text", (node) => {
    for (const match of matchWikilinks(node.value)) {
      const target = parseWikilinkTarget(match[1])
      if (target?.slug) targets.add(target.slug)
    }
  })

  return [...targets]
}

export function parsePost(
  filePath: string,
  relativePath: string,
): Post | null {
  const { data, content } = readMarkdownFile(filePath)
  const title = typeof data.title === "string" ? data.title.trim() : null
  const date = normalizeDate(data.date)
  const published = resolvePublished(data as Record<string, unknown>)

  if (!title || !date) {
    console.warn(`[content] skip invalid post: ${filePath}`)
    return null
  }

  const explicitSlug = typeof data.slug === "string" ? data.slug.trim() : ""
  const slug = explicitSlug
    ? normalizeSlugPath(explicitSlug)
    : slugFromRelative(relativePath)

  return {
    title,
    slug,
    date,
    updated: normalizeDate(data.updated) ?? undefined,
    category: firstCategory(data as Record<string, unknown>),
    tags: asStringArray(data.tags),
    summary: resolveSummary(data as Record<string, unknown>),
    cover: typeof data.cover === "string" ? data.cover : undefined,
    published,
    body: normalizeMarkdownBody(content),
    filePath,
    wikilinks: extractWikilinks(content),
  }
}

export function parseUpdate(
  filePath: string,
  relativePath: string,
): Update | null {
  const { data, content } = readMarkdownFile(filePath)
  const date = normalizeDate(data.date)
  const published = resolvePublished(data as Record<string, unknown>)

  if (!date) {
    console.warn(`[content] skip invalid update: ${filePath}`)
    return null
  }

  const slug =
    typeof data.slug === "string" && data.slug.length > 0
      ? data.slug
      : slugFromRelative(relativePath)

  const body = normalizeMarkdownBody(content)
  return {
    date,
    published,
    body,
    images: extractMarkdownImages(body),
    slug,
    filePath,
  }
}

type MemoPart = {
  date: string
  slug: string
  body: string
  images: string[]
}

function extractMemoParts(
  filePath: string,
  relativePath: string,
): MemoPart[] {
  const { data, content } = readMarkdownFile(filePath)
  if (resolvePublished(data as Record<string, unknown>) === false) return []

  const baseSlug = slugFromRelative(relativePath)
  const body = normalizeMarkdownBody(content)
  const parts = body.split(/^##\s+/m).map((s) => s.trim()).filter(Boolean)
  const out: MemoPart[] = []

  for (const part of parts) {
    const nl = part.indexOf("\n")
    const heading = (nl === -1 ? part : part.slice(0, nl)).trim()
    const rest = nl === -1 ? "" : part.slice(nl + 1).trim()
    const m = heading.match(
      /^(\d{4}-\d{2}-\d{2})(?:\s+(\d{1,2}:\d{2}(?::\d{2})?))?/,
    )
    if (!m) continue
    const dateStr = m[2]
      ? `${m[1]}T${m[2].length === 5 ? `${m[2]}:00` : m[2]}`
      : m[1]
    const date = normalizeDate(dateStr)
    if (!date) continue
    const slug = `${baseSlug}-${m[1].replace(/-/g, "")}-${(m[2] ?? "0000").replace(/:/g, "")}`
    const text = rest || heading
    out.push({ date, slug, body: text, images: extractMarkdownImages(text) })
  }

  if (out.length === 0) {
    const date = normalizeDate(data.date)
    if (date) {
      out.push({
        date,
        slug: baseSlug,
        body,
        images: extractMarkdownImages(body),
      })
    }
  }

  return out
}

/** Split a memo dump (## YYYY-MM-DD ...) into ALL update entries (text + image). */
export function parseMemoDump(
  filePath: string,
  relativePath: string,
): Update[] {
  return extractMemoParts(filePath, relativePath).map((part) => ({
    date: part.date,
    published: true,
    body: part.body,
    images: part.images,
    slug: part.slug,
    filePath,
  }))
}

export function parseGlimpse(
  filePath: string,
  relativePath: string,
): Glimpse | null {
  const { data, content } = readMarkdownFile(filePath)
  const date = normalizeDate(data.date)
  const published = resolvePublished(data as Record<string, unknown>)

  if (!date) {
    console.warn(`[content] skip invalid glimpse: ${filePath}`)
    return null
  }

  // multi-memo dumps belong in updates pipeline, not as a single glimpse card
  if (/^##\s+\d{4}-\d{2}-\d{2}/m.test(content)) {
    return null
  }

  const slug =
    typeof data.slug === "string" && data.slug.length > 0
      ? data.slug
      : slugFromRelative(relativePath)

  const body = normalizeMarkdownBody(content)
  const images = [
    ...new Set([...asStringArray(data.images), ...extractMarkdownImages(body)]),
  ]
  // 拾光 only keeps visual moments
  if (images.length === 0) {
    return null
  }

  return {
    date,
    caption:
      typeof data.caption === "string"
        ? data.caption
        : typeof data.title === "string"
          ? data.title
          : undefined,
    images,
    published,
    body,
    filePath: filePath,
    slug,
  }
}

export function parsePage(
  filePath: string,
  relativePath: string,
): PageDoc | null {
  const { data, content } = readMarkdownFile(filePath)
  const title = typeof data.title === "string" ? data.title.trim() : null
  const published = resolvePublished(data as Record<string, unknown>)

  if (!title) {
    console.warn(`[content] skip invalid page: ${filePath}`)
    return null
  }

  const slug =
    typeof data.slug === "string" && data.slug.length > 0
      ? data.slug
      : slugFromRelative(relativePath)

  const order =
    typeof data.order === "number" && Number.isFinite(data.order)
      ? data.order
      : 0

  return {
    title,
    slug,
    order,
    published,
    body: normalizeMarkdownBody(content),
    filePath,
  }
}

function optionalUrl(data: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const v = data[key]
    if (typeof v === "string" && v.trim()) return v.trim()
  }
  return undefined
}

function orderOf(data: Record<string, unknown>): number {
  return typeof data.order === "number" && Number.isFinite(data.order)
    ? data.order
    : 0
}

export function parseProject(
  filePath: string,
  relativePath: string,
): Project | null {
  const { data, content } = readMarkdownFile(filePath)
  const title = typeof data.title === "string" ? data.title.trim() : null
  if (!title) {
    console.warn(`[content] skip invalid project: ${filePath}`)
    return null
  }
  const slug =
    typeof data.slug === "string" && data.slug.length > 0
      ? data.slug
      : slugFromRelative(relativePath)
  return {
    title,
    slug,
    url: optionalUrl(data as Record<string, unknown>, ["url", "link", "repo"]),
    description:
      typeof data.description === "string"
        ? data.description
        : typeof data.summary === "string"
          ? data.summary
          : undefined,
    status: typeof data.status === "string" ? data.status : undefined,
    cover: typeof data.cover === "string" ? data.cover : undefined,
    tags: asStringArray(data.tags),
    order: orderOf(data as Record<string, unknown>),
    published: resolvePublished(data as Record<string, unknown>),
    body: normalizeMarkdownBody(content),
    filePath,
  }
}

export function parseFriend(
  filePath: string,
  relativePath: string,
): Friend | null {
  const { data } = readMarkdownFile(filePath)
  const title = typeof data.title === "string" ? data.title.trim() : null
  const url = optionalUrl(data as Record<string, unknown>, ["url", "link", "href"])
  if (!title || !url) {
    console.warn(`[content] skip invalid friend: ${filePath}`)
    return null
  }
  const slug =
    typeof data.slug === "string" && data.slug.length > 0
      ? data.slug
      : slugFromRelative(relativePath)
  return {
    title,
    slug,
    url,
    avatar:
      typeof data.avatar === "string"
        ? data.avatar
        : typeof data.image === "string"
          ? data.image
          : undefined,
    description:
      typeof data.description === "string"
        ? data.description
        : typeof data.bio === "string"
          ? data.bio
          : undefined,
    order: orderOf(data as Record<string, unknown>),
    published: resolvePublished(data as Record<string, unknown>),
    filePath,
  }
}

export function parseBookmark(
  filePath: string,
  relativePath: string,
): Bookmark | null {
  const { data } = readMarkdownFile(filePath)
  const title = typeof data.title === "string" ? data.title.trim() : null
  const url = optionalUrl(data as Record<string, unknown>, ["url", "link", "href"])
  if (!title || !url) {
    console.warn(`[content] skip invalid bookmark: ${filePath}`)
    return null
  }
  const slug =
    typeof data.slug === "string" && data.slug.length > 0
      ? data.slug
      : slugFromRelative(relativePath)
  return {
    title,
    slug,
    url,
    description:
      typeof data.description === "string"
        ? data.description
        : typeof data.summary === "string"
          ? data.summary
          : undefined,
    category:
      typeof data.category === "string"
        ? data.category
        : typeof data.categories === "string"
          ? data.categories
          : undefined,
    type: typeof data.type === "string" ? data.type : "Link",
    order: orderOf(data as Record<string, unknown>),
    published: resolvePublished(data as Record<string, unknown>),
    filePath,
  }
}

export function assertNoDuplicateSlugs(
  items: { slug: string; filePath: string }[],
  kind: string,
) {
  const seen = new Map<string, string>()
  for (const item of items) {
    const prev = seen.get(item.slug)
    if (prev) {
      throw new Error(
        `Duplicate ${kind} slug "${item.slug}": ${prev} and ${item.filePath}`,
      )
    }
    seen.set(item.slug, item.filePath)
  }
}

export function listMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(/* turbopackIgnore: true */ dir)) return []
  const results: string[] = []

  function walk(current: string) {
    for (const entry of fs.readdirSync(
      /* turbopackIgnore: true */ current,
      { withFileTypes: true },
    )) {
      if (entry.name.startsWith(".")) continue
      const full = path.join(/* turbopackIgnore: true */ current, entry.name)
      if (entry.isDirectory()) {
        walk(full)
      } else if (entry.isFile() && /\.mdx?$/i.test(entry.name)) {
        results.push(full)
      }
    }
  }

  walk(dir)
  return results
}
