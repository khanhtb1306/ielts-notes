import { useNavigate } from "react-router-dom"
import { useMemo } from "react"
import { useData } from "@/stores/data"
import { useProgress } from "@/stores/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function FinalPage() {
  const navigate = useNavigate()
  const { docs, meta } = useData()
  const done = useProgress((s) => s.done)
  const toggle = useProgress((s) => s.toggle)

  const speaking = docs.filter((d) => d.type === "speaking")
  const know = docs.filter((d) => d.type === "grammar" || d.type === "pronunciation")
  const all = [...speaking, ...know]
  const numDone = useMemo(() => all.filter((d) => done[d.id]).length, [all, done])
  const pct = all.length ? Math.round((numDone / all.length) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-gradient-to-br from-emerald-500/10 via-card to-card p-6">
        <Badge variant="success" className="mb-2">
          Kỳ thi cuối · Pre-IELTS
        </Badge>
        <h2 className="text-2xl font-bold">{meta.reviewTitle || "Final Review"}</h2>
        <p className="text-muted-foreground mt-1">{meta.reviewIntro}</p>
        <div className="mt-4 flex items-center gap-3">
          <Progress value={pct} className="flex-1" />
          <div className="text-sm font-semibold tabular-nums">
            {numDone}/{all.length} · {pct}%
          </div>
        </div>
      </div>

      <ExamPart
        num={1}
        title="Speaking · tất cả chủ đề đã học"
        docs={speaking}
        done={done}
        toggle={toggle}
        navigate={navigate}
      />
      <ExamPart
        num={2}
        title="Kiến thức đã học · Grammar & Pronunciation"
        docs={know}
        done={done}
        toggle={toggle}
        navigate={navigate}
      />

      {meta.vocab && Object.keys(meta.vocab).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Vocabulary Bank</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(meta.vocab).map(([topic, words]) => (
              <div key={topic}>
                <h3 className="font-semibold mb-2">{topic}</h3>
                <div className="flex flex-wrap gap-2">
                  {words.map((w, i) => (
                    <span key={i} className="rounded-md border border-border bg-muted/50 px-2 py-1 text-sm">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ExamPart({
  num,
  title,
  docs,
  done,
  toggle,
  navigate,
}: {
  num: number
  title: string
  docs: { id: string; title: string; type: string; lesson: string }[]
  done: Record<string, boolean>
  toggle: (id: string) => void
  navigate: (path: string) => void
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold shrink-0">
          {num}
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 md:grid-cols-2">
          {docs.map((d) => (
            <label
              key={d.id}
              className={`flex items-center gap-3 rounded-lg border border-border px-3 py-2 hover:bg-accent/30 transition-colors cursor-pointer ${
                done[d.id] ? "bg-primary/5 border-primary/40" : ""
              }`}
            >
              <Checkbox checked={!!done[d.id]} onCheckedChange={() => toggle(d.id)} />
              <span className="flex-1 min-w-0">
                <span className="font-medium">{d.title}</span>
                {d.lesson && <span className="ml-2 text-xs text-muted-foreground">{d.lesson}</span>}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault()
                  navigate(`/${d.type}#doc-${d.id}`)
                }}
              >
                Mở <ArrowRight className="h-3 w-3" />
              </Button>
            </label>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
