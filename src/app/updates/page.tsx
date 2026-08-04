import type { Metadata } from "next"
import Link from "next/link"
import { ScrollReveal } from "@/components/effects/ScrollReveal"
import { UpdateTimeline } from "@/components/updates/UpdateTimeline"
import { getAllUpdates, getPostTitleBySlug } from "@/lib/content/load"
import { markdownToHtmlLite } from "@/lib/content/markdown"
import { getSiteConfig } from "@/lib/content/site"

export const metadata: Metadata = {
  title: "足迹",
}

type SearchParams = Promise<{ sort?: string }>

export default async function UpdatesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const sort = sp.sort === "earliest" ? "earliest" : "latest"
  const site = getSiteConfig()

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
            Updates
          </p>
          <h1 className="site-title-page mt-4 flex flex-wrap items-baseline gap-3 tracking-tight text-n-6">
            <span>足迹</span>
            <span className="site-body tracking-normal text-n-4">·</span>
            <span className="site-body tracking-normal text-n-5">最近动态</span>
          </h1>
        </header>
      </ScrollReveal>

      <div className="mt-8">
        <ScrollReveal y={12} delay={40}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="site-meta text-n-5">
              <span className="font-medium text-n-6">{items.length}</span> updates
              total
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
                Latest
              </Link>
              <Link
                href="/updates?sort=earliest"
                className={
                  sort === "earliest"
                    ? "rounded-full bg-background px-3 py-1.5 text-xs font-medium text-primary shadow-sm transition dark:bg-n-0/80"
                    : "rounded-full px-3 py-1.5 text-xs text-n-5 transition hover:text-primary"
                }
              >
                Earliest
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
