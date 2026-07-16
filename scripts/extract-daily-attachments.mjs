import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join, relative } from "node:path";

const ROOT = process.cwd();
const DAILY = join(ROOT, "source", "daily");
const MAX_BYTES = 50 * 1024 * 1024;
const A_TAG_RE = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
const HREF_RE = /href=["']([^"']+)["']/gi;
const URL_RE = /https?:\/\/[^"'<>\s]+/gi;

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function decodeEntities(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function htmlToText(html) {
  return decodeEntities(String(html || ""))
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|tr|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizedText(value) {
  return decodeEntities(String(value || ""))
    .replace(/&([a-z])acute;/gi, "$1")
    .replace(/&([a-z])grave;/gi, "$1")
    .replace(/&([a-z])circ;/gi, "$1")
    .replace(/&([a-z])tilde;/gi, "$1")
    .replace(/&([a-z])uml;/gi, "$1")
    .replace(/&[^;]+;/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function cleanUrl(url) {
  return decodeEntities(String(url || ""))
    .replace(/\\+$/g, "")
    .replace(/[),.;]+$/g, "")
    .trim();
}

function safeName(value) {
  return String(value || "attachment")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90) || "attachment";
}

function lessonDirs() {
  return readdirSync(DAILY, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("lesson-"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function linksFromHtml(html) {
  const links = new Map();
  const source = String(html || "");
  for (const match of source.matchAll(A_TAG_RE)) {
    const url = cleanUrl(match[1]);
    if (!url) continue;
    const text = htmlToText(match[2]);
    links.set(url, { url, text: text || null });
  }
  for (const match of source.matchAll(HREF_RE)) {
    const url = cleanUrl(match[1]);
    if (url && !links.has(url)) links.set(url, { url, text: null });
  }
  for (const match of source.matchAll(URL_RE)) {
    const url = cleanUrl(match[0]);
    if (url && !links.has(url)) links.set(url, { url, text: null });
  }
  return [...links.values()];
}

function ignoreUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname === "api-quiz-maker.langgo.vn" && /\/storage\/(audio|images)\//.test(u.pathname)) return true;
    if (u.hostname === "study.langgo.vn") return true;
    if (url.startsWith("data:")) return true;
    return false;
  } catch {
    return true;
  }
}

function classify(url) {
  const u = new URL(url);
  if (u.hostname === "docs.google.com") {
    if (u.pathname.includes("/document/d/")) return "google-doc";
    if (u.pathname.includes("/spreadsheets/d/")) return "google-sheet";
    if (u.pathname.includes("/presentation/d/")) return "google-slide";
    return "google-docs";
  }
  if (u.hostname === "drive.google.com") {
    if (u.pathname.includes("/file/d/")) return "google-drive-file";
    if (u.pathname.includes("/drive/folders/") || u.pathname.includes("/folders/")) return "google-drive-folder";
    return "google-drive";
  }
  if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) return "video";
  return "link";
}

function idFromGooglePath(url, kind) {
  const path = new URL(url).pathname;
  const file = path.match(/\/file\/d\/([^/]+)/)?.[1];
  const doc = path.match(/\/(?:document|spreadsheets|presentation)\/d\/([^/]+)/)?.[1];
  const folder = path.match(/\/(?:drive\/folders|folders)\/([^/]+)/)?.[1];
  return file || doc || folder || null;
}

function downloadInfo(url, kind) {
  const id = idFromGooglePath(url, kind);
  if (!id) return null;
  if (kind === "google-doc") return { url: `https://docs.google.com/document/d/${id}/export?format=docx`, ext: ".docx" };
  if (kind === "google-sheet") return { url: `https://docs.google.com/spreadsheets/d/${id}/export?format=xlsx`, ext: ".xlsx" };
  if (kind === "google-slide") return { url: `https://docs.google.com/presentation/d/${id}/export/pptx`, ext: ".pptx" };
  if (kind === "google-drive-file") return { url: `https://drive.google.com/uc?export=download&id=${id}`, ext: null };
  return null;
}

function textDownloadInfo(item) {
  if (item.kind !== "google-doc") return null;
  const id = idFromGooglePath(item.url, item.kind);
  if (!id) return null;
  return { url: `https://docs.google.com/document/d/${id}/export?format=txt`, ext: ".txt" };
}

function inferExt(url, contentType, fallback, buffer) {
  if (fallback) return fallback;
  if (buffer?.subarray(0, 4).toString("utf8") === "%PDF") return ".pdf";
  const pathExt = extname(new URL(url).pathname);
  if (pathExt) return pathExt;
  if (/pdf/i.test(contentType || "")) return ".pdf";
  if (/word|officedocument\.wordprocessingml/i.test(contentType || "")) return ".docx";
  if (/spreadsheet|excel/i.test(contentType || "")) return ".xlsx";
  if (/presentation|powerpoint/i.test(contentType || "")) return ".pptx";
  if (buffer?.subarray(0, 2).toString("hex") === "504b") return ".zip";
  if (/html/i.test(contentType || "")) return ".html";
  return ".bin";
}

function imageIndex() {
  const map = new Map();
  for (const lessonKey of lessonDirs()) {
    const path = join(DAILY, lessonKey, "images", "manifest.json");
    if (!existsSync(path)) continue;
    const manifest = readJson(path);
    for (const image of manifest.items || []) {
      if (image.url && image.localFile && image.status === "downloaded") {
        map.set(`${lessonKey}|${image.url}`, image);
      }
    }
  }
  return map;
}

function useExistingImage(item, images) {
  const image = images.get(`${item.lessonKey}|${item.url}`);
  if (!image) return false;
  item.localFile = image.localFile;
  item.bytes = image.bytes ?? null;
  item.purpose = "image-reference";
  item.downloadStatus = "downloaded";
  item.note = "Already downloaded by the daily image asset pipeline.";
  return true;
}

function classifyPurpose({ kind, linkTexts = [], context = "", url = "" }) {
  const text = normalizedText([...linkTexts, context].filter(Boolean).join(" "));
  const href = normalizedText(url);
  if (kind === "google-drive-folder") return "drive-folder";
  if (href.includes("docs.google.com/forms")) return "survey-form";
  if (kind === "link" && (/\.(png|jpe?g|gif|webp)(\?|$)/i.test(url) || href.includes("googleusercontent.com") || href.includes("freepik.com") || href.includes("istockphoto.com") || href.includes("dreamstime.com") || href.includes("ftcdn.net") || href.includes("gstatic.com"))) return "image-reference";
  if (text.includes("goi y tra loi") || text.includes("goi y")) return "speaking-suggestion";
  if (text.includes("transcript")) return "listening-transcript";
  if (text.includes("script")) return "listening-script";
  if (text.includes("file doc") || text.includes("huong dan")) return "instruction-file";
  if (href.includes("1drv.ms/v/") || text.includes("quay video")) return "video-prompt";
  return "attachment";
}

function looksLikeLoginOrError(buffer, contentType) {
  if (!/html/i.test(contentType || "")) return false;
  const text = buffer.toString("utf8", 0, Math.min(buffer.length, 4096)).toLowerCase();
  return text.includes("sign in") || text.includes("đăng nhập") || text.includes("accounts.google") || text.includes("request access") || text.includes("you need access");
}

async function tryDownload(item, targetDir) {
  const info = downloadInfo(item.url, item.kind);
  if (!info) {
    item.downloadStatus = item.kind === "google-drive-folder" ? "folder-not-downloadable" : "not-downloadable";
    item.note = item.kind === "google-drive-folder" ? "Google Drive folder: listed only, not downloaded automatically." : "No supported direct download strategy.";
    return item;
  }

  try {
    const response = await fetch(info.url, { headers: { "user-agent": "Mozilla/5.0" }, redirect: "follow" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") || "";
    if (buffer.length > MAX_BYTES) {
      item.downloadStatus = "too-large";
      item.note = `Skipped: file exceeds ${MAX_BYTES} bytes.`;
      item.bytes = buffer.length;
      return item;
    }
    if (looksLikeLoginOrError(buffer, contentType)) {
      item.downloadStatus = "needs-manual-download";
      item.note = "Google returned an HTML login/access page, not the actual file.";
      return item;
    }

    const ext = inferExt(response.url, contentType, info.ext, buffer);
    const stem = safeName(`${item.lessonKey}-${String(item.index).padStart(3, "0")}-${item.kind}-${item.googleId || basename(new URL(item.url).pathname)}`);
    const filename = stem + ext;
    const filePath = join(targetDir, filename);
    writeFileSync(filePath, buffer);
    item.localFile = relative(ROOT, filePath).replace(/\\/g, "/");
    item.bytes = statSync(filePath).size;
    item.contentType = contentType || null;
    item.downloadStatus = "downloaded";
    item.note = null;
    await tryDownloadText(item, targetDir, stem);
    return item;
  } catch (error) {
    item.downloadStatus = "failed";
    item.note = error?.message || String(error);
    return item;
  }
}

async function tryDownloadText(item, targetDir, stem) {
  const info = textDownloadInfo(item);
  if (!info) return item;

  try {
    const response = await fetch(info.url, { headers: { "user-agent": "Mozilla/5.0" }, redirect: "follow" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") || "";
    if (looksLikeLoginOrError(buffer, contentType)) {
      item.textDownloadStatus = "needs-manual-download";
      item.textNote = "Google returned an HTML login/access page for the text export.";
      return item;
    }
    const filePath = join(targetDir, stem + info.ext);
    const text = buffer.toString("utf8").replace(/^\uFEFF/, "");
    writeFileSync(filePath, text, "utf8");
    item.textFile = relative(ROOT, filePath).replace(/\\/g, "/");
    item.textBytes = statSync(filePath).size;
    item.textContentType = contentType || null;
    item.textDownloadStatus = "downloaded";
    item.textNote = null;
    return item;
  } catch (error) {
    item.textDownloadStatus = "failed";
    item.textNote = error?.message || String(error);
    return item;
  }
}

function collectLinks() {
  const map = new Map();
  for (const lessonKey of lessonDirs()) {
    const lessonDir = join(DAILY, lessonKey);
    const sources = [
      { file: "content.json", type: "content", listKey: "blocks" },
      { file: "exercises.json", type: "exercise", listKey: "questions" }
    ];
    for (const source of sources) {
      const path = join(lessonDir, source.file);
      if (!existsSync(path)) continue;
      const data = readJson(path);
      for (const block of data[source.listKey] || []) {
        const htmlParts = [];
        if (block.rawHtml) {
          if (typeof block.rawHtml === "string") htmlParts.push(block.rawHtml);
          else for (const value of Object.values(block.rawHtml)) if (typeof value === "string") htmlParts.push(value);
        }
        for (const html of htmlParts) {
          const context = htmlToText(html).slice(0, 500);
          for (const link of linksFromHtml(html)) {
            const url = link.url;
            if (ignoreUrl(url)) continue;
            const key = `${lessonKey}|${url}`;
            const kind = classify(url);
            const current = map.get(key) || {
              lessonKey,
              lesson: data.lesson ?? null,
              url,
              kind,
              googleId: kind.startsWith("google-") ? idFromGooglePath(url, kind) : null,
              linkTexts: [],
              purpose: null,
              localFile: null,
              textFile: null,
              downloadStatus: "pending",
              textDownloadStatus: null,
              note: null,
              sources: []
            };
            if (link.text && !current.linkTexts.includes(link.text)) current.linkTexts.push(link.text);
            current.sources.push({
              sourceType: source.type,
              sourceFile: source.file,
              sourceId: block.sourceId ?? block.sourceQuestionId ?? null,
              challengeId: block.challengeId ?? null,
              classChallengeId: block.classChallengeId ?? null,
              title: block.title || null,
              linkText: link.text,
              context
            });
            current.purpose = classifyPurpose({ kind, linkTexts: current.linkTexts, context, url });
            map.set(key, current);
          }
        }
      }
    }
  }
  return [...map.values()].map((item, index) => ({ index: index + 1, ...item }));
}

function markdown(items) {
  let out = "# Daily Attachments\n\n";
  out += "Links extracted from teacher-provided daily challenge content and exercises. Submission links are excluded.\n\n";
  const byLesson = Map.groupBy ? Map.groupBy(items, (item) => item.lessonKey) : null;
  const groups = byLesson || items.reduce((m, item) => (m.set(item.lessonKey, [...(m.get(item.lessonKey) || []), item]), m), new Map());
  for (const [lessonKey, list] of [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }))) {
    out += `## ${lessonKey}\n\n`;
    for (const item of list) {
      out += `- ${item.kind}: ${item.url}\n`;
      if (item.linkTexts?.length) out += `  - Link text: ${item.linkTexts.join(" | ")}\n`;
      if (item.purpose) out += `  - Purpose: ${item.purpose}\n`;
      out += `  - Status: ${item.downloadStatus}${item.localFile ? ` -> \`${item.localFile}\`` : ""}\n`;
      if (item.textFile) out += `  - Text export: \`${item.textFile}\`\n`;
      if (item.textNote) out += `  - Text note: ${item.textNote}\n`;
      if (item.note) out += `  - Note: ${item.note}\n`;
      const source = item.sources[0];
      if (source?.context) out += `  - Context: ${source.context.replace(/\n/g, " ").slice(0, 220)}\n`;
    }
    out += "\n";
  }
  return out;
}

async function main() {
  const attachmentsDir = join(DAILY, "attachments");
  mkdirSync(attachmentsDir, { recursive: true });
  const items = collectLinks();
  const images = imageIndex();
  for (const item of items) {
    if (useExistingImage(item, images)) continue;
    const lessonDir = join(attachmentsDir, item.lessonKey);
    mkdirSync(lessonDir, { recursive: true });
    await tryDownload(item, lessonDir);
  }
  const summary = {
    generatedAt: new Date().toISOString(),
    total: items.length,
    downloaded: items.filter((item) => item.downloadStatus === "downloaded").length,
    textDownloaded: items.filter((item) => item.textDownloadStatus === "downloaded").length,
    manual: items.filter((item) => ["needs-manual-download", "folder-not-downloadable", "not-downloadable", "failed", "too-large"].includes(item.downloadStatus)).length,
    items
  };
  writeJson(join(DAILY, "attachments.json"), summary);
  writeFileSync(join(DAILY, "attachments.md"), markdown(items), "utf8");
  console.log(JSON.stringify({ total: summary.total, downloaded: summary.downloaded, textDownloaded: summary.textDownloaded, manual: summary.manual }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
