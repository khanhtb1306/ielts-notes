import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Shuffle, Volume2, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ttsSupported } from "@/lib/tts"
import { useSpeak } from "@/lib/use-speak"
import { ifaSpeakingHandouts, getHandout, handoutsByLesson } from "@/lib/ifa-speaking"
import { useIfaSpeaking } from "@/stores/ifa-speaking"
import { SpeakingQuestionCard } from "@/components/ifa/SpeakingQuestionCard"
import { VoicePicker } from "@/components/common/VoicePicker"

export function IfaSpeakingPage() {
  const grouped = useMemo(() => handoutsByLesson(), [])
  const [handoutId, setHandoutId] = useState(ifaSpeakingHandouts[0]?.id ?? "")
  const [questionIndex, setQuestionIndex] = useState(0)

  const handout = getHandout(handoutId)
  const savedList = useIfaSpeaking((s) => s.answers)
  const clearHandout = useIfaSpeaking((s) => s.clearHandout)
  const speak = useSpeak()

  const saved = useMemo(
    () => Object.values(savedList).filter((a) => a.handoutId === handoutId).sort((x, y) => x.questionIndex - y.questionIndex),
    [savedList, handoutId]
  )
  const savedIndexes = useMemo(() => new Set(saved.map((a) => a.questionIndex)), [saved])

  function selectHandout(id: string) {
    setHandoutId(id)
    setQuestionIndex(0)
  }

  if (!ifaSpeakingHandouts.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <h2 className="text-xl font-semibold">Chưa có dữ liệu Speaking IFA</h2>
        <p className="mt-2 text-muted-foreground">Chạy lại preprocess sau khi thêm handout.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
              IELTS Foundation A · Speaking Part 1
            </div>
            <h2 className="mt-1.5 text-2xl font-bold tracking-tight">Khung trả lời theo chủ đề</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Chọn khung câu, bấm cụm từ để ghép thành câu trả lời hoàn chỉnh, nghe phát âm và lưu lại bài làm.
            </p>
          </div>
          <Button asChild variant="outline" className="shrink-0">
            <Link to="/speaking-ifa/drill">
              <Shuffle className="size-4" /> Luyện phản xạ
            </Link>
          </Button>
        </div>
        <div className="mt-4 border-t border-border pt-3">
          <VoicePicker />
        </div>
      </div>

      {/* Handout picker — label on its own row on mobile so wrapped chips stay grouped. */}
      <div className="space-y-3">
        {grouped.map(({ lesson, handouts }) => (
          <div key={lesson ?? "misc"} className="sm:flex sm:items-start sm:gap-2">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground sm:mb-0 sm:w-20 sm:shrink-0 sm:pt-2">
              {lesson != null ? `Lesson ${lesson}` : "Khác"}
            </span>
            <div className="flex flex-wrap gap-2">
            {handouts.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => selectHandout(h.id)}
                className={cn(
                  "rounded-lg border px-3.5 py-2 text-sm font-semibold transition-colors",
                  h.id === handoutId
                    ? "border-primary bg-primary text-primary-foreground shadow-card"
                    : "border-input bg-card hover:border-primary/50 hover:bg-accent"
                )}
              >
                {h.topicLabel}
                {h.audienceLabel && <span className="ml-1.5 text-xs font-normal opacity-80">({h.audienceLabel})</span>}
              </button>
            ))}
            </div>
          </div>
        ))}
      </div>

      {handout && (
        <>
          {/* Context + progress */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-lg font-bold tracking-tight">
                  {handout.topicLabel}
                  {handout.audienceLabel && (
                    <span className="ml-1.5 text-sm font-normal text-muted-foreground">
                      ({handout.audienceLabel})
                    </span>
                  )}
                </p>
                {handout.grammarFocus && (
                  <p className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-primary-soft px-2 py-1 text-xs font-semibold text-primary">
                    Trọng tâm: {handout.grammarFocus}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xl font-bold tabular-nums text-primary">
                  {saved.length}
                  <span className="text-sm font-medium text-muted-foreground">/{handout.questions.length}</span>
                </p>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">đã lưu</p>
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(saved.length / Math.max(handout.questions.length, 1)) * 100}%` }}
              />
            </div>
          </div>

          {/* Question tabs — a dot marks questions with a saved answer. */}
          <div className="flex flex-wrap gap-2">
            {handout.questions.map((_q, i) => {
              const isSaved = savedIndexes.has(i)
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setQuestionIndex(i)}
                  aria-current={i === questionIndex ? "true" : undefined}
                  title={isSaved ? `Câu ${i + 1} — đã lưu` : `Câu ${i + 1}`}
                  className={cn(
                    "relative flex size-9 items-center justify-center rounded-lg border text-sm font-bold tabular-nums transition-colors",
                    i === questionIndex
                      ? "border-primary bg-primary text-primary-foreground shadow-card"
                      : "border-input bg-card hover:border-primary/50 hover:bg-accent",
                    isSaved && i !== questionIndex && "border-emerald-500/50 text-emerald-700 dark:text-emerald-400"
                  )}
                >
                  {i + 1}
                  {isSaved && (
                    <span
                      className="absolute -right-1 -top-1 size-2.5 rounded-full border-2 border-card bg-emerald-500"
                      aria-hidden
                    />
                  )}
                </button>
              )
            })}
          </div>

          {handout.questions[questionIndex] && (
            <SpeakingQuestionCard
              key={`${handoutId}-${questionIndex}`}
              handoutId={handoutId}
              questionIndex={questionIndex}
              question={handout.questions[questionIndex]}
            />
          )}

          {/* Saved answers */}
          {saved.length > 0 && (
            <Card>
              <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
                <CardTitle className="text-base">Bài làm của tôi — {handout.topicLabel}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => clearHandout(handoutId)}>
                  <Trash2 className="size-4" /> Xóa hết
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {saved.map((a) => (
                  <div key={a.questionIndex} className="rounded-lg border border-border bg-muted/30 p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="content-en text-sm font-bold text-muted-foreground">{a.title}</p>
                      {ttsSupported() && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          aria-label="Đọc câu trả lời"
                          onClick={() => speak(a.answer)}
                        >
                          <Volume2 className="size-4" />
                        </Button>
                      )}
                    </div>
                    <p className="content-en mt-1.5 text-[15px] leading-relaxed">{a.answer}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
