import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const raw = JSON.parse(readFileSync(join(ROOT, "source", "daily", "raw-export.json"), "utf8"));

function lessonKey(title) {
  const match = String(title || "").match(/LESSON\s+(\d+)/i);
  return match ? `lesson-${String(match[1]).padStart(2, "0")}` : "lesson-misc";
}

function challengeNo(title) {
  const match = String(title || "").match(/CHALLENGE\s+(\d+)/i);
  return match ? String(match[1]).padStart(2, "0") : "xx";
}

const summary = {
  generatedAt: new Date().toISOString(),
  contractId: raw.contractId,
  classId: raw.classId,
  totalChallenges: raw.results?.length || 0,
  lessons: {}
};

for (const result of raw.results || []) {
  const title = result.listItem?.challenge_title || result.classChallenge?.json?.data?.challenge?.title || "untitled";
  const lesson = lessonKey(title);
  const dir = join(ROOT, "source", "daily", lesson, "raw");
  mkdirSync(dir, { recursive: true });

  const challengeId = result.listItem?.challenge_id;
  const classChallengeId = result.listItem?.id;
  const file = `challenge-${challengeNo(title)}-${challengeId}.json`;
  writeFileSync(join(dir, file), JSON.stringify(result, null, 2), "utf8");

  summary.lessons[lesson] ||= [];
  summary.lessons[lesson].push({ title, challengeId, classChallengeId, file: `raw/${file}` });
}

writeFileSync(join(ROOT, "source", "daily", "raw-export-summary.json"), JSON.stringify(summary, null, 2), "utf8");
console.log(JSON.stringify({ totalChallenges: summary.totalChallenges, lessons: Object.keys(summary.lessons).length }, null, 2));
