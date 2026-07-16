"use client"

import { X } from "lucide-react"
import { useEffect, useState } from "react"

export function ImageLightbox({
  src,
  alt,
  onClose,
}: {
  src: string
  alt: string
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt || "图片预览"}
      className="lightbox-overlay fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-[lightbox-in_0.18s_ease-out]"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="关闭预览"
        onClick={onClose}
        className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="lightbox-image max-h-[88vh] max-w-[min(96vw,72rem)] rounded-xl object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        draggable={false}
      />
      {alt ? (
        <p className="pointer-events-none absolute bottom-5 left-1/2 max-w-[min(90vw,40rem)] -translate-x-1/2 truncate rounded-full bg-black/50 px-3 py-1 text-center text-xs text-white/90">
          {alt}
        </p>
      ) : null}
    </div>
  )
}

export function useImageLightbox(root: HTMLElement | null) {
  const [state, setState] = useState<{ src: string; alt: string } | null>(null)

  useEffect(() => {
    if (!root) return
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      const img = target?.closest?.("img") as HTMLImageElement | null
      if (!img || !root.contains(img)) return
      // skip tiny icons / avatars
      if (img.closest("a.surface-shell") || img.classList.contains("no-lightbox"))
        return
      if (img.naturalWidth > 0 && img.naturalWidth < 48) return
      e.preventDefault()
      setState({ src: img.currentSrc || img.src, alt: img.alt || "" })
    }
    root.addEventListener("click", onClick)
    return () => root.removeEventListener("click", onClick)
  }, [root])

  return {
    lightbox: state,
    close: () => setState(null),
  }
}
