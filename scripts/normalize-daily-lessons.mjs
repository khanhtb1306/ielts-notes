import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, join, relative } from "node:path";

const ROOT = process.cwd();
const DAILY = join(ROOT, "source", "daily");
const AUDIO_REPORT = join(DAILY, "audio-download-report.json");
const AUDIO_RE = /https:\/\/api-quiz-maker\.langgo\.vn\/storage\/audio\/[^\"'<>\s]+/g;
const AUDIO_TAG_RE = /<(?:img|audio)\b[^>]*>/gi;
const IMG_RE = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function decodeEntities(value) {
  const named = {
    nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
    mdash: "-", ndash: "-", hellip: "...", rsquo: "'", lsquo: "'", rdquo: '"', ldquo: '"',
    agrave: "à", aacute: "á", acirc: "â", atilde: "ã", auml: "ä", aring: "å", aelig: "æ",
    ccedil: "ç", egrave: "è", eacute: "é", ecirc: "ê", euml: "ë",
    igrave: "ì", iacute: "í", icirc: "î", iuml: "ï",
    eth: "ð", ntilde: "ñ", ograve: "ò", oacute: "ó", ocirc: "ô", otilde: "õ", ouml: "ö",
    ugrave: "ù", uacute: "ú", ucirc: "û", uuml: "ü", yacute: "ý", thorn: "þ", yuml: "ÿ",
    Agrave: "À", Aacute: "Á", Acirc: "Â", Atilde: "Ã", Auml: "Ä", Aring: "Å", AElig: "Æ",
    Ccedil: "Ç", Egrave: "È", Eacute: "É", Ecirc: "Ê", Euml: "Ë",
    Igrave: "Ì", Iacute: "Í", Icirc: "Î", Iuml: "Ï",
    ETH: "Ð", Ntilde: "Ñ", Ograve: "Ò", Oacute: "Ó", Ocirc: "Ô", Otilde: "Õ", Ouml: "Ö",
    Ugrave: "Ù", Uacute: "Ú", Ucirc: "Û", Uuml: "Ü", Yacute: "Ý", THORN: "Þ"
  };
  return String(value || "")
    .replace(/&([A-Za-z]+);/g, (match, name) => named[name] ?? match)
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)));
}

function htmlToText(html) {
  return decodeEntities(String(html || ""))
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

function firstText(...values) {
  for (const value of values) {
    const text = htmlToText(value);
    if (text) return text;
  }
  return "";
}

function lessonNumber(lessonKey) {
  const match = lessonKey.match(/lesson-(\d+)/);
  return match ? Number(match[1]) : null;
}

function challengeNumber(title, fallbackFile) {
  const match = String(title || "").match(/CHALLENGE\s+(\d+)/i) || String(fallbackFile || "").match(/challenge-(\d+)/i);
  return match ? Number(match[1]) : null;
}

function cleanUrl(url) {
  return String(url || "").replace(/&amp;/g, "&").replace(/\\+$/g, "");
}

function audioUrls(value) {
  return [...JSON.stringify(value || {}).matchAll(AUDIO_RE)].map((match) => cleanUrl(match[0]));
}

function markerizedAudioText(html) {
  return decodeEntities(String(html || "")).replace(AUDIO_TAG_RE, (tag) => {
    const dataUrl = tag.match(/\bdata-url=["']([^"']+)["']/i)?.[1];
    const src = tag.match(/\bsrc=["']([^"']+)["']/i)?.[1];
    const clean = cleanUrl(dataUrl || src || "");
    return clean.includes("/storage/audio/") ? ` [[audio:${clean}]] ` : tag;
  });
}

function compactText(value) {
  return String(value || "")
    .replace(/\[\[audio:[^\]]+\]\]/g, "")
    .replace(/\([^)]*[À-ỹ][^)]*\)/g, "")
    .replace(/^[\s,./;:|\-–—]+|[\s,./;:|\-–—]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function validScriptCandidate(value) {
  const text = compactText(value);
  if (!text || text.length < 2) return false;
  if (/^[AB]:?$/i.test(text)) return false;
  if (/^\d+\.?$/.test(text)) return false;
  if (/^\/?[ɪʊəæɑɔʌɜː:]+\/?$/i.test(text)) return false;
  return true;
}

function previousCandidate(before) {
  const parts = before.split(/[\n,;|/]+/);
  return compactText(parts[parts.length - 1].replace(/\/[a-zɪʊəæɑɔʌɜː:]+\/?/gi, ""));
}

function nextCandidate(after) {
  const firstLine = String(after || "").slice(0, 220).split(/\n/)[0];
  return compactText(firstLine);
}

function extractInlineAudioScripts(html) {
  const text = htmlToText(markerizedAudioText(html));
  const refs = [];
  const re = /\[\[audio:([^\]]+)\]\]/g;
  const matches = [...text.matchAll(re)];
  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const url = cleanUrl(match[1]);
    const previousEnd = index > 0 ? matches[index - 1].index + matches[index - 1][0].length : 0;
    const nextStart = index + 1 < matches.length ? matches[index + 1].index : text.length;
    const beforeSegment = text.slice(previousEnd, match.index);
    const afterSegment = text.slice(match.index + match[0].length, nextStart);
    const next = nextCandidate(afterSegment);
    const prev = previousCandidate(beforeSegment);
    const rawAfter = afterSegment.trimStart();
    const preferPrev = rawAfter.startsWith(",") || rawAfter.startsWith("/");
    const script = preferPrev && validScriptCandidate(prev)
      ? prev
      : validScriptCandidate(next)
        ? next
        : validScriptCandidate(prev)
          ? prev
          : "";
    refs.push({ url, script });
  }
  return refs;
}

