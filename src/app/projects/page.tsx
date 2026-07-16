import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
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
      <div className="grid gap-10 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start lg:gap-12">
        <aside className="projects-aside grid gap-5 lg:sticky lg:top-28">
          <div className="projects-avatar-ring mx-auto w-fit lg:mx-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={site.avatar}
              alt={`${site.author} avatar`}
              className="h-36 w-36 rounded-full object-cover sm:h-44 sm:w-44 lg:h-52 lg:w-52"
            />
          </div>
          <div className="text-center lg:text-left">
            <h1 className="site-title-h1 tracking-tight text-n-6">
              {site.name}
            </h1>
            <p className="site-lead mt-1 text-n-5">{site.author}</p>
          </div>
          <p className="site-meta text-center text-n-5 lg:text-left">
            {site.description}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            {site.social.github ? (
              <a
                href={site.social.github}
                target="_blank"
                rel="noreferrer noopener"
                className="site-meta inline-flex items-center gap-1.5 rounded-full border border-n-2 px-3 py-1.5 text-n-5 transition hover:border-primary/30 hover:text-primary"
              >
                GitHub
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            ) : null}
            <Link
              href="/more"
              className="site-meta inline-flex items-center gap-1.5 text-n-5 transition hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              远方
            </Link>
          </div>
        </aside>

        <section className="grid gap-4">
          <div className="mb-1 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="site-eyebrow uppercase tracking-[0.24em] text-n-4">
                Projects
              </p>
              <h2 className="site-title-h2 mt-2 tracking-tight text-n-6">
                项目
              </h2>
            </div>
            <span className="site-meta rounded-full border border-n-2 px-2.5 py-1 text-n-5">
              {projects.length} 个
            </span>
          </div>

          {withHtml.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-n-2 px-6 py-12 text-center">
              <p className="site-meta text-n-5">还没有项目。</p>
              <p className="site-meta mt-2 text-n-4">
                在 <code>content/projects/</code> 新增笔记即可。
              </p>
            </div>
          ) : (
            withHtml.map((project, index) => (
              <article
                key={project.slug}
                className="surface-shell surface-shell-hover group relative rounded-2xl p-5 sm:p-6"
                style={{ animationDelay: `${index * 0.05}s` }}
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
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="site-title-h3 text-n-6 transition duration-200 group-hover:text-primary">
                          {project.title}
                        </h3>
                        {project.status ? (
                          <span className="site-eyebrow rounded-full border border-primary/25 bg-primary/8 px-2 py-0.5 text-primary">
                            {project.status}
                          </span>
                        ) : null}
                      </div>
                      {project.description ? (
                        <p className="mt-3 max-w-3xl text-sm leading-7 text-n-5 sm:text-base">
                          {project.description}
                        </p>
                      ) : null}
                    </div>
                    {project.url ? (
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-n-4 transition duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
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
                    <div className="pointer-events-auto relative border-t border-n-2/70 pt-3 text-sm text-n-5">
                      <MarkdownBody html={project.html} />
                    </div>
                  ) : null}
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  )
}
