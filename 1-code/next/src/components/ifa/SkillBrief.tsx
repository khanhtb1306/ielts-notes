import type { ReactNode } from "react"
import { BookOpenCheck, PenLine, Headphones } from "lucide-react"
import { PageSection } from "@/components/common/Page"

type Skill = "reading" | "writing" | "listening"

const SKILL_ICON = { reading: BookOpenCheck, writing: PenLine, listening: Headphones } as const
const SKILL_TITLE: Record<Skill, string> = {
  reading: "Ôn lý thuyết Reading",
  writing: "Ôn lý thuyết Writing",
  listening: "Ôn lý thuyết Listening",
}

// ── Compact render primitives (same content as the handout, denser layout) ───

/** Small sub-heading inside the brief. */
function H({ children }: { children: ReactNode }) {
  return <h4 className="text-xs font-bold uppercase tracking-wide text-primary">{children}</h4>
}

/** A labelled item with optional bullet points — replaces the large branch
 *  diagram with a tight definition-list row. */
function Item({ label, points }: { label: string; points: string[] }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-2.5">
      <p className="text-sm font-semibold">{label}</p>
      <ul className="mt-0.5 space-y-0.5 pl-4 text-sm text-muted-foreground">
        {points.map((p, i) => (
          <li key={i} className="list-disc marker:text-primary/60">{p}</li>
        ))}
      </ul>
    </div>
  )
}

