import { useEffect, useMemo, useRef, useState } from "react"
import { Bot, Check, Clock3, Copy, Eye, Gamepad2, GraduationCap, HeartPulse, Home, Lightbulb, Mic, MicOff, MapPinHouse, Pencil, Plane, Quote, RotateCcw, Square, UserRound, UsersRound, Utensils, Volume2, VolumeX } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { getEnglishVoices, speak } from "@/lib/tts"
import { diffWords, tokenize } from "@/lib/speech-diff"
import type { DiffResult } from "@/lib/speech-diff"
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
  const [revealedSections, setRevealedSections] = useState<Record<string, boolean>>({})
  const [sampleOverrides, setSampleOverrides] = useState<Record<string, string>>({})

  useEffect(() => {
    const selectVoice = () => setVoiceName(googleFemaleVoiceName(getEnglishVoices()))
    selectVoice()
    const timer = window.setTimeout(selectVoice, 500)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SAMPLE_OVERRIDE_KEY)
      if (raw) setSampleOverrides(JSON.parse(raw))
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
    if (item.q.audioFile) play(item.q.audioFile)
    else playGenerated(item.q.q)
  }

  function playSampleAnswer(text: string) {
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
          const showQuestionText = Boolean(revealedSections[section.id])
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
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setRevealedSections((prev) => ({ ...prev, [section.id]: !prev[section.id] }))
                      }}
                      title={showQuestionText ? "Ẩn nội dung câu hỏi" : "Hiện nội dung câu hỏi"}
                      className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      <Eye className="h-3 w-3" />
                      {showQuestionText ? "Ẩn câu hỏi" : "View questions"}
                    </button>
                    <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                      {list.length} câu
                    </span>
                  </div>
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
                        onSelect={() => setSelectedBySection((prev) => ({ ...prev, [section.id]: i }))}
                        onPlay={() => playQuestion(item)}
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
  const [recorderOpen, setRecorderOpen] = useState(false)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [interim, setInterim] = useState("")
  const [recorderError, setRecorderError] = useState("")
  const [elapsed, setElapsed] = useState(0)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const isListeningRef = useRef(false)
  const accumulatedRef = useRef("")
  const hasIpa = ipa.length > 0

  const spoken = (transcript + " " + interim).trim()
  const diff: DiffResult | null = spoken ? diffWords(text, spoken) : null
  const sampleWordCount = tokenize(text).length
  const spokenWordCount = tokenize(spoken).length
  const wpm = elapsed >= 3 ? Math.round((spokenWordCount / elapsed) * 60) : 0

  useEffect(() => setDraft(text), [text])

  useEffect(() => {
    return () => {
      isListeningRef.current = false
      recognitionRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    if (!listening) return
    const id = window.setInterval(() => setElapsed((v) => v + 1), 1000)
    return () => window.clearInterval(id)
  }, [listening])

  async function copyOverrides() {
    await onCopySampleOverrides()
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  function recognitionConstructor(): SpeechRecognitionConstructor | undefined {
    const win = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor
      webkitSpeechRecognition?: SpeechRecognitionConstructor
    }
    return win.SpeechRecognition || win.webkitSpeechRecognition
  }

  function errorMessage(code?: string) {
    switch (code) {
      case "not-allowed":
      case "service-not-allowed":
        return "Bạn cần cho phép quyền micro. Bấm vào ổ khoá trên thanh địa chỉ → Microphone → Allow."
      case "audio-capture":
        return "Không tìm thấy micro. Kiểm tra lại thiết bị thu âm."
      case "network":
        return "Nhận diện giọng nói cần mạng. Kiểm tra lại kết nối Internet."
      case "language-not-supported":
        return "Trình duyệt không hỗ trợ tiếng Anh cho nhận diện giọng nói."
      default:
        return ""
    }
  }

  function createAndStart() {
    const Ctor = recognitionConstructor()
    if (!Ctor) {
      setRecorderError("Trình duyệt này chưa hỗ trợ nhận diện giọng nói. Hãy dùng Chrome hoặc Edge trên máy tính.")
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
      let pending = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i]
        const chunk = res[0]?.transcript ?? ""
        if (!chunk) continue
        if (res.isFinal) {
          accumulatedRef.current += (accumulatedRef.current ? " " : "") + chunk.trim()
        } else {
          pending += chunk
        }
      }
      setTranscript(accumulatedRef.current)
      setInterim(pending.trim())
    }

    r.onerror = (event) => {
      const msg = errorMessage(event.error)
      if (msg) {
        isListeningRef.current = false
        setListening(false)
        setRecorderError(msg)
      }
      // no-speech / aborted: bỏ qua, onend sẽ tự restart
    }

    r.onstart = null

    r.onend = () => {
      setInterim("")
      if (isListeningRef.current) {
        // user chưa bấm Dừng → Chrome tự ngắt sau ~60s, restart để nói tiếp
        window.setTimeout(() => {
          if (isListeningRef.current) {
            try {
              createAndStart()
            } catch {
              /* ignore */
            }
          }
        }, 120)
      } else {
        setListening(false)
      }
    }

    recognitionRef.current = r
    r.start()
  }

  function startRecording(keepText = false) {
    setRecorderOpen(true)
    setRecorderError("")
    if (!recognitionConstructor()) {
      setRecorderError("Trình duyệt này chưa hỗ trợ nhận diện giọng nói. Hãy dùng Chrome hoặc Edge trên máy tính.")
      return
    }

    window.speechSynthesis?.cancel()
    isListeningRef.current = false
    recognitionRef.current?.abort()
    recognitionRef.current = null

    if (!keepText) {
      accumulatedRef.current = ""
      setTranscript("")
      setElapsed(0)
    }
    setInterim("")

    isListeningRef.current = true
    setListening(true)
    createAndStart()
  }

  function stopRecording() {
    isListeningRef.current = false
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setInterim("")
    setListening(false)
  }

  function resetRecording() {
    stopRecording()
    accumulatedRef.current = ""
    setTranscript("")
    setInterim("")
    setElapsed(0)
    setRecorderError("")
  }

  return (
    <div className="text-sm">
      <div className="flex gap-2">
        <Quote className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div>
          <span className="font-semibold">Bài mẫu: </span>
          {editing ? (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="mt-2 min-h-28 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:border-primary/60"
            />
          ) : (
            <span className="italic">{text}</span>
          )}
          {isEdited && !editing && <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">đã sửa local</span>}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-3">
        {hasIpa && <button type="button" onClick={() => setOpen((v) => !v)} className="text-xs font-semibold text-primary underline-offset-2 hover:underline">
          {open ? "Ẩn phiên âm" : "Hiện phiên âm"}
        </button>}
        <button
          type="button"
          onClick={onSpeak}
          title="Đọc bài mẫu bằng giọng máy Google nữ"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline-offset-2 hover:underline"
        >
          <Volume2 className="h-3.5 w-3.5" />
          Nghe bài mẫu
        </button>
        {editing ? (
          <>
            <button
              type="button"
              onClick={() => {
                onSave(draft)
                setEditing(false)
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline-offset-2 hover:underline"
            >
              <Check className="h-3.5 w-3.5" />
              Lưu bài mẫu
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft(text)
                setEditing(false)
              }}
              className="text-xs font-semibold text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
            >
              Huỷ
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline-offset-2 hover:underline"
          >
            <Pencil className="h-3.5 w-3.5" />
            Sửa bài mẫu
          </button>
        )}
        {isEdited && !editing && (
          <button type="button" onClick={() => onSave("")} className="text-xs font-semibold text-muted-foreground underline-offset-2 hover:text-primary hover:underline">
            Về bản gốc
          </button>
        )}
        {hasSampleOverrides && (
          <button type="button" onClick={copyOverrides} className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground underline-offset-2 hover:text-primary hover:underline">
            <Copy className="h-3.5 w-3.5" />
            {copied ? "Đã copy" : "Copy bản sửa"}
          </button>
        )}
        <button
          type="button"
          onClick={() => setRecorderOpen((v) => !v)}
          title="Mở ghi âm để chuyển giọng nói thành text"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline-offset-2 hover:underline"
        >
          <Mic className="h-3.5 w-3.5" />
          Ghi âm
        </button>
      </div>
      {recorderOpen && (
        <div className="mt-3 space-y-3 rounded-xl border border-border bg-muted/25 p-3">
          <div className="flex flex-wrap items-center gap-2">
            {listening ? (
              <button
                type="button"
                onClick={stopRecording}
                className="inline-flex items-center gap-1.5 rounded-md bg-destructive px-2.5 py-1.5 text-xs font-semibold text-destructive-foreground"
              >
                <Square className="h-3.5 w-3.5" />
                Dừng
              </button>
            ) : (
              <button
                type="button"
                onClick={() => startRecording(false)}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground"
              >
                <Mic className="h-3.5 w-3.5" />
                {transcript ? "Nói lại" : "Bắt đầu nói"}
              </button>
            )}
            {!listening && transcript && (
              <button
                type="button"
                onClick={() => startRecording(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground hover:border-primary/40"
              >
                <MicOff className="h-3.5 w-3.5" />
                Nói tiếp
              </button>
            )}
            <button
              type="button"
              onClick={resetRecording}
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Xoá
            </button>

            {listening && (
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-destructive" />
                Đang nghe · {formatTime(elapsed)}
              </span>
            )}
            {!listening && elapsed > 0 && (
              <span className="ml-auto text-[11px] font-medium text-muted-foreground">
                {formatTime(elapsed)} · {spokenWordCount}/{sampleWordCount} từ{wpm > 0 ? ` · ${wpm} từ/phút` : ""}
              </span>
            )}
          </div>

          <div className="min-h-14 whitespace-pre-wrap rounded-lg bg-background/70 px-3 py-2 text-sm leading-relaxed">
            {transcript || interim ? (
              <>
                <span>{transcript}</span>
                {interim && <span className="text-muted-foreground italic">{transcript ? " " : ""}{interim}</span>}
              </>
            ) : (
              <span className="text-muted-foreground">Bấm “Bắt đầu nói” rồi đọc bài mẫu. Text bạn nói sẽ hiện ở đây.</span>
            )}
          </div>

          {diff && diff.total > 0 && (
            <div className="rounded-lg border border-border bg-background/70 p-3">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className={
                    "rounded-full px-2 py-0.5 text-[11px] font-bold " +
                    (diff.accuracy >= 85
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                      : diff.accuracy >= 60
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                        : "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300")
                  }
                >
                  Khớp bài mẫu {diff.accuracy}%
                </span>
                <span className="text-[11px] text-muted-foreground">
                  đúng {diff.matched}/{diff.total}
                  {diff.missing > 0 ? ` · thiếu ${diff.missing}` : ""}
                  {diff.extra > 0 ? ` · nói thêm ${diff.extra}` : ""}
                </span>
              </div>

              <p className="flex flex-wrap gap-x-1.5 gap-y-1 text-sm leading-relaxed">
                {diff.tokens.map((t, i) => (
                  <span
                    key={`${t.text}-${i}`}
                    className={
                      t.state === "match"
                        ? "font-medium text-emerald-700 dark:text-emerald-300"
                        : t.state === "missing"
                          ? "font-semibold text-red-600 underline decoration-red-400 decoration-2 underline-offset-2 dark:text-red-400"
                          : "text-amber-700 line-through decoration-amber-500 dark:text-amber-300"
                    }
                    title={t.state === "match" ? "Nói đúng" : t.state === "missing" ? "Chưa nói / nói sai từ này" : "Nói thêm, không có trong bài mẫu"}
                  >
                    {t.text}
                  </span>
                ))}
              </p>

              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t border-border pt-2 text-[11px] text-muted-foreground">
                <span className="text-emerald-700 dark:text-emerald-300">■ đúng</span>
                <span className="text-red-600 dark:text-red-400">■ thiếu / sai</span>
                <span className="text-amber-700 dark:text-amber-300">■ nói thêm</span>
              </div>
            </div>
          )}

          {recorderError && <div className="text-xs font-medium text-destructive">{recorderError}</div>}
          <div className="text-[11px] text-muted-foreground">
            So khớp theo từ (không phân biệt hoa/thường, dấu câu; số được đọc thành chữ). Không lưu audio, chỉ chạy trên máy bạn.
          </div>
        </div>
      )}
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
