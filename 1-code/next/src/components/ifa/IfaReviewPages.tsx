import type { ReactNode } from "react"
import { ifaGrammar } from "@/data/ifa-grammar"
import type { IfaGrammarSection } from "@/types/content"

type PagePlan = { title: string; lesson?: string; refs?: [number, number][]; intro?: string }

/** Handout page order. Pages 3 and 4 are identical in the supplied captures. */
const PAGE_PLANS: Record<number, PagePlan> = {
  2: { title: "Present Simple", lesson: "Lesson 2", refs: [[0, 1], [0, 0]] },
  3: { title: "Hints & Stative Verbs", lesson: "Lesson 2", refs: [[0, 4], [0, 5]] },
  4: { title: "Hints & Stative Verbs", lesson: "Lesson 2", refs: [[0, 4], [0, 5]] },
  5: { title: "Past Simple", lesson: "Lesson 2", refs: [[1, 1], [1, 0]] },
  6: { title: "Present Perfect", lesson: "Lesson 3", refs: [[1, 3], [1, 2]] },
  7: { title: "Present Perfect vs Past Simple", lesson: "Lesson 3", refs: [[1, 5], [1, 4]] },
  8: { title: "Present Perfect vs Past Simple · Past Perfect", lesson: "Lesson 3", refs: [[1, 4], [1, 6]] },
  9: { title: "Past Perfect — Usage & Hints", lesson: "Lesson 3", refs: [[1, 7]] },
  10: { title: "Future Simple", lesson: "Lesson 4", refs: [[2, 1], [2, 0], [2, 5]] },
  11: { title: "Be Going To", lesson: "Lesson 4", refs: [[2, 3], [2, 2]] },
  12: { title: "Will · Be Going To · Present Continuous", lesson: "Lesson 4", refs: [[2, 4]] },
  13: { title: "Conditional Sentences", lesson: "Lesson 5", refs: [[3, 0], [3, 1], [3, 2]] },
  14: { title: "Conditional Sentences · Passive Voice", lesson: "Lesson 5–6", refs: [[3, 3], [4, 1]] },
  15: { title: "Passive Voice — Tenses & Modals", lesson: "Lesson 6", refs: [[4, 3], [4, 4]] },
  16: { title: "Passive Voice — Step by Step", lesson: "Lesson 6", refs: [[4, 2]] },
  17: { title: "Passive Voice — Usage", lesson: "Lesson 6", refs: [[4, 0]] },
  18: { title: "Passive Voice — Notes", lesson: "Lesson 6", refs: [[4, 5]] },
  19: { title: "Comparatives and Superlatives", lesson: "Lesson 7", refs: [[5, 0], [5, 1]] },
  20: { title: "Comparatives — Advanced Structures", lesson: "Lesson 7", refs: [[5, 3], [5, 2]] },
  21: { title: "Comparatives · Relative Clauses", lesson: "Lesson 7–8", refs: [[5, 2]] },
  22: { title: "Relative Pronouns", lesson: "Lesson 8", refs: [[6, 0]] },
  23: { title: "Relative Adverbs", lesson: "Lesson 8", refs: [[6, 1]] },
  24: { title: "Defining & Non-defining Relative Clauses", lesson: "Lesson 8", refs: [[6, 2]] },
  25: { title: "Defining Clauses · Prepositions", lesson: "Lesson 8", refs: [[6, 2], [6, 3]] },
  26: { title: "Reduced Relative Clauses", lesson: "Lesson 8", refs: [[6, 4]] },
  27: { title: "Sentence Structure — Conjunctions", lesson: "Lesson 9", refs: [[7, 2]] },
  28: { title: "Clauses & Sentence Structure", lesson: "Lesson 9", refs: [[7, 0], [7, 1]] },
  29: { title: "Speaking — Vocabulary Lists" },
  30: { title: "Writing — Paragraph Structure" },
  31: { title: "Writing — Ideas: Sports & Shopping" },
  32: { title: "Writing — Ideas: Online Courses" },
  33: { title: "Reading — Question Types" },
  34: { title: "Reading — Strategies" },
  35: { title: "Listening — Question Types & Tips" },
}

