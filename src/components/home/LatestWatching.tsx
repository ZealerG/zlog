import { RemoteImage } from "@/components/media/RemoteImage"
import type { RecentWatchingItem } from "@/lib/webhtv"

export function LatestWatching({
  items,
}: {
  items: RecentWatchingItem[]
}) {
  if (items.length === 0) return null

  return (
    <section className="home-watching" aria-labelledby="home-watching-title">
      <h2
        id="home-watching-title"
        className="home-feed-title mb-6 font-bold text-n-6"
      >
        最近在看
      </h2>

      <ul className="home-watching-track" aria-label="最近观看的影视与动漫">
        {items.map((item) => (
          <li key={item.id} className="home-watching-item">
            <figure className="home-watching-poster media-zoom">
              <RemoteImage
                src={item.poster}
                alt={`${item.title}海报`}
                fill
                sizes="(max-width: 640px) 42vw, 176px"
                className="object-cover"
                draggable={false}
              />
              <figcaption className="home-watching-caption">
                <span className="home-watching-title">{item.title}</span>
                {item.episode ? (
                  <span className="home-watching-episode">{item.episode}</span>
                ) : null}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  )
}
