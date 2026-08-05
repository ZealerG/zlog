/**
 * Content lint for the markdown graph.
 * Run: pnpm content:check
 *
 * Fails on errors; warnings print but exit 0 unless --strict.
 */
import fs from "node:fs"
import path from "node:path"
import {
  clearContentGraphCache,
  loadContentGraph,
} from "../src/lib/content/load"
import {
  clearMarkdownFileCache,
  listMarkdownFiles,
  readMarkdownFile,
} from "../src/lib/content/parse"
import { defaultContentRoot } from "../src/lib/content/paths"

type Issue = { level: "error" | "warn"; file: string; message: string }

const strict = process.argv.includes("--strict")
const contentRoot = defaultContentRoot()

const issues: Issue[] = []

function rel(filePath: string) {
  return path.relative(process.cwd(), filePath) || filePath
}

function push(level: Issue["level"], file: string, message: string) {
  issues.push({ level, file: rel(file), message })
}

function checkSiteJson() {
  const sitePath = path.join(contentRoot, "site.json")
  if (!fs.existsSync(sitePath)) {
    push("error", sitePath, "missing content/site.json")
    return
  }
  try {
    const site = JSON.parse(fs.readFileSync(sitePath, "utf8")) as {
      name?: string
      title?: string
      nav?: unknown
    }
    if (!site.name?.trim()) push("error", sitePath, "site.name is required")
    if (!site.title?.trim()) push("error", sitePath, "site.title is required")
    if (!Array.isArray(site.nav) || site.nav.length === 0) {
      push("warn", sitePath, "site.nav is empty")
    }
  } catch (e) {
    push("error", sitePath, `invalid JSON: ${e instanceof Error ? e.message : e}`)
  }
}

function checkWikiAttachments(filePath: string, body: string) {
  const wikiImages = body.match(/!\[\[([^\]]+)\]\]/g) ?? []
  for (const m of wikiImages) {
    push(
      "warn",
      filePath,
      `local Obsidian attachment not published for web: ${m}`,
    )
  }
}

function checkRawPosts() {
  const postsDir = path.join(contentRoot, "posts")
  const files = listMarkdownFiles(postsDir)
  const slugs = new Map<string, string>()

  for (const filePath of files) {
    const { data, content } = readMarkdownFile(filePath)
    const title = typeof data.title === "string" ? data.title.trim() : ""
    const date = data.date
    const slug =
      typeof data.slug === "string" && data.slug.trim()
        ? data.slug.trim()
        : path
            .relative(postsDir, filePath)
            .replace(/\\/g, "/")
            .replace(/\.mdx?$/i, "")

    if (!title) push("error", filePath, "post missing title")
    if (date == null || date === "") push("error", filePath, "post missing date")

    const prev = slugs.get(slug)
    if (prev) {
      push("error", filePath, `duplicate post slug "${slug}" (also ${rel(prev)})`)
    } else {
      slugs.set(slug, filePath)
    }

    checkWikiAttachments(filePath, content)
  }
}

function checkUpdatesAndGlimpses() {
  for (const kind of ["updates", "glimpses"] as const) {
    const dir = path.join(contentRoot, kind)
    for (const filePath of listMarkdownFiles(dir)) {
      const { data, content } = readMarkdownFile(filePath)
      const isMemo = /^##\s+\d{4}-\d{2}-\d{2}/m.test(content)
      if (!isMemo && kind === "updates" && (data.date == null || data.date === "")) {
        push("error", filePath, "update missing date")
      }
      if (
        !isMemo &&
        kind === "glimpses" &&
        (data.date == null || data.date === "")
      ) {
        push("error", filePath, "glimpse missing date")
      }
      checkWikiAttachments(filePath, content)
    }
  }
}

function checkGraphLoads() {
  try {
    clearContentGraphCache()
    clearMarkdownFileCache()
    const graph = loadContentGraph(contentRoot, { preferSnapshot: false })
    if (graph.posts.length === 0) {
      push("warn", contentRoot, "no visible posts (check drafts / SHOW_DRAFTS)")
    }
    for (const post of graph.posts) {
      for (const target of post.wikilinks ?? []) {
        if (!graph.postsBySlug.has(target)) {
          push("warn", post.filePath, `Wiki-link target is not published: ${target}`)
        }
      }
    }
    // update slugs uniqueness already asserted in loadContentGraph
    const updateSlugs = new Set(graph.updates.map((u) => u.slug))
    if (updateSlugs.size !== graph.updates.length) {
      push("error", contentRoot, "duplicate update slugs in graph")
    }
  } catch (e) {
    push(
      "error",
      contentRoot,
      `content graph failed: ${e instanceof Error ? e.message : e}`,
    )
  }
}

checkSiteJson()
checkRawPosts()
checkUpdatesAndGlimpses()
checkGraphLoads()

const errors = issues.filter((i) => i.level === "error")
const warns = issues.filter((i) => i.level === "warn")

for (const i of issues) {
  const tag = i.level === "error" ? "ERROR" : "WARN "
  console.log(`${tag}  ${i.file}\n       ${i.message}`)
}

console.log(
  `\ncontent:check — ${errors.length} error(s), ${warns.length} warning(s)`,
)

if (errors.length > 0 || (strict && warns.length > 0)) {
  process.exit(1)
}
