# Obsidian → Vercel 个人博客 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建中文为主的个人博客：Obsidian 写 Markdown → Git 推送 → Vercel SSG 上线；气质贴近 xiami.dev，图床用 PicGo 外链。

**Architecture:** 单仓 monorepo：`content/` 为唯一内容源，Next.js App Router 构建时扫描 Markdown（gray-matter + remark/rehype），过滤 `published === true`，全站 SSG。内容新鲜度唯一路径为 `git push` → Vercel 全量重建。

**Tech Stack:** Next.js (App Router) + TypeScript + Tailwind CSS + pnpm；gray-matter、remark-gfm、rehype-slug、rehype-pretty-code（或 shiki）、unified；Vitest 测 content loader。

**Spec:** `docs/superpowers/specs/2026-07-12-obsidian-blog-design.md`

---

## File map（锁定职责）

| Path | Responsibility |
|------|----------------|
| `content/**` | Obsidian 数据源：posts / updates / glimpses / pages + `site.json` |
| `src/lib/content/types.ts` | 内容类型与 frontmatter 类型 |
| `src/lib/content/paths.ts` | content 根路径常量 |
| `src/lib/content/parse.ts` | 单文件：读 md、gray-matter、校验、规范化 |
| `src/lib/content/load.ts` | 扫描目录、过滤 published、slug 冲突检测、排序 API |
| `src/lib/content/markdown.ts` | Markdown → HTML（GFM、slug、高亮、外链） |
| `src/lib/content/site.ts` | 读 `site.json` |
| `src/lib/content/index.ts` | 对外 re-export |
| `src/lib/content/search-index.ts` | 构建 posts 搜索索引数据 |
| `src/components/layout/*` | Shell、Nav、Footer、Theme |
| `src/components/home/*` | Hero、最近写作、最近动态 |
| `src/components/posts/*` | 列表项、筛选、TOC、相邻文 |
| `src/components/markdown/MarkdownBody.tsx` | 安全渲染 HTML |
| `src/app/**` | 路由页面与 metadata |
| `src/app/feed/route.ts` | RSS |
| `src/app/sitemap.ts` | sitemap |
| `public/search-index.json` | **不手写**；由 `scripts/generate-search-index.ts` 在 `prebuild` 生成，或 build 时写入 `public/` |
| `scripts/generate-search-index.ts` | 生成搜索索引 JSON |
| `tests/content/*.test.ts` | loader 单元测试 |
| `README.md` | Obsidian Git + PicGo + Vercel 工作流 |

---

### Task 1: 初始化仓库与 Next.js 骨架

