import { create } from "zustand"
import { persist } from "zustand/middleware"

const KEY = "ifa-vocab-progress"

export type CardStatus = "known" | "learning"

export interface CardState {
  /** Undefined means "never answered" — browsing a card must not set this. */
  status?: CardStatus
  /** How many times the card has been answered, across sessions. */
  seen: number
  starred?: boolean
  updatedAt: number
}

export interface VocabStats {
  total: number
  known: number
  learning: number
  untouched: number
  starred: number
}

interface FlashcardStore {
  cards: Record<string, CardState>
  /** Best Match-mode time per scope key, in milliseconds. */
  bestMatch: Record<string, number>

  mark: (id: string, known: boolean) => void
  /** Clears the status but keeps the star and the seen counter. */
  unmark: (id: string) => void
  toggleStar: (id: string) => void
  setStar: (id: string, starred: boolean) => void
  recordMatch: (scopeKey: string, ms: number) => void

  stateOf: (id: string) => CardState | undefined
  statsFor: (ids: string[]) => VocabStats
  reset: (ids: string[]) => void
  resetAll: () => void
}

function touch(prev: CardState | undefined, now: number): CardState {
  return { seen: prev?.seen ?? 0, starred: prev?.starred, status: prev?.status, updatedAt: now }
}

/** Shape written by the first release: same `cards` map, no stars, no bestMatch. */
interface PersistedV0 {
  cards?: Record<string, { status?: CardStatus; seen?: number; updatedAt?: number }>
}

/**
 * Without this, bumping `version` makes zustand drop the whole persisted state
 * (it logs "couldn't be migrated since no migrate function was provided").
 * The v0 card map is already compatible, so it is carried over as-is.
 */
function migrate(persisted: unknown, _version: number): Partial<FlashcardStore> {
  const old = (persisted ?? {}) as PersistedV0
  const cards: Record<string, CardState> = {}
  for (const [id, v] of Object.entries(old.cards ?? {})) {
    cards[id] = {
      status: v?.status,
      seen: v?.seen ?? 0,
      starred: false,
      updatedAt: v?.updatedAt ?? Date.now(),
    }
  }
  return { cards, bestMatch: {} }
}

export const useFlashcard = create<FlashcardStore>()(
  persist(
    (set, get) => ({
      cards: {},
      bestMatch: {},

      /* `Date.now()` is read before `set` so the updater stays pure — React
         StrictMode invokes updaters twice and must produce the same result. */
      mark: (id, known) => {
        const now = Date.now()
        set((state) => {
          const prev = state.cards[id]
          return {
            cards: {
              ...state.cards,
              [id]: {
                ...touch(prev, now),
                status: known ? "known" : "learning",
                seen: (prev?.seen ?? 0) + 1,
              },
            },
          }
        })
      },

      unmark: (id) => {
        const now = Date.now()
        set((state) => {
          const prev = state.cards[id]
          if (!prev) return state
          const next = { ...touch(prev, now) }
          delete next.status
          return { cards: { ...state.cards, [id]: next } }
        })
      },

      toggleStar: (id) => {
        const now = Date.now()
        set((state) => {
          const prev = state.cards[id]
          return { cards: { ...state.cards, [id]: { ...touch(prev, now), starred: !prev?.starred } } }
        })
      },

      setStar: (id, starred) => {
        const now = Date.now()
        set((state) => {
          const prev = state.cards[id]
          return { cards: { ...state.cards, [id]: { ...touch(prev, now), starred } } }
        })
      },

      recordMatch: (scopeKey, ms) =>
        set((state) => {
          const best = state.bestMatch[scopeKey]
          if (best != null && best <= ms) return state
          return { bestMatch: { ...state.bestMatch, [scopeKey]: ms } }
        }),

      stateOf: (id) => get().cards[id],

      statsFor: (ids) => {
        const cards = get().cards
        let known = 0
        let learning = 0
        let starred = 0
        for (const id of ids) {
          const c = cards[id]
          if (c?.status === "known") known++
          else if (c?.status === "learning") learning++
          if (c?.starred) starred++
        }
        return { total: ids.length, known, learning, untouched: ids.length - known - learning, starred }
      },

      reset: (ids) =>
        set((state) => {
          const next = { ...state.cards }
          for (const id of ids) delete next[id]
          return { cards: next }
        }),

      resetAll: () => set({ cards: {}, bestMatch: {} }),
    }),
    { name: KEY, version: 2, migrate }
  )
)
