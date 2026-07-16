"use client"

import { Check, ChevronUp } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

const ROOT = "[data-reading-progress-root]"
const R = 9
const C = 2 * Math.PI * R

function getProgress(): number {
  const el = document.querySelector(ROOT) as HTMLElement | null
  if (!el) return 0
  const scrollY = window.scrollY
  const rect = el.getBoundingClientRect()
  const top = rect.top + scrollY
  const height = Math.max(el.scrollHeight, rect.height)
  const denom = top + height - window.innerHeight - top
  if (height - window.innerHeight <= 0) {
    return scrollY >= top ? 100 : 0
  }
  const raw = ((scrollY - top) / denom) * 100
  return Math.min(100, Math.max(0, raw))
}

/** Top thin bar — always visible on article pages. */
export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let raf = 0
    const tick = () => {
      setProgress(getProgress())
    }
    const onScroll = () => {
      window.cancelAnimationFrame(raf)
      raf = window.requestAnimationFrame(tick)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    tick()
    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] bg-transparent"
      aria-hidden
    >
      <div
        className="h-full bg-primary transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

/** Circular progress + back-to-top for sidebar (xiami-style). */
export function ReadingProgressRail() {
  const [progress, setProgress] = useState(0)
  const [finished, setFinished] = useState(false)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    let raf = 0
    const tick = () => {
      const p = getProgress()
      if (p >= 100) {
        setProgress(100)
        setFinished(true)
      } else {
        setProgress(p)
        setFinished(false)
      }
      setShowTop(window.scrollY > 420)
    }
    const onScroll = () => {
      window.cancelAnimationFrame(raf)
      raf = window.requestAnimationFrame(tick)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    tick()
    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  const offset = useMemo(() => {
    if (finished) return 0
    return C - (progress / 100) * C
  }, [finished, progress])

  const label = finished ? "Finish" : `${Math.round(progress)}%`

  return (
    <div className="mb-4 space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-n-6">
        <span className="relative h-6 w-6 shrink-0">
          <svg
            aria-hidden
            className="h-full w-full -rotate-90"
            viewBox="0 0 24 24"
          >
            <circle
              cx="12"
              cy="12"
              r={R}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              className="text-n-2"
            />
            <circle
              cx="12"
              cy="12"
              r={R}
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2.25"
              className="text-primary transition-[stroke-dashoffset] duration-150 ease-out"
              style={{
                strokeDasharray: C,
                strokeDashoffset: offset,
              }}
            />
          </svg>
          {finished ? (
            <Check
              aria-hidden
              className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 text-primary"
              strokeWidth={2.5}
            />
          ) : null}
        </span>
        <span className="tabular-nums tracking-wide">{label}</span>
      </div>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`flex items-center gap-1.5 py-[5px] text-left text-xs font-medium uppercase leading-6 tracking-[0.16em] text-n-5 transition-all duration-300 hover:text-primary ${
          showTop
            ? "pointer-events-auto opacity-100 translate-x-0"
            : "pointer-events-none opacity-0 -translate-x-2"
        }`}
      >
        <ChevronUp className="h-3.5 w-3.5" aria-hidden />
        Back To Top
      </button>
    </div>
  )
}
