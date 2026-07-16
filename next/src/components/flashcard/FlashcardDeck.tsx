import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useFlashcard } from "@/stores/flashcard"
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react"

export interface FlashcardItem {
  id: string
  front: React.ReactNode
  back: React.ReactNode
  kind?: string
}

interface Props {
  scope: string
  cards: FlashcardItem[]
}

export function FlashcardDeck({ scope, cards }: Props) {
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const mark = useFlashcard((s) => s.mark)
  const countKnown = useFlashcard((s) => s.countKnown)
  const known = countKnown(scope)

  const cur = cards[idx]

  const flip = useCallback(() => setFlipped((f) => !f), [])
  const gotoNext = useCallback(() => {
    setIdx((i) => (i + 1) % cards.length)
    setFlipped(false)
  }, [cards.length])
  const gotoPrev = useCallback(() => {
    setIdx((i) => (i - 1 + cards.length) % cards.length)
    setFlipped(false)
  }, [cards.length])
  const markBox = useCallback(
    (box: 1 | 2 | 3) => {
      if (!cur) return
      mark(scope, cur.id, box)
      gotoNext()
    },
    [cur, mark, scope, gotoNext]
  )

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement
      if (t && t.matches && t.matches("input,textarea,select")) return
      if (e.code === "Space") {
        e.preventDefault()
        flip()
      } else if (e.key === "ArrowLeft") gotoPrev()
      else if (e.key === "ArrowRight") gotoNext()
      else if (e.key === "1") markBox(1)
      else if (e.key === "2") markBox(2)
      else if (e.key === "3") markBox(3)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [flip, gotoNext, gotoPrev, markBox])

  const progressText = useMemo(
    () =>
      `Thẻ ${idx + 1}/${cards.length} · ${known} đã thuộc`,
    [idx, cards.length, known]
  )

  if (!cards.length)
    return <div className="rounded-lg border border-dashed border-border p-6 text-center text-muted-foreground">Chưa có material cho flashcard.</div>

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">{progressText}</div>
      <Card
        role="button"
        tabIndex={0}
        onClick={flip}
        className="p-8 min-h-[220px] flex items-center justify-center cursor-pointer hover:border-primary/40 transition-colors"
      >
        <div className="text-center max-w-2xl">
          {flipped ? cur.back : cur.front}
        </div>
      </Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <Button variant="outline" onClick={gotoPrev}>
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <Button onClick={flip}>
            <RotateCw className="h-4 w-4" /> Lật (Space)
          </Button>
          <Button variant="outline" onClick={gotoNext}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => markBox(1)}>
            Học lại (1)
          </Button>
          <Button variant="outline" size="sm" onClick={() => markBox(2)}>
            Còn khó (2)
          </Button>
          <Button size="sm" onClick={() => markBox(3)}>
            Đã thuộc (3)
          </Button>
        </div>
      </div>
    </div>
  )
}
