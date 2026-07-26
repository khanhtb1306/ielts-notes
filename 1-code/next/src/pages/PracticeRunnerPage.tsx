import { useEffect, useMemo, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useData } from "@/stores/data"
import { usePractice, type PracticeSession } from "@/stores/practice"
import { useHistory, toLightItem } from "@/stores/history"
import { gradeAll } from "@/lib/grading"
import { dedupImageRefs, dedupAudioRefs } from "@/lib/media-dedup"
import { displayLabel } from "@/lib/topic-label"
import type { Lesson, Question } from "@/types/content"
import { ArrowLeft, CheckCircle2 } from "lucide-react"

interface Hydrated {
  q: Question
  topic: string
  index: number
}

export function PracticeRunnerPage() {
  const { sessionId = "" } = useParams()
  const navigate = useNavigate()
  const { loadLesson, topicLabels } = useData()
  const current = usePractice((s) => s.current)
  const loadFromStorage = usePractice((s) => s.loadFromStorage)
  const setAnswer = usePractice((s) => s.setAnswer)
  const pushHistory = useHistory((s) => s.push)

  const [session, setSession] = useState<PracticeSession | null>(null)
  const [hydrated, setHydrated] = useState<Hydrated[] | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const s = current && current.id === sessionId ? current : loadFromStorage(sessionId)
    if (!s) {
      setErr("Phiên đã hết hạn hoặc không tìm thấy.")
      return
    }
    setSession(s)
    const lessonKeys = [...new Set(s.questions.map((q) => q.lessonKey))]
    let alive = true
    Promise.all(lessonKeys.map((k) => loadLesson(k)))
      .then((lessons) => {
        if (!alive) return
        const byKey: Record<string, Lesson> = {}
        lessonKeys.forEach((k, i) => (byKey[k] = lessons[i]))
        const out: Hydrated[] = []
        s.questions.forEach((ref, index) => {
          const L = byKey[ref.lessonKey]
          if (!L) return
          const all: Question[] = []
          for (const g of L.exerciseGroups) for (const q of g.questions) all.push(q)
          const q = all.find((x) => x.id === ref.itemId)
          if (q) out.push({ q, topic: ref.topic, index })
        })
        setHydrated(out)
      })
      .catch((e: Error) => alive && setErr(e.message))
    return () => {
      alive = false
    }
  }, [sessionId, current, loadFromStorage, loadLesson])

  const totalPoints = hydrated ? countHydratedPoints(hydrated) : 0
  const answeredCount = session && hydrated ? countAnsweredPoints(hydrated, session.answers) : 0
  const pct = totalPoints ? Math.round((answeredCount / totalPoints) * 100) : 0
  const isTimedFinal = !!session?.presetId && (session.presetId.startsWith("de-") || session.presetId === "real-mock")
  const timeLimitMs = 45 * 60 * 1000
  const remainingMs = session && isTimedFinal ? Math.max(0, session.startedAt + timeLimitMs - now) : null

  function submitSession(s: PracticeSession, hs: Hydrated[]) {
    const result = gradeAll(
      hs.map((h) => ({ q: h.q, topic: h.topic })),
      s.answers
    )
    pushHistory({
      id: s.id,
      presetId: s.presetId,
      presetLabel: s.presetLabel,
      config: s.config,
      score: result.score,
      total: result.total,
      breakdown: result.breakdown,
      detail: result.detail.map(toLightItem),
      answers: s.answers,
      questions: s.questions,
      submittedAt: Date.now(),
    })
    navigate(`/practice/result/${s.id}`)
  }

  useEffect(() => {
    if (!isTimedFinal) return
    const handle = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(handle)
  }, [isTimedFinal])

  useEffect(() => {
    if (!session || !hydrated || !isTimedFinal || remainingMs == null || remainingMs > 0) return
    submitSession(session, hydrated)
  }, [session, hydrated, isTimedFinal, remainingMs])

  if (err) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-destructive">{err}</CardContent>
      </Card>
    )
  }
  if (!session || !hydrated) {
    return <div className="py-12 text-center text-muted-foreground animate-pulse">Đang tải câu hỏi...</div>
  }
  const activeSession = session
  const activeHydrated = hydrated

  function submit() {
    submitSession(activeSession, activeHydrated)
  }

  function renderMockGroup(group: { title: string; items: Hydrated[] }, groupIndex: number) {
    const title = group.title
    if (title.startsWith("I -")) {
      const columns = group.items[0]?.q.options.map((o) => o.text) || ["Noun", "Verb", "Adjective", "Adverb"]
      return (
        <section key={title} className="space-y-3 border-t border-border pt-5 first:border-t-0 first:pt-0">
          <h3 className="text-base font-extrabold">I - Define the word classes of the underlined words as they are used in the sentences below. Tick ‘✓’ your answers. Only ONE ‘✓’ for each word.</h3>
          <p className="text-sm italic">E.g: That <u>cat</u> is so cute. =&gt; Noun ✓</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 pr-4 text-left font-bold">Sentences</th>
                  {columns.map((c) => <th key={c} className="w-28 py-2 text-center font-bold">{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {group.items.map((h) => {
                  const answer = activeSession.answers[h.index]
                  return (
                    <tr key={h.index} className="border-b border-border/70">
                      <td className="py-3 pr-4 font-semibold text-foreground [&_a]:text-foreground [&_u]:decoration-foreground" dangerouslySetInnerHTML={{ __html: h.q.promptHtml }} />
                      {columns.map((c) => {
                        const option = h.q.options.find((o) => o.text === c)
                        const checked = option && (answer === option.id || answer === String(option.id))
                        return (
                          <td key={c} className="py-3 text-center">
                            <input
                              type="radio"
                              name={`q-${h.q.id}`}
                              checked={!!checked}
                              onChange={() => option && setAnswer(activeSession.id, h.index, option.id)}
                              className="h-4 w-4 accent-emerald-600"
                            />
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )
    }

    if (title.startsWith("II -")) {
      return (
        <section key={title} className="space-y-4 border-t border-border pt-5 first:border-t-0 first:pt-0">
          <h3 className="text-base font-extrabold">II - Choose the correct answer.</h3>
          <div className="grid gap-x-10 gap-y-5 md:grid-cols-2">
            {group.items.map((h) => (
              <div key={h.index} className="space-y-2">
                <div className="markdown-note" dangerouslySetInnerHTML={{ __html: h.q.promptHtml }} />
                <RunnerInput q={h.q} answer={activeSession.answers[h.index]} onChange={(a) => setAnswer(activeSession.id, h.index, a)} compact />
              </div>
            ))}
          </div>
        </section>
      )
    }

    if (title.startsWith("III -") || title.startsWith("IV -")) {
      return (
        <section key={title} className="space-y-3 border-t border-border pt-5 first:border-t-0 first:pt-0">
          <h3 className="text-base font-extrabold">{title.startsWith("III -") ? "III - Complete the sentences with A / AN or THE. You can write NONE for a blank." : "IV - Change the verb in the brackets to the correct tense."}</h3>
          {title.startsWith("III -") ? (
            <div className="space-y-3 text-base leading-8">
              {(() => {
                let blankCursor = 1
                return group.items.map((h, i) => {
                  const startNumber = blankCursor
                  blankCursor += h.q.blanks?.length || 1
                  return (
                    <p key={h.index}>
                      <span className="mr-1 tabular-nums">{i + 1}.</span>
                      <ExamInlineFillBlank
                        q={h.q}
                        answer={activeSession.answers[h.index]}
                        onChange={(a) => setAnswer(activeSession.id, h.index, a)}
                        startNumber={startNumber}
                      />
                    </p>
                  )
                })
              })()}
            </div>
          ) : (
            <div className="space-y-2 text-base leading-9">
              {group.items.map((h, i) => (
                <div key={h.index}>
                  <span className="mr-1 tabular-nums">{i + 1}.</span>
                  <ExamInlineFillBlank
                    q={h.q}
                    answer={activeSession.answers[h.index]}
                    onChange={(a) => setAnswer(activeSession.id, h.index, a)}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      )
    }

    return (
      <section key={title} className="space-y-3 border-t border-border pt-5 first:border-t-0 first:pt-0">
        <h3 className="text-base font-extrabold">{groupIndex + 1}. {title}</h3>
        {group.items.map((h) => (
          <RunnerQuestion
            key={h.index}
            index={h.index}
            total={activeHydrated.length}
            q={h.q}
            topic={h.topic}
            topicLabel={displayLabel(topicLabels[h.topic], h.topic)}
            currentAnswer={activeSession.answers[h.index]}
            onChange={(a) => setAnswer(activeSession.id, h.index, a)}
            compact
          />
        ))}
      </section>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-gradient-to-br from-orange-500/10 via-card to-card p-6">
        <button
          onClick={() => navigate("/final")}
          className="text-sm text-primary hover:underline inline-flex items-center gap-1 mb-3"
        >
          <ArrowLeft className="h-4 w-4" /> Thoát
        </button>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge variant="secondary">Runner</Badge>
          <span className="font-semibold">{totalPoints} câu</span>
          {remainingMs != null && (
            <Badge variant={remainingMs <= 5 * 60 * 1000 ? "destructive" : "outline"} className="tabular-nums">
              Time left: {formatTimeLeft(remainingMs)}
            </Badge>
          )}
          <span className="text-sm text-muted-foreground">
            · preset: {activeSession.presetLabel || "custom"} · seed: {activeSession.config.seed}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Progress value={pct} className="flex-1" />
          <div className="text-sm text-muted-foreground tabular-nums shrink-0">
            {answeredCount}/{totalPoints}
          </div>
        </div>
      </div>

      {(() => {
        const isMock = activeSession.presetId === "real-mock" || activeSession.presetId?.startsWith("de-")
        const renderQuestion = (h: Hydrated, compact = false) => (
          <RunnerQuestion
            key={h.index}
            index={h.index}
            total={activeHydrated.length}
            q={h.q}
            topic={h.topic}
            topicLabel={displayLabel(topicLabels[h.topic], h.topic)}
            currentAnswer={activeSession.answers[h.index]}
            onChange={(a) => setAnswer(activeSession.id, h.index, a)}
            compact={compact}
          />
        )

        if (isMock) {
          const grouped: { title: string; items: Hydrated[] }[] = []
          for (const h of hydrated) {
            const title = h.q.title || "Final Test"
            const last = grouped[grouped.length - 1]
            if (last && last.title === title) last.items.push(h)
            else grouped.push({ title, items: [h] })
          }
          return (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-5 border-b border-border pb-4">
                <h2 className="text-xl font-extrabold">GRAMMAR TEST</h2>
                <p className="mt-1 text-sm text-muted-foreground">MOCK TEST · Total: {totalPoints} questions · Time allowed: 45 minutes</p>
              </div>
              <div className="space-y-7">
                {grouped.map((group, groupIndex) => renderMockGroup(group, groupIndex))}
              </div>
            </div>
          )
        }

        const part1 = activeHydrated.filter((h) => h.q.kind === "single_choice" || h.q.kind === "multi_select")
        const part2 = activeHydrated.filter((h) => h.q.kind === "fill_blank" || h.q.kind === "matching")
        return (
          <div className="space-y-8">
            {part1.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-lg font-bold">Phần 1 · Trắc nghiệm <span className="text-sm font-normal text-muted-foreground">({part1.length} câu)</span></h3>
                <div className="grid gap-4 md:grid-cols-2">{part1.map((h) => renderQuestion(h))}</div>
              </section>
            )}
            {part2.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-lg font-bold">Phần 2 · Điền chỗ trống <span className="text-sm font-normal text-muted-foreground">({part2.length} câu)</span></h3>
                {part2.map((h) => renderQuestion(h))}
              </section>
            )}
          </div>
        )
      })()}

      <div className="sticky bottom-4 flex justify-center">
        <Button onClick={submit} size="lg" className="shadow-lg">
          <CheckCircle2 className="h-5 w-5" /> Submit &amp; Chấm điểm
        </Button>
      </div>
    </div>
  )
}

function RunnerQuestion({
  index,
  total,
  q,
  topicLabel,
  currentAnswer,
  onChange,
  compact = false,
}: {
  index: number
  total: number
  q: Question
  topic: string
  topicLabel: string
  currentAnswer: unknown
  onChange: (answer: unknown) => void
  compact?: boolean
}) {
  const promptHtml = q.promptHtml || `<p>${q.prompt || ""}</p>`
  const images = useMemo(() => dedupImageRefs(promptHtml, q.imageRefs), [promptHtml, q.imageRefs])
  const audios = useMemo(() => dedupAudioRefs(promptHtml, q.audioRefs), [promptHtml, q.audioRefs])
  const content = (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="font-bold">Câu {index + 1}/{total}</span>
        {!compact && <span className="text-muted-foreground">·</span>}
        {!compact && <span className="text-muted-foreground">{topicLabel}</span>}
        {q.generated && (
          <Badge className="ml-auto border-amber-400 bg-amber-500/15 text-[10px] text-amber-700 dark:text-amber-300" variant="outline">
            AI sinh
          </Badge>
        )}
        {!compact && <Badge variant="secondary" className={`uppercase text-[10px] ${q.generated ? "" : "ml-auto"}`}>{q.kind}</Badge>}
      </div>
      <div
        className="markdown-note mb-3"
        dangerouslySetInnerHTML={{ __html: promptHtml }}
      />
      {images.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 mb-3">
          {images.map((img, i) =>
            img.localFile || img.url ? (
              <img
                key={i}
                loading="lazy"
                src={img.localFile || img.url || ""}
                alt={img.alt || ""}
                className="rounded-lg border border-border max-w-full"
              />
            ) : null
          )}
        </div>
      )}
      {audios.length > 0 && (
        <div className="space-y-2 mb-3">
          {audios.map((a, i) => (
            <audio key={i} controls preload="none" src={a.localFile || a.url || ""} className="w-full max-w-md" />
          ))}
        </div>
      )}
      <RunnerInput q={q} answer={currentAnswer} onChange={onChange} compact={compact} />
    </>
  )
  if (compact) {
    return <div className={`bg-card p-4 ${q.generated ? "bg-amber-500/5" : ""}`}>{content}</div>
  }
  return (
    <Card className={`p-4 ${q.generated ? "border-amber-400/60 bg-amber-500/5 dark:border-amber-500/40 dark:bg-amber-500/10" : ""}`}>
      {content}
    </Card>
  )
}

function RunnerInput({
  q,
  answer,
  onChange,
  compact = false,
}: {
  q: Question
  answer: unknown
  onChange: (a: unknown) => void
  compact?: boolean
}) {
  if (q.kind === "single_choice") {
    return (
      <div className={compact ? "space-y-1" : "grid gap-2 sm:grid-cols-2"}>
        {q.options.map((o) => {
          const checked = answer === o.id || answer === String(o.id)
          return (
            <label
              key={String(o.id)}
              className={`flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 hover:bg-accent/30 ${compact ? "border-0" : "border"} ${checked ? "text-emerald-700 font-semibold" : compact ? "" : "border-border"}`}
            >
              <input
                type="radio"
                name={`q-${q.id}`}
                checked={checked}
                onChange={() => onChange(o.id)}
                className="mt-1"
              />
              <div className="flex-1" dangerouslySetInnerHTML={{ __html: o.html || o.text }} />
            </label>
          )
        })}
      </div>
    )
  }
  if (q.kind === "multi_select") {
    const arr = Array.isArray(answer) ? (answer as (string | number)[]) : []
    const setArr = new Set(arr.map(String))
    return (
      <div className="space-y-2">
        {q.options.map((o) => {
          const checked = setArr.has(String(o.id))
          return (
            <label
              key={String(o.id)}
              className={`flex items-start gap-2 rounded-lg border px-3 py-2 cursor-pointer hover:bg-accent/30 ${checked ? "border-primary bg-primary/5" : "border-border"}`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => {
                  const next = new Set(setArr)
                  if (next.has(String(o.id))) next.delete(String(o.id))
                  else next.add(String(o.id))
                  onChange([...next])
                }}
                className="mt-1"
              />
              <div className="flex-1" dangerouslySetInnerHTML={{ __html: o.html || o.text }} />
            </label>
          )
        })}
      </div>
    )
  }
  if (q.kind === "fill_blank") {
    return <FillBlankInput q={q} answer={answer} onChange={onChange} />
  }
  if (q.kind === "matching") {
    return <MatchingInput q={q} answer={answer} onChange={onChange} />
  }
  return (
    <div className="text-sm text-muted-foreground italic">
      Loại câu {q.kind} không chấm tự động — bỏ qua.
    </div>
  )
}

function FillBlankInput({ q, answer, onChange }: { q: Question; answer: unknown; onChange: (a: unknown) => void }) {
  const blanks = q.blanks || []
  const arr = Array.isArray(answer) ? (answer as string[]) : []

  function setValue(idx: number, v: string) {
    const next = arr.slice()
    next[idx] = v
    onChange(next)
  }

  if (q.bodyHtml) {
    return (
      <FillBlankInline body={q.bodyHtml} values={arr} onSet={setValue} count={blanks.length || undefined} />
    )
  }
  return (
    <div className="space-y-2">
      {blanks.map((_b, k) => (
        <label key={k} className="flex items-center gap-2 text-sm">
          <span className="w-14 text-muted-foreground">Ô {k + 1}:</span>
          <Input value={arr[k] || ""} onChange={(e) => setValue(k, e.target.value)} placeholder="gõ đáp án" />
        </label>
      ))}
    </div>
  )
}

function FillBlankInline({
  body,
  values,
  onSet,
  count,
  bare = false,
  inline = false,
}: {
  body: string
  values: string[]
  onSet: (idx: number, v: string) => void
  count?: number
  bare?: boolean
  inline?: boolean
}) {
  // Split HTML by blank-slot spans. Render segments as innerHTML and inputs between.
  const parts = useMemo(() => {
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
  }, [body])

  const content = (
    <>
      {parts.map((p, i) =>
        typeof p === "string" ? (
          <span key={i} dangerouslySetInnerHTML={{ __html: p }} />
        ) : (
          <input
            key={`b-${p}`}
            type="text"
            value={values[p] || ""}
            onChange={(e) => onSet(p, e.target.value)}
            aria-label={`Ô ${p + 1}`}
            className="mx-1 inline-block rounded-md border border-input bg-background px-2 py-0.5 text-sm min-w-[80px] focus:outline-none focus:ring-1 focus:ring-primary"
          />
        )
      )}
      {count != null && (
        <div className="mt-2 text-xs text-muted-foreground">{count} ô cần điền.</div>
      )}
    </>
  )
  if (inline) return <span className="markdown-note leading-relaxed">{content}</span>
  if (bare) return <div className="markdown-note leading-relaxed">{content}</div>
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4 markdown-note leading-relaxed">
      {content}
    </div>
  )
}

function ExamInlineFillBlank({ q, answer, onChange, startNumber }: { q: Question; answer: unknown; onChange: (a: unknown) => void; startNumber?: number }) {
  const arr = Array.isArray(answer) ? (answer as string[]) : []
  const setValue = (idx: number, v: string) => {
    const next = arr.slice()
    next[idx] = v
    onChange(next)
  }
  const parts = splitBlankHtml(stripBlockHtml(q.bodyHtml || q.promptHtml))

  return (
    <span>
      {parts.map((p, i) =>
        typeof p === "string" ? (
          <span key={i} className="whitespace-pre-wrap">{htmlToPlainText(p)}</span>
        ) : (
          <span key={`b-${p}`} className="mx-1 inline-flex items-baseline gap-1 whitespace-nowrap">
            {startNumber != null && <span className="font-semibold tabular-nums">({startNumber + p})</span>}
            <input
              type="text"
              value={arr[p] || ""}
              onChange={(e) => setValue(p, e.target.value)}
              aria-label={`Ô ${startNumber != null ? startNumber + p : p + 1}`}
              size={Math.max(4, (arr[p] || "").length + 1)}
              className="inline h-7 min-w-12 max-w-full border-0 border-b border-dashed border-input bg-transparent px-1 align-baseline text-sm font-semibold focus:border-primary focus:outline-none focus:ring-0"
            />
          </span>
        )
      )}
    </span>
  )
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

function htmlToPlainText(html: string): string {
  const textarea = document.createElement("textarea")
  textarea.innerHTML = html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "")
  return textarea.value.replace(/[ \t]+/g, " ")
}

function formatTimeLeft(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

function countQuestionPoints(q: Question): number {
  return q.kind === "fill_blank" && q.blanks?.length ? q.blanks.length : 1
}

function countHydratedPoints(items: Hydrated[]): number {
  return items.reduce((sum, h) => sum + countQuestionPoints(h.q), 0)
}

function countAnsweredPoints(items: Hydrated[], answers: Record<number, unknown>): number {
  return items.reduce((sum, h) => {
    const answer = answers[h.index]
    if (h.q.kind === "fill_blank" && h.q.blanks?.length) {
      const arr = Array.isArray(answer) ? answer : []
      return sum + h.q.blanks.filter((_b, i) => String(arr[i] || "").trim()).length
    }
    return sum + (answer == null || answer === "" ? 0 : 1)
  }, 0)
}

function stripBlockHtml(html: string): string {
  return html
    .replace(/<\/?p[^>]*>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?ol[^>]*>/gi, "")
    .replace(/<\/?li[^>]*>/gi, " ")
}

function MatchingInput({ q, answer, onChange }: { q: Question; answer: unknown; onChange: (a: unknown) => void }) {
  const pairs = q.pairs || []
  const arr = Array.isArray(answer) ? (answer as string[]) : []

  return (
    <table className="w-full text-sm">
      <tbody>
        {pairs.map((p, k) => (
          <tr key={k}>
            <td className="py-1 pr-3 align-middle">{p.left}</td>
            <td className="py-1 align-middle">
              <select
                className="w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm"
                value={arr[k] || ""}
                onChange={(e) => {
                  const next = arr.slice()
                  next[k] = e.target.value
                  onChange(next)
                }}
              >
                <option value="">-- chọn --</option>
                {pairs.map((r, i) => (
                  <option key={r.rightId || i} value={r.rightId || String(i)}>
                    {r.right}
                  </option>
                ))}
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
