import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { RotateCcw, Timer, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { seededRandom, shuffle } from "@/lib/sample-pool"
import type { IfaVocabCard } from "@/lib/ifa-vocab"
import { useFlashcard } from "@/stores/flashcard"
import { EmptyDeck } from "./EmptyDeck"

const PAIRS = 6

interface Tile {
  key: string
  cardId: string
  text: string
  side: "en" | "vi"
}

function formatMs(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`
}

export function MatchMode({ cards, scopeKey }: { cards: IfaVocabCard[]; scopeKey: string }) {
  const [seed, setSeed] = useState(() => Date.now())
  const [picked, setPicked] = useState<Tile | null>(null)
  const [wrongKeys, setWrongKeys] = useState<string[]>([])
  const [cleared, setCleared] = useState<string[]>([])
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [finishedMs, setFinishedMs] = useState<number | null>(null)
  const tickRef = useRef<number | null>(null)
  const wrongRef = useRef<number | null>(null)

  // Pending timers must not outlive the component.
  useEffect(
    () => () => {
      if (wrongRef.current != null) window.clearTimeout(wrongRef.current)
      if (tickRef.current != null) window.clearInterval(tickRef.current)
    },
    []
  )

  const bestMatch = useFlashcard((s) => s.bestMatch[scopeKey])
  const recordMatch = useFlashcard((s) => s.recordMatch)

  const tiles = useMemo<Tile[]>(() => {
    const rnd = seededRandom(seed)
    const chosen = shuffle(cards, rnd).slice(0, Math.min(PAIRS, cards.length))
    const all: Tile[] = chosen.flatMap((c) => [
      { key: `${c.id}::en`, cardId: c.id, text: c.term, side: "en" as const },
      { key: `${c.id}::vi`, cardId: c.id, text: c.vi, side: "vi" as const },
    ])
    return shuffle(all, rnd)
  }, [cards, seed])

  const pairCount = tiles.length / 2

  // Reset the board whenever a new deal is made.
  useEffect(() => {
    setPicked(null)
    setWrongKeys([])
    setCleared([])
    setStartedAt(null)
    setElapsed(0)
    setFinishedMs(null)
  }, [tiles])

  useEffect(() => {
    if (startedAt == null || finishedMs != null) return
    tickRef.current = window.setInterval(() => setElapsed(Date.now() - startedAt), 100)
    return () => {
      if (tickRef.current != null) window.clearInterval(tickRef.current)
    }
  }, [startedAt, finishedMs])

  const finish = useCallback(
    (ms: number) => {
      setFinishedMs(ms)
      recordMatch(scopeKey, ms)
    },
    [recordMatch, scopeKey]
  )

  function pick(tile: Tile) {
    if (finishedMs != null || cleared.includes(tile.cardId)) return
    const begunAt = startedAt ?? Date.now()
    if (startedAt == null) setStartedAt(begunAt)

    if (!picked) {
      setPicked(tile)
      return
    }
    if (picked.key === tile.key) {
      setPicked(null)
      return
    }

    if (picked.cardId === tile.cardId && picked.side !== tile.side) {
      const next = [...cleared, tile.cardId]
      setCleared(next)
      setPicked(null)
      if (next.length === pairCount) finish(Date.now() - begunAt)
      return
    }

    // Wrong pair: flash both, then clear the selection.
    const keys = [picked.key, tile.key]
    setWrongKeys(keys)
    setPicked(null)
    if (wrongRef.current != null) window.clearTimeout(wrongRef.current)
    wrongRef.current = window.setTimeout(() => {
      wrongRef.current = null
      setWrongKeys([])
    }, 450)
  }

  if (cards.length < 2) {
    return <EmptyDeck title="Cần ít nhất 2 từ" hint="Chọn chủ đề rộng hơn ở cột trái." />
  }

  if (finishedMs != null) {
    const isBest = bestMatch === finishedMs
    return (
      <Card>
        <CardContent className="flex min-h-[340px] flex-col items-center justify-center gap-5 p-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary-soft">
            <Trophy className="size-7 text-primary" />
          </div>
          <div>
            <p className="text-3xl font-bold tabular-nums">{formatMs(finishedMs)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {isBest ? "Kỷ lục mới cho phạm vi này!" : `Kỷ lục: ${formatMs(bestMatch ?? finishedMs)}`}
            </p>
          </div>
          <Button size="lg" onClick={() => setSeed(Date.now())}>
            <RotateCcw className="size-4" /> Chơi lại
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums">
          <Timer className="size-4 text-muted-foreground" />
          {formatMs(startedAt == null ? 0 : elapsed)}
        </span>
        <div className="flex items-center gap-2">
          {bestMatch != null && (
            <span className="text-xs text-muted-foreground">Kỷ lục {formatMs(bestMatch)}</span>
          )}
          <Button variant="ghost" size="sm" onClick={() => setSeed(Date.now())}>
            <RotateCcw className="size-4" /> Ván mới
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {tiles.map((t) => {
          const done = cleared.includes(t.cardId)
          const isPicked = picked?.key === t.key
          const isWrong = wrongKeys.includes(t.key)
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => pick(t)}
              disabled={done}
              className={cn(
                "flex min-h-[80px] items-center justify-center rounded-xl border p-2.5 text-center text-xs font-semibold leading-snug transition-all sm:min-h-[92px] sm:p-3 sm:text-sm",
                t.side === "en" && "content-en",
                done && "pointer-events-none scale-95 border-transparent bg-transparent opacity-0",
                !done && isWrong && "border-destructive bg-destructive/10 text-destructive",
                !done && !isWrong && isPicked && "border-primary bg-primary-soft text-primary",
                !done && !isWrong && !isPicked && "border-input bg-card hover:border-primary/50 hover:bg-accent"
              )}
            >
              {t.text}
            </button>
          )
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Nối {pairCount} cặp từ với nghĩa. Đồng hồ chạy từ lần bấm đầu tiên.
      </p>
    </div>
  )
}