function audioRefsForItem(item, audioLookup) {
  const refs = [];
  const add = (url, script, source = "inline") => {
    const clean = cleanUrl(url);
    if (!clean) return;
    const existing = refs.find((ref) => ref.url === clean);
    if (existing) {
      if (!existing.script && script) existing.script = script;
      return;
    }
    refs.push({ url: clean, localFile: audioLookup.get(clean) || null, script: compactText(script), source });
  };

  if (item.audio_url) add(item.audio_url, firstText(item.transcript, item.content, item.title), "audio_url");
  for (const field of [item.title, item.content, item.introduction, item.explain]) {
    for (const ref of extractInlineAudioScripts(field)) add(ref.url, ref.script, "html_data_url");
  }
  const answer = item.answer?.answers;
  if (answer && typeof answer === "object" && "content" in answer) {
    for (const ref of extractInlineAudioScripts(answer.content)) add(ref.url, ref.script, "answer_template");
  }
  for (const url of audioUrls(item)) add(url, "", "raw_url");
  return refs;
}

function imageUrlsFromHtml(html) {
  const out = [];
  for (const match of String(html || "").matchAll(IMG_RE)) {
    const src = decodeEntities(match[1]);
    if (!src || src.startsWith("data:")) continue;
    if (src.includes("icons8-speaker")) continue;
    out.push(src);
  }
  return out;
}

