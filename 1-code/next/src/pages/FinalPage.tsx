import { useNavigate, Link } from "react-router-dom"
import { GraduationCap, ArrowRight, Sparkles } from "lucide-react"
import { useData } from "@/stores/data"
import { useHistory } from "@/stores/history"
import { usePractice, uid } from "@/stores/practice"
import type { SamplePoolConfig, SampledQuestion } from "@/lib/sample-pool"
import type { QuestionKind } from "@/types/content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const GRADABLE: QuestionKind[] = ["single_choice", "multi_select", "fill_blank", "matching"]

export function FinalPage() {
  const navigate = useNavigate()
  const { finalTests } = useData()
  const save = usePractice((s) => s.save)
  const history = useHistory((s) => s.entries).slice(0, 5)
  const realSets = finalTests.sets.filter((s) => s.source === "real")
  const generatedSets = finalTests.sets.filter((s) => s.source !== "real")

  function startSession(id: string, label: string, questions: SampledQuestion[], config: SamplePoolConfig) {
    if (!questions.length) return
    const sessionId = uid()
    save({
      id: sessionId,
      config,
      presetId: id,
      presetLabel: label,
      questions,
      answers: {},
      startedAt: Date.now(),
    })
    setTimeout(() => navigate(`/practice/runner/${sessionId}`), 80)
  }

  function startSet(setId: string, label: string, seed: number, total: number, questions: SampledQuestion[]) {
    const config: SamplePoolConfig = {
      mix: [{ topic: finalTests.poolKey, percent: 100 }],
      total,
      seed,
      questionTypes: GRADABLE,
    }
    startSession(setId, label, questions, config)
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-gradient-to-br from-emerald-500/10 via-card to-card p-6">
        <Badge variant="success" className="mb-2">Kỳ thi cuối · Grammar</Badge>
        <h2 className="text-2xl font-bold">Final Test — Ngữ pháp</h2>
        <p className="mt-1 max-w-3xl text-muted-foreground">
          Làm bài theo đúng cấu trúc mock test: <b>{finalTests.blueprint.total} câu</b> trong <b>{finalTests.blueprint.timeMinutes} phút</b>,
          chia thành 4 phần Grammar giống đề Lesson 19,
          chấm điểm ngay và lưu lịch sử. Luyện Speaking nằm ở mục <Link to="/speaking" className="text-primary underline underline-offset-2">Speaking</Link>.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" /> Đề thật · Mã đề 00
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Đề gốc từ mock test/ảnh giáo viên gửi. Dùng để kiểm tra sát đề thật trước khi luyện thêm.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {realSets.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-3">
                <div>
                  <div className="font-semibold">{s.label}</div>
                  <div className="text-xs text-muted-foreground">{s.total} câu · 4 phần · {s.note}</div>
                </div>
                <Button variant="outline" size="sm" onClick={() => startSet(s.id, s.label, s.seed, s.total, (s.questions || []) as unknown as SampledQuestion[])}>
                  Làm bài <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> 10 đề luyện thêm
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Mã đề 01-10, mỗi đề 50 câu, 45 phút, sinh theo rule bám cấu trúc đề thật và vocab đã học.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {generatedSets.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-3">
                <div>
                  <div className="font-semibold">{s.label}</div>
                  <div className="text-xs text-muted-foreground">{s.total} câu · 4 phần · {s.note}</div>
                </div>
                <Button variant="outline" size="sm" onClick={() => startSet(s.id, s.label, s.seed, s.total, (s.questions || []) as unknown as SampledQuestion[])}>
                  Làm bài <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Lịch sử gần đây
            </CardTitle>
          </CardHeader>
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
      )}
    </div>
  )
}
