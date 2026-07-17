import { NextResponse } from "next/server"
import { parsePhotoExifFromBuffer } from "@/lib/media/exif"

export const runtime = "nodejs"

const MAX_BYTES = 12 * 1024 * 1024

function isAllowedUrl(raw: string): URL | null {
  try {
    const url = new URL(raw)
    if (url.protocol !== "http:" && url.protocol !== "https:") return null
    // block obvious local targets
    const host = url.hostname.toLowerCase()
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host === "::1" ||
      host.endsWith(".local")
    ) {
      return null
    }
    return url
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const raw = searchParams.get("url")
  if (!raw) {
    return NextResponse.json({ error: "missing url" }, { status: 400 })
  }

  const url = isAllowedUrl(raw)
  if (!url) {
    return NextResponse.json({ error: "invalid url" }, { status: 400 })
  }

  try {
    const upstream = await fetch(url.toString(), {
      headers: {
        Accept: "image/*,*/*",
        "User-Agent": "zlog-exif/1.0",
      },
      // EXIF lives in headers; still need image bytes
      cache: "force-cache",
      next: { revalidate: 60 * 60 * 24 * 7 },
    })

    if (!upstream.ok) {
      return NextResponse.json(
        { error: "upstream failed", status: upstream.status },
        { status: 502 },
      )
    }

    const len = Number(upstream.headers.get("content-length") ?? 0)
    if (len > MAX_BYTES) {
      return NextResponse.json({ error: "too large" }, { status: 413 })
    }

    const buf = Buffer.from(await upstream.arrayBuffer())
    if (buf.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: "too large" }, { status: 413 })
    }

    const exif = await parsePhotoExifFromBuffer(buf)
    return NextResponse.json(
      { exif },
      {
        headers: {
          "Cache-Control": "public, s-maxage=604800, stale-while-revalidate=86400",
        },
      },
    )
  } catch {
    return NextResponse.json({ error: "parse failed" }, { status: 500 })
  }
}
