"use client"

import { useEffect, useRef } from "react"

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  a: number
}

export function AmbientCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf = 0
    let particles: Particle[] = []
    let w = 0
    let h = 0
    let dpr = 1

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas!.width = Math.floor(w * dpr)
      canvas!.height = Math.floor(h * dpr)
      canvas!.style.width = `${w}px`
      canvas!.style.height = `${h}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.min(70, Math.floor((w * h) / 22000))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.4 + 0.4,
        a: Math.random() * 0.35 + 0.08,
      }))
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h)

      const dark = document.documentElement.classList.contains("dark")
      const glow = dark ? "56, 189, 248" : "94, 129, 172"
      const dot = dark ? "148, 163, 184" : "100, 116, 139"

      // soft primary glows
      const g1 = ctx!.createRadialGradient(w * 0.5, -h * 0.05, 0, w * 0.5, 0, h * 0.55)
      g1.addColorStop(0, `rgba(${glow}, 0.12)`)
      g1.addColorStop(1, `rgba(${glow}, 0)`)
      ctx!.fillStyle = g1
      ctx!.fillRect(0, 0, w, h)

      const g2 = ctx!.createRadialGradient(w * 0.5, h * 1.05, 0, w * 0.5, h, h * 0.45)
      g2.addColorStop(0, `rgba(${glow}, 0.08)`)
      g2.addColorStop(1, `rgba(${glow}, 0)`)
      ctx!.fillStyle = g2
      ctx!.fillRect(0, 0, w, h)

      if (!prefersReduced) {
        for (const p of particles) {
          p.x += p.vx
          p.y += p.vy
          if (p.x < -10) p.x = w + 10
          if (p.x > w + 10) p.x = -10
          if (p.y < -10) p.y = h + 10
          if (p.y > h + 10) p.y = -10

          ctx!.beginPath()
          ctx!.fillStyle = `rgba(${dot}, ${p.a})`
          ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx!.fill()
        }

        // faint links
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const a = particles[i]
            const b = particles[j]
            const dx = a.x - b.x
            const dy = a.y - b.y
            const dist = Math.hypot(dx, dy)
            if (dist < 110) {
              const alpha = (1 - dist / 110) * (dark ? 0.08 : 0.06)
              ctx!.strokeStyle = `rgba(${glow}, ${alpha})`
              ctx!.lineWidth = 1
              ctx!.beginPath()
              ctx!.moveTo(a.x, a.y)
              ctx!.lineTo(b.x, b.y)
              ctx!.stroke()
            }
          }
        }
      }

      raf = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener("resize", resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
    />
  )
}
