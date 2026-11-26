import { useEffect, useMemo, useRef, useState } from "react"
import { Check, CheckCircle2, ChevronDown, Circle, ClipboardCopy, ClipboardPaste, Clock3, Database, Eye, EyeOff, Headphones, Lightbulb, Mic, Play, Quote, RotateCcw, Square, Volume2, X } from "lucide-react"
import { useSpeak } from "@/lib/use-speak"
import { ttsSupported } from "@/lib/tts"
import { diffWords, tokenize } from "@/lib/speech-diff"
import { ifaFinalTopics, allFinalQuestions } from "@/lib/ifa-final-speaking"
import { useIfaFinalSpeaking } from "@/stores/ifa-final-speaking"
import type { FinalConfidence } from "@/stores/ifa-final-speaking"
import { useUnlock } from "@/stores/unlock"
import { ifaSpeakingAnswers } from "@/content/ifa-speaking-answers"
import { SpeakingTabs } from "@/components/ifa/SpeakingTabs"
import { AutoPractice } from "@/components/ifa/AutoPractice"
import type { IfaFinalQuestion, IfaFinalTopic } from "@/types/content"

const STATUS_META: Record<FinalConfidence, { label: string; Icon: typeof Circle; cls: string }> = {
  new: { label: "Chưa học", Icon: Circle, cls: "border-border bg-card text-muted-foreground hover:bg-accent" },
  learning: { label: "Cần luyện", Icon: Clock3, cls: "border-amber-400/60 bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" },
  confident: { label: "Đã tự tin", Icon: CheckCircle2, cls: "border-emerald-400/60 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
}
const NEXT_STATUS: Record<FinalConfidence, FinalConfidence> = { new: "learning", learning: "confident", confident: "new" }

/** Answer shown as "mine": the saved edit wins; the private set only surfaces when unlocked. */
function resolveAnswer(id: string, saved: string | undefined, unlocked: boolean) {
  const own = (saved ?? "").trim()
  if (own) return saved as string
  return unlocked ? (ifaSpeakingAnswers[id] ?? "") : ""
}

function formatTime(total: number) {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

/**
 * Nối 2 đoạn text, tự cắt phần chồng lấn ở mối nối (Chrome đôi khi nhận lại
 * vài từ cuối khi tự restart).
 */
function joinNoOverlap(base: string, next: string) {
  if (!base) return next
  if (!next) return base
  const key = (s: string) => s.toLowerCase().replace(/[^a-z0-9']+/g, "")
  const a = base.split(/\s+/)
  const b = next.split(/\s+/)
  const max = Math.min(8, a.length, b.length)
  for (let k = max; k > 0; k--) {
    const tail = a.slice(a.length - k).map(key).join(" ")
    const head = b.slice(0, k).map(key).join(" ")
    if (tail && tail === head) return [...a, ...b.slice(k)].join(" ")
  }
  return `${base} ${next}`
}

interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives?: number
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorLike) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}
interface SpeechRecognitionResultLike { transcript: string }
interface SpeechRecognitionResultItemLike extends ArrayLike<SpeechRecognitionResultLike> { isFinal: boolean }
interface SpeechRecognitionEventLike { results: ArrayLike<SpeechRecognitionResultItemLike>; resultIndex: number }
interface SpeechRecognitionErrorLike { error?: string }
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

/**
 * IFA speaking shadowing practice, modelled on the pre-IELTS SpeakingDrill:
 * the learner prepares their own answer per question (the target), then recites
 * it and gets a word-level accuracy score. Mic + eye FABs mirror the pre screen.
 */
export function IfaSpeakingPracticePage() {
  const [selectedByTopic, setSelectedByTopic] = useState<Record<string, number>>({})
  const [showQuestionText, setShowQuestionText] = useState(false)
  const [autoOpen, setAutoOpen] = useState(false)
  const [manageOpen, setManageOpen] = useState(false)
  const progress = useIfaFinalSpeaking((s) => s.progress)
  const unlocked = useUnlock((s) => s.unlocked)

  const topics = useMemo(() => ifaFinalTopics.filter((t) => t.questions.length > 0), [])

  // ── Recorder (lifted) ──────────────────────────────────────────────
  const [recorderOpen, setRecorderOpen] = useState(false)
  const [activeQ, setActiveQ] = useState<IfaFinalQuestion | null>(null)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [interim, setInterim] = useState("")
  const [recorderError, setRecorderError] = useState("")
  const [elapsed, setElapsed] = useState(0)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const isListeningRef = useRef(false)
  const baseTextRef = useRef("")
  const transcriptRef = useRef("")
  const restartTimerRef = useRef<number | null>(null)

  const activeTarget = activeQ ? resolveAnswer(activeQ.id, progress[activeQ.id]?.answer, unlocked) : ""
  const spoken = (transcript + " " + interim).trim()
  const recDiff = spoken && activeTarget ? diffWords(activeTarget, spoken) : null
  const spokenWordCount = tokenize(spoken).length
  const wpm = elapsed >= 3 ? Math.round((spokenWordCount / elapsed) * 60) : 0

  useEffect(() => {
    return () => {
      isListeningRef.current = false
      if (restartTimerRef.current) window.clearTimeout(restartTimerRef.current)
      destroyRecognition(recognitionRef.current)
      recognitionRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!listening) return
    const id = window.setInterval(() => setElapsed((v) => v + 1), 1000)
    return () => window.clearInterval(id)
  }, [listening])

  function recErrorMessage(code?: string) {
    switch (code) {
      case "not-allowed": case "service-not-allowed":
        return "Cần quyền micro. Bấm ổ khoá trên thanh địa chỉ → Microphone → Allow."
      case "audio-capture": return "Không tìm thấy micro."
      case "network": return "Cần mạng để nhận diện giọng nói."
      default: return ""
    }
  }

  function destroyRecognition(r: SpeechRecognitionLike | null) {
    if (!r) return
    r.onresult = null
    r.onerror = null
    r.onend = null
    r.onstart = null
    try { r.abort() } catch { /* ignore */ }
  }

  function recCreateAndStart() {
    const win = window as Window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }
    const Ctor = win.SpeechRecognition || win.webkitSpeechRecognition
    if (!Ctor) {
      setRecorderError("Trình duyệt chưa hỗ trợ. Hãy dùng Chrome hoặc Edge.")
      isListeningRef.current = false
      setListening(false)
      return
    }
    const r = new Ctor()
    r.lang = "en-GB"
    r.continuous = true
    r.interimResults = true
    r.maxAlternatives = 1

    r.onresult = (event) => {
      if (recognitionRef.current !== r) return
      let finalText = ""
      let pending = ""
      for (let i = 0; i < event.results.length; i++) {
        const res = event.results[i]
        const chunk = (res[0]?.transcript ?? "").trim()
        if (!chunk) continue
        if (res.isFinal) finalText += (finalText ? " " : "") + chunk
        else pending += (pending ? " " : "") + chunk
      }
      const merged = joinNoOverlap(baseTextRef.current, finalText)
      transcriptRef.current = merged
      setTranscript(merged)
      setInterim(pending)
    }

    r.onerror = (event) => {
      if (recognitionRef.current !== r) return
      const msg = recErrorMessage(event.error)
      if (msg) {
        isListeningRef.current = false
        setListening(false)
        setRecorderError(msg)
      }
    }

    r.onstart = null

    r.onend = () => {
      if (recognitionRef.current !== r) return
      setInterim("")
      if (!isListeningRef.current) {
        setListening(false)
        return
      }
      baseTextRef.current = transcriptRef.current
      recognitionRef.current = null
      destroyRecognition(r)
      if (restartTimerRef.current) window.clearTimeout(restartTimerRef.current)
      restartTimerRef.current = window.setTimeout(() => {
        restartTimerRef.current = null
        if (isListeningRef.current) recCreateAndStart()
      }, 150)
    }

    recognitionRef.current = r
    try { r.start() } catch { /* already running */ }
  }

  function recStop() {
    isListeningRef.current = false
    if (restartTimerRef.current) {
      window.clearTimeout(restartTimerRef.current)
      restartTimerRef.current = null
    }
    const r = recognitionRef.current
    recognitionRef.current = null
    destroyRecognition(r)
    setInterim("")
    setListening(false)
  }

  function recStartFor(q: IfaFinalQuestion) {
    const win = window as Window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }
    if (!win.SpeechRecognition && !win.webkitSpeechRecognition) {
      setRecorderError("Trình duyệt chưa hỗ trợ. Hãy dùng Chrome hoặc Edge.")
      return
    }
    recStop()
    window.speechSynthesis?.cancel()
    baseTextRef.current = ""
    transcriptRef.current = ""
    setTranscript("")
    setInterim("")
    setElapsed(0)
    setRecorderError("")
    setActiveQ(q)
    isListeningRef.current = true
    setListening(true)
    recCreateAndStart()
  }

  function recClear() {
    baseTextRef.current = ""
    transcriptRef.current = ""
    setTranscript("")
    setInterim("")
    setElapsed(0)
    setRecorderError("")
    if (isListeningRef.current) {
      const r = recognitionRef.current
      recognitionRef.current = null
      destroyRecognition(r)
      recCreateAndStart()
    }
  }

  /** Chọn câu (từ list hoặc panel): nếu recorder đang mở thì ghi âm luôn, không thì chỉ chọn. */
  function pickQuestion(q: IfaFinalQuestion) {
    if (recorderOpen) {
      recStartFor(q)
      return
    }
    recStop()
    if (activeQ?.id !== q.id) {
      baseTextRef.current = ""
      transcriptRef.current = ""
      setTranscript("")
      setInterim("")
      setElapsed(0)
      setRecorderError("")
      setActiveQ(q)
    }
  }

  if (!topics.length) return <p>Chưa có danh sách câu hỏi Speaking IFA.</p>

  return (
    <div data-toc-skip>
      <SpeakingTabs />

      <p className="mb-4 text-sm font-semibold text-muted-foreground">{allFinalQuestions.length} câu · {topics.length} chủ đề</p>

      <div className="searchable space-y-5">
        {topics.map((topic) => (
          <TopicSection
            key={topic.id}
            topic={topic}
            progress={progress}
            unlocked={unlocked}
            showQuestionText={showQuestionText}
            selectedIndex={selectedByTopic[topic.id]}
            onSelect={(i, q) => { setSelectedByTopic((prev) => ({ ...prev, [topic.id]: i })); pickQuestion(q) }}
            onBack={() => setSelectedByTopic((prev) => {
              const next = { ...prev }
              delete next[topic.id]
              return next
            })}
          />
        ))}
      </div>

      {/* ── Recorder panel ── */}
      {recorderOpen && (
        <div className="fixed bottom-[13.5rem] right-6 z-40 flex w-80 flex-col rounded-2xl border border-border bg-card shadow-2xl md:bottom-44">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            {listening ? (
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute h-full w-full animate-ping rounded-full bg-destructive/60" />
                <span className="h-2 w-2 rounded-full bg-destructive" />
              </span>
            ) : (
              <Mic className="h-4 w-4 shrink-0 text-primary" />
            )}
            <span className="min-w-0 flex-1 truncate text-xs font-semibold text-foreground">
              {activeQ ? activeQ.q : "Chọn câu hỏi để ghi âm"}
            </span>
            {listening && <span className="shrink-0 text-[11px] font-semibold text-destructive">{formatTime(elapsed)}</span>}
            {!listening && elapsed > 0 && <span className="shrink-0 text-[11px] text-muted-foreground">{formatTime(elapsed)}{wpm > 0 ? ` · ${wpm}w/p` : ""}</span>}
            {listening ? (
              <button type="button" onClick={recStop} title="Dừng ghi âm" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive text-destructive-foreground hover:opacity-85">
                <Square className="h-3 w-3" />
              </button>
            ) : (
              <button type="button" onClick={() => activeQ && recStartFor(activeQ)} disabled={!activeQ} title="Bắt đầu ghi âm" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-85 disabled:opacity-40">
                <Play className="h-3 w-3" />
              </button>
            )}
            <button type="button" onClick={recClear} title="Xoá text" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-primary">
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => { recStop(); setRecorderOpen(false) }} title="Đóng" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-2 p-3">
            <div className="min-h-12 whitespace-pre-wrap rounded-lg bg-muted/30 px-2.5 py-2 text-xs leading-relaxed">
              {transcript || interim ? (
                <><span>{transcript}</span>{interim && <span className="italic text-muted-foreground">{transcript ? " " : ""}{interim}</span>}</>
              ) : (
                <span className="text-muted-foreground">
                  {listening ? "Đang nghe… đọc câu trả lời của bạn." : "Chọn câu hỏi bên trên rồi bấm ▶ để ghi âm."}
                </span>
              )}
            </div>

            {activeQ && !activeTarget && (
              <p className="text-[11px] text-muted-foreground">Câu này chưa có câu trả lời của bạn nên chưa chấm được độ khớp. Soạn câu trả lời trước nhé.</p>
            )}

            {recDiff && recDiff.total > 0 && (
              <div className="rounded-lg border border-border bg-background/70 p-2">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <span className={"rounded-full px-2 py-0.5 text-[11px] font-bold " + (recDiff.accuracy >= 85 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : recDiff.accuracy >= 60 ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" : "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300")}>
                    {recDiff.accuracy}%
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {recDiff.matched}/{recDiff.total}{recDiff.missing > 0 ? ` · thiếu ${recDiff.missing}` : ""}{recDiff.extra > 0 ? ` · thêm ${recDiff.extra}` : ""}
                  </span>
                </div>
                <p className="flex flex-wrap gap-x-1 gap-y-0.5 text-xs leading-relaxed">
                  {recDiff.tokens.map((t, i) => (
                    <span key={`${t.text}-${i}`} className={t.state === "match" ? "font-medium text-emerald-700 dark:text-emerald-300" : t.state === "missing" ? "font-semibold text-red-600 underline decoration-red-400 underline-offset-2 dark:text-red-400" : "text-amber-700 line-through decoration-amber-500 dark:text-amber-300"}>
                      {t.text}
                    </span>
                  ))}
                </p>
                <div className="mt-1.5 flex gap-3 border-t border-border pt-1.5 text-[10px] text-muted-foreground">
                  <span className="text-emerald-700 dark:text-emerald-300">■ đúng</span>
                  <span className="text-red-600 dark:text-red-400">■ thiếu</span>
                  <span className="text-amber-700 dark:text-amber-300">■ thêm</span>
                </div>
              </div>
            )}
            {recorderError && <div className="text-[11px] font-medium text-destructive">{recorderError}</div>}
          </div>
        </div>
      )}

      {/* FAB luyện tự động */}
      <button
        type="button"
        onClick={() => setAutoOpen(true)}
        title="Luyện tự động (nghe / hỏi đáp)"
        className="fixed bottom-[17.5rem] right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card text-primary shadow-lg transition-all hover:scale-105 hover:bg-primary hover:text-primary-foreground active:scale-95 md:bottom-[15rem]"
      >
        <Headphones className="h-6 w-6" />
      </button>
      <AutoPractice open={autoOpen} onClose={() => setAutoOpen(false)} getAnswer={(id) => resolveAnswer(id, progress[id]?.answer, unlocked)} />

      {/* FAB quản lý đáp án — copy / cập nhật theo chủ đề + nạp lại cả trang */}
      <button
        type="button"
        onClick={() => setManageOpen(true)}
        title="Quản lý đáp án (copy / cập nhật / nạp lại)"
        className="fixed bottom-[13.5rem] right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card text-primary shadow-lg transition-all hover:scale-105 hover:bg-primary hover:text-primary-foreground active:scale-95 md:bottom-[10.5rem]"
      >
        <Database className="h-6 w-6" />
      </button>
      <AnswerManager
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        topics={topics}
        progress={progress}
        unlocked={unlocked}
      />

      {/* FAB mic */}
      <button
        type="button"
        onClick={() => {
          if (recorderOpen) { recStop(); setRecorderOpen(false) }
          else setRecorderOpen(true)
        }}
        title={recorderOpen ? "Đóng ghi âm" : "Mở ghi âm"}
        className={
          "fixed bottom-[9.5rem] right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 md:bottom-24 " +
          (listening ? "bg-destructive text-destructive-foreground" : recorderOpen ? "bg-primary text-primary-foreground" : "bg-card border border-border text-primary hover:bg-primary hover:text-primary-foreground")
        }
      >
        {listening ? <span className="relative flex h-6 w-6 items-center justify-center"><span className="absolute h-full w-full animate-ping rounded-full bg-destructive-foreground/40" /><Mic className="h-5 w-5" /></span> : <Mic className="h-6 w-6" />}
      </button>

      {/* FAB con mắt — ẩn/hiện câu hỏi toàn trang */}
      <button
        type="button"
        onClick={() => setShowQuestionText((v) => !v)}
        title={showQuestionText ? "Ẩn câu hỏi" : "Hiện câu hỏi"}
        className={
          "fixed bottom-[5.5rem] right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 md:bottom-6 " +
          (showQuestionText ? "bg-card border border-border text-primary hover:bg-primary hover:text-primary-foreground" : "bg-primary text-primary-foreground")
        }
      >
        {showQuestionText ? <Eye className="h-6 w-6" /> : <EyeOff className="h-6 w-6" />}
      </button>
    </div>
  )
}

function TopicSection({
  topic,
  progress,
  unlocked,
  showQuestionText,
  selectedIndex,
  onSelect,
  onBack,
}: {
  topic: IfaFinalTopic
  progress: Record<string, { answer: string; status: FinalConfidence }>
  unlocked: boolean
  showQuestionText: boolean
  selectedIndex: number | undefined
  onSelect: (index: number, question: IfaFinalQuestion) => void
  onBack: () => void
}) {
  const speak = useSpeak()
  const list = topic.questions
  const prepared = list.filter((q) => !!resolveAnswer(q.id, progress[q.id]?.answer, unlocked).trim()).length
  const selected = selectedIndex === undefined ? null : list[Math.min(selectedIndex, list.length - 1)]

  return (
    <section id={`practice-${topic.id}`} className="scroll-mt-28 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-muted/30 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="text-left font-bold leading-snug text-primary underline-offset-2 hover:underline"
            title="Quay về danh sách câu của chủ đề"
          >
            {topic.label} · {topic.vi}
          </button>
          <span className="shrink-0 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
            {list.length} câu
          </span>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">{prepared}/{list.length} câu đã soạn</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[minmax(200px,0.85fr)_minmax(0,1.15fr)]">
        <div className="space-y-2 border-b border-border p-3 sm:border-b-0 sm:border-r">
          {list.map((q, i) => {
            const confident = progress[q.id]?.status === "confident"
            return (
              <div
                key={q.id}
                className={
                  "flex w-full items-center gap-2 rounded-xl border p-2.5 text-left transition-colors " +
                  (selectedIndex === i
                    ? "border-primary/50 bg-primary/10 text-primary shadow-sm"
                    : "border-border/70 bg-background/70 hover:border-primary/30 hover:bg-primary/5")
                }
              >
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); speak(q.q) }}
                  aria-label={`Nghe câu hỏi ${i + 1}`}
                  title="Nghe câu hỏi"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <Volume2 className="size-3.5" />
                </button>
                <button type="button" onClick={() => onSelect(i, q)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold leading-snug">{showQuestionText ? q.q : `Question ${i + 1}`}</span>
                </button>
                {confident && <Check className="size-4 shrink-0 text-emerald-500" />}
              </div>
            )
          })}
        </div>

        {selected ? (
          <QuestionDetail question={selected} unlocked={unlocked} />
        ) : (
          <section className="relative flex min-h-56 items-center justify-center overflow-hidden bg-card p-6 text-center">
            <p className="max-w-xs text-sm text-muted-foreground">Chọn một câu hỏi bên trái để soạn và luyện câu trả lời.</p>
          </section>
        )}
      </div>
    </section>
  )
}

