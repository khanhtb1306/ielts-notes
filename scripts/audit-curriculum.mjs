// scripts/audit-curriculum.mjs â€” Phase 3 curriculum mapping audit (dev tool)
//
// For each of 16 daily lessons, produces a coverage row:
//   Notes  = markdown notes whose `lessons:` frontmatter matches this lesson
//   Blocks = source/daily/lesson-XX/content.json blocks tagged with each topic
//   Exercises = questions in exercises.json (kind distribution)
//   Speaking = speakingQuestions[topic] count for each core speaking topic
//
// Then flags:
//   X1 lÃ½ thuyáº¿t â†’ khÃ´ng practice
//   X2 practice â†’ khÃ´ng lÃ½ thuyáº¿t
//   X3 slide â†’ exercises drop-off
//   X4 speaking bank má»“ cÃ´i note
//   X5 lessonTopicHints claim sai
//   X6 ná»™i dung cÅ© vs má»›i lá»‡ch (best-effort, may report false positives)
//   X7 misplaced block (based on tag vs lesson hint)
//   X8 topic key drift (checked once globally, not per-lesson)

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const COURSE = join(ROOT, "courses", "pre-ielts");
const DAILY = join(COURSE, "daily", "lessons");

function readJson(p, fb) { return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : fb; }
function stripHtml(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}
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

/* ---------- Load taxonomy ---------- */
const topics = readJson(join(COURSE, "notes", "enrich", "topics-map.json"), {});
const topicLabels = topics.topicLabels || {};
const noteKeywords = topics.noteKeywords || {};
const lessonTopicHints = topics.lessonTopicHints || {};
const speakingQuestions = topics.speakingQuestions || {};

function extractOrderedTopics(text) {
  const lower = String(text || "").toLowerCase();
  if (!lower) return [];
  const hits = [];
  for (const kw of Object.keys(noteKeywords)) {
    const pos = lower.indexOf(kw);
    if (pos < 0) continue;
    for (const t of noteKeywords[kw]) hits.push({ topic: t, pos });
  }
  hits.sort((a, b) => a.pos - b.pos);
  const seen = new Set();
  const out = [];
  for (const h of hits) {
    if (!seen.has(h.topic)) { seen.add(h.topic); out.push(h.topic); }
  }
  return out;
}

/* ---------- Load notes ---------- */
function loadNotes() {
  const out = [];
  for (const type of ["pronunciation", "grammar", "speaking"]) {
    const dir = join(COURSE, "notes", type);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).filter((x) => x.endsWith(".md"))) {
      const raw = readFileSync(join(dir, f), "utf8");
      const { data, body } = parseFrontmatter(raw);
      // Parse lessons: "Lesson 1", "Lesson 1-2", "Lesson 1, 3", "Lesson 5-8" etc.
      const spec = data.lessons || data.lesson || "";
      const lessonNums = new Set();
      for (const tok of spec.split(/[,;]/)) {
        const range = tok.match(/(\d+)\s*[-â€“]\s*(\d+)/);
        const single = tok.match(/\d+/);
        if (range) {
          for (let n = parseInt(range[1]); n <= parseInt(range[2]); n++) lessonNums.add(n);
        } else if (single) {
          lessonNums.add(parseInt(single[0]));
        }
      }
      // Guess primary topic by comparing filename slug / title keywords to topicLabels.
      const title = (data.title || "").toLowerCase();
      const fileSlug = basename(f, ".md").replace(/^\d+-/, "").toLowerCase();
      let topicGuess = null;
      for (const key of Object.keys(topicLabels)) {
        if (key === fileSlug || (topicLabels[key].label || "").toLowerCase().includes(fileSlug.replace(/-/g, " "))) {
          topicGuess = key;
          break;
        }
      }
      if (!topicGuess) {
        // Fallback: run body text through extractOrderedTopics
        const topics = extractOrderedTopics(title + " " + body);
        topicGuess = topics[0] || null;
      }
      out.push({
        type, file: `source/${type}/${f}`, title: data.title || f, skill: data.skill || type,
        lessons: [...lessonNums].sort((a, b) => a - b),
        topicGuess, body, priority: data.priority || ""
      });
    }
  }
  return out;
}

