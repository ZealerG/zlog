"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import type { TimelineEntry } from "@/lib/content/load"

function yearOf(iso: string) {
  return iso.slice(0, 4)
}

function formatMonthDay(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

const KIND_LABEL: Record<TimelineEntry["kind"], string> = {
  post: "篇章",
  update: "足迹",
  glimpse: "影像",
}

const KIND_TONE: Record<TimelineEntry["kind"], string> = {
  post: "timeline-kind-post",
  update: "timeline-kind-update",
  glimpse: "timeline-kind-glimpse",
}

export function SiteTimeline({
  entries,
  initialKind = "all",
}: {
  entries: TimelineEntry[]
  initialKind?: "all" | TimelineEntry["kind"]
}) {
  const years = useMemo(() => {
    const set = new Set(entries.map((e) => yearOf(e.date)))
    return [...set].sort((a, b) => (a < b ? 1 : -1))
  }, [entries])

  const [activeYear, setActiveYear] = useState("all")
  const [activeKind, setActiveKind] = useState<"all" | TimelineEntry["kind"]>(
    initialKind,
  )

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (activeYear !== "all" && yearOf(e.date) !== activeYear) return false
      if (activeKind !== "all" && e.kind !== activeKind) return false
      return true
    })
  }, [activeKind, activeYear, entries])

  const groups = useMemo(() => {
    const map = new Map<string, TimelineEntry[]>()
    for (const e of filtered) {
      const y = yearOf(e.date)
      if (!map.has(y)) map.set(y, [])
      map.get(y)!.push(e)
    }
    return [...map.entries()].sort(([a], [b]) => (a < b ? 1 : -1))
  }, [filtered])

  if (entries.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border border-dashed border-n-2 px-6 py-14 text-center">
        <p className="site-meta text-n-5">时间线还是空的。</p>
        <p className="site-meta mt-2 text-n-4">
          写一篇篇章或一则足迹，就会出现在这里。
        </p>
      </div>
    )
  }

  let row = 0

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
        <div className="glass-panel rounded-2xl px-4 py-3">
          <p className="text-[0.7rem] uppercase tracking-[0.16em] text-n-4">
            Total
          </p>
          <p className="mt-1 text-2xl font-medium tabular-nums tracking-tight text-n-6">
            {filtered.length}
            <span className="ml-1.5 text-sm font-normal text-n-5">
              / {entries.length}
            </span>
          </p>
        </div>
        <p className="site-body max-w-xl text-n-5">
          Keep this · Stay close — 按类型与年份筛选回看。
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="glass-chip flex flex-wrap items-center gap-1 rounded-full p-1">
          {(
            [
              ["all", "全部"],
              ["post", "篇章"],
              ["update", "足迹"],
              ["glimpse", "影像"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveKind(key)}
              className={
                activeKind === key
                  ? "rounded-full bg-background px-3 py-1.5 text-xs font-medium text-primary shadow-sm transition dark:bg-n-0/80"
                  : "rounded-full px-3 py-1.5 text-xs text-n-5 transition hover:text-primary"
              }
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveYear("all")}
            className={
              activeYear === "all"
                ? "rounded-full bg-primary/12 px-3 py-1.5 text-xs font-medium text-primary"
                : "rounded-full px-3 py-1.5 text-xs text-n-5 transition hover:text-primary"
            }
          >
            All years
          </button>
          {years.map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => setActiveYear(year)}
              className={
                activeYear === year
                  ? "rounded-full bg-primary/12 px-3 py-1.5 text-xs font-medium text-primary"
                  : "rounded-full px-3 py-1.5 text-xs text-n-5 transition hover:text-primary"
              }
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-n-2 px-6 py-12 text-center">
          <p className="site-meta text-n-5">当前筛选下没有条目。</p>
        </div>
      ) : (
        <div className="mt-12 space-y-14">
          {groups.map(([year, items]) => (
            <section
              key={year}
              className="grid gap-6 md:grid-cols-[9.5rem_minmax(0,1fr)] md:gap-10"
            >
              <div className="timeline-year-col hidden md:block">
                <p className="text-[0.7rem] uppercase tracking-[0.18em] text-n-4">
                  Year
                </p>
                <div className="mt-2 flex items-baseline gap-2.5">
                  <p className="text-3xl font-medium tracking-tight text-n-6">
                    {year}
                  </p>
                  <p className="site-meta text-n-5">{items.length}</p>
                </div>
              </div>

              <div className="relative pl-8 md:pl-10">
                <div className="timeline-spine absolute bottom-2 left-3 top-2 w-px" />
                <div className="mb-5 md:hidden">
                  <p className="text-2xl font-medium tracking-tight text-n-6">
                    {year}
                  </p>
                </div>
                <div className="space-y-8">
                  {items.map((item) => {
                    const delay = `${Math.min(row * 0.04, 0.4)}s`
                    row += 1
                    return (
                      <article
                        key={`${item.kind}-${item.href}-${item.date}`}
                        id={
                          item.href.includes("#")
                            ? item.href.split("#")[1]
                            : undefined
                        }
                        className="timeline-item group relative pl-2"
                        style={{ animationDelay: delay }}
                      >
                        <span
                          className={`timeline-dot absolute -left-[1.85rem] top-2 size-3 rounded-full border bg-background ${KIND_TONE[item.kind]}`}
                        />
                        <div className="flex flex-wrap items-center gap-2">
                          <time
                            dateTime={item.date}
                            className="site-meta tabular-nums text-n-5"
                          >
                            {formatMonthDay(item.date)}
                          </time>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[11px] ${KIND_TONE[item.kind]}`}
                          >
                            {KIND_LABEL[item.kind]}
                          </span>
                          {item.draft ? (
                            <span className="text-[11px] text-primary">
                              Draft
                            </span>
                          ) : null}
                        </div>
                        <Link
                          href={item.href}
                          className="mt-2 block text-base font-medium tracking-tight text-n-6 transition duration-200 group-hover:text-primary"
                        >
                          {item.title}
                        </Link>
                        {item.summary && item.summary !== item.title ? (
                          <p className="reading-copy mt-1.5 max-w-2xl text-sm leading-relaxed text-n-5 line-clamp-2">
                            {item.summary}
                          </p>
                        ) : null}
                        {item.images?.length ? (
                          <div
                            className={
                              item.images.length === 1
                                ? "mt-3 overflow-hidden rounded-[1.25rem] border border-n-2 transition duration-200 group-hover:border-primary/25"
                                : "mt-3 grid gap-2 sm:grid-cols-2"
                            }
                          >
                            {item.images.slice(0, 4).map((src, imgIndex) => (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                key={`${src}-${imgIndex}`}
                                src={src}
                                alt=""
                                className="h-auto w-full rounded-[1.25rem] border border-n-2 object-cover transition duration-300 group-hover:brightness-[1.02]"
                                loading="lazy"
                                decoding="async"
                              />
                            ))}
                          </div>
                        ) : null}
                      </article>
                    )
                  })}
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
