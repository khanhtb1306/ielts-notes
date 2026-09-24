import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Grid2x2, GraduationCap, Layers, List, MessageSquare, RefreshCw, Star, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ifaVocabCards, ifaVocabTopics, cardsInTopic } from "@/lib/ifa-vocab"
import type { IfaVocabCard } from "@/lib/ifa-vocab"
import { useFlashcard } from "@/stores/flashcard"
import { FlashcardsMode } from "@/components/vocab/FlashcardsMode"
import { LearnMode } from "@/components/vocab/LearnMode"
import { MatchMode } from "@/components/vocab/MatchMode"
import { VocabListMode } from "@/components/vocab/VocabListMode"
import {
  SpeakingRail,
  RailSection,
  RailSelect,
  RailVoice,
} from "@/components/ifa/SpeakingRail"
import type { RailSelectOption } from "@/components/ifa/SpeakingRail"

const ALL = "__all__"

type Mode = "cards" | "learn" | "match"
type Filter = "all" | "starred" | "learning" | "known" | "new"
type Direction = "en-vi" | "vi-en"

const MODES: { id: Mode; label: string; icon: typeof Layers }[] = [
  { id: "cards", label: "Thẻ ghi nhớ", icon: Layers },
  { id: "learn", label: "Học", icon: GraduationCap },
  { id: "match", label: "Ghép thẻ", icon: Grid2x2 },
]

const FILTER_OPTIONS: RailSelectOption[] = [
  { value: "all", label: "Tất cả" },
  { value: "starred", label: "Đã gắn sao" },
  { value: "learning", label: "Đang học" },
  { value: "known", label: "Đã thuộc" },
  { value: "new", label: "Chưa học" },
]

const DIRECTION_OPTIONS: RailSelectOption[] = [
  { value: "en-vi", label: "Anh → Việt" },
  { value: "vi-en", label: "Việt → Anh" },
]

