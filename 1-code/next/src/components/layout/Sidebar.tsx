import { NavLink } from "react-router-dom"
import { Search, Home } from "lucide-react"
import { NAV } from "@/lib/nav"
import { Input } from "@/components/ui/input"
import { useUi } from "@/stores/ui"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./ThemeToggle"

export function Sidebar({ className }: { className?: string }) {
  const search = useUi((s) => s.search)
  const setSearch = useUi((s) => s.setSearch)

  return (
    <aside
      className={cn(
        "flex h-full flex-col gap-4 border-r border-border bg-card px-4 py-6",
        className
      )}
    >
      <div className="pb-4 border-b border-border">
        <div className="font-bold text-lg tracking-tight">Pre-IELTS Ôn tập</div>
        <div className="text-xs text-muted-foreground">Ngữ pháp · Speaking · Final Test</div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tìm: modal, past, trip, /iː/..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <nav className="flex flex-col gap-1 text-sm">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
              isActive && "bg-accent text-accent-foreground font-semibold"
            )
          }
        >
          <Home className="h-4 w-4" />
          Trang chủ
        </NavLink>

        <div className="my-2 border-t border-border" />

        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-accent text-accent-foreground font-semibold"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-border pt-3">
        <ThemeToggle />
      </div>
    </aside>
  )
}
