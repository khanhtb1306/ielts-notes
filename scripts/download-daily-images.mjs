import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, extname, join, relative } from "node:path";

const ROOT = process.cwd();
const DAILY = join(ROOT, "source", "daily");
const MAX_BYTES = 20 * 1024 * 1024;

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function safeName(value) {
  return String(value || "image")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "image";
}

function extensionFrom(url, contentType) {
  const parsed = new URL(url);
  const fromPath = extname(parsed.pathname);
  if (fromPath) return fromPath.split("?")[0];
  if (/png/i.test(contentType || "")) return ".png";
  if (/webp/i.test(contentType || "")) return ".webp";
  if (/gif/i.test(contentType || "")) return ".gif";
  return ".jpg";
}

async function contentLength(url) {
  try {
    const response = await fetch(url, { method: "HEAD", headers: { "user-agent": "Mozilla/5.0" } });
    const value = response.headers.get("content-length");
    return value ? Number(value) : null;
  } catch {
    return null;
  }
}

function lessonDirs() {
  return readdirSync(DAILY, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("lesson-"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

async function main() {
  const report = { generatedAt: new Date().toISOString(), maxBytes: MAX_BYTES, total: 0, downloaded: 0, skippedExisting: 0, failed: [], tooLarge: [] };

  for (const lessonKey of lessonDirs()) {
    const manifestPath = join(DAILY, lessonKey, "images", "manifest.json");
    if (!existsSync(manifestPath)) continue;
    const manifest = readJson(manifestPath);
    const imageDir = join(DAILY, lessonKey, "images");
    mkdirSync(imageDir, { recursive: true });

    let index = 0;
    for (const item of manifest.items || []) {
      report.total += 1;
      index += 1;
      if (item.localFile && existsSync(join(ROOT, item.localFile))) {
        item.status = item.status || "exists";
        report.skippedExisting += 1;
        continue;
      }

      try {
        const length = await contentLength(item.url);
        if (length && length > MAX_BYTES) {
          item.status = "too-large";
          item.note = "Skipped because content-length exceeds maxBytes";
          item.bytes = length;
          report.tooLarge.push({ lessonKey, url: item.url, contentLength: length });
          continue;
        }

        const response = await fetch(item.url, { headers: { "user-agent": "Mozilla/5.0" } });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const buffer = Buffer.from(await response.arrayBuffer());
        if (buffer.length > MAX_BYTES) {
          item.status = "too-large";
          item.note = "Downloaded buffer exceeds maxBytes; not saved";
          item.bytes = buffer.length;
          report.tooLarge.push({ lessonKey, url: item.url, contentLength: buffer.length });
          continue;
        }

        const ext = extensionFrom(item.url, response.headers.get("content-type"));
        const stem = safeName(`${String(index).padStart(3, "0")}-${basename(new URL(item.url).pathname, extname(new URL(item.url).pathname)) || "image"}`);
        const filePath = join(imageDir, stem + ext);
        writeFileSync(filePath, buffer);
        item.localFile = relative(ROOT, filePath).replace(/\\/g, "/");
        item.bytes = buffer.length;
        item.status = "downloaded";
        item.note = null;
        report.downloaded += 1;
      } catch (error) {
        item.status = "failed";
        item.note = error?.message || String(error);
        report.failed.push({ lessonKey, url: item.url, error: item.note });
      }
    }

    writeJson(manifestPath, manifest);
  }

  writeJson(join(DAILY, "image-download-report.json"), report);
  console.log(JSON.stringify({ total: report.total, downloaded: report.downloaded, skippedExisting: report.skippedExisting, tooLarge: report.tooLarge.length, failed: report.failed.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
