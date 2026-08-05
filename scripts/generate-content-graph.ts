/**
 * 一次内容扫描生成私有 ContentGraph 快照和公开搜索索引。
 *
 * 在 `predev` / `prebuild` 阶段运行:
 * 1. 清空所有模块级缓存
 * 2. 加载完整 ContentGraph
 * 3. 序列化写入私有快照目录和 public/search-index.json
 *
 * 生产环境运行时,load.ts 优先从该产物读取,避免全量扫描。
 */
import fs from "node:fs"
import path from "node:path"
import {
  clearContentGraphCache,
  loadContentGraph,
} from "../src/lib/content/load"
import { clearMarkdownFileCache } from "../src/lib/content/parse"
import { clearCacheMeta } from "../src/lib/content/cache-meta"
import { defaultContentRoot } from "../src/lib/content/paths"
import type { SearchIndexEntry } from "../src/lib/content/search-index"
import {
  GRAPH_OUTPUT_RELATIVE_PATH,
  serializeContentGraph,
} from "../src/lib/content/serialize"

clearContentGraphCache()
clearMarkdownFileCache()
clearCacheMeta(defaultContentRoot())

const contentRoot = defaultContentRoot()
const graph = loadContentGraph(contentRoot, { preferSnapshot: false })

const out = path.join(process.cwd(), GRAPH_OUTPUT_RELATIVE_PATH)
fs.mkdirSync(path.dirname(out), { recursive: true })
fs.writeFileSync(out, serializeContentGraph(graph))

const searchIndex: SearchIndexEntry[] = graph.posts.map((post) => ({
  slug: post.slug,
  title: post.title,
  summary: post.summary ?? "",
  tags: post.tags,
  category: post.category ?? "",
}))
const searchOut = path.join(process.cwd(), "public", "search-index.json")
fs.mkdirSync(path.dirname(searchOut), { recursive: true })
fs.writeFileSync(searchOut, `${JSON.stringify(searchIndex, null, 2)}\n`)

console.log(
  `Wrote content-graph.json (${graph.posts.length} posts, ${graph.updates.length} updates, ${graph.glimpses.length} glimpses, ${graph.pages.length} pages, ${graph.projects.length} projects, ${graph.friends.length} friends, ${graph.bookmarks.length} bookmarks)`,
)
console.log(`Wrote ${searchIndex.length} posts to ${searchOut}`)
