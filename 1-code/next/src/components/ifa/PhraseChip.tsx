import { Volume2, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { ttsSupported } from "@/lib/tts"
import { useSpeak } from "@/lib/use-speak"
import type { IfaPhrase } from "@/types/content"

/** One tint family per slot so ①②③ stay visually distinct while scanning. */
const GROUP: Record<number, { face: string; ipa: string; ring: string }> = {
  1: {
    face: "border-slot1/25 bg-slot1/[0.07] hover:border-slot1/60",
    ipa: "text-slot1",
    ring: "ring-slot1",
  },
  2: {
    face: "border-slot2/25 bg-slot2/[0.08] hover:border-slot2/60",
    ipa: "text-slot2",
    ring: "ring-slot2",
  },
  3: {
    face: "border-slot3/25 bg-slot3/[0.08] hover:border-slot3/60",
    ipa: "text-slot3",
    ring: "ring-slot3",
  },
}

interface Props {
  phrase: IfaPhrase
  group: number
  selected: boolean
  onSelect: () => void
}

export function PhraseChip({ phrase, group, selected, onSelect }: Props) {
  const speak = useSpeak()
  const tone = GROUP[group] ?? GROUP[1]

  return (
    <div
      className={cn(
        "lift flex items-stretch overflow-hidden rounded-lg border bg-card",
        tone.face,
        selected && `ring-2 ring-offset-1 ring-offset-background ${tone.ring}`
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className="min-w-0 flex-1 px-3.5 py-3 text-left"
      >
        <span className="flex items-start gap-1.5">
          {selected && <Check className={cn("mt-1 size-4 shrink-0", tone.ipa)} />}
          <span className="content-en min-w-0 break-words text-phrase">{phrase.en}</span>
        </span>
        <span className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          {phrase.ipa && <span className={cn("ipa text-[13px]", tone.ipa)}>{phrase.ipa}</span>}
          {phrase.vi && <span className="min-w-0 break-words text-xs text-muted-foreground">{phrase.vi}</span>}
        </span>
      </button>

      {ttsSupported() && (
        <button
          type="button"
          aria-label={`Nghe: ${phrase.en}`}
          onClick={() => speak(phrase.en)}
          className="flex w-11 shrink-0 items-center justify-center border-l border-border/50 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        >
          <Volume2 className="size-4" />
        </button>
      )}
    </div>
  )
}
