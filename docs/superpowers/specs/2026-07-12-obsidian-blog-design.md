# Obsidian → Vercel 个人博客设计规格

**日期:** 2026-07-12  
**状态:** 已确认  
**参考站:** https://xiami.dev/（气质相近，非像素复刻）  
**项目目录:** `/Users/zealerg/Workspace/zlog_grok`

## 1. 目标与成功标准

### 1.1 目标

搭建一个中文为主的个人博客：只在 Obsidian 写文章，经 Git 自动同步到 GitHub，由 Vercel 构建并上线。图片继续走已有 PicGo 图床，站点不托管媒体文件。

### 1.2 成功标准

1. 在 Obsidian 写/改内容并设置 `published: true` → 保存后由 Obsidian Git 推送 → Vercel 自动构建上线，无需手动拷贝或后台发布。
2. Markdown 中的 PicGo 图床 URL 在文章、动态、拾光中正常显示。
3. 一期可用页面：首页、篇章（列表+详情）、足迹、拾光、远方/关于；气质干净、偏个人站。
4. `git push` 即可部署；本地可 `next dev` 预览。

### 1.3 非目标（一期不做）

- 自研可视化编辑器或 JSON 结构化内容链路（Chihiro 那套）
- 留言板、在线状态、邮件订阅后端
- 音乐/游戏 embed 富卡片（足迹中先当普通 Markdown/链接）
- 界面中英切换、评论系统、分析面板
- 站点内上传/托管图片

## 2. 已确认决策

| 项 | 选择 |
|----|------|
| 视觉目标 | B：气质相近，不像素复刻 |
| 内容形态 | 长文 + 短动态 + 拾光 + 关于/更多 |
| 同步方式 | A：Obsidian Git → GitHub → Vercel |
| 图床 | B：已有 PicGo，Markdown 外链 |
| 技术栈 | B：Next.js |
| 内容组织 | A：按文件夹 |
| 草稿控制 | A：`published: true` 才发布 |
| 语言 | A：中文为主，文章可中英混写 |
| 架构路线 | 方案 2：Next.js + 构建时读 vault；发布靠 git push 全量重建（SSG 为主） |

## 3. 系统架构

```
Obsidian（打开 repo 的 content/ 为 vault 或 vault 根含 content/）
  │  写 Markdown + PicGo 插入图床 URL
  │  Obsidian Git 自动 commit / push
  ▼
GitHub 仓库
  content/     # 笔记数据源
  src/ 等      # Next.js 站点代码
  │
  │  push 触发 Vercel 全量 Build（内容新鲜度唯一路径）
  │  （二期可选：Deploy Hook / on-demand revalidate）
  ▼
Vercel 线上站
  - 构建时扫描 content/**/*.md
  - 过滤 published !== true
  - 首页 / 列表 / 详情均为 SSG（构建产物）
```

### 3.1 职责边界

| 组件 | 职责 |
|------|------|
| Obsidian | 唯一写作入口；frontmatter + Markdown 正文 |
| PicGo | 图片上传与 URL 生成；与站点解耦 |
| content/ | 唯一内容数据源；Git 版本管理 |
| Next.js content layer | 扫描、解析 frontmatter、渲染 Markdown、生成路由数据 |
| Vercel | 构建、托管、随 git push 重新部署 |

### 3.2 仓库形态

- **单仓 monorepo**：站点代码与 `content/` 同仓，降低同步复杂度。
- Obsidian 可直接打开仓库根（若笔记只在 `content/`）或打开 `content/` 子目录作为 vault。
- 一期不采用双仓 / submodule。

## 4. 内容模型

### 4.1 目录约定

```
content/
  posts/           # 长文 · 篇章
  updates/         # 短动态 · 足迹
  glimpses/        # 拾光
  pages/           # 静态页（关于、友链等）
  site.json        # 站点元信息（名称、简介、社交、导航文案）
```

- 仅处理上述目录内的 `.md` / `.mdx`（一期以 `.md` 为主）。
- 忽略 `published` 不为 `true` 的文件。
- 文件名建议 slug 友好：`my-post.md`；`slug` 字段可覆盖。

### 4.2 Frontmatter

