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
      className="group rounded-md px-2 py-2 transition-colors duration-200 hover:bg-transparent"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {!item.compact && item.kind ? (
            <span className="site-eyebrow tracking-[0.14em] text-n-4">
              {item.kind}
            </span>
          ) : null}
          <p
            className={`${item.compact ? "site-meta" : "site-meta mt-1"} font-medium text-n-6 transition group-hover:text-primary`}
          >
            {item.title}
          </p>
          {!item.compact && item.category && item.kind !== "足迹" ? (
            <p className="site-eyebrow mt-1 text-n-5">{item.category}</p>
          ) : null}
        </div>
        {item.date ? (
          <span className="site-eyebrow shrink-0 text-n-4">{item.date}</span>
        ) : null}
      </div>
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
      className="group block rounded-md px-2 py-2.5 transition-colors duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="site-eyebrow text-n-4">{eyebrow}</p>
          <span className="site-meta mt-2 block font-medium text-n-6 group-hover:text-primary">
            {title}
          </span>
        </div>
        <span className="inline-flex h-8 w-8 items-center justify-center text-n-4 transition group-hover:text-primary">
          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        </span>
      </div>
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
    <div className="surface-shell menu-shell p-3">
      <section className="menu-section">
        <p className="menu-eyebrow">{section.eyebrow}</p>

        {section.mode === "categories" && section.categories ? (
          <div className="mt-2 grid items-start gap-5 md:grid-cols-[9rem_minmax(0,1fr)]">
            <div className="grid items-start gap-1">
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
                    className={`site-eyebrow flex items-center justify-between rounded-md px-2 py-1.5 text-left transition-colors ${
                      active ? "text-primary" : "text-n-5 hover:text-primary"
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className="text-[11px] opacity-70">{cat.count}</span>
                  </Link>
                )
              })}
            </div>
            <div className="grid gap-1">
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
                <p className="site-meta px-1 py-1 text-n-4">
                  {section.empty ?? "暂无内容"}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {section.mode === "list" ? (
          <div className="mt-1 grid gap-1">
            {section.items.length > 0 ? (
              section.items.map((item) => (
                <PreviewItem
                  key={item.href + item.title}
                  item={item}
                  onNavigate={onNavigate}
                />
              ))
            ) : (
              <p className="site-meta px-1 py-1 text-n-4">
                {section.empty ?? "暂无内容"}
              </p>
            )}
          </div>
        ) : null}

        {section.mode === "timeline" ? (
          <div className="mt-1 grid gap-5">
            <div className="grid gap-1">
              {section.items.map((item) => (
                <PreviewItem
                  key={item.href + item.title}
                  item={item}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
            {section.footer?.length ? (
              <div className="grid gap-2 border-t border-n-2 pt-3 sm:grid-cols-2 dark:border-n-2">
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
          <div className="mt-1 grid gap-2 sm:grid-cols-2">
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
              <p className="site-meta px-1 py-1 text-n-4 sm:col-span-2">
                {section.empty ?? "暂无内容"}
              </p>
            )}
          </div>
        ) : null}
      </section>
    </div>
  )
}
