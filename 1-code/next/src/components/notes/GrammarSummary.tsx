import { useEffect, useState, type ReactNode } from "react"
import { imageSizes } from "@/data/image-sizes"

/* ------------------------------------------------------------------ */
/* Asset helper                                                        */
/* ------------------------------------------------------------------ */

const APP_BASE = (import.meta.env.BASE_URL || "/").replace(/\/?$/, "/")

function finalAsset(path: string) {
  return `${APP_BASE}${`final/google-doc-pre-course/${path}`.split("/").map(encodeURIComponent).join("/")}`
}

/** Intrinsic size measured at build time — lets lazy images reserve their space. */
function finalSize(path: string) {
  return imageSizes[`/final/google-doc-pre-course/${path}`]
}

type Cell = ReactNode

/* ------------------------------------------------------------------ */
/* Inline highlight — mimic the doc's coloured keywords               */
/* ------------------------------------------------------------------ */

type Tone = "red" | "orange" | "blue" | "green" | "pink" | "purple"

const toneText: Record<Tone, string> = {
  red: "text-rose-600 dark:text-rose-300",
  orange: "text-orange-600 dark:text-orange-300",
  blue: "text-blue-700 dark:text-blue-300",
  green: "text-emerald-700 dark:text-emerald-300",
  pink: "text-pink-600 dark:text-pink-300",
  purple: "text-purple-700 dark:text-purple-300",
}

function Hi({ children, tone = "red" }: { children: ReactNode; tone?: Tone }) {
  return <span className={`font-semibold ${toneText[tone]}`}>{children}</span>
}

