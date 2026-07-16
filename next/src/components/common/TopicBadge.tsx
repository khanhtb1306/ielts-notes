import { Badge } from "@/components/ui/badge"
import { useData } from "@/stores/data"
import type { TopicTag, TopicRole } from "@/types/content"
import { cn } from "@/lib/utils"

const ROLE_STYLES: Record<TopicRole, string> = {
  core: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  preview: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
  review: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30",
}

export function TopicBadge({ tag }: { tag: TopicTag | string }) {
  const { topicLabels } = useData()
  const key = typeof tag === "string" ? tag : tag.key
  const role = typeof tag === "string" ? "core" : tag.role || "core"
  const label = topicLabels[key]?.label || key
  return (
    <Badge
      variant="outline"
      className={cn("gap-1 font-normal border", ROLE_STYLES[role])}
    >
      <span className="font-semibold">{label}</span>
      <span className="opacity-70 text-[10px] uppercase tracking-wide">{role}</span>
    </Badge>
  )
}

export function RoleBadge({ role }: { role: TopicRole }) {
  return (
    <Badge variant="outline" className={cn("uppercase text-[10px] tracking-wide", ROLE_STYLES[role])}>
      {role}
    </Badge>
  )
}
