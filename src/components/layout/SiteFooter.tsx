import Link from "next/link"
import type { SiteConfig } from "@/lib/content/types"

function SlashLink({
  href,
  children,
  external,
}: {
  href: string
  children: React.ReactNode
  external?: boolean
}) {
  const className =
    "group inline-flex w-fit items-center gap-3 site-meta text-n-5 transition hover:text-n-6 dark:text-n-5 dark:hover:text-n-6"
  const slash = (
    <span className="text-zinc-300 transition group-hover:text-n-5 dark:text-n-6 dark:group-hover:text-n-4">
      /
    </span>
  )
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        <span>{children}</span>
        {slash}
      </a>
    )
  }
  return (
    <Link href={href} className={className}>
      <span>{children}</span>
      {slash}
    </Link>
  )
}

export function SiteFooter({ site }: { site: SiteConfig }) {
  const year = new Date().getFullYear()
  const email = site.social.email?.trim()
  const github = site.social.github?.trim()

  return (
    <footer className="relative z-10 mt-12">
      <div
        aria-hidden
        className="site-footer-fade pointer-events-none absolute inset-x-0 -top-40 h-40"
      />
      <div className="relative mx-auto max-w-6xl px-6 pb-10 pt-16 sm:px-10">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-[minmax(0,0.86fr)_auto] lg:items-start lg:gap-16">
          <div className="col-span-2 lg:col-span-1">
            <p className="text-sm font-semibold tracking-tight text-primary">
              {site.brand ?? site.name}
            </p>
            <p className="site-meta mt-3 max-w-md text-pretty text-n-5">
              <span className="block">
                It is the time you have wasted for your rose
              </span>
              <span className="block">makes your rose so important.</span>
            </p>
            <p className="mt-5 flex min-w-0 items-center gap-3 text-sm leading-6 text-n-5">
              <span className="relative inline-flex size-2 shrink-0">
                <span className="relative size-2 rounded-full bg-n-3 dark:bg-n-4" />
              </span>
              静态博客架构 · 无实时在线状态
            </p>
            <p className="site-meta mt-6 text-n-4">
              © {year} {site.author}
            </p>
          </div>

          <div className="col-span-2 grid grid-cols-2 gap-8 lg:col-span-1 lg:justify-self-end lg:gap-16">
            <div>
              <p className="site-eyebrow uppercase tracking-[0.22em] text-n-4">
                Follow
              </p>
              <div className="mt-4 grid gap-3">
                <SlashLink href="/feed" external>
                  RSS
                </SlashLink>
                <SlashLink href="/sitemap.xml" external>
                  Sitemap
                </SlashLink>
              </div>
            </div>

            <div>
              <p className="site-eyebrow uppercase tracking-[0.22em] text-n-4">
                Contact
              </p>
              <div className="mt-4 grid gap-3">
                {email ? (
                  <SlashLink href={`mailto:${email}`} external>
                    Email
                  </SlashLink>
                ) : null}
                {github ? (
                  <SlashLink href={github} external>
                    GitHub
                  </SlashLink>
                ) : null}
                {!email && !github ? (
                  <span className="site-meta text-n-4">Message/</span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
