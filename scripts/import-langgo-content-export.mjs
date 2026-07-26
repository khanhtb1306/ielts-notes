import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename } from "node:path";

const [, , inputPath] = process.argv;

if (!inputPath) {
  console.error("Usage: node scripts/import-langgo-content-export.mjs <export.json>");
  process.exit(1);
}

if (!existsSync(inputPath)) {
  console.error(`Input file not found: ${inputPath}`);
  process.exit(1);
}

const RAW_PATH = "source/daily/raw-export.json";
const raw = JSON.parse(readFileSync(RAW_PATH, "utf8"));
const incoming = JSON.parse(readFileSync(inputPath, "utf8"));

function scrubListItem(item) {
  const copy = { ...(item || {}) };
  delete copy.student_challenge;
  return copy;
}

function emptyResponse() {
  return { ok: true, status: 200, json: { success: true, data: null, message: null } };
}

function normaliseResult(result) {
  const listItem = scrubListItem(result.listItem);
  return {
    listItem,
    classChallenge: result.classChallenge || emptyResponse(),
    studentChallenge: emptyResponse(),
    highlight: emptyResponse(),
    assignment: result.assignment || emptyResponse(),
    questions: result.questions || emptyResponse()
  };
}

const byClassChallenge = new Map();
for (const result of raw.results || []) {
  const key = String(result.listItem?.id || result.classChallenge?.json?.data?.id || "");
  if (key) byClassChallenge.set(key, result);
}

for (const result of incoming.results || []) {
  const normalised = normaliseResult(result);
  const key = String(normalised.listItem?.id || "");
  if (!key) continue;
  byClassChallenge.set(key, normalised);
}

raw.exportedAt = incoming.exportedAt || new Date().toISOString();
raw.contractId = incoming.contractId || raw.contractId;
raw.classId = incoming.classId || raw.classId;
raw.results = [...byClassChallenge.values()].sort((a, b) => Number(a.listItem?.id || 0) - Number(b.listItem?.id || 0));
raw.count = raw.results.length;
raw.importNotes ||= [];
raw.importNotes.push({
  importedAt: new Date().toISOString(),
  source: basename(inputPath),
  mode: "content-only",
  importedResults: incoming.results?.length || 0,
  note: "Imported assignment/question content only; student submissions intentionally omitted for imported items."
});

writeFileSync(RAW_PATH, JSON.stringify(raw, null, 2) + "\n", "utf8");

console.log(JSON.stringify({
  rawPath: RAW_PATH,
  totalResults: raw.results.length,
  importedResults: incoming.results?.length || 0,
  imported: (incoming.results || []).map((result) => ({
    classChallengeId: result.listItem?.id,
    challengeId: result.listItem?.challenge_id,
    title: result.listItem?.challenge_title,
    assignmentBlocks: result.assignment?.json?.data?.length ?? null,
    questionBlocks: result.questions?.json?.data?.length ?? null
  }))
}, null, 2));
