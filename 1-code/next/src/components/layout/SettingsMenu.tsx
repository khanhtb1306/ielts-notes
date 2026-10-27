import { useEffect, useState } from "react"
import { Moon, Settings, Sun, MonitorSmartphone } from "lucide-react"
import { useTheme, applyThemeClass } from "@/stores/theme"
import { VoicePicker } from "@/components/common/VoicePicker"
import { cn } from "@/lib/utils"

type ThemeValue = "light" | "dark" | "system"

const THEME_OPTIONS: { value: ThemeValue; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Sáng", icon: Sun },
  { value: "dark", label: "Tối", icon: Moon },
  { value: "system", label: "Hệ thống", icon: MonitorSmartphone },
]

/**
 * One place for app-wide preferences — theme + the read-aloud voice/accent/rate
 * that every "Nghe" button across the site shares. Lives in the nav drawer
 * (phones) and the sidebar footer (desktop). `collapsed` renders just an icon.
 */
export function SettingsMenu({ collapsed = false }: { collapsed?: boolean }) {
  const theme = useTheme((s) => s.theme)
  const setTheme = useTheme((s) => s.setTheme)
  const [open, setOpen] = useState(false)

  // Keep the <html> class in sync with the stored theme, and react to OS
  // changes while on "system". Mirrors the old ThemeToggle behaviour.
  useEffect(() => {
    applyThemeClass(theme)
    if (theme === "system") {
      const mql = window.matchMedia("(prefers-color-scheme: dark)")
      const handler = () => applyThemeClass("system")
      mql.addEventListener?.("change", handler)
      return () => mql.removeEventListener?.("change", handler)
    }
  }, [theme])

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Cài đặt"
        title="Cài đặt"
        className="flex h-9 w-full items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <Settings className="h-5 w-5" />
      </button>
    )
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <Settings className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">Cài đặt chung</span>
      </button>

      {open && (
        <div className="space-y-4 rounded-xl border border-border bg-background/60 p-3">
          <div className="space-y-1.5">
            <span className="block text-xs font-semibold text-muted-foreground">Giao diện</span>
            <div className="flex overflow-hidden rounded-lg border border-input text-xs">
              {THEME_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setTheme(o.value)}
                  aria-pressed={theme === o.value}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1 px-2 py-1.5 font-medium transition-colors",
                    theme === o.value ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                  )}
                >
                  <o.icon className="size-3.5" />
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 border-t border-border pt-3">
            <span className="block text-xs font-semibold text-muted-foreground">Đọc to (toàn web)</span>
            <VoicePicker stacked />
          </div>
        </div>
      )}
    </div>
  )
}
