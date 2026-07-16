"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "./ThemeProvider"

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme, ready } = useTheme()
  const isDark = theme === "dark"

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      tabIndex={-1}
      onClick={toggleTheme}
      className={`group pointer-events-auto inline-flex items-center justify-center rounded-2xl border border-transparent bg-transparent px-3 py-1.5 text-n-6 transition hover:text-primary dark:text-n-6 ${className}`}
    >
      <span className="inline-flex items-center justify-center transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-12">
        {!ready || !isDark ? (
          <Sun className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
        ) : (
          <Moon className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
        )}
      </span>
    </button>
  )
}
