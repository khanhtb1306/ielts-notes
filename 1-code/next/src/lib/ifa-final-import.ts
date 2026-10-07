import { allFinalQuestions } from "@/lib/ifa-final-speaking"

export interface ImportedSpeakingDraft {
  questionId: string
  sourceQuestion: string
  answer: string
  exact: boolean
}

function normalize(text: string): string {
  return text.toLowerCase().normalize("NFKD").replace(/[’‘]/g, "'").replace(/[^a-z0-9]+/g, " ").trim()
}

/** Similar prompts are suggestions only: never silently import a past-tense answer into a present-tense question. */
const SIMILAR: Record<string, string> = {
  "do you like sports why why not": "sports-01",
  "do you think you have a healthy lifestyle": "healthy-01",
  "what do you do to stay healthy": "healthy-06",
  "are there any bad habits that you want to break": "healthy-02",
  "do you get on well with your siblings friends": "family-05",
  "do you live in a big family": "family-01",
  "what do you enjoy doing with your family": "family-03",
  "what do you do for a living": "working-01",
  "what is your dream job why": "working-01",
  "what is the traffic like where you live": "transport-01",
  "what means of transport do you think will become the most popular in vietnam in the future": "transport-07",
  "do you like shopping on the internet": "shopping-02",
  "were you a good student in high school": "studying-04",
  "what was your major at university": "studying-02",
  "how often do you take buses": "transport-03",
  "describe your favorite movie 3 4 sentences": "movies-04",
}

export function parseSpeakingDrafts(text: string): ImportedSpeakingDraft[] {
  const exact = new Map(allFinalQuestions.map((q) => [normalize(q.q), q.id]))
  const result: ImportedSpeakingDraft[] = []
  let heading = ""
  let lines: string[] = []

  function flush() {
    if (!heading) return
    const key = normalize(heading)
    const questionId = exact.get(key) ?? SIMILAR[key]
    const answer = lines.join(" ").replace(/\s+/g, " ").trim()
    if (questionId && answer) result.push({ questionId, sourceQuestion: heading, answer, exact: exact.has(key) })
  }

  for (const line of text.split(/\r?\n/)) {
    const candidate = line.match(/^\s*\d+\.\s+(.+?)\s*$/)?.[1]
    if (candidate && /^(do|what|where|who|when|how|why|if|is|are|have|will|which|describe)\b/i.test(candidate)) {
      flush()
      heading = candidate
      lines = []
    } else if (heading && line.trim()) {
      lines.push(line.replace(/^\s*→\s*/, "").trim())
    }
  }
  flush()
  return result
}
