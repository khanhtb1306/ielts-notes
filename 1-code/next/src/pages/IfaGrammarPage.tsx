import { useState } from "react"
import { Blocks, Lightbulb, ListChecks, GitCompareArrows, Info, Quote } from "lucide-react"
import { ifaGrammar } from "@/data/ifa-grammar"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { IfaGrammarSection, IfaGrammarSectionKind, IfaGrammarTopic } from "@/types/content"

/** Per-kind presentation: icon, accent colour, Vietnamese label. */
const KIND: Record<IfaGrammarSectionKind, { label: string; icon: typeof Lightbulb; accent: string; soft: string }> = {
  usage: { label: "Cách dùng", icon: Lightbulb, accent: "text-amber-600 dark:text-amber-400", soft: "bg-amber-500/10" },
  structure: { label: "Cấu trúc", icon: Blocks, accent: "text-indigo-600 dark:text-indigo-400", soft: "bg-indigo-500/10" },
  rules: { label: "Quy tắc", icon: ListChecks, accent: "text-teal-600 dark:text-teal-400", soft: "bg-teal-500/10" },
  contrast: { label: "Phân biệt", icon: GitCompareArrows, accent: "text-rose-600 dark:text-rose-400", soft: "bg-rose-500/10" },
  note: { label: "Lưu ý", icon: Info, accent: "text-sky-600 dark:text-sky-400", soft: "bg-sky-500/10" },
}

/** Split "label: formula" or "label — formula" into a two-part structure row. */
function splitStructure(line: string): { label?: string; formula: string } {
  const m = line.match(/^(.*?)\s*[:：]\s*(.+)$/)
  if (m && m[1].length <= 42) return { label: m[1].trim(), formula: m[2].trim() }
  return { formula: line }
}

function SectionBlock({ section }: { section: IfaGrammarSection }) {
  const meta = KIND[section.kind] ?? KIND.usage
  const Icon = meta.icon
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg", meta.soft, meta.accent)}>
          <Icon className="size-4" />
        </span>
        <div>
          <p className={cn("text-[10px] font-bold uppercase tracking-wider", meta.accent)}>{meta.label}</p>
          <h3 className="text-sm font-bold leading-tight">{section.heading}</h3>
        </div>
      </div>

      {section.kind === "structure" ? (
        <div className="space-y-2">
          {section.points.map((p, i) => {
            const { label, formula } = splitStructure(p)
            return (
              <div key={i} className="flex flex-col gap-1 rounded-lg bg-indigo-500/5 p-3 sm:flex-row sm:items-center sm:gap-3">
                {label && <span className="shrink-0 text-xs font-semibold text-muted-foreground sm:w-28">{label}</span>}
                <code className="content-en rounded-md bg-background px-2.5 py-1.5 text-sm font-semibold text-indigo-700 dark:text-indigo-300">{formula}</code>
              </div>
            )
          })}
        </div>
      ) : section.kind === "contrast" ? (
        <ul className="space-y-2">
          {section.points.map((p, i) => (
            <li key={i} className="content-en rounded-lg bg-rose-500/5 p-3 text-sm leading-relaxed">{p}</li>
          ))}
        </ul>
      ) : (
        <ul className="space-y-2">
          {section.points.map((p, i) => (
            <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed">
              <span className={cn("mt-2 size-1.5 shrink-0 rounded-full", meta.accent.replace("text-", "bg-"))} aria-hidden />
              <span className="content-en">{p}</span>
            </li>
          ))}
        </ul>
      )}

      {section.examples && section.examples.length > 0 && (
        <div className="mt-3 space-y-1.5 rounded-lg border-l-2 border-primary/40 bg-muted/40 p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <Quote className="size-3" /> Ví dụ
          </div>
          {section.examples.map((e, k) => (
            <p key={k} className="content-en text-sm leading-relaxed">{e}</p>
          ))}
        </div>
      )}
    </section>
  )
}

function TopicPanel({ topic }: { topic: IfaGrammarTopic }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-primary/20 bg-primary-soft p-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">Lesson {topic.lesson}</span>
          <span className="text-xs font-semibold text-primary">{topic.vi}</span>
        </div>
        <h2 className="content-en mt-2 text-xl font-bold leading-snug">{topic.label}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{topic.summary}</p>
      </div>
      <div className="grid gap-3">
        {topic.sections.map((s, i) => <SectionBlock key={i} section={s} />)}
      </div>
    </div>
  )
}

export function IfaGrammarPage() {
  const [mode, setMode] = useState<"single" | "all">("single")
  const [topicId, setTopicId] = useState(ifaGrammar[0]?.id ?? "")
  const topic = ifaGrammar.find((t) => t.id === topicId) ?? ifaGrammar[0]

  if (!ifaGrammar.length) return <p>Chưa có nội dung ngữ pháp.</p>

  return (
    <div data-toc-skip>
      {/* View mode toggle */}
      <div className="mb-4 grid grid-cols-2 gap-2 sm:inline-flex sm:w-auto">
        <Button variant={mode === "single" ? "default" : "outline"} size="sm" onClick={() => setMode("single")}>Theo chủ điểm</Button>
        <Button variant={mode === "all" ? "default" : "outline"} size="sm" onClick={() => setMode("all")}>Xem tất cả</Button>
      </div>

      {mode === "single" ? (
        <div className="lg:flex lg:items-start lg:gap-6">
          {/* Desktop topic rail */}
          <aside className="hidden lg:block lg:sticky lg:top-6 lg:w-64 lg:shrink-0 lg:self-start">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">8 chủ điểm</p>
            <nav className="space-y-1">
              {ifaGrammar.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTopicId(t.id)}
                  className={cn(
                    "flex w-full flex-col rounded-lg border px-3 py-2 text-left transition-colors",
                    t.id === topic.id ? "border-primary bg-primary text-primary-foreground shadow-card" : "border-input bg-card hover:border-primary/50 hover:bg-accent"
                  )}
                >
                  <span className="content-en text-sm font-semibold">{t.label}</span>
                  <span className={cn("text-xs", t.id === topic.id ? "text-primary-foreground/80" : "text-muted-foreground")}>Lesson {t.lesson}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Mobile topic picker */}
          <div className="mb-4 lg:hidden">
            <Select
              id="ifa-grammar-topic"
              value={topic.id}
              options={ifaGrammar.map((t) => ({ value: t.id, label: `L${t.lesson} · ${t.label}` }))}
              onChange={setTopicId}
            />
          </div>

          <div className="min-w-0 flex-1">
            <TopicPanel topic={topic} />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {ifaGrammar.map((t) => <TopicPanel key={t.id} topic={t} />)}
        </div>
      )}
    </div>
  )
}
