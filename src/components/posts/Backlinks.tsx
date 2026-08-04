import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

type Backlink = {
  slug: string
  title: string
}

type BacklinksProps = {
  backlinks: Backlink[]
  variant?: "content" | "sidebar"
}

/**
 * 反向链接区块:展示哪些文章引用了当前文章([[Wiki 链接]])。
 * 纯展示组件,数据由服务端传入(post.backlinks)。
 */
export function Backlinks({
  backlinks,
  variant = "content",
}: BacklinksProps) {
  if (!backlinks || backlinks.length === 0) return null
  const sidebar = variant === "sidebar"

  return (
    <section
      className={
        sidebar
          ? "mt-6 border-t border-n-2 pt-5"
          : "mt-10 border-t border-n-3/40 pt-6"
      }
      aria-label="反向链接"
    >
      <h2
        className={
          sidebar
            ? "site-eyebrow mb-3 flex items-center gap-2 text-xs text-n-4"
            : "site-subtitle mb-4 flex items-center gap-2 text-sm font-medium text-n-5"
        }
      >
        <ArrowUpRight className="h-4 w-4" aria-hidden />
        反向链接
        <span className="text-xs text-n-4">({backlinks.length})</span>
      </h2>
      <ul className={sidebar ? "space-y-1" : "flex flex-wrap gap-2"}>
        {backlinks.map((b) => (
          <li key={b.slug}>
            <Link
              href={`/posts/${b.slug}`}
              className={
                sidebar
                  ? "block min-w-0 rounded-md border-l border-n-2 px-2 py-1.5 text-[0.82rem] leading-5 text-n-5 transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                  : "inline-block rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-sm text-primary transition-colors hover:bg-primary/15"
              }
            >
              <span className="break-words">{b.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
