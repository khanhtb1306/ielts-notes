import { NavLink } from "react-router-dom"
import { Search } from "lucide-react"
import { NAV, FINAL_NAV } from "@/lib/nav"
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
        <div className="font-bold text-lg tracking-tight">Pre-IELTS Notes</div>
        <div className="text-xs text-muted-foreground">Lesson 1–16 + Final</div>
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
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
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

        <div className="my-2 border-t border-border" />

        <NavLink
          to={FINAL_NAV.to}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
              isActive && "bg-accent text-accent-foreground font-semibold"
            )
          }
        >
          <FINAL_NAV.icon className="h-4 w-4" />
          {FINAL_NAV.label}
        </NavLink>
      </nav>

      <div className="mt-auto border-t border-border pt-3">
        <ThemeToggle />
      </div>
    </aside>
  )
}
