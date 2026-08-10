import { ScrollReveal } from "@/components/effects/ScrollReveal"
import { Hero } from "@/components/home/Hero"
import { LatestGlimpses } from "@/components/home/LatestGlimpses"
import { LatestUpdates } from "@/components/home/LatestUpdates"
import { LatestWatching } from "@/components/home/LatestWatching"
import { LatestWriting } from "@/components/home/LatestWriting"
import { TokensActivity } from "@/components/home/TokensActivity"
import {
  getAllGlimpses,
  getAllPosts,
  getAllUpdates,
} from "@/lib/content/load"
import { getSiteConfig } from "@/lib/content/site"
import { createPageMetadata } from "@/lib/seo"
import { getRecentWatching } from "@/lib/webhtv"

const site = getSiteConfig()

export const metadata = createPageMetadata({
  path: "/",
  title: site.title,
  description: site.description,
  absoluteTitle: true,
})

export default async function Home() {
  const posts = getAllPosts().slice(0, 5)
  const updates = getAllUpdates().slice(0, 5)
  const glimpses = getAllGlimpses().slice(0, 6)
  const watching = await getRecentWatching(8)

  return (
    <main className="relative w-full max-w-full overflow-x-hidden px-6 sm:px-12 lg:px-24">
      <Hero site={site} />

      <div className="home-feed-rule mx-auto w-full max-w-5xl" aria-hidden />

      <ScrollReveal y={22} delay={40}>
        <section
          id="home-feed"
          className="home-feed mx-auto grid w-full max-w-5xl gap-10 py-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)] lg:gap-x-16 lg:gap-y-10 xl:gap-x-20 lg:py-16"
        >
          <LatestWriting posts={posts} />
          <LatestUpdates updates={updates} />
          <div className="min-w-0 lg:col-span-2">
            <TokensActivity />
          </div>
        </section>
      </ScrollReveal>

      {watching.length > 0 ? (
        <>
          <div className="home-feed-rule mx-auto w-full max-w-5xl" aria-hidden />
          <ScrollReveal y={24} delay={50}>
            <div className="mx-auto w-full max-w-5xl py-12 lg:py-16">
              <LatestWatching items={watching} />
            </div>
          </ScrollReveal>
        </>
      ) : null}

      {glimpses.length > 0 ? (
        <>
          <div className="home-feed-rule mx-auto w-full max-w-5xl" aria-hidden />
          <ScrollReveal y={26} delay={60}>
            <div className="mx-auto w-full max-w-5xl py-12 lg:py-16">
              <LatestGlimpses glimpses={glimpses} />
            </div>
          </ScrollReveal>
        </>
      ) : null}
    </main>
  )
}
