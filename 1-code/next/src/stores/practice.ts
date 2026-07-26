import { create } from "zustand"
import type { SamplePoolConfig, SampledQuestion } from "@/lib/sample-pool"

const SESSION_PREFIX = "ielts-practice-session-"

export interface PracticeSession {
  id: string
  config: SamplePoolConfig
  presetId: string | null
  presetLabel: string | null
  questions: SampledQuestion[]
  answers: Record<number, unknown>
  startedAt: number
  submittedAt?: number
}

interface PracticeStore {
  current: PracticeSession | null
  loadFromStorage: (id: string) => PracticeSession | null
  save: (session: PracticeSession) => void
  setAnswer: (id: string, index: number, answer: unknown) => void
  setCurrent: (session: PracticeSession | null) => void
}

function persistSession(session: PracticeSession) {
  try {
    sessionStorage.setItem(SESSION_PREFIX + session.id, JSON.stringify(session))
  } catch {
    /* quota / private mode — ignore */
  }
}

function readSession(id: string): PracticeSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_PREFIX + id)
    return raw ? (JSON.parse(raw) as PracticeSession) : null
  } catch {
    return null
  }
}

export const usePractice = create<PracticeStore>((set, get) => ({
  current: null,
  loadFromStorage: (id) => {
    const s = readSession(id)
    if (s) set({ current: s })
    return s
  },
  save: (session) => {
    persistSession(session)
    set({ current: session })
  },
  setAnswer: (id, index, answer) => {
    const current = get().current
    if (!current || current.id !== id) return
    const next: PracticeSession = {
      ...current,
      answers: { ...current.answers, [index]: answer },
    }
    persistSession(next)
    set({ current: next })
  },
  setCurrent: (session) => set({ current: session }),
}))

export function uid(): string {
  return "s" + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36)
}
