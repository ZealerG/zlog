# Consolidation Phase 0 — Checkpoint

**Status:** complete  
**Date:** 2026-07-20T07:16:40.577Z  
**Branch:** `main` @ `ba8b04f` (merged `ui/taste-skill-polish`)

## Done

- [x] **0.1** Merge `ui/taste-skill-polish` → `main` and push (`ba8b04f`)
- [x] **0.2** Ignore `.playwright-mcp/` in `.gitignore`
- [x] **0.3** Performance baseline for key routes (JSON sibling)
- [x] **0.4** Content inventory snapshot

## Route baseline (dev, warm sample)

| Route | TTFB ms | Total ms | Bytes | img tags |
|-------|--------:|---------:|------:|---------:|
| `/` | 36 | 39 | 78149 | 4 |
| `/posts` | 51 | 56 | 114698 | 0 |
| `/updates` | 33 | 43 | 96216 | 5 |
| `/timeline` | 32 | 34 | 79860 | 8 |
| `/more` | 27 | 31 | 53852 | 0 |
| `/projects` | 55 | 57 | 47138 | 1 |
| `/friends` | 26 | 28 | 46532 | 4 |
| `/bookmarks` | 23 | 25 | 48522 | 0 |

> Measured against `next dev`. Production static HTML will be faster; keep this table for **relative** regressions after content-layer work.

## Content inventory (workspace)

| Kind | Files | Bytes | Memo ## sections |
|------|------:|------:|-----------------:|
| posts | 16 | 208772 | — |
| updates | 1 | 85 | — |
| glimpses | 3 | 7343 | 11 |
| projects | 1 | 284 | — |
| friends | 4 | 675 | — |
| bookmarks | 2 | 309 | — |
| pages | 0 | 0 | — |

## Scale notes (0.4)

- Current public-ish sample is small (single-digit to low tens of files).
- Real stress is **memo dump section count** (each `## YYYY-MM-DD` → one 足迹 item + full/lite markdown).
- Next consolidation phase should re-run this baseline after Content Graph (Phase 1) and after expanding a local memo dump to ~50–100 sections.

## Resume pointer

If the session dies, continue from **Phase 1.1 Content Graph** in the consolidation plan.  
Artifacts: this file + `docs/consolidation-phase0-baseline.json`.
