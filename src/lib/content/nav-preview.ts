import {
  getAllPosts,
  getAllUpdates,
  getTimelineEntries,
} from "./load"
import { plainTextSnippet } from "./plain-text"

export type NavPreviewLink = {
  href: string
  title: string
  kind?: string
  category?: string
  date?: string
  compact?: boolean
}

export type NavPreviewSection = {
  eyebrow: string
  mode: "list" | "categories" | "cards" | "timeline"
  items: NavPreviewLink[]
  footer?: { href: string; title: string; eyebrow: string }[]
  categories?: { slug: string; label: string; href: string; count: number }[]
  empty?: string
}

export type NavPreviewData = Record<string, NavPreviewSection>

function relativeish(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function getNavPreviewData(): NavPreviewData {
  const posts = getAllPosts()
  const updates = getAllUpdates()
  const timeline = getTimelineEntries()

  const categoriesMap = new Map<string, number>()
  for (const p of posts) {
    const cat = p.category?.trim() || "未分类"
    categoriesMap.set(cat, (categoriesMap.get(cat) ?? 0) + 1)
  }
  const categories = [...categoriesMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({
      slug: label,
      label,
      href: `/posts?category=${encodeURIComponent(label)}`,
      count,
    }))

  return {
    "/": {
      eyebrow: "Home",
      mode: "cards",
      items: [
        {
          href: "/posts",
          title: "最近写作",
          kind: "Posts",
        },
        {
          href: "/updates",
          title: "最近动态",
          kind: "Updates",
        },
        {
          href: "/more",
          title: "远方",
          kind: "More",
        },
      ],
      empty: "Start with a quick introduction and the overall tone of the site.",
    },
    "/posts": {
      eyebrow: "Posts",
      mode: "categories",
      categories,
      items: posts.slice(0, 6).map((p) => ({
        href: `/posts/${p.slug}`,
        title: p.title,
        category: p.category,
        kind: "Post",
        date: relativeish(p.date),
      })),
      empty: "Longer writing on products, technology, and personal expression.",
    },
    "/updates": {
      eyebrow: "Updates",
      mode: "list",
      items: updates.slice(0, 6).map((u) => ({
        href: `/updates#${u.slug}`,
        title: plainTextSnippet(u.body, 56) || "动态",
        date: relativeish(u.date),
        compact: true,
      })),
      empty: "Short updates, experiments, and notes from ongoing work.",
    },
    "/timeline": {
      eyebrow: "Timeline",
      mode: "timeline",
      items: timeline.slice(0, 6).map((e) => ({
        href: e.href,
        title: plainTextSnippet(e.title, 56),
        kind: e.kind === "post" ? "篇章" : e.kind === "update" ? "足迹" : "影像",
        category: e.summary
          ? plainTextSnippet(e.summary, 40)
          : undefined,
        date: relativeish(e.date),
      })),
      footer: [
        { href: "/timeline?type=posts", title: "篇章", eyebrow: "Posts" },
        { href: "/timeline?type=updates", title: "足迹", eyebrow: "Updates" },
      ],
      empty: "Browse everything by time and revisit older pieces in one place.",
    },
    "/more": {
      eyebrow: "More",
      mode: "cards",
      items: [
        { href: "/projects", title: "项目", kind: "Projects" },
        { href: "/friends", title: "友链", kind: "Friends" },
        { href: "/bookmarks", title: "书签", kind: "Bookmarks" },
      ],
      empty: "A softer space for side pages, collections, and future ideas.",
    },
  }
}
