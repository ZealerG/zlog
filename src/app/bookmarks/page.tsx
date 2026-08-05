import Link from "next/link"
import { ArrowLeft, ArrowUpRight, Layers } from "lucide-react"
import { getBookmarksByCategory } from "@/lib/content/load"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  path: "/bookmarks",
  title: "书签",
  description: "收藏的文章、工具与资源。",
})

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
      <div className="grid gap-12">
        <section>
          <p className="site-eyebrow uppercase tracking-[0.28em] text-n-5">
            Bookmarks
          </p>
          <h1 className="site-title-page mt-4 flex flex-wrap items-baseline gap-3 tracking-tight text-n-6">
            <span>书签</span>
            <span className="site-body tracking-normal text-n-4">·</span>
            <span className="site-body tracking-normal text-n-5">收藏夹</span>
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 site-meta text-n-5">
            <Link
              href="/more"
              className="inline-flex items-center gap-1 transition hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              远方
            </Link>
            <span className="text-n-3">·</span>
            <span>
              <span className="font-medium text-n-6">{total}</span> 条收藏
            </span>
            {groups.length > 1 ? (
              <>
                <span className="text-n-3">·</span>
                <span className="text-n-4">{groups.length} 个分组</span>
              </>
            ) : null}
          </div>
        </section>

        {groups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-n-2 px-6 py-14 text-center">
            <p className="site-meta text-n-5">还没有书签。</p>
            <p className="site-meta mt-2 text-n-4">
              在 <code>content/bookmarks/</code> 新增笔记即可。
            </p>
          </div>
        ) : (
          groups.map((group, gi) => (
            <section
              key={group.category}
              id={encodeURIComponent(group.category)}
              className="grid gap-4 scroll-mt-28"
              style={{ animationDelay: `${gi * 0.05}s` }}
            >
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-n-2 pb-4 dark:border-n-2">
                <div className="grid gap-1">
                  <p className="site-eyebrow uppercase tracking-[0.24em] text-n-4">
                    Category
                  </p>
                  <h2 className="site-title-h2 tracking-tight text-n-6">
                    {group.category}
                  </h2>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-n-2 bg-n-1/30 px-2.5 py-1 text-xs text-n-5">
                  <Layers className="h-3 w-3" aria-hidden />
                  {group.items.length} 条
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {group.items.map((item) => (
                  <a
                    key={item.slug}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="bookmark-card surface-shell surface-shell-hover group grid gap-3 rounded-2xl p-5 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        {item.type ? (
                          <span className="site-eyebrow rounded-full border border-primary/20 bg-primary/8 px-2 py-0.5 uppercase tracking-[0.14em] text-primary">
                            {item.type}
                          </span>
                        ) : null}
                        <span className="site-eyebrow truncate uppercase tracking-[0.14em] text-n-4">
                          {hostname(item.url)}
                        </span>
                      </div>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-n-4 transition duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-medium tracking-tight text-n-6 transition duration-200 group-hover:text-primary">
                        {item.title}
                      </h3>
                      {item.description ? (
                        <p className="site-meta mt-2 line-clamp-2 text-n-5">
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
