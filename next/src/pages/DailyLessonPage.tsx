import { useEffect, useState } from "react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { useData } from "@/stores/data"
import type { Lesson, AudioItem } from "@/types/content"
import { ContentBlock } from "@/components/daily/ContentBlock"
import { QuestionCard } from "@/components/daily/QuestionCard"
import { FlashcardDeck, type FlashcardItem } from "@/components/flashcard/FlashcardDeck"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, BookOpen, Pencil, Layers } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function DailyLessonPage() {
  const { lessonKey = "" } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentTab = searchParams.get("tab") || "study"
  const { dailyIndex, loadLesson } = useData()
  const summary = dailyIndex.find((l) => l.key === lessonKey)

  const [data, setData] = useState<Lesson | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setData(null)
    setErr(null)
    loadLesson(lessonKey)
      .then((d) => {
        if (alive) setData(d)
      })
      .catch((e: Error) => {
        if (alive) setErr(e.message)
      })
    return () => {
      alive = false
    }
  }, [lessonKey, loadLesson])

  if (err) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-destructive">Không tải được {lessonKey}: {err}</CardContent>
      </Card>
    )
  }
  if (!data) {
    return <div className="py-12 text-center text-muted-foreground animate-pulse">Đang tải lesson...</div>
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-gradient-to-br from-pink-500/10 via-card to-card p-6">
        <Link to="/daily" className="text-sm text-primary hover:underline inline-flex items-center gap-1 mb-3">
          <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
        </Link>
        <Badge variant="secondary" className="mb-2">
          {summary?.number != null ? `Lesson ${summary.number}` : "Daily"}
        </Badge>
        <h2 className="text-2xl font-bold">{summary?.label || data.title || lessonKey}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {(data.challenges || []).map((c) => c.note || c.title).join(" · ")}
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
        </TabsList>

        <TabsContent value="study" className="space-y-4">
          {data.contentBlocks.length === 0 ? (
            <EmptyState msg="Lesson này không có content block." />
          ) : (
            data.contentBlocks.map((b) => <ContentBlock key={b.id} block={b} />)
          )}
        </TabsContent>

        <TabsContent value="exercises" className="space-y-6">
          {data.exerciseGroups.length === 0 ? (
            <EmptyState msg="Lesson này không có exercise." />
          ) : (
            data.exerciseGroups.map((g) => (
              <section key={g.id}>
                <h3 className="text-lg font-semibold mb-3">{g.title}</h3>
                <div className="space-y-3">
                  {g.questions.map((q) => (
                    <QuestionCard key={q.id} question={q} />
                  ))}
                </div>
              </section>
            ))
          )}
        </TabsContent>

        <TabsContent value="flashcard">
          <LessonFlashcards data={data} lessonKey={lessonKey} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EmptyState({ msg }: { msg: string }) {
  return <div className="text-muted-foreground italic py-4">{msg}</div>
}

function LessonFlashcards({ data, lessonKey }: { data: Lesson; lessonKey: string }) {
  const cards: FlashcardItem[] = []
  for (const a of data.audio) {
    if (!a.script) continue
    cards.push({
      id: `au-${a.id}`,
      front: <div className="text-xl font-medium">{a.script}</div>,
      back: <AudioBack a={a} />,
      kind: "audio",
    })
  }
  for (let i = 0; i < data.vocabPairs.length; i++) {
    const p = data.vocabPairs[i]
    cards.push({
      id: `vp-${i}`,
      front: <div className="text-xl font-medium">{p.term}</div>,
      back: <div className="text-lg">{p.meaning}</div>,
      kind: "vocab",
    })
  }
  return <FlashcardDeck scope={`lesson-${lessonKey}`} cards={cards} />
}

function AudioBack({ a }: { a: AudioItem }) {
  const src = a.localFile || a.url || ""
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-base font-medium">{a.script}</div>
      {src && <audio controls autoPlay preload="none" src={src} className="w-full max-w-md" />}
    </div>
  )
}
