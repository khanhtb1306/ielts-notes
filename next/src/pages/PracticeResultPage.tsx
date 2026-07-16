import { useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useData } from "@/stores/data"
import { useHistory } from "@/stores/history"
import { usePractice, uid } from "@/stores/practice"
import { samplePool } from "@/lib/sample-pool"
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
    const sampled = samplePool(topicsIndex, entry!.config)
    const newId = uid()
    save({
      id: newId,
      config: entry!.config,
      presetId: entry!.presetId,
      presetLabel: entry!.presetLabel,
      questions: sampled.questions,
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
          <Button variant="outline" onClick={() => navigate("/practice")}>
            <ArrowLeft className="h-4 w-4" /> Về Generator
          </Button>
          <Button onClick={retry}>
            <Repeat className="h-4 w-4" /> Làm phiên mới (cùng cấu hình)
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
              const label = topicLabels[topic]?.label || topic
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
                    <Badge variant="outline">{topicLabels[d.topic]?.label || d.topic}</Badge>
                    <Badge variant="destructive" className="gap-1">
                      <X className="h-3 w-3" /> sai
                    </Badge>
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
