import exifr from "exifr"

export type PhotoExif = {
  camera?: string
  lens?: string
  aperture?: string
  iso?: string
  shutter?: string
  focal?: string
  date?: string
}

function cleanCamera(make?: string, model?: string): string | undefined {
  const m = (make ?? "").trim()
  const mod = (model ?? "").trim()
  if (!m && !mod) return undefined
  if (m && mod) {
    // "Apple" + "iPhone 17" → "Apple iPhone 17" (xiami style)
    // "Canon" + "Canon EOS R5" → "Canon EOS R5"
    if (mod.toLowerCase().startsWith(m.toLowerCase())) return mod
    return `${m} ${mod}`.trim()
  }
  return mod || m || undefined
}

function formatAperture(n: unknown): string | undefined {
  const v = typeof n === "number" ? n : Number(n)
  if (!Number.isFinite(v) || v <= 0) return undefined
  const t = Number.isInteger(v) ? String(v) : v.toFixed(1).replace(/\.0$/, "")
  return `ƒ/${t}`
}

function formatIso(n: unknown): string | undefined {
  const v = typeof n === "number" ? n : Number(n)
  if (!Number.isFinite(v) || v <= 0) return undefined
  return `ISO ${Math.round(v)}`
}

function formatShutter(n: unknown): string | undefined {
  const v = typeof n === "number" ? n : Number(n)
  if (!Number.isFinite(v) || v <= 0) return undefined
  if (v >= 1) {
    const t = Number.isInteger(v) ? String(v) : v.toFixed(1).replace(/\.0$/, "")
    return `${t}s`
  }
  const den = Math.round(1 / v)
  if (den > 1) return `1/${den}s`
  return `${v}s`
}

function formatFocal(
  focal?: unknown,
  focal35?: unknown,
): string | undefined {
  const f35 = typeof focal35 === "number" ? focal35 : Number(focal35)
  if (Number.isFinite(f35) && f35 > 0) {
    return `${Math.round(f35)}mm (等效)`
  }
  const f = typeof focal === "number" ? focal : Number(focal)
  if (Number.isFinite(f) && f > 0) {
    const t = Number.isInteger(f) ? String(f) : f.toFixed(1).replace(/\.0$/, "")
    return `${t}mm`
  }
  return undefined
}

function formatDate(value: unknown): string | undefined {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getFullYear()
    const m = String(value.getMonth() + 1).padStart(2, "0")
    const d = String(value.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
  }
  if (typeof value === "string" && value.trim()) {
    // EXIF often: "2026:07:12 19:45:49"
    const normalized = value.includes("T")
      ? value
      : value.replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3")
    const d = new Date(normalized)
    if (!Number.isNaN(d.getTime())) return formatDate(d)
    const m = value.match(/^(\d{4}):(\d{2}):(\d{2})/)
    if (m) return `${m[1]}-${m[2]}-${m[3]}`
  }
  return undefined
}

function pick(
  data: Record<string, unknown>,
  ...keys: string[]
): unknown {
  for (const key of keys) {
    if (data[key] !== undefined && data[key] !== null && data[key] !== "") {
      return data[key]
    }
  }
  return undefined
}

export function normalizeExifRaw(
  raw: Record<string, unknown> | null | undefined,
): PhotoExif | null {
  if (!raw || typeof raw !== "object") return null

  const camera = cleanCamera(
    typeof pick(raw, "Make", "make") === "string"
      ? String(pick(raw, "Make", "make"))
      : undefined,
    typeof pick(raw, "Model", "model") === "string"
      ? String(pick(raw, "Model", "model"))
      : undefined,
  )
  const lensRaw = pick(raw, "LensModel", "lensModel", "Lens", "lens")
  const lens =
    typeof lensRaw === "string" && lensRaw.trim() ? lensRaw.trim() : undefined
  const aperture = formatAperture(pick(raw, "FNumber", "fNumber", "ApertureValue"))
  const iso = formatIso(
    pick(
      raw,
      "ISO",
      "iso",
      "ISOSpeedRatings",
      "PhotographicSensitivity",
      "IsoSpeedRatings",
    ),
  )
  const shutter = formatShutter(
    pick(raw, "ExposureTime", "exposureTime", "ShutterSpeedValue"),
  )
  const focal = formatFocal(
    pick(raw, "FocalLength", "focalLength"),
    pick(raw, "FocalLengthIn35mmFormat", "FocalLengthIn35mmFilm", "focalLengthIn35mmFormat"),
  )
  const date = formatDate(
    pick(raw, "DateTimeOriginal", "dateTimeOriginal", "CreateDate", "createDate", "DateTime"),
  )

  const exif: PhotoExif = {
    camera,
    lens,
    aperture,
    iso,
    shutter,
    focal,
    date,
  }

  if (!formatPhotoExifLines(exif).length) return null
  return exif
}

export function formatPhotoExifLines(exif: PhotoExif): string[] {
  // xiami-style: each field on its own line under the photo
  return [
    exif.camera,
    exif.aperture,
    exif.iso,
    exif.shutter,
    exif.focal,
    exif.date,
  ].filter((v): v is string => Boolean(v))
}

export async function parsePhotoExifFromBuffer(
  input: ArrayBuffer | Buffer | Uint8Array,
): Promise<PhotoExif | null> {
  try {
    const raw = await exifr.parse(input, {
      pick: [
        "Make",
        "Model",
        "LensModel",
        "FNumber",
        "ISO",
        "ISOSpeedRatings",
        "PhotographicSensitivity",
        "ExposureTime",
        "FocalLength",
        "FocalLengthIn35mmFormat",
        "FocalLengthIn35mmFilm",
        "DateTimeOriginal",
        "CreateDate",
        "DateTime",
      ],
      translateKeys: true,
      reviveValues: true,
      sanitize: true,
    })
    return normalizeExifRaw(raw as Record<string, unknown> | undefined)
  } catch {
    return null
  }
}

/**
 * In-flight + resolved cache so N gallery mounts of the same src
 * only hit /api/exif (and re-download the image) once.
 * Without this, 足迹 pages with multi-image memos stampede the EXIF route.
 */
const exifPromiseCache = new Map<string, Promise<PhotoExif | null>>()

async function parsePhotoExifUncached(src: string): Promise<PhotoExif | null> {
  try {
    if (typeof window !== "undefined") {
      // absolute remote → server proxy (CORS-safe)
      if (/^https?:\/\//i.test(src)) {
        const endpoint = `/api/exif?url=${encodeURIComponent(src)}`
        const res = await fetch(endpoint)
        if (!res.ok) return null
        const data = (await res.json()) as { exif?: PhotoExif | null }
        return data.exif ?? null
      }
      // relative / same-origin path
      const res = await fetch(src)
      if (!res.ok) return null
      return parsePhotoExifFromBuffer(await res.arrayBuffer())
    }

    const res = await fetch(src)
    if (!res.ok) return null
    return parsePhotoExifFromBuffer(await res.arrayBuffer())
  } catch {
    return null
  }
}

/**
 * Browser: prefer same-origin API for remote images (CORS-safe).
 * Node/tests: fetch the URL and parse buffer.
 * Dedupes concurrent + repeat calls by `src`.
 */
export function parsePhotoExif(src: string): Promise<PhotoExif | null> {
  if (!src || src.startsWith("data:")) return Promise.resolve(null)

  const hit = exifPromiseCache.get(src)
  if (hit) return hit

  const pending = parsePhotoExifUncached(src).catch(() => null)
  exifPromiseCache.set(src, pending)
  return pending
}
