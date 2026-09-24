// Extract clean, structured data from the IFA speaking handout HTML files.
//
// The handouts are one-off HTML artifacts. We DO NOT carry any HTML/CSS/JS into
// the React app. This script only lifts the embedded `LESSONS` data object (and,
// for the drill tool, the question bank) and re-emits it as normalised JSON under
// courses/ifa-ielts/notes/enrich/.
//
// Output:
//   speaking-handouts.json  -> guided answer builders (per DC lesson)
//   speaking-bank.json      -> flat question bank for the random drill
//
// Re-run after adding new lesson HTML files; it auto-discovers *.html in the
// source/speaking folder.

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(HERE);
const SRC = join(ROOT, "courses", "ifa-ielts", "source", "speaking");
const OUT_DIR = join(ROOT, "courses", "ifa-ielts", "notes", "enrich");

/* -------------------- helpers -------------------- */

// Find `const|var|let <name> = {` and return the balanced object literal text.
function extractObjectLiteral(src, name) {
  const re = new RegExp(`(?:const|var|let)\\s+${name}\\s*=\\s*`, "g");
  const m = re.exec(src);
  if (!m) return null;
  let i = re.lastIndex;
  while (i < src.length && src[i] !== "{") i += 1;
  if (src[i] !== "{") return null;
  const start = i;
  let depth = 0;
  let inStr = null;
  let esc = false;
  for (; i < src.length; i += 1) {
    const ch = src[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") { inStr = ch; continue; }
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return src.slice(start, i + 1);
    }
  }
  return null;
}

// Evaluate an object-literal string safely in an isolated VM context.
function evalObject(literal) {
  return vm.runInNewContext(`(${literal})`, Object.create(null), { timeout: 2000 });
}

function firstScriptWith(src, name) {
  // Only look at the first occurrence so a concatenated second document is ignored.
  const literal = extractObjectLiteral(src, name);
  return literal ? evalObject(literal) : null;
}

function clean(s) {
  return typeof s === "string" ? s.replace(/\u00a0/g, " ").trim() : s;
}

function normPhrase(p) {
  if (!p) return null;
  const out = { en: clean(p.en) || "", ipa: clean(p.ipa) || "", vi: clean(p.vi) || "" };
  if (Array.isArray(p.places) && p.places.length) {
    out.places = p.places.map(normPhrase).filter(Boolean);
  }
  return out;
}

function normGroups(groups) {
  if (!Array.isArray(groups)) return [];
  return groups.map((g) => ({
    name: clean(g.name) || "",
    vi: clean(g.vi) || "",
    items: (g.items || []).map(normPhrase).filter(Boolean),
  }));
}

function normStruct(st) {
  const parts = (st.parts || []).map((p) =>
    typeof p === "string" ? { type: "text", text: p } : { type: "slot", slot: Number(p.s) }
  );
  return {
    parts,
    vi: clean(st.vi) || "",
    example: clean(st.eg) || "",
  };
}

function normScenario(sc) {
  return {
    name: clean(sc.name) || "",
    vi: clean(sc.vi) || "",
    labels: {
      g1: clean(sc.g1label) || "",
      g2: clean(sc.g2label) || "",
      g3: clean(sc.g3label) || "",
    },
    g2DependsOnG1: !!sc.g2dependsOnG1,
    g2Prompt: clean(sc.g2prompt) || "",
    structs: (sc.structs || []).map(normStruct),
    g1: (sc.g1 || []).map(normPhrase).filter(Boolean),
    g2groups: normGroups(sc.g2groups),
    g3groups: normGroups(sc.g3groups),
  };
}

function normVocab(vocab) {
  if (!Array.isArray(vocab)) return [];
  return vocab
    .map((row) => {
      if (!Array.isArray(row)) return null;
      const [term, pos, vi, ipa] = row;
      return { term: clean(term) || "", pos: clean(pos) || "", vi: clean(vi) || "", ipa: clean(ipa) || "" };
    })
    .filter(Boolean);
}

function normQuestion(q) {
  return {
    title: clean(q.title) || "",
    vi: clean(q.vi) || "",
    scenarios: (q.scenarios || []).map(normScenario),
    vocab: normVocab(q.vocab),
  };
}

function lessonNumberFromFile(file) {
  const m = basename(file).match(/lesson-(\d+)/i);
  return m ? Number(m[1]) : null;
}

const AUDIENCE_RULES = [
  { re: /HIGH\s*SCHOOL/i, id: "highschool", label: "Học sinh" },
  { re: /UNIVERSITY/i, id: "university", label: "Sinh viên" },
  { re: /WORKING|WORK\b/i, id: "working", label: "Người đi làm" },
];

/** Split "STUDY — HIGH SCHOOL STUDENT" into a clean topic + audience.
 *  Falls back to the raw topic when no audience marker is present. */
function splitTopic(rawTopic) {
  const topic = String(rawTopic || "").trim();
  const matched = AUDIENCE_RULES.find((r) => r.re.test(topic));
  // Drop presentation-only suffixes like "— DAILY CHALLENGE".
  const head = topic.split(/\s+[—–]\s+/)[0].replace(/\s*DAILY\s+CHALLENGE\s*/i, "").trim();
  return {
    topicLabel: titleCase(head || topic),
    audience: matched ? matched.id : null,
    audienceLabel: matched ? matched.label : null,
  };
}

