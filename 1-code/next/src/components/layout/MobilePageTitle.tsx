import { useLocation } from "react-router-dom"
import { findNavForPath } from "@/lib/nav"

/**
 * One-line page title for phones, shown in place of the full desktop TopBar.
 * Scrolls with the content (not sticky) so it never competes with the bottom nav.
 */
export function MobilePageTitle() {
  const { pathname } = useLocation()
  const nav = findNavForPath(pathname)
  if (pathname === "/") return null
  const title = nav?.shortTitle || nav?.title || "IELTS Ôn tập"
  return <h1 className="mb-3 text-xl font-bold tracking-tight md:hidden">{title}</h1>
}
