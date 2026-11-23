import { useEffect, useRef, useState } from "react"
import { X, Play, Square, Headphones, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ttsSupported, getEnglishVoices, preferredVoiceName } from "@/lib/tts"
import { useVoice } from "@/stores/voice"
import { diffWords, tokenize } from "@/lib/speech-diff"
import { ifaFinalTopics } from "@/lib/ifa-final-speaking"

type Mode = "listen" | "qa"
type Phase = "question" | "answer" | "prep" | "review"

interface Item { id: string; q: string; vi: string; answer: string }

const RATES = [
  { value: 0.7, label: "0.7×" },
  { value: 0.85, label: "0.85×" },
  { value: 1, label: "1×" },
  { value: 1.15, label: "1.15×" },
]
const TIMES = [15, 30, 45, 60]

interface SRLike {
  lang: string; continuous: boolean; interimResults: boolean
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript?: string }> & { isFinal: boolean }> }) => void) | null
  onerror: (() => void) | null; onend: (() => void) | null
  start: () => void; abort: () => void
}
type SRCtor = new () => SRLike

/**
 * Hands-free practice over the Final questions. Two modes:
 *  - "listen": plays each question then its saved answer (adjustable speed), loops the topics.
 *  - "qa": speaks the question, gives a fixed speaking window while recording, scores
 *    the speech against the saved answer, then auto-advances. The window is fixed:
 *    time-up always advances, finishing early still waits out the timer.
 */
