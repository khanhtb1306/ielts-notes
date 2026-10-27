import { useState } from "react"
import { BookOpenCheck, Search, Volume2 } from "lucide-react"
import { useData } from "@/stores/data"
import { PhonemicChart } from "@/components/notes/IpaGrid"
import { DocSection } from "@/components/notes/DocSection"
import { PronTool } from "@/components/notes/PronTool"
import { PageHeader, PageSection } from "@/components/common/Page"
import { cn } from "@/lib/utils"

type View = "chart" | "practice" | "lookup"

export function PronunciationPage() {
  const { ipa, docs, notesAudio } = useData()
  const [view, setView] = useState<View>("chart")
  const [practiceId, setPracticeId] = useState<string | null>(null)
  const lessons = docs.filter((doc) => doc.type === "pronunciation")
  const activeLesson = lessons.find((doc) => doc.id === practiceId)

  return (
    <div className="mx-auto max-w-5xl space-y-4 pb-10">
      <PageHeader
        icon={Volume2}
        title="Bảng phiên âm Anh-Anh"
        description="44 âm IPA · chạm ký hiệu để nghe âm riêng và xem cách đặt khẩu hình."
      />

      <nav className="inline-flex gap-1 rounded-lg bg-muted/60 p-0.5 text-sm" aria-label="Nội dung phát âm">
        {([
          { id: "chart", label: "Bảng IPA", icon: Volume2 },
          { id: "practice", label: "Luyện tập", icon: BookOpenCheck },
          { id: "lookup", label: "Tra từ", icon: Search },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" aria-current={view === id ? "page" : undefined} onClick={() => setView(id)}
            className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors", view === id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
            <Icon className="size-4 shrink-0" />{label}
          </button>
        ))}
      </nav>

      {view === "chart" && (
        <PageSection aria-label="Bảng phiên âm quốc tế" className="min-w-0">
          <PhonemicChart
            mono={ipa?.monophthongs || []}
            diph={ipa?.diphthongs || []}
            cons={ipa?.consonants || []}
          />
        </PageSection>
      )}

      {view === "practice" && <section className="space-y-3">
        <p className="text-sm text-muted-foreground">Chọn một bài để mở nội dung luyện đọc; bảng IPA ở trên là phần tra âm chính.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {lessons.map((doc) => <button key={doc.id} type="button" onClick={() => setPracticeId((currentId) => currentId === doc.id ? null : doc.id)}
            aria-expanded={practiceId === doc.id}
            className={cn("rounded-xl border bg-card p-4 text-left transition-colors", practiceId === doc.id ? "border-primary bg-primary-soft" : "border-border hover:border-primary/50")}>
            <span className="text-xs font-semibold text-primary">{doc.lesson || "Ôn tập"}</span>
            <span className="mt-1 block font-semibold">{doc.title}</span>
            <span className="mt-1 block text-xs text-muted-foreground">{doc.vi}</span>
          </button>)}
        </div>
        {activeLesson && <DocSection key={activeLesson.id} doc={activeLesson} audioBank={notesAudio} />}
      </section>}

      {view === "lookup" && <PronTool />}
    </div>
  )
}
