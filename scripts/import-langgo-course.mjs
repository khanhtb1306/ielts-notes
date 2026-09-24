import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join, relative } from "node:path";

const [, , courseId, exportPath] = process.argv;

if (!courseId || !exportPath) {
  console.error("Usage: node scripts/import-langgo-course.mjs <course-id> <raw-export.json>");
  process.exit(1);
}

if (!existsSync(exportPath)) {
  console.error(`Input file not found: ${exportPath}`);
  process.exit(1);
}

const ROOT = process.cwd();
const COURSE = join(ROOT, "courses", courseId);
const DAILY = join(COURSE, "daily");
const LESSONS = join(DAILY, "lessons");
const AUDIO_ROOT = join(DAILY, "audio");
const MAX_BYTES = 20 * 1024 * 1024;
const AUDIO_RE = /https:\/\/api-quiz-maker\.langgo\.vn\/storage\/audio\/[^"'<>\s]+/g;
const IMG_RE = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;

function writeJson(path, value) {
  writeFileSync(path, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function decodeEntities(value) {
  const named = { nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", mdash: "-", ndash: "-", hellip: "..." };
  return String(value || "")
    .replace(/&([A-Za-z]+);/g, (match, name) => named[name] ?? match)
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)));
}

function htmlToText(html) {
  return decodeEntities(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|tr|h[1-6])>/gi, "\n")
    .replace(/<\/(td|th)>/gi, " | ")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function lessonKey(title) {
  const match = String(title || "").match(/LESSON\s+(\d+)/i);
  return match ? `lesson-${String(match[1]).padStart(2, "0")}` : "lesson-misc";
}

function lessonNumber(key) {
  const match = key.match(/lesson-(\d+)/);
  return match ? Number(match[1]) : null;
}

function challengeNumber(title, key, index) {
  const match = String(title || "").match(/CHALLENGE\s+(\d+)/i);
  if (match) return Number(match[1]);
  return key === "lesson-misc" ? index + 1 : null;
}

function cleanUrl(url) {
  return decodeEntities(String(url || "")).replace(/\\+$/g, "");
}

function urlsIn(value, regex) {
  return [...JSON.stringify(value || {}).matchAll(regex)].map((match) => cleanUrl(match[1] || match[0])).filter((url) => /^https?:\/\//i.test(url));
}

function isDownloadableHttpUrl(url) {
  if (!/^https?:\/\//i.test(url)) return false;
  if (/icons8-speaker/i.test(url)) return false;
  try { new URL(url); return true; } catch { return false; }
}

function imageUrls(value) {
  const urls = new Set();
  const visit = (node) => {
    if (!node) return;
    if (typeof node === "string") {
      for (const match of node.matchAll(IMG_RE)) if (isDownloadableHttpUrl(cleanUrl(match[1]))) urls.add(cleanUrl(match[1]));
      return;
    }
    if (Array.isArray(node)) return node.forEach(visit);
    if (typeof node === "object") {
      for (const [key, child] of Object.entries(node)) {
        if ((key === "link_image" || key === "url_image") && typeof child === "string" && isDownloadableHttpUrl(cleanUrl(child))) urls.add(cleanUrl(child));
        else visit(child);
      }
    }
  };
  visit(value);
  return [...urls];
}

function safeName(value) {
  return String(value || "file").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100) || "file";
}

function extensionFrom(url, contentType, fallback) {
  const fromPath = extname(new URL(url).pathname);
  if (fromPath) return fromPath;
  if (/png/i.test(contentType || "")) return ".png";
  if (/webp/i.test(contentType || "")) return ".webp";
  if (/gif/i.test(contentType || "")) return ".gif";
  return fallback;
}

async function download(url, filePath) {
  if (existsSync(filePath)) return { status: "exists", bytes: statSync(filePath).size };
  const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > MAX_BYTES) throw new Error(`File exceeds ${MAX_BYTES} bytes`);
  writeFileSync(filePath, buffer);
  return { status: "downloaded", bytes: buffer.length, contentType: response.headers.get("content-type") };
}

function scrubListItem(item) {
  const copy = { ...(item || {}) };
  delete copy.student_challenge;
  return copy;
}

function normalizeQuestion(item, meta, submissionByQuestion) {
  const answer = item.answer?.answers ?? null;
  const submitted = submissionByQuestion?.[String(item.id)] || null;
  return {
    id: `question-${item.id}`,
    sourceQuestionId: item.id,
    challengeId: meta.challengeId,
    classChallengeId: meta.classChallengeId,
    title: htmlToText(item.title) || null,
    type: item.type ?? null,
    prompt: htmlToText(item.title || item.introduction || item.content),
    introductionText: htmlToText(item.introduction),
    contentText: htmlToText(item.content),
    answerTemplateText: htmlToText(answer && typeof answer === "object" && "content" in answer ? answer.content : answer),
    explanationText: htmlToText(item.explain),
    rawHtml: {
      title: item.title || null,
      introduction: item.introduction || null,
      content: item.content || null,
      answerTemplate: answer && typeof answer === "object" && "content" in answer ? answer.content : null,
      explain: item.explain || null
    },
    options: Array.isArray(answer) ? answer : null,
    audioRefs: [...new Set(urlsIn(item, AUDIO_RE))].map((url) => ({ url, localFile: null, script: null })),
    imageRefs: imageUrls(item).map((url) => ({ url, localFile: null })),
    submission: submitted ? {
      totalQuestion: submitted.total_question ?? null,
      totalCorrect: submitted.total_correct_result_answer ?? null,
      userAnswer: submitted.user_answer ?? null,
      correctAnswer: submitted.correct_answer ?? null,
      resultAnswer: submitted.result_answer ?? null,
      hasAnswerEmpty: submitted.has_answer_empty ?? null
    } : null
  };
}

const raw = JSON.parse(readFileSync(exportPath, "utf8"));
mkdirSync(LESSONS, { recursive: true });
mkdirSync(AUDIO_ROOT, { recursive: true });

const grouped = new Map();
for (const result of raw.results || []) {
  const title = result.listItem?.challenge_title || result.classChallenge?.json?.data?.challenge?.title || "Untitled challenge";
  const key = lessonKey(title);
  if (!grouped.has(key)) grouped.set(key, []);
  grouped.get(key).push({ ...result, listItem: scrubListItem(result.listItem), _title: title });
}

const summary = { generatedAt: new Date().toISOString(), courseId, totalChallenges: raw.results?.length || 0, lessons: [] };

for (const [key, results] of [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))) {
  const lessonDir = join(LESSONS, key);
  const rawDir = join(lessonDir, "raw");
  const imageDir = join(lessonDir, "images");
  const lessonAudioDir = join(AUDIO_ROOT, key);
  mkdirSync(rawDir, { recursive: true });
  mkdirSync(imageDir, { recursive: true });
  mkdirSync(lessonAudioDir, { recursive: true });

  const manifest = {
    schemaVersion: 2,
    lesson: lessonNumber(key),
    lessonKey: key,
    title: key === "lesson-misc" ? "Break Challenges" : `Lesson ${lessonNumber(key)}`,
    source: "LangGo daily challenge API",
    rawFolder: "raw/",
    files: { content: "content.json", exercises: "exercises.json", scripts: "scripts.json", submission: "submission.json", audioManifest: "audio/manifest.json", imageManifest: "images/manifest.json" },
    challenges: []
  };
  const content = { lesson: manifest.lesson, lessonKey: key, blocks: [] };
  const exercises = { lesson: manifest.lesson, lessonKey: key, questions: [] };
  const submissions = { lesson: manifest.lesson, lessonKey: key, items: [] };
  const audio = { lesson: manifest.lesson, lessonKey: key, items: [] };
  const images = { lesson: manifest.lesson, lessonKey: key, items: [] };

  for (let index = 0; index < results.length; index += 1) {
    const result = results[index];
    const list = result.listItem || {};
    const cc = result.classChallenge?.json?.data || {};
    const challenge = cc.challenge || {};
    const challengeId = Number(list.challenge_id || cc.challenge_id || challenge.id);
    const classChallengeId = String(list.id || cc.id || "");
    const number = challengeNumber(result._title, key, index);
    const rawName = `challenge-${number == null ? "xx" : String(number).padStart(2, "0")}-${challengeId}.json`;
    const cleanResult = { ...result };
    delete cleanResult._title;
    writeJson(join(rawDir, rawName), cleanResult);

    const meta = {
      id: challengeId,
      challengeId,
      classChallengeId,
      number,
      title: result._title,
      note: list.challenge_note || challenge.note || "",
      day: Number(list.day || cc.day || challenge.day || 0) || null,
      deadline: list.deadline || cc.deadline || null,
      totalQuestion: Number(list.total_question || challenge.total_question || 0) || null,
      classification: list.classification || challenge.classification || null,
      rawFile: `raw/${rawName}`
    };
    manifest.challenges.push(meta);

    for (const item of result.assignment?.json?.data || []) {
      content.blocks.push({
        id: `assignment-${item.id ?? item.index ?? content.blocks.length + 1}`,
        sourceId: item.id ?? null,
        challengeId,
        classChallengeId,
        type: item.type ?? null,
        title: htmlToText(item.title) || null,
        text: htmlToText(item.content || item.title || item.transcript),
        rawHtml: item.content || item.title || null,
        audioRefs: [...new Set(urlsIn(item, AUDIO_RE))].map((url) => ({ url, localFile: null, script: htmlToText(item.transcript) || null })),
        imageRefs: imageUrls(item).map((url) => ({ url, localFile: null }))
      });
    }

    const student = result.studentChallenge?.json?.data || null;
    const submissionByQuestion = student?.answers && !Array.isArray(student.answers) ? student.answers : {};
    for (const item of result.questions?.json?.data || []) exercises.questions.push(normalizeQuestion(item, meta, submissionByQuestion));
    if (student) {
      submissions.items.push({
        challengeId,
        classChallengeId,
        statusMark: student.status_mark || null,
        rate: student.rate ?? null,
        correctAnswer: student.correct_answer ?? null,
        submittedAt: student.submitted_at || null,
        markedAt: student.status_mark_date || null,
        commentText: htmlToText(student.comment),
        redoCommentText: htmlToText(student.redo_comment),
        cancelCommentText: htmlToText(student.cancel_comment),
        answers: student.answers || null
      });
    }
  }

  const allAudioUrls = [...new Set(results.flatMap((result) => urlsIn(result, AUDIO_RE)))];
  for (let index = 0; index < allAudioUrls.length; index += 1) {
    const url = allAudioUrls[index];
    const ext = extensionFrom(url, "", ".mp3");
    const fileName = `${String(index + 1).padStart(3, "0")}-${safeName(basename(new URL(url).pathname, ext))}${ext}`;
    const filePath = join(lessonAudioDir, fileName);
    const item = { id: `${key}-audio-${String(index + 1).padStart(3, "0")}`, sourceUrl: url, localFile: relative(ROOT, filePath).replace(/\\/g, "/"), script: null };
    try { Object.assign(item, await download(url, filePath)); } catch (error) { item.status = "failed"; item.note = error.message; }
    audio.items.push(item);
  }

  const allImageUrls = [...new Set(results.flatMap(imageUrls))];
  for (let index = 0; index < allImageUrls.length; index += 1) {
    const url = allImageUrls[index];
    let ext = extensionFrom(url, "", ".jpg");
    let filePath = join(imageDir, `${String(index + 1).padStart(3, "0")}-${safeName(basename(new URL(url).pathname, ext) || "image")}${ext}`);
    const item = { url, localFile: relative(ROOT, filePath).replace(/\\/g, "/") };
    try { Object.assign(item, await download(url, filePath)); } catch (error) { item.status = "failed"; item.note = error.message; }
    images.items.push(item);
  }

  const localByUrl = new Map([...audio.items, ...images.items].map((item) => [item.sourceUrl || item.url, item.localFile]));
  for (const block of content.blocks) {
    for (const ref of [...block.audioRefs, ...block.imageRefs]) ref.localFile = localByUrl.get(ref.url) || null;
  }
  for (const question of exercises.questions) {
    for (const ref of [...question.audioRefs, ...question.imageRefs]) ref.localFile = localByUrl.get(ref.url) || null;
  }

  const scripts = {
    lesson: manifest.lesson,
    lessonKey: key,
    items: exercises.questions.filter((question) => question.explanationText).map((question) => ({
      id: `script-question-${question.sourceQuestionId}`,
      sourceType: "exercise",
      sourceId: question.sourceQuestionId,
      challengeId: question.challengeId,
      classChallengeId: question.classChallengeId,
      title: question.title,
      scriptText: question.explanationText,
      audioRefs: question.audioRefs
    }))
  };

  mkdirSync(join(lessonDir, "audio"), { recursive: true });
  writeJson(join(lessonDir, "manifest.json"), manifest);
  writeJson(join(lessonDir, "content.json"), content);
  writeJson(join(lessonDir, "exercises.json"), exercises);
  writeJson(join(lessonDir, "scripts.json"), scripts);
  writeJson(join(lessonDir, "submission.json"), submissions);
  writeJson(join(lessonDir, "audio", "manifest.json"), audio);
  writeJson(join(imageDir, "manifest.json"), images);
  summary.lessons.push({ lessonKey: key, challenges: results.length, contentBlocks: content.blocks.length, questions: exercises.questions.length, audioFiles: audio.items.length, images: images.items.length, failedAudio: audio.items.filter((item) => item.status === "failed").length, failedImages: images.items.filter((item) => item.status === "failed").length });
}

writeJson(join(DAILY, "import-summary.json"), summary);
console.log(JSON.stringify(summary, null, 2));
