import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"

interface TocEntry {
  id: string
  text: string
  level: 1 | 2 | 3
}

function slug(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
}

const HEADING_SELECTOR = "h1, h2, h3"
// Skip headings inside interactive/decorative containers.
const SKIP_ANCESTORS = ["[data-toc-skip]", ".sidebar-scope", "nav", "aside"]

export function TableOfContents({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLElement | null>
}) {
  const location = useLocation()
  const [entries, setEntries] = useState<TocEntry[]>([])
  const [activeId, setActiveId] = useState<string>("")
  const rescanTimer = useRef<number | null>(null)

  // Scan headings + assign IDs.
  useEffect(() => {
    const root = containerRef.current
    if (!root) return

    const scan = () => {
      const headings = Array.from(root.querySelectorAll<HTMLElement>(HEADING_SELECTOR))
      const usedIds = new Set<string>()
      const list: TocEntry[] = []

      for (const h of headings) {
        // Skip if inside excluded ancestor.
        if (SKIP_ANCESTORS.some((sel) => h.closest(sel))) continue
        const text = (h.textContent || "").trim()
        if (!text) continue
        // Skip hidden headings (e.g. inside inactive Radix Tab panels).
        if (h.offsetParent === null && h.getClientRects().length === 0) continue

        let id = h.id
        if (!id) {
          const base = slug(text) || `h-${list.length}`
          id = base
          let i = 1
          while (usedIds.has(id)) id = `${base}-${i++}`
          h.id = id
        } else {
          let i = 1
          const orig = id
          while (usedIds.has(id)) id = `${orig}-${i++}`
          if (id !== h.id) h.id = id
        }
        usedIds.add(id)
        // Ensure sticky topbar doesn't cover heading on anchor jump.
        if (!h.classList.contains("scroll-mt-20")) h.classList.add("scroll-mt-20")

        const level = (parseInt(h.tagName.substring(1), 10) as 1 | 2 | 3) || 2
        list.push({ id, text, level })
      }
      setEntries(list.slice(0, 80))
    }

    const scheduleScan = () => {
      if (rescanTimer.current != null) window.cancelAnimationFrame(rescanTimer.current)
      rescanTimer.current = window.requestAnimationFrame(scan)
    }

    scheduleScan()
    const obs = new MutationObserver(scheduleScan)
    obs.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["data-state", "hidden"],
    })
    return () => {
      obs.disconnect()
      if (rescanTimer.current != null) window.cancelAnimationFrame(rescanTimer.current)
    }
  }, [containerRef, location.pathname, location.search])

  // Scroll-spy: highlight the heading currently in view.
  useEffect(() => {
    if (entries.length < 2) return
    const observer = new IntersectionObserver(
      (records) => {
        const visible = records
          .filter((r) => r.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: [0, 1] }
    )
    for (const e of entries) {
      const el = document.getElementById(e.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [entries])

  const handleJump = (id: string) => (ev: React.MouseEvent) => {
    ev.preventDefault()
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: "smooth", block: "start" })
    setActiveId(id)
    // Update URL hash without triggering router navigation.
    if (typeof history !== "undefined" && history.replaceState) {
      history.replaceState(null, "", `#${location.pathname}${location.search}#${id}`)
    }
  }

  if (entries.length < 3) return null

  return (
    <aside
      className="hidden xl:block w-56 shrink-0"
      aria-label="Mục lục trong trang"
      data-toc-skip
    >
      <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto pr-2">
        <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
          Trong trang này
        </div>
        <nav className="space-y-0.5">
          {entries.map((e) => (
            <a
              key={e.id}
              href={`#${e.id}`}
              onClick={handleJump(e.id)}
              title={e.text}
              className={cn(
                "block text-sm leading-snug py-1 border-l-2 hover:text-primary hover:border-primary transition-colors truncate",
                e.level === 1 && "font-medium pl-3",
                e.level === 2 && "pl-4",
                e.level === 3 && "pl-6 text-xs",
                activeId === e.id
                  ? "border-primary text-primary"
                  : "border-border text-muted-foreground"
              )}
            >
              {e.text}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  )
}
