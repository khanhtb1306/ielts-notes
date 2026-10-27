import { NavLink, useLocation } from "react-router-dom"
import { Search, Home, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { NAV_GROUPS, findGroupForPath, navLinkClass } from "@/lib/nav"
import { Input } from "@/components/ui/input"
import { useUi } from "@/stores/ui"
import { cn } from "@/lib/utils"
import { SettingsMenu } from "./SettingsMenu"

/** Routes whose page actually reads `useUi.search`. */
const SEARCHABLE = ["/pronunciation", "/grammar", "/speaking"]

export function Sidebar({ className, collapsible = false }: { className?: string; collapsible?: boolean }) {
  const search = useUi((s) => s.search)
  const setSearch = useUi((s) => s.setSearch)
  const collapsed = useUi((s) => s.sidebarCollapsed) && collapsible
  const toggleSidebar = useUi((s) => s.toggleSidebar)
  const { pathname } = useLocation()
  // "/speaking" must not match "/speaking-ifa".
  const searchable = SEARCHABLE.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  // Show only the active course's section — never both courses at once.
  const activeGroup = findGroupForPath(pathname) ?? NAV_GROUPS[0]

  const linkClass = ({ isActive }: { isActive: boolean }) => navLinkClass({ isActive, collapsed })

  return (
    <aside
      className={cn(
        "flex h-full flex-col gap-4 border-r border-border bg-card py-6",
        collapsed ? "px-2" : "px-4",
        className
      )}
    >
      <div className={cn("flex items-start gap-2 border-b border-border pb-4", collapsed && "flex-col items-center")}>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="truncate font-bold text-lg tracking-tight">{activeGroup.label}</div>
            <div className="text-xs text-muted-foreground">Nội dung ôn tập</div>
          </div>
        )}
        {collapsible && (
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
            title={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
        )}
      </div>

      {searchable &&
        (collapsed ? (
          <button
            type="button"
            onClick={toggleSidebar}
            title="Tìm kiếm — mở rộng menu"
            className="flex items-center justify-center rounded-lg px-0 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Search className="h-5 w-5" />
          </button>
        ) : (
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="site-search"
              name="site-search"
              type="search"
              aria-label="Tìm trong trang này"
              placeholder="Tìm trong trang này..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        ))}

      <nav className="flex flex-col gap-1 text-sm">
        <NavLink to="/" end className={linkClass} title="Đổi khóa học">
          <Home className="h-4 w-4" />
          {!collapsed && "Đổi khóa học"}
        </NavLink>

        {/* Only the active course's items — the picker at "/" switches course. */}
        <div className="mt-2">
          {activeGroup.items.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass} title={`${activeGroup.label} · ${item.label}`}>
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="mt-auto border-t border-border pt-3">
        <SettingsMenu collapsed={collapsed} />
      </div>
    </aside>
  )
}
