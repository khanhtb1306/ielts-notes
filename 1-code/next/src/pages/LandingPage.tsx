import { Link } from "react-router-dom"
import { ArrowRight, Volume2, Rows, MessageSquare, GraduationCap, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useData } from "@/stores/data"
import { useHistory } from "@/stores/history"

export function LandingPage() {
  const { docs, meta, finalTests } = useData()
  const history = useHistory((s) => s.entries).slice(0, 5)

  const nGrammar = docs.filter((d) => d.type === "grammar").length
  const nPron = docs.filter((d) => d.type === "pronunciation").length
  const nSpeaking = docs.filter((d) => d.type === "speaking").length

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-6 sm:p-10 shadow-sm">
        <Badge variant="secondary" className="mb-3">Pre-IELTS · Ôn thi cuối khóa</Badge>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
          Ôn tập tập trung — <span className="text-primary">Ngữ pháp & Speaking</span> cho bài thi cuối.
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          {meta.stageIntro ||
            "Học theo tài liệu tổng hợp của trung tâm, luyện Speaking theo bộ câu hỏi chắc chắn hỏi, và làm Final Test theo đúng cấu trúc mock."}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/final">
              <GraduationCap className="h-4 w-4" /> Vào Final Test
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/grammar">
              <Rows className="h-4 w-4" /> Tổng hợp Ngữ pháp
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <EntryCard
          to="/pronunciation"
          icon={Volume2}
          title="Phát âm"
          description={`${nPron} bài phát âm · IPA tương tác · hộp luyện âm`}
          accent="text-teal-500 bg-teal-500/10"
        />
        <EntryCard
          to="/grammar"
          icon={Rows}
          title="Ngữ pháp"
          description={`Tổng hợp kiến thức toàn khóa (ảnh của trung tâm) + ${nGrammar} ghi chú giải thích sâu`}
          accent="text-indigo-500 bg-indigo-500/10"
        />
        <EntryCard
          to="/speaking"
          icon={MessageSquare}
          title="Speaking"
          description={`${nSpeaking} chủ đề · answer frame · tài liệu + bộ câu hỏi cuối khóa`}
          accent="text-pink-500 bg-pink-500/10"
        />
        <EntryCard
          to="/final"
          icon={GraduationCap}
          title="Final Test"
          description={`${finalTests.sets.length} đề thi thử chuẩn · 50 câu/đề · 45 phút`}
          accent="text-emerald-500 bg-emerald-500/10"
        />
      </section>

      {history.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Lần làm bài gần đây</h3>
          </div>
          <Card>
            <CardContent className="divide-y divide-border p-0">
              {history.map((h) => {
                const pct = h.total ? Math.round((h.score / h.total) * 100) : 0
                return (
                  <Link
                    key={h.id}
                    to={`/practice/result/${h.id}`}
                    className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-accent/30"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="w-14 shrink-0 text-2xl font-bold text-primary">{pct}%</div>
                      <div className="min-w-0">
                        <div className="truncate font-medium">{h.presetLabel || "Đề"}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {h.score}/{h.total} câu · {new Date(h.submittedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>
                )
              })}
            </CardContent>
          </Card>
        </section>
      )}

      {meta.goals && meta.goals.length > 0 && (
        <section>
          <h3 className="mb-3 text-lg font-semibold">Mục tiêu ôn tập</h3>
          <Card>
            <CardContent className="pt-6">
              <ol className="list-inside list-decimal space-y-2 marker:font-semibold marker:text-primary">
                {meta.goals.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </section>
      )}
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
  icon: typeof Volume2
  title: string
  description: string
  accent: string
}) {
  return (
    <Link to={to} className="group">
      <Card className="h-full transition-shadow group-hover:border-primary/40 group-hover:shadow-md">
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
