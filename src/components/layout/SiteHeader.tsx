"use client"

import Link from "next/link"
import { useEffect, useState, type CSSProperties } from "react"
import type { SiteConfig } from "@/lib/content/types"
import type { NavPreviewData } from "@/lib/content/nav-preview"
import { ThemeToggle } from "@/components/theme/ThemeToggle"
import { MobileNav } from "./MobileNav"
import { NavLinks } from "./NavLinks"

export function SiteHeader({
  site,
  previewData = {},
}: {
  site: SiteConfig
  previewData?: NavPreviewData
}) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const brand = site.brand ?? site.name

  return (
    <header className="site-header-mobile-frame pointer-events-none fixed inset-x-0 top-0 z-50 px-3 py-3 sm:px-6">
      {/*
        xiami: outer row never paints a full rectangle.
        Glass only on nav capsule + theme control.
      */}
      <div
        data-mobile-state={scrolled ? "scrolled" : "top"}
        className="pointer-events-none relative mx-auto flex w-full max-w-6xl items-center justify-between gap-4 bg-transparent px-4 py-3 shadow-none transition-[transform,border-color,background-color,box-shadow,backdrop-filter,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:grid md:grid-cols-[1fr_auto_1fr] md:justify-normal md:border-transparent md:bg-transparent md:shadow-none md:transition-transform sm:px-6"
        style={
          {
            "--site-header-brand-scale": scrolled ? "1" : "1.08",
            "--site-header-desktop-offset": scrolled ? "0px" : "10px",
            opacity: 1,
            transform: scrolled ? "translateY(0)" : "translateY(4px)",
          } as CSSProperties
        }
      >
        <MobileNav items={site.nav} brand={brand} />

        <Link
          tabIndex={-1}
          href="/"
          className="pointer-events-auto absolute left-1/2 translate-x-[-50%] rounded-2xl border border-transparent bg-transparent px-3 py-1.5 text-lg font-semibold tracking-tight text-primary opacity-100 transition-[opacity,transform,color] duration-300 hover:opacity-90 md:static md:translate-x-0 md:translate-y-0 md:justify-self-start"
        >
          <span className="inline-block origin-left transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] md:scale-[var(--site-header-brand-scale)]">
            {brand}
          </span>
        </Link>

        <div
          className="pointer-events-auto relative hidden transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] md:flex md:translate-y-[var(--site-header-desktop-offset)] md:justify-center"
          style={
            {
              "--site-header-desktop-offset": scrolled ? "0px" : "10px",
            } as CSSProperties
          }
        >
          <NavLinks
            items={site.nav}
            scrolled={scrolled}
            previewData={previewData}
          />
        </div>

        <div
          className="pointer-events-auto relative flex items-center justify-end transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] md:translate-y-[var(--site-header-desktop-offset)] md:justify-self-end"
          style={
            {
              "--site-header-desktop-offset": scrolled ? "0px" : "10px",
            } as CSSProperties
          }
        >
          <div className="hidden md:block">
            <ThemeToggle
              className={
                scrolled
                  ? "site-theme-capsule rounded-full"
                  : "site-theme-capsule site-theme-capsule-idle rounded-full"
              }
            />
          </div>
        </div>
      </div>
    </header>
  )
}
