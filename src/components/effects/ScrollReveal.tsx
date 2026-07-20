"use client"

import { useEffect, useRef, type ReactNode } from "react"

type Props = {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  once?: boolean
}

/**
 * Lightweight scroll entry — transform/opacity only.
 * Prefers IntersectionObserver over scroll listeners.
 *
 * Usage rules (Phase 4):
 * - Wrap headers / toolbars / short cards only.
 * - NEVER wrap tall full-page lists (UpdateTimeline, SiteTimeline, PostList).
 *   Those use CSS row animations instead. Tall wrappers cause blank-on-load.
 * - Threshold 0 + mount in-viewport check for partial visibility.
 */
export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  y = 18,
  once = true,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) {
      el.dataset.revealed = "true"
      return
    }

    el.style.setProperty("--reveal-y", `${y}px`)
    el.style.setProperty("--reveal-delay", `${delay}ms`)

    const reveal = () => {
      el.dataset.revealed = "true"
    }

    // Already above the fold (or partially so) on mount → show now.
    // Covers tall list wrappers where ratio-based thresholds fail.
    const rect = el.getBoundingClientRect()
    const vh = window.innerHeight || document.documentElement.clientHeight
    if (rect.top < vh && rect.bottom > 0) {
      reveal()
      if (once) return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // isIntersecting is enough — do not require a % of a tall element
          if (entry.isIntersecting) {
            reveal()
            if (once) io.unobserve(el)
          } else if (!once) {
            el.dataset.revealed = "false"
          }
        }
      },
      { threshold: 0, rootMargin: "0px 0px -4% 0px" },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [delay, once, y])

  return (
    <div ref={ref} className={`scroll-reveal ${className}`}>
      {children}
    </div>
  )
}
