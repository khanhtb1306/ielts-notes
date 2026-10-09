import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { useUi } from "@/stores/ui"
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
      >
        <Sidebar className="h-full border-r-0" />
      </div>
    </div>
  )
}