function QuestionDetail({ question, unlocked }: { question: IfaFinalQuestion; unlocked: boolean }) {
  const speak = useSpeak()
  const saveAnswer = useIfaFinalSpeaking((s) => s.saveAnswer)
  const setConfidence = useIfaFinalSpeaking((s) => s.setConfidence)
  const entry = useIfaFinalSpeaking((s) => s.progress[question.id])
  const [showGuide, setShowGuide] = useState(false)

  const answer = resolveAnswer(question.id, entry?.answer, unlocked)
  const status = entry?.status ?? "new"
  const meta = STATUS_META[status]

  return (
    <section className="h-full bg-card">
      <div className="border-b border-border bg-muted/20 px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="content-en text-lg font-bold leading-snug">{question.q}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{question.vi}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setConfidence(question.id, NEXT_STATUS[status])}
              title={`${meta.label} · bấm để đổi`}
              aria-label={`Trạng thái: ${meta.label}. Bấm để đổi.`}
              className={"flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-colors " + meta.cls}
            >
              <meta.Icon className="size-4" /> {meta.label}
            </button>
            {ttsSupported() && (
              <button type="button" aria-label="Nghe câu hỏi" onClick={() => speak(question.q)} className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-primary">
                <Volume2 className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        {/* Câu trả lời của tôi — target để chấm khi ghi âm */}
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label htmlFor={`ans-${question.id}`} className="text-xs font-bold uppercase tracking-wide text-primary">Câu trả lời của tôi</label>
            {ttsSupported() && !!answer.trim() && (
              <button type="button" onClick={() => speak(answer)} className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline-offset-2 hover:underline">
                <Volume2 className="size-3.5" /> Nghe
              </button>
            )}
          </div>
          <textarea
            id={`ans-${question.id}`}
            value={answer}
            onChange={(e) => saveAnswer(question.id, e.target.value)}
            placeholder="Viết câu trả lời bằng tiếng Anh theo ý của bạn…"
            rows={5}
            className="content-en w-full resize-y rounded-lg border border-input bg-background p-3 text-base leading-relaxed outline-none focus:border-primary"
          />
        </div>

        {/* Gợi ý tham khảo từ lớp học */}
        <div className="rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setShowGuide((v) => !v)}
            className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
          >
            <span className="flex items-center gap-2 text-sm font-semibold"><Lightbulb className="size-4 text-amber-600 dark:text-amber-400" /> Gợi ý tham khảo</span>
            <ChevronDown className={"size-4 shrink-0 text-muted-foreground transition-transform " + (showGuide ? "rotate-180" : "")} />
          </button>

          {showGuide && (
            <div className="space-y-4 border-t border-border p-3">
              <p className="text-xs text-muted-foreground">Từ {question.source}. Chọn cụm phù hợp với bản thân rồi đưa vào câu trả lời của bạn.</p>
              <div className="divide-y divide-border">
                {question.guide.map((point, i) => (
                  <div key={i} className="py-3 first:pt-0 last:pb-0">
                    <h4 className="text-sm font-semibold leading-relaxed">
                      <span className="mr-1.5 inline-flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">{i + 1}</span>
                      {point.idea}
                    </h4>
                    <div className="mt-2 overflow-hidden rounded-lg border border-border sm:grid sm:grid-cols-2">
                      {point.phrases.map(({ en, vi, ipa }, j) => (
                        <div key={j} className="flex items-start justify-between gap-2 border-b border-border px-3 py-2 text-sm last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0">
                          <div className="min-w-0">
                            <p className="content-en font-semibold">{en}</p>
                            {ipa && <p className="ipa mt-0.5 text-xs text-primary">/{ipa}/</p>}
                            <p className="mt-1 text-xs text-muted-foreground">{vi}</p>
                          </div>
                          {ttsSupported() && (
                            <button type="button" aria-label={`Nghe: ${en}`} onClick={() => speak(en)} className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-primary">
                              <Volume2 className="size-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {question.sample && (
                <div className="border-t border-border pt-3">
                  <div className="flex items-start gap-2 border-l-2 border-primary bg-muted/30 px-3 py-2.5">
                    <Quote className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-primary">Câu mẫu tham khảo</p>
                      <p className="content-en mt-1 text-sm leading-relaxed">{question.sample}</p>
                    </div>
                    {ttsSupported() && (
                      <button type="button" aria-label="Nghe câu mẫu" onClick={() => speak(question.sample!)} className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-primary">
                        <Volume2 className="size-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/**
 * Bảng quản lý đáp án đặt ở ngoài (không nhét vào từng card):
 * - Chọn 1 chủ đề rồi Copy hoặc Update đáp án của riêng chủ đề đó.
 * - Update: dán JSON {id: answer}; nếu id không thuộc chủ đề đang chọn → báo nhầm topic.
 * - Nạp lại cả trang: ghi đè TOÀN BỘ localStorage bằng đáp án gốc mới nhất trong
 *   code rồi reload, khắc phục trường hợp bản đã lưu che mất bản vừa cập nhật.
 */
function AnswerManager({
  open,
  onClose,
  topics,
  progress,
  unlocked,
}: {
  open: boolean
  onClose: () => void
  topics: IfaFinalTopic[]
  progress: Record<string, { answer: string; status: FinalConfidence }>
  unlocked: boolean
}) {
  const saveAnswer = useIfaFinalSpeaking((s) => s.saveAnswer)
  const [topicId, setTopicId] = useState(topics[0]?.id ?? "")
  const [pasted, setPasted] = useState("")
  const [note, setNote] = useState<{ kind: "ok" | "err"; text: string } | null>(null)

  const topic = topics.find((t) => t.id === topicId) ?? topics[0]

  useEffect(() => {
    if (open) setNote(null)
  }, [open])

  if (!open || !topic) return null

  async function copyTopic() {
    const out: Record<string, string> = {}
    for (const q of topic.questions) {
      const text = resolveAnswer(q.id, progress[q.id]?.answer, unlocked).trim()
      if (text) out[q.id] = text
    }
    if (!Object.keys(out).length) {
      setNote({ kind: "err", text: unlocked ? `Chủ đề "${topic.label}" chưa có đáp án nào.` : "Hãy mở khoá để xem và copy đáp án." })
      return
    }
    try {
      await navigator.clipboard.writeText(JSON.stringify(out, null, 2))
      setNote({ kind: "ok", text: `Đã copy ${Object.keys(out).length} đáp án của "${topic.label}".` })
    } catch {
      setNote({ kind: "err", text: "Trình duyệt chặn clipboard. Hãy thử lại." })
    }
  }

  function updateTopic() {
    const raw = pasted.trim()
    if (!raw) {
      setNote({ kind: "err", text: "Chưa có JSON để cập nhật." })
      return
    }
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      setNote({ kind: "err", text: 'JSON không hợp lệ. Dán đúng dạng {"id": "đáp án"}.' })
      return
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      setNote({ kind: "err", text: 'Dữ liệu phải là object {"id": "đáp án"}.' })
      return
    }
    const entries = Object.entries(parsed as Record<string, unknown>).filter(([, v]) => typeof v === "string")
    if (!entries.length) {
      setNote({ kind: "err", text: "Không tìm thấy cặp id/đáp án nào." })
      return
    }
    const ids = new Set(topic.questions.map((q) => q.id))
    const matched = entries.filter(([id]) => ids.has(id))
    // Phát hiện nhầm topic: có id nhưng không id nào thuộc chủ đề đang chọn.
    if (!matched.length) {
      const guessTopic = topics.find((t) => t.questions.some((q) => q.id === entries[0][0]))
      setNote({
        kind: "err",
        text: guessTopic
          ? `Nhầm chủ đề! JSON này thuộc "${guessTopic.label}", không phải "${topic.label}". Hãy chọn đúng chủ đề rồi cập nhật.`
          : `Nhầm chủ đề! Không id nào trong JSON thuộc "${topic.label}".`,
      })
      return
    }
    for (const [id, value] of matched) saveAnswer(id, value as string)
    const skipped = entries.length - matched.length
    setNote({
      kind: "ok",
      text: `Đã cập nhật ${matched.length} đáp án cho "${topic.label}".` + (skipped > 0 ? ` (${skipped} id không thuộc chủ đề này đã bỏ qua.)` : ""),
    })
  }

  // Ghi đè toàn bộ localStorage bằng đáp án gốc trong code rồi reload cả trang.
  function reloadWholePage() {
    if (!unlocked) {
      setNote({ kind: "err", text: "Hãy mở khoá trước khi nạp lại đáp án gốc." })
      return
    }
    const ok = window.confirm(
      "Nạp lại TẤT CẢ đáp án gốc mới nhất và tải lại trang?\nMọi chỉnh sửa đang lưu sẽ bị ghi đè bằng bản trong code.",
    )
    if (!ok) return
    for (const q of allFinalQuestions) {
      const text = (ifaSpeakingAnswers[q.id] ?? "").trim()
      if (text) saveAnswer(q.id, text)
    }
    window.location.reload()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-bold"><Database className="size-4 text-primary" /> Quản lý đáp án</span>
          <button type="button" onClick={onClose} aria-label="Đóng" className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted">
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto p-4">
          <div>
            <label htmlFor="am-topic" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-primary">Chủ đề</label>
            <select
              id="am-topic"
              value={topicId}
              onChange={(e) => { setTopicId(e.target.value); setNote(null) }}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {topics.map((t) => (
                <option key={t.id} value={t.id}>{t.label} · {t.vi} ({t.questions.length})</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={copyTopic}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <ClipboardCopy className="size-4" /> Copy
            </button>
            <button
              type="button"
              onClick={updateTopic}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <ClipboardPaste className="size-4" /> Cập nhật
            </button>
          </div>

          <div>
            <label htmlFor="am-json" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-primary">JSON cập nhật</label>
            <textarea
              id="am-json"
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              placeholder={`{"${topic.questions[0]?.id ?? "id"}": "đáp án..."}`}
              rows={5}
              className="w-full resize-y rounded-lg border border-input bg-background p-3 font-mono text-xs leading-relaxed outline-none focus:border-primary"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">Dán JSON rồi bấm “Cập nhật”. Chỉ áp cho chủ đề đang chọn — sai chủ đề sẽ được báo.</p>
          </div>

          {note && (
            <div className={"rounded-lg px-3 py-2 text-xs font-medium " + (note.kind === "ok" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300")}>
              {note.text}
            </div>
          )}

          <div className="border-t border-border pt-3">
            <button
              type="button"
              onClick={reloadWholePage}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-400/60 bg-amber-50 px-3 py-2.5 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20"
            >
              <RotateCcw className="size-4" /> Nạp lại đáp án gốc + tải lại trang
            </button>
            <p className="mt-1 text-[11px] text-muted-foreground">Ghi đè toàn bộ đáp án đã lưu bằng bản gốc mới nhất trong code (khi localStorage che mất bản vừa sửa).</p>
          </div>
        </div>
      </div>
    </div>
  )
}
