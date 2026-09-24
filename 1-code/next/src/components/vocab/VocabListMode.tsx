import { useEffect, useMemo, useState } from "react"
import { Check, Search, Star, Volume2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ttsSupported } from "@/lib/tts"
import { useSpeak } from "@/lib/use-speak"
import { speakableTerm, normaliseAnswer } from "@/lib/ifa-vocab"
import type { IfaVocabCard } from "@/lib/ifa-vocab"
import { useFlashcard } from "@/stores/flashcard"
import { EmptyDeck } from "./EmptyDeck"

/** Rows rendered per page. */
const PAGE = 50

/** Full browsable list — the reference view the flashcards are drawn from. */
export function VocabListMode({ cards }: { cards: IfaVocabCard[] }) {
  const [query, setQuery] = useState("")
  const speak = useSpeak()
  const progress = useFlashcard((s) => s.cards)
  const mark = useFlashcard((s) => s.mark)
  const unmark = useFlashcard((s) => s.unmark)
  const toggleStar = useFlashcard((s) => s.toggleStar)

  const matches = useMemo(() => {
    const q = normaliseAnswer(query)
    if (!q) return cards
    return cards.filter(
      (c) =>
        normaliseAnswer(c.term).includes(q) ||
        c.vi.toLowerCase().includes(query.trim().toLowerCase())
    )
  }, [cards, query])

  /* 211 rows of six elements each is a lot of DOM for a phone, and the list is
     secondary to the card above it — so it grows on demand. */
  const [limit, setLimit] = useState(PAGE)
  const rows = matches.slice(0, limit)
  const hasMore = matches.length > rows.length

  // A new search or scope starts the list from the top again.
  useEffect(() => setLimit(PAGE), [query, cards])

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm từ tiếng Anh hoặc nghĩa tiếng Việt…"
          className="h-10 pl-9"
          aria-label="Tìm từ vựng"
        />
      </div>

      {/* The section header already shows the total, so only report filtering. */}
      {query.trim() && (
        <p className="text-xs text-muted-foreground">
          {matches.length} / {cards.length} từ khớp
        </p>
      )}

      {rows.length === 0 ? (
        <EmptyDeck title="Không tìm thấy từ nào" hint="Thử từ khoá khác." />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {rows.map((c) => {
            const state = progress[c.id]
            return (
              /* Wraps on narrow screens so the action buttons drop to their own
                 row instead of squeezing the term and meaning. */
              <li
                key={c.id}
                className="flex flex-wrap items-center gap-x-2 gap-y-1.5 p-3 transition-colors hover:bg-muted/40 sm:flex-nowrap sm:gap-3"
              >
                <button
                  type="button"
                  onClick={() => toggleStar(c.id)}
                  aria-pressed={!!state?.starred}
                  aria-label={state?.starred ? `Bỏ sao ${c.term}` : `Gắn sao ${c.term}`}
                  className={cn(
                    "shrink-0 rounded-md p-1.5 transition-colors",
                    state?.starred
                      ? "text-amber-500"
                      : "text-muted-foreground/40 hover:text-amber-500"
                  )}
                >
                  <Star className={cn("size-4", state?.starred && "fill-current")} />
                </button>

                <div className="min-w-0 flex-1 basis-[calc(100%-2.5rem)] sm:basis-auto">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="content-en text-[15px] font-bold">{c.term}</span>
                    {c.pos && (
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        {c.pos}
                      </span>
                    )}
                    {c.ipa && <span className="ipa text-[13px] text-primary">{c.ipa}</span>}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{c.vi}</p>
                </div>

                <div className="ml-auto flex shrink-0 items-center gap-2">
                {ttsSupported() && (
                  <button
                    type="button"
                    aria-label={`Nghe: ${c.term}`}
                    onClick={() => speak(speakableTerm(c.term))}
                    className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-primary"
                  >
                    <Volume2 className="size-4" />
                  </button>
                )}

                {/* Tri-state: pressing the active verdict clears it. */}
                <div className="flex shrink-0 overflow-hidden rounded-md border border-input">
                  <button
                    type="button"
                    aria-label={`Đánh dấu chưa thuộc: ${c.term}`}
                    title="Chưa thuộc"
                    onClick={() => (state?.status === "learning" ? unmark(c.id) : mark(c.id, false))}
                    className={cn(
                      "px-2 py-1.5 transition-colors",
                      state?.status === "learning"
                        ? "bg-amber-500 text-white"
                        : "text-muted-foreground hover:bg-accent"
                    )}
                  >
                    <X className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Đánh dấu đã thuộc: ${c.term}`}
                    title="Đã thuộc"
                    onClick={() => (state?.status === "known" ? unmark(c.id) : mark(c.id, true))}
                    className={cn(
                      "border-l border-input px-2 py-1.5 transition-colors",
                      state?.status === "known"
                        ? "bg-emerald-500 text-white"
                        : "text-muted-foreground hover:bg-accent"
                    )}
                  >
                    <Check className="size-4" />
                  </button>
                </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {hasMore && (
        <Button variant="outline" className="w-full" onClick={() => setLimit((n) => n + PAGE)}>
          Xem thêm ({matches.length - rows.length} từ)
        </Button>
      )}
    </div>
  )
}
