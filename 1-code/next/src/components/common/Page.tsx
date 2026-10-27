import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Shared page primitives so every page builds its header, sections and empty
 * states the same way instead of hand-rolling `rounded-xl border bg-card`
 * blocks. Keep these dumb and layout-only — no data, no stores.
 */

/** In-body hero/header for a page. Distinct from the global TopBar: use this
 *  when a page needs an icon + lead paragraph above its content. */
export function PageHeader({
  icon: Icon,
  title,
  description,
  actions,
  className,
}: {
  icon?: LucideIcon
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-primary/15 bg-gradient-to-br from-primary-soft via-card to-card p-4 sm:p-5",
        className
      )}
    >
      {Icon && (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Icon className="size-5" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-bold tracking-tight sm:text-xl">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

/** A bordered content panel — the one true "card" for page bodies. */
export function PageSection({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
  "aria-label": ariaLabel,
}: {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
  "aria-label"?: string
}) {
  return (
    <section
      aria-label={ariaLabel}
      className={cn("rounded-xl border border-border bg-card shadow-card", className)}
    >
      {(title || actions) && (
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
          <div className="min-w-0">
            {title && <h3 className="font-semibold leading-tight">{title}</h3>}
            {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={cn("p-4 sm:p-5", bodyClassName)}>{children}</div>
    </section>
  )
}

/** Consistent empty/placeholder block (no data, feature not ready, no match). */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card/60 px-6 py-12 text-center",
        className
      )}
    >
      {Icon && <Icon className="size-8 text-muted-foreground/60" />}
      <p className="font-semibold">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
