const DEFAULT_PLAYBACK_URL =
  "https://webhtv.zealerg.top/api/playback/sync"
const PLAYBACK_REVALIDATE_SECONDS = 5 * 60
const PLAYBACK_FETCH_LIMIT = 1000

export type RecentWatchingItem = {
  id: string
  title: string
  poster: string
  episode: string
  progress: number
  completed: boolean
  updatedAt: number
}

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function numberValue(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0
}

function normalizePoster(value: unknown): string {
  const poster = stringValue(value)
  if (!poster) return ""

  try {
    const url = new URL(poster)
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : ""
  } catch {
    return ""
  }
}

function normalizedTitle(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase()
}

export function parseRecentWatching(
  payload: unknown,
  limit = 8,
): RecentWatchingItem[] {
  if (!isRecord(payload) || !Array.isArray(payload.changes) || limit <= 0) {
    return []
  }

  const latestByTitle = new Map<string, RecentWatchingItem>()

  for (const change of payload.changes) {
    if (!isRecord(change) || stringValue(change.action) !== "upsert") continue

    const title = stringValue(change.vodName)
    const poster = normalizePoster(change.vodPic)
    const updatedAt = numberValue(change.updatedAt)
    if (!title || !poster || updatedAt <= 0) continue

    const titleKey = normalizedTitle(title)
    const existing = latestByTitle.get(titleKey)
    if (existing && existing.updatedAt >= updatedAt) continue

    const rawProgress = numberValue(change.progress)
    const siteKey = stringValue(change.siteKey)
    const vodId = stringValue(change.vodId)
    const historyKey = stringValue(change.historyKey)

    latestByTitle.set(titleKey, {
      id: historyKey || `${siteKey}:${vodId}` || `${titleKey}:${poster}`,
      title,
      poster,
      episode: stringValue(change.episodeName),
      progress: Math.min(1, Math.max(0, rawProgress)),
      completed: change.completed === true,
      updatedAt,
    })
  }

  return [...latestByTitle.values()]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, Math.floor(limit))
}

function playbackUrl(): string | null {
  const configured =
    process.env.WEBHTV_PLAYBACK_URL?.trim() || DEFAULT_PLAYBACK_URL

  try {
    const url = new URL(configured)
    if (url.protocol !== "https:" && url.protocol !== "http:") return null
    url.searchParams.set("since", "0")
    url.searchParams.set("limit", String(PLAYBACK_FETCH_LIMIT))
    return url.toString()
  } catch {
    return null
  }
}

export async function getRecentWatching(
  limit = 8,
): Promise<RecentWatchingItem[]> {
  const url = playbackUrl()
  const token = process.env.WEBHTV_PLAYBACK_TOKEN?.trim()
  const configKey = process.env.WEBHTV_PLAYBACK_CONFIG_KEY?.trim()
  if (!url || !token || !configKey) return []

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "X-WebHTV-Token": token,
        "X-WebHTV-Config-Key": configKey,
        "X-WebHTV-Since": "0",
        "X-WebHTV-Limit": String(PLAYBACK_FETCH_LIMIT),
      },
      next: { revalidate: PLAYBACK_REVALIDATE_SECONDS },
    })

    if (!response.ok) return []
    return parseRecentWatching(await response.json(), limit)
  } catch {
    return []
  }
}
