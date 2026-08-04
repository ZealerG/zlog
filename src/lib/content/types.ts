export type Post = {
  title: string
  slug: string
  date: string
  updated?: string
  category?: string
  tags: string[]
  summary?: string
  cover?: string
  published: boolean
  body: string
  filePath: string
  /** [[Wiki 链接]] 目标 slug 列表(解析时提取) */
  wikilinks?: string[]
  /** 反向链接(谁引用了这篇文章,运行时构建) */
  backlinks?: { slug: string; title: string }[]
}

export type Update = {
  date: string
  published: boolean
  body: string
  /** Remote image URLs extracted at parse time (markdown `![](https://…)`). */
  images: string[]
  slug: string
  filePath: string
}

export type Glimpse = {
  date: string
  caption?: string
  images: string[]
  published: boolean
  body: string
  slug: string
  filePath: string
}

export type PageDoc = {
  title: string
  slug: string
  order: number
  published: boolean
  body: string
  filePath: string
}

export type Project = {
  title: string
  slug: string
  url?: string
  description?: string
  status?: string
  cover?: string
  tags: string[]
  order: number
  published: boolean
  body: string
  filePath: string
}

export type Friend = {
  title: string
  slug: string
  url: string
  avatar?: string
  description?: string
  order: number
  published: boolean
  filePath: string
}

export type Bookmark = {
  title: string
  slug: string
  url: string
  description?: string
  category?: string
  type?: string
  order: number
  published: boolean
  filePath: string
}

export type NavItem = {
  href: string
  label: string
  icon?: string
}

export type SiteConfig = {
  name: string
  brand?: string
  title: string
  description: string
  tagline?: string
  lead?: string
  summary?: string
  author: string
  avatar: string
  locale: string
  social: { email?: string; github?: string }
  /** Tokscale username for /tokens (e.g. ZealerG → tokscale.ai/u/ZealerG) */
  tokscale?: string
  nav: NavItem[]
}
