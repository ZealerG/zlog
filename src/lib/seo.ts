import type { Metadata } from "next"
import type { Post } from "./content/types"
import { getSiteConfig } from "./content/site"
import { getSiteUrl } from "./content/site-url"

type PageMetadataOptions = {
  path: string
  title: string
  description: string
  image?: string
  noIndex?: boolean
  absoluteTitle?: boolean
}

export function absoluteSiteUrl(pathOrUrl: string): string {
  return new URL(pathOrUrl, `${getSiteUrl()}/`).toString()
}

export function createPageMetadata({
  path,
  title,
  description,
  image,
  noIndex = false,
  absoluteTitle = false,
}: PageMetadataOptions): Metadata {
  const site = getSiteConfig()
  const socialImage = absoluteSiteUrl(image || site.avatar)

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    robots: {
      index: !noIndex,
      follow: true,
    },
    openGraph: {
      type: "website",
      url: path,
      siteName: site.title,
      locale: site.locale.replace("-", "_"),
      title,
      description,
      images: [{ url: socialImage, alt: `${site.title} - ${title}` }],
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: [socialImage],
    },
  }
}

export function createArticleMetadata(post: Post): Metadata {
  const site = getSiteConfig()
  const path = `/posts/${post.slug}`
  const description = post.summary || site.description
  const socialImage = absoluteSiteUrl(post.cover || site.avatar)

  return {
    title: post.title,
    description,
    keywords: post.tags,
    authors: [{ name: site.author, url: "/" }],
    alternates: { canonical: path },
    robots: {
      index: post.published,
      follow: true,
    },
    openGraph: {
      type: "article",
      url: path,
      siteName: site.title,
      locale: site.locale.replace("-", "_"),
      title: post.title,
      description,
      publishedTime: post.date,
      modifiedTime: post.updated || post.date,
      authors: [site.author],
      tags: post.tags,
      images: [{ url: socialImage, alt: post.title }],
    },
    twitter: {
      card: post.cover ? "summary_large_image" : "summary",
      title: post.title,
      description,
      images: [socialImage],
    },
  }
}

export function createWebsiteJsonLd() {
  const site = getSiteConfig()
  const siteUrl = getSiteUrl()

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: site.title,
        description: site.description,
        inLanguage: site.locale,
        author: { "@id": `${siteUrl}/#author` },
      },
      {
        "@type": "Person",
        "@id": `${siteUrl}/#author`,
        name: site.author,
        url: siteUrl,
        image: absoluteSiteUrl(site.avatar),
      },
    ],
  }
}

export function createArticleJsonLd(post: Post) {
  const site = getSiteConfig()
  const url = absoluteSiteUrl(`/posts/${post.slug}`)

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary || site.description,
    image: [absoluteSiteUrl(post.cover || site.avatar)],
    datePublished: post.date,
    dateModified: post.updated || post.date,
    inLanguage: site.locale,
    keywords: post.tags.join(", "),
    mainEntityOfPage: url,
    author: {
      "@type": "Person",
      name: site.author,
      url: getSiteUrl(),
    },
    publisher: {
      "@type": "Person",
      name: site.author,
      url: getSiteUrl(),
    },
  }
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c")
}