export function AutoPractice({ open, onClose, getAnswer }: {
  open: boolean
  onClose: () => void
  getAnswer: (id: string) => string
}) {
  const voiceName = useVoice((s) => s.voiceName)
  const accent = useVoice((s) => s.accent)

  const [mode, setMode] = useState<Mode>("listen")
  const [rate, setRate] = useState(0.85)
  const [seconds, setSeconds] = useState(30)
  const [selected, setSelected] = useState<Set<string>>(new Set(ifaFinalTopics.map((t) => t.id)))

  const [running, setRunning] = useState(false)
  const [queue, setQueue] = useState<Item[]>([])
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>("question")
  const [remaining, setRemaining] = useState(0)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState("")

  const runningRef = useRef(false)
  const timerRef = useRef<number | null>(null)
  const recRef = useRef<SRLike | null>(null)

  useEffect(() => () => hardStop(), [])
  useEffect(() => { if (!open) hardStop() }, [open])

  function hardStop() {
    runningRef.current = false
    if (timerRef.current) { window.clearInterval(timerRef.current); window.clearTimeout(timerRef.current); timerRef.current = null }
    try { window.speechSynthesis?.cancel() } catch { /* ignore */ }
    recRef.current?.abort()
    recRef.current = null
    setRunning(false)
    setRemaining(0)
  }

  function resolveVoice() {
    const en = getEnglishVoices()
    const name = voiceName || preferredVoiceName(en, accent)
    return en.find((v) => v.name === name)
  }

  function speakAsync(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (!ttsSupported() || !text.trim()) return resolve()
      try { window.speechSynthesis.cancel() } catch { /* ignore */ }
      const u = new SpeechSynthesisUtterance(text)
      const voice = resolveVoice()
      if (voice) { u.voice = voice; u.lang = voice.lang } else u.lang = accent
      u.rate = rate
      u.onend = () => resolve()
      u.onerror = () => resolve()
      window.speechSynthesis.speak(u)
    })
  }

  /** Fixed countdown window; resolves after `secs`, updating `remaining` each tick. */
  function countdown(secs: number): Promise<void> {
    return new Promise((resolve) => {
      let left = secs
      setRemaining(left)
      const id = window.setInterval(() => {
        left -= 1
        setRemaining(left)
        if (left <= 0 || !runningRef.current) {
          window.clearInterval(id)
          if (timerRef.current === id) timerRef.current = null
          resolve()
        }
      }, 1000)
      timerRef.current = id
    })
  }

  function pause(ms: number): Promise<void> {
    return new Promise((resolve) => {
      const id = window.setTimeout(() => { if (timerRef.current === id) timerRef.current = null; resolve() }, ms)
      timerRef.current = id
    })
  }

  function startRecognition() {
    const w = window as Window & { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor }
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!Ctor) { setError("Trình duyệt chưa hỗ trợ ghi âm. Hãy dùng Chrome hoặc Edge."); return }
    const r = new Ctor()
    r.lang = "en-GB"; r.continuous = true; r.interimResults = true
    r.onresult = (e) => {
      let out = ""
      for (let i = 0; i < e.results.length; i++) {
        const t = e.results[i][0]?.transcript?.trim() ?? ""
        if (t) out += (out ? " " : "") + t
      }
      setTranscript(out)
    }
    r.onerror = null
    r.onend = null
    recRef.current = r
    setTranscript("")
    try { r.start() } catch { /* already running */ }
  }

  function stopRecognition() { recRef.current?.abort(); recRef.current = null }

  async function start() {
    const items: Item[] = []
    for (const t of ifaFinalTopics) {
      if (!selected.has(t.id)) continue
      for (const q of t.questions) items.push({ id: q.id, q: q.q, vi: q.vi, answer: getAnswer(q.id).trim() })
    }
    const list = mode === "listen" ? items.filter((it) => it.answer) : items
    if (!list.length) { setError(mode === "listen" ? "Các câu đã chọn chưa có câu trả lời để nghe." : "Chưa chọn chủ đề nào."); return }

    setError("")
    setQueue(list)
    setIndex(0)
    setRunning(true)
    runningRef.current = true
    void runLoop(list)
  }

  async function runLoop(list: Item[]) {
    for (let i = 0; i < list.length; i++) {
      if (!runningRef.current) break
      const it = list[i]
      setIndex(i)
      setTranscript("")

      setPhase("question")
      await speakAsync(it.q)
      if (!runningRef.current) break

      if (mode === "listen") {
        setPhase("answer")
        await speakAsync(it.answer)
        if (!runningRef.current) break
        await pause(700)
      } else {
        setPhase("prep")
        startRecognition()
        await countdown(seconds)
        stopRecognition()
        if (!runningRef.current) break
        setPhase("review")
        await pause(2500)
      }
    }
    hardStop()
  }

  if (!open) return null

  const cur = queue[index]
  const spoken = transcript.trim()
  const diff = mode === "qa" && cur?.answer && spoken ? diffWords(cur.answer, spoken) : null
  const words = spoken ? tokenize(spoken).length : 0

  function toggleTopic(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={() => { hardStop(); onClose() }}>
      <div className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:max-w-lg sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Headphones className="size-5 text-primary" />
          <h2 className="flex-1 text-base font-bold">Luyện tự động</h2>
          <button type="button" onClick={() => { hardStop(); onClose() }} className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent" aria-label="Đóng"><X className="size-4" /></button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {!running ? (
            <div className="space-y-5">
              {/* Mode */}
              <section>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-primary">Chế độ</h3>
                <div className="grid grid-cols-1 gap-2">
                  <button type="button" onClick={() => setMode("listen")} className={cn("flex items-start gap-3 rounded-xl border p-3 text-left transition-colors", mode === "listen" ? "border-primary bg-primary-soft" : "border-input bg-card hover:bg-accent")}>
                    <Headphones className="mt-0.5 size-5 shrink-0 text-primary" />
                    <div><p className="text-sm font-semibold">Nghe câu hỏi & câu trả lời</p><p className="text-xs text-muted-foreground">Tự phát lần lượt câu hỏi rồi câu trả lời, chỉnh được tốc độ.</p></div>
                  </button>
                  <button type="button" onClick={() => setMode("qa")} className={cn("flex items-start gap-3 rounded-xl border p-3 text-left transition-colors", mode === "qa" ? "border-primary bg-primary-soft" : "border-input bg-card hover:bg-accent")}>
                    <Mic className="mt-0.5 size-5 shrink-0 text-primary" />
                    <div><p className="text-sm font-semibold">Hỏi đáp (tự ghi âm)</p><p className="text-xs text-muted-foreground">Đọc câu hỏi, chừa thời gian cho bạn nói và ghi âm chấm điểm, rồi tự chuyển câu.</p></div>
                  </button>
                </div>
              </section>

              {/* Speed */}
              <section>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-primary">Tốc độ đọc</h3>
                <div className="flex flex-wrap gap-2">
                  {RATES.map((r) => <button key={r.value} type="button" onClick={() => setRate(r.value)} className={cn("rounded-full border px-3 py-1 text-xs font-semibold", rate === r.value ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card hover:bg-accent")}>{r.label}</button>)}
                </div>
              </section>

              {/* QA time */}
              {mode === "qa" && (
                <section>
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-primary">Thời gian nói mỗi câu</h3>
                  <div className="flex flex-wrap gap-2">
                    {TIMES.map((s) => <button key={s} type="button" onClick={() => setSeconds(s)} className={cn("rounded-full border px-3 py-1 text-xs font-semibold", seconds === s ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card hover:bg-accent")}>{s}s</button>)}
                  </div>
                </section>
              )}

              {/* Topics */}
              <section>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-primary">Chủ đề ({selected.size}/{ifaFinalTopics.length})</h3>
                  <div className="flex gap-2 text-xs font-semibold text-primary">
                    <button type="button" onClick={() => setSelected(new Set(ifaFinalTopics.map((t) => t.id)))} className="hover:underline">Tất cả</button>
                    <button type="button" onClick={() => setSelected(new Set())} className="hover:underline">Bỏ chọn</button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ifaFinalTopics.map((t) => (
                    <button key={t.id} type="button" onClick={() => toggleTopic(t.id)} className={cn("rounded-full border px-3 py-1 text-xs font-semibold", selected.has(t.id) ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card hover:bg-accent")}>{t.label}</button>
                  ))}
                </div>
              </section>

              {error && <p className="text-xs font-medium text-destructive">{error}</p>}

              <Button className="w-full" disabled={selected.size === 0} onClick={start}><Play className="size-4" /> Bắt đầu</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{index + 1}/{queue.length}</span>
                <span className="font-semibold text-primary">
                  {phase === "question" ? "Đang đọc câu hỏi" : phase === "answer" ? "Đang đọc câu trả lời" : phase === "prep" ? `Đến lượt bạn nói · ${remaining}s` : "Kết quả"}
                </span>
              </div>

              {cur && (
                <div className="rounded-xl border border-border p-4">
                  <p className="content-en text-lg font-bold leading-snug">{cur.q}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{cur.vi}</p>

                  {mode === "listen" && phase === "answer" && cur.answer && (
                    <p className="content-en mt-3 whitespace-pre-wrap border-l-2 border-primary px-3 text-sm leading-relaxed">{cur.answer}</p>
                  )}

                  {mode === "qa" && (
                    <div className="mt-3 space-y-2">
                      {phase === "prep" && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="relative flex size-2"><span className="absolute size-2 animate-ping rounded-full bg-destructive/60" /><span className="size-2 rounded-full bg-destructive" /></span>
                          <span className="font-semibold text-destructive">Đang ghi âm… còn {remaining}s</span>
                        </div>
                      )}
                      {spoken && <p className="whitespace-pre-wrap rounded-lg bg-muted/40 p-3 text-sm leading-relaxed">{spoken}</p>}
                      {phase === "review" && diff && (
                        <div className="rounded-lg border border-border bg-background/70 p-2">
                          <div className="mb-1.5 flex items-center gap-2">
                            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", diff.accuracy >= 85 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : diff.accuracy >= 60 ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" : "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300")}>{diff.accuracy}%</span>
                            <span className="text-[11px] text-muted-foreground">{diff.matched}/{diff.total} từ · {words} từ đã nói</span>
                          </div>
                          <p className="flex flex-wrap gap-x-1 text-xs leading-relaxed">
                            {diff.tokens.map((t, i) => <span key={i} className={t.state === "match" ? "text-emerald-700 dark:text-emerald-300" : t.state === "missing" ? "font-semibold text-red-600 underline dark:text-red-400" : "text-amber-700 line-through dark:text-amber-300"}>{t.text}</span>)}
                          </p>
                        </div>
                      )}
                      {phase === "review" && !cur.answer && <p className="text-xs text-muted-foreground">Câu này chưa có câu trả lời để chấm.</p>}
                    </div>
                  )}
                </div>
              )}

              {error && <p className="text-xs font-medium text-destructive">{error}</p>}
              <Button variant="outline" className="w-full" onClick={() => { hardStop() }}><Square className="size-4" /> Dừng</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
