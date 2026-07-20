"use client"

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { ContentGallery, type GalleryImage } from "./ContentGallery"
import { ImageViewer, type ViewerImage } from "./ImageViewer"

function decodeCode(btn: HTMLButtonElement): string {
  const b64 = btn.getAttribute("data-code-b64")
  if (b64) {
    try {
      if (typeof atob === "function") {
        const bin = atob(b64)
        const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
        return new TextDecoder().decode(bytes)
      }
    } catch {
      /* fall through */
    }
  }
  return btn.getAttribute("data-code") ?? ""
}

type Segment =
  | { type: "html"; html: string }
  | { type: "gallery"; images: GalleryImage[]; key: string }

function parseGalleryImages(galleryEl: Element): GalleryImage[] {
  return Array.from(galleryEl.querySelectorAll("img")).map((img) => ({
    src: img.getAttribute("src") || "",
    alt: img.getAttribute("alt") || "",
  })).filter((i) => i.src)
}

/**
 * Split server HTML into static HTML segments + interactive gallery mounts.
 * Gallery blocks produced by rehype wrapImageGalleries become React carousels.
 */
function splitHtmlSegments(html: string): Segment[] {
  if (typeof window === "undefined") {
    // SSR: keep raw HTML (galleries still styled as static track)
    return [{ type: "html", html }]
  }
  if (!html.includes("data-photo-gallery") && !html.includes("data-gallery-root") && !html.includes("photo-gallery") && !html.includes("content-gallery")) {
    return [{ type: "html", html }]
  }

  const wrap = document.createElement("div")
  wrap.innerHTML = html
  const segments: Segment[] = []
  let htmlBuf = ""
  let galleryIndex = 0

  const flushHtml = () => {
    if (htmlBuf) {
      segments.push({ type: "html", html: htmlBuf })
      htmlBuf = ""
    }
  }

  for (const node of Array.from(wrap.childNodes)) {
    if (
      node.nodeType === Node.ELEMENT_NODE &&
      (node as Element).matches?.(
        "[data-photo-gallery], [data-gallery-root], .photo-gallery, .content-gallery",
      )
    ) {
      flushHtml()
      const images = parseGalleryImages(node as Element)
      if (images.length) {
        segments.push({
          type: "gallery",
          images,
          key: `g-${galleryIndex++}-${images[0]?.src ?? ""}`,
        })
      }
      continue
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      htmlBuf += (node as Element).outerHTML
    } else if (node.nodeType === Node.TEXT_NODE) {
      htmlBuf += node.textContent ?? ""
    }
  }
  flushHtml()
  return segments.length ? segments : [{ type: "html", html }]
}

function collectImages(root: HTMLElement): ViewerImage[] {
  return Array.from(root.querySelectorAll<HTMLImageElement>("img"))
    .filter((img) => {
      if (img.classList.contains("no-lightbox")) return false
      if (img.closest("[data-image-viewer]")) return false
      if (img.naturalWidth > 0 && img.naturalWidth < 48) return false
      return Boolean(img.currentSrc || img.src)
    })
    .map((img) => ({
      src: img.currentSrc || img.src,
      alt: img.alt || "",
    }))
}

export function MarkdownBodyInteractive({
  html,
  className = "",
}: {
  html: string
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [viewer, setViewer] = useState<{
    images: ViewerImage[]
    index: number
  } | null>(null)
  const [segments, setSegments] = useState<Segment[]>([{ type: "html", html }])

  useEffect(() => {
    setSegments(splitHtmlSegments(html))
  }, [html])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    el.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
      if (img.classList.contains("no-lightbox")) return
      img.classList.add("md-zoomable")
      img.removeAttribute("title")
    })

    const onClick = async (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) return

      const btn = target.closest?.(".code-copy-btn") as HTMLButtonElement | null
      if (btn && el.contains(btn)) {
        const code = decodeCode(btn)
        try {
          await navigator.clipboard.writeText(code)
          const prev = btn.textContent
          btn.textContent = "Copied"
          btn.classList.add("is-copied")
          window.setTimeout(() => {
            btn.textContent = prev || "Copy"
            btn.classList.remove("is-copied")
          }, 1400)
        } catch {
          btn.textContent = "Failed"
          window.setTimeout(() => {
            btn.textContent = "Copy"
          }, 1400)
        }
        return
      }

      // ignore drag-end clicks on gallery track
      const track = target.closest?.(".content-gallery__track") as HTMLElement | null
      if (track?.dataset.galleryDragging === "true") {
        event.preventDefault()
        event.stopPropagation()
        return
      }

      const img = target.closest?.("img") as HTMLImageElement | null
      if (!img || !el.contains(img) || img.classList.contains("no-lightbox")) {
        return
      }
      if (img.naturalWidth > 0 && img.naturalWidth < 48) return

      event.preventDefault()
      event.stopPropagation()

      const gallery = img.closest(
        "[data-gallery-root], [data-photo-gallery], .content-gallery",
      ) as HTMLElement | null
      const images = gallery ? collectImages(gallery) : collectImages(el)
      const src = img.currentSrc || img.src
      const index = Math.max(
        0,
        images.findIndex((i) => i.src === src),
      )
      setViewer({ images: images.length ? images : [{ src, alt: "" }], index })
    }

    el.addEventListener("click", onClick)
    return () => el.removeEventListener("click", onClick)
  }, [segments, html])

  const body: ReactNode = useMemo(() => {
    if (segments.length === 1 && segments[0].type === "html") {
      return (
        <div
          className={`reading-copy post-prose max-w-none text-n-6 ${className}`}
          dangerouslySetInnerHTML={{ __html: segments[0].html }}
        />
      )
    }
    return (
      <div className={`reading-copy post-prose max-w-none text-n-6 ${className}`}>
        {segments.map((seg, i) =>
          seg.type === "html" ? (
            <div
              key={`h-${i}`}
              dangerouslySetInnerHTML={{ __html: seg.html }}
            />
          ) : (
            <ContentGallery key={seg.key} images={seg.images} />
          ),
        )}
      </div>
    )
  }, [segments, className])

  return (
    <>
      <div ref={ref}>{body}</div>
      {viewer ? (
        <ImageViewer
          images={viewer.images}
          index={viewer.index}
          onClose={() => setViewer(null)}
          onIndexChange={(i) =>
            setViewer((v) => (v ? { ...v, index: i } : v))
          }
        />
      ) : null}
    </>
  )
}
