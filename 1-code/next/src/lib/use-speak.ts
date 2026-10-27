import { useCallback } from "react"
import { speak } from "@/lib/tts"
import { useVoice } from "@/stores/voice"

/**
 * speak() bound to the user's saved voice + rate + accent preferences.
 * This is the single entry point every "Nghe" button should use so changing
 * the voice in Settings updates the whole app at once.
 */
export function useSpeak() {
  const voiceName = useVoice((s) => s.voiceName)
  const rate = useVoice((s) => s.rate)
  const accent = useVoice((s) => s.accent)
  return useCallback(
    (text: string) => speak(text, { voiceName: voiceName || undefined, rate, accent }),
    [voiceName, rate, accent]
  )
}
