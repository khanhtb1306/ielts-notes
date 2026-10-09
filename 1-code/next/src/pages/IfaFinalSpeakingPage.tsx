import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, ArrowRight, Check, ClipboardCopy, Eye, EyeOff, FileUp, RotateCcw, Settings2, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useSpeak } from "@/lib/use-speak"
import { ttsSupported } from "@/lib/tts"
import { ifaFinalTopics, allFinalQuestions, findFinalQuestion, matchedHandoutAnswers, localDay } from "@/lib/ifa-final-speaking"
import { useIfaFinalSpeaking } from "@/stores/ifa-final-speaking"
import type { FinalConfidence } from "@/stores/ifa-final-speaking"
import { useIfaSpeaking } from "@/stores/ifa-speaking"
import { parseSpeakingDrafts } from "@/lib/ifa-final-import"
import type { ImportedSpeakingDraft } from "@/lib/ifa-final-import"
import { SpeakingRail, RailSection, RailSelect, RailProgress, RailStrip, RailItem, RailVoice } from "@/components/ifa/SpeakingRail"
import { OptionsSheet } from "@/components/ifa/OptionsSheet"
import { Select } from "@/components/ui/select"
import type { IfaFinalQuestion } from "@/types/content"

const STATUS: { id: FinalConfidence; label: string }[] = [
  { id: "new", label: "Chưa soạn" },
  { id: "learning", label: "Cần luyện" },
  { id: "confident", label: "Đã tự tin" },
]

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
  const progress = useIfaFinalSpeaking((s) => s.progress)
  const daily = useIfaFinalSpeaking((s) => s.daily)
  const ensureToday = useIfaFinalSpeaking((s) => s.ensureToday)
  const setCursor = useIfaFinalSpeaking((s) => s.setCursor)
  const recordPractice = useIfaFinalSpeaking((s) => s.recordPractice)
  const saveAnswer = useIfaFinalSpeaking((s) => s.saveAnswer)
  const lessonAnswers = useIfaSpeaking((s) => s.answers)
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
    <div data-toc-skip className="lg:flex lg:items-start lg:gap-6 2xl:gap-8">
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
        <Button asChild variant="outline" size="sm" className="w-full justify-center">
          <Link to="/speaking-ifa"><ArrowLeft className="size-4" /> Speaking theo lesson</Link>
        </Button>
        <RailVoice />
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
        <Button asChild variant="outline" size="sm" className="w-full justify-center">
          <Link to="/speaking-ifa"><ArrowLeft className="size-4" /> Speaking theo lesson</Link>
        </Button>
        <RailVoice />
      </OptionsSheet>

      <div className="min-w-0 flex-1 space-y-4">
        {mode === "daily" && !currentDailyQuestion && daily?.date === localDay() ? (
          <Card><CardContent className="space-y-3 p-8 text-center"><h2 className="text-xl font-bold">Hoàn thành lượt ôn hôm nay!</h2><p className="text-sm text-muted-foreground">Đã đi qua {daily.ids.length} câu. Ngày mai app sẽ ưu tiên những câu bạn luyện ít hơn.</p><Button onClick={() => setCursor(0)}>Luyện lại</Button></CardContent></Card>
        ) : currentQuestion && (
          <>
            <Card key={currentQuestion.id}>
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
                <FinalQuestionDetails key={`${mode}-${currentQuestion.id}`} question={currentQuestion} revealed={mode === "browse" || phase === "done"} lessonAnswers={lessonAnswers} imported={imported.filter((draft) => draft.questionId === currentQuestion.id)} />
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
  )
}