#### Post（`content/posts/**/*.md`）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | string | 是 | 标题 |
| `slug` | string | 否 | 默认取相对路径/文件名 |
| `date` | date/string | 是 | 发布日期 |
| `updated` | date/string | 否 | 最近更新 |
| `category` | string | 否 | 如 `dev` / `think` / `life` |
| `tags` | string[] | 否 | 标签 |
| `summary` | string | 否 | 列表摘要；缺省可截取正文 |
| `cover` | string (URL) | 否 | 封面图（图床 URL） |
| `published` | boolean | 是 | 仅 `true` 发布 |

#### Update（`content/updates/**/*.md`）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `date` | datetime | 是 | 动态时间 |
| `published` | boolean | 是 | 仅 `true` 发布 |
| 正文 | Markdown | 是 | 短文、图片、链接 |

#### Glimpse（`content/glimpses/**/*.md`）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `date` | date | 是 | 时间 |
| `caption` | string | 否 | 说明 |
| `images` | string[] | 建议 | 图床 URL 列表；也可仅正文插图 |
| `published` | boolean | 是 | 仅 `true` 发布 |

#### Page（`content/pages/**/*.md`）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | string | 是 | 页标题 |
| `slug` | string | 否 | 如 `about`、`friends` |
| `order` | number | 否 | 在「远方」页中的排序 |
| `published` | boolean | 是 | 仅 `true` 发布 |

### 4.3 `site.json`（最小字段）

```json
{
  "name": "站点名",
  "title": "浏览器标题后缀",
  "description": "一句话简介",
  "author": "作者",
  "avatar": "/avatar.png",
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

## 5. 路由与功能

| 路由 | 渲染 | 说明 |
|------|------|------|
| `/` | SSG | Hero + 最近写作 + 最近动态 |
| `/posts` | SSG | 列表；支持 sort（latest / earliest / updated）；category / tag 筛选（query） |
| `/posts/[...slug]` | SSG | 文章详情；TOC；上一篇/下一篇 |
| `/updates` | SSG | 按年月分组的时间线 |
| `/timeline` | SSG | 拾光流 |
| `/more` | SSG | **唯一**消费 `content/pages/` 的入口：按 `order` 排序，将各 page 作为页内区块聚合展示；一期**不**为 page 生成独立路由（如 `/about`） |
| `/feed` | 静态/构建 | RSS |
| `/sitemap.xml` | 静态/构建 | 站点地图 |

**`pages` 路由规则（写死）：** 仅 `/more` 聚合渲染；`slug` 用于页内锚点 id（如 `#about`），不映射为独立 URL。

### 5.1 搜索

- 一期：客户端轻量搜索（构建时生成 posts 索引 JSON，浏览器过滤）。
- 不引入服务端搜索或外部搜索 SaaS。

### 5.2 Markdown 能力

- GFM（表格、任务列表、删除线、自动链接）
- 语法高亮（代码块）
- 图片：尊重原文 URL（PicGo）；响应式样式
- 外链：`target=_blank` + 安全 `rel`
- 可选：自动生成标题 id 供 TOC

## 6. 内容处理与发布

### 6.1 构建时 pipeline

1. 扫描 `content/{posts,updates,glimpses,pages}`。
2. 解析 frontmatter（gray-matter 或等价）。
3. 过滤 `published === true`。
4. 规范化 slug、日期、排序。
5. 将 Markdown 转为 HTML/React 树（remark/rehype）。
6. 产出列表数据、详情数据、搜索索引、RSS、sitemap。

### 6.2 发布与缓存策略（一期）

- **内容新鲜度唯一路径：** `git push` → Vercel 全量重建。Obsidian 改文后必须进入 Git 并触发部署，才会出现在线上。
- **渲染模式：** 首页、列表、详情、足迹、拾光、远方均以**构建时 SSG** 为主；一期**不依赖** ISR/`revalidate` 拉取新的 vault 内容（无 redeploy 时 revalidate 也读不到新的 Git 文件）。
- **ISR：** 标为可选/无发布语义；若实现层默认带 `revalidate`，不得将其宣传或设计成「不 push 也能更新文章」的机制。
- **二期可选：** on-demand revalidate、Deploy Hook 加速重建；不改变「内容来自 Git 构建产物」的前提。

### 6.3 错误与边界

- 缺必填 frontmatter：构建期 warning 并跳过该文件，不使整站失败（实现时二选一：fail-fast vs skip；**推荐 skip + 日志**，避免草稿字段写错拖垮部署）。
- 重复 slug：构建失败并报错（避免错误覆盖）。
- 空目录：页面显示空状态文案，不 500。

