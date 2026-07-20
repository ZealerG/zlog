# Consolidation Phase 3 — Checkpoint

**Status:** complete  
**Date:** 2026-07-20  
**Branch:** `main` (see latest commit)

## Done

- [x] **3.1 next/image remotePatterns** — `**.r2.dev`, Unsplash, Cloudinary in `next.config.ts`
- [x] **3.2 List thumbs** — `RemoteImage` + `fill` + `sizes` on timeline / home glimpses / GlimpseGrid
- [x] **3.3 EXIF off first paint** — gallery EXIF only on `pointerenter` / `focus` (+ URL promise cache)
- [x] **3.4 Image dedupe** — `extractMarkdownImages` unique; gallery `buildGallery` unique by `src`

## Key files

| File | Role |
|------|------|
| `next.config.ts` | `images.remotePatterns` |
| `src/components/media/RemoteImage.tsx` | optimize or plain img fallback |
| `src/components/timeline/SiteTimeline.tsx` | aspect-ratio thumbs |
| `src/components/markdown/ContentGallery.tsx` | hover EXIF |
| `src/lib/content/parse.ts` | unique image URLs |
| `src/lib/content/markdown.ts` | gallery src dedupe |

## Resume pointer

Next: **Phase 4 交互与样式债** or **Phase 5 工程护栏**.
