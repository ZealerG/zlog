import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import type { Update } from "@/lib/content/types"
import { plainTextSnippet } from "@/lib/content/plain-text"
import { formatSiteDateEn } from "@/lib/datetime"

function formatDate(iso: string) {
  return formatSiteDateEn(iso)
}

function snippet(body: string, max = 42): string {
  return plainTextSnippet(body, max) || "动态"
}

export function LatestUpdates({ updates }: { updates: Update[] }) {
  return (
    <div className="home-feed-block" style={{ animationDelay: "0.28s" }}>
      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="home-feed-eyebrow font-normal uppercase text-n-5">
              足迹
            </p>
            <p className="home-feed-title mt-1 font-bold text-n-6">最近动态</p>
          </div>
          <Link
            href="/updates"
            className="group/all inline-flex items-center gap-1.5 site-meta text-n-5 transition-colors hover:text-primary"
          >
            查看全部
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-n-1/80 text-n-5 transition duration-300 group-hover/all:bg-primary/12 group-hover/all:text-primary dark:bg-white/6">
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/all:translate-x-0.5 group-hover/all:-translate-y-0.5" />
            </span>
          </Link>
        </div>

        {updates.length === 0 ? (
          <p className="site-meta text-n-5">暂无动态</p>
        ) : (
          <div className="grid gap-0">
            {updates.map((update, index) => (
              <div
                key={update.slug}
                className="home-feed-item"
                style={{ animationDelay: `${0.3 + index * 0.06}s` }}
              >
                <article className="home-feed-row group relative -mx-3 rounded-xl border-b border-n-2 px-3 py-4 last:border-b-0 dark:border-n-2">
                  <Link
                    href={`/updates#${update.slug}`}
                    aria-label="打开动态"
                    className="absolute inset-0 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  />
                  <div className="pointer-events-none relative flex items-start justify-between gap-x-6 gap-y-2">
                    <p className="home-feed-item-title min-w-0 flex-1 text-pretty text-n-6 transition duration-200 group-hover:text-primary dark:text-n-6">
                      {snippet(update.body)}
                    </p>
                    <p className="home-feed-date shrink-0 pt-0.5 text-n-5 transition duration-200 group-hover:text-n-4">
                      <time
                        dateTime={update.date}
                        title={formatDate(update.date)}
                      >
                        {formatDate(update.date)}
                      </time>
                    </p>
                  </div>
                </article>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
