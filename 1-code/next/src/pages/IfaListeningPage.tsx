import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Check, ChevronLeft, ExternalLink, Headphones, RotateCcw, X } from "lucide-react"
import { getListeningPaper } from "@/content/ifa-listening"
import type { ListeningQuestion } from "@/content/ifa-listening"
import { useIfaReading } from "@/stores/ifa-reading"
import { normStr } from "@/lib/grading"
import { PageSection, EmptyState } from "@/components/common/Page"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function points(q: ListeningQuestion, value = "") {
  if (q.kind === "multi") {
    const selected = value.split(",").filter(Boolean)
    return selected.filter((letter) => q.answers.includes(letter)).length
  }
  if (q.kind === "choice") return value === q.answer ? 1 : 0
  return q.answers.some((a) => normStr(a) === normStr(value)) && value.trim() ? 1 : 0
}

export function IfaListeningPage() {
  const { paperId = "" } = useParams()
  const paper = getListeningPaper(paperId)
  const storageId = `listening:${paperId}` // independent of Reading for Lesson 18
  const progress = useIfaReading((s) => s.papers[storageId])
  const setAnswer = useIfaReading((s) => s.setAnswer)
  const submit = useIfaReading((s) => s.submit)
  const reset = useIfaReading((s) => s.reset)
  const [uploadedAudio, setUploadedAudio] = useState<string | null>(null)
  useEffect(() => () => { if (uploadedAudio) URL.revokeObjectURL(uploadedAudio) }, [uploadedAudio])

  if (!paper) return <EmptyState icon={Headphones} title="Không tìm thấy đề" action={<Button asChild variant="outline"><Link to="/listening-ifa">Danh sách đề</Link></Button>} />

  const answers = progress?.answers ?? {}
  const submitted = progress?.submitted ?? false
  const questions = paper.sections.flatMap((section) => section.groups.flatMap((group) => group.questions))
  const total = questions.reduce((n, q) => n + (q.kind === "multi" ? q.end - q.n + 1 : 1), 0)
  const completed = questions.reduce((n, q) => n + (q.kind === "multi" ? answers[q.n]?.split(",").filter(Boolean).length ?? 0 : answers[q.n]?.trim() ? 1 : 0), 0)
  const score = questions.reduce((n, q) => n + points(q, answers[q.n]), 0)
  const base = (import.meta.env.BASE_URL || "/").replace(/\/?$/, "/")

  return (
    <div className="mx-auto max-w-4xl space-y-4 pb-10">
      <Link to="/listening-ifa" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="size-4" /> Danh sách đề</Link>
      <h2 className="text-xl font-bold">{paper.title} · Listening</h2>
      {paper.source && <p className="text-sm text-muted-foreground">Bài luyện tương tự theo chủ đề IFA · <a href={paper.source} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary underline underline-offset-2">Nguồn đề và transcript <ExternalLink className="size-3" /></a></p>}

      {submitted && <PageSection>
        <div className="flex items-center justify-between gap-3">
          <span className="font-semibold">Kết quả: {score}/{total} câu đúng</span>
          <Button variant="outline" onClick={() => reset(storageId)}><RotateCcw className="size-4" /> Làm lại</Button>
        </div>
      </PageSection>}

      {!paper.sections.some((s) => s.audio) && <PageSection>
        <p className="mb-2 text-sm text-muted-foreground">Bài gốc LangGo không cung cấp file nghe. Nếu bạn có bản ghi, chọn tệp âm thanh trên thiết bị để luyện bài này.</p>
        <input type="file" accept="audio/*" aria-label="Chọn file nghe" className="max-w-full text-sm" onChange={(e) => { const f = e.target.files?.[0]; if (f) setUploadedAudio(URL.createObjectURL(f)) }} />
        {uploadedAudio && <audio controls src={uploadedAudio} className="mt-3 w-full" />}
      </PageSection>}

      {paper.sections.map((section) => <div key={section.title} className="space-y-3">
        <PageSection title={section.title}>
          {section.audio && <audio controls preload="none" src={`${base}${section.audio}`} className="w-full" aria-label={`Nghe ${section.title}`} />}
          {!section.audio && !uploadedAudio && <p className="text-sm text-muted-foreground">Chưa có audio cho phần này.</p>}
        </PageSection>
        {section.groups.map((group) => <PageSection key={group.title} title={group.title} description={group.instruction}>
          {group.context && <p className="mb-4 rounded-lg bg-muted/50 p-3 text-sm">{group.context}</p>}
          {group.notes ? <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm">
            <h4 className="mb-3 text-center font-bold">{group.notes.title}</h4>
            {group.notes.sections.map((noteSection, sectionIndex) => <div key={sectionIndex} className="mb-3 last:mb-0">
              {noteSection.heading && <h5 className="mb-1 font-bold">{noteSection.heading}</h5>}
              <ul className="ml-5 list-disc space-y-2">
                {noteSection.rows.map((row, rowIndex) => {
                  const question = group.questions.find((q) => q.n === row.question)
                  const secondQuestion = group.questions.find((q) => q.n === row.secondQuestion)
                  return <li key={rowIndex}>
                    {row.before}
                    {question?.kind === "fill" && <InlineNoteGap q={question} value={answers[question.n] ?? ""} submitted={submitted} onChange={(value) => setAnswer(storageId, question.n, value)} />}
                    {row.after}
                    {secondQuestion?.kind === "fill" && <InlineNoteGap q={secondQuestion} value={answers[secondQuestion.n] ?? ""} submitted={submitted} onChange={(value) => setAnswer(storageId, secondQuestion.n, value)} />}
                    {row.ending}
                  </li>
                })}
              </ul>
            </div>)}
          </div> : <ol className="space-y-4">{group.questions.map((q) => <ListeningRow
            key={q.n} q={q} value={answers[q.n] ?? ""} submitted={submitted}
            onChange={(v) => setAnswer(storageId, q.n, v)}
          />)}</ol>}
        </PageSection>)}
      </div>)}

      {!submitted && <div className="sticky bottom-[calc(5rem+env(safe-area-inset-bottom))] z-10 flex items-center justify-between gap-3 rounded-xl border bg-card/95 p-3 shadow-lift backdrop-blur md:bottom-4">
        <span className="text-sm text-muted-foreground">Đã làm {completed}/{total} câu</span>
        <Button disabled={!completed} onClick={() => submit(storageId)}>Nộp bài & chấm</Button>
      </div>}
    </div>
  )
}

function InlineNoteGap({ q, value, submitted, onChange }: {
  q: Extract<ListeningQuestion, { kind: "fill" }>; value: string; submitted: boolean; onChange: (v: string) => void
}) {
  const correct = points(q, value) === 1
  return <span className="inline">
    <span className="font-semibold">{q.n} </span>
    <input type="text" aria-label={`Câu ${q.n}`} value={value} disabled={submitted}
      onChange={(e) => onChange(e.target.value)} size={Math.max(8, value.length + 2)}
      className={cn("mx-1 inline-block min-w-20 max-w-[12rem] border-0 border-b border-dotted bg-transparent px-1 text-center outline-none focus:border-solid", submitted ? correct ? "border-success text-success" : "border-destructive text-destructive" : "border-foreground/50 focus:border-primary")} />
    {submitted && !correct && <span className="text-success"> ({q.answers[0]})</span>}
  </span>
}

function ListeningRow({ q, value, submitted, onChange }: {
  q: ListeningQuestion; value: string; submitted: boolean; onChange: (v: string) => void
}) {
  const correct = points(q, value) === (q.kind === "multi" ? q.end - q.n + 1 : 1)
  const selected = q.kind === "multi" ? value.split(",").filter(Boolean) : []
  const answer = q.kind === "multi" ? q.answers.join(", ") : q.kind === "choice" ? q.answer : q.answers[0]
  const [before, after = ""] = q.prompt.split(/_{2,}/)

  return <li className={q.kind === "choice" ? "rounded-xl border border-border bg-muted/20 p-3 sm:p-4" : undefined}>
    <div className="flex items-start gap-2">
      <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold", submitted ? correct ? "bg-success-soft text-success" : "bg-destructive/15 text-destructive" : "bg-primary-soft text-primary")}>{submitted ? correct ? <Check className="size-3" /> : <X className="size-3" /> : q.kind === "multi" ? `${q.n}–${q.end}` : q.n}</span>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="font-medium">{before}{q.kind === "fill" && <input
          type="text" aria-label={`Câu ${q.n}`} value={value} disabled={submitted}
          onChange={(e) => onChange(e.target.value)} size={Math.max(8, value.length + 2)}
          className={cn("mx-1 inline-block min-w-20 border-0 border-b border-dotted bg-transparent px-1 text-center outline-none focus:border-solid", submitted ? correct ? "border-success text-success" : "border-destructive text-destructive" : "border-foreground/50 focus:border-primary")}
        />}{q.kind === "fill" && after}</div>

        {q.kind === "choice" && <div className="grid gap-1.5">{q.options.map((option) => <label key={option.id} className={cn("flex cursor-pointer gap-2 rounded-lg border px-3 py-2 text-sm", submitted && option.id === q.answer && "border-success bg-success-soft", submitted && value === option.id && !correct && "border-destructive bg-destructive/10", !submitted && value === option.id && "border-primary bg-primary-soft")}>
          <input type="radio" name={`listening-q-${q.n}`} checked={value === option.id} disabled={submitted} onChange={() => onChange(option.id)} />
          <span><strong>{option.id}.</strong> {option.text}</span>
        </label>)}</div>}

        {q.kind === "multi" && <div className="grid gap-1.5 sm:grid-cols-2">{q.options.map((option) => <label key={option.id} className={cn("flex cursor-pointer gap-2 rounded-lg border px-3 py-2 text-sm", submitted && q.answers.includes(option.id) && "border-success bg-success-soft", submitted && selected.includes(option.id) && !q.answers.includes(option.id) && "border-destructive bg-destructive/10", !submitted && selected.includes(option.id) && "border-primary bg-primary-soft")}>
          <input type="checkbox" checked={selected.includes(option.id)} disabled={submitted || (!selected.includes(option.id) && selected.length >= q.end - q.n + 1)} onChange={() => onChange(selected.includes(option.id) ? selected.filter((x) => x !== option.id).join(",") : [...selected, option.id].join(","))} />
          <span><strong>{option.id}.</strong> {option.text}</span>
        </label>)}</div>}
        {submitted && !correct && <p className="text-xs text-muted-foreground">Đáp án: <strong className="text-success">{answer}</strong></p>}
      </div>
    </div>
  </li>
}
