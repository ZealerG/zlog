"use client"

function formatDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function formatTooltip(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function PostMeta({
  date,
  updated,
}: {
  date: string
  updated?: string
}) {
  return (
    <span
      className="group/published-date relative inline-flex outline-none"
      tabIndex={0}
    >
      <time dateTime={date}>{formatDate(date)}</time>
      {updated ? (
        <span className="pointer-events-none absolute bottom-full left-0 z-20 mb-2 whitespace-nowrap rounded-xl border border-n-2 bg-n-1 px-3 py-2 text-xs text-n-5 opacity-0 shadow-lg transition duration-150 group-hover/published-date:translate-y-0 group-hover/published-date:opacity-100 group-focus-visible/published-date:translate-y-0 group-focus-visible/published-date:opacity-100 dark:border-n-2 dark:bg-n-1">
          Updated {formatTooltip(updated)}
        </span>
      ) : null}
    </span>
  )
}
