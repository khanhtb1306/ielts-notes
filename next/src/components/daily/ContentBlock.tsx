import { useMemo } from "react"
import type { ContentBlock as ContentBlockType } from "@/types/content"
import { TopicBadge } from "@/components/common/TopicBadge"
import { AudioLine } from "./AudioLine"
import { dedupImageRefs, dedupAudioRefs } from "@/lib/media-dedup"

export function ContentBlock({ block }: { block: ContentBlockType }) {
  const images = useMemo(() => dedupImageRefs(block.html, block.imageRefs), [block.html, block.imageRefs])
  const audios = useMemo(() => dedupAudioRefs(block.html, block.audioRefs), [block.html, block.audioRefs])
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
      </div>
      <div
        className="markdown-note"
        dangerouslySetInnerHTML={{ __html: block.html || `<p>${block.text || ""}</p>` }}
      />
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
