import { useEffect, useState } from "react"
import { ChevronUp } from "lucide-react"
import { ifaGrammar } from "@/data/ifa-grammar"
import { IfaReviewPage } from "@/components/ifa/IfaReviewPages"
import { Select } from "@/components/ui/select"

const PARTS = [
  { id: "grammar", label: "Ngữ pháp · trang 2–28", from: 2, to: 28 },
  { id: "speaking", label: "Speaking · trang 29", from: 29, to: 29 },
  { id: "writing", label: "Writing · trang 30–32", from: 30, to: 32 },
  { id: "reading", label: "Reading · trang 33–34", from: 33, to: 34 },
  { id: "listening", label: "Listening · trang 35", from: 35, to: 35 },
] as const

const FILTER_OPTIONS = [
  { value: "all", label: "Toàn bộ tài liệu", hint: "35 trang" },
  ...PARTS.map((part) => ({ value: part.id, label: part.label, hint: "Theo phần" })),
  ...ifaGrammar.map((topic) => ({ value: `topic:${topic.id}`, label: topic.label, hint: `Trang ${topic.sourcePages?.join(", ")}` })),
]

export function IfaGrammarPage() {
  const [filter, setFilter] = useState("all")
  const [showTop, setShowTop] = useState(false)
  const part = PARTS.find((item) => item.id === filter)
  const topic = filter.startsWith("topic:") ? ifaGrammar.find((item) => item.id === filter.slice(6)) : null
  const pages = topic?.sourcePages ?? Array.from(
    { length: part ? part.to - part.from + 1 : 35 },
    (_, i) => (part?.from ?? 1) + i,
  )

  useEffect(() => {
    const update = () => setShowTop(window.scrollY > 700)
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [])

  return (
    <div className="min-w-0" data-toc-skip>
      <div className="sticky top-0 z-20 mb-4 rounded-xl border border-border bg-background/95 p-3 shadow-card backdrop-blur sm:p-4">
        <label htmlFor="ifa-review-filter" className="mb-1 block text-xs font-semibold text-muted-foreground">Xem phần tài liệu</label>
        <Select id="ifa-review-filter" value={filter} options={FILTER_OPTIONS} onChange={(value) => {
          setFilter(value)
          window.scrollTo({ top: 0, behavior: "instant" })
        }} />
      </div>

      <div className="mx-auto max-w-[780px] space-y-4 pb-12">
        {pages.map((page) => <IfaReviewPage key={page} number={page} />)}
      </div>

      {showTop && <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fixed bottom-20 right-4 z-20 flex size-10 items-center justify-center rounded-full border border-border bg-card text-primary shadow-card hover:bg-primary-soft sm:bottom-6" aria-label="Lên đầu tài liệu"><ChevronUp className="size-5" /></button>}
    </div>
  )
}
