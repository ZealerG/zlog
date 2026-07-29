/** Public Tokscale profile API — https://tokscale.ai/u/{username} */

export type TokscalePeriod = "all" | "month" | "week"

export type TokscaleStats = {
  totalTokens: number
  totalCost: number
  inputTokens: number
  outputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
  reasoningTokens: number
  submissionCount: number
  activeDays: number
  sessionCount: number
}

export type TokscaleModelUsage = {
  model: string
  tokens: number
  cost: number
  percentage: number
}

export type TokscaleContribution = {
  date: string
  totals: { tokens: number; cost: number; messages: number }
  intensity: number
  tokenBreakdown?: {
    input: number
    output: number
    cacheRead: number
    cacheWrite: number
    reasoning: number
  }
  clients?: Array<{
    client: string
    cost: number
    messages: number
    tokens?: {
      input: number
      output: number
      cacheRead: number
      cacheWrite: number
      reasoning: number
    }
  }>
}

export type TokscaleProfile = {
  user: {
    id: string
    username: string
    displayName: string
    avatarUrl?: string
    createdAt: string
    rank?: number
  }
  stats: TokscaleStats
  dateRange: { start: string; end: string }
  chartRange: { start: string; end: string }
  period: string
  updatedAt: string
  submissionFreshness?: {
    lastUpdated: string
    cliVersion?: string
    isStale?: boolean
  }
  clients: string[]
  models: string[]
  modelUsage: TokscaleModelUsage[]
  contributions: TokscaleContribution[]
}

const PERIODS: TokscalePeriod[] = ["week", "month", "all"]

export function parseTokscalePeriod(value?: string): TokscalePeriod {
  if (value === "week" || value === "month" || value === "all") return value
  return "all"
}

export function tokscaleProfileUrl(username: string) {
  return `https://tokscale.ai/u/${encodeURIComponent(username)}`
}

export async function fetchTokscaleProfile(
  username: string,
  period: TokscalePeriod = "all",
): Promise<TokscaleProfile | null> {
  const url = `https://tokscale.ai/api/users/${encodeURIComponent(username)}?period=${period}`
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    })
    if (!res.ok) return null
    const data = (await res.json()) as TokscaleProfile
    if (!data?.stats || !data?.user) return null
    return {
      ...data,
      contributions: Array.isArray(data.contributions) ? data.contributions : [],
      modelUsage: Array.isArray(data.modelUsage) ? data.modelUsage : [],
      clients: Array.isArray(data.clients) ? data.clients : [],
      models: Array.isArray(data.models) ? data.models : [],
    }
  } catch {
    return null
  }
}

export function formatTokens(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0"
  const abs = Math.abs(n)
  if (abs >= 1e12) return `${trimNum(n / 1e12)}T`
  if (abs >= 1e9) return `${trimNum(n / 1e9)}B`
  if (abs >= 1e6) return `${trimNum(n / 1e6)}M`
  if (abs >= 1e3) return `${trimNum(n / 1e3)}K`
  return String(Math.round(n))
}

export function formatCost(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "$0"
  if (n >= 1000) return `$${trimNum(n / 1000)}K`
  if (n >= 100) return `$${n.toFixed(0)}`
  if (n >= 10) return `$${n.toFixed(1)}`
  return `$${n.toFixed(2)}`
}

export function formatPercent(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0%"
  if (n < 0.1) return "<0.1%"
  if (n >= 10) return `${n.toFixed(1)}%`
  return `${n.toFixed(1)}%`
}

function trimNum(n: number): string {
  const s = n >= 100 ? n.toFixed(0) : n >= 10 ? n.toFixed(1) : n.toFixed(2)
  return s.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1")
}

export function costPerMillion(stats: TokscaleStats): number | null {
  if (!stats.totalTokens) return null
  return (stats.totalCost / stats.totalTokens) * 1e6
}

export type MixSlice = {
  key: string
  label: string
  value: number
  color: string
}

export function tokenMix(stats: TokscaleStats): MixSlice[] {
  return [
    { key: "input", label: "Input", value: stats.inputTokens, color: "var(--primary)" },
    { key: "output", label: "Output", value: stats.outputTokens, color: "#14b8a6" },
    {
      key: "cacheRead",
      label: "Cache read",
      value: stats.cacheReadTokens,
      color: "#a1a1aa",
    },
    {
      key: "cacheWrite",
      label: "Cache write",
      value: stats.cacheWriteTokens,
      color: "#71717a",
    },
    {
      key: "reasoning",
      label: "Reasoning",
      value: stats.reasoningTokens,
      color: "#8b5cf6",
    },
  ]
}

export type ClientRollup = { client: string; tokens: number; cost: number; messages: number }

