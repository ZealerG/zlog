"use client"

import { Link2, Share2 } from "lucide-react"
import { useMemo, useState } from "react"

type Props = {
  title: string
}

export function PostSidebarActions({ title }: Props) {
  const [shareState, setShareState] = useState<"idle" | "copied">("idle")

  const onShare = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setShareState("copied")
      window.setTimeout(() => setShareState("idle"), 1600)
    } catch {
      /* cancel / fail */
    }
  }

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareState("copied")
      window.setTimeout(() => setShareState("idle"), 1600)
    } catch {
      /* ignore */
    }
  }

  const shareTitle = useMemo(
    () => (shareState === "copied" ? "已复制链接" : "分享"),
    [shareState],
  )

  return (
    <section className="mt-3 border-t border-n-2 pt-3 dark:border-n-2">
      <div className="flex flex-row gap-2 [@media(min-height:680px)]:flex-col">
        <ActionButton
          title={shareTitle}
          label={shareTitle}
          onClick={onShare}
          icon={<Share2 className="size-4" aria-hidden />}
        />
        <ActionButton
          title="复制链接"
          label="复制链接"
          onClick={onCopy}
          icon={<Link2 className="size-4" aria-hidden />}
        />
      </div>
    </section>
  )
}

function ActionButton({
  title,
  label,
  onClick,
  icon,
}: {
  title: string
  label: string
  onClick: () => void
  icon: React.ReactNode
}) {
  return (
    <div className="group relative flex w-fit items-center">
      <button
        type="button"
        onClick={onClick}
        title={title}
        className="inline-flex size-9 items-center justify-center rounded-md text-n-5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/10 hover:text-primary active:translate-y-0 dark:text-n-5"
      >
        {icon}
        <span className="sr-only">{label}</span>
      </button>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-[11px] text-white opacity-0 shadow transition duration-150 group-hover:opacity-100 dark:bg-zinc-100 dark:text-zinc-900">
        {title}
      </span>
    </div>
  )
}
