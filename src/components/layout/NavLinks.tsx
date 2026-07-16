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
import { useState } from "react"
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

  const showCapsule = scrolled || navHover
  const openHref = hovered

  return (
    <div
      className="relative hidden md:block"
      onMouseLeave={() => {
        setNavHover(false)
        setHovered(null)
      }}
    >
      <nav
        onMouseEnter={() => setNavHover(true)}
        className={
          showCapsule
            ? "site-nav-capsule site-nav-capsule-scrolled site-nav-capsule-preview relative flex items-center justify-center overflow-hidden rounded-full px-1 text-sm font-medium text-n-5 transition-all duration-300"
            : "site-nav-capsule relative flex items-center justify-center overflow-hidden rounded-full bg-transparent px-1 text-sm font-medium text-n-5 transition-all duration-300"
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
              onMouseEnter={() => setHovered(item.href)}
              onFocus={() => setHovered(item.href)}
              className={
                emphasized
                  ? "relative z-10 flex items-center gap-2 overflow-hidden rounded-full px-3.5 py-2 font-semibold text-primary transition-all duration-300"
                  : "relative z-10 flex items-center gap-2 overflow-hidden rounded-full px-3.5 py-2 text-n-5 transition-all duration-300 hover:bg-primary/5 hover:text-primary dark:text-n-5"
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
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  ) : null}
                </span>
                <span className="whitespace-nowrap">{item.label}</span>
              </span>
            </Link>
          )
        })}
      </nav>

      {/* hit area bridge so mouse can move into panel */}
      {openHref ? (
        <div className="absolute left-0 right-0 top-full h-3" aria-hidden />
      ) : null}

      {openHref && previewData[openHref] ? (
        <div className="absolute left-1/2 top-[calc(100%+0.75rem)] z-50 w-[min(30rem,calc(100vw-2rem))] -translate-x-1/2 animate-[nav-preview-in_0.18s_ease-out]">
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
