import path from "node:path"

export function defaultContentRoot() {
  return path.join(process.cwd(), "content")
}
