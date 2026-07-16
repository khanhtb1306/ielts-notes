import { Link } from "react-router-dom"
import { ArrowRight, BookOpen, CalendarDays, Tag, Trophy, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useData } from "@/stores/data"
import { useHistory } from "@/stores/history"

export function LandingPage() {
  const { docs, dailyIndex, topicsIndex, practicePresets, meta } = useData()
  const entries = useHistory((s) => s.entries)
  const history = entries.slice(0, 5)

  const numQuestions = Object.values(topicsIndex.topics).reduce(
    (n, t) => n + (t.refs || []).filter((r) => r.kind === "question").length,
    0
  )
  const numTopics = Object.keys(topicsIndex.topics).length

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-6 sm:p-10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="mb-3">Pre-IELTS Foundation · Lesson 15/15</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
              Học Pre-IELTS bài bản — <span className="text-primary">notes-first</span>, practice có ý đồ sư phạm.
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl">
              {meta.stageIntro ||
                "Ghi chú Grammar / Pronunciation / Speaking song song với 16 daily challenge, tag topic xuyên suốt, sinh phiên practice mô phỏng đề thi cuối."}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/practice">
                  <Trophy className="h-4 w-4" />
                  Vào Final Practice
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/daily">
                  <CalendarDays className="h-4 w-4" />
                  Daily Practice
                </Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 min-w-fit">
            <Stat label="Notes" value={docs.length} />
            <Stat label="Lessons" value={dailyIndex.length} />
            <Stat label="Questions" value={numQuestions} />
            <Stat label="Topics" value={numTopics} />
          </div>
        </div>
      </section>

      {/* Entry cards */}
      <section className="grid gap-4 md:grid-cols-2">
        <EntryCard
          to="/pronunciation"
          icon={BookOpen}
          title="Notes học lý thuyết"
          description={`${docs.filter((d) => d.type === "pronunciation").length} phát âm · ${docs.filter((d) => d.type === "grammar").length} ngữ pháp · ${docs.filter((d) => d.type === "speaking").length} nói`}
          accent="text-teal-500 bg-teal-500/10"
        />
        <EntryCard
          to="/daily"
          icon={CalendarDays}
          title="Daily · Theo Lesson"
          description={`${dailyIndex.length} lesson chuẩn hoá từ LangGo — content + đáp án + flashcard`}
          accent="text-pink-500 bg-pink-500/10"
        />
        <EntryCard
          to="/topics"
          icon={Tag}
          title="Daily · Theo Chủ Đề"
          description={`Gộp ${numTopics} chủ đề xuyên suốt 16 lessons, phân biệt core / review / preview`}
          accent="text-sky-500 bg-sky-500/10"
        />
        <EntryCard
          to="/practice"
          icon={Trophy}
          title="Final Practice · Sinh đề"
          description={`${practicePresets.length} preset chuẩn theo đề mẫu, chấm client-side, review câu sai`}
          accent="text-orange-500 bg-orange-500/10"
        />
      </section>

      {/* Recent history */}
      {history.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">5 phiên practice gần nhất</h3>
          </div>
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {history.map((h) => {
                const pct = h.total ? Math.round((h.score / h.total) * 100) : 0
                return (
                  <Link
                    key={h.id}
                    to={`/practice/result/${h.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="text-2xl font-bold w-14 text-primary shrink-0">{pct}%</div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{h.presetLabel || "Custom mix"}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {h.score}/{h.total} câu · {new Date(h.submittedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </Link>
                )
              })}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Goals + principles */}
      {meta.goals && meta.goals.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-3">Mục tiêu giai đoạn hiện tại</h3>
          <Card>
            <CardContent className="pt-6">
              <ol className="space-y-2 list-decimal list-inside marker:text-primary marker:font-semibold">
                {meta.goals.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </section>
      )}

      {meta.principles && meta.principles.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-3">Nguyên tắc học</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {meta.principles.map((p, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle>{p.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground text-sm">{p.text}</CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3 min-w-[100px]">
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
    </div>
  )
}

function EntryCard({
  to,
  icon: Icon,
  title,
  description,
  accent,
}: {
  to: string
  icon: typeof BookOpen
  title: string
  description: string
  accent: string
}) {
  return (
    <Link to={to} className="group">
      <Card className="h-full transition-shadow group-hover:shadow-md group-hover:border-primary/40">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className={`rounded-xl p-3 ${accent}`}>
              <Icon className="h-6 w-6" />
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </div>
          <CardTitle className="mt-3 text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  )
}