function FinalQuestionDetails({ question, revealed, lessonAnswers, imported }: {
  question: IfaFinalQuestion
  revealed: boolean
  lessonAnswers: Record<string, { answer: string; title: string }>
  imported: ImportedSpeakingDraft[]
}) {
  const progress = useIfaFinalSpeaking((s) => s.progress[question.id])
  const saveAnswer = useIfaFinalSpeaking((s) => s.saveAnswer)
  const setConfidence = useIfaFinalSpeaking((s) => s.setConfidence)
  const [showHints, setShowHints] = useState(false)
  const [showMyAnswer, setShowMyAnswer] = useState(false)
  const speak = useSpeak()
  const matches = matchedHandoutAnswers(question.id, lessonAnswers)
  const visible = revealed && showHints

  return (
    <div className="space-y-5">
      {revealed && (
        <section className="space-y-3">
          <Button variant="outline" size="sm" onClick={() => setShowHints((v) => !v)} aria-expanded={visible}>
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />} {visible ? "Ẩn gợi ý" : "Xem gợi ý"}
          </Button>
          {visible && (
            <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-4">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold">Ý để phát triển câu trả lời</h3>
                  <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[11px] font-semibold text-primary">Từ {question.source}</span>
                </div>
                <p className="text-xs text-muted-foreground">Trả lời trực tiếp → giải thích → thêm chi tiết. Mở từng ý rồi chọn cụm từ muốn dùng; bấm loa để nghe.</p>
                {question.guide.map((point, i) => (
                  <details key={i} open={i === 0} className="rounded-lg border border-border bg-card p-3 open:border-primary/40">
                    <summary className="cursor-pointer text-sm font-semibold leading-relaxed">{i + 1}. {point.idea}</summary>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {point.phrases.map(({ en, vi, ipa }, j) => (
                        <div key={j} className="flex items-start justify-between gap-2 rounded-md bg-muted/50 p-2.5 text-sm">
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
                  </details>
                ))}
              </div>
              {question.sample && (
                <details className="border-t border-border pt-4"><summary className="cursor-pointer text-sm font-bold">Xem câu trả lời mẫu (tham khảo, không phải bài của bạn)</summary><p className="content-en mt-2 rounded-lg bg-card p-3 text-sm leading-relaxed">{question.sample}</p></details>
              )}
            </div>
          )}
        </section>
      )}
      <section className="space-y-3 border-t border-border pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold">Bài của tôi</h3>{ttsSupported() && !!progress?.answer.trim() && <Button variant="outline" size="sm" onClick={() => speak(progress.answer)}><Volume2 className="size-4" /> Nghe bài của tôi</Button>}</div>
        {revealed ? (
          <>
            <label htmlFor={`answer-${question.id}`} className="text-sm text-muted-foreground">Viết câu trả lời của riêng bạn; nội dung được lưu tự động trên trình duyệt này.</label>
            <textarea id={`answer-${question.id}`} value={progress?.answer ?? ""} onChange={(e) => saveAnswer(question.id, e.target.value)} placeholder="Viết bằng tiếng Anh theo ý của bạn…" rows={5} className="content-en w-full resize-y rounded-lg border border-input bg-card p-3 text-base leading-relaxed outline-none focus:border-primary sm:text-[15px]" />
            {!progress?.answer.trim() && matches.length > 0 && (
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                <p className="font-semibold">Bạn đã lưu {matches.length} câu gần tương ứng trong Speaking theo lesson.</p>
                {matches.map((answer, i) => <div key={i} className="mt-2 space-y-1"><p className="content-en text-muted-foreground">{answer.title}</p><p className="content-en">{answer.answer}</p><Button variant="outline" size="sm" onClick={() => saveAnswer(question.id, answer.answer)}><ClipboardCopy className="size-4" /> Dùng làm bản nháp</Button></div>)}
              </div>
            )}
            {imported.length > 0 && (
              <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3 text-sm">
                <p className="font-semibold">Bản nháp từ tệp của bạn · xem lại trước khi dùng</p>
                {imported.map((draft, i) => <div key={i} className="space-y-2 border-t border-border pt-2">
                  <p className="content-en text-muted-foreground">{draft.sourceQuestion}{!draft.exact && " · câu hỏi tương tự"}</p>
                  <p className="content-en whitespace-pre-wrap">{draft.answer}</p>
                  <Button variant="outline" size="sm" onClick={() => saveAnswer(question.id, draft.answer)}><ClipboardCopy className="size-4" /> Dùng bản nháp này</Button>
                </div>)}
              </div>
            )}
            <div className="flex flex-wrap gap-2">{STATUS.map(({ id, label }) => <Button key={id} size="sm" variant={(progress?.status ?? "new") === id ? "default" : "outline"} onClick={() => setConfidence(question.id, id)}>{label}</Button>)}</div>
          </>
        ) : <>
          <Button variant="outline" size="sm" onClick={() => setShowMyAnswer((v) => !v)} disabled={!progress?.answer.trim()}>{showMyAnswer ? "Ẩn bài của tôi" : "Xem bài đã soạn"}</Button>
          {showMyAnswer && <p className="content-en whitespace-pre-wrap rounded-lg bg-muted/40 p-3 text-sm">{progress?.answer}</p>}
        </>}
      </section>
      {revealed && <p className={cn("text-xs", progress?.answer ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground")}>{progress?.answer ? "Đã lưu tự động" : "Bạn có thể bắt đầu bằng các gợi ý rồi viết lại theo trải nghiệm của mình."}</p>}
    </div>
  )
}
