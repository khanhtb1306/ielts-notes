import type { AudioRef } from "@/types/content"

export function AudioLine({ audio }: { audio: AudioRef }) {
  const src = audio.localFile || audio.url || ""
  if (!src) return null
  const label = audio.script || audio.text || "Audio"
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-2">
      <div className="min-w-0 flex-1 text-sm">
        <span className="text-muted-foreground"><span aria-hidden>🎧</span> {label}</span>
        {audio.translation && (
          <span className="ml-2 text-xs italic text-muted-foreground/80">— {audio.translation}</span>
        )}
      </div>
      <audio controls preload="none" src={src} className="h-8 w-full sm:max-w-sm sm:ml-auto" />
    </div>
  )
}
