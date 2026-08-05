"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import Matter from "matter-js"
import type { Friend } from "@/lib/content/types"

type PoolItem = {
  body: Matter.Body
  element: HTMLAnchorElement
  width: number
  height: number
  driftSeed: number
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

/** Deterministic pseudo-random in [-1, 1] from seed (xiami-style). */
function seeded(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return (x - Math.floor(x)) * 2 - 1
}

function avatarSrc(friend: Friend) {
  if (friend.avatar) return friend.avatar
  try {
    const host = new URL(friend.url).hostname
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`
  } catch {
    return "/avatar.png"
  }
}

export function FriendFloatPool({ friends }: { friends: Friend[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const nodeMapRef = useRef(new Map<string, HTMLAnchorElement>())
  const dragRef = useRef({
    pointerId: null as number | null,
    node: null as PoolItem | null,
    offsetX: 0,
    offsetY: 0,
    moved: false,
    startX: 0,
    startY: 0,
    velocityX: 0,
    velocityY: 0,
  })
  const pointerRef = useRef({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    active: false,
  })
  useEffect(() => {
    const container = containerRef.current
    if (!container || friends.length === 0) return

    let disposed = false
    let raf = 0
    let resizeRaf = 0
    let engine: Matter.Engine | null = null
    let items: PoolItem[] = []
    let cleanupPointer = () => {}
    let pageVisible = document.visibilityState === "visible"
    let inViewport = false
    let resumeAnimation = () => {}
    const nodeMap = nodeMapRef.current
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")

    const teardown = () => {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      cleanupPointer()
      cleanupPointer = () => {}
      if (engine) {
        Matter.World.clear(engine.world, false)
        Matter.Engine.clear(engine)
        engine = null
      }
      items = []
      resumeAnimation = () => {}
    }

    const setup = () => {
      teardown()
      const { width, height: measuredH } = container.getBoundingClientRect()
      if (!width || !measuredH) return

      engine = Matter.Engine.create({ gravity: { x: 0, y: 0, scale: 0 } })

      // provisional height; refine after measuring cards
      let height = Math.max(measuredH, 448)

      const walls = [
        Matter.Bodies.rectangle(width / 2, -80, width + 320, 160, {
          isStatic: true,
        }),
        Matter.Bodies.rectangle(width / 2, height + 80, width + 320, 160, {
          isStatic: true,
        }),
        Matter.Bodies.rectangle(-80, height / 2, 160, height + 320, {
          isStatic: true,
        }),
        Matter.Bodies.rectangle(width + 80, height / 2, 160, height + 320, {
          isStatic: true,
        }),
      ]
      Matter.World.add(engine.world, walls)

      const padX = Math.max(18, 0.03 * width)
      const padY = Math.max(22, 0.045 * height)
      const floorY = Math.max(height - 120, 240)
      const placed: { x: number; y: number; width: number; height: number }[] =
        []

      items = friends.flatMap((friend, index) => {
        const el = nodeMap.get(friend.slug)
        if (!el) return []
        const rect = el.getBoundingClientRect()
        const w = rect.width || 280
        const h = rect.height || 64
        const seed = 1.37 * index
        const minX = padX + w / 2 + 32
        const maxX = width - padX - w / 2 - 32
        const minY = 82 + h / 2
        const maxY = Math.max(minY, floorY - h / 2 - padY)

        let x = clamp(
          minX + ((seeded(seed + 0.21) + 1) / 2) * Math.max(maxX - minX, 0),
          minX,
          maxX,
        )
        let y = clamp(
          minY + ((seeded(seed + 0.53) + 1) / 2) * Math.max(maxY - minY, 0),
          minY,
          maxY,
        )

        for (let attempt = 0; attempt < 18; attempt++) {
          const tx = clamp(
            minX +
              ((seeded(seed + 0.21 + 0.73 * attempt) + 1) / 2) *
                Math.max(maxX - minX, 0),
            minX,
            maxX,
          )
          const ty = clamp(
            minY +
              ((seeded(seed + 0.53 + 0.61 * attempt) + 1) / 2) *
                Math.max(maxY - minY, 0),
            minY,
            maxY,
          )
          const overlap = placed.some(
            (p) =>
              Math.abs(tx - p.x) < w / 2 + 8 + (p.width / 2 + 8) &&
              Math.abs(ty - p.y) < h / 2 + 8 + (p.height / 2 + 8),
          )
          if (!overlap) {
            x = tx
            y = ty
            break
          }
        }
        placed.push({ x, y, width: w, height: h })

        const body = Matter.Bodies.rectangle(x, y, w, h, {
          frictionAir: 0.085,
          restitution: 0.92,
          friction: 0.02,
          frictionStatic: 0.02,
          chamfer: { radius: h / 2 },
        })
        Matter.Body.setInertia(body, Infinity)
        Matter.Body.setVelocity(body, {
          x: 0.045 * seeded(seed + 0.81),
          y: 0.038 * seeded(seed + 1.17),
        })
        Matter.World.add(engine!.world, body)

        return [
          {
            body,
            element: el,
            width: w,
            height: h,
            driftSeed: seed,
          },
        ]
      })

      // dynamic container height like xiami
      const cols = width >= 1180 ? 4 : width >= 840 ? 3 : width >= 560 ? 2 : 1
      const maxH =
        items.length === 0
          ? 448
          : Math.max(...items.map((i) => i.height), 64)
      height = Math.max(
        448,
        Math.ceil(items.length / cols) * (maxH + 44) + 120,
      )
      container.style.height = `${height}px`

      // update bottom wall after height change
      Matter.Body.setPosition(walls[1], { x: width / 2, y: height + 80 })
      Matter.Body.setPosition(walls[2], { x: -80, y: height / 2 })
      Matter.Body.setPosition(walls[3], { x: width + 80, y: height / 2 })
      Matter.Body.setVertices(
        walls[2],
        Matter.Bodies.rectangle(-80, height / 2, 160, height + 320).vertices,
      )
      Matter.Body.setVertices(
        walls[3],
        Matter.Bodies.rectangle(width + 80, height / 2, 160, height + 320)
          .vertices,
      )

      const onPointerDown = (e: PointerEvent) => {
        const target = e.currentTarget as HTMLAnchorElement
        const item = items.find((i) => i.element === target)
        if (!item) return
        const box = container.getBoundingClientRect()
        const px = e.clientX - box.left
        const py = e.clientY - box.top
        dragRef.current = {
          pointerId: e.pointerId,
          node: item,
          offsetX: px - item.body.position.x,
          offsetY: py - item.body.position.y,
          moved: false,
          startX: px,
          startY: py,
          velocityX: 0,
          velocityY: 0,
        }
        pointerRef.current = { x: px, y: py, vx: 0, vy: 0, active: false }
        target.setPointerCapture(e.pointerId)
        e.preventDefault()
      }

      for (const item of items) {
        item.element.addEventListener("pointerdown", onPointerDown)
      }
      cleanupPointer = () => {
        for (const item of items) {
          item.element.removeEventListener("pointerdown", onPointerDown)
        }
      }

      const onPointerMove = (e: PointerEvent) => {
        const box = container.getBoundingClientRect()
        const px = e.clientX - box.left
        const py = e.clientY - box.top
        const prev = pointerRef.current
        const drag = dragRef.current
        if (drag.pointerId === e.pointerId && drag.node) {
          const node = drag.node
          const hNow = parseFloat(container.style.height) || height
          const nx = clamp(
            px - drag.offsetX,
            node.width / 2 + 28,
            width - node.width / 2 - 28,
          )
          const ny = clamp(
            py - drag.offsetY,
            node.height / 2 + 28,
            hNow - node.height / 2 - 28,
          )
          Matter.Body.setPosition(node.body, { x: nx, y: ny })
          Matter.Body.setVelocity(node.body, { x: 0, y: 0 })
          drag.velocityX = px - prev.x
          drag.velocityY = py - prev.y
          if (
            !drag.moved &&
            Math.hypot(px - drag.startX, py - drag.startY) > 6
          ) {
            drag.moved = true
          }
          pointerRef.current = {
            x: px,
            y: py,
            vx: 0,
            vy: 0,
            active: false,
          }
          return
        }
        pointerRef.current = {
          x: px,
          y: py,
          vx: px - prev.x,
          vy: py - prev.y,
          active: true,
        }
      }

      const onPointerLeave = () => {
        if (dragRef.current.pointerId === null) {
          pointerRef.current = {
            ...pointerRef.current,
            vx: 0,
            vy: 0,
            active: false,
          }
        }
      }

      const onPointerUp = (e: PointerEvent) => {
        const drag = dragRef.current
        if (drag.pointerId === e.pointerId && drag.node) {
          Matter.Body.setVelocity(drag.node.body, {
            x: 0.18 * drag.velocityX,
            y: 0.18 * drag.velocityY,
          })
          if (drag.moved) {
            drag.node.element.dataset.dragSuppressUntil = String(
              Date.now() + 220,
            )
          }
          dragRef.current = {
            pointerId: null,
            node: null,
            offsetX: 0,
            offsetY: 0,
            moved: false,
            startX: 0,
            startY: 0,
            velocityX: 0,
            velocityY: 0,
          }
          pointerRef.current = {
            ...pointerRef.current,
            vx: 0,
            vy: 0,
            active: false,
          }
        }
      }

      container.addEventListener("pointermove", onPointerMove)
      container.addEventListener("pointerleave", onPointerLeave)
      window.addEventListener("pointerup", onPointerUp)

      const prevCleanup = cleanupPointer
      cleanupPointer = () => {
        prevCleanup()
        container.removeEventListener("pointermove", onPointerMove)
        container.removeEventListener("pointerleave", onPointerLeave)
        window.removeEventListener("pointerup", onPointerUp)
      }

      let last = performance.now()
      const tick = (now: number) => {
        raf = 0
        if (
          disposed ||
          !engine ||
          motionQuery.matches ||
          !pageVisible ||
          !inViewport
        ) {
          return
        }
        const t = (now - last) / 1000
        const hNow = parseFloat(container.style.height) || height
        const ptr = pointerRef.current

        for (const item of items) {
          const { body, driftSeed, width: bw, height: bh } = item
          const f1 = 0.00014 * Math.sin(0.4 * t + driftSeed)
          const f2 = 0.00012 * Math.cos(0.3 * t + 0.7 * driftSeed)
          const f3 = 0.00006 * Math.sin(0.19 * t + 0.33 * driftSeed)
          const f4 = 0.000055 * Math.cos(0.24 * t + 0.41 * driftSeed)
          const f5 = 0.000045 * Math.sin(0.16 * t + 1.71 * driftSeed)
          const f6 = 0.000042 * Math.cos(0.18 * t + 1.29 * driftSeed)

          const edgeX = bw / 2 + 0.55 * padX
          const edgeY = bh / 2 + 40
          const wallX =
            body.position.x < edgeX
              ? (edgeX - body.position.x) * 0.000022
              : body.position.x > width - edgeX
                ? -(body.position.x - (width - edgeX)) * 0.000022
                : 0
          const wallY =
            body.position.y < edgeY
              ? (edgeY - body.position.y) * 0.000002
              : body.position.y > hNow - edgeY
                ? -(body.position.y - (hNow - edgeY)) * 0.000002
                : 0

          let pushX = 0
          let pushY = 0
          if (ptr.active) {
            const dx = ptr.x - body.position.x
            const dy = ptr.y - body.position.y
            const dist = Math.hypot(dx, dy)
            if (dist && dist < 420) {
              const a = (420 - dist) / 420
              const s = 0.00085 * Math.pow(a, 1.35)
              const d = 0.00006 * Math.pow(a, 1.7)
              pushX = (dx / dist) * s + ptr.vx * d
              pushY = (dy / dist) * s + ptr.vy * d
            }
          }

          Matter.Body.applyForce(body, body.position, {
            x: f1 + f3 + f5 + wallX + pushX,
            y: f2 + f4 + f6 + wallY + pushY,
          })
        }

        // soft separation
        for (let i = 0; i < items.length; i++) {
          for (let j = i + 1; j < items.length; j++) {
            const a = items[i]
            const b = items[j]
            const dx = b.body.position.x - a.body.position.x
            const dy = b.body.position.y - a.body.position.y
            const minDist = (a.width + b.width) * 0.32
            const dist = Math.hypot(dx, dy)
            if (!dist || dist >= minDist) continue
            const force = ((minDist - dist) / minDist) * 0.00008
            const fx = (dx / dist) * force
            const fy = (dy / dist) * force
            Matter.Body.applyForce(a.body, a.body.position, {
              x: -fx,
              y: -fy,
            })
            Matter.Body.applyForce(b.body, b.body.position, {
              x: fx,
              y: fy,
            })
          }
        }

        Matter.Engine.update(engine, 1000 / 60)

        for (const item of items) {
          const x = item.body.position.x - item.width / 2
          const y = item.body.position.y - item.height / 2
          const bob = 4.5 * Math.sin(1.02 * t + 0.9 * item.driftSeed)
          const rot = 2 * Math.sin(0.64 * t + item.driftSeed)
          item.element.style.transform = `translate3d(${x}px, ${y + bob}px, 0) rotate(${rot}deg)`
          item.element.style.opacity = "1"
        }

        raf = requestAnimationFrame(tick)
      }

      resumeAnimation = () => {
        if (
          raf ||
          disposed ||
          !engine ||
          motionQuery.matches ||
          !pageVisible ||
          !inViewport
        ) {
          return
        }
        last = performance.now()
        raf = requestAnimationFrame(tick)
      }
      resumeAnimation()
    }

    const scheduleSetup = () => {
      if (motionQuery.matches) return
      if (resizeRaf) cancelAnimationFrame(resizeRaf)
      resizeRaf = requestAnimationFrame(() => {
        // wait one frame so cards measure correctly
        requestAnimationFrame(setup)
      })
    }

    const showStaticLayout = () => {
      teardown()
      container.dataset.motion = "reduced"
      container.style.height = ""
      for (const element of nodeMap.values()) {
        element.style.opacity = "1"
        element.style.transform = "none"
      }
    }

    const showAnimatedLayout = () => {
      container.dataset.motion = "active"
      for (const element of nodeMap.values()) {
        element.style.opacity = "0"
        element.style.transform = ""
      }
      scheduleSetup()
    }

    const applyMotionPreference = () => {
      if (motionQuery.matches) showStaticLayout()
      else showAnimatedLayout()
    }

    const onVisibilityChange = () => {
      pageVisible = document.visibilityState === "visible"
      resumeAnimation()
    }

    const viewportObserver = new IntersectionObserver(
      ([entry]) => {
        inViewport = entry.isIntersecting
        resumeAnimation()
      },
      { rootMargin: "160px 0px" },
    )

    motionQuery.addEventListener("change", applyMotionPreference)
    document.addEventListener("visibilitychange", onVisibilityChange)
    viewportObserver.observe(container)
    applyMotionPreference()
    const ro = new ResizeObserver(scheduleSetup)
    ro.observe(container)
    for (const el of nodeMap.values()) ro.observe(el)

    return () => {
      disposed = true
      if (resizeRaf) cancelAnimationFrame(resizeRaf)
      motionQuery.removeEventListener("change", applyMotionPreference)
      document.removeEventListener("visibilitychange", onVisibilityChange)
      viewportObserver.disconnect()
      ro.disconnect()
      teardown()
    }
  }, [friends])

  if (friends.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-n-2 px-6 py-14 text-center">
        <p className="site-meta text-n-5">还没有友链。</p>
        <p className="site-meta mt-2 text-n-4">
          在 <code>content/friends/</code> 新增笔记即可。
        </p>
      </div>
    )
  }

  return (
    <section className="mt-0">
      <div
        ref={containerRef}
        data-motion="active"
        className="friend-float-pool relative min-h-[28rem] overflow-hidden rounded-[2rem] bg-transparent sm:min-h-[34rem] lg:min-h-[38rem]"
      >
        {friends.map((friend) => (
          <Link
            key={friend.slug}
            href={friend.url}
            target="_blank"
            rel="noreferrer"
            ref={(el) => {
              if (el) nodeMapRef.current.set(friend.slug, el)
              else nodeMapRef.current.delete(friend.slug)
            }}
            onClick={(e) => {
              const until = Number(
                (e.currentTarget as HTMLAnchorElement).dataset
                  .dragSuppressUntil || 0,
              )
              if (until > Date.now()) e.preventDefault()
            }}
            className="friend-bubble surface-shell surface-shell-hover absolute left-0 top-0 inline-flex w-auto max-w-[calc(100vw-4rem)] rounded-full py-0 pl-0 pr-4 opacity-0 transition-[border-color,box-shadow] duration-300 will-change-transform sm:max-w-[24rem] lg:max-w-[28rem]"
          >
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarSrc(friend)}
                alt={`${friend.title} avatar`}
                className="h-14 w-14 rounded-full object-cover ring-1 ring-n-2 dark:ring-white/14"
                draggable={false}
              />
              <div className="min-w-0 max-w-[11rem] py-2 sm:max-w-[14rem] lg:max-w-[17rem]">
                <h2 className="break-words text-sm font-semibold tracking-tight text-primary">
                  {friend.title}
                </h2>
                {friend.description?.trim() ? (
                  <p className="mt-1 line-clamp-2 break-words text-xs leading-5 text-n-5">
                    {friend.description.trim()}
                  </p>
                ) : null}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
