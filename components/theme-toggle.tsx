"use client"

import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("quickbasket-theme")
    if (stored === "dark") {
      document.documentElement.classList.add("dark")
      setIsDark(true)
    } else if (stored === "light") {
      document.documentElement.classList.remove("dark")
      setIsDark(false)
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark")
      setIsDark(true)
    }
  }, [])

  function toggle() {
    const nextDark = !isDark
    setIsDark(nextDark)
    if (nextDark) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("quickbasket-theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("quickbasket-theme", "light")
    }
  }

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className="grid size-8 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition hover:bg-accent hover:text-foreground"
      >
        <span className="size-4" />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="grid size-8 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition hover:bg-accent hover:text-foreground"
    >
      {isDark ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4" />}
    </button>
  )
}

