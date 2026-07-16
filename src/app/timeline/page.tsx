import type { Metadata } from "next"
import { SiteTimeline } from "@/components/timeline/SiteTimeline"
import { getTimelineEntries } from "@/lib/content/load"

export const metadata: Metadata = {
  title: "拾光",
}

type SearchParams = Promise<{ type?: string }>

export default async function TimelinePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const type =
    sp.type === "posts" || sp.type === "updates" || sp.type === "glimpse"
      ? sp.type
      : "all"
  const entries = getTimelineEntries().filter((e) => {
    if (type === "posts") return e.kind === "post"
    if (type === "updates") return e.kind === "update"
    if (type === "glimpse") return e.kind === "glimpse"
    return true
  })

  return (
    <div className="mx-auto w-full max-w-5xl px-6 pb-20 pt-2 sm:px-10 lg:px-24">
      <p className="site-eyebrow uppercase tracking-[0.28em] text-n-5">
        Timeline
      </p>
      <h1 className="site-title-page mt-4 flex flex-wrap items-baseline gap-3 tracking-tight text-n-6">
        <span>拾光</span>
        <span className="site-body tracking-normal text-n-4">·</span>
        <span className="site-body tracking-normal text-n-5">时光机</span>
      </h1>
      <SiteTimeline entries={entries} initialKind={type === "all" ? "all" : type === "posts" ? "post" : type === "updates" ? "update" : "glimpse"} />
    </div>
  )
}
