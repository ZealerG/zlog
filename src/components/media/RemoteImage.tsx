import Image from "next/image"
import type { ReactEventHandler } from "react"

/** Hosts we allow through Next.js image optimization. */
const OPTIMIZED_HOST =
  /(^|\.)r2\.dev$|(^|\.)unsplash\.com$|(^|\.)images\.unsplash\.com$|(^|\.)cloudinary\.com$/i

export function canOptimizeRemoteSrc(src: string): boolean {
  try {
    const url = new URL(src)
    return url.protocol === "https:" && OPTIMIZED_HOST.test(url.hostname)
  } catch {
    return false
  }
}

type Props = {
  src: string
  alt: string
  className?: string
  /** CSS sizes for responsive optimized images */
  sizes?: string
  /** Intrinsic box when not using fill */
  width?: number
  height?: number
  fill?: boolean
  priority?: boolean
  draggable?: boolean
  onLoad?: ReactEventHandler<HTMLImageElement>
}

/**
 * Prefer next/image for known CDNs; fall back to plain img for arbitrary hosts.
 * List UIs should pass fill + sizes for consistent thumbnails.
 */
export function RemoteImage({
  src,
  alt,
  className,
  sizes = "(max-width: 640px) 100vw, 28rem",
  width = 960,
  height = 720,
  fill = false,
  priority = false,
  draggable = false,
  onLoad,
}: Props) {
  if (!canOptimizeRemoteSrc(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={className}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        draggable={draggable}
        onLoad={onLoad}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
      />
    )
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
        draggable={draggable}
        onLoad={onLoad}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      priority={priority}
      draggable={draggable}
      onLoad={onLoad}
    />
  )
}
