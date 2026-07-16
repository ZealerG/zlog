"use client"

import { useMemo, useState } from "react"
import type { Glimpse } from "@/lib/content/types"

function yearOf(iso: string) {
  return iso.slice(0, 4)
}

function formatMonthDay(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function GlimpseTimeline({ glimpses }: { glimpses: Glimpse[] }) {
  // hard filter: 拾光 only visual moments
  const visual = useMemo(
    () => glimpses.filter((g) => g.images.length > 0),
    [glimpses],
  )

  const years = useMemo(() => {
    const set = new Set(visual.map((g) => yearOf(g.date)))
    return [...set].sort((a, b) => (a < b ? 1 : -1))
  }, [visual])

  const [activeYear, setActiveYear] = useState<string>("all")

  const filtered = useMemo(() => {
    if (activeYear === "all") return visual
    return visual.filter((g) => yearOf(g.date) === activeYear)
  }, [activeYear, visual])

  const groups = useMemo(() => {
    const map = new Map<string, Glimpse[]>()
    for (const g of filtered) {
      const y = yearOf(g.date)
      if (!map.has(y)) map.set(y, [])
      map.get(y)!.push(g)
    }
    return [...map.entries()].sort(([a], [b]) => (a < b ? 1 : -1))
  }, [filtered])

  if (visual.length === 0) {
    return (
      <p className="site-meta mt-8 text-n-5">
        还没有拾光影像。在 `content/glimpses/` 放入带图片的笔记，或在微语里插入图床图片。
      </p>
    )
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-end gap-x-3 gap-y-2 text-n-4">
        <p className="rounded-[1.75rem] border border-n-2 bg-n-1/40 px-4 py-3 text-sm text-n-5">
          {visual.length} moments
        </p>
        <p className="site-body max-w-xl text-n-5">
          Keep this · Stay close — 只收录有图的瞬间，文字微语在「足迹」。
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveYear("all")}
            className={
              activeYear === "all"
                ? "rounded-full bg-primary/15 px-3 py-1.5 text-sm font-medium text-primary"
                : "rounded-full px-3 py-1.5 text-sm text-n-5 transition-colors hover:text-primary"
            }
          >
            All
          </button>
          {years.map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => setActiveYear(year)}
              className={
                activeYear === year
                  ? "rounded-full bg-primary/15 px-3 py-1.5 text-sm font-medium text-primary"
                  : "rounded-full px-3 py-1.5 text-sm text-n-5 transition-colors hover:text-primary"
              }
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-12 space-y-14">
        {groups.map(([year, items]) => (
          <section
            key={year}
            className="grid gap-6 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-8"
          >
            <div className="hidden md:block">
              <p className="text-xs uppercase tracking-[0.18em] text-n-4">
                Year
              </p>
              <div className="mt-3 flex items-baseline gap-3">
                <p className="text-3xl font-medium tracking-tight text-n-6">
                  {year}
                </p>
                <p className="site-meta text-n-5">{items.length}</p>
              </div>
            </div>

            <div className="relative pl-8 md:pl-10">
              <div className="absolute bottom-0 left-3 top-0 w-px bg-gradient-to-b from-primary/20 via-zinc-200 to-zinc-100 dark:via-zinc-800 dark:to-zinc-900" />
              <div className="mb-6 md:hidden">
                <p className="text-2xl font-medium tracking-tight text-n-6">
                  {year}
                </p>
              </div>
              <div className="space-y-10">
                {items.map((item) => (
                  <article key={item.slug} className="relative pl-2">
                    <span className="absolute -left-[1.85rem] top-2 size-3 rounded-full border border-primary/40 bg-background shadow-[0_0_0_4px_rgba(56,189,248,0.08)]" />
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <time dateTime={item.date} className="site-meta text-n-5">
                        {formatMonthDay(item.date)}
                      </time>
                      {item.caption ? (
                        <p className="site-meta text-n-4">{item.caption}</p>
                      ) : null}
                    </div>

                    <div
                      className={
                        item.images.length === 1
                          ? "mt-4 overflow-hidden rounded-[1.5rem] border border-n-2 bg-n-1/20"
                          : "mt-4 grid gap-3 sm:grid-cols-2"
                      }
                    >
                      {item.images.map((src) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={src}
                          src={src}
                          alt={item.caption ?? "拾光"}
                          className="h-auto w-full rounded-[1.5rem] border border-n-2 object-cover"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