function imageUrls(value) {
  const urls = new Set();
  const visit = (node) => {
    if (!node) return;
    if (typeof node === "string") {
      imageUrlsFromHtml(node).forEach((url) => urls.add(url));
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (typeof node === "object") {
      for (const [key, val] of Object.entries(node)) {
        if ((key === "link_image" || key === "url_image") && typeof val === "string" && val.trim()) urls.add(val.trim());
        else visit(val);
      }
    }
  };
  visit(value);
  return [...urls];
}

function makeAudioLookup() {
  if (!existsSync(AUDIO_REPORT)) return new Map();
  const report = readJson(AUDIO_REPORT);
  const map = new Map();
  for (const file of report.files || []) {
    if (file.url && file.file) map.set(cleanUrl(file.url), file.file);
  }
  return map;
}

function answerShape(value) {
  if (Array.isArray(value)) return "array";
  if (value && typeof value === "object") return "object";
  if (value == null) return "null";
  return typeof value;
}

function normalizeAssignment(item, challenge, audioLookup) {
  const audioRefs = audioRefsForItem(item, audioLookup);
  return {
    id: `assignment-${item.id ?? item.index ?? "unknown"}`,
    sourceId: item.id ?? null,
    challengeId: challenge.challengeId,
    classChallengeId: challenge.classChallengeId,
    type: item.type ?? null,
    title: htmlToText(item.title) || null,
    text: firstText(item.title, item.content, item.transcript),
    rawHtml: item.content || item.title || null,
    audioRefs,
    fallbackForMissingAudio: audioRefs.length === 0,
    imageRefs: imageUrls(item).map((url) => ({ url, localFile: null }))
  };
}

function normalizeQuestion(item, challenge, submissionByQuestion, audioLookup) {
  const submitted = submissionByQuestion?.[String(item.id)] || null;
  const answer = item.answer?.answers ?? null;
  const audioRefs = audioRefsForItem(item, audioLookup);
  return {
    id: `question-${item.id}`,
    sourceQuestionId: item.id,
    challengeId: challenge.challengeId,
    classChallengeId: challenge.classChallengeId,
    title: htmlToText(item.title) || null,
    type: item.type ?? null,
    prompt: firstText(item.title, item.introduction, item.content),
    introductionText: htmlToText(item.introduction),
    contentText: htmlToText(item.content),
    answerTemplateText: typeof answer === "object" && answer && "content" in answer ? htmlToText(answer.content) : htmlToText(answer),
    explanationText: htmlToText(item.explain),
    rawHtml: {
      title: item.title || null,
      introduction: item.introduction || null,
      content: item.content || null,
      answerTemplate: typeof answer === "object" && answer && "content" in answer ? answer.content : null,
      explain: item.explain || null
    },
    audioRefs,
    fallbackForMissingAudio: audioRefs.length === 0,
    sourceAnswerShape: answerShape(answer),
    submission: submitted ? {
      totalQuestion: submitted.total_question ?? null,
      totalCorrect: submitted.total_correct_result_answer ?? null,
      userAnswer: submitted.user_answer ?? null,
      correctAnswer: submitted.correct_answer ?? null,
      resultAnswer: submitted.result_answer ?? null,
      hasAnswerEmpty: submitted.has_answer_empty ?? null
    } : null,
    imageRefs: imageUrls(item).map((url) => ({ url, localFile: null }))
  };
}

function challengeMeta(raw, rawFile) {
  const list = raw.listItem || {};
  const cc = raw.classChallenge?.json?.data || {};
  const ch = cc.challenge || {};
  const title = list.challenge_title || ch.title || "Untitled challenge";
  return {
    id: Number(list.challenge_id || cc.challenge_id || ch.id),
    challengeId: Number(list.challenge_id || cc.challenge_id || ch.id),
    classChallengeId: String(list.id || cc.id || ""),
    number: challengeNumber(title, rawFile),
    title,
    note: list.challenge_note || ch.note || "",
    day: Number(list.day || cc.day || ch.day || 0) || null,
    deadline: list.deadline || cc.deadline || null,
    totalQuestion: Number(list.total_question || ch.total_question || 0) || null,
    classification: list.classification || ch.classification || null,
    rawFile: `raw/${basename(rawFile)}`
  };
}

function normalizeSubmission(raw, challenge) {
  const data = raw.studentChallenge?.json?.data || null;
  if (!data) return null;
  return {
    challengeId: challenge.challengeId,
    classChallengeId: challenge.classChallengeId,
    statusMark: data.status_mark || null,
    rate: data.rate ?? null,
    correctAnswer: data.correct_answer ?? null,
    submittedAt: data.submitted_at || null,
    markedAt: data.status_mark_date || null,
    commentText: htmlToText(data.comment),
    redoCommentText: htmlToText(data.redo_comment),
    cancelCommentText: htmlToText(data.cancel_comment),
    answers: data.answers || null
  };
}

function makeScriptItem(base) {
  const textParts = [base.text, base.prompt, base.answerTemplateText, base.explanationText, base.commentText]
    .map((text) => compactText(text))
    .filter(Boolean);
  const audioScriptParts = (base.audioRefs || []).map((ref) => compactText(ref.script)).filter(Boolean);
  if (!textParts.length) textParts.push(...audioScriptParts);
  const scriptText = textParts.join("\n\n");
  if (!scriptText) return null;
  return {
    id: base.id,
    sourceType: base.sourceType,
    sourceId: base.sourceId ?? null,
    challengeId: base.challengeId,
    classChallengeId: base.classChallengeId,
    title: base.title || null,
    scriptText,
    audioRefs: base.audioRefs || [],
    fallbackForMissingAudio: !(base.audioRefs || []).length
  };
}

function scriptCandidateFromNeighbor(text) {
  const compact = compactText(text);
  if (!compact) return "";
  const numbered = [...compact.matchAll(/(?:^|\s)\d+\.\s+(.+?)(?=(?:\s+\d+\.\s)|$)/g)].map((match) => compactText(match[1]));
  const bestNumbered = numbered.filter(validScriptCandidate).at(-1);
  if (bestNumbered) return bestNumbered;
  const lines = compact.split(/\n+/).map(compactText).filter(validScriptCandidate);
  return lines.at(-1) || compact;
}

function fillAdjacentAudioScripts(blocks) {
  for (let i = 0; i < blocks.length; i += 1) {
    const block = blocks[i];
    for (const ref of block.audioRefs || []) {
      if (ref.script) continue;

      let candidate = "";
      for (let p = i - 1; p >= 0; p -= 1) {
        if (blocks[p].challengeId !== block.challengeId) break;
        candidate = scriptCandidateFromNeighbor(blocks[p].text || blocks[p].title);
        if (validScriptCandidate(candidate)) break;
      }
      if (!validScriptCandidate(candidate)) {
        for (let n = i + 1; n < blocks.length; n += 1) {
          if (blocks[n].challengeId !== block.challengeId) break;
          candidate = scriptCandidateFromNeighbor(blocks[n].text || blocks[n].title);
          if (validScriptCandidate(candidate)) break;
        }
      }
      if (validScriptCandidate(candidate)) {
        ref.script = candidate;
        ref.source = `${ref.source || "raw_url"}+adjacent_script`;
      }
    }
  }
}

function buildScripts(lesson, lessonKey, contents, exercises, submissions) {
  const items = [];
  for (const block of contents.blocks) {
    const item = makeScriptItem({ ...block, sourceType: "content", sourceId: block.sourceId, id: `script-content-${block.sourceId ?? items.length + 1}` });
    if (item) items.push(item);
  }
  for (const question of exercises.questions) {
    const item = makeScriptItem({ ...question, sourceType: "exercise", sourceId: question.sourceQuestionId, id: `script-question-${question.sourceQuestionId}` });
    if (item) items.push(item);
  }
  for (const submission of submissions.items) {
    const item = makeScriptItem({ ...submission, sourceType: "feedback", sourceId: submission.classChallengeId, id: `script-feedback-${submission.classChallengeId}`, title: "Teacher feedback" });
    if (item) items.push(item);
  }
  return { lesson, lessonKey, items };
}

function scriptMapFrom(scripts) {
  const map = new Map();
  for (const item of scripts.items || []) {
    for (const ref of item.audioRefs || []) {
      if (!ref.url) continue;
      const existing = map.get(ref.url) || { scripts: [], sourceIds: [] };
      if (ref.script && !existing.scripts.includes(ref.script)) existing.scripts.push(ref.script);
      if (!existing.sourceIds.includes(item.id)) existing.sourceIds.push(item.id);
      map.set(ref.url, existing);
    }
  }
  return map;
}

function localFileBytes(file) {
  if (!file || !existsSync(join(ROOT, file))) return null;
  return statSync(join(ROOT, file)).size;
}

function mdSection(title, text) {
  if (!text) return "";
  return `### ${title}\n\n${text.trim()}\n\n`;
}

function lessonOverview(lessonKey, manifest, contents, exercises, submissions, audio, images, scripts) {
  const title = lessonKey === "lesson-misc" ? "Daily Break Challenges" : `Lesson ${String(manifest.lesson).padStart(2, "0")} Daily Practice`;
  let md = `# ${title}\n\n`;
  md += `Generated from LangGo daily challenge API. Raw responses are kept in \`raw/\` for comparison.\n\n`;
  md += `- Challenges: ${manifest.challenges.length}\n`;
  md += `- Content blocks: ${contents.blocks.length}\n`;
  md += `- Exercise blocks: ${exercises.questions.length}\n`;
  md += `- Script blocks: ${scripts.items.length}\n`;
  md += `- Audio files: ${audio.items.length}\n`;
  md += `- Images: ${images.items.length}\n\n`;

  for (const challenge of manifest.challenges) {
    md += `## ${challenge.title}\n\n`;
    if (challenge.note) md += `**Note:** ${challenge.note}\n\n`;
    md += `- Challenge ID: ${challenge.challengeId}\n`;
    md += `- Class challenge ID: ${challenge.classChallengeId}\n`;
    if (challenge.deadline) md += `- Deadline: ${challenge.deadline}\n`;
    md += `- Raw: \`${challenge.rawFile}\`\n\n`;

    const blocks = contents.blocks.filter((b) => b.challengeId === challenge.challengeId);
    if (blocks.length) {
      md += `### Study Content\n\n`;
      for (const block of blocks) {
        if (block.title) md += `#### ${block.title}\n\n`;
        if (block.text) md += `${block.text}\n\n`;
      }
    }

    const qs = exercises.questions.filter((q) => q.challengeId === challenge.challengeId);
    if (qs.length) {
      md += `### Exercises\n\n`;
      for (const q of qs) {
        md += `#### ${q.title || q.id}\n\n`;
        md += `- Type: ${q.type ?? "unknown"}\n`;
        if (q.prompt) md += `\n${q.prompt}\n`;
        if (q.answerTemplateText) md += `\n**Answer template / submitted view:**\n\n${q.answerTemplateText}\n`;
        if (q.explanationText) md += `\n**Explanation:**\n\n${q.explanationText}\n`;
        md += `\n`;
      }
    }

    const submission = submissions.items.find((s) => s.challengeId === challenge.challengeId);
    if (submission) {
      md += mdSection("Submission / Feedback", [
        submission.statusMark ? `Status: ${submission.statusMark}` : "",
        submission.correctAnswer != null ? `Correct answer: ${submission.correctAnswer}` : "",
        submission.commentText || ""
      ].filter(Boolean).join("\n\n"));
    }
  }
  return md;
}

function lessonDirs() {
  return readdirSync(DAILY, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("lesson-") && existsSync(join(DAILY, entry.name, "raw")))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function main() {
  const audioLookup = makeAudioLookup();
  const globalAudioReport = existsSync(AUDIO_REPORT) ? readJson(AUDIO_REPORT) : { files: [] };
  const allAudioFiles = globalAudioReport.files || [];
  const generated = { lessons: [] };
  const scriptCoverage = { generatedAt: new Date().toISOString(), missingAudioScripts: [] };

  for (const lessonKey of lessonDirs()) {
    const lessonDir = join(DAILY, lessonKey);
    const rawDir = join(lessonDir, "raw");
    const rawFiles = readdirSync(rawDir).filter((file) => file.endsWith(".json")).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    const rawItems = rawFiles.map((file) => ({ file, raw: readJson(join(rawDir, file)) }));
    const metas = rawItems.map(({ file, raw }) => challengeMeta(raw, file)).sort((a, b) => (a.number ?? 999) - (b.number ?? 999));

    const manifest = {
      schemaVersion: 2,
      lesson: lessonNumber(lessonKey),
      lessonKey,
      title: lessonKey === "lesson-misc" ? "Break Challenges" : `Lesson ${lessonNumber(lessonKey)}`,
      source: "LangGo daily challenge API",
      rawFolder: "raw/",
      files: {
        overview: "overview.md",
        content: "content.json",
        exercises: "exercises.json",
        scripts: "scripts.json",
        submission: "submission.json",
        audioManifest: "audio/manifest.json",
        imageManifest: "images/manifest.json"
      },
      challenges: metas
    };

    const contents = { lesson: manifest.lesson, lessonKey, blocks: [] };
    const exercises = { lesson: manifest.lesson, lessonKey, questions: [] };
    const submissions = { lesson: manifest.lesson, lessonKey, items: [] };
    const existingImageManifestPath = join(lessonDir, "images", "manifest.json");
    const existingImages = existsSync(existingImageManifestPath) ? readJson(existingImageManifestPath).items || [] : [];
    const existingImageByUrl = new Map(existingImages.map((item) => [item.url, item]));
    const images = { lesson: manifest.lesson, lessonKey, items: [], notes: [] };

    for (const meta of metas) {
      const raw = rawItems.find((item) => item.file === basename(meta.rawFile))?.raw;
      if (!raw) continue;
      const submissionData = raw.studentChallenge?.json?.data || {};
      const submissionByQuestion = submissionData.answers && !Array.isArray(submissionData.answers) ? submissionData.answers : {};

      for (const assignment of raw.assignment?.json?.data || []) contents.blocks.push(normalizeAssignment(assignment, meta, audioLookup));
      for (const question of raw.questions?.json?.data || []) exercises.questions.push(normalizeQuestion(question, meta, submissionByQuestion, audioLookup));

      const submission = normalizeSubmission(raw, meta);
      if (submission) submissions.items.push(submission);

      for (const url of imageUrls(raw)) {
        if (!images.items.some((item) => item.url === url)) {
          const existing = existingImageByUrl.get(url);
          images.items.push(existing ? { url, localFile: existing.localFile || null, bytes: existing.bytes ?? null, status: existing.status || null, note: existing.note || null } : { url, localFile: null, note: "Not downloaded yet" });
        }
      }
    }

    fillAdjacentAudioScripts(contents.blocks);
    const scripts = buildScripts(manifest.lesson, lessonKey, contents, exercises, submissions);
    const audioScriptByUrl = scriptMapFrom(scripts);
    const audioFiles = allAudioFiles.filter((file) => {
      const lessonFromFile = file.file?.match(/audio\/daily\/(lesson-[^/]+)\//)?.[1];
      return lessonFromFile === lessonKey;
    });
    const audio = {
      lesson: manifest.lesson,
      lessonKey,
      folder: relative(lessonDir, join(ROOT, "audio", "daily", lessonKey)).replace(/\\/g, "/"),
      items: audioFiles.map((file, index) => {
        const scriptInfo = audioScriptByUrl.get(file.url) || { scripts: [], sourceIds: [] };
        return {
          id: `${lessonKey}-audio-${String(index + 1).padStart(3, "0")}`,
          challengeId: file.challengeId ?? null,
          classChallengeId: file.classChallengeId ?? null,
          sourceUrl: file.url,
          localFile: file.file,
          bytes: file.bytes ?? localFileBytes(file.file),
          status: file.status,
          script: scriptInfo.scripts[0] || null,
          scriptAlternatives: scriptInfo.scripts.slice(1),
          scriptSourceIds: scriptInfo.sourceIds,
          hasScript: Boolean(scriptInfo.scripts.length),
          needsScriptReview: !scriptInfo.scripts.length,
          note: scriptInfo.scripts.length ? null : "No transcript/script found in API; use scripts.json or raw/image context as fallback."
        };
      })
    };
    for (const item of audio.items) {
      if (!item.hasScript) {
        scriptCoverage.missingAudioScripts.push({
          lessonKey,
          challengeId: item.challengeId,
          classChallengeId: item.classChallengeId,
          audioId: item.id,
          sourceUrl: item.sourceUrl,
          localFile: item.localFile,
          note: item.note
        });
      }
    }

    mkdirSync(join(lessonDir, "audio"), { recursive: true });
    mkdirSync(join(lessonDir, "images"), { recursive: true });
    writeJson(join(lessonDir, "manifest.json"), manifest);
    writeJson(join(lessonDir, "content.json"), contents);
    writeJson(join(lessonDir, "exercises.json"), exercises);
    writeJson(join(lessonDir, "scripts.json"), scripts);
    writeJson(join(lessonDir, "submission.json"), submissions);
    writeJson(join(lessonDir, "audio", "manifest.json"), audio);
    writeJson(join(lessonDir, "images", "manifest.json"), images);
    writeFileSync(join(lessonDir, "overview.md"), lessonOverview(lessonKey, manifest, contents, exercises, submissions, audio, images, scripts), "utf8");

    generated.lessons.push({
      lessonKey,
      challenges: metas.length,
      contentBlocks: contents.blocks.length,
      questionBlocks: exercises.questions.length,
      scriptBlocks: scripts.items.length,
      audioFiles: audio.items.length,
      audioWithScript: audio.items.filter((item) => item.hasScript).length,
      audioWithoutScript: audio.items.filter((item) => !item.hasScript).length,
      images: images.items.length
    });
  }

  writeJson(join(DAILY, "normalized-summary.json"), { generatedAt: new Date().toISOString(), ...generated });
  writeJson(join(DAILY, "script-coverage-report.json"), scriptCoverage);
  console.log(JSON.stringify(generated, null, 2));
}

main();
