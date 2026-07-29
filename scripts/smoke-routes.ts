/**
 * HTTP smoke checks against a running site.
 * Run: pnpm smoke   (expects server at SMOKE_BASE_URL or http://localhost:3000)
 */
const base = (process.env.SMOKE_BASE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
)

type Check = {
  path: string
  /** Substrings that must appear in HTML body */
  includes?: string[]
}

const checks: Check[] = [
  { path: "/", includes: ["zlog"] },
  { path: "/posts", includes: ["篇章"] },
  { path: "/updates", includes: ["足迹"] },
  { path: "/timeline", includes: ["拾光"] },
  { path: "/more", includes: ["远方"] },
  { path: "/tokens", includes: ["Tokens"] },
  { path: "/projects" },
  { path: "/friends" },
  { path: "/bookmarks" },
  { path: "/feed", includes: ["<?xml", "rss"] },
  { path: "/sitemap.xml", includes: ["urlset", "url"] },
  { path: "/search-index.json" },
]

async function main() {
  let failed = 0
  console.log(`smoke → ${base}`)

  // connectivity
  try {
    const ping = await fetch(base, { redirect: "follow" })
    if (!ping.ok && ping.status >= 500) {
      console.error(`Server not healthy: ${ping.status}`)
      process.exit(1)
    }
  } catch (e) {
    console.error(
      `Cannot reach ${base}. Start the app (pnpm dev / pnpm start) first.\n`,
      e instanceof Error ? e.message : e,
    )
    process.exit(1)
  }

  for (const check of checks) {
    const url = `${base}${check.path}`
    try {
      const res = await fetch(url, { redirect: "follow" })
      const text = await res.text()
      const okStatus = res.status >= 200 && res.status < 400
      const missing = (check.includes ?? []).filter(
        (s) => !text.toLowerCase().includes(s.toLowerCase()),
      )
      if (!okStatus || missing.length) {
        failed += 1
        console.log(
          `FAIL  ${check.path}  status=${res.status}` +
            (missing.length ? `  missing=[${missing.join(", ")}]` : ""),
        )
      } else {
        console.log(`OK    ${check.path}  ${res.status}  (${text.length}b)`)
      }
    } catch (e) {
      failed += 1
      console.log(
        `FAIL  ${check.path}  ${e instanceof Error ? e.message : e}`,
      )
    }
  }

  console.log(
    failed === 0
      ? `\nsmoke passed (${checks.length} routes)`
      : `\nsmoke failed: ${failed}/${checks.length}`,
  )
  process.exit(failed === 0 ? 0 : 1)
}

void main()
