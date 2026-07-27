# zlog 写作模板

在 Obsidian 中用 **Templater** / **QuickAdd** 调用。文件夹模板已绑定：在对应目录新建文件会自动套用。

| 模板 | 写入目录 | 出现在站点 |
|------|----------|------------|
| `post.md` | `content/posts/` | 篇章 `/posts` |
| `update.md` | `content/updates/` | 足迹 `/updates`（单条） |
| `memo-entry.md` | 追加到 `content/glimpses/memos.md` | 足迹（多条 dump） |
| `glimpse.md` | `content/glimpses/` | 拾光影像（需有图） |
| `project.md` | `content/projects/` | 远方 · 项目 |
| `friend.md` | `content/friends/` | 远方 · 友链 |
| `bookmark.md` | `content/bookmarks/` | 远方 · 书签 |
| `page.md` | `content/pages/` | 可选静态页 |

## 字段速查

- **draft: true** / **published: false** → 生产构建隐藏；本地 `pnpm dev` 默认可见
- **categories** 与 **category** 都可用；**description** 与 **summary** 都可用
- 拾光 `glimpse`：**必须**有 `images:` 或正文 `![](url)`，且**不要**用 `## YYYY-MM-DD` 分段（那是 memo dump）
- 足迹 memo dump：每条以 `## YYYY-MM-DD HH:mm` 开头
- 配图请走 PicGo / R2 外链，勿用 `![[本地附件]]`
