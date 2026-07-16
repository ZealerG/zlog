"use client"

import { ChevronDown, Mail } from "lucide-react"
import type { SiteConfig } from "@/lib/content/types"
import { Typewriter } from "./Typewriter"

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 2C6.477 2 2 6.59 2 12.252c0 4.53 2.865 8.372 6.839 9.729.5.097.683-.223.683-.496 0-.245-.009-.894-.014-1.754-2.782.618-3.369-1.37-3.369-1.37-.455-1.17-1.11-1.481-1.11-1.481-.908-.637.069-.624.069-.624 1.004.073 1.532 1.055 1.532 1.055.893 1.564 2.341 1.113 2.91.851.091-.664.35-1.113.636-1.369-2.221-.258-4.555-1.137-4.555-5.062 0-1.118.39-2.032 1.029-2.749-.103-.26-.446-1.305.098-2.72 0 0 .84-.276 2.75 1.05A9.32 9.32 0 0 1 12 6.836c.85.004 1.705.118 2.504.346 1.909-1.326 2.748-1.05 2.748-1.05.546 1.415.203 2.46.1 2.72.64.717 1.027 1.631 1.027 2.749 0 3.935-2.338 4.8-4.566 5.053.359.319.678.948.678 1.911 0 1.379-.013 2.492-.013 2.83 0 .276.18.598.688.496C19.138 20.62 22 16.78 22 12.252 22 6.59 17.523 2 12 2Z" />
    </svg>
  )
}

export function Hero({ site }: { site: SiteConfig }) {
  const github = site.social.github?.trim()
  const email = site.social.email?.trim()
  const tagline = site.tagline ?? "<Developer / >"
  const summary =
    site.summary ??
    "This is where I share projects, experiments, and reflections on building, learning, and the things that keep me curious."

  return (
    <section className="relative z-10 mx-auto grid min-h-[calc(100dvh-6rem)] w-full max-w-5xl items-center gap-10 py-[clamp(1.5rem,5vh,3.5rem)] sm:min-h-[calc(100dvh-7rem)] lg:grid-cols-[minmax(18rem,24rem)_minmax(24rem,34rem)] lg:justify-center lg:gap-10 xl:grid-cols-[minmax(20rem,26rem)_minmax(26rem,36rem)] xl:gap-12">
      <div className="hero-avatar flex justify-center">
        <div className="hero-avatar-ring relative">
          <div className="relative h-[18rem] w-[18rem] overflow-hidden rounded-full sm:h-[22rem] sm:w-[22rem] lg:h-[24rem] lg:w-[24rem] xl:h-[26rem] xl:w-[26rem]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={site.avatar}
              alt={`${site.name} avatar`}
              className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:scale-[1.02]"
              draggable={false}
            />
          </div>
        </div>
      </div>

      <div className="hero-copy max-w-3xl">
        <h1 className="hero-copy-title site-title-hero tracking-tight text-n-6">
          {site.name}
        </h1>

        <p className="hero-copy-body reading-copy site-lead mt-5 text-n-5 sm:mt-6">
          Hi, I&apos;m {site.author}, an interest-driven{" "}
          <Typewriter text={tagline} />
        </p>

        <p className="hero-copy-body reading-copy site-lead mt-2.5 text-n-5 sm:mt-3">
          <span className="hero-copy-emphasis font-medium italic text-n-6">
            builder and writer
          </span>{" "}
          exploring products, technology, and personal expression.
        </p>

        <p className="hero-copy-summary reading-copy site-body mt-5 max-w-[36rem] text-pretty text-n-5">
          {summary}
        </p>

        {(email || github) && (
          <div className="hero-copy-social mt-7 flex flex-wrap items-center gap-3">
            {email ? (
              <a
                href={`mailto:${email}`}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Email"
                title="Email"
                className="hero-social-btn"
              >
                <Mail className="block h-[18px] w-[18px] shrink-0" strokeWidth={1.9} />
              </a>
            ) : null}
            {github ? (
              <a
                href={github}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="GitHub"
                title="GitHub"
                className="hero-social-btn"
              >
                <GitHubIcon className="block h-[18px] w-[18px] shrink-0" />
              </a>
            ) : null}
          </div>
        )}
      </div>

      <div className="hero-scroll pointer-events-none absolute inset-x-0 bottom-5 hidden justify-center lg:flex">
        <a
          href="#home-feed"
          aria-label="Scroll to home feed"
          className="hero-scroll-btn pointer-events-auto"
        >
          <ChevronDown className="h-6 w-6" strokeWidth={2.2} />
        </a>
      </div>
    </section>
  )
}
