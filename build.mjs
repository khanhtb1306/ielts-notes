// build.mjs — Static offline build for Pre-IELTS notes app.
//
// Merges:
//   - Notes: source/{pronunciation,grammar,speaking}/*.md  (+ web/enrich/*.json)
//   - Daily: source/daily/lesson-XX/*.json + raw/*.json + audio + images manifests
//   - Topics: source/daily/topics-map.json (labels, presets, speaking Q bank)
//
// Emits:
//   - index.html                 : shell + inline notes data + inline daily index + inline topics index
//   - dist/daily/lesson-XX.js    : one lazy-loaded chunk per lesson (window.__DAILY__[key] = {...})
//   - dist/daily-index.js        : optional standalone (also inlined into index.html)
//
// All output paths are relative to repo root so mở file://index.html vẫn chạy.
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, "source");
const WEB = join(ROOT, "web");
const ENRICH = join(WEB, "enrich");
const DIST = join(ROOT, "dist");
const DAILY_DIR = join(SRC, "daily");

/* ============================================================
 * Notes (Pronunciation / Grammar / Speaking) — original pipeline
 * ============================================================ */
function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: raw };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (kv) data[kv[1]] = kv[2].trim();
  }
  return { data, body: raw.slice(m[0].length) };
}
function orderOf(file) {
  const n = basename(file).match(/^(\d+)/);
  return n ? parseInt(n[1], 10) : 999;
}
function loadDir(type) {
  const dir = join(SRC, type);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort((a, b) => orderOf(a) - orderOf(b))
    .map((f) => {
      const raw = readFileSync(join(dir, f), "utf8");
      const { data, body } = parseFrontmatter(raw);
      return {
        id: basename(f, ".md"),
        type,
        title: data.title || basename(f, ".md"),
        vi: data.vi || "",
        lesson: data.lesson || data.lessons || "",
        priority: data.priority || "",
        file: `source/${type}/${f}`,
        markdown: body.trim(),
      };
    });
}
function readJsonEnrich(name, fallback) {
  const p = join(ENRICH, name);
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : fallback;
}
function readJsonAt(path, fallback) {
  return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : fallback;
}

/* ============================================================
 * Daily lessons — new pipeline
 * ============================================================ */
function stripHtml(html) {
  if (!html) return "";
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
    .trim();
}

function buildAudioUrlMap(audioManifest) {
  const m = new Map();
  for (const item of audioManifest.items || []) {
    if (item.sourceUrl && item.localFile) m.set(item.sourceUrl, item);
  }
  return m;
}
function buildImageUrlMap(imageManifest) {
  const m = new Map();
  for (const item of imageManifest.items || []) {
    if (item.url && item.localFile) m.set(item.url, item);
  }
  return m;
}

