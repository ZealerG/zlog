import type { Metadata } from "next"
import Link from "next/link"
import { FriendFloatPool } from "@/components/friends/FriendFloatPool"
import { getAllFriends } from "@/lib/content/load"

export const metadata: Metadata = {
  title: "友链",
}

export default function FriendsPage() {
  const friends = getAllFriends()

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-16 sm:px-10">
      <section className="pb-8">
        <p className="site-eyebrow uppercase tracking-[0.28em] text-n-5">
          Friends
        </p>
        <h1 className="site-title-page mt-4 flex flex-wrap items-baseline gap-3 tracking-tight text-n-6">
          <span>友链</span>
          <span className="site-body tracking-normal text-n-4">·</span>
          <span className="site-body tracking-normal text-n-5">朋友们</span>
        </h1>
        <p className="site-meta mt-3 text-n-5">
          <Link href="/more" className="hover:text-primary">
            ← 远方
          </Link>
          <span className="mx-2">·</span>
          {friends.length} 位朋友 · 可拖拽气泡
        </p>
      </section>

      <FriendFloatPool friends={friends} />
    </main>
  )
}
