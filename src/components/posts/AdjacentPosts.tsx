import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import type { Post } from "@/lib/content/types"

export function AdjacentPosts({
  prev,
  next,
}: {
  prev?: Post
  next?: Post
}) {
  if (!prev && !next) return null

  return (
    <nav
      aria-label="相邻文章"
      className="mt-16 grid gap-4 border-t border-n-2 pt-10 dark:border-n-2 sm:grid-cols-2"
    >
      {prev ? (
        <Link
          href={`/posts/${prev.slug}`}
          className="group rounded-2xl border border-n-2 bg-n-1/20 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_12px_30px_rgb(15_23_42/0.06)]"
        >
          <p className="mb-2 flex items-center gap-1.5 text-xs text-n-5">
            <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" />
            上一篇
          </p>
          <p className="site-meta font-medium text-n-6 transition group-hover:text-primary">
            {prev.title}
          </p>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={`/posts/${next.slug}`}
          className="group rounded-2xl border border-n-2 bg-n-1/20 p-5 text-right transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_12px_30px_rgb(15_23_42/0.06)] sm:justify-self-end"
        >
          <p className="mb-2 flex items-center justify-end gap-1.5 text-xs text-n-5">
            下一篇
            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </p>
          <p className="site-meta font-medium text-n-6 transition group-hover:text-primary">
            {next.title}
          </p>
        </Link>
      ) : null}
    </nav>
  )
}
