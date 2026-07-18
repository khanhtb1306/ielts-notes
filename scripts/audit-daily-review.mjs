import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("source/daily");

function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<img[^>]*>/g, "")
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

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function findRawAnswerFor(rawChallenges, questionId) {
  const target = Number(questionId);
  for (const raw of rawChallenges) {
    const questions =
      raw?.questions?.json?.data ||
      raw?.questions?.data ||
      raw?.data?.questions ||
      raw?.questions ||
      [];
    if (!Array.isArray(questions)) continue;
    for (const q of questions) {
      if (q.id === target || q.id === questionId) {
        return q;
      }
    }
  }
  return null;
}

function extractQuestionOptions(rawQ, correctIds) {
  if (!rawQ) return null;
  const answer = rawQ.answer;
  if (!answer) return null;
  const correctSet = new Set(
    (Array.isArray(correctIds) ? correctIds : correctIds != null ? [correctIds] : []).map(Number)
  );
  const out = {};
  if (Array.isArray(answer.answers)) {
    out.answers = answer.answers.map((a) => ({
      id: a.id,
      value: a.value ?? a.content ?? a.text ?? "",
      is_correct: correctSet.has(Number(a.id)) || !!(a.is_correct ?? a.isCorrect),
    }));
  }
  if (answer.correct_answer) out.correct_answer = answer.correct_answer;
  if (answer.type) out.type = answer.type;
  return out;
}

const TYPE_NAMES = {
  1: "single_choice",
  2: "multi_select",
  3: "fill_blank",
  4: "single_choice",
  5: "matching",
  6: "essay",
  7: "speaking_upload",
  9: "matching_drag",
  10: "true_false",
  11: "reorder",
};

const lessons = fs
  .readdirSync(ROOT)
  .filter((name) => fs.statSync(path.join(ROOT, name)).isDirectory())
  .filter((name) => name.startsWith("lesson-"))
  .sort();

for (const lessonKey of lessons) {
  const dir = path.join(ROOT, lessonKey);
  const outFile = path.join("digest", `${lessonKey}.txt`);
  fs.mkdirSync("digest", { recursive: true });

  const content = loadJson(path.join(dir, "content.json"));
  const exercises = loadJson(path.join(dir, "exercises.json"));

  const rawDir = path.join(dir, "raw");
  const rawChallenges = fs.existsSync(rawDir)
    ? fs
        .readdirSync(rawDir)
        .filter((f) => f.endsWith(".json"))
        .map((f) => loadJson(path.join(rawDir, f)))
    : [];

  const lines = [];
  lines.push(`===== ${lessonKey} =====`);
  lines.push(``);
  lines.push(`-- CONTENT BLOCKS (${content.blocks?.length || 0}) --`);
  for (const b of content.blocks || []) {
    lines.push(``);
    lines.push(`[BLOCK ${b.id}] type=${b.type} title=${JSON.stringify(b.title)}`);
    const text = stripHtml(b.rawHtml) || (b.text || "").replace(/\s+/g, " ").trim();
    if (text) {
      lines.push(text);
    } else {
      lines.push("(empty)");
    }
  }
  lines.push(``);
  lines.push(`-- EXERCISES (${exercises.questions?.length || 0}) --`);
  for (const q of exercises.questions || []) {
    lines.push(``);
    const typeName = TYPE_NAMES[q.type] || `type_${q.type}`;
    lines.push(`[Q ${q.id}] type=${q.type}(${typeName})`);
    const prompt =
      (q.prompt || "").trim() ||
      stripHtml(q.rawHtml?.content) ||
      (q.contentText || "").trim();
    lines.push(`PROMPT: ${prompt}`);
    const intro = stripHtml(q.rawHtml?.introduction) || (q.introductionText || "").trim();
    if (intro) lines.push(`INTRO: ${intro}`);
    const answerTpl = stripHtml(q.rawHtml?.answerTemplate) || "";
    if (answerTpl && answerTpl !== "[object Object],[object Object],[object Object],[object Object]") {
      lines.push(`ANSWER_TEMPLATE: ${answerTpl}`);
    }
    const rawQ = findRawAnswerFor(rawChallenges, q.sourceQuestionId);
    const sub = q.submission || {};
    const correctIds = sub.correctAnswer;
    const opts = extractQuestionOptions(rawQ, correctIds);
    if (opts) {
      if (opts.answers) {
        for (const a of opts.answers) {
          lines.push(`  OPTION[${a.id}]${a.is_correct ? "*" : " "} ${a.value}`);
        }
      }
      if (opts.correct_answer && typeof opts.correct_answer === "object") {
        const ca = { ...opts.correct_answer };
        // strip huge fields
        delete ca.explain;
        lines.push(`  CORRECT_ANSWER: ${JSON.stringify(ca)}`);
      }
    }
    lines.push(
      `  SUBMISSION correct=${JSON.stringify(sub.correctAnswer)} user=${JSON.stringify(
        sub.userAnswer
      )}`
    );
    const explain = stripHtml(q.rawHtml?.explain) || (q.explanationText || "").trim();
    if (explain) lines.push(`EXPLAIN: ${explain}`);
  }

  fs.writeFileSync(outFile, lines.join("\n"), "utf-8");
  console.log(
    `${lessonKey}: ${content.blocks?.length || 0} blocks, ${
      exercises.questions?.length || 0
    } questions -> ${outFile}`
  );
}
