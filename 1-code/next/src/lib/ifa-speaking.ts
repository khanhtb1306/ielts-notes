import { ifaSpeakingHandouts, ifaSpeakingDrills } from "@/data/ifa-speaking"
import { ifaFinalTopics } from "@/data/ifa-final-speaking"
import type { IfaHandout, IfaStructure, IfaPhrase, IfaScenario, IfaGroup, IfaFinalTopic } from "@/types/content"

export { ifaSpeakingHandouts, ifaSpeakingDrills }

export function getHandout(id: string): IfaHandout | undefined {
  return ifaSpeakingHandouts.find((h) => h.id === id)
}

/**
 * Unified "Theo chủ đề" taxonomy. Lesson handouts come first (Study split into
 * three audience topics), then the final-only topics are appended. Each topic
 * carries its final questions + guide and, where a handout exists, the
 * sentence-builder variants for "Ghép câu".
 */
export interface SpeakingTopicEntry {
  num: number
  key: string
  label: string
  vi: string
  finalTopic?: IfaFinalTopic
  handouts: IfaHandout[]
}

const TOPIC_PLAN: { label: string; vi: string; finalId?: string; handoutIds: string[] }[] = [
  { label: "Shopping", vi: "Mua sắm", finalId: "shopping", handoutIds: ["dc2"] },
  { label: "Sports", vi: "Thể thao", finalId: "sports", handoutIds: ["dc3"] },
  { label: "Study · Học sinh", vi: "Học tập (học sinh)", finalId: "studying", handoutIds: ["dc4hs"] },
  { label: "Study · Sinh viên", vi: "Học tập (sinh viên)", finalId: "studying", handoutIds: ["dc4uni"] },
  { label: "Study · Người đi làm", vi: "Học tập (người đi làm)", finalId: "studying", handoutIds: ["dc4work"] },
  { label: "Transport", vi: "Giao thông", finalId: "transport", handoutIds: ["dc5"] },
  { label: "Healthy Lifestyles", vi: "Lối sống lành mạnh", finalId: "healthy", handoutIds: ["dc6"] },
  { label: "Family & Relations", vi: "Gia đình & quan hệ", finalId: "family", handoutIds: ["dc7"] },
  { label: "Working", vi: "Công việc", finalId: "working", handoutIds: ["dc8student", "dc8work"] },
  { label: "Films", vi: "Phim ảnh", finalId: "movies", handoutIds: ["dc9"] },
  { label: "Hometown", vi: "Quê hương", finalId: "hometown", handoutIds: [] },
  { label: "Friends", vi: "Bạn bè", finalId: "friends", handoutIds: [] },
  { label: "Hobbies", vi: "Sở thích", finalId: "hobbies", handoutIds: [] },
  { label: "Tea & Coffee", vi: "Trà & cà phê", finalId: "tea-coffee", handoutIds: [] },
  { label: "Languages", vi: "Ngôn ngữ", finalId: "languages", handoutIds: [] },
  { label: "Music", vi: "Âm nhạc", finalId: "music", handoutIds: [] },
]

export function speakingTopics(): SpeakingTopicEntry[] {
  return TOPIC_PLAN.map((t, i) => ({
    num: i + 1,
    key: `t${i + 1}`,
    label: t.label,
    vi: t.vi,
    finalTopic: t.finalId ? ifaFinalTopics.find((f) => f.id === t.finalId) : undefined,
    handouts: t.handoutIds.map((id) => getHandout(id)).filter((h): h is IfaHandout => !!h),
  }))
}

/** One entry per topic; audience splits (e.g. Study) collapse into `variants`. */
export interface IfaTopicGroup {
  key: string
  lesson: number | null
  topicLabel: string
  variants: IfaHandout[]
}

/**
 * Topics for the picker. A lesson split by learner type yields a single topic
 * whose `variants` are rendered as tabs, so the picker length tracks the number
 * of lessons rather than the number of handouts.
 */
