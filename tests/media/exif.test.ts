import { describe, it, expect } from "vitest"
import {
  formatPhotoExifLines,
  normalizeExifRaw,
  parsePhotoExifFromBuffer,
} from "@/lib/media/exif"
import fs from "node:fs"
import path from "node:path"

describe("exif normalize", () => {
  it("formats camera / tech / date lines", () => {
    const exif = normalizeExifRaw({
      Make: "Apple",
      Model: "iPhone 17",
      FNumber: 1.6,
      ISO: 500,
      ExposureTime: 0.04,
      FocalLengthIn35mmFormat: 26,
      DateTimeOriginal: "2026:07:12 19:45:49",
    })
    expect(exif).toEqual({
      camera: "Apple iPhone 17",
      lens: undefined,
      aperture: "ƒ/1.6",
      iso: "ISO 500",
      shutter: "1/25s",
      focal: "26mm (等效)",
      date: "2026-07-12",
    })
    expect(formatPhotoExifLines(exif!)).toEqual([
      "Apple iPhone 17",
      "ƒ/1.6",
      "ISO 500",
      "1/25s",
      "26mm (等效)",
      "2026-07-12",
    ])
  })

  it("returns null when no useful tags", () => {
    expect(normalizeExifRaw({ JFIFVersion: 257 })).toBeNull()
  })
})

describe("exif parse buffer", () => {
  it("parses a real sample when available", async () => {
    const sample = path.join("/tmp", "xiami-sample.jpg")
    if (!fs.existsSync(sample)) return
    const buf = fs.readFileSync(sample)
    const exif = await parsePhotoExifFromBuffer(buf)
    expect(exif?.camera).toMatch(/iPhone/i)
    expect(exif?.aperture || exif?.iso || exif?.shutter).toBeTruthy()
  })
})
