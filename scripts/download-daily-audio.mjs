import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, extname, join, relative } from "node:path";

const ROOT = process.cwd();
const RAW_PATH = join(ROOT, "source", "daily", "raw-export.json");
const REPORT_PATH = join(ROOT, "source", "daily", "audio-download-report.json");
const MAX_BYTES = 20 * 1024 * 1024;
const AUDIO_RE = /https:\/\/api-quiz-maker\.langgo\.vn\/storage\/audio\/[^\"'<>\s]+/g;

function safeName(value) {
  return String(value || "audio")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "audio";
}

function lessonOf(title) {
  const match = String(title || "").match(/LESSON\s+(\d+)/i);
  return match ? String(match[1]).padStart(2, "0") : "misc";
}

function urlsIn(value) {
  return [...JSON.stringify(value).matchAll(AUDIO_RE)].map((match) =>
    match[0].replace(/&amp;/g, "&").replace(/\\+$/g, "")
  );
}

async function contentLength(url) {
  try {
    const response = await fetch(url, { method: "HEAD" });
    const value = response.headers.get("content-length");
    return value ? Number(value) : null;
  } catch {
    return null;
  }
}

async function main() {
  const raw = JSON.parse(readFileSync(RAW_PATH, "utf8"));
  const report = {
    generatedAt: new Date().toISOString(),
    maxBytes: MAX_BYTES,
    totalUrls: 0,
    downloaded: 0,
    skippedExisting: 0,
    tooLarge: [],
    failed: [],
    files: []
  };
  const seen = new Set();

  for (const result of raw.results || []) {
    const title = result.listItem?.challenge_title || result.classChallenge?.json?.data?.challenge?.title || "";
    const lesson = lessonOf(title);
    const challengeId = result.listItem?.challenge_id;
    const classChallengeId = result.listItem?.id;
    const dir = join(ROOT, "audio", "daily", `lesson-${lesson}`);
    mkdirSync(dir, { recursive: true });

    let index = 0;
    for (const url of urlsIn(result)) {
      const key = `${lesson}|${url}`;
      if (seen.has(key)) continue;
      seen.add(key);
      report.totalUrls += 1;
      index += 1;

      const parsed = new URL(url);
      const ext = extname(parsed.pathname) || ".mp3";
      const stem = basename(parsed.pathname, extname(parsed.pathname));
      const filename = safeName(`${challengeId || "challenge"}-${index}-${stem}`) + ext;
      const file = join(dir, filename);
      const relFile = relative(ROOT, file).replace(/\\/g, "/");

      if (existsSync(file)) {
        report.skippedExisting += 1;
        report.files.push({ lesson: Number(lesson), challengeId, classChallengeId, url, file: relFile, status: "exists" });
        continue;
      }

      try {
        const length = await contentLength(url);
        if (length && length > MAX_BYTES) {
          report.tooLarge.push({ lesson: Number(lesson), challengeId, classChallengeId, url, contentLength: length, note: "Skipped because content-length exceeds maxBytes" });
          continue;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const buffer = Buffer.from(await response.arrayBuffer());
        if (buffer.length > MAX_BYTES) {
          report.tooLarge.push({ lesson: Number(lesson), challengeId, classChallengeId, url, contentLength: buffer.length, note: "Downloaded buffer exceeds maxBytes; not saved" });
          continue;
        }

        writeFileSync(file, buffer);
        report.downloaded += 1;
        report.files.push({ lesson: Number(lesson), challengeId, classChallengeId, url, file: relFile, bytes: buffer.length, status: "downloaded" });
      } catch (error) {
        report.failed.push({ lesson: Number(lesson), challengeId, classChallengeId, url, error: error?.message || String(error) });
      }
    }
  }

  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify({
    totalUrls: report.totalUrls,
    downloaded: report.downloaded,
    skippedExisting: report.skippedExisting,
    tooLarge: report.tooLarge.length,
    failed: report.failed.length
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
