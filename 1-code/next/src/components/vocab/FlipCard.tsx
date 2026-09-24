import { Star, Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ttsSupported } from "@/lib/tts"
import { useSpeak } from "@/lib/use-speak"
import { speakableTerm } from "@/lib/ifa-vocab"
import type { IfaVocabCard } from "@/lib/ifa-vocab"
import type { CardStatus } from "@/stores/flashcard"

/**
 * Two-sided card. Flipping and navigating never change progress — only the
 * explicit "Đã thuộc / Chưa thuộc" buttons do.
 */
export function FlipCard({
  card,
  flipped,
  onFlip,
  starred,
  onToggleStar,
  status,
  height = 320,
}: {
  card: IfaVocabCard
  flipped: boolean
  onFlip: () => void
  starred: boolean
  onToggleStar: () => void
  status?: CardStatus
  height?: number
}) {
  const speak = useSpeak()

  return (
    <div className="flip-scene relative w-full" style={{ height }}>
      {/* Overlay controls sit above the flipping surface so they never mirror. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-3">
        <span
          className={cn(
            "pointer-events-auto rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
            status === "known"
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
              : status === "learning"
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                : "bg-muted text-muted-foreground"
          )}
        >
          {status === "known" ? "Đã thuộc" : status === "learning" ? "Đang học" : "Chưa học"}
        </span>
        <div className="flex items-center gap-1">
          {ttsSupported() && (
            <button
              type="button"
              onClick={() => speak(speakableTerm(card.term))}
              aria-label={`Nghe: ${card.term}`}
              title="Nghe phát âm"
              className="pointer-events-auto rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
            >
              <Volume2 className="size-5" />
            </button>
          )}
          <button
            type="button"
            onClick={onToggleStar}
            aria-pressed={starred}
            aria-label={starred ? "Bỏ gắn sao" : "Gắn sao để ôn lại"}
            title={starred ? "Bỏ gắn sao" : "Gắn sao để ôn lại"}
            className={cn(
              "pointer-events-auto rounded-full p-2 transition-colors",
              starred
                ? "text-amber-500 hover:bg-amber-500/10"
                : "text-muted-foreground hover:bg-accent hover:text-amber-500"
            )}
          >
            <Star className={cn("size-5", starred && "fill-current")} />
          </button>
        </div>
      </div>

      <button
        type="button"
        data-flip-card
        onClick={onFlip}
        aria-label={flipped ? "Xem mặt tiếng Anh" : "Xem nghĩa tiếng Việt"}
        aria-pressed={flipped}
        className="block h-full w-full rounded-2xl text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className={cn("flip-inner", flipped && "is-flipped")}>
          {/* Front */}
          <div className="flip-face flip-face-front flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card px-8 py-12 text-center shadow-card">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {card.pos || "Từ vựng"}
            </span>
            <p className="content-en text-[28px] font-bold leading-snug tracking-tight lg:text-[36px]">
              {card.term}
            </p>
            {/* The speaker lives in the overlay above — a nested interactive
                element inside this <button> would be invalid HTML. */}
            <span className="text-xs text-muted-foreground">Bấm thẻ hoặc Space để xem nghĩa</span>
          </div>

          {/* Back */}
          <div className="flip-face flip-face-back flex flex-col items-center justify-center gap-3 rounded-2xl border border-primary/40 bg-primary-soft px-8 py-12 text-center shadow-card">
            <p className="text-[22px] font-bold leading-snug lg:text-[26px]">{card.vi}</p>
            {card.ipa && <p className="ipa text-base text-primary">{card.ipa}</p>}
            <p className="content-en text-sm font-semibold text-muted-foreground">{card.term}</p>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {card.topics.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-card px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </button>
    </div>
  )
}
