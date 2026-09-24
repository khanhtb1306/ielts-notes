import { useState } from "react"
import { cn } from "@/lib/utils"
import { speak } from "@/lib/tts"
import type { IpaEntry } from "@/types/content"

interface Props {
  items: IpaEntry[]
  colorFn?: (item: IpaEntry) => string
}

export function IpaGrid({ items, colorFn }: Props) {
  const [playing, setPlaying] = useState<string | null>(null)
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {items.map((s, i) => (
        <button
          key={`${s.ipa}-${s.word}-${i}`}
          type="button"
          onClick={() => {
            setPlaying(s.word)
            speak(s.word)
            setTimeout(() => setPlaying(null), 900)
          }}
          className={cn(
            "lift flex flex-col items-center justify-center gap-1 rounded-lg border border-border bg-card px-3 py-3 text-sm",
            playing === s.word && "border-primary bg-primary-soft"
          )}
          style={{ "--tile": colorFn?.(s) } as React.CSSProperties}
        >
          <span className="ipa text-lg font-semibold text-primary">/{s.ipa}/</span>
          <span className="content-en text-xs text-muted-foreground">{s.word}</span>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Nghe</span>
        </button>
      ))}
    </div>
  )
}
