"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react"
import { parsePhotoExif, type PhotoExif } from "@/lib/media/exif"

export type GalleryImage = {
  src: string
  alt?: string
}

export type PhotoMetaItem = {
  kind: "device" | "aperture" | "iso" | "shutter" | "focal" | "date" | "caption"
  text: string
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function updateOrientation(img: HTMLImageElement) {
  const { naturalWidth: w, naturalHeight: h } = img
  if (!w || !h) return
  const ratio = w / h
  const orientation =
    ratio > 1.08 ? "landscape" : ratio < 0.92 ? "portrait" : "square"
  const item = img.closest("[data-gallery-item]") as HTMLElement | null
  if (item) item.dataset.galleryOrientation = orientation
}

export function photoExifToMetaItems(exif: PhotoExif): PhotoMetaItem[] {
  const items: PhotoMetaItem[] = []
  if (exif.camera) items.push({ kind: "device", text: exif.camera })
  if (exif.aperture) items.push({ kind: "aperture", text: exif.aperture })
  if (exif.iso) items.push({ kind: "iso", text: exif.iso })
  if (exif.shutter) items.push({ kind: "shutter", text: exif.shutter })
  if (exif.focal) items.push({ kind: "focal", text: exif.focal })
  if (exif.date) items.push({ kind: "date", text: exif.date })
  return items
}

function scrollByItem(track: HTMLElement, delta: number) {
  const items = Array.from(
    track.querySelectorAll<HTMLElement>(":scope > .content-gallery__item"),
  )
  if (!items.length) return
  const center = track.scrollLeft + track.clientWidth / 2
  let nearest = 0
  let best = Infinity
  items.forEach((el, i) => {
    const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - center)
    if (d < best) {
      best = d
      nearest = i
    }
  })
  const next = clamp(nearest + delta, 0, items.length - 1)
  const target = items[next]
  if (!target) return
  const max = Math.max(0, track.scrollWidth - track.clientWidth)
  const left = clamp(
    target.offsetLeft - (track.clientWidth - target.offsetWidth) / 2,
    0,
    max,
  )
  track.scrollBy({ left: left - track.scrollLeft, behavior: "smooth" })
}

function PhotoMetaOverlay({ items }: { items: PhotoMetaItem[] }) {
  if (!items.length) return null
  return (
    <figcaption className="photo-meta-overlay">
      {items.map((item, i) => (
        <span
          key={`${item.kind}-${i}`}
          className="photo-meta-overlay__item"
          data-kind={item.kind}
        >
          <span className="photo-meta-overlay__icon" aria-hidden="true" />
          <span className="photo-meta-overlay__text">{item.text}</span>
        </span>
      ))}
    </figcaption>
  )
}

function GalleryItem({
  src,
  alt,
  index,
}: {
  src: string
  alt?: string
  index: number
}) {
  const [meta, setMeta] = useState<PhotoMetaItem[]>([])
  const startedRef = useRef(false)

  // EXIF is decorative — fetch only on intentional hover/focus so opening
  // 足迹 never hits /api/exif for every gallery cell on first paint.
  const loadExif = () => {
    if (startedRef.current) return
    startedRef.current = true
    void parsePhotoExif(src).then((exif) => {
      if (!exif) return
      setMeta(photoExifToMetaItems(exif))
    })
  }

  return (
    <figure
      className="content-gallery__item"
      data-gallery-item={index + 1}
      onPointerEnter={loadExif}
      onFocus={loadExif}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt || `图册图片 ${index + 1}`}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="md-zoomable"
        onLoad={(e) => updateOrientation(e.currentTarget)}
      />
      <PhotoMetaOverlay items={meta} />
    </figure>
  )
}

