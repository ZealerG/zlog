import type { ReactEventHandler } from "react"

type Props = {
  src: string
  alt: string
  className?: string
  /** Kept for API compat with next/image call sites */
  sizes?: string
  width?: number
  height?: number
  fill?: boolean
  priority?: boolean
  draggable?: boolean
  onLoad?: ReactEventHandler<HTMLImageElement>
}

/**
 * Content-image helper for timeline / home / grids.
 *
 * Uses native <img> (not next/image optimizer). Remote CDNs (R2, Unsplash)
 * already serve sized assets, and Next's optimizer can fail when DNS resolves
 * hosts to CGNAT/private ranges (198.18.x), which blanked 拾光/足迹 thumbs.
 *
 * `fill` → absolute inset-0 object-cover (parent must be position:relative).
 */
export function RemoteImage({
  src,
  alt,
  className = "",
  width = 960,
  height = 720,
  fill = false,
  priority = false,
  draggable = false,
  onLoad,
}: Props) {
  const fillClass = fill ? "absolute inset-0 h-full w-full" : ""
  const merged = [fillClass, className].filter(Boolean).join(" ")

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={merged}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      draggable={draggable}
      onLoad={onLoad}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
    />
  )
}
