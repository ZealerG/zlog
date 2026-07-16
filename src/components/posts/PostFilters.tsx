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
  { value: "latest", label: "Latest" },
  { value: "earliest", label: "Earliest" },
  { value: "updated", label: "Recently updated" },
]

export function PostFilters({
  state,
}: {
  state: PostFilterState
  categories?: string[]
  tags?: string[]
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {SORTS.map((item) => {
        const active = state.sort === item.value
        return (
          <Link
            key={item.value}
            href={buildHref({ ...state, sort: item.value })}
            className={
              active
                ? "transition text-primary"
                : "transition text-n-5 hover:text-n-6 dark:text-n-5 dark:hover:text-n-6"
            }
          >
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}
