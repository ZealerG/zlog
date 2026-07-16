import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { getAllProjects } from "@/lib/content/load"
import { getSiteConfig } from "@/lib/content/site"
import { MarkdownBody } from "@/components/markdown/MarkdownBody"
import { markdownToHtml } from "@/lib/content/markdown"

export const metadata: Metadata = {
  title: "项目",
}

export default async function ProjectsPage() {
  const site = getSiteConfig()
  const projects = getAllProjects()
  const withHtml = await Promise.all(
    projects.map(async (p) => ({
      ...p,
      html: p.body ? (await markdownToHtml(p.body)).html : "",
    })),
  )

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-12 sm:px-10">
      <div className="grid gap-16">
        <div className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
          <aside className="grid gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={site.avatar}
              alt={`${site.author} avatar`}
              className="h-40 w-40 rounded-full border border-n-2 object-cover dark:border-n-2 sm:h-52 sm:w-52 lg:h-64 lg:w-64"
            />
            <div>
              <h1 className="site-title-h1 tracking-tight text-n-6">
                {site.name}
              </h1>
              <p className="site-lead mt-1 text-n-5">{site.author}</p>
            </div>
            <p className="site-meta text-n-5">{site.description}</p>
            {site.social.github ? (
              <a
                href={site.social.github}
                target="_blank"
                rel="noreferrer noopener"
                className="site-meta inline-flex items-center gap-2 text-n-5 transition hover:text-primary"
              >
                GitHub
              </a>
            ) : null}
            <Link
              href="/more"
              className="site-meta text-n-5 transition hover:text-primary"
            >
              ← 返回远方
            </Link>
          </aside>

          <section className="grid gap-4">
            <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="site-eyebrow uppercase tracking-[0.24em] text-n-4">
                  Projects
                </p>
                <h2 className="site-title-h2 mt-2 tracking-tight text-n-6">
                  项目
                </h2>
              </div>
              <span className="site-meta text-n-5">
                {projects.length} 个项目
              </span>
            </div>

            {withHtml.length === 0 ? (
              <p className="site-meta text-n-5">
                还没有项目。在 <code>content/projects/</code> 新增笔记即可。
              </p>
            ) : (
              withHtml.map((project) => (
                <article
                  key={project.slug}
                  className="surface-shell surface-shell-hover group relative rounded-2xl p-6"
                >
                  {project.url ? (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={`Open ${project.title}`}
                      className="absolute inset-0 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    />
                  ) : null}
                  <div className="pointer-events-none relative grid gap-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="site-title-h3 text-primary transition group-hover:opacity-80">
                            {project.title}
                          </h3>
                          {project.status ? (
                            <span className="site-eyebrow rounded-full border border-n-2 px-2 py-0.5 text-n-4">
                              {project.status}
                            </span>
                          ) : null}
                        </div>
                        {project.description ? (
                          <p className="mt-4 max-w-4xl text-base leading-7 text-n-5">
                            {project.description}
                          </p>
                        ) : null}
                      </div>
                      {project.url ? (
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-n-4 transition group-hover:text-n-6" />
                      ) : null}
                    </div>
                    {project.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <span key={tag} className="tag-inline">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {project.html ? (
                      <div className="pointer-events-auto relative text-sm text-n-5">
                        <MarkdownBody html={project.html} />
                      </div>
                    ) : null}
                  </div>
                </article>
              ))
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
