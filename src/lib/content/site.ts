import fs from "node:fs"
import path from "node:path"
import type { SiteConfig } from "./types"
import { defaultContentRoot } from "./paths"

export function getSiteConfig(contentRoot = defaultContentRoot()): SiteConfig {
  const raw = fs.readFileSync(path.join(contentRoot, "site.json"), "utf8")
  return JSON.parse(raw) as SiteConfig
}
