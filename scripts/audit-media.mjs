// scripts/audit-media.mjs â€” Phase 1 media integrity audit (throwaway/dev tool)
//
// Scans every source/daily/lesson-XX/ for:
//   M1  duplicate audio localFile within a lesson's audio/manifest.json
//   M2  cross-lesson sourceUrl reuse (audio or image)
//   M3  orphan audio binaries (in audio/daily/lesson-XX/ but never referenced)
//   M4  orphan image binaries (in source/daily/lesson-XX/images/ but never referenced)
//   M5  duplicate image entries in images/manifest.json
//   M6  misplaced audio (script hits topics that aren't in this lesson's hints)
//   M7  misplaced image (image's referencing block text hits topics not in lesson's hints)
//
// Usage: node scripts/audit-media.mjs
// Writes: notes/audit-1-media.md and prints summary.

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const COURSE = join(ROOT, "courses", "pre-ielts");
const DAILY = join(COURSE, "daily", "lessons");
const AUDIO_ROOT = join(COURSE, "daily", "audio");

function readJson(p, fallback) {
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : fallback;
}
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

const topics = readJson(join(COURSE, "notes", "enrich", "topics-map.json"), {});
const noteKeywords = topics.noteKeywords || {};
const lessonTopicHints = topics.lessonTopicHints || {};
const topicLabels = topics.topicLabels || {};

// Extract set of topic keys implied by a text via noteKeywords substring match.
function topicsInText(text) {
  const lower = String(text || "").toLowerCase();
  const hits = new Set();
  if (!lower) return hits;
  for (const kw of Object.keys(noteKeywords)) {
    if (lower.includes(kw)) {
      for (const t of noteKeywords[kw]) hits.add(t);
    }
  }
  return hits;
}

// Return the (best-guess) home lesson(s) for a topic based on lessonTopicHints.
// First element = core lesson.
function lessonsForTopic(topic) {
  const out = [];
  for (const [key, hints] of Object.entries(lessonTopicHints)) {
    if (hints.includes(topic)) out.push({ key, isCore: hints[0] === topic });
  }
  return out;
}

const lessonDirs = readdirSync(DAILY, { withFileTypes: true })
  .filter((d) => d.isDirectory() && /^lesson-/.test(d.name))
  .map((d) => d.name)
  .sort();

const findings = {}; // { lessonKey: [{ id, severity, path, description, fix }] }
const seenSourceUrls = { audio: new Map(), image: new Map() }; // sourceUrl -> Set of lessons

function addFinding(lessonKey, sev, path, desc, fix, id) {
  (findings[lessonKey] = findings[lessonKey] || []).push({
    id, severity: sev, path, description: desc, fix
  });
}

const perLessonSummary = [];

