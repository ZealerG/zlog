"use client"

import Link from "next/link"
import { Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
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

  useEffect(() => {
    let cancelled = false
    setStatus("loading")
    fetch("/search-index.json")
      .then((res) => {
        if (!res.ok) throw new Error("failed to load search index")
        return res.json() as Promise<SearchIndexEntry[]>
      })
      .then((data) => {
        if (!cancelled) {
          setEntries(data)
          setStatus("ready")
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error")
      })
    return () => {
      cancelled = true
    }
  }, [])

  const results = useMemo(
    () => filterSearchIndex(entries, query),
    [entries, query],
  )

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-n-5 transition hover:text-primary dark:text-n-5"
      >
        <Search className="h-4 w-4" aria-hidden />
        <span>Search posts</span>
      </button>

      {open ? (
        <div className="mt-3">
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts"
            className="w-full rounded-xl border border-n-2 bg-background/60 px-3 py-2.5 text-sm text-n-6 outline-none ring-primary/25 placeholder:text-n-4 focus:border-primary/40 focus:ring-2"
          />

          {status === "error" ? (
            <p className="site-meta mt-3 text-n-5">搜索索引暂不可用</p>
          ) : null}

          {query.trim() ? (
            results.length === 0 ? (
              <p className="site-meta mt-3 text-n-5">无匹配结果</p>
            ) : (
              <ul className="mt-3 space-y-1">
                {results.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/posts/${item.slug}`}
                      className="block rounded-lg px-2 py-2 transition-colors hover:bg-n-1/70"
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
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
