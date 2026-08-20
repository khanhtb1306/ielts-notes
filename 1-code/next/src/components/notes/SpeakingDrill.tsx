import { useEffect, useMemo, useRef, useState } from "react"
import { Bot, Check, Clock3, Copy, Eye, EyeOff, Gamepad2, GraduationCap, HeartPulse, Home, Lightbulb, Mic, MapPinHouse, Pencil, Plane, Play, Quote, RotateCcw, Square, UserRound, UsersRound, Utensils, Volume2, VolumeX, X } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { getEnglishVoices, speak } from "@/lib/tts"
import { diffWords, tokenize } from "@/lib/speech-diff"

import type { SpeakingQuestion, TopicLabel } from "@/types/content"

const APP_BASE = (import.meta.env.BASE_URL || "/").replace(/\/?$/, "/")
const AUDIO_DIR = "final/google-doc-pre-course/audio"
const SAMPLE_OVERRIDE_KEY = "ielts-speaking-sample-overrides"
const SPEAKING_SECTIONS = [
  { id: "self", title: "Name / Age / Birthday / Time", keys: ["self"], icon: UserRound },
  { id: "hometown", title: "Hometown", keys: ["hometown"], icon: MapPinHouse },
  { id: "job", title: "Jobs / School", keys: ["job"], icon: GraduationCap },
  { id: "hobbies", title: "Hobbies", keys: ["hobbies"], icon: Gamepad2 },
  { id: "daily-routine", title: "Daily Routine / Time", keys: ["daily-routine"], icon: Clock3 },
  { id: "family-describe-people", title: "Family / Describe People", keys: ["family", "appearance", "personality"], icon: UsersRound },
  { id: "house", title: "House / Describe a Room", keys: ["house"], icon: Home },
  { id: "trip", title: "Entertainment / Vacations", keys: ["trip"], icon: Plane },
  { id: "food-restaurant", title: "Food / Drinks", keys: ["food-restaurant"], icon: Utensils },
  { id: "health-illness", title: "Health and Illness", keys: ["health-illness"], icon: HeartPulse },
]

