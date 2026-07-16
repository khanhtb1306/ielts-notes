import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Sidebar } from "./Sidebar"
import { useUi } from "@/stores/ui"
import { useLocation } from "react-router-dom"
import { useEffect } from "react"

export function MobileMenu() {
  const open = useUi((s) => s.mobileMenuOpen)
  const setOpen = useUi((s) => s.setMobileMenuOpen)
  const location = useLocation()

  // Auto-close menu on nav
  useEffect(() => {
    if (open) setOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 h-[85vh] max-w-md rounded-xl overflow-hidden top-[50%] translate-y-[-50%]">
        <DialogTitle className="sr-only">Điều hướng</DialogTitle>
        <Sidebar className="border-r-0 h-full" />
      </DialogContent>
    </Dialog>
  )
}