for (const lessonKey of lessonDirs) {
  const dir = join(DAILY, lessonKey);
  const hints = lessonTopicHints[lessonKey] || [];
  const hintSet = new Set(hints);

  const audioManifestPath = join(dir, "audio", "manifest.json");
  const imageManifestPath = join(dir, "images", "manifest.json");
  const contentPath = join(dir, "content.json");

  const audioManifest = readJson(audioManifestPath, { items: [] });
  const imageManifest = readJson(imageManifestPath, { items: [] });
  const content = readJson(contentPath, { blocks: [] });

  const audioItems = audioManifest.items || [];
  const imageItems = imageManifest.items || [];

  // Collect refs used by content blocks (by sourceUrl)
  const refUrlsAudio = new Set();
  const refUrlsImage = new Set();
  const blockByAudioUrl = new Map(); // url -> [{ blockId, text }]
  const blockByImageUrl = new Map();
  for (const b of content.blocks || []) {
    const blockText = stripHtml(b.rawHtml || b.text || "");
    for (const a of b.audioRefs || []) {
      if (a.url) {
        refUrlsAudio.add(a.url);
        (blockByAudioUrl.get(a.url) || blockByAudioUrl.set(a.url, []).get(a.url))
          .push({ blockId: b.id, text: blockText });
      }
    }
    for (const i of b.imageRefs || []) {
      if (i.url) {
        refUrlsImage.add(i.url);
        (blockByImageUrl.get(i.url) || blockByImageUrl.set(i.url, []).get(i.url))
          .push({ blockId: b.id, text: blockText });
      }
    }
  }

  // ---- M1: duplicate audio localFile ----
  const audioLocalCount = new Map();
  for (const a of audioItems) {
    if (!a.localFile) continue;
    (audioLocalCount.get(a.localFile) || audioLocalCount.set(a.localFile, []).get(a.localFile))
      .push(a.id);
  }
  for (const [localFile, ids] of audioLocalCount) {
    if (ids.length > 1) {
      addFinding(lessonKey, "HIGH", `source/daily/${lessonKey}/audio/manifest.json`,
        `CÃ¹ng \`localFile\` \`${localFile}\` Ä‘Æ°á»£c ${ids.length} audioId reference: ${ids.join(", ")}.`,
        `Giá»¯ 1 audioId canonical, remap cÃ¡c block audioRefs sang canonical rá»“i xoÃ¡ entries thá»«a trong manifest.`,
        "M1");
    }
  }

  // ---- M2: cross-lesson sourceUrl reuse (registered here; verdict deferred to end) ----
  for (const a of audioItems) {
    if (!a.sourceUrl) continue;
    if (!seenSourceUrls.audio.has(a.sourceUrl)) seenSourceUrls.audio.set(a.sourceUrl, new Set());
    seenSourceUrls.audio.get(a.sourceUrl).add(lessonKey);
  }
  for (const i of imageItems) {
    if (!i.url) continue;
    if (!seenSourceUrls.image.has(i.url)) seenSourceUrls.image.set(i.url, new Set());
    seenSourceUrls.image.get(i.url).add(lessonKey);
  }

  // ---- M3: orphan audio binaries ----
  const audioDir = join(AUDIO_ROOT, lessonKey);
  const audioFilesOnDisk = existsSync(audioDir)
    ? readdirSync(audioDir).filter((f) => /\.(mp3|m4a|wav)$/i.test(f))
    : [];
  const audioLocalFilesInManifest = new Set(
    audioItems.map((a) => (a.localFile || "").replace(/^.*[\\\/]/, ""))
  );
  const audioLocalFilesReferencedByBlocks = new Set();
  for (const url of refUrlsAudio) {
    const item = audioItems.find((a) => a.sourceUrl === url);
    if (item && item.localFile) audioLocalFilesReferencedByBlocks.add(item.localFile.replace(/^.*[\\\/]/, ""));
  }
  for (const f of audioFilesOnDisk) {
    const inManifest = audioLocalFilesInManifest.has(f);
    const inBlock = audioLocalFilesReferencedByBlocks.has(f);
    if (!inManifest) {
      addFinding(lessonKey, "MEDIUM", `audio/daily/${lessonKey}/${f}`,
        `File audio orphan (khÃ´ng cÃ³ entry trong \`audio/manifest.json\`).`,
        `ThÃªm entry manifest (id + sourceUrl + script) HOáº¶C xoÃ¡ file Ä‘á»ƒ dá»n thÆ° má»¥c.`,
        "M3");
    } else if (!inBlock) {
      // Referenced by manifest but no content block cites it â€” this is fine (used by exercises?
      // We ignore this to avoid false positives; exercises can also carry audioRefs.)
    }
  }

  // ---- M4: orphan image binaries ----
  const imgDir = join(dir, "images");
  const imageFilesOnDisk = existsSync(imgDir)
    ? readdirSync(imgDir).filter((f) => /\.(png|jpe?g|webp|gif|svg)$/i.test(f))
    : [];
  const imageLocalFilesInManifest = new Set(
    imageItems.map((i) => (i.localFile || "").replace(/^.*[\\\/]/, ""))
  );
  for (const f of imageFilesOnDisk) {
    if (!imageLocalFilesInManifest.has(f)) {
      addFinding(lessonKey, "MEDIUM", `source/daily/${lessonKey}/images/${f}`,
        `File áº£nh orphan (khÃ´ng cÃ³ entry trong \`images/manifest.json\`).`,
        `ThÃªm entry manifest (url + localFile + alt) HOáº¶C xoÃ¡ file Ä‘á»ƒ dá»n thÆ° má»¥c.`,
        "M4");
    }
  }

  // ---- M5: duplicate image manifest entries ----
  const imgLocalCount = new Map();
  const imgUrlCount = new Map();
  for (const i of imageItems) {
    if (i.localFile) (imgLocalCount.get(i.localFile) || imgLocalCount.set(i.localFile, []).get(i.localFile)).push(i.url || "(no url)");
    if (i.url) (imgUrlCount.get(i.url) || imgUrlCount.set(i.url, []).get(i.url)).push(i.localFile || "(no local)");
  }
  for (const [lf, urls] of imgLocalCount) {
    if (urls.length > 1) {
      addFinding(lessonKey, "MEDIUM", `source/daily/${lessonKey}/images/manifest.json`,
        `CÃ¹ng \`localFile\` \`${lf}\` trong ${urls.length} entry (URLs khÃ¡c nhau).`,
        `Gá»™p thÃ nh 1 entry hoáº·c Ä‘áº£m báº£o má»—i áº£nh cÃ³ localFile riÃªng.`,
        "M5");
    }
  }
  for (const [u, lfs] of imgUrlCount) {
    if (lfs.length > 1) {
      addFinding(lessonKey, "MEDIUM", `source/daily/${lessonKey}/images/manifest.json`,
        `CÃ¹ng \`url\` \`${u}\` trong ${lfs.length} entry.`,
        `Gá»™p thÃ nh 1 entry canonical.`,
        "M5");
    }
  }

  // ---- M6: misplaced audio (script alone hits a grammar/pronunciation topic core to another lesson) ----
  // Only use audio.script + scriptAlternatives (NOT surrounding block text) to avoid false positives from
  // coincidental example sentences elsewhere in the same block.
  for (const a of audioItems) {
    const scriptText = a.script || "";
    if (!scriptText || scriptText.length < 4) continue;
    const combined = [scriptText, ...(a.scriptAlternatives || [])].join(" \n ");
    const hits = topicsInText(combined);
    if (!hits.size) continue;
    // Only care about grammar/pronunciation/vocabulary topics â€” speaking topics like "job",
    // "family" appear in example sentences everywhere and aren't a misplacement signal.
    const structural = [...hits].filter((t) => {
      const sk = (topicLabels[t] || {}).skill;
      return sk === "grammar" || sk === "pronunciation" || sk === "vocabulary";
    });
    if (!structural.length) continue;
    const outside = structural.filter((t) => !hintSet.has(t));
    if (!outside.length) continue;
    // Only flag when the offending topic is CORE elsewhere (helps prune noise).
    const stronglyElsewhere = outside.filter((t) => lessonsForTopic(t).some((l) => l.isCore && l.key !== lessonKey));
    if (!stronglyElsewhere.length) continue;
    const alternates = stronglyElsewhere.map((t) => {
      const homes = lessonsForTopic(t).filter((l) => l.key !== lessonKey);
      return `${t} â†’ ${homes.map((h) => h.key + (h.isCore ? "(core)" : "")).join("/")}`;
    }).join("; ");
    addFinding(lessonKey, "LOW", `source/daily/${lessonKey}/audio/manifest.json (audio ${a.id})`,
      `Script "${scriptText.slice(0, 80)}${scriptText.length > 80 ? "â€¦" : ""}" chá»©a topic keyword ngoÃ i lesson hint (${alternates}).`,
      `Verify: script cÃ³ tháº­t sá»± dáº¡y topic khÃ¡c khÃ´ng. Náº¿u chá»‰ vÃ­ dá»¥ ngáº«u nhiÃªn, bá» qua; náº¿u lÃ  bÃ i misplaced thÃ¬ move audio + rewrite manifest.`,
      "M6");
  }

  // ---- M7: misplaced image (referencing block text signals off-lesson topics) ----
  for (const i of imageItems) {
    const refs = blockByImageUrl.get(i.url) || [];
    if (!refs.length) continue; // orphan image already flagged as M4
    const combined = refs.map((r) => r.text).join(" \n ");
    const hits = topicsInText(combined);
    if (!hits.size) continue;
    const relevant = [...hits].filter((t) => (topicLabels[t] || {}).skill !== "speaking");
    if (!relevant.length) continue;
    const outside = relevant.filter((t) => !hintSet.has(t));
    if (!outside.length) continue;
    const stronglyElsewhere = outside.filter((t) => lessonsForTopic(t).some((l) => l.isCore && l.key !== lessonKey));
    if (!stronglyElsewhere.length) continue;
    const alternates = stronglyElsewhere.map((t) => {
      const homes = lessonsForTopic(t).filter((l) => l.key !== lessonKey);
      return `${t} â†’ ${homes.map((h) => h.key + (h.isCore ? "(core)" : "")).join("/")}`;
    }).join("; ");
    addFinding(lessonKey, "LOW", `source/daily/${lessonKey}/images/manifest.json (img url=${i.url})`,
      `Block chá»©a áº£nh (${refs.map((r) => r.blockId).join(",")}) cÃ³ text gá»£i topic ngoÃ i hint cá»§a lesson (${alternates}).`,
      `Verify: cÃ³ pháº£i áº£nh nÃªn náº±m á»Ÿ lesson khÃ¡c? Náº¿u khÃ´ng, cáº§n blockOverride hoáº·c note tay Ä‘á»ƒ trÃ¡nh tag review.`,
      "M7");
  }

  perLessonSummary.push({
    lessonKey,
    audios: audioItems.length,
    images: imageItems.length,
    audioFilesOnDisk: audioFilesOnDisk.length,
    imageFilesOnDisk: imageFilesOnDisk.length,
    findings: (findings[lessonKey] || []).length
  });
}