function titleCase(value) {
  const s = String(value || "").trim();
  if (!s) return "";
  // Source topics are ALL CAPS; convert to Title Case but keep short acronyms.
  if (s !== s.toUpperCase()) return s;
  return s
    .toLowerCase()
    .replace(/\b([a-z])/g, (_, c) => c.toUpperCase());
}

/** Pull the grammar focus out of a handout label, e.g.
 *  "DC Lesson 2 — Present Simple + Past Simple · SHOPPING" -> "Present Simple + Past Simple". */
function grammarFocusFromLabel(label) {
  const s = String(label || "");
  const afterDash = s.split(/\s+[—–]\s+/)[1];
  if (!afterDash) return "";
  const beforeDot = afterDash.split(/\s+·\s+/)[0].trim();
  // Ignore audience-style labels (dc4 variants use "Học sinh (High school student)").
  if (AUDIENCE_RULES.some((r) => r.re.test(beforeDot))) return "";
  if (/daily\s+challenge/i.test(beforeDot)) return "";
  return beforeDot;
}

/* -------------------- handout parsing -------------------- */

function parseHandoutFile(file) {
  const src = readFileSync(join(SRC, file), "utf8");
  const LESSONS = firstScriptWith(src, "LESSONS");
  if (!LESSONS || typeof LESSONS !== "object") return [];
  const lessonNo = lessonNumberFromFile(file);
  const handouts = [];
  for (const [key, data] of Object.entries(LESSONS)) {
    if (!data || !Array.isArray(data.questions)) continue;
    const rawTopic = clean(data.topic) || "";
    const rawLabel = clean(data.label) || `Lesson ${lessonNo}`;
    const { topicLabel, audience, audienceLabel } = splitTopic(rawTopic);
    handouts.push({
      id: key, // e.g. dc2, dc4hs
      lesson: lessonNo,
      // Display-ready fields — the UI must never re-parse these strings.
      topicLabel,
      audience,
      audienceLabel,
      grammarFocus: grammarFocusFromLabel(rawLabel),
      // Originals kept for traceability.
      rawTopic,
      rawLabel,
      questions: data.questions.map(normQuestion),
    });
  }
  return handouts;
}

/* -------------------- drill bank parsing -------------------- */

function parseDrillBank() {
  const file = "random-tool.html";
  const path = join(SRC, file);
  if (!existsSync(path)) return { lessons: [] };
  const src = readFileSync(path, "utf8");
  const LESSONS = firstScriptWith(src, "LESSONS");
  if (!LESSONS || typeof LESSONS !== "object") return { lessons: [] };
  const lessons = [];
  for (const [key, data] of Object.entries(LESSONS)) {
    if (!data) continue;
    const variants = [];
    // Standard shape: { title, items:[{topic,text}] }
    if (Array.isArray(data.items)) {
      variants.push({ audience: null, items: data.items.map((it) => ({ topic: clean(it.topic) || "", text: clean(it.text) || "" })) });
    }
    // Lesson 4 shape: items_highschool / items_university / items_working
    for (const [k, v] of Object.entries(data)) {
      const am = k.match(/^items_(.+)$/);
      if (am && Array.isArray(v)) {
        variants.push({ audience: am[1], items: v.map((it) => ({ topic: clean(it.topic) || "", text: clean(it.text) || "" })) });
      }
    }
    if (!variants.length) continue;
    const num = key.match(/(\d+)/);
    lessons.push({
      id: key,
      lesson: num ? Number(num[1]) : null,
      title: clean(data.title) || key,
      variants,
    });
  }
  lessons.sort((a, b) => (a.lesson ?? 999) - (b.lesson ?? 999));
  return { lessons };
}

/* -------------------- main -------------------- */

function main() {
  if (!existsSync(SRC)) {
    console.error(`Source folder not found: ${SRC}`);
    process.exit(1);
  }
  mkdirSync(OUT_DIR, { recursive: true });

  const handoutFiles = readdirSync(SRC)
    .filter((f) => f.endsWith(".html") && f !== "random-tool.html")
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const handouts = [];
  for (const file of handoutFiles) {
    const parsed = parseHandoutFile(file);
    handouts.push(...parsed);
  }
  handouts.sort((a, b) => (a.lesson ?? 999) - (b.lesson ?? 999) || a.id.localeCompare(b.id));

  const bank = parseDrillBank();

  writeFileSync(join(OUT_DIR, "speaking-handouts.json"), JSON.stringify({ generatedAt: new Date().toISOString(), handouts }, null, 2) + "\n", "utf8");
  writeFileSync(join(OUT_DIR, "speaking-bank.json"), JSON.stringify({ generatedAt: new Date().toISOString(), ...bank }, null, 2) + "\n", "utf8");

  console.log(JSON.stringify({
    handouts: handouts.map((h) => ({ id: h.id, lesson: h.lesson, topic: h.topicLabel, audience: h.audience, grammar: h.grammarFocus, questions: h.questions.length })),
    drillLessons: bank.lessons.map((l) => ({ id: l.id, title: l.title, variants: l.variants.map((v) => ({ audience: v.audience, items: v.items.length })) })),
  }, null, 2));
}

main();
