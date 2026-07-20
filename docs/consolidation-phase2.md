# Consolidation Phase 2 — Checkpoint

**Status:** complete  
**Date:** 2026-07-20  
**Branch:** `main` (see latest commit)

## Done

- [x] **2.1 Lite pipeline** — `markdownToHtmlLite()`: GFM + links + images/galleries only
- [x] **2.2 Full vs lite** — posts/projects keep `markdownToHtml`; `/updates` uses lite
- [x] **2.3 Cache keys** — `pipeline:fnv(body):length` (not raw body as map key)
- [x] **2.4 Update.images** — extracted at parse (`extractMarkdownImages`); timeline uses `u.images`

## API

| Function | Use for |
|----------|---------|
| `markdownToHtml` | Long posts, projects |
| `markdownToHtmlLite` | Short updates / memos |
| `clearMarkdownHtmlCache` | Tests |
| `extractMarkdownImages` | Parse-time image list |

## Tests

- Full suite + lite gallery/link cases + memo `images[]` on updates

## Resume pointer

Next: **Phase 3 媒体** (`next/image` / remotePatterns / list thumbs) or **Phase 4 交互样式债**.
