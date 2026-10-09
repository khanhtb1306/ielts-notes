import { NavLink } from "react-router-dom"
import { MessageSquare, Shuffle, ClipboardCheck } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Sub-navigation shared by the three IFA speaking modes. One entry point —
 * "Speaking" — then the learner picks topic practice, reflex drill, or the
 * final-exam set here instead of from separate bottom-nav items.
 */
const TABS = [
  { to: "/speaking-ifa", label: "Theo chủ đề", icon: MessageSquare, end: true },
  { to: "/speaking-ifa/drill", label: "Luyện phản xạ", icon: Shuffle, end: false },
  { to: "/final-ifa/speaking", label: "Final", icon: ClipboardCheck, end: false },
]

export function SpeakingTabs() {
  return (
    <div className="mb-4 flex gap-1 overflow-x-auto rounded-lg border border-border bg-muted/50 p-1 rail-strip">
      {TABS.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className={({ isActive }) =>
            cn(
              "flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold transition-colors",
              isActive
                ? "bg-card text-primary shadow-card"
                : "text-muted-foreground hover:text-foreground"
            )
          }
        >
          <t.icon className="size-4 shrink-0" />
          {t.label}
        </NavLink>
      ))}
    </div>
  )
}
