import type { Post } from "./types"

export type PostGraphNode = {
  id: string
  title: string
  category: string | null
  tags: string[]
  date: string
  incoming: number
  outgoing: number
  degree: number
}

export type PostGraphLink = {
  source: string
  target: string
}

export type PostGraphData = {
  nodes: PostGraphNode[]
  links: PostGraphLink[]
}

export function buildPostGraph(posts: readonly Post[]): PostGraphData {
  const nodesById = new Map<string, PostGraphNode>()
  for (const post of posts) {
    nodesById.set(post.slug, {
      id: post.slug,
      title: post.title,
      category: post.category ?? null,
      tags: [...post.tags],
      date: post.date,
      incoming: 0,
      outgoing: 0,
      degree: 0,
    })
  }

  const edgeKeys = new Set<string>()
  const links: PostGraphLink[] = []
  for (const post of posts) {
    for (const target of post.wikilinks ?? []) {
      if (target === post.slug || !nodesById.has(target)) continue

      const edgeKey = JSON.stringify([post.slug, target])
      if (edgeKeys.has(edgeKey)) continue
      edgeKeys.add(edgeKey)

      links.push({ source: post.slug, target })
      nodesById.get(post.slug)!.outgoing += 1
      nodesById.get(target)!.incoming += 1
    }
  }

  const nodes = [...nodesById.values()]
    .map((node) => ({
      ...node,
      degree: node.incoming + node.outgoing,
    }))
    .sort((a, b) => a.id.localeCompare(b.id))

  links.sort(
    (a, b) =>
      a.source.localeCompare(b.source) || a.target.localeCompare(b.target),
  )

  return { nodes, links }
}
