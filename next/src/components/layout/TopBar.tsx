import { useLocation } from "react-router-dom"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { findNavForPath } from "@/lib/nav"
import { useUi } from "@/stores/ui"

export function TopBar() {
  const location = useLocation()
  const nav = findNavForPath(location.pathname)
  const setMobileMenuOpen = useUi((s) => s.setMobileMenuOpen)

  const eyebrow = nav?.eyebrow || "Pre-IELTS · up to Lesson 15"
  const title = nav?.title || "Pre-IELTS Notes"
  const subtitle = nav?.subtitle || ""

  return (
    <header className="flex flex-col gap-1 pb-6 border-b border-border">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-widest text-primary">{eyebrow}</div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mt-1">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-1 max-w-2xl">{subtitle}</p>}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Mở menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
