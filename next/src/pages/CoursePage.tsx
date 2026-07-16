import { useData } from "@/stores/data"
import { Card, CardContent } from "@/components/ui/card"

export function CoursePage() {
  const { meta } = useData()
  const lessons = meta.lessons || []

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-6">
        <div className="text-[11px] font-bold uppercase tracking-widest text-primary">Lesson 1–15</div>
        <h2 className="mt-1 text-2xl font-bold">Course Map</h2>
        <p className="text-muted-foreground mt-1">{meta.courseIntro}</p>
      </div>

      <div className="space-y-3">
        {lessons.map((l) => (
          <Card key={l.n} className="searchable">
            <CardContent className="p-5 flex gap-5">
              <div className="flex items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xl w-14 h-14 shrink-0">
                {l.n}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Lesson {l.n}
                </div>
                <h3 className="text-lg font-semibold">{l.title}</h3>
                <p className="mt-1 text-sm">{l.focus}</p>
                <p className="mt-1 text-sm">
                  <b>Nên xem:</b> {l.note}
                </p>
                {l.source && <div className="mt-2 text-xs text-muted-foreground">{l.source}</div>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
