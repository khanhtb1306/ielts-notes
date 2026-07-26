import { useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useData } from "@/stores/data"
import { useHistory, type LightGradedItem } from "@/stores/history"
import { usePractice, uid } from "@/stores/practice"
import { samplePool } from "@/lib/sample-pool"
import { normStr } from "@/lib/grading"
import { displayLabel } from "@/lib/topic-label"
import { ArrowLeft, PartyPopper, Repeat, X, Check } from "lucide-react"

export function PracticeResultPage() {
  const { sessionId = "" } = useParams()
  const navigate = useNavigate()
  const { topicLabels, topicsIndex } = useData()
  const entry = useHistory((s) => s.entries.find((e) => e.id === sessionId))
  const save = usePractice((s) => s.save)

  const pct = useMemo(() => (entry?.total ? Math.round((entry.score / entry.total) * 100) : 0), [entry])

  if (!entry) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-destructive">Không có kết quả cho phiên này.</CardContent>
      </Card>
    )
  }

  const wrong = entry.detail.filter((d) => !d.ok)

  function retry() {
    // Fixed papers (real mock or fixed sets) store their exact question refs and
    // a stable seed, so reuse them verbatim to reproduce the same paper. Only fall
    // back to re-sampling when there is a topic mix but no stored questions.
    const questions =
      entry!.questions && entry!.questions.length
        ? entry!.questions
        : samplePool(topicsIndex, entry!.config).questions
    const newId = uid()
    save({
      id: newId,
      config: entry!.config,
      presetId: entry!.presetId,
      presetLabel: entry!.presetLabel,
      questions,
      answers: {},
      startedAt: Date.now(),
    })
    navigate(`/practice/runner/${newId}`)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-gradient-to-br from-orange-500/10 via-card to-card p-6">
        <Badge variant="secondary" className="mb-2">Kết quả</Badge>
        <div className="flex items-baseline gap-3">
          <div className="text-5xl font-bold text-primary tabular-nums">{pct}%</div>
          <div className="text-lg text-muted-foreground">
            · {entry.score}/{entry.total} câu đúng
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 items-center">
          <Button variant="outline" onClick={() => navigate("/final")}>
            <ArrowLeft className="h-4 w-4" /> Về Final Test
          </Button>
          <Button onClick={retry}>
            <Repeat className="h-4 w-4" /> Làm lại đề này
          </Button>
          <span className="ml-auto text-xs text-muted-foreground">
            Preset: {entry.presetLabel || "custom"} · Submit: {new Date(entry.submittedAt).toLocaleString()}
          </span>
        </div>
      </div>

      <section>
        <h3 className="text-lg font-semibold mb-3">Breakdown theo topic</h3>
        <Card>
          <CardContent className="p-4 space-y-2">
            {Object.entries(entry.breakdown).map(([topic, b]) => {
              const p = b.total ? Math.round((b.correct / b.total) * 100) : 0
              const label = displayLabel(topicLabels[topic], topic)
              return (
                <div key={topic} className="grid grid-cols-[1fr_120px_100px] gap-3 items-center">
                  <div className="font-medium text-sm truncate">{label}</div>
                  <Progress value={p} />
                  <div className="text-sm text-muted-foreground tabular-nums text-right">
                    {b.correct}/{b.total} · {p}%
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Xem lại toàn bộ đề</h3>
        <Card>
          <CardContent className="p-6">
            <FullPaperReview detail={entry.detail} />
          </CardContent>
        </Card>
      </section>

      {wrong.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center flex items-center justify-center gap-2">
            <PartyPopper className="h-5 w-5 text-primary" />
            <span className="font-semibold">Hoàn hảo! Không có câu sai.</span>
          </CardContent>
        </Card>
      ) : (
        <section>
          <h3 className="text-lg font-semibold mb-3">Câu sai ({wrong.length})</h3>
          <div className="space-y-3">
            {wrong.map((d) => (
              <Card key={d.i}>
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="outline">{displayLabel(topicLabels[d.topic], d.topic)}</Badge>
                    <Badge variant="destructive" className="gap-1">
                      <X className="h-3 w-3" /> sai
                    </Badge>
                    {d.q.generated && (
                      <Badge variant="outline" className="border-amber-400 bg-amber-500/15 text-[10px] text-amber-700 dark:text-amber-300">
                        AI sinh
                      </Badge>
                    )}
                  </div>
                  <div
                    className="markdown-note mb-3"
                    dangerouslySetInnerHTML={{ __html: d.q.promptHtml || `<p>${d.q.prompt || ""}</p>` }}
                  />
                  <div className="grid gap-2 sm:grid-cols-2 text-sm">
                    <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3">
                      <div className="font-semibold text-xs uppercase tracking-wide text-destructive mb-1">
                        Bạn trả lời
                      </div>
                      <div className="font-mono text-xs break-all">{formatAnswer(d.ans)}</div>
                    </div>
                    <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-3">
                      <div className="font-semibold text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-300 mb-1">
                        Đáp án đúng <Check className="inline h-3 w-3" />
                      </div>
                      <div className="font-mono text-xs break-all">{formatCorrect(d.q)}</div>
                    </div>
                  </div>
                  {d.q.explanationHtml && (
                    <details className="mt-3 rounded-lg border border-border bg-muted/20" open>
                      <summary className="cursor-pointer px-4 py-2 font-medium text-sm">Giải thích</summary>
                      <div
                        className="markdown-note px-4 pb-3 pt-1 text-sm"
                        dangerouslySetInnerHTML={{ __html: d.q.explanationHtml }}
                      />
                    </details>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function FullPaperReview({ detail }: { detail: LightGradedItem[] }) {
  const groups: { title: string; items: typeof detail }[] = []
  for (const item of detail) {
    const title = item.q.title || "Final Test"
    const last = groups[groups.length - 1]
    if (last && last.title === title) last.items.push(item)
    else groups.push({ title, items: [item] as typeof detail })
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.title} className="space-y-3 border-t border-border pt-5 first:border-t-0 first:pt-0">
          <h4 className="text-base font-extrabold">{reviewTitle(group.title)}</h4>
          {renderReviewGroup(group)}
        </section>
      ))}
    </div>
  )
}

function reviewTitle(title: string): string {
  if (title.startsWith("I -")) return "I - Define the word classes of the underlined words as they are used in the sentences below."
  if (title.startsWith("II -")) return "II - Choose the correct answer."
  if (title.startsWith("III -")) return "III - Complete the sentences with A / AN or THE. You can write NONE for a blank."
  if (title.startsWith("IV -")) return "IV - Change the verb in the brackets to the correct tense."
  return title
}

function renderReviewGroup(group: { title: string; items: LightGradedItem[] }) {
  const title = group.title
  if (title.startsWith("I -")) return <WordClassReview items={group.items} />
  if (title.startsWith("II -")) return <McqReview items={group.items} />
  if (title.startsWith("III -")) return <FillReview items={group.items} showBlankNumbers />
  if (title.startsWith("IV -")) return <FillReview items={group.items} showItemNumbers />
  return (
    <div className="space-y-3">
      {group.items.map((item, i) => <ReviewQuestion key={item.i} item={item} index={i + 1} />)}
    </div>
  )
}

type ReviewItem = LightGradedItem

function WordClassReview({ items }: { items: ReviewItem[] }) {
  const columns = items[0]?.q.options?.map((o) => o.text) || ["Noun", "Verb", "Adjective", "Adverb"]
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="py-2 pr-4 text-left font-bold">Sentences</th>
            {columns.map((c) => <th key={c} className="w-28 py-2 text-center font-bold">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const user = String(item.ans ?? "")
            const correct = String(item.q.correctAnswer?.[0] ?? "")
            return (
              <tr key={item.i} className="border-b border-border/70">
                <td className="py-3 pr-4 font-semibold text-foreground" dangerouslySetInnerHTML={{ __html: item.q.promptHtml }} />
                {columns.map((c) => {
                  const opt = item.q.options?.find((o) => o.text === c)
                  const id = String(opt?.id ?? c)
                  const isUser = user === id || user === c
                  const isCorrect = correct === id || correct === c
                  return (
                    <td key={c} className="py-3 text-center">
                      <span className={choiceMarkClass(isUser, isCorrect)}>{isUser || isCorrect ? "✓" : "○"}</span>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function McqReview({ items }: { items: ReviewItem[] }) {
  return (
    <div className="grid gap-x-10 gap-y-5 md:grid-cols-2">
      {items.map((item) => (
        <div key={item.i} className="space-y-2">
          <div className="markdown-note" dangerouslySetInnerHTML={{ __html: item.q.promptHtml }} />
          <div className="grid gap-1 text-sm">
            {(item.q.options || []).map((opt) => {
              const user = String(item.ans ?? "")
              const correct = String(item.q.correctAnswer?.[0] ?? "")
              const isUser = user === String(opt.id)
              const isCorrect = correct === String(opt.id)
              return (
                <div key={String(opt.id)} className={`rounded-md border px-2 py-1 ${choiceBoxClass(isUser, isCorrect)}`}>
                  {opt.text} {isUser && isCorrect ? "✓" : isUser ? "✗" : isCorrect ? "✓" : ""}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function FillReview({ items, showBlankNumbers = false, showItemNumbers = false }: { items: ReviewItem[]; showBlankNumbers?: boolean; showItemNumbers?: boolean }) {
  let blankCursor = 1
  return (
    <div className="space-y-3 text-base leading-8">
      {items.map((item, itemIndex) => {
        const start = blankCursor
        blankCursor += item.q.blanks?.length || 1
        return (
          <p key={item.i} className="whitespace-pre-wrap">
            {showItemNumbers && <span className="mr-1 tabular-nums">{itemIndex + 1}.</span>}
            <FillInlineReview item={item} startNumber={showBlankNumbers ? start : undefined} />
          </p>
        )
      })}
    </div>
  )
}

function ReviewQuestion({ item, index }: { item: ReviewItem; index: number }) {
  return (
    <div className="space-y-2">
      <div className="font-semibold">{index}.</div>
      <div className="markdown-note" dangerouslySetInnerHTML={{ __html: item.q.promptHtml }} />
      <AnswerReview item={item} />
    </div>
  )
}

function FillInlineReview({ item, startNumber }: { item: ReviewItem; startNumber?: number }) {
  const parts = splitBlankHtml(stripBlockHtml(item.q.bodyHtml || item.q.promptHtml || item.q.prompt || ""))
  const arr = Array.isArray(item.ans) ? item.ans : []
  return (
    <span>
      {parts.map((p, i) =>
        typeof p === "string" ? (
          <span key={i}>{htmlToPlainText(p)}</span>
        ) : (
          <span key={`b-${p}`} className="mx-1 inline-flex items-baseline gap-1 whitespace-nowrap">
            {startNumber != null && <span className="font-semibold tabular-nums">({startNumber + p})</span>}
            {renderBlankAnswer(arr[p], item.q.blanks?.[p]?.answers || [])}
          </span>
        )
      )}
    </span>
  )
}

function AnswerReview({ item }: { item: ReviewItem }) {
  if (item.q.kind === "fill_blank") return <FillInlineReview item={item} />
  return <div className={item.ok ? "text-emerald-700" : "text-destructive"}>{formatAnswer(item.ans)}</div>
}

function renderBlankAnswer(userRaw: unknown, accepted: string[]) {
  const user = String(userRaw || "").trim()
  const ok = accepted.map(normStr).includes(normStr(user))
  const correct = displayAccepted(accepted)
  if (ok) return <span className="font-semibold text-emerald-700 dark:text-emerald-300">{user || correct} ✓</span>
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="font-semibold text-destructive line-through decoration-destructive">{user || "—"}</span>
      <span className="font-semibold text-emerald-700 dark:text-emerald-300">→ {correct}</span>
    </span>
  )
}

function displayAccepted(accepted: string[]): string {
  const visible = accepted.filter((a) => a !== "")
  return visible.length ? visible.join(" / ") : "NONE"
}

function choiceMarkClass(isUser: boolean, isCorrect: boolean): string {
  if (isUser && isCorrect) return "font-bold text-emerald-700 dark:text-emerald-300"
  if (isUser) return "font-bold text-destructive"
  if (isCorrect) return "font-bold text-emerald-700 dark:text-emerald-300"
  return "text-muted-foreground"
}

function choiceBoxClass(isUser: boolean, isCorrect: boolean): string {
  if (isUser && isCorrect) return "border-emerald-500/50 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
  if (isUser) return "border-destructive/50 bg-destructive/10 text-destructive"
  if (isCorrect) return "border-emerald-500/50 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
  return "border-border bg-muted/20"
}

function splitBlankHtml(body: string): (string | number)[] {
  const arr: (string | number)[] = []
  const re = /<span class="blank-slot" data-blank="(\d+)"><\/span>/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(body))) {
    arr.push(body.slice(last, m.index))
    arr.push(parseInt(m[1], 10))
    last = m.index + m[0].length
  }
  arr.push(body.slice(last))
  return arr
}

function stripBlockHtml(html: string): string {
  return html
    .replace(/<\/?p[^>]*>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?ol[^>]*>/gi, "")
    .replace(/<\/?li[^>]*>/gi, " ")
}

function htmlToPlainText(html: string): string {
  const textarea = document.createElement("textarea")
  textarea.innerHTML = html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "")
  return textarea.value.replace(/[ \t]+/g, " ")
}

function formatAnswer(a: unknown): string {
  if (a == null) return "(bỏ trống)"
  if (typeof a === "string") return a || "(bỏ trống)"
  return JSON.stringify(a)
}

function formatCorrect(q: {
  correctAnswer: (string | number)[]
  blanks: { answers: string[] }[] | null
  pairs: { right: string; rightId: string }[] | null
}): string {
  if (q.blanks && q.blanks.length) {
    return q.blanks.map((b, i) => `${i + 1}: ${b.answers.join(" / ")}`).join("; ")
  }
  if (q.pairs && q.pairs.length) {
    return q.pairs.map((p) => `${p.rightId} = ${p.right}`).join("; ")
  }
  return q.correctAnswer.join(", ")
}
