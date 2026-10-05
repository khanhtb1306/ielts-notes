import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, ArrowRight, Check, ClipboardCopy, Eye, EyeOff, RotateCcw, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useSpeak } from "@/lib/use-speak"
import { ttsSupported } from "@/lib/tts"
import { ifaFinalTopics, allFinalQuestions, findFinalQuestion, matchedHandoutAnswers, localDay } from "@/lib/ifa-final-speaking"
import { useIfaFinalSpeaking } from "@/stores/ifa-final-speaking"
import type { FinalConfidence } from "@/stores/ifa-final-speaking"
import { useIfaSpeaking } from "@/stores/ifa-speaking"
import { SpeakingRail, RailSection, RailSelect, RailProgress, RailStrip, RailItem, RailVoice } from "@/components/ifa/SpeakingRail"
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
  const progress = useIfaFinalSpeaking((s) => s.progress)
  const daily = useIfaFinalSpeaking((s) => s.daily)
  const ensureToday = useIfaFinalSpeaking((s) => s.ensureToday)
  const setCursor = useIfaFinalSpeaking((s) => s.setCursor)
  const recordPractice = useIfaFinalSpeaking((s) => s.recordPractice)
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

  if (!ifaFinalTopics.length) return <p>Chưa có danh sách câu hỏi Final Speaking IFA.</p>

  return (
    <div data-toc-skip className="lg:flex lg:items-start lg:gap-6 2xl:gap-8">
      <SpeakingRail>
        <Button asChild variant="outline" size="sm" className="w-full justify-center">
          <Link to="/speaking-ifa"><ArrowLeft className="size-4" /> Speaking theo lesson</Link>
        </Button>
        <RailSection title="Cách luyện">
          <div className="grid grid-cols-2 gap-2">
            <Button variant={mode === "browse" ? "default" : "outline"} size="sm" onClick={() => switchMode("browse")}>Theo chủ đề</Button>
            <Button variant={mode === "daily" ? "default" : "outline"} size="sm" onClick={() => switchMode("daily")}>Mỗi ngày</Button>
          </div>
        </RailSection>
        <RailProgress done={done} total={allFinalQuestions.length} label="đã tự tin" />
        <p className="text-xs text-muted-foreground">{prepared}/{allFinalQuestions.length} câu đã có bài của tôi · {ifaFinalTopics.length} chủ đề</p>
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
        <RailVoice />
      </SpeakingRail>

      <div className="mt-5 min-w-0 flex-1 space-y-4 lg:mt-0">
        {mode === "daily" && !currentDailyQuestion && daily?.date === localDay() ? (
          <Card><CardContent className="space-y-3 p-8 text-center"><h2 className="text-xl font-bold">Hoàn thành lượt ôn hôm nay!</h2><p className="text-sm text-muted-foreground">Đã đi qua {daily.ids.length} câu. Ngày mai app sẽ ưu tiên những câu bạn luyện ít hơn.</p><Button onClick={() => setCursor(0)}>Luyện lại</Button></CardContent></Card>
        ) : currentQuestion && (
          <>
            <p className="text-sm font-semibold text-primary">{mode === "daily" ? currentDailyQuestion?.topicLabel : `${topic.label} · ${topic.vi}`}</p>
            <Card key={currentQuestion.id}>
              <CardHeader className="gap-3">
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
                <FinalQuestionDetails key={`${mode}-${currentQuestion.id}`} question={currentQuestion} revealed={mode === "browse" || phase === "done"} lessonAnswers={lessonAnswers} />
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

function FinalQuestionDetails({ question, revealed, lessonAnswers }: {
  question: IfaFinalQuestion
  revealed: boolean
  lessonAnswers: Record<string, { answer: string; title: string }>
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
              <div><h3 className="mb-2 text-sm font-bold">Ý để triển khai</h3><ul className="list-inside list-disc space-y-1 text-sm">{question.ideas.map((idea) => <li key={idea}>{idea}</li>)}</ul></div>
              <div><h3 className="mb-2 text-sm font-bold">Khung trả lời</h3><p className="content-en rounded-lg bg-card p-3 text-sm">{question.frame}</p></div>
              <div><h3 className="mb-2 text-sm font-bold">Cụm từ nên thử</h3><div className="flex flex-wrap gap-2">{question.words.map((word) => <span key={word} className="content-en rounded-full border border-border bg-card px-2.5 py-1 text-sm">{word}</span>)}</div></div>
            </div>
          )}
        </section>
      )}
      <section className="space-y-3 border-t border-border pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold">Bài của tôi</h3>{ttsSupported() && !!progress?.answer.trim() && <Button variant="outline" size="sm" onClick={() => speak(progress.answer)}><Volume2 className="size-4" /> Nghe bài của tôi</Button>}</div>
        {revealed ? (
          <>
            <label htmlFor={`answer-${question.id}`} className="text-sm text-muted-foreground">Viết câu trả lời của riêng bạn; nội dung được lưu tự động trên trình duyệt này.</label>
            <textarea id={`answer-${question.id}`} value={progress?.answer ?? ""} onChange={(e) => saveAnswer(question.id, e.target.value)} placeholder="Viết bằng tiếng Anh theo ý của bạn…" rows={5} className="content-en w-full resize-y rounded-lg border border-input bg-card p-3 text-[15px] leading-relaxed outline-none focus:border-primary" />
            {!progress?.answer.trim() && matches.length > 0 && (
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                <p className="font-semibold">Bạn đã lưu {matches.length} câu gần tương ứng trong Speaking theo lesson.</p>
                {matches.map((answer, i) => <div key={i} className="mt-2 space-y-1"><p className="content-en text-muted-foreground">{answer.title}</p><p className="content-en">{answer.answer}</p><Button variant="outline" size="sm" onClick={() => saveAnswer(question.id, answer.answer)}><ClipboardCopy className="size-4" /> Dùng làm bản nháp</Button></div>)}
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
