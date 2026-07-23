import { Link } from "react-router-dom"
import { useMemo } from "react"
import { useData } from "@/stores/data"
import { useUi } from "@/stores/ui"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { displayLabel } from "@/lib/topic-label"

const SKILL_ORDER = ["grammar", "pronunciation", "vocabulary", "speaking", "listening", "misc"]
const SKILL_LABEL: Record<string, string> = {
  grammar: "Grammar",
  pronunciation: "Pronunciation",
  vocabulary: "Vocabulary",
  speaking: "Speaking",
  listening: "Listening",
  misc: "Khác",
}

export function TopicsIndexPage() {
  const { topicsIndex, topicLabels } = useData()
  const search = useUi((s) => s.search).toLowerCase().trim()

  const grouped = useMemo(() => {
    const g: Record<string, string[]> = {}
    for (const k of topicsIndex.order) {
      const meta = topicLabels[k]
      const skill = meta?.skill || topicsIndex.topics[k]?.skill || "misc"
      ;(g[skill] = g[skill] || []).push(k)
    }
    return g
  }, [topicsIndex, topicLabels])

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-gradient-to-br from-sky-500/10 via-card to-card p-6">
        <Badge variant="secondary" className="mb-2">{Object.keys(topicsIndex.topics).length} chủ đề</Badge>
        <h2 className="text-2xl font-bold">Daily Practice · Theo Chủ Đề</h2>
        <p className="text-muted-foreground mt-1">
          Gom mọi content block + câu hỏi thuộc cùng chủ đề, xuyên suốt 17 daily sets. Phân biệt{" "}
          <Badge variant="success" className="mx-0.5">core</Badge>{" "}
          <Badge variant="secondary" className="mx-0.5">review</Badge>{" "}
          <Badge variant="info" className="mx-0.5">preview</Badge>{" "}
          để biết bài chính vs ôn lại vs chuẩn bị.
        </p>
      </div>

      {SKILL_ORDER.filter((s) => grouped[s]?.length).map((skill) => {
        const keys = (grouped[skill] || []).filter((k) => {
          if (!search) return true
          const meta = topicLabels[k]
          const labelVi = displayLabel(meta, k).toLowerCase()
          const labelEn = (meta?.label || k).toLowerCase()
          const s = search
          return labelVi.includes(s) || labelEn.includes(s) || k.toLowerCase().includes(s)
        })
        if (!keys.length) return null
        return (
          <section key={skill}>
            <h3 className="text-lg font-semibold mb-3">{SKILL_LABEL[skill] || skill}</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {keys.map((k) => {
                const t = topicsIndex.topics[k]
                const meta = topicLabels[k] || {}
                const refs = t?.refs || []
                const nCore = refs.filter((r) => r.role === "core").length
                const nReview = refs.filter((r) => r.role === "review").length
                const nPreview = refs.filter((r) => r.role === "preview").length
                const lessons = [...new Set(refs.map((r) => r.lessonKey))].sort()
                return (
                  <Link key={k} to={`/topics/${k}`} className="group">
                    <Card className="h-full transition-shadow group-hover:shadow-md group-hover:border-primary/40 searchable">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="min-w-0">
                            <h4 className="font-semibold text-base leading-tight">{displayLabel(meta, t?.label || k)}</h4>
                            {meta.viLabel && meta.label && meta.viLabel !== meta.label && (
                              <div className="text-[11px] text-muted-foreground mt-0.5">{meta.label}</div>
                            )}
                          </div>
                          {meta.needsNotes && (
                            <Badge variant="warn" className="shrink-0 text-[10px]">chưa có notes</Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {refs.length} item · {nCore} core · {nReview} review · {nPreview} preview
                        </div>
                        {lessons.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {lessons.map((l) => (
                              <span
                                key={l}
                                className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-medium"
                              >
                                {l.replace("lesson-", "L")}
                              </span>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
