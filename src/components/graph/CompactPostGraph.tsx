"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { Maximize2, Network } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import type { PostGraphData } from "@/lib/content/post-graph"
import { GraphLoadingMark } from "./GraphLoadingMark"

const DeferredPostGraph = dynamic(
  () => import("./PostGraph").then((module) => module.PostGraph),
  {
    ssr: false,
    loading: () => <CompactGraphLoading />,
  },
)

type CompactPostGraphProps = {
  data: PostGraphData
}

function CompactGraphLoading() {
  return (
    <section
      className="posts-sidebar-card overflow-hidden"
      aria-label="文章关系图谱"
      aria-busy="true"
    >
      <h2 className="text-sm font-medium text-n-6">文章关系</h2>
      <div className="post-graph-canvas -mx-4 mt-3 grid h-52 place-items-center border-y border-n-2">
        <div className="post-graph-grid" aria-hidden />
        <GraphLoadingMark />
      </div>
    </section>
  )
}

export function CompactPostGraph({ data }: CompactPostGraphProps) {
  const rootRef = useRef<HTMLElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    const element = rootRef.current
    if (!element || typeof IntersectionObserver === "undefined") {
      setShouldLoad(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setShouldLoad(true)
        observer.disconnect()
      },
      { rootMargin: "240px 0px" },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  if (shouldLoad) {
    return <DeferredPostGraph data={data} variant="compact" />
  }

  return (
    <section
      ref={rootRef}
      className="posts-sidebar-card overflow-hidden"
      aria-labelledby="compact-post-graph-preview-title"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2
            id="compact-post-graph-preview-title"
            className="text-sm font-medium text-n-6"
          >
            文章关系
          </h2>
          <p className="mt-1 text-xs text-n-4">
            {data.nodes.length} 篇 / {data.links.length} 条链接
          </p>
        </div>
        <Link
          href="/graph"
          aria-label="打开完整文章关系图谱"
          title="打开完整图谱"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-n-5 transition hover:bg-primary/10 hover:text-primary active:scale-[0.98]"
        >
          <Maximize2 className="size-4" aria-hidden />
        </Link>
      </div>

      <div
        className="post-graph-canvas -mx-4 mt-3 grid h-52 place-items-center border-y border-n-2"
        aria-hidden
      >
        <div className="post-graph-grid" />
        <Network className="size-5 text-n-3" />
      </div>

      <Link
        href="/graph"
        className="mt-3 inline-flex items-center text-sm text-n-5 transition hover:text-primary"
      >
        查看完整图谱
      </Link>

      <ul className="sr-only" aria-label="图谱中的文章">
        {data.nodes.map((node) => (
          <li key={node.id}>
            <Link href={`/posts/${node.id}`}>{node.title}</Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
