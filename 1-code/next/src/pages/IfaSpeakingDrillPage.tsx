import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { Shuffle, Volume2, ArrowLeft, RotateCcw, Timer, Pause, Play } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ttsSupported } from "@/lib/tts"
import { useSpeak } from "@/lib/use-speak"
import { ifaSpeakingDrills } from "@/lib/ifa-speaking"
import { VoicePicker } from "@/components/common/VoicePicker"
import type { IfaDrillItem } from "@/types/content"

/** IELTS Part 1 pacing: a short beat to think, then ~30s to answer. */
const PREP_SECONDS = 5
const SPEAK_SECONDS = 30

const AUDIENCE_LABEL: Record<string, string> = {
  highschool: "Học sinh",
  university: "Sinh viên",
  working: "Người đi làm",
}

type Phase = "idle" | "prep" | "speaking" | "done"

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5">
      <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
        {n}
      </span>
      {children}
    </li>
  )
}

function shuffled(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function IfaSpeakingDrillPage() {
  const [lessonId, setLessonId] = useState(ifaSpeakingDrills[0]?.id ?? "")
  const [variantIdx, setVariantIdx] = useState(0)
  const [queue, setQueue] = useState<number[]>([])
  const [current, setCurrent] = useState<IfaDrillItem | null>(null)
  const [answered, setAnswered] = useState(0)
  const [timerOn, setTimerOn] = useState(true)
  const [phase, setPhase] = useState<Phase>("idle")
  const [remaining, setRemaining] = useState(0)
  const tickRef = useRef<number | null>(null)
  const speak = useSpeak()

  const lesson = useMemo(() => ifaSpeakingDrills.find((l) => l.id === lessonId), [lessonId])
  const variant = lesson?.variants[variantIdx]
  const items = useMemo(() => variant?.items ?? [], [variant])
  const total = items.length

  const clearTick = useCallback(() => {
    if (tickRef.current != null) {
      window.clearInterval(tickRef.current)
      tickRef.current = null
    }
  }, [])

  useEffect(() => clearTick, [clearTick])

  // Drive the prep -> speaking countdown.
  useEffect(() => {
    clearTick()
    if (!timerOn || (phase !== "prep" && phase !== "speaking")) return
    tickRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r > 1) return r - 1
        setPhase((p) => {
          if (p === "prep") {
            setRemaining(SPEAK_SECONDS)
            return "speaking"
          }
          return "done"
        })
        return 0
      })
    }, 1000)
    return clearTick
  }, [phase, timerOn, clearTick])

  const showQuestion = useCallback(
    (item: IfaDrillItem) => {
      setCurrent(item)
      if (timerOn) {
        setPhase("prep")
        setRemaining(PREP_SECONDS)
      } else {
        setPhase("idle")
        setRemaining(0)
      }
    },
    [timerOn]
  )

  const restart = useCallback(() => {
    const q = shuffled(total)
    const [first, ...rest] = q
    setQueue(rest)
    setAnswered(total ? 1 : 0)
    if (total) showQuestion(items[first])
    else setCurrent(null)
  }, [total, items, showQuestion])

  const next = useCallback(() => {
    if (!total) return
    if (!queue.length) {
      restart()
      return
    }
    const [idx, ...rest] = queue
    setQueue(rest)
    setAnswered((n) => n + 1)
    showQuestion(items[idx])
  }, [queue, total, items, restart, showQuestion])

  function resetSession() {
    clearTick()
    setQueue([])
    setCurrent(null)
    setAnswered(0)
    setPhase("idle")
    setRemaining(0)
  }

  function selectLesson(id: string) {
    setLessonId(id)
    setVariantIdx(0)
    resetSession()
  }

  if (!ifaSpeakingDrills.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <h2 className="text-xl font-semibold">Chưa có ngân hàng câu hỏi</h2>
        <p className="mt-2 text-muted-foreground">Chạy lại preprocess sau khi thêm dữ liệu.</p>
      </div>
    )
  }

  const phaseLabel = phase === "prep" ? "Chuẩn bị" : phase === "speaking" ? "Đang nói" : "Hết giờ"
  const ringPct =
    phase === "prep"
      ? (remaining / PREP_SECONDS) * 100
      : phase === "speaking"
        ? (remaining / SPEAK_SECONDS) * 100
        : 0

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
              IELTS Foundation A · Speaking
            </div>
            <h2 className="mt-1.5 flex items-center gap-2 text-2xl font-bold tracking-tight">
              <Shuffle className="size-6 text-primary" /> Luyện phản xạ
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Nhận câu hỏi ngẫu nhiên, {PREP_SECONDS}s nghĩ rồi nói trong {SPEAK_SECONDS}s — mô phỏng nhịp Part 1.
            </p>
          </div>
          <Button asChild variant="outline" className="shrink-0">
            <Link to="/speaking-ifa">
              <ArrowLeft className="size-4" /> Khung trả lời
            </Link>
          </Button>
        </div>
        <div className="mt-4 border-t border-border pt-3">
          <VoicePicker />
        </div>
      </div>

      {/* Lesson picker */}
      <div className="flex flex-wrap gap-2">
        {ifaSpeakingDrills.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => selectLesson(l.id)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
              l.id === lessonId
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background hover:bg-accent"
            )}
          >
            {l.title}
          </button>
        ))}
      </div>

      {/* Audience variants (lesson 4) */}
      {lesson && lesson.variants.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Đối tượng</span>
          {lesson.variants.map((v, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setVariantIdx(i)
                resetSession()
              }}
              className={cn(
                "rounded-full border px-3 py-1 text-sm transition-colors",
                i === variantIdx
                  ? "border-primary bg-primary/10 font-semibold text-primary"
                  : "border-border hover:bg-accent"
              )}
            >
              {v.audience ? (AUDIENCE_LABEL[v.audience] ?? v.audience) : "Chung"}
            </button>
          ))}
        </div>
      )}

      {/* Timer toggle */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant={timerOn ? "secondary" : "outline"} size="sm" onClick={() => setTimerOn((v) => !v)}>
          <Timer className="size-4" /> Đếm giờ: {timerOn ? "Bật" : "Tắt"}
        </Button>
        {current && timerOn && (phase === "prep" || phase === "speaking") && (
          <Button variant="ghost" size="sm" onClick={() => setPhase("done")}>
            <Pause className="size-4" /> Dừng giờ
          </Button>
        )}
        {current && timerOn && phase === "done" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setPhase("speaking")
              setRemaining(SPEAK_SECONDS)
            }}
          >
            <Play className="size-4" /> Nói lại
          </Button>
        )}
      </div>

      {/* Stage */}
      <Card>
        <CardContent className="flex min-h-[300px] flex-col items-center justify-center gap-5 p-8 text-center">
          {current ? (
            <>
              <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-primary">
                {current.topic}
              </span>
              <p className="content-en max-w-2xl text-[26px] font-bold leading-snug tracking-tight">
                {current.text}
              </p>

              {timerOn && (
                <div className="w-full max-w-xs">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span
                      className={cn(
                        phase === "prep" && "text-amber-600",
                        phase === "speaking" && "text-emerald-600",
                        phase === "done" && "text-muted-foreground"
                      )}
                    >
                      {phaseLabel}
                    </span>
                    <span className="tabular-nums text-muted-foreground">{remaining}s</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full transition-[width] duration-1000 ease-linear",
                        phase === "prep" ? "bg-amber-500" : phase === "speaking" ? "bg-emerald-500" : "bg-muted-foreground/40"
                      )}
                      style={{ width: `${ringPct}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-2">
                {ttsSupported() && (
                  <Button variant="outline" onClick={() => speak(current.text)}>
                    <Volume2 className="size-4" /> Nghe câu hỏi
                  </Button>
                )}
                <Button onClick={next}>
                  <Shuffle className="size-4" /> Câu tiếp theo
                </Button>
              </div>

              <div className="w-full max-w-xs">
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary transition-all" style={{ width: `${(answered / total) * 100}%` }} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {answered} / {total} câu
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex size-14 items-center justify-center rounded-full bg-primary-soft">
                <Shuffle className="size-7 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold">{lesson?.title ?? "Luyện phản xạ"}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {total} câu hỏi · xáo ngẫu nhiên, không lặp
                </p>
              </div>
              <ol className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
                <Step n={1}>Đọc câu hỏi</Step>
                <Step n={2}>{PREP_SECONDS}s nghĩ ý</Step>
                <Step n={3}>{SPEAK_SECONDS}s nói thành tiếng</Step>
              </ol>
              <Button size="lg" onClick={restart} disabled={!total}>
                <Shuffle className="size-4" /> Bắt đầu
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {current && (
        <div className="text-center">
          <Button variant="ghost" size="sm" onClick={restart}>
            <RotateCcw className="size-4" /> Xáo lại từ đầu
          </Button>
        </div>
      )}
    </div>
  )
}
