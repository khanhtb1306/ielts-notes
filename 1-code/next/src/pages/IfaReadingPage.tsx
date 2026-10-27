import { useMemo } from "react"
import { Link, useParams } from "react-router-dom"
import { BookOpenCheck, Check, ChevronLeft, Clock3, RotateCcw, X } from "lucide-react"
import { getPaper } from "@/content/ifa-reading"
import type { ReadingQuestion } from "@/content/ifa-reading"
import { useIfaReading } from "@/stores/ifa-reading"
import { normStr } from "@/lib/grading"
import { PageHeader, PageSection, EmptyState } from "@/components/common/Page"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function isCorrect(q: ReadingQuestion, value: string | undefined): boolean {
  if (!value) return false
  if (q.kind === "choice") return value === q.answer
  const user = normStr(value)
  return q.answers.map(normStr).includes(user)
}

export function IfaReadingPage() {
  const { paperId = "" } = useParams()
  const paper = getPaper(paperId)
  const progress = useIfaReading((s) => s.papers[paperId])
  const setAnswer = useIfaReading((s) => s.setAnswer)
  const submit = useIfaReading((s) => s.submit)
  const reset = useIfaReading((s) => s.reset)

  const answers = progress?.answers ?? {}
  const submitted = progress?.submitted ?? false

  const allQuestions = useMemo(
    () => paper?.reading.sections.flatMap((s) => s.questions) ?? [],
    [paper]
  )
  const answeredCount = allQuestions.filter((q) => answers[q.n]?.trim()).length
  const score = useMemo(
    () => allQuestions.filter((q) => isCorrect(q, answers[q.n])).length,
    [allQuestions, answers]
  )

  if (!paper) {
    return (
      <EmptyState
        icon={BookOpenCheck}
        title="Không tìm thấy đề"
        description="Đề luyện tập này không tồn tại."
        action={<Button asChild variant="outline"><Link to="/reading-ifa">← Danh sách đề</Link></Button>}
      />
    )
  }

  const { reading } = paper
  const passageById = (id: string) => reading.passages.find((p) => p.id === id)

  return (
    <div className="mx-auto max-w-5xl space-y-4 pb-10">
      <Link to="/reading-ifa" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        <ChevronLeft className="size-4" /> Danh sách đề
      </Link>
      <PageHeader
        icon={BookOpenCheck}
        title={paper.title}
        description={
          <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1">
              <Clock3 className="size-3.5" /> {reading.timeAllowed}
            </span>
            <span>{reading.totalQuestions} câu · {reading.passages.length} bài đọc</span>
          </span>
        }
      />

      {submitted && (
        <PageSection className="border-primary/30">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Kết quả Reading</p>
              <p className="text-2xl font-bold">
                {score}<span className="text-base font-medium text-muted-foreground">/{reading.totalQuestions} câu đúng</span>
              </p>
            </div>
            <Button variant="outline" onClick={() => reset(paperId)}>
              <RotateCcw className="size-4" /> Làm lại
            </Button>
          </div>
        </PageSection>
      )}

      {reading.sections.map((section, si) => {
        const passage = passageById(section.passageId)
        // Show each passage once, above the first section that uses it.
        const prevPassage = si > 0 ? reading.sections[si - 1].passageId : null
        const showPassage = passage && section.passageId !== prevPassage
        return (
          <div key={section.group} className="space-y-4">
            {showPassage && passage && (
              <PageSection title={passage.label} description={passage.title}>
                <div className="content-en space-y-3 text-[15px] leading-relaxed text-foreground/90">
                  {passage.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </PageSection>
            )}

            <PageSection title={section.group} description={section.instruction}>
              <ol className="space-y-4">
                {section.questions.map((q) => (
                  <QuestionRow
                    key={q.n}
                    q={q}
                    value={answers[q.n]}
                    submitted={submitted}
                    onChange={(v) => setAnswer(paperId, q.n, v)}
                  />
                ))}
              </ol>
            </PageSection>
          </div>
        )
      })}

      {!submitted && (
        <div className="sticky bottom-[calc(5rem+env(safe-area-inset-bottom))] z-10 flex items-center justify-between gap-3 rounded-xl border border-border bg-card/95 p-3 shadow-lift backdrop-blur md:bottom-4">
          <span className="text-sm text-muted-foreground">
            Đã làm {answeredCount}/{reading.totalQuestions} câu
          </span>
          <Button onClick={() => submit(paperId)} disabled={answeredCount === 0}>
            Nộp bài &amp; chấm
          </Button>
        </div>
      )}
    </div>
  )
}

function QuestionRow({
  q,
  value,
  submitted,
  onChange,
}: {
  q: ReadingQuestion
  value: string | undefined
  submitted: boolean
  onChange: (v: string) => void
}) {
  const ok = isCorrect(q, value)

  return (
    <li className="space-y-2">
      <div className="flex gap-2">
        <span
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
            submitted
              ? ok
                ? "bg-success-soft text-success"
                : "bg-destructive/15 text-destructive"
              : "bg-primary-soft text-primary"
          )}
        >
          {submitted ? (ok ? <Check className="size-3.5" /> : <X className="size-3.5" />) : q.n}
        </span>
        <p className="font-medium">{q.prompt}</p>
      </div>

      <div className="pl-8">
        {q.kind === "fill" ? (
          <FillInput q={q} value={value} submitted={submitted} ok={ok} onChange={onChange} />
        ) : (
          <div className="grid gap-1.5">
            {q.options.map((o) => {
              const chosen = value === o.id
              const isAnswer = submitted && o.id === q.answer
              return (
                <label
                  key={o.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                    submitted && isAnswer && "border-success bg-success-soft",
                    submitted && chosen && !isAnswer && "border-destructive bg-destructive/10",
                    !submitted && chosen && "border-primary bg-primary-soft",
                    !submitted && !chosen && "border-border hover:border-primary/50",
                    submitted && "cursor-default"
                  )}
                >
                  <input
                    type="radio"
                    name={`q-${q.n}`}
                    className="sr-only"
                    checked={chosen}
                    disabled={submitted}
                    onChange={() => onChange(o.id)}
                  />
                  <span className="font-semibold">{o.id}.</span>
                  <span>{o.text}</span>
                </label>
              )
            })}
          </div>
        )}
      </div>
    </li>
  )
}

function FillInput({
  q,
  value,
  submitted,
  ok,
  onChange,
}: {
  q: ReadingQuestion & { kind: "fill" }
  value: string | undefined
  submitted: boolean
  ok: boolean
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-1">
      <input
        type="text"
        value={value ?? ""}
        disabled={submitted}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nhập đáp án…"
        className={cn(
          "w-full max-w-sm rounded-lg border bg-background px-3 py-1.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
          submitted
            ? ok
              ? "border-success text-success"
              : "border-destructive text-destructive"
            : "border-input"
        )}
      />
      {submitted && !ok && (
        <p className="text-xs text-muted-foreground">
          Đáp án: <span className="font-semibold text-success">{q.answers[0]}</span>
        </p>
      )}
    </div>
  )
}