/** Yellow marker highlight, like the doc's highlighter pen. */
function Mark({ children }: { children: ReactNode }) {
  return (
    <span className="rounded bg-amber-200/70 px-1 font-semibold text-amber-950 dark:bg-amber-400/25 dark:text-amber-100">
      {children}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Image + zoom                                                        */
/* ------------------------------------------------------------------ */

type FigureSize = "sm" | "md" | "lg" | "xl"

const figureMax: Record<FigureSize, string> = {
  sm: "max-h-32",
  md: "max-h-56",
  lg: "max-h-[420px]",
  xl: "max-h-[680px]",
}

function Figure({
  src,
  alt,
  caption,
  size = "md",
  className = "",
}: {
  src: string
  alt: string
  caption?: ReactNode
  size?: FigureSize
  className?: string
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <figure className="my-1 text-center">
      <button type="button" className="block w-full cursor-zoom-in" onClick={() => setOpen(true)}>
        <img
          src={finalAsset(src)}
          alt={alt}
          loading="lazy"
          decoding="async"
          width={finalSize(src)?.w}
          height={finalSize(src)?.h}
          className={`mx-auto h-auto w-full rounded-xl bg-white object-contain p-2 ring-1 ring-border/60 transition hover:ring-primary/50 ${figureMax[size]} ${className}`}
        />
      </button>
      {caption && <figcaption className="mt-2 text-sm text-muted-foreground">{caption}</figcaption>}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
            onClick={() => setOpen(false)}
          >
            Đóng
          </button>
          <img
            src={finalAsset(src)}
            alt={alt}
            className="max-h-[90vh] max-w-[96vw] rounded-lg bg-white object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </figure>
  )
}

/* ------------------------------------------------------------------ */
/* Structure primitives                                               */
/* ------------------------------------------------------------------ */

function Part({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string
  eyebrow: string
  title: string
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-6">
      <header className="overflow-hidden rounded-2xl border border-rose-200/70 bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 dark:border-rose-900/40 dark:from-rose-950/30 dark:via-orange-950/20 dark:to-amber-950/20">
        <div className="flex flex-col gap-1 px-5 py-4 sm:px-7 sm:py-5">
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-rose-500">
            Grammar · {eyebrow}
          </span>
          <h2 className="text-2xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            {title}
          </h2>
        </div>
      </header>
      <div className="space-y-8">{children}</div>
    </section>
  )
}

function Section({
  id,
  num,
  title,
  lesson,
  children,
}: {
  id: string
  num: string
  title: string
  lesson?: string
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-border/70 bg-card/50 p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-dashed border-border/70 pb-3">
        <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-primary px-2 text-sm font-bold text-primary-foreground">
          {num}
        </span>
        <h3 className="text-xl font-extrabold tracking-tight text-foreground">{title}</h3>
        {lesson && (
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
            {lesson}
          </span>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

/** Decorative / numbered sub-heading. Skipped from the page TOC to keep it clean. */
function Sub({ children }: { children: ReactNode }) {
  return (
    <h4
      data-toc-skip
      className="mt-2 flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-base font-bold text-foreground ring-1 ring-border/50"
    >
      {children}
    </h4>
  )
}

function Def({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border-l-4 border-primary/60 bg-primary/5 px-4 py-3 text-sm leading-6">
      <span className="mr-1 font-bold text-primary">Definition</span>
      <span className="text-foreground/90">{children}</span>
    </div>
  )
}

function P({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-6 text-foreground/90">{children}</p>
}

function Eg({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm leading-6">
      <span className="font-semibold italic text-muted-foreground">E.g:</span> {children}
    </p>
  )
}

const noteTones = {
  amber: "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/25 dark:text-amber-100",
  blue: "border-blue-300 bg-blue-50 text-blue-950 dark:border-blue-900 dark:bg-blue-950/25 dark:text-blue-100",
  rose: "border-rose-300 bg-rose-50 text-rose-950 dark:border-rose-900 dark:bg-rose-950/25 dark:text-rose-100",
} as const

function Note({
  children,
  tone = "amber",
  title,
}: {
  children: ReactNode
  tone?: keyof typeof noteTones
  title?: string
}) {
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm leading-6 ${noteTones[tone]}`}>
      {title && <div className="mb-1 font-bold">{title}</div>}
      {children}
    </div>
  )
}

function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="ml-5 list-disc space-y-1 text-sm leading-6 text-foreground/90 marker:text-primary">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  )
}

/* ------------------------------------------------------------------ */
/* Responsive comparison cards (replace narrow doc tables)            */
/* ------------------------------------------------------------------ */

const compareHeadTones: Record<Tone, string> = {
  red: "bg-rose-600",
  orange: "bg-orange-500",
  blue: "bg-blue-600",
  green: "bg-emerald-600",
  pink: "bg-pink-600",
  purple: "bg-purple-600",
}

function CompareGrid({
  columns,
}: {
  columns: { title: ReactNode; tone: Tone; body: ReactNode }[]
}) {
  const cols = columns.length
  const grid =
    cols >= 4 ? "md:grid-cols-4" : cols === 3 ? "md:grid-cols-3" : "md:grid-cols-2"
  return (
    <div className={`grid gap-3 ${grid}`}>
      {columns.map((col, i) => (
        <div key={i} className="overflow-hidden rounded-xl ring-1 ring-border/70">
          <div className={`px-3 py-2 text-center text-sm font-bold text-white ${compareHeadTones[col.tone]}`}>
            {col.title}
          </div>
          <div className="space-y-2 bg-card p-3 text-sm leading-6 text-foreground/90">{col.body}</div>
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Readable data table (matrix data)                                  */
/* ------------------------------------------------------------------ */

function DataTable({
  head,
  rows,
  center = false,
  minWidth = "min-w-[640px]",
  firstColHead = false,
}: {
  head: Cell[]
  rows: Cell[][]
  center?: boolean
  minWidth?: string
  firstColHead?: boolean
}) {
  const align = center ? "text-center align-middle" : "text-left align-top"
  return (
    <div className="overflow-x-auto rounded-xl ring-1 ring-border/70">
      <table className={`w-full ${minWidth} border-collapse text-xs leading-5 sm:text-sm sm:leading-6`}>
        <thead>
          <tr className="bg-muted/70 text-foreground">
            {head.map((h, i) => (
              <th key={i} className={`border-b border-border/70 px-2 py-2 font-bold sm:px-3 ${align}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="odd:bg-background even:bg-muted/25">
              {row.map((c, ci) =>
                firstColHead && ci === 0 ? (
                  <th
                    key={ci}
                    scope="row"
                    className="border-b border-border/50 bg-muted/40 px-2 py-2 text-left align-top font-semibold sm:px-3"
                  >
                    {c}
                  </th>
                ) : (
                  <td key={ci} className={`border-b border-border/50 px-2 py-2 sm:px-3 ${align}`}>
                    {c}
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Part 1 — Word class overview table                                 */
/* ------------------------------------------------------------------ */

const wordClassColumns = [
  { label: "P.", value: "She (subject), you (object)", color: "#a3e635" },
  { label: "Adv.", value: "always, today", color: "#38bdf8" },
  { label: "Modal", value: "may", color: "#a5f3fc" },
  { label: "V.", value: "bakes, make", color: "#facc15" },
  { label: "Det.", value: "a", color: "#5eead4" },
  { label: "Adj.", value: "delicious", color: "#fdba74" },
  { label: "N.", value: "cake, home, Saturday, Tiramisu", color: "#f0abfc" },
  { label: "Prep.", value: "at, on, for", color: "#fb923c" },
  { label: "Conj.", value: "and", color: "#fde047" },
]

function WordClassTable() {
  return (
    <div className="overflow-x-auto rounded-xl ring-1 ring-border/70">
      <table className="w-full min-w-[720px] border-collapse text-xs leading-5 sm:text-sm">
        <thead>
          <tr>
            {wordClassColumns.map((c) => (
              <th
                key={c.label}
                className="px-2 py-2 text-center font-extrabold text-slate-900"
                style={{ backgroundColor: c.color }}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {wordClassColumns.map((c) => (
              <td key={c.label} className="border-b border-border/50 px-2 py-3 text-center align-top">
                {c.value}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 1.6 Prepositions — IN / ON / AT diagram                            */
/* ------------------------------------------------------------------ */

function InOnAtChart() {
  const leader = <span className="mx-1 hidden flex-1 translate-y-[-0.25em] border-b border-dotted border-slate-500/70 sm:block" aria-hidden />
  return (
    <div className="overflow-hidden rounded-xl bg-white p-4 ring-1 ring-border/70 dark:bg-card [&_p.flex]:flex-wrap [&_p.flex]:gap-x-2 [&_p.flex>span]:break-words">
      <div className="mx-auto grid max-w-[1040px] grid-cols-[minmax(0,0.74fr)_minmax(120px,1.18fr)_minmax(0,0.74fr)] items-start gap-1 sm:gap-3 lg:grid-cols-[270px_minmax(0,1.35fr)_270px]">
        <div className="space-y-3 text-[9px] leading-3 sm:space-y-4 sm:text-xs sm:leading-4 lg:space-y-5 lg:text-sm lg:leading-5">
          <h6 className="font-serif text-2xl font-extrabold text-slate-700 dark:text-slate-200 sm:text-4xl lg:text-5xl">Time</h6>
          <div className="space-y-1">
            <p><span className="font-bold text-rose-400">Long periods of time</span><br />the 9th century, the 90s</p>
            <p className="flex items-baseline"><span className="font-bold text-rose-400">Years</span>{leader}<span>2023</span></p>
            <p className="flex items-baseline"><span className="font-bold text-rose-400">Seasons</span>{leader}<span>Winter</span></p>
            <p className="flex items-baseline"><span className="font-bold text-rose-400">Months</span>{leader}<span>August</span></p>
            <p className="flex items-baseline"><span className="font-bold text-rose-400">Parts of the day</span>{leader}<span>Morning</span></p>
          </div>
          <div className="space-y-1">
            <p className="flex items-baseline"><span className="font-bold text-emerald-600">Dates</span>{leader}<span>25th October 1987</span></p>
            <p className="flex items-baseline"><span className="font-bold text-emerald-600">Days</span>{leader}<span>Friday</span></p>
            <p className="flex items-baseline"><span className="font-bold text-emerald-600">Special Dates</span>{leader}<span>My birthday</span></p>
            <p className="flex items-baseline"><span className="font-bold text-emerald-600">Day + Part of day</span>{leader}<span>Monday morning</span></p>
            <p className="flex items-baseline"><span className="font-bold text-emerald-600">Holidays with 'Day'</span>{leader}<span>Easter Day</span></p>
          </div>
          <div className="space-y-1">
            <p className="flex items-baseline"><span className="font-bold text-orange-500">Special celebrations</span>{leader}<span>New Year</span></p>
            <p className="flex items-baseline"><span className="font-bold text-orange-500">Particular points of the week</span>{leader}<span>weekend</span></p>
            <p className="flex items-baseline"><span className="font-bold text-orange-500">Particular points in the day</span>{leader}<span>midday</span></p>
            <p className="flex items-baseline"><span className="font-bold text-orange-500">Particular points of the clock</span>{leader}<span>8.15 am</span></p>
          </div>
        </div>

        <div className="flex items-start justify-center pt-4 sm:pt-8 lg:pt-14">
          <div className="relative mx-auto aspect-[4/3.6] w-full max-w-[360px] text-center text-white [clip-path:polygon(0_0,100%_0,50%_100%)]">
            <div className="absolute inset-x-0 top-0 flex h-[40%] flex-col items-center justify-center bg-[#d63a24] px-6">
              <div className="text-[10px] font-bold leading-tight sm:text-sm lg:text-base">General (Tổng quan, to lớn)</div>
              <div className="font-serif text-3xl font-extrabold leading-none sm:text-5xl lg:text-6xl">IN</div>
            </div>
            <div className="absolute inset-x-0 top-[40%] flex h-[32%] flex-col items-center justify-center bg-[#69aa50] px-10">
              <div className="text-[9px] font-bold leading-tight sm:text-xs lg:text-sm">More specific (Cụ thể hơn/nhỏ hơn)</div>
              <div className="font-serif text-2xl font-extrabold leading-none sm:text-4xl lg:text-5xl">ON</div>
            </div>
            <div className="absolute inset-x-0 bottom-0 top-[72%] flex flex-col items-center justify-start bg-[#ee9a2e] px-12 pt-0.5">
              <div className="text-[7px] font-bold leading-tight sm:text-[10px] lg:text-xs">Very specific (rất nhỏ, cụ thể)</div>
              <div className="font-serif text-xl font-extrabold leading-none sm:text-3xl lg:text-4xl">AT</div>
            </div>
          </div>
        </div>

        <div className="space-y-3 text-left text-[9px] leading-3 sm:space-y-4 sm:text-xs sm:leading-4 lg:space-y-5 lg:text-right lg:text-sm lg:leading-5">
          <h6 className="font-serif text-2xl font-extrabold text-slate-700 dark:text-slate-200 sm:text-4xl lg:text-5xl">Place</h6>
          <div className="space-y-1">
            <p className="flex items-baseline"><span>Desert</span>{leader}<span className="font-bold text-rose-400">Area / regions</span></p>
            <p className="flex items-baseline"><span>Vietnam</span>{leader}<span className="font-bold text-rose-400">Countries</span></p>
            <p className="flex items-baseline"><span>Hanoi</span>{leader}<span className="font-bold text-rose-400">Town / cities</span></p>
            <p className="flex items-baseline"><span>Bai Chay</span>{leader}<span className="font-bold text-rose-400">Neighborhood</span></p>
            <p className="flex items-baseline"><span>Hospital</span>{leader}<span className="font-bold text-rose-400">Inside a building</span></p>
            <p className="flex items-baseline"><span>Car, kitchen</span>{leader}<span className="font-bold text-rose-400">Enclosed space</span></p>
          </div>
          <div className="space-y-1">
            <p className="flex items-baseline"><span>Phu Quoc island</span>{leader}<span className="font-bold text-emerald-600">Island</span></p>
            <p>Tran Phu Street, Avenue</p>
            <p className="flex items-baseline"><span>Bus, train</span>{leader}<span className="font-bold text-emerald-600">Public transport</span></p>
            <p className="flex items-baseline"><span>The 15th floor</span>{leader}<span className="font-bold text-emerald-600">A floor in a building</span></p>
            <p className="flex items-baseline"><span>Table, wall</span>{leader}<span className="font-bold text-emerald-600">On any surface</span></p>
            <p className="flex items-baseline"><span>Page 99</span>{leader}<span className="font-bold text-emerald-600">Pages</span></p>
          </div>
          <div className="space-y-1">
            <p className="flex items-baseline"><span>my desk</span>{leader}<span className="font-bold text-orange-500">Specific locations</span></p>
            <p className="flex items-baseline"><span>21 Hang Dao Street</span>{leader}<span className="font-bold text-orange-500">An address</span></p>
            <p className="flex items-baseline"><span>school</span>{leader}<span className="font-bold text-orange-500">School/college/university</span></p>
            <p className="flex items-baseline"><span>The butcher's</span>{leader}<span className="font-bold text-orange-500">most shops</span></p>
            <p className="flex items-baseline"><span>Microsoft</span>{leader}<span className="font-bold text-orange-500">Companies / workplace</span></p>
            <p className="flex items-baseline"><span>An's party</span>{leader}<span className="font-bold text-orange-500">Activities (groups)</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 1.8 Adverbs — position cards                                        */
/* ------------------------------------------------------------------ */

const adverbPositions = [
  {
    title: "FRONT POSITION",
    color: "blue" as const,
    items: [
      { label: "Evaluative", vi: "Trạng từ đánh giá", stars: "★★★", examples: ["Luckily, nobody got hurt.", "Unfortunately, we arrived late."] },
      { label: "Place", vi: "Trạng từ nơi chốn", stars: "★", examples: ["<đôi lúc trong văn viết>", "Here she sat"] },
      { label: "Time", vi: "Trạng từ thời gian", stars: "★", examples: ["<nhấn mạnh trạng từ>", "Today, I'm going to clean the house."] },
      { label: "Frequency", vi: "Trạng từ tần suất", stars: "★", examples: ["Sometimes, she wore a pink hat"] },
    ],
  },
  {
    title: "MID POSITION",
    color: "orange" as const,
    items: [
      { label: "Frequency", vi: "Trạng từ tần suất", stars: "★★★", examples: ["I usually get up late on weekends"] },
      { label: "Manner", vi: "Trạng từ cách thức", stars: "★", examples: ["She quickly ate her dinner and ran out."] },
      { label: "Degree", vi: "Trạng từ mức độ", stars: "★★★", examples: ["<really, very, quite, too>", "I really like those pink flowers."] },
      { label: "Time", vi: "Trạng từ thời gian", stars: "★★★", examples: ["<just, already>", "I've already seen this film."] },
    ],
  },
  {
    title: "END POSITION",
    color: "pink" as const,
    items: [
      { label: "Manner", vi: "Trạng từ cách thức", stars: "★★★", examples: ["She can speak English fluently"] },
      { label: "Place", vi: "Trạng từ nơi chốn", stars: "★★★", examples: ["I can't find him anywhere"] },
      { label: "Time", vi: "Trạng từ thời gian", stars: "★★★", examples: ["I'm flying to London tomorrow"] },
      { label: "Degree", vi: "Trạng từ mức độ", stars: "★★★", examples: ["<a lot, a bit>", "We go to Da Nang a lot"] },
    ],
  },
]

const adverbStyles = {
  blue: { title: "text-blue-800 dark:text-blue-200", border: "border-blue-300 dark:border-blue-800", card: "bg-blue-50/80 dark:bg-blue-950/20", bar: "bg-blue-700 text-white", text: "text-blue-900 dark:text-blue-100" },
  orange: { title: "text-orange-700 dark:text-orange-200", border: "border-orange-300 dark:border-orange-800", card: "bg-orange-50/80 dark:bg-orange-950/20", bar: "bg-orange-500 text-white", text: "text-orange-900 dark:text-orange-100" },
  pink: { title: "text-pink-800 dark:text-pink-200", border: "border-pink-300 dark:border-pink-800", card: "bg-pink-50/80 dark:bg-pink-950/20", bar: "bg-pink-700 text-white", text: "text-pink-900 dark:text-pink-100" },
} as const

function AdverbPositionCards() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {adverbPositions.map((column) => {
        const style = adverbStyles[column.color]
        return (
          <section key={column.title} className={`rounded-xl border p-1.5 ${style.border} ${style.card}`}>
            <h6 className={`mb-1 text-center text-lg font-bold tracking-wide ${style.title}`}>{column.title}</h6>
            <div className="space-y-2">
              {column.items.map((item) => (
                <div key={`${column.title}-${item.label}`} className="space-y-1">
                  <div className={`rounded-md px-2 py-1.5 text-center text-xs font-bold leading-4 shadow-sm ${style.bar}`}>
                    {item.label} <span className="font-semibold">({item.vi})</span>
                    <div className="text-yellow-300">{item.stars}</div>
                  </div>
                  <ul className={`ml-6 list-disc space-y-0.5 pl-2 text-xs leading-5 ${style.text}`}>
                    {item.examples.map((example) => <li key={example}>{example}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 1.9 Conjunctions — FANBOYS + correlative                            */
/* ------------------------------------------------------------------ */

const fanboysRows = [
  ["F", "For", "vì", "I told her to leave, for I was very tired."],
  ["A", "And", "và", "I like football, and I like badminton."],
  ["N", "Nor", "cũng không", "I don't like cats nor dogs."],
  ["B", "But", "nhưng", "I'm poor, but I'm happy."],
  ["O", "Or", "hoặc", "Do you want a hamburger or a hotdog?"],
  ["Y", "Yet", "tuy nhiên", "The weather was cold yet sunny."],
  ["S", "So", "vậy nên", "He studied hard, so he got an A."],
]

function FanboysTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-blue-200 bg-white text-xs leading-5 shadow-sm dark:border-blue-900 dark:bg-card">
      {fanboysRows.map(([letter, word, vi, example]) => (
        <div key={letter} className="grid grid-cols-[1.35rem_3.5rem_3.8rem_1fr] border-b border-blue-100 last:border-b-0 sm:grid-cols-[2rem_4.5rem_5rem_1fr] dark:border-blue-900/50">
          <div className="bg-blue-700 px-1 py-1 text-center text-sm font-extrabold text-white sm:px-2 sm:text-base">{letter}</div>
          <div className="bg-blue-50 px-2 py-1 font-bold text-blue-950 dark:bg-blue-950/40 dark:text-blue-100">{word}</div>
          <div className="px-2 py-1 italic text-slate-600 dark:text-slate-300">({vi})</div>
          <div className="break-words px-2 py-1 text-slate-700 dark:text-slate-200">{example}</div>
        </div>
      ))}
    </div>
  )
}

function ConjunctionSummary() {
  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-border/70">
      <div className="grid text-sm font-bold text-white md:grid-cols-2">
        <div className="bg-blue-700 px-4 py-2 text-center">Liên từ kết hợp</div>
        <div className="bg-orange-600 px-4 py-2 text-center">Liên từ tương quan</div>
      </div>
      <div className="grid md:grid-cols-2">
        <div className="space-y-4 bg-blue-50/60 p-4 dark:bg-blue-950/20">
          <p className="text-sm leading-6">
            Các từ dùng để nối các từ, cụm từ cùng loại hoặc những mệnh đề ngang hàng nhau. Ví dụ: Nối tính từ với tính từ, danh từ với danh từ...
          </p>
          <FanboysTable />
        </div>
        <div className="space-y-3 bg-orange-50/70 p-4 text-sm leading-6 dark:bg-orange-950/20">
          <p>Những cặp từ dùng để liên kết hai từ, cụm từ tương đương nhau về chức năng ngữ pháp trong câu; dùng để nhấn mạnh, hướng sự chú ý của người đọc đến hai thành phần được liên kết.</p>
          <p><Hi tone="orange">Both...and...</Hi> (vừa...vừa/cả...và...) — E.g: This house is both large and warm.</p>
          <p><Hi tone="orange">Either...or...</Hi> (hoặc...hoặc...) — E.g: You should put it either on the left or on the right.</p>
          <p><Hi tone="orange">Neither...nor...</Hi> (cả...cũng không...) — E.g: He is neither rich nor famous.</p>
          <p><Hi tone="orange">Not only...but also...</Hi> (không những...mà còn) — E.g: My father is not only friendly but also kind.</p>
          <p><Hi tone="orange">would rather...than...</Hi> (muốn/thích...hơn là...) — E.g: She'd rather play the piano than sing.</p>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Part 2 — Tenses                                                     */
/* ------------------------------------------------------------------ */

const tenseGroupStyles = {
  past: "bg-purple-100 text-purple-950 dark:bg-purple-950/30 dark:text-purple-100",
  present: "bg-orange-100 text-orange-950 dark:bg-orange-950/30 dark:text-orange-100",
  future: "bg-emerald-100 text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-100",
} as const

function TenseUseGrid({ secondSet = false }: { secondSet?: boolean }) {
  const columns = secondSet
    ? [
        { title: "QUÁ KHỨ ĐƠN", tone: "past" as const, signal: "while / when / at that moment / at 7 pm", uses: ["Các hành động song song", "Hành động tại thời điểm cụ thể", "Hành động đang diễn ra thì hành động khác xen vào"] },
        { title: "HIỆN TẠI ĐƠN", tone: "present" as const, signal: "every (day) / each (month) / once a week / three times a month. Always, usually, often, etc.", uses: ["Sự thật hiển nhiên", "Thói quen", "Thời gian biểu"] },
        { title: "TƯƠNG LAI ĐƠN (WILL)", tone: "future" as const, signal: "tomorrow / next (week) / soon / tonight", uses: ["Dự đoán dựa trên quan điểm, trải nghiệm cá nhân", "Sự kiện tương lai chưa có kế hoạch", "Quyết định ngay lúc nói"] },
      ]
    : [
        { title: "QUÁ KHỨ TIẾP DIỄN", tone: "past" as const, signal: "last... / ...ago / yesterday", uses: ["Hành động đã xảy ra trong quá khứ", "Chuỗi hành động đã diễn ra trong quá khứ", "Thói quen quá khứ"] },
        { title: "HIỆN TẠI TIẾP DIỄN", tone: "present" as const, signal: "now / at the moment / today / this week", uses: ["Hành động đang diễn ra tại thời điểm nói / quanh thời điểm nói", "Tình huống tạm thời", "Sự kiện tương lai", "Thói quen xấu (be + always)"] },
        { title: "BE GOING TO", tone: "future" as const, signal: "tomorrow / next (week) / soon / tonight", uses: ["Dự đoán dựa trên dấu hiệu ở hiện tại", "Sự kiện tương lai có ý định trước, kế hoạch (ít cụ thể, chắc chắn hơn HTTD)"] },
      ]

  return (
    <div className="grid overflow-hidden rounded-xl ring-1 ring-border/70 md:grid-cols-3">
      {columns.map((column) => (
        <section key={column.title} className={`space-y-3 border-b border-border/60 p-4 text-sm leading-6 md:border-b-0 md:border-r md:last:border-r-0 ${tenseGroupStyles[column.tone]}`}>
          <h5 data-toc-skip className="text-center text-base font-extrabold uppercase tracking-wide">{column.title}</h5>
          <div><strong>Dấu hiệu nhận biết:</strong> {column.signal}</div>
          <div>
            <strong>Cách dùng:</strong>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {column.uses.map((use) => <li key={use}>{use}</li>)}
            </ul>
          </div>
        </section>
      ))}
    </div>
  )
}

function TenseTimeline() {
  return (
    <div className="overflow-x-auto rounded-xl ring-1 ring-border/70">
      <div className="relative min-h-[22rem] min-w-[680px] bg-gradient-to-r from-purple-100 via-orange-100 to-emerald-100 dark:from-purple-950/30 dark:via-orange-950/30 dark:to-emerald-950/30 md:min-w-0">
        <div className="absolute bottom-0 left-1/3 top-0 w-px bg-white/70" />
        <div className="absolute bottom-0 left-2/3 top-0 w-px bg-white/70" />
        <div className="absolute left-[12%] top-4 bg-purple-400 px-9 py-2 text-lg font-extrabold text-purple-950">PAST</div>
        <div className="absolute left-1/2 top-4 -translate-x-1/2 bg-orange-200 px-9 py-2 text-lg font-extrabold text-orange-950">PRESENT</div>
        <div className="absolute right-[12%] top-4 bg-emerald-400 px-9 py-2 text-lg font-extrabold text-emerald-950">FUTURE</div>
        <div className="absolute left-[13%] top-20 text-center text-sm text-orange-700"><p>Quá khứ tiếp diễn</p><p className="mt-2 text-orange-600">I was studying</p></div>
        <div className="absolute left-1/2 top-20 -translate-x-1/2 text-center text-sm text-orange-700"><p>Hiện tại tiếp diễn</p><p className="mt-2 text-orange-600">I am studying</p></div>
        <div className="absolute right-[16%] top-20 text-3xl text-orange-700">☺</div>
        <div className="absolute left-[6%] right-[6%] top-[11.5rem] h-1 bg-black" />
        <div className="absolute left-[6%] top-[10.95rem] h-0 w-0 border-y-[9px] border-r-[12px] border-y-transparent border-r-black" />
        <div className="absolute right-[6%] top-[10.95rem] h-0 w-0 border-y-[9px] border-l-[12px] border-y-transparent border-l-black" />
        {["18%", "46%", "53%", "60%", "82%"].map((left) => <div key={left} className="absolute top-[10.35rem] -translate-x-1/2 text-5xl font-black leading-none text-red-700" style={{ left }}>×</div>)}
        <div className="absolute left-[18%] top-[12.5rem] -translate-x-1/2 text-center text-sm text-red-700"><p>I studied</p><p className="mt-2 font-semibold">Quá khứ đơn</p></div>
        <div className="absolute left-[50%] top-[12.5rem] -translate-x-1/2 text-center text-sm text-red-700"><p>I study</p><p className="mt-2 font-semibold">Hiện tại đơn</p></div>
        <div className="absolute left-[76%] top-[12.5rem] -translate-x-1/2 text-center text-sm text-red-700"><p>I will study</p><p className="mt-2 font-semibold">Tương lai đơn</p></div>
        <div className="absolute left-[89%] top-[12.5rem] -translate-x-1/2 text-center text-sm text-red-700"><p>I'm going to<br />study</p><p className="mt-2 font-semibold">Be going to</p></div>
        <div className="absolute left-[18%] top-[8.8rem] h-12 w-px bg-black" />
        <div className="absolute left-[50%] top-[8.8rem] h-12 w-px bg-black" />
        <div className="absolute left-[82%] top-[8.8rem] h-12 w-px bg-black" />
      </div>
    </div>
  )
}

function TenseFormulaGrid({ secondSet = false }: { secondSet?: boolean }) {
  const columns = secondSet
    ? [
        { title: "QUÁ KHỨ ĐƠN", formulas: ["(+) S + was/were + N/adj", "(+) S + V2 (-ed / bất quy tắc)", "(-) S + was/were + not + N/adj", "(-) S + did + not + V0", "(?) Was/Were + S + N/adj?", "(?) Did + S + V0?"] },
        { title: "HIỆN TẠI ĐƠN", formulas: ["(+) S + am/is/are + N/adj", "(+) S + V1 (s/es/V0)", "(-) S + am/is/are + not + N/adj", "(-) S + do/does + not + V0", "(?) Am/Is/Are + S + N/adj?", "(?) Do/Does + S + V0?"] },
        { title: "TƯƠNG LAI ĐƠN (WILL)", formulas: ["(+) S + will + V0", "(-) S + will + not + V0", "(?) Will + S + V0?"] },
      ]
    : [
        { title: "Quá khứ tiếp diễn", formulas: ["(+) S + was/were + V-ing", "(-) S + was/were + not + V-ing", "(?) Was/Were + S + V-ing?"] },
        { title: "Hiện tại tiếp diễn", formulas: ["(+) S + am/is/are + V-ing", "(-) S + am/is/are + not + V-ing", "(?) Am/Is/Are + S + V-ing?"] },
        { title: "Be going to", formulas: ["(+) S + am/is/are going to + V0", "(-) S + am/is/are + not + going to + V0", "(?) Am/Is/Are + S + going to + V0?"] },
      ]

  return (
    <div className="grid overflow-hidden rounded-xl ring-1 ring-border/70 text-sm md:grid-cols-3">
      {columns.map((column) => (
        <section key={column.title} className="border-b border-border/60 bg-card p-4 md:border-b-0 md:border-r md:last:border-r-0">
          <h5 data-toc-skip className="mb-3 font-extrabold uppercase">{column.title}</h5>
          <ul className="space-y-2 leading-6">
            {column.formulas.map((formula) => <li key={formula}>{formula}</li>)}
          </ul>
        </section>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export function GrammarSummary() {
  return (
    <article className="searchable mx-auto max-w-5xl space-y-12 bg-background" data-toc-root>
      {/* ---------------- Intro ---------------- */}
      <header className="rounded-2xl border border-rose-200/70 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 p-6 text-center dark:border-rose-900/40 dark:from-rose-950/30 dark:via-orange-950/20 dark:to-amber-950/20">
        <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-rose-500">Tài liệu chính</div>
        <h2 className="mt-2 text-2xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Ôn tập kiến thức khoá Pre-IELTS
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Toàn bộ ngữ pháp trọng tâm của khoá, sắp xếp lại cho dễ đọc trên web. Bấm vào ảnh minh hoạ để phóng to.
        </p>
      </header>

      {/* ============================================================ */}
      {/* PART 1 — PART OF SPEECH                                       */}
      {/* ============================================================ */}
      <Part id="grammar-pos" eyebrow="Part 1" title="Part of Speech — Loại từ">
        {/* Mindmap intro (not a numbered section) */}
        <div className="space-y-4 rounded-2xl border border-border/70 bg-card/50 p-4 shadow-sm sm:p-6">
          <p className="text-center text-lg font-extrabold italic text-amber-700 dark:text-amber-300">
            Mindmap tổng hợp các loại từ được học trong khoá
          </p>
          <Figure src="images/image-04.png" alt="Mindmap Part of Speech" size="xl" />
          <Note tone="amber" title="Mục tiêu ôn tập">
            Nhận biết được các loại từ trong câu, chức năng, vị trí và vai trò trong câu.
          </Note>
          <Eg>
            She always bakes a cake at home on Saturday, and she may make a delicious Tiramisu for you today.
          </Eg>
          <WordClassTable />
          <p className="text-sm italic text-muted-foreground">
            Now, let's take a closer look! (Cùng ôn tập lại kĩ hơn về các loại từ)
          </p>
        </div>

        {/* 1.1 Noun */}
        <Section id="g-noun" num="1.1" title="Noun — Danh từ" lesson="Lesson 7 + 8">
          <Def>words for <Hi>people, animals, places or things</Hi> (Từ chỉ người, sự vật, sự việc).</Def>
          <CompareGrid
            columns={[
              { title: "Common nouns", tone: "blue", body: <P>Boy, girl, cat, office</P> },
              { title: "Proper nouns", tone: "green", body: <P>Long, Hoa, Kitty, LangGo</P> },
            ]}
          />
          <CompareGrid
            columns={[
              {
                title: "Singular nouns",
                tone: "blue",
                body: (
                  <div className="space-y-1">
                    <div><Hi tone="blue">A + consonant</Hi> → A student</div>
                    <div><Hi tone="blue">An + vowel</Hi> → An elephant</div>
                  </div>
                ),
              },
              {
                title: "Plural nouns",
                tone: "orange",
                body: (
                  <ul className="ml-4 list-disc space-y-1">
                    <li>Most of the nouns → Students</li>
                    <li>“O, s, ss, ch, x, sh, z” → Peaches</li>
                    <li>f/fe (knife) → knives</li>
                    <li>Vowel + ‘y’ (toy) → toys</li>
                    <li>Consonant + ‘y’ → babies</li>
                    <li><Hi tone="orange">Always plural</Hi> (a pair of) → sneakers, shorts, glasses, etc.</li>
                  </ul>
                ),
              },
            ]}
          />
          <Note tone="amber" title="Irregular Nouns (danh từ bất quy tắc)">
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
              <div>1 person → 2 people</div>
              <div>1 child → 2 children</div>
              <div>1 man → 2 men</div>
              <div>1 woman → 2 women</div>
              <div>1 tooth → 2 teeth</div>
              <div>1 foot → 2 feet</div>
              <div>1 mouse → 2 mice</div>
              <div>1 sheep → 2 sheep</div>
              <div>1 deer → 2 deer</div>
            </div>
          </Note>
          <CompareGrid
            columns={[
              {
                title: "Countable nouns",
                tone: "green",
                body: (
                  <div className="space-y-2">
                    <Figure src="images/image-05.png" alt="Countable noun example" size="sm" />
                    <div>A dog → two dogs</div>
                    <div>★ Dùng được với số đếm</div>
                    <div>★ Có dạng số ít và số nhiều</div>
                  </div>
                ),
              },
              {
                title: "Uncountable nouns",
                tone: "orange",
                body: (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Figure src="images/image-07.png" alt="some rice" size="sm" caption="some rice" />
                      <Figure src="images/image-08.png" alt="some water" size="sm" caption="some water" />
                    </div>
                    <div>★ Không dùng được với số đếm</div>
                    <div>★ Luôn đi với động từ chia số ít</div>
                    <div className="pt-1 font-semibold">Đặc điểm phổ biến:</div>
                    <div>Không có hình dạng nhất định: Smoke, air, water</div>
                    <div>Quá nhỏ và không thể đếm: Rice, sugar, salt</div>
                    <div>Khái niệm trừu tượng: Beauty, fear, knowledge, hope</div>
                  </div>
                ),
              },
            ]}
          />
        </Section>

        {/* 1.2 Quantifiers */}
        <Section id="g-quantifiers" num="1.2" title="Quantifiers — Lượng từ" lesson="Lesson 8">
          <Def>
            words expressing the <Hi>quantity</Hi> of the object (Từ chỉ lượng); usually goes{" "}
            <Hi tone="blue">before a noun</Hi> (thường đứng trước danh từ).
          </Def>
          <DataTable
            center
            firstColHead
            head={["", "Countable singular", "Countable plural", "Uncountable"]}
            rows={[
              ["(+)", "A – an", "Some, a few, few, many, a lot of", "Some, a little, little, any, a lot of"],
              ["(-)", "A – an", "many, any", "much, any"],
              ["(?)", "A – an", "How many, any, a lot of / some (in questions usually expecting the answer 'yes', invitations/suggestions)", "How much, any, a lot of / some (in questions usually expecting the answer 'yes', invitations/suggestions)"],
            ]}
          />
        </Section>

        {/* 1.3 Pronouns */}
        <Section id="g-pronouns" num="1.3" title="Pronouns — Đại từ" lesson="Lesson 9">
          <Figure src="images/image-09.png" alt="Pronouns definition example" size="sm" />
          <Def>A <Hi>pronoun</Hi> is a word that takes the place of a common noun or a proper noun.</Def>

          <Sub>1.3.1 Personal pronouns (Đại từ nhân xưng)</Sub>
          <DataTable
            firstColHead
            head={["", "Subject pronouns", "Object pronouns"]}
            rows={[
              ["", "They take the place of nouns and are used as the subject of the verb in a sentence", "They take the place of nouns and are used as the object of the verb in a sentence"],
              ["First person singular", "I", "me"],
              ["Second person singular", "You", "you"],
              ["Third person singular", "He / She / It", "Him / her / it"],
              ["First person plural", "We", "us"],
              ["Second person plural", "You", "You"],
              ["Third person plural", "They", "them"],
            ]}
          />

          <Sub>1.3.2 Reflexive pronouns (Đại từ phản thân — bản thân tự làm)</Sub>
          <Eg>I made this cake <Hi>myself</Hi>.</Eg>
          <P>
            The words <Hi>myself, yourself, himself, herself, itself, ourselves, yourselves</Hi> and{" "}
            <Hi>themselves</Hi> are called reflexive pronouns.
          </P>
          <P>▪ Ví dụ tổng hợp:</P>
          <DataTable
            head={["Subject pronouns", "Object pronouns", "Possessive adjectives", "Possessive pronouns", "Reflexive pronouns"]}
            minWidth="min-w-[760px]"
            rows={[
              [<><div>Ngôi thứ nhất</div><Hi>I</Hi><div>I have a house</div></>, <><Hi>Me</Hi><div>Phuong gave me a house</div></>, <><Hi>My</Hi><div>This house is my friend's gift</div></>, <><Hi>Mine</Hi><div>This house is mine (= my house).</div></>, <><Hi>Myself</Hi><div>I don't buy this house myself.</div></>],
              ["Số nhiều: we", "Số nhiều: us", "Số nhiều: our", "Số nhiều: ours", <><div>Số nhiều:</div><Hi>Ourselves</Hi></>],
              ["Ngôi 2 số ít/nhiều: you", "Ngôi 2 số ít/nhiều: you", "Ngôi 2 số ít/nhiều: your", "Ngôi 2 số ít/nhiều: yours", <><div>Ngôi 2 số ít/nhiều:</div><Hi>yourself / yourselves</Hi></>],
              ["Ngôi 3 số ít: He, she, it", "Ngôi 3 số ít: him, her, it", "Ngôi 3 số ít: his, her, its", "Ngôi 3 số ít: his, hers, its*", <><div>Ngôi 3 số ít:</div><Hi>himself, herself, itself</Hi></>],
              ["Ngôi 3 số nhiều: they", "Ngôi 3 số nhiều: them", "Ngôi 3 số nhiều: their", "Ngôi 3 số nhiều: theirs", <><div>Ngôi 3 số nhiều:</div><Hi>themselves</Hi></>],
            ]}
          />
          <p className="text-xs italic text-muted-foreground">
            *possessive pronoun “its” không nên dùng trừ khi đi với own, e.g: It had a life of its own
          </p>

          <Sub>1.3.3 Demonstrative pronouns (Đại từ chỉ định)</Sub>
          <DataTable
            center
            firstColHead
            head={["", "NEAR", "FAR"]}
            rows={[
              ["SINGULAR", <><Figure src="images/image-10.png" alt="This" size="sm" /><div>This is an apple.</div></>, <><Figure src="images/image-11.png" alt="That" size="sm" /><div>That is an apple.</div></>],
              ["PLURAL", <><Figure src="images/image-12.png" alt="These" size="sm" /><div>These are apples.</div></>, <><Figure src="images/image-13.png" alt="Those" size="sm" /><div>Those are apples.</div></>],
            ]}
          />

          <Sub>1.3.4 Interrogative pronouns (Đại từ nghi vấn)</Sub>
          <P>
            Những từ <Hi>who, whom, whose, what</Hi> và <Hi>which</Hi> được gọi là các đại từ nghi vấn.
            Những từ này dùng để đặt câu hỏi.
          </P>
          <Figure src="images/image-14.png" alt="Interrogative pronouns examples" size="md" />
        </Section>

        {/* 1.4 Adjectives */}
        <Section id="g-adjectives" num="1.4" title="Adjectives — Tính từ" lesson="Lesson 10">
          <div className="grid items-center gap-3 sm:grid-cols-[2fr_1fr]">
            <Figure src="images/image-15.png" alt="Adjectives heading" size="sm" />
            <Figure src="images/image-16.png" alt="Adjectives illustration" size="sm" />
          </div>
          <Eg>an <Hi tone="orange">old</Hi> building</Eg>
          <Def><Hi>Tính từ</Hi> là những từ miêu tả, bổ sung thêm ý nghĩa cho danh từ.</Def>

          <Sub>★ Position</Sub>
          <DataTable
            firstColHead
            head={["Vị trí", "Ví dụ"]}
            rows={[
              ["Trước một danh từ", <>She's an <Hi>impatient</Hi> person.</>],
              ['Sau động từ "to be"', <>Today is <Hi>wonderful</Hi>.</>],
              ["Sau động từ chỉ tri giác", <>I feel <Hi>great</Hi> today.</>],
            ]}
          />

          <Sub>★ Descriptive adjectives</Sub>
          <DataTable
            center
            minWidth="min-w-[760px]"
            head={["Opinion", "Size", "Age", "Shape", "Color", "Origin", "Material", "Purpose"]}
            rows={[[
              "Nice, Ugly, Cheap, Expensive, Good, Bad, Stupid, Smart, Amazing",
              "Big, Huge, Small, Large, Narrow, Tall, Short, Medium",
              "New, Old, Second-hand, Ancient",
              "Square, Round, Triangular, Rectangular, Flat",
              "Red, Black, White, Yellow",
              "American, English, Spanish, Japanese",
              "Leather, Cotton, Silk, Wooden, Plastic, Metal, Silver, Gold, Paper",
              "Shopping, Sleeping, Touring, Racing",
            ]]}
          />
          <Eg>My mother has short black hair.</Eg>

          <Sub>★ Word formation: common prefix – suffix (tiền tố – hậu tố)</Sub>
          <Bullets items={[
            "Tiền tố là một phần thêm vào đầu từ khiến thay đổi ý nghĩa của từ đó.",
            "Hậu tố là một phần thêm vào cuối từ khiến thay đổi ý nghĩa của từ đó.",
          ]} />
          <DataTable
            head={["Prefix", "Example", "Suffix", "Example"]}
            rows={[
              [<Hi>bi- (two)</Hi>, "bilingual", <Hi>-able, -ible (able to be done, capable of)</Hi>, "Readable, knowledgeable"],
              [<Hi>co- (together)</Hi>, "codependent", <Hi>-al (relating to)</Hi>, "National, seasonal"],
              [<Hi>dis- (not/reverses the meaning)</Hi>, "disloyal", <Hi>-ful (having the characteristic of)</Hi>, "joyful, wonderful"],
              [<Hi>non- (not/reverses the meaning)</Hi>, "non-academic", <Hi>-ian (relating to nationalities)</Hi>, "Australian, Indian"],
              [<Hi>im-, in-, ir-, il- (not/reverses the meaning)</Hi>, "Impossible, illegal", <Hi>-ive (something that is)</Hi>, "Attractive, productive"],
              [<Hi>un- (not/reverses the meaning)</Hi>, "unfriendly", <Hi>-less (without)</Hi>, "Homeless, Useless"],
              [<Hi>over- (too much)</Hi>, "overtired", <Hi>-like (resembling)</Hi>, "Childlike"],
              [<Hi>pre- (before)</Hi>, "precooked", <Hi>-ous (having the characteristic)</Hi>, "Delicious, famous"],
            ]}
          />

          <Sub>★ NOTE: Adjectives ending in '-ed' and '-ing'</Sub>
          <CompareGrid
            columns={[
              {
                title: "-ed adjectives",
                tone: "blue",
                body: (
                  <div className="space-y-1">
                    <div>Miêu tả cảm xúc — thể hiện người ta cảm thấy thế nào.</div>
                    <div><span className="italic">E.g:</span> She is <Hi>interested</Hi> in English.</div>
                  </div>
                ),
              },
              {
                title: "-ing adjectives",
                tone: "orange",
                body: (
                  <div className="space-y-1">
                    <div>Miêu tả tính chất sự vật/sự việc/người — thứ gây ra cảm xúc đó.</div>
                    <div><span className="italic">E.g:</span> She thinks English is <Hi>interesting</Hi>.</div>
                    <div>He is so <Hi>boring</Hi> (~he makes me feel bored)</div>
                    <div>The <Hi>shocking</Hi> news made me feel <Hi>shocked</Hi>.</div>
                  </div>
                ),
              },
            ]}
          />
        </Section>

        {/* 1.5 Determiners */}
        <Section id="g-determiners" num="1.5" title="Determiners — Từ hạn định" lesson="Lesson 11">
          <Def>
            Một từ <Hi tone="blue">đứng trước một danh từ hoặc cụm danh từ</Hi> để xác định một người,
            sự vật, sự việc cụ thể đang được đề cập đến.
          </Def>
          <P>
            E.g: In the phrases <Mark>my first boyfriend</Mark> and <Mark>that strange woman</Mark>, the words
            "my" and "that" are determiners.
          </P>

          <Sub>1.5.1 Articles (Mạo từ)</Sub>
          <CompareGrid
            columns={[
              {
                title: "A / An",
                tone: "orange",
                body: (
                  <div className="space-y-2">
                    <div>Các từ <Hi tone="orange">"a"</Hi> và <Hi tone="orange">"an"</Hi> được gọi là mạo từ không xác định. A / an + Singular Nouns.</div>
                    <div><span className="italic">E.g:</span> She eats <Hi tone="orange">an apple</Hi> a day.</div>
                    <div>♥ Objects that are not specific / one of several similar things → I need <Hi tone="orange">a</Hi> phone.</div>
                    <div>♥ First time we introduce an object → I saw <Hi tone="orange">a</Hi> movie last night.</div>
                    <div>♥ As synonym for the number 'one' → They bought <Hi tone="orange">a</Hi> computer.</div>
                  </div>
                ),
              },
              {
                title: "The",
                tone: "blue",
                body: (
                  <div className="space-y-2">
                    <div>Từ <Hi tone="blue">"the"</Hi> là mạo từ xác định. The + Singular/Plural/Uncountable Nouns.</div>
                    <div><span className="italic">E.g:</span> The apples which she eats every day are from New Zealand.</div>
                    <div>♥ Specific objects both speaker & listener know → Can you give me <Hi tone="blue">the</Hi> books on the table?</div>
                    <div>♥ When we mention the object again → <Hi tone="blue">The</Hi> movie is based on a real-life incident.</div>
                    <div>♥ Countries/regions with plural names & bodies of water → <Hi tone="blue">The</Hi> Netherlands.</div>
                    <div>♥ Before certain adjectives (plural meaning) → <Hi tone="blue">The</Hi> old need our help.</div>
                  </div>
                ),
              },
            ]}
          />
          <Note tone="blue" title="We don't use an article:">
            <ul className="ml-4 list-disc space-y-1">
              <li>before plural countable & uncountable nouns meaning 'in general' → I like <Hi>cats</Hi>. <Hi>Doctors</Hi> have to study for a long time.</li>
              <li>before abstract nouns → What is the difference between <Hi>jealousy</Hi> and <Hi>envy</Hi>?</li>
              <li>before meals, languages, sports, and many expressions of place & time → I never drink before <Hi>breakfast</Hi>. I'll see you <Hi>next week</Hi>. He stayed <Hi>at home</Hi> because he was ill. Do you play <Hi>tennis</Hi>?</li>
            </ul>
          </Note>

          <Sub>1.5.2 Possessive determiners (Từ hạn định sở hữu)</Sub>
          <P>Từ hạn định sở hữu / Tính từ sở hữu: <Hi>my, your, his, her, its, our, their</Hi>.</P>
          <P>Sử dụng <strong>trước danh từ</strong> thể hiện cái gì thuộc về ai/cái gì.</P>

          <Sub>1.5.3 Demonstrative determiners (Từ hạn định chỉ định)</Sub>
          <DataTable
            center
            firstColHead
            head={["", "NEAR", "FAR"]}
            rows={[
              ["SINGULAR", <><Figure src="images/image-17.png" alt="This apple" size="sm" /><div><Hi>This</Hi> apple is red.</div></>, <><Figure src="images/image-18.png" alt="That apple" size="sm" /><div><Hi>That</Hi> apple is small.</div></>],
              ["PLURAL", <><Figure src="images/image-19.png" alt="These apples" size="sm" /><div><Hi>These</Hi> apples are cheap.</div></>, <><Figure src="images/image-20.png" alt="Those apples" size="sm" /><div><Hi>Those</Hi> apples are expensive.</div></>],
            ]}
          />
        </Section>

        {/* 1.6 Prepositions */}
        <Section id="g-prepositions" num="1.6" title="Prepositions — Giới từ" lesson="Lesson 12">
          <div className="grid items-center gap-3 sm:grid-cols-[1.4fr_1fr]">
            <Figure src="images/image-21.png" alt="Prepositions heading" size="sm" />
            <Figure src="images/image-22.png" alt="Prepositions illustration" size="sm" />
          </div>
          <Eg>There's a big balloon <Mark>in</Mark> the sky.</Eg>
          <Def>
            <Hi>Giới từ</Hi> là những từ dùng để diễn tả mối quan hệ của cụm từ đứng phía sau nó với các
            thành phần khác trong câu. Giới từ thường chỉ <strong>vị trí, địa điểm</strong> và <strong>thời gian</strong>.
          </Def>
          <P><strong>Vị trí:</strong> Thường được theo sau bởi danh từ hoặc đại từ (Prep + N/Pro).</P>

          <Sub><Mark>★ Common prepositions – position</Mark> (giới từ phổ biến – chỉ vị trí)</Sub>
          <Figure src="images/image-23.png" alt="Common prepositions of position" size="lg" />
          <P><span className="font-semibold italic">*Một số từ khác:</span></P>
          <Bullets items={["In the middle of (sth)", "In the corner (of sth)", "On the left / right of ...", "Across from / opposite...", "Against the wall"]} />

          <Sub>★ IN, ON, AT (giới từ phổ biến, chỉ địa điểm, thời gian)</Sub>
          <InOnAtChart />
          <Note tone="rose" title="*Note">
            Không sử dụng giới từ với <em>tomorrow, yesterday, tomorrow morning, yesterday evening</em>.
            <div className="mt-1"><span className="italic">E.g:</span> We're flying to Washington tomorrow afternoon.</div>
          </Note>
        </Section>

        {/* 1.7 Verbs */}
        <Section id="g-verbs" num="1.7" title="Verbs — Động từ" lesson="Lesson 13">
          <div className="grid max-w-md gap-3 sm:grid-cols-2">
            <Figure src="images/image-25.png" alt="I can read" size="sm" caption={<>I can <Hi tone="orange">read</Hi></>} />
            <Figure src="images/image-26.png" alt="I can sing" size="sm" caption={<>I can <Hi tone="orange">sing</Hi></>} />
          </div>
          <Def>
            <Hi>Động từ</Hi> phần lớn là các từ chỉ hành động (action words), cho biết người, con vật,
            đồ vật đang có hoạt động gì.
          </Def>
          <Note tone="amber" title="*Note">
            <div>Các động từ phổ biến: Have, Go, Do, Make, Come, Take, Bring, Get</div>
            <div>Có 12 thì động từ, biến đổi theo Quá khứ (past), Hiện tại (Present), Tương lai (Future)</div>
          </Note>
        </Section>

        {/* 1.8 Adverbs */}
        <Section id="g-adverbs" num="1.8" title="Adverbs — Trạng từ" lesson="Lesson 17">
          <div className="grid gap-3 sm:grid-cols-3">
            <Figure src="images/image-27.png" alt="Adverb example 1" size="sm" />
            <Figure src="images/image-28.png" alt="Adverb example 2" size="sm" />
            <Figure src="images/image-29.png" alt="Adverb example 3" size="sm" />
          </div>
          <Def><Hi>Trạng từ</Hi> thường cung cấp thêm thông tin cho động từ, tính từ hoặc trạng từ.</Def>

          <Sub>Các loại trạng từ</Sub>
          <Figure src="images/image-30.png" alt="Types of adverbs" size="lg" />
          <p className="text-sm italic text-muted-foreground">Ngoài 5 loại phổ biến, còn nhiều loại trạng từ khác</p>
          <Figure src="images/image-31.png" alt="Adverb formation & examples" size="xl" />

          <Sub>Note: Vị trí trạng từ</Sub>
          <Bullets items={[
            <><Hi tone="blue">Front position</Hi>: đứng <strong>đầu</strong> câu/vế câu</>,
            <><Hi tone="orange">Mid Position</Hi>: đứng <strong>giữa</strong> chủ ngữ và động từ chính (giữa trợ động từ/động từ khuyết thiếu và động từ chính; hoặc sau động từ to be)</>,
            <><Hi tone="pink">End Position</Hi>: đứng <strong>cuối</strong> câu/vế câu</>,
          ]} />
          <p className="text-sm italic text-muted-foreground">Common (phổ biến) ⭐⭐⭐; Not common (không phổ biến) ⭐</p>
          <AdverbPositionCards />
        </Section>

        {/* 1.9 Conjunction */}
        <Section id="g-conjunction" num="1.9" title="Conjunction — Liên từ" lesson="Lesson 18">
          <Def><Hi>Liên từ</Hi> là từ dùng để kết nối hai từ, cụm từ, vế câu và thể hiện mối quan hệ giữa chúng.</Def>
          <Eg>
            He is nice <strong>and</strong> tall. In his free time, he can play soccer with friends <strong>or</strong> read
            books at home. He likes to learn new things, <strong>so</strong> he takes some online courses.
          </Eg>
          <Sub>Các loại liên từ</Sub>
          <Bullets items={[
            "Liên từ kết hợp (coordinating conjunctions)",
            "Liên từ tương quan (correlative conjunctions)",
            "Liên từ phụ thuộc (subordinating conjunctions) (*học sau)",
          ]} />
          <ConjunctionSummary />
        </Section>
      </Part>

      {/* ============================================================ */}
      {/* PART 2 — TENSES                                               */}
      {/* ============================================================ */}
      <Part id="grammar-tenses" eyebrow="Part 2" title="Tenses — Các thì">
        <div className="space-y-6 rounded-2xl border border-border/70 bg-card/50 p-4 shadow-sm sm:p-6">
          <P>6 thì, cấu trúc (hiện tại đơn/tiếp diễn, quá khứ đơn/tiếp diễn, tương lai đơn, be going to).</P>
          <TenseUseGrid />
          <TenseTimeline />
          <TenseUseGrid secondSet />
        </div>

        <Section id="g-tense-formulas" num="Công thức" title="Công thức các thì">
          <TenseFormulaGrid />
          <TenseTimeline />
          <TenseFormulaGrid secondSet />
        </Section>
      </Part>

      {/* ============================================================ */}
      {/* PART 3 — SENTENCES                                            */}
      {/* ============================================================ */}
      <Part id="grammar-sentences" eyebrow="Part 3" title="Sentences — Câu">
        <div className="space-y-3 rounded-2xl border border-border/70 bg-card/50 p-4 shadow-sm sm:p-6">
          <Def>
            <Hi tone="orange">Câu</Hi> là một đơn vị ngữ pháp gồm một hay nhiều từ có liên kết ngữ pháp với
            nhau, có ý nghĩa.
          </Def>
          <P>Một câu cần viết hoa chữ cái đầu câu và kết câu bằng dấu chấm.</P>
        </div>

        <Section id="g-sentence-parts" num="3.1" title="Thành phần câu">
          <div className="grid items-center gap-4 sm:grid-cols-[1fr_1.6fr]">
            <Figure src="images/image-38.png" alt="Sentence components" size="md" />
            <Figure src="images/image-39.png" alt="Sentence structure formula" size="md" />
          </div>
          <Sub>⭐ Direct & Indirect objects</Sub>
          <Figure src="images/image-40.png" alt="Direct and Indirect objects" size="lg" />
          <P>
            Vị trí: tân ngữ gián tiếp thường đứng trước tân ngữ trực tiếp hoặc đứng sau giới từ (VD:{" "}
            <Hi tone="blue">Nam</Hi> gave <Hi tone="orange">a present</Hi> <span className="underline">to</span>{" "}
            <Hi tone="pink">Dung</Hi>).
          </P>
        </Section>

        <Section id="g-sentence-types" num="3.2" title="Các kiểu câu">
          <Figure src="images/image-41.png" alt="Sentence types" size="xl" />
        </Section>
      </Part>
    </article>
  )
}
