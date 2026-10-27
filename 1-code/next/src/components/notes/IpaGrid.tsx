import { Fragment, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { useSpeak } from "@/lib/use-speak"
import type { IpaEntry } from "@/types/content"

const APP_BASE = (import.meta.env.BASE_URL || "/").replace(/\/?$/, "/")

const SOUND_TIPS: Record<string, string> = {
  "iː": "Kéo dài âm i, miệng mở ngang; phân biệt với /ɪ/ ngắn.", "ɪ": "Âm i ngắn, thả lỏng môi và lưỡi.",
  "uː": "Môi tròn và đẩy ra trước, giữ âm dài.", "ʊ": "Âm u ngắn, môi tròn nhẹ, không kéo dài.",
  "e": "Hạ hàm vừa phải, môi mở ngang.", "æ": "Há miệng rộng hơn /e/, lưỡi thấp phía trước.",
  "ɑː": "Há miệng rộng, lưỡi lùi về sau; âm dài, không đọc r cuối trong BrE.", "ʌ": "Âm ngắn ở giữa miệng, mở hàm vừa phải.",
  "ɔː": "Môi tròn, giữ âm dài; không thêm r cuối trong BrE.", "ɒ": "Môi tròn, âm ngắn và hàm mở rộng.",
  "ɜː": "Lưỡi giữa, môi thả lỏng; giữ âm dài, không đọc r sau âm.", "ə": "Schwa: âm rất nhẹ, ngắn và không mang trọng âm.",
  "ɪə": "Trượt từ /ɪ/ về /ə/ trong một hơi.", "eɪ": "Bắt đầu gần /e/, trượt lên /ɪ/.",
  "eə": "Trượt từ /e/ về /ə/; không thêm âm r cuối.", "aʊ": "Bắt đầu với miệng mở rộng rồi tròn môi về /ʊ/.",
  "ʊə": "Trượt từ /ʊ/ về /ə/; cách đọc BrE có thể thay đổi theo từ.", "ɔɪ": "Trượt từ môi tròn /ɔ/ sang /ɪ/.",
  "aɪ": "Bắt đầu miệng mở rộng, trượt lên /ɪ/.", "əʊ": "Bắt đầu từ /ə/, tròn môi và trượt về /ʊ/ (BrE).",
  p: "Hai môi khép rồi bật hơi, dây thanh không rung.", b: "Hai môi khép rồi bật, dây thanh rung.",
  t: "Đầu lưỡi chạm lợi rồi bật hơi, dây thanh không rung.", d: "Đầu lưỡi chạm lợi rồi bật, dây thanh rung.",
  k: "Gốc lưỡi chạm vòm mềm rồi bật hơi.", "ɡ": "Gốc lưỡi chạm vòm mềm, dây thanh rung.",
  f: "Răng trên chạm môi dưới, đẩy hơi liên tục.", v: "Răng trên chạm môi dưới, dây thanh rung.",
  θ: "Đầu lưỡi đặt nhẹ giữa hai hàm răng, thổi hơi; không đọc thành /t/.", ð: "Cùng vị trí với /θ/ nhưng dây thanh rung.",
  s: "Luồng hơi đi qua khe hẹp giữa lưỡi và lợi.", z: "Cùng khẩu hình với /s/ nhưng dây thanh rung.",
  ʃ: "Môi hơi tròn, đẩy hơi qua phần trước lưỡi như trong shop.", ʒ: "Cùng khẩu hình với /ʃ/ nhưng dây thanh rung.",
  "tʃ": "Bật /t/ rồi xát /ʃ/ liền nhau thành một âm.", "dʒ": "Bật /d/ rồi xát /ʒ/ liền nhau thành một âm.",
  m: "Khép môi, để hơi đi qua mũi.", n: "Đầu lưỡi chạm lợi, hơi đi qua mũi.",
  ŋ: "Gốc lưỡi chạm vòm mềm, hơi qua mũi; không thêm âm g ở cuối.", h: "Thở hơi nhẹ qua cổ họng, không rung dây thanh.",
  l: "Đầu lưỡi chạm lợi, hơi thoát hai bên lưỡi.", r: "Âm r BrE: lưỡi không chạm vòm; không đọc r cuối sau nguyên âm.",
  w: "Tròn môi rồi chuyển nhanh sang nguyên âm tiếp theo.", j: "Âm y như đầu từ yes, trượt nhanh vào nguyên âm.",
}

/**
 * Example word per phoneme, matching the classic BBC phonemic chart, with the
 * letters that make the sound marked for underline. `[a, b, c]` renders as
 * a + <u>b</u> + c. Falls back to the data's `word` when absent.
 */
const EXAMPLE: Record<string, [string, string, string]> = {
  // monophthongs
  "iː": ["sh", "ee", "p"], "ɪ": ["sh", "i", "p"], "ʊ": ["g", "oo", "d"], "uː": ["sh", "oo", "t"],
  e: ["b", "e", "d"], "ə": ["teach", "er", ""], "ɜː": ["b", "ir", "d"], "ɔː": ["d", "oor", ""],
  "æ": ["c", "a", "t"], "ʌ": ["", "u", "p"], "ɑː": ["f", "ar", ""], "ɒ": ["", "o", "n"],
  // diphthongs
  "ɪə": ["h", "ere", ""], "eɪ": ["w", "ai", "t"], "ʊə": ["t", "ou", "rist"], "ɔɪ": ["b", "oy", ""],
  "əʊ": ["sh", "ow", ""], "eə": ["h", "air", ""], "aɪ": ["m", "y", ""], "aʊ": ["c", "ow", ""],
  // consonants
  p: ["", "p", "ea"], b: ["", "b", "oat"], t: ["", "t", "ea"], d: ["", "d", "og"],
  "tʃ": ["", "ch", "eese"], "dʒ": ["", "J", "une"], k: ["", "c", "ar"], "ɡ": ["", "g", "o"],
  f: ["", "f", "ly"], v: ["", "v", "ideo"], θ: ["", "th", "ink"], ð: ["", "th", "is"],
  s: ["", "s", "ee"], z: ["", "z", "oo"], ʃ: ["", "sh", "all"], ʒ: ["televi", "si", "on"],
  m: ["", "m", "an"], n: ["", "n", "ow"], ŋ: ["si", "ng", ""], h: ["", "h", "at"],
  l: ["", "l", "ove"], r: ["", "r", "ed"], w: ["", "w", "et"], j: ["", "y", "es"],
}

export type IpaVariant = "mono" | "diph" | "cons" | "flat"

interface Props {
  items: IpaEntry[]
  /** Offset into the 44 locally generated phoneme clips. */
  startIndex?: number
  /** Legacy layouts. "flat" keeps the responsive grid used by the Notes page. */
  variant?: IpaVariant
}

/** Shared selected/playing state + the clip player, keyed on the master list. */
function useIpaPlayer(all: IpaEntry[]) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [selectedIpa, setSelectedIpa] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [fallback, setFallback] = useState(false)
  const speak = useSpeak()

  useEffect(() => () => { audioRef.current?.pause(); audioRef.current = null }, [])

  function play(entry: IpaEntry) {
    const index = all.indexOf(entry)
    if (index < 0) return
    audioRef.current?.pause()
    const clip = new Audio(`${APP_BASE}audio/ipa/${String(index + 1).padStart(2, "0")}.wav`)
    audioRef.current = clip
    setSelectedIpa(entry.ipa)
    setFallback(false)
    setPlaying(true)
    clip.onended = () => setPlaying(false)
    void clip.play().catch(() => {
      setPlaying(false)
      setFallback(true)
      speak(entry.word)
    })
  }

  return { selectedIpa, playing, fallback, play, speakWord: speak }
}