/**
 * Nối 2 đoạn text, tự cắt phần chồng lấn ở mối nối.
 * Chrome khi tự ngắt & restart đôi khi nhận lại vài từ cuối → tránh lặp.
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

function formatTime(total: number) {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

function audioHref(file: string) {
  const path = `${AUDIO_DIR}/${file}`
  return `${APP_BASE}${path.split("/").map(encodeURIComponent).join("/")}`
}

function googleFemaleVoiceName(voices: SpeechSynthesisVoice[]) {
  const preferred = [
    /google uk english female/i,
    /google us english/i,
    /google.*english.*female/i,
    /google.*english/i,
  ]
  return preferred.map((re) => voices.find((v) => re.test(v.name))).find(Boolean)?.name || ""
}

interface Props {
  questions: Record<string, SpeakingQuestion[]>
  topicLabels: Record<string, TopicLabel>
}

interface SelectedQuestion {
  key: string
  sectionId: string
  sectionTitle: string
  sectionKeys: string[]
  sectionIcon: LucideIcon
  q: SpeakingQuestion
  index: number
  allowGeneratedAudio: boolean
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

interface SpeechRecognitionResultLike {
  transcript: string
}

interface SpeechRecognitionResultItemLike extends ArrayLike<SpeechRecognitionResultLike> {
  isFinal: boolean
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultItemLike>
  resultIndex: number
}

interface SpeechRecognitionErrorLike {
  error?: string
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

export function SpeakingDrill({ questions }: Props) {
  const sections = useMemo(() => {
    return SPEAKING_SECTIONS.map((section) => ({
      ...section,
      questions: section.keys.flatMap((key) => questions[key] ?? []),
    })).filter((section) => section.questions.length > 0)
  }, [questions])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [voiceName, setVoiceName] = useState("")
  const [selectedBySection, setSelectedBySection] = useState<Record<string, number>>({})
  const [sampleOverrides, setSampleOverrides] = useState<Record<string, string>>({})
  const [showQuestionText, setShowQuestionText] = useState(false)

  // ── Recorder (lifted) ──────────────────────────────────────────────
  const [recorderOpen, setRecorderOpen] = useState(false)
  const [activeRecorderQ, setActiveRecorderQ] = useState<SpeakingQuestion | null>(null)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [interim, setInterim] = useState("")
  const [recorderError, setRecorderError] = useState("")
  const [elapsed, setElapsed] = useState(0)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const isListeningRef = useRef(false)
  /** Text đã chốt từ các recognition instance TRƯỚC (trước mỗi lần auto-restart). */
  const baseTextRef = useRef("")
  /** Mirror của transcript để đọc đồng bộ trong handler. */
  const transcriptRef = useRef("")
  const restartTimerRef = useRef<number | null>(null)

  const activeText = activeRecorderQ
    ? (sampleOverrides[activeRecorderQ.q] || activeRecorderQ.sampleAnswer || "")
    : ""
  const spoken = (transcript + " " + interim).trim()
  const recDiff = spoken && activeText ? diffWords(activeText, spoken) : null
  const spokenWordCount = tokenize(spoken).length
  const wpm = elapsed >= 3 ? Math.round((spokenWordCount / elapsed) * 60) : 0

  useEffect(() => {
    return () => {
      isListeningRef.current = false
      if (restartTimerRef.current) window.clearTimeout(restartTimerRef.current)
      destroyRecognition(recognitionRef.current)
      recognitionRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  /** Ngắt sạch 1 instance: tháo handler TRƯỚC khi abort để onend không bao giờ chạy. */
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
      if (recognitionRef.current !== r) return // instance đã bị thay → bỏ qua
      // Dựng lại TOÀN BỘ text final của instance này → idempotent, không thể lặp
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
      // no-speech / aborted: bỏ qua, onend sẽ tự restart
    }

    r.onstart = null

    r.onend = () => {
      if (recognitionRef.current !== r) return
      setInterim("")
      if (!isListeningRef.current) {
        setListening(false)
        return
      }
      // Chrome tự ngắt sau ~60s → chốt text hiện tại rồi tạo instance mới
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
    try {
      r.start()
    } catch {
      // start() gọi khi đang chạy → bỏ qua
    }
  }

  /** Dừng hẳn, tháo sạch instance + timer. */
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

  /** Bắt đầu ghi âm mới cho 1 câu (xoá hết text cũ). */
  function recStartFor(q: SpeakingQuestion) {
    const win = window as Window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }
    if (!win.SpeechRecognition && !win.webkitSpeechRecognition) {
      setRecorderError("Trình duyệt chưa hỗ trợ. Hãy dùng Chrome hoặc Edge.")
      return
    }
    recStop() // tháo sạch instance cũ, không còn race
    // Tắt mọi âm thanh đang phát để mic không thu lại tiếng audio câu hỏi
    window.speechSynthesis?.cancel()
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0 }
    baseTextRef.current = ""
    transcriptRef.current = ""
    setTranscript("")
    setInterim("")
    setElapsed(0)
    setRecorderError("")
    setActiveRecorderQ(q)
    isListeningRef.current = true
    setListening(true)
    recCreateAndStart()
  }

  /** Xoá text, vẫn tiếp tục nghe. */
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

  /** Click vào nội dung câu hỏi: chọn câu + ghi âm luôn. */
  function activateRecorder(q: SpeakingQuestion) {
    if (!recorderOpen) return
    recStartFor(q)
  }

  /**
   * Click icon audio: chỉ chọn câu, KHÔNG ghi âm.
   * Nếu đang ghi thì dừng lại để mic không thu tiếng audio câu hỏi.
   */
  function selectForRecorderNoStart(q: SpeakingQuestion) {
    if (!recorderOpen) return
    recStop()
    if (activeRecorderQ?.q !== q.q) {
      baseTextRef.current = ""
      transcriptRef.current = ""
      setTranscript("")
      setInterim("")
      setElapsed(0)
      setRecorderError("")
      setActiveRecorderQ(q)
    }
  }

  useEffect(() => {
    const selectVoice = () => setVoiceName(googleFemaleVoiceName(getEnglishVoices()))
    selectVoice()
    const timer = window.setTimeout(selectVoice, 500)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SAMPLE_OVERRIDE_KEY)
      if (raw) {
        setSampleOverrides(JSON.parse(raw))
      } else {
        // Seed câu mẫu đầu tiên để người dùng biết cách dùng chức năng sửa
        const seed: Record<string, string> = {
          "What's your name?": "My name is Khanh, my full name is Trinh Bao Khanh.",
        }
        setSampleOverrides(seed)
        window.localStorage.setItem(SAMPLE_OVERRIDE_KEY, JSON.stringify(seed, null, 2))
      }
    } catch {
      setSampleOverrides({})
    }
  }, [])

  if (sections.length === 0) return null

  function play(file: string) {
    const el = audioRef.current
    if (!el) return
    window.speechSynthesis?.cancel()
    el.src = audioHref(file)
    el.currentTime = 0
    void el.play().catch(() => {})
  }

  function playGenerated(text: string) {
    audioRef.current?.pause()
    speak(text, voiceName, 0.9)
  }

  function playQuestion(item: SelectedQuestion) {
    if (isListeningRef.current) recStop() // đang ghi thì dừng, tránh mic thu tiếng audio
    if (item.q.audioFile) play(item.q.audioFile)
    else playGenerated(item.q.q)
  }

  function playSampleAnswer(text: string) {
    if (isListeningRef.current) recStop()
    audioRef.current?.pause()
    speak(text, voiceName, 0.9)
  }

  function saveSampleAnswer(question: string, value: string) {
    const next = { ...sampleOverrides }
    const trimmed = value.trim()
    if (trimmed) next[question] = trimmed
    else delete next[question]
    setSampleOverrides(next)
    window.localStorage.setItem(SAMPLE_OVERRIDE_KEY, JSON.stringify(next, null, 2))
  }

  async function copySampleOverrides() {
    const payload = JSON.stringify(sampleOverrides, null, 2)
    await navigator.clipboard?.writeText(payload)
  }

  function questionItem(section: (typeof sections)[number], index: number): SelectedQuestion {
    return {
      key: `${section.id}:${index}`,
      sectionId: section.id,
      sectionTitle: section.title,
      sectionKeys: section.keys,
      sectionIcon: section.icon,
      q: section.questions[index],
      index: index + 1,
      allowGeneratedAudio: true,
    }
  }

  return (
    <div className="searchable space-y-5">
      <audio ref={audioRef} className="hidden" preload="none" />

      <div className="space-y-5">
        {sections.map((section) => {
          const list = section.questions
          const withAudio = list.filter((q) => q.audioFile).length
          const withGeneratedAudio = list.length - withAudio
          const selectedIndex = selectedBySection[section.id]
          const selected = selectedIndex === undefined ? null : questionItem(section, Math.min(selectedIndex, list.length - 1))
          return (
            <section key={section.id} id={`speak-${section.id}`} className="scroll-mt-28 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="border-b border-border bg-muted/30 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedBySection((prev) => {
                      const next = { ...prev }
                      delete next[section.id]
                      return next
                    })}
                    className="text-left font-bold leading-snug text-primary underline-offset-2 hover:underline"
                    title="Quay về màn hình bắt đầu topic"
                  >
                    {section.title}
                  </button>
                  <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                    {list.length} câu
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {withAudio} audio gốc · {withGeneratedAudio} giọng máy
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[minmax(200px,0.85fr)_minmax(0,1.15fr)]">
                <div className="space-y-2 border-b border-border p-3 sm:border-b-0 sm:border-r">
                  {list.map((_, i) => {
                    const item = questionItem(section, i)
                    return (
                      <QuestionRow
                        key={item.key}
                        item={item}
                        selected={selectedIndex === i}
                        showQuestionText={showQuestionText}
                        onSelect={() => { setSelectedBySection((prev) => ({ ...prev, [section.id]: i })); activateRecorder(item.q) }}
                        onPlay={() => { selectForRecorderNoStart(item.q); playQuestion(item) }}
                      />
                    )
                  })}
                </div>

                {selected ? (
                  <QuestionDetail
                    item={selected}
                    sampleOverride={sampleOverrides[selected.q.q]}
                    hasSampleOverrides={Object.keys(sampleOverrides).length > 0}
                    onSaveSample={saveSampleAnswer}
                    onCopySampleOverrides={copySampleOverrides}
                    onSpeakSample={playSampleAnswer}
                  />
                ) : <EmptyDetail Icon={section.icon} />}
              </div>
            </section>
          )
        })}
      </div>

      {/* ── Recorder panel fixed ── */}
      {recorderOpen && (
        <div className="fixed bottom-44 right-6 z-40 flex w-80 flex-col rounded-2xl border border-border bg-card shadow-2xl">
          {/* header */}
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
              {activeRecorderQ ? activeRecorderQ.q : "Click vào câu hỏi để ghi âm"}
            </span>
            {listening && <span className="shrink-0 text-[11px] font-semibold text-destructive">{formatTime(elapsed)}</span>}
            {!listening && elapsed > 0 && <span className="shrink-0 text-[11px] text-muted-foreground">{formatTime(elapsed)}{wpm > 0 ? ` · ${wpm}w/p` : ""}</span>}
            {listening ? (
              <button type="button" onClick={recStop} title="Dừng ghi âm"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive text-destructive-foreground hover:opacity-85">
                <Square className="h-3 w-3" />
              </button>
            ) : (
              <button type="button" onClick={() => activeRecorderQ && recStartFor(activeRecorderQ)} disabled={!activeRecorderQ}
                title="Bắt đầu ghi âm" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-85 disabled:opacity-40">
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
            {/* transcript */}
            <div className="min-h-12 whitespace-pre-wrap rounded-lg bg-muted/30 px-2.5 py-2 text-xs leading-relaxed">
              {transcript || interim ? (
                <><span>{transcript}</span>{interim && <span className="italic text-muted-foreground">{transcript ? " " : ""}{interim}</span>}</>
              ) : (
                <span className="text-muted-foreground">
                  {listening ? "Đang nghe… đọc bài mẫu đi." : "Click vào câu hỏi bên trái để bắt đầu ghi âm."}
                </span>
              )}
            </div>

            {/* diff */}
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

      {/* FAB mic */}
      <button
        type="button"
        onClick={() => {
          if (recorderOpen) { recStop(); setRecorderOpen(false) }
          else setRecorderOpen(true)
        }}
        title={recorderOpen ? "Đóng ghi âm" : "Mở ghi âm"}
        className={
          "fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 " +
          (listening
            ? "bg-destructive text-destructive-foreground"
            : recorderOpen
              ? "bg-primary text-primary-foreground"
              : "bg-card border border-border text-primary hover:bg-primary hover:text-primary-foreground")
        }
      >
        {listening ? <span className="relative flex h-6 w-6 items-center justify-center"><span className="absolute h-full w-full animate-ping rounded-full bg-destructive-foreground/40" /><Mic className="h-5 w-5" /></span> : <Mic className="h-6 w-6" />}
      </button>

      {/* FAB con mắt — fixed bottom-right, toggle hiện/ẩn câu hỏi toàn trang */}
      <button
        type="button"
        onClick={() => setShowQuestionText((v) => !v)}
        title={showQuestionText ? "Ẩn câu hỏi" : "Hiện câu hỏi"}
        className={
          "fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 " +
          (showQuestionText
            ? "bg-primary text-primary-foreground"
            : "bg-card border border-border text-primary hover:bg-primary hover:text-primary-foreground")
        }
      >
        {showQuestionText ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
      </button>
    </div>
  )
}

function canPlayAudio(item: SelectedQuestion) {
  return Boolean(item.q.audioFile) || (item.allowGeneratedAudio && Boolean(item.q.q))
}

function QuestionRow({ item, selected, showQuestionText, onSelect, onPlay }: { item: SelectedQuestion; selected: boolean; showQuestionText: boolean; onSelect: () => void; onPlay: () => void }) {
  const canPlay = canPlayAudio(item)
  const usesGeneratedAudio = !item.q.audioFile && canPlay

  return (
    <div
      className={
        "flex w-full items-center gap-2 rounded-xl border p-2.5 text-left transition-colors " +
        (selected
          ? "border-primary/50 bg-primary/10 text-primary shadow-sm"
          : "border-border/70 bg-background/70 hover:border-primary/30 hover:bg-primary/5")
      }
    >
      <AudioButton canPlay={canPlay} hasAudio={Boolean(item.q.audioFile)} onPlay={onPlay} small />
      <button type="button" onClick={onSelect} className="flex min-w-0 flex-1 items-center gap-2 text-left">
        <span className="min-w-0 flex-1 text-sm font-semibold leading-snug">{showQuestionText ? item.q.q : `Question ${item.index}`}</span>
      </button>
      {usesGeneratedAudio && (
        <span title="Giọng máy" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-violet-300/60 bg-violet-100 text-violet-700 dark:border-violet-500/40 dark:bg-violet-500/15 dark:text-violet-200">
          <Bot className="h-3.5 w-3.5" />
        </span>
      )}
    </div>
  )
}

function AudioButton({ canPlay, hasAudio, onPlay, small = false }: { canPlay: boolean; hasAudio: boolean; onPlay: () => void; small?: boolean }) {
  return (
    <button
      type="button"
      disabled={!canPlay}
      onClick={(e) => {
        e.stopPropagation()
        onPlay()
      }}
      title={hasAudio ? "Nghe audio gốc" : canPlay ? "Đọc bằng giọng máy Google nữ" : "Chưa có audio cho câu này"}
      className={
        "flex shrink-0 items-center justify-center rounded-full border transition-colors " +
        (small ? "h-8 w-8" : "h-10 w-10") +
        " " +
        (canPlay
          ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
          : "cursor-not-allowed border-border bg-muted/40 text-muted-foreground/50")
      }
    >
      {canPlay ? <Volume2 className={small ? "h-3.5 w-3.5" : "h-4 w-4"} /> : <VolumeX className={small ? "h-3.5 w-3.5" : "h-4 w-4"} />}
    </button>
  )
}

function EmptyDetail({ Icon }: { Icon: LucideIcon }) {
  return (
    <section className="relative flex min-h-72 items-center justify-center overflow-hidden bg-card p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_30%,rgba(59,130,246,0.16),transparent_34%),radial-gradient(circle_at_72%_70%,rgba(168,85,247,0.14),transparent_34%)]" />
      <div className="relative flex h-36 w-36 items-center justify-center rounded-[2rem] border border-primary/20 bg-background/75 shadow-sm backdrop-blur">
        <Icon className="h-16 w-16 text-primary/75" />
      </div>
    </section>
  )
}

function QuestionDetail({
  item,
  sampleOverride,
  hasSampleOverrides,
  onSaveSample,
  onCopySampleOverrides,
  onSpeakSample,
}: {
  item: SelectedQuestion
  sampleOverride?: string
  hasSampleOverrides: boolean
  onSaveSample: (question: string, value: string) => void
  onCopySampleOverrides: () => Promise<void>
  onSpeakSample: (text: string) => void
}) {
  const { q } = item
  const sampleText = sampleOverride || q.sampleAnswer || ""

  return (
    <section className="h-full bg-card">
      <div className="border-b border-border bg-muted/20 px-4 py-3">
        <h3 className="text-lg font-bold leading-snug">{q.q}</h3>
      </div>

      <div className="space-y-3 p-4">
        {q.subQuestions && q.subQuestions.length > 0 && (
          <div>
            <div className="mb-1.5 text-xs font-bold uppercase tracking-wide text-primary">Câu hỏi phụ</div>
            <ul className="space-y-1.5 rounded-lg bg-primary/5 px-3 py-2 text-sm">
              {q.subQuestions.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-0.5 font-bold text-primary">{i + 1}.</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {((q.answerFrames && q.answerFrames.length > 0) || q.tip) && (
          <div className="rounded-xl border border-primary/15 bg-primary/5 p-3 text-sm">
            {q.answerFrames && q.answerFrames.length > 0 && (
              <div>
                <div className="mb-2 text-xs font-bold uppercase tracking-wide text-primary">Khung trả lời</div>
                <ul className="space-y-2">
                  {q.answerFrames.map((f, i) => (
                    <li key={i} className="flex gap-2 leading-relaxed">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {q.tip && (
              <div className={(q.answerFrames && q.answerFrames.length > 0 ? "mt-3 border-t border-primary/15 pt-3 " : "") + "flex gap-2"}>
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <span className="font-semibold">Tip: </span>
                  {q.tip}
                </div>
              </div>
            )}
          </div>
        )}

        {q.sampleAnswer && (
          <SampleAnswer
            text={sampleText}
            ipa={q.sampleAnswerIpa}
            isEdited={Boolean(sampleOverride)}
            hasSampleOverrides={hasSampleOverrides}
            onSave={(value) => onSaveSample(q.q, value)}
            onCopySampleOverrides={onCopySampleOverrides}
            onSpeak={() => onSpeakSample(sampleText)}
          />
        )}
      </div>
    </section>
  )
}

function SampleAnswer({
  text,
  ipa = [],
  isEdited,
  hasSampleOverrides,
  onSave,
  onCopySampleOverrides,
  onSpeak,
}: {
  text: string
  ipa?: string[]
  isEdited: boolean
  hasSampleOverrides: boolean
  onSave: (value: string) => void
  onCopySampleOverrides: () => Promise<void>
  onSpeak: () => void
}) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(text)
  const [copied, setCopied] = useState(false)
  const hasIpa = ipa.length > 0

  useEffect(() => setDraft(text), [text])

  async function copyOverrides() {
    await onCopySampleOverrides(); setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="text-sm">
      <div className="flex gap-2">
        <Quote className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div>
          <span className="font-semibold">Bài mẫu: </span>
          {editing ? (
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)}
              className="mt-2 min-h-28 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:border-primary/60" />
          ) : (
            <span className="italic">{text}</span>
          )}
          {isEdited && !editing && <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">đã sửa local</span>}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        {hasIpa && <button type="button" onClick={() => setOpen((v) => !v)} className="text-xs font-semibold text-primary underline-offset-2 hover:underline">
          {open ? "Ẩn phiên âm" : "Hiện phiên âm"}
        </button>}
        <button type="button" onClick={onSpeak} title="Đọc bài mẫu bằng giọng máy Google nữ"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline-offset-2 hover:underline">
          <Volume2 className="h-3.5 w-3.5" /> Nghe bài mẫu
        </button>
        {editing ? (
          <>
            <button type="button" onClick={() => { onSave(draft); setEditing(false) }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline-offset-2 hover:underline">
              <Check className="h-3.5 w-3.5" /> Lưu bài mẫu
            </button>
            <button type="button" onClick={() => { setDraft(text); setEditing(false) }}
              className="text-xs font-semibold text-muted-foreground underline-offset-2 hover:text-primary hover:underline">Huỷ</button>
          </>
        ) : (
          <button type="button" onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline-offset-2 hover:underline">
            <Pencil className="h-3.5 w-3.5" /> Sửa bài mẫu
          </button>
        )}
        {isEdited && !editing && (
          <button type="button" onClick={() => onSave("")}
            className="text-xs font-semibold text-muted-foreground underline-offset-2 hover:text-primary hover:underline">Về bản gốc</button>
        )}
        {hasSampleOverrides && (
          <button type="button" onClick={copyOverrides}
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground underline-offset-2 hover:text-primary hover:underline">
            <Copy className="h-3.5 w-3.5" /> {copied ? "Đã copy" : "Copy bản sửa"}
          </button>
        )}
      </div>
      {open && (
        <div className="mt-2 space-y-2 border-l-2 border-primary/25 pl-3">
          {ipa.map((line, i) => (
            <div key={`${line}-${i}`} className="font-mono text-sm leading-relaxed text-primary">{line}</div>
          ))}
        </div>
      )}
    </div>
  )
}
