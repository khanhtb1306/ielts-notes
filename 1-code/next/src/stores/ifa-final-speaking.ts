import { create } from "zustand"
import { persist } from "zustand/middleware"
import { allFinalQuestions, dailyFinalQuestions, localDay } from "@/lib/ifa-final-speaking"

export type FinalConfidence = "new" | "learning" | "confident"

export interface FinalAnswerProgress {
  answer: string
  status: FinalConfidence
  attempts: number
  lastPractisedAt?: number
}

interface DailySet {
  date: string
  ids: string[]
  cursor: number
}

interface IfaFinalStore {
  progress: Record<string, FinalAnswerProgress>
  daily: DailySet | null
  saveAnswer: (id: string, text: string) => void
  setConfidence: (id: string, status: FinalConfidence) => void
  recordPractice: (id: string, status: FinalConfidence) => void
  ensureToday: () => void
  setCursor: (index: number) => void
}

const empty: FinalAnswerProgress = { answer: "", status: "new", attempts: 0 }

export const useIfaFinalSpeaking = create<IfaFinalStore>()(
  persist(
    (set) => ({
      progress: {},
      daily: null,
      saveAnswer: (id, answer) => set((state) => ({
        progress: { ...state.progress, [id]: { ...(state.progress[id] ?? empty), answer } },
      })),
      setConfidence: (id, status) => set((state) => ({
        progress: { ...state.progress, [id]: { ...(state.progress[id] ?? empty), status } },
      })),
      recordPractice: (id, status) => set((state) => ({
        progress: { ...state.progress, [id]: {
          ...(state.progress[id] ?? empty), status,
          attempts: (state.progress[id]?.attempts ?? 0) + 1,
          lastPractisedAt: Date.now(),
        } },
      })),
      ensureToday: () => set((state) => {
        const date = localDay()
        if (state.daily?.date === date) return state
        return { daily: { date, ids: dailyFinalQuestions(allFinalQuestions, state.progress, date), cursor: 0 } }
      }),
      setCursor: (cursor) => set((state) => ({
        daily: state.daily ? { ...state.daily, cursor: Math.max(0, Math.min(cursor, state.daily.ids.length)) } : null,
      })),
    }),
    { name: "ifa-final-speaking-v1", partialize: (s) => ({ progress: s.progress, daily: s.daily }) }
  )
)