function ExampleWord({ ipa, word }: { ipa: string; word: string }) {
  const parts = EXAMPLE[ipa]
  if (!parts) return <>{word}</>
  const [before, mid, after] = parts
  return <>{before}<u>{mid}</u>{after}</>
}

/** A single phoneme cell used across every chart section. */
function Cell({
  entry, selected, onPlay, tone,
}: {
  entry?: IpaEntry
  selected: boolean
  onPlay: (e: IpaEntry) => void
  /** Background tone class for the section (vowel vs consonant). */
  tone: string
}) {
  if (!entry) return <div aria-hidden />
  return (
    <button
      type="button"
      onClick={() => onPlay(entry)}
      aria-pressed={selected}
      aria-label={`Nghe âm /${entry.ipa}/, ví dụ ${entry.word}`}
      data-selected={selected}
      className={cn(
        "tile relative flex flex-col items-center justify-center gap-0.5 px-1 py-2 text-center",
        tone
      )}
    >
      <span className="ipa text-xl font-semibold leading-none sm:text-2xl">{entry.ipa}</span>
      <span className="content-en text-[10px] leading-tight text-foreground/70 sm:text-xs">
        <ExampleWord ipa={entry.ipa} word={entry.word} />
      </span>
    </button>
  )
}

function PlayerBar({
  selected, playing, fallback, onReplay, onWord,
}: {
  selected: IpaEntry | null
  playing: boolean
  fallback: boolean
  onReplay: () => void
  onWord: () => void
}) {
  if (!selected) {
    return (
      <p className="mb-3 text-sm text-muted-foreground">
        Chạm vào ký hiệu để nghe <strong>âm riêng</strong>; chạm “Từ mẫu” để nghe trong từ.
      </p>
    )
  }
  return (
    <div className="mb-4 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary-soft p-3 sm:p-4" aria-live="polite">
      <button type="button" onClick={onReplay} className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground" aria-label={`Nghe lại âm /${selected.ipa}/`}>
        /{selected.ipa}/
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase text-primary">{playing ? "Đang phát âm mẫu" : "Âm đang chọn"} · {selected.word}</p>
        <p className="mt-0.5 text-sm leading-snug text-foreground">{SOUND_TIPS[selected.ipa] || "Nghe âm và quan sát khẩu hình."}</p>
        {fallback && <p className="text-xs text-muted-foreground">Không tải được âm mẫu; đang đọc từ ví dụ.</p>}
      </div>
      <button type="button" onClick={onWord} className="shrink-0 rounded-lg border border-primary/20 bg-card px-2 py-1.5 text-xs font-semibold text-primary" aria-label={`Nghe từ ví dụ ${selected.word}`}>Từ mẫu</button>
    </div>
  )
}

