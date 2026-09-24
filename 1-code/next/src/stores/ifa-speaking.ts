import { create } from "zustand"
import { persist } from "zustand/middleware"

const KEY = "ifa-speaking-answers"

export interface SavedAnswer {
  handoutId: string
  questionIndex: number
  title: string
  answer: string
  savedAt: number
}

/** Composite key so each (handout, question) keeps its own saved answer. */
function answerKey(handoutId: string, questionIndex: number) {
  return `${handoutId}::${questionIndex}`
}

interface IfaSpeakingStore {
  answers: Record<string, SavedAnswer>
  save: (a: Omit<SavedAnswer, "savedAt">) => void
  remove: (handoutId: string, questionIndex: number) => void
  get: (handoutId: string, questionIndex: number) => SavedAnswer | undefined
  listByHandout: (handoutId: string) => SavedAnswer[]
  clearHandout: (handoutId: string) => void
}

export const useIfaSpeaking = create<IfaSpeakingStore>()(
  persist(
    (set, get) => ({
      answers: {},
      save: (a) =>
        set((state) => ({
          answers: {
            ...state.answers,
            [answerKey(a.handoutId, a.questionIndex)]: { ...a, savedAt: Date.now() },
          },
        })),
      remove: (handoutId, questionIndex) =>
        set((state) => {
          const next = { ...state.answers }
          delete next[answerKey(handoutId, questionIndex)]
          return { answers: next }
        }),
      get: (handoutId, questionIndex) => get().answers[answerKey(handoutId, questionIndex)],
      listByHandout: (handoutId) =>
        Object.values(get().answers)
          .filter((a) => a.handoutId === handoutId)
          .sort((x, y) => x.questionIndex - y.questionIndex),
      clearHandout: (handoutId) =>
        set((state) => {
          const next: Record<string, SavedAnswer> = {}
          for (const [k, v] of Object.entries(state.answers)) {
            if (v.handoutId !== handoutId) next[k] = v
          }
          return { answers: next }
        }),
    }),
    { name: KEY }
  )
)
