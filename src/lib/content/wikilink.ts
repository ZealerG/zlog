export type ParsedWikilinkTarget = {
  slug: string | null
  heading: string | null
}

export function normalizeSlugPath(value: string): string {
  return value
    .trim()
    .replace(/\\/g, "/")
    .replace(/\.mdx?$/i, "")
    .replace(/&/g, "and")
    .replace(/\s+/g, "-")
}

export function parseWikilinkTarget(
  target: string,
): ParsedWikilinkTarget | null {
  const hashIndex = target.indexOf("#")
  const rawPath = (hashIndex === -1 ? target : target.slice(0, hashIndex)).trim()
  const rawHeading =
    hashIndex === -1 ? "" : target.slice(hashIndex + 1).trim()
  const slug = rawPath ? normalizeSlugPath(rawPath) : null
  const heading = rawHeading || null

  return slug || heading ? { slug, heading } : null
}

export function matchWikilinks(value: string): IterableIterator<RegExpMatchArray> {
  return value.matchAll(/(?<!!)\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g)
}