function Table({ columns, rows }: { columns: string[]; rows: string[][] }) {
  return (
    <div className="my-4 max-w-full overflow-x-auto rounded-lg border border-sky-200" role="region" aria-label={`Bảng ${columns.join(", ")}`} tabIndex={0}>
      <table className={`w-full border-collapse text-left text-sm text-[#20245b] ${columns.length >= 4 ? "min-w-[860px]" : "min-w-[620px]"}`}>
        <thead><tr className="bg-indigo-100/80">{columns.map((column, i) => <th key={i} scope="col" className="whitespace-nowrap border-b border-r border-sky-200 px-3 py-2 font-semibold last:border-r-0">{column}</th>)}</tr></thead>
        <tbody>{rows.map((row, i) => <tr key={i} className={i % 2 ? "bg-indigo-50/80" : "bg-cyan-50/70"}>{row.map((cell, j) => j === 0
          ? <th key={j} scope="row" className={`border-b border-r border-sky-200 px-3 py-2 align-top font-semibold last:border-r-0 ${cell.length < 65 ? "whitespace-nowrap" : "min-w-48"}`}>{cell}</th>
          : <td key={j} className={`border-b border-r border-sky-200 px-3 py-2 align-top last:border-r-0 ${cell.length < 65 ? "whitespace-nowrap" : "min-w-48"}`}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  )
}

function TopicBlock({ section }: { section: IfaGrammarSection }) {
  const label = section.kind === "structure" ? "STRUCTURE" : section.kind === "rules" ? "RULES" : section.kind === "contrast" ? "COMPARE" : section.kind === "note" ? "HINTS" : "USAGE"
  const showPoints = !section.table || (section.kind !== "structure" && section.kind !== "contrast")
  return (
    <section className="mb-5 break-inside-avoid">
      <div className="mb-2 flex flex-wrap items-baseline gap-x-2 border-b border-dotted border-indigo-200 pb-1">
        <h3 className="text-lg font-semibold uppercase tracking-wide text-[#27235c]">{label}</h3>
        <span className="text-sm italic text-indigo-600">{section.heading}</span>
      </div>
      {showPoints && (section.kind === "structure" ? (
        <div className="overflow-hidden rounded-lg border border-sky-200">{section.points.map((point, i) => <div key={i} className={`px-3 py-2.5 text-sm ${i % 2 ? "bg-indigo-50" : "bg-cyan-50"}`}><strong className="text-[#27235c]">{point}</strong></div>)}</div>
      ) : <ul className="space-y-2 pl-5 text-sm leading-relaxed text-[#29255d]">{section.points.map((point, i) => <li key={i} className="list-disc marker:text-indigo-500">{point}</li>)}</ul>)}
      {section.table && <Table columns={section.table.columns} rows={section.table.rows} />}
      {section.examples?.length ? <div className="mt-3 border-l-2 border-indigo-300 pl-3 text-sm italic leading-relaxed text-indigo-700">{section.examples.map((example, i) => <p key={i} className="my-1">Ex: {example}</p>)}</div> : null}
    </section>
  )
}

function Flow({ heading, steps }: { heading: string; steps: { label: string; text: string }[] }) {
  return <section className="my-5 rounded-xl border border-pink-200 bg-pink-50/50 p-4">
    <h3 className="mb-4 text-lg font-semibold text-[#27235c]">{heading}</h3>
    <div className="grid gap-3 sm:grid-cols-3">{steps.map((step, i) => <div key={i} className="relative rounded-lg border border-pink-200 bg-white p-3 shadow-sm">
      <span className="mb-2 inline-block rounded-md bg-pink-500 px-2 py-0.5 text-xs font-bold text-white">{step.label}</span>
      <p className="text-sm leading-relaxed text-[#29255d]">{step.text}</p>
      {i < steps.length - 1 && <><span className="absolute -bottom-5 left-1/2 z-10 text-lg text-pink-500 sm:hidden">↓</span><span className="absolute -right-3 top-1/2 z-10 hidden text-lg text-pink-500 sm:block">→</span></>}
    </div>)}</div>
  </section>
}

function Branches({ title, items }: { title: string; items: { label: string; details: string[] }[] }) {
  return <section className="my-5 rounded-xl border border-pink-200 bg-white/85 p-4 sm:grid sm:grid-cols-[12rem_minmax(0,1fr)] sm:items-center sm:gap-7">
    <div className="relative mx-auto mb-5 w-fit rounded-full bg-gradient-to-r from-indigo-100 to-pink-100 px-5 py-2 text-center font-bold text-pink-600 shadow-sm sm:mb-0 sm:w-full">
      {title}
      <span className="absolute -right-7 top-1/2 hidden h-0.5 w-7 bg-pink-300 sm:block" aria-hidden="true" />
    </div>
    <div className="relative grid gap-4 sm:pl-6">
      <span className="absolute bottom-7 left-0 top-7 hidden w-0.5 rounded-full bg-pink-300 sm:block" aria-hidden="true" />
      {items.map((item, i) => <div key={i} className="relative min-w-0 rounded-xl border border-pink-200 bg-pink-50/80 p-3">
        <span className="absolute -left-6 top-7 hidden h-0.5 w-6 bg-pink-300 sm:block" aria-hidden="true" />
        <span className="absolute -left-[27px] top-[25px] hidden size-1.5 rounded-full bg-pink-500 sm:block" aria-hidden="true" />
        <h4 className="mb-2 font-semibold text-[#27235c]">{item.label}</h4>
        <ul className="space-y-1.5 pl-5 text-sm leading-relaxed text-[#29255d]">{item.details.map((detail, j) => <li key={j} className="list-disc marker:text-pink-400">{detail}</li>)}</ul>
      </div>)}
    </div>
  </section>
}

function PassiveDiagram() {
  return <section className="my-5">
    <h3 className="mb-2 text-lg font-semibold uppercase text-[#27235c]">Sơ đồ chuyển câu chủ động → bị động</h3>
    <div className="max-w-full overflow-x-auto rounded-xl border border-sky-200 bg-gradient-to-b from-cyan-50 to-indigo-50 p-4" role="region" aria-label="Sơ đồ chủ động bị động" tabIndex={0}>
      <div className="relative mx-auto h-48 min-w-[560px] max-w-[620px]">
        <svg className="absolute inset-0 size-full" viewBox="0 0 620 192" aria-hidden="true">
          <path d="M 126 48 C 120 95, 470 95, 486 148 M 486 48 C 465 96, 143 99, 126 148" fill="none" stroke="#6257c9" strokeWidth="2" />
          <path d="M 310 48 L 310 148" fill="none" stroke="#ec4899" strokeWidth="2" />
          <circle cx="126" cy="148" r="5" fill="#6257c9" /><circle cx="486" cy="148" r="5" fill="#6257c9" /><circle cx="310" cy="148" r="5" fill="#ec4899" />
        </svg>
        <div className="absolute inset-x-0 top-0 grid grid-cols-3 gap-3 text-center text-sm font-semibold"><span className="rounded-md bg-white px-2 py-2 text-[#27235c]">Subject · S</span><span className="rounded-md bg-white px-2 py-2 text-pink-600">Verb · V</span><span className="rounded-md bg-white px-2 py-2 text-blue-700">Object · O</span></div>
        <div className="absolute inset-x-0 bottom-0 grid grid-cols-3 gap-3 text-center text-sm font-semibold"><span className="rounded-md bg-white px-2 py-2 text-blue-700">Object → S</span><span className="rounded-md bg-white px-2 py-2 text-pink-600">be + V3/ed</span><span className="rounded-md bg-white px-2 py-2 text-[#27235c]">by + Subject</span></div>
      </div>
    </div>
    <p className="mt-2 text-sm italic text-indigo-700">Sarah invited some friends. → Some friends were invited by Sarah.</p>
  </section>
}

function RelativeDiagram() {
  return <section className="my-5 rounded-xl border border-indigo-200 bg-gradient-to-br from-cyan-50 to-pink-50 p-4">
    <h3 className="mb-4 text-lg font-semibold uppercase text-[#27235c]">Mệnh đề quan hệ bổ nghĩa cho danh từ</h3>
    <div className="mb-4 flex items-end justify-around gap-4 border-b border-indigo-100 pb-3">
      <Illustration kind="house" label="Ngôi nhà" />
      <span className="pb-4 text-2xl font-bold text-indigo-500">＋</span>
      <Illustration kind="temple" label="Địa điểm" />
    </div>
    <div className="grid gap-2 text-sm font-semibold sm:grid-cols-[1fr_auto_1fr] sm:items-center">
      <div className="rounded-xl border border-sky-200 bg-white p-4"><p className="mb-1 text-xs uppercase text-blue-600">Ý chính</p>I live in a beautiful <span className="rounded bg-sky-100 px-1 text-blue-700">place</span>.</div>
      <span className="text-center text-2xl text-indigo-500">＋</span>
      <div className="rounded-xl border border-pink-200 bg-white p-4"><p className="mb-1 text-xs uppercase text-pink-600">Thông tin thêm</p>That <span className="rounded bg-pink-100 px-1 text-pink-600">place</span> is Hanoi.</div>
    </div>
    <div className="my-2 text-center text-2xl text-pink-500">↓</div>
    <p className="rounded-xl border border-indigo-200 bg-white p-4 text-center text-sm font-semibold">I live in a beautiful place <span className="text-pink-600">which is Hanoi</span>.</p>
    <p className="mt-2 text-xs italic text-indigo-600">which thay thế danh từ place và nối phần thông tin thêm.</p>
  </section>
}

function Illustration({ kind, label }: { kind: "house" | "temple" | "person" | "car" | "classroom"; label: string }) {
  const stroke = "#312e81"
  return <figure className="flex min-w-0 flex-col items-center gap-1 text-center">
    <svg viewBox="0 0 128 104" role="img" aria-label={label} className="h-20 w-24 sm:h-24 sm:w-28">
      {kind === "house" && <>
        <path d="M9 49 64 9l55 40" fill="none" stroke={stroke} strokeWidth="5" strokeLinejoin="round" />
        <path d="M20 47h88v51H20z" fill="#dbeafe" stroke={stroke} strokeWidth="3" />
        <path d="M54 63h22v35H54z" fill="#f9a8d4" stroke={stroke} strokeWidth="2" />
        <path d="M28 58h18v17H28zM82 58h18v17H82z" fill="#fff" stroke="#60a5fa" strokeWidth="2" />
      </>}
      {kind === "temple" && <>
        <path d="M12 33 64 10l52 23z" fill="#c7d2fe" stroke={stroke} strokeWidth="3" />
        <path d="M20 41h88M20 89h88M13 96h102" fill="none" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
        {[34, 54, 74, 94].map((x) => <rect key={x} x={x} y="43" width="8" height="43" rx="2" fill="#93c5fd" stroke={stroke} strokeWidth="2" />)}
      </>}
      {kind === "person" && <>
        <circle cx="55" cy="24" r="12" fill="#fbc9ac" stroke={stroke} strokeWidth="2" />
        <path d="M37 16q16-24 32 0M45 39q15-9 27 0l9 35H37z" fill="#f9a8d4" stroke={stroke} strokeWidth="2" />
        <path d="M12 75h106M24 78v22M106 78v22M49 75l-13 23M69 75l13 23" fill="none" stroke={stroke} strokeWidth="3" />
        <rect x="79" y="52" width="29" height="22" rx="2" fill="#bfdbfe" stroke={stroke} strokeWidth="2" />
      </>}
      {kind === "car" && <>
        <path d="M11 71v-17q0-7 8-8l15-3 12-22h41l13 22 11 3q7 2 7 9v16z" fill="#fb7185" stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
        <path d="M44 44 53 27h27l10 17z" fill="#dbeafe" stroke={stroke} strokeWidth="2" />
        <circle cx="37" cy="76" r="10" fill="#1e1b4b" /><circle cx="93" cy="76" r="10" fill="#1e1b4b" />
        <circle cx="37" cy="76" r="4" fill="#fff" /><circle cx="93" cy="76" r="4" fill="#fff" />
      </>}
      {kind === "classroom" && <>
        <rect x="8" y="12" width="112" height="64" rx="3" fill="#d1fae5" stroke={stroke} strokeWidth="3" />
        <path d="M20 66h88M34 98V80h60v18M44 81v17M84 81v17" fill="none" stroke={stroke} strokeWidth="3" />
        <circle cx="64" cy="41" r="9" fill="#fbc9ac" stroke={stroke} strokeWidth="2" />
        <path d="M48 68V58q4-10 16-10t16 10v10" fill="#a5b4fc" stroke={stroke} strokeWidth="2" />
      </>}
    </svg>
    <figcaption className="text-xs font-semibold text-indigo-600">{label}</figcaption>
  </figure>
}

function IllustratedReduction() {
  const pairs: { kind: "person" | "house" | "classroom" | "car"; label: string; before: string; after: string; rule: string }[] = [
    { kind: "person", label: "Người ngồi đối diện", before: "The girl who sits opposite me is very talented.", after: "The girl sitting opposite me is very talented.", rule: "Chủ động: who sits → sitting" },
    { kind: "house", label: "Ngôi nhà nhìn ra hồ", before: "They stay in a big house which overlooks a swimming pool.", after: "They stay in a big house overlooking a swimming pool.", rule: "Chủ động: which overlooks → overlooking" },
    { kind: "classroom", label: "Lớp học", before: "All the lessons which are taught by Ms Linh are interesting.", after: "All the lessons taught by Ms Linh are interesting.", rule: "Bị động: which are taught → taught" },
    { kind: "car", label: "Ô tô đỗ bên ngoài", before: "There was a big red car which was parked outside the house.", after: "There was a big red car parked outside the house.", rule: "Bị động: which was parked → parked" },
  ]
  return <section className="my-5 space-y-3">
    <h3 className="text-lg font-semibold uppercase text-[#27235c]">Ví dụ trực quan · V-ing và V3/ed</h3>
    {pairs.map((pair) => <div key={pair.kind} className="grid items-center gap-3 rounded-xl border border-pink-200 bg-gradient-to-r from-white to-pink-50/60 p-3 sm:grid-cols-[8rem_1fr]">
      <Illustration kind={pair.kind} label={pair.label} />
      <div className="min-w-0 space-y-1 text-sm leading-relaxed"><p className="text-muted-foreground line-through decoration-pink-400">{pair.before}</p><p className="font-semibold text-[#27235c]">{pair.after}</p><span className="inline-block rounded-full bg-pink-100 px-2 py-0.5 text-xs font-semibold text-pink-700">{pair.rule}</span></div>
    </div>)}
  </section>
}

function SpecialPage({ number }: { number: number }): ReactNode {
  switch (number) {
    case 1: return <div className="flex min-h-[650px] flex-col items-center justify-center gap-8 rounded-2xl border-2 border-[#29255d] bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-6 text-center sm:min-h-[750px]">
      <div><p className="font-serif text-4xl font-bold text-[#171348] sm:text-5xl">ÔN TẬP KIẾN THỨC</p><p className="mt-2 font-serif text-4xl font-bold italic text-indigo-500">Khóa 3–4</p></div>
      <div className="grid grid-cols-2 gap-3 text-xl font-bold sm:text-2xl"><span className="col-span-2 rounded-lg border-2 border-[#29255d] bg-sky-200 px-6 py-3">Grammar</span><span className="rounded-lg border-2 border-[#29255d] bg-rose-200 px-4 py-3">Speaking</span><span className="rounded-lg border-2 border-[#29255d] bg-pink-100 px-4 py-3">Writing</span><span className="rounded-lg border-2 border-[#29255d] bg-cyan-200 px-4 py-3">Reading</span><span className="rounded-lg border-2 border-[#29255d] bg-blue-100 px-4 py-3">Listening</span></div>
    </div>
    case 14: return <PassiveDiagram />
    case 15: return <PassiveDiagram />
    case 16: return <><PassiveDiagram /><Flow heading="Từ câu chủ động sang câu bị động" steps={[
      { label: "Bước 1", text: "Xác định tân ngữ của câu chủ động. Someone stole my sister's bike yesterday → My sister's bike." },
      { label: "Bước 2", text: "Xác định thì của động từ, chọn be tương ứng và V3/ed: stole → was stolen." },
      { label: "Bước 3–4", text: "Chuyển chủ ngữ cũ vào by + O nếu cần, rồi hoàn tất: My sister's bike was stolen yesterday." },
    ]} /></>
    case 21: return <><RelativeDiagram /><Flow heading="Ghép hai ý bằng mệnh đề quan hệ" steps={[
      { label: "Thông tin chính", text: "I live in a beautiful place." },
      { label: "Thông tin thêm", text: "That place is Hanoi." },
      { label: "Câu hoàn chỉnh", text: "I live in a beautiful place which is Hanoi." },
    ]} /></>
    case 26: return <IllustratedReduction />
    case 29: return <>
      <h3 className="mb-3 text-lg font-semibold uppercase text-[#27235c]">Tổng hợp danh sách từ vựng</h3>
      <Table columns={["Chủ đề", "Tài liệu trong bản gốc"]} rows={[
        ["Shopping", "LESSON 1 - SHOPPING.docx"], ["Sports", "LESSON 2 - SPORTS.docx"], ["Learning", "LESSON 3 - LEARNING.docx"],
        ["Transport", "LESSON 4 - TRANSPORT.docx"], ["Healthy Lifestyle", "LESSON 5 - HEALTHY LIFESTYLE.docx"], ["Relationship", "LESSON 6 - FAMILY & RELATIONS.docx"], ["Work", "LESSON 7 - WORK.docx"],
      ]} />
      <p className="text-sm italic text-indigo-700">Ôn theo từng chủ đề Speaking và dùng từ vựng phù hợp khi trả lời.</p>
    </>
    case 30: return <>
      <h3 className="mb-3 text-lg font-semibold uppercase text-[#27235c]">Cấu trúc đoạn văn</h3>
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]"><div className="rounded-xl bg-cyan-50 p-4 text-sm leading-8 text-[#29255d]">
        <strong>There are many excellent reasons for exercising several times each week.</strong> <em className="text-pink-600">First,</em> people who exercise look better. Exercise is important to keep our bodies in good shape. <em className="text-pink-600">In addition,</em> people who exercise have more energy. <em className="text-pink-600">For example,</em> a person who exercises can walk up stairs or climb hills more easily. <em className="text-pink-600">Finally,</em> exercise reduces stress and helps you have a clear mind.
      </div><div className="space-y-3"><div className="rounded-lg bg-sky-100 p-3 text-sm"><strong>Topic sentence</strong><p>Nêu ý/quan điểm chính của đoạn văn.</p></div><div className="rounded-lg bg-pink-100 p-3 text-sm"><strong>Supporting sentences</strong><p>Giải thích, ví dụ hoặc thông tin hỗ trợ ý chính.</p></div></div></div>
      <Table columns={["Transition signals", "Cách dùng"]} rows={[["First / First of all / Second / Third", "Trình tự ý"], ["In addition / Also", "Bổ sung"], ["Finally", "Ý cuối"], ["For example / such as", "Đưa ví dụ"]]} />
    </>
    case 31: return <>
      <h3 className="mb-2 text-lg font-semibold text-pink-600">Playing sports</h3>
      <p className="rounded-lg bg-cyan-50 p-3 text-sm"><strong>Topic sentence:</strong> Playing sports offers numerous benefits for both physical and mental health.</p>
      <ul className="my-3 list-disc space-y-2 pl-6 text-sm leading-relaxed text-[#29255d]"><li>Improves physical health, flexibility and fitness.</li><li>Reduces stress, anxiety and depression.</li><li>Boosts self-esteem, confidence and social skills.</li><li>Offers enjoyment, achievement and overall well-being.</li></ul>
      <h3 className="mt-5 text-lg font-semibold text-pink-600">Shopping · Online vs In-store</h3>
      <Table columns={["Online", "In-store"]} rows={[["Shop from home; avoid traffic, parking and crowds.", "See and touch products before buying."], ["Compare prices easily; shop at any time.", "Immediate gratification and in-person assistance."], ["Competitive prices.", "More social and interactive experience."]]} />
    </>
    case 32: return <>
      <h3 className="mb-3 text-lg font-semibold uppercase text-[#27235c]">Studying online courses</h3>
      <Table columns={["Advantages · Ưu điểm", "Disadvantages · Hạn chế"]} rows={[["Flexibility: learn when it suits you.", "Limited face-to-face interaction."], ["Accessibility from many places.", "Technical issues can interrupt learning."], ["Cost-effective and self-paced learning.", "Requires self-motivation; fewer physical resources."]]} />
    </>
    case 33: return <>
      <h3 className="text-lg font-semibold uppercase text-[#27235c]">Skimming & Scanning</h3>
      <Branches title="2 important reading skills" items={[{ label: "Skimming", details: ["Read quickly to get the general idea of the text."] }, { label: "Scanning", details: ["Read quickly to find a specific piece of information."] }]} />
      <Branches title="Reading question types" items={[{ label: "Multiple choice", details: ["Choose the best answer among the options."] }, { label: "Short-answer questions", details: ["Find exact words and respect the word limit."] }, { label: "Sentence completion", details: ["Complete the sentence using information from the text."] }]} />
    </>
    case 34: return <Branches title="Reading strategies" items={[
      { label: "Multiple choice", details: ["Underline keywords in questions and options.", "Locate the relevant part of the text.", "Read carefully, eliminate wrong options, choose the best answer."] },
      { label: "Short-answer questions", details: ["Read the instruction and word limit.", "Underline keywords; scan for words or synonyms.", "Locate the exact word or phrase, then repeat for each question."] },
      { label: "Sentence completion", details: ["Read the instruction.", "Underline keywords and scan for similar meanings.", "Read the sentences carefully and decide the answer."] },
    ]} />
    case 35: return <>
      <Branches title="Listening question types" items={[{ label: "Table & form completion", details: ["Listen for missing information and write it exactly."] }, { label: "Multiple choice", details: ["Follow the questions as the recording plays."] }]} />
      <Branches title="Strategies & tips" items={[
        { label: "Table & form completion", details: ["Read the instructions and note the word limit.", "Understand the form; think of synonyms.", "Predict the type of answer and listen carefully."] },
        { label: "Multiple choice", details: ["The recording may use different words from the options.", "Listen for similar meaning, not just repeated words.", "Questions normally follow the order of the recording."] },
      ]} />
    </>
    default: return null
  }
}

export function IfaReviewPage({ number }: { number: number }) {
  const plan = PAGE_PLANS[number]
  const part = number === 1 ? "Bìa" : number <= 28 ? "Grammar" : number === 29 ? "Speaking" : number <= 32 ? "Writing" : number <= 34 ? "Reading" : "Listening"
  return (
    <article id={`ifa-review-page-${number}`} className="scroll-mt-40 overflow-hidden rounded-xl border border-indigo-100 bg-white text-[#29255d] shadow-card sm:rounded-2xl">
      <div className="relative min-h-[550px] bg-[radial-gradient(circle_at_15%_5%,#eaf7ff_0%,transparent_35%),radial-gradient(circle_at_85%_90%,#e8efff_0%,transparent_35%)] px-4 pb-10 pt-5 sm:min-h-[900px] sm:px-9 sm:pt-7">
        <div className="mb-5 flex items-center justify-between border-b-2 border-dotted border-indigo-100 pb-3 text-[11px] font-semibold uppercase tracking-[0.13em] text-indigo-500">
          <span>Ôn tập kiến thức · Khóa 3–4</span><span>{part} · {String(number).padStart(2, "0")}</span>
        </div>
        {number === 1 ? <SpecialPage number={1} /> : <div className="min-w-0">
          {(number === 2 || number === 5 || number === 6 || number === 8 || number === 10 || number === 11 || number === 13 || number === 14 || number === 19 || number === 21 || number === 27 || number >= 29) && (
            <div className="mb-5"><h2 className="font-serif text-2xl font-bold leading-tight text-[#24164e] sm:text-4xl">{number === 29 ? "Part 2 · SPEAKING" : number === 30 ? "Part 3 · WRITING" : number === 33 ? "Part 4 · READING" : number === 35 ? "Part 5 · LISTENING" : plan.title} {plan.lesson && <span className="font-sans text-sm font-semibold italic text-indigo-500 sm:text-lg">{plan.lesson}</span>}</h2>{number >= 29 && <p className="mt-2 text-lg uppercase text-[#29255d]">{plan.title}</p>}</div>
          )}
          {plan.refs?.map(([topic, section], i) => <TopicBlock key={`${topic}-${section}-${i}`} section={ifaGrammar[topic].sections[section]} />)}
          <SpecialPage number={number} />
        </div>}
      </div>
      <div className="border-t border-indigo-100 bg-indigo-50/60 px-4 py-2 text-right text-xs font-semibold text-indigo-600">Trang {number} / 35</div>
    </article>
  )
}
