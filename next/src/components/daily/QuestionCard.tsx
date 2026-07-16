import { useMemo } from "react"
import type { Question, AudioRef, ImageRef } from "@/types/content"
import { TopicBadge } from "@/components/common/TopicBadge"
import { AudioLine } from "./AudioLine"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { dedupImageRefs, dedupAudioRefs } from "@/lib/media-dedup"

export function QuestionCard({ question }: { question: Question }) {
  const q = question
  const promptHtml = q.promptHtml || ""
  const audios = useMemo(() => dedupAudioRefs(promptHtml, q.audioRefs), [promptHtml, q.audioRefs])
  const imgs = useMemo(() => dedupImageRefs(promptHtml, q.imageRefs), [promptHtml, q.imageRefs])

  if (q.kind === "info") {
    const hasBody =
      (q.promptHtml && q.promptHtml.trim()) ||
      (q.prompt && q.prompt.trim()) ||
      (q.explanationHtml && q.explanationHtml.trim()) ||
      imgs.length ||
      audios.length
    if (!hasBody) return null
    return (
      <article className="rounded-xl border border-border bg-muted/20 p-5 searchable" id={`q-${q.id}`}>
        <div className="flex flex-wrap gap-2 mb-3">
          {q.topics.map((t, i) => (
            <TopicBadge key={i} tag={t} />
          ))}
          <Badge variant="secondary" className="uppercase text-[10px]">info</Badge>
        </div>
        <div
          className="markdown-note"
          dangerouslySetInnerHTML={{ __html: q.promptHtml || `<p>${q.prompt || ""}</p>` }}
        />
        <ImageList imgs={imgs} />
        <AudioList audios={audios} />
        {q.explanationHtml && (
          <div className="mt-3 rounded-lg bg-primary/5 border border-primary/20 p-4 markdown-note text-sm">
            <div className="font-semibold mb-1">Ghi chú:</div>
            <div dangerouslySetInnerHTML={{ __html: q.explanationHtml }} />
          </div>
        )}
      </article>
    )
  }

  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-sm searchable" id={`q-${q.id}`}>
      <div className="flex flex-wrap gap-2 mb-3 items-center">
        {q.topics.map((t, i) => (
          <TopicBadge key={i} tag={t} />
        ))}
        <Badge variant="secondary" className="uppercase text-[10px]">{q.kind}</Badge>
        {q.correct === true && (
          <Badge variant="success" className="gap-1">
            <Check className="h-3 w-3" /> đúng
          </Badge>
        )}
        {q.correct === false && (
          <Badge variant="destructive" className="gap-1">
            <X className="h-3 w-3" /> sai
          </Badge>
        )}
      </div>
      <div
        className="markdown-note"
        dangerouslySetInnerHTML={{ __html: q.promptHtml || `<p>${q.prompt || ""}</p>` }}
      />
      <ImageList imgs={imgs} />
      <AudioList audios={audios} />
      <AnswerReveal q={q} />
      {q.explanationHtml && (
        <details className="mt-3 rounded-lg border border-border bg-muted/20">
          <summary className="cursor-pointer px-4 py-2 font-medium">Giải thích</summary>
          <div
            className="markdown-note px-4 pb-3 pt-1 text-sm"
            dangerouslySetInnerHTML={{ __html: q.explanationHtml }}
          />
        </details>
      )}
    </article>
  )
}

function ImageList({ imgs }: { imgs: ImageRef[] }) {
  if (!imgs.length) return null
  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      {imgs.map((img, i) =>
        img.localFile || img.url ? (
          <figure key={i} className="rounded-lg overflow-hidden border border-border">
            <img
              loading="lazy"
              src={img.localFile || img.url || ""}
              alt={img.alt || ""}
              className="w-full h-auto"
            />
          </figure>
        ) : null
      )}
    </div>
  )
}

