import { create } from "zustand"
import { persist } from "zustand/middleware"

const KEY = "ielts-voice-prefs"

export const RATE_OPTIONS = [
  { value: 0.7, label: "Chậm" },
  { value: 0.9, label: "Vừa" },
  { value: 1, label: "Bình thường" },
] as const

/** Accent the whole app reads with. Notes default to British English. */
export type Accent = "en-GB" | "en-US"

export const ACCENT_OPTIONS: { value: Accent; label: string; hint: string }[] = [
  { value: "en-GB", label: "Anh-Anh", hint: "British" },
  { value: "en-US", label: "Anh-Mỹ", hint: "American" },
]

interface VoiceStore {
  /** Empty means "auto-pick the best available voice for the chosen accent". */
  voiceName: string
  rate: number
  accent: Accent
  setVoiceName: (v: string) => void
  setRate: (v: number) => void
  setAccent: (v: Accent) => void
}

export const useVoice = create<VoiceStore>()(
  persist(
    (set) => ({
      voiceName: "",
      rate: 0.9,
      accent: "en-GB",
      setVoiceName: (voiceName) => set({ voiceName }),
      setRate: (rate) => set({ rate }),
      // Switching accent clears the explicit voice so the picker re-resolves a
      // voice that actually matches; otherwise a pinned en-GB voice would keep
      // reading after the user asked for American.
      setAccent: (accent) => set({ accent, voiceName: "" }),
    }),
    { name: KEY }
  )
)
