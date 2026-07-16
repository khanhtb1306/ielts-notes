import { useEffect, useMemo, useRef } from "react"
import { mdToHtml } from "@/lib/markdown"
import type { NotesAudio } from "@/types/content"

interface Props {
  markdown: string
  audioBank: NotesAudio[]
  className?: string
}

export function MarkdownRenderer({ markdown, audioBank, className }: Props) {
  const html = useMemo(() => mdToHtml(markdown), [markdown])
  const ref = useRef<HTMLDivElement>(null)

  // Hydrate <div class="ielts-audio-slot" data-audio-num="N"> placeholders.
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const slots = root.querySelectorAll(".ielts-audio-slot")
    slots.forEach((slot) => {
      const num = slot.getAttribute("data-audio-num")
      const audio = audioBank.find((a) => String(a.num) === num)
      if (!audio) return
      const wrap = document.createElement("div")
      wrap.className = "flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-2 my-2"
      wrap.innerHTML = `<span class="text-sm text-muted-foreground shrink-0">Audio ${num} · ${audio.title || ""}</span>`
      const audioEl = document.createElement("audio")
      audioEl.controls = true
      audioEl.preload = "none"
      audioEl.src = audio.file
      audioEl.className = "h-8 w-full max-w-md"
      wrap.appendChild(audioEl)
      slot.replaceWith(wrap)
    })
  }, [html, audioBank])

  return (
    <div
      ref={ref}
      className={"markdown-note " + (className || "")}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
