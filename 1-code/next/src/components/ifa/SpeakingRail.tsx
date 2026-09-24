import type { ReactNode } from "react"
import { Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { VoicePicker } from "@/components/common/VoicePicker"
import { Select } from "@/components/ui/select"
import type { SelectOption } from "@/components/ui/select"
import { Popover } from "@/components/ui/popover"

/**
 * Sticky control rail for the IFA Speaking workspace.
 * Below `lg` it collapses into normal page flow so the layout stays a single column.
 */
export function SpeakingRail({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <aside
      className={cn(
        "slim-scroll space-y-4 lg:sticky lg:top-6 lg:w-60 lg:shrink-0 lg:self-start lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-1",
        className
      )}
      data-toc-skip
    >
      {children}
    </aside>
  )
}

export function RailSection({
  title,
  action,
  children,
}: {
  title?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="space-y-2">
      {/* Fixed header height so sections sitting side by side line up, whether
          or not they carry an action button. */}
      {(title || action) && (
        <div className="flex h-6 items-center justify-between gap-2">
          {title && (
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {title}
            </p>
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

/**
 * Horizontal snap strip on small screens, vertical list from `lg`.
 * Keeps pickers from wrapping into many rows on mobile.
 */
export function RailStrip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 rail-strip lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0",
        className
      )}
    >
      {children}
    </div>
  )
}

export function RailItem({
  active,
  onClick,
  title,
  trailing,
  children,
  className,
}: {
  active: boolean
  onClick: () => void
  title?: string
  trailing?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-current={active ? "true" : undefined}
      className={cn(
        "flex shrink-0 snap-start items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-semibold transition-colors lg:w-full lg:shrink",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-card"
          : "border-input bg-card hover:border-primary/50 hover:bg-accent",
        className
      )}
    >
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {trailing}
    </button>
  )
}

export type RailSelectOption = SelectOption

/**
 * Dropdown picker. Preferred over a chip list once the option count grows —
 * it keeps the rail a fixed height no matter how many lessons ship later.
 * Flat on purpose: the topic name is what learners pick by.
 */
export function RailSelect({
  id,
  value,
  options,
  onChange,
}: {
  id: string
  value: string
  options: RailSelectOption[]
  onChange: (value: string) => void
}) {
  return <Select id={id} value={value} options={options} onChange={onChange} />
}

/** Progress readout: "3/7" plus a bar. */
export function RailProgress({ done, total, label }: { done: number; total: number; label: string }) {
  const pct = (done / Math.max(total, 1)) * 100
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-lg font-bold tabular-nums text-primary">
          {done}
          <span className="text-sm font-medium text-muted-foreground">/{total}</span>
        </span>
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

/**
 * Voice settings are rarely touched, so they collapse to an icon that opens a
 * popover instead of taking permanent room in the rail.
 */
export function RailVoice() {
  return (
    <Popover
      width={260}
      trigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-label="Cài đặt giọng đọc"
          title="Giọng đọc"
          className={cn(
            "flex size-9 items-center justify-center rounded-lg border transition-colors",
            open
              ? "border-primary bg-primary-soft text-primary"
              : "border-input bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
          )}
        >
          <Settings2 className="size-4" />
        </button>
      )}
    >
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        Giọng đọc
      </p>
      <VoicePicker stacked />
    </Popover>
  )
}
