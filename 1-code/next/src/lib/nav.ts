import type { LucideIcon } from "lucide-react"
import { Volume2, Rows, MessageSquare, GraduationCap, Mic, Shuffle, Layers, ClipboardCheck, BookOpen, BookOpenCheck, PenLine, Headphones } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Shared nav-link styling so the desktop Sidebar and the mobile drawer render
 * every link identically. `collapsed` centres the icon for the rail.
 */
export function navLinkClass({ isActive, collapsed = false }: { isActive: boolean; collapsed?: boolean }): string {
  return cn(
    "flex items-center gap-2.5 rounded-lg px-3 py-2 font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
    collapsed && "justify-center px-0",
    isActive && "bg-primary text-primary-foreground shadow-card hover:bg-primary hover:text-primary-foreground"
  )
}

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  eyebrow?: string
  title: string
  /** One-line title for the mobile header; falls back to `title`. */
  shortTitle?: string
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
      { to: "/speaking-ifa", label: "Speaking", icon: Mic, badge: "IFA", eyebrow: "IELTS Foundation A · Speaking", title: "Speaking — IELTS Foundation A", shortTitle: "Speaking", subtitle: "Khung trả lời theo chủ đề + luyện phản xạ" },
      { to: "/listening-ifa", label: "Listening", icon: Headphones, badge: "IFA", eyebrow: "IELTS Foundation A · Listening", title: "Listening — IELTS Foundation A", shortTitle: "Listening", subtitle: "Nội dung Listening sẽ được cập nhật" },
      { to: "/reading-ifa", label: "Reading", icon: BookOpenCheck, badge: "IFA", eyebrow: "IELTS Foundation A · Reading", title: "Reading — IELTS Foundation A", shortTitle: "Reading", subtitle: "Đề luyện Final Test · 14 câu, chấm tự động" },
      { to: "/writing-ifa", label: "Writing", icon: PenLine, badge: "IFA", eyebrow: "IELTS Foundation A · Writing", title: "Writing — IELTS Foundation A", shortTitle: "Writing", subtitle: "Đề luyện Final Test · viết đoạn + tiêu chí" },
      { to: "/grammar-ifa", label: "Ngữ pháp", icon: BookOpen, badge: "IFA", eyebrow: "IELTS Foundation A · Ngữ pháp", title: "Ngữ pháp — IELTS Foundation A", shortTitle: "Ngữ pháp", subtitle: "8 chủ điểm ngữ pháp theo slide trên lớp" },
      { to: "/vocab-ifa", label: "Từ vựng", icon: Layers, badge: "IFA", eyebrow: "IELTS Foundation A · Từ vựng", title: "Từ vựng — lật thẻ", shortTitle: "Từ vựng", subtitle: "Ôn bằng thẻ hai mặt, theo chủ đề Speaking" },
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
    shortTitle: "Luyện phản xạ",
    subtitle: "Câu hỏi ngẫu nhiên — trả lời ngay, không nhìn script",
  },
  {
    to: "/final-ifa/speaking",
    label: "Final Speaking",
    icon: ClipboardCheck,
    eyebrow: "IELTS Foundation A · Thi cuối khóa",
    title: "Final Speaking — IELTS Foundation A",
    shortTitle: "Final Speaking",
    subtitle: "Bộ câu hỏi giáo viên · luyện nói mỗi ngày",
  },
  {
    to: "/practice/runner",
    label: "Làm đề",
    icon: GraduationCap,
    eyebrow: "Pre-IELTS · Final Test",
    title: "Đang làm đề",
    shortTitle: "Làm đề",
  },
  {
    to: "/practice/result",
    label: "Kết quả",
    icon: GraduationCap,
    eyebrow: "Pre-IELTS · Final Test",
    title: "Kết quả bài làm",
    shortTitle: "Kết quả",
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

/** Sub-routes map back to the course whose section they belong under. */
const GROUP_PREFIXES: Record<string, string> = {
  "/speaking-ifa": "ifa-ielts",
  "/listening-ifa": "ifa-ielts",
  "/reading-ifa": "ifa-ielts",
  "/writing-ifa": "ifa-ielts",
  "/final-ifa": "ifa-ielts",
  "/vocab-ifa": "ifa-ielts",
  "/grammar-ifa": "ifa-ielts",
  "/practice": "pre-ielts",
  "/final": "pre-ielts",
}

/** The course group that owns `pathname`, if any. */
export function findGroupForPath(pathname: string): NavGroup | undefined {
  const direct = NAV_GROUPS.find((g) => g.items.some((i) => isUnder(pathname, i.to)))
  if (direct) return direct
  const prefix = Object.keys(GROUP_PREFIXES).find((p) => isUnder(pathname, p))
  if (prefix) return NAV_GROUPS.find((g) => g.id === GROUP_PREFIXES[prefix])
  return undefined
}
