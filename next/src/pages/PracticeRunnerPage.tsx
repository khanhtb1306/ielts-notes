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

  const answeredCount = session ? Object.keys(session.answers).length : 0
  const pct = hydrated && hydrated.length ? Math.round((answeredCount / hydrated.length) * 100) : 0

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

  function submit() {
    if (!hydrated || !session) return
    const result = gradeAll(
      hydrated.map((h) => ({ q: h.q, topic: h.topic })),
      session.answers
    )
    pushHistory({
      id: session.id,
      presetId: session.presetId,
      presetLabel: session.presetLabel,
      config: session.config,
      score: result.score,
      total: result.total,
      breakdown: result.breakdown,
      detail: result.detail.map(toLightItem),
      answers: session.answers,
      questions: session.questions,
      submittedAt: Date.now(),
    })
    navigate(`/practice/result/${session.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-gradient-to-br from-orange-500/10 via-card to-card p-6">
        <button
          onClick={() => navigate("/practice")}
          className="text-sm text-primary hover:underline inline-flex items-center gap-1 mb-3"
        >
          <ArrowLeft className="h-4 w-4" /> Thoát
        </button>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge variant="secondary">Runner</Badge>
          <span className="font-semibold">{hydrated.length} câu</span>
          <span className="text-sm text-muted-foreground">
            · preset: {session.presetLabel || "custom"} · seed: {session.config.seed}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Progress value={pct} className="flex-1" />
          <div className="text-sm text-muted-foreground tabular-nums shrink-0">
            {answeredCount}/{hydrated.length}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {hydrated.map((h) => (
          <RunnerQuestion
            key={h.index}
            index={h.index}
            total={hydrated.length}
            q={h.q}
            topic={h.topic}
            topicLabel={displayLabel(topicLabels[h.topic], h.topic)}
            currentAnswer={session.answers[h.index]}
            onChange={(a) => setAnswer(session.id, h.index, a)}
          />
        ))}
      </div>

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
}: {
  index: number
  total: number
  q: Question
  topic: string
  topicLabel: string
  currentAnswer: unknown
  onChange: (answer: unknown) => void
}) {
  const promptHtml = q.promptHtml || `<p>${q.prompt || ""}</p>`
  const images = useMemo(() => dedupImageRefs(promptHtml, q.imageRefs), [promptHtml, q.imageRefs])
  const audios = useMemo(() => dedupAudioRefs(promptHtml, q.audioRefs), [promptHtml, q.audioRefs])
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center gap-2 mb-3 text-sm">
        <span className="font-bold">Câu {index + 1}/{total}</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">{topicLabel}</span>
        <Badge variant="secondary" className="uppercase text-[10px] ml-auto">{q.kind}</Badge>
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
      <RunnerInput q={q} answer={currentAnswer} onChange={onChange} />
    </Card>
  )
}

function RunnerInput({
  q,
  answer,
  onChange,
}: {
  q: Question
  answer: unknown
  onChange: (a: unknown) => void
}) {
  if (q.kind === "single_choice") {
    return (
      <div className="space-y-2">
        {q.options.map((o) => {
          const checked = answer === o.id || answer === String(o.id)
          return (
            <label
              key={String(o.id)}
              className={`flex items-start gap-2 rounded-lg border px-3 py-2 cursor-pointer hover:bg-accent/30 ${checked ? "border-primary bg-primary/5" : "border-border"}`}
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
}: {
  body: string
  values: string[]
  onSet: (idx: number, v: string) => void
  count?: number
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

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4 markdown-note leading-relaxed">
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
    </div>
  )
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
