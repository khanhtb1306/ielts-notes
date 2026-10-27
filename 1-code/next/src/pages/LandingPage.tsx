import { Link } from "react-router-dom"
import { ArrowRight, GraduationCap } from "lucide-react"
import { NAV_GROUPS } from "@/lib/nav"
import { cn } from "@/lib/utils"

/**
 * Course picker — the app entry screen. Each card is one group from the nav
 * (single source of truth), so adding a course in `nav.ts` surfaces it here
 * automatically. No class metadata, just the group name + what's inside.
 */
export function LandingPage() {
  return (
    <div className="space-y-5">
      {/* Greeting hero */}
      <section className="overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground shadow-card sm:p-8">
        <p className="text-sm font-medium opacity-90">Xin chào 👋</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Chọn nội dung ôn tập</h2>
        <p className="mt-2 max-w-xl text-sm opacity-90">
          Chúc bạn một buổi học hiệu quả. Chọn một khóa bên dưới để bắt đầu.
        </p>
      </section>

      {/* Course cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {NAV_GROUPS.map((group) => (
          <CourseCard
            key={group.id}
            to={group.items[0]?.to ?? "/"}
            label={group.label}
            items={group.items.map((i) => i.label)}
          />
        ))}
      </div>
    </div>
  )
}

function CourseCard({
  to,
  label,
  items,
}: {
  to: string
  label: string
  items: string[]
}) {
  // De-duplicate labels (e.g. two "Ngữ pháp") while keeping order.
  const chips = Array.from(new Set(items))
  return (
    <Link
      to={to}
      className={cn(
        "group flex flex-col rounded-xl border border-border bg-card p-5 shadow-card transition-all",
        "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <GraduationCap className="size-6" />
        </span>
        <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
      </div>

      <h3 className="mt-4 text-lg font-bold tracking-tight">{label}</h3>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {chips.map((chip) => (
          <span
            key={chip}
            className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
          >
            {chip}
          </span>
        ))}
      </div>

      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
        Vào học <ArrowRight className="size-4" />
      </span>
    </Link>
  )
}
