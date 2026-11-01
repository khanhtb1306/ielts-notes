import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { PenLine, Clock3, ChevronLeft, Copy, Check, X, RotateCcw } from "lucide-react"
import { getPaper } from "@/content/ifa-reading"
import type { IfaTestPaper } from "@/content/ifa-reading"
import { useIfaReading } from "@/stores/ifa-reading"
import { normStr } from "@/lib/grading"
import { PageHeader, PageSection, EmptyState } from "@/components/common/Page"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Check-answer keys are stored in `answers` under a high offset so they never
 *  collide with Reading question numbers on shared papers. */
const CHECK_BASE = 1000
const checkKey = (exN: number, i: number) => CHECK_BASE + exN * 10 + i

/** Rough sentence count — splits on ., ! and ? followed by space/end. */
function countSentences(text: string): number {
  const t = text.trim()
  if (!t) return 0
  return t.split(/[.!?]+(?:\s|$)/).filter((s) => s.trim().length > 0).length
}

function countWords(text: string): number {
  const t = text.trim()
  return t ? t.split(/\s+/).length : 0
}

/** Assemble the task + the learner's answers as plain text to copy out. */
function buildCopyText(paper: IfaTestPaper, drafts: Record<number, string>): string {
  const lines: string[] = []
  lines.push(`${paper.title} — Writing`)
  for (const ex of paper.writing.exercises) {
    lines.push("")
    lines.push(`--- Exercise ${ex.n} (${ex.points} pts) ---`)
    lines.push(ex.instruction)
    if (ex.passage) {
      lines.push(`[${ex.passage.title}]`)
      lines.push(ex.passage.body)
    }
    if (ex.checks) ex.checks.forEach((c) => lines.push(`(Câu hỏi) ${c.prompt} → ${c.answer}`))
    if (ex.topics) ex.topics.forEach((t) => lines.push(`• ${t}`))
    if (ex.notes) ex.notes.forEach((n) => lines.push(`(Yêu cầu) ${n}`))
    lines.push("")
    lines.push("Bài làm:")
    lines.push((drafts[ex.n] ?? "").trim() || "(chưa viết)")
  }
  return lines.join("\n")
}

