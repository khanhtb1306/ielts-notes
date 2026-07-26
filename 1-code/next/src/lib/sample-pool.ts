import type { FinalTestBlueprint, QuestionKind, TopicRef, TopicRole, TopicsIndex } from "@/types/content"

export interface SamplePoolConfig {
  mix: { topic: string; percent: number }[]
  total: number
  seed?: number
  questionTypes?: QuestionKind[]
  roles?: TopicRole[]
}

export interface SampledQuestion extends TopicRef {
  topic: string
}

export interface SampleResult {
  questions: SampledQuestion[]
  shortages: { topic: string; wanted: number; got: number }[]
  skipped: { topic: string; percent: number; reason: string }[]
  seed: number
}

const DEFAULT_TYPES: QuestionKind[] = ["fill_blank", "single_choice", "multi_select", "matching"]
const DEFAULT_ROLES: TopicRole[] = ["core", "review", "preview"]

/** Mulberry32-inspired seeded PRNG. Identical to vanilla `xrand`. */
export function seededRandom(seed: number): () => number {
  let s = seed >>> 0
  return function () {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function shuffle<T>(arr: T[], rnd: () => number): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function hashCode(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
  return h >>> 0
}

export function samplePool(topicsIndex: TopicsIndex, config: SamplePoolConfig): SampleResult {
  const total = config.total || 20
  const seed = config.seed ?? Math.floor(Math.random() * 1e9)
  const rnd = seededRandom(seed)
  const allowedTypes = new Set<QuestionKind>(config.questionTypes || DEFAULT_TYPES)
  const allowedRoles = new Set<TopicRole>(config.roles || DEFAULT_ROLES)

  const gather = (topic: string): TopicRef[] => {
    const t = topicsIndex.topics[topic]
    if (!t) return []
    return (t.refs || []).filter(
      (r) =>
        r.kind === "question" &&
        allowedRoles.has(r.role) &&
        r.qkind != null &&
        r.qkind !== "info" &&
        allowedTypes.has(r.qkind)
    )
  }

  const skipped: { topic: string; percent: number; reason: string }[] = []
  const validMix: { topic: string; percent: number; candidates: TopicRef[] }[] = []
  for (const m of config.mix || []) {
    const cand = gather(m.topic)
    if (!cand.length) {
      skipped.push({
        topic: m.topic,
        percent: m.percent,
        reason: topicsIndex.topics[m.topic] ? "no matching questions" : "topic not found",
      })
      continue
    }
    validMix.push({ topic: m.topic, percent: m.percent, candidates: cand })
  }

  if (!validMix.length) return { questions: [], shortages: [], skipped, seed }

  const sumPct = validMix.reduce((s, m) => s + m.percent, 0) || 1
  const raw = validMix.map((m) => ({
    topic: m.topic,
    exact: (m.percent / sumPct) * total,
    candidates: m.candidates,
  }))
  const floors = raw.map((r) => ({ ...r, n: Math.floor(r.exact), remain: r.exact - Math.floor(r.exact) }))
  let sum = floors.reduce((s, r) => s + r.n, 0)
  const sortedByRemain = floors.slice().sort((a, b) => b.remain - a.remain)
  let i = 0
  while (sum < total && i < sortedByRemain.length) {
    sortedByRemain[i].n += 1
    sum++
    i++
  }
  while (sum > total) {
    const idx2 = floors.findIndex((f) => f.n > 0)
    if (idx2 < 0) break
    floors[idx2].n--
    sum--
  }

  const picked: SampledQuestion[] = []
  const shortages: { topic: string; wanted: number; got: number }[] = []
  for (const f of floors) {
    if (f.n <= 0) continue
    const shuffled = shuffle(f.candidates, rnd)
    const take = shuffled.slice(0, f.n).map((r) => ({ ...r, topic: f.topic }))
    if (take.length < f.n) shortages.push({ topic: f.topic, wanted: f.n, got: take.length })
    picked.push(...take)
  }

  return { questions: shuffle(picked, rnd), shortages, skipped, seed }
}

export function sampleBlueprint(topicsIndex: TopicsIndex, blueprint: FinalTestBlueprint, seed: number): SampleResult {
  const picked: SampledQuestion[] = []
  const shortages: { topic: string; wanted: number; got: number }[] = []
  const skipped: { topic: string; percent: number; reason: string }[] = []
  const used = new Set<string>()

  for (let i = 0; i < (blueprint.sections || []).length; i++) {
    const section = blueprint.sections[i]
    const result = samplePool(topicsIndex, {
      mix: section.mix,
      total: section.total,
      seed: seed + i * 997,
      questionTypes: section.questionTypes,
    })
    skipped.push(...result.skipped)

    const unique = []
    for (const q of result.questions) {
      const key = `${q.lessonKey}::${q.itemId}`
      if (used.has(key)) continue
      used.add(key)
      unique.push(q)
    }
    if (unique.length < section.total) {
      shortages.push({ topic: section.id, wanted: section.total, got: unique.length })
    }
    picked.push(...unique)
  }

  return { questions: picked, shortages, skipped, seed }
}
