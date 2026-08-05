import { ScrollReveal } from "@/components/effects/ScrollReveal"
import {
  SiteTimeline,
  type TimelineKindFilter,
} from "@/components/timeline/SiteTimeline"
import { getTimelineEntries } from "@/lib/content/load"
import { createPageMetadata } from "@/lib/seo"

type SearchParams = Promise<{ type?: string; year?: string }>

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  return createPageMetadata({
    path: "/timeline",
    title: "拾光",
    description: "沿时间浏览文章、动态与影像记录。",
    noIndex: Boolean(sp.type || sp.year),
  })
}

function parseKind(type?: string): TimelineKindFilter {
  if (type === "posts") return "post"
  if (type === "updates") return "update"
  if (type === "glimpse") return "glimpse"
  return "all"
}

export default async function TimelinePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const activeKind = parseKind(sp.type)
  const activeYear =
    typeof sp.year === "string" && /^\d{4}$/.test(sp.year) ? sp.year : "all"

  const entries = getTimelineEntries()

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl overflow-x-hidden px-6 py-16 sm:px-10">
      <ScrollReveal y={14}>
        <header>
          <p className="site-eyebrow uppercase tracking-[0.28em] text-n-5">
            时间线
          </p>
          <h1 className="site-title-page mt-4 flex flex-wrap items-baseline gap-3 tracking-tight text-n-6">
            <span>拾光</span>
            <span className="site-body tracking-normal text-n-4">·</span>
            <span className="site-body tracking-normal text-n-5">时光机</span>
          </h1>
        </header>
      </ScrollReveal>

      {/* Tall list: no ScrollReveal wrapper (avoids threshold blank-on-load) */}
      <SiteTimeline
        entries={entries}
        activeKind={activeKind}
        activeYear={activeYear}
      />
    </main>
  )
}
