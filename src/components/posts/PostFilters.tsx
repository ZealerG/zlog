import Link from "next/link"

export type PostFilterState = {
  sort: "latest" | "earliest" | "updated"
  category?: string
  tag?: string
}

function buildHref(state: PostFilterState): string {
  const params = new URLSearchParams()
  if (state.sort && state.sort !== "latest") {
    params.set("sort", state.sort)
  }
  if (state.category) params.set("category", state.category)
  if (state.tag) params.set("tag", state.tag)
  const qs = params.toString()
  return qs ? `/posts?${qs}` : "/posts"
}

const SORTS: { value: PostFilterState["sort"]; label: string }[] = [
  { value: "latest", label: "最新" },
  { value: "earliest", label: "最早" },
  { value: "updated", label: "最近更新" },
]

export function PostFilters({
  state,
}: {
  state: PostFilterState
  categories?: string[]
  tags?: string[]
}) {
  return (
    <div className="glass-chip flex flex-wrap items-center gap-1 rounded-full p-1">
      {SORTS.map((item) => {
        const active = state.sort === item.value
        return (
          <Link
            key={item.value}
            href={buildHref({ ...state, sort: item.value })}
            className={
              active
                ? "rounded-full bg-background px-3 py-1.5 text-xs font-medium text-primary shadow-sm transition dark:bg-n-0/80"
                : "rounded-full px-3 py-1.5 text-xs text-n-5 transition hover:text-primary"
            }
          >
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}
