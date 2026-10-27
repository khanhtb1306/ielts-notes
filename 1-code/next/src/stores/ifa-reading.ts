import { create } from "zustand"
import { persist } from "zustand/middleware"

const KEY = "ifa-reading-progress"

/** Per-paper progress so multiple practice papers keep separate state. */
interface PaperProgress {
  answers: Record<number, string>
  submitted: boolean
  writing: Record<number, string>
}

const emptyPaper = (): PaperProgress => ({ answers: {}, submitted: false, writing: {} })

interface IfaReadingStore {
  papers: Record<string, PaperProgress>
  get: (paperId: string) => PaperProgress
  setAnswer: (paperId: string, n: number, value: string) => void
  submit: (paperId: string) => void
  reset: (paperId: string) => void
  setWriting: (paperId: string, n: number, value: string) => void
}

export const useIfaReading = create<IfaReadingStore>()(
  persist(
    (set, get) => ({
      papers: {},
      get: (paperId) => get().papers[paperId] ?? emptyPaper(),
      setAnswer: (paperId, n, value) =>
        set((s) => {
          const prev = s.papers[paperId] ?? emptyPaper()
          return { papers: { ...s.papers, [paperId]: { ...prev, answers: { ...prev.answers, [n]: value } } } }
        }),
      submit: (paperId) =>
        set((s) => {
          const prev = s.papers[paperId] ?? emptyPaper()
          return { papers: { ...s.papers, [paperId]: { ...prev, submitted: true } } }
        }),
      reset: (paperId) =>
        set((s) => {
          const prev = s.papers[paperId] ?? emptyPaper()
          return { papers: { ...s.papers, [paperId]: { ...prev, answers: {}, submitted: false } } }
        }),
      setWriting: (paperId, n, value) =>
        set((s) => {
          const prev = s.papers[paperId] ?? emptyPaper()
          return { papers: { ...s.papers, [paperId]: { ...prev, writing: { ...prev.writing, [n]: value } } } }
        }),
    }),
    { name: KEY }
  )
)
