import { create } from "zustand"
import { persist } from "zustand/middleware"

/**
 * Remembers whether hidden practice papers are unlocked on this device. Unlocking
 * once via the URL key (`?key=...`) persists it, so changing tabs/routes no
 * longer hides the papers and the key never needs re-entering here.
 */
interface UnlockStore {
  unlocked: boolean
  setUnlocked: (v: boolean) => void
}

export const useUnlock = create<UnlockStore>()(
  persist(
    (set) => ({
      unlocked: false,
      setUnlocked: (unlocked) => set({ unlocked }),
    }),
    { name: "ifa-unlock" }
  )
)
