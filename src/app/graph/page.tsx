import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PostGraph } from "@/components/graph/PostGraph"
import { getAllPosts } from "@/lib/content/load"
import { buildPostGraph } from "@/lib/content/post-graph"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  path: "/graph",
  title: "文章关系图谱",
  description: "浏览文章之间由 Wiki-link 构成的引用关系。",
})

export default function GraphPage() {
  const graph = buildPostGraph(getAllPosts())

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-6 py-12 sm:px-10 sm:py-16">
      <header className="max-w-2xl">
        <Link
          href="/posts"
          className="inline-flex items-center gap-1.5 text-sm text-n-5 transition hover:text-primary"
        >
          <ArrowLeft className="size-4" aria-hidden />
          返回篇章
        </Link>
        <h1 className="site-title-page mt-6 tracking-tight text-n-6">
          文章关系图谱
        </h1>
        <p className="site-body mt-3 max-w-xl text-n-5">
          沿着文章之间的 Wiki-link，查看内容如何彼此连接。
        </p>
      </header>

      <PostGraph data={graph} />
    </main>
  )
}
