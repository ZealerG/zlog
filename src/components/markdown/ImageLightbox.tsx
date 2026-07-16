"use client"

import { X } from "lucide-react"
import { useEffect } from "react"

export function ImageLightbox({
  src,
  alt,
  onClose,
}: {
  src: string
  alt?: string
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
      aria-label="图片预览"
      className="lightbox-overlay fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      <div className="lightbox-backdrop absolute inset-0" aria-hidden />

      <button
        type="button"
        aria-label="关闭预览"
        onClick={onClose}
        className="lightbox-close absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full sm:right-6 sm:top-6"
      >
        <X className="h-4.5 w-4.5" strokeWidth={1.75} />
      </button>

      {/* double-bezel frame — no caption / filename */}
      <div
        className="lightbox-frame relative z-[1] max-h-[min(90vh,56rem)] max-w-[min(96vw,72rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="lightbox-frame-inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            className="lightbox-image block max-h-[min(86vh,54rem)] max-w-full object-contain"
            draggable={false}
          />
        </div>
      </div>
    </div>
  )
}
