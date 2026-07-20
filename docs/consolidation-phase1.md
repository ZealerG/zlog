# Consolidation Phase 1 — Checkpoint

**Status:** complete  
**Date:** 2026-07-20  
**Branch:** `main` (commit after push)

## Done

- [x] **1.1 Content Graph** — `loadContentGraph()` 一次扫盘产出 posts/updates/glimpses/pages/projects/friends/bookmarks；`glimpses/` 只 list 一次并分类 memo vs 影像
- [x] **1.2 Slug Map** — `postsBySlug: Map`；`getPostBySlug` O(1)，不再 `getAllPosts().find`
- [x] **1.3 mtime 缓存** — `readMarkdownFile` 按 path+mtime+size 缓存；graph 用 fingerprint 失效
- [x] **1.4 目录语义** — README 补充 足迹 / memo dump / 拾光 约定
- [x] **1.5 React.cache** — 默认 `content/` 根用 `cache(() => loadContentGraph(...))`，同请求 layout+page 共享

## API surface

| 导出 | 作用 |
|------|------|
| `loadContentGraph(root?)` | 构建/复用全量图 |
| `contentFingerprint(root)` | 文件 mtime 指纹 |
| `clearContentGraphCache()` | 测试用 |
| `clearMarkdownFileCache()` | 测试用（parse） |
| 原有 `getAll*` / `getPostBySlug` / `getTimelineEntries` | 行为不变，底层走 graph |

## Tests

- `pnpm test` — 23 passed（含 graph 复用、mtime 失效、timeline 聚合）
- `tsc --noEmit` — clean

## Resume pointer

下一阶段：**Phase 2 Markdown 分档**（`markdownToHtmlLite` 给足迹）或 **Phase 3 媒体**。  
基线对比：`docs/consolidation-phase0.md`。
