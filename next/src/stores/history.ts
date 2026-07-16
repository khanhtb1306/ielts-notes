import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { QuestionKind } from "@/types/content"
import type { SamplePoolConfig, SampledQuestion } from "@/lib/sample-pool"
import type { GradedItem } from "@/lib/grading"

const HISTORY_KEY = "ielts-practice-history"
const MAX_HISTORY = 50

export interface HistoryEntry {
  id: string
  presetId: string | null
  presetLabel: string | null
  config: SamplePoolConfig
  score: number
  total: number
  breakdown: Record<string, { correct: number; total: number }>
  detail: LightGradedItem[]
  answers: Record<number, unknown>
  questions: SampledQuestion[]
  submittedAt: number
}

/** Trimmed shape of GradedItem persisted in history (avoid deep-copying huge audio arrays). */
export interface LightGradedItem {
  i: number
  ok: boolean
  topic: string
  ans: unknown
  q: {
    id: string
    kind: QuestionKind
    prompt: string
    promptHtml: string
    correctAnswer: (string | number)[]
    blanks: { answers: string[] }[] | null
    pairs: { leftId: string; left: string; rightId: string; right: string }[] | null
    explanationHtml: string
  }
}

interface HistoryStore {
  entries: HistoryEntry[]
  push: (entry: HistoryEntry) => void
  get: (id: string) => HistoryEntry | undefined
  clear: () => void
}

export const useHistory = create<HistoryStore>()(
  persist(
    (set, get) => ({
      entries: [],
      push: (entry) =>
        set((state) => {
          const next = [entry, ...state.entries]
          if (next.length > MAX_HISTORY) next.length = MAX_HISTORY
          return { entries: next }
        }),
      get: (id) => get().entries.find((e) => e.id === id),
      clear: () => set({ entries: [] }),
    }),
    { name: HISTORY_KEY }
  )
)

export function toLightItem(item: GradedItem): LightGradedItem {
  return {
    i: item.i,
    ok: item.ok,
    topic: item.topic,
    ans: item.ans,
    q: {
      id: item.q.id,
      kind: item.q.kind,
      prompt: item.q.prompt,
      promptHtml: item.q.promptHtml,
      correctAnswer: item.q.correctAnswer,
      blanks: (item.q.blanks || []).map((b) => ({ answers: b.answers })),
      pairs: item.q.pairs,
      explanationHtml: item.q.explanationHtml,
    },
  }
}
