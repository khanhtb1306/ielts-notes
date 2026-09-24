import { NavLink, useLocation } from "react-router-dom"
import { Search, Home, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { NAV_GROUPS } from "@/lib/nav"
import { Input } from "@/components/ui/input"
import { useUi } from "@/stores/ui"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./ThemeToggle"

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

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-2.5 rounded-lg px-3 py-2 font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
      collapsed && "justify-center px-0",
      isActive && "bg-primary text-primary-foreground shadow-card hover:bg-primary hover:text-primary-foreground"
    )

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
            <div className="font-bold text-lg tracking-tight">IELTS Ôn tập</div>
            <div className="text-xs text-muted-foreground">Pre-IELTS · IELTS Foundation A</div>
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
        <NavLink to="/" end className={linkClass} title="Trang chủ">
          <Home className="h-4 w-4" />
          {!collapsed && "Trang chủ"}
        </NavLink>

        {NAV_GROUPS.map((group) => (
          <div key={group.id} className="mt-2">
            {collapsed ? (
              <div className="my-2 border-t border-border" />
            ) : (
              <div className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">
                {group.label}
              </div>
            )}
            {group.items.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass} title={`${group.label} · ${item.label}`}>
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span className="shrink-0 rounded bg-current/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide opacity-70">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t border-border pt-3">
        <ThemeToggle collapsed={collapsed} />
      </div>
    </aside>
  )
}
