"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useMemo, useState } from "react"
import type { NavPreviewData, NavPreviewLink } from "@/lib/content/nav-preview"

function PreviewItem({
  item,
  onNavigate,
}: {
  item: NavPreviewLink
  onNavigate?: () => void
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className="group grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 rounded-lg px-2.5 py-2 transition-colors duration-200 hover:bg-primary/[0.06]"
    >
      <div className="min-w-0 overflow-hidden">
        {!item.compact && item.kind ? (
          <span className="site-eyebrow block tracking-[0.14em] text-n-4">
            {item.kind}
          </span>
        ) : null}
        <p
          className={`${item.compact ? "site-meta" : "site-meta mt-1"} block truncate font-medium text-n-6 transition group-hover:text-primary`}
          title={item.title}
        >
          {item.title}
        </p>
        {!item.compact && item.category && item.kind !== "足迹" ? (
          <p className="site-eyebrow mt-1 block truncate text-n-5" title={item.category}>
            {item.category}
          </p>
        ) : null}
      </div>
      {item.date ? (
        <span className="site-eyebrow shrink-0 whitespace-nowrap pt-0.5 tabular-nums text-n-4">
          {item.date}
        </span>
      ) : null}
    </Link>
  )
}

function CardLink({
  href,
  title,
  eyebrow,
  onNavigate,
}: {
  href: string
  title: string
  eyebrow: string
  onNavigate?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="group grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-2 rounded-xl px-2.5 py-2.5 transition-colors duration-200 hover:bg-primary/[0.06]"
    >
      <div className="min-w-0 overflow-hidden">
        <p className="site-eyebrow text-n-4">{eyebrow}</p>
        <span
          className="site-meta mt-2 block truncate font-medium text-n-6 transition group-hover:text-primary"
          title={title}
        >
          {title}
        </span>
      </div>
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center text-n-4 transition group-hover:text-primary">
        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}

export function NavPreviewPanel({
  href,
  data,
  onNavigate,
}: {
  href: string
  data: NavPreviewData
  onNavigate?: () => void
}) {
  const section = data[href]
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  const activeCategory = useMemo(() => {
    if (!section?.categories?.length) return null
    return (
      section.categories.find((c) => c.slug === hoveredCategory) ??
      section.categories[0]
    )
  }, [hoveredCategory, section])

  if (!section) return null

  return (
    <div className="surface-shell menu-shell nav-preview-panel w-full max-w-full overflow-hidden p-3.5">
      <section className="menu-section min-w-0">
        <div className="mb-1 flex min-w-0 items-center justify-between gap-3 px-1">
          <p className="menu-eyebrow min-w-0 truncate !pb-0">{section.eyebrow}</p>
          <Link
            href={href}
            onClick={onNavigate}
            className="site-meta shrink-0 text-xs text-primary transition hover:opacity-80"
          >
            View all
          </Link>
        </div>

        {section.mode === "categories" && section.categories ? (
          <div className="mt-2 grid min-w-0 items-start gap-4 md:grid-cols-[8.5rem_minmax(0,1fr)]">
            <div className="grid min-w-0 items-start gap-0.5 border-n-2/70 md:border-r md:pr-3 dark:border-white/10">
              {section.categories.map((cat) => {
                const active = activeCategory?.slug === cat.slug
                return (
                  <Link
                    key={cat.slug}
                    href={cat.href}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setHoveredCategory(cat.slug)}
                    onFocus={() => setHoveredCategory(cat.slug)}
                    onClick={onNavigate}
                    className={`site-eyebrow flex min-w-0 items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left transition-all ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-n-5 hover:bg-n-1/60 hover:text-primary dark:hover:bg-white/5"
                    }`}
                  >
                    <span className="min-w-0 truncate">{cat.label}</span>
                    <span className="shrink-0 text-[11px] opacity-70">
                      {cat.count}
                    </span>
                  </Link>
                )
              })}
            </div>
            <div className="grid min-w-0 gap-0.5">
              {section.items
                .filter((item) =>
                  activeCategory
                    ? (item.category || "未分类") === activeCategory.label
                    : true,
                )
                .slice(0, 5)
                .map((item) => (
                  <PreviewItem
                    key={item.href + item.title}
                    item={item}
                    onNavigate={onNavigate}
                  />
                ))}
              {section.items.filter((item) =>
                activeCategory
                  ? (item.category || "未分类") === activeCategory.label
                  : true,
              ).length === 0 ? (
                <p className="site-meta px-2 py-2 text-n-4">
                  {section.empty ?? "暂无内容"}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {section.mode === "list" ? (
          <div className="mt-1.5 grid min-w-0 gap-0.5">
            {section.items.length > 0 ? (
              section.items.map((item) => (
                <PreviewItem
                  key={item.href + item.title}
                  item={item}
                  onNavigate={onNavigate}
                />
              ))
            ) : (
              <p className="site-meta px-2 py-2 text-n-4">
                {section.empty ?? "暂无内容"}
              </p>
            )}
          </div>
        ) : null}

        {section.mode === "timeline" ? (
          <div className="mt-1.5 grid min-w-0 gap-4">
            <div className="grid min-w-0 gap-0.5">
              {section.items.map((item) => (
                <PreviewItem
                  key={item.href + item.title}
                  item={item}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
            {section.footer?.length ? (
              <div className="grid min-w-0 gap-1 border-t border-n-2 pt-3 sm:grid-cols-2 dark:border-n-2">
                {section.footer.map((f) => (
                  <CardLink
                    key={f.href}
                    href={f.href}
                    title={f.title}
                    eyebrow={f.eyebrow}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {section.mode === "cards" ? (
          <div className="mt-1.5 grid min-w-0 gap-1 sm:grid-cols-2">
            {section.items.length > 0 ? (
              section.items.map((item) => (
                <CardLink
                  key={item.href + item.title}
                  href={item.href}
                  title={item.title}
                  eyebrow={item.kind ?? "Link"}
                  onNavigate={onNavigate}
                />
              ))
            ) : (
              <p className="site-meta px-2 py-2 text-n-4 sm:col-span-2">
                {section.empty ?? "暂无内容"}
              </p>
            )}
          </div>
        ) : null}
      </section>
    </div>
  )
}
