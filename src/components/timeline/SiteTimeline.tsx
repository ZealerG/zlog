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
    return <p className="site-meta mt-8 text-n-5">时间线还是空的。</p>
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-end gap-x-3 gap-y-2 text-n-4">
        <p className="rounded-[1.75rem] border border-n-2 bg-n-1/40 px-4 py-3 text-sm text-n-5">
          {entries.length} entries
        </p>
        <p className="site-body max-w-xl text-n-5">
          拾光时间线汇总「篇章」与「足迹」——回看写作与日常。
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
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
                ? "rounded-full bg-primary/15 px-3 py-1.5 text-sm font-medium text-primary"
                : "rounded-full px-3 py-1.5 text-sm text-n-5 transition-colors hover:text-primary"
            }
          >
            {label}
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-n-2" />
        <button
          type="button"
          onClick={() => setActiveYear("all")}
          className={
            activeYear === "all"
              ? "rounded-full bg-primary/15 px-3 py-1.5 text-sm font-medium text-primary"
              : "rounded-full px-3 py-1.5 text-sm text-n-5 transition-colors hover:text-primary"
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
                ? "rounded-full bg-primary/15 px-3 py-1.5 text-sm font-medium text-primary"
                : "rounded-full px-3 py-1.5 text-sm text-n-5 transition-colors hover:text-primary"
            }
          >
            {year}
          </button>
        ))}
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
              <div className="space-y-8">
                {items.map((item) => (
                  <article
                    key={`${item.kind}-${item.href}-${item.date}`}
                    id={item.href.includes("#") ? item.href.split("#")[1] : undefined}
                    className="relative pl-2"
                  >
                    <span className="absolute -left-[1.85rem] top-2 size-3 rounded-full border border-primary/40 bg-background shadow-[0_0_0_4px_rgba(56,189,248,0.08)]" />
                    <div className="flex flex-wrap items-center gap-2">
                      <time dateTime={item.date} className="site-meta text-n-5">
                        {formatMonthDay(item.date)}
                      </time>
                      <span className="rounded-full border border-n-2 px-2 py-0.5 text-[11px] text-n-4">
                        {KIND_LABEL[item.kind]}
                      </span>
                      {item.draft ? (
                        <span className="text-[11px] text-primary">Draft</span>
                      ) : null}
                    </div>
                    <Link
                      href={item.href}
                      className="mt-2 block text-base font-medium tracking-tight text-n-6 transition-colors hover:text-primary"
                    >
                      {item.title}
                    </Link>
                    {item.summary && item.summary !== item.title ? (
                      <p className="reading-copy mt-1 max-w-2xl text-sm leading-relaxed text-n-5">
                        {item.summary}
                      </p>
                    ) : null}
                    {item.images?.length ? (
                      <div
                        className={
                          item.images.length === 1
                            ? "mt-3 overflow-hidden rounded-[1.25rem] border border-n-2"
                            : "mt-3 grid gap-2 sm:grid-cols-2"
                        }
                      >
                        {item.images.slice(0, 4).map((src) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={src}
                            src={src}
                            alt=""
                            className="h-auto w-full rounded-[1.25rem] border border-n-2 object-cover"
                            loading="lazy"
                          />
                        ))}
                      </div>
                    ) : null}
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