**Files:**
- Create: 整个 Next 项目于 `/Users/zealerg/Workspace/zlog_grok`（保留已有 `docs/`）
- Create: `.gitignore`, `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `tailwind` 配置, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

- [ ] **Step 1: 初始化 git（若尚未初始化）**

```bash
cd /Users/zealerg/Workspace/zlog_grok
git init
```

- [ ] **Step 2: 用 create-next-app 脚手架（非交互）**

在已有 `docs/` 的目录中创建 Next 应用。若 `create-next-app .` 因非空失败，则在临时目录生成后把文件移入，**不要覆盖** `docs/`。

```bash
cd /Users/zealerg/Workspace/zlog_grok
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack --use-pnpm
```

若提示目录非空：改用

```bash
pnpm create next-app@latest _scaffold --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack --use-pnpm
# 将 _scaffold 内文件（除冲突外）合并到 zlog_grok，删除 _scaffold
```

确认存在：`src/app/layout.tsx`, `package.json` 中 `"packageManager"` 或文档约定 pnpm。

- [ ] **Step 3: 补齐 .gitignore**

确保包含：

```
node_modules
.next
out
.superpowers
.env*.local
public/search-index.json
```

（`public/search-index.json` 由构建生成，可不入库。）

- [ ] **Step 4: 验证 dev 能起**

```bash
cd /Users/zealerg/Workspace/zlog_grok && pnpm dev
```

Expected: 本地 `http://localhost:3000` 显示默认 Next 页。Ctrl+C 停掉。

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js App Router with Tailwind"
```

---

### Task 2: 示例 content 与 site.json

**Files:**
- Create: `content/site.json`
- Create: `content/posts/hello-world.md`
- Create: `content/posts/draft-hidden.md`
- Create: `content/updates/2026-07-12-first-update.md`
- Create: `content/glimpses/2026-07-sample.md`
- Create: `content/pages/about.md`
- Create: `public/avatar.png`（可用 1×1 占位或简单 SVG 转 png；或 `public/avatar.svg` 并在 site.json 指向它）

- [ ] **Step 1: 写入 site.json**

```json
{
  "name": "zlog",
  "title": "zlog",
  "description": "兴趣驱动的记录与写作",
  "author": "zealerg",
  "avatar": "/avatar.svg",
  "locale": "zh-CN",
  "social": {
    "email": "",
    "github": ""
  },
  "nav": [
    { "href": "/", "label": "起点" },
    { "href": "/posts", "label": "篇章" },
    { "href": "/updates", "label": "足迹" },
    { "href": "/timeline", "label": "拾光" },
    { "href": "/more", "label": "远方" }
  ]
}
```

- [ ] **Step 2: 示例 post（已发布）**

`content/posts/hello-world.md`（正文里的代码块用缩进代码块或单独写文件，避免嵌套 fence 截断；示意内容如下）：

Frontmatter:

```yaml
title: 你好，世界
slug: hello-world
date: 2026-07-12
category: life
tags: [blog, start]
summary: 第一篇发布文章，用于验收内容管线。
published: true
```

Body（写入 md 时用标准 GFM 代码围栏即可）:

- 一段含 **粗体** 的说明
- 一个 TypeScript 代码块：`const ok = true`
- 一张 PicGo 风格外链图：`https://via.placeholder.com/800x400.png?text=PicGo`

- [ ] **Step 3: 草稿 post（不应上线）**

`content/posts/draft-hidden.md`:

```markdown
---
title: 草稿不该出现
date: 2026-07-12
published: false
---

此文 published 为 false。
```

- [ ] **Step 4: update / glimpse / page 各一篇**

`content/updates/2026-07-12-first-update.md`:

```markdown
---
date: 2026-07-12T10:00:00
published: true
---

博客管线跑通的第一天。
```

`content/glimpses/2026-07-sample.md`:

```markdown
---
date: 2026-07-12
caption: 沿途拾光示例
images:
  - https://via.placeholder.com/600x400.png?text=Glimpse
published: true
---
```

`content/pages/about.md`:

```markdown
---
title: 关于
slug: about
order: 1
published: true
---

在 Obsidian 写作，经 Git 自动发布。
```

- [ ] **Step 5: 占位头像**

创建 `public/avatar.svg`（简单圆形几何即可）。`site.json` 的 `avatar` 指向 `/avatar.svg`。

- [ ] **Step 6: Commit**

```bash
git add content public/avatar.svg
git commit -m "content: add sample vault files and site.json"
```

---

### Task 3: Content types + parse + load（TDD）

**Files:**
- Create: `src/lib/content/types.ts`
- Create: `src/lib/content/paths.ts`
- Create: `src/lib/content/parse.ts`
- Create: `src/lib/content/load.ts`
- Create: `src/lib/content/index.ts`
- Create: `tests/content/load.test.ts`
- Create: `vitest.config.ts`
- Modify: `package.json`（scripts + deps）

- [ ] **Step 1: 安装依赖与 Vitest**

```bash
cd /Users/zealerg/Workspace/zlog_grok
pnpm add gray-matter
pnpm add -D vitest
```

`package.json` scripts 增加：

```json
"test": "vitest run",
"test:watch": "vitest"
```

`vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config"
import path from "node:path"

export default defineConfig({
  test: { environment: "node" },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
})
```

- [ ] **Step 2: 写失败测试 `tests/content/load.test.ts`**

