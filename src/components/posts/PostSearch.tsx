"use client"

import Link from "next/link"
import { Search, X } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  filterSearchIndex,
  type SearchIndexEntry,
} from "@/lib/content/search-index"

export function PostSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [entries, setEntries] = useState<SearchIndexEntry[]>([])
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  )
  const requestStartedRef = useRef(false)
  const loadedRef = useRef(false)

  useEffect(() => {
    if (!open || requestStartedRef.current || loadedRef.current) return

    requestStartedRef.current = true
    let cancelled = false
    const controller = new AbortController()
    setStatus("loading")
    fetch("/search-index.json", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("failed to load search index")
        return res.json() as Promise<SearchIndexEntry[]>
      })
      .then((data) => {
        if (!cancelled) {
          loadedRef.current = true
          setEntries(data)
          setStatus("ready")
        }
      })
      .catch((error: unknown) => {
        if (!cancelled && !(error instanceof DOMException && error.name === "AbortError")) {
          requestStartedRef.current = false
          setStatus("error")
        }
      })
    return () => {
      cancelled = true
      controller.abort()
      requestStartedRef.current = false
    }
  }, [open])

  const results = useMemo(
    () => filterSearchIndex(entries, query),
    [entries, query],
  )

  return (
    <div className="posts-sidebar-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex w-full cursor-pointer items-center justify-between gap-2 text-sm font-medium text-n-5 transition hover:text-primary dark:text-n-5"
      >
        <span className="inline-flex items-center gap-2">
          <Search className="h-4 w-4" strokeWidth={1.9} aria-hidden />
          <span>搜索文章</span>
        </span>
        {open ? <X className="h-3.5 w-3.5 opacity-60" /> : null}
      </button>

      {open ? (
        <div className="animate-soft-panel-in mt-3">
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="标题、标签或摘要…"
            className="w-full rounded-xl border border-n-2 bg-background/70 px-3 py-2.5 text-sm text-n-6 outline-none transition placeholder:text-n-4 focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
          />

          {status === "error" ? (
            <p className="site-meta mt-3 text-n-5">搜索索引暂不可用</p>
          ) : null}

          {status === "loading" ? (
            <p className="site-meta mt-3 text-n-4">正在载入搜索索引</p>
          ) : null}

          {status === "ready" && query.trim() ? (
            results.length === 0 ? (
              <p className="site-meta mt-3 text-n-5">无匹配结果</p>
            ) : (
              <ul className="mt-3 max-h-64 space-y-0.5 overflow-y-auto">
                {results.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/posts/${item.slug}`}
                      className="block rounded-lg px-2.5 py-2 transition-colors hover:bg-primary/[0.06]"
                    >
                      <span className="site-meta font-medium text-n-6">
                        {item.title}
                      </span>
                      {item.summary ? (
                        <span className="mt-1 block text-xs text-n-5 line-clamp-2">
                          {item.summary}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            )
          ) : status === "ready" ? (
            <p className="site-meta mt-3 text-n-4">输入关键词筛选篇章</p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
