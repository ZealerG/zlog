/**
 * 构建期生成私有的 .content-graph/content-graph.json。
 *
 * 在 `prebuild` 阶段运行,与 search-index 生成并行:
 * 1. 清空所有模块级缓存
 * 2. 加载完整 ContentGraph
 * 3. 序列化写入私有快照目录
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

console.log(
  `Wrote content-graph.json (${graph.posts.length} posts, ${graph.updates.length} updates, ${graph.glimpses.length} glimpses, ${graph.pages.length} pages, ${graph.projects.length} projects, ${graph.friends.length} friends, ${graph.bookmarks.length} bookmarks)`,
)
