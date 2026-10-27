import { Link } from "react-router-dom"
import { ArrowRight, BookOpenCheck, PenLine, Clock3, Check } from "lucide-react"
import { ifaTestPapers, paperTopics } from "@/content/ifa-reading"
import { useIfaReading } from "@/stores/ifa-reading"
import { PageHeader } from "@/components/common/Page"
import { cn } from "@/lib/utils"

/** Lists every practice paper for one skill and links into the runner. */
export function IfaTestListPage({ skill }: { skill: "reading" | "writing" }) {
  const isReading = skill === "reading"
  const papers = useIfaReading((s) => s.papers)

  return (
    <div className="mx-auto max-w-4xl space-y-4 pb-10">
      <PageHeader
        icon={isReading ? BookOpenCheck : PenLine}
        title={isReading ? "Reading — Đề luyện tập" : "Writing — Đề luyện tập"}
        description={
          isReading
            ? "Chọn một đề để làm. Nộp bài là chấm điểm ngay."
            : "Chọn một đề để viết. Bài tự lưu trên thiết bị này."
        }
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {ifaTestPapers.map((p) => {
          const progress = papers[p.id]
          const submitted = isReading && progress?.submitted
          const base = isReading ? "/reading-ifa" : "/writing-ifa"
          const count = isReading ? p.reading.totalQuestions : p.writing.exercises.length
          return (
            <Link
              key={p.id}
              to={`${base}/${p.id}`}
              className={cn(
                "group flex flex-col rounded-xl border border-border bg-card p-5 shadow-card transition-all",
                "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  {isReading ? <BookOpenCheck className="size-5" /> : <PenLine className="size-5" />}
                </span>
                {submitted && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-success">
                    <Check className="size-3" /> Đã nộp
                  </span>
                )}
              </div>

              <h3 className="mt-4 font-bold tracking-tight">{p.title}</h3>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="size-3.5" /> {isReading ? p.reading.timeAllowed : p.writing.timeAllowed}
                </span>
                <span>{isReading ? `${count} câu` : `${count} bài`}</span>
              </div>

              {isReading && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {paperTopics(p).map((t) => (
                    <span key={t} className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                {isReading ? "Làm bài" : "Viết bài"} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
