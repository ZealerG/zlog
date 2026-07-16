import type { Metadata } from "next"
import Link from "next/link"
import { UpdateTimeline } from "@/components/updates/UpdateTimeline"
import { getAllUpdates } from "@/lib/content/load"
import { markdownToHtml } from "@/lib/content/markdown"
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
      const { html } = await markdownToHtml(update.body)
      return {
        slug: update.slug,
        date: update.date,
        html,
      }
    }),
  )

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-16 sm:px-10">
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

      <div className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3 text-n-5">
          <p className="site-meta">{items.length} updates total</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/updates"
              className={
                sort === "latest"
                  ? "transition text-primary"
                  : "transition text-n-5 hover:text-n-6 dark:text-n-5 dark:hover:text-n-6"
              }
            >
              Latest
            </Link>
            <Link
              href="/updates?sort=earliest"
              className={
                sort === "earliest"
                  ? "transition text-primary"
                  : "transition text-n-5 hover:text-n-6 dark:text-n-5 dark:hover:text-n-6"
              }
            >
              Earliest
            </Link>
          </div>
        </div>

        <div className="mt-10">
          <UpdateTimeline items={items} author={site.author} />
        </div>
      </div>
    </main>
  )
}
