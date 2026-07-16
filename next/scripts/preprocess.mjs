// next/scripts/preprocess.mjs
//
// Reads content from ../../source/ (repo root) and emits typed TS modules to
// ../src/data/ (next/ React app). Port of the original build.mjs normalization
// logic, keeping the same data shape but emitting ES modules with default
// exports typed via ../src/types/content.ts.
//
// Emits:
//   next/src/data/notes.ts        (docs + meta + audio + ipa)
//   next/src/data/topics.ts       (topicsIndex + topicLabels + speakingQuestions + presets)
//   next/src/data/daily-index.ts  (LessonSummary[])
//   next/src/data/daily/lesson-XX.ts (Lesson) — 16 files

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, rmSync } from "node:fs"
import { join, dirname, basename } from "node:path"
import { fileURLToPath } from "node:url"

const HERE = dirname(fileURLToPath(import.meta.url))
const NEXT_ROOT = dirname(HERE)
const REPO_ROOT = dirname(NEXT_ROOT)
const SRC = join(REPO_ROOT, "source")
const WEB = join(REPO_ROOT, "web")
const ENRICH = join(WEB, "enrich")
const DAILY_DIR = join(SRC, "daily")
const OUT = join(NEXT_ROOT, "src", "data")

/* -------------------- Notes -------------------- */
function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!m) return { data: {}, body: raw }
  const data = {}
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/)
    if (kv) data[kv[1]] = kv[2].trim()
  }
  return { data, body: raw.slice(m[0].length) }
}
function orderOf(file) {
  const n = basename(file).match(/^(\d+)/)
  return n ? parseInt(n[1], 10) : 999
}
function loadDir(type) {
  const dir = join(SRC, type)
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort((a, b) => orderOf(a) - orderOf(b))
    .map((f) => {
      const raw = readFileSync(join(dir, f), "utf8")
      const { data, body } = parseFrontmatter(raw)
      return {
        id: basename(f, ".md"),
        type,
        title: data.title || basename(f, ".md"),
        vi: data.vi || "",
        lesson: data.lesson || data.lessons || "",
        priority: data.priority || "",
        file: `source/${type}/${f}`,
        markdown: body.trim(),
      }
    })
}
function readJsonEnrich(name, fallback) {
  const p = join(ENRICH, name)
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : fallback
}
function readJsonAt(p, fallback) {
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : fallback
}

