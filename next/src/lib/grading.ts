import type { Question } from "@/types/content"

export type Answer = unknown

export interface GradedItem {
  i: number
  q: Question
  ans: Answer
  ok: boolean
  topic: string
}

export interface GradeResult {
  score: number
  total: number
  breakdown: Record<string, { correct: number; total: number }>
  detail: GradedItem[]
}

export function normStr(s: unknown): string {
  return String(s == null ? "" : s)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
}

export interface HydratedQuestion {
  q: Question
  topic: string
}

export function gradeAnswer(q: Question, ans: Answer): boolean {
  if (q.kind === "single_choice") {
    const correct = (q.correctAnswer || [])[0]
    return ans != null && String(ans) === String(correct)
  }
  if (q.kind === "multi_select") {
    const c = new Set((q.correctAnswer || []).map(String))
    const a = new Set(((ans as (string | number)[]) || []).map(String))
    return c.size === a.size && [...c].every((x) => a.has(x))
  }
  if (q.kind === "fill_blank") {
    const blanks = q.blanks || []
    if (!blanks.length) return false
    return blanks.every((b, k) => {
      const user = normStr(((ans as string[]) || [])[k])
      const accepted = (b.answers || []).map(normStr)
      return accepted.length > 0 && accepted.includes(user)
    })
  }
  if (q.kind === "matching") {
    const pairs = q.pairs || []
    if (!pairs.length) return false
    return pairs.every((p, k) => String(((ans as string[]) || [])[k]) === String(p.rightId || k))
  }
  return false
}

export function gradeAll(hydrated: HydratedQuestion[], answers: Record<number, Answer>): GradeResult {
  let score = 0
  const total = hydrated.length
  const breakdown: Record<string, { correct: number; total: number }> = {}
  const detail: GradedItem[] = []
  hydrated.forEach((h, i) => {
    const ans = answers[i]
    const topic = h.topic
    const bucket = (breakdown[topic] = breakdown[topic] || { correct: 0, total: 0 })
    bucket.total++
    const ok = gradeAnswer(h.q, ans)
    if (ok) {
      score++
      bucket.correct++
    }
    detail.push({ i, q: h.q, ans, ok, topic })
  })
  return { score, total, breakdown, detail }
}