// ── BBC phonemic chart layout ────────────────────────────────────────────────
// Positions reference the classic chart. Each entry is an IPA key; `null` is a
// blank cell so the diphthong block steps in like the original.

const MONO_ROWS: string[][] = [
  ["iː", "ɪ", "ʊ", "uː"],
  ["e", "ə", "ɜː", "ɔː"],
  ["æ", "ʌ", "ɑː", "ɒ"],
]
const DIPH_ROWS: (string | null)[][] = [
  ["ɪə", "eɪ", null, null],
  ["ʊə", "ɔɪ", "əʊ", null],
  ["eə", "aɪ", "aʊ", null],
]
const CONS_ROWS: string[][] = [
  ["p", "b", "t", "d", "tʃ", "dʒ", "k", "ɡ"],
  ["f", "v", "θ", "ð", "s", "z", "ʃ", "ʒ"],
  ["m", "n", "ŋ", "h", "l", "r", "w", "j"],
]

const VOWEL_TONE = "bg-muted/60"
const DIPH_TONE = "bg-muted"
const CONS_TONE = "bg-amber-100 dark:bg-amber-500/15"

/**
 * The full interactive BBC-style phonemic chart: monophthongs + diphthongs on
 * top (vowels), consonants below, with a voiced/unvoiced legend. One click
 * plays the phoneme clip; the bar above shows the mouth-shape tip.
 */
