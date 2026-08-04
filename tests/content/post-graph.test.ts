import { describe, expect, it } from "vitest"
import { buildPostGraph } from "@/lib/content/post-graph"
import type { Post } from "@/lib/content/types"

function post(slug: string, wikilinks: string[] = []): Post {
  return {
    title: `Title ${slug}`,
    slug,
    date: "2026-08-04",
    category: "Notes",
    tags: ["graph"],
    published: true,
    body: "",
    filePath: `/content/posts/${slug}.md`,
    wikilinks,
  }
}

describe("buildPostGraph", () => {
  it("builds stable directed links and node degrees", () => {
    const graph = buildPostGraph([
      post("b", ["a", "a", "b", "missing"]),
      post("a", ["b"]),
      post("c"),
    ])

    expect(graph.links).toEqual([
      { source: "a", target: "b" },
      { source: "b", target: "a" },
    ])
    expect(graph.nodes.map((node) => node.id)).toEqual(["a", "b", "c"])
    expect(graph.nodes.find((node) => node.id === "a")).toMatchObject({
      incoming: 1,
      outgoing: 1,
      degree: 2,
    })
    expect(graph.nodes.find((node) => node.id === "c")).toMatchObject({
      incoming: 0,
      outgoing: 0,
      degree: 0,
    })
  })

  it("preserves nested and case-sensitive slugs", () => {
    const graph = buildPostGraph([
      post("Source", ["Folder/Target"]),
      post("Folder/Target"),
    ])

    expect(graph.links).toEqual([
      { source: "Source", target: "Folder/Target" },
    ])
  })
})