## 7. UI 气质

- 深色优先，可选浅色；中性灰字阶 + 少量主色。
- 字体：无衬线正文/标题 + 等宽点缀。
- 首页：头像/视觉 + 简介；下方最近写作与最近动态。
- 阅读页：舒适行宽、清晰层级、代码与图片可读。
- 动效：轻量 fade/入场，避免重粒子与复杂 3D。
- 导航文案中文：起点 / 篇章 / 足迹 / 拾光 / 远方。
- 不追求与 xiami.dev 像素级一致；布局与信息架构可参考。

## 8. 技术栈

| 层 | 选型 |
|----|------|
| 框架 | Next.js（App Router）+ TypeScript |
| 样式 | Tailwind CSS |
| 内容解析 | gray-matter + remark/rehype（GFM、slug、highlight） |
| 部署 | Vercel |
| 内容同步 | Obsidian Git 插件 |
| 图床 | 用户已有 PicGo（站点只消费 URL） |

不引入：数据库、用户认证、CMS 后台。

## 9. 本地与发布工作流

### 9.1 作者日常

1. Obsidian 打开 vault（`content/` 或含 `content/` 的仓库根）。
2. 在对应文件夹新建/编辑 Markdown，写 frontmatter。
3. 图片用 PicGo 上传，粘贴 URL。
4. 定稿将 `published` 设为 `true`。
5. Obsidian Git 自动或定时 push → Vercel 构建上线。

### 9.2 开发者

默认包管理器：**pnpm**（实现与文档统一使用 pnpm）。

1. `pnpm i`
2. `pnpm dev` 本地预览
3. `pnpm build` 校验内容解析与构建
4. 连接 Vercel 项目，环境变量一期尽量为零

### 9.3 配置清单（实现时交付）

- Obsidian Git：仓库 URL、自动 commit/push 间隔
- Vercel：Git 集成、生产分支、（可选）Deploy Hook
- `content/site.json` 与示例文章各一篇

## 10. 测试与验收

| 场景 | 预期 |
|------|------|
| 仅草稿（`published: false`） | 线上不可见 |
| 发布 post | 首页「最近写作」、`/posts`、详情、RSS 可见 |
| 发布 update / glimpse | 对应列表与首页摘要（若设计展示）可见 |
| PicGo 外链图 | 详情与列表封面正常加载 |
| 非法/缺字段 md | 跳过或明确报错，不产生错误 slug 页 |
| 重复 slug | 构建失败 |
| `git push` 仅改 content | Vercel 重新部署后内容更新 |

自动化：优先对 content loader（解析、过滤、slug、排序）做单元测试；E2E 可选。

## 11. 项目结构（建议）

```
zlog_grok/
  content/
    posts/
    updates/
    glimpses/
    pages/
    site.json
  public/
    avatar.png
  src/
    app/                 # 路由
    components/          # UI
    lib/content/         # 扫描、解析、类型
    styles/
  docs/superpowers/specs/
  package.json
  next.config.ts
  README.md
```

## 12. 风险与缓解

| 风险 | 缓解 |
|------|------|
| Obsidian Git 未配置导致「以为写了但没上线」 | README 写清插件步骤与检查清单 |
| 大图床外链失效 | 站点不镜像图片；文档提醒 PicGo 稳定性 |
| 构建时全量读 md 变慢 | 一期文章量小可接受；后续可缓存/增量 |
| 过度对齐 xiami 导致工期膨胀 | 规格明确「气质相近」与一期非目标 |

## 13. 二期候选（不在本期实现）

- On-demand ISR / 按路径 revalidate
- 足迹 embed 卡片（音乐、游戏）
- 留言、订阅、访问统计
- 浅色主题完善与动效增强
- MDX 自定义组件

## 14. 实现顺序（供后续 plan 拆解）

1. 初始化 Next.js + Tailwind + 基础布局/导航/主题
2. 实现 `lib/content` 扫描与类型 + 示例 content
3. 篇章列表与详情 + Markdown 渲染
4. 首页 Hero 与摘要区
5. 足迹、拾光、远方
6. RSS、sitemap、搜索索引
7. Vercel 配置与 git push 部署说明
8. Obsidian Git + PicGo 工作流文档与验收
