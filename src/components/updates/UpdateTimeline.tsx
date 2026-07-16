import { MarkdownBody } from "@/components/markdown/MarkdownBody"

type UpdateItem = {
  slug: string
  date: string
  html: string
}

type YearGroup = {
  year: string
  items: UpdateItem[]
}

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

function groupByYear(items: UpdateItem[]): YearGroup[] {
  const map = new Map<string, UpdateItem[]>()
  for (const item of items) {
    const year = item.date.slice(0, 4) || "Unknown"
    if (!map.has(year)) map.set(year, [])
    map.get(year)!.push(item)
  }
  // preserve incoming order within year (already sorted by page)
  return [...map.entries()].map(([year, yearItems]) => ({
    year,
    items: yearItems,
  }))
}

function parseParts(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) {
    return {
      month: iso.slice(5, 7),
      day: iso.slice(8, 10) || "--",
      time: "",
    }
  }
  return {
    month: MONTH_SHORT[d.getMonth()] ?? "",
    day: String(d.getDate()).padStart(2, "0"),
    time: d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  }
}

export function UpdateTimeline({
  items,
  author,
}: {
  items: UpdateItem[]
  author?: string
}) {
  if (items.length === 0) {
    return (
      <p className="site-meta text-n-5">
        还没有足迹。写下一则短动态，记录此刻吧。
      </p>
    )
  }

  const groups = groupByYear(items)

  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <section key={group.year} className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="shrink-0 text-xl font-medium tracking-tight text-n-6 sm:text-2xl">
              {group.year}
            </h2>
            <div className="h-px flex-1 bg-n-2 dark:bg-n-2" />
          </div>

          <div className="grid gap-0">
            {group.items.map((item) => {
              const { month, day, time } = parseParts(item.date)
              return (
                <article
                  key={item.slug}
                  id={item.slug}
                  className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 border-b border-n-2 py-6 last:border-b-0 scroll-mt-28 dark:border-n-2 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:gap-6"
                >
                  <div className="flex items-baseline gap-2 sm:block">
                    <p className="site-meta text-n-5 sm:text-xs sm:uppercase sm:tracking-[0.14em]">
                      {month}
                    </p>
                    <p className="text-2xl font-medium tabular-nums tracking-tight text-n-6 sm:mt-1 sm:text-3xl">
                      {day}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <div className="reading-copy update-body text-n-6">
                      <MarkdownBody html={item.html} />
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-4 text-n-5">
                      <time dateTime={item.date} className="site-meta">
                        {time || item.date.slice(0, 10)}
                      </time>
                      {author ? (
                        <span className="site-meta text-n-4">{author}</span>
                      ) : null}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