function MiniTable({ columns, rows }: { columns: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-muted/60">
            {columns.map((c, i) => (
              <th key={i} className="border-b border-border px-2.5 py-1.5 text-left font-semibold">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="odd:bg-card even:bg-muted/20">
              {row.map((cell, j) => (
                <td key={j} className="border-b border-border px-2.5 py-1.5 align-top last:border-b-0">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Per-skill content (verbatim from the review handout) ─────────────────────

function ReadingBrief() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <H>2 kỹ năng đọc quan trọng</H>
        <div className="grid gap-2 sm:grid-cols-2">
          <Item label="Skimming" points={["Read quickly to get the general idea of the text."]} />
          <Item label="Scanning" points={["Read quickly to find a specific piece of information."]} />
        </div>
      </div>

      <div className="space-y-2">
        <H>Dạng câu hỏi & chiến lược</H>
        <div className="grid gap-2 sm:grid-cols-3">
          <Item label="Multiple choice" points={[
            "Underline keywords in questions and options.",
            "Locate the relevant part of the text.",
            "Eliminate wrong options, choose the best answer.",
          ]} />
          <Item label="Short-answer questions" points={[
            "Read the instruction and word limit.",
            "Underline keywords; scan for words or synonyms.",
            "Locate the exact word or phrase.",
          ]} />
          <Item label="Sentence completion" points={[
            "Read the instruction.",
            "Scan for similar meanings.",
            "Read the sentences carefully and decide.",
          ]} />
        </div>
      </div>
    </div>
  )
}

function WritingBrief() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <H>Cấu trúc đoạn văn</H>
        <div className="grid gap-2 sm:grid-cols-[2fr_1fr]">
          <p className="rounded-lg border border-border bg-muted/30 p-3 text-sm leading-relaxed">
            <strong>There are many excellent reasons for exercising several times each week.</strong>{" "}
            <em className="text-primary">First,</em> people who exercise look better. Exercise is important to keep our bodies in good shape.{" "}
            <em className="text-primary">In addition,</em> people who exercise have more energy.{" "}
            <em className="text-primary">For example,</em> a person who exercises can walk up stairs or climb hills more easily.{" "}
            <em className="text-primary">Finally,</em> exercise reduces stress and helps you have a clear mind.
          </p>
          <div className="space-y-2 text-sm">
            <div className="rounded-lg border border-border bg-muted/30 p-2.5">
              <strong>Topic sentence</strong>
              <p className="text-muted-foreground">Nêu ý/quan điểm chính của đoạn văn.</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-2.5">
              <strong>Supporting sentences</strong>
              <p className="text-muted-foreground">Giải thích, ví dụ hoặc thông tin hỗ trợ ý chính.</p>
            </div>
          </div>
        </div>
        <MiniTable
          columns={["Transition signals", "Cách dùng"]}
          rows={[
            ["First / First of all / Second / Third", "Trình tự ý"],
            ["In addition / Also", "Bổ sung"],
            ["Finally", "Ý cuối"],
            ["For example / such as", "Đưa ví dụ"],
          ]}
        />
      </div>

      <div className="space-y-2">
        <H>Playing sports</H>
        <p className="rounded-lg border border-border bg-muted/30 p-2.5 text-sm">
          <strong>Topic sentence:</strong> Playing sports offers numerous benefits for both physical and mental health.
        </p>
        <ul className="space-y-0.5 pl-5 text-sm text-muted-foreground">
          <li className="list-disc marker:text-primary/60">Improves physical health, flexibility and fitness.</li>
          <li className="list-disc marker:text-primary/60">Reduces stress, anxiety and depression.</li>
          <li className="list-disc marker:text-primary/60">Boosts self-esteem, confidence and social skills.</li>
          <li className="list-disc marker:text-primary/60">Offers enjoyment, achievement and overall well-being.</li>
        </ul>
      </div>

      <div className="space-y-2">
        <H>Shopping · Online vs In-store</H>
        <MiniTable
          columns={["Online", "In-store"]}
          rows={[
            ["Shop from home; avoid traffic, parking and crowds.", "See and touch products before buying."],
            ["Compare prices easily; shop at any time.", "Immediate gratification and in-person assistance."],
            ["Competitive prices.", "More social and interactive experience."],
          ]}
        />
      </div>

      <div className="space-y-2">
        <H>Studying online courses</H>
        <MiniTable
          columns={["Advantages · Ưu điểm", "Disadvantages · Hạn chế"]}
          rows={[
            ["Flexibility: learn when it suits you.", "Limited face-to-face interaction."],
            ["Accessibility from many places.", "Technical issues can interrupt learning."],
            ["Cost-effective and self-paced learning.", "Requires self-motivation; fewer physical resources."],
          ]}
        />
      </div>
    </div>
  )
}

function ListeningBrief() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <H>Dạng câu hỏi</H>
        <div className="grid gap-2 sm:grid-cols-2">
          <Item label="Table & form completion" points={["Listen for missing information and write it exactly."]} />
          <Item label="Multiple choice" points={["Follow the questions as the recording plays."]} />
        </div>
      </div>

      <div className="space-y-2">
        <H>Chiến lược & mẹo</H>
        <div className="grid gap-2 sm:grid-cols-2">
          <Item label="Table & form completion" points={[
            "Read the instructions and note the word limit.",
            "Understand the form; think of synonyms.",
            "Predict the type of answer and listen carefully.",
          ]} />
          <Item label="Multiple choice" points={[
            "The recording may use different words from the options.",
            "Listen for similar meaning, not just repeated words.",
            "Questions normally follow the order of the recording.",
          ]} />
        </div>
      </div>
    </div>
  )
}

/**
 * Compact theory recap for a skill — same content as the IFA review handout,
 * but trimmed to a dense card above the practice list.
 */
export function SkillBrief({ skill }: { skill: Skill }) {
  const Icon = SKILL_ICON[skill]
  return (
    <PageSection
      title={<span className="flex items-center gap-2"><Icon className="size-4 text-primary" /> {SKILL_TITLE[skill]}</span>}
      description="Tóm tắt từ tài liệu ôn tập trên lớp — xem trước khi luyện đề."
    >
      {skill === "reading" && <ReadingBrief />}
      {skill === "writing" && <WritingBrief />}
      {skill === "listening" && <ListeningBrief />}
    </PageSection>
  )
}
