/**
 * Site-wide calendar/clock: China Standard Time (UTC+8).
 * Content frontmatter without an offset is treated as written in this zone.
 */
export const SITE_TIMEZONE = "Asia/Shanghai"
export const SITE_LOCALE = "zh-CN"

/** Parse content dates to ISO UTC. Naive strings → Asia/Shanghai wall time. */
export function parseContentDate(value: unknown): string | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString()
  }
  if (typeof value === "number") {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d.toISOString()
  }
  if (typeof value !== "string") return null
  const s = value.trim()
  if (!s) return null

  // Explicit timezone (Z or ±HH:MM / ±HHMM)
  if (
    /[zZ]$/.test(s) ||
    /[+-]\d{2}:\d{2}$/.test(s) ||
    /[+-]\d{4}$/.test(s)
  ) {
    const d = new Date(s)
    return Number.isNaN(d.getTime()) ? s : d.toISOString()
  }

  // YYYY-MM-DD only → midnight in Shanghai
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = new Date(`${s}T00:00:00+08:00`)
    return Number.isNaN(d.getTime()) ? s : d.toISOString()
  }

  // "YYYY-MM-DD HH:mm[:ss]" or "YYYY-MM-DDTHH:mm[:ss]" without offset
  const m = s.match(
    /^(\d{4}-\d{2}-\d{2})[ T](\d{1,2}:\d{2})(?::(\d{2}))?/,
  )
  if (m) {
    const hhmm = m[2]!.padStart(5, "0")
    const sec = m[3] ?? "00"
    const d = new Date(`${m[1]}T${hhmm}:${sec}+08:00`)
    return Number.isNaN(d.getTime()) ? s : d.toISOString()
  }

  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? s : d.toISOString()
}

function asDate(iso: string): Date | null {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d
}

/** e.g. 2026年7月23日 */
export function formatSiteDate(iso: string): string {
  const d = asDate(iso)
  if (!d) return iso
  return d.toLocaleDateString(SITE_LOCALE, {
    timeZone: SITE_TIMEZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/** e.g. 2026年7月23日 17:02 */
export function formatSiteDateTime(iso: string): string {
  const d = asDate(iso)
  if (!d) return iso
  return d.toLocaleString(SITE_LOCALE, {
    timeZone: SITE_TIMEZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    hourCycle: "h23",
  })
}

/** e.g. Jul 12, 2026 (en short, still Shanghai calendar day) */
export function formatSiteDateEn(iso: string): string {
  const d = asDate(iso)
  if (!d) return iso
  return d.toLocaleDateString("en-US", {
    timeZone: SITE_TIMEZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

/** e.g. Jul 12 (en short, Shanghai) */
export function formatSiteDateEnShort(iso: string): string {
  const d = asDate(iso)
  if (!d) return iso
  return d.toLocaleDateString("en-US", {
    timeZone: SITE_TIMEZONE,
    month: "short",
    day: "numeric",
  })
}

/** e.g. 17:02 (24h, Shanghai) */
export function formatSiteTime(iso: string): string {
  const d = asDate(iso)
  if (!d) return ""
  return d.toLocaleTimeString("en-GB", {
    timeZone: SITE_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    hourCycle: "h23",
  })
}

/** Calendar year in Shanghai (for grouping timelines). */
export function formatSiteYear(iso: string): string {
  const d = asDate(iso)
  if (!d) return iso.slice(0, 4) || "Unknown"
  return d.toLocaleDateString("en-US", {
    timeZone: SITE_TIMEZONE,
    year: "numeric",
  })
}

/** Month short + zero-padded day in Shanghai (足迹侧栏). */
export function formatSiteMonthDay(iso: string): {
  month: string
  day: string
  time: string
} {
  const d = asDate(iso)
  if (!d) {
    return {
      month: iso.slice(5, 7),
      day: iso.slice(8, 10) || "--",
      time: "",
    }
  }
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SITE_TIMEZONE,
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    hourCycle: "h23",
  }).formatToParts(d)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? ""

  let hour = get("hour")
  if (hour === "24") hour = "00"

  return {
    month: get("month"),
    day: get("day"),
    time: `${hour}:${get("minute")}`,
  }
}
