import { NavLink, useLocation } from "react-router-dom"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUi } from "@/stores/ui"
import { NAV_GROUPS, findGroupForPath } from "@/lib/nav"

/**
 * Thumb-reachable tab bar for phones. Shows the active course's items (the two
 * courses have 3–4 each) plus a Menu button for the full sidebar. Hidden from
 * `md` up, where the permanent sidebar takes over.
 */
export function BottomNav() {
  const { pathname } = useLocation()
  const openMenu = useUi((s) => s.setMobileMenuOpen)

  // Default to the first course so the bar is never empty on pages like "/".
  const group = findGroupForPath(pathname) ?? NAV_GROUPS[0]
  const items = group.items.slice(0, 4)

  return (
    <nav
      aria-label="Điều hướng"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-xl items-stretch">
        <li className="flex-1">
          <button
            type="button"
            onClick={() => openMenu(true)}
            aria-label="Mở menu"
            className="flex min-h-[56px] w-full flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <Menu className="size-5 shrink-0" />
            <span>Menu</span>
          </button>
        </li>
        {items.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex min-h-[56px] flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[11px] font-semibold transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              <item.icon className="size-5 shrink-0" />
              <span className="max-w-full truncate">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
