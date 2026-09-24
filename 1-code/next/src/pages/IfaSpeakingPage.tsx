import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Shuffle, Volume2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ttsSupported } from "@/lib/tts"
import { useSpeak } from "@/lib/use-speak"
import { ifaSpeakingHandouts, handoutTopics } from "@/lib/ifa-speaking"
import { useIfaSpeaking } from "@/stores/ifa-speaking"
import { SpeakingQuestionCard } from "@/components/ifa/SpeakingQuestionCard"
import {
  SpeakingRail,
  RailSection,
  RailStrip,
  RailItem,
  RailProgress,
  RailSelect,
  RailVoice,
} from "@/components/ifa/SpeakingRail"
import { VariantTabs } from "@/components/ifa/VariantTabs"
import type { RailSelectOption } from "@/components/ifa/SpeakingRail"
import type { SavedAnswer } from "@/stores/ifa-speaking"

export function IfaSpeakingPage() {
  const topics = useMemo(() => handoutTopics(), [])
  const [topicKey, setTopicKey] = useState(topics[0]?.key ?? "")
  const [variantIdx, setVariantIdx] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)

  const topic = topics.find((t) => t.key === topicKey) ?? topics[0]
  const handout = topic?.variants[variantIdx] ?? topic?.variants[0]
  const handoutId = handout?.id ?? ""

  const topicOptions = useMemo<RailSelectOption[]>(
    () =>
      topics.map((t) => ({ value: t.key, label: t.topicLabel })),
    [topics]
  )

  const savedList = useIfaSpeaking((s) => s.answers)
  const clearHandout = useIfaSpeaking((s) => s.clearHandout)

  const saved = useMemo(
    () =>
      Object.values(savedList)
        .filter((a) => a.handoutId === handoutId)
        .sort((x, y) => x.questionIndex - y.questionIndex),
    [savedList, handoutId]
  )
  const savedIndexes = useMemo(() => new Set(saved.map((a) => a.questionIndex)), [saved])

  function selectTopic(key: string) {
    setTopicKey(key)
    setVariantIdx(0)
    setQuestionIndex(0)
  }

  function selectVariant(i: number) {
    setVariantIdx(i)
    setQuestionIndex(0)
  }

  if (!ifaSpeakingHandouts.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <h2 className="text-xl font-semibold">Chưa có dữ liệu Speaking IFA</h2>
        <p className="mt-2 text-muted-foreground">Chạy lại preprocess sau khi thêm handout.</p>
      </div>
    )
  }

  const savedPanel = handout ? (
    <SavedAnswersPanel
      topicLabel={handout.topicLabel}
      saved={saved}
      onClear={() => clearHandout(handoutId)}
    />
  ) : null

  return (
    <div data-toc-skip>
      {/* TopBar already renders the page title — controls go straight into the rail. */}
      <div className="lg:flex lg:items-start lg:gap-6 2xl:gap-8">
        <SpeakingRail>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="h-9 flex-1 justify-center">
              <Link to="/speaking-ifa/drill">
                <Shuffle className="size-4" /> Luyện phản xạ
              </Link>
            </Button>
            <RailVoice />
          </div>

          <RailSection title="Chủ đề">
            {/* Dropdown keeps the rail a fixed height as more lessons ship. */}
            <RailSelect id="ifa-topic" value={topic?.key ?? ""} options={topicOptions} onChange={selectTopic} />
          </RailSection>

          {handout && (
            <>
              <RailProgress done={saved.length} total={handout.questions.length} label="đã lưu" />

              <RailSection title="Câu hỏi">
                <RailStrip>
                  {handout.questions.map((q, i) => {
                    const isSaved = savedIndexes.has(i)
                    return (
                      <RailItem
                        key={i}
                        active={i === questionIndex}
                        onClick={() => setQuestionIndex(i)}
                        title={isSaved ? `${q.title} — đã lưu` : q.title}
                        className={cn(
                          isSaved &&
                            i !== questionIndex &&
                            "border-emerald-500/50 text-emerald-700 dark:text-emerald-400"
                        )}
                        trailing={
                          isSaved ? (
                            <span className="size-2 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                          ) : undefined
                        }
                      >
                        <span className="tabular-nums">{i + 1}.</span>
                        {/* Preview only helps once the rail is a vertical list. */}
                        <span className="content-en ml-1.5 hidden font-medium lg:inline">
                          {stripNumber(q.title)}
                        </span>
                      </RailItem>
                    )
                  })}
                </RailStrip>
              </RailSection>
            </>
          )}
        </SpeakingRail>

        {handout && (
          <div className="mt-5 min-w-0 flex-1 space-y-5 lg:mt-0">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <p className="text-lg font-bold tracking-tight">{handout.topicLabel}</p>
              {handout.grammarFocus && (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-primary-soft px-2 py-1 text-xs font-semibold text-primary">
                  Trọng tâm: {handout.grammarFocus}
                </span>
              )}
            </div>

            {/* Audience splits become tabs here instead of extra rail entries. */}
            {topic && (
              <VariantTabs
                labels={topic.variants.map((v, i) => v.audienceLabel || `Bản ${i + 1}`)}
                active={variantIdx}
                onSelect={selectVariant}
              />
            )}

            {handout.questions[questionIndex] && (
              <SpeakingQuestionCard
                key={`${handoutId}-${questionIndex}`}
                handoutId={handoutId}
                questionIndex={questionIndex}
                question={handout.questions[questionIndex]}
              />
            )}

            {/* Below 2xl the saved answers stay at the end of the working column. */}
            <div className="2xl:hidden">{savedPanel}</div>
          </div>
        )}

        {saved.length > 0 && (
          <aside className="hidden w-[280px] shrink-0 self-start 2xl:sticky 2xl:top-6 2xl:block 2xl:max-h-[calc(100vh-3rem)] 2xl:overflow-y-auto">
            {savedPanel}
          </aside>
        )}
      </div>
    </div>
  )
}

function stripNumber(title: string): string {
  return title.replace(/^\d+\.\s*/, "")
}

function SavedAnswersPanel({
  topicLabel,
  saved,
  onClear,
}: {
  topicLabel: string
  saved: SavedAnswer[]
  onClear: () => void
}) {
  const speak = useSpeak()
  if (!saved.length) return null

  return (
    <div className="rounded-xl border border-border bg-card shadow-card">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
        <p className="min-w-0 truncate text-sm font-bold" title={`Bài làm của tôi — ${topicLabel}`}>
          Bài làm của tôi
        </p>
        <Button variant="ghost" size="sm" className="shrink-0" onClick={onClear}>
          <Trash2 className="size-4" /> Xóa hết
        </Button>
      </div>
      <div className="space-y-3 p-3">
        {saved.map((a) => (
          <div key={a.questionIndex} className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="content-en text-sm font-bold text-muted-foreground">{a.title}</p>
              {ttsSupported() && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  aria-label="Đọc câu trả lời"
                  onClick={() => speak(a.answer)}
                >
                  <Volume2 className="size-4" />
                </Button>
              )}
            </div>
            <p className="content-en mt-1.5 text-[15px] leading-relaxed">{a.answer}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
