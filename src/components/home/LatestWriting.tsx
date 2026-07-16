import Link from "next/link"
import type { Post } from "@/lib/content/types"

function formatDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function LatestWriting({ posts }: { posts: Post[] }) {
  return (
    <div className="home-feed-block">
      <section>
        <div className="mb-3">
          <p className="home-feed-eyebrow font-normal uppercase text-n-5">
            Latest writing
          </p>
          <p className="home-feed-title mt-1 font-bold text-n-6">最近写作</p>
        </div>

        {posts.length === 0 ? (
          <p className="site-meta text-n-5">暂无文章</p>
        ) : (
          <div className="grid gap-1">
            {posts.map((post, index) => (
              <div
                key={post.slug}
                className="home-feed-item"
                style={{ animationDelay: `${0.28 + index * 0.07}s` }}
              >
                <article className="group relative -mx-3 rounded-md border-b border-n-2 px-3 py-4 transition-colors duration-200 last:border-b-0 hover:bg-primary/[0.03] dark:border-n-2">
                  <Link
                    href={`/posts/${post.slug}`}
                    aria-label={`Open ${post.title}`}
                    className="absolute inset-0 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  />
                  <div className="pointer-events-none relative flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                    <p className="home-feed-item-title min-w-0 flex-1 truncate whitespace-nowrap text-n-6 transition group-hover:text-primary dark:text-n-6">
                      {post.title}
                      {!post.published ? (
                        <span className="ml-2 text-xs text-primary">Draft</span>
                      ) : null}
                    </p>
                    <p className="home-feed-date text-n-5">
                      <time dateTime={post.date} title={formatDate(post.date)}>
                        {formatDate(post.date)}
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
