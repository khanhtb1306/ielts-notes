import { ifaFinalTopics } from "@/data/ifa-final-speaking"
import { ifaSpeakingHandouts } from "@/data/ifa-speaking"
import type { IfaFinalQuestion, IfaFinalTopic } from "@/types/content"

export { ifaFinalTopics }

export const allFinalQuestions = ifaFinalTopics.flatMap((topic) =>
  topic.questions.map((question) => ({ ...question, topicId: topic.id, topicLabel: topic.label }))
)

export type FinalQuestionWithTopic = IfaFinalQuestion & { topicId: string; topicLabel: string }

export function findFinalQuestion(id: string): FinalQuestionWithTopic | undefined {
  return allFinalQuestions.find((q) => q.id === id)
}

export function findFinalTopic(id: string): IfaFinalTopic | undefined {
  return ifaFinalTopics.find((t) => t.id === id)
}

/** Only clearly corresponding handout questions may offer a saved lesson answer. */
const HANDOUT_MATCHES: Record<string, [string, number][]> = {
  "studying-01": [["dc4hs", 3], ["dc4uni", 0]],
  "studying-02": [["dc4hs", 0], ["dc4uni", 0]],
  "studying-03": [["dc4hs", 3]],
  "studying-04": [["dc4hs", 2]],
  "studying-05": [["dc4hs", 4]],
  "studying-07": [["dc4hs", 2]],
  "working-01": [["dc8work", 0], ["dc8student", 0]],
  "working-02": [["dc8work", 1], ["dc8student", 1]],
  "working-03": [["dc8work", 1]],
  "transport-01": [["dc5", 0]],
  "transport-02": [["dc5", 3]],
  "transport-03": [["dc5", 1], ["dc5", 4]],
  "transport-04": [["dc5", 2]],
  "transport-05": [["dc5", 5]],
  "transport-06": [["dc5", 1]],
  "transport-07": [["dc5", 6]],
  "shopping-01": [["dc2", 0]],
  "shopping-02": [["dc2", 3]],
  "shopping-03": [["dc2", 1]],
  "shopping-04": [["dc2", 2]],
  "shopping-05": [["dc2", 2]],
  "sports-01": [["dc3", 0]],
  "sports-02": [["dc3", 1]],
  "sports-03": [["dc3", 3]],
  "sports-04": [["dc3", 4]],
  "sports-05": [["dc3", 5]],
  "healthy-01": [["dc6", 0]],
  "healthy-02": [["dc6", 2]],
  "healthy-03": [["dc6", 3]],
  "healthy-04": [["dc6", 4]],
  "healthy-05": [["dc6", 1]],
  "healthy-06": [["dc6", 1]],
  "family-01": [["dc7", 1]],
  "family-02": [["dc7", 4]],
  "family-03": [["dc7", 5]],
  "family-04": [["dc7", 4]],
  "family-05": [["dc7", 0]],
  "family-06": [["dc7", 3]],
  "family-07": [["dc7", 6]],
  "movies-01": [["dc9", 0]],
  "movies-02": [["dc9", 1]],
  "movies-03": [["dc9", 2]],
  "movies-04": [["dc9", 3]],
}

export function relatedLessonQuestions(id: string) {
  return (HANDOUT_MATCHES[id] ?? []).map(([handoutId, index]) => {
    const handout = ifaSpeakingHandouts.find((h) => h.id === handoutId)
    const question = handout?.questions[index]
    return handout && question ? { handout, question, index } : null
  }).filter((entry): entry is NonNullable<typeof entry> => !!entry)
}

const ANSWER_MATCHES = new Set([
  "studying-04", "studying-05", "working-01", "transport-04", "transport-05",
  "shopping-01", "shopping-03", "shopping-04", "sports-02", "sports-03",
  "sports-04", "sports-05", "healthy-04", "family-04", "family-07",
  "movies-01", "movies-02", "movies-03", "movies-04",
])

export function matchedHandoutAnswers(
  id: string,
  answers: Record<string, { answer: string; title: string }>
) {
  return (ANSWER_MATCHES.has(id) ? HANDOUT_MATCHES[id] ?? [] : [])
    .map(([handoutId, index]) => answers[`${handoutId}::${index}`])
    .filter((answer): answer is { answer: string; title: string } => !!answer?.answer)
}

function tieBreaker(date: string, id: string) {
  let hash = 2166136261
  for (const c of date + id) hash = Math.imul(hash ^ c.charCodeAt(0), 16777619)
  return hash >>> 0
}

export function localDay(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/** Least-practised first; spread across topics before taking a second question from one topic. */
export function dailyFinalQuestions(
  questions: FinalQuestionWithTopic[],
  progress: Record<string, { attempts: number; status: string; lastPractisedAt?: number }>,
  date: string,
  size = 10
): string[] {
  const ordered = [...questions].sort((a, b) => {
    const x = progress[a.id]
    const y = progress[b.id]
    return (x?.attempts ?? 0) - (y?.attempts ?? 0)
      || Number(x?.status === "confident") - Number(y?.status === "confident")
      || (x?.lastPractisedAt ?? 0) - (y?.lastPractisedAt ?? 0)
      || tieBreaker(date, a.id) - tieBreaker(date, b.id)
  })
  const chosen: FinalQuestionWithTopic[] = []
  const usedTopics = new Set<string>()
  for (const q of ordered) {
    if (chosen.length >= size) break
    if (usedTopics.has(q.topicId)) continue
    chosen.push(q)
    usedTopics.add(q.topicId)
  }
  for (const q of ordered) {
    if (chosen.length >= size) break
    if (!chosen.includes(q)) chosen.push(q)
  }
  return chosen.map((q) => q.id)
}
