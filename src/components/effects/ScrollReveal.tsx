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
 * Prefers IntersectionObserver over scroll listeners (gpt-taste / performance).
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

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.dataset.revealed = "true"
            if (once) io.unobserve(el)
          } else if (!once) {
            el.dataset.revealed = "false"
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
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
