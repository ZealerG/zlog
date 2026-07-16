import type { Metadata } from "next"
import Link from "next/link"
import { Bookmark, BriefcaseBusiness, Handshake } from "lucide-react"

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
      <p className="site-eyebrow uppercase tracking-[0.28em] text-n-5">More</p>
      <h1 className="site-title-page mt-4 flex flex-wrap items-baseline gap-3 tracking-tight text-n-6">
        <span>远方</span>
        <span className="site-body tracking-normal text-n-4">·</span>
        <span className="site-body tracking-normal text-n-5">更多功能</span>
      </h1>

      <section className="mt-12 grid gap-4 sm:grid-cols-2">
        {HUB.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={`进入${item.title}页面`}
              className="group flex items-start gap-4 rounded-3xl px-1 py-6 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              <span className="mt-1 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-n-1 text-n-5 transition-colors group-hover:bg-primary/10 group-hover:text-primary dark:bg-n-1 dark:text-n-5 dark:group-hover:bg-primary/15">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <h2 className="site-title-h2 flex items-baseline gap-3 tracking-tight text-n-6 transition group-hover:text-primary dark:text-n-6">
                  <span>{item.title}</span>
                  <span className="text-xs font-medium uppercase tracking-[0.24em] text-n-4">
                    {item.en}
                  </span>
                </h2>
                <p className="mt-4 text-sm leading-7 text-n-5">{item.desc}</p>
              </div>
            </Link>
          )
        })}
      </section>
    </main>
  )
}
