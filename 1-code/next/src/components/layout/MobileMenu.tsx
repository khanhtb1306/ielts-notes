import { useEffect } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { Home } from "lucide-react"
import { SettingsMenu } from "./SettingsMenu"
import { useUi } from "@/stores/ui"
import { NAV_GROUPS, findGroupForPath, navLinkClass } from "@/lib/nav"
import { cn } from "@/lib/utils"

/**
 * Left slide-in drawer for phones. Replaces the old centred dialog so the menu
 * reads as navigation, not a modal. Hidden from `md` up, where the permanent
 * sidebar takes over.
 */
export function MobileMenu() {
  const open = useUi((s) => s.mobileMenuOpen)
  const setOpen = useUi((s) => s.setMobileMenuOpen)
  const location = useLocation()
  // Once inside a course, the drawer shows *only* that course's items — never a
  // mix of both courses. Switching course happens via "Trang chủ" (the picker).
  const group = findGroupForPath(location.pathname) ?? NAV_GROUPS[0]

  // Close on navigation.
  useEffect(() => {
    setOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [open, setOpen])

  return (
    <div className={cn("md:hidden", !open && "pointer-events-none")} aria-hidden={!open}>
      {/* Scrim */}
      <div
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-50 bg-black/40 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0"
        )}
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Điều hướng"
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[86%] max-w-[320px] overflow-y-auto shadow-lift transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <aside className="flex min-h-full flex-col border-r border-border bg-card p-4">
          <div className="border-b border-border pb-4">
            <div className="text-lg font-bold tracking-tight">{group.label}</div>
            <div className="text-xs text-muted-foreground">Nội dung ôn tập</div>
          </div>

          {/* Only the active course's items — same list as the desktop Sidebar. */}
          <nav className="mt-4 flex flex-col gap-1 text-sm" aria-label="Điều hướng">
            <NavLink to="/" end className={({ isActive }) => navLinkClass({ isActive })} title="Đổi khóa học">
              <Home className="size-4 shrink-0" />
              <span>Đổi khóa học</span>
            </NavLink>

            <div className="mt-2">
              {group.items.map((item) => (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => navLinkClass({ isActive })} title={`${group.label} · ${item.label}`}>
                  <item.icon className="size-4 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </nav>

          <div className="mt-auto border-t border-border pt-4">
            <SettingsMenu />
          </div>
        </aside>
      </div>
    </div>
  )
}
