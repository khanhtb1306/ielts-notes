import { useEffect } from "react"
import { Moon, Sun, MonitorSmartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme, applyThemeClass } from "@/stores/theme"

export function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
  const theme = useTheme((s) => s.theme)
  const setTheme = useTheme((s) => s.setTheme)

  useEffect(() => {
    applyThemeClass(theme)
    if (theme === "system") {
      const mql = window.matchMedia("(prefers-color-scheme: dark)")
      const handler = () => applyThemeClass("system")
      mql.addEventListener?.("change", handler)
      return () => mql.removeEventListener?.("change", handler)
    }
  }, [theme])

  function cycle() {
    if (theme === "light") setTheme("dark")
    else if (theme === "dark") setTheme("system")
    else setTheme("light")
  }

  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : MonitorSmartphone
  const label = theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System"

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycle}
      className={collapsed ? "w-full justify-center px-0" : "justify-start"}
      aria-label={`Theme: ${label}`}
      title={`Theme: ${label}`}
    >
      <Icon className="h-4 w-4" />
      {!collapsed && <span>Theme: {label}</span>}
    </Button>
  )
}
