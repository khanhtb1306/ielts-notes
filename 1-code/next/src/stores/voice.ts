import { create } from "zustand"
import { persist } from "zustand/middleware"

const KEY = "ielts-voice-prefs"

export const RATE_OPTIONS = [
  { value: 0.7, label: "Chậm" },
  { value: 0.9, label: "Vừa" },
  { value: 1, label: "Bình thường" },
] as const

interface VoiceStore {
  /** Empty means "auto-pick the best available voice". */
  voiceName: string
  rate: number
  setVoiceName: (v: string) => void
  setRate: (v: number) => void
}

export const useVoice = create<VoiceStore>()(
  persist(
    (set) => ({
      voiceName: "",
      rate: 0.9,
      setVoiceName: (voiceName) => set({ voiceName }),
      setRate: (rate) => set({ rate }),
    }),
    { name: KEY }
  )
)
