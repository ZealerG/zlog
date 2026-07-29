import type { Metadata } from "next"
import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowUpRight, Activity } from "lucide-react"
import { ScrollReveal } from "@/components/effects/ScrollReveal"
import { getSiteConfig } from "@/lib/content/site"
import {
  TOKSCALE_PERIODS,
  buildHeatmapWeeks,
  costPerMillion,
  fetchTokscaleProfile,
  formatCost,
  formatPercent,
  formatTokens,
  lastNDays,
  parseTokscalePeriod,
  periodLabel,
  tokenMix,
  tokscaleProfileUrl,
  type TokscalePeriod,
} from "@/lib/tokscale"

export const metadata: Metadata = {
  title: "Tokens",
  description: "AI coding token usage, live from Tokscale.",
}

export const revalidate = 3600

type SearchParams = Promise<{ period?: string }>

function formatUpdated(iso?: string) {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default async function TokensPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const period = parseTokscalePeriod(sp.period)
  const site = getSiteConfig()
  const username = (site.tokscale || "ZealerG").trim()
  const profile = await fetchTokscaleProfile(username, period)
  const profileUrl = tokscaleProfileUrl(username)

  if (!profile) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-16 sm:px-10">
        <header>
          <p className="site-eyebrow uppercase tracking-[0.28em] text-n-5">
            tokens
          </p>
          <h1 className="site-title-page mt-4 tracking-tight text-n-6">
            Tokens
          </h1>
        </header>
        <div className="mt-10 rounded-2xl border border-dashed border-n-2 px-6 py-14 text-center">
          <p className="site-meta text-n-5">暂时拉不到 Tokscale 数据。</p>
          <p className="site-meta mt-2 text-n-4">
            请稍后重试，或直接打开公开主页。
          </p>
          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition hover:opacity-80"
          >
            tokscale.ai/u/{username}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </main>
    )
  }

  const { stats } = profile
  const mix = tokenMix(stats).filter((s) => s.value > 0)
  const mixTotal = mix.reduce((s, x) => s + x.value, 0) || 1
  const cpm = costPerMillion(stats)
  const perActiveDay =
    stats.activeDays > 0 ? stats.totalTokens / stats.activeDays : null
  const trend = lastNDays(profile.contributions, period === "week" ? 7 : 30)
  const trendMax = Math.max(...trend.map((d) => d.tokens), 1)
  const weeks = buildHeatmapWeeks(profile.contributions, profile.chartRange)
  const models = [...profile.modelUsage].sort((a, b) => b.tokens - a.tokens)
  const topModels = models.slice(0, 8)
  const restModels = models.slice(8)
  const restTokens = restModels.reduce((s, m) => s + m.tokens, 0)
  const updated =
    profile.submissionFreshness?.lastUpdated || profile.updatedAt

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-16 sm:px-10">
      <ScrollReveal y={14}>
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="site-eyebrow uppercase tracking-[0.28em] text-n-5">
              tokens
            </p>
            <h1 className="site-title-page mt-4 flex flex-wrap items-baseline gap-3 tracking-tight text-n-6">
              <span>Tokens</span>
              <span className="site-body tracking-normal text-n-4">·</span>
              <span className="site-body tracking-normal text-n-5">
                AI 用量
              </span>
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <PeriodSwitch period={period} />
            <Link
              href="/more"
              className="site-meta inline-flex items-center gap-1.5 text-n-5 transition hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              远方
            </Link>
          </div>
        </header>
      </ScrollReveal>

      <ScrollReveal y={16} delay={40}>
        <section className="mt-10" aria-label="Overview">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="site-eyebrow uppercase tracking-[0.18em] text-n-4">
              Overview · {periodLabel(period)}
            </p>
            {updated ? (
              <p className="site-meta text-n-4">
                更新于 {formatUpdated(updated)}
              </p>
            ) : null}
          </div>
          <div className="tokens-stat-grid">
            <StatCard
              label="Tokens"
              value={formatTokens(stats.totalTokens)}
              hint={
                perActiveDay
                  ? `≈ ${formatTokens(perActiveDay)} / 活跃日`
                  : undefined
              }
            />
            <StatCard
              label="Cost"
              value={formatCost(stats.totalCost)}
              hint={
                cpm != null ? `≈ $${cpm.toFixed(2)} / 1M tokens` : undefined
              }
            />
            <StatCard
              label="Sessions"
              value={String(stats.sessionCount)}
              hint={`${stats.submissionCount} 次上传`}
            />
            <StatCard
              label="Active days"
              value={String(stats.activeDays)}
              hint={
                profile.dateRange
                  ? `${profile.dateRange.start} → ${profile.dateRange.end}`
                  : undefined
              }
            />
          </div>
        </section>
      </ScrollReveal>

      <div className="tokens-dual-grid mt-8">
        <ScrollReveal className="h-full" y={14} delay={60}>
          <Panel title="Token composition">
            <div className="tokens-panel-body tokens-mix-row">
              <div className="tokens-mix-bar" aria-hidden>
                {mix.map((s) => (
                  <div
                    key={s.key}
                    className="tokens-mix-seg"
                    style={{
                      width: `${(s.value / mixTotal) * 100}%`,
                      background: s.color,
                    }}
                    title={`${s.label}: ${formatTokens(s.value)}`}
                  />
                ))}
              </div>
              <div className="tokens-mix-legend">
                {mix.map((s) => (
                  <span key={s.key} className="tokens-mix-item">
                    <span
                      className="tokens-mix-dot"
                      style={{ background: s.color }}
                    />
                    <span>
                      {s.label}{" "}
                      <span className="tabular-nums text-n-6">
                        {formatTokens(s.value)}
                      </span>{" "}
                      <span className="text-n-4">
                        {formatPercent((s.value / mixTotal) * 100)}
                      </span>
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </Panel>
        </ScrollReveal>

        <ScrollReveal className="h-full" y={14} delay={80}>
          <Panel
            title={
              period === "week"
                ? "Daily tokens · last 7 days"
                : "Daily tokens · last 30 days"
            }
          >
            <div className="tokens-panel-body">
              <div
                className="tokens-bars"
                role="img"
                aria-label="Daily token bars"
              >
                {trend.map((d) => {
                  const h =
                    d.tokens > 0
                      ? Math.max(4, Math.round((d.tokens / trendMax) * 100))
                      : 2
                  return (
                    <div
                      key={d.date}
                      className="tokens-bar"
                      data-empty={d.tokens <= 0 ? "true" : "false"}
                      style={{ height: `${h}%` }}
                      title={`${d.date}: ${formatTokens(d.tokens)} · ${formatCost(d.cost)}`}
                    />
                  )
                })}
              </div>
              <div className="mt-2 flex justify-between site-meta text-n-4">
                <span>{trend[0]?.date.slice(5)}</span>
                <span>peak {formatTokens(trendMax)}</span>
                <span>{trend[trend.length - 1]?.date.slice(5)}</span>
              </div>
            </div>
          </Panel>
        </ScrollReveal>
      </div>

      <ScrollReveal y={14} delay={100}>
        <section className="mt-6">
          <Panel title="Activity · contribution density">
            <div className="tokens-heat" role="img" aria-label="Token contribution heatmap">
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
            <div className="mt-3 flex flex-wrap items-center gap-3 site-meta text-n-4">
              <span className="inline-flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5" />
                {stats.activeDays} active days
              </span>
              <span className="ml-auto inline-flex items-center gap-1">
                Less
                {[0, 1, 2, 3, 4].map((l) => (
                  <span
                    key={l}
                    className="tokens-heat-cell"
                    data-level={l}
                    style={{ display: "inline-block" }}
                  />
                ))}
                More
              </span>
            </div>
          </Panel>
        </section>
      </ScrollReveal>

      <ScrollReveal y={14} delay={110}>
        <section className="mt-6">
          <Panel title="Models">
            <div>
              {topModels.map((m) => (
                <div key={m.model} className="tokens-rank-row">
                  <span className="tokens-rank-name" title={m.model}>
                    {m.model}
                  </span>
                  <span className="tokens-rank-meta">
                    {formatTokens(m.tokens)}
                  </span>
                  <span className="tokens-rank-meta w-14 text-right">
                    {formatPercent(m.percentage)}
                  </span>
                </div>
              ))}
              {restTokens > 0 ? (
                <div className="tokens-rank-row">
                  <span className="tokens-rank-name text-n-5">
                    +{restModels.length} more models
                  </span>
                  <span className="tokens-rank-meta">
                    {formatTokens(restTokens)}
                  </span>
                  <span className="tokens-rank-meta w-14 text-right">
                    {formatPercent(
                      (restTokens / (stats.totalTokens || 1)) * 100,
                    )}
                  </span>
                </div>
              ) : null}
            </div>
          </Panel>
        </section>
      </ScrollReveal>

      <ScrollReveal y={10} delay={140}>
        <p className="mt-10 border-t border-n-2/70 pt-5 site-meta text-n-4">
          数据源 Tokscale
        </p>
      </ScrollReveal>
    </main>
  )
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="tokens-stat-card">
      <p className="tokens-stat-label">{label}</p>
      <p className="tokens-stat-value">{value}</p>
      {hint ? <p className="tokens-stat-hint">{hint}</p> : null}
    </div>
  )
}

function Panel({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="tokens-panel surface-shell rounded-2xl p-5 sm:p-6">
      <h2 className="site-eyebrow mb-4 shrink-0 uppercase tracking-[0.16em] text-n-4">
        {title}
      </h2>
      {children}
    </section>
  )
}

function PeriodSwitch({ period }: { period: TokscalePeriod }) {
  return (
    <nav className="tokens-period-pill" aria-label="Time range">
      {TOKSCALE_PERIODS.map((p) => (
        <Link
          key={p}
          href={p === "all" ? "/tokens" : `/tokens?period=${p}`}
          data-active={period === p ? "true" : "false"}
          scroll={false}
        >
          {periodLabel(p)}
        </Link>
      ))}
    </nav>
  )
}
