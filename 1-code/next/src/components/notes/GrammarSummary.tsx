import { useEffect, useState, type ReactNode } from "react"

const APP_BASE = (import.meta.env.BASE_URL || "/").replace(/\/?$/, "/")

function finalAsset(path: string) {
  return `${APP_BASE}${`final/google-doc-pre-course/${path}`.split("/").map(encodeURIComponent).join("/")}`
}

type Cell = ReactNode

type ImageVariant = "diagram" | "document" | "illustration" | "inline"

const imageClass: Record<ImageVariant, string> = {
  diagram: "max-h-[620px] w-full object-contain p-3",
  document: "max-h-[760px] w-full object-contain p-1 sm:p-2",
  illustration: "h-40 w-full object-contain p-3 sm:h-48",
  inline: "max-h-40 w-full object-contain p-3",
}

function ImageZoom({
  src,
  alt,
  className = "",
  variant = "diagram",
}: {
  src: string
  alt: string
  className?: string
  variant?: ImageVariant
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", close)
    return () => window.removeEventListener("keydown", close)
  }, [open])

  return (
    <>
      <button type="button" className="block w-full cursor-zoom-in" onClick={() => setOpen(true)}>
        <img
          src={finalAsset(src)}
          alt={alt}
          loading="lazy"
          className={`mx-auto rounded-2xl bg-white shadow-sm ring-1 ring-border/70 transition hover:shadow-md ${imageClass[variant]} ${className}`}
        />
      </button>
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
            className="max-h-[88vh] max-w-[96vw] rounded-lg bg-white object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}

function Part({ label, title, children, documentStyle = false }: { label: string; title: string; children: ReactNode; documentStyle?: boolean }) {
  if (documentStyle) {
    return (
      <section className="space-y-8 rounded-[1.75rem] border border-border/70 bg-card/40 p-4 shadow-sm sm:p-6">
        <div className="rounded-2xl bg-primary/10 px-4 py-2 text-3xl font-extrabold uppercase tracking-tight text-primary/80">
          Grammar
        </div>
        <div>
          <h3 className="text-2xl font-extrabold uppercase tracking-tight text-slate-950 dark:text-white sm:text-3xl">
            <span className="text-red-600">{label}: </span>{title}
          </h3>
        </div>
        {children}
      </section>
    )
  }

  return (
    <section className="space-y-7 rounded-[1.75rem] border border-border/70 bg-card/40 p-4 shadow-sm sm:p-6">
      <div className="flex items-end justify-between gap-4 rounded-2xl bg-muted/35 px-4 py-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-primary">{label}</div>
          <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white">{title}</h3>
        </div>
        <div className="hidden h-px flex-1 bg-gradient-to-r from-border to-transparent sm:block" />
      </div>
      {children}
    </section>
  )
}

function Topic({
  title,
  lesson,
  children,
  skipToc = false,
  hideTitle = false,
}: {
  title: string
  lesson?: string
  children: ReactNode
  skipToc?: boolean
  hideTitle?: boolean
}) {
  return (
    <section className="space-y-4 border-t border-dashed border-border/70 py-7 first:border-t-0 first:pt-0">
      {!hideTitle && (
        <div className="max-w-4xl border-l-4 border-primary/60 pl-4">
          {lesson && <div className="text-[11px] font-bold uppercase tracking-widest text-primary/80">{lesson}</div>}
          <h4 className="text-xl font-extrabold tracking-tight text-foreground" data-toc-skip={skipToc || undefined}>{title}</h4>
        </div>
      )}
      {children}
    </section>
  )
}

function Subsection({ children }: { children: ReactNode }) {
  return (
    <h5 className="rounded-xl bg-muted/45 px-3 py-2 text-base font-extrabold text-foreground ring-1 ring-border/60">
      {children}
    </h5>
  )
}

function KeyTerm({ children, tone = "orange" }: { children: ReactNode; tone?: "orange" | "red" | "blue" | "green" | "pink" }) {
  const tones = {
    orange: "text-orange-600 dark:text-orange-300",
    red: "text-red-600 dark:text-red-300",
    blue: "text-blue-700 dark:text-blue-300",
    green: "text-green-700 dark:text-green-300",
    pink: "text-pink-700 dark:text-pink-300",
  }
  return <span className={`font-semibold ${tones[tone]}`}>{children}</span>
}

function Table({ head, rows }: { head: Cell[]; rows: Cell[][] }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/70 [&_img]:max-w-full">
        <table className="w-full table-fixed border-separate border-spacing-0 text-[10px] leading-4 sm:text-xs md:min-w-[680px] md:text-sm md:leading-6">
          <thead className="bg-muted/70 text-foreground">
            <tr>{head.map((cell, index) => <th key={index} className="break-words border-b border-border/70 px-1.5 py-2 text-left align-top font-bold first:rounded-tl-2xl last:rounded-tr-2xl sm:px-2 md:px-4 md:py-3">{cell}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="odd:bg-background even:bg-muted/25">
                {row.map((cell, cellIndex) => <td key={cellIndex} className="break-words border-b border-border/50 px-1.5 py-2 align-top sm:px-2 md:px-4 md:py-3">{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  )
}

function FormulaList({ items }: { items: string[] }) {
  return (
    <ul className="ml-5 list-disc space-y-1 text-sm leading-6">
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  )
}

function CenterTable({ head, rows }: { head: Cell[]; rows: Cell[][] }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-orange-200/80 dark:ring-orange-900/60 [&_img]:max-w-full">
        <table className="w-full table-fixed border-separate border-spacing-0 text-[10px] leading-4 sm:text-xs md:min-w-[680px] md:text-sm md:leading-6">
          <thead className="bg-orange-100/80 text-foreground dark:bg-orange-950/30">
            <tr>{head.map((cell, index) => <th key={index} className="break-words border-b border-orange-200/80 px-1.5 py-2 text-center align-middle font-bold first:rounded-tl-2xl last:rounded-tr-2xl sm:px-2 md:px-4 md:py-3 dark:border-orange-900/60">{cell}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="odd:bg-background even:bg-orange-50/30 dark:even:bg-orange-950/10">
                {row.map((cell, cellIndex) => <td key={cellIndex} className="break-words border-b border-orange-100/80 px-1.5 py-2 text-center align-middle sm:px-2 md:px-4 md:py-3 dark:border-orange-900/40">{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  )
}

function ExtraTheUsage() {
  return (
    <details className="mt-3 rounded-2xl bg-blue-50 p-3 text-sm leading-6 text-blue-950 dark:bg-blue-950/20 dark:text-blue-100">
      <summary className="cursor-pointer font-semibold text-blue-700 hover:text-blue-900 dark:text-blue-300">
        ♥ Những cách dùng khác: HO Grammar_The.docx
      </summary>
      <div className="mt-3">
        <CenterTable
          head={["Cách dùng", "Ví dụ"]}
          rows={[
            ["Khi viết về hay nhóm viết thể là duy nhất hoặc được xem là duy nhất", "Ví dụ: The sun (mặt trời), the world (thế giới), the earth (trái đất)"],
            ["Trước một danh từ nếu danh từ này vừa được đề cập trước đó", "I see a dog. The dog is chasing a cat. The cat is chasing a mouse. Câu chuyện có 1 con mèo. Con mèo đó đang đuổi theo 1 con chuột."],
            ["Trước một danh từ nếu danh từ này được xác bằng 1 cụm từ hoặc 1 mệnh đề", "The teacher that I met yesterday is my sister in law. (Cô giáo tôi gặp hôm qua là chị dâu tôi.)"],
            ["Đặt trước một danh từ chỉ một đồ vật riêng biệt mà người nói và người nghe đều hiểu", "Please pass the jar of honey. (Làm ơn hãy đưa cho tôi lọ mật ong với.) My father is cooking in the kitchen room. (Bố tôi đang nấu ăn trong nhà bếp.)"],
            ["Trước so sánh nhất (đứng trước first, second, only...) khi các từ này được dùng như tính từ hoặc đại từ", "You are the best in my life. (Trong đời anh, em là nhất!) He is the tallest person in the world. (Anh ấy là người cao nhất thế giới.)"],
            ["The + danh từ số ít: tượng trưng cho một nhóm thú vật hoặc đồ vật", "The whale is in danger of becoming extinct. (Cá voi đang trong nguy cơ tuyệt chủng.)"],
            ["Đặt “the” trước một tính từ để chỉ một nhóm người nhất định", "The old (Người già), the poor (người nghèo), the rich (người giàu)"],
            ["The được dùng trước những danh từ riêng chỉ biển, sông, quần đảo, dãy núi, tên gọi số nhiều của các nước, sa mạc, miền", "The Pacific (Thái Bình Dương), The United States (Hợp chủng quốc Hoa Kỳ), the Netherlands"],
            ["The + of + danh từ", "The North of Vietnam (Bắc Việt Nam), The West of Germany (Tây Đức)"],
            ["The + họ (ở dạng số nhiều) có nghĩa là Gia đình", "The Smiths (Gia đình Smith), The Browns (Gia đình Brown)"],
            ["Dùng “the” nếu ta nhắc đến một địa điểm nào đó nhưng không được sử dụng với đúng chức năng", "They went to the school to see their children. (Họ đến trường để thăm con cái họ.)"],
          ]}
        />
      </div>
    </details>
  )
}

const fanboysRows = [
  ["F", "For", "vì", "I feel low in fever, for I was very tired."],
  ["A", "And", "và", "I like football, and I like basketball."],
  ["N", "Nor", "cũng không", "I don't like soccer nor chess."],
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
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
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
          <p>
            Những cặp từ dùng để liên kết hai từ, cụm từ tương đương nhau về chức năng ngữ pháp trong câu; dùng để nhấn mạnh, hướng sự chú ý của người đọc đến hai thành phần được liên kết.
          </p>
          <p><span className="font-bold text-orange-700 dark:text-orange-300">Both...and...</span> (vừa...vừa/cả...và...) — E.g: This house is both large and warm.</p>
          <p><span className="font-bold text-orange-700 dark:text-orange-300">Either...or...</span> (hoặc...hoặc...) — E.g: You should put it either on the left or on the right.</p>
          <p><span className="font-bold text-orange-700 dark:text-orange-300">Neither...nor...</span> (cả...cũng không...) — E.g: He is neither rich nor famous.</p>
          <p><span className="font-bold text-orange-700 dark:text-orange-300">Not only...but also...</span> (không những...mà còn) — E.g: My father is not only friendly but also kind.</p>
          <p><span className="font-bold text-orange-700 dark:text-orange-300">would rather...than...</span> (muốn/thích...hơn là...) — E.g: She'd rather play the piano than sing.</p>
        </div>
      </div>
    </div>
  )
}

const adverbPositions = [
  {
    title: "FRONT POSITION",
    color: "blue",
    items: [
      { label: "Evaluative", vi: "Trạng từ đánh giá", stars: "★★★", examples: ["Luckily, nobody got hurt.", "Unfortunately, we arrived late."] },
      { label: "Place", vi: "Trạng từ nơi chốn", stars: "★", examples: ["<đôi lúc trong văn viết>", "Here she sat"] },
      { label: "Time", vi: "Trạng từ thời gian", stars: "★", examples: ["<nhấn mạnh trạng từ>", "Today, I'm going to clean the house."] },
      { label: "Frequency", vi: "Trạng từ tần suất", stars: "★", examples: ["Sometimes, she wore a pink hat"] },
    ],
  },
  {
    title: "MID POSITION",
    color: "orange",
    items: [
      { label: "Frequency", vi: "Trạng từ tần suất", stars: "★★★", examples: ["I usually get up late on weekends"] },
      { label: "Manner", vi: "Trạng từ cách thức", stars: "★", examples: ["She quickly ate her dinner and ran out."] },
      { label: "Degree", vi: "Trạng từ mức độ", stars: "★★★", examples: ["<really, very, quite, too>", "I really like those pink flowers."] },
      { label: "Time", vi: "Trạng từ thời gian", stars: "★★★", examples: ["<just, already>", "I've already seen this film."] },
    ],
  },
  {
    title: "END POSITION",
    color: "pink",
    items: [
      { label: "Manner", vi: "Trạng từ cách thức", stars: "★★★", examples: ["She can speak English fluently"] },
      { label: "Place", vi: "Trạng từ nơi chốn", stars: "★★★", examples: ["I can't find him anywhere"] },
      { label: "Time", vi: "Trạng từ thời gian", stars: "★★★", examples: ["I'm flying to London tomorrow"] },
      { label: "Degree", vi: "Trạng từ mức độ", stars: "★★★", examples: ["<a lot, a bit>", "We go to Da Nang a lot"] },
    ],
  },
]

const adverbPositionStyles = {
  blue: {
    title: "text-blue-800 dark:text-blue-200",
    border: "border-blue-300 dark:border-blue-800",
    card: "bg-blue-50/80 dark:bg-blue-950/20",
    bar: "bg-blue-700 text-white",
    text: "text-blue-900 dark:text-blue-100",
  },
  orange: {
    title: "text-orange-700 dark:text-orange-200",
    border: "border-orange-300 dark:border-orange-800",
    card: "bg-orange-50/80 dark:bg-orange-950/20",
    bar: "bg-orange-500 text-white",
    text: "text-orange-900 dark:text-orange-100",
  },
  pink: {
    title: "text-pink-800 dark:text-pink-200",
    border: "border-pink-300 dark:border-pink-800",
    card: "bg-pink-50/80 dark:bg-pink-950/20",
    bar: "bg-pink-700 text-white",
    text: "text-pink-900 dark:text-pink-100",
  },
} as const

function AdverbPositionCards() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {adverbPositions.map((column) => {
        const style = adverbPositionStyles[column.color as keyof typeof adverbPositionStyles]
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

function InOnAtChart() {
  const leader = <span className="mx-1 hidden flex-1 border-b border-dotted border-slate-500/70 translate-y-[-0.25em] sm:block" aria-hidden />

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white p-4 shadow-sm dark:bg-card [&_p.flex]:flex-wrap [&_p.flex]:gap-x-2 [&_p.flex>span]:break-words">
      <div className="mx-auto grid max-w-[1040px] grid-cols-[minmax(0,0.74fr)_minmax(128px,1.18fr)_minmax(0,0.74fr)] items-start gap-1 sm:gap-3 lg:grid-cols-[270px_minmax(0,1.35fr)_270px]">
        <div className="space-y-3 text-[9px] leading-3 sm:space-y-4 sm:text-xs sm:leading-4 lg:space-y-5 lg:text-sm lg:leading-5">
          <h6 className="font-serif text-2xl font-extrabold text-slate-700 sm:text-4xl lg:text-5xl dark:text-slate-200">Time</h6>
          <div className="space-y-1">
            <p><span className="font-bold text-red-400">Long periods of time</span><br />the 9th century, the 90s</p>
            <p className="flex items-baseline"><span className="font-bold text-red-400">Years</span>{leader}<span>2023</span></p>
            <p className="flex items-baseline"><span className="font-bold text-red-400">Seasons</span>{leader}<span>Winter</span></p>
            <p className="flex items-baseline"><span className="font-bold text-red-400">Months</span>{leader}<span>August</span></p>
            <p className="flex items-baseline"><span className="font-bold text-red-400">Parts of the day</span>{leader}<span>Morning</span></p>
          </div>
          <div className="space-y-1">
            <p className="flex items-baseline"><span className="font-bold text-green-600">Dates</span>{leader}<span>25th October 1987</span></p>
            <p className="flex items-baseline"><span className="font-bold text-green-600">Days</span>{leader}<span>Friday</span></p>
            <p className="flex items-baseline"><span className="font-bold text-green-600">Special Dates</span>{leader}<span>My birthday</span></p>
            <p className="flex items-baseline"><span className="font-bold text-green-600">Day + Part of day</span>{leader}<span>Monday morning</span></p>
            <p className="flex items-baseline"><span className="font-bold text-green-600">Holidays with 'Day'</span>{leader}<span>Easter Day</span></p>
          </div>
          <div className="space-y-1">
            <p className="flex items-baseline"><span className="font-bold text-orange-500">Special celebrations</span>{leader}<span>New Year</span></p>
            <p className="flex items-baseline"><span className="font-bold text-orange-500">Particular points of the week</span>{leader}<span>weekend</span></p>
            <p className="flex items-baseline"><span className="font-bold text-orange-500">Particular points in the day</span>{leader}<span>midday</span></p>
            <p className="flex items-baseline"><span className="font-bold text-orange-500">Particular points of the clock</span>{leader}<span>8.15 am</span></p>
          </div>
        </div>

        <div className="pt-5 text-center text-white sm:py-10 lg:pt-20">
          <div className="mx-auto max-w-[640px] shadow-sm">
            <div className="mx-auto flex min-h-14 w-full flex-col items-center justify-center bg-[#d63a24] px-2 py-2 [clip-path:polygon(0_0,100%_0,84%_100%,16%_100%)] sm:min-h-24 sm:px-6 sm:py-4 lg:min-h-32 lg:px-10 lg:py-5">
              <div className="text-[9px] font-bold leading-tight sm:text-sm lg:text-lg">General (Tổng quan, to lớn)</div>
              <div className="font-serif text-4xl font-extrabold leading-none sm:text-5xl lg:text-7xl">IN</div>
            </div>
            <div className="mx-auto -mt-px flex min-h-14 w-[68%] flex-col items-center justify-center bg-[#69aa50] px-1.5 py-2 [clip-path:polygon(0_0,100%_0,82%_100%,18%_100%)] sm:min-h-24 sm:px-5 sm:py-4 lg:min-h-32 lg:px-8 lg:py-5">
              <div className="text-[8px] font-bold leading-tight sm:text-xs lg:text-base">More specific (Cụ thể hơn/nhỏ hơn)</div>
              <div className="font-serif text-3xl font-extrabold leading-none sm:text-5xl lg:text-6xl">ON</div>
            </div>
            <div className="mx-auto -mt-px flex aspect-[1/1.05] w-[44%] flex-col items-center justify-start bg-[#ee9a2e] px-1 pt-2 [clip-path:polygon(0_0,100%_0,66%_72%,34%_72%)] sm:px-3 sm:pt-4 lg:px-5 lg:pt-5">
              <div className="text-[7px] font-bold leading-tight sm:text-xs lg:text-[15px] lg:leading-5">Very specific (rất nhỏ, cụ thể)</div>
              <div className="mt-1 font-serif text-3xl font-extrabold leading-none sm:text-5xl lg:mt-2 lg:text-6xl">AT</div>
            </div>
          </div>
        </div>

        <div className="space-y-3 text-left text-[9px] leading-3 sm:space-y-4 sm:text-xs sm:leading-4 lg:space-y-5 lg:text-right lg:text-sm lg:leading-5">
          <h6 className="font-serif text-2xl font-extrabold text-slate-700 sm:text-4xl lg:text-5xl dark:text-slate-200">Place</h6>
          <div className="space-y-1">
            <p className="flex items-baseline"><span>Desert</span>{leader}<span className="font-bold text-red-400">Area / regions</span></p>
            <p className="flex items-baseline"><span>Vietnam</span>{leader}<span className="font-bold text-red-400">Countries</span></p>
            <p className="flex items-baseline"><span>Hanoi</span>{leader}<span className="font-bold text-red-400">Town / cities</span></p>
            <p className="flex items-baseline"><span>Bai Chay</span>{leader}<span className="font-bold text-red-400">Neighborhood</span></p>
            <p className="flex items-baseline"><span>Hospital</span>{leader}<span className="font-bold text-red-400">Inside a building</span></p>
            <p className="flex items-baseline"><span>Car, kitchen</span>{leader}<span className="font-bold text-red-400">Enclosed space</span></p>
          </div>
          <div className="space-y-1">
            <p className="flex items-baseline"><span>Phu Quoc island</span>{leader}<span className="font-bold text-green-600">Island</span></p>
            <p>Tran Phu Street, Avenue</p>
            <p className="flex items-baseline"><span>Bus, train</span>{leader}<span className="font-bold text-green-600">Public transport</span></p>
            <p className="flex items-baseline"><span>The 15th floor</span>{leader}<span className="font-bold text-green-600">A floor in a building</span></p>
            <p className="flex items-baseline"><span>Table, wall</span>{leader}<span className="font-bold text-green-600">On any surface</span></p>
            <p className="flex items-baseline"><span>Page 99</span>{leader}<span className="font-bold text-green-600">Pages</span></p>
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

const tenseGroupStyles = {
  past: "bg-purple-100 text-purple-950 dark:bg-purple-950/30 dark:text-purple-100",
  present: "bg-orange-100 text-orange-950 dark:bg-orange-950/30 dark:text-orange-100",
  future: "bg-green-100 text-green-950 dark:bg-green-950/30 dark:text-green-100",
} as const

function TenseUseGrid({ secondSet = false }: { secondSet?: boolean }) {
  const columns = secondSet
    ? [
        { title: "QUÁ KHỨ ĐƠN", tone: "past" as const, signal: "while / when / at that moment / at 7 pm", uses: ["Các hành động song song", "Hành động tại thời điểm cụ thể", "Hành động đang diễn ra thì hành động khác xen vào"] },
        { title: "HIỆN TẠI ĐƠN", tone: "present" as const, signal: "every (day) / each (month) / once a week / always, usually, often", uses: ["Sự thật hiển nhiên", "Thói quen", "Thời gian biểu"] },
        { title: "TƯƠNG LAI ĐƠN (WILL)", tone: "future" as const, signal: "tomorrow / next (week) / soon / tonight", uses: ["Dự đoán dựa trên quan điểm, trải nghiệm cá nhân", "Sự kiện tương lai chưa có kế hoạch", "Quyết định ngay lúc nói"] },
      ]
    : [
        { title: "QUÁ KHỨ TIẾP DIỄN", tone: "past" as const, signal: "last... / ...ago / yesterday", uses: ["Hành động đã xảy ra trong quá khứ", "Chuỗi hành động đã diễn ra trong quá khứ", "Thói quen quá khứ"] },
        { title: "HIỆN TẠI TIẾP DIỄN", tone: "present" as const, signal: "now / at the moment / today / this week", uses: ["Hành động đang diễn ra tại thời điểm nói / quanh thời điểm nói", "Tình huống tạm thời", "Sự kiện tương lai", "Thói quen xấu (be + always)"] },
        { title: "BE GOING TO", tone: "future" as const, signal: "tomorrow / next (week) / soon / tonight", uses: ["Dự đoán dựa trên dấu hiệu ở hiện tại", "Sự kiện tương lai có ý định trước, kế hoạch (ít cụ thể, chắc chắn hơn HTTD)"] },
      ]

  return (
    <div className="grid overflow-hidden rounded-2xl border border-border bg-card shadow-sm md:grid-cols-3">
      {columns.map((column) => (
        <section key={column.title} className={`space-y-3 border-b border-border/60 p-4 text-sm leading-6 md:border-b-0 md:border-r md:last:border-r-0 ${tenseGroupStyles[column.tone]}`}>
          <h5 className="text-center text-base font-extrabold uppercase tracking-wide">{column.title}</h5>
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
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
      <div className="relative min-h-[22rem] min-w-[680px] bg-gradient-to-r from-purple-100 via-orange-100 to-green-100 dark:from-purple-950/30 dark:via-orange-950/30 dark:to-green-950/30 md:min-w-0">
        <div className="absolute bottom-0 left-1/3 top-0 w-px bg-white/70" />
        <div className="absolute bottom-0 left-2/3 top-0 w-px bg-white/70" />
        <div className="absolute left-[12%] top-4 bg-purple-400 px-9 py-2 text-lg font-extrabold text-purple-950">PAST</div>
        <div className="absolute left-1/2 top-4 -translate-x-1/2 bg-orange-200 px-9 py-2 text-lg font-extrabold text-orange-950">PRESENT</div>
        <div className="absolute right-[12%] top-4 bg-green-400 px-9 py-2 text-lg font-extrabold text-green-950">FUTURE</div>
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
    <div className="grid overflow-hidden rounded-2xl border border-border bg-card text-sm shadow-sm md:grid-cols-3">
      {columns.map((column) => (
        <section key={column.title} className="border-b border-border/60 p-4 md:border-b-0 md:border-r md:last:border-r-0">
          <h5 className="mb-3 font-extrabold uppercase">{column.title}</h5>
          <ul className="space-y-2 leading-6">
            {column.formulas.map((formula) => <li key={formula}>{formula}</li>)}
          </ul>
        </section>
      ))}
    </div>
  )
}

const wordClassColumns = [
  { label: "P.", value: "She (subject), you (object)", color: "#a3e635" },
  { label: "Adv.", value: "always / today", color: "#38bdf8" },
  { label: "Modal", value: "may", color: "#a5f3fc" },
  { label: "V.", value: "bakes / make", color: "#facc15" },
  { label: "Det.", value: "a", color: "#54c7c9" },
  { label: "Adj.", value: "delicious", color: "#fdba74" },
  { label: "N.", value: "cake, home, Saturday, Tiramisu", color: "#ed8fc0" },
  { label: "Prep.", value: "at / on / for", color: "#f59e2e" },
  { label: "Conj.", value: "and", color: "#fef08a" },
]

function WordClassTable() {
  return (
    <div className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/70">
      <table className="w-full table-fixed border-separate border-spacing-0 text-[9px] leading-3 sm:text-[10px] md:min-w-[760px] md:text-base md:leading-6">
        <thead>
          <tr>
            {wordClassColumns.map((col) => (
              <th
                key={col.label}
                className="break-words px-1 py-2 text-center font-extrabold text-slate-950 first:rounded-tl-2xl last:rounded-tr-2xl md:px-3 md:py-3"
                style={{ backgroundColor: col.color }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {wordClassColumns.map((col) => (
              <td key={col.label} className="break-words border-b border-border/50 px-1 py-2 text-center align-top md:px-3 md:py-4">
                {col.value}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export function GrammarSummary() {
  return (
    <article className="searchable mx-auto max-w-5xl space-y-10 bg-background" data-toc-root>
      <div id="grammar-pos" className="scroll-mt-20">
        <Part label="Part 1" title="Part of Speech (Loại từ)" documentStyle>
          <Topic title="Mindmap tổng hợp các loại từ được học trong khóa" skipToc hideTitle>
            <div className="text-center text-xl font-extrabold italic text-amber-900 dark:text-amber-200">
              Mindmap tổng hợp các loại từ được học trong khóa
            </div>
            <ImageZoom src="images/image-04.png" alt="Mindmap Part of Speech" />
            <p className="text-xl italic leading-7 text-amber-900 dark:text-amber-200">
              <strong>Mục tiêu ôn tập:</strong> Nhận biết được các loại từ trong câu, chức năng, vị trí và vai trò trong câu.
            </p>
            <p className="text-xl leading-8 text-foreground">
              <strong>Ví dụ:</strong> She always bakes a cake at home on Saturday, and she may make a delicious Tiramisu for you today.
            </p>
            <WordClassTable />
            <p className="text-base italic leading-7 text-muted-foreground">
              Now, let's take a closer look! (Cùng ôn tập lại kĩ hơn về các loại từ)
            </p>
          </Topic>

          <Topic title="1.1 Noun - Danh từ" lesson="Lesson 7 + 8">
            <p className="text-sm leading-6"><strong>Definition:</strong> words for <KeyTerm>people, animals, places or things</KeyTerm> (Từ chỉ người, sự vật, sự việc).</p>
            <Table
              head={["Loại danh từ", "Nội dung", "Ghi chú / hình minh họa"]}
              rows={[
                [<mark className="whitespace-nowrap">Common nouns</mark>, "Boy, girl, cat, office", ""],
                [<mark className="whitespace-nowrap">Proper nouns</mark>, "Long, Hoa, Kitty, LangGo", ""],
                [<mark className="whitespace-nowrap">Singular nouns</mark>, <div className="space-y-1"><div><strong>A + consonant</strong></div><div>A student</div><div><strong>An + vowel</strong></div><div>An elephant</div></div>, ""],
                [<mark className="whitespace-nowrap">Plural nouns</mark>, <div className="space-y-1"><div>Most of the nouns - Students</div><div>“O, s, ss, ch, x, sh, z” - Peaches</div><div>f/fe (knife) - knives</div><div>Vowel + ‘y’ (toy) - toys</div><div>Consonant + ‘y’ - babies</div><div><strong>Always plural</strong> (a pair of) - sneakers, shorts, glasses, etc.</div></div>, <div className="rounded-xl bg-amber-50 px-3 py-2 text-sm leading-6 text-blue-900 dark:bg-amber-950/30 dark:text-blue-100"><strong>Irregular Nouns</strong><div>1 person - 2 people</div><div>1 child - 2 children</div><div>1 man - 2 men</div><div>1 woman - 2 women</div><div>1 tooth - 2 teeth</div><div>1 foot - 2 feet</div><div>1 mouse - 2 mice</div><div>1 sheep - 2 sheep</div><div>1 deer - 2 deer</div></div>],
                [<mark className="whitespace-nowrap">Countable nouns</mark>, <div className="space-y-1"><div>A dog - two dogs</div><div>★ Dùng được với số đếm</div><div>★ Có dạng số ít và số nhiều</div></div>, <div className="max-w-44"><ImageZoom src="images/image-05.png" alt="Countable noun example" variant="inline" className="!max-h-20" /></div>],
                [<mark className="whitespace-nowrap">Uncountable nouns</mark>, <div className="space-y-1"><div>★ Không dùng được với số đếm</div><div>★ Luôn đi với động từ chia số ít</div><div>★ Đặc điểm phổ biến của danh từ không đếm được:</div><div><strong>Không có hình dạng nhất định:</strong> Smoke, air, water</div><div><strong>Quá nhỏ và không thể đếm:</strong> Rice, sugar, salt</div><div><strong>Khái niệm trừu tượng:</strong> Beauty, fear, knowledge, hope</div></div>, <div className="grid max-w-xs grid-cols-2 gap-2"><div><ImageZoom src="images/image-07.png" alt="Uncountable rice" variant="inline" className="!max-h-20" /><div>some rice</div></div><div><ImageZoom src="images/image-08.png" alt="Uncountable water" variant="inline" className="!max-h-20" /><div>some water</div></div></div>],
              ]}
            />
          </Topic>

          <Topic title="1.2 Quantifiers - Lượng từ" lesson="Lesson 8">
            <p className="text-sm leading-6"><strong>Definition:</strong> words expressing the <KeyTerm>quantity</KeyTerm> of the object (Từ chỉ lượng); usually goes <KeyTerm tone="blue">before a noun</KeyTerm> (thường đứng trước danh từ).</p>
            <CenterTable
              head={["", "Countable singular", "Countable plural", "Uncountable"]}
              rows={[
                ["(+)", "A - an", "Some, a few, few, many, a lot of", "Some, a little, little, any, a lot of"],
                ["(-)", "A - an", "many, any", "much, any"],
                ["(?)", "A - an", "How many, any, a lot of some (in questions usually expecting the answer 'yes', invitations/suggestions)", "How much, any, a lot of some (in questions usually expecting the answer 'yes', invitations/suggestions)"],
              ]}
            />
          </Topic>

          <Topic title="1.3 Pronouns - Đại từ" lesson="Lesson 9">
            <ImageZoom src="images/image-09.png" alt="Pronouns definition" variant="inline" className="!max-h-24" />
            <p className="text-sm leading-6"><strong>Definition:</strong> A <KeyTerm>pronoun</KeyTerm> is a word that takes the place of a common noun or a proper noun.</p>
            <Subsection>1.3.1 Personal pronouns (Đại từ nhân xưng)</Subsection>
            <CenterTable
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
            <Subsection>1.3.2 Reflexive pronouns (Đại từ phản thân - bản thân tự làm)</Subsection>
            <p className="text-sm leading-6"><strong>E.g:</strong> I made this cake <span className="text-red-500 font-semibold">myself</span>.</p>
            <p className="text-sm leading-6">
              The words <span className="text-red-500 font-semibold">myself, yourself, himself, herself, itself, ourselves, yourselves</span> and <span className="text-red-500 font-semibold">themselves</span> are called reflexive pronouns.
            </p>
            <p className="text-sm leading-6">▪ Ví dụ tổng hợp:</p>
            <CenterTable
              head={["Subject pronouns", "Object pronouns", "Possessive adjectives", "Possessive pronouns", "Reflexive pronouns"]}
              rows={[
                [<><div>Ngôi thứ nhất</div><div><span className="text-red-500 font-semibold">I</span></div><div>I have a house</div></>, <><span className="text-red-500 font-semibold">Me</span><div>Phuong gave me a house</div></>, <><span className="text-red-500 font-semibold">My</span><div>This house is my friend's gift</div></>, <><span className="text-red-500 font-semibold">Mine</span><div>This house is mine (= my house).</div></>, <><span className="text-red-500 font-semibold">Myself</span><div>I don't buy this house myself.</div></>],
                ["Ngôi thứ nhất số nhiều: we", "Ngôi thứ nhất số nhiều: us", "Ngôi thứ nhất số nhiều: our", "Ngôi thứ nhất số nhiều: ours", <><div>Ngôi thứ nhất số nhiều:</div><span className="text-red-500 font-semibold">Ourselves</span></>],
                ["Ngôi thứ 2 số ít/nhiều: you", "Ngôi thứ 2 số ít/nhiều: you", "Ngôi thứ 2 số ít/nhiều: your", "Ngôi thứ 2 số ít/nhiều: yours", <><div>Ngôi thứ 2 số ít/nhiều:</div><span className="text-red-500 font-semibold">yourself / yourselves</span></>],
                ["Ngôi thứ 3 số ít: He, she, it", "Ngôi thứ 3 số ít: him, her, it", "Ngôi thứ 3 số ít: his, her, its", "Ngôi thứ 3 số ít: his, hers, its*", <><div>Ngôi thứ 3 số ít:</div><span className="text-red-500 font-semibold">himself, herself, itself</span></>],
                ["Ngôi thứ 3 số nhiều: they", "Ngôi thứ 3 số nhiều: them", "Ngôi thứ 3 số nhiều: their", "Ngôi thứ 3 số nhiều: theirs", <><div>Ngôi thứ 3 số nhiều:</div><span className="text-red-500 font-semibold">themselves</span></>],
              ]}
            />
            <p className="text-xs italic text-muted-foreground">*possessive pronoun “its” không nên dùng trừ khi đi với own, e.g: It had a life of its own</p>
            <Subsection>1.3.3 Demonstrative pronouns (Đại từ chỉ định)</Subsection>
            <CenterTable
              head={["", "NEAR", "FAR"]}
              rows={[
                ["SINGULAR", <><ImageZoom src="images/image-10.png" alt="This" variant="inline" className="!max-h-28" /><div>This is an apple.</div></>, <><ImageZoom src="images/image-11.png" alt="That" variant="inline" className="!max-h-28" /><div>That is an apple.</div></>],
                ["PLURAL", <><ImageZoom src="images/image-12.png" alt="These" variant="inline" className="!max-h-28" /><div>These are apples.</div></>, <><ImageZoom src="images/image-13.png" alt="Those" variant="inline" className="!max-h-28" /><div>Those are apples.</div></>],
              ]}
            />
            <Subsection>1.3.4 Interrogative pronouns (Đại từ nghi vấn)</Subsection>
            <p className="text-sm leading-6">Những từ <span className="font-semibold text-red-500">who, whom, whose, what</span> và <span className="font-semibold text-red-500">which</span> được gọi là các đại từ nghi vấn.</p>
            <p className="text-sm leading-6">Những từ này dùng để đặt câu hỏi.</p>
            <ImageZoom src="images/image-14.png" alt="Interrogative pronouns" variant="illustration" />
          </Topic>

          <Topic title="1.4 Adjectives - Tính từ" lesson="Lesson 10">
            <div className="grid items-center gap-3 md:grid-cols-[2fr_1fr]">
              <ImageZoom src="images/image-15.png" alt="Adjectives heading" variant="inline" className="!max-h-28" />
              <ImageZoom src="images/image-16.png" alt="Adjectives illustration" variant="inline" className="!max-h-28" />
            </div>
            <p className="text-sm leading-6"><strong>E.g:</strong> an old building</p>
            <p className="text-sm leading-6"><strong>Definition:</strong> <KeyTerm>Tính từ</KeyTerm> là những từ miêu tả, bổ sung thêm ý nghĩa cho danh từ.</p>
            <Subsection>★ Position</Subsection>
            <CenterTable
              head={["Vị trí", "Ví dụ"]}
              rows={[
                ["Trước một danh từ", <><strong>E.g:</strong> She's an <span className="text-red-500">impatient</span> person.</>],
                ['Sau động từ "to be"', <><strong>E.g:</strong> Today is <span className="text-red-500">wonderful</span>.</>],
                ["Sau động từ chỉ tri giác", <><strong>E.g:</strong> I feel <span className="text-red-500">great</span> today.</>],
              ]}
            />
            <Subsection>★ Descriptive adjectives</Subsection>
            <CenterTable
              head={["Opinion", "Size", "Age", "Shape", "Color", "Origin", "Material", "Purpose"]}
              rows={[["Nice, Ugly, Cheap, Expensive, Good, Bad, Stupid, Smart, Amazing", "Big, Huge, Small, Large, Narrow, Tall, Short, Medium", "New, Old, Second-hand, Ancient", "Square, Round, Triangular, Rectangular, Flat", "Red, Black, White, Yellow", "American, English, Spanish, Japanese", "Leather, Cotton, Silk, Wooden, Plastic, Metal, Silver, Gold, Paper", "Shopping, Sleeping, Touring, Racing"]]}
            />
            <p className="text-sm leading-6">E.g: My mother has short black hair.</p>
            <Subsection>★ Word formation: Some common prefix - suffix (tiền tố - hậu tố)</Subsection>
            <FormulaList items={[
              "Tiền tố là một phần thêm vào đầu từ khiến thay đổi ý nghĩa của từ đó.",
              "Hậu tố là một phần thêm vào cuối từ khiến thay đổi ý nghĩa của từ đó.",
            ]} />
            <CenterTable
              head={["Prefix", "Example", "Suffix", "Example"]}
              rows={[
                ["bi- (two)", "bilingual", "-able, -ible (able to be done, capable of)", "Readable, knowledgeable"],
                ["co- (together)", "codependent", "-al (relating to)", "National, seasonal"],
                ["dis- (not/reverses the meaning)", "disloyal", "-ful (Having the characteristic of)", "joyful, wonderful"],
                ["non- (not/reverses the meaning)", "non-academic", "-ian (relating to nationalities)", "Australian, Indian"],
                ["im-, in-, ir-, il- (not/reverses the meaning)", "Impossible, illegal", "-ive (something that is)", "Attractive, productive"],
                ["un- (not/reverses the meaning)", "unfriendly", "-less (without)", "Homeless, Useless"],
                ["over- (too much)", "overtired", "-like (resembling)", "Childlike"],
                ["pre- (before)", "precooked", "-ous (having the characteristic)", "Delicious, famous"],
              ]}
            />
            <Subsection>★ NOTE: Adjectives ending in '-ed' and '-ing'</Subsection>
            <CenterTable
              head={["-ed adjectives", "-ing adjectives"]}
              rows={[
                ["Adjectives that end in -ed generally describe emotions - they tell us how people feel. (Tính từ đuôi -ed thường miêu tả cảm xúc, thể hiện cảm nhận)", "Adjectives that end in -ing generally describe the thing that causes the emotion (Tính từ đuôi -ing thường miêu tả tính chất sự vật, sự việc, người - thứ gây ra cảm xúc đó)"],
                ["E.g: She is interested in English.", "E.g: She thinks English is interesting."],
                ["", "He is so boring (~he makes me feel bored)"],
                ["", "The shocking news made me feel shocked."],
              ]}
            />
          </Topic>

          <Topic title="1.5 Determiners - Từ hạn định" lesson="Lesson 11">
            <p className="text-sm leading-6"><strong>Definition:</strong> Một từ <KeyTerm tone="blue">đứng trước một danh từ hoặc cụm danh từ</KeyTerm> để xác định một người, sự vật, sự việc cụ thể đang được đề cập đến.</p>
            <p className="text-sm leading-6">E.g: In the phrases "my first boyfriend" and "that strange woman", the words "my" and "that" are determiners.</p>
            <Subsection>1.4.1 Articles (Mạo từ)</Subsection>
            <CenterTable
              head={["A / An", "The"]}
              rows={[
                ['Các từ "a" và "an" được gọi là mạo từ không xác định. A / an + Singular Nouns. E.g: She eats an apple a day.', 'Từ "the" được gọi là mạo từ xác định. The + Singular/Plural Nouns / Uncountable Nouns. E.g: She eats 10 apples a day. The apples which she eats every day are from NewZealand'],
              ]}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-950 dark:bg-amber-950/20 dark:text-amber-100">
                <div>♥ Used for objects that are not specific or one of several things of a similar type</div>
                <div className="mt-1 text-center">I need a phone.</div>
                <div className="mt-3">♥ Used the first time we introduce an object</div>
                <div className="mt-1 text-center">I saw a movie last night.</div>
                <div className="mt-3">♥ Used as synonyms for the number 'one'</div>
                <div className="mt-1 text-center">They bought a computer.</div>
              </div>
              <div className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-950 dark:bg-amber-950/20 dark:text-amber-100">
                <div>♥ Used for specific objects or objects that both the speaker and listener know</div>
                <div className="mt-1 text-center">Can you give me the books on the table?</div>
                <div className="mt-3">♥ Used when we mention the object again</div>
                <div className="mt-1 text-center">The movie is based on a real-life incident.</div>
                <div className="mt-3">♥ Used before countries or other regions with plural names ('s' at the end) and bodies of water</div>
                <div className="mt-1 text-center">The Netherlands</div>
                <div className="mt-3">♥ Used before certain adjectives to give a plural meaning</div>
                <div className="mt-1 text-center">The old need our help.</div>
              </div>
            </div>
            <ExtraTheUsage />
            <div className="rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-950 dark:bg-blue-950/20 dark:text-blue-100">
              <h5 className="mb-2 text-base font-bold">We don't use an article:</h5>
              <div>♥ before plural countable nouns and uncountable nouns when we mean 'in general'</div>
              <div>I like <span className="text-red-500">cats</span>.</div>
              <div><span className="text-red-500">Doctors</span> have to study for a long time.</div>
              <div className="mt-3">♥ before abstract nouns</div>
              <div>What is the difference between <span className="text-red-500">jealousy</span> and <span className="text-red-500">envy</span>?</div>
              <div className="mt-3">♥ before names of meals, languages, sports, and many expressions of place and time</div>
            </div>
            <div className="rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-950 dark:bg-blue-950/20 dark:text-blue-100">
              <div>I never drink before <span className="text-red-500">breakfast</span>.</div>
              <div>I'll see you <span className="text-red-500">next week</span>.</div>
              <div>He stayed <span className="text-red-500">at home</span> because he was ill.</div>
              <div>Do you play <span className="text-red-500">tennis</span>?</div>
            </div>
            <Subsection>1.4.2 Possessive determiners (Từ hạn định sở hữu)</Subsection>
            <p className="text-sm leading-6">Từ hạn định sở hữu / Tính từ sở hữu: <span className="font-semibold text-red-500">my, your, his, her, its, our, their</span>.</p>
            <p className="text-sm leading-6">Sử dụng <strong>trước danh từ</strong> thể hiện cái gì thuộc về ai/cái gì.</p>
            <Subsection>1.4.3 Demonstrative determiners (Từ hạn định chỉ định)</Subsection>
            <CenterTable
              head={["", "NEAR", "FAR"]}
              rows={[
                ["SINGULAR", <><ImageZoom src="images/image-17.png" alt="This apple" variant="inline" className="!max-h-28" /><div><span className="text-red-500">This</span> apple is red.</div></>, <><ImageZoom src="images/image-18.png" alt="That apple" variant="inline" className="!max-h-28" /><div><span className="text-red-500">That</span> apple is small.</div></>],
                ["PLURAL", <><ImageZoom src="images/image-19.png" alt="These apples" variant="inline" className="!max-h-28" /><div><span className="text-red-500">These</span> apples are cheap.</div></>, <><ImageZoom src="images/image-20.png" alt="Those apples" variant="inline" className="!max-h-28" /><div><span className="text-red-500">Those</span> apples are expensive.</div></>],
              ]}
            />
          </Topic>

          <Topic title="1.6 Prepositions - Giới từ" lesson="Lesson 12">
            <div className="grid items-center gap-3 md:grid-cols-[1.4fr_1fr]">
              <ImageZoom src="images/image-21.png" alt="Prepositions heading" variant="inline" className="!max-h-24" />
              <ImageZoom src="images/image-22.png" alt="Prepositions illustration" variant="inline" className="!max-h-24" />
            </div>
            <p className="text-sm leading-6"><strong>E.g:</strong> There’s a big balloon <span className="rounded border border-orange-300 px-1 font-semibold">in</span> the sky.</p>
            <p className="text-sm leading-6"><strong>Khái niệm:</strong> <KeyTerm tone="red">Giới từ</KeyTerm> là những từ dùng để diễn tả mối quan hệ của cụm từ đứng phía sau nó với các thành phần khác trong câu. Giới từ thường chỉ <strong>vị trí, địa điểm</strong> và <strong>thời gian</strong>.</p>
            <p className="text-sm leading-6"><strong>Vị trí:</strong> Thường <strong>được theo sau bởi danh từ</strong> hoặc <strong>đại từ</strong> (Prep + N/Pro)</p>
            <Subsection><mark>★ Common prepositions - position</mark> (những giới từ phổ biến - chỉ vị trí)</Subsection>
            <ImageZoom src="images/image-23.png" alt="Common prepositions of position" />
            <p className="text-sm font-semibold italic leading-6">*Một số từ khác:</p>
            <FormulaList items={["In the middle of (sth)", "In the corner (of sth)", "On the left / right of ...", "Across from / opposite...", "Against the wall"]} />
            <Subsection>★ IN, ON, AT (giới từ phổ biến, chỉ địa điểm, thời gian)</Subsection>
            <InOnAtChart />
            <div className="space-y-3 text-base leading-7 text-muted-foreground">
              <p><strong className="text-foreground">*Note:</strong> Không sử dụng giới từ với <em>tomorrow, yesterday, tomorrow morning, yesterday evening</em>.</p>
              <p className="pl-5"><strong className="text-foreground">E.g:</strong> We're flying to Washington tomorrow afternoon.</p>
            </div>
          </Topic>

          <Topic title="1.7 Verbs - Động từ" lesson="Lesson 13">
            <div className="grid max-w-2xl gap-3 md:grid-cols-2">
              <div className="space-y-2 text-center">
                <ImageZoom src="images/image-25.png" alt="I can read" variant="inline" className="!max-h-28" />
                <p className="text-base text-muted-foreground">I can <span className="font-semibold text-orange-500">read</span></p>
              </div>
              <div className="space-y-2 text-center">
                <ImageZoom src="images/image-26.png" alt="I can sing" variant="inline" className="!max-h-28" />
                <p className="text-base text-muted-foreground">I can <span className="font-semibold text-orange-500">sing</span></p>
              </div>
            </div>
            <p className="text-sm leading-6"><span className="underline">Khái niệm:</span> <KeyTerm>Động từ</KeyTerm> phần lớn là các từ chỉ hành động (action words), cho biết người, con vật, đồ vật đang có hoạt động gì.</p>
            <div className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p className="font-bold text-foreground">*Note:</p>
              <p>Các động từ phổ biến: Have, Go, Do, Make, Come, Take, Bring, Get</p>
              <p>Có 12 thì động từ, biến đổi theo Quá khứ (past), Hiện tại (Present), Tương lai (Future)</p>
            </div>
          </Topic>

          <Topic title="1.8 Adverbs - Trạng từ" lesson="Lesson 17">
            <div className="grid gap-3 md:grid-cols-3">
              <ImageZoom src="images/image-27.png" alt="Adverbs heading 1" variant="inline" className="!max-h-24" />
              <ImageZoom src="images/image-28.png" alt="Adverbs heading 2" variant="inline" className="!max-h-24" />
              <ImageZoom src="images/image-29.png" alt="Adverbs heading 3" variant="inline" className="!max-h-24" />
            </div>
            <p className="text-sm leading-6"><strong>Khái niệm:</strong> <KeyTerm>Trạng từ</KeyTerm> thường cung cấp thêm thông tin cho động từ, tính từ hoặc trạng từ.</p>
            <Subsection>Các loại trạng từ</Subsection>
            <ImageZoom src="images/image-30.png" alt="Types of adverbs" variant="document" className="!max-h-[520px]" />
            <p className="text-sm italic leading-6">Ngoài 5 loại phổ biến, còn nhiều loại trạng từ khác</p>
            <ImageZoom src="images/image-31.png" alt="Adverb formation" variant="document" className="!max-h-[760px]" />
            <Subsection>Note: Vị trí trạng từ</Subsection>
            <div className="space-y-1.5 text-base leading-7 text-muted-foreground">
              <p className="pl-6"><span className="mr-3">+</span><span className="font-semibold text-blue-700">Front position</span>: đứng <strong className="text-foreground">đầu</strong> câu/vế câu</p>
              <p className="pl-6"><span className="mr-3">+</span><span className="font-semibold text-orange-600">Mid Position</span>: đứng <strong className="text-foreground">giữa</strong> chủ ngữ và động từ chính.</p>
              <p className="pl-12"><span className="mr-3">+</span>Trường hợp có trợ động từ (have/has) hoặc động từ khuyết thiếu (can, might...): đứng giữa trợ động từ/động từ khuyết thiếu và động từ chính.</p>
              <p className="pl-12"><span className="mr-3">+</span>Đứng sau động từ to be</p>
              <p className="pl-6"><span className="mr-3">+</span><span className="font-semibold text-pink-800">End Position</span>: đứng <strong className="text-foreground">cuối</strong> câu/vế câu.</p>
            </div>
            <p className="text-sm italic leading-6">Common (phổ biến) ⭐⭐⭐; Not common (không phổ biến) ⭐</p>
            <AdverbPositionCards />
          </Topic>

          <Topic title="1.9 Conjunction - Liên từ" lesson="Lesson 18">
            <p className="text-sm leading-6"><strong>Khái niệm:</strong> <KeyTerm>Liên từ</KeyTerm> là từ dùng để kết nối hai từ, cụm từ, vế câu và thể hiện mối quan hệ giữa chúng.</p>
            <p className="text-sm leading-6">E.g: He is nice <strong>and</strong> tall. In his free time, he can play soccer with friends <strong>or</strong> read books at home. He likes to learn new things, <strong>so</strong> he takes some online courses.</p>
            <Subsection>Các loại liên từ</Subsection>
            <FormulaList items={["Liên từ kết hợp (coordinating conjunctions)", "Liên từ tương quan (correlative conjunctions)", "Liên từ phụ thuộc (subordinating conjunctions) (học sau)"]} />
            <ConjunctionSummary />
          </Topic>
        </Part>
      </div>

      <div id="grammar-tenses" className="scroll-mt-20">
        <Part label="Part 2" title="Tenses">
          <p className="text-sm leading-6">6 thì, cấu trúc (hiện tại đơn/tiếp diễn, quá khứ đơn/tiếp diễn, tương lai đơn, be going to)</p>
          <TenseUseGrid />
          <TenseTimeline />
          <TenseUseGrid secondSet />
          <Topic title="Công thức các thì">
            <TenseFormulaGrid />
            <TenseTimeline />
            <TenseFormulaGrid secondSet />
          </Topic>
        </Part>
      </div>

      <div id="grammar-sentences" className="scroll-mt-20">
        <Part label="Part 3" title="Sentences">
          <p className="text-base leading-7"><span className="underline">Khái niệm:</span> <span className="font-semibold text-orange-500">Câu</span> là một đơn vị ngữ pháp gồm một hay nhiều từ có liên kết ngữ pháp với nhau có ý nghĩa.</p>
          <p className="text-base leading-7 text-muted-foreground">Một câu cần viết hoa chữ cái đầu câu và kết câu bằng dấu chấm.</p>
          <Topic title="3.1 Thành phần câu">
            <div className="grid items-center gap-4 md:grid-cols-[1fr_1.65fr]">
              <ImageZoom src="images/image-38.png" alt="Sentence components" variant="document" className="!max-h-[220px]" />
              <ImageZoom src="images/image-39.png" alt="Sentence structure formula" variant="document" className="!max-h-[230px]" />
            </div>
            <Subsection>⭐ Direct & Indirect objects</Subsection>
            <ImageZoom src="images/image-40.png" alt="Direct and Indirect objects" variant="document" className="!max-h-[520px]" />
            <p className="pl-6 text-base leading-7 text-muted-foreground">- <span className="ml-3">Vị trí: tân ngữ gián tiếp thường đứng trước tân ngữ trực tiếp hoặc đứng sau giới từ</span></p>
            <p className="pl-12 text-base leading-7 text-muted-foreground">(VD: <span className="text-blue-600">Nam</span> gave <span className="text-orange-500">a present</span> <span className="underline">to</span> <span className="text-pink-500">Dung</span>)</p>
          </Topic>
          <Topic title="3.2 Các kiểu câu">
            <ImageZoom src="images/image-41.png" alt="Sentence types" variant="document" className="!max-h-[620px]" />
          </Topic>
        </Part>
      </div>
    </article>
  )
}
