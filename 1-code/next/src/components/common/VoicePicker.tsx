import { useEffect, useState } from "react"
import { Volume2 } from "lucide-react"
import { getEnglishVoices, preferredVoiceName, speak, ttsSupported } from "@/lib/tts"
import { useVoice, RATE_OPTIONS } from "@/stores/voice"
import { cn } from "@/lib/utils"

const SAMPLE = "I usually go shopping at the weekend."

export function VoicePicker({ className, stacked = false }: { className?: string; stacked?: boolean }) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const { voiceName, rate, setVoiceName, setRate } = useVoice()

  // Voices load asynchronously; re-read until the list is populated.
  useEffect(() => {
    if (!ttsSupported()) return
    const read = () => setVoices(getEnglishVoices())
    read()
    window.speechSynthesis.addEventListener("voiceschanged", read)
    return () => window.speechSynthesis.removeEventListener("voiceschanged", read)
  }, [])

  if (!ttsSupported()) {
    return (
      <p className={cn("text-xs text-muted-foreground", className)}>
        Trình duyệt này không hỗ trợ đọc to.
      </p>
    )
  }

  const auto = preferredVoiceName(voices)
  const active = voiceName || auto

  // `stacked` fits a narrow popover; the inline form stays for wide toolbars.
  return (
    <div className={cn(stacked ? "space-y-3 text-xs" : "flex flex-wrap items-center gap-2 text-xs", className)}>
      <label className={cn(stacked ? "block space-y-1" : "flex items-center gap-1.5")} htmlFor="tts-voice">
        <span className="font-semibold text-muted-foreground">Giọng</span>
        <select
          id="tts-voice"
          name="tts-voice"
          value={voiceName}
          onChange={(e) => setVoiceName(e.target.value)}
          className={cn(
            "truncate rounded-lg border border-input bg-background px-2 py-1.5 font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring",
            stacked ? "w-full" : "max-w-[190px]"
          )}
        >
          <option value="">Tự động{auto ? ` — ${auto}` : ""}</option>
          {voices.map((v) => (
            <option key={v.name} value={v.name}>
              {v.name} ({v.lang})
            </option>
          ))}
        </select>
      </label>

      <div className={cn(stacked ? "space-y-1" : "flex items-center gap-1")}>
        <span className="block font-semibold text-muted-foreground">Tốc độ</span>
        <div className={cn("flex overflow-hidden rounded-lg border border-input", stacked && "w-full")}>
          {RATE_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setRate(o.value)}
              className={cn(
                "px-2.5 py-1.5 font-medium transition-colors",
                stacked && "flex-1",
                rate === o.value ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => speak(SAMPLE, active, rate)}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-lg border border-input px-2.5 py-1.5 font-medium transition-colors hover:bg-accent",
          stacked && "w-full"
        )}
      >
        <Volume2 className="size-3.5" /> Nghe thử
      </button>
    </div>
  )
}
