"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpenText,
  Compass,
  Footprints,
  Home,
  Images,
  type LucideIcon,
} from "lucide-react"
import { useRef, useState } from "react"
import type { NavItem } from "@/lib/content/types"
import type { NavPreviewData } from "@/lib/content/nav-preview"
import { NavPreviewPanel } from "./NavPreviewPanel"

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

export function NavLinks({
  items,
  scrolled = false,
  previewData = {},
}: {
  items: NavItem[]
  scrolled?: boolean
  previewData?: NavPreviewData
}) {
  const pathname = usePathname()
  const [hovered, setHovered] = useState<string | null>(null)
  const [navHover, setNavHover] = useState(false)
  const leaveTimer = useRef<number | null>(null)

  const showCapsule = scrolled || navHover
  const openHref = hovered

  const clearLeave = () => {
    if (leaveTimer.current != null) {
      window.clearTimeout(leaveTimer.current)
      leaveTimer.current = null
    }
  }

  const scheduleLeave = () => {
    clearLeave()
    leaveTimer.current = window.setTimeout(() => {
      setNavHover(false)
      setHovered(null)
    }, 140)
  }

  return (
    <div
      className="relative hidden md:block"
      onMouseEnter={() => {
        clearLeave()
        setNavHover(true)
      }}
      onMouseLeave={scheduleLeave}
    >
      <nav
        className={
          showCapsule
            ? "site-nav-capsule site-nav-capsule-scrolled site-nav-capsule-preview relative flex items-center justify-center overflow-hidden rounded-full text-sm font-medium text-n-5 transition-all duration-300 dark:text-n-5 md:flex"
            : "site-nav-capsule relative flex items-center justify-center overflow-hidden rounded-full bg-transparent text-sm font-medium text-n-5 transition-all duration-300 dark:text-n-5 md:flex"
        }
      >
        {items.map((item) => {
          const active = isActive(pathname, item.href)
          const emphasized = active || hovered === item.href
          const Icon = item.icon ? ICONS[item.icon] : undefined
          return (
            <Link
              key={item.href}
              tabIndex={-1}
              href={item.href}
              data-active={active ? "true" : "false"}
              onMouseEnter={() => {
                clearLeave()
                setHovered(item.href)
              }}
              onFocus={() => setHovered(item.href)}
              className={
                emphasized
                  ? "relative z-10 flex items-center gap-2 overflow-hidden rounded-none px-4 py-2 font-semibold text-primary transition-colors duration-300 first:rounded-l-full last:rounded-r-full"
                  : "relative z-10 flex items-center gap-2 overflow-hidden rounded-none px-4 py-2 text-n-5 transition-colors duration-300 first:rounded-l-full last:rounded-r-full hover:text-primary dark:text-n-5"
              }
            >
              <span className="relative z-10 flex items-center justify-center">
                <span
                  className={
                    emphasized && Icon
                      ? "mr-2 flex w-4 items-center justify-center overflow-hidden opacity-100 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                      : "mr-0 flex w-0 items-center justify-center overflow-hidden opacity-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  }
                >
                  {Icon ? (
                    <Icon
                      className="h-[18px] w-[18px] shrink-0"
                      strokeWidth={2}
                      aria-hidden
                    />
                  ) : null}
                </span>
                <span className="whitespace-nowrap">{item.label}</span>
              </span>
            </Link>
          )
        })}
      </nav>

      {openHref ? (
        <div className="absolute left-0 right-0 top-full h-3" aria-hidden />
      ) : null}

      {openHref && previewData[openHref] ? (
        <div
          className="animate-soft-panel-in-nav absolute left-1/2 top-[calc(100%+0.75rem)] z-50 w-[min(30rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] -translate-x-1/2"
          onMouseEnter={clearLeave}
          onMouseLeave={scheduleLeave}
        >
          <NavPreviewPanel
            href={openHref}
            data={previewData}
            onNavigate={() => {
              setHovered(null)
              setNavHover(false)
            }}
          />
        </div>
      ) : null}
    </div>
  )
}
