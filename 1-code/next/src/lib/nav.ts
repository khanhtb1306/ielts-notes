import type { LucideIcon } from "lucide-react"
import { Volume2, Rows, MessageSquare, GraduationCap } from "lucide-react"

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  eyebrow?: string
  title: string
  subtitle?: string
}

export const NAV: NavItem[] = [
  { to: "/pronunciation", label: "Phát âm", icon: Volume2, eyebrow: "Pronunciation", title: "Phát âm", subtitle: "IPA, trọng âm, âm cuối" },
  { to: "/grammar", label: "Ngữ pháp", icon: Rows, eyebrow: "Grammar", title: "Ngữ pháp", subtitle: "Tổng hợp kiến thức + giải thích" },
  { to: "/speaking", label: "Speaking", icon: MessageSquare, eyebrow: "Speaking", title: "Speaking", subtitle: "Câu hỏi luyện nói + khung trả lời + audio" },
  { to: "/final", label: "Final Test", icon: GraduationCap, eyebrow: "Kỳ thi cuối", title: "Final Test", subtitle: "Đề thi thật + 10 bộ đề luyện" },
]

// Kept for back-compat with any imports; Final Test is now part of NAV.
export const FINAL_NAV: NavItem = NAV[3]

export function findNavForPath(pathname: string): NavItem | undefined {
  const exact = NAV.find((n) => n.to === pathname)
  if (exact) return exact
  return NAV.find((n) => n.to !== "/" && pathname.startsWith(n.to))
}
