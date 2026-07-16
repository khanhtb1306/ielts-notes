// scripts/audit-data.mjs — Phase 4 data integrity audit
//
// D1 broken audioRefs / imageRefs (URL in blocks/questions not in manifest)
// D2 scripts.json orphans (script attached to audioId not in audio manifest)
// D3 silent audios (audio manifest entry with no script)
// D4 manifest ↔ raw drift (manifest rawFile missing OR raw file not listed)
// D5 correctAnswer vs raw challenge answer diff
// D6 fill_blank kind misdetection (type=1 with no [input_N] in answerTemplate OR missing correctAnswer keys)
// D7 topic tag vs challenge.note mismatch (question tagged with topic that doesn't appear in note)

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SRC = join(ROOT, "source");
const DAILY = join(SRC, "daily");

function readJson(p, fb) { return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : fb; }
function stripHtml(html) {
  return String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}
function normalize(s) {
  return String(s || "").toLowerCase().replace(/\s+/g, " ").trim();
}

const lessonKeys = readdirSync(DAILY, { withFileTypes: true })
  .filter((d) => d.isDirectory() && /^lesson-/.test(d.name))
  .map((d) => d.name)
  .sort();

const findings = [];
function add(sev, code, lessonKey, path, desc, fix) {
  findings.push({ severity: sev, code, lessonKey, path, desc, fix });
}

