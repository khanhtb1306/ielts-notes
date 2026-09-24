import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ArrowLeft, ArrowRight, Check, RotateCcw, Shuffle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { seededRandom, shuffle } from "@/lib/sample-pool"
import type { IfaVocabCard } from "@/lib/ifa-vocab"
import { useFlashcard } from "@/stores/flashcard"
import { FlipCard } from "./FlipCard"
import { EmptyDeck } from "./EmptyDeck"

/** Minimum horizontal travel, in px, before a touch counts as a swipe. */
const SWIPE_MIN = 45

/**
 * Browse-first flashcards: moving between cards is free and never writes
 * progress. Only the two verdict buttons do, and they also advance.
 */
export function FlashcardsMode({ cards }: { cards: IfaVocabCard[] }) {
  const touchRef = useRef<{ x: number; y: number } | null>(null)
  const [seed, setSeed] = useState(() => Date.now())
  const [shuffled, setShuffled] = useState(false)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const progress = useFlashcard((s) => s.cards)
  const mark = useFlashcard((s) => s.mark)
  const toggleStar = useFlashcard((s) => s.toggleStar)

  const deck = useMemo(
    () => (shuffled ? shuffle(cards, seededRandom(seed)) : cards),
    [cards, shuffled, seed]
  )

  // Keep the cursor valid when the scope changes underneath us.
  useEffect(() => {
    setIndex(0)
    setFlipped(false)
  }, [deck])

  const current = deck[index]

  const go = useCallback(
    (delta: number) => {
      setFlipped(false)
      setIndex((i) => {
        const next = i + delta
        if (next < 0) return deck.length - 1
        if (next >= deck.length) return 0
        return next
      })
    },
    [deck.length]
  )

  const verdict = useCallback(
    (known: boolean) => {
      if (!current) return
      mark(current.id, known)
      // Last card: stay put so the summary below stays visible.
      if (index < deck.length - 1) go(1)
      else setFlipped(false)
    },
    [current, mark, go, index, deck.length]
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      /* Ignore while any control has focus: Space would both activate that
         control and flip the card, and typing in the word search would fire
         the verdict shortcuts. */
      const el = e.target as HTMLElement | null
      const onCard = !!el?.closest("[data-flip-card]")
      if (
        el &&
        !onCard &&
        (["INPUT", "SELECT", "TEXTAREA", "BUTTON", "A"].includes(el.tagName) || el.isContentEditable)
      ) {
        return
      }
      if (!current) return
      // The card button handles Space natively; a second flip would cancel it.
      if (e.code === "Space" && onCard) return
      if (e.code === "Space") {
        e.preventDefault()
        setFlipped((v) => !v)
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        go(1)
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        go(-1)
      } else if (e.key.toLowerCase() === "k") {
        verdict(true)
      } else if (e.key.toLowerCase() === "j") {
        verdict(false)
      } else if (e.key.toLowerCase() === "s") {
        toggleStar(current.id)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [current, go, verdict, toggleStar])

  if (!current) return <EmptyDeck />

  const state = progress[current.id]
  const pct = ((index + 1) / deck.length) * 100

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold tabular-nums">
          {index + 1}
          <span className="text-muted-foreground"> / {deck.length}</span>
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant={shuffled ? "secondary" : "ghost"}
            size="sm"
            onClick={() => {
              setShuffled((v) => !v)
              setSeed(Date.now())
            }}
          >
            <Shuffle className="size-4" /> {shuffled ? "Đang xáo" : "Xáo thẻ"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { setIndex(0); setFlipped(false) }}>
            <RotateCcw className="size-4" /> Về đầu
          </Button>
        </div>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>

      {/* Horizontal swipe navigates; it never records progress. */}
      <div
        onTouchStart={(e) => {
          const t = e.touches[0]
          touchRef.current = { x: t.clientX, y: t.clientY }
        }}
        onTouchEnd={(e) => {
          const start = touchRef.current
          touchRef.current = null
          if (!start) return
          const t = e.changedTouches[0]
          const dx = t.clientX - start.x
          const dy = t.clientY - start.y
          if (Math.abs(dx) > SWIPE_MIN && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1)
        }}
      >
        <FlipCard
          card={current}
          flipped={flipped}
          onFlip={() => setFlipped((v) => !v)}
          starred={!!state?.starred}
          onToggleStar={() => toggleStar(current.id)}
          status={state?.status}
        />
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <Button
          variant="outline"
          size="icon"
          aria-label="Thẻ trước"
          className="shrink-0"
          onClick={() => go(-1)}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          className={cn(
            "min-w-0 flex-1 px-2 text-xs sm:px-4 sm:text-sm",
            state?.status === "learning" && "border-amber-500/60 text-amber-700 dark:text-amber-400"
          )}
          onClick={() => verdict(false)}
        >
          <X className="size-4" /> Chưa thuộc
        </Button>
        <Button
          className={cn("min-w-0 flex-1 px-2 text-xs sm:px-4 sm:text-sm", state?.status === "known" && "opacity-80")}
          onClick={() => verdict(true)}
        >
          <Check className="size-4" /> Đã thuộc
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Thẻ sau"
          className="shrink-0"
          onClick={() => go(1)}
        >
          <ArrowRight className="size-4" />
        </Button>
      </div>

      {/* Keyboard hints are pointless on touch devices. */}
      <p className="hidden text-center text-xs text-muted-foreground sm:block">
        <Key>Space</Key> lật · <Key>←</Key> <Key>→</Key> chuyển thẻ (không tính điểm) ·{" "}
        <Key>J</Key> chưa thuộc · <Key>K</Key> đã thuộc · <Key>S</Key> gắn sao
      </p>
      <p className="text-center text-xs text-muted-foreground sm:hidden">
        Vuốt trái/phải để chuyển thẻ — không tính vào tiến độ.
      </p>
    </div>
  )
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-[11px] font-semibold">
      {children}
    </kbd>
  )
}
