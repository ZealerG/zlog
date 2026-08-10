"use client"

import { Check, Link2, Share2 } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

type Props = {
  title: string
}

export function PostSidebarActions({ title }: Props) {
  const [feedback, setFeedback] = useState<{
    action: "share" | "copy"
    message: string
  } | null>(null)
  const feedbackTimerRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (feedbackTimerRef.current !== null) {
        window.clearTimeout(feedbackTimerRef.current)
      }
    },
    [],
  )

  const showFeedback = useCallback(
    (action: "share" | "copy", message: string) => {
      if (feedbackTimerRef.current !== null) {
        window.clearTimeout(feedbackTimerRef.current)
      }
      setFeedback({ action, message })
      feedbackTimerRef.current = window.setTimeout(() => {
        setFeedback(null)
        feedbackTimerRef.current = null
      }, 1800)
    },
    [],
  )

  const onShare = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title, url })
        showFeedback("share", "已完成分享")
        return
      }
      await navigator.clipboard.writeText(url)
      showFeedback("share", "已复制分享链接")
    } catch {
      /* cancel / fail */
    }
  }

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      showFeedback("copy", "已复制链接")
    } catch {
      /* ignore */
    }
  }

  const shareSuccess = feedback?.action === "share"
  const copySuccess = feedback?.action === "copy"
  const shareTitle = shareSuccess ? feedback.message : "分享"
  const copyTitle = copySuccess ? feedback.message : "复制链接"

  return (
    <section className="mt-3 border-t border-n-2 pt-3 dark:border-n-2">
      <div className="flex flex-row gap-2 [@media(min-height:680px)]:flex-col">
        <ActionButton
          title={shareTitle}
          label={shareTitle}
          onClick={onShare}
          success={shareSuccess}
          icon={
            shareSuccess ? (
              <Check className="size-4" aria-hidden />
            ) : (
              <Share2 className="size-4" aria-hidden />
            )
          }
        />
        <ActionButton
          title={copyTitle}
          label={copyTitle}
          onClick={onCopy}
          success={copySuccess}
          icon={
            copySuccess ? (
              <Check className="size-4" aria-hidden />
            ) : (
              <Link2 className="size-4" aria-hidden />
            )
          }
        />
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {feedback?.message ?? ""}
      </span>
    </section>
  )
}

function ActionButton({
  title,
  label,
  onClick,
  icon,
  success,
}: {
  title: string
  label: string
  onClick: () => void
  icon: React.ReactNode
  success: boolean
}) {
  return (
    <div className="group relative flex w-fit items-center">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        data-success={success ? "true" : "false"}
        className="inline-flex size-9 items-center justify-center rounded-md text-n-5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/10 hover:text-primary active:translate-y-0 dark:text-n-5"
      >
        <span className="action-feedback-icon" aria-hidden>
          {icon}
        </span>
      </button>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-[11px] text-white opacity-0 shadow transition duration-150 group-hover:opacity-100 group-focus-within:opacity-100 dark:bg-zinc-100 dark:text-zinc-900">
        {title}
      </span>
    </div>
  )
}
