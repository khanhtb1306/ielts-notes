import { useEffect, useMemo } from "react"
import { useLocation } from "react-router-dom"
import { FileText } from "lucide-react"
import { useData } from "@/stores/data"
import { useUi } from "@/stores/ui"
import { DocSection } from "@/components/notes/DocSection"
import { GrammarSummary } from "@/components/notes/GrammarSummary"
import { PronTool } from "@/components/notes/PronTool"
import { IpaGrid } from "@/components/notes/IpaGrid"
import { displayLabel } from "@/lib/topic-label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { NoteDoc, IpaEntry, FinalSpeakingSheet, SpeakingQuestion, TopicLabel } from "@/types/content"

const APP_BASE = (import.meta.env.BASE_URL || "/").replace(/\/?$/, "/")
function assetHref(path: string) {
  return `${APP_BASE}${path.split("/").map(encodeURIComponent).join("/")}`
}

type Props = {
  type: "pronunciation" | "grammar" | "speaking"
}

const LABEL: Record<Props["type"], string> = {
  pronunciation: "Pronunciation Notes",
  grammar: "Grammar Notes",
  speaking: "Speaking Notes",
}

export function NotesPage({ type }: Props) {
  const location = useLocation()
  const { docs, notesAudio, ipa, meta, finalPacket, speakingQuestions, topicLabels } = useData()
  const search = useUi((s) => s.search).toLowerCase().trim()

  const list = useMemo(() => docs.filter((d) => d.type === type), [docs, type])
  const visibleList = useMemo(
    () => (type === "grammar" ? list.filter((d) => d.id !== "final-grammar-atlas") : list),
    [list, type]
  )
  const filtered = useMemo(() => {
    if (!search) return visibleList
    return visibleList.filter(
      (d) =>
        d.title.toLowerCase().includes(search) ||
        d.markdown.toLowerCase().includes(search) ||
        d.vi.toLowerCase().includes(search)
    )
  }, [visibleList, search])

  const sub =
    type === "pronunciation" ? meta.pronSub : type === "grammar" ? meta.grammarSub : meta.speakingSub

  useEffect(() => {
    if (!location.hash) return
    const id = decodeURIComponent(location.hash.slice(1))
    const handle = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 0)
    return () => window.clearTimeout(handle)
  }, [location.hash, filtered.length])

  return (
    <div className="space-y-6">
      {type !== "grammar" && (
        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-6">
          <div className="text-[11px] font-bold uppercase tracking-widest text-primary">
            {type === "pronunciation" ? "Lesson 1–5" : "A1–A2 first"}
          </div>
          <h2 className="mt-1 text-2xl font-bold">{LABEL[type]}</h2>
          {sub && <p className="text-muted-foreground mt-1">{sub}</p>}
        </div>
      )}

      {type === "pronunciation" && <PronTool />}
      {type === "pronunciation" && ipa && (
        <IpaChart mono={ipa.monophthongs || []} diph={ipa.diphthongs || []} cons={ipa.consonants || []} />
      )}

      {type === "grammar" && <GrammarSummary />}

      {/* Quick chips */}
      {type !== "grammar" && visibleList.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {visibleList.map((d) => (
            <a
              key={d.id}
              href={`#/${type}/#doc-${d.id}`}
              onClick={(e) => {
                e.preventDefault()
                const el = document.getElementById(`doc-${d.id}`)
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
              }}
              className="rounded-full border border-border bg-card px-3 py-1 text-sm hover:border-primary hover:text-primary transition-colors"
            >
              {d.title}
            </a>
          ))}
        </div>
      )}

      {type !== "grammar" && filtered.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Không có note nào match "{search}".
          </CardContent>
        </Card>
      )}

      {type !== "grammar" && (
        <div className="space-y-4">
          {filtered.map((doc: NoteDoc) => (
            <DocSection key={doc.id} doc={doc} audioBank={notesAudio} />
          ))}
        </div>
      )}

      {type === "speaking" && meta.readGuide && meta.readGuide.length > 0 && (
        <ReadGuide guide={meta.readGuide} />
      )}

      {type === "speaking" && (
        <SpeakingResources
          sheets={finalPacket.speakingSheets}
          questions={speakingQuestions}
          topicLabels={topicLabels}
        />
      )}
    </div>
  )
}

