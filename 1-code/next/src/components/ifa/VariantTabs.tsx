import { cn } from "@/lib/utils"

/**
 * Sub-variants of a topic (e.g. Study for pupils / students / workers).
 * Lives in the content column, not the rail — the rail picks the topic,
 * these tabs pick which flavour of it you are reading.
 */
export function VariantTabs({
  labels,
  active,
  onSelect,
  className,
}: {
  labels: string[]
  active: number
  onSelect: (index: number) => void
  className?: string
}) {
  if (labels.length < 2) return null
  return (
    <div
      role="tablist"
      className={cn("flex gap-1 overflow-x-auto rounded-lg border border-border bg-muted/50 p-1 rail-strip", className)}
    >
      {labels.map((label, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === active}
          onClick={() => onSelect(i)}
          className={cn(
            "flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-semibold transition-colors",
            i === active
              ? "bg-card text-primary shadow-card"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
