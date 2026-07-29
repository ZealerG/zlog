import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowUpRight,
  Bookmark,
  BriefcaseBusiness,
  Handshake,
  Sparkles,
} from "lucide-react"
import { ScrollReveal } from "@/components/effects/ScrollReveal"

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
    featured: true,
  },
  {
    href: "/tokens",
    title: "Tokens",
    en: "Tokscale",
    desc: "AI 编程用量统计，数据来自 Tokscale 公开档案。",
    icon: Sparkles,
    featured: false,
  },
  {
    href: "/friends",
    title: "友链",
    en: "Friends",
    desc: "喜欢的网站、朋友与同行者链接。",
    icon: Handshake,
    featured: false,
  },
  {
    href: "/bookmarks",
    title: "书签",
    en: "Bookmarks",
    desc: "平时收藏的文章、工具与资源链接。",
    icon: Bookmark,
    featured: false,
  },
] as const

export default function MorePage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-16 sm:px-10">
      <ScrollReveal y={14}>
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
      </ScrollReveal>

      <ScrollReveal y={20} delay={50}>
        <section className="mt-12 grid gap-4 sm:grid-cols-2">
          {HUB.map((item, index) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={`进入${item.title}页面`}
                className={
                  item.featured
                    ? "more-hub-card bezel group relative sm:col-span-2"
                    : "more-hub-card bezel group relative"
                }
                style={{ animationDelay: `${index * 0.06}s` }}
              >
                <div className="more-hub-inner surface-shell surface-shell-hover flex items-start gap-4 overflow-hidden px-5 py-6 sm:px-6 sm:py-7">
                  <span className="more-hub-icon mt-0.5 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-n-1 text-n-5 transition-all duration-300 group-hover:scale-105 group-hover:bg-primary/10 group-hover:text-primary dark:bg-white/6 dark:text-n-5 dark:group-hover:bg-primary/15">
                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="site-title-h2 flex flex-wrap items-baseline gap-x-3 gap-y-1 tracking-tight text-n-6 transition duration-200 group-hover:text-primary dark:text-n-6">
                      <span>{item.title}</span>
                      <span className="text-xs font-medium uppercase tracking-[0.24em] text-n-4">
                        {item.en}
                      </span>
                    </h2>
                    <p className="mt-3 max-w-md text-pretty text-sm leading-7 text-n-5">
                      {item.desc}
                    </p>
                  </div>
                  <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-n-1/70 text-n-4 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-primary/12 group-hover:text-primary group-hover:opacity-100 dark:bg-white/6">
                    <ArrowUpRight className="h-4 w-4" strokeWidth={1.9} />
                  </span>
                </div>
              </Link>
            )
          })}
        </section>
      </ScrollReveal>
    </main>
  )
}
