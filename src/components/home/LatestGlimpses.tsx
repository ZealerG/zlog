import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import type { Glimpse } from "@/lib/content/types"
import { RemoteImage } from "@/components/media/RemoteImage"

function yearOf(iso: string) {
  const y = new Date(iso).getFullYear()
  return Number.isNaN(y) ? "" : String(y)
}

/**
 * Home "Glimpses Along the Way" strip — xiami-faithful gallery block.
 * Prefer real photos + soft glass shells (design-taste / high-end visual).
 */
export function LatestGlimpses({ glimpses }: { glimpses: Glimpse[] }) {
  if (glimpses.length === 0) return null

  const year = yearOf(glimpses[0]!.date)
  const tiles = glimpses.flatMap((g) =>
    g.images.slice(0, 3).map((src, i) => ({
      key: `${g.slug}-${i}`,
      src,
      caption: g.caption,
      date: g.date,
      href: `/timeline#${g.slug}`,
    })),
  ).slice(0, 8)

  return (
    <div className="home-feed-block" style={{ animationDelay: "0.36s" }}>
      <section className="home-glimpses">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="home-feed-eyebrow font-normal uppercase text-n-5">
              Glimpses Along the Way
            </p>
            <p className="home-feed-title mt-1 font-bold text-n-6">沿途拾光</p>
          </div>
          <div className="flex items-center gap-3">
            {year ? (
              <span className="site-meta tabular-nums text-n-4">{year}</span>
            ) : null}
            <Link
              href="/timeline?type=glimpse"
              className="group/all inline-flex items-center gap-1.5 site-meta text-n-5 transition-colors hover:text-primary"
            >
              View all
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-n-1/80 text-n-5 transition duration-300 group-hover/all:bg-primary/12 group-hover/all:text-primary dark:bg-white/6">
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/all:translate-x-0.5 group-hover/all:-translate-y-0.5" />
              </span>
            </Link>
          </div>
        </div>

        <div className="home-glimpses-track">
          {tiles.map((tile, index) => (
            <Link
              key={tile.key}
              href={tile.href}
              className="home-glimpses-card media-zoom group relative"
              style={{ animationDelay: `${0.4 + index * 0.05}s` }}
              aria-label={tile.caption ?? "拾光影像"}
            >
              <RemoteImage
                src={tile.src}
                alt={tile.caption ?? "拾光"}
                fill
                sizes="(max-width: 640px) 70vw, 240px"
                className="object-cover"
                draggable={false}
              />
              {tile.caption ? (
                <span className="home-glimpses-caption">
                  {tile.caption}
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
