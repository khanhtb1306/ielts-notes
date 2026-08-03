import { useMemo, useRef, useState } from "react"
import { Volume2, VolumeX, ChevronDown, Lightbulb, Quote } from "lucide-react"
import { displayLabel } from "@/lib/topic-label"
import type { SpeakingQuestion, TopicLabel } from "@/types/content"

const APP_BASE = (import.meta.env.BASE_URL || "/").replace(/\/?$/, "/")
const AUDIO_DIR = "final/google-doc-pre-course/audio"

function audioHref(file: string) {
  const path = `${AUDIO_DIR}/${file}`
  return `${APP_BASE}${path.split("/").map(encodeURIComponent).join("/")}`
}

interface Props {
  questions: Record<string, SpeakingQuestion[]>
  topicLabels: Record<string, TopicLabel>
}

export function SpeakingDrill({ questions, topicLabels }: Props) {
  const topicKeys = useMemo(() => Object.keys(questions), [questions])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  if (topicKeys.length === 0) return null

  function play(file: string) {
    const el = audioRef.current
    if (!el) return
    el.src = audioHref(file)
    el.currentTime = 0
    void el.play().catch(() => {})
  }

  return (
    <div className="searchable space-y-5">
      <audio ref={audioRef} className="hidden" preload="none" />

      <div>
        <h2 className="text-2xl font-bold">Bộ câu hỏi Speaking cuối khóa</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Nghe câu hỏi bằng nút loa, tự trả lời trước, rồi mở đáp án mẫu để so sánh. Học theo{" "}
          <b>khung trả lời</b> — đừng học thuộc cả đoạn.
        </p>
      </div>

      {/* All topics stacked */}
      <div className="space-y-8">
        {topicKeys.map((key) => {
          const list = questions[key] ?? []
          const withAudio = list.filter((q) => q.audioFile).length
          return (
            <section key={key} id={`speak-${key}`} className="scroll-mt-28 space-y-3">
              <div className="flex items-baseline justify-between border-b border-border pb-1">
                <h3 className="text-lg font-bold text-primary">
                  {displayLabel(topicLabels[key], key)}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {list.length} câu · {withAudio} có audio
                </span>
              </div>
              {list.map((q, i) => (
                <QuestionCard key={i} q={q} index={i + 1} onPlay={play} />
              ))}
            </section>
          )
        })}
      </div>
    </div>
  )
}

function QuestionCard({ q, index, onPlay }: { q: SpeakingQuestion; index: number; onPlay: (file: string) => void }) {
  const [open, setOpen] = useState(false)
  const hasAudio = Boolean(q.audioFile)

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-3 p-4">
        <button
          type="button"
          disabled={!hasAudio}
          onClick={() => hasAudio && onPlay(q.audioFile!)}
          title={hasAudio ? "Nghe câu hỏi" : "Chưa có audio cho câu này"}
          className={
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors " +
            (hasAudio
              ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
              : "border-border bg-muted/40 text-muted-foreground/50 cursor-not-allowed")
          }
        >
          {hasAudio ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex flex-1 items-center gap-2 text-left"
        >
          <span className="flex-1 font-semibold leading-snug">
            {open ? q.q : `Question ${index}`}
          </span>
          <ChevronDown
            className={"h-4 w-4 shrink-0 text-muted-foreground transition-transform " + (open ? "rotate-180" : "")}
          />
        </button>
      </div>

      {open && (
        <div className="space-y-4 border-t border-border bg-muted/20 px-4 py-4">
          {q.subQuestions && q.subQuestions.length > 0 && (
            <ul className="space-y-1 border-l-2 border-primary/30 pl-3 text-sm text-muted-foreground">
              {q.subQuestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          )}

          {q.answerFrames && q.answerFrames.length > 0 && (
            <div>
              <div className="mb-1 text-xs font-bold uppercase tracking-wide text-primary">Khung trả lời</div>
              <ul className="space-y-1 text-sm">
                {q.answerFrames.map((f, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {q.tip && (
            <div className="flex gap-2 rounded-lg border border-amber-300/40 bg-amber-100/40 p-3 text-sm dark:border-amber-500/30 dark:bg-amber-500/10">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <span className="font-semibold">Tip: </span>
                {q.tip}
              </div>
            </div>
          )}

          {q.sampleAnswer && (
            <div className="flex gap-2 rounded-lg border border-border bg-card p-3 text-sm">
              <Quote className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <span className="font-semibold">Bài mẫu: </span>
                <span className="italic">{q.sampleAnswer}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