function rewriteHtml(html, audioMap, imageMap) {
  if (!html) return "";
  let out = String(html);
  // Strip inline styles + font-family (make it consistent with our CSS)
  out = out.replace(/\sstyle="[^"]*"/gi, "");
  // Rewrite images: <img src="https://api-quiz-maker...">
  out = out.replace(/<img([^>]*?)src=["']([^"']+)["']([^>]*?)>/gi, (m, before, src, after) => {
    const item = imageMap.get(src);
    // Speaker icons: strip entirely (audio is listed separately below)
    if (/icons8-speaker/i.test(src) || /speaker-40/i.test(src) || / class=["'][^"']*audio_custom_need_add_event/i.test(m)) {
      return "";
    }
    if (item && item.localFile) return `<img${before}src="${item.localFile}"${after} loading="lazy">`;
    if (/^https?:\/\/api-quiz-maker/i.test(src)) {
      return `<img${before}src="${src}"${after} loading="lazy">`; // fallback to remote if not downloaded
    }
    return `<img${before}src="${src}"${after} loading="lazy">`;
  });
  // Strip audio_custom_need_add_event spans/imgs that survived (belt & suspenders)
  out = out.replace(/<img[^>]*class=["'][^"']*audio_custom_need_add_event[^>]*>/gi, "");
  // Kill absolute widths/heights inline attrs (leave native CSS to shape)
  out = out.replace(/\swidth="\d+"/gi, "").replace(/\sheight="\d+"/gi, "");
  return out;
}

/* ---------- Extract raw questions map (id -> raw question) ---------- */
function collectRawQuestions(rawFilesDir) {
  const map = {};
  if (!existsSync(rawFilesDir)) return map;
  const files = readdirSync(rawFilesDir).filter((f) => f.endsWith(".json"));
  for (const f of files) {
    let raw;
    try { raw = JSON.parse(readFileSync(join(rawFilesDir, f), "utf8")); } catch (e) { continue; }
    const list = raw?.questions?.json?.data;
    if (Array.isArray(list)) {
      for (const q of list) { if (q && q.id != null) map[String(q.id)] = q; }
    }
  }
  return map;
}

/* ---------- Normalize a single question ---------- */
// Inject `[input_N]` (and case/space variants) slots as inline placeholders inside a fill_blank
// bodyHtml. Called AFTER rewriteHtml so tag-stripping doesn't nuke the markers.
function injectBlankSlots(html) {
  if (!html) return "";
  return String(html).replace(/\[\s*input_?(\d+)\s*\]/gi, (_m, n) =>
    `<span class="blank-slot" data-blank="${n}"></span>`);
}
function normalizeQuestion(q, rawById, audioMap, imageMap) {
  const raw = rawById[String(q.sourceQuestionId)] || null;
  const type = q.type;
  const promptHtml = rewriteHtml((q.rawHtml && (q.rawHtml.content || q.rawHtml.introduction)) || `<p>${q.prompt || ""}</p>`, audioMap, imageMap);
  const explanationHtml = rewriteHtml((q.rawHtml && q.rawHtml.explain) || "", audioMap, imageMap);
  const audioRefs = (q.audioRefs || []).map((a) => normalizeAudioRef(a, audioMap));
  const imageRefs = (q.imageRefs || []).map((i) => normalizeImageRef(i, imageMap));
  const submission = q.submission || {};
  let kind = "unknown";
  let options = [];
  let correctAnswer = [];
  let userAnswer = null;
  let blanks = null;
  let pairs = null;
  let bodyHtml = "";

  const rawAnswers = raw?.answer?.answers;

  if (type == null) {
    kind = "info"; // heading / instructions with no scoring
  } else if (type === 3) {
    // Single choice
    kind = "single_choice";
    if (Array.isArray(rawAnswers)) options = rawAnswers.map((o) => ({ id: o.id, text: stripHtml(o.content), html: rewriteHtml(o.content, audioMap, imageMap) }));
    if (submission.correctAnswer != null) correctAnswer = [submission.correctAnswer];
    if (submission.userAnswer != null) userAnswer = submission.userAnswer;
  } else if (type === 5) {
    kind = "multi_select";
    if (Array.isArray(rawAnswers)) options = rawAnswers.map((o) => ({ id: o.id, text: stripHtml(o.content), html: rewriteHtml(o.content, audioMap, imageMap) }));
    if (submission.correctAnswer != null) correctAnswer = Array.isArray(submission.correctAnswer) ? submission.correctAnswer : [submission.correctAnswer];
    if (submission.userAnswer != null) userAnswer = Array.isArray(submission.userAnswer) ? submission.userAnswer : [submission.userAnswer];
  } else if (type === 1) {
    kind = "fill_blank";
    // Blanks are keyed input_0, input_1... in submission.correctAnswer object
    const correctObj = submission.correctAnswer && typeof submission.correctAnswer === "object" ? submission.correctAnswer : null;
    const userObj = submission.userAnswer && typeof submission.userAnswer === "object" ? submission.userAnswer : null;
    const keys = correctObj ? Object.keys(correctObj).sort((a, b) => parseInt(a.split("_")[1]) - parseInt(b.split("_")[1])) : [];
    blanks = keys.map((k) => ({
      key: k,
      answers: Array.isArray(correctObj[k]) ? correctObj[k] : [correctObj[k]],
      userAnswer: userObj ? userObj[k] : null,
      explanationHtml: ""
    }));
    if (blanks.length) userAnswer = blanks.map((b) => b.userAnswer);
    // The real exercise sentences (with [input_N] markers) live in rawHtml.answerTemplate
    // — content/introduction is only the header/instruction. Preserve both.
    const rawTpl = (q.rawHtml && q.rawHtml.answerTemplate) || "";
    bodyHtml = injectBlankSlots(rewriteHtml(rawTpl, audioMap, imageMap));
  } else if (type === 2) {
    // Open text or matching. If raw has options array of {left,right}, treat as matching.
    // We treat as open by default.
    kind = "open_or_video";
    if (typeof submission.userAnswer === "string") userAnswer = submission.userAnswer;
    // Detect matching heuristically: rawAnswers with pair-like structure
    if (Array.isArray(rawAnswers) && rawAnswers.length && rawAnswers.every((o) => o.left && o.right)) {
      kind = "matching";
      pairs = rawAnswers.map((o, i) => ({ leftId: o.leftId || String(i), left: stripHtml(o.left), rightId: o.rightId || String(i), right: stripHtml(o.right) }));
    }
  } else if (type === 4) {
    kind = "open_or_video";
    if (typeof submission.userAnswer === "string") userAnswer = submission.userAnswer;
  }

  const resultTruth = submission.resultAnswer;
  let correct = null;
  if (typeof resultTruth === "boolean") correct = resultTruth;
  else if (resultTruth && typeof resultTruth === "object") {
    const values = Object.values(resultTruth);
    if (values.length) correct = values.every((v) => v === true);
  }

  return {
    id: q.id,
    sourceQuestionId: q.sourceQuestionId,
    challengeNumber: null, // filled by caller
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
    topics: [] // filled by tagger
  };
}

function normalizeAudioRef(a, audioMap) {
  const src = a.url || a.sourceUrl;
  const item = src && audioMap.get(src);
  return {
    url: src || null,
    localFile: (item && item.localFile) || a.localFile || null,
    script: a.script || (item && item.script) || null,
    text: a.text || null,
    source: a.source || null
  };
}
function normalizeImageRef(i, imageMap) {
  const src = i.url;
  const item = src && imageMap.get(src);
  return {
    url: src || null,
    localFile: (item && item.localFile) || i.localFile || null,
    alt: i.alt || null
  };
}

/* ---------- Normalize a content block ---------- */
function normalizeContentBlock(b, audioMap, imageMap) {
  return {
    id: b.id,
    sourceId: b.sourceId,
    challengeId: b.challengeId,
    challengeNumber: null,
    type: b.type,
    title: b.title,
    text: b.text,
    html: rewriteHtml(b.rawHtml || (b.text ? `<p>${b.text}</p>` : ""), audioMap, imageMap),
    audioRefs: (b.audioRefs || []).map((a) => normalizeAudioRef(a, audioMap)),
    imageRefs: (b.imageRefs || []).map((i) => normalizeImageRef(i, imageMap)),
    topics: []
  };
}

/* ---------- Topic tagging ---------- */
// Extract topics keyword-mentioned in `text`, preserving first-occurrence order in the text.
function extractOrderedTopics(text, ctx) {
  const lower = String(text || "").toLowerCase();
  if (!lower) return [];
  const hits = [];
  for (const kw of Object.keys(ctx.noteKeywords || {})) {
    const pos = lower.indexOf(kw);
    if (pos < 0) continue;
    for (const t of ctx.noteKeywords[kw]) hits.push({ topic: t, pos });
  }
  hits.sort((a, b) => a.pos - b.pos);
  const seen = new Set();
  const out = [];
  for (const h of hits) {
    if (!seen.has(h.topic)) { seen.add(h.topic); out.push(h.topic); }
  }
  return out;
}

// Split-role tagger:
//   - selfText  = prompt + explanation (for questions) OR block text/title (for blocks)
//   - noteText  = challenge.note (shared context; expresses what the whole challenge covers)
// Rules:
//   1. explicit override wins.
//   2. If selfText signals topics → those topics get role "core" (in hints) or "preview" (not in hints).
//      Topics that appear only in noteText → role "review" (challenge touches but not focus of THIS item).
//   3. If selfText signals nothing but noteText signals topics → FIRST-mentioned note topic = "core"
//      (the challenge's primary), the rest = "review". Preserves note-position order so multi-topic
//      challenges like "Vocabulary (get) | Pronunciation (Vowels)" default to their first section.
//   4. If nothing matches anywhere → fall back to `lessonTopicHints[lessonKey][0]` as core (unchanged).
function tagWithTopics({ selfText, noteText, lessonKey, sourceKind, sourceItemId }, ctx) {
  const overrides = ctx.overrides || {};
  const explicit = overrides[sourceItemId];
  if (explicit) {
    return explicit.map((t) => (typeof t === "string" ? { key: t, role: "core" } : t));
  }
  const hints = (ctx.lessonTopicHints && ctx.lessonTopicHints[lessonKey]) || [];
  const hintsSet = new Set(hints);
  const selfTopics = extractOrderedTopics(selfText, ctx);
  const noteTopics = extractOrderedTopics(noteText, ctx);
  const result = [];
  const done = new Set();

  if (selfTopics.length) {
    for (const t of selfTopics) {
      if (done.has(t)) continue;
      result.push({ key: t, role: hintsSet.has(t) ? "core" : "preview" });
      done.add(t);
    }
    for (const t of noteTopics) {
      if (done.has(t)) continue;
      result.push({ key: t, role: "review" });
      done.add(t);
    }
  } else if (noteTopics.length) {
    result.push({ key: noteTopics[0], role: "core" });
    done.add(noteTopics[0]);
    for (let i = 1; i < noteTopics.length; i++) {
      const t = noteTopics[i];
      if (done.has(t)) continue;
      result.push({ key: t, role: "review" });
      done.add(t);
    }
  } else if (hints.length) {
    result.push({ key: hints[0], role: "core" });
  }
  return result;
}

/* ---------- Group questions into exercises by challenge ---------- */
function groupExercises(questions, manifest) {
  const groups = {};
  for (const q of questions) {
    const ch = manifest.challenges.find((c) => c.challengeId === q.challengeId) || {};
    const key = "ch-" + (q.challengeId || "unknown");
    if (!groups[key]) {
      groups[key] = {
        id: key,
        challengeId: q.challengeId,
        challengeNumber: ch.number || null,
        title: ch.title ? ch.title.replace(/^\[PRE IELTS\]\s*/i, "") : `Challenge ${ch.number || "?"}`,
        note: ch.note || "",
        introHtml: "",
        questions: []
      };
    }
    q.challengeNumber = ch.number || null;
    groups[key].questions.push(q);
  }
  return Object.values(groups);
}

/* ---------- Normalize a lesson ---------- */
function normalizeLesson(lessonKey, ctx) {
  const dir = join(DAILY_DIR, lessonKey);
  const manifest = readJsonAt(join(dir, "manifest.json"), null);
  if (!manifest) return null;
  const content = readJsonAt(join(dir, "content.json"), { blocks: [] });
  const exercises = readJsonAt(join(dir, "exercises.json"), { questions: [] });
  const scripts = readJsonAt(join(dir, "scripts.json"), { blocks: [] });
  const submission = readJsonAt(join(dir, "submission.json"), { items: [] });
  const audioManifest = readJsonAt(join(dir, "audio", "manifest.json"), { items: [] });
  const imageManifest = readJsonAt(join(dir, "images", "manifest.json"), { items: [] });
  const audioMap = buildAudioUrlMap(audioManifest);
  const imageMap = buildImageUrlMap(imageManifest);
  const rawById = collectRawQuestions(join(dir, "raw"));

  // Normalize content blocks
  const contentBlocks = (content.blocks || []).map((b) => {
    const nb = normalizeContentBlock(b, audioMap, imageMap);
    const ch = manifest.challenges.find((c) => c.challengeId === b.challengeId);
    nb.challengeNumber = ch ? ch.number : null;
    nb.challengeNote = ch ? ch.note : "";
    const selfText = [nb.title, nb.text, stripHtml(nb.html)].filter(Boolean).join(" \n ");
    const noteText = (ch && ch.note) || "";
    nb.topics = tagWithTopics({ selfText, noteText, lessonKey, sourceKind: "block", sourceItemId: b.id }, ctx);
    return nb;
  });

  // Normalize questions
  const normQuestions = (exercises.questions || []).map((q) => {
    const nq = normalizeQuestion(q, rawById, audioMap, imageMap);
    const ch = manifest.challenges.find((c) => c.challengeId === q.challengeId);
    nq.challengeNumber = ch ? ch.number : null;
    // Include bodyHtml text so fill_blank exercise sentences contribute topic signals too.
    const selfText = [nq.prompt, stripHtml(nq.bodyHtml), stripHtml(nq.explanationHtml)].filter(Boolean).join(" \n ");
    const noteText = (ch && ch.note) || "";
    nq.topics = tagWithTopics({ selfText, noteText, lessonKey, sourceKind: "question", sourceItemId: nq.id }, ctx);
    return nq;
  });

  const exerciseGroups = groupExercises(normQuestions, manifest);

  // Audio manifest -> list of audios accessible with script
  const audio = (audioManifest.items || []).map((a) => ({
    id: a.id,
    challengeId: a.challengeId,
    localFile: a.localFile,
    url: a.sourceUrl,
    script: a.script,
    needsScriptReview: !!a.needsScriptReview,
    note: a.note
  }));

  // Vocab pairs: extract from content blocks with structured content, plus manifest hints
  // Heuristic: any script like "X: Y" or "X - Y"
  const vocabPairs = [];
  for (const a of audio) {
    if (a.script) {
      const m = a.script.match(/^([^:\-]+)[:\-]\s*(.+)$/);
      if (m) vocabPairs.push({ term: m[1].trim(), meaning: m[2].trim() });
    }
  }

  // Aggregate totals
  let totalQuestion = 0, totalCorrect = 0;
  for (const item of submission.items || []) {
    for (const q of Object.values(item.answers || {})) {
      totalQuestion += q.total_question || 0;
      totalCorrect += q.total_correct_result_answer || 0;
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
      totalQuestion: c.totalQuestion
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
      commentText: (submission.items && submission.items[0] && submission.items[0].commentText) || null
    }
  };
}

function summarizeLesson(lessonData) {
  return {
    key: lessonData.key,
    number: lessonData.number,
    label: `Lesson ${lessonData.number} · ${(lessonData.challenges || []).map((c) => c.note).filter(Boolean).join(" | ") || lessonData.title}`,
    challenges: (lessonData.challenges || []).map((c) => ({ number: c.number, title: c.title, note: c.note })),
    totalQuestion: lessonData.submissionSummary.totalQuestion,
    totalCorrect: lessonData.submissionSummary.totalCorrect,
    correctRate: lessonData.submissionSummary.correctRate,
    hasAudio: (lessonData.audio || []).length > 0,
    numContentBlocks: (lessonData.contentBlocks || []).length,
    numQuestions: (lessonData.exerciseGroups || []).reduce((n, g) => n + (g.questions || []).length, 0)
  };
}

function loadDaily() {
  const topicsMapPath = join(DAILY_DIR, "topics-map.json");
  const topicsMap = existsSync(topicsMapPath) ? JSON.parse(readFileSync(topicsMapPath, "utf8")) : {
    topicLabels: {}, noteKeywords: {}, lessonTopicHints: {}, questionOverrides: {}, blockOverrides: {},
    speakingQuestions: {}, practicePresets: []
  };
  const ctx = {
    topicLabels: topicsMap.topicLabels || {},
    noteKeywords: topicsMap.noteKeywords || {},
    lessonTopicHints: topicsMap.lessonTopicHints || {},
    overrides: { ...(topicsMap.blockOverrides || {}), ...(topicsMap.questionOverrides || {}) },
    speakingQuestions: topicsMap.speakingQuestions || {},
    practicePresets: topicsMap.practicePresets || []
  };
  if (!existsSync(DAILY_DIR)) return { index: [], perLesson: {}, topicsIndex: { topics: {}, order: [] }, topicLabels: ctx.topicLabels, speakingQuestions: ctx.speakingQuestions, presets: ctx.practicePresets };
  const lessonKeys = readdirSync(DAILY_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^lesson-/.test(d.name))
    .map((d) => d.name)
    .sort();
  const perLesson = {};
  const index = [];
  const topicRefs = {};
  const stats = { blocks: 0, questions: 0, audios: 0, taggedBlocks: 0, taggedQuestions: 0 };

  for (const key of lessonKeys) {
    const data = normalizeLesson(key, ctx);
    if (!data) continue;
    perLesson[key] = data;
    index.push(summarizeLesson(data));

    for (const b of data.contentBlocks) {
      stats.blocks++;
      if (b.topics.length) stats.taggedBlocks++;
      for (const t of b.topics) {
        (topicRefs[t.key] = topicRefs[t.key] || []).push({ lessonKey: key, kind: "block", itemId: b.id, role: t.role });
      }
    }
    for (const g of data.exerciseGroups) for (const q of g.questions) {
      stats.questions++;
      if (q.topics.length) stats.taggedQuestions++;
      for (const t of q.topics) {
        (topicRefs[t.key] = topicRefs[t.key] || []).push({ lessonKey: key, kind: "question", itemId: q.id, role: t.role, qkind: q.kind });
      }
    }
    stats.audios += data.audio.length;
  }

  // Build topicsIndex ordered by topicLabels first, then any extras
  const topicsIndex = { topics: {}, order: [] };
  const labelKeys = Object.keys(ctx.topicLabels);
  const extraKeys = Object.keys(topicRefs).filter((k) => !ctx.topicLabels[k]);
  const orderedKeys = [...labelKeys, ...extraKeys];
  for (const k of orderedKeys) {
    const meta = ctx.topicLabels[k] || {};
    topicsIndex.topics[k] = {
      label: meta.label || k,
      skill: meta.skill || "misc",
      refs: topicRefs[k] || []
    };
    topicsIndex.order.push(k);
  }

  return { index, perLesson, topicsIndex, topicLabels: ctx.topicLabels, speakingQuestions: ctx.speakingQuestions, presets: ctx.practicePresets, stats };
}

/* ============================================================
 * Main build
 * ============================================================ */
const notesData = {
  docs: [...loadDir("pronunciation"), ...loadDir("grammar"), ...loadDir("speaking")],
  meta: readJsonEnrich("meta.json", {}),
  audio: readJsonEnrich("audio.json", []),
  ipa: readJsonEnrich("ipa.json", {})
};

const daily = loadDaily();

// Merge into __DATA__
const clientData = {
  ...notesData,
  dailyIndex: daily.index,
  topicsIndex: daily.topicsIndex,
  topicLabels: daily.topicLabels,
  speakingQuestions: daily.speakingQuestions,
  presets: daily.presets
};

// Emit per-lesson chunks to dist/daily
if (existsSync(DIST)) rmSync(DIST, { recursive: true, force: true });
mkdirSync(join(DIST, "daily"), { recursive: true });
function safeJson(v) {
  return JSON.stringify(v).replace(/<\/(script|style)/gi, "<\\/$1").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}
for (const [key, data] of Object.entries(daily.perLesson)) {
  const js = `window.__DAILY__=window.__DAILY__||{};window.__DAILY__[${JSON.stringify(key)}]=${safeJson(data)};`;
  writeFileSync(join(DIST, "daily", `${key}.js`), js, "utf8");
}

// Concatenate JS modules
const appJs = readFileSync(join(WEB, "app.js"), "utf8");
const dailyJs = existsSync(join(WEB, "daily.js")) ? readFileSync(join(WEB, "daily.js"), "utf8") : "";
const topicsJs = existsSync(join(WEB, "topics.js")) ? readFileSync(join(WEB, "topics.js"), "utf8") : "";
const practiceJs = existsSync(join(WEB, "practice.js")) ? readFileSync(join(WEB, "practice.js"), "utf8") : "";
const bootJs = "\n/* ---- bootstrap ---- */\nif (window.APP && window.APP.init) window.APP.init();\n";
const bundled = [appJs, dailyJs, topicsJs, practiceJs, bootJs].join("\n\n/* ---- module boundary ---- */\n\n");

const template = readFileSync(join(WEB, "template.html"), "utf8");
const styles = readFileSync(join(WEB, "styles.css"), "utf8");
const html = template
  .replace("/*__STYLES__*/", () => styles)
  .replace("/*__DATA__*/", () => "window.__DATA__ = " + safeJson(clientData) + ";")
  .replace("/*__APP__*/", () => bundled);

writeFileSync(join(ROOT, "index.html"), html, "utf8");

const totalChunkSize = Object.values(daily.perLesson).reduce((n, d) => n + JSON.stringify(d).length, 0);
const dailyIndexBytes = JSON.stringify(daily.index).length;
const topicsIndexBytes = JSON.stringify(daily.topicsIndex).length;
console.log(
  `Built index.html: ${notesData.docs.length} notes docs, ${notesData.audio.length} notes audio entries.`
);
console.log(
  `Daily: ${daily.index.length} lessons, ${daily.stats?.blocks || 0} blocks, ${daily.stats?.questions || 0} questions, ${daily.stats?.audios || 0} audios.`
);
console.log(
  `Topics: ${Object.keys(daily.topicsIndex.topics).length} topics (tagged: ${daily.stats?.taggedBlocks || 0} blocks / ${daily.stats?.taggedQuestions || 0} questions).`
);
console.log(
  `Dist chunks: ${Object.keys(daily.perLesson).length} files, ${(totalChunkSize / 1024).toFixed(1)} KB total.`
);
console.log(
  `Inline data: dailyIndex=${(dailyIndexBytes / 1024).toFixed(1)}KB, topicsIndex=${(topicsIndexBytes / 1024).toFixed(1)}KB.`
);