```ts
import { describe, it, expect } from "vitest"
import path from "node:path"
import {
  getAllPosts,
  getAllUpdates,
  getAllGlimpses,
  getAllPages,
  getPostBySlug,
} from "@/lib/content/load"

const contentRoot = path.join(process.cwd(), "content")

describe("content load", () => {
  it("returns only published posts", () => {
    const posts = getAllPosts(contentRoot)
    expect(posts.some((p) => p.slug === "hello-world")).toBe(true)
    expect(posts.some((p) => p.title === "草稿不该出现")).toBe(false)
  })

  it("loads post by slug", () => {
    const post = getPostBySlug("hello-world", contentRoot)
    expect(post?.title).toBe("你好，世界")
    expect(post?.body).toContain("这是正文")
  })

  it("loads updates and glimpses and pages", () => {
    expect(getAllUpdates(contentRoot).length).toBeGreaterThan(0)
    expect(getAllGlimpses(contentRoot).length).toBeGreaterThan(0)
    expect(getAllPages(contentRoot)[0]?.slug).toBe("about")
  })
})
```

- [ ] **Step 3: 运行测试确认失败**

```bash
pnpm test
```

Expected: FAIL（模块不存在）

- [ ] **Step 4: 实现 types / paths / parse / load**

`src/lib/content/paths.ts`:

```ts
import path from "node:path"

export function defaultContentRoot() {
  return path.join(process.cwd(), "content")
}
```

`src/lib/content/types.ts` — 定义：

```ts
export type Post = {
  title: string
  slug: string
  date: string // ISO
  updated?: string
  category?: string
  tags: string[]
  summary?: string
  cover?: string
  published: boolean
  body: string
  filePath: string
}

export type Update = {
  date: string
  published: boolean
  body: string
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

export type SiteConfig = {
  name: string
  title: string
  description: string
  author: string
  avatar: string
  locale: string
  social: { email?: string; github?: string }
  nav: { href: string; label: string }[]
}
```

`parse.ts` 职责：
- `readMarkdownFile(filePath)` → `{ data, content }`
- 校验必填：post 需 title/date/published；缺则 `console.warn` 返回 `null`
- slug：frontmatter.slug 或相对 `posts/` 的路径去扩展名（支持子目录 `dev/foo` → slug `dev/foo`）
- tags 默认 `[]`；dates 规范为可排序字符串

`load.ts` 职责：
- 递归扫描 `*.md`（可用 `fs.readdirSync` + 递归，或 `fast-glob`：`pnpm add fast-glob`）
- `getAllPosts`：filter published，按 date desc；**同一 slug 出现两次 → throw Error**
- `getPostBySlug(slug)`
- 同理 updates / glimpses / pages（pages 按 `order` asc）
- 所有 public API 接受可选 `contentRoot` 参数，默认 `defaultContentRoot()`，便于测试

- [ ] **Step 5: 跑测试通过**

```bash
pnpm test
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/content tests vitest.config.ts package.json pnpm-lock.yaml
git commit -m "feat(content): parse and load published markdown from content/"
```

---

### Task 4: Markdown 渲染管线

**Files:**
- Create: `src/lib/content/markdown.ts`
- Create: `src/components/markdown/MarkdownBody.tsx`
- Create: `tests/content/markdown.test.ts`
- Modify: `package.json` deps

- [ ] **Step 1: 安装 markdown 依赖**

```bash
pnpm add unified remark-parse remark-gfm remark-rehype rehype-stringify rehype-slug rehype-external-links rehype-pretty-code shiki
```

（若 `rehype-pretty-code` 配置过重，可改为 `rehype-highlight` + 一套 CSS；保持一种即可。）

- [ ] **Step 2: 测试 markdown 转换**

API 从一开始就返回 `{ html, headings }`（Task 6 TOC 直接用，避免二次改签名）：

```ts
import { describe, it, expect } from "vitest"
import { markdownToHtml } from "@/lib/content/markdown"

describe("markdownToHtml", () => {
  it("renders gfm and code and headings", async () => {
    const { html, headings } = await markdownToHtml(
      "## Hi\n\nHello **world**\n\n```ts\nconst a = 1\n```",
    )
    expect(html).toContain("<strong>world</strong>")
    expect(html).toContain("const a")
    expect(headings.some((h) => h.text === "Hi" && h.depth === 2)).toBe(true)
  })
})
```