export function handoutTopics(): IfaTopicGroup[] {
  const map = new Map<string, IfaTopicGroup>()
  for (const h of ifaSpeakingHandouts) {
    const key = `${h.lesson ?? "x"}::${h.topicLabel}`
    const existing = map.get(key)
    if (existing) existing.variants.push(h)
    else map.set(key, { key, lesson: h.lesson, topicLabel: h.topicLabel, variants: [h] })
  }
  return [...map.values()].sort((a, b) => (a.lesson ?? 999) - (b.lesson ?? 999))
}

export function findTopicOfHandout(handoutId: string): IfaTopicGroup | undefined {
  return handoutTopics().find((t) => t.variants.some((h) => h.id === handoutId))
}

/** Distinct slot numbers referenced by a structure, in ascending order. */
export function slotsInStruct(struct: IfaStructure): number[] {
  const set = new Set<number>()
  for (const p of struct.parts) if (p.type === "slot") set.add(p.slot)
  return [...set].sort((a, b) => a - b)
}

/** Compose the final sentence from a structure and the chosen phrase per slot. */
export function composeSentence(
  struct: IfaStructure,
  chosen: Record<number, IfaPhrase | null>
): string {
  let out = ""
  for (const part of struct.parts) {
    if (part.type === "text") out += part.text
    else out += chosen[part.slot]?.en ?? "..."
  }
  return out.replace(/\s+/g, " ").trim()
}

/** True when every slot in the structure has a chosen phrase. */
export function isComplete(struct: IfaStructure, chosen: Record<number, IfaPhrase | null>): boolean {
  return slotsInStruct(struct).every((s) => !!chosen[s])
}

/** A resolved picker for one slot: which phrase groups to show, or why it is blocked. */
export interface SlotSource {
  slot: number
  label: string
  hint: string
  groups: IfaGroup[]
  /** Set when the slot cannot be filled yet (dependent slot awaiting a prerequisite). */
  blockedMessage?: string
}

/** Read `gNgroups` for any slot number, so new lessons with extra slots keep working. */
function groupsForSlot(scenario: IfaScenario, slot: number): IfaGroup[] {
  const rec = scenario as unknown as Record<string, unknown>
  const value = rec[`g${slot}groups`]
  return Array.isArray(value) ? (value as IfaGroup[]) : []
}

function labelForSlot(scenario: IfaScenario, slot: number): string {
  const rec = scenario.labels as unknown as Record<string, string | undefined>
  return rec[`g${slot}`] ?? ""
}

/**
 * Build one picker per slot referenced by the structure. Slot numbers are taken
 * from the data, so a future lesson using four slots renders four pickers.
 */
export function slotSources(
  scenario: IfaScenario,
  struct: IfaStructure,
  chosen: Record<number, IfaPhrase | null>
): SlotSource[] {
  return slotsInStruct(struct).map((slot) => {
    // The UI renders a numbered badge, so the label stays plain text.
    const label = labelForSlot(scenario, slot) || `Phần ${slot}`

    // Slot 1 is a flat phrase list rather than named groups.
    if (slot === 1) {
      return { slot, label, hint: "Chọn 1", groups: [{ name: "", vi: "", items: scenario.g1 }] }
    }

    // Slot 2 may cascade off the slot-1 choice (e.g. sport -> reasons for that sport).
    if (slot === 2 && scenario.g2DependsOnG1) {
      const parent = chosen[1]
      if (!parent) {
        return {
          slot,
          label,
          hint: "Hợp với ý 1",
          groups: [],
          blockedMessage: scenario.g2Prompt || "Chọn ý 1 trước để hiện gợi ý phù hợp.",
        }
      }
      return {
        slot,
        label,
        hint: "Hợp với ý 1",
        groups: [{ name: "", vi: "", items: parent.places ?? [] }],
      }
    }

    return { slot, label, hint: "Chọn 1", groups: groupsForSlot(scenario, slot) }
  })
}

/** Slots that must be cleared when `slot` changes (cascade invalidation). */
export function dependentSlots(scenario: IfaScenario, slot: number): number[] {
  return slot === 1 && scenario.g2DependsOnG1 ? [2] : []
}
