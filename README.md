# zlog

个人博客：在 Obsidian 写作，经 Git 推送，Vercel 自动构建上线。

## 技术栈

| 层 | 选型 |
|----|------|
| 框架 | Next.js 16 (App Router) + TypeScript |
| 样式 | Tailwind CSS 4 |
| 内容 | `content/` Markdown + gray-matter + remark/rehype |
| 包管理 | pnpm |
| 测试 | Vitest |
| 部署 | Vercel（`main` 分支 push → 全量重建） |

## 目录

```
content/                 # 唯一写作区（Obsidian 可直接打开）
  posts/**/*.md          # 长文 → /posts、/posts/[slug]
  updates/**/*.md        # 短动态 → /updates
  glimpses/**/*.md       # 拾光图文 → /timeline
  pages/**/*.md          # 静态区块 → /more（按 order 聚合）
  site.json              # 站点名、导航、社交等
src/                     # Next.js 应用与 content loader
public/                  # 静态资源（不含文章配图）
scripts/                 # 构建前生成搜索索引等
tests/                   # 内容解析与加载测试
```

**写作只改 `content/`。** 代码在 `src/`；文章图片请走图床 URL，不要放进仓库。

## 本地开发

```bash
pnpm i          # 安装依赖
pnpm dev        # 开发服务器 http://localhost:3000
pnpm build      # 生产构建（含搜索索引 prebuild）
pnpm test       # 单元测试
```

可选：`pnpm start` 预览生产构建；`pnpm lint` 跑 ESLint。

## Frontmatter 速查

仅 `published: true` 会进入线上；其余视为草稿。缺必填字段的 `.md` 会被跳过；**同类型重复 slug 会构建失败**。

### Post — `content/posts/**/*.md`

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | 是 | 标题 |
| `date` | 是 | 发布日期，如 `2026-07-12` |
| `published` | 是 | 仅 `true` 发布 |
| `slug` | 否 | 默认用相对路径/文件名 |
| `updated` | 否 | 最近更新 |
| `category` | 否 | 如 `dev` / `think` / `life` |
| `tags` | 否 | 字符串数组 |
| `summary` | 否 | 列表摘要 |
| `cover` | 否 | 封面图床 URL |

```yaml
---
title: 你好，世界
slug: hello-world
date: 2026-07-12
category: life
tags: [blog, start]
summary: 一句话摘要
published: true
---
```

### Update — `content/updates/**/*.md`

| 字段 | 必填 | 说明 |
|------|------|------|
| `date` | 是 | 时间，如 `2026-07-12T10:00:00` |
| `published` | 是 | 仅 `true` 发布 |

```yaml
---
date: 2026-07-12T10:00:00
published: true
---

短动态正文，可插图与链接。
```

### Glimpse — `content/glimpses/**/*.md`

| 字段 | 必填 | 说明 |
|------|------|------|
| `date` | 是 | 日期 |
| `published` | 是 | 仅 `true` 发布 |
| `caption` | 否 | 说明 |
| `images` | 建议 | 图床 URL 列表 |

```yaml
---
date: 2026-07-12
caption: 沿途拾光
images:
  - https://example.com/photo.jpg
published: true
---
```

### Page — `content/pages/**/*.md`

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | 是 | 区块标题 |
| `published` | 是 | 仅 `true` 发布 |
| `slug` | 否 | `/more` 页内锚点 id，如 `#about` |
| `order` | 否 | 排序（数字越小越靠前） |

```yaml
---
title: 关于
slug: about
order: 1
published: true
---
```

站点元信息见 `content/site.json`（名称、描述、导航、社交链接等）。

## Obsidian 写作流

1. 用 Obsidian 打开 **`content/`** 或**仓库根目录**（二选一，保持 vault 与 Git 路径一致）。
2. 安装并启用 **Obsidian Git** 插件：自动 commit / push 到远程（建议跟踪 `main`）。
3. 在对应子目录新建/编辑 Markdown，写好 frontmatter。
4. 草稿保持 `published: false`（或不设为 `true`）— **不会上线**。
5. 定稿只把 `published` 改为 **`true`**，保存后由插件推送即可。

无需后台、无需手动拷贝；**内容上线的唯一路径是 git push → Vercel 重建**。

## PicGo 与图片

- 站点**不托管**文章图片；请用 PicGo（或同类图床）上传后得到 **外链 URL**。
- 在 Markdown 中直接写外链：`![alt](https://...)`；Glimpse 的 `images` 也只接受 URL。
- 不要把大图提交进 `public/` 或 `content/` 当本地附件路径依赖。

## Vercel 部署

1. 在 Vercel **Import** 本 GitHub 仓库。
2. Framework：**Next.js**；Build 默认即可（`pnpm build`）。
3. 环境变量：设置 **`NEXT_PUBLIC_SITE_URL`** 为正式站点 URL（无尾斜杠），用于 RSS / sitemap 等绝对链接。
4. 生产分支：**`main`**。
5. 之后：改 `content/` → Obsidian Git / `git push` → Vercel 自动部署；无需在面板里「点发布」。

本地可在 `.env.local` 中写：

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 验收清单

部署或改完内容后自测：

- [ ] **草稿不上线**：`published: false`（或未为 `true`）的 post 不出现在首页 / `/posts` / 详情 / RSS
- [ ] **已发布文章**：`published: true` 的 post 出现在首页、篇章列表、详情页，并进入 `/feed` RSS
- [ ] **足迹 / 拾光**：updates 在 `/updates`（及首页最近动态）；glimpses 在 `/timeline`
- [ ] **PicGo 图片**：正文与 glimpse 外链图片可正常显示
- [ ] **非法 Markdown**：缺必填 frontmatter 的文件被跳过，不拖垮整站
- [ ] **重复 slug**：同类型两篇相同 slug 时 **`pnpm build` 失败**
- [ ] **Git 推送更新站点**：`main` 上 content 变更 push 后，Vercel 重建并反映线上

## License

Private personal project.
