"use client"

import { useEffect, useRef, useState } from "react"
import { ImageLightbox } from "./ImageLightbox"

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

export function MarkdownBody({
  html,
  className = "",
}: {
  html: string
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [root, setRoot] = useState<HTMLDivElement | null>(null)
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(
    null,
  )

  useEffect(() => {
    setRoot(ref.current)
  }, [html])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onClick = async (event: MouseEvent) => {
      const target = event.target as HTMLElement | null

      // code copy
      const btn = target?.closest?.(".code-copy-btn") as HTMLButtonElement | null
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

      // image lightbox
      const img = target?.closest?.("img") as HTMLImageElement | null
      if (img && el.contains(img) && !img.classList.contains("no-lightbox")) {
        if (img.naturalWidth > 0 && img.naturalWidth < 48) return
        event.preventDefault()
        setLightbox({ src: img.currentSrc || img.src, alt: img.alt || "" })
      }
    }

    el.addEventListener("click", onClick)
    return () => el.removeEventListener("click", onClick)
  }, [html])

  // cursor affordance for images
  useEffect(() => {
    const el = root
    if (!el) return
    el.querySelectorAll("img").forEach((img) => {
      if (!img.classList.contains("no-lightbox")) {
        img.classList.add("md-zoomable")
      }
    })
  }, [root, html])

  return (
    <>
      <div
        ref={ref}
        className={`reading-copy post-prose max-w-none text-n-6 ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {lightbox ? (
        <ImageLightbox
          src={lightbox.src}
          onClose={() => setLightbox(null)}
        />
      ) : null}
    </>
  )
}
