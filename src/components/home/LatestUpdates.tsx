import Link from "next/link"
import type { Update } from "@/lib/content/types"
import { plainTextSnippet } from "@/lib/content/plain-text"

function formatDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function snippet(body: string, max = 42): string {
  return plainTextSnippet(body, max) || "动态"
}

export function LatestUpdates({ updates }: { updates: Update[] }) {
  return (
    <div className="home-feed-block" style={{ animationDelay: "0.3s" }}>
      <section>
        <div className="mb-3">
          <p className="home-feed-eyebrow font-normal uppercase text-n-5">
            Field notes
          </p>
          <p className="home-feed-title mt-1 font-bold text-n-6">最近动态</p>
        </div>

        {updates.length === 0 ? (
          <p className="site-meta text-n-5">暂无动态</p>
        ) : (
          <div className="grid gap-1">
            {updates.map((update, index) => (
              <div
                key={update.slug}
                className="home-feed-item"
                style={{ animationDelay: `${0.34 + index * 0.07}s` }}
              >
                <article className="group relative -mx-3 rounded-md border-b border-n-2 px-3 py-4 transition-colors duration-200 last:border-b-0 hover:bg-primary/[0.03] dark:border-n-2">
                  <Link
                    href="/updates"
                    aria-label="Open updates"
                    className="absolute inset-0 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  />
                  <div className="pointer-events-none relative flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                    <p className="home-feed-item-title min-w-0 flex-1 truncate whitespace-nowrap text-n-6 transition group-hover:text-primary dark:text-n-6">
                      {snippet(update.body)}
                    </p>
                    <p className="home-feed-date text-n-5">
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