/* -------------------- HTML sanitization -------------------- */
function stripHtml(html) {
  if (!html) return ""
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
}
function buildAudioUrlMap(audioManifest) {
  const m = new Map()
  for (const item of audioManifest.items || []) {
    if (item.sourceUrl && item.localFile) m.set(item.sourceUrl, item)
  }
  return m
}
function buildImageUrlMap(imageManifest) {
  const m = new Map()
  for (const item of imageManifest.items || []) {
    if (item.url && item.localFile) m.set(item.url, item)
  }
  return m
}
function rewriteHtml(html, audioMap, imageMap) {
  if (!html) return ""
  let out = String(html)
  out = out.replace(/\sstyle="[^"]*"/gi, "")
  out = out.replace(/<img([^>]*?)src=["']([^"']+)["']([^>]*?)>/gi, (m, before, src, after) => {
    const item = imageMap.get(src)
    if (
      /icons8-speaker/i.test(src) ||
      /speaker-40/i.test(src) ||
      / class=["'][^"']*audio_custom_need_add_event/i.test(m)
    ) {
      return ""
    }
    if (item && item.localFile) return `<img${before}src="${item.localFile}"${after} loading="lazy">`
    if (/^https?:\/\/api-quiz-maker/i.test(src)) return `<img${before}src="${src}"${after} loading="lazy">`
    return `<img${before}src="${src}"${after} loading="lazy">`
  })
  out = out.replace(/<img[^>]*class=["'][^"']*audio_custom_need_add_event[^>]*>/gi, "")
  out = out.replace(/\swidth="\d+"/gi, "").replace(/\sheight="\d+"/gi, "")
  return out
}
function injectBlankSlots(html) {
  if (!html) return ""
  return String(html).replace(/\[\s*input_?(\d+)\s*\]/gi, (_m, n) => `<span class="blank-slot" data-blank="${n}"></span>`)
}

/* -------------------- Raw questions -------------------- */
function collectRawQuestions(rawFilesDir) {
  const map = {}
  if (!existsSync(rawFilesDir)) return map
  const files = readdirSync(rawFilesDir).filter((f) => f.endsWith(".json"))
  for (const f of files) {
    let raw
    try {
      raw = JSON.parse(readFileSync(join(rawFilesDir, f), "utf8"))
    } catch {
      continue
    }
    const list = raw?.questions?.json?.data
    if (Array.isArray(list)) for (const q of list) if (q && q.id != null) map[String(q.id)] = q
  }
  return map
}

/* -------------------- Normalize question / block -------------------- */
function normalizeAudioRef(a, audioMap) {
  const src = a.url || a.sourceUrl
  const item = src && audioMap.get(src)
  return {
    url: src || null,
    localFile: (item && item.localFile) || a.localFile || null,
    script: a.script || (item && item.script) || null,
    text: a.text || null,
    source: a.source || null,
  }
}
function normalizeImageRef(i, imageMap) {
  const src = i.url
  const item = src && imageMap.get(src)
  return {
    url: src || null,
    localFile: (item && item.localFile) || i.localFile || null,
    alt: i.alt || null,
  }
}
function normalizeQuestion(q, rawById, audioMap, imageMap) {
  const raw = rawById[String(q.sourceQuestionId)] || null
  const type = q.type
  const promptHtml = rewriteHtml(
    (q.rawHtml && (q.rawHtml.content || q.rawHtml.introduction)) || `<p>${q.prompt || ""}</p>`,
    audioMap,
    imageMap
  )
  const explanationHtml = rewriteHtml((q.rawHtml && q.rawHtml.explain) || "", audioMap, imageMap)
  const audioRefs = (q.audioRefs || []).map((a) => normalizeAudioRef(a, audioMap))
  const imageRefs = (q.imageRefs || []).map((i) => normalizeImageRef(i, imageMap))
  const submission = q.submission || {}

  let kind = "unknown"
  let options = []
  let correctAnswer = []
  let userAnswer = null
  let blanks = null
  let pairs = null
  let bodyHtml = ""

  const rawAnswers = raw?.answer?.answers

  if (type == null) {
    kind = "info"
  } else if (type === 3) {
    kind = "single_choice"
    if (Array.isArray(rawAnswers))
      options = rawAnswers.map((o) => ({
        id: o.id,
        text: stripHtml(o.content),
        html: rewriteHtml(o.content, audioMap, imageMap),
      }))
    if (submission.correctAnswer != null) correctAnswer = [submission.correctAnswer]
    if (submission.userAnswer != null) userAnswer = submission.userAnswer
  } else if (type === 5) {
    kind = "multi_select"
    if (Array.isArray(rawAnswers))
      options = rawAnswers.map((o) => ({
        id: o.id,
        text: stripHtml(o.content),
        html: rewriteHtml(o.content, audioMap, imageMap),
      }))
    if (submission.correctAnswer != null)
      correctAnswer = Array.isArray(submission.correctAnswer) ? submission.correctAnswer : [submission.correctAnswer]
    if (submission.userAnswer != null)
      userAnswer = Array.isArray(submission.userAnswer) ? submission.userAnswer : [submission.userAnswer]
  } else if (type === 1) {
    kind = "fill_blank"
    const correctObj = submission.correctAnswer && typeof submission.correctAnswer === "object" ? submission.correctAnswer : null
    const userObj = submission.userAnswer && typeof submission.userAnswer === "object" ? submission.userAnswer : null
    const keys = correctObj ? Object.keys(correctObj).sort((a, b) => parseInt(a.split("_")[1]) - parseInt(b.split("_")[1])) : []
    blanks = keys.map((k) => ({
      key: k,
      answers: Array.isArray(correctObj[k]) ? correctObj[k] : [correctObj[k]],
      userAnswer: userObj ? userObj[k] : null,
      explanationHtml: "",
    }))
    if (blanks.length) userAnswer = blanks.map((b) => b.userAnswer)
    const rawTpl = (q.rawHtml && q.rawHtml.answerTemplate) || ""
    bodyHtml = injectBlankSlots(rewriteHtml(rawTpl, audioMap, imageMap))
  } else if (type === 2) {
    kind = "open_or_video"
    if (typeof submission.userAnswer === "string") userAnswer = submission.userAnswer
    if (Array.isArray(rawAnswers) && rawAnswers.length && rawAnswers.every((o) => o.left && o.right)) {
      kind = "matching"
      pairs = rawAnswers.map((o, i) => ({
        leftId: o.leftId || String(i),
        left: stripHtml(o.left),
        rightId: o.rightId || String(i),
        right: stripHtml(o.right),
      }))
    }
  } else if (type === 4) {
    kind = "open_or_video"
    if (typeof submission.userAnswer === "string") userAnswer = submission.userAnswer
  }

  const resultTruth = submission.resultAnswer
  let correct = null
  if (typeof resultTruth === "boolean") correct = resultTruth
  else if (resultTruth && typeof resultTruth === "object") {
    const values = Object.values(resultTruth)
    if (values.length) correct = values.every((v) => v === true)
  }

  return {
    id: q.id,
    sourceQuestionId: q.sourceQuestionId,
    challengeNumber: null,
    challengeId: q.challengeId,
    title: q.title || null,
    kind,
    prompt: q.prompt || stripHtml(promptHtml),
    promptHtml,
    bodyHtml,
    explanationHtml,
    options,
    correctAnswer,
    userAnswer,
    blanks,
    pairs,
    correct,
    audioRefs,
    imageRefs,
    topics: [],
  }
}
function normalizeContentBlock(b, audioMap, imageMap) {
  return {
    id: b.id,
    sourceId: b.sourceId,
    challengeId: b.challengeId,
    challengeNumber: null,
    challengeNote: "",
    type: b.type,
    title: b.title,
    text: b.text,
    html: rewriteHtml(b.rawHtml || (b.text ? `<p>${b.text}</p>` : ""), audioMap, imageMap),
    audioRefs: (b.audioRefs || []).map((a) => normalizeAudioRef(a, audioMap)),
    imageRefs: (b.imageRefs || []).map((i) => normalizeImageRef(i, imageMap)),
    topics: [],
  }
}

/* -------------------- Topic tagging -------------------- */
function extractOrderedTopics(text, ctx) {
  const lower = String(text || "").toLowerCase()
  if (!lower) return []
  const hits = []
  for (const kw of Object.keys(ctx.noteKeywords || {})) {
    const pos = lower.indexOf(kw)
    if (pos < 0) continue
    for (const t of ctx.noteKeywords[kw]) hits.push({ topic: t, pos })
  }
  hits.sort((a, b) => a.pos - b.pos)
  const seen = new Set()
  const out = []
  for (const h of hits) {
    if (!seen.has(h.topic)) {
      seen.add(h.topic)
      out.push(h.topic)
    }
  }
  return out
}
function tagWithTopics({ selfText, noteText, lessonKey, sourceItemId }, ctx) {
  const overrides = ctx.overrides || {}
  const explicit = overrides[sourceItemId]
  if (explicit) return explicit.map((t) => (typeof t === "string" ? { key: t, role: "core" } : t))
  const hints = (ctx.lessonTopicHints && ctx.lessonTopicHints[lessonKey]) || []
  const hintsSet = new Set(hints)
  const selfTopics = extractOrderedTopics(selfText, ctx)
  const noteTopics = extractOrderedTopics(noteText, ctx)
  const result = []
  const done = new Set()
  if (selfTopics.length) {
    for (const t of selfTopics) {
      if (done.has(t)) continue
      result.push({ key: t, role: hintsSet.has(t) ? "core" : "preview" })
      done.add(t)
    }
    for (const t of noteTopics) {
      if (done.has(t)) continue
      result.push({ key: t, role: "review" })
      done.add(t)
    }
  } else if (noteTopics.length) {
    result.push({ key: noteTopics[0], role: "core" })
    done.add(noteTopics[0])
    for (let i = 1; i < noteTopics.length; i++) {
      const t = noteTopics[i]
      if (done.has(t)) continue
      result.push({ key: t, role: "review" })
      done.add(t)
    }
  } else if (hints.length) {
    result.push({ key: hints[0], role: "core" })
  }
  return result
}

/* -------------------- Group + Lesson normalize -------------------- */
function groupExercises(questions, manifest) {
  const groups = {}
  for (const q of questions) {
    const ch = manifest.challenges.find((c) => c.challengeId === q.challengeId) || {}
    const key = "ch-" + (q.challengeId || "unknown")
    if (!groups[key]) {
      groups[key] = {
        id: key,
        challengeId: q.challengeId,
        challengeNumber: ch.number || null,
        title: ch.title ? ch.title.replace(/^\[PRE IELTS\]\s*/i, "") : `Challenge ${ch.number || "?"}`,
        note: ch.note || "",
        introHtml: "",
        questions: [],
      }
    }
    q.challengeNumber = ch.number || null
    groups[key].questions.push(q)
  }
  return Object.values(groups)
}
function normalizeLesson(lessonKey, ctx) {
  const dir = join(DAILY_DIR, lessonKey)
  const manifest = readJsonAt(join(dir, "manifest.json"), null)
  if (!manifest) return null
  const content = readJsonAt(join(dir, "content.json"), { blocks: [] })
  const exercises = readJsonAt(join(dir, "exercises.json"), { questions: [] })
  const scripts = readJsonAt(join(dir, "scripts.json"), { blocks: [] })
  const submission = readJsonAt(join(dir, "submission.json"), { items: [] })
  const audioManifest = readJsonAt(join(dir, "audio", "manifest.json"), { items: [] })
  const imageManifest = readJsonAt(join(dir, "images", "manifest.json"), { items: [] })
  const audioMap = buildAudioUrlMap(audioManifest)
  const imageMap = buildImageUrlMap(imageManifest)
  const rawById = collectRawQuestions(join(dir, "raw"))

  const contentBlocks = (content.blocks || []).map((b) => {
    const nb = normalizeContentBlock(b, audioMap, imageMap)
    const ch = manifest.challenges.find((c) => c.challengeId === b.challengeId)
    nb.challengeNumber = ch ? ch.number : null
    nb.challengeNote = ch ? ch.note : ""
    const selfText = [nb.title, nb.text, stripHtml(nb.html)].filter(Boolean).join(" \n ")
    const noteText = (ch && ch.note) || ""
    nb.topics = tagWithTopics({ selfText, noteText, lessonKey, sourceItemId: b.id }, ctx)
    return nb
  })

  const normQuestions = (exercises.questions || []).map((q) => {
    const nq = normalizeQuestion(q, rawById, audioMap, imageMap)
    const ch = manifest.challenges.find((c) => c.challengeId === q.challengeId)
    nq.challengeNumber = ch ? ch.number : null
    const selfText = [nq.prompt, stripHtml(nq.bodyHtml), stripHtml(nq.explanationHtml)].filter(Boolean).join(" \n ")
    const noteText = (ch && ch.note) || ""
    nq.topics = tagWithTopics({ selfText, noteText, lessonKey, sourceItemId: nq.id }, ctx)
    return nq
  })

  const exerciseGroups = groupExercises(normQuestions, manifest)

  const audio = (audioManifest.items || []).map((a) => ({
    id: a.id,
    challengeId: a.challengeId,
    localFile: a.localFile,
    url: a.sourceUrl,
    script: a.script,
    needsScriptReview: !!a.needsScriptReview,
    note: a.note,
  }))

  const vocabPairs = []
  for (const a of audio) {
    if (a.script) {
      const m = a.script.match(/^([^:\-]+)[:\-]\s*(.+)$/)
      if (m) vocabPairs.push({ term: m[1].trim(), meaning: m[2].trim() })
    }
  }

  let totalQuestion = 0,
    totalCorrect = 0
  for (const item of submission.items || []) {
    for (const q of Object.values(item.answers || {})) {
      totalQuestion += q.total_question || 0
      totalCorrect += q.total_correct_result_answer || 0
    }
  }

  return {
    key: lessonKey,
    number: manifest.lesson,
    title: manifest.title,
    challenges: manifest.challenges.map((c) => ({
      number: c.number,
      title: c.title,
      note: c.note,
      totalQuestion: c.totalQuestion,
    })),
    contentBlocks,
    exerciseGroups,
    scriptsRaw: scripts,
    audio,
    vocabPairs,
    submissionSummary: {
      totalQuestion,
      totalCorrect,
      correctRate: totalQuestion ? totalCorrect / totalQuestion : null,
      commentText: (submission.items && submission.items[0] && submission.items[0].commentText) || null,
    },
  }
}
function summarizeLesson(lessonData) {
  return {
    key: lessonData.key,
    number: lessonData.number,
    label: `Lesson ${lessonData.number} · ${(lessonData.challenges || [])
      .map((c) => c.note)
      .filter(Boolean)
      .join(" | ") || lessonData.title}`,
    challenges: (lessonData.challenges || []).map((c) => ({
      number: c.number,
      title: c.title,
      note: c.note,
    })),
    totalQuestion: lessonData.submissionSummary.totalQuestion,
    totalCorrect: lessonData.submissionSummary.totalCorrect,
    correctRate: lessonData.submissionSummary.correctRate,
    hasAudio: (lessonData.audio || []).length > 0,
    numContentBlocks: (lessonData.contentBlocks || []).length,
    numQuestions: (lessonData.exerciseGroups || []).reduce((n, g) => n + (g.questions || []).length, 0),
  }
}

/* -------------------- Emit helpers -------------------- */
function emit(path, contents) {
  const dir = dirname(path)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(path, contents, "utf8")
}
const HEADER = `// Auto-generated by next/scripts/preprocess.mjs — do not edit.\n// Run \`npm run preprocess\` or any dev/build command to regenerate.\n\n`

/* -------------------- Main -------------------- */
function main() {
  if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true })
  mkdirSync(OUT, { recursive: true })

  // 1. Notes
  const notesData = {
    docs: [...loadDir("pronunciation"), ...loadDir("grammar"), ...loadDir("speaking")],
    meta: readJsonEnrich("meta.json", {}),
    audio: readJsonEnrich("audio.json", []),
    ipa: readJsonEnrich("ipa.json", {}),
  }
  emit(
    join(OUT, "notes.ts"),
    HEADER +
      `import type { NoteDoc, NotesAudio, IpaData, MetaData } from "@/types/content"\n\n` +
      `export const docs: NoteDoc[] = ${JSON.stringify(notesData.docs, null, 2)} as unknown as NoteDoc[]\n\n` +
      `export const meta: MetaData = ${JSON.stringify(notesData.meta, null, 2)} as unknown as MetaData\n\n` +
      `export const notesAudio: NotesAudio[] = ${JSON.stringify(notesData.audio, null, 2)} as unknown as NotesAudio[]\n\n` +
      `export const ipa: IpaData = ${JSON.stringify(notesData.ipa, null, 2)} as unknown as IpaData\n`
  )

  // 2. Topics + daily
  const topicsMapPath = join(DAILY_DIR, "topics-map.json")
  const topicsMap = existsSync(topicsMapPath)
    ? JSON.parse(readFileSync(topicsMapPath, "utf8"))
    : { topicLabels: {}, noteKeywords: {}, lessonTopicHints: {}, questionOverrides: {}, blockOverrides: {}, speakingQuestions: {}, practicePresets: [] }

  const ctx = {
    topicLabels: topicsMap.topicLabels || {},
    noteKeywords: topicsMap.noteKeywords || {},
    lessonTopicHints: topicsMap.lessonTopicHints || {},
    overrides: { ...(topicsMap.blockOverrides || {}), ...(topicsMap.questionOverrides || {}) },
    speakingQuestions: topicsMap.speakingQuestions || {},
    practicePresets: topicsMap.practicePresets || [],
  }

  const lessonKeys = existsSync(DAILY_DIR)
    ? readdirSync(DAILY_DIR, { withFileTypes: true })
        .filter((d) => d.isDirectory() && /^lesson-/.test(d.name))
        .map((d) => d.name)
        .sort()
    : []

  const perLesson = {}
  const index = []
  const topicRefs = {}
  const stats = { blocks: 0, questions: 0, audios: 0, taggedBlocks: 0, taggedQuestions: 0 }

  for (const key of lessonKeys) {
    const data = normalizeLesson(key, ctx)
    if (!data) continue
    perLesson[key] = data
    index.push(summarizeLesson(data))

    for (const b of data.contentBlocks) {
      stats.blocks++
      if (b.topics.length) stats.taggedBlocks++
      for (const t of b.topics) {
        ;(topicRefs[t.key] = topicRefs[t.key] || []).push({ lessonKey: key, kind: "block", itemId: b.id, role: t.role })
      }
    }
    for (const g of data.exerciseGroups)
      for (const q of g.questions) {
        stats.questions++
        if (q.topics.length) stats.taggedQuestions++
        for (const t of q.topics) {
          ;(topicRefs[t.key] = topicRefs[t.key] || []).push({
            lessonKey: key,
            kind: "question",
            itemId: q.id,
            role: t.role,
            qkind: q.kind,
          })
        }
      }
    stats.audios += data.audio.length
  }

  const topicsIndex = { topics: {}, order: [] }
  const labelKeys = Object.keys(ctx.topicLabels)
  const extraKeys = Object.keys(topicRefs).filter((k) => !ctx.topicLabels[k])
  const orderedKeys = [...labelKeys, ...extraKeys]
  for (const k of orderedKeys) {
    const metaLabel = ctx.topicLabels[k] || {}
    topicsIndex.topics[k] = {
      label: metaLabel.label || k,
      skill: metaLabel.skill || "misc",
      refs: topicRefs[k] || [],
      needsNotes: metaLabel.needsNotes || false,
    }
    topicsIndex.order.push(k)
  }

  // Emit topics.ts
  emit(
    join(OUT, "topics.ts"),
    HEADER +
      `import type { TopicsIndex, TopicLabel, SpeakingQuestion, PracticePreset } from "@/types/content"\n\n` +
      `export const topicsIndex: TopicsIndex = ${JSON.stringify(topicsIndex, null, 2)} as unknown as TopicsIndex\n\n` +
      `export const topicLabels: Record<string, TopicLabel> = ${JSON.stringify(
        ctx.topicLabels,
        null,
        2
      )} as unknown as Record<string, TopicLabel>\n\n` +
      `export const speakingQuestions: Record<string, SpeakingQuestion[]> = ${JSON.stringify(
        ctx.speakingQuestions,
        null,
        2
      )} as unknown as Record<string, SpeakingQuestion[]>\n\n` +
      `export const practicePresets: PracticePreset[] = ${JSON.stringify(ctx.practicePresets, null, 2)} as unknown as PracticePreset[]\n`
  )

  // Emit daily-index.ts
  emit(
    join(OUT, "daily-index.ts"),
    HEADER +
      `import type { LessonSummary } from "@/types/content"\n\n` +
      `export const dailyIndex: LessonSummary[] = ${JSON.stringify(index, null, 2)} as unknown as LessonSummary[]\n`
  )

  // Emit per-lesson chunks
  for (const [key, data] of Object.entries(perLesson)) {
    emit(
      join(OUT, "daily", `${key}.ts`),
      HEADER +
        `import type { Lesson } from "@/types/content"\n\n` +
        `const lesson: Lesson = ${JSON.stringify(data, null, 2)} as unknown as Lesson\n\n` +
        `export default lesson\n`
    )
  }

  // Emit daily loader index — maps key → () => Promise<Lesson>
  const loaderLines = Object.keys(perLesson)
    .map((k) => `  ${JSON.stringify(k)}: () => import("./daily/${k}").then((m) => m.default),`)
    .join("\n")
  emit(
    join(OUT, "daily-loader.ts"),
    HEADER +
      `import type { Lesson } from "@/types/content"\n\n` +
      `export const dailyLoaders: Record<string, () => Promise<Lesson>> = {\n${loaderLines}\n}\n\n` +
      `export function loadLesson(key: string): Promise<Lesson> {\n` +
      `  const loader = dailyLoaders[key]\n` +
      `  if (!loader) return Promise.reject(new Error(\`Unknown lesson key: \${key}\`))\n` +
      `  return loader()\n` +
      `}\n`
  )

  console.log(
    `[preprocess] ${notesData.docs.length} notes, ${index.length} lessons, ${stats.blocks} blocks, ${stats.questions} questions, ${stats.audios} audios, ${Object.keys(topicsIndex.topics).length} topics.`
  )
  console.log(
    `[preprocess] Tagged: ${stats.taggedBlocks} blocks / ${stats.taggedQuestions} questions.`
  )
}

main()
