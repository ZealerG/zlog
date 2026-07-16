"use client"

import { useEffect, useState } from "react"
import type { SiteConfig } from "@/lib/content/types"

const PASS_KEY = "zlog-admin-password"

export default function AdminPage() {
  const [password, setPassword] = useState("")
  const [authed, setAuthed] = useState(false)
  const [site, setSite] = useState<SiteConfig | null>(null)
  const [status, setStatus] = useState<string>("")
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const saved = window.sessionStorage.getItem(PASS_KEY)
    if (saved) {
      setPassword(saved)
      void load(saved)
    }
  }, [])

  async function load(pass: string) {
    setBusy(true)
    setStatus("")
    try {
      const res = await fetch("/api/admin/site", {
        headers: { "x-admin-password": pass },
      })
      if (!res.ok) {
        setAuthed(false)
        setStatus(res.status === 401 ? "密码错误或未配置 ADMIN_PASSWORD" : "加载失败")
        return
      }
      const data = (await res.json()) as SiteConfig
      setSite(data)
      setAuthed(true)
      window.sessionStorage.setItem(PASS_KEY, pass)
      setStatus("已登录")
    } catch {
      setStatus("网络错误")
    } finally {
      setBusy(false)
    }
  }

  async function save() {
    if (!site) return
    setBusy(true)
    setStatus("保存中…")
    try {
      const res = await fetch("/api/admin/site", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify(site),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus(data.hint ? `${data.error} · ${data.hint}` : data.error || "保存失败")
        return
      }
      setSite(data.site)
      setStatus("已写入 content/site.json（请 git commit / 刷新前台）")
    } catch {
      setStatus("保存失败")
    } finally {
      setBusy(false)
    }
  }

  if (!authed || !site) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-md px-6 py-16 sm:px-10">
        <p className="site-eyebrow uppercase tracking-[0.28em] text-n-5">Admin</p>
        <h1 className="site-title-page mt-4 tracking-tight text-n-6">站点信息</h1>
        <p className="site-meta mt-3 text-n-5">
          仅编辑 <code>site.json</code>（站点名、简介、社交等）。文章请继续用 Obsidian。
        </p>
        <label className="mt-8 block space-y-2">
          <span className="site-meta text-n-5">ADMIN_PASSWORD</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-n-2 bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
            placeholder="环境变量中的管理密码"
          />
        </label>
        <button
          type="button"
          disabled={busy || !password}
          onClick={() => load(password)}
          className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          进入
        </button>
        {status ? <p className="site-meta mt-4 text-n-5">{status}</p> : null}
      </main>
    )
  }

  const set = <K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) => {
    setSite({ ...site, [key]: value })
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-6 py-16 sm:px-10">
      <p className="site-eyebrow uppercase tracking-[0.28em] text-n-5">Admin</p>
      <h1 className="site-title-page mt-4 tracking-tight text-n-6">站点信息</h1>
      <p className="site-meta mt-3 text-n-5">
        文章 / 足迹 / 拾光请用 Obsidian 编辑仓库里的 Markdown。这里只改站点展示信息。
      </p>

      <div className="mt-8 grid gap-4">
        {(
          [
            ["name", "显示名"],
            ["brand", "导航品牌"],
            ["title", "站点标题"],
            ["author", "作者"],
            ["avatar", "头像路径/URL"],
            ["tagline", "Typewriter 标签"],
            ["description", "简介"],
            ["summary", "首页长摘要"],
            ["lead", "副文案"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="grid gap-1.5">
            <span className="site-meta text-n-5">{label}</span>
            {key === "summary" || key === "description" || key === "lead" ? (
              <textarea
                value={String(site[key] ?? "")}
                onChange={(e) => set(key, e.target.value)}
                rows={key === "summary" ? 4 : 2}
                className="w-full rounded-xl border border-n-2 bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
              />
            ) : (
              <input
                value={String(site[key] ?? "")}
                onChange={(e) => set(key, e.target.value)}
                className="w-full rounded-xl border border-n-2 bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
              />
            )}
          </label>
        ))}

        <label className="grid gap-1.5">
          <span className="site-meta text-n-5">Email</span>
          <input
            value={site.social.email ?? ""}
            onChange={(e) =>
              set("social", { ...site.social, email: e.target.value })
            }
            className="w-full rounded-xl border border-n-2 bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="site-meta text-n-5">GitHub</span>
          <input
            value={site.social.github ?? ""}
            onChange={(e) =>
              set("social", { ...site.social, github: e.target.value })
            }
            className="w-full rounded-xl border border-n-2 bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
          />
        </label>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={save}
          className="inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          保存到 site.json
        </button>
        <button
          type="button"
          onClick={() => {
            window.sessionStorage.removeItem(PASS_KEY)
            setAuthed(false)
            setSite(null)
          }}
          className="inline-flex rounded-xl border border-n-2 px-4 py-2.5 text-sm text-n-5 transition hover:text-primary"
        >
          退出
        </button>
      </div>
      {status ? <p className="site-meta mt-4 text-n-5">{status}</p> : null}
    </main>
  )
}
