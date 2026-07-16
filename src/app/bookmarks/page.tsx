import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, Layers } from "lucide-react"
import { getBookmarksByCategory } from "@/lib/content/load"

export const metadata: Metadata = {
  title: "书签",
}

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

export default function BookmarksPage() {
  const groups = getBookmarksByCategory()
  const total = groups.reduce((n, g) => n + g.items.length, 0)

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-16 sm:px-10">
      <div className="grid gap-14">
        <section className="pb-2">
          <p className="site-eyebrow uppercase tracking-[0.28em] text-n-5">
            Bookmarks
          </p>
          <h1 className="site-title-page mt-4 flex flex-wrap items-baseline gap-3 tracking-tight text-n-6">
            <span>书签</span>
            <span className="site-body tracking-normal text-n-4">·</span>
            <span className="site-body tracking-normal text-n-5">收藏夹</span>
          </h1>
          <p className="site-meta mt-3 text-n-5">
            <Link href="/more" className="hover:text-primary">
              ← 远方
            </Link>
            <span className="mx-2">·</span>
            {total} 条收藏
          </p>
        </section>

        {groups.length === 0 ? (
          <p className="site-meta text-n-5">
            还没有书签。在 <code>content/bookmarks/</code> 新增笔记即可。
          </p>
        ) : (
          groups.map((group) => (
            <section
              key={group.category}
              id={group.category}
              className="grid gap-4 scroll-mt-28"
            >
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-n-2 pb-4 dark:border-n-2">
                <div className="grid gap-1">
                  <p className="site-eyebrow uppercase tracking-[0.24em] text-n-4">
                    {group.category}
                  </p>
                  <h2 className="site-title-h2 tracking-tight text-n-6">
                    {group.category}
                  </h2>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-n-2 px-2.5 py-1 text-xs text-n-5">
                  <Layers className="h-3 w-3" aria-hidden />
                  {group.items.length} 条
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {group.items.map((item) => (
                  <a
                    key={item.slug}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="surface-shell surface-shell-hover group grid gap-4 rounded-2xl p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {item.type ? (
                          <span className="site-eyebrow uppercase tracking-[0.18em] text-primary">
                            {item.type}
                          </span>
                        ) : null}
                        <span className="site-eyebrow uppercase tracking-[0.18em] text-n-4">
                          {hostname(item.url)}
                        </span>
                      </div>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-n-4 transition group-hover:text-n-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-medium tracking-tight text-n-6 transition group-hover:text-primary">
                        {item.title}
                      </h3>
                      {item.description ? (
                        <p className="site-meta mt-2 text-n-5">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  </a>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </main>
  )
}