for (const lk of lessonKeys) {
  const dir = join(DAILY, lk);
  const manifest = readJson(join(dir, "manifest.json"), null);
  if (!manifest) continue;
  const content = readJson(join(dir, "content.json"), { blocks: [] });
  const exercises = readJson(join(dir, "exercises.json"), { questions: [] });
  const scripts = readJson(join(dir, "scripts.json"), { blocks: [] });
  const audioManifest = readJson(join(dir, "audio", "manifest.json"), { items: [] });
  const imageManifest = readJson(join(dir, "images", "manifest.json"), { items: [] });

  const audioUrlSet = new Set((audioManifest.items || []).map((a) => a.sourceUrl).filter(Boolean));
  const audioIdSet = new Set((audioManifest.items || []).map((a) => a.id).filter(Boolean));
  const imageUrlSet = new Set((imageManifest.items || []).map((i) => i.url).filter(Boolean));

  // ---- D1: broken audioRefs URL in content blocks ----
  for (const b of content.blocks || []) {
    for (const a of b.audioRefs || []) {
      if (a.url && !audioUrlSet.has(a.url)) {
        add("HIGH", "D1", lk, `source/daily/${lk}/content.json (block ${b.id})`,
          `audioRef URL \`${a.url}\` không có trong audio/manifest.json.`,
          `Thêm entry vào audio/manifest.json HOẶC bỏ audioRef nếu file không dùng.`);
      }
    }
    for (const i of b.imageRefs || []) {
      if (i.url && !imageUrlSet.has(i.url)) {
        add("HIGH", "D1", lk, `source/daily/${lk}/content.json (block ${b.id})`,
          `imageRef URL \`${i.url}\` không có trong images/manifest.json.`,
          `Thêm entry vào images/manifest.json HOẶC bỏ imageRef.`);
      }
    }
  }
  // D1: also for exercises
  for (const q of exercises.questions || []) {
    for (const a of q.audioRefs || []) {
      if (a.url && !audioUrlSet.has(a.url)) {
        add("HIGH", "D1", lk, `source/daily/${lk}/exercises.json (question ${q.id})`,
          `audioRef URL \`${a.url}\` không có trong audio/manifest.json.`,
          `Thêm entry manifest hoặc bỏ audioRef.`);
      }
    }
    for (const i of q.imageRefs || []) {
      if (i.url && !imageUrlSet.has(i.url)) {
        add("HIGH", "D1", lk, `source/daily/${lk}/exercises.json (question ${q.id})`,
          `imageRef URL \`${i.url}\` không có trong images/manifest.json.`,
          `Thêm entry manifest hoặc bỏ imageRef.`);
      }
    }
  }

  // ---- D3: silent audios ----
  for (const a of audioManifest.items || []) {
    if (!a.script || !String(a.script).trim()) {
      add("MEDIUM", "D3", lk, `source/daily/${lk}/audio/manifest.json (id=${a.id})`,
        `Audio không có \`script\`.`,
        `Bổ sung script (transcript) để build vocab pairs + Practice UI có context.`);
    }
  }

  // ---- D2: scripts.json orphans (script targeting audioId absent from audio manifest) ----
  const scriptBlocks = scripts.blocks || scripts.items || [];
  for (const s of scriptBlocks) {
    if (s.audioId && !audioIdSet.has(s.audioId)) {
      add("MEDIUM", "D2", lk, `source/daily/${lk}/scripts.json`,
        `Script gắn audioId \`${s.audioId}\` không tồn tại trong audio manifest.`,
        `Update audioId reference hoặc bỏ script entry.`);
    }
  }

  // ---- D4: manifest ↔ raw drift ----
  const rawDir = join(dir, "raw");
  const rawFilesOnDisk = existsSync(rawDir)
    ? readdirSync(rawDir).filter((f) => f.endsWith(".json"))
    : [];
  const rawFilesInManifest = new Set(
    (manifest.challenges || []).map((c) => (c.rawFile || "").replace(/^raw\//, ""))
      .filter(Boolean)
  );
  for (const rf of rawFilesInManifest) {
    if (!rawFilesOnDisk.includes(rf)) {
      add("HIGH", "D4", lk, `source/daily/${lk}/manifest.json`,
        `manifest rawFile \`raw/${rf}\` không tồn tại trên disk.`,
        `Kiểm tra rawFilesOnDisk và cập nhật manifest.`);
    }
  }
  for (const rf of rawFilesOnDisk) {
    if (!rawFilesInManifest.has(rf) && !/challenge-/i.test(rf) === false) {
      // OK — only warn if the file looks like a challenge file
      if (/^challenge-\d+-\d+\.json$/.test(rf)) {
        add("LOW", "D4", lk, `source/daily/${lk}/raw/${rf}`,
          `File raw challenge tồn tại nhưng không listed trong manifest.`,
          `Thêm challenge entry vào manifest.json HOẶC xoá file.`);
      }
    }
  }

  // ---- D5/D6: correctAnswer diff + fill_blank misdetection ----
  // Build rawById map
  const rawById = {};
  for (const rf of rawFilesOnDisk) {
    const raw = readJson(join(rawDir, rf), null);
    const list = raw?.questions?.json?.data;
    if (Array.isArray(list)) for (const q of list) if (q && q.id != null) rawById[String(q.id)] = q;
  }

  for (const q of exercises.questions || []) {
    const rq = rawById[String(q.sourceQuestionId)];
    const type = q.type;
    const submission = q.submission || {};

    // D6: fill_blank misdetection
    if (type === 1) {
      const tpl = q.rawHtml && q.rawHtml.answerTemplate ? String(q.rawHtml.answerTemplate) : "";
      const hasInputMarker = /\[\s*input_?\d+\s*\]/i.test(tpl);
      const correctObj = submission.correctAnswer && typeof submission.correctAnswer === "object" ? submission.correctAnswer : null;
      const keyCount = correctObj ? Object.keys(correctObj).length : 0;
      if (!hasInputMarker && keyCount > 0) {
        add("HIGH", "D6", lk, `source/daily/${lk}/exercises.json (q ${q.id})`,
          `type=1 (fill_blank) có ${keyCount} correctAnswer keys nhưng \`rawHtml.answerTemplate\` thiếu marker [input_N].`,
          `Kiểm tra answerTemplate — cần chèn placeholder [input_0], [input_1]... đúng vị trí; hoặc câu này thực sự không phải fill_blank.`);
      } else if (hasInputMarker && keyCount === 0) {
        add("MEDIUM", "D6", lk, `source/daily/${lk}/exercises.json (q ${q.id})`,
          `type=1 (fill_blank) có [input_N] marker nhưng \`submission.correctAnswer\` rỗng.`,
          `Populate correctAnswer từ raw challenge answer.answers[] hoặc từ đáp án tay.`);
      }
    }

    // D5: correctAnswer vs raw challenge answer diff
    // Only makes sense for single_choice (type=3) and multi_select (type=5) where raw.answer.answers has [{id, isCorrect, content}].
    if ((type === 3 || type === 5) && rq && rq.answer && Array.isArray(rq.answer.answers)) {
      const rawCorrectIds = rq.answer.answers.filter((a) => a && a.isCorrect).map((a) => a.id);
      const subCorrect = submission.correctAnswer;
      const subIds = subCorrect == null ? [] : Array.isArray(subCorrect) ? subCorrect : [subCorrect];
      const rawSorted = [...rawCorrectIds].sort();
      const subSorted = [...subIds].sort();
      if (rawSorted.length && subSorted.length) {
        const differ = rawSorted.length !== subSorted.length ||
          rawSorted.some((v, i) => String(v) !== String(subSorted[i]));
        if (differ) {
          add("HIGH", "D5", lk, `source/daily/${lk}/exercises.json (q ${q.id})`,
            `correctAnswer lệch với raw challenge: submission=[${subIds.join(",")}] vs raw=[${rawCorrectIds.join(",")}].`,
            `Verify: raw challenge là nguồn truth hay submission? Nếu raw đúng, cập nhật submission.correctAnswer.`);
        }
      } else if (!subSorted.length && rawSorted.length) {
        add("MEDIUM", "D5", lk, `source/daily/${lk}/exercises.json (q ${q.id})`,
          `Type=${type} có raw correct answer [${rawCorrectIds.join(",")}] nhưng \`submission.correctAnswer\` empty.`,
          `Fill in correctAnswer từ raw.`);
      }
    }

    // D7: topic tag drift — skip for now (heuristic-heavy)
  }
}

// ---- Emit ----
const notesDir = join(ROOT, "notes");
if (!existsSync(notesDir)) mkdirSync(notesDir, { recursive: true });

const sevCount = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
const codeCount = {};
for (const f of findings) {
  sevCount[f.severity] = (sevCount[f.severity] || 0) + 1;
  codeCount[f.code] = (codeCount[f.code] || 0) + 1;
}

const lines = [];
lines.push(`# Phase 4 — Data Integrity Audit\n`);
lines.push(`_Generated by \`scripts/audit-data.mjs\`._\n`);
lines.push(`## Tổng quan\n`);
lines.push(`- Lessons quét: **${lessonKeys.length}**`);
lines.push(`- Findings: **${findings.length}**`);
lines.push(`  - CRITICAL: ${sevCount.CRITICAL}, HIGH: ${sevCount.HIGH}, MEDIUM: ${sevCount.MEDIUM}, LOW: ${sevCount.LOW}`);
lines.push(`- Theo code:`);
for (const c of ["D1", "D2", "D3", "D4", "D5", "D6", "D7"]) {
  lines.push(`  - ${c}: ${codeCount[c] || 0}`);
}
lines.push("");
lines.push(`### Legend`);
lines.push(`- **D1** broken audio/image URL trong blocks or questions`);
lines.push(`- **D2** scripts.json audioId orphan`);
lines.push(`- **D3** audio manifest entry thiếu script`);
lines.push(`- **D4** manifest ↔ raw file drift`);
lines.push(`- **D5** correctAnswer vs raw challenge answer diff (single/multi choice)`);
lines.push(`- **D6** fill_blank kind misdetection ([input_N] vs correctAnswer keys)`);
lines.push(`- **D7** (skipped — cover in Phase 6/7)`);
lines.push("");
if (!findings.length) {
  lines.push(`## Findings\n\n_Sạch. Không phát hiện lỗi data integrity._\n`);
} else {
  lines.push(`## Findings\n`);
  const byLesson = {};
  for (const f of findings) (byLesson[f.lessonKey] = byLesson[f.lessonKey] || []).push(f);
  for (const lk of Object.keys(byLesson).sort()) {
    lines.push(`### ${lk} — ${byLesson[lk].length} findings\n`);
    byLesson[lk].sort((a, b) => {
      const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return order[a.severity] - order[b.severity] || a.code.localeCompare(b.code);
    });
    for (const f of byLesson[lk]) {
      lines.push(`- **[${f.severity}] ${f.code}** \`${f.path}\``);
      lines.push(`  - _Issue:_ ${f.desc}`);
      lines.push(`  - _Fix:_ ${f.fix}`);
    }
    lines.push("");
  }
}

writeFileSync(join(notesDir, "audit-4-data.md"), lines.join("\n"), "utf8");
console.log(`Wrote notes/audit-4-data.md — ${findings.length} findings`);
console.log(`Severity: CRITICAL=${sevCount.CRITICAL}, HIGH=${sevCount.HIGH}, MEDIUM=${sevCount.MEDIUM}, LOW=${sevCount.LOW}`);
console.log(`Codes: ${Object.entries(codeCount).map(([k, v]) => `${k}=${v}`).join(", ")}`);
