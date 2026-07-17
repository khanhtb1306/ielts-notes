import { useMemo, useState } from "react"
import type { ContentBlock as ContentBlockType } from "@/types/content"
import { TopicBadge } from "@/components/common/TopicBadge"
import { AudioLine } from "./AudioLine"
import { dedupImageRefs, dedupAudioRefs } from "@/lib/media-dedup"

const LONG_BLOCK_THRESHOLD = 4000

export function ContentBlock({ block }: { block: ContentBlockType }) {
  const images = useMemo(() => dedupImageRefs(block.html, block.imageRefs), [block.html, block.imageRefs])
  const audios = useMemo(() => dedupAudioRefs(block.html, block.audioRefs), [block.html, block.audioRefs])
  const rawLength = (block.html || block.text || "").length
  const isLong = rawLength > LONG_BLOCK_THRESHOLD
  const [expanded, setExpanded] = useState(!isLong)

  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-sm searchable" id={`block-${block.id}`}>
      <div className="flex flex-wrap gap-2 mb-3">
        {block.topics.map((t, i) => (
          <TopicBadge key={i} tag={t} />
        ))}
        {block.challengeNumber != null && (
          <span className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Challenge {block.challengeNumber}
          </span>
        )}
        {isLong && (
          <span
            className="rounded-md border border-amber-300/60 bg-amber-100/60 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-200"
            title="Block dài — nên đọc chậm, chia đoạn để nắm chắc từng ý."
          >
            Block dài
          </span>
        )}
      </div>
      <div className="relative">
        <div
          className={`markdown-note ${!expanded ? "max-h-[32rem] overflow-hidden" : ""}`}
          dangerouslySetInnerHTML={{ __html: block.html || `<p>${block.text || ""}</p>` }}
        />
        {!expanded && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card to-transparent"
          />
        )}
      </div>
      {isLong && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition"
          >
            {expanded ? "Thu gọn" : "Xem toàn bộ nội dung"}
          </button>
        </div>
      )}
      {audios.length > 0 && (
        <div className="mt-3 space-y-2">
          {audios.map((a, i) => (
            <AudioLine key={i} audio={a} />
          ))}
        </div>
      )}
      {images.length > 0 && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {images.map((img, i) =>
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
      )}
    </article>
  )
}
