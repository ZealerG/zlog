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

export function PostList({
  posts,
  author,
}: {
  posts: Post[]
  author?: string
}) {
  if (posts.length === 0) {
    return <p className="site-meta text-n-5">暂无文章</p>
  }

  return (
    <div>
      {posts.map((post) => (
        <article
          key={post.slug}
          className="group relative -mx-3 rounded-md border-b border-n-2 px-3 pb-6 pt-3 transition-colors last:border-b-0 dark:border-n-2"
        >
          <Link
            href={`/posts/${post.slug}`}
            aria-label={`Open ${post.title}`}
            className="absolute inset-0 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
          <div className="pointer-events-none relative">
            <h2 className="site-title-h2 tracking-tight text-n-6 transition group-hover:text-primary dark:text-n-6">
              {post.title}
              {!post.published ? (
                <span className="ml-2 align-middle rounded-full border border-primary/40 px-2 py-0.5 text-[11px] font-medium text-primary">
                  Draft
                </span>
              ) : null}
            </h2>

            {post.summary ? (
              <p className="reading-copy site-meta mt-3 text-n-5">
                {post.summary}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {post.category ? (
                  <Link
                    href={`/posts?category=${encodeURIComponent(post.category)}`}
                    className="pointer-events-auto relative text-xs font-medium text-primary transition hover:opacity-80"
                  >
                    / {post.category}
                  </Link>
                ) : null}
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/posts?tag=${encodeURIComponent(tag)}`}
                    className="tag-inline pointer-events-auto relative"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-n-5">
                <time dateTime={post.date} title={formatDate(post.date)}>
                  {formatDate(post.date)}
                </time>
                {author ? (
                  <>
                    <span aria-hidden>·</span>
                    <span>{author}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
