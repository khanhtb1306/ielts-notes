import { useCallback } from "react"
import { speak } from "@/lib/tts"
import { useVoice } from "@/stores/voice"

/** speak() bound to the user's saved voice + rate preferences. */
export function useSpeak() {
  const voiceName = useVoice((s) => s.voiceName)
  const rate = useVoice((s) => s.rate)
  return useCallback((text: string) => speak(text, voiceName || undefined, rate), [voiceName, rate])
}