- [ ] **Step 3: 实现 `markdownToHtml`**

签名：`async function markdownToHtml(md: string): Promise<{ html: string; headings: { id: string; text: string; depth: number }[] }>`

使用 unified pipeline：`remark-parse` → `remark-gfm` → `remark-rehype` → `rehype-slug` → `rehype-external-links`（target blank + rel）→ `rehype-pretty-code` 或 highlight → `rehype-stringify`；headings 可用 rehype 访问树或从 HTML 抽取 h2/h3。

- [ ] **Step 4: 安装 typography 并实现 MarkdownBody**

```bash
pnpm add @tailwindcss/typography
```

在 Tailwind v4：于 `globals.css` 用 `@plugin "@tailwindcss/typography";`（若脚手架为 v3 则在 `tailwind.config` 的 `plugins` 里 `require("@tailwindcss/typography")`）。以实际脚手架版本为准。

```tsx
export function MarkdownBody({ html }: { html: string }) {
  return (
    <div
      className="prose prose-invert max-w-none prose-a:text-sky-400"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
```

- [ ] **Step 5: 测试通过并 commit**

```bash
pnpm test
git add src/lib/content/markdown.ts src/components/markdown package.json pnpm-lock.yaml tests/content/markdown.test.ts
git commit -m "feat(content): markdown to HTML with GFM and code highlight"
```

---

### Task 5: 全局布局、主题与导航

**Files:**
- Create: `src/lib/content/site.ts`
- Create: `src/components/layout/SiteHeader.tsx`
- Create: `src/components/layout/SiteFooter.tsx`
- Create: `src/components/layout/SiteShell.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`（深色优先 token）

- [ ] **Step 1: `getSiteConfig()` 读 content/site.json**

```ts
import fs from "node:fs"
import path from "node:path"
import type { SiteConfig } from "./types"
import { defaultContentRoot } from "./paths"

export function getSiteConfig(contentRoot = defaultContentRoot()): SiteConfig {
  const raw = fs.readFileSync(path.join(contentRoot, "site.json"), "utf8")
  return JSON.parse(raw) as SiteConfig
}
```

- [ ] **Step 2: 布局组件**

- `SiteHeader`：桌面横排 nav（起点/篇章/足迹/拾光/远方），当前路径高亮（`usePathname` 客户端小组件或服务端传 pathname）
- `SiteFooter`：© 年 + author + 社交链接（email/github 空则隐藏）
- `SiteShell`：header + main + footer；`main` 最大宽度约 `max-w-5xl`

- [ ] **Step 3: root layout**

- `lang="zh-CN"`
- `className` 深色：`className="dark bg-zinc-950 text-zinc-100 antialiased"`
- metadata 从 `getSiteConfig()` 生成 title template

- [ ] **Step 4: globals.css 设计 token**

定义背景、文字阶、主色（如 sky/cyan 一点缀）、链接 hover。避免重粒子背景。

- [ ] **Step 5: 临时首页只渲染 Shell +「建设中」**

确认 `pnpm dev` 导航可点（子路由 404 可接受）。

- [ ] **Step 6: Commit**

```bash
git add src/app src/components/layout src/lib/content/site.ts
git commit -m "feat(ui): dark shell, nav, and site config"
```

---

### Task 6: 篇章列表与详情

**Files:**
- Create: `src/app/posts/page.tsx`
- Create: `src/app/posts/[...slug]/page.tsx`
- Create: `src/components/posts/PostList.tsx`
- Create: `src/components/posts/PostFilters.tsx`（可选客户端：读 searchParams）
- Create: `src/components/posts/TableOfContents.tsx`
- Create: `src/components/posts/AdjacentPosts.tsx`

- [ ] **Step 1: `/posts` 列表页（SSG）**

- `getAllPosts()` 渲染标题、日期、summary、category、tags
- 支持 query：`?sort=latest|earliest|updated`、`?category=`、`?tag=`
  - App Router：`page.tsx` 接收 `searchParams`，在服务端过滤/排序
- 空列表：显示「暂无文章」

- [ ] **Step 2: `/posts/[...slug]` 详情**

