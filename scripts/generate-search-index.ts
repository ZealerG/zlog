/**
 * Build public/search-index.json from the same content graph the site uses.
 * predev: SHOW_DRAFTS=1 · prebuild: SHOW_DRAFTS=0
 */
import fs from "node:fs"
import path from "node:path"
import {
  clearContentGraphCache,
  loadContentGraph,
} from "../src/lib/content/load"
import { clearMarkdownFileCache } from "../src/lib/content/parse"
import type { SearchIndexEntry } from "../src/lib/content/search-index"

clearContentGraphCache()
clearMarkdownFileCache()

const { posts } = loadContentGraph()
const index: SearchIndexEntry[] = posts.map((p) => ({
  slug: p.slug,
  title: p.title,
  summary: p.summary ?? "",
  tags: p.tags,
  category: p.category ?? "",
}))

const out = path.join(process.cwd(), "public", "search-index.json")
fs.mkdirSync(path.dirname(out), { recursive: true })
fs.writeFileSync(out, `${JSON.stringify(index, null, 2)}\n`)
console.log(
  `Wrote ${index.length} posts to ${out} (SHOW_DRAFTS=${process.env.SHOW_DRAFTS ?? "default"})`,
)