function AudioList({ audios }: { audios: AudioRef[] }) {
  if (!audios.length) return null
  return (
    <div className="mt-3 space-y-2">
      {audios.map((a, i) => (
        <AudioLine key={i} audio={a} />
      ))}
    </div>
  )
}

function AnswerReveal({ q }: { q: Question }) {
  if (q.kind === "single_choice" || q.kind === "multi_select") {
    const correctSet = new Set((q.correctAnswer || []).map(String))
    const userSet = new Set(((q.userAnswer as (string | number)[]) || []).map(String))
    if (!q.options.length) return null
    return (
      <ul className="mt-3 space-y-2">
        {q.options.map((o, i) => {
          const isCorrect = correctSet.has(String(o.id))
          const isUser = userSet.has(String(o.id))
          return (
            <li
              key={i}
              className={cn(
                "flex items-start gap-2 rounded-lg border px-3 py-2",
                isCorrect
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : isUser
                    ? "border-destructive/40 bg-destructive/10"
                    : "border-border bg-muted/20"
              )}
            >
              <div className="flex-1" dangerouslySetInnerHTML={{ __html: o.html || o.text }} />
              {isCorrect && (
                <Badge variant="success" className="shrink-0 gap-1">
                  <Check className="h-3 w-3" /> đáp án
                </Badge>
              )}
              {isUser && !isCorrect && (
                <Badge variant="destructive" className="shrink-0 gap-1">
                  <X className="h-3 w-3" /> bạn chọn
                </Badge>
              )}
            </li>
          )
        })}
      </ul>
    )
  }

  if (q.kind === "fill_blank") {
    return <FillBlankReveal q={q} />
  }

  if (q.kind === "matching") {
    const pairs = q.pairs || []
    if (!pairs.length)
      return <div className="mt-3 text-sm text-muted-foreground">Không có dữ liệu ghép cặp.</div>
    return (
      <div className="mt-3 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/60">
            <tr>
              <th className="text-left px-3 py-2">Word</th>
              <th className="text-left px-3 py-2">Meaning</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((p, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-3 py-2">{p.left}</td>
                <td className="px-3 py-2">{p.right}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // open_or_video: display submitted answer if any
  const ua = q.userAnswer
  if (typeof ua === "string") {
    const isUrl = /^https?:/.test(ua)
    return (
      <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3 text-sm">
        <span className="font-semibold">Đã nộp:</span>{" "}
        {isUrl ? (
          <a href={ua} target="_blank" rel="noopener" className="text-primary underline">
            {ua}
          </a>
        ) : (
          ua
        )}
      </div>
    )
  }
  return <div className="mt-3 text-sm text-muted-foreground italic">Yêu cầu tự soạn (video / text).</div>
}

function FillBlankReveal({ q }: { q: Question }) {
  const blanks = q.blanks || []
  const html = q.bodyHtml || ""
  const filled = html.replace(
    /<span class="blank-slot" data-blank="(\d+)"><\/span>/g,
    (_m: string, n: string) => {
      const idx = parseInt(n, 10)
      const b = blanks[idx]
      const ans = b && Array.isArray(b.answers) ? b.answers.join(" / ") : ""
      return `<span class="inline-flex items-center rounded-md bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 font-semibold border border-emerald-500/40 mx-0.5">${ans}</span>`
    }
  )
  return (
    <div className="mt-3 space-y-3">
      {html && (
        <div
          className="markdown-note rounded-lg border border-border bg-muted/20 p-4"
          dangerouslySetInnerHTML={{ __html: filled }}
        />
      )}
      {blanks.length > 0 && (
        <details className="rounded-lg border border-border bg-muted/20">
          <summary className="cursor-pointer px-4 py-2 font-medium text-sm">
            Danh sách đáp án ({blanks.length})
          </summary>
          <div className="px-4 pb-3 pt-1 text-sm space-y-1">
            {blanks.map((b, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-muted-foreground w-6 shrink-0">{i + 1}.</span>
                <code className="text-emerald-700 dark:text-emerald-300">
                  {(b.answers || []).join(" / ")}
                </code>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
