import type { Metadata } from "next"
import Link from "next/link"
import { ScrollReveal } from "@/components/effects/ScrollReveal"
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
    <main className="mx-auto min-h-screen w-full max-w-5xl overflow-x-hidden px-6 py-16 sm:px-10">
      <ScrollReveal y={14}>
        <header>
          <p className="site-eyebrow uppercase tracking-[0.28em] text-n-5">
            Timeline
          </p>
          <h1 className="site-title-page mt-4 flex flex-wrap items-baseline gap-3 tracking-tight text-n-6">
            <span>拾光</span>
            <span className="site-body tracking-normal text-n-4">·</span>
            <span className="site-body tracking-normal text-n-5">时光机</span>
          </h1>
          <p className="site-meta mt-3 max-w-xl text-n-5">
            把{" "}
            <Link href="/posts" className="text-primary transition hover:opacity-80">
              篇章
            </Link>
            、
            <Link
              href="/updates"
              className="text-primary transition hover:opacity-80"
            >
              足迹
            </Link>
            {" "}与影像放在同一条时间线上回看。
          </p>
        </header>
      </ScrollReveal>

      <ScrollReveal y={20} delay={60}>
        <SiteTimeline
          entries={entries}
          initialKind={
            type === "all"
              ? "all"
              : type === "posts"
                ? "post"
                : type === "updates"
                  ? "update"
                  : "glimpse"
          }
        />
      </ScrollReveal>
    </main>
  )
}
