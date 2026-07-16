# zlog

个人博客：**Obsidian 写作 → Git 推送 → Vercel 自动构建上线**。

界面与信息架构参考 [xiami.dev](https://xiami.dev)（Chihiro），内容层采用本地 Markdown，不依赖在线 CMS。

- 仓库：https://github.com/ZealerG/zlog
- 技术栈：Next.js 16（App Router）· TypeScript · Tailwind CSS 4 · pnpm · Vitest · Vercel

---

## 目录结构

```
content/                      # 写作区（可用 Obsidian 打开）
  site.json                   # 站点名、头像、导航、社交等
  posts/**/*.md               # 长文 → /posts、/posts/[...slug]
  updates/**/*.md             # 短动态 → /updates
  glimpses/**/*.md            # 影像拾光 → /timeline
  projects/**/*.md            # 项目 → /projects
  friends/**/*.md             # 友链 → /friends
  bookmarks/**/*.md           # 书签 → /bookmarks
  pages/**/*.md               # 可选静态页（当前远方页以入口卡为主）
src/                          # Next.js 应用、内容加载与 UI
public/                       # 静态资源（favicon 等；文章图请走图床）
scripts/                      # 构建前生成搜索索引
tests/                        # 内容解析 / Markdown 测试
```

**写作只改 `content/`。** 样式与逻辑在 `src/`。文章配图请用图床外链，不要把大图提交进仓库。

公开仓库默认 **只带示例内容**；本地私人笔记可通过 `.gitignore` 排除（见文末「示例内容与私人文」）。

---

## 功能一览

| 路由 | 说明 |
|------|------|
| `/` | 起点：Hero + 最近写作 / 最近动态 |
| `/posts` | 篇章列表：排序、标签、分类、搜索 |
| `/posts/[...slug]` | 文章详情：TOC、阅读进度、代码复制、图片查看器 |
| `/updates` | 足迹时间线 |
| `/timeline` | 拾光（篇章 + 足迹 + 影像） |
| `/more` | 远方入口 |
| `/projects` · `/friends` · `/bookmarks` | 项目 / 友链 / 书签 |
| `/feed` | RSS |
| `/sitemap.xml` | 站点地图 |
| `/admin` | 可选：改 `site.json`（需密码，见环境变量） |

---

## 本地开发

### 环境要求

- Node.js **20+**（建议 LTS）
- **pnpm**（仓库指定 `packageManager`）

### 安装与启动

```bash
git clone https://github.com/ZealerG/zlog.git
cd zlog
pnpm install
cp .env.example .env.local   # 按需编辑
pnpm dev                     # http://localhost:3000
```

常用命令：

```bash
pnpm dev      # 开发（会生成含草稿的搜索索引）
pnpm build    # 生产构建（搜索索引不含草稿）
pnpm start    # 预览生产构建
pnpm test     # 单元测试
pnpm lint     # ESLint
```

开发模式下默认会 **显示草稿**（`NODE_ENV=development`）。生产构建默认隐藏草稿。

---

## 环境变量

在项目根目录创建 **`.env.local`**（已被 gitignore，不会提交）。

也可在 Vercel → Project → **Settings → Environment Variables** 中配置。

| 变量 | 是否必填 | 说明 |
|------|----------|------|
| `NEXT_PUBLIC_SITE_URL` | **生产强烈建议** | 站点绝对地址，**无尾斜杠**。用于 RSS、sitemap 等绝对链接。例：`https://blog.example.com`。本地可写 `http://localhost:3000`。未设置时，在 Vercel 上会回退到 `https://$VERCEL_URL`。 |
| `ADMIN_PASSWORD` | 否 | 开启 `/admin` 的口令。不设则管理接口一律 401，无法改 `site.json`。 |
| `SHOW_DRAFTS` | 否 | `1` / `true` 强制显示草稿；`0` / `false` 强制隐藏。不设时：开发显示、生产隐藏。一般不用改。 |

### `.env.example` 模板

```bash
# 站点 canonical URL（无尾斜杠）— 生产必配
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# 可选：/admin 改 site.json 的密码（本地/可写盘环境）
# ADMIN_PASSWORD=change-me

# 可选：强制显示/隐藏草稿（通常留给脚本默认）
# SHOW_DRAFTS=1
```

### Vercel 上建议配置

| 环境 | 变量 | 值示例 |
|------|------|--------|
| Production | `NEXT_PUBLIC_SITE_URL` | `https://你的域名` |
| Production | `ADMIN_PASSWORD` | （可选，且注意 Vercel 文件系统只读，见下） |
| Preview | `NEXT_PUBLIC_SITE_URL` | 可不设，自动用 Preview URL |

> **注意**：`ADMIN_PASSWORD` 在 Vercel 等 **只读文件系统** 上，即使登录成功也可能 **无法写入** `content/site.json`。生产环境推荐直接改仓库里的 `site.json` 后 `git push`。Admin 更适合本地开发。

---

## 如何写作

### 1. 用 Obsidian 打开

1. 用 Obsidian **打开本仓库根目录**，或只打开 `content/`（保持路径与 Git 一致）。
2. （推荐）安装 **Obsidian Git** 插件，跟踪 `main`，自动 commit / push。
3. 在对应子目录新建 / 编辑 Markdown，写好 frontmatter。
4. 草稿：`published: false` 或不要写成 `true`。
5. 定稿：改为 `published: true`，保存并推送。

### 2. Frontmatter 速查

仅 **`published: true`** 进入线上；缺必填字段会被跳过；**同类型重复 slug 会导致构建失败**。

#### 篇章 `content/posts/**/*.md`

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | 是 | 标题 |
| `date` | 是 | 如 `2026-07-12` |
| `published` | 是 | 仅 `true` 发布 |
| `slug` | 否 | 默认用路径/文件名 |
| `updated` | 否 | 更新时间 |
| `category` | 否 | 分类 |
| `tags` | 否 | 字符串数组 |
| `summary` | 否 | 列表摘要 |
| `cover` | 否 | 封面图 URL |

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

正文 Markdown…
```

#### 足迹 `content/updates/**/*.md`

```yaml
---
date: 2026-07-12T10:00:00
published: true
---

短动态正文，可插图与链接。
```

也支持「微语 dump」式单文件（`## 2026-07-12` 分段），解析器会拆成多条足迹。

#### 拾光影像 `content/glimpses/**/*.md`

```yaml
---
date: 2026-07-12
caption: 沿途拾光
images:
  - https://example.com/photo.jpg
published: true
---
```

#### 项目 / 友链 / 书签

```yaml
# content/projects/foo.md
---
title: zlog
url: https://github.com/...
status: active
tags: [nextjs, blog]
description: 一句话
order: 1
published: true
---
```

```yaml
# content/friends/bar.md
---
title: 某某博客
url: https://example.com
avatar: https://...
description: 欢迎光临
order: 1
published: true
---
```

```yaml
# content/bookmarks/baz.md
---
title: Full Stack Open
url: https://fullstackopen.com/
category: Dev
type: Article
description: 免费全栈课
order: 1
published: true
---
```

#### 站点信息 `content/site.json`

可改：站点名、品牌字、`avatar`（本地路径或图床 URL）、简介、社交链接、导航等。

本地也可打开 **http://localhost:3000/admin**（需配置 `ADMIN_PASSWORD`）编辑后写回该文件。

### 3. 图片

- 使用 PicGo / Cloudflare R2 / 任意图床，得到 **HTTPS 外链**。
- Markdown：`![说明](https://...)`。
- 文章内图片支持 **点击放大**（缩放、拖拽、多图切换；不显示文件名）。
- 不要把大图塞进 `public/` 或当本地相对路径依赖。

---

## 如何部署（Vercel）

### 第一次上线

1. 把代码推到 GitHub（本仓库示例：`https://github.com/ZealerG/zlog`）。
2. 打开 [Vercel](https://vercel.com) → **Add New Project** → Import 该仓库。
3. 框架预设选 **Next.js**；安装命令 / 构建命令一般自动识别 pnpm。
4. 在 Environment Variables 中设置：
   - `NEXT_PUBLIC_SITE_URL` = 你的正式域名（如 `https://blog.example.com`，无尾斜杠）
5. Production Branch 设为 **`main`**。
6. Deploy。

之后流程：

```
改 content/ 或 src/ → git push main → Vercel 自动重建 → 站点更新
```

无需在面板里手动「点发布」。

### 自定义域名

Vercel → Project → **Settings → Domains** 绑定域名，并把 `NEXT_PUBLIC_SITE_URL` 改成该域名后重新部署（或等下次 push）。

### 本地验证生产构建

```bash
pnpm build
pnpm start
```

确认：

- [ ] 草稿不出现在列表 / RSS  
- [ ] 已发布文章可打开  
- [ ] `/feed`、`/sitemap.xml` 中的链接域名正确  
- [ ] 图床图片可显示  

---

## 可选：管理后台 `/admin`

用于改 **站点元信息**（不是改文章）：

1. `.env.local` 设置 `ADMIN_PASSWORD=你的密码`
2. `pnpm dev` 后访问 `/admin`
3. 输入密码，编辑并保存 → 写入 `content/site.json`
4. 记得把变更 **commit + push**，线上才会更新

文章、足迹、书签等仍请用 Obsidian / Markdown。

---

## 示例内容与私人文

公开分支默认只提交示例（如 `hello-world`、`draft-hidden`、`markdowntest` 等）。

本地私人文章可放在 `content/posts/` 下，由 `.gitignore` 忽略（仓库已配置示例白名单规则）。**不要**把含隐私的正文 force-add 进公开仓库。

---

## 常见问题

**Q: 改了 Markdown 本地看不到？**  
A: 确认 `published: true`，并刷新；开发服对草稿默认可见。

**Q: 生产环境搜不到新文章？**  
A: 搜索索引在 `prebuild` 生成；推送后等 Vercel 构建完成。

**Q: RSS 链接是 localhost？**  
A: 生产环境配置 `NEXT_PUBLIC_SITE_URL` 为正式域名。

**Q: Admin 保存失败？**  
A: 多数云平台磁盘只读；请本地改 `site.json` 后 git push。

**Q: 重复 slug 构建失败？**  
A: 同类型内容 slug 必须唯一，改 frontmatter 或文件名。

---

## License

Private personal project.