export function IfaVocabPage() {
  const allCards = useMemo(() => ifaVocabCards(), [])
  const topics = useMemo(() => ifaVocabTopics(), [])

  const [mode, setMode] = useState<Mode>("cards")
  const [topic, setTopic] = useState(ALL)
  const [filter, setFilter] = useState<Filter>("all")
  const [direction, setDirection] = useState<Direction>("en-vi")
  /** Bumped to rebuild the deck from current progress. */
  const [deckToken, setDeckToken] = useState(0)
  const rebuildDeck = () => setDeckToken((n) => n + 1)

  const progress = useFlashcard((s) => s.cards)
  const reset = useFlashcard((s) => s.reset)

  const topicOptions = useMemo<RailSelectOption[]>(
    () => [
      { value: ALL, label: `Tất cả (${allCards.length})` },
      ...topics.map((t) => ({ value: t.label, label: `${t.label} (${t.count})` })),
    ],
    [allCards.length, topics]
  )

  const scope = useMemo(() => (topic === ALL ? allCards : cardsInTopic(topic)), [topic, allCards])

  const stats = useMemo(() => {
    let known = 0
    let learning = 0
    let starred = 0
    for (const c of scope) {
      const s = progress[c.id]
      if (s?.status === "known") known++
      else if (s?.status === "learning") learning++
      if (s?.starred) starred++
    }
    return { known, learning, starred, untouched: scope.length - known - learning, total: scope.length }
  }, [scope, progress])

  /* The deck must stay stable while you answer: if it were derived from the
     live progress map, every mark would give it a new identity and the modes
     would restart. It is rebuilt only on demand. */
  const deck: IfaVocabCard[] = useMemo(() => {
    if (filter === "all") return scope
    const snapshot = useFlashcard.getState().cards
    return scope.filter((c) => {
      const s = snapshot[c.id]
      if (filter === "starred") return !!s?.starred
      if (filter === "known") return s?.status === "known"
      if (filter === "learning") return s?.status === "learning"
      return !s?.status
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, filter, deckToken])

  if (!allCards.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <h2 className="text-xl font-semibold">Chưa có từ vựng</h2>
        <p className="mt-2 text-muted-foreground">Chạy lại preprocess sau khi thêm handout Speaking.</p>
      </div>
    )
  }

  return (
    <div data-toc-skip>
      <div className="lg:flex lg:items-start lg:gap-6 2xl:gap-8">
        <SpeakingRail>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="h-9 flex-1 justify-center">
              <Link to="/speaking-ifa">
                <MessageSquare className="size-4" /> Khung trả lời
              </Link>
            </Button>
            <RailVoice />
          </div>

          {/* Two columns on phones so the controls do not push the card below
              the fold; a single stacked column once the rail exists. */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-4 lg:block lg:space-y-4">
          <RailSection title="Chủ đề">
            <RailSelect
              id="vocab-topic"
              value={topic}
              options={topicOptions}
              onChange={(v) => {
                setTopic(v)
                rebuildDeck()
              }}
            />
          </RailSection>

          <RailSection
            title="Lọc"
            action={
              <button
                type="button"
                onClick={rebuildDeck}
                title="Lọc lại theo tiến độ mới nhất"
                aria-label="Lọc lại theo tiến độ mới nhất"
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <RefreshCw className="size-3.5" />
              </button>
            }
          >
            <RailSelect
              id="vocab-filter"
              value={filter}
              options={FILTER_OPTIONS}
              onChange={(v) => {
                setFilter(v as Filter)
                rebuildDeck()
              }}
            />
            <p className="mt-1.5 text-xs text-muted-foreground">{deck.length} thẻ trong lượt học</p>
          </RailSection>

          {mode === "learn" && (
            <RailSection title="Chiều hỏi">
              <RailSelect
                id="vocab-direction"
                value={direction}
                options={DIRECTION_OPTIONS}
                onChange={(v) => setDirection(v as Direction)}
              />
            </RailSection>
          )}
          </div>

          <RailSection title="Tiến độ">
            <ProgressBreakdown {...stats} />
          </RailSection>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground"
            onClick={() => {
              const label = topic === ALL ? "toàn bộ" : `chủ đề ${topic}`
              if (window.confirm(`Xoá tiến độ và sao của ${label} (${scope.length} từ)?`)) {
                reset(scope.map((c) => c.id))
                rebuildDeck()
              }
            }}
          >
            <Trash2 className="size-4" /> Đặt lại tiến độ
          </Button>
        </SpeakingRail>

        <div className="mt-5 min-w-0 flex-1 space-y-4 lg:mt-0">
          {/* Mode switcher */}
          <div role="tablist" className="rail-strip flex gap-1 overflow-x-auto rounded-lg border border-border bg-muted/50 p-1">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={mode === m.id}
                onClick={() => {
                  setMode(m.id)
                  rebuildDeck()
                }}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2 py-2 text-xs font-semibold transition-colors sm:px-3 sm:text-sm",
                  mode === m.id
                    ? "bg-card text-primary shadow-card"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <m.icon className="size-4 shrink-0" />
                {m.label}
              </button>
            ))}
          </div>

          {mode === "cards" && <FlashcardsMode cards={deck} />}
          {mode === "learn" && <LearnMode cards={deck} direction={direction} />}
          {mode === "match" && <MatchMode cards={deck} scopeKey={`${topic}:${filter}`} />}

          {/* The word list lives under the active mode — it is reference material,
              not a mode you switch into, and it fills the space below the card. */}
          <section className="border-t border-border pt-5">
            <div className="mb-3 flex items-center gap-2">
              <List className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Danh sách từ
              </h2>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold tabular-nums text-muted-foreground">
                {deck.length}
              </span>
            </div>
            <VocabListMode cards={deck} />
          </section>
        </div>
      </div>
    </div>
  )
}

function ProgressBreakdown({
  known,
  learning,
  starred,
  untouched,
  total,
}: {
  known: number
  learning: number
  starred: number
  untouched: number
  total: number
}) {
  const pct = (n: number) => (total ? (n / total) * 100 : 0)
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-lg font-bold tabular-nums text-emerald-600">
          {known}
          <span className="text-sm font-medium text-muted-foreground">/{total}</span>
        </span>
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">đã thuộc</span>
      </div>
      <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct(known)}%` }} />
        <div className="h-full bg-amber-500 transition-all" style={{ width: `${pct(learning)}%` }} />
      </div>
      {/* The breakdown is detail; phones only get the headline figure and bar. */}
      <dl className="mt-2.5 hidden space-y-1 text-xs lg:block">
        <Row dotClass="bg-emerald-500" label="Đã thuộc" value={known} />
        <Row dotClass="bg-amber-500" label="Đang học" value={learning} />
        <Row dotClass="bg-muted-foreground/40" label="Chưa học" value={untouched} />
        <Row dotClass="bg-amber-400" label="Gắn sao" value={starred} star />
      </dl>
      <p className="mt-2 text-xs text-muted-foreground lg:hidden">
        {learning} đang học · {untouched} chưa học · {starred} gắn sao
      </p>
    </div>
  )
}

function Row({
  dotClass,
  label,
  value,
  star,
}: {
  dotClass: string
  label: string
  value: number
  star?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="flex items-center gap-1.5 text-muted-foreground">
        {star ? (
          <Star className="size-3 fill-current text-amber-500" />
        ) : (
          <span className={cn("size-2 rounded-full", dotClass)} />
        )}
        {label}
      </dt>
      <dd className="font-semibold tabular-nums">{value}</dd>
    </div>
  )
}
