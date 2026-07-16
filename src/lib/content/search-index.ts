export type SearchIndexEntry = {
  slug: string
  title: string
  summary: string
  tags: string[]
  category: string
}

export function filterSearchIndex(
  entries: SearchIndexEntry[],
  query: string,
): SearchIndexEntry[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  return entries.filter((entry) => {
    const haystack = [
      entry.title,
      entry.summary,
      entry.category,
      ...entry.tags,
    ]
      .join(" ")
      .toLowerCase()
    return haystack.includes(q)
  })
}
