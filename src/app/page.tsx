import { ScrollReveal } from "@/components/effects/ScrollReveal"
import { Hero } from "@/components/home/Hero"
import { LatestGlimpses } from "@/components/home/LatestGlimpses"
import { LatestUpdates } from "@/components/home/LatestUpdates"
import { LatestWriting } from "@/components/home/LatestWriting"
import { TokensActivity } from "@/components/home/TokensActivity"
import {
  getAllGlimpses,
  getAllPosts,
  getAllUpdates,
} from "@/lib/content/load"
import { getSiteConfig } from "@/lib/content/site"
import { createPageMetadata } from "@/lib/seo"

const site = getSiteConfig()

export const metadata = createPageMetadata({
  path: "/",
  title: site.title,
  description: site.description,
  absoluteTitle: true,
})

export default function Home() {
  const posts = getAllPosts().slice(0, 5)
  const updates = getAllUpdates().slice(0, 5)
  const glimpses = getAllGlimpses().slice(0, 6)

  return (
    <main className="relative w-full max-w-full overflow-x-hidden px-6 sm:px-12 lg:px-24">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-3 z-20 hidden h-16 w-[min(42rem,calc(100vw-1.5rem))] -translate-x-1/2 rounded-full bg-[rgba(2,6,23,0.26)] opacity-90 blur-xl dark:block sm:top-4 sm:w-[min(44rem,calc(100vw-3rem))]"
      />

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
