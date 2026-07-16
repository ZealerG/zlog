import { ScrollReveal } from "@/components/effects/ScrollReveal"
import { Hero } from "@/components/home/Hero"
import { LatestUpdates } from "@/components/home/LatestUpdates"
import { LatestWriting } from "@/components/home/LatestWriting"
import { getAllPosts, getAllUpdates } from "@/lib/content/load"
import { getSiteConfig } from "@/lib/content/site"

export default function Home() {
  const site = getSiteConfig()
  const posts = getAllPosts().slice(0, 5)
  const updates = getAllUpdates().slice(0, 5)

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
          className="home-feed mx-auto grid w-full max-w-5xl gap-12 py-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)] lg:gap-16 xl:gap-20 lg:py-20"
        >
          <LatestWriting posts={posts} />
          <LatestUpdates updates={updates} />
        </section>
      </ScrollReveal>
    </main>
  )
}