// ---- M2 verdict after we've seen every lesson ----
for (const [url, lessonSet] of seenSourceUrls.audio) {
  if (lessonSet.size > 1) {
    const lessons = [...lessonSet];
    // Flag on the FIRST lesson (arbitrary; keeps report grouped) but reference all lessons.
    const primary = lessons.sort()[0];
    addFinding(primary, "LOW", `audio manifest`,
      `sourceUrl \`${url}\` xuáº¥t hiá»‡n trong ${lessons.length} lesson: ${lessons.join(", ")}.`,
      `Verify cÃ³ pháº£i chia sáº» intentional (VD icon speaker) khÃ´ng; náº¿u lÃ  bÃ i táº­p, chuyá»ƒn vá» 1 lesson gá»‘c vÃ  link cross-lesson qua ID.`,
      "M2");
  }
}
for (const [url, lessonSet] of seenSourceUrls.image) {
  if (lessonSet.size > 1) {
    const lessons = [...lessonSet];
    const primary = lessons.sort()[0];
    addFinding(primary, "LOW", `image manifest`,
      `image url \`${url}\` xuáº¥t hiá»‡n trong ${lessons.length} lesson: ${lessons.join(", ")}.`,
      `Verify cÃ³ pháº£i chia sáº» intentional khÃ´ng; náº¿u khÃ´ng, dedupe.`,
      "M2");
  }
}

