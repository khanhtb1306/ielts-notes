import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface FlashcardProgress {
  box: 1 | 2 | 3
  lastSeen: number
}

interface FlashcardStore {
  /** Keyed by `<scope>-<cardId>` (e.g. `lesson-01-au-001` or `topic-vowels-au-...`). */
  progress: Record<string, FlashcardProgress>
  mark: (scope: string, cardId: string, box: 1 | 2 | 3) => void
  countKnown: (scope: string) => number
  clearScope: (scope: string) => void
}

export const useFlashcard = create<FlashcardStore>()(
  persist(
    (set, get) => ({
      progress: {},
      mark: (scope, cardId, box) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [`${scope}::${cardId}`]: { box, lastSeen: Date.now() },
          },
        })),
      countKnown: (scope) => {
        const entries = Object.entries(get().progress)
        return entries.filter(([k, v]) => k.startsWith(`${scope}::`) && v.box >= 3).length
      },
      clearScope: (scope) =>
        set((state) => {
          const next: Record<string, FlashcardProgress> = {}
          for (const [k, v] of Object.entries(state.progress)) {
            if (!k.startsWith(`${scope}::`)) next[k] = v
          }
          return { progress: next }
        }),
    }),
    { name: "ielts-flashcard-progress" }
  )
)
