/**
 * ContentGraph 构建期静态化:序列化 / 反序列化。
 *
 * 核心思路:构建期把完整的 ContentGraph(含正文)固化成一个 JSON 产物,
 * 生产运行时直接读取反序列化,避免每次 serverless 冷启动都全量扫描 + 解析 Markdown。
 *
 * 产物位于私有 `.content-graph/` 目录，并通过 Next output file tracing
 * 打包到服务端运行时；它不会作为 public 静态资源暴露。
 */
import type { ContentGraph } from "./load"
import type {
  Bookmark,
  Friend,
  Glimpse,
  PageDoc,
  Post,
  Project,
  Update,
} from "./types"

export const GRAPH_OUTPUT_RELATIVE_PATH = ".content-graph/content-graph.json"

type SerializedGraph = {
  version: 2
  fingerprint: string
  draftsIncluded: boolean
  posts: Post[]
  updates: Update[]
  glimpses: Glimpse[]
  pages: PageDoc[]
  projects: Project[]
  friends: Friend[]
  bookmarks: Bookmark[]
}

/** ContentGraph → JSON 字符串；postsBySlug 可由 posts 无损重建。 */
export function serializeContentGraph(graph: ContentGraph): string {
  const serialized: SerializedGraph = {
    version: 2,
    fingerprint: graph.fingerprint,
    draftsIncluded: graph.draftsIncluded,
    posts: graph.posts,
    updates: graph.updates,
    glimpses: graph.glimpses,
    pages: graph.pages,
    projects: graph.projects,
    friends: graph.friends,
    bookmarks: graph.bookmarks,
  }
  return JSON.stringify(serialized)
}

/** JSON 字符串 → ContentGraph(Map 重建)。格式不合法时返回 null。 */
export function deserializeContentGraph(
  json: string,
  contentRoot: string,
): ContentGraph | null {
  try {
    const parsed = JSON.parse(json) as Partial<SerializedGraph>
    if (
      parsed.version !== 2 ||
      typeof parsed.fingerprint !== "string" ||
      !parsed.fingerprint ||
      typeof parsed.draftsIncluded !== "boolean" ||
      !Array.isArray(parsed.posts) ||
      !Array.isArray(parsed.updates) ||
      !Array.isArray(parsed.glimpses) ||
      !Array.isArray(parsed.pages) ||
      !Array.isArray(parsed.projects) ||
      !Array.isArray(parsed.friends) ||
      !Array.isArray(parsed.bookmarks)
    ) {
      return null
    }
    const posts = parsed.posts
    return {
      contentRoot,
      fingerprint: parsed.fingerprint,
      draftsIncluded: parsed.draftsIncluded,
      posts,
      postsBySlug: new Map(posts.map((post) => [post.slug, post])),
      updates: parsed.updates,
      glimpses: parsed.glimpses,
      pages: parsed.pages,
      projects: parsed.projects,
      friends: parsed.friends,
      bookmarks: parsed.bookmarks,
    }
  } catch {
    return null
  }
}
