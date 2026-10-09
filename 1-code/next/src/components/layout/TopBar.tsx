import { useLocation } from "react-router-dom"
import { findNavForPath } from "@/lib/nav"

/**
 * Desktop page header only. On phones the bottom nav shows where you are and a
 * compact per-page title is rendered by the page shell, so this whole block is
 * hidden below `md` to reclaim ~150px of vertical space.
 */
export function TopBar() {
  const location = useLocation()
  const nav = findNavForPath(location.pathname)

  const isHome = location.pathname === "/"
  const eyebrow = nav?.eyebrow || (isHome ? "Pre-IELTS · IELTS Foundation A" : "IELTS Ôn tập")
  const title = nav?.title || (isHome ? "Trang chủ" : "IELTS Ôn tập")
  const subtitle = nav?.subtitle || (isHome ? "Ngữ pháp · Phát âm · Speaking · Final Test" : "")

  return (
    <header className="hidden flex-col gap-1 border-b border-border pb-6 md:flex">
      <div className="text-[11px] font-bold uppercase tracking-widest text-primary">{eyebrow}</div>
      <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">{title}</h1>
      {subtitle && <p className="mt-1 max-w-2xl text-muted-foreground">{subtitle}</p>}
    </header>
  )
}
