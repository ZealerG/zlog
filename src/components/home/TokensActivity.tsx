import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { getSiteConfig } from "@/lib/content/site"
import {
  buildHeatmapWeeks,
  costPerMillion,
  fetchTokscaleProfile,
  formatCost,
  formatPercent,
  formatTokens,
  heatmapMonthLabels,
  pastYearRange,
  tokenMix,
} from "@/lib/tokscale"

/**
 * Home activity card: past-year Tokscale density + key stats → /tokens.
 * Soft-fails to null if the public API is unreachable.
 */
export async function TokensActivity() {
  const site = getSiteConfig()
  const username = (site.tokscale || "ZealerG").trim()
  if (!username) return null

  const profile = await fetchTokscaleProfile(username, "all")
  if (!profile) return null

  const { stats } = profile
  const yearRange = pastYearRange()
  const weeks = buildHeatmapWeeks(profile.contributions, yearRange)
  const monthLabels = heatmapMonthLabels(weeks)
  const mix = tokenMix(stats).filter((s) => s.value > 0)
  const mixTotal = mix.reduce((s, x) => s + x.value, 0) || 1
  const cpm = costPerMillion(stats)
  const perDay =
    stats.activeDays > 0 ? stats.totalTokens / stats.activeDays : null

  const yearCaption = `${formatYearLabel(yearRange.start)} – ${formatYearLabel(yearRange.end)}`

  return (
    <section className="home-feed-block" aria-label="Token activity">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="home-feed-eyebrow font-normal uppercase text-n-5">
            Token activity
          </p>
          <p className="home-feed-title mt-1 font-bold text-n-6">AI 用量</p>
        </div>
        <Link
          href="/tokens"
          className="group/all inline-flex items-center gap-1.5 site-meta text-n-5 transition-colors hover:text-primary"
        >
          View all
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-n-1/80 text-n-5 transition duration-300 group-hover/all:bg-primary/12 group-hover/all:text-primary dark:bg-white/6">
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/all:translate-x-0.5 group-hover/all:-translate-y-0.5" />
          </span>
        </Link>
      </div>

      <Link
        href="/tokens"
        className="tokens-home-card surface-shell surface-shell-hover group relative block rounded-2xl p-4 transition duration-300 sm:p-5"
      >
        <div className="tokens-home-stats">
          <div className="tokens-home-stat">
            <p className="tokens-home-stat-label">Tokens</p>
            <p className="tokens-home-stat-value">
              {formatTokens(stats.totalTokens)}
            </p>
            {perDay ? (
              <p className="tokens-home-stat-hint">
                ≈ {formatTokens(perDay)} / 日
              </p>
            ) : null}
          </div>
          <div className="tokens-home-stat">
            <p className="tokens-home-stat-label">Cost</p>
            <p className="tokens-home-stat-value">
              {formatCost(stats.totalCost)}
            </p>
            {cpm != null ? (
              <p className="tokens-home-stat-hint">
                ≈ ${cpm.toFixed(2)} / 1M
              </p>
            ) : null}
          </div>
          <div className="tokens-home-stat">
            <p className="tokens-home-stat-label">Sessions</p>
            <p className="tokens-home-stat-value">{stats.sessionCount}</p>
            <p className="tokens-home-stat-hint">
              {stats.submissionCount} 次同步
            </p>
          </div>
          <div className="tokens-home-stat">
            <p className="tokens-home-stat-label">Active</p>
            <p className="tokens-home-stat-value">{stats.activeDays}</p>
            <p className="tokens-home-stat-hint">days</p>
          </div>
        </div>

        <div className="tokens-home-split">
          <div className="tokens-home-heat-wrap min-w-0">
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <p className="tokens-home-sublabel mb-0">Past year</p>
              <p className="site-meta text-n-4">{yearCaption}</p>
            </div>

            <div className="tokens-heat-year">
              <div
                className="tokens-heat-months"
                style={{
                  gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
                }}
              >
                {weeks.map((_, wi) => {
                  const label = monthLabels.find((m) => m.weekIndex === wi)
                  return (
                    <span key={wi} className="tokens-heat-month">
                      {label?.label ?? ""}
                    </span>
                  )
                })}
              </div>
              <div
                className="tokens-heat tokens-heat--home tokens-heat--year pointer-events-none"
                role="img"
                aria-label={`Token contribution heatmap for ${yearCaption}`}
              >
                {weeks.map((week, wi) => (
                  <div key={wi} className="tokens-heat-week">
                    {week.map((day) => (
                      <div
                        key={day.date}
                        className="tokens-heat-cell"
                        data-level={day.level}
                        title={
                          day.tokens > 0
                            ? `${day.date}: ${formatTokens(day.tokens)}`
                            : day.date
                        }
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-2 flex items-center justify-end gap-1 site-meta text-n-4">
              <span className="mr-1">Less</span>
              {[0, 1, 2, 3, 4].map((l) => (
                <span
                  key={l}
                  className="tokens-heat-cell"
                  data-level={l}
                  style={{ display: "inline-block" }}
                />
              ))}
              <span className="ml-1">More</span>
            </div>
          </div>

          <div className="tokens-home-side min-w-0">
            <p className="tokens-home-sublabel">Composition</p>
            <div className="tokens-mix-bar tokens-home-mix-bar" aria-hidden>
              {mix.map((s) => (
                <div
                  key={s.key}
                  className="tokens-mix-seg"
                  style={{
                    width: `${(s.value / mixTotal) * 100}%`,
                    background: s.color,
                  }}
                />
              ))}
            </div>
            <ul className="tokens-home-mix-list">
              {mix.slice(0, 4).map((s) => (
                <li key={s.key} className="tokens-home-mix-item">
                  <span
                    className="tokens-mix-dot"
                    style={{ background: s.color }}
                  />
                  <span className="truncate">{s.label}</span>
                  <span className="ml-auto tabular-nums text-n-6">
                    {formatPercent((s.value / mixTotal) * 100)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Link>
    </section>
  )
}

function formatYearLabel(iso: string): string {
  const [y, m] = iso.split("-")
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]
  const mi = Number(m) - 1
  return `${months[mi] ?? m} ${y}`
}
