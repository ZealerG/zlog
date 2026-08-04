import { describe, expect, it } from "vitest"
import type { ContentGraph } from "@/lib/content/load"
import {
  deserializeContentGraph,
  serializeContentGraph,
} from "@/lib/content/serialize"
import type { Post } from "@/lib/content/types"

function makeGraph(): ContentGraph {
  const post: Post = {
    title: "Post",
    slug: "Folder/Post",
    date: "2026-08-04T00:00:00.000Z",
    tags: [],
    published: true,
    body: "body",
    filePath: "/build/content/posts/Folder/Post.md",
    wikilinks: [],
  }

  return {
    contentRoot: "/build/content",
    fingerprint: "drafts=0\nposts/Folder/Post.md:1:2",
    draftsIncluded: false,
    posts: [post],
    postsBySlug: new Map([[post.slug, post]]),
    updates: [],
    glimpses: [],
    pages: [],
    projects: [],
    friends: [],
    bookmarks: [],
  }
}

describe("content graph serialization", () => {
  it("round-trips a v2 graph without duplicating postsBySlug", () => {
    const json = serializeContentGraph(makeGraph())
    const raw = JSON.parse(json) as Record<string, unknown>
    expect(raw.version).toBe(2)
    expect(raw).not.toHaveProperty("postsBySlug")

    const graph = deserializeContentGraph(json, "/runtime/content")
    expect(graph?.contentRoot).toBe("/runtime/content")
    expect(graph?.draftsIncluded).toBe(false)
    expect(graph?.postsBySlug.get("Folder/Post")).toBe(graph?.posts[0])
  })

  it("rejects malformed and obsolete snapshots", () => {
    expect(deserializeContentGraph("not json", "/runtime/content")).toBeNull()
    expect(
      deserializeContentGraph(
        JSON.stringify({ ...JSON.parse(serializeContentGraph(makeGraph())), version: 1 }),
        "/runtime/content",
      ),
    ).toBeNull()
  })
})
