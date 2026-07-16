"use client"

import { useEffect, useState } from "react"

export function Typewriter({
  text,
  className = "",
}: {
  text: string
  className?: string
}) {
  const [shown, setShown] = useState("")
  const [done, setDone] = useState(false)

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) {
      setShown(text)
      setDone(true)
      return
    }

    setShown("")
    setDone(false)
    let i = 0
    let intervalId = 0
    const start = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        i += 1
        setShown(text.slice(0, i))
        if (i >= text.length) {
          window.clearInterval(intervalId)
          setDone(true)
        }
      }, 55)
    }, 700)

    return () => {
      window.clearTimeout(start)
      window.clearInterval(intervalId)
    }
  }, [text])

  return (
    <span
      className={`hero-copy-typewriter font-mono text-[0.95em] text-primary ${className}`}
      aria-label={text}
    >
      <span className="hero-copy-typewriter-ghost" aria-hidden>
        {text}
      </span>
      <span className="hero-copy-typewriter-text" aria-hidden>
        {shown}
        <span
          className={
            done
              ? "hero-copy-typewriter-caret"
              : "hero-copy-typewriter-caret hero-copy-typewriter-caret-solid"
          }
        >
          _
        </span>
      </span>
    </span>
  )
}
