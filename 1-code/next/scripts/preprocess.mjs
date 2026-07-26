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
// NEXT_ROOT is 1-code/next; repo root is two levels up.
const REPO_ROOT = dirname(dirname(NEXT_ROOT))
const SRC = join(REPO_ROOT, "2-notes")
const ENRICH = join(SRC, "enrich")
const DAILY_DIR = join(REPO_ROOT, "3-daily", "lessons")
const OUT = join(NEXT_ROOT, "src", "data")
const FINAL_PACKET_ROOT = join(REPO_ROOT, "4-final", "google-doc-pre-course")

const FINAL_SHEET_META = {
  "Lesson 7 - Job.docx": { topic: "Work and study", focus: "dream job, job likes/dislikes, family job" },
  "Lesson 8 - Appearance.docx": { topic: "Appearance", focus: "age, height/build, hair, clothes" },
  "Lesson 9 - Family.docx": { topic: "Family", focus: "family size, siblings, hobbies" },
  "Lesson 10 - Personality.docx": { topic: "Personality", focus: "neat, organised, easy-going, sociable, generous" },
  "Lesson 13 - Weekend.docx": { topic: "Free time / Hobbies", focus: "weekend, sports, films, books, music, games" },
  "Lesson 14 - Trip.docx": { topic: "Travelling", focus: "past trip, future trip" },
  "Lesson 16 - Restaurants.docx": { topic: "Restaurants", focus: "restaurant, order, taste, service" },
  "Lesson 18 - Hometown.docx": { topic: "Hometown", focus: "where from, like/dislike, lakes/rivers/mountains" },
  "Lesson 19 - Health.docx": { topic: "Health", focus: "healthy lifestyle, exercise, headache/toothache/cold" },
}

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
        file: `2-notes/${type}/${f}`,
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

