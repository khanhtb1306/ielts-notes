import { Link } from "react-router-dom"
import { useMemo } from "react"
import { useData } from "@/stores/data"
import { useUi } from "@/stores/ui"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export function DailyIndexPage() {
  const { dailyIndex } = useData()
  const search = useUi((s) => s.search).toLowerCase().trim()

  const filtered = useMemo(() => {
    if (!search) return dailyIndex
    return dailyIndex.filter(
      (l) =>
        l.label.toLowerCase().includes(search) ||
        l.challenges.some((c) => (c.note || "").toLowerCase().includes(search) || (c.title || "").toLowerCase().includes(search))
    )
  }, [dailyIndex, search])

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-gradient-to-br from-pink-500/10 via-card to-card p-6">
        <Badge variant="secondary" className="mb-2">{dailyIndex.length} daily sets</Badge>
        <h2 className="text-2xl font-bold">Daily Practice · Theo Lesson</h2>
        <p className="text-muted-foreground mt-1">
          Bài tập daily từ LangGo, đã chuẩn hoá. Bấm vào lesson để xem nội dung + đề + đáp án + flashcard.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((l) => {
          const pct = l.correctRate != null ? Math.round(l.correctRate * 100) : null
          return (
            <Link key={l.key} to={`/daily/${l.key}`} className="group">
              <Card className="h-full transition-shadow group-hover:shadow-md group-hover:border-primary/40 searchable">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg shrink-0">
                      {l.number ?? "•"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base leading-tight">{l.label}</h3>
                      <div className="text-xs text-muted-foreground mt-1">
                        {l.challenges.length} challenge · {l.totalQuestion} câu
                      </div>
                    </div>
                  </div>

                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {l.challenges.map((c, i) => (
                      <li key={i} className="line-clamp-1">· {c.note || c.title}</li>
                    ))}
                  </ul>

                  {pct != null ? (
                    <div className="mt-4 flex items-center gap-3">
                      <Progress value={pct} className="flex-1" />
                      <div className="text-xs font-medium tabular-nums text-muted-foreground shrink-0">
                        {pct}% · {l.totalCorrect}/{l.totalQuestion}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 text-xs text-muted-foreground italic">Chưa chấm</div>
                  )}
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
          Không có lesson match "{search}".
        </div>
      )}
    </div>
  )
}
