import fs from "node:fs"
import path from "node:path"
import { getAllPosts } from "../src/lib/content/load"

const posts = getAllPosts()
const index = posts.map((p) => ({
  slug: p.slug,
  title: p.title,
  summary: p.summary ?? "",
  tags: p.tags,
  category: p.category ?? "",
}))
const out = path.join(process.cwd(), "public", "search-index.json")
fs.mkdirSync(path.dirname(out), { recursive: true })
fs.writeFileSync(out, JSON.stringify(index, null, 2))
console.log(`Wrote ${index.length} posts to ${out}`)
