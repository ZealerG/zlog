# zlog 写作模板

## 推荐用法（文件会自动进对的目录）

### A. Templater「从模板创建」
命令面板：`Templater: Create new note from template`  
选 `post` / `update` / … → 若文件名是 Untitled 会提示输入标题 → **自动 `tp.file.move` 到对应 `content/` 子目录**。

### B. QuickAdd（命令面板搜「新篇章」等）
已配置目标文件夹，创建即落在正确路径。

### C. 在目标文件夹里新建
例如在 `content/posts/` 右键 New note → 文件夹模板自动套 `post.md`（不会误移）。

### D. 碎碎念（足迹 dump）
QuickAdd：`post memos` → 追加到 `content/glimpses/memos.md`（不要新建独立文件）。

---

| 模板 | 自动落到 | 站点 |
|------|----------|------|
| `post.md` | `content/posts/` | 篇章 |
| `update.md` | `content/updates/` | 足迹（单条） |
| `glimpse.md` | `content/glimpses/` | 拾光（需有图） |
| `memo-entry.md` | （仅插入片段，不建文件） | 足迹 dump |
| `project.md` | `content/projects/` | 项目 |
| `friend.md` | `content/friends/` | 友链 |
| `bookmark.md` | `content/bookmarks/` | 书签 |
| `page.md` | `content/pages/` | 静态页 |

## 注意

- **不要用**「Templater: Insert template」在空白 Untitled 上只插入内容却不移动——请用 **Create new note from template**，或先建好再插入（模板仍会尝试 move）。
- 拾光不要写 `## YYYY-MM-DD` 分段（那是 memo dump，会进足迹）。
- 配图用 PicGo 外链，避免 `![[本地附件]]`。
