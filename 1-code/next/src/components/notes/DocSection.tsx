import { MarkdownRenderer } from "./MarkdownRenderer"
import { Badge } from "@/components/ui/badge"
import type { NoteDoc, NotesAudio } from "@/types/content"

interface Props {
  doc: NoteDoc
  audioBank: NotesAudio[]
}

const skillLabel: Record<NoteDoc["type"], string> = {
  pronunciation: "Pronunciation",
  grammar: "Grammar",
  speaking: "Speaking",
}

export function DocSection({ doc, audioBank }: Props) {
  const isHigh = /high/i.test(doc.priority)
  return (
    <article
      className="rounded-xl border border-border bg-card p-6 shadow-card scroll-mt-20 searchable"
      id={`doc-${doc.id}`}
    >
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <Badge variant="info">{skillLabel[doc.type]}</Badge>
        {doc.lesson && <Badge variant="secondary">{doc.lesson}</Badge>}
        {isHigh && <Badge variant="warn">Ưu tiên cao</Badge>}
      </div>
      <MarkdownRenderer markdown={doc.markdown} audioBank={audioBank} />
      <div className="mt-4 text-xs text-muted-foreground">Nguồn: {doc.file}</div>
    </article>
  )
}
