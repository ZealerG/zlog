"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "./ThemeProvider"

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme, ready } = useTheme()
  const isDark = theme === "dark"

  return (
    <button
      type="button"
      aria-label={isDark ? "切换到浅色模式" : "切换到深色模式"}
      aria-pressed={isDark}
      data-ready={ready ? "true" : "false"}
      onClick={toggleTheme}
      className={`group pointer-events-auto inline-flex min-h-9 items-center justify-center rounded-2xl border border-transparent bg-transparent px-2.5 py-1.5 text-n-6 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-primary active:scale-[0.97] dark:text-n-6 ${className}`}
    >
      <span
        className="theme-toggle-track"
        data-theme-state={ready && isDark ? "dark" : "light"}
        aria-hidden
      >
        <Sun className="theme-toggle-sun" strokeWidth={1.8} />
        <Moon className="theme-toggle-moon" strokeWidth={1.8} />
        <span className="theme-toggle-thumb" />
      </span>
    </button>
  )
}
