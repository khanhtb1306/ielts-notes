import { useState } from "react"
import { Link } from "react-router-dom"
import { Volume2, Check, RotateCcw, Save, Lightbulb, Layers } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ttsSupported } from "@/lib/tts"
import { useSpeak } from "@/lib/use-speak"
import { composeSentence, isComplete, slotSources, dependentSlots } from "@/lib/ifa-speaking"
import { useIfaSpeaking } from "@/stores/ifa-speaking"
import { PhraseChip } from "./PhraseChip"
import type { IfaPhrase, IfaScenario, IfaSpeakingQuestion } from "@/types/content"

interface Props {
  handoutId: string
  questionIndex: number
  question: IfaSpeakingQuestion
}

const SLOT_DOT: Record<number, string> = {
  1: "bg-slot1",
  2: "bg-slot2",
  3: "bg-slot3",
}

export function SpeakingQuestionCard({ handoutId, questionIndex, question }: Props) {
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [structIdx, setStructIdx] = useState(0)
  const [chosen, setChosen] = useState<Record<number, IfaPhrase | null>>({})
  const [showExample, setShowExample] = useState(false)

  const speak = useSpeak()
  const save = useIfaSpeaking((s) => s.save)
  const savedAnswer = useIfaSpeaking((s) => s.get(handoutId, questionIndex))

  const scenario = question.scenarios[scenarioIdx] as IfaScenario | undefined
  const struct = scenario?.structs[structIdx]

  function reset(nextScenario = scenarioIdx, nextStruct = structIdx) {
    setScenarioIdx(nextScenario)
    setStructIdx(nextStruct)
    setChosen({})
    setShowExample(false)
  }

  if (!scenario || !struct) return null

  const sentence = composeSentence(struct, chosen)
  const complete = isComplete(struct, chosen)
  const sources = slotSources(scenario, struct, chosen)

  function pick(slot: number, phrase: IfaPhrase) {
    setChosen((prev) => {
      const next = { ...prev, [slot]: phrase }
      for (const dep of dependentSlots(scenario!, slot)) next[dep] = null
      return next
    })
  }

  return (
    <Card className="overflow-visible">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="content-en text-xl leading-snug">{question.title}</CardTitle>
            {question.vi && <p className="mt-1.5 text-sm text-muted-foreground">{question.vi}</p>}
          </div>
          {ttsSupported() && (
            <Button
              variant="outline"
              size="icon"
              aria-label="Đọc câu hỏi"
              className="shrink-0"
              onClick={() => speak(question.title.replace(/^\d+\.\s*/, ""))}
            >
              <Volume2 className="size-4" />
            </Button>
          )}
        </div>

        {question.scenarios.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {question.scenarios.map((sc, i) => (
              <button
                key={i}
                type="button"
                onClick={() => reset(i, 0)}
                className={cn(
                  "rounded-lg border px-4 py-2 text-sm font-semibold transition-colors",
                  i === scenarioIdx
                    ? "border-primary bg-primary text-primary-foreground shadow-card"
                    : "border-input bg-card hover:border-primary/50 hover:bg-accent"
                )}
              >
                {sc.name}
              </button>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Structure picker */}
        {scenario.structs.length > 1 && (
          <section className="space-y-2">
            <SectionLabel>Chọn khung câu</SectionLabel>
            <div className="grid gap-2">
              {scenario.structs.map((st, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => reset(scenarioIdx, i)}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3.5 text-left transition-colors",
                    i === structIdx
                      ? "border-primary bg-primary-soft"
                      : "border-input bg-card hover:border-primary/40 hover:bg-accent/50"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                      i === structIdx
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-card text-muted-foreground"
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="content-en text-[15px] leading-relaxed">
                    {st.parts.map((p, j) =>
                      p.type === "text" ? (
                        <span key={j}>{p.text}</span>
                      ) : (
                        <span key={j} className={cn("mx-0.5 font-bold", slotText(p.slot))}>
                          [{p.slot}]
                        </span>
                      )
                    )}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Answer frame — the hero. Solid brand block so it never reads as a panel. */}
        <div className="sticky top-4 z-20 overflow-hidden rounded-xl bg-primary text-primary-foreground shadow-lift">
          <div className="flex items-center justify-between gap-2 border-b border-white/15 px-4 py-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary-foreground/80">
              Câu của bạn
            </p>
            <div className="flex items-center gap-1">
              {ttsSupported() && (
                <FrameButton onClick={() => speak(sentence)} disabled={!complete}>
                  <Volume2 className="size-3.5" /> Nghe
                </FrameButton>
              )}
              <FrameButton onClick={() => reset()}>
                <RotateCcw className="size-3.5" /> Làm lại
              </FrameButton>
            </div>
          </div>

          <p className="content-en flex flex-wrap items-center gap-x-1.5 gap-y-2 px-4 py-4 text-sentence">
            {struct.parts.map((p, j) => {
              if (p.type === "text") return <span key={j}>{p.text}</span>
              const val = chosen[p.slot]
              return val ? (
                <span
                  key={j}
                  className="inline-flex max-w-full items-center gap-1.5 rounded-2xl bg-white px-3 py-1 text-[17px] font-bold text-primary"
                >
                  <span className={cn("size-1.5 shrink-0 rounded-full", SLOT_DOT[p.slot] ?? "bg-primary")} />
                  <span className="min-w-0 break-words">{val.en}</span>
                </span>
              ) : (
                <span
                  key={j}
                  className="inline-flex max-w-full items-center gap-1.5 rounded-2xl border border-dashed border-white/55 bg-white/15 px-3 py-1 text-[15px] font-semibold"
                >
                  <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-extrabold text-primary">
                    {p.slot}
                  </span>
                  …
                </span>
              )
            })}
          </p>

          {struct.vi && (
            <p className="px-4 pb-3 text-xs italic text-primary-foreground/75">{struct.vi}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 bg-black/10 px-4 py-3">
            <button
              type="button"
              disabled={!complete}
              onClick={() => save({ handoutId, questionIndex, title: question.title, answer: sentence })}
              className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-bold text-primary shadow-sm transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-40"
            >
              <Save className="size-4" /> Lưu câu trả lời
            </button>
            <FrameButton onClick={() => setShowExample((v) => !v)}>
              <Lightbulb className="size-3.5" /> {showExample ? "Ẩn ví dụ" : "Ví dụ mẫu"}
            </FrameButton>
            {savedAnswer && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-foreground/90">
                <Check className="size-3.5" /> Đã lưu
              </span>
            )}
          </div>

          {showExample && struct.example && (
            <p className="content-en border-t border-white/15 bg-white/10 px-4 py-3 text-[15px] leading-relaxed">
              {struct.example}
            </p>
          )}
        </div>

        {/* One picker per slot */}
        {sources.map((src) => (
          <section key={src.slot} className="space-y-3">
            {src.blockedMessage ? (
              <>
                <SlotHeading slot={src.slot} label={src.label} hint={src.hint} />
                <p className="rounded-lg border border-dashed border-input bg-muted/40 p-4 text-sm text-muted-foreground">
                  {src.blockedMessage}
                </p>
              </>
            ) : (
              src.groups.map((grp, gi) => (
                <SlotGroup
                  key={gi}
                  slot={src.slot}
                  label={src.label}
                  /* Only useful when a slot has several named groups to tell apart. */
                  groupName={src.groups.length > 1 ? grp.name : ""}
                  showHeading={gi === 0}
                  hint={src.hint}
                  phrases={grp.items}
                  selected={chosen[src.slot]}
                  onPick={(p) => pick(src.slot, p)}
                />
              ))
            )}
          </section>
        ))}

        {/* Vocabulary */}
        {question.vocab.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <SectionLabel>Từ vựng chủ đề</SectionLabel>
              <Link
                to="/vocab-ifa"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <Layers className="size-3.5" /> Ôn bằng thẻ
              </Link>
            </div>
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
              {question.vocab.map((v, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 p-3 transition-colors hover:bg-muted/40 xl:grid xl:grid-cols-[minmax(0,1.1fr)_3.5rem_minmax(0,0.9fr)_minmax(0,1.1fr)_2rem] xl:items-baseline"
                >
                  <div className="min-w-0 flex-1 xl:contents">
                    <span className="content-en block text-[15px] font-bold">{v.term}</span>
                    {v.pos && (
                      <span className="mt-0.5 block text-[11px] uppercase tracking-wide text-muted-foreground">
                        {v.pos}
                      </span>
                    )}
                    {v.ipa && <span className="ipa mt-0.5 block text-[13px] text-primary">{v.ipa}</span>}
                    {v.vi && <span className="mt-0.5 block text-sm text-muted-foreground">{v.vi}</span>}
                  </div>
                  {ttsSupported() && (
                    <button
                      type="button"
                      aria-label={`Nghe: ${v.term}`}
                      onClick={() => speak(v.term.replace(/^to\s+/i, ""))}
                      className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-primary"
                    >
                      <Volume2 className="size-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </CardContent>
    </Card>
  )
}

function slotText(slot: number): string {
  return slot === 2 ? "text-slot2" : slot === 3 ? "text-slot3" : "text-slot1"
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{children}</p>
  )
}

/** Inline button that sits on the solid brand frame. */
function FrameButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-primary-foreground/90 transition-colors hover:bg-white/15 disabled:pointer-events-none disabled:opacity-45"
    >
      {children}
    </button>
  )
}

function SlotHeading({ slot, label, hint }: { slot: number; label: string; hint: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white",
          SLOT_DOT[slot] ?? "bg-primary"
        )}
      >
        {slot}
      </span>
      <span className="text-[15px] font-bold">{label}</span>
      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
        {hint}
      </span>
    </div>
  )
}

function SlotGroup({
  slot,
  label,
  groupName,
  showHeading,
  hint,
  phrases,
  selected,
  onPick,
}: {
  slot: number
  label: string
  groupName: string
  showHeading: boolean
  hint: string
  phrases: IfaPhrase[]
  selected: IfaPhrase | null | undefined
  onPick: (p: IfaPhrase) => void
}) {
  if (!phrases.length) return null
  return (
    <div className="space-y-2.5">
      {showHeading && <SlotHeading slot={slot} label={label} hint={hint} />}
      {groupName && (
        <p className={cn("flex items-center gap-1.5 pl-8 text-xs font-semibold", slotText(slot))}>
          <span className={cn("size-1.5 rounded-sm", SLOT_DOT[slot])} />
          {groupName}
        </p>
      )}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-2.5 sm:grid-cols-[repeat(2,minmax(0,1fr))]">
        {phrases.map((p, i) => (
          <PhraseChip
            key={i}
            phrase={p}
            group={slot}
            selected={selected?.en === p.en}
            onSelect={() => onPick(p)}
          />
        ))}
      </div>
    </div>
  )
}
