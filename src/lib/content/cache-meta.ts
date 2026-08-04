/**
 * 增量内容编译缓存元数据管理。
 *
 * 维护 `.content-cache/meta.json` 记录每个文件的 mtime+size。
 * 变更检测仍需 O(n) stat；缓存用于复用已计算的指纹，避免重复解析 Markdown。
 *
 * 约定:
 * - `.content-cache/` 位于 contentRoot 同级,gitignored
 * - meta.json 格式:
 *   {
 *     "draftFlag": "0"|"1",
 *     "fingerprint": "完整指纹字符串",
 *     "files": { [relativePath]: { mtimeMs, size } }
 *   }
 * - 当所有文件未变更且 draftFlag 一致时,直接复用缓存的 fingerprint
 */
import fs from "node:fs"
import path from "node:path"

export type CacheMetaEntry = {
  mtimeMs: number
  size: number
}

export type CacheMeta = {
  /** 生成该指纹时的 draft flag */
  draftFlag: string
  /** 上次计算的完整指纹字符串 */
  fingerprint: string
  /** 文件元数据 */
  files: Record<string, CacheMetaEntry>
}

const CACHE_DIR_NAME = ".content-cache"
const META_FILE_NAME = "meta.json"

function cacheDir(contentRoot: string): string {
  return path.join(
    /* turbopackIgnore: true */ path.dirname(
      /* turbopackIgnore: true */ path.resolve(
        /* turbopackIgnore: true */ contentRoot,
      ),
    ),
    CACHE_DIR_NAME,
  )
}

function metaPath(contentRoot: string): string {
  return path.join(
    /* turbopackIgnore: true */ cacheDir(contentRoot),
    META_FILE_NAME,
  )
}

/** 确保缓存目录存在 */
function ensureCacheDir(contentRoot: string): void {
  const dir = cacheDir(contentRoot)
  if (!fs.existsSync(/* turbopackIgnore: true */ dir)) {
    fs.mkdirSync(/* turbopackIgnore: true */ dir, { recursive: true })
  }
}

/** 读取缓存的 meta 文件,不存在或格式非法则返回默认值 */
function readCacheMeta(contentRoot: string): CacheMeta {
  const mp = metaPath(contentRoot)
  try {
    const raw = fs.readFileSync(/* turbopackIgnore: true */ mp, "utf8")
    const parsed = JSON.parse(raw) as Partial<CacheMeta>
    if (
      typeof parsed.fingerprint !== "string" || !parsed.fingerprint ||
      typeof parsed.draftFlag !== "string" ||
      !parsed.files || typeof parsed.files !== "object" ||
      Array.isArray(parsed.files)
    ) {
      return { draftFlag: "", fingerprint: "", files: {} }
    }
    return parsed as CacheMeta
  } catch {
    return { draftFlag: "", fingerprint: "", files: {} }
  }
}

/** 写入失败不影响内容加载；生产运行时的文件系统可能是只读的。 */
function writeCacheMeta(contentRoot: string, meta: CacheMeta): void {
  try {
    ensureCacheDir(contentRoot)
    const mp = metaPath(contentRoot)
    fs.writeFileSync(
      /* turbopackIgnore: true */ mp,
      `${JSON.stringify(meta, null, 2)}\n`,
    )
  } catch (error) {
    if (process.env.DEBUG_CONTENT) {
      const message = error instanceof Error ? error.message : String(error)
      console.warn(`[content] cache metadata write skipped: ${message}`)
    }
  }
}

function currentDraftFlag(): string {
  if (process.env.SHOW_DRAFTS === "1" || process.env.SHOW_DRAFTS === "true") return "1"
  if (process.env.SHOW_DRAFTS === "0" || process.env.SHOW_DRAFTS === "false") return "0"
  return process.env.NODE_ENV === "development" ? "1" : "0"
}

/**
 * 基于缓存的增量指纹计算。
 *
 * 逻辑:
 * 1. 读取缓存的 meta.json
 * 2. stat 每个文件,与缓存对比 mtime+size
 * 3. 全量未变更且 draftFlag 一致 → 复用缓存的 fingerprint
 * 4. 有变更 → 完整计算新 fingerprint,写回 meta
 *
 * 返回 { fingerprint, changed, unchanged } 供外部决定是否重建 ContentGraph。
 */
export function computeIncrementalFingerprint(
  contentRoot: string,
  allFiles: string[],
): {
  fingerprint: string
  changed: string[]
  unchanged: string[]
} {
  const cached = readCacheMeta(contentRoot)
  const changed: string[] = []
  const unchanged: string[] = []
  const currentFiles: Record<string, CacheMetaEntry> = {}
  let allUnchanged = true

  for (const filePath of allFiles) {
    const rel = path.relative(contentRoot, filePath)
    try {
      const st = fs.statSync(/* turbopackIgnore: true */ filePath)
      currentFiles[rel] = { mtimeMs: st.mtimeMs, size: st.size }
      const prev = cached.files[rel]
      if (prev && prev.mtimeMs === st.mtimeMs && prev.size === st.size) {
        unchanged.push(filePath)
      } else {
        changed.push(filePath)
        allUnchanged = false
      }
    } catch {
      changed.push(filePath)
      currentFiles[rel] = { mtimeMs: 0, size: 0 }
      allUnchanged = false
    }
  }

  // 检查被删除的文件
  const currentRels = new Set(allFiles.map((f) => path.relative(contentRoot, f)))
  for (const rel of Object.keys(cached.files)) {
    if (!currentRels.has(rel)) {
      changed.push(path.join(/* turbopackIgnore: true */ contentRoot, rel))
      allUnchanged = false
    }
  }

  const draftFlag = currentDraftFlag()

  // 全量未变更且 draftFlag 一致 → 复用缓存的 fingerprint
  if (allUnchanged && cached.fingerprint && cached.draftFlag === draftFlag) {
    return { fingerprint: cached.fingerprint, changed, unchanged }
  }

  // 有变更 → 计算完整 fingerprint(与原始格式兼容:全路径 mtime+size)
  const parts: string[] = [`drafts=${draftFlag}`]
  for (const filePath of allFiles) {
    const rel = path.relative(contentRoot, filePath)
    const meta = currentFiles[rel]
    if (meta) {
      parts.push(`${filePath}:${meta.mtimeMs}:${meta.size}`)
    }
  }
  const fingerprint = parts.sort().join("\n")

  // 写回缓存
  writeCacheMeta(contentRoot, {
    draftFlag,
    fingerprint,
    files: currentFiles,
  })

  return { fingerprint, changed, unchanged }
}

/** 清除缓存目录(debug / 测试用) */
export function clearCacheMeta(contentRoot: string): void {
  const dir = cacheDir(contentRoot)
  try {
    fs.rmSync(/* turbopackIgnore: true */ dir, { recursive: true, force: true })
  } catch {
    // ignore
  }
}
