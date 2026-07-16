import type { Glimpse } from "@/lib/content/types"

export function GlimpseGrid({ glimpses }: { glimpses: Glimpse[] }) {
  if (glimpses.length === 0) {
    return (
      <p className="site-meta text-n-5">还没有拾光。拍下一瞬，留在这里。</p>
    )
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {glimpses.map((glimpse) => (
        <li key={glimpse.slug}>
          <figure className="overflow-hidden rounded-2xl border border-n-2 bg-n-1/30 dark:border-n-2">
            <div>
              {glimpse.images.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt={glimpse.caption ?? "拾光"}
                  className="h-auto w-full object-cover"
                  loading="lazy"
                />
              ))}
            </div>
            <figcaption className="space-y-1 px-4 py-3">
              <time
                dateTime={glimpse.date}
                className="block site-meta text-n-5"
              >
                {glimpse.date.slice(0, 10)}
              </time>
              {glimpse.caption ? (
                <p className="reading-copy text-sm leading-relaxed text-n-5">
                  {glimpse.caption}
                </p>
              ) : null}
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  )
}
