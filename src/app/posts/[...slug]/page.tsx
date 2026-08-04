import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { AdjacentPosts } from "@/components/posts/AdjacentPosts"
import { PostMeta } from "@/components/posts/PostMeta"
import { PostSidebarActions } from "@/components/posts/PostSidebarActions"
import {
  ReadingProgressBar,
  ReadingProgressRail,
} from "@/components/posts/ReadingProgress"
import { TableOfContents } from "@/components/posts/TableOfContents"
import { Backlinks } from "@/components/posts/Backlinks"
import { MarkdownBody } from "@/components/markdown/MarkdownBody"
import { getAllPosts, getPostBySlug } from "@/lib/content/load"
import { markdownToHtml } from "@/lib/content/markdown"

type Params = Promise<{ slug: string[] }>

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug.split("/") }))
}

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug.join("/"))
  if (!post) return { title: "未找到" }
  return {
    title: post.title,
    description: post.summary,
  }
}

export default async function PostDetailPage({
  params,
}: {
  params: Params
}) {
  const { slug: segments } = await params
  const slug = segments.join("/")
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const { html, headings } = await markdownToHtml(post.body)
  const all = getAllPosts()
  const index = all.findIndex((p) => p.slug === post.slug)
  const prev = index >= 0 ? all[index + 1] : undefined
  const next = index > 0 ? all[index - 1] : undefined

  return (
    <>
      <ReadingProgressBar />
      <main className="mx-auto min-h-screen w-full max-w-7xl px-6 py-16 sm:px-10">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,48rem)_16rem] lg:items-start lg:justify-end">
          <article className="min-w-0">
            <h1 className="site-title-page text-center tracking-tight text-n-6">
              {post.title}
              {!post.published ? (
                <span className="ml-3 align-middle rounded-full border border-primary/40 px-2.5 py-0.5 text-sm font-medium text-primary">
                  Draft
                </span>
              ) : null}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-n-5">
              <PostMeta date={post.date} updated={post.updated} />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {post.category ? (
                <Link
                  href={`/posts?category=${encodeURIComponent(post.category)}`}
                  className="category-inline"
                >
                  /{post.category}
                </Link>
              ) : (
                <Link href="/posts" className="category-inline">
                  /篇章
                </Link>
              )}
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/posts?tag=${encodeURIComponent(tag)}`}
                  className="tag-inline"
                >
                  #{tag}
                </Link>
              ))}
            </div>

            {post.summary ? (
              <div className="post-summary-card relative mt-6 overflow-hidden rounded-3xl px-5 py-4 sm:px-6 sm:py-5">
                <p className="reading-copy site-body relative text-n-5">
                  {post.summary}
                </p>
              </div>
            ) : null}

            <div className="mt-8 lg:hidden">
              <ReadingProgressRail />
              <TableOfContents headings={headings} />
              <PostSidebarActions title={post.title} />
            </div>

            <div
              data-reading-progress-root
              data-post-content-root
              className="post-reading-copy reading-copy site-body mt-10 space-y-6 text-n-6"
            >
              <MarkdownBody html={html} className="post-reading-body" />
            </div>

            <AdjacentPosts prev={prev} next={next} />
            <div className="lg:hidden">
              <Backlinks backlinks={post.backlinks ?? []} />
            </div>
          </article>

          <aside className="sticky top-28 hidden max-h-[calc(100vh-8rem)] min-h-0 overflow-y-auto pl-5 text-sm lg:flex lg:w-64 lg:flex-col">
            <ReadingProgressRail />
            <TableOfContents headings={headings} />
            <Backlinks
              backlinks={post.backlinks ?? []}
              variant="sidebar"
            />
            <PostSidebarActions title={post.title} />
          </aside>
        </div>
      </main>
    </>
  )
}
