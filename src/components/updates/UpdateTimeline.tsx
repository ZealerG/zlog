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
      <div className="rounded-2xl border border-dashed border-n-2 px-6 py-14 text-center">
        <p className="site-meta text-n-5">还没有足迹。</p>
        <p className="site-meta mt-2 text-n-4">
          在 <code>content/updates/</code> 或微语 memo 中写下一则短动态即可。
        </p>
      </div>
    )
  }

  const groups = groupByYear(items)
  let rowIndex = 0

  return (
    <div className="space-y-12">
      {groups.map((group) => (
        <section key={group.year} className="space-y-2">
          <div className="flex items-center gap-4">
            <h2 className="site-title-h3 shrink-0 tracking-[0.14em] text-n-4">
              {group.year}
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-n-2 via-n-2 to-transparent dark:from-n-2 dark:via-n-2" />
            <span className="site-meta shrink-0 text-n-4">
              {group.items.length}
            </span>
          </div>

          <div className="grid gap-0">
            {group.items.map((item) => {
              const { month, day, time } = parseParts(item.date)
              const delay = `${Math.min(rowIndex * 0.045, 0.45)}s`
              rowIndex += 1
              return (
                <article
                  key={item.slug}
                  id={item.slug}
                  className="update-row group grid min-w-0 scroll-mt-28 grid-cols-[minmax(0,1fr)] gap-4 border-b border-n-2 py-7 last:border-b-0 dark:border-n-2 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:gap-7"
                  style={{ animationDelay: delay }}
                >
                  <div className="update-date-col flex items-baseline gap-2 sm:block sm:pt-0.5">
                    <p className="site-meta text-n-5 sm:text-[0.7rem] sm:uppercase sm:tracking-[0.16em]">
                      {month}
                    </p>
                    <p className="text-2xl font-medium tabular-nums tracking-tight text-n-6 transition duration-200 group-hover:text-primary sm:mt-1 sm:text-[1.75rem]">
                      {day}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <div className="reading-copy update-body text-n-6">
                      <MarkdownBody html={item.html} />
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-n-2/60 pt-3 text-n-5 dark:border-n-2/50">
                      <time
                        dateTime={item.date}
                        className="site-meta tabular-nums text-n-5"
                      >
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