function normalizeFinalPacketMarkdown(raw) {
  return String(raw || "")
    .replace(/\]\(images\//g, "](/final/google-doc-pre-course/images/")
    .replace(/\]\(suggested-vocab\//g, "](/final/google-doc-pre-course/suggested-vocab/")
    .replace(/## Tổng hợp Suggested Vocab/g, "## Tổng hợp Speaking Topic Sheets")
}

function looseDocKey(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[_]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+\.docx$/i, ".docx")
    .trim()
}

function loadFinalPacket() {
  const packetFile = join(FINAL_PACKET_ROOT, "tong-hop-kien-thuc-khoa-pre.md")
  const raw = existsSync(packetFile) ? readFileSync(packetFile, "utf8") : ""
  const links = readJsonAt(join(FINAL_PACKET_ROOT, "links-manifest.json"), [])
  const linkByDoc = new Map()
  for (const item of links) {
    if (item?.text && /\.docx$/i.test(item.text)) linkByDoc.set(looseDocKey(item.text), item.href)
  }

  const sheetsDir = join(FINAL_PACKET_ROOT, "suggested-vocab")
  const files = existsSync(sheetsDir)
    ? readdirSync(sheetsDir).filter((f) => /\.docx$/i.test(f)).sort((a, b) => {
        const na = Number(a.match(/Lesson\s+(\d+)/i)?.[1] || 999)
        const nb = Number(b.match(/Lesson\s+(\d+)/i)?.[1] || 999)
        return na - nb || a.localeCompare(b)
      })
    : []

  const speakingSheets = files.map((file) => {
    const meta = FINAL_SHEET_META[file] || { topic: file.replace(/\.docx$/i, ""), focus: "Speaking topic sheet giáo viên gửi" }
    return {
      topic: meta.topic,
      file,
      localPath: `final/google-doc-pre-course/suggested-vocab/${file}`,
      sourceHref: linkByDoc.get(looseDocKey(file)),
      focus: meta.focus,
    }
  })

  return {
    title: "Ôn tập kiến thức khóa Pre-IELTS",
    sourceFile: "final/google-doc-pre-course/tong-hop-kien-thuc-khoa-pre.md",
    markdown: normalizeFinalPacketMarkdown(raw),
    speakingSheets,
  }
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
// Vietnamese diacritics range (Latin Extended Additional + Latin-1 Supplement)
const HAS_VN_DIACRITICS = /[\u00C0-\u1EF9]/

// Split a script that may combine "English | Vietnamese" or "English: Vietnamese"
// into { script (English), translation (Vietnamese) }. Idempotent-safe: only
// splits when left side has no VN diacritics AND right side does. Leaves scripts
// unchanged when the pattern is ambiguous (e.g. pure English or pure Vietnamese).
function splitScriptAndTranslation(raw) {
  if (!raw || typeof raw !== "string") return { script: raw || null, translation: null }
  const s = raw.trim()
  if (!s) return { script: null, translation: null }

  const pipeIdx = s.indexOf(" | ")
  if (pipeIdx > 0) {
    const left = s.slice(0, pipeIdx).trim()
    const right = s.slice(pipeIdx + 3).trim()
    if (left && right && !HAS_VN_DIACRITICS.test(left) && HAS_VN_DIACRITICS.test(right)) {
      return { script: left, translation: right }
    }
  }

  const colonIdx = s.indexOf(":")
  if (colonIdx > 0 && colonIdx < s.length - 1) {
    const left = s.slice(0, colonIdx).trim()
    const right = s.slice(colonIdx + 1).trim()
    if (left && right && !HAS_VN_DIACRITICS.test(left) && HAS_VN_DIACRITICS.test(right)) {
      return { script: left, translation: right }
    }
  }

  return { script: s, translation: null }
}

function normalizeAudioRef(a, audioMap) {
  const src = a.url || a.sourceUrl
  const item = src && audioMap.get(src)
  const rawScript = a.script || (item && item.script) || null
  const { script, translation } = splitScriptAndTranslation(rawScript)
  return {
    url: src || null,
    localFile: (item && item.localFile) || a.localFile || null,
    script,
    translation,
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

  const rawAnswer = raw?.answer || null
  const rawAnswers = rawAnswer?.answers
  const rawQuestions = rawAnswer?.questions

  if (type == null) {
    kind = "info"
  } else if (type === 3 || (type === 4 && Array.isArray(rawAnswers) && rawAnswers.length)) {
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
  } else if (type === 7 && Array.isArray(rawQuestions) && Array.isArray(rawAnswers)) {
    kind = "matching"
    pairs = rawQuestions.map((left, i) => {
      const right = rawAnswers[i] || {}
      return {
        leftId: String(left.id ?? i),
        left: stripHtml(left.content),
        rightId: String(right.id ?? i),
        right: stripHtml(right.content),
      }
    })
    if (submission.userAnswer != null) userAnswer = submission.userAnswer
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

  const audio = (audioManifest.items || []).map((a) => {
    const { script, translation } = splitScriptAndTranslation(a.script)
    return {
      id: a.id,
      challengeId: a.challengeId,
      localFile: a.localFile,
      url: a.sourceUrl,
      script,
      translation,
      needsScriptReview: !!a.needsScriptReview,
      note: a.note,
    }
  })

  const vocabPairs = []
  for (const a of audio) {
    if (a.script && a.translation) {
      vocabPairs.push({ term: a.script, meaning: a.translation })
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
  const labelPrefix = lessonData.number != null ? `Lesson ${lessonData.number}` : lessonData.title || "Break / Ôn tập"
  const labelDetail =
    (lessonData.challenges || [])
      .map((c) => c.note)
      .filter(Boolean)
      .join(" | ") || lessonData.title
  return {
    key: lessonData.key,
    number: lessonData.number,
    label: labelDetail && labelDetail !== labelPrefix ? `${labelPrefix} · ${labelDetail}` : labelPrefix,
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

/* -------------------- Final Test builder -------------------- */
const GRADABLE_KINDS = new Set(["single_choice", "multi_select", "fill_blank", "matching"])

function isGrammarTopic(key, ctx) {
  const l = ctx.topicLabels[key]
  return !!(l && l.skill === "grammar")
}

function normalizeGeneratedQuestion(g) {
  const q = {
    id: g.id,
    sourceQuestionId: null,
    challengeNumber: null,
    challengeId: null,
    title: null,
    kind: g.kind,
    prompt: g.prompt || "",
    promptHtml: `<p>${g.prompt || ""}</p>`,
    bodyHtml: "",
    explanationHtml: "",
    options: [],
    correctAnswer: [],
    userAnswer: null,
    blanks: null,
    pairs: null,
    correct: null,
    audioRefs: [],
    imageRefs: [],
    topics: [{ key: g.topic, role: "review" }],
    generated: true,
  }
  if (g.kind === "single_choice" || g.kind === "multi_select") {
    q.options = (g.options || []).map((t, i) => ({ id: String(i), text: String(t), html: `<p>${t}</p>` }))
    q.correctAnswer = g.kind === "single_choice" ? [String(g.answer)] : (g.answers || []).map(String)
  } else if (g.kind === "fill_blank") {
    q.bodyHtml = injectBlankSlots(`<p>${g.body || ""}</p>`)
    q.blanks = (g.answers || []).map((acc, k) => ({ key: `b${k}`, answers: acc, userAnswer: null, explanationHtml: "" }))
  }
  return q
}

function buildFinalTests({ perLesson, topicsIndex, ctx }) {
  void topicsIndex
  const cfgPath = join(ENRICH, "final-tests.json")
  const cfg = existsSync(cfgPath) ? JSON.parse(readFileSync(cfgPath, "utf8")) : null
  const defaultBlueprint = { total: 50, timeMinutes: 45, sections: [] }
  const empty = { generatedLesson: null, poolEntry: null, publicData: { poolKey: "final-grammar-pool", poolTotal: 0, generatedCount: 0, blueprint: defaultBlueprint, realMock: null, sets: [] } }
  if (!cfg) return empty

  const genQs = (cfg.generated || []).map(normalizeGeneratedQuestion)
  const generatedLesson = genQs.length
    ? {
        key: "final-generated",
        number: null,
        title: "Câu bổ sung (AI-sinh)",
        challenges: [],
        contentBlocks: [],
        exerciseGroups: [
          { id: "final-generated-group", challengeId: null, challengeNumber: null, title: "Generated", note: "", introHtml: "", questions: genQs },
        ],
        scriptsRaw: null,
        audio: [],
        vocabPairs: [],
        submissionSummary: { totalQuestion: genQs.length, totalCorrect: 0, correctRate: null, commentText: null },
      }
    : null

  const poolRefs = []
  const seen = new Set()
  for (const [key, data] of Object.entries(perLesson)) {
    for (const grp of data.exerciseGroups || []) {
      for (const q of grp.questions || []) {
        if (!GRADABLE_KINDS.has(q.kind)) continue
        const gt = (q.topics || []).find((t) => isGrammarTopic(t.key, ctx))
        if (!gt) continue
        const uniq = key + "::" + q.id
        if (seen.has(uniq)) continue
        seen.add(uniq)
        poolRefs.push({ lessonKey: key, kind: "question", itemId: q.id, role: gt.role || "review", qkind: q.kind, topic: gt.key })
      }
    }
  }
  for (const q of genQs) {
    poolRefs.push({ lessonKey: "final-generated", kind: "question", itemId: q.id, role: "review", qkind: q.kind, topic: q.topics[0].key })
  }
  const poolEntry = { key: "final-grammar-pool", entry: { label: "Final Grammar Pool", skill: "grammar", refs: poolRefs, needsNotes: false } }

  const fixedLessons = [buildFinalRealMockLesson(), buildFinalRealMockLesson2(), ...buildGeneratedFinalMockLessons()]
  const fixedSets = []
  for (let i = 0; i < fixedLessons.length; i++) {
    const mock = fixedLessons[i]
    const refs = []
    for (const grp of mock.exerciseGroups || []) {
      for (const q of grp.questions || []) {
        if (!GRADABLE_KINDS.has(q.kind)) continue
        const gt = (q.topics || []).find((t) => isGrammarTopic(t.key, ctx)) || (q.topics || [])[0]
        refs.push({ lessonKey: mock.key, kind: "question", itemId: q.id, role: (gt && gt.role) || "review", qkind: q.kind, topic: (gt && gt.key) || "word-classes" })
      }
    }
    const isReal = i < 2
    const nn = String(isReal ? i + 1 : i - 1).padStart(2, "0")
    const total = refs.reduce((sum, ref) => {
      const q = (mock.exerciseGroups || []).flatMap((g) => g.questions || []).find((x) => x.id === ref.itemId)
      return sum + questionPointCount(q)
    }, 0)
    fixedSets.push({
      id: isReal ? `de-that-00-${nn}` : `de-luyen-${nn}`,
      label: isReal ? `Mã đề 00 · Đề thật ${nn}` : `Mã đề ${nn}`,
      seed: i + 1,
      total,
      note: mock.title,
      source: isReal ? "real" : "generated",
      questions: refs,
    })
  }

  return {
    generatedLesson,
    realMockLessons: fixedLessons,
    poolEntry,
    publicData: { poolKey: "final-grammar-pool", poolTotal: poolRefs.length, generatedCount: genQs.length, blueprint: cfg.blueprint || defaultBlueprint, realMock: null, sets: fixedSets },
  }
}

function questionPointCount(q) {
  if (!q) return 1
  return q.kind === "fill_blank" && q.blanks && q.blanks.length ? q.blanks.length : 1
}

function finalMockQuestion({ id, section, topic, kind = "single_choice", prompt, options = [], answer, body, answers = [] }) {
  const q = {
    id,
    sourceQuestionId: null,
    challengeNumber: null,
    challengeId: 35058,
    title: section,
    kind,
    prompt: prompt || "",
    promptHtml: `<p>${prompt || ""}</p>`,
    bodyHtml: "",
    explanationHtml: "",
    options: [],
    correctAnswer: [],
    userAnswer: null,
    blanks: null,
    pairs: null,
    correct: null,
    audioRefs: [],
    imageRefs: [],
    topics: [{ key: topic, role: "review" }],
  }
  if (kind === "single_choice") {
    q.options = options.map((text) => ({ id: text, text, html: `<p>${text}</p>` }))
    q.correctAnswer = [answer]
  } else if (kind === "fill_blank") {
    q.bodyHtml = injectBlankSlots(`<p>${body}</p>`)
    const answerGroups = Array.isArray(answers[0]) ? answers : [answers]
    q.blanks = answerGroups.map((group, i) => ({ key: `input_${i}`, answers: group, userAnswer: null, explanationHtml: "" }))
  }
  return q
}

function buildFinalRealMockLesson() {
  const wcOpts = ["Noun", "Verb", "Adjective", "Adverb"]
  const wordClass = [
    ["1. She gave me a questioning <u>look</u>.", "Noun"],
    ["2. The city is a <u>safe</u> place to live.", "Adjective"],
    ["3. I usually <u>stream</u> movies.", "Verb"],
    ["4. She has to work <u>late</u> tomorrow.", "Adverb"],
    ["5. He found it <u>extremely</u> difficult to get a job.", "Adverb"],
    ["6. My friend will <u>pay</u> for the tickets.", "Verb"],
    ["7. I go to <u>work</u> at 8 o'clock.", "Noun"],
    ["8. I do the same thing every day. I'm <u>sick</u> of it.", "Adjective"],
    ["9. An accident can happen <u>anywhere</u>.", "Adverb"],
    ["10. They <u>decided</u> to travel by train.", "Verb"],
  ].map((x, i) => finalMockQuestion({ id: `final-real-wc-${i + 1}`, section: "I - Define the word classes", topic: "word-classes", prompt: x[0], options: wcOpts, answer: x[1] }))

  const mcq = [
    ["1. I don't have __________ money, so I'll have to wait to get a new coat.", ["A. a piece of", "B. a few", "C. much", "D. many"], "C. much", "nouns-quantifiers"],
    ["2. Right now, Margaret __________ a shower. Do you want to ring later?", ["A. has", "B. have", "C. is having", "D. are having"], "C. is having", "present-tenses"],
    ["3. There are __________ people in the park today. They're holding a very big flower festival here.", ["A. much", "B. many", "C. a lot", "D. few"], "B. many", "nouns-quantifiers"],
    ["4. Let's meet __________ five o'clock, shall we?", ["A. in", "B. on", "C. at", "D. of"], "C. at", "prepositions"],
    ["5. Ly: Have you made plans for the summer?<br><br>Hai: Yes. __________ Malaysia.", ["A. We're going to", "B. We go", "C. We'll go", "D. We were going to"], "A. We're going to", "future-tenses"],
    ["6. We __________ to the cinema last night.", ["A. go", "B. going", "C. went", "D. goes"], "C. went", "past-tenses"],
    ["7. We've walked miles! My __________ are hurting!", ["A. foots", "B. feet", "C. foot", "D. feets"], "B. feet", "nouns-quantifiers"],
    ["8. I love your hair. __________ really soft.", ["A. It's", "B. They're", "C. Which is", "D. It'll"], "A. It's", "pronouns"],
    ["9. I heard there's __________ new sports shop in town. Let's see what they have.", ["A. a", "B. the", "C. an", "D. some"], "A. a", "articles-determiners"],
    ["10. Scientists are working hard to find cures for lots of diseases, but __________ haven't found a cure for the common cold yet.", ["A. you", "B. it", "C. we", "D. they"], "D. they", "pronouns"],
    ["11. Jane: That's great, Cathy. Did you make that __________?<br><br>Cathy: Yeah, isn't it beautiful?", ["A. herself", "B. myself", "C. yourself", "D. themselves"], "C. yourself", "pronouns"],
    ["12. Thanh: John is a better player than Martin, isn't he?<br><br>Tuan: Oh, yes. __________ the match tomorrow, I expect.", ["A. He'll win", "B. He wins", "C. He's winning", "D. He won"], "A. He'll win", "future-tenses"],
    ["13. __________ the piano for two hours every day?", ["A. Do you practise", "B. Are you practising", "C. Were you practising", "D. Did you practised"], "A. Do you practise", "present-tenses"],
    ["14. When you rang, I __________ my bike.", ["A. cleaned", "B. was cleaning", "C. used to clean", "D. clean"], "B. was cleaning", "past-tenses"],
    ["15. I wanted to go for a walk, __________ it was raining heavily.", ["A. or", "B. nor", "C. and", "D. but"], "D. but", "sentences-conjunctions"],
    ["16. Leon never __________ about it, but he was once a world-champion skier.", ["A. talks", "B. is talking", "C. was talking", "D. talk"], "A. talks", "present-tenses"],
    ["17. She was very hungry, __________ she made herself a sandwich.", ["A. but", "B. so", "C. and", "D. nor"], "B. so", "sentences-conjunctions"],
  ].map((x, i) => finalMockQuestion({ id: `final-real-mcq-${i + 1}`, section: "II - Choose the correct answer", topic: x[3], prompt: x[0], options: x[1], answer: x[2] }))

  const articles = [
    ["Last weekend, we went to [input_0] beach.", ["the"]],
    ["We went for [input_0] picnic.", ["a"]],
    ["[input_0] weather was perfect.", ["the"]],
    ["We had [input_0] great time swimming.", ["a"]],
    ["We had a great time swimming in [input_0] sea.", ["the"]],
    ["Alice is [input_0] talented musician.", ["a"]],
    ["She plays [input_0] piano beautifully.", ["the"]],
    ["She has performed in [input_0] many concerts.", ["none", "NONE", ""]],
    ["She dreams of becoming [input_0] professional artist.", ["a"]],
    ["She dreams of traveling around [input_0] world.", ["the"]],
  ]
  const articleItems = combineFillItems(articles, [5, 5]).map((x, i) => finalMockQuestion({ id: `final-real-art-${i + 1}`, section: "III - Complete with A / AN / THE / NONE", topic: "articles-determiners", kind: "fill_blank", body: x[0], answers: x[1] }))

  const verbs = [
    ["Hoa: The storm has been terrible, hasn't it?<br>Phuong: Yes, it [input_0] (rain) again later.", [["is going to rain", "'s going to rain"]], "future-tenses"],
    ["Last summer, we [input_0] (travel) to Italy and [input_1] (visit) many beautiful cities.", [["traveled", "travelled"], ["visited"]], "past-tenses"],
    ["While I [input_0] (read) a book, my friend [input_1] (call) me to chat.", [["was reading"], ["called"]], "past-tenses"],
    ["Be quiet! The baby [input_0] (sleep) in the next room.", [["is sleeping", "'s sleeping"]], "present-tenses"],
    ["I [input_0] (not / know) what to do this weekend. Maybe I [input_1] (go) to the beach, or I [input_2] (stay) at home and relax.", [["don't know", "do not know"], ["will go"], ["will stay"]], "future-tenses"],
    ["When I was a child, I [input_0] (want) to be an astronaut. Now, I [input_1] (study) engineering.", [["wanted"], ["am studying", "'m studying"]], "present-tenses"],
    ["Every morning, Jason [input_0] (walk) to work, but today he [input_1] (take) the bus because it's raining.", [["walks"], ["is taking", "'s taking"]], "present-tenses"],
  ]
  const verbItems = verbs.map((x, i) => finalMockQuestion({ id: `final-real-verb-${i + 1}`, section: "IV - Change the verb in the brackets to the correct tense", topic: x[2], kind: "fill_blank", body: x[0], answers: x[1] }))

  const questions = [...wordClass, ...mcq, ...articleItems, ...verbItems]
  return {
    key: "final-real-mock",
    number: null,
    title: "Lesson 19 Mock Test · 50 câu",
    challenges: [],
    contentBlocks: [],
    exerciseGroups: [{ id: "final-real-mock-group", challengeId: 35058, challengeNumber: 19, title: "GRAMMAR TEST", note: "MOCK TEST · Total: 50 questions · Time allowed: 45 minutes", introHtml: "", questions }],
    scriptsRaw: null,
    audio: [],
    vocabPairs: [],
    submissionSummary: { totalQuestion: 50, totalCorrect: 0, correctRate: null, commentText: null },
  }
}

function buildFinalRealMockLesson2() {
  const wcOpts = ["Noun", "Verb", "Adjective", "Adverb"]
  const wordClass = [
    ["I live in a quiet and peaceful <u>neighborhood</u>.", "Noun"],
    ["I am <u>unable</u> to call her; she must be busy.", "Adjective"],
    ["He completed the task <u>quickly</u>.", "Adverb"],
    ["The hilarious movie makes them <u>laugh</u> loudly.", "Verb"],
    ["The chef prepared a special <u>meal</u> for the guests.", "Noun"],
    ["They will <u>visit</u> their grandparents this weekend.", "Verb"],
    ["She is a patient woman, so she doesn't get angry <u>easily</u>.", "Adverb"],
    ["I am <u>interested</u> in trying new things.", "Adjective"],
    ["He <u>guided</u> us through the forest safely.", "Verb"],
    ["Did you do <u>well</u> on your test?", "Adverb"],
  ].map((x, i) => finalMockQuestion({ id: `final-real-2-wc-${i + 1}`, section: "I - Define the word classes", topic: "word-classes", prompt: x[0], options: wcOpts, answer: x[1] }))

  const mcq = [
    ["1. There are not _____ chairs in the room.", ["A. much", "B. any", "C. some", "D. a few"], "B. any", "nouns-quantifiers"],
    ["2. I like this jacket. I think I might buy _____.", ["A. it", "B. them", "C. its", "D. they"], "A. it", "pronouns"],
    ["3. This orange juice tastes _____.", ["A. well", "B. nicely", "C. fresh", "D. freshly"], "C. fresh", "adjectives"],
    ["4. Ouch! I hurt my_____. It is red and bleeding now.", ["A. foot", "B. feet", "C. foots", "D. feets"], "A. foot", "nouns-quantifiers"],
    ["5. My parents _____ dinner in the kitchen right now.", ["A. make", "B. are making", "C. made", "D. were making"], "B. are making", "present-tenses"],
    ["6. There are too many _______ in the shop today.", ["A. peoples", "B. persons", "C. person", "D. people"], "D. people", "nouns-quantifiers"],
    ["7. Sarah is very kind. Everybody likes _____.", ["A. hers", "B. she", "C. her", "D. herself"], "C. her", "pronouns"],
    ["8. I can decorate the room by______", ["A. myself", "B. me", "C. my", "D. mine"], "A. myself", "pronouns"],
    ["9. This soup tastes _____.", ["A. well", "B. good", "C. nicely", "D. badly"], "B. good", "adjectives"],
    ["10. When I _____ (do) my homework, my sister _____ (call) me to tell me she'd get home late.", ["A. did/ called", "B. was did/ was calling", "C. was doing/ was called", "D. was doing/ called"], "D. was doing/ called", "past-tenses"],
    ["11. The lesson today was very _____.", ["A. interest", "B. interesting", "C. interested", "D. interestingly"], "B. interesting", "adjectives"],
    ["12. While the athletes _____(play) football, the cheerleaders _____(dance) to cheer them up.", ["A. played/ danced", "B. was playing/ were dancing", "C. were playing/ were dancing", "D. were played/ were danced"], "C. were playing/ were dancing", "past-tenses"],
  ].map((x, i) => finalMockQuestion({ id: `final-real-2-mcq-${i + 1}`, section: "II - Choose the correct answer", topic: x[3], prompt: x[0], options: x[1], answer: x[2] }))

  const articles = [
    ["Last Saturday, we visited [input_0] only zoo in our town. First, we saw some animals; there were many", ["the"]],
    ["[input_0] lions, so it was great. And then, we watched", ["none", "NONE", ""]],
    ["[input_0] elephant show. This was a new show; I've never seen it before. I saw some giraffes there, too. My little sister wanted to take", ["an"]],
    ["[input_0] picture with", ["a"]],
    ["[input_0] giraffes, but they were too tall!", ["the"]],
    ["After that, we bought [input_0] ice cream and sat under", ["an"]],
    ["[input_0] big tree to rest. While we were eating,", ["a"]],
    ["[input_0] squirrel climbed onto", ["a"]],
    ["[input_0] bench next to us. It wasn't scared at all.", ["the"]],
    ["Before going home, we stopped at [input_0] only gift shop in the zoo. I bought", ["the"]],
    ["[input_0] small toy tiger, and my sister chose", ["a"]],
    ["[input_0] colourful postcard. It was", ["a"]],
    ["[input_0] really fun day, and we all enjoyed", ["a"]],
    ["[input_0] trip. My dad said we might come again next", ["the"]],
    ["[input_0] weekend.", ["none", "NONE", ""]],
  ]
  const articleItems = combineFillItems(articles, [5, 4, 6]).map((x, i) => finalMockQuestion({ id: `final-real-2-art-${i + 1}`, section: "III - Complete with A / AN / THE / NONE", topic: "articles-determiners", kind: "fill_blank", body: x[0], answers: x[1] }))

  const verbs = [
    ["I [input_0] (not / remember) his phone number. Can you give it to me again?", [["don't remember", "do not remember"]], "present-tenses"],
    ["My little sister [input_0] (always / lose) her keys. It drives me crazy!", [["is always losing", "'s always losing"]], "present-tenses"],
    ["A: Do you want to go to the movies?<br>B: I can't. I [input_0] (clean) the garage right now.", [["am cleaning", "'m cleaning"]], "present-tenses"],
    ["Hurry! The bus [input_0] (leave). We need to run!", [["is leaving", "'s leaving"]], "present-tenses"],
    ["A: What time [input_0] (the movie / begin)?<br>B: At 6:30 PM.", [["does the movie begin"]], "present-tenses"],
    ["When I [input_0] (get) home last night, my mom [input_1] (cook) dinner in the kitchen.", [["got"], ["was cooking"]], "past-tenses"],
    ["I just have a fever, so I [input_0] (stay) at home and rest.", [["am going to stay", "'m going to stay", "will stay"]], "future-tenses"],
    ["A: Where [input_0] (you/go) now?<br>B: I [input_1] (go) to the supermarket. [input_2] (you/need) anything?<br>A: Yes! We [input_3] (not/have) any milk left. [input_4] (you/can/buy) a bottle?<br>B: Sure!", [["are you going"], ["am going", "'m going"], ["do you need"], ["don't have", "do not have"], ["can you buy"]], "present-tenses"],
  ]
  const verbItems = verbs.map((x, i) => finalMockQuestion({ id: `final-real-2-verb-${i + 1}`, section: "IV - Change the verb in the brackets to the correct tense", topic: x[2], kind: "fill_blank", body: x[0], answers: x[1] }))

  const questions = [...wordClass, ...mcq, ...articleItems, ...verbItems]
  return {
    key: "final-real-mock-2",
    number: null,
    title: "Final Mock Test 02 · 50 câu",
    challenges: [],
    contentBlocks: [],
    exerciseGroups: [{ id: "final-real-mock-2-group", challengeId: null, challengeNumber: null, title: "GRAMMAR TEST", note: "MOCK TEST · Total: 50 questions · Time allowed: 45 minutes", introHtml: "", questions }],
    scriptsRaw: null,
    audio: [],
    vocabPairs: [],
    submissionSummary: { totalQuestion: 50, totalCorrect: 0, correctRate: null, commentText: null },
  }
}

function buildGeneratedFinalMockLessons() {
  const lessons = []
  for (let n = 3; n <= 12; n++) {
    const template = n % 2 === 1 ? "A" : "B"
    lessons.push(buildGeneratedFinalMockLesson(n, template))
  }
  return lessons
}

function buildGeneratedFinalMockLesson(n, template) {
  const wcOpts = ["Noun", "Verb", "Adjective", "Adverb"]
  const suffix = String(n).padStart(2, "0")
  const wordClass = makeWordClassSet(n).map((x, i) => finalMockQuestion({ id: `final-gen-${suffix}-wc-${i + 1}`, section: "I - Define the word classes", topic: "word-classes", prompt: `${i + 1}. ${x[0]}`, options: wcOpts, answer: x[1] }))
  const mcqPlan = template === "A"
    ? [["nouns-quantifiers", 3], ["pronouns", 3], ["present-tenses", 3], ["past-tenses", 2], ["future-tenses", 2], ["articles-determiners", 1], ["prepositions", 1], ["sentences-conjunctions", 2]]
    : [["nouns-quantifiers", 3], ["pronouns", 3], ["adjectives", 3], ["present-tenses", 1], ["past-tenses", 2]]
  const mcq = []
  for (const [topic, count] of mcqPlan) {
    for (let i = 0; i < count; i++) mcq.push(makeGeneratedMcq(topic, n * 7 + mcq.length + i))
  }
  const mcqQuestions = mcq.map((x, i) => finalMockQuestion({ id: `final-gen-${suffix}-mcq-${i + 1}`, section: "II - Choose the correct answer", topic: x.topic, prompt: `${i + 1}. ${x.prompt}`, options: x.options, answer: x.answer }))
  const articles = combineFillItems(makeArticleSet(n, template), template === "A" ? [5, 5] : [5, 5, 5]).map((x, i) => finalMockQuestion({ id: `final-gen-${suffix}-art-${i + 1}`, section: "III - Complete with A / AN / THE / NONE", topic: "articles-determiners", kind: "fill_blank", body: x[0], answers: x[1] }))
  const verbs = makeVerbSet(n).map((x, i) => finalMockQuestion({ id: `final-gen-${suffix}-verb-${i + 1}`, section: "IV - Change the verb in the brackets to the correct tense", topic: x[2], kind: "fill_blank", body: x[0], answers: x[1] }))
  const questions = [...wordClass, ...mcqQuestions, ...articles, ...verbs]
  return {
    key: `final-generated-mock-${suffix}`,
    number: null,
    title: `Generated Final Mock Test ${suffix} · 50 câu`,
    challenges: [],
    contentBlocks: [],
    exerciseGroups: [{ id: `final-generated-mock-${suffix}-group`, challengeId: null, challengeNumber: null, title: "GRAMMAR TEST", note: "MOCK TEST · Total: 50 questions · Time allowed: 45 minutes", introHtml: "", questions }],
    scriptsRaw: null,
    audio: [],
    vocabPairs: [],
    submissionSummary: { totalQuestion: 50, totalCorrect: 0, correctRate: null, commentText: null },
  }
}

function combineFillItems(items, chunks) {
  const out = []
  let cursor = 0
  for (const chunk of chunks) {
    let blankIndex = 0
    const bodies = []
    const answers = []
    for (const item of items.slice(cursor, cursor + chunk)) {
      bodies.push(item[0].replace(/\[input_\d+\]/g, () => `[input_${blankIndex++}]`))
      answers.push(item[1])
    }
    out.push([bodies.join(" "), answers])
    cursor += chunk
  }
  return out
}

function makeWordClassSet(n) {
  const sets = [
    [["My mother cooked a delicious <u>meal</u> last night.", "Noun"], ["This room looks very <u>tidy</u> today.", "Adjective"], ["I often <u>phone</u> my friend after school.", "Verb"], ["He speaks English <u>clearly</u>.", "Adverb"], ["We had a <u>wonderful</u> trip to Da Nang.", "Adjective"], ["She can <u>cook</u> seafood very well.", "Verb"], ["My favourite room is the <u>kitchen</u>.", "Noun"], ["I usually go to bed <u>early</u>.", "Adverb"], ["They <u>visited</u> a museum yesterday.", "Verb"], ["The restaurant was quite <u>crowded</u>.", "Adjective"]],
    [["I bought a new <u>book</u> at the weekend.", "Noun"], ["My brother is very <u>friendly</u>.", "Adjective"], ["We often <u>travel</u> by car.", "Verb"], ["She answered the question <u>quickly</u>.", "Adverb"], ["There is a <u>wardrobe</u> next to my bed.", "Noun"], ["The soup tastes <u>fresh</u>.", "Adjective"], ["I <u>exercise</u> every morning.", "Verb"], ["He usually arrives <u>late</u> for class.", "Adverb"], ["My sister <u>likes</u> romantic films.", "Verb"], ["The beach was really <u>beautiful</u>.", "Adjective"]],
    [["She has long straight black <u>hair</u>.", "Noun"], ["My hometown is quite <u>peaceful</u>.", "Adjective"], ["I <u>study</u> English every evening.", "Verb"], ["He drives very <u>carefully</u>.", "Adverb"], ["We stayed in a small <u>hotel</u>.", "Noun"], ["The service was <u>excellent</u>.", "Adjective"], ["They <u>play</u> badminton twice a week.", "Verb"], ["She is <u>always</u> kind to children.", "Adverb"], ["My father <u>works</u> long hours.", "Verb"], ["This bag is too <u>heavy</u>.", "Adjective"]],
    [["The <u>cinema</u> is opposite the bookshop.", "Noun"], ["He is an <u>easy-going</u> person.", "Adjective"], ["I usually <u>hang</u> out with my friends.", "Verb"], ["The baby is sleeping <u>quietly</u>.", "Adverb"], ["My birthday is in <u>July</u>.", "Noun"], ["This exercise is quite <u>simple</u>.", "Adjective"], ["She <u>wears</u> casual clothes.", "Verb"], ["I sometimes eat out <u>alone</u>.", "Adverb"], ["We <u>ordered</u> seafood for dinner.", "Verb"], ["The price was <u>reasonable</u>.", "Adjective"]],
    [["There is a big <u>table</u> in the kitchen.", "Noun"], ["My uncle is very <u>generous</u>.", "Adjective"], ["They <u>clean</u> the house on Sundays.", "Verb"], ["She smiled <u>happily</u>.", "Adverb"], ["I had a bad <u>headache</u> yesterday.", "Noun"], ["The film was <u>boring</u>.", "Adjective"], ["We <u>watched</u> an elephant show.", "Verb"], ["He rarely gets up <u>late</u>.", "Adverb"], ["My parents <u>make</u> dinner together.", "Verb"], ["The streets are very <u>busy</u>.", "Adjective"]],
  ]
  return sets[(n - 3) % sets.length]
}

function makeGeneratedMcq(topic, seed) {
  const bank = {
    "nouns-quantifiers": [
      ["There isn't _____ milk in the fridge.", ["A. many", "B. much", "C. a few", "D. a"], "B. much"],
      ["How _____ books do you read in a month?", ["A. much", "B. many", "C. a little", "D. an"], "B. many"],
      ["I need some _____ about the course.", ["A. informations", "B. information", "C. an information", "D. inform"], "B. information"],
      ["There are two _____ in my family.", ["A. childs", "B. child", "C. children", "D. childrens"], "C. children"],
      ["She has _____ friends in her hometown.", ["A. a little", "B. much", "C. a few", "D. an"], "C. a few"],
      ["I only have _____ money, so I can't eat out tonight.", ["A. a little", "B. a few", "C. many", "D. an"], "A. a little"],
      ["My dad bought two _____ of bread.", ["A. loafs", "B. loaves", "C. loaf", "D. loafes"], "B. loaves"],
      ["There aren't _____ chairs in the living room.", ["A. some", "B. much", "C. any", "D. a"], "C. any"],
      ["I have got a pair of _____.", ["A. glass", "B. glasses", "C. a glass", "D. glasss"], "B. glasses"],
      ["We saw many _____ at the zoo.", ["A. animal", "B. animals", "C. an animal", "D. much animals"], "B. animals"],
    ],
    pronouns: [
      ["Sarah is very kind. Everybody likes _____.", ["A. she", "B. her", "C. hers", "D. herself"], "B. her"],
      ["This book is _____. I bought it yesterday.", ["A. my", "B. me", "C. mine", "D. myself"], "C. mine"],
      ["The cat is washing _____ face.", ["A. it", "B. its", "C. it's", "D. their"], "B. its"],
      ["I cooked dinner by _____.", ["A. me", "B. my", "C. mine", "D. myself"], "D. myself"],
      ["My parents are teachers. _____ work at a school.", ["A. They", "B. Them", "C. Their", "D. Theirs"], "A. They"],
      ["That is Lan's bag. It is _____.", ["A. she", "B. her", "C. hers", "D. herself"], "C. hers"],
      ["I like this jacket. I think I will buy _____.", ["A. it", "B. them", "C. its", "D. they"], "A. it"],
      ["Tom hurt _____ while he was playing football.", ["A. him", "B. his", "C. himself", "D. he"], "C. himself"],
      ["These are my shoes. Those are _____.", ["A. your", "B. you", "C. yours", "D. yourself"], "C. yours"],
      ["My sister and I live with _____ parents.", ["A. we", "B. us", "C. our", "D. ours"], "C. our"],
    ],
    adjectives: [
      ["This orange juice tastes _____.", ["A. well", "B. nicely", "C. fresh", "D. freshly"], "C. fresh"],
      ["He completed the task _____.", ["A. quick", "B. quickly", "C. quicker", "D. quickness"], "B. quickly"],
      ["The film was _____. I fell asleep.", ["A. bored", "B. boring", "C. bore", "D. boringly"], "B. boring"],
      ["I am _____ in reading books about animals.", ["A. interesting", "B. interest", "C. interested", "D. interestingly"], "C. interested"],
      ["She has _____ hair.", ["A. long straight black", "B. black straight long", "C. straight black long", "D. long black straight"], "A. long straight black"],
      ["My brother speaks English _____.", ["A. good", "B. well", "C. betterly", "D. nice"], "B. well"],
      ["The restaurant was very _____.", ["A. crowd", "B. crowded", "C. crowding", "D. crowdedly"], "B. crowded"],
      ["She is a _____ person.", ["A. friend", "B. friendly", "C. friendship", "D. friendlyly"], "B. friendly"],
      ["The news was really _____.", ["A. shocked", "B. shocking", "C. shock", "D. shockingly"], "B. shocking"],
      ["He is quite _____. He always keeps his room tidy.", ["A. neat", "B. neatly", "C. neatness", "D. neaterly"], "A. neat"],
    ],
    "present-tenses": [
      ["Every morning, Jason _____ to school by bus.", ["A. go", "B. goes", "C. is going", "D. went"], "B. goes"],
      ["Listen! The baby _____.", ["A. cries", "B. cry", "C. is crying", "D. cried"], "C. is crying"],
      ["I _____ his phone number. Can you tell me?", ["A. don't know", "B. am not knowing", "C. doesn't know", "D. not know"], "A. don't know"],
      ["My parents _____ dinner in the kitchen right now.", ["A. make", "B. are making", "C. made", "D. were making"], "B. are making"],
      ["What time _____ the film begin?", ["A. do", "B. does", "C. is", "D. did"], "B. does"],
      ["She usually _____ breakfast at 7 o'clock.", ["A. have", "B. has", "C. is having", "D. had"], "B. has"],
      ["This week, I _____ for my final test.", ["A. study", "B. studies", "C. am studying", "D. studied"], "C. am studying"],
      ["He _____ coffee because it keeps him awake.", ["A. likes", "B. is liking", "C. like", "D. liked"], "A. likes"],
      ["Where _____ you going now?", ["A. do", "B. are", "C. did", "D. is"], "B. are"],
      ["My sister is always _____ her keys.", ["A. lose", "B. loses", "C. losing", "D. lost"], "C. losing"],
    ],
    "past-tenses": [
      ["We _____ to the cinema last night.", ["A. go", "B. went", "C. were going", "D. goes"], "B. went"],
      ["While I _____ TV, the phone rang.", ["A. watched", "B. watch", "C. was watching", "D. am watching"], "C. was watching"],
      ["Did you _____ your homework yesterday?", ["A. finished", "B. finish", "C. finishes", "D. finishing"], "B. finish"],
      ["When I got home, my mum _____ dinner.", ["A. cooked", "B. cooks", "C. was cooking", "D. is cooking"], "C. was cooking"],
      ["They _____ local food during the trip.", ["A. enjoy", "B. enjoyed", "C. were enjoy", "D. enjoys"], "B. enjoyed"],
      ["I didn't _____ to school by bus yesterday.", ["A. went", "B. go", "C. goes", "D. going"], "B. go"],
      ["At 8 pm last night, she _____ English.", ["A. studied", "B. studies", "C. was studying", "D. is studying"], "C. was studying"],
      ["My family _____ a seafood restaurant last weekend.", ["A. visited", "B. visit", "C. was visiting", "D. visits"], "A. visited"],
    ],
    "future-tenses": [
      ["Look at those clouds! It _____ rain.", ["A. will", "B. is going to", "C. goes to", "D. went to"], "B. is going to"],
      ["I think I _____ stay at home tonight.", ["A. will", "B. am going", "C. was", "D. do"], "A. will"],
      ["We _____ visit Hue next summer. We have already made a plan.", ["A. will", "B. are going to", "C. went to", "D. go"], "B. are going to"],
      ["Maybe I _____ phone my friend later.", ["A. will", "B. am going", "C. was", "D. did"], "A. will"],
      ["She _____ travel by train tomorrow.", ["A. is going to", "B. go to", "C. went to", "D. goes"], "A. is going to"],
      ["A: I'm tired. B: I _____ help you clean the room.", ["A. am going to", "B. will", "C. went", "D. was"], "B. will"],
    ],
    "articles-determiners": [
      ["I saw _____ elephant at the zoo.", ["A. a", "B. an", "C. the", "D. some"], "B. an"],
      ["Can you close _____ door, please?", ["A. a", "B. an", "C. the", "D. any"], "C. the"],
      ["She is _____ honest person.", ["A. a", "B. an", "C. the", "D. some"], "B. an"],
      ["I bought _____ new phone yesterday.", ["A. a", "B. an", "C. the", "D. any"], "A. a"],
      ["I like _____ cats.", ["A. a", "B. an", "C. the", "D. no article"], "D. no article"],
    ],
    prepositions: [
      ["Let's meet _____ 7 o'clock.", ["A. in", "B. on", "C. at", "D. of"], "C. at"],
      ["My birthday is _____ July.", ["A. in", "B. on", "C. at", "D. from"], "A. in"],
      ["I often go shopping _____ the weekend.", ["A. in", "B. at", "C. on", "D. to"], "B. at"],
      ["The picture is _____ the wall.", ["A. in", "B. on", "C. at", "D. under"], "B. on"],
      ["She lives _____ Hanoi.", ["A. in", "B. on", "C. at", "D. by"], "A. in"],
    ],
    "sentences-conjunctions": [
      ["I wanted to go out, _____ it was raining heavily.", ["A. and", "B. but", "C. so", "D. or"], "B. but"],
      ["She was hungry, _____ she made a sandwich.", ["A. but", "B. or", "C. so", "D. nor"], "C. so"],
      ["Would you like tea _____ coffee?", ["A. but", "B. or", "C. so", "D. because"], "B. or"],
      ["I like my bedroom _____ it is quiet.", ["A. because", "B. but", "C. or", "D. nor"], "A. because"],
      ["My brother likes football _____ badminton.", ["A. and", "B. but", "C. so", "D. nor"], "A. and"],
    ],
  }
  const arr = bank[topic] || bank["nouns-quantifiers"]
  const item = arr[seed % arr.length]
  return { topic, prompt: item[0], options: item[1], answer: item[2] }
}

function makeArticleSet(n, template) {
  const stories = [
    [["Last Sunday, we went to [input_0] beach.", ["the"]], ["We had [input_0] picnic with my family.", ["a"]], ["My mum brought [input_0] sandwiches and fruit.", ["none", "NONE", ""]], ["[input_0] weather was sunny.", ["the"]], ["I saw [input_0] old boat near the sea.", ["an"]], ["[input_0] boat was blue and white.", ["the"]], ["My brother took [input_0] photo of it.", ["a"]], ["We played badminton on [input_0] sand.", ["the"]], ["It was [input_0] wonderful day.", ["a"]], ["We came home in [input_0] evening.", ["the"]]],
    [["Yesterday, I went to [input_0] park in my hometown.", ["a"]], ["[input_0] park is next to a small lake.", ["the"]], ["There were [input_0] children playing near the gate.", ["none", "NONE", ""]], ["I saw [input_0] old man feeding birds.", ["an"]], ["[input_0] lake looked peaceful in the morning.", ["the"]], ["After that, I visited [input_0] cafe near the park.", ["a"]], ["I ordered [input_0] apple juice.", ["an"]], ["My friend had [input_0] cup of tea.", ["a"]], ["We talked about [input_0] hometown for a long time.", ["the"]], ["I want to visit [input_0] park again.", ["the"]]],
    [["Last weekend, my family ate at [input_0] seafood restaurant.", ["a"]], ["[input_0] restaurant was near my house.", ["the"]], ["We ordered [input_0] soup to start the meal.", ["a"]], ["My dad chose [input_0] main dish.", ["the"]], ["I drank [input_0] water because I was thirsty.", ["none", "NONE", ""]], ["The waiter brought [input_0] big plate of fish.", ["a"]], ["[input_0] fish was fresh and tasty.", ["the"]], ["For dessert, we had [input_0] ice cream.", ["an"]], ["It was [input_0] nice evening.", ["a"]], ["I liked [input_0] service there.", ["the"]]],
    [["On Saturday, I went to [input_0] shopping mall.", ["a"]], ["[input_0] shopping mall was very crowded.", ["the"]], ["I wanted to buy [input_0] T-shirt.", ["a"]], ["My sister bought [input_0] umbrella.", ["an"]], ["We looked at [input_0] shoes in a small shop.", ["none", "NONE", ""]], ["[input_0] shop assistant was friendly.", ["the"]], ["After shopping, we watched [input_0] film.", ["a"]], ["[input_0] film was funny.", ["the"]], ["We had dinner at [input_0] restaurant.", ["a"]], ["Then we went home by [input_0] bus.", ["none", "NONE", ""]]],
    [["Last month, I took [input_0] trip to Hue.", ["a"]], ["[input_0] trip was with my classmates.", ["the"]], ["We visited [input_0] old palace.", ["an"]], ["[input_0] palace was beautiful.", ["the"]], ["We ate [input_0] local food for lunch.", ["none", "NONE", ""]], ["Our teacher told us [input_0] interesting story.", ["an"]], ["[input_0] story was about the city.", ["the"]], ["I bought [input_0] small postcard.", ["a"]], ["The postcard showed [input_0] river.", ["the"]], ["I hope to visit [input_0] city again.", ["the"]]],
    [["My favourite room is [input_0] bedroom.", ["the"]], ["There is [input_0] small desk next to my bed.", ["a"]], ["I keep [input_0] books on the desk.", ["none", "NONE", ""]], ["There is [input_0] old lamp in the corner.", ["an"]], ["[input_0] lamp is from my grandmother.", ["the"]], ["I also have [input_0] wardrobe near the door.", ["a"]], ["[input_0] wardrobe is white and simple.", ["the"]], ["I often listen to [input_0] music there.", ["none", "NONE", ""]], ["It is [input_0] comfortable place to study.", ["a"]], ["I clean [input_0] room every Sunday.", ["the"]]],
    [["Last Friday, our class had [input_0] English event.", ["an"]], ["[input_0] event was in the school hall.", ["the"]], ["There were [input_0] students from three classes.", ["none", "NONE", ""]], ["My teacher asked [input_0] question about hobbies.", ["a"]], ["[input_0] question was easy for me.", ["the"]], ["After that, we watched [input_0] short film.", ["a"]], ["[input_0] film was about a family trip.", ["the"]], ["My friend gave [input_0] interesting answer.", ["an"]], ["It was [input_0] useful lesson.", ["a"]], ["We went home in [input_0] afternoon.", ["the"]]],
    [["Last week, my school held [input_0] sports day.", ["a"]], ["[input_0] sports day started at eight o'clock.", ["the"]], ["Many [input_0] students joined the games.", ["none", "NONE", ""]], ["I saw [input_0] exciting badminton match.", ["an"]], ["[input_0] match was between two classes.", ["the"]], ["My friend drank [input_0] water after running.", ["none", "NONE", ""]], ["A teacher gave him [input_0] orange.", ["an"]], ["We sat under [input_0] big tree to rest.", ["a"]], ["It was [input_0] healthy and fun morning.", ["a"]], ["I enjoyed [input_0] event a lot.", ["the"]]],
    [["Yesterday, I helped my mum cook [input_0] dinner.", ["none", "NONE", ""]], ["We made [input_0] soup first.", ["a"]], ["[input_0] soup had vegetables and chicken.", ["the"]], ["Then we prepared [input_0] main dish.", ["the"]], ["My brother cut [input_0] onion for the dish.", ["an"]], ["I washed [input_0] rice carefully.", ["the"]], ["After dinner, we had [input_0] fruit.", ["none", "NONE", ""]], ["My dad said it was [input_0] tasty meal.", ["a"]], ["I cleaned [input_0] kitchen after eating.", ["the"]], ["It was [input_0] relaxing evening at home.", ["a"]]],
    [["This morning, I walked around [input_0] centre of my hometown.", ["the"]], ["I visited [input_0] old bookshop near the market.", ["an"]], ["[input_0] bookshop was small but peaceful.", ["the"]], ["There were [input_0] interesting books on the shelves.", ["none", "NONE", ""]], ["I bought [input_0] notebook for English class.", ["a"]], ["Then I went to [input_0] river with my friend.", ["the"]], ["[input_0] river is a famous place in my town.", ["the"]], ["We took [input_0] photo there.", ["a"]], ["It was [input_0] lovely morning.", ["a"]], ["I love [input_0] fresh air in my hometown.", ["the"]]],
  ]
  const base = stories[(n - 3) % stories.length]
  if (template === "A") return base
  const extras = [
    [["There was [input_0] only ice cream shop near the beach.", ["the"]], ["I bought [input_0] small bottle of water.", ["a"]], ["My sister chose [input_0] orange juice.", ["an"]], ["We saw [input_0] families playing together.", ["none", "NONE", ""]], ["Everyone enjoyed [input_0] day.", ["the"]]],
    [["There was [input_0] only flower shop near the park.", ["the"]], ["I bought [input_0] small postcard.", ["a"]], ["My friend chose [input_0] interesting book.", ["an"]], ["We saw [input_0] people taking photos.", ["none", "NONE", ""]], ["I liked [input_0] peaceful atmosphere.", ["the"]]],
    [["There was [input_0] only free table near the window.", ["the"]], ["We ordered [input_0] apple pie for dessert.", ["an"]], ["My mum had [input_0] cup of tea.", ["a"]], ["We talked about [input_0] food and service.", ["the"]], ["I want to visit [input_0] restaurant again.", ["the"]]],
    [["There was [input_0] only bookshop on the first floor.", ["the"]], ["I bought [input_0] colourful notebook.", ["a"]], ["My sister chose [input_0] interesting comic book.", ["an"]], ["We saw [input_0] clothes on sale.", ["none", "NONE", ""]], ["Shopping was [input_0] tiring activity for my dad.", ["a"]]],
    [["There was [input_0] only gift shop near the gate.", ["the"]], ["I bought [input_0] small toy.", ["a"]], ["My friend chose [input_0] old-style postcard.", ["an"]], ["We saw [input_0] tourists in the street.", ["none", "NONE", ""]], ["Everyone enjoyed [input_0] trip.", ["the"]]],
  ]
  return [...base, ...extras[(n - 3) % extras.length]]
}

function makeVerbSet(n) {
  const sets = [
    [
      [`Every morning, Mina [input_0] (walk) to school, but today she [input_1] (take) the bus because it is raining.`, [["walks"], ["is taking", "'s taking"]], "present-tenses"],
      [`A: Do you want to go to the cinema now?<br>B: I can't. I [input_0] (help) my mum in the kitchen right now.`, [["am helping", "'m helping"]], "present-tenses"],
      [`I [input_0] (not / know) the answer. What time [input_1] (the lesson / begin)?`, [["don't know", "do not know"], ["does the lesson begin"]], "present-tenses"],
      [`Last summer, we [input_0] (travel) to Nha Trang and [input_1] (enjoy) the local food.`, [["travelled", "traveled"], ["enjoyed"]], "past-tenses"],
      [`While I [input_0] (read) a book, my friend [input_1] (call) me to chat.`, [["was reading"], ["called"]], "past-tenses"],
      [`When I [input_0] (get) home last night, my mum [input_1] (cook) dinner.`, [["got"], ["was cooking"]], "past-tenses"],
      [`Look at those clouds! It [input_0] (rain) soon. I think I [input_1] (stay) at home tonight.`, [["is going to rain", "'s going to rain"], ["will stay"]], "future-tenses"],
    ],
    [
      [`My father usually [input_0] (clean) the living room on Sundays, but today he [input_1] (repair) the kitchen door.`, [["cleans"], ["is repairing", "'s repairing"]], "present-tenses"],
      [`A: Where [input_0] (you / go) now?<br>B: I [input_1] (go) to the supermarket.`, [["are you going"], ["am going", "'m going"]], "present-tenses"],
      [`We [input_0] (not / have) any milk left. Can you buy a bottle?`, [["don't have", "do not have"]], "present-tenses"],
      [`Yesterday, my sister [input_0] (buy) some vegetables and [input_1] (make) soup for dinner.`, [["bought"], ["made"]], "past-tenses"],
      [`While we [input_0] (watch) a film, the phone [input_1] (ring).`, [["were watching"], ["rang"]], "past-tenses"],
      [`When I [input_0] (come) home, my brother [input_1] (do) his homework.`, [["came"], ["was doing"]], "past-tenses"],
      [`I am tired now, so I [input_0] (go) to bed early. Next weekend, we [input_1] (paint) my bedroom.`, [["will go"], ["are going to paint", "'re going to paint"]], "future-tenses"],
    ],
    [
      [`My family often [input_0] (eat) out at the weekend, but tonight we [input_1] (cook) at home.`, [["eats"], ["are cooking", "'re cooking"]], "present-tenses"],
      [`A: What [input_0] (you / order) now?<br>B: I [input_1] (choose) the main dish.`, [["are you ordering"], ["am choosing", "'m choosing"]], "present-tenses"],
      [`This soup [input_0] (taste) fresh, so I don't want any dessert.`, [["tastes"]], "present-tenses"],
      [`Last Friday, we [input_0] (visit) a seafood restaurant and [input_1] (try) the local fish.`, [["visited"], ["tried"]], "past-tenses"],
      [`While the waiter [input_0] (bring) our food, my dad [input_1] (book) a table for next week.`, [["was bringing"], ["booked"]], "past-tenses"],
      [`When we [input_0] (arrive), the restaurant [input_1] (get) very crowded.`, [["arrived"], ["was getting"]], "past-tenses"],
      [`I think the service [input_0] (be) better next time. We [input_1] (come) back on Sunday.`, [["will be"], ["are going to come", "'re going to come", "will come"]], "future-tenses"],
    ],
    [
      [`Lan usually [input_0] (go) shopping with her mum, but today she [input_1] (shop) with her friends.`, [["goes"], ["is shopping", "'s shopping"]], "present-tenses"],
      [`A: What [input_0] (you / look) for?<br>B: I [input_1] (look) for a warm jacket.`, [["are you looking"], ["am looking", "'m looking"]], "present-tenses"],
      [`This T-shirt [input_0] (look) nice, but it doesn't fit me.`, [["looks"]], "present-tenses"],
      [`Last weekend, I [input_0] (buy) a book and [input_1] (watch) a film at the cinema.`, [["bought"], ["watched"]], "past-tenses"],
      [`While I [input_0] (choose) a notebook, my sister [input_1] (find) a beautiful umbrella.`, [["was choosing"], ["found"]], "past-tenses"],
      [`When we [input_0] (leave) the shopping mall, it [input_1] (rain) heavily.`, [["left"], ["was raining"]], "past-tenses"],
      [`I think I [input_0] (buy) this jacket. Next month, we [input_1] (visit) the new shopping mall.`, [["will buy"], ["are going to visit", "'re going to visit"]], "future-tenses"],
    ],
    [
      [`My brother usually [input_0] (drink) enough water, but this week he [input_1] (feel) tired.`, [["drinks"], ["is feeling", "'s feeling"]], "present-tenses"],
      [`A: What [input_0] (you / do) now?<br>B: I [input_1] (take) some medicine for my headache.`, [["are you doing"], ["am taking", "'m taking"]], "present-tenses"],
      [`He [input_0] (not / eat) many vegetables, so he often gets a cold.`, [["doesn't eat", "does not eat"]], "present-tenses"],
      [`Yesterday, I [input_0] (have) a toothache and [input_1] (go) to the dentist.`, [["had"], ["went"]], "past-tenses"],
      [`While I [input_0] (wait) at the clinic, my mum [input_1] (phone) me.`, [["was waiting"], ["phoned", "called"]], "past-tenses"],
      [`When the doctor [input_0] (see) me, I [input_1] (feel) very nervous.`, [["saw"], ["was feeling", "felt"]], "past-tenses"],
      [`I think I [input_0] (rest) tonight. Tomorrow, I [input_1] (drink) more water.`, [["will rest"], ["am going to drink", "'m going to drink", "will drink"]], "future-tenses"],
    ],
  ]
  return sets[(n - 3) % sets.length]
}

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
    finalPacket: loadFinalPacket(),
  }
  emit(
    join(OUT, "notes.ts"),
    HEADER +
      `import type { NoteDoc, NotesAudio, IpaData, MetaData, FinalPacket } from "@/types/content"\n\n` +
      `export const docs: NoteDoc[] = ${JSON.stringify(notesData.docs, null, 2)} as unknown as NoteDoc[]\n\n` +
      `export const meta: MetaData = ${JSON.stringify(notesData.meta, null, 2)} as unknown as MetaData\n\n` +
      `export const notesAudio: NotesAudio[] = ${JSON.stringify(notesData.audio, null, 2)} as unknown as NotesAudio[]\n\n` +
      `export const ipa: IpaData = ${JSON.stringify(notesData.ipa, null, 2)} as unknown as IpaData\n\n` +
      `export const finalPacket: FinalPacket = ${JSON.stringify(notesData.finalPacket, null, 2)} as unknown as FinalPacket\n`
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
    const entry = {
      label: metaLabel.label || k,
      skill: metaLabel.skill || "misc",
      refs: topicRefs[k] || [],
      needsNotes: metaLabel.needsNotes || false,
    }
    if (metaLabel.viLabel) entry.viLabel = metaLabel.viLabel
    topicsIndex.topics[k] = entry
    topicsIndex.order.push(k)
  }

  // ---- Final Test: synthetic generated lesson + grammar pool + fixed papers ----
  const finalTests = buildFinalTests({ perLesson, topicsIndex, ctx })
  if (finalTests.generatedLesson) {
    perLesson["final-generated"] = finalTests.generatedLesson
  }
  for (const lesson of finalTests.realMockLessons || []) {
    perLesson[lesson.key] = lesson
  }
  if (finalTests.poolEntry) {
    topicsIndex.topics[finalTests.poolEntry.key] = finalTests.poolEntry.entry
    topicsIndex.order.push(finalTests.poolEntry.key)
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

  // Emit final-tests.ts
  emit(
    join(OUT, "final-tests.ts"),
    HEADER +
      `import type { FinalTests } from "@/types/content"\n\n` +
      `export const finalTests: FinalTests = ${JSON.stringify(finalTests.publicData, null, 2)} as unknown as FinalTests\n`
  )

  console.log(
    `[preprocess] ${notesData.docs.length} notes, ${index.length} lessons, ${stats.blocks} blocks, ${stats.questions} questions, ${stats.audios} audios, ${Object.keys(topicsIndex.topics).length} topics.`
  )
  console.log(
    `[preprocess] Final Test: pool ${finalTests.publicData.poolTotal} grammar Q (incl ${finalTests.publicData.generatedCount} generated), realMock ${finalTests.publicData.realMock ? finalTests.publicData.realMock.total : 0} Q, ${finalTests.publicData.sets.length} sets.`
  )
  console.log(
    `[preprocess] Tagged: ${stats.taggedBlocks} blocks / ${stats.taggedQuestions} questions.`
  )
}

main()
