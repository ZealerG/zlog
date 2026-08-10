import Link from "next/link"
import { ScrollReveal } from "@/components/effects/ScrollReveal"
import { UpdateTodoList } from "@/components/updates/UpdateTodoList"
import { UpdateTimeline } from "@/components/updates/UpdateTimeline"
import {
  getAllPages,
  getAllUpdates,
  getPostTitleBySlug,
} from "@/lib/content/load"
import { markdownToHtmlLite } from "@/lib/content/markdown"
import { getSiteConfig } from "@/lib/content/site"
import { parseTodoItems } from "@/lib/content/todos"
import { createPageMetadata } from "@/lib/seo"

type SearchParams = Promise<{ sort?: string }>

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  return createPageMetadata({
    path: "/updates",
    title: "足迹",
    description: "记录最近的动态、想法与短笔记。",
    noIndex: Boolean(sp.sort),
  })
}

export default async function UpdatesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const sort = sp.sort === "earliest" ? "earliest" : "latest"
  const site = getSiteConfig()
  const todoPage = getAllPages().find((page) => page.slug === "todo")
  const todos = parseTodoItems(todoPage?.body ?? "")

  const updates = getAllUpdates()
  const ordered =
    sort === "earliest"
      ? [...updates].sort((a, b) =>
          a.date < b.date ? -1 : a.date > b.date ? 1 : 0,
        )
      : updates

  const items = await Promise.all(
    ordered.map(async (update) => {
      // Short memos: lite pipeline (no highlight / footnotes / TOC)
      const { html } = await markdownToHtmlLite(update.body, {
        resolveWikilinkTitle: getPostTitleBySlug,
      })
      return {
        slug: update.slug,
        date: update.date,
        html,
      }
    }),
  )

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl overflow-x-hidden px-6 py-16 sm:px-10">
      <ScrollReveal y={14}>
        <header>
          <p className="site-eyebrow uppercase tracking-[0.28em] text-n-5">
            动态
          </p>
          <h1 className="site-title-page mt-4 flex flex-wrap items-baseline gap-3 tracking-tight text-n-6">
            <span>足迹</span>
            <span className="site-body tracking-normal text-n-4">·</span>
            <span className="site-body tracking-normal text-n-5">最近动态</span>
          </h1>
        </header>
      </ScrollReveal>

      {todos.length > 0 ? (
        <ScrollReveal y={12} delay={40}>
          <div className="mt-10">
            <UpdateTodoList todos={todos} />
          </div>
        </ScrollReveal>
      ) : null}

      <div className="mt-8">
        <ScrollReveal y={12} delay={todos.length > 0 ? 80 : 40}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="site-meta text-n-5">
              <span className="font-medium text-n-6">{items.length}</span> 条动态
            </p>
            <div className="glass-chip flex flex-wrap items-center gap-1 rounded-full p-1">
              <Link
                href="/updates"
                className={
                  sort === "latest"
                    ? "rounded-full bg-background px-3 py-1.5 text-xs font-medium text-primary shadow-sm transition dark:bg-n-0/80"
                    : "rounded-full px-3 py-1.5 text-xs text-n-5 transition hover:text-primary"
                }
              >
                最新
              </Link>
              <Link
                href="/updates?sort=earliest"
                className={
                  sort === "earliest"
                    ? "rounded-full bg-background px-3 py-1.5 text-xs font-medium text-primary shadow-sm transition dark:bg-n-0/80"
                    : "rounded-full px-3 py-1.5 text-xs text-n-5 transition hover:text-primary"
                }
              >
                最早
              </Link>
            </div>
          </div>
        </ScrollReveal>

        {/* Tall list: CSS row animation only — not ScrollReveal */}
        <div className="mt-10">
          <UpdateTimeline items={items} author={site.author} />
        </div>
      </div>
    </main>
  )
}