export function IfaWritingPage() {
  const { paperId = "" } = useParams()
  const paper = getPaper(paperId)
  const progress = useIfaReading((s) => s.papers[paperId])
  const setWriting = useIfaReading((s) => s.setWriting)
  const setAnswer = useIfaReading((s) => s.setAnswer)
  const submit = useIfaReading((s) => s.submit)
  const reset = useIfaReading((s) => s.reset)
  const drafts = progress?.writing ?? {}
  const answers = progress?.answers ?? {}
  const submitted = progress?.submitted ?? false

  if (!paper) {
    return (
      <EmptyState
        icon={PenLine}
        title="Không tìm thấy đề"
        description="Đề luyện tập này không tồn tại."
        action={<Button asChild variant="outline"><Link to="/writing-ifa">← Danh sách đề</Link></Button>}
      />
    )
  }

  const { writing } = paper

  return (
    <div className="mx-auto max-w-4xl space-y-4 pb-10">
      <Link to="/writing-ifa" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        <ChevronLeft className="size-4" /> Danh sách đề
      </Link>
      <PageHeader
        icon={PenLine}
        title={`${paper.title} · Writing`}
        description={
          <span className="inline-flex items-center gap-1">
            <Clock3 className="size-3.5" /> {writing.timeAllowed} · bài tự lưu, sửa lại bất cứ lúc nào
          </span>
        }
        actions={<CopyButton text={buildCopyText(paper, drafts)} />}
      />

      {submitted && (
        <PageSection className="border-primary/30">
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold">Đã nộp bài · đáp án câu hỏi đã hiện bên dưới</span>
            <Button variant="outline" onClick={() => reset(paperId)}><RotateCcw className="size-4" /> Làm lại</Button>
          </div>
        </PageSection>
      )}

      {writing.exercises.map((ex) => {
        const value = drafts[ex.n] ?? ""
        const sentences = countSentences(value)
        const words = countWords(value)
        return (
          <PageSection
            key={ex.n}
            title={`Exercise ${ex.n}`}
            description={`${ex.instruction} (${ex.points} pts)`}
          >
            <div className="space-y-4">
              {ex.passage && (
                <div className="rounded-lg border border-border bg-muted/40 p-4">
                  <p className="mb-2 text-center font-semibold">{ex.passage.title}</p>
                  <p className="content-en text-[15px] leading-relaxed text-foreground/90">
                    {ex.passage.body}
                  </p>
                </div>
              )}

              {ex.checks && ex.checks.length > 0 && (
                <ol className="space-y-3">
                  {ex.checks.map((c, i) => {
                    const key = checkKey(ex.n, i)
                    const val = answers[key] ?? ""
                    const correct = normStr(val) === normStr(c.answer) && val.trim() !== ""
                    return (
                      <li key={i} className="space-y-1.5">
                        <p className="text-sm font-medium">{c.prompt}</p>
                        <input
                          type="text"
                          value={val}
                          disabled={submitted}
                          onChange={(e) => setAnswer(paperId, key, e.target.value)}
                          placeholder="Viết câu trả lời…"
                          className={cn(
                            "w-full rounded-lg border bg-background p-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            submitted ? (correct ? "border-success text-success" : "border-destructive text-destructive") : "border-input"
                          )}
                        />
                        {submitted && (
                          <p className={cn("flex items-center gap-1 text-xs", correct ? "text-success" : "text-muted-foreground")}>
                            {correct ? <Check className="size-3" /> : <X className="size-3 text-destructive" />}
                            Đáp án: <strong className="text-success">{c.answer}</strong>
                          </p>
                        )}
                      </li>
                    )
                  })}
                </ol>
              )}

              {ex.topics && (
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {ex.topics.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              )}

              {ex.notes && ex.notes.length > 0 && (
                <div className="rounded-lg border border-info/30 bg-info-soft p-3 text-sm">
                  <p className="mb-1 font-semibold text-info">Yêu cầu</p>
                  <ul className="list-disc space-y-1 pl-5 text-foreground/80">
                    {ex.notes.map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">Bài làm của tôi</label>
                <textarea
                  value={value}
                  onChange={(e) => setWriting(paperId, ex.n, e.target.value)}
                  rows={ex.n === 1 ? 5 : 10}
                  placeholder="Viết bài của bạn ở đây… (tự động lưu trên thiết bị này, sửa lại bất cứ lúc nào)"
                  className="w-full resize-y rounded-lg border border-input bg-background p-3 text-sm leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{words} từ</span>
                  <span>·</span>
                  <span className={(ex.minWordsPerParagraph ? false : sentences < (ex.minSentences ?? (ex.n === 2 ? 7 : 0))) ? "text-warn" : undefined}>
                    {sentences} câu{!ex.minWordsPerParagraph && ex.n === 2 ? ` (cần ≥ ${ex.minSentences ?? 7})` : ""}
                  </span>
                  {ex.minWordsPerParagraph && <span>· Mỗi đoạn cần ≥ {ex.minWordsPerParagraph} từ</span>}
                </div>
              </div>
            </div>
          </PageSection>
        )
      })}

      <PageSection className="border-primary/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold">{submitted ? "Sao chép bài" : "Nộp & lưu bài"}</p>
            <p className="text-sm text-muted-foreground">
              {submitted
                ? "Copy đề + bài làm của bạn ra văn bản."
                : "Lưu lại bài đã làm và hiện đáp án các câu hỏi Exercise 1."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CopyButton text={buildCopyText(paper, drafts)} />
            {!submitted
              ? <Button onClick={() => submit(paperId)}><Check className="size-4" /> Nộp bài</Button>
              : <Button variant="outline" onClick={() => reset(paperId)}><RotateCcw className="size-4" /> Làm lại</Button>}
          </div>
        </div>
      </PageSection>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Fallback for insecure contexts / older browsers.
      const ta = document.createElement("textarea")
      ta.value = text
      ta.style.position = "fixed"
      ta.style.opacity = "0"
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }
  return (
    <Button variant={copied ? "outline" : "default"} onClick={copy}>
      {copied ? <><Check className="size-4" /> Đã sao chép</> : <><Copy className="size-4" /> Copy bài</>}
    </Button>
  )
}
