import { useEffect, useState, type ReactNode } from "react"

const APP_BASE = (import.meta.env.BASE_URL || "/").replace(/\/?$/, "/")

function finalAsset(path: string) {
  return `${APP_BASE}${`final/google-doc-pre-course/${path}`.split("/").map(encodeURIComponent).join("/")}`
}

type Cell = ReactNode

function ImageZoom({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
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
          className={`mx-auto max-h-[520px] max-w-full rounded-xl border border-slate-200 bg-white object-contain p-1 shadow-sm transition hover:shadow-md ${className}`}
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

function Part({ label, title, children }: { label: string; title: string; children: ReactNode }) {
  return (
    <section className="space-y-5 rounded-[1.5rem] border border-border bg-white p-5 shadow-sm dark:bg-card sm:p-6">
      <div className="rounded-xl border-l-4 border-primary bg-blue-50 px-4 py-3 dark:bg-blue-950/30">
        <div className="text-[11px] font-bold uppercase tracking-widest text-primary">{label}</div>
        <h3 className="mt-1 text-xl font-extrabold uppercase tracking-wide text-slate-950 dark:text-white">{title}</h3>
      </div>
      {children}
    </section>
  )
}

function Topic({ title, lesson, children }: { title: string; lesson?: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-border dark:bg-muted/20">
      <div>
        {lesson && <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{lesson}</div>}
        <h4 className="text-lg font-bold text-primary">{title}</h4>
      </div>
      {children}
    </section>
  )
}

function Note({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
      {children}
    </div>
  )
}

function Table({ head, rows }: { head: Cell[]; rows: Cell[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-border dark:bg-card">
      <table className="w-full min-w-[680px] border-collapse text-sm leading-6">
        <thead className="bg-slate-100 text-slate-950 dark:bg-slate-900 dark:text-white">
          <tr>{head.map((cell, index) => <th key={index} className="border border-slate-200 px-3 py-2 text-left align-top font-bold dark:border-border">{cell}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => <td key={cellIndex} className="border border-slate-200 bg-white px-3 py-2 align-top dark:border-border dark:bg-card">{cell}</td>)}
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

export function GrammarSummary() {
  return (
    <article className="searchable space-y-6 rounded-[1.75rem] border border-border bg-white p-4 shadow-sm dark:bg-card sm:p-6 lg:p-8">
      <header className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-amber-50 p-6 text-center dark:border-blue-950 dark:from-blue-950/30 dark:via-card dark:to-amber-950/20">
        <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">Tài liệu chính</div>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
          Ôn tập kiến thức khóa PRE-IELTS
        </h2>
        <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          Bản bố cục lại từ tài liệu tổng hợp giáo viên gửi. Bỏ phần logo/trang trí, giữ phần kiến thức, bảng và ảnh minh họa cần xem khi ôn Grammar.
        </p>
      </header>

      <div className="rounded-2xl border border-border bg-muted/25 p-4">
        <div className="text-sm font-semibold">Mục lục nhanh</div>
        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
          <a className="rounded-lg bg-white px-3 py-2 hover:text-primary dark:bg-card" href="#grammar-pos">Part 1 · Part of Speech</a>
          <a className="rounded-lg bg-white px-3 py-2 hover:text-primary dark:bg-card" href="#grammar-tenses">Part 2 · Tenses</a>
          <a className="rounded-lg bg-white px-3 py-2 hover:text-primary dark:bg-card" href="#grammar-sentences">Part 3 · Sentences</a>
        </div>
      </div>

      <div id="grammar-pos" className="scroll-mt-20">
        <Part label="Part 1" title="Part of Speech - Loại từ">
          <Topic title="Mindmap tổng hợp các loại từ được học trong khóa">
            <ImageZoom src="images/image-04.png" alt="Mindmap Part of Speech" />
            <p className="text-sm leading-6"><strong>Mục tiêu:</strong> nhận biết loại từ trong câu, chức năng, vị trí và vai trò trong câu.</p>
            <Table
              head={["P.", "Adv.", "Modal", "V.", "Det.", "Adj.", "N.", "Prep.", "Conj."]}
              rows={[["She / you", "always / today", "may", "bakes / make", "a", "delicious", "cake / home / Saturday", "at / on / for", "and"]]}
            />
          </Topic>

          <Topic title="1.1 Noun - Danh từ" lesson="Lesson 7 + 8">
            <p className="text-sm leading-6"><strong>Definition:</strong> words for people, animals, places or things.</p>
            <Table
              head={["Nhóm", "Cách nhớ", "Ví dụ"]}
              rows={[
                ["Common nouns", "Danh từ chung", "boy, girl, cat, office"],
                ["Proper nouns", "Danh từ riêng", "Long, Hoa, Kitty, LangGo"],
                ["Singular nouns", "Số ít: a/an + noun", "a student, an elephant"],
                ["Plural nouns", "Số nhiều: thêm -s/-es hoặc đổi dạng", <ImageZoom src="images/image-06.png" alt="Plural noun rules" />],
              ]}
            />
            <Table
              head={["Countable nouns", "Uncountable nouns"]}
              rows={[
                [<><ImageZoom src="images/image-05.png" alt="Countable noun example" /><div>A dog - two dogs</div></>, <><ImageZoom src="images/image-07.png" alt="Uncountable rice" /><ImageZoom src="images/image-08.png" alt="Uncountable water" /></>],
                ["Dùng được với số đếm; có dạng số ít/số nhiều", "Không dùng trực tiếp với số đếm; thường đi với động từ số ít"],
                ["Ví dụ: one book, two books", "Ví dụ: water, rice, sugar, air, beauty, knowledge"],
              ]}
            />
          </Topic>

          <Topic title="1.2 Quantifiers - Lượng từ" lesson="Lesson 8">
            <p className="text-sm leading-6">Từ chỉ lượng, thường đứng trước danh từ.</p>
            <Table
              head={["Loại câu", "Countable singular", "Countable plural", "Uncountable"]}
              rows={[
                ["(+)", "a / an", "some, a few, few, many, a lot of", "some, a little, little, any, a lot of"],
                ["(-)", "a / an", "many, any", "much, any"],
                ["(?)", "a / an", "How many, any, a lot of, some", "How much, any, a lot of, some"],
              ]}
            />
          </Topic>

          <Topic title="1.3 Pronouns - Đại từ" lesson="Lesson 9">
            <ImageZoom src="images/image-09.png" alt="Pronouns definition" />
            <Table
              head={["Nhóm", "Chức năng", "Ví dụ"]}
              rows={[
                ["Subject pronouns", "Làm chủ ngữ", "I, you, he, she, it, we, they"],
                ["Object pronouns", "Làm tân ngữ", "me, you, him, her, it, us, them"],
                ["Reflexive pronouns", "Nhấn mạnh chính chủ thể tự làm", "myself, yourself, himself, herself, ourselves"],
                ["Possessive adjectives", "Đứng trước danh từ", "my, your, his, her, its, our, their"],
                ["Possessive pronouns", "Thay thế cụm sở hữu", "mine, yours, his, hers, ours, theirs"],
              ]}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <ImageZoom src="images/image-10.png" alt="This" />
              <ImageZoom src="images/image-11.png" alt="That" />
              <ImageZoom src="images/image-12.png" alt="These" />
              <ImageZoom src="images/image-13.png" alt="Those" />
            </div>
            <ImageZoom src="images/image-14.png" alt="Interrogative pronouns" />
          </Topic>

          <Topic title="1.4 Adjectives - Tính từ" lesson="Lesson 10">
            <ImageZoom src="images/image-15.png" alt="Adjectives heading" />
            <ImageZoom src="images/image-16.png" alt="Adjectives illustration" />
            <Table
              head={["Vị trí", "Ví dụ"]}
              rows={[
                ["Trước danh từ", "She's an impatient person."],
                ["Sau động từ to be", "Today is wonderful."],
                ["Sau động từ chỉ tri giác", "I feel great today."],
              ]}
            />
            <Table
              head={["Opinion", "Size", "Age", "Shape", "Colour", "Origin", "Material", "Purpose"]}
              rows={[["nice, cheap, smart", "big, small, tall", "new, old", "round, square", "red, black", "British, Japanese", "wooden, leather", "shopping, sleeping"]]}
            />
            <Note><strong>-ed / -ing:</strong> <em>interested</em> diễn tả cảm xúc của người; <em>interesting</em> diễn tả thứ gây ra cảm xúc.</Note>
          </Topic>

          <Topic title="1.5 Determiners - Từ hạn định" lesson="Lesson 11">
            <Table
              head={["A / An", "The", "Không dùng article"]}
              rows={[
                ["Không xác định; lần đầu nhắc tới; nghĩa là one", "Xác định; cả người nói/nghe đều biết; nhắc lại lần hai", "Nói chung với plural/uncountable nouns"],
                ["I need a phone.", "Can you give me the books on the table?", "I like cats. I never drink before breakfast."],
              ]}
            />
            <p className="text-sm leading-6"><strong>Possessive determiners:</strong> my, your, his, her, its, our, their.</p>
            <div className="grid gap-3 md:grid-cols-2">
              <ImageZoom src="images/image-17.png" alt="This apple" />
              <ImageZoom src="images/image-18.png" alt="That apple" />
              <ImageZoom src="images/image-19.png" alt="These apples" />
              <ImageZoom src="images/image-20.png" alt="Those apples" />
            </div>
          </Topic>

          <Topic title="1.6 Prepositions - Giới từ" lesson="Lesson 12">
            <ImageZoom src="images/image-21.png" alt="Prepositions heading" />
            <ImageZoom src="images/image-22.png" alt="Prepositions illustration" />
            <p className="text-sm leading-6">Giới từ diễn tả quan hệ vị trí, địa điểm, thời gian; thường theo sau bởi danh từ hoặc đại từ.</p>
            <ImageZoom src="images/image-23.png" alt="Common prepositions of position" />
            <ImageZoom src="images/image-24.png" alt="In on at prepositions" />
            <Note>Không dùng giới từ với <strong>tomorrow, yesterday, tomorrow morning, yesterday evening</strong>.</Note>
          </Topic>

          <Topic title="1.7 Verbs - Động từ" lesson="Lesson 13">
            <div className="grid gap-3 md:grid-cols-2">
              <ImageZoom src="images/image-25.png" alt="I can read" />
              <ImageZoom src="images/image-26.png" alt="I can sing" />
            </div>
            <FormulaList items={["Động từ chỉ hành động hoặc trạng thái.", "Các động từ phổ biến: have, go, do, make, come, take, bring, get.", "Động từ thay đổi theo quá khứ, hiện tại, tương lai."]} />
          </Topic>

          <Topic title="1.8 Adverbs - Trạng từ" lesson="Lesson 17">
            <div className="grid gap-3 md:grid-cols-3">
              <ImageZoom src="images/image-27.png" alt="Adverbs heading 1" />
              <ImageZoom src="images/image-28.png" alt="Adverbs heading 2" />
              <ImageZoom src="images/image-29.png" alt="Adverbs heading 3" />
            </div>
            <ImageZoom src="images/image-30.png" alt="Types of adverbs" />
            <ImageZoom src="images/image-31.png" alt="Adverb formation" />
            <FormulaList items={["Front position: đầu câu hoặc đầu vế câu.", "Mid position: giữa chủ ngữ và động từ chính; sau to be; sau trợ động từ/modal.", "End position: cuối câu hoặc cuối vế câu."]} />
            <div className="grid gap-3 md:grid-cols-3">
              <ImageZoom src="images/image-32.png" alt="Adverb position chart 1" />
              <ImageZoom src="images/image-33.png" alt="Adverb position chart 2" />
              <ImageZoom src="images/image-34.png" alt="Adverb position chart 3" />
            </div>
          </Topic>

          <Topic title="1.9 Conjunction - Liên từ" lesson="Lesson 18">
            <p className="text-sm leading-6">Liên từ kết nối hai từ, cụm từ, vế câu và thể hiện mối quan hệ giữa chúng.</p>
            <Table
              head={["Coordinating conjunctions", "Correlative conjunctions"]}
              rows={[
                [<ImageZoom src="images/image-35.png" alt="FANBOYS" />, "both…and, either…or, neither…nor, not only…but also, would rather…than"],
                ["For, And, Nor, But, Or, Yet, So", "This house is both large and warm. / He is neither rich nor famous."],
              ]}
            />
          </Topic>
        </Part>
      </div>

      <div id="grammar-tenses" className="scroll-mt-20">
        <Part label="Part 2" title="Tenses - Các thì trọng tâm">
          <p className="text-sm leading-6">6 thì/cấu trúc trọng tâm: hiện tại đơn, hiện tại tiếp diễn, quá khứ đơn, quá khứ tiếp diễn, tương lai đơn, be going to.</p>
          <Table
            head={["Quá khứ tiếp diễn", "Hiện tại tiếp diễn", "Be going to"]}
            rows={[
              ["Dấu hiệu: while, when, at that moment, at 7 pm", "Dấu hiệu: now, at the moment, today, this week", "Dấu hiệu: tomorrow, next week, soon, tonight"],
              ["Hành động đang diễn ra trong quá khứ; hành động song song; hành động bị xen vào", "Hành động đang diễn ra; tình huống tạm thời; sự kiện tương lai; thói quen xấu với always", "Dự đoán dựa trên dấu hiệu hiện tại; kế hoạch/ý định trước"],
            ]}
          />
          <ImageZoom src="images/image-36.png" alt="Tenses timeline" />
          <Table
            head={["Quá khứ đơn", "Hiện tại đơn", "Tương lai đơn - will"]}
            rows={[
              ["Dấu hiệu: last, ago, yesterday", "Dấu hiệu: every day, once a week, always, usually, often", "Dấu hiệu: tomorrow, next week, soon, tonight"],
              ["Hành động đã xảy ra; chuỗi hành động quá khứ; thói quen quá khứ", "Sự thật hiển nhiên; thói quen; thời gian biểu", "Dự đoán theo quan điểm; quyết định ngay lúc nói; chưa có kế hoạch"],
            ]}
          />
          <Topic title="Công thức các thì">
            <Table
              head={["Quá khứ tiếp diễn", "Hiện tại tiếp diễn", "Be going to"]}
              rows={[
                ["(+) S + was/were + V-ing", "(+) S + am/is/are + V-ing", "(+) S + am/is/are going to + V0"],
                ["(-) S + was/were + not + V-ing", "(-) S + am/is/are + not + V-ing", "(-) S + am/is/are + not going to + V0"],
                ["(?) Was/Were + S + V-ing?", "(?) Am/Is/Are + S + V-ing?", "(?) Am/Is/Are + S + going to + V0?"],
              ]}
            />
            <ImageZoom src="images/image-37.png" alt="Tenses formula diagram" />
            <Table
              head={["Quá khứ đơn", "Hiện tại đơn", "Tương lai đơn - will"]}
              rows={[
                ["(+) S + was/were + N/adj; S + V2/-ed", "(+) S + am/is/are + N/adj; S + V1/s/es", "(+) S + will + V0"],
                ["(-) S + was/were + not; S + did not + V0", "(-) S + am/is/are + not; S + do/does not + V0", "(-) S + will not + V0"],
                ["(?) Was/Were + S...? / Did + S + V0?", "(?) Am/Is/Are + S...? / Do/Does + S + V0?", "(?) Will + S + V0?"],
              ]}
            />
          </Topic>
        </Part>
      </div>

      <div id="grammar-sentences" className="scroll-mt-20">
        <Part label="Part 3" title="Sentences - Câu">
          <p className="text-sm leading-6">Câu là đơn vị ngữ pháp có một hoặc nhiều từ liên kết với nhau, có nghĩa; viết hoa chữ cái đầu và kết câu bằng dấu chấm.</p>
          <Topic title="3.1 Thành phần câu">
            <ImageZoom src="images/image-38.png" alt="Sentence components" />
            <ImageZoom src="images/image-39.png" alt="Sentence structure formula" />
            <ImageZoom src="images/image-40.png" alt="Direct and Indirect objects" />
            <Note>Tân ngữ gián tiếp thường đứng trước tân ngữ trực tiếp hoặc đứng sau giới từ: <strong>Nam gave a present to Dung.</strong></Note>
          </Topic>
          <Topic title="3.2 Các kiểu câu">
            <ImageZoom src="images/image-41.png" alt="Sentence types" />
            <ImageZoom src="images/image-42.png" alt="Sentence types divider" />
          </Topic>
        </Part>
      </div>
    </article>
  )
}
