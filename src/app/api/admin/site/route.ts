import { NextResponse } from "next/server"
import fs from "node:fs"
import path from "node:path"
import type { SiteConfig } from "@/lib/content/types"

export const runtime = "nodejs"

function sitePath() {
  return path.join(process.cwd(), "content", "site.json")
}

function authorized(req: Request) {
  const password = process.env.ADMIN_PASSWORD?.trim()
  if (!password) return false
  const header = req.headers.get("x-admin-password") ?? ""
  return header === password
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const raw = fs.readFileSync(sitePath(), "utf8")
  return NextResponse.json(JSON.parse(raw) as SiteConfig)
}

export async function PUT(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  // On many serverless hosts content/ is read-only; still allow local/dev writes.
  try {
    const body = (await req.json()) as Partial<SiteConfig>
    const current = JSON.parse(
      fs.readFileSync(sitePath(), "utf8"),
    ) as SiteConfig

    const next: SiteConfig = {
      ...current,
      name: String(body.name ?? current.name).trim() || current.name,
      brand: String(body.brand ?? current.brand ?? current.name).trim(),
      title: String(body.title ?? current.title).trim() || current.title,
      description:
        String(body.description ?? current.description).trim() ||
        current.description,
      tagline: body.tagline != null ? String(body.tagline) : current.tagline,
      lead: body.lead != null ? String(body.lead) : current.lead,
      summary: body.summary != null ? String(body.summary) : current.summary,
      author: String(body.author ?? current.author).trim() || current.author,
      avatar: String(body.avatar ?? current.avatar).trim() || current.avatar,
      locale: String(body.locale ?? current.locale).trim() || current.locale,
      social: {
        email:
          body.social?.email != null
            ? String(body.social.email).trim()
            : current.social.email,
        github:
          body.social?.github != null
            ? String(body.social.github).trim()
            : current.social.github,
      },
      nav: current.nav,
    }

    fs.writeFileSync(sitePath(), `${JSON.stringify(next, null, 2)}\n`, "utf8")
    return NextResponse.json({ ok: true, site: next })
  } catch (e) {
    const message = e instanceof Error ? e.message : "write failed"
    return NextResponse.json(
      {
        error: message,
        hint: "生产环境只读文件系统时请本地改 content/site.json 后 git push。",
      },
      { status: 500 },
    )
  }
}
