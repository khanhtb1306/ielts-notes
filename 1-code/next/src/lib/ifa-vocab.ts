import { ifaSpeakingHandouts } from "@/data/ifa-speaking"
import { ifaFinalTopics } from "@/data/ifa-final-speaking"
import type { IfaPhrase, IfaScenario } from "@/types/content"

/** Where a card's wording comes from, used for the source filter. */
export type IfaVocabSource = "vocab" | "phrase" | "final"

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
  sources: IfaVocabSource[]
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

/** Merge one term into the card map, de-duplicating by normalised term. */
function addCard(
  map: Map<string, IfaVocabCard>,
  { term, pos, ipa, vi, topic, lesson, source }: {
    term: string; pos: string; ipa: string; vi: string
    topic: string; lesson: number | null; source: IfaVocabSource
  }
) {
  const id = cardId(term)
  if (!id || !vi.trim()) return
  const existing = map.get(id)
  if (!existing) {
    map.set(id, {
      id,
      term: term.trim(),
      pos,
      ipa,
      vi,
      topics: topic ? [topic] : [],
      lessons: lesson != null ? [lesson] : [],
      sources: [source],
    })
    return
  }
  if (topic && !existing.topics.includes(topic)) existing.topics.push(topic)
  if (lesson != null && !existing.lessons.includes(lesson)) existing.lessons.push(lesson)
  if (!existing.sources.includes(source)) existing.sources.push(source)
  // Fill IPA from a later appearance if the first one lacked it.
  if (!existing.ipa && ipa) existing.ipa = ipa
}

/** Every slot phrase in a scenario, including dependent group-2 places. */
function scenarioPhrases(scenario: IfaScenario): IfaPhrase[] {
  const out: IfaPhrase[] = []
  const push = (p?: IfaPhrase) => {
    if (!p?.en) return
    out.push(p)
    for (const place of p.places ?? []) if (place?.en) out.push(place)
  }
  for (const p of scenario.g1 ?? []) push(p)
  for (const g of scenario.g2groups ?? []) for (const p of g.items) push(p)
  for (const g of scenario.g3groups ?? []) for (const p of g.items) push(p)
  return out
}

/** Flat, de-duplicated vocabulary from handout vocab lists, slot phrases and final guides. */
export function ifaVocabCards(): IfaVocabCard[] {
  if (cache) return cache

  const map = new Map<string, IfaVocabCard>()

  // 1. Curated vocab lists on each handout question (short terms with part of speech).
  for (const handout of ifaSpeakingHandouts) {
    for (const question of handout.questions) {
      for (const v of question.vocab) {
        addCard(map, {
          term: v.term, pos: v.pos, ipa: v.ipa, vi: v.vi,
          topic: handout.topicLabel, lesson: handout.lesson ?? null, source: "vocab",
        })
      }
    }
  }

  // 2. Answer-building slot phrases — teacher wording with IPA, previously unused for cards.
  for (const handout of ifaSpeakingHandouts) {
    for (const question of handout.questions) {
      for (const scenario of question.scenarios) {
        for (const p of scenarioPhrases(scenario)) {
          addCard(map, {
            term: p.en, pos: "", ipa: p.ipa, vi: p.vi,
            topic: handout.topicLabel, lesson: handout.lesson ?? null, source: "phrase",
          })
        }
      }
    }
  }

  // 3. Final Speaking guide phrases (carry IPA, grouped by final topic).
  for (const topic of ifaFinalTopics) {
    for (const question of topic.questions) {
      for (const point of question.guide) {
        for (const p of point.phrases) {
          addCard(map, {
            term: p.en, pos: "", ipa: p.ipa, vi: p.vi,
            topic: topic.label, lesson: null, source: "final",
          })
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

export const VOCAB_SOURCE_LABELS: Record<IfaVocabSource, string> = {
  vocab: "Từ vựng chủ đề",
  phrase: "Cụm ghép câu",
  final: "Ôn thi cuối khóa",
}

/** Cards carrying a given source tag, for the source filter. */
export function cardsFromSource(cards: IfaVocabCard[], source: IfaVocabSource | "all"): IfaVocabCard[] {
  return source === "all" ? cards : cards.filter((c) => c.sources.includes(source))
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
