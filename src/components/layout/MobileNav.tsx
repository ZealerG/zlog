"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpenText,
  Compass,
  Footprints,
  Home,
  Images,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react"
import { useEffect, useState } from "react"
import type { NavItem } from "@/lib/content/types"
import { ThemeToggle } from "@/components/theme/ThemeToggle"

const ICONS: Record<string, LucideIcon> = {
  home: Home,
  book: BookOpenText,
  footprints: Footprints,
  images: Images,
  compass: Compass,
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function MobileNav({
  items,
  brand,
}: {
  items: NavItem[]
  brand: string
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="pointer-events-auto inline-flex h-10 w-10 shrink-0 items-center justify-center bg-transparent text-n-6 transition dark:text-n-6"
      >
        {open ? (
          <X className="h-[18px] w-[18px]" strokeWidth={2} />
        ) : (
          <Menu className="h-[18px] w-[18px]" strokeWidth={2} />
        )}
      </button>

      {open ? (
        <div className="pointer-events-auto fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-3 top-3 overflow-hidden rounded-3xl border border-n-2/80 bg-n-0/92 shadow-[0_18px_45px_rgba(2,6,23,0.28)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#0c0e14]/92">
            <div className="flex items-center justify-between border-b border-n-2/70 px-4 py-3 dark:border-white/10">
              <span className="text-base font-semibold tracking-tight text-primary">
                {brand}
              </span>
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <button
                  type="button"
                  aria-label="Close navigation menu"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center text-n-6"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <nav className="flex flex-col gap-1 p-3">
              {items.map((item) => {
                const active = isActive(pathname, item.href)
                const Icon = item.icon ? ICONS[item.icon] : undefined
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={
                      active
                        ? "flex items-center gap-3 rounded-2xl bg-primary/10 px-3 py-3 text-sm font-semibold text-primary"
                        : "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-n-5 transition-colors hover:bg-n-1/80 dark:hover:bg-white/5"
                    }
                  >
                    {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  )
}