export function PhonemicChart({
  mono, diph, cons,
}: {
  mono: IpaEntry[]
  diph: IpaEntry[]
  cons: IpaEntry[]
}) {
  // Master list order must match the generated clips 01–44 (mono, diph, cons).
  const all = [...mono, ...diph, ...cons]
  const { selectedIpa, playing, fallback, play, speakWord } = useIpaPlayer(all)
  const byIpa = (ipa: string) => all.find((e) => e.ipa === ipa)
  const selected = selectedIpa ? byIpa(selectedIpa) ?? null : null

  const cell = (ipa: string, tone: string) => (
    <Cell key={ipa} entry={byIpa(ipa)} selected={selectedIpa === ipa} onPlay={play} tone={tone} />
  )

  return (
    <div>
      <PlayerBar
        selected={selected}
        playing={playing}
        fallback={fallback}
        onReplay={() => selected && play(selected)}
        onWord={() => selected && speakWord(selected.word)}
      />

      <div className="overflow-x-auto">
        {/* One grid for the whole chart so every gap is an identical 1px — no
            stray horizontal gutters between row blocks. The grid's own
            background shows through the 1px gaps as thin separator lines. */}
        <div className="grid min-w-[640px] grid-cols-[24px_repeat(8,1fr)] gap-px overflow-hidden rounded-lg border border-border bg-border">
          {/* Header row */}
          <span />
          <span className="col-span-4 rounded-sm bg-muted/80 py-1 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">monophthongs</span>
          <span className="col-span-3 rounded-sm bg-muted py-1 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">diphthongs</span>
          <span className="flex items-center justify-center text-[10px] font-semibold leading-tight text-muted-foreground">
            voiced ·<br />unvoiced
          </span>

          {/* Vowel rows. The "Vowels" label spans the three rows in column 1. */}
          <span className="row-span-3 flex items-center justify-center bg-muted/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground [writing-mode:vertical-rl] rotate-180">
            Vowels
          </span>
          {MONO_ROWS.map((row, r) => (
            <Fragment key={`v-${r}`}>
              {row.map((ipa) => cell(ipa, VOWEL_TONE))}
              {DIPH_ROWS[r].map((ipa, i) =>
                ipa ? cell(ipa, DIPH_TONE) : <span key={`d-${r}-${i}`} aria-hidden />
              )}
            </Fragment>
          ))}

          {/* Consonant rows. */}
          <span className="row-span-3 flex items-center justify-center bg-amber-100 text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 [writing-mode:vertical-rl] rotate-180">
            Consonants
          </span>
          {CONS_ROWS.map((row, r) => (
            <Fragment key={`c-${r}`}>
              {row.map((ipa) => cell(ipa, CONS_TONE))}
            </Fragment>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Nguyên âm ở trên (đơn + đôi), phụ âm nền vàng ở dưới. Chữ gạch chân trong từ ví dụ là phần tạo ra âm đó.
        Giọng mẫu Anh-Anh (BrE); đổi âm điệu/giọng ở nút <strong>Cài đặt</strong> trên thanh điều hướng.
      </p>
    </div>
  )
}

/** Legacy flat grid — still used by the Notes page IPA chart. */
export function IpaGrid({ items, startIndex = 0 }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const [fallback, setFallback] = useState(false)
  const speak = useSpeak()

  useEffect(() => () => { audioRef.current?.pause(); audioRef.current = null }, [])
  const selected = selectedIndex === null ? null : items[selectedIndex]

  function playSound(index: number) {
    audioRef.current?.pause()
    const clip = new Audio(`${APP_BASE}audio/ipa/${String(startIndex + index + 1).padStart(2, "0")}.wav`)
    audioRef.current = clip
    setSelectedIndex(index)
    setFallback(false)
    setPlaying(true)
    clip.onended = () => setPlaying(false)
    void clip.play().catch(() => {
      setPlaying(false)
      setFallback(true)
      speak(items[index].word)
    })
  }

  return (
    <div>
      <PlayerBar
        selected={selected ?? null}
        playing={playing}
        fallback={fallback}
        onReplay={() => selectedIndex !== null && playSound(selectedIndex)}
        onWord={() => selected && speak(selected.word)}
      />
      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 sm:gap-2">
        {items.map((sound, index) => (
          <button key={`${sound.ipa}-${index}`} type="button" onClick={() => playSound(index)} aria-pressed={selectedIndex === index}
            aria-label={`Nghe âm /${sound.ipa}/, ví dụ ${sound.word}`}
            className={cn("flex min-h-16 min-w-0 flex-col items-center justify-center rounded-xl border px-1 py-2 text-center transition-colors sm:min-h-20", selectedIndex === index ? "border-primary bg-primary-soft ring-2 ring-primary/20" : "border-border bg-card hover:border-primary/50 hover:bg-accent")}>
            <span className="ipa text-xl font-bold text-primary sm:text-2xl">/{sound.ipa}/</span>
            <span className="content-en mt-0.5 truncate text-[11px] text-muted-foreground sm:text-xs">{sound.word}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
