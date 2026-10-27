import { Link, useParams } from "react-router-dom"
import { PenLine, Clock3, ChevronLeft } from "lucide-react"
import { getPaper } from "@/content/ifa-reading"
import { useIfaReading } from "@/stores/ifa-reading"
import { PageHeader, PageSection, EmptyState } from "@/components/common/Page"
import { Button } from "@/components/ui/button"

/** Rough sentence count — splits on ., ! and ? followed by space/end. */
function countSentences(text: string): number {
  const t = text.trim()
  if (!t) return 0
  return t.split(/[.!?]+(?:\s|$)/).filter((s) => s.trim().length > 0).length
}

function countWords(text: string): number {
  const t = text.trim()
  return t ? t.split(/\s+/).length : 0
}

export function IfaWritingPage() {
  const { paperId = "" } = useParams()
  const paper = getPaper(paperId)
  const progress = useIfaReading((s) => s.papers[paperId])
  const setWriting = useIfaReading((s) => s.setWriting)
  const drafts = progress?.writing ?? {}

  if (!paper) {
    return (
      <EmptyState
        icon={PenLine}
        title="Không tìm thấy đề"
        description="Đề luyện tập này không tồn tại."
        action={<Button asChild variant="outline"><Link to="/writing-ifa">← Danh sách đề</Link></Button>}
      />
    )
  }

  const { writing } = paper

  return (
    <div className="mx-auto max-w-4xl space-y-4 pb-10">
      <Link to="/writing-ifa" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        <ChevronLeft className="size-4" /> Danh sách đề
      </Link>
      <PageHeader
        icon={PenLine}
        title={`${paper.title} · Writing`}
        description={
          <span className="inline-flex items-center gap-1">
            <Clock3 className="size-3.5" /> {writing.timeAllowed}
          </span>
        }
      />

      {writing.exercises.map((ex) => {
        const value = drafts[ex.n] ?? ""
        const sentences = countSentences(value)
        const words = countWords(value)
        return (
          <PageSection
            key={ex.n}
            title={`Exercise ${ex.n}`}
            description={`${ex.instruction} (${ex.points} pts)`}
          >
            <div className="space-y-4">
              {ex.passage && (
                <div className="rounded-lg border border-border bg-muted/40 p-4">
                  <p className="mb-2 text-center font-semibold">{ex.passage.title}</p>
                  <p className="content-en text-[15px] leading-relaxed text-foreground/90">
                    {ex.passage.body}
                  </p>
                </div>
              )}

              {ex.topics && (
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {ex.topics.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              )}

              {ex.notes && ex.notes.length > 0 && (
                <div className="rounded-lg border border-info/30 bg-info-soft p-3 text-sm">
                  <p className="mb-1 font-semibold text-info">Yêu cầu</p>
                  <ul className="list-disc space-y-1 pl-5 text-foreground/80">
                    {ex.notes.map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <textarea
                  value={value}
                  onChange={(e) => setWriting(paperId, ex.n, e.target.value)}
                  rows={ex.n === 1 ? 5 : 10}
                  placeholder="Viết bài của bạn ở đây… (tự động lưu trên thiết bị này)"
                  className="w-full resize-y rounded-lg border border-input bg-background p-3 text-sm leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{words} từ</span>
                  <span>·</span>
                  <span className={ex.n === 2 && sentences < 7 ? "text-warn" : undefined}>
                    {sentences} câu{ex.n === 2 ? " (cần ≥ 7)" : ""}
                  </span>
                </div>
              </div>
            </div>
          </PageSection>
        )
      })}
    </div>
  )
}
