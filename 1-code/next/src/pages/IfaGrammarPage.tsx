import { useState } from "react"
import { ifaGrammar } from "@/data/ifa-grammar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { cn } from "@/lib/utils"

/**
 * Grammar reference for IELTS Foundation A, built from the class slides
 * (Lesson 3-10). Topic picker up top; each topic shows usage/structure
 * sections with examples. Desktop shows a sticky topic list on the left.
 */
export function IfaGrammarPage() {
  const [topicId, setTopicId] = useState(ifaGrammar[0]?.id ?? "")
  const topic = ifaGrammar.find((t) => t.id === topicId) ?? ifaGrammar[0]

  if (!ifaGrammar.length) return <p>Chưa có nội dung ngữ pháp.</p>

  return (
    <div data-toc-skip className="lg:flex lg:items-start lg:gap-6">
      {/* Desktop topic rail */}
      <aside className="hidden lg:block lg:sticky lg:top-6 lg:w-64 lg:shrink-0 lg:self-start">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Chủ điểm</p>
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
              <span className={cn("text-xs", t.id === topic.id ? "text-primary-foreground/80" : "text-muted-foreground")}>Lesson {t.lesson} · {t.vi}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile topic picker */}
      <div className="mb-4 lg:hidden">
        <Select
          id="ifa-grammar-topic"
          value={topic.id}
          options={ifaGrammar.map((t) => ({ value: t.id, label: `${t.label} · L${t.lesson}` }))}
          onChange={setTopicId}
        />
      </div>

      <div className="min-w-0 flex-1 space-y-4">
        <Card>
          <CardHeader className="gap-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Lesson {topic.lesson} · {topic.vi}</p>
            <CardTitle className="content-en text-xl leading-snug">{topic.label}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{topic.summary}</p>
          </CardHeader>
          <CardContent className="space-y-5">
            {topic.sections.map((section, i) => (
              <section key={i} className="space-y-2">
                <h3 className="text-sm font-bold">{section.heading}</h3>
                <ul className="space-y-1.5">
                  {section.points.map((p, j) => (
                    <li key={j} className="content-en flex gap-2 text-[15px] leading-relaxed">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/50" aria-hidden />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                {section.examples && section.examples.length > 0 && (
                  <div className="space-y-1.5 rounded-lg bg-muted/40 p-3">
                    {section.examples.map((e, k) => (
                      <p key={k} className="content-en text-sm leading-relaxed">{e}</p>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