function SpeakingResources({
  sheets,
  questions,
  topicLabels,
}: {
  sheets: FinalSpeakingSheet[]
  questions: Record<string, SpeakingQuestion[]>
  topicLabels: Record<string, TopicLabel>
}) {
  const topicKeys = Object.keys(questions)
  return (
    <>
      {sheets.length > 0 && (
        <Card className="searchable">
          <CardHeader>
            <CardTitle>Tài liệu Speaking giáo viên gửi</CardTitle>
            <p className="text-sm text-muted-foreground">
              Sheet hướng dẫn trả lời theo chủ đề — lấy khung câu, câu mẫu và cụm từ cần nói.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {sheets.map((sheet) => (
                <div key={sheet.file} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-start gap-2">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold">{sheet.topic}</div>
                      {sheet.focus && <div className="mt-1 text-sm text-muted-foreground">{sheet.focus}</div>}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild variant="secondary" size="sm">
                      <a href={assetHref(sheet.localPath)}>Mở tài liệu</a>
                    </Button>
                    {sheet.sourceHref && (
                      <Button asChild variant="outline" size="sm">
                        <a href={sheet.sourceHref} target="_blank" rel="noopener">Google Doc</a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {topicKeys.length > 0 && (
        <Card className="searchable">
          <CardHeader>
            <CardTitle>Bộ câu hỏi Speaking cuối khóa</CardTitle>
            <p className="text-sm text-muted-foreground">
              Trả lời trực tiếp, thêm lý do bằng <code>because</code>, rồi thêm ví dụ ngắn. Luyện theo topic, không học thuộc cả danh sách.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 lg:grid-cols-2">
              {topicKeys.map((topicKey) => (
                <section key={topicKey} className="rounded-lg border border-border bg-muted/20 p-4">
                  <h3 className="mb-3 font-semibold">{displayLabel(topicLabels[topicKey], topicKey)}</h3>
                  <ol className="list-decimal space-y-2 pl-5 text-sm marker:font-semibold marker:text-primary">
                    {questions[topicKey].map((q, i) => (
                      <li key={i}>
                        <span className="font-medium">{q.q}</span>
                        {q.subQuestions && q.subQuestions.length > 0 && (
                          <div className="mt-1 text-muted-foreground">{q.subQuestions.join(" · ")}</div>
                        )}
                      </li>
                    ))}
                  </ol>
                </section>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}

function IpaChart({ mono, diph, cons }: { mono: IpaEntry[]; diph: IpaEntry[]; cons: IpaEntry[] }) {
  return (
    <Card className="searchable">
      <CardHeader>
        <CardTitle>Bảng IPA tương tác</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
            Monophthongs · 12
          </h3>
          <IpaGrid items={mono} />
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
            Diphthongs · 8
          </h3>
          <IpaGrid items={diph} />
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
            Consonants · 24
          </h3>
          <IpaGrid items={cons} />
        </div>
      </CardContent>
    </Card>
  )
}

function ReadGuide({
  guide,
}: {
  guide: { topic: string; text: string; stress: string; grammar: string }[]
}) {
  return (
    <Card className="searchable">
      <CardHeader>
        <CardTitle>Cách đọc nhanh các câu mẫu</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          {guide.map((r, i) => (
            <div key={i} className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="font-semibold">{r.topic}</div>
              <div className="italic mt-1">{r.text}</div>
              <div className="mt-2 text-xs text-muted-foreground">
                <div>Nhấn: {r.stress}</div>
                <div>Grammar: {r.grammar}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
