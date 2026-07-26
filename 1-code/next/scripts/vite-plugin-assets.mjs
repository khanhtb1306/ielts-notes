// next/scripts/vite-plugin-assets.mjs
//
// Serves binary assets (audio + images) from grouped repo folders during
// development, and copies them into `dist/` at build time.
//
// Browser URLs are kept stable (so generated data needs no change), but the
// on-disk source folders were regrouped:
//   /audio/daily/lesson-XX/*.mp3          ← 3-daily/audio/lesson-XX/*.mp3
//   /audio/*.{mp3,wav,m4a,ogg}            ← 2-notes/audio/*
//   /source/daily/lesson-XX/images/*      ← 3-daily/lessons/lesson-XX/images/*
//   /final/google-doc-pre-course/*        ← 4-final/google-doc-pre-course/*

import { createReadStream, existsSync, statSync, cpSync, readdirSync } from "node:fs"
import { join, dirname, extname, normalize, sep } from "node:path"
import { fileURLToPath } from "node:url"

const HERE = dirname(fileURLToPath(import.meta.url))
const NEXT_ROOT = dirname(HERE)
// NEXT_ROOT is 1-code/next; repo root is two levels up.
const REPO_ROOT = dirname(dirname(NEXT_ROOT))

// Map stable browser URL prefixes → regrouped on-disk base folders.
// Order matters: more specific prefixes (e.g. /audio/daily/) come first.
const URL_MAP = [
  { prefix: "/audio/daily/", base: join(REPO_ROOT, "3-daily", "audio") },
  { prefix: "/audio/", base: join(REPO_ROOT, "2-notes", "audio") },
  { prefix: "/source/daily/", base: join(REPO_ROOT, "3-daily", "lessons") },
  { prefix: "/final/google-doc-pre-course/", base: join(REPO_ROOT, "4-final", "google-doc-pre-course") },
]

const MIME = {
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".json": "application/json; charset=utf-8",
}

function resolveAsset(pathname) {
  let decoded
  try {
    decoded = decodeURIComponent(pathname)
  } catch {
    return null
  }
  const entry = URL_MAP.find((m) => decoded.startsWith(m.prefix))
  if (!entry) return null
  // Only allow known media/image extensions.
  const ext = extname(decoded).toLowerCase()
  if (!MIME[ext]) return null
  // Extra guard for daily lessons: only .../images/ is exposed.
  if (entry.prefix === "/source/daily/" && !/\/images\//.test(decoded)) return null
  // Final teacher packet assets are intentionally exposed for offline review.
  if (entry.prefix === "/final/google-doc-pre-course/") {
    const okFinal =
      /\/images\//.test(decoded) ||
      /\/audio\//.test(decoded) ||
      /\/suggested-vocab\//.test(decoded) ||
      /\.(md|txt|json|docx)$/i.test(decoded)
    if (!okFinal) return null
  }

  const rel = decoded.slice(entry.prefix.length)
  const abs = normalize(join(entry.base, rel))
  // Prevent path traversal — resolved path must stay inside its base folder.
  if (!abs.startsWith(entry.base + sep) && abs !== entry.base) return null
  return abs
}

export function assetsPlugin() {
  return {
    name: "ielts-assets",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next()
        const url = req.url.split("?")[0]
        const resolved = resolveAsset(url)
        if (!resolved) return next()
        if (!existsSync(resolved)) {
          res.statusCode = 404
          res.end("Not found: " + url)
          return
        }
        const ext = extname(resolved).toLowerCase()
        const mime = MIME[ext] || "application/octet-stream"
        const stat = statSync(resolved)
        res.setHeader("Content-Type", mime)
        res.setHeader("Content-Length", String(stat.size))
        res.setHeader("Accept-Ranges", "bytes")
        res.setHeader("Cache-Control", "public, max-age=3600")
        createReadStream(resolved).pipe(res)
      })
    },
    writeBundle(options) {
      const distDir = options.dir || join(NEXT_ROOT, "dist")
      // Notes reflex audio (2-notes/audio) → dist/audio/*
      const notesAudioSrc = join(REPO_ROOT, "2-notes", "audio")
      if (existsSync(notesAudioSrc)) {
        cpSync(notesAudioSrc, join(distDir, "audio"), { recursive: true })
      }
      // Daily lesson audio (3-daily/audio) → dist/audio/daily/*
      const dailyAudioSrc = join(REPO_ROOT, "3-daily", "audio")
      if (existsSync(dailyAudioSrc)) {
        cpSync(dailyAudioSrc, join(distDir, "audio", "daily"), { recursive: true })
      }
      // Daily lesson images (3-daily/lessons/*/images) → dist/source/daily/*/images
      const dailyRoot = join(REPO_ROOT, "3-daily", "lessons")
      if (existsSync(dailyRoot)) {
        for (const lesson of readdirSync(dailyRoot)) {
          const imagesSrc = join(dailyRoot, lesson, "images")
          if (!existsSync(imagesSrc)) continue
          const imagesDest = join(distDir, "source", "daily", lesson, "images")
          cpSync(imagesSrc, imagesDest, { recursive: true })
        }
      }
      // Final teacher packet (4-final) → dist/final/google-doc-pre-course/*
      const finalSrc = join(REPO_ROOT, "4-final")
      const finalDest = join(distDir, "final")
      if (existsSync(finalSrc)) {
        cpSync(finalSrc, finalDest, { recursive: true })
      }
      console.log("[assets-plugin] Copied audio + images + final packet into dist/")
    },
  }
}
