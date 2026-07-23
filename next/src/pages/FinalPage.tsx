import { useMemo, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, BookOpen, FileText, GraduationCap, MessageSquare, NotebookTabs } from "lucide-react"
import { useData } from "@/stores/data"
import { useProgress } from "@/stores/progress"
import { mdToHtml } from "@/lib/markdown"
import { displayLabel } from "@/lib/topic-label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const APP_BASE = (import.meta.env.BASE_URL || "/").replace(/\/?$/, "/")

function assetHref(path: string) {
  return `${APP_BASE}${path.split("/").map(encodeURIComponent).join("/")}`
}

export function FinalPage() {
  const navigate = useNavigate()
  const { docs, finalPacket, speakingQuestions, topicLabels } = useData()
  const done = useProgress((s) => s.done)
  const toggle = useProgress((s) => s.toggle)

  const packetHtml = useMemo(() => mdToHtml(finalPacket.markdown || ""), [finalPacket.markdown])
  const speaking = docs.filter((d) => d.type === "speaking")
  const knowledge = docs.filter((d) => d.type === "grammar" || d.type === "pronunciation")
  const checklistDocs = [...speaking, ...knowledge]
  const numDone = checklistDocs.filter((d) => done[d.id]).length
  const pct = checklistDocs.length ? Math.round((numDone / checklistDocs.length) * 100) : 0

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-gradient-to-br from-emerald-500/10 via-card to-card p-6">
        <Badge variant="success" className="mb-2">
          Trang chính ôn thi cuối
        </Badge>
        <h2 className="text-2xl font-bold">Tổng hợp kiến thức khóa Pre-IELTS</h2>
        <p className="mt-1 max-w-3xl text-muted-foreground">
          Đây là packet giáo viên gửi cuối khóa, gồm Grammar tổng hợp bằng ảnh/sơ đồ và các link speaking theo chủ đề.
          Notes, Daily và Practice chỉ là phần phụ trợ để luyện lại theo packet này.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <JumpCard
            icon={<GraduationCap className="h-5 w-5" />}
            title="Grammar packet"
            text="Đọc theo đúng thứ tự Part of Speech, Tenses, Sentences trong file tổng hợp."
            target="final-course-packet"
          />
          <JumpCard
            icon={<NotebookTabs className="h-5 w-5" />}
            title="Speaking topic sheets"
            text="Các file Lesson 7, 8, 9... là sheet hướng dẫn speaking theo chủ đề, không phải vocab rời."
            target="final-speaking-sheets"
          />
          <JumpCard
            icon={<MessageSquare className="h-5 w-5" />}
            title="Final speaking bank"
            text="Câu hỏi giáo viên có thể random hỏi, gom theo topic để luyện trả lời."
            target="final-speaking-bank"
          />
        </div>
      </section>

      <Card id="final-course-packet" className="scroll-mt-20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle>{finalPacket.title}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Render từ <code>{finalPacket.sourceFile}</code>. Ảnh được giữ theo packet gốc để ôn đúng bố cục giáo viên gửi.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <a href={assetHref(finalPacket.sourceFile)}>
                Mở file gốc <ArrowRight className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <article className="markdown-note searchable" dangerouslySetInnerHTML={{ __html: packetHtml }} />
        </CardContent>
      </Card>

      <Card id="final-speaking-sheets" className="scroll-mt-20">
        <CardHeader>
          <CardTitle>Speaking Topic Sheets · file giáo viên gửi</CardTitle>
          <p className="text-sm text-muted-foreground">
            Các link trong packet là bài hướng dẫn trả lời Speaking theo topic. Dùng chúng để lấy khung câu, câu mẫu và cụm từ cần nói.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {finalPacket.speakingSheets.map((sheet) => (
              <div key={sheet.file} className="rounded-lg border border-border bg-card p-4 searchable">
                <div className="flex items-start gap-2">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">{sheet.topic}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{sheet.file}</div>
                    {sheet.focus && <div className="mt-2 text-sm">Ôn speaking: {sheet.focus}</div>}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button asChild variant="secondary" size="sm">
                    <a href={assetHref(sheet.localPath)}>Mở bản local</a>
                  </Button>
                  {sheet.sourceHref && (
                    <Button asChild variant="outline" size="sm">
                      <a href={sheet.sourceHref} target="_blank" rel="noopener">
                        Google Doc
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card id="final-speaking-bank" className="scroll-mt-20">
        <CardHeader>
          <CardTitle>Bộ câu hỏi Speaking Final</CardTitle>
          <p className="text-sm text-muted-foreground">
            Luyện theo topic trước, không học thuộc một danh sách dài. Mỗi câu nên trả lời trực tiếp, thêm lý do bằng <code>because</code>, rồi thêm ví dụ ngắn.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
            {Object.entries(speakingQuestions).map(([topicKey, questions]) => {
              const label = displayLabel(topicLabels[topicKey], topicKey)
              return (
                <section key={topicKey} className="rounded-lg border border-border bg-muted/20 p-4 searchable">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h3 className="font-semibold">{label}</h3>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/topics/${topicKey}?tab=questions`)}>
                      Mở topic <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                  <ol className="list-decimal space-y-2 pl-5 text-sm marker:font-semibold marker:text-primary">
                    {questions.map((q, i) => (
                      <li key={i}>
                        <span className="font-medium">{q.q}</span>
                        {q.subQuestions && q.subQuestions.length > 0 && (
                          <div className="mt-1 text-muted-foreground">{q.subQuestions.join(" · ")}</div>
                        )}
                      </li>
                    ))}
                  </ol>
                </section>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Checklist phụ trợ từ Notes</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Dùng sau khi đã đọc packet chính. Tick để theo dõi phần nào đã ôn lại trong notes chi tiết.
              </p>
            </div>
            <div className="min-w-40 text-sm font-semibold tabular-nums">
              {numDone}/{checklistDocs.length} · {pct}%
            </div>
          </div>
          <Progress value={pct} />
        </CardHeader>
        <CardContent className="space-y-4">
          <SupportChecklist
            title="Speaking notes"
            icon={<MessageSquare className="h-4 w-4" />}
            docs={speaking}
            done={done}
            toggle={toggle}
            navigate={navigate}
          />
          <SupportChecklist
            title="Grammar & Pronunciation notes"
            icon={<BookOpen className="h-4 w-4" />}
            docs={knowledge}
            done={done}
            toggle={toggle}
            navigate={navigate}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function JumpCard({ icon, title, text, target }: { icon: ReactNode; title: string; text: string; target: string }) {
  return (
    <button
      type="button"
      onClick={() => document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" })}
      className="rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-accent/30"
    >
      <div className="flex items-center gap-2 font-semibold text-primary">
        {icon}
        {title}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
    </button>
  )
}

function SupportChecklist({
  title,
  icon,
  docs,
  done,
  toggle,
  navigate,
}: {
  title: string
  icon: ReactNode
  docs: { id: string; title: string; type: string; lesson: string }[]
  done: Record<string, boolean>
  toggle: (id: string) => void
  navigate: (path: string) => void
}) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-2 font-semibold">
        {icon}
        {title}
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {docs.map((d) => (
          <label
            key={d.id}
            className={`flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2 transition-colors hover:bg-accent/30 ${
              done[d.id] ? "border-primary/40 bg-primary/5" : ""
            }`}
          >
            <Checkbox checked={!!done[d.id]} onCheckedChange={() => toggle(d.id)} />
            <span className="min-w-0 flex-1">
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
    </section>
  )
}
