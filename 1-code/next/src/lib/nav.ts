import type { LucideIcon } from "lucide-react"
import { Volume2, Rows, MessageSquare, GraduationCap, Mic, Shuffle } from "lucide-react"

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  eyebrow?: string
  title: string
  subtitle?: string
  /** Short course tag shown next to the label when two courses share a label. */
  badge?: string
}

export interface NavGroup {
  id: string
  /** Full course name shown as the section heading. */
  label: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "pre-ielts",
    label: "Pre-IELTS",
    items: [
      { to: "/pronunciation", label: "Phát âm", icon: Volume2, eyebrow: "Pre-IELTS · Pronunciation", title: "Phát âm", subtitle: "IPA, trọng âm, âm cuối" },
      { to: "/grammar", label: "Ngữ pháp", icon: Rows, eyebrow: "Pre-IELTS · Grammar", title: "Ngữ pháp", subtitle: "Tổng hợp kiến thức + giải thích" },
      { to: "/speaking", label: "Speaking", icon: MessageSquare, badge: "Pre", eyebrow: "Pre-IELTS · Speaking", title: "Speaking", subtitle: "Câu hỏi luyện nói + khung trả lời + audio" },
      { to: "/final", label: "Final Test", icon: GraduationCap, eyebrow: "Pre-IELTS · Kỳ thi cuối", title: "Final Test", subtitle: "Đề thi thật + 10 bộ đề luyện" },
    ],
  },
  {
    id: "ifa-ielts",
    label: "IELTS Foundation A",
    items: [
      { to: "/speaking-ifa", label: "Speaking", icon: Mic, badge: "IFA", eyebrow: "IELTS Foundation A · Speaking", title: "Speaking — IELTS Foundation A", subtitle: "Khung trả lời theo chủ đề + luyện phản xạ" },
    ],
  },
]

// Flattened list kept for back-compat (TopBar path matching, etc.).
export const NAV: NavItem[] = NAV_GROUPS.flatMap((g) => g.items)

/** Routes that have their own header but are not top-level sidebar entries. */
export const SUB_ROUTES: NavItem[] = [
  {
    to: "/speaking-ifa/drill",
    label: "Luyện phản xạ",
    icon: Shuffle,
    eyebrow: "IELTS Foundation A · Speaking",
    title: "Luyện phản xạ",
    subtitle: "Câu hỏi ngẫu nhiên — trả lời ngay, không nhìn script",
  },
]

// Kept for back-compat with any imports; Final Test is now part of NAV.
export const FINAL_NAV: NavItem = NAV.find((n) => n.to === "/final") ?? NAV[NAV.length - 1]

/** True when `pathname` is `base` or a sub-route of it — matched on whole path
 *  segments so "/speaking-ifa/drill" never matches "/speaking". */
function isUnder(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`)
}

export function findNavForPath(pathname: string): NavItem | undefined {
  const all = [...NAV, ...SUB_ROUTES]
  const exact = all.find((n) => n.to === pathname)
  if (exact) return exact
  // Prefer the longest matching base so nested routes resolve to the deepest nav item.
  return all
    .filter((n) => n.to !== "/" && isUnder(pathname, n.to))
    .sort((a, b) => b.to.length - a.to.length)[0]
}

/** The course group that owns `pathname`, if any. */
export function findGroupForPath(pathname: string): NavGroup | undefined {
  return NAV_GROUPS.find((g) => g.items.some((i) => isUnder(pathname, i.to)))
}
