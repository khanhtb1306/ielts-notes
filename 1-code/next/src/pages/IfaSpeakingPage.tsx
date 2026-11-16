import { useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, Sparkles, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { ttsSupported } from "@/lib/tts"
import { useSpeak } from "@/lib/use-speak"
import { ifaSpeakingHandouts, speakingTopics } from "@/lib/ifa-speaking"
import { ifaSpeakingSupplements } from "@/content/ifa-speaking-supplements"
import { SpeakingQuestionCard } from "@/components/ifa/SpeakingQuestionCard"
import { SpeakingTabs } from "@/components/ifa/SpeakingTabs"
import { VariantTabs } from "@/components/ifa/VariantTabs"
import type { IfaFinalQuestion, IfaHandout, IfaSpeakingQuestion } from "@/types/content"

type Item =
  | { kind: "build"; handout: IfaHandout; index: number; question: IfaSpeakingQuestion }
  | { kind: "final"; question: IfaFinalQuestion }

/** Normalise a question for dedup: drop a leading "N. ", punctuation and case. */
function normQuestion(s: string): string {
  return s.toLowerCase().replace(/^\s*\d+[.)]\s*/, "").replace(/[^a-z0-9]+/g, " ").trim()
}

// Filler words ignored when matching questions, so "Do you think that you're a
// good student?" and "Do you think you're a good student?" count as the same.
const STOP = new Set("do does did you your the a an to that is are am be been it its i my we they them this these those of or and with on why".split(" "))

function coreTokens(s: string): Set<string> {
  return new Set(normQuestion(s).split(" ").filter((w) => w && !STOP.has(w)))
}

/** True when the shorter question's core words are fully contained in the other. */
function sameQuestion(a: Set<string>, b: Set<string>): boolean {
  const [small, big] = a.size <= b.size ? [a, b] : [b, a]
  if (small.size < 2) return false
  for (const w of small) if (!big.has(w)) return false
  return true
}

export function IfaSpeakingPage() {
  const topics = useMemo(() => speakingTopics(), [])
  const [topicKey, setTopicKey] = useState(topics[0]?.key ?? "")
  const [variantIdx, setVariantIdx] = useState(0)
  const [itemIndex, setItemIndex] = useState(0)

  const topic = topics.find((t) => t.key === topicKey) ?? topics[0]
  const handout = topic?.handouts[variantIdx] ?? topic?.handouts[0]

  // One list per topic: sentence-builder questions first, then only the final
  // questions that aren't already covered by a handout (dedup by text — the
  // topic's own questions stay the standard). Same card style for both.
  const items = useMemo<Item[]>(() => {
    const out: Item[] = []
    if (handout) handout.questions.forEach((q, i) => out.push({ kind: "build", handout, index: i, question: q }))

    const covered: Set<string>[] = []
    for (const h of topic?.handouts ?? []) for (const q of h.questions) covered.push(coreTokens(q.title))

    if (topic?.finalTopic) {
      for (const q of topic.finalTopic.questions) {
        const core = coreTokens(q.q)
        if (covered.some((c) => sameQuestion(core, c))) continue
        out.push({ kind: "final", question: q })
      }
    }
    return out
  }, [handout, topic])

  if (!ifaSpeakingHandouts.length && !topics.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <h2 className="text-xl font-semibold">Chưa có dữ liệu Speaking IFA</h2>
        <p className="mt-2 text-muted-foreground">Chạy lại preprocess sau khi thêm nội dung.</p>
      </div>
    )
  }

  function selectTopic(key: string) {
    setTopicKey(key)
    setVariantIdx(0)
    setItemIndex(0)
  }

  const topicOptions = topics.map((t) => ({ value: t.key, label: `${t.num}. ${t.label}` }))
  const topicPos = topics.findIndex((t) => t.key === topic?.key)
  const idx = Math.min(itemIndex, Math.max(items.length - 1, 0))
  const item = items[idx]

  return (
    <div data-toc-skip>
      <SpeakingTabs />

      {/* Topic picker + prev/next */}
      <div className="mb-4 flex items-center gap-2">
        <Select id="ifa-topic" className="flex-1" value={topic?.key ?? ""} options={topicOptions} onChange={selectTopic} />
        <div className="flex items-center gap-1 rounded-lg border border-input bg-card px-1">
          <Button variant="ghost" size="icon" disabled={topicPos <= 0} onClick={() => selectTopic(topics[topicPos - 1].key)} aria-label="Chủ đề trước"><ArrowLeft className="size-4" /></Button>
          <span className="min-w-[3ch] text-center text-sm font-semibold tabular-nums">{topicPos + 1}/{topics.length}</span>
          <Button variant="ghost" size="icon" disabled={topicPos >= topics.length - 1} onClick={() => selectTopic(topics[topicPos + 1].key)} aria-label="Chủ đề tiếp"><ArrowRight className="size-4" /></Button>
        </div>
      </div>

      {/* Audience variants (e.g. Working: học sinh / người đi làm) */}
      {(topic?.handouts.length ?? 0) > 1 && (
        <div className="mb-4">
          <VariantTabs
            labels={topic!.handouts.map((h, i) => h.audienceLabel || `Bản ${i + 1}`)}
            active={variantIdx}
            onSelect={(i) => { setVariantIdx(i); setItemIndex(0) }}
          />
        </div>
      )}

      {items.length > 0 && (
        <>
          <div className="mb-4 flex items-center justify-between gap-2">
            <Button variant="outline" size="sm" disabled={idx === 0} onClick={() => setItemIndex(idx - 1)}><ArrowLeft className="size-4" /> Câu trước</Button>
            <span className="text-sm font-semibold tabular-nums">{idx + 1}/{items.length}</span>
            <Button variant="outline" size="sm" disabled={idx >= items.length - 1} onClick={() => setItemIndex(idx + 1)}>Câu tiếp <ArrowRight className="size-4" /></Button>
          </div>

          {item?.kind === "build" && (
            <SpeakingQuestionCard
              key={`${item.handout.id}-${item.index}`}
              handoutId={item.handout.id}
              questionIndex={item.index}
              question={item.question}
            />
          )}

          {item?.kind === "final" && (() => {
            const sup = ifaSpeakingSupplements[item.question.id]
            if (sup) return <SpeakingQuestionCard key={item.question.id} handoutId={`sup-${item.question.id}`} questionIndex={0} question={{ ...sup, title: `${idx + 1}. ${sup.title}` }} supplement />
            return <FinalGuideFallback key={item.question.id} question={item.question} num={idx + 1} />
          })()}
        </>
      )}
    </div>
  )
}

