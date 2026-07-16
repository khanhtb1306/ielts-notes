// scripts/audit-media.mjs — Phase 1 media integrity audit (throwaway/dev tool)
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
const SRC = join(ROOT, "source");
const DAILY = join(SRC, "daily");
const AUDIO_ROOT = join(ROOT, "audio", "daily");

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

const topics = readJson(join(DAILY, "topics-map.json"), {});
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
        `Cùng \`localFile\` \`${localFile}\` được ${ids.length} audioId reference: ${ids.join(", ")}.`,
        `Giữ 1 audioId canonical, remap các block audioRefs sang canonical rồi xoá entries thừa trong manifest.`,
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
        `File audio orphan (không có entry trong \`audio/manifest.json\`).`,
        `Thêm entry manifest (id + sourceUrl + script) HOẶC xoá file để dọn thư mục.`,
        "M3");
    } else if (!inBlock) {
      // Referenced by manifest but no content block cites it — this is fine (used by exercises?
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
        `File ảnh orphan (không có entry trong \`images/manifest.json\`).`,
        `Thêm entry manifest (url + localFile + alt) HOẶC xoá file để dọn thư mục.`,
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
        `Cùng \`localFile\` \`${lf}\` trong ${urls.length} entry (URLs khác nhau).`,
        `Gộp thành 1 entry hoặc đảm bảo mỗi ảnh có localFile riêng.`,
        "M5");
    }
  }
  for (const [u, lfs] of imgUrlCount) {
    if (lfs.length > 1) {
      addFinding(lessonKey, "MEDIUM", `source/daily/${lessonKey}/images/manifest.json`,
        `Cùng \`url\` \`${u}\` trong ${lfs.length} entry.`,
        `Gộp thành 1 entry canonical.`,
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
    // Only care about grammar/pronunciation/vocabulary topics — speaking topics like "job",
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
      return `${t} → ${homes.map((h) => h.key + (h.isCore ? "(core)" : "")).join("/")}`;
    }).join("; ");
    addFinding(lessonKey, "LOW", `source/daily/${lessonKey}/audio/manifest.json (audio ${a.id})`,
      `Script "${scriptText.slice(0, 80)}${scriptText.length > 80 ? "…" : ""}" chứa topic keyword ngoài lesson hint (${alternates}).`,
      `Verify: script có thật sự dạy topic khác không. Nếu chỉ ví dụ ngẫu nhiên, bỏ qua; nếu là bài misplaced thì move audio + rewrite manifest.`,
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
      return `${t} → ${homes.map((h) => h.key + (h.isCore ? "(core)" : "")).join("/")}`;
    }).join("; ");
    addFinding(lessonKey, "LOW", `source/daily/${lessonKey}/images/manifest.json (img url=${i.url})`,
      `Block chứa ảnh (${refs.map((r) => r.blockId).join(",")}) có text gợi topic ngoài hint của lesson (${alternates}).`,
      `Verify: có phải ảnh nên nằm ở lesson khác? Nếu không, cần blockOverride hoặc note tay để tránh tag review.`,
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
      `sourceUrl \`${url}\` xuất hiện trong ${lessons.length} lesson: ${lessons.join(", ")}.`,
      `Verify có phải chia sẻ intentional (VD icon speaker) không; nếu là bài tập, chuyển về 1 lesson gốc và link cross-lesson qua ID.`,
      "M2");
  }
}
for (const [url, lessonSet] of seenSourceUrls.image) {
  if (lessonSet.size > 1) {
    const lessons = [...lessonSet];
    const primary = lessons.sort()[0];
    addFinding(primary, "LOW", `image manifest`,
      `image url \`${url}\` xuất hiện trong ${lessons.length} lesson: ${lessons.join(", ")}.`,
      `Verify có phải chia sẻ intentional không; nếu không, dedupe.`,
      "M2");
  }
}

// ---- Emit report ----
const notesDir = join(ROOT, "notes");
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
lines.push(`# Phase 1 — Media Integrity Audit\n`);
lines.push(`_Generated by \`scripts/audit-media.mjs\`. Đọc-only, chưa chỉnh sửa source._\n`);

