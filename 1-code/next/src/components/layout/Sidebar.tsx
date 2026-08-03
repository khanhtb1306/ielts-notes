import { NavLink } from "react-router-dom"
import { Search, Home, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { NAV } from "@/lib/nav"
import { Input } from "@/components/ui/input"
import { useUi } from "@/stores/ui"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./ThemeToggle"

export function Sidebar({ className, collapsible = false }: { className?: string; collapsible?: boolean }) {
  const search = useUi((s) => s.search)
  const setSearch = useUi((s) => s.setSearch)
  const collapsed = useUi((s) => s.sidebarCollapsed) && collapsible
  const toggleSidebar = useUi((s) => s.toggleSidebar)

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
      collapsed && "justify-center px-0",
      isActive && "bg-accent text-accent-foreground font-semibold"
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
            <div className="font-bold text-lg tracking-tight">Pre-IELTS Ôn tập</div>
            <div className="text-xs text-muted-foreground">Ngữ pháp · Speaking · Final Test</div>
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

      {collapsed ? (
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
            placeholder="Tìm: modal, past, trip, /iː/..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      <nav className="flex flex-col gap-1 text-sm">
        <NavLink to="/" end className={linkClass} title="Trang chủ">
          <Home className="h-4 w-4" />
          {!collapsed && "Trang chủ"}
        </NavLink>

        <div className="my-2 border-t border-border" />

        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClass} title={item.label}>
            <item.icon className="h-4 w-4" />
            {!collapsed && item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-border pt-3">
        <ThemeToggle collapsed={collapsed} />
      </div>
    </aside>
  )
}
