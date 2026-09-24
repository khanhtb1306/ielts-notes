import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

const GAP = 6
const VIEWPORT_MARGIN = 12
const MIN_HEIGHT = 140

interface Anchor {
  left: number
  offset: number
  maxHeight: number
  dropUp: boolean
}

/**
 * Small anchored panel rendered in a portal, so it is never clipped by a
 * scrolling parent (the speaking rail is `overflow-y-auto`).
 */
export function Popover({
  trigger,
  children,
  width = 280,
  align = "end",
  panelClassName,
}: {
  /** Receives the open state so the trigger can reflect it. */
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode
  children: ReactNode
  width?: number
  align?: "start" | "end"
  panelClassName?: string
}) {
  const [open, setOpen] = useState(false)
  const [anchor, setAnchor] = useState<Anchor | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setOpen(false), [])

  const measure = useCallback(() => {
    const el = rootRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const below = window.innerHeight - r.bottom - GAP - VIEWPORT_MARGIN
    const above = r.top - GAP - VIEWPORT_MARGIN
    const dropUp = below < MIN_HEIGHT && above > below
    const rawLeft = align === "end" ? r.right - width : r.left
    setAnchor({
      // Keep the panel inside the viewport on narrow screens.
      left: Math.min(Math.max(rawLeft, VIEWPORT_MARGIN), window.innerWidth - width - VIEWPORT_MARGIN),
      offset: dropUp ? window.innerHeight - r.top + GAP : r.bottom + GAP,
      maxHeight: Math.max(dropUp ? above : below, MIN_HEIGHT),
      dropUp,
    })
  }, [align, width])

  useLayoutEffect(() => {
    if (open) measure()
  }, [open, measure])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (!rootRef.current?.contains(t) && !panelRef.current?.contains(t)) close()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    const onMove = () => measure()
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKey)
    window.addEventListener("scroll", onMove, true)
    window.addEventListener("resize", onMove)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKey)
      window.removeEventListener("scroll", onMove, true)
      window.removeEventListener("resize", onMove)
    }
  }, [open, close, measure])

  return (
    <div ref={rootRef} className="relative shrink-0">
      {trigger({ open, toggle: () => setOpen((v) => !v) })}
      {open &&
        anchor &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              position: "fixed",
              left: anchor.left,
              width,
              ...(anchor.dropUp ? { bottom: anchor.offset } : { top: anchor.offset }),
              maxHeight: anchor.maxHeight,
            }}
            className={cn(
              "slim-scroll z-50 overflow-y-auto rounded-xl border border-border bg-card p-3 shadow-lift",
              panelClassName
            )}
          >
            {children}
          </div>,
          document.body
        )}
    </div>
  )
}
