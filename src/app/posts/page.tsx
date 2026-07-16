import type { Metadata } from "next"
import Link from "next/link"
import { ScrollReveal } from "@/components/effects/ScrollReveal"
import { PostFilters, type PostFilterState } from "@/components/posts/PostFilters"
import { PostList } from "@/components/posts/PostList"
import { PostSearch } from "@/components/posts/PostSearch"
import { getAllPosts } from "@/lib/content/load"
import { getSiteConfig } from "@/lib/content/site"
import type { Post } from "@/lib/content/types"

export const metadata: Metadata = {
  title: "篇章",
}

type SearchParams = Promise<{
  sort?: string
  category?: string
  tag?: string
}>

function parseSort(value?: string): PostFilterState["sort"] {
  if (value === "earliest" || value === "updated") return value
  return "latest"
}

function filterAndSortPosts(posts: Post[], state: PostFilterState): Post[] {
  let result = posts

  if (state.category) {
    result = result.filter((p) => p.category === state.category)
  }
  if (state.tag) {
    result = result.filter((p) => p.tags.includes(state.tag!))
  }

  if (state.sort === "earliest") {
    return [...result].sort((a, b) =>
      a.date < b.date ? -1 : a.date > b.date ? 1 : 0,
    )
  }
  if (state.sort === "updated") {
    return [...result].sort((a, b) => {
      const au = a.updated ?? a.date
      const bu = b.updated ?? b.date
      return au < bu ? 1 : au > bu ? -1 : 0
    })
  }
  return [...result].sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : 0,
  )
}

function buildTagHref(
  state: PostFilterState,
  tag: string,
  active: boolean,
): string {
  const params = new URLSearchParams()
  if (state.sort !== "latest") params.set("sort", state.sort)
  if (state.category) params.set("category", state.category)
  if (!active) params.set("tag", tag)
  const qs = params.toString()
  return qs ? `/posts?${qs}` : "/posts"
}

function buildCategoryHref(
  state: PostFilterState,
  category: string,
  active: boolean,
): string {
  const params = new URLSearchParams()
  if (state.sort !== "latest") params.set("sort", state.sort)
  if (state.tag) params.set("tag", state.tag)
  if (!active) params.set("category", category)
  const qs = params.toString()
  return qs ? `/posts?${qs}` : "/posts"
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const state: PostFilterState = {
    sort: parseSort(sp.sort),
    category: typeof sp.category === "string" ? sp.category : undefined,
    tag: typeof sp.tag === "string" ? sp.tag : undefined,
  }

  const site = getSiteConfig()
  const all = getAllPosts()
  const posts = filterAndSortPosts(all, state)

  const categories = [
    ...new Set(
      all.map((p) => p.category).filter((c): c is string => Boolean(c)),
    ),
  ].sort()

  const tagCounts = new Map<string, number>()
  for (const p of all) {
    for (const t of p.tags) {
      tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1)
    }
  }
  const tags = [...tagCounts.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1]
    return a[0].localeCompare(b[0])
  })

  const hasFilter = Boolean(state.category || state.tag)

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl overflow-x-hidden px-6 py-16 sm:px-10">
      <ScrollReveal y={14}>
        <header>
          <p className="site-eyebrow uppercase tracking-[0.28em] text-n-5">
            posts
          </p>
          <h1 className="site-title-page mt-4 flex flex-wrap items-baseline gap-3 tracking-tight text-n-6">
            <span>篇章</span>
            <span className="site-body tracking-normal text-n-4">·</span>
            <span className="site-body tracking-normal text-n-5">所有文章</span>
          </h1>
          {hasFilter ? (
            <p className="site-meta mt-3 text-n-5">
              筛选中
              {state.category ? (
                <span className="text-primary"> · /{state.category}</span>
              ) : null}
              {state.tag ? (
                <span className="text-primary"> · #{state.tag}</span>
              ) : null}
              <Link href="/posts" className="ml-2 text-n-4 transition hover:text-primary">
                清除
              </Link>
            </p>
          ) : null}
        </header>
      </ScrollReveal>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start lg:gap-12">
        <ScrollReveal className="order-2 grid gap-5 lg:order-1" y={18} delay={60}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="site-meta text-n-5">
              <span className="font-medium text-n-6">{posts.length}</span> posts
              total
            </p>
            <PostFilters state={state} />
          </div>
          <PostList posts={posts} author={site.author} />
        </ScrollReveal>

        <ScrollReveal className="order-1 space-y-4 lg:order-2 lg:sticky lg:top-28" y={16} delay={100}>
          <aside className="space-y-4">
            <PostSearch />

            {tags.length > 0 ? (
              <div className="posts-sidebar-card">
                <p className="site-eyebrow uppercase tracking-[0.18em] text-n-4">
                  Tags
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.map(([tag, count]) => {
                    const active = state.tag === tag
                    return (
                      <Link
                        key={tag}
                        href={buildTagHref(state, tag, active)}
                        data-active={active ? "true" : "false"}
                        className={
                          active
                            ? "site-eyebrow tag-chip tag-chip-active"
                            : "site-eyebrow tag-chip"
                        }
                      >
                        {tag} ({count})
                      </Link>
                    )
                  })}
                </div>
              </div>
            ) : null}

            {categories.length > 0 ? (
              <div className="posts-sidebar-card">
                <p className="site-eyebrow uppercase tracking-[0.18em] text-n-4">
                  Categories
                </p>
                <div className="mt-3 grid gap-0.5">
                  {categories.map((category) => {
                    const active = state.category === category
                    const count = all.filter((p) => p.category === category)
                      .length
                    return (
                      <Link
                        key={category}
                        href={buildCategoryHref(state, category, active)}
                        className={
                          active
                            ? "flex items-center justify-between rounded-lg bg-primary/10 px-2.5 py-2 text-sm font-medium text-primary transition"
                            : "flex items-center justify-between rounded-lg px-2.5 py-2 text-sm text-n-5 transition hover:bg-n-1/70 hover:text-primary dark:hover:bg-white/5"
                        }
                      >
                        <span>{category}</span>
                        <span className="text-xs opacity-70">{count}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </aside>
        </ScrollReveal>
      </div>
    </main>
  )
}
