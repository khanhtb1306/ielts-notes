// Build script: gộp source/**/*.md + web/enrich/*.json + web/{template,styles,app}
// -> sinh index.html self-contained (mở offline bằng file:// vẫn chạy, không cần server).
// Nguồn nội dung DUY NHẤT là source/*.md. Không sửa index.html bằng tay.
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, "source");
const WEB = join(ROOT, "web");
const ENRICH = join(WEB, "enrich");

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

function orderOf(file) {
  const n = basename(file).match(/^(\d+)/);
  return n ? parseInt(n[1], 10) : 999;
}

function loadDir(type) {
  const dir = join(SRC, type);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort((a, b) => orderOf(a) - orderOf(b))
    .map((f) => {
      const raw = readFileSync(join(dir, f), "utf8");
      const { data, body } = parseFrontmatter(raw);
      return {
        id: basename(f, ".md"),
        type,
        title: data.title || basename(f, ".md"),
        vi: data.vi || "",
        lesson: data.lesson || data.lessons || "",
        priority: data.priority || "",
        file: `source/${type}/${f}`,
        markdown: body.trim(),
      };
    });
}

function readJson(name, fallback) {
  const p = join(ENRICH, name);
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : fallback;
}

const data = {
  docs: [...loadDir("pronunciation"), ...loadDir("grammar"), ...loadDir("speaking")],
  meta: readJson("meta.json", {}),
  audio: readJson("audio.json", []),
  ipa: readJson("ipa.json", {}),
};

const template = readFileSync(join(WEB, "template.html"), "utf8");
const styles = readFileSync(join(WEB, "styles.css"), "utf8");
const app = readFileSync(join(WEB, "app.js"), "utf8");

const html = template
  .replace("/*__STYLES__*/", () => styles)
  .replace(
    "/*__DATA__*/",
    () => "window.__DATA__ = " + JSON.stringify(data) + ";"
  )
  .replace("/*__APP__*/", () => app);

writeFileSync(join(ROOT, "index.html"), html, "utf8");
console.log(
  `Built index.html: ${data.docs.length} docs, ${data.audio.length} audio entries.`
);
