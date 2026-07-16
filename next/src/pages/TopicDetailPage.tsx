import { useEffect, useMemo, useState } from "react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { useData } from "@/stores/data"
import type { Lesson, ContentBlock as ContentBlockType, Question, AudioItem } from "@/types/content"
import { ContentBlock } from "@/components/daily/ContentBlock"
import { QuestionCard } from "@/components/daily/QuestionCard"
import { FlashcardDeck, type FlashcardItem } from "@/components/flashcard/FlashcardDeck"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, BookOpen, Pencil, Layers, MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ResolvedBlock {
  lessonKey: string
  role: string
  block: ContentBlockType
}
interface ResolvedQuestion {
  lessonKey: string
  role: string
  question: Question
}
interface ResolvedAudio {
  lessonKey: string
  role: string
  audio: AudioItem
}

export function TopicDetailPage() {
  const { topicKey = "" } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentTab = searchParams.get("tab") || "study"
  const { topicsIndex, topicLabels, speakingQuestions, loadLesson } = useData()

  const t = topicsIndex.topics[topicKey]
  const meta = topicLabels[topicKey] || {}
  const refs = t?.refs || []
  const lessonKeys = useMemo(() => [...new Set(refs.map((r) => r.lessonKey))].sort(), [refs])

  const [byKey, setByKey] = useState<Record<string, Lesson> | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!lessonKeys.length) return
    let alive = true
    setByKey(null)
    setErr(null)
    Promise.all(lessonKeys.map((k) => loadLesson(k)))
      .then((lessons) => {
        if (!alive) return
        const m: Record<string, Lesson> = {}
        lessonKeys.forEach((k, i) => (m[k] = lessons[i]))
        setByKey(m)
      })
      .catch((e: Error) => alive && setErr(e.message))
    return () => {
      alive = false
    }
  }, [lessonKeys, loadLesson])

  const items = useMemo(() => {
    if (!byKey) return { blocks: [] as ResolvedBlock[], questions: [] as ResolvedQuestion[], audios: [] as ResolvedAudio[] }
    const blocks: ResolvedBlock[] = []
    const questions: ResolvedQuestion[] = []
    const audios: ResolvedAudio[] = []
    for (const r of refs) {
      const L = byKey[r.lessonKey]
      if (!L) continue
      if (r.kind === "block") {
        const b = L.contentBlocks.find((x) => x.id === r.itemId)
        if (b) blocks.push({ lessonKey: r.lessonKey, role: r.role, block: b })
      } else if (r.kind === "question") {
        const q = flattenQuestions(L).find((x) => x.id === r.itemId)
        if (q) questions.push({ lessonKey: r.lessonKey, role: r.role, question: q })
      } else if (r.kind === "audio") {
        const a = L.audio.find((x) => x.id === r.itemId)
        if (a) audios.push({ lessonKey: r.lessonKey, role: r.role, audio: a })
      }
    }
    return { blocks, questions, audios }
  }, [byKey, refs])

  if (!t) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-destructive">Không tìm thấy topic: {topicKey}</CardContent>
      </Card>
    )
  }
  if (err) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-destructive">Không tải được lessons: {err}</CardContent>
      </Card>
    )
  }
  if (!byKey) {
    return <div className="py-12 text-center text-muted-foreground animate-pulse">Đang tổng hợp chủ đề...</div>
  }

  const isSpeaking = meta.skill === "speaking"

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-gradient-to-br from-sky-500/10 via-card to-card p-6">
        <Link to="/topics" className="text-sm text-primary hover:underline inline-flex items-center gap-1 mb-3">
          <ArrowLeft className="h-4 w-4" /> Danh sách chủ đề
        </Link>
        <Badge variant="secondary" className="mb-2">{meta.skill || "misc"}</Badge>
        <h2 className="text-2xl font-bold">
          {meta.label || t.label}
          {meta.needsNotes && (
            <Badge variant="warn" className="ml-2 align-middle">chưa có notes</Badge>
          )}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {refs.length} item · trải qua {lessonKeys.length} lesson:{" "}
          {lessonKeys.map((l) => l.replace("lesson-", "L")).join(", ")}
        </p>
      </div>

      <Tabs value={currentTab} onValueChange={(v) => setSearchParams({ tab: v })}>
        <TabsList>
          <TabsTrigger value="study">
            <BookOpen className="h-4 w-4 mr-1" /> Study
          </TabsTrigger>
          <TabsTrigger value="exercises">
            <Pencil className="h-4 w-4 mr-1" /> Exercises
          </TabsTrigger>
          <TabsTrigger value="flashcard">
            <Layers className="h-4 w-4 mr-1" /> Flashcard
          </TabsTrigger>
          {isSpeaking && (
            <TabsTrigger value="questions">
              <MessageSquare className="h-4 w-4 mr-1" /> Câu hỏi
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="study" className="space-y-3">
          {items.blocks.length === 0 ? (
            <div className="text-muted-foreground italic py-4">Chủ đề này không có content block trong daily.</div>
          ) : (
            items.blocks.map(({ lessonKey, role, block }) => (
              <div key={`${lessonKey}-${block.id}`} className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{lessonKey.replace("lesson-", "Lesson ")}</Badge>
                  <Badge variant={role === "core" ? "success" : role === "review" ? "secondary" : "info"}>
                    {role}
                  </Badge>
                </div>
                <ContentBlock block={block} />
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="exercises" className="space-y-3">
          {items.questions.length === 0 ? (
            <div className="text-muted-foreground italic py-4">Chủ đề này không có exercise trong daily.</div>
          ) : (
            items.questions.map(({ lessonKey, role, question }) => (
              <div key={`${lessonKey}-${question.id}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{lessonKey.replace("lesson-", "Lesson ")}</Badge>
                  <Badge variant={role === "core" ? "success" : role === "review" ? "secondary" : "info"}>
                    {role}
                  </Badge>
                </div>
                <QuestionCard question={question} />
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="flashcard">
          <TopicFlashcards audios={items.audios} scope={`topic-${topicKey}`} />
        </TabsContent>

        {isSpeaking && (
          <TabsContent value="questions">
            <SpeakingQuestionsSection topicKey={topicKey} bank={speakingQuestions[topicKey] || []} label={meta.label || t.label} needsNotes={!!meta.needsNotes} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

function flattenQuestions(L: Lesson): Question[] {
  const out: Question[] = []
  for (const g of L.exerciseGroups || []) for (const q of g.questions || []) out.push(q)
  return out
}

function TopicFlashcards({ audios, scope }: { audios: ResolvedAudio[]; scope: string }) {
  const cards: FlashcardItem[] = audios
    .filter((a) => a.audio.script)
    .map(({ audio: a, lessonKey }) => ({
      id: `au-${a.id}`,
      front: (
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{lessonKey.replace("lesson-", "L")}</div>
          <div className="text-xl font-medium">{a.script}</div>
        </div>
      ),
      back: (
        <div className="flex flex-col items-center gap-3">
          <div className="text-base font-medium">{a.script}</div>
          {(a.localFile || a.url) && (
            <audio controls autoPlay preload="none" src={a.localFile || a.url || ""} className="w-full max-w-md" />
          )}
        </div>
      ),
      kind: "audio",
    }))
  if (!cards.length)
    return <div className="text-muted-foreground italic py-4">Chủ đề này chưa có audio+transcript để làm flashcard.</div>
  return <FlashcardDeck scope={scope} cards={cards} />
}

function SpeakingQuestionsSection({
  topicKey,
  bank,
  label,
  needsNotes,
}: {
  topicKey: string
  bank: { q: string; subQuestions?: string[] }[]
  label: string
  needsNotes: boolean
}) {
  if (!bank.length) {
    return (
      <div className="text-muted-foreground italic py-4">
        Chưa có câu hỏi trong topics-map.json cho chủ đề này.
      </div>
    )
  }
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Bộ câu hỏi Final Test · {label}</h3>
        <ol className="space-y-3 list-decimal list-inside marker:text-primary marker:font-semibold">
          {bank.map((q, i) => (
            <li key={i}>
              <span className="font-medium">{q.q}</span>
              {q.subQuestions && (
                <ul className="ml-6 mt-1 space-y-1 list-disc text-sm text-muted-foreground">
                  {q.subQuestions.map((s, j) => (
                    <li key={j}>{s}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
        {needsNotes && (
          <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
            <em>Chủ đề này chưa có notes markdown — cần soạn <code>source/speaking/{topicKey}.md</code>.</em>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