export function ContentGallery({ images }: { images: GalleryImage[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    pointerId: number
    startX: number
    startScrollLeft: number
    hasDragged: boolean
  } | null>(null)
  const navigable = images.length > 1
  const [nav, setNav] = useState({ previousDisabled: true, nextDisabled: true })

  const updateNav = useCallback(() => {
    const track = trackRef.current
    if (!track || !navigable) {
      setNav({ previousDisabled: true, nextDisabled: true })
      return
    }
    const max = Math.max(0, track.scrollWidth - track.clientWidth)
    setNav({
      previousDisabled: track.scrollLeft <= 4,
      nextDisabled: track.scrollLeft >= max - 4,
    })
  }, [navigable])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = window.requestAnimationFrame(() => {
        raf = 0
        updateNav()
      })
    }
    updateNav()
    track.addEventListener("scroll", onScroll, { passive: true })
    const ro = new ResizeObserver(updateNav)
    ro.observe(track)
    Array.from(track.children).forEach((c) => ro.observe(c))
    return () => {
      track.removeEventListener("scroll", onScroll)
      ro.disconnect()
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [updateNav, images.length])

  if (!images.length) return null

  return (
    <div
      data-type="gallery"
      data-gallery-root="true"
      data-gallery-client="true"
      className={
        navigable
          ? "content-gallery content-gallery--navigable"
          : "content-gallery"
      }
      aria-label="图册"
    >
      <div
        ref={trackRef}
        className="content-gallery__track"
        onPointerDown={(e) => {
          const track = trackRef.current
          if (!track || e.button !== 0 || !navigable) return
          dragRef.current = {
            pointerId: e.pointerId,
            startX: e.clientX,
            startScrollLeft: track.scrollLeft,
            hasDragged: false,
          }
          track.dataset.galleryDragActive = "true"
        }}
        onPointerMove={(e) => {
          const track = trackRef.current
          const drag = dragRef.current
          if (!track || !drag || drag.pointerId !== e.pointerId) return
          const dx = e.clientX - drag.startX
          if (!drag.hasDragged && Math.abs(dx) > 6) {
            drag.hasDragged = true
            track.dataset.galleryDragging = "true"
            track.setPointerCapture(e.pointerId)
          }
          if (drag.hasDragged) {
            e.preventDefault()
            track.scrollLeft = drag.startScrollLeft - dx
          }
        }}
        onPointerUp={(e) => {
          const track = trackRef.current
          const drag = dragRef.current
          if (!track || !drag || drag.pointerId !== e.pointerId) return
          if (track.hasPointerCapture(e.pointerId)) {
            track.releasePointerCapture(e.pointerId)
          }
          dragRef.current = null
          track.dataset.galleryDragActive = "false"
          window.setTimeout(() => {
            track.dataset.galleryDragging = "false"
          }, 0)
        }}
        onPointerCancel={(e) => {
          const track = trackRef.current
          const drag = dragRef.current
          if (!track || !drag || drag.pointerId !== e.pointerId) return
          if (track.hasPointerCapture(e.pointerId)) {
            track.releasePointerCapture(e.pointerId)
          }
          dragRef.current = null
          track.dataset.galleryDragActive = "false"
          track.dataset.galleryDragging = "false"
        }}
      >
        {images.map((img, i) => (
          <GalleryItem
            key={`${img.src}-${i}`}
            src={img.src}
            alt={img.alt}
            index={i}
          />
        ))}
      </div>
      {navigable ? (
        <>
          <button
            type="button"
            className="content-gallery__nav-button content-gallery__nav-button--prev"
            aria-label="上一张图片"
            data-direction="prev"
            disabled={nav.previousDisabled}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (trackRef.current) scrollByItem(trackRef.current, -1)
            }}
          />
          <button
            type="button"
            className="content-gallery__nav-button content-gallery__nav-button--next"
            aria-label="下一张图片"
            data-direction="next"
            disabled={nav.nextDisabled}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (trackRef.current) scrollByItem(trackRef.current, 1)
            }}
          />
        </>
      ) : null}
    </div>
  )
}

/**
 * Hydrate server-rendered galleries (legacy HTML path) is unused when
 * MarkdownBody parses galleries into React ContentGallery nodes.
 * Kept for orientation helper exports.
 */
export function useContentGalleryEnhance(
  _rootRef: RefObject<HTMLElement | null>,
  _html: string,
) {
  // no-op: galleries are React-mounted via MarkdownBody
}