/* ---------- Load lesson data ---------- */
function loadLesson(key) {
  const dir = join(DAILY, key);
  const manifest = readJson(join(dir, "manifest.json"), null);
  if (!manifest) return null;
  const content = readJson(join(dir, "content.json"), { blocks: [] });
  const exercises = readJson(join(dir, "exercises.json"), { questions: [] });
  return { key, manifest, content, exercises };
}

/* ---------- Tag helper (mirror of build.mjs tagWithTopics for questions) ---------- */
function tagBlock(block, challengeNote, lessonKey) {
  const hints = lessonTopicHints[lessonKey] || [];
  const hintSet = new Set(hints);
  const overrides = { ...(topics.blockOverrides || {}), ...(topics.questionOverrides || {}) };
  const explicit = overrides[block.id];
  if (explicit) return explicit.map((t) => (typeof t === "string" ? { key: t, role: "core" } : t));
  const selfText = [block.title, block.text, stripHtml(block.rawHtml)].filter(Boolean).join(" \n ");
  const noteText = challengeNote || "";
  const selfTopics = extractOrderedTopics(selfText);
  const noteTopics = extractOrderedTopics(noteText);
  const result = [];
  const done = new Set();
  if (selfTopics.length) {
    for (const t of selfTopics) {
      if (done.has(t)) continue;
      result.push({ key: t, role: hintSet.has(t) ? "core" : "preview" });
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

/* ---------- MAIN ---------- */
const notes = loadNotes();
const lessonKeys = readdirSync(DAILY, { withFileTypes: true })
  .filter((d) => d.isDirectory() && /^lesson-/.test(d.name))
  .map((d) => d.name)
  .sort();

// Map: lessonNumber -> [notes]
const notesByLesson = new Map();
const notesByTopic = new Map();
for (const n of notes) {
  for (const l of n.lessons) {
    (notesByLesson.get(l) || notesByLesson.set(l, []).get(l)).push(n);
  }
  if (n.topicGuess) {
    (notesByTopic.get(n.topicGuess) || notesByTopic.set(n.topicGuess, []).get(n.topicGuess)).push(n);
  }
}

// Global tallies
const topicCoverage = {}; // topic -> { notes: [], blocks: {lessonKey:count}, questions: {lessonKey:count}, speaking: count }
for (const t of Object.keys(topicLabels)) {
  topicCoverage[t] = { notes: (notesByTopic.get(t) || []).map((n) => n.file), blocks: {}, questions: {}, speaking: (speakingQuestions[t] || []).length };
}
// Any topic that appears only as override target but not in topicLabels â€” capture too
const extraTopics = new Set();

// Per-lesson rows
const rows = [];

for (const lk of lessonKeys) {
  const data = loadLesson(lk);
  if (!data) continue;
  const lessonNum = data.manifest.lesson || parseInt(lk.replace(/[^0-9]/g, "")) || null;
  const relevantNotes = lessonNum != null ? (notesByLesson.get(lessonNum) || []) : [];
  const hints = lessonTopicHints[lk] || [];
  const challenges = data.manifest.challenges || [];
  const challengeNotes = challenges.map((c) => c.note || "").join(" | ");

  // Blocks by topic
  const blocksByTopic = {};
  const blockRoleByTopic = {};
  for (const b of data.content.blocks || []) {
    const challenge = challenges.find((c) => c.challengeId === b.challengeId);
    const tags = tagBlock(b, challenge ? challenge.note : "", lk);
    for (const t of tags) {
      if (!topicLabels[t.key]) extraTopics.add(t.key);
      (blocksByTopic[t.key] = blocksByTopic[t.key] || []).push({ id: b.id, role: t.role });
      if (!blockRoleByTopic[t.key] || rolePriority(t.role) < rolePriority(blockRoleByTopic[t.key])) {
        blockRoleByTopic[t.key] = t.role;
      }
      if (topicCoverage[t.key]) topicCoverage[t.key].blocks[lk] = (topicCoverage[t.key].blocks[lk] || 0) + 1;
    }
  }

  // Questions by topic
  const questionsByTopic = {};
  const kindByTopic = {};
  const kindCount = { single_choice: 0, multi_select: 0, fill_blank: 0, matching: 0, open_or_video: 0, info: 0, unknown: 0 };
  for (const q of data.exercises.questions || []) {
    // Mirror the shape used in build.mjs (roughly)
    const kind = guessKind(q);
    kindCount[kind] = (kindCount[kind] || 0) + 1;
    const promptText = [q.prompt, stripHtml(q.rawHtml && (q.rawHtml.content || q.rawHtml.introduction)), stripHtml(q.rawHtml && q.rawHtml.answerTemplate), stripHtml(q.rawHtml && q.rawHtml.explain)].filter(Boolean).join(" \n ");
    const challenge = challenges.find((c) => c.challengeId === q.challengeId);
    const tags = tagBlock({ id: q.id, title: q.title, text: q.prompt, rawHtml: promptText }, challenge ? challenge.note : "", lk);
    for (const t of tags) {
      if (!topicLabels[t.key]) extraTopics.add(t.key);
      (questionsByTopic[t.key] = questionsByTopic[t.key] || []).push({ id: q.id, role: t.role, kind });
      if (!kindByTopic[t.key]) kindByTopic[t.key] = new Set();
      kindByTopic[t.key].add(kind);
      if (topicCoverage[t.key]) topicCoverage[t.key].questions[lk] = (topicCoverage[t.key].questions[lk] || 0) + 1;
    }
  }

  rows.push({
    lessonKey: lk,
    lessonNum,
    hints,
    notesForLesson: relevantNotes,
    challengeNotes,
    blocksByTopic,
    questionsByTopic,
    kindByTopic,
    kindCount
  });
}

function rolePriority(role) {
  if (role === "core") return 0;
  if (role === "preview") return 1;
  if (role === "review") return 2;
  return 3;
}
function guessKind(q) {
  const t = q.type;
  if (t == null) return "info";
  if (t === 3) return "single_choice";
  if (t === 5) return "multi_select";
  if (t === 1) return "fill_blank";
  if (t === 2) return "matching_or_open";
  if (t === 4) return "open_or_video";
  return "unknown";
}

/* ---------- Findings ---------- */
const findings = [];
function flag(sev, code, lessonKey, desc, fix) {
  findings.push({ severity: sev, code, lessonKey, desc, fix });
}

// X4: speakingQuestions for a topic that has no note file (skill=speaking only)
for (const t of Object.keys(speakingQuestions)) {
  if (!notesByTopic.has(t)) {
    const nq = speakingQuestions[t].length;
    flag("MEDIUM", "X4", "-", `Speaking topic \`${t}\` cÃ³ ${nq} cÃ¢u há»i trong \`speakingQuestions\` nhÆ°ng khÃ´ng cÃ³ note markdown nÃ o tag vá» topic nÃ y (khÃ´ng giáº£i guess-mapping).`, `Viáº¿t note markdown má»›i hoáº·c tag Ä‘Ãºng note hiá»‡n cÃ³ (frontmatter title/keywords khá»›p topic).`);
  }
}

// Also X4: needsNotes=true entries in topicLabels
for (const [key, meta] of Object.entries(topicLabels)) {
  if (meta.needsNotes) {
    flag("HIGH", "X4", "-", `\`topicLabels.${key}\` Ä‘Ã¡nh dáº¥u \`needsNotes: true\` â€” chÆ°a cÃ³ note markdown.`, `Viáº¿t note markdown cho topic nÃ y rá»“i bá» flag \`needsNotes\` trong topics-map.json.`);
  }
}

// X1: note exists but no daily question tags this topic (across all lessons)
for (const [topic, cov] of Object.entries(topicCoverage)) {
  if (cov.notes.length && !Object.keys(cov.questions).length) {
    flag("MEDIUM", "X1", "-", `Topic \`${topic}\` cÃ³ ${cov.notes.length} note (${cov.notes.join(", ")}) nhÆ°ng KHÃ”NG cÃ³ daily question nÃ o tag vá» topic nÃ y.`, `Há»c lÃ½ thuyáº¿t mÃ  khÃ´ng cÃ³ practice â€” cÃ¢n nháº¯c: (a) rewrite tags/blockOverrides Ä‘á»ƒ pull existing questions vÃ o topic; (b) tag questions manually via questionOverrides; (c) cháº¥p nháº­n vÃ  ghi rÃµ Ä‘Ã¢y lÃ  notes-only topic.`);
  }
}

// X2: daily practices topic but no note file
for (const [topic, cov] of Object.entries(topicCoverage)) {
  const questionLessons = Object.keys(cov.questions);
  if (!cov.notes.length && questionLessons.length) {
    const totalQ = Object.values(cov.questions).reduce((a, b) => a + b, 0);
    flag("MEDIUM", "X2", "-", `Topic \`${topic}\` cÃ³ ${totalQ} question (${questionLessons.length} lessons) nhÆ°ng 0 note markdown.`, `Practice khÃ´ng cÃ³ lÃ½ thuyáº¿t â€” viáº¿t note (ngay cáº£ 1-page) Ä‘á»ƒ learner biáº¿t cÃ¡ch tiáº¿p cáº­n trÆ°á»›c khi lÃ m bÃ i.`);
  }
}

// X5: lessonTopicHints claim topic X but no question/block tagged with X in that lesson
for (const row of rows) {
  for (const h of row.hints) {
    const hasBlock = row.blocksByTopic[h];
    const hasQuestion = row.questionsByTopic[h];
    if (!hasBlock && !hasQuestion) {
      flag("MEDIUM", "X5", row.lessonKey, `Hint claim topic \`${h}\` core cho \`${row.lessonKey}\` nhÆ°ng 0 block/question thá»±c táº¿ cover topic nÃ y.`, `Hoáº·c: bá» topic khá»i \`lessonTopicHints[${row.lessonKey}]\` HOáº¶C thÃªm blockOverride/questionOverride Ä‘á»ƒ tag má»m.`);
    }
  }
}

// X3: slide (block) covers topic but no exercise in same lesson practices it (rough drop-off)
for (const row of rows) {
  for (const [topic, blockRefs] of Object.entries(row.blocksByTopic)) {
    // Only flag if topic core in this lesson (per hints) and block has core role, but 0 exercises
    if (!row.hints.includes(topic)) continue;
    const hasCoreBlock = blockRefs.some((b) => b.role === "core");
    const hasAnyQuestion = row.questionsByTopic[topic];
    if (hasCoreBlock && !hasAnyQuestion) {
      flag("MEDIUM", "X3", row.lessonKey, `Study block dáº¡y topic \`${topic}\` (${blockRefs.length} blocks) nhÆ°ng \`${row.lessonKey}\` cÃ³ 0 exercise cho topic nÃ y (learn-only, no practice).`, `Kiá»ƒm tra exercises.json â€” cÃ³ thá»ƒ topic bá»‹ tag miss vÃ¬ content nghÃ¨o keyword; thÃªm questionOverride náº¿u cáº§n.`);
    }
  }
}

// X8: topic key drift â€” check topicLabels + questionOverrides + blockOverrides + notesByTopic keys for near-duplicates
function normalizeKey(k) {
  return k.toLowerCase().replace(/[^a-z0-9]/g, "");
}
{
  const allKeys = new Set();
  for (const k of Object.keys(topicLabels)) allKeys.add(k);
  for (const k of extraTopics) allKeys.add(k);
  const norm = {};
  for (const k of allKeys) {
    const n = normalizeKey(k);
    (norm[n] = norm[n] || []).push(k);
  }
  for (const [n, list] of Object.entries(norm)) {
    if (list.length > 1) {
      flag("HIGH", "X8", "-", `Topic key drift: keys \`${list.join("`, `")}\` normalize giá»‘ng nhau (\`${n}\`).`, `Merge vá» 1 key canonical; update topicLabels + noteKeywords + overrides.`);
    }
  }
  // Any extraTopics not in topicLabels
  for (const t of extraTopics) {
    if (!topicLabels[t]) {
      flag("MEDIUM", "X8", "-", `Topic key \`${t}\` xuáº¥t hiá»‡n trong overrides/tagging nhÆ°ng khÃ´ng cÃ³ entry trong \`topicLabels\`.`, `ThÃªm entry vÃ o \`topicLabels\` HOáº¶C bá» khá»i overrides.`);
    }
  }
}

// X6: rough content drift â€” for each topic with both notes AND questions,
// pull note title/keywords, compare against a sample question prompt â€” flag if very short overlap.
// Skipped for now (requires manual English-teacher pass â€” will be covered in Phase 6).

/* ---------- Emit report ---------- */
// Reports are tooling output, not course content — keep them out of courses/.
  const notesDir = join(ROOT, "reports");
if (!existsSync(notesDir)) mkdirSync(notesDir, { recursive: true });

const lines = [];
lines.push(`# Phase 3 â€” Curriculum Mapping Audit\n`);
lines.push(`_Generated by \`scripts/audit-curriculum.mjs\`. Äá»c-only, reflect state táº¡i thá»i Ä‘iá»ƒm cháº¡y._\n`);

lines.push(`## Tá»•ng quan\n`);
lines.push(`- Notes markdown: **${notes.length}** files (${notes.filter((n) => n.type === "pronunciation").length} pronunciation, ${notes.filter((n) => n.type === "grammar").length} grammar, ${notes.filter((n) => n.type === "speaking").length} speaking)`);
lines.push(`- Lessons daily: **${lessonKeys.length}** (${lessonKeys.join(", ")})`);
lines.push(`- Topics trong \`topicLabels\`: **${Object.keys(topicLabels).length}**`);
lines.push(`- Speaking questions banks: **${Object.keys(speakingQuestions).length}**`);
lines.push(`- Findings: **${findings.length}**`);
const sevCount = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
for (const f of findings) sevCount[f.severity] = (sevCount[f.severity] || 0) + 1;
lines.push(`  - CRITICAL: ${sevCount.CRITICAL}, HIGH: ${sevCount.HIGH}, MEDIUM: ${sevCount.MEDIUM}, LOW: ${sevCount.LOW}`);
lines.push("");

lines.push(`## Coverage matrix per lesson\n`);
for (const row of rows) {
  const noteLabels = row.notesForLesson.map((n) => `\`${basename(n.file)}\` (${n.skill})`);
  const kindStr = Object.entries(row.kindCount).filter(([, v]) => v > 0).map(([k, v]) => `${k}=${v}`).join(", ") || "â€”";
  const blockTopics = Object.entries(row.blocksByTopic).map(([t, refs]) => {
    const roles = new Set(refs.map((r) => r.role));
    return `${t}[${refs.length}${roles.has("core") ? "â˜…" : ""}]`;
  }).join(" Â· ") || "â€”";
  const questionTopics = Object.entries(row.questionsByTopic).map(([t, refs]) => {
    const kinds = row.kindByTopic[t] ? [...row.kindByTopic[t]].join("/") : "?";
    return `${t}[${refs.length},${kinds}]`;
  }).join(" Â· ") || "â€”";
  const spTopics = row.hints.filter((h) => (topicLabels[h] || {}).skill === "speaking");
  const spCounts = spTopics.map((t) => `${t}(${(speakingQuestions[t] || []).length}Q)`).join(", ") || "â€”";
  lines.push(`### ${row.lessonKey}${row.lessonNum ? ` (Lesson ${row.lessonNum})` : ""}\n`);
  lines.push(`- **Hints (core)**: ${row.hints.length ? row.hints.map((h) => `\`${h}\``).join(", ") : "â€”"}`);
  lines.push(`- **Challenge notes**: ${row.challengeNotes || "â€”"}`);
  lines.push(`- **Notes markdown** (${row.notesForLesson.length}): ${noteLabels.join(", ") || "â€”"}`);
  lines.push(`- **Study blocks** (${Object.values(row.blocksByTopic).flat().length} tag hits): ${blockTopics}`);
  lines.push(`- **Exercises** (kind: ${kindStr}): ${questionTopics}`);
  lines.push(`- **Speaking bank cho core**: ${spCounts}`);
  lines.push("");
}

lines.push(`## Topic coverage overview\n`);
for (const [t, cov] of Object.entries(topicCoverage)) {
  const noteStr = cov.notes.length ? cov.notes.map((n) => basename(n)).join(", ") : "â€”";
  const bl = Object.entries(cov.blocks).map(([k, n]) => `${k}(${n})`).join(", ") || "â€”";
  const qu = Object.entries(cov.questions).map(([k, n]) => `${k}(${n})`).join(", ") || "â€”";
  const sp = cov.speaking ? `${cov.speaking} cÃ¢u` : "â€”";
  const meta = topicLabels[t];
  const flags = [];
  if (meta && meta.needsNotes) flags.push("**needsNotes**");
  lines.push(`- **\`${t}\`** (${meta ? meta.skill : "?"}${flags.length ? " Â· " + flags.join(", ") : ""}) â€” notes: ${noteStr} Â· blocks: ${bl} Â· questions: ${qu} Â· speaking: ${sp}`);
}
lines.push("");
if (extraTopics.size) {
  lines.push(`### Extra topics chÆ°a cÃ³ \`topicLabels\`\n`);
  for (const t of extraTopics) lines.push(`- \`${t}\``);
  lines.push("");
}

lines.push(`## Findings\n`);
if (!findings.length) {
  lines.push(`_KhÃ´ng phÃ¡t hiá»‡n lá»—i mapping nÃ o._\n`);
} else {
  const byCode = {};
  for (const f of findings) (byCode[f.code] = byCode[f.code] || []).push(f);
  const legend = {
    X1: "Notes cÃ³ nhÆ°ng Daily 0 question",
    X2: "Daily practice khÃ´ng cÃ³ Notes",
    X3: "Study block dáº¡y nhÆ°ng cÃ¹ng lesson 0 exercise",
    X4: "Speaking bank / needsNotes cáº§n note",
    X5: "lessonTopicHints claim sai",
    X6: "Notes cÅ© vs Daily má»›i lá»‡ch vocab",
    X7: "Misplaced block",
    X8: "Topic key drift / extra"
  };
  for (const code of Object.keys(legend)) {
    const arr = byCode[code] || [];
    lines.push(`### ${code} â€” ${legend[code]} (${arr.length})\n`);
    if (!arr.length) { lines.push(`_Sáº¡ch._\n`); continue; }
    arr.sort((a, b) => a.severity.localeCompare(b.severity));
    for (const f of arr) {
      lines.push(`- **[${f.severity}]** _(lesson: ${f.lessonKey})_ ${f.desc}`);
      lines.push(`  - _Fix:_ ${f.fix}`);
    }
    lines.push("");
  }
}

lines.push(`## Pedagogical assessment (per lesson)\n`);
lines.push(`_ÄÃ¡nh giÃ¡ thá»§ cÃ´ng sáº½ Ä‘Æ°á»£c bá»• sung sau khi review coverage matrix. Below lÃ  tá»± Ä‘á»™ng flag ngáº¯n._\n`);
for (const row of rows) {
  const hasNotes = row.notesForLesson.length > 0;
  const hasBlocks = Object.keys(row.blocksByTopic).length > 0;
  const hasQuestions = Object.keys(row.questionsByTopic).length > 0;
  const coreTopics = row.hints;
  const notesCover = new Set();
  for (const n of row.notesForLesson) if (n.topicGuess) notesCover.add(n.topicGuess);
  const missing = coreTopics.filter((t) => !notesCover.has(t));
  const flagsMini = [];
  if (!hasNotes) flagsMini.push("**thiáº¿u note**");
  if (!hasBlocks) flagsMini.push("**thiáº¿u study blocks**");
  if (!hasQuestions) flagsMini.push("**thiáº¿u exercises**");
  if (missing.length) flagsMini.push(`note khÃ´ng cover core: ${missing.join(", ")}`);
  lines.push(`- **${row.lessonKey}**: ${flagsMini.length ? flagsMini.join("; ") : "arc Ä‘áº§y Ä‘á»§ (notes + blocks + exercises)"}`);
}
lines.push("");

writeFileSync(join(notesDir, "audit-3-curriculum-map.md"), lines.join("\n"), "utf8");
console.log(`Wrote notes/audit-3-curriculum-map.md â€” ${findings.length} findings.`);
console.log(`Severity: CRITICAL=${sevCount.CRITICAL}, HIGH=${sevCount.HIGH}, MEDIUM=${sevCount.MEDIUM}, LOW=${sevCount.LOW}`);
