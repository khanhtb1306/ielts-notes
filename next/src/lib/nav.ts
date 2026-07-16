import type { LucideIcon } from "lucide-react"
import {
  Target,
  Map,
  Volume2,
  Rows,
  MessageSquare,
  Flag,
  CalendarDays,
  Tag,
  Trophy,
} from "lucide-react"

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  eyebrow?: string
  title: string
  subtitle?: string
}

export const NAV: NavItem[] = [
  { to: "/", label: "Trang chủ", icon: Target, eyebrow: "Pre-IELTS · up to Lesson 15", title: "Current Stage", subtitle: "Tổng quan giai đoạn học" },
  { to: "/course", label: "Course Map", icon: Map, eyebrow: "Lesson 1–15", title: "Course Map", subtitle: "Bản đồ khoá học" },
  { to: "/pronunciation", label: "Pronunciation", icon: Volume2, eyebrow: "Lesson 1–5", title: "Pronunciation Notes", subtitle: "Ghi chú phát âm" },
  { to: "/grammar", label: "Grammar", icon: Rows, eyebrow: "Up to Lesson 15", title: "Grammar Notes", subtitle: "Ghi chú ngữ pháp" },
  { to: "/speaking", label: "Speaking", icon: MessageSquare, eyebrow: "A1–A2 first", title: "Speaking Notes", subtitle: "Ghi chú luyện nói" },
  { to: "/daily", label: "Daily · Lesson", icon: CalendarDays, eyebrow: "Daily · By Lesson", title: "Daily Practice · Theo Lesson", subtitle: "16 challenge sets từ giáo trình" },
  { to: "/topics", label: "Daily · Topic", icon: Tag, eyebrow: "Daily · By Topic", title: "Daily Practice · Theo Chủ Đề", subtitle: "Gom xuyên suốt các chủ đề" },
  { to: "/practice", label: "Final Practice", icon: Trophy, eyebrow: "Final Practice", title: "Final Practice · Generator", subtitle: "Sinh phiên quiz shuffle" },
]

export const FINAL_NAV: NavItem = {
  to: "/final",
  label: "Final Review",
  icon: Flag,
  eyebrow: "Kỳ thi cuối · Pre-IELTS",
  title: "Final Review · Pre-IELTS",
  subtitle: "Ôn tập tổng hợp",
}

export function findNavForPath(pathname: string): NavItem | undefined {
  // exact match first
  const exact = [...NAV, FINAL_NAV].find((n) => n.to === pathname)
  if (exact) return exact
  // prefix (for nested routes like /daily/lesson-01)
  return [...NAV, FINAL_NAV].find((n) => n.to !== "/" && pathname.startsWith(n.to))
}
