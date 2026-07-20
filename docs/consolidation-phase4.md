# Consolidation Phase 4 — Checkpoint

**Status:** complete  
**Date:** 2026-07-20  
**Branch:** `main` (see latest commit)

## Done

- [x] **4.1 ScrollReveal** — no tall-list wrappers on 足迹 / 拾光 / 篇章列表；header/toolbar only
- [x] **4.2 globals.css split** — `src/styles/{tokens,surfaces,updates,timeline,hub,home,effects,nav,prose,gallery,code-callouts}.css`
- [x] **4.3 MarkdownBody** — plain HTML is RSC static; interactive → `MarkdownBodyInteractive`
- [x] **4.4 SiteTimeline** — server component; filters via `?type=` + `?year=` Links (shareable)
- [x] **4.5 Nav preview regression notes** — see below

## ScrollReveal rule

| OK | Avoid |
|----|--------|
| Page header | Full `UpdateTimeline` |
| Filter toolbar | Full `SiteTimeline` / `PostList` |
| Short hub cards | Any container taller than viewport |

## Nav preview (do not regress)

1. Centering: outer node uses Tailwind `-translate-x-1/2` (individual `translate` property).
2. Entrance motion: **only** `opacity` + `translateY` + `scale` via `.animate-soft-panel-in*`.
3. **Never** put `translate(-50%, …)` in keyframes or `animation-fill-mode: both` will lock a left shift.
4. Search panel uses `.animate-soft-panel-in` (not arbitrary `animate-[nav-preview-in_…]`).

## Timeline URL contract

| Param | Values |
|-------|--------|
| `type` | omit / `posts` / `updates` / `glimpse` |
| `year` | omit / `YYYY` |

Example: `/timeline?type=updates&year=2026`

## Resume pointer

Next: **Phase 5 工程护栏** (`content:check`, smoke tests, admin docs).