/** Aggregate client usage from daily contributions. */
export function rollupClients(contributions: TokscaleContribution[]): ClientRollup[] {
  const map = new Map<string, ClientRollup>()
  for (const day of contributions) {
    for (const c of day.clients ?? []) {
      const name = c.client || "unknown"
      const tokens =
        (c.tokens?.input ?? 0) +
        (c.tokens?.output ?? 0) +
        (c.tokens?.cacheRead ?? 0) +
        (c.tokens?.cacheWrite ?? 0) +
        (c.tokens?.reasoning ?? 0)
      const prev = map.get(name) ?? { client: name, tokens: 0, cost: 0, messages: 0 }
      prev.tokens += tokens
      prev.cost += c.cost || 0
      prev.messages += c.messages || 0
      map.set(name, prev)
    }
  }
  return [...map.values()].sort((a, b) => b.tokens - a.tokens)
}

export type DayPoint = { date: string; tokens: number; cost: number }

export function lastNDays(
  contributions: TokscaleContribution[],
  n: number,
): DayPoint[] {
  const byDate = new Map(
    contributions.map((c) => [
      c.date,
      { date: c.date, tokens: c.totals?.tokens ?? 0, cost: c.totals?.cost ?? 0 },
    ]),
  )
  const end = new Date()
  end.setHours(0, 0, 0, 0)
  const out: DayPoint[] = []
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(end)
    d.setDate(end.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    out.push(byDate.get(key) ?? { date: key, tokens: 0, cost: 0 })
  }
  return out
}

export type HeatDay = {
  date: string
  tokens: number
  level: 0 | 1 | 2 | 3 | 4
}

export type HeatMonthLabel = {
  /** Week column index (0-based) where the label should sit */
  weekIndex: number
  label: string
}

/** Rolling past year ending on `end` (inclusive), as YYYY-MM-DD. */
export function pastYearRange(end: Date = new Date()): {
  start: string
  end: string
} {
  const e = new Date(end)
  e.setHours(0, 0, 0, 0)
  const s = new Date(e)
  s.setFullYear(s.getFullYear() - 1)
  s.setDate(s.getDate() + 1)
  return {
    start: toDateKey(s),
    end: toDateKey(e),
  }
}

function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number)
  return new Date(y!, m! - 1, d!)
}

/** Build a GitHub-style week columns heatmap covering chartRange (or last 52 weeks). */
export function buildHeatmapWeeks(
  contributions: TokscaleContribution[],
  chartRange?: { start: string; end: string },
): HeatDay[][] {
  const byDate = new Map(
    contributions.map((c) => [c.date, c.totals?.tokens ?? 0]),
  )
  const end = chartRange?.end
    ? parseDateKey(chartRange.end)
    : new Date()
  end.setHours(0, 0, 0, 0)
  const start = chartRange?.start
    ? parseDateKey(chartRange.start)
    : new Date(end)
  if (!chartRange?.start) start.setDate(end.getDate() - 52 * 7)
  start.setHours(0, 0, 0, 0)
  // rewind to Sunday (GitHub-style columns)
  start.setDate(start.getDate() - start.getDay())

  const values: number[] = []
  const days: { date: string; tokens: number }[] = []
  const cursor = new Date(start)
  while (cursor <= end) {
    const key = toDateKey(cursor)
    const tokens = byDate.get(key) ?? 0
    days.push({ date: key, tokens })
    if (tokens > 0) values.push(tokens)
    cursor.setDate(cursor.getDate() + 1)
  }

  const thresholds = intensityThresholds(values)
  const leveled: HeatDay[] = days.map((d) => ({
    date: d.date,
    tokens: d.tokens,
    level: levelFor(d.tokens, thresholds),
  }))

  const weeks: HeatDay[][] = []
  for (let i = 0; i < leveled.length; i += 7) {
    weeks.push(leveled.slice(i, i + 7))
  }
  return weeks
}

/** Month labels for a year heatmap — place label on the week that contains day 1. */
export function heatmapMonthLabels(weeks: HeatDay[][]): HeatMonthLabel[] {
  const labels: HeatMonthLabel[] = []
  let lastKey = ""
  weeks.forEach((week, weekIndex) => {
    for (const day of week) {
      const d = parseDateKey(day.date)
      if (d.getDate() !== 1) continue
      const key = `${d.getFullYear()}-${d.getMonth()}`
      if (key === lastKey) break
      lastKey = key
      labels.push({
        weekIndex,
        label: d.toLocaleString("en-US", { month: "short" }),
      })
      break
    }
  })
  return labels
}

function intensityThresholds(values: number[]): [number, number, number, number] {
  if (!values.length) return [1, 2, 3, 4]
  const sorted = [...values].sort((a, b) => a - b)
  const q = (p: number) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))]!
  return [q(0.25), q(0.5), q(0.75), q(0.9)]
}

function levelFor(
  tokens: number,
  t: [number, number, number, number],
): 0 | 1 | 2 | 3 | 4 {
  if (tokens <= 0) return 0
  if (tokens <= t[0]) return 1
  if (tokens <= t[1]) return 2
  if (tokens <= t[2]) return 3
  return 4
}

export function periodLabel(period: TokscalePeriod): string {
  if (period === "week") return "7 days"
  if (period === "month") return "30 days"
  return "All time"
}

export { PERIODS as TOKSCALE_PERIODS }