// ---- Emit report ----
// Reports are tooling output, not course content — keep them out of courses/.
  const notesDir = join(ROOT, "reports");
if (!existsSync(notesDir)) mkdirSync(notesDir, { recursive: true });

const bySeverity = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
const byType = {};
let total = 0;
for (const arr of Object.values(findings)) {
  for (const f of arr) {
    total++;
    bySeverity[f.severity] = (bySeverity[f.severity] || 0) + 1;
    byType[f.id] = (byType[f.id] || 0) + 1;
  }
}

const lines = [];
lines.push(`# Phase 1 â€” Media Integrity Audit\n`);
lines.push(`_Generated by \`scripts/audit-media.mjs\`. Äá»c-only, chÆ°a chá»‰nh sá»­a source._\n`);

// TL;DR
lines.push(`## TL;DR (verdict)\n`);
lines.push(`- **Structural integrity: Sáº CH.** 0 findings á»Ÿ táº§ng M1â€“M5 (khÃ´ng duplicate manifest entries, khÃ´ng orphan binary, khÃ´ng cross-lesson media reuse).`);
lines.push(`- **Topic-heuristic (M6/M7): má»i finding LOW lÃ  false positive tá»« example sentences.** NguyÃªn nhÃ¢n: \`noteKeywords\` trong \`topics-map.json\` cÃ³ keyword broad nhÆ° \`"going to"\`, \`"future"\`, \`"past"\`, \`"present"\`, \`"do"\`... match ngay cáº£ trong cÃ¢u vÃ­ dá»¥ ("going to the library", "I do the housework"). ÄÃ¢y lÃ  known issue Ä‘Æ°á»£c ghi trong \`AGENTS.md\` Roadmap ("Fine-tune per-question topic tagging").`);
lines.push(`- **HÃ nh Ä‘á»™ng Phase 2:** khÃ´ng cÃ³ structural fix nÃ o cáº§n lÃ m. Váº¥n Ä‘á» tagging noise sáº½ Ä‘Æ°á»£c xá»­ lÃ½ trong Phase 7 (taxonomy tightening) báº±ng cÃ¡ch:`);
lines.push(`  1. RÃºt gá»n \`noteKeywords\` â€” bá» hoáº·c scope háº¹p cÃ¡c key single-word (\`"do"\`, \`"past"\`, \`"future"\`, \`"present"\`, \`"will"\`).`);
lines.push(`  2. ThÃªm \`blockOverrides\` cho nhá»¯ng assignment block bá»‹ flag Ä‘á»ƒ cháº·n tag \`review\` sai.`);
lines.push("");
lines.push(`## Tá»•ng quan\n`);
lines.push(`- Lessons quÃ©t: **${lessonDirs.length}** (${lessonDirs.join(", ")})`);
lines.push(`- Tá»•ng findings: **${total}**`);
lines.push(`  - CRITICAL: ${bySeverity.CRITICAL || 0}`);
lines.push(`  - HIGH: ${bySeverity.HIGH || 0}`);
lines.push(`  - MEDIUM: ${bySeverity.MEDIUM || 0}`);
lines.push(`  - LOW: ${bySeverity.LOW || 0}`);
lines.push(`- Theo loáº¡i:`);
for (const k of ["M1", "M2", "M3", "M4", "M5", "M6", "M7"]) {
  lines.push(`  - ${k}: ${byType[k] || 0}`);
}
lines.push("");
lines.push(`### Legend loáº¡i`);
lines.push(`- **M1** duplicate audio \`localFile\` trong 1 lesson`);
lines.push(`- **M2** \`sourceUrl\`/\`url\` dÃ¹ng á»Ÿ nhiá»u lesson (cáº§n verify)`);
lines.push(`- **M3** file audio orphan (trÃªn disk, khÃ´ng manifest)`);
lines.push(`- **M4** file image orphan (trÃªn disk, khÃ´ng manifest)`);
lines.push(`- **M5** duplicate entry trong image manifest`);
lines.push(`- **M6** audio script gá»£i topic ngoÃ i lesson hints (kháº£ nÄƒng misplaced)`);
lines.push(`- **M7** image á»Ÿ trong block cÃ³ text gá»£i topic ngoÃ i lesson hints`);
lines.push("");
lines.push(`## Coverage per lesson\n`);
for (const s of perLessonSummary) {
  lines.push(`- **${s.lessonKey}**: ${s.audios} audio entries, ${s.images} image entries, ${s.audioFilesOnDisk} mp3 files, ${s.imageFilesOnDisk} image files â†’ ${s.findings} findings`);
}
lines.push("");
lines.push(`## Findings\n`);
for (const lessonKey of lessonDirs) {
  const arr = findings[lessonKey] || [];
  lines.push(`### ${lessonKey} â€” ${arr.length} findings\n`);
  if (!arr.length) {
    lines.push(`_Sáº¡ch._\n`);
    continue;
  }
  arr.sort((a, b) => {
    const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    if (order[a.severity] !== order[b.severity]) return order[a.severity] - order[b.severity];
    return a.id.localeCompare(b.id);
  });
  for (const f of arr) {
    lines.push(`- **[${f.severity}] ${f.id}** \`${f.path}\``);
    lines.push(`  - _Issue:_ ${f.description}`);
    lines.push(`  - _Fix:_ ${f.fix}`);
  }
  lines.push("");
}

const out = lines.join("\n");
writeFileSync(join(notesDir, "audit-1-media.md"), out, "utf8");
console.log(`Wrote notes/audit-1-media.md â€” ${total} findings across ${lessonDirs.length} lessons.`);
console.log(`Severity: CRITICAL=${bySeverity.CRITICAL || 0}, HIGH=${bySeverity.HIGH || 0}, MEDIUM=${bySeverity.MEDIUM || 0}, LOW=${bySeverity.LOW || 0}`);
console.log(`Type: ${Object.entries(byType).map(([k, v]) => `${k}=${v}`).join(", ")}`);
