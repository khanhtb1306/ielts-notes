import { useEffect, useRef, useState, type TouchEvent } from "react"
import { ArrowLeft, ArrowRight, Check, FileUp, Mic, Play, RotateCcw, Settings2, Square, Volume2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useSpeak } from "@/lib/use-speak"
import { ttsSupported } from "@/lib/tts"
import { ifaFinalTopics, allFinalQuestions, findFinalQuestion, localDay } from "@/lib/ifa-final-speaking"
import { useIfaFinalSpeaking } from "@/stores/ifa-final-speaking"
import type { FinalConfidence } from "@/stores/ifa-final-speaking"
import { parseSpeakingDrafts } from "@/lib/ifa-final-import"
import type { ImportedSpeakingDraft } from "@/lib/ifa-final-import"
import { SpeakingRail, RailSection, RailSelect, RailProgress, RailStrip, RailItem } from "@/components/ifa/SpeakingRail"
import { OptionsSheet } from "@/components/ifa/OptionsSheet"
import { SpeakingTabs } from "@/components/ifa/SpeakingTabs"
import { Select } from "@/components/ui/select"
import type { IfaFinalQuestion } from "@/types/content"

type Mode = "browse" | "daily"
type Phase = "idle" | "prep" | "speaking" | "done"

export function IfaFinalSpeakingPage() {
  const [mode, setMode] = useState<Mode>("browse")
  const [topicId, setTopicId] = useState(ifaFinalTopics[0]?.id ?? "")
  const [questionIndex, setQuestionIndex] = useState(0)
  const [timerOn, setTimerOn] = useState(true)
  const [phase, setPhase] = useState<Phase>("idle")
  const [seconds, setSeconds] = useState(0)
  const [imported, setImported] = useState<ImportedSpeakingDraft[]>([])
  const [importMessage, setImportMessage] = useState("")
  const [sheetOpen, setSheetOpen] = useState(false)
  const swipeStart = useRef<{ x: number; y: number } | null>(null)
  const progress = useIfaFinalSpeaking((s) => s.progress)
  const daily = useIfaFinalSpeaking((s) => s.daily)
  const ensureToday = useIfaFinalSpeaking((s) => s.ensureToday)
  const setCursor = useIfaFinalSpeaking((s) => s.setCursor)
  const recordPractice = useIfaFinalSpeaking((s) => s.recordPractice)
  const saveAnswer = useIfaFinalSpeaking((s) => s.saveAnswer)
  const speak = useSpeak()

  useEffect(() => { ensureToday() }, [ensureToday])
  useEffect(() => {
    if (!timerOn || (phase !== "prep" && phase !== "speaking")) return
    const timer = window.setTimeout(() => {
      if (seconds > 1) setSeconds(seconds - 1)
      else if (phase === "prep") { setPhase("speaking"); setSeconds(30) }
      else { setPhase("done"); setSeconds(0) }
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [phase, seconds, timerOn])

  const topic = ifaFinalTopics.find((t) => t.id === topicId) ?? ifaFinalTopics[0]
  const currentId = daily?.date === localDay() ? daily.ids[daily.cursor] : undefined
  const currentDailyQuestion = currentId ? findFinalQuestion(currentId) : undefined
  const currentQuestion = mode === "daily" ? currentDailyQuestion : topic?.questions[questionIndex]
  const done = allFinalQuestions.filter((q) => progress[q.id]?.status === "confident").length
  const prepared = allFinalQuestions.filter((q) => !!progress[q.id]?.answer.trim()).length

  function switchMode(next: Mode) {
    setMode(next)
    setPhase("idle")
    setSeconds(0)
    if (next === "daily") ensureToday()
  }

  function startSpeaking() {
    setPhase(timerOn ? "prep" : "speaking")
    setSeconds(timerOn ? 5 : 0)
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    const touch = event.touches[0]
    swipeStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = swipeStart.current
    const touch = event.changedTouches[0]
    swipeStart.current = null
    if (mode !== "browse" || !start || !touch || !topic) return

    const dx = touch.clientX - start.x
    const dy = touch.clientY - start.y
    if (Math.abs(dx) < 55 || Math.abs(dx) <= Math.abs(dy) * 1.25) return

    if (dx < 0) {
      setQuestionIndex((i) => Math.min(i + 1, topic.questions.length - 1))
    } else {
      setQuestionIndex((i) => Math.max(i - 1, 0))
    }
  }

  function finishQuestion(status: FinalConfidence) {
    if (!currentDailyQuestion || !daily) return
    recordPractice(currentDailyQuestion.id, status)
    setCursor(daily.cursor + 1)
    setPhase("idle")
    setSeconds(0)
  }

  async function loadDrafts(file?: File) {
    if (!file) return
    try {
      const drafts = parseSpeakingDrafts(await file.text())
      setImported(drafts)
      setImportMessage(drafts.length ? `Tìm thấy ${drafts.length} câu tương ứng. Bạn có thể chọn từng câu hoặc nhập các câu khớp chính xác còn trống.` : "Không tìm thấy câu hỏi tương ứng trong tệp này.")
    } catch {
      setImportMessage("Không đọc được tệp. Hãy thử tệp văn bản .txt.")
    }
  }

  function importExactDrafts() {
    const seen = new Set<string>()
    let added = 0
    for (const draft of imported) {
      if (!draft.exact || seen.has(draft.questionId)) continue
      seen.add(draft.questionId)
      if (useIfaFinalSpeaking.getState().progress[draft.questionId]?.answer.trim()) continue
      saveAnswer(draft.questionId, draft.answer)
      added++
    }
    setImportMessage(`Đã thêm ${added} bản nháp khớp chính xác. Các bài hiện có không bị ghi đè.`)
  }

  if (!ifaFinalTopics.length) return <p>Chưa có danh sách câu hỏi Final Speaking IFA.</p>

  return (
    <div data-toc-skip>
      <SpeakingTabs />
      <div className="lg:flex lg:items-start lg:gap-6 2xl:gap-8">
      <SpeakingRail>
        {/* Mode + topic + question picker stay visible; secondary controls fold away on phones. */}
        <div className="grid grid-cols-2 gap-2">
          <Button variant={mode === "browse" ? "default" : "outline"} size="sm" onClick={() => switchMode("browse")}>Theo chủ đề</Button>
          <Button variant={mode === "daily" ? "default" : "outline"} size="sm" onClick={() => switchMode("daily")}>Mỗi ngày</Button>
        </div>

        {mode === "browse" ? (
          <>
            <RailSection title="Chủ đề">
              <RailSelect id="ifa-final-topic" value={topic.id} options={ifaFinalTopics.map((t) => ({ value: t.id, label: `${t.label} (${t.questions.length})` }))} onChange={(id) => { setTopicId(id); setQuestionIndex(0) }} />
            </RailSection>
            <RailSection title="Câu hỏi">
              <RailStrip>
                {topic.questions.map((q, i) => (
                  <RailItem key={q.id} active={questionIndex === i} onClick={() => setQuestionIndex(i)} title={q.q} trailing={progress[q.id]?.status === "confident" ? <Check className="size-4" /> : undefined}>
                    <span>{i + 1}. </span><span className="content-en hidden lg:inline">{q.q}</span>
                  </RailItem>
                ))}
              </RailStrip>
            </RailSection>
          </>
        ) : (
          <RailSection title="Lượt ôn hôm nay">
            <p className="rounded-lg border border-border bg-card px-3 py-2 text-sm">{daily?.date === localDay() ? `${Math.min(daily.cursor + 1, daily.ids.length)}/${daily.ids.length} câu · ${daily.date}` : "Đang chuẩn bị câu hỏi…"}</p>
            <Button variant="outline" size="sm" className="w-full" onClick={() => { setCursor(0); setPhase("idle") }}><RotateCcw className="size-4" /> Luyện lại lượt này</Button>
            <Button variant="outline" size="sm" className="w-full" onClick={() => { setTimerOn((on) => !on); setPhase("idle") }}>{timerOn ? "Đếm giờ: Bật" : "Đếm giờ: Tắt"}</Button>
          </RailSection>
        )}

        <RailProgress done={done} total={allFinalQuestions.length} label="đã tự tin" />
        <p className="text-xs text-muted-foreground">{prepared}/{allFinalQuestions.length} câu đã có bài của tôi · {ifaFinalTopics.length} chủ đề</p>
        <RailSection title="Bài cũ của tôi">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-input bg-card px-3 py-2 text-sm font-semibold hover:bg-accent">
            <FileUp className="size-4" /> Chọn tệp Sp.txt
            <input type="file" accept=".txt,text/plain" className="sr-only" onChange={(e) => { void loadDrafts(e.target.files?.[0]); e.target.value = "" }} />
          </label>
          {importMessage && <p role="status" className="text-xs text-muted-foreground">{importMessage}</p>}
          {imported.some((draft) => draft.exact) && <Button variant="outline" size="sm" className="w-full" onClick={importExactDrafts}>Nhập bản nháp khớp chính xác còn trống</Button>}
          <p className="text-xs text-muted-foreground">Tệp chỉ được đọc trên thiết bị này; các câu tương tự cần bạn chọn thủ công.</p>
        </RailSection>
      </SpeakingRail>

      {/* Mobile control bar: topic + question nav + options sheet. Hidden from lg. */}
      <div className="mb-4 space-y-2 lg:hidden">
        {mode === "browse" ? (
          <div className="flex items-center gap-2">
            <Select
              id="ifa-final-topic-m"
              className="flex-1"
              value={topic.id}
              options={ifaFinalTopics.map((t) => ({ value: t.id, label: `${t.label} (${t.questions.length})` }))}
              onChange={(id) => { setTopicId(id); setQuestionIndex(0) }}
            />
            <div className="flex items-center gap-1 rounded-lg border border-input bg-card px-1">
              <Button variant="ghost" size="icon" disabled={questionIndex === 0} onClick={() => setQuestionIndex((i) => i - 1)} aria-label="Câu trước"><ArrowLeft className="size-4" /></Button>
              <span className="min-w-[3ch] text-center text-sm font-semibold tabular-nums">{questionIndex + 1}/{topic.questions.length}</span>
              <Button variant="ghost" size="icon" disabled={questionIndex >= topic.questions.length - 1} onClick={() => setQuestionIndex((i) => i + 1)} aria-label="Câu tiếp"><ArrowRight className="size-4" /></Button>
            </div>
            <Button variant="outline" size="icon" aria-label="Tùy chọn" onClick={() => setSheetOpen(true)}><Settings2 className="size-4" /></Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="flex-1 truncate rounded-lg border border-border bg-card px-3 py-2 text-sm">{daily?.date === localDay() ? `Hôm nay · ${Math.min(daily.cursor + 1, daily.ids.length)}/${daily.ids.length} câu` : "Đang chuẩn bị…"}</p>
            <Button variant="outline" size="icon" aria-label="Tùy chọn" onClick={() => setSheetOpen(true)}><Settings2 className="size-4" /></Button>
          </div>
        )}
      </div>

      <OptionsSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <div className="grid grid-cols-2 gap-2">
          <Button variant={mode === "browse" ? "default" : "outline"} size="sm" onClick={() => { switchMode("browse"); setSheetOpen(false) }}>Theo chủ đề</Button>
          <Button variant={mode === "daily" ? "default" : "outline"} size="sm" onClick={() => { switchMode("daily"); setSheetOpen(false) }}>Mỗi ngày</Button>
        </div>
        {mode === "daily" && (
          <>
            <Button variant="outline" size="sm" className="w-full" onClick={() => { setCursor(0); setPhase("idle") }}><RotateCcw className="size-4" /> Luyện lại lượt này</Button>
            <Button variant="outline" size="sm" className="w-full" onClick={() => { setTimerOn((on) => !on); setPhase("idle") }}>{timerOn ? "Đếm giờ: Bật" : "Đếm giờ: Tắt"}</Button>
          </>
        )}
        <RailProgress done={done} total={allFinalQuestions.length} label="đã tự tin" />
        <p className="text-xs text-muted-foreground">{prepared}/{allFinalQuestions.length} câu đã có bài của tôi · {ifaFinalTopics.length} chủ đề</p>
        <RailSection title="Bài cũ của tôi">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-input bg-card px-3 py-2 text-sm font-semibold hover:bg-accent">
            <FileUp className="size-4" /> Chọn tệp Sp.txt
            <input type="file" accept=".txt,text/plain" className="sr-only" onChange={(e) => { void loadDrafts(e.target.files?.[0]); e.target.value = "" }} />
          </label>
          {importMessage && <p role="status" className="text-xs text-muted-foreground">{importMessage}</p>}
          {imported.some((draft) => draft.exact) && <Button variant="outline" size="sm" className="w-full" onClick={importExactDrafts}>Nhập bản nháp khớp chính xác còn trống</Button>}
        </RailSection>
      </OptionsSheet>

      <div className="min-w-0 flex-1 space-y-4">
        {mode === "daily" && !currentDailyQuestion && daily?.date === localDay() ? (
          <Card><CardContent className="space-y-3 p-8 text-center"><h2 className="text-xl font-bold">Hoàn thành lượt ôn hôm nay!</h2><p className="text-sm text-muted-foreground">Đã đi qua {daily.ids.length} câu. Ngày mai app sẽ ưu tiên những câu bạn luyện ít hơn.</p><Button onClick={() => setCursor(0)}>Luyện lại</Button></CardContent></Card>
        ) : currentQuestion && (
          <>
            <Card
              key={currentQuestion.id}
              className="touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <CardHeader className="gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">{mode === "daily" ? currentDailyQuestion?.topicLabel : `${topic.label} · ${topic.vi}`}</p>
                <div className="flex items-start justify-between gap-3">
                  <div><CardTitle className="content-en text-xl leading-snug">{currentQuestion.q}</CardTitle><p className="mt-2 text-sm text-muted-foreground">{currentQuestion.vi}</p></div>
                  {ttsSupported() && <Button variant="outline" size="icon" aria-label="Nghe câu hỏi" onClick={() => speak(currentQuestion.q)}><Volume2 className="size-4" /></Button>}
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {mode === "daily" && (
                  <div className="rounded-xl border border-primary/30 bg-primary-soft p-4">
                    {phase === "idle" ? <><p className="mb-3 text-sm">Nghe câu hỏi, chuẩn bị ý rồi nói thành tiếng. Gợi ý chỉ hiện sau khi bạn trả lời.</p><Button onClick={startSpeaking}>Bắt đầu câu này</Button></> : (
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="font-semibold">{phase === "prep" ? `Chuẩn bị · ${seconds}s` : phase === "speaking" ? (timerOn ? `Đang nói · ${seconds}s` : "Đang nói") : "Đã trả lời · xem lại gợi ý"}</span>
                        {phase !== "done" && <Button variant="outline" size="sm" onClick={() => { setPhase("done"); setSeconds(0) }}>Đã trả lời</Button>}
                      </div>
                    )}
                  </div>
                )}
                <FinalQuestionDetails key={`${mode}-${currentQuestion.id}`} question={currentQuestion} revealed={mode === "browse" || phase === "done"} />
                {mode === "browse" ? (
                  <div className="flex justify-between gap-2 border-t border-border pt-4">
                    <Button variant="outline" disabled={questionIndex === 0} onClick={() => setQuestionIndex((i) => i - 1)}><ArrowLeft className="size-4" /> Trước</Button>
                    <Button disabled={questionIndex >= topic.questions.length - 1} onClick={() => setQuestionIndex((i) => i + 1)}>Câu tiếp <ArrowRight className="size-4" /></Button>
                  </div>
                ) : phase === "done" && (
                  <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                    <p className="w-full text-sm font-semibold">Bạn thấy câu trả lời vừa rồi thế nào?</p>
                    <Button variant="outline" onClick={() => finishQuestion("learning")}>Cần luyện thêm</Button>
                    <Button onClick={() => finishQuestion("confident")}>Đã tự tin <ArrowRight className="size-4" /></Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
      </div>
      {currentQuestion && (
        <FinalSpeakingRecorder
          key={currentQuestion.id}
          question={currentQuestion}
          onStarted={() => { setPhase("speaking"); setSeconds(0) }}
          onCompleted={() => { setPhase("done"); setSeconds(0) }}
          onNext={() => {
            if (mode === "browse") setQuestionIndex((i) => Math.min(i + 1, topic.questions.length - 1))
            else if (daily) { setCursor(daily.cursor + 1); setPhase("idle") }
          }}
          hasNext={mode === "browse" ? questionIndex < topic.questions.length - 1 : !!daily && daily.cursor < daily.ids.length - 1}
        />
      )}
    </div>
  )
}

function FinalQuestionDetails({ question, revealed }: {
  question: IfaFinalQuestion
  revealed: boolean
}) {
  const speak = useSpeak()

  return (
    <div className="space-y-5">
      {revealed && (
        <section className="space-y-3">
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-primary-soft px-3 py-2.5">
                  <h3 className="text-sm font-bold text-primary">Khung trả lời gợi ý</h3>
                  <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[11px] font-semibold text-primary">Từ {question.source}</span>
                </div>
                <p className="text-sm text-muted-foreground">Trả lời trực tiếp → giải thích → thêm chi tiết. Chọn cụm từ phù hợp với bản thân; bấm loa để nghe.</p>
                <div className="divide-y divide-border border-y border-border">
                {question.guide.map((point, i) => (
                  <div key={i} className="py-4 first:pt-3 last:pb-3">
                    <h4 className="text-sm font-semibold leading-relaxed"><span className="mr-1.5 inline-flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">{i + 1}</span>{point.idea}</h4>
                    <div className="mt-2 divide-y divide-border/70 overflow-hidden rounded-lg border border-border sm:grid sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                      {point.phrases.map(({ en, vi, ipa }, j) => (
                        <div key={j} className="flex min-h-16 items-start justify-between gap-2 px-3 py-2.5 text-sm transition-colors hover:bg-muted/40">
                          <div className="min-w-0">
                            <p className="content-en font-semibold">{en}</p>
                            {ipa && <p className="ipa mt-0.5 text-xs text-primary">/{ipa}/</p>}
                            <p className="mt-1 text-xs text-muted-foreground">{vi}</p>
                          </div>
                          {ttsSupported() && (
                            <button type="button" aria-label={`Nghe: ${en}`} onClick={() => speak(en)} className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-primary">
                              <Volume2 className="size-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                </div>
              </div>
              {question.sample && (
                <div className="border-t border-border pt-4">
                  <h4 className="text-sm font-bold">Câu trả lời mẫu</h4>
                  <p className="mt-1 text-xs text-muted-foreground">Dùng để tham khảo cách triển khai, không cần học thuộc.</p>
                  <div className="mt-2 flex items-start gap-2 border-l-2 border-primary bg-muted/30 px-3 py-2.5">
                    <p className="content-en min-w-0 flex-1 text-sm leading-relaxed">{question.sample}</p>
                    {ttsSupported() && <button type="button" aria-label="Nghe câu trả lời mẫu" onClick={() => speak(question.sample!)} className="flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-primary"><Volume2 className="size-4" /></button>}
                  </div>
                </div>
              )}
            </div>
        </section>
      )}
    </div>
  )
}

interface SpeechRecognitionResultLike {
  0?: { transcript?: string }
  isFinal: boolean
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>
}

interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  abort: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

function FinalSpeakingRecorder({
  question,
  onStarted,
  onCompleted,
  onNext,
  hasNext,
}: {
  question: IfaFinalQuestion
  onStarted: () => void
  onCompleted: () => void
  onNext: () => void
  hasNext: boolean
}) {
  const [open, setOpen] = useState(false)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [interim, setInterim] = useState("")
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState("")
  const [showDraft, setShowDraft] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const progress = useIfaFinalSpeaking((s) => s.progress[question.id])
  const recordPractice = useIfaFinalSpeaking((s) => s.recordPractice)

  useEffect(() => {
    if (!listening) return
    const timer = window.setInterval(() => setElapsed((n) => n + 1), 1000)
    return () => window.clearInterval(timer)
  }, [listening])

  useEffect(() => () => {
    recognitionRef.current?.abort()
    recognitionRef.current = null
  }, [])

  function start() {
    const win = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor
      webkitSpeechRecognition?: SpeechRecognitionConstructor
    }
    const Recognition = win.SpeechRecognition ?? win.webkitSpeechRecognition
    if (!Recognition) {
      setError("Trình duyệt chưa hỗ trợ nhận diện giọng nói. Hãy dùng Chrome hoặc Edge.")
      return
    }

    recognitionRef.current?.abort()
    const recognition = new Recognition()
    recognition.lang = "en-GB"
    recognition.continuous = true
    recognition.interimResults = true
    recognition.onresult = (event) => {
      let finalText = ""
      let pending = ""
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i]
        const text = result[0]?.transcript?.trim() ?? ""
        if (!text) continue
        if (result.isFinal) finalText += `${finalText ? " " : ""}${text}`
        else pending += `${pending ? " " : ""}${text}`
      }
      setTranscript(finalText)
      setInterim(pending)
    }
    recognition.onerror = () => {
      setListening(false)
      setError("Không nhận được giọng nói. Kiểm tra quyền microphone rồi thử lại.")
    }
    recognition.onend = () => setListening(false)

    setTranscript("")
    setInterim("")
    setElapsed(0)
    setError("")
    setListening(true)
    recognitionRef.current = recognition
    onStarted()
    try {
      recognition.start()
    } catch {
      setListening(false)
      setError("Không thể mở microphone. Hãy thử lại.")
    }
  }

  function stop(completed = true) {
    recognitionRef.current?.abort()
    recognitionRef.current = null
    setListening(false)
    setInterim("")
    if (completed && (transcript.trim() || elapsed > 0)) {
      recordPractice(question.id, "learning")
      onCompleted()
    }
  }

  function clear() {
    if (listening) stop(false)
    setTranscript("")
    setInterim("")
    setElapsed(0)
    setError("")
  }

  const spoken = `${transcript} ${interim}`.trim()
  const words = spoken ? spoken.split(/\s+/).length : 0
  const wpm = elapsed >= 3 ? Math.round((words / elapsed) * 60) : 0

  return (
    <>
      {open && (
        <aside className="fixed inset-x-3 bottom-[calc(9.5rem+env(safe-area-inset-bottom))] z-40 max-h-[55vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl md:inset-x-auto md:bottom-24 md:right-6 md:w-96">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
            {listening ? <span className="relative flex size-2 shrink-0"><span className="absolute size-2 animate-ping rounded-full bg-destructive/60" /><span className="size-2 rounded-full bg-destructive" /></span> : <Mic className="size-4 shrink-0 text-primary" />}
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">Luyện nói Final</span>
            <span className="text-xs tabular-nums text-muted-foreground">{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}</span>
            <button type="button" onClick={() => { stop(false); setOpen(false) }} className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent" aria-label="Đóng"><X className="size-4" /></button>
          </div>

          <div className="space-y-3 p-3">
            <p className="content-en text-sm font-bold leading-relaxed">{question.q}</p>

            <div className="min-h-20 whitespace-pre-wrap rounded-lg bg-muted/40 p-3 text-sm leading-relaxed">
              {spoken || <span className="text-muted-foreground">{listening ? "Đang nghe… hãy trả lời bằng tiếng Anh." : "Bấm Bắt đầu nói khi bạn đã sẵn sàng."}</span>}
            </div>

            {(elapsed > 0 || words > 0) && (
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>{words} từ</span><span>{elapsed}s</span>{wpm > 0 && <span>{wpm} từ/phút</span>}
              </div>
            )}
            {error && <p className="text-xs font-medium text-destructive">{error}</p>}

            {progress?.answer.trim() && (
              <div>
                <button type="button" onClick={() => setShowDraft((v) => !v)} className="text-xs font-semibold text-primary hover:underline">{showDraft ? "Ẩn bản nháp cũ" : "Xem bản nháp cũ"}</button>
                {showDraft && <p className="content-en mt-2 whitespace-pre-wrap border-l-2 border-primary px-3 text-sm text-muted-foreground">{progress.answer}</p>}
              </div>
            )}

            <div className="flex flex-wrap gap-2 border-t border-border pt-3">
              {listening ? (
                <Button onClick={() => stop(true)}><Square className="size-4" /> Dừng</Button>
              ) : (
                <Button onClick={start}><Play className="size-4" /> {elapsed > 0 ? "Nói lại" : "Bắt đầu nói"}</Button>
              )}
              <Button variant="outline" onClick={clear}><RotateCcw className="size-4" /> Xóa</Button>
              {!listening && elapsed > 0 && hasNext && <Button variant="ghost" className="ml-auto" onClick={onNext}>Câu tiếp <ArrowRight className="size-4" /></Button>}
            </div>
          </div>
        </aside>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Đóng luyện nói" : "Mở luyện nói"}
        title={open ? "Đóng luyện nói" : "Luyện nói"}
        className={cn(
          "fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-40 flex size-14 items-center justify-center rounded-full border shadow-lg transition-all active:scale-95 md:bottom-6 md:right-6",
          listening ? "border-destructive bg-destructive text-destructive-foreground" : open ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-primary hover:bg-primary hover:text-primary-foreground"
        )}
      >
        <Mic className="size-6" />
      </button>
    </>
  )
}
