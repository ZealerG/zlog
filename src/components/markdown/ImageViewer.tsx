"use client"

import { createPortal } from "react-dom"
import { useCallback, useEffect, useRef, useState } from "react"

export type ViewerImage = { src: string; alt?: string }

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function pinchDistance(points: Map<number, { x: number; y: number }>) {
  const arr = [...points.values()]
  if (arr.length < 2) return 0
  return Math.hypot(arr[0].x - arr[1].x, arr[0].y - arr[1].y)
}

/**
 * xiami ImageViewerController-aligned viewer:
 * fullscreen glass overlay, zoom toolbar, pan when zoomed,
 * prev/next + swipe when multi, double-click 1x/2x, no caption.
 */
export function ImageViewer({
  images,
  index,
  onClose,
  onIndexChange,
}: {
  images: ViewerImage[]
  index: number
  onClose: () => void
  onIndexChange?: (i: number) => void
}) {
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [drag, setDrag] = useState<{
    pointerId: number
    startX: number
    startY: number
    offsetX: number
    offsetY: number
  } | null>(null)
  const [swipe, setSwipe] = useState<{
    pointerId: number
    startX: number
    startY: number
  } | null>(null)
  const [swipeX, setSwipeX] = useState(0)
  const [pinching, setPinching] = useState(false)

  const zoomRef = useRef(1)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pinchStart = useRef<{ distance: number; zoom: number } | null>(null)
  const suppressUntil = useRef(0)
  const stageRef = useRef<HTMLDivElement>(null)

  const multi = images.length > 1
  const current = images[index] ?? null
  const hasPrev = index > 0
  const hasNext = index < images.length - 1

  const resetView = useCallback(() => {
    zoomRef.current = 1
    setZoom(1)
    setOffset({ x: 0, y: 0 })
    setDrag(null)
    setSwipe(null)
    setSwipeX(0)
    setPinching(false)
    pointers.current.clear()
    pinchStart.current = null
  }, [])

  const applyZoom = useCallback((z: number) => {
    const next = clamp(z, 0.5, 2)
    zoomRef.current = next
    setZoom(next)
    if (next <= 1) {
      setOffset({ x: 0, y: 0 })
      setDrag(null)
    }
  }, [])

  const go = useCallback(
    (dir: -1 | 1) => {
      if ((dir === -1 && !hasPrev) || (dir === 1 && !hasNext)) return
      resetView()
      onIndexChange?.(index + dir)
    },
    [hasNext, hasPrev, index, onIndexChange, resetView],
  )

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") go(-1)
      if (e.key === "ArrowRight") go(1)
      if (e.key === "+" || e.key === "=") applyZoom(zoomRef.current + 0.1)
      if (e.key === "-") applyZoom(zoomRef.current - 0.1)
      if (e.key === "0") resetView()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [applyZoom, go, onClose, resetView])

  useEffect(() => {
    resetView()
  }, [index, resetView])

  if (typeof document === "undefined" || !current) return null

  const endPointer = (e: React.PointerEvent) => {
    if (stageRef.current?.hasPointerCapture(e.pointerId)) {
      stageRef.current.releasePointerCapture(e.pointerId)
    }
    pointers.current.delete(e.pointerId)
    if (pinchStart.current && pointers.current.size < 2) {
      pinchStart.current = null
      setPinching(false)
    }
    if (swipe && swipe.pointerId === e.pointerId && zoom <= 1) {
      const dx = e.clientX - swipe.startX
      if (Math.abs(dx) > 72) {
        if (dx > 0 && hasPrev) go(-1)
        else if (dx < 0 && hasNext) go(1)
      }
      setSwipe(null)
      setSwipeX(0)
    }
    if (drag && drag.pointerId === e.pointerId) setDrag(null)
  }

  return createPortal(
    <div
      data-image-viewer
      className="image-viewer"
      role="dialog"
      aria-modal="true"
      aria-label="图片查看器"
      onClick={(e) => {
        if (Date.now() <= suppressUntil.current) {
          e.preventDefault()
          e.stopPropagation()
          return
        }
        onClose()
      }}
    >
      <div
        ref={stageRef}
        className="image-viewer__stage"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) return
          pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
          e.stopPropagation()
          e.currentTarget.setPointerCapture(e.pointerId)

          const dist = pinchDistance(pointers.current)
          if (dist > 0) {
            pinchStart.current = { distance: dist, zoom: zoomRef.current }
            setDrag(null)
            setSwipe(null)
            setSwipeX(0)
            setPinching(true)
            suppressUntil.current = Date.now() + 320
            return
          }

          if (zoom <= 1) {
            if (!multi) return
            setSwipe({
              pointerId: e.pointerId,
              startX: e.clientX,
              startY: e.clientY,
            })
            setSwipeX(0)
            return
          }

          setDrag({
            pointerId: e.pointerId,
            startX: e.clientX,
            startY: e.clientY,
            offsetX: offset.x,
            offsetY: offset.y,
          })
        }}
        onPointerMove={(e) => {
          if (pointers.current.has(e.pointerId)) {
            pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
          }
          if (pinchStart.current) {
            const dist = pinchDistance(pointers.current)
            if (dist > 0) {
              e.preventDefault()
              e.stopPropagation()
              applyZoom(
                pinchStart.current.zoom *
                  (dist / pinchStart.current.distance),
              )
            }
            return
          }
          if (swipe && swipe.pointerId === e.pointerId && zoom <= 1) {
            const dx = e.clientX - swipe.startX
            const dy = e.clientY - swipe.startY
            if (Math.hypot(dx, dy) >= 6) {
              suppressUntil.current = Date.now() + 320
            }
            if (Math.abs(dy) > Math.abs(dx)) {
              setSwipeX(0)
              return
            }
            e.stopPropagation()
            const blocked = (dx > 0 && !hasPrev) || (dx < 0 && !hasNext)
            setSwipeX(blocked ? dx * 0.18 : dx)
            return
          }
          if (drag && drag.pointerId === e.pointerId) {
            if (
              Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) >= 6
            ) {
              suppressUntil.current = Date.now() + 320
            }
            e.stopPropagation()
            setOffset({
              x: drag.offsetX + e.clientX - drag.startX,
              y: drag.offsetY + e.clientY - drag.startY,
            })
          }
        }}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
      >
        <button
          type="button"
          className="image-viewer__close"
          aria-label="关闭图片"
          onClick={() => onClose()}
        >
          ×
        </button>

        <div
          className="image-viewer__toolbar"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="image-viewer__tool"
            aria-label="缩小图片"
            onClick={() => applyZoom(zoom - 0.1)}
          >
            −
          </button>
          <button
            type="button"
            className="image-viewer__tool image-viewer__tool--label"
            aria-label="重置图片大小"
            onClick={resetView}
          >
            {Math.round(100 * zoom)}%
          </button>
          <button
            type="button"
            className="image-viewer__tool"
            aria-label="放大图片"
            onClick={() => applyZoom(zoom + 0.1)}
          >
            +
          </button>
        </div>

        {multi ? (
          <button
            type="button"
            className="image-viewer__nav image-viewer__nav--prev"
            aria-label="上一张图片"
            disabled={!hasPrev}
            onClick={(e) => {
              e.stopPropagation()
              go(-1)
            }}
          >
            ‹
          </button>
        ) : null}

        <div
          className="image-viewer__slide"
          data-current="true"
          style={{
            transform: swipeX ? `translate3d(${swipeX}px,0,0)` : undefined,
            transition:
              swipe || pinching || drag
                ? "none"
                : "transform 280ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <div
            className="image-viewer__image-frame"
            style={{
              transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})`,
              transition:
                drag || pinching
                  ? "none"
                  : "transform 140ms cubic-bezier(0.22, 1, 0.36, 1)",
              cursor:
                zoom > 1
                  ? drag
                    ? "grabbing"
                    : "grab"
                  : multi
                    ? swipe
                      ? "grabbing"
                      : "grab"
                    : "default",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.src}
              alt=""
              draggable={false}
              className="image-viewer__image"
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={(e) => {
                e.stopPropagation()
                if (zoom === 1) applyZoom(2)
                else resetView()
              }}
              onDragStart={(e) => e.preventDefault()}
            />
          </div>
        </div>

        {multi ? (
          <button
            type="button"
            className="image-viewer__nav image-viewer__nav--next"
            aria-label="下一张图片"
            disabled={!hasNext}
            onClick={(e) => {
              e.stopPropagation()
              go(1)
            }}
          >
            ›
          </button>
        ) : null}

        {multi ? (
          <div className="image-viewer__counter">
            {index + 1} / {images.length}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
