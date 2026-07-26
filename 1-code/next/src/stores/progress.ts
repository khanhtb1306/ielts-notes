import { create } from "zustand"
import { persist } from "zustand/middleware"

interface ProgressStore {
  done: Record<string, boolean>
  toggle: (id: string) => void
  set: (id: string, value: boolean) => void
  countDone: () => number
  clear: () => void
}

export const useProgress = create<ProgressStore>()(
  persist(
    (set, get) => ({
      done: {},
      toggle: (id) =>
        set((state) => {
          const next = { ...state.done }
          if (next[id]) delete next[id]
          else next[id] = true
          return { done: next }
        }),
      set: (id, value) =>
        set((state) => {
          const next = { ...state.done }
          if (value) next[id] = true
          else delete next[id]
          return { done: next }
        }),
      countDone: () => Object.keys(get().done).length,
      clear: () => set({ done: {} }),
    }),
    { name: "ielts-final-progress" }
  )
)
