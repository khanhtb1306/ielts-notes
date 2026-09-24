import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

/** Gap between trigger and panel, and the panel's clearance from the viewport edge. */
const PANEL_GAP = 4
const VIEWPORT_MARGIN = 12
/** Below this the panel is too cramped to be useful, so flip to the other side. */
const MIN_PANEL_HEIGHT = 160
/** Option labels need more room than a narrow trigger provides. */
const MIN_PANEL_WIDTH = 200

export interface SelectOption {
  value: string
  label: string
  /** Optional secondary text shown after the label. */
  hint?: string
}

/**
 * Listbox-style select. A native `<select>` renders its dropdown with OS chrome
 * that ignores our theme, so the popup is handcrafted here instead.
 */
export function Select({
  id,
  value,
  options,
  onChange,
  placeholder = "Chọn…",
  className,
}: {
  id?: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const [rect, setRect] = useState<{
    left: number
    width: number
    /** Distance from the matching viewport edge, per `dropUp`. */
    offset: number
    maxHeight: number
    dropUp: boolean
  } | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const selectedIdx = options.findIndex((o) => o.value === value)
  const selected = selectedIdx >= 0 ? options[selectedIdx] : undefined

  const close = useCallback(() => setOpen(false), [])

  // Close on outside click or Escape. The panel is portalled, so it is checked too.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (!rootRef.current?.contains(t) && !listRef.current?.contains(t)) close()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open, close])

  /* The rail is an `overflow-y-auto` container, so an absolutely positioned panel
     would be clipped. Measure the trigger and render the panel fixed in a portal. */
  const measure = useCallback(() => {
    const el = rootRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const below = window.innerHeight - r.bottom - PANEL_GAP - VIEWPORT_MARGIN
    const above = r.top - PANEL_GAP - VIEWPORT_MARGIN
    // Prefer dropping down; only flip up when down is cramped and up is roomier.
    const dropUp = below < MIN_PANEL_HEIGHT && above > below
    /* A narrow trigger (two-column layout on phones) would truncate every
       option, so the panel may grow wider — but never past the viewport. */
    const maxWidth = window.innerWidth - VIEWPORT_MARGIN * 2
    const width = Math.min(Math.max(r.width, MIN_PANEL_WIDTH), maxWidth)
    setRect({
      left: Math.max(VIEWPORT_MARGIN, Math.min(r.left, window.innerWidth - VIEWPORT_MARGIN - width)),
      width,
      offset: dropUp ? window.innerHeight - r.top + PANEL_GAP : r.bottom + PANEL_GAP,
      // Grow to whatever the viewport allows instead of a fixed cap.
      maxHeight: Math.max(dropUp ? above : below, MIN_PANEL_HEIGHT),
      dropUp,
    })
  }, [])

  useLayoutEffect(() => {
    if (!open) return
    measure()
    setActiveIdx(selectedIdx >= 0 ? selectedIdx : 0)
  }, [open, selectedIdx, measure])

  // Reposition while scrolling/resizing rather than letting the panel drift.
  useEffect(() => {
    if (!open) return
    const onMove = () => measure()
    window.addEventListener("scroll", onMove, true)
    window.addEventListener("resize", onMove)
    return () => {
      window.removeEventListener("scroll", onMove, true)
      window.removeEventListener("resize", onMove)
    }
  }, [open, measure])

  // Keep the highlighted row in view while arrowing through a long list.
  useEffect(() => {
    if (!open) return
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${activeIdx}"]`)?.scrollIntoView({ block: "nearest" })
  }, [open, activeIdx])

  function commit(idx: number) {
    const opt = options[idx]
    if (opt) onChange(opt.value)
    close()
  }

  function onTriggerKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      if (!open) {
        setOpen(true)
        return
      }
      if (e.key === "Enter" || e.key === " ") commit(activeIdx)
      else setActiveIdx((i) => clamp(e.key === "ArrowDown" ? i + 1 : i - 1, options.length))
    }
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg border bg-card py-2 pl-3 pr-2.5 text-left text-sm font-semibold transition-colors",
          open ? "border-primary ring-2 ring-ring/30" : "border-input hover:border-primary/50"
        )}
      >
        <span className={cn("min-w-0 flex-1 truncate", !selected && "font-normal text-muted-foreground")}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && rect && createPortal(
        <div
          ref={listRef}
          role="listbox"
          aria-activedescendant={`${id ?? "sel"}-opt-${activeIdx}`}
          style={{
            position: "fixed",
            left: rect.left,
            width: rect.width,
            ...(rect.dropUp ? { bottom: rect.offset } : { top: rect.offset }),
            maxHeight: rect.maxHeight,
          }}
          className="slim-scroll z-50 overflow-y-auto rounded-lg border border-border bg-card p-1 shadow-lift"
        >
          {options.map((o, i) => {
            const isSelected = o.value === value
            return (
              <button
                key={o.value}
                id={`${id ?? "sel"}-opt-${i}`}
                data-idx={i}
                type="button"
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIdx(i)}
                onClick={() => commit(i)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                  i === activeIdx && "bg-accent",
                  isSelected ? "font-bold text-primary" : "font-medium"
                )}
              >
                <span className="min-w-0 flex-1 truncate">
                  {o.label}
                  {o.hint && <span className="ml-1.5 text-xs font-normal opacity-70">{o.hint}</span>}
                </span>
                {isSelected && <Check className="size-4 shrink-0" aria-hidden />}
              </button>
            )
          })}
        </div>,
        document.body
      )}
    </div>
  )
}

function clamp(i: number, len: number): number {
  if (len === 0) return 0
  return (i + len) % len
}
