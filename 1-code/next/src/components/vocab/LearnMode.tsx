import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ArrowRight, Check, Lightbulb, RotateCcw, Trophy, Volume2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ttsSupported } from "@/lib/tts"
import { useSpeak } from "@/lib/use-speak"
import { seededRandom, shuffle } from "@/lib/sample-pool"
import { answersMatch, distractors, hashId, speakableTerm, synonymTerms } from "@/lib/ifa-vocab"
import type { IfaVocabCard } from "@/lib/ifa-vocab"
import { useFlashcard } from "@/stores/flashcard"
import { EmptyDeck } from "./EmptyDeck"

/** Cards per round — short enough to finish in one sitting. */
const ROUND_SIZE = 7
/** Correct answers needed before a card counts as learnt. */
const MASTERY = 2

type Step = "choice" | "typing"

interface QueueItem {
  card: IfaVocabCard
  correct: number
}

export function LearnMode({ cards, direction }: { cards: IfaVocabCard[]; direction: "en-vi" | "vi-en" }) {
  const [seed, setSeed] = useState(() => Date.now())
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [roundPool, setRoundPool] = useState<IfaVocabCard[]>([])
  const [typed, setTyped] = useState("")
  const [verdict, setVerdict] = useState<"right" | "wrong" | null>(null)
  const [mastered, setMastered] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const advanceRef = useRef<number | null>(null)
  const speak = useSpeak()
  const mark = useFlashcard((s) => s.mark)

  // A pending "next question" timer must not fire after unmount.
  useEffect(
    () => () => {
      if (advanceRef.current != null) window.clearTimeout(advanceRef.current)
    },
    []
  )

  // A round pulls the least-known cards first so revision stays useful.
  useEffect(() => {
    const snapshot = useFlashcard.getState().cards
    const weighted = cards.slice().sort((a, b) => {
      const rank = (c: IfaVocabCard) => {
        const s = snapshot[c.id]?.status
        return s === "known" ? 2 : s === "learning" ? 0 : 1
      }
      return rank(a) - rank(b)
    })
    const pool = shuffle(weighted.slice(0, Math.max(ROUND_SIZE * 3, 1)), seededRandom(seed)).slice(
      0,
      ROUND_SIZE
    )
    setRoundPool(pool)
    setQueue(pool.map((card) => ({ card, correct: 0 })))
    setMastered(0)
    setTyped("")
    setVerdict(null)
  }, [cards, seed])

  const head = queue[0]
  const step: Step = head && head.correct === 0 ? "choice" : "typing"

  /* Seeded from the card id, so the memo is pure: React StrictMode re-runs it
     during development and a shared mutable generator would yield a different
     option set on each pass. */
  const options = useMemo(() => {
    if (!head || step !== "choice") return []
    const local = seededRandom(hashId(head.card.id) ^ seed)
    const wrong = distractors(head.card, cards, 3, local)
    return shuffle([head.card, ...wrong], local)
  }, [head, step, cards, seed])

  /** Việt → Anh has several right answers when meanings collide. */
  const acceptable = useMemo(
    () => (head ? (direction === "en-vi" ? [head.card.vi] : synonymTerms(head.card, cards)) : []),
    [head, direction, cards]
  )

  useEffect(() => {
    if (step === "typing" && !verdict) inputRef.current?.focus()
  }, [step, verdict, head])

  /* Side effects must stay OUT of the state updater: StrictMode invokes
     updaters twice, which previously marked the card and bumped the counter
     twice per answer. */
  const advance = useCallback(
    (right: boolean) => {
      const item = queue[0]
      if (!item) return
      if (!right) {
        // Wrong answers lose their streak and go to the back of the round.
        mark(item.card.id, false)
        setQueue((q) => [...q.slice(1), { card: item.card, correct: 0 }])
      } else {
        const correct = item.correct + 1
        if (correct >= MASTERY) {
          mark(item.card.id, true)
          setMastered((n) => n + 1)
          setQueue((q) => q.slice(1))
        } else {
          setQueue((q) => [...q.slice(1), { card: item.card, correct }])
        }
      }
      setTyped("")
      setVerdict(null)
    },
    [queue, mark]
  )

  /** Pause so the green state is visible, then move on. Cleared on unmount. */
  function scheduleAdvance() {
    if (advanceRef.current != null) window.clearTimeout(advanceRef.current)
    advanceRef.current = window.setTimeout(() => {
      advanceRef.current = null
      advance(true)
    }, 550)
  }

  function answerChoice(picked: IfaVocabCard) {
    if (verdict) return
    const right = picked.id === head.card.id
    setVerdict(right ? "right" : "wrong")
    if (right) scheduleAdvance()
  }

  function submitTyping(e: React.FormEvent) {
    e.preventDefault()
    if (verdict || !typed.trim()) return
    const right = acceptable.some((expected) => answersMatch(typed, expected))
    setVerdict(right ? "right" : "wrong")
    if (right) scheduleAdvance()
  }

  if (!cards.length) return <EmptyDeck />

  if (!head) {
    return (
      <Card>
        <CardContent className="flex min-h-[340px] flex-col items-center justify-center gap-5 p-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary-soft">
            <Trophy className="size-7 text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold">Xong một lượt</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Đã nắm {mastered} / {roundPool.length} từ trong lượt này.
            </p>
          </div>
          <Button size="lg" onClick={() => setSeed(Date.now())}>
            <RotateCcw className="size-4" /> Lượt tiếp theo
          </Button>
        </CardContent>
      </Card>
    )
  }

  const prompt = direction === "en-vi" ? head.card.term : head.card.vi
  const answer = direction === "en-vi" ? head.card.vi : head.card.term
  const pct = (mastered / Math.max(roundPool.length, 1)) * 100

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold tabular-nums">
          {mastered}
          <span className="text-muted-foreground"> / {roundPool.length} từ đã nắm</span>
        </span>
        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          {step === "choice" ? "Chọn đáp án" : "Tự gõ"}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {direction === "en-vi" ? "Nghĩa của từ này là gì?" : "Từ tiếng Anh là gì?"}
            </p>
            <p
              className={cn(
                "mt-2 text-[26px] font-bold leading-snug tracking-tight",
                direction === "en-vi" && "content-en"
              )}
            >
              {prompt}
            </p>
            {direction === "en-vi" && ttsSupported() && (
              <button
                type="button"
                onClick={() => speak(speakableTerm(head.card.term))}
                aria-label={`Nghe: ${head.card.term}`}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-input px-3 py-1.5 text-sm transition-colors hover:bg-accent"
              >
                <Volume2 className="size-4" /> Nghe
              </button>
            )}
          </div>

          {step === "choice" ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {options.map((o) => {
                const isAnswer = o.id === head.card.id
                const show = verdict !== null
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => answerChoice(o)}
                    disabled={show}
                    className={cn(
                      "rounded-lg border p-3.5 text-left text-sm font-medium transition-colors",
                      !show && "border-input bg-card hover:border-primary/50 hover:bg-accent",
                      show && isAnswer && "border-emerald-500 bg-emerald-500/10",
                      show && !isAnswer && "border-input opacity-50"
                    )}
                  >
                    <span className={cn(direction === "vi-en" && "content-en")}>
                      {direction === "en-vi" ? o.vi : o.term}
                    </span>
                  </button>
                )
              })}
            </div>
          ) : (
            <form onSubmit={submitTyping} className="space-y-2">
              <Input
                ref={inputRef}
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                disabled={verdict !== null}
                placeholder={direction === "en-vi" ? "Gõ nghĩa tiếng Việt…" : "Gõ từ tiếng Anh…"}
                className={cn(
                  "h-11 text-base",
                  verdict === "right" && "border-emerald-500",
                  verdict === "wrong" && "border-destructive"
                )}
                aria-label="Đáp án của bạn"
              />
              {!verdict && (
                <div className="flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setVerdict("wrong")}
                  >
                    <Lightbulb className="size-4" /> Chưa nhớ, xem đáp án
                  </Button>
                  <Button type="submit" disabled={!typed.trim()}>
                    Kiểm tra
                  </Button>
                </div>
              )}
            </form>
          )}

          {verdict === "wrong" && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4">
              <p className="flex items-center gap-1.5 text-sm font-bold text-destructive">
                <X className="size-4" /> Đáp án đúng
              </p>
              <p className={cn("mt-1.5 text-[17px] font-bold", direction === "vi-en" && "content-en")}>
                {answer}
              </p>
              {head.card.ipa && direction === "vi-en" && (
                <p className="ipa mt-0.5 text-sm text-primary">{head.card.ipa}</p>
              )}
              {acceptable.length > 1 && (
                <p className="content-en mt-1.5 text-xs text-muted-foreground">
                  Cũng đúng: {acceptable.filter((t) => t !== answer).join(" · ")}
                </p>
              )}
              <Button className="mt-3 w-full" onClick={() => advance(false)}>
                <ArrowRight className="size-4" /> Tiếp tục
              </Button>
            </div>
          )}

          {verdict === "right" && (
            <p className="flex items-center justify-center gap-1.5 text-sm font-bold text-emerald-600">
              <Check className="size-4" /> Chính xác
            </p>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Mỗi từ cần trả lời đúng {MASTERY} lần (chọn đáp án rồi tự gõ) mới tính là đã nắm.
      </p>
    </div>
  )
}
