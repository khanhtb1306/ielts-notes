import { ifaSpeakingHandouts } from "@/data/ifa-speaking"

/**
 * One flashcard. Terms repeated across handouts (e.g. the three Study audience
 * variants) collapse into a single card carrying every topic it appeared in.
 */
export interface IfaVocabCard {
  id: string
  term: string
  pos: string
  ipa: string
  vi: string
  topics: string[]
  lessons: number[]
}

export interface IfaVocabTopic {
  label: string
  count: number
}

/** Normalised key used to merge duplicates. */
function cardId(term: string): string {
  return term.trim().toLowerCase().replace(/\s+/g, " ")
}

let cache: IfaVocabCard[] | null = null

/** Flat, de-duplicated vocabulary derived from the speaking handouts. */
export function ifaVocabCards(): IfaVocabCard[] {
  if (cache) return cache

  const map = new Map<string, IfaVocabCard>()
  for (const handout of ifaSpeakingHandouts) {
    for (const question of handout.questions) {
      for (const v of question.vocab) {
        const id = cardId(v.term)
        if (!id) continue
        const existing = map.get(id)
        if (!existing) {
          map.set(id, {
            id,
            term: v.term.trim(),
            pos: v.pos,
            ipa: v.ipa,
            vi: v.vi,
            topics: [handout.topicLabel],
            lessons: handout.lesson != null ? [handout.lesson] : [],
          })
          continue
        }
        if (!existing.topics.includes(handout.topicLabel)) existing.topics.push(handout.topicLabel)
        if (handout.lesson != null && !existing.lessons.includes(handout.lesson)) {
          existing.lessons.push(handout.lesson)
        }
        // Keep the first reading but surface disagreements instead of hiding them.
        if (import.meta.env.DEV && existing.vi !== v.vi) {
          console.warn(
            `[ifa-vocab] "${v.term}" có 2 nghĩa khác nhau: "${existing.vi}" vs "${v.vi}" — giữ bản đầu.`
          )
        }
      }
    }
  }

  cache = [...map.values()]
  return cache
}

/** Topics with the number of distinct cards in each, ordered by first appearance. */
export function ifaVocabTopics(): IfaVocabTopic[] {
  const counts = new Map<string, number>()
  for (const card of ifaVocabCards()) {
    for (const t of card.topics) counts.set(t, (counts.get(t) ?? 0) + 1)
  }
  return [...counts.entries()].map(([label, count]) => ({ label, count }))
}

export function cardsInTopic(topic: string): IfaVocabCard[] {
  const all = ifaVocabCards()
  return topic ? all.filter((c) => c.topics.includes(topic)) : all
}

/** Strip a leading "to " so the speech engine reads the bare word. */
export function speakableTerm(term: string): string {
  return term.replace(/^to\s+/i, "")
}

/**
 * Loose comparison for typed answers: ignores case, accents-free punctuation,
 * the infinitive "to", articles and repeated spaces. A learner typing
 * "go shopping" for "to go shopping" is right.
 */
export function normaliseAnswer(input: string): string {
  return input
    .toLowerCase()
    .replace(/[.,!?;:"'’()]/g, " ")
    .replace(/^\s*(to|a|an|the)\s+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function answersMatch(input: string, expected: string): boolean {
  const a = normaliseAnswer(input)
  const b = normaliseAnswer(expected)
  if (!a) return false
  if (a === b) return true
  // Accept either side of a "x / y" alternative, e.g. "to be into / fond of".
  return expected
    .split("/")
    .map((part) => normaliseAnswer(part))
    .some((part) => part.length > 0 && part === a)
}

/** Stable 32-bit hash, used to seed per-card randomness deterministically. */
export function hashId(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Pick `n` wrong options, preferring cards from the same topic. */
export function distractors(
  card: IfaVocabCard,
  pool: IfaVocabCard[],
  n: number,
  rnd: () => number
): IfaVocabCard[] {
  const others = pool.filter((c) => c.id !== card.id)
  const topicSet = new Set(card.topics)
  const sameTopic: IfaVocabCard[] = []
  const rest: IfaVocabCard[] = []
  for (const c of others) {
    if (c.topics.some((t) => topicSet.has(t))) sameTopic.push(c)
    else rest.push(c)
  }
  const picked: IfaVocabCard[] = []
  for (const bucket of [sameTopic, rest]) {
    const shuffled = bucket.slice()
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    for (const c of shuffled) {
      if (picked.length >= n) break
      // Avoid an option that reads identically to the answer.
      if (picked.some((p) => p.vi === c.vi) || c.vi === card.vi) continue
      picked.push(c)
    }
    if (picked.length >= n) break
  }
  return picked
}

/**
 * Every English term that carries the same Vietnamese meaning. 4 meanings in the
 * data map to several terms ("thỉnh thoảng" has 5), so asking Việt → Anh has more
 * than one right answer and all of them must be accepted.
 */
export function synonymTerms(card: IfaVocabCard, pool: IfaVocabCard[]): string[] {
  const target = card.vi.trim().toLowerCase()
  const terms = pool.filter((c) => c.vi.trim().toLowerCase() === target).map((c) => c.term)
  return terms.length ? terms : [card.term]
}