/**
 * Fallback for supplemented Final questions not yet authored into the builder
 * shape — shows the read-only guide so the topic still works while we author
 * them one by one. Same card style; marked with the supplement icon.
 */
function FinalGuideFallback({ question, num }: { question: IfaFinalQuestion; num: number }) {
  const speak = useSpeak()
  return (
    <Card>
      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="content-en text-xl leading-snug">{num}. {question.q}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{question.vi}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <span title="Câu bổ sung từ bộ Final" aria-label="Câu bổ sung" className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary"><Sparkles className="size-4" /></span>
            {ttsSupported() && (
              <Button variant="outline" size="icon" aria-label="Nghe câu hỏi" onClick={() => speak(question.q)}><Volume2 className="size-4" /></Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-primary-soft px-3 py-2.5">
          <h4 className="text-sm font-bold text-primary">Khung trả lời gợi ý</h4>
          <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[11px] font-semibold text-primary">Từ {question.source}</span>
        </div>
        <div className="divide-y divide-border border-y border-border">
          {question.guide.map((point, i) => (
            <div key={i} className="py-4 first:pt-3 last:pb-3">
              <h4 className="text-sm font-semibold leading-relaxed">
                <span className="mr-1.5 inline-flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">{i + 1}</span>
                {point.idea}
              </h4>
              <div className="mt-2 divide-y divide-border/70 overflow-hidden rounded-lg border border-border sm:grid sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                {point.phrases.map(({ en, vi, ipa }, j) => (
                  <div key={j} className="flex min-h-16 items-start justify-between gap-2 px-3 py-2.5 text-sm transition-colors hover:bg-muted/40">
                    <div className="min-w-0">
                      <p className="content-en font-semibold">{en}</p>
                      {ipa && <p className="ipa mt-0.5 text-xs text-primary">/{ipa}/</p>}
                      <p className="mt-1 text-xs text-muted-foreground">{vi}</p>
                    </div>
                    {ttsSupported() && (
                      <button type="button" aria-label={`Nghe: ${en}`} onClick={() => speak(en)} className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-primary">
                        <Volume2 className="size-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