```ts
export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug.split("/") }))
}
```

- 找不到 → `notFound()`
- 渲染 title、date、MarkdownBody、tags
- TOC：使用 Task 4 已定的 `markdownToHtml` → `{ html, headings }`，**不要**再改返回类型
- 上一篇/下一篇：按 date 排序相邻

- [ ] **Step 3: 手动验收**

```bash
pnpm dev
```

打开 `/posts`、`/posts/hello-world`；确认草稿不可见。

- [ ] **Step 4: Commit**

```bash
git add src/app/posts src/components/posts src/lib/content
git commit -m "feat(posts): list, filters, and detail with TOC"
```

---

### Task 7: 首页 Hero + 摘要

**Files:**
- Create: `src/components/home/Hero.tsx`
- Create: `src/components/home/LatestWriting.tsx`
- Create: `src/components/home/LatestUpdates.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Hero**

- 左侧/上方：avatar 图
- 右侧：name、description、social icons
- 轻量 CSS 入场即可（`animate-in` 或简单 opacity transition），不强制 blur 粒子

- [ ] **Step 2: 最近写作 / 最近动态**

- posts 取前 5；updates 取前 5
- 双栏布局（lg+）；移动端堆叠

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx src/components/home
git commit -m "feat(home): hero and latest writing/updates"
```

---

### Task 8: 足迹 / 拾光 / 远方

**Files:**
- Create: `src/app/updates/page.tsx`
- Create: `src/app/timeline/page.tsx`
- Create: `src/app/more/page.tsx`
- Create: `src/components/updates/UpdateTimeline.tsx`
- Create: `src/components/glimpses/GlimpseGrid.tsx`

- [ ] **Step 1: `/updates`**

- `getAllUpdates()` 按 date desc
- 按年 → 月分组展示
- 每条渲染 MarkdownBody（短文）

- [ ] **Step 2: `/timeline`**

- `getAllGlimpses()` 网格：展示 `images` 与 caption
- 外链图片用 `next/image` 时需在 `next.config.ts` 配置 `images.remotePatterns` **或** 一期用普通 `<img>` 避免配置地狱（推荐一期 `<img>`，YAGNI）

- [ ] **Step 3: `/more`**

- **仅此路由**消费 pages：`getAllPages()` 按 order
- 每块：`id={slug}`（锚点）、title、MarkdownBody
- 顶部可列页内目录链到 `#slug`

- [ ] **Step 4: Commit**

```bash
git add src/app/updates src/app/timeline src/app/more src/components
git commit -m "feat: updates timeline, glimpses, and more page"
```

---

### Task 9: RSS、sitemap、客户端搜索

**Files:**
- Create: `src/app/feed/route.ts`
- Create: `src/app/sitemap.ts`
- Create: `src/lib/content/search-index.ts`
- Create: `scripts/generate-search-index.ts`
- Create: `src/components/posts/PostSearch.tsx`
- Modify: `src/app/posts/page.tsx`（挂搜索）
- Modify: `package.json`（`prebuild`）
- Modify: `next.config.ts` 若需

- [ ] **Step 1: RSS**

`GET /feed` 返回 `application/rss+xml`；channel 用 site 名；item 为全部 published posts（title、link、pubDate、description=summary）。

站点绝对 URL：读 `process.env.NEXT_PUBLIC_SITE_URL` 或 `VERCEL_URL`，fallback `http://localhost:3000`。在 README 写明生产环境设置 `NEXT_PUBLIC_SITE_URL`。

- [ ] **Step 2: sitemap.ts**

```ts
import type { MetadataRoute } from "next"
// 含 /, /posts, 每篇 post, /updates, /timeline, /more
```

- [ ] **Step 3: 搜索索引**

`scripts/generate-search-index.ts`：用**相对路径**导入 content loader（避免 `tsx` 不解析 `@/`）：

