import { MarkdownBodyInteractive } from "./MarkdownBodyInteractive"

/** True when HTML needs client islands (gallery, lightbox, code copy). */
export function markdownNeedsClient(html: string): boolean {
  return (
    html.includes("data-photo-gallery") ||
    html.includes("data-gallery-root") ||
    html.includes("content-gallery") ||
    html.includes("photo-gallery") ||
    html.includes("code-copy-btn") ||
    html.includes("<img")
  )
}

/**
 * Server-friendly markdown renderer.
 * Plain text HTML stays as RSC static markup; interactive features load a client island.
 */
export function MarkdownBody({
  html,
  className = "",
}: {
  html: string
  className?: string
}) {
  if (!markdownNeedsClient(html)) {
    return (
      <div
        className={`reading-copy post-prose max-w-none text-n-6 ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }

  return <MarkdownBodyInteractive html={html} className={className} />
}
