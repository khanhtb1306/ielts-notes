import { useNavigate, Link } from "react-router-dom"
import { GraduationCap, FileCheck2, ArrowRight, Sparkles, Wand2 } from "lucide-react"
import { useData } from "@/stores/data"
import { useHistory } from "@/stores/history"
import { usePractice, uid } from "@/stores/practice"
import { samplePool } from "@/lib/sample-pool"
import type { SamplePoolConfig, SampledQuestion } from "@/lib/sample-pool"
import type { QuestionKind } from "@/types/content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const GRADABLE: QuestionKind[] = ["single_choice", "multi_select", "fill_blank", "matching"]

export function FinalPage() {
  const navigate = useNavigate()
  const { finalTests, topicsIndex } = useData()
  const save = usePractice((s) => s.save)
  const history = useHistory((s) => s.entries).slice(0, 5)

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

  function startRealMock() {
    const rm = finalTests.realMock
    if (!rm) return
    startSession(rm.id, rm.label, rm.questions as unknown as SampledQuestion[], {
      mix: [],
      total: rm.total,
      seed: 0,
      questionTypes: GRADABLE,
    })
  }

  function startSet(setId: string, label: string, seed: number, total: number) {
    const config: SamplePoolConfig = {
      mix: [{ topic: finalTests.poolKey, percent: 100 }],
      total,
      seed,
      questionTypes: GRADABLE,
    }
    const sampled = samplePool(topicsIndex, config)
    startSession(setId, label, sampled.questions, config)
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-gradient-to-br from-emerald-500/10 via-card to-card p-6">
        <Badge variant="success" className="mb-2">Kỳ thi cuối · Grammar</Badge>
        <h2 className="text-2xl font-bold">Final Test — Ngữ pháp</h2>
        <p className="mt-1 max-w-3xl text-muted-foreground">
          Làm bài theo đúng cấu trúc mock test: mỗi đề chia <b>Phần 1 · Trắc nghiệm</b> và <b>Phần 2 · Điền chỗ trống</b>,
          chấm điểm ngay và lưu lịch sử. Luyện Speaking nằm ở mục <Link to="/speaking" className="text-primary underline underline-offset-2">Speaking</Link>.
        </p>
        <p className="mt-2 inline-flex items-center gap-2 rounded-md bg-amber-500/10 px-3 py-1 text-sm text-amber-700 dark:text-amber-300">
          <Wand2 className="h-4 w-4" />
          Câu có nền vàng là câu AI sinh thêm để đủ số lượng — không phải câu gốc giáo trình.
        </p>
      </section>

      {finalTests.realMock && (
        <Card className="border-emerald-500/40">
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600">
                  <FileCheck2 className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>{finalTests.realMock.label}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">{finalTests.realMock.note}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{finalTests.realMock.total} câu chấm được (trích từ Lesson 19).</p>
                </div>
              </div>
              <Button onClick={startRealMock} className="shrink-0">
                Làm đề thật <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" /> 10 bộ đề luyện
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {finalTests.sets.length} bộ đề cố định, mỗi bộ {finalTests.sets[0]?.total || 50} câu rút từ {finalTests.poolTotal} câu grammar
            (gồm {finalTests.generatedCount} câu AI-sinh). Mỗi bộ mở lại luôn giống nhau để bạn ôn có hệ thống.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {finalTests.sets.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-3">
                <div>
                  <div className="font-semibold">{s.label}</div>
                  <div className="text-xs text-muted-foreground">{s.total} câu · 2 phần</div>
                </div>
                <Button variant="outline" size="sm" onClick={() => startSet(s.id, s.label, s.seed, s.total)}>
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
