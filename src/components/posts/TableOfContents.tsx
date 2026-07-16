"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { MarkdownHeading } from "@/lib/content/markdown"

type TocGroup = {
  heading: MarkdownHeading
  children: MarkdownHeading[]
}

export function TableOfContents({ headings }: { headings: MarkdownHeading[] }) {
  const [activeId, setActiveId] = useState<string>("")
  const [bar, setBar] = useState({ top: 0, height: 20, opacity: 0 })
  const listRef = useRef<HTMLUListElement>(null)
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({})

  const groups = useMemo(() => {
    const out: TocGroup[] = []
    let current: TocGroup | null = null
    for (const h of headings) {
      if (h.depth === 2 || !current) {
        current = { heading: h, children: [] }
        out.push(current)
      } else {
        current.children.push(h)
      }
    }
    return out
  }, [headings])

  useEffect(() => {
    if (headings.length === 0) return
    const els = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => Boolean(el))
    if (els.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target?.id) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        rootMargin: "-16% 0px -64% 0px",
        threshold: [0, 0.15, 0.35, 0.6, 1],
      },
    )
    for (const el of els) observer.observe(el)
    return () => observer.disconnect()
  }, [headings])

  useEffect(() => {
    if (!activeId || !listRef.current) {
      setBar((b) => ({ ...b, opacity: 0 }))
      return
    }
    const item = itemRefs.current[activeId]
    const list = listRef.current
    if (!item) return
    const listRect = list.getBoundingClientRect()
    const itemRect = item.getBoundingClientRect()
    setBar({
      top: itemRect.top - listRect.top + list.scrollTop + 4,
      height: Math.max(itemRect.height - 8, 14),
      opacity: 1,
    })
  }, [activeId, headings])

  if (headings.length === 0) return null

  return (
    <>
      {/* mobile */}
      <nav
        aria-label="文章目录"
        className="mb-8 overflow-x-auto rounded-2xl border border-n-2 bg-n-1/30 p-3 lg:hidden"
      >
        <p className="menu-eyebrow px-1">目录</p>
        <ul className="mt-1 flex gap-2">
          {headings.map((heading) => (
            <li key={heading.id} className="shrink-0">
              <a
                href={`#${heading.id}`}
                className={
                  activeId === heading.id
                    ? "inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary transition"
                    : "inline-flex rounded-full border border-n-2 px-3 py-1 text-xs text-n-5 transition hover:border-primary/30 hover:text-primary"
                }
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* desktop rail */}
      <nav
        aria-label="文章目录"
        className="relative hidden flex-col gap-1 pl-1 text-sm lg:flex"
      >
        <p className="site-eyebrow mb-3 tracking-[0.16em] text-n-4">目录</p>
        <div className="relative">
          <span
            aria-hidden
            className="absolute -left-5 top-0 bottom-0 w-px bg-n-2/80"
          />
          <span
            aria-hidden
            className="toc-active-bar absolute -left-[1.3rem] w-[3px] rounded-full bg-primary"
            style={{
              top: bar.top,
              height: bar.height,
              opacity: bar.opacity,
            }}
          />
          <ul ref={listRef} className="space-y-0.5">
            {groups.map((group, gi) => (
              <li key={group.heading.id} className="toc-item-enter" style={{ animationDelay: `${gi * 0.04}s` }}>
                <a
                  href={`#${group.heading.id}`}
                  data-toc-id={group.heading.id}
                  ref={(el) => {
                    itemRefs.current[group.heading.id] = el
                  }}
                  className={
                    activeId === group.heading.id
                      ? "block rounded-md px-2 py-1.5 font-medium text-primary transition-all duration-200"
                      : "block rounded-md px-2 py-1.5 text-n-5 transition-all duration-200 hover:translate-x-0.5 hover:text-primary"
                  }
                >
                  {group.heading.text}
                </a>
                {group.children.length > 0 ? (
                  <ul className="mt-0.5 space-y-0.5">
                    {group.children.map((child, ci) => (
                      <li
                        key={child.id}
                        className="toc-item-enter"
                        style={{ animationDelay: `${(gi + ci + 1) * 0.03}s` }}
                      >
                        <a
                          href={`#${child.id}`}
                          data-toc-id={child.id}
                          ref={(el) => {
                            itemRefs.current[child.id] = el
                          }}
                          className={
                            activeId === child.id
                              ? "ml-3 block rounded-md px-2 py-1 text-[0.82rem] font-medium text-primary transition-all duration-200"
                              : "ml-3 block rounded-md px-2 py-1 text-[0.82rem] text-n-5 transition-all duration-200 hover:translate-x-0.5 hover:text-primary"
                          }
                        >
                          {child.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  )
}
