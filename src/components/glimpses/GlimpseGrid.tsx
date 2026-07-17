import type { Glimpse } from "@/lib/content/types"

export function GlimpseGrid({ glimpses }: { glimpses: Glimpse[] }) {
  if (glimpses.length === 0) {
    return (
      <p className="site-meta text-n-5">还没有拾光。拍下一瞬，留在这里。</p>
    )
  }

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {glimpses.map((glimpse, index) => (
        <li
          key={glimpse.slug}
          className="home-feed-item"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <figure className="bezel h-full">
            <div className="surface-shell surface-shell-hover media-zoom flex h-full flex-col overflow-hidden">
              <div className="relative aspect-[4/3] overflow-hidden bg-n-1/40">
                {glimpse.images.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    src={src}
                    alt={glimpse.caption ?? "拾光"}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ))}
              </div>
              <figcaption className="space-y-1 px-4 py-3.5">
                <time
                  dateTime={glimpse.date}
                  className="block site-meta tabular-nums text-n-5"
                >
                  {glimpse.date.slice(0, 10)}
                </time>
                {glimpse.caption ? (
                  <p className="reading-copy text-pretty text-sm leading-relaxed text-n-5">
                    {glimpse.caption}
                  </p>
                ) : null}
              </figcaption>
            </div>
          </figure>
        </li>
      ))}
    </ul>
  )
}
