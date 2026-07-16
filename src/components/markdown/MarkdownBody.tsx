"use client"

import { useEffect, useRef, useState } from "react"
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

export function MarkdownBody({
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

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // mark zoomable + strip titles that show as tooltips
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

      const img = target.closest?.("img") as HTMLImageElement | null
      if (!img || !el.contains(img) || img.classList.contains("no-lightbox")) {
        return
      }
      if (img.naturalWidth > 0 && img.naturalWidth < 48) return

      event.preventDefault()
      event.stopPropagation()
      const images = collectImages(el)
      const src = img.currentSrc || img.src
      const index = Math.max(
        0,
        images.findIndex((i) => i.src === src),
      )
      setViewer({ images: images.length ? images : [{ src, alt: "" }], index })
    }

    el.addEventListener("click", onClick)
    return () => el.removeEventListener("click", onClick)
  }, [html])

  return (
    <>
      <div
        ref={ref}
        className={`reading-copy post-prose max-w-none text-n-6 ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
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