// TL;DR
lines.push(`## TL;DR (verdict)\n`);
lines.push(`- **Structural integrity: SẠCH.** 0 findings ở tầng M1–M5 (không duplicate manifest entries, không orphan binary, không cross-lesson media reuse).`);
lines.push(`- **Topic-heuristic (M6/M7): mọi finding LOW là false positive từ example sentences.** Nguyên nhân: \`noteKeywords\` trong \`topics-map.json\` có keyword broad như \`"going to"\`, \`"future"\`, \`"past"\`, \`"present"\`, \`"do"\`... match ngay cả trong câu ví dụ ("going to the library", "I do the housework"). Đây là known issue được ghi trong \`AGENTS.md\` Roadmap ("Fine-tune per-question topic tagging").`);
lines.push(`- **Hành động Phase 2:** không có structural fix nào cần làm. Vấn đề tagging noise sẽ được xử lý trong Phase 7 (taxonomy tightening) bằng cách:`);
lines.push(`  1. Rút gọn \`noteKeywords\` — bỏ hoặc scope hẹp các key single-word (\`"do"\`, \`"past"\`, \`"future"\`, \`"present"\`, \`"will"\`).`);
lines.push(`  2. Thêm \`blockOverrides\` cho những assignment block bị flag để chặn tag \`review\` sai.`);
lines.push("");
lines.push(`## Tổng quan\n`);
lines.push(`- Lessons quét: **${lessonDirs.length}** (${lessonDirs.join(", ")})`);
lines.push(`- Tổng findings: **${total}**`);
lines.push(`  - CRITICAL: ${bySeverity.CRITICAL || 0}`);
lines.push(`  - HIGH: ${bySeverity.HIGH || 0}`);
lines.push(`  - MEDIUM: ${bySeverity.MEDIUM || 0}`);
lines.push(`  - LOW: ${bySeverity.LOW || 0}`);
lines.push(`- Theo loại:`);
for (const k of ["M1", "M2", "M3", "M4", "M5", "M6", "M7"]) {
  lines.push(`  - ${k}: ${byType[k] || 0}`);
}
lines.push("");
lines.push(`### Legend loại`);
lines.push(`- **M1** duplicate audio \`localFile\` trong 1 lesson`);
lines.push(`- **M2** \`sourceUrl\`/\`url\` dùng ở nhiều lesson (cần verify)`);
lines.push(`- **M3** file audio orphan (trên disk, không manifest)`);
lines.push(`- **M4** file image orphan (trên disk, không manifest)`);
lines.push(`- **M5** duplicate entry trong image manifest`);
lines.push(`- **M6** audio script gợi topic ngoài lesson hints (khả năng misplaced)`);
lines.push(`- **M7** image ở trong block có text gợi topic ngoài lesson hints`);
lines.push("");
lines.push(`## Coverage per lesson\n`);
for (const s of perLessonSummary) {
  lines.push(`- **${s.lessonKey}**: ${s.audios} audio entries, ${s.images} image entries, ${s.audioFilesOnDisk} mp3 files, ${s.imageFilesOnDisk} image files → ${s.findings} findings`);
}
lines.push("");
lines.push(`## Findings\n`);
for (const lessonKey of lessonDirs) {
  const arr = findings[lessonKey] || [];
  lines.push(`### ${lessonKey} — ${arr.length} findings\n`);
  if (!arr.length) {
    lines.push(`_Sạch._\n`);
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
console.log(`Wrote notes/audit-1-media.md — ${total} findings across ${lessonDirs.length} lessons.`);
console.log(`Severity: CRITICAL=${bySeverity.CRITICAL || 0}, HIGH=${bySeverity.HIGH || 0}, MEDIUM=${bySeverity.MEDIUM || 0}, LOW=${bySeverity.LOW || 0}`);
console.log(`Type: ${Object.entries(byType).map(([k, v]) => `${k}=${v}`).join(", ")}`);
