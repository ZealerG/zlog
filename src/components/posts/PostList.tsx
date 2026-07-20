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
    return (
      <div className="rounded-2xl border border-dashed border-n-2 px-6 py-12 text-center">
        <p className="site-meta text-n-5">暂无文章</p>
        <p className="site-meta mt-2 text-n-4">
          在 <code>content/posts/</code> 新增 Markdown 即可。
        </p>
      </div>
    )
  }

  return (
    <div className="posts-list">
      {posts.map((post, index) => (
        <article
          key={post.slug}
          className="post-list-item group relative -mx-3 rounded-xl border-b border-n-2 px-3 pb-6 pt-4 transition-all duration-200 last:border-b-0 dark:border-n-2"
          style={{ animationDelay: `${index * 0.04}s` }}
        >
          <Link
            href={`/posts/${post.slug}`}
            aria-label={`Open ${post.title}`}
            className="absolute inset-0 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
          <div className="pointer-events-none relative">
            <h2 className="site-title-h2 tracking-tight text-n-6 transition duration-200 group-hover:text-primary dark:text-n-6">
              {post.title}
              {!post.published ? (
                <span className="ml-2 align-middle rounded-full border border-primary/40 px-2 py-0.5 text-[11px] font-medium text-primary">
                  Draft
                </span>
              ) : null}
            </h2>

            {post.summary ? (
              <p className="reading-copy site-meta mt-3 line-clamp-2 max-w-2xl text-n-5 transition duration-200 group-hover:text-n-5/90">
                {post.summary}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {post.category ? (
                  <Link
                    href={`/posts?category=${encodeURIComponent(post.category)}`}
                    className="category-inline pointer-events-auto relative"
                  >
                    /{post.category}
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
                    <span aria-hidden className="text-n-3">
                      ·
                    </span>
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
