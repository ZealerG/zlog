import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { FriendFloatPool } from "@/components/friends/FriendFloatPool"
import { getAllFriends } from "@/lib/content/load"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  path: "/friends",
  title: "友链",
  description: "朋友、同行者与喜欢的网站。",
})

export default function FriendsPage() {
  const friends = getAllFriends()

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-16 sm:px-10">
      <section className="pb-6">
        <p className="site-eyebrow uppercase tracking-[0.28em] text-n-5">
          Friends
        </p>
        <h1 className="site-title-page mt-4 flex flex-wrap items-baseline gap-3 tracking-tight text-n-6">
          <span>友链</span>
          <span className="site-body tracking-normal text-n-4">·</span>
          <span className="site-body tracking-normal text-n-5">朋友们</span>
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 site-meta text-n-5">
          <Link
            href="/more"
            className="inline-flex items-center gap-1 transition hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            远方
          </Link>
          <span className="text-n-3">·</span>
          <span>
            <span className="font-medium text-n-6">{friends.length}</span> 位朋友
          </span>
          <span className="text-n-3">·</span>
          <span className="text-n-4">拖拽气泡探索</span>
        </div>
      </section>

      <div className="friends-stage overflow-hidden rounded-[2rem] border border-n-2/60 bg-n-1/10 dark:bg-n-1/10">
        <FriendFloatPool friends={friends} />
      </div>
    </main>
  )
}