```ts
import fs from "node:fs"
import path from "node:path"
import { getAllPosts } from "../src/lib/content/load"

const posts = getAllPosts()
const index = posts.map((p) => ({
  slug: p.slug,
  title: p.title,
  summary: p.summary ?? "",
  tags: p.tags,
  category: p.category ?? "",
}))
const out = path.join(process.cwd(), "public", "search-index.json")
fs.mkdirSync(path.dirname(out), { recursive: true })
fs.writeFileSync(out, JSON.stringify(index, null, 2))
```

`package.json`:

```json
"prebuild": "tsx scripts/generate-search-index.ts",
"predev": "tsx scripts/generate-search-index.ts"
```

```bash
pnpm add -D tsx
```

- [ ] **Step 4: PostSearch 客户端组件**

- fetch `/search-index.json`
- 输入过滤 title/summary/tags
- 结果链到 `/posts/{slug}`

- [ ] **Step 5: 构建验证**

```bash
pnpm build
```

Expected: 成功；无草稿路由。

- [ ] **Step 6: Commit**

```bash
git add src/app/feed src/app/sitemap.ts src/components/posts/PostSearch.tsx scripts package.json
git commit -m "feat: RSS, sitemap, and client post search"
```

---

### Task 10: 重复 slug 测试 + 边界加固

**Files:**
- Modify: `tests/content/load.test.ts`
- Modify: `src/lib/content/load.ts`（若需）

- [ ] **Step 1: 重复 slug 测试**

在测试里用临时目录：写两个相同 slug 的 md，调用 `getAllPosts(tmp)`，期望 throw。

缺必填字段：写无无 title 的 published 文件，期望被 skip 且不出现在列表。

- [ ] **Step 2: 跑通**

```bash
pnpm test && pnpm build
```

- [ ] **Step 3: Commit**

```bash
git add tests src/lib/content
git commit -m "test(content): duplicate slug and invalid frontmatter"
```

---

### Task 11: README 与部署文档

**Files:**
- Create/Modify: `README.md`

- [ ] **Step 1: 写清工作流**

必须包含：

1. 技术栈与目录说明（`content/` 即写作区）
2. 本地：`pnpm i` / `pnpm dev` / `pnpm build` / `pnpm test`
3. Frontmatter 速查（post/update/glimpse/page）
4. **Obsidian**：打开 `content/` 或仓库根；安装 Obsidian Git；自动 commit/push 建议间隔；`published: true` 才上线
5. **PicGo**：继续外链；站点不托管图
6. **Vercel**：Import GitHub 仓；Framework Next.js；设置 `NEXT_PUBLIC_SITE_URL=https://your.domain`；生产分支 main；**内容更新 = push 触发重建**
7. 验收清单（对照 spec §10）

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: author workflow for Obsidian Git, PicGo, Vercel"
```

---

### Task 12: 端到端验收

**Files:** 无新文件（修复 bug 时按需）

- [ ] **Step 1: 全量检查**

```bash
pnpm test
pnpm build
pnpm start
```

手动打开：

| 路径 | 检查 |
|------|------|
| `/` | Hero、最近写作含 hello-world、最近动态 |
| `/posts` | 仅已发布；搜索可用 |
| `/posts/hello-world` | 正文、代码、图、TOC |
| `/updates` | 时间线 |
| `/timeline` | 拾光图 |
| `/more` | 关于锚点 `#about` |
| `/feed` | 合法 RSS |
| `/sitemap.xml` | 含关键 URL |

- [ ] **Step 2: 草稿回归**

确认 `draft-hidden` 不在任何列表、sitemap、feed。

- [ ] **Step 3: 最终 commit（若有修复）**

```bash
git add -A
git commit -m "fix: polish after e2e acceptance"
```

---

## 实现注意（全任务通用）

1. **不要**实现 ISR 作为发布手段；全部 SSG + push 重建。
2. **不要**给 `content/pages` 做独立路由。
3. **不要**引入数据库 / CMS / 认证。
4. 包管理器只用 **pnpm**。
5. 提交信息用 concise conventional commits。
6. 每完成一任务保持 `pnpm test` 与相关页面可运行。

## 执行方式

完成本 plan 后由用户选择：

1. **Subagent-Driven（推荐）** — 每任务新 subagent + 任务间 review  
2. **Inline Execution** — 本会话按 executing-plans 推进
