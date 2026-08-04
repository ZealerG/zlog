import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

type Backlink = {
  slug: string
  title: string
}

/**
 * 反向链接区块:展示哪些文章引用了当前文章([[Wiki 链接]])。
 * 纯展示组件,数据由服务端传入(post.backlinks)。
 */
export function Backlinks({ backlinks }: { backlinks: Backlink[] }) {
  if (!backlinks || backlinks.length === 0) return null

  return (
    <section className="mt-10 border-t border-n-3/40 pt-6" aria-label="反向链接">
      <h2 className="site-subtitle mb-4 flex items-center gap-2 text-sm font-medium tracking-wide text-n-5">
        <ArrowUpRight className="h-4 w-4" aria-hidden />
        反向链接
        <span className="text-xs text-n-4">({backlinks.length})</span>
      </h2>
      <ul className="flex flex-wrap gap-2">
        {backlinks.map((b) => (
          <li key={b.slug}>
            <Link
              href={`/posts/${b.slug}`}
              className="inline-block rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-sm text-primary transition-colors hover:bg-primary/15"
            >
              {b.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}