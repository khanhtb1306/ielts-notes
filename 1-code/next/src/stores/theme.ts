import { create } from "zustand"
import { persist } from "zustand/middleware"

type Theme = "light" | "dark" | "system"

interface ThemeStore {
  theme: Theme
  setTheme: (t: Theme) => void
}

export const useTheme = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "system",
      setTheme: (t) => set({ theme: t }),
    }),
    { name: "ielts-theme" }
  )
)

export function applyThemeClass(theme: Theme) {
  if (typeof document === "undefined") return
  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia?.("(prefers-color-scheme: dark)").matches)
  document.documentElement.classList.toggle("dark", isDark)
}
