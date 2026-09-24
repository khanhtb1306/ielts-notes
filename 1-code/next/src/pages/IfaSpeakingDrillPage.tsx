import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { Shuffle, Volume2, ArrowLeft, RotateCcw, Timer, Pause, Play } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ttsSupported } from "@/lib/tts"
import { useSpeak } from "@/lib/use-speak"
import { ifaSpeakingDrills } from "@/lib/ifa-speaking"
import {
  SpeakingRail,
  RailSection,
  RailProgress,
  RailSelect,
  RailVoice,
} from "@/components/ifa/SpeakingRail"
import type { RailSelectOption } from "@/components/ifa/SpeakingRail"
import { VariantTabs } from "@/components/ifa/VariantTabs"
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
  const lessonOptions = useMemo<RailSelectOption[]>(
    () => ifaSpeakingDrills.map((l) => ({ value: l.id, label: l.title })),
    []
  )
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
    <div data-toc-skip>
      {/* TopBar already renders the page title — controls go straight into the rail. */}
      <div className="lg:flex lg:items-start lg:gap-6 2xl:gap-8">
        <SpeakingRail>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="h-9 flex-1 justify-center">
              <Link to="/speaking-ifa">
                <ArrowLeft className="size-4" /> Khung trả lời
              </Link>
            </Button>
            <RailVoice />
          </div>

          <RailSection title="Bài học">
            {/* Dropdown keeps the rail a fixed height as more lessons ship. */}
            <RailSelect id="ifa-drill-lesson" value={lessonId} options={lessonOptions} onChange={selectLesson} />
          </RailSection>

          <RailSection title="Đếm giờ">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={timerOn ? "secondary" : "outline"}
                size="sm"
                onClick={() => setTimerOn((v) => !v)}
              >
                <Timer className="size-4" /> {timerOn ? "Bật" : "Tắt"}
              </Button>
              {current && timerOn && (phase === "prep" || phase === "speaking") && (
                <Button variant="ghost" size="sm" onClick={() => setPhase("done")}>
                  <Pause className="size-4" /> Dừng
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
          </RailSection>

          {current && (
            <>
              <RailProgress done={answered} total={total} label="câu" />
              <Button variant="ghost" size="sm" className="w-full" onClick={restart}>
                <RotateCcw className="size-4" /> Xáo lại từ đầu
              </Button>
            </>
          )}
        </SpeakingRail>

        <div className="mt-5 min-w-0 flex-1 space-y-4 lg:mt-0">
          {/* Audience splits become tabs here instead of extra rail entries. */}
          {lesson && (
            <VariantTabs
              labels={lesson.variants.map((v) =>
                v.audience ? (AUDIENCE_LABEL[v.audience] ?? v.audience) : "Chung"
              )}
              active={variantIdx}
              onSelect={(i) => {
                setVariantIdx(i)
                resetSession()
              }}
            />
          )}
          <Card>
            <CardContent className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-8 text-center">
              {current ? (
                <>
                  <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-primary">
                    {current.topic}
                  </span>
                  <p className="content-en max-w-3xl text-[26px] font-bold leading-snug tracking-tight lg:text-[34px]">
                    {current.text}
                  </p>

                  {timerOn && (
                    <div className="w-full max-w-sm">
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
                    <Button size="lg" onClick={next}>
                      <Shuffle className="size-4" /> Câu tiếp theo
                    </Button>
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
        </div>
      </div>
    </div>
  )
}
