import { useEffect, useMemo } from "react"
import { useLocation } from "react-router-dom"
import { useData } from "@/stores/data"
import { useUi } from "@/stores/ui"
import { DocSection } from "@/components/notes/DocSection"
import { PronTool } from "@/components/notes/PronTool"
import { IpaGrid } from "@/components/notes/IpaGrid"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { NoteDoc, IpaEntry } from "@/types/content"

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
  const { docs, notesAudio, ipa, meta } = useData()
  const search = useUi((s) => s.search).toLowerCase().trim()

  const list = useMemo(() => docs.filter((d) => d.type === type), [docs, type])
  const filtered = useMemo(() => {
    if (!search) return list
    return list.filter(
      (d) =>
        d.title.toLowerCase().includes(search) ||
        d.markdown.toLowerCase().includes(search) ||
        d.vi.toLowerCase().includes(search)
    )
  }, [list, search])

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
      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-6">
        <div className="text-[11px] font-bold uppercase tracking-widest text-primary">
          {type === "pronunciation" ? "Lesson 1–5" : type === "grammar" ? "Up to Final" : "A1–A2 first"}
        </div>
        <h2 className="mt-1 text-2xl font-bold">{LABEL[type]}</h2>
        {sub && <p className="text-muted-foreground mt-1">{sub}</p>}
      </div>

      {type === "pronunciation" && <PronTool />}
      {type === "pronunciation" && ipa && (
        <IpaChart mono={ipa.monophthongs || []} diph={ipa.diphthongs || []} cons={ipa.consonants || []} />
      )}

      {/* Quick chips */}
      {list.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {list.map((d) => (
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

      {filtered.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Không có note nào match "{search}".
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {filtered.map((doc: NoteDoc) => (
          <DocSection key={doc.id} doc={doc} audioBank={notesAudio} />
        ))}
      </div>

      {type === "speaking" && meta.readGuide && meta.readGuide.length > 0 && (
        <ReadGuide guide={meta.readGuide} />
      )}
    </div>
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
