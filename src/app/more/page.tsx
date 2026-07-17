import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, Bookmark, BriefcaseBusiness, Handshake } from "lucide-react"

export const metadata: Metadata = {
  title: "远方",
}

const HUB = [
  {
    href: "/projects",
    title: "项目",
    en: "Projects",
    desc: "正在进行的项目、实验与长期计划。",
    icon: BriefcaseBusiness,
  },
  {
    href: "/friends",
    title: "友链",
    en: "Friends",
    desc: "喜欢的网站、朋友与同行者链接。",
    icon: Handshake,
  },
  {
    href: "/bookmarks",
    title: "书签",
    en: "Bookmarks",
    desc: "平时收藏的文章、工具与资源链接。",
    icon: Bookmark,
  },
] as const

export default function MorePage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-16 sm:px-10">
      <header>
        <p className="site-eyebrow uppercase tracking-[0.28em] text-n-5">
          More
        </p>
        <h1 className="site-title-page mt-4 flex flex-wrap items-baseline gap-3 tracking-tight text-n-6">
          <span>远方</span>
          <span className="site-body tracking-normal text-n-4">·</span>
          <span className="site-body tracking-normal text-n-5">更多功能</span>
        </h1>
      </header>

      <section className="mt-12 grid gap-3 sm:grid-cols-2">
        {HUB.map((item, index) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={`进入${item.title}页面`}
              className="more-hub-card group relative flex items-start gap-4 overflow-hidden rounded-3xl border border-n-2/80 bg-n-1/20 px-4 py-6 transition-all duration-300 hover:border-primary/25 hover:bg-primary/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary dark:bg-n-1/15 sm:px-5"
              style={{ animationDelay: `${index * 0.06}s` }}
            >
              <span className="more-hub-icon mt-0.5 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-n-1 text-n-5 transition-all duration-300 group-hover:scale-105 group-hover:bg-primary/10 group-hover:text-primary dark:bg-n-1 dark:text-n-5 dark:group-hover:bg-primary/15">
                <Icon className="h-5 w-5" strokeWidth={1.9} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="site-title-h2 flex flex-wrap items-baseline gap-x-3 gap-y-1 tracking-tight text-n-6 transition duration-200 group-hover:text-primary dark:text-n-6">
                  <span>{item.title}</span>
                  <span className="text-xs font-medium uppercase tracking-[0.24em] text-n-4">
                    {item.en}
                  </span>
                </h2>
                <p className="mt-3 max-w-sm text-sm leading-7 text-n-5">
                  {item.desc}
                </p>
              </div>
              <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-n-4 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 group-hover:text-primary" />
            </Link>
          )
        })}
      </section>
    </main>
  )
}
