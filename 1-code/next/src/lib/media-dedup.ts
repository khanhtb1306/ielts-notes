import type { ImageRef, AudioRef } from "@/types/content"

/**
 * Extract src values from every <img>/<audio>/<source> tag in an HTML string.
 * Returns a set with both the original src AND the base filename, so callers
 * can match refs by either path form.
 */
function extractMediaSrcs(html: string, tags: RegExp): Set<string> {
  const set = new Set<string>()
  if (!html) return set
  const re = new RegExp(`<(?:${tags.source})[^>]*\\ssrc=["']([^"']+)["']`, "gi")
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    const raw = m[1]
    set.add(raw)
    const clean = raw.split(/[?#]/)[0]
    set.add(clean)
    const filename = clean.split("/").pop()
    if (filename) set.add(filename)
  }
  return set
}

function refInHtml(ref: { url?: string | null; localFile?: string | null }, inHtml: Set<string>): boolean {
  const candidates = [ref.localFile, ref.url].filter(Boolean) as string[]
  for (const src of candidates) {
    if (inHtml.has(src)) return true
    const clean = src.split(/[?#]/)[0]
    if (inHtml.has(clean)) return true
    const filename = clean.split("/").pop()
    if (filename && inHtml.has(filename)) return true
    // Loose match: any HTML src ends with this filename.
    if (filename) {
      for (const htmlSrc of inHtml) {
        if (htmlSrc.endsWith("/" + filename) || htmlSrc === filename) return true
      }
    }
  }
  return false
}

export function dedupImageRefs(html: string | undefined | null, refs: ImageRef[]): ImageRef[] {
  if (!refs?.length) return []
  const inHtml = extractMediaSrcs(html || "", /img/)
  if (inHtml.size === 0) return refs
  return refs.filter((r) => !refInHtml(r, inHtml))
}

export function dedupAudioRefs(html: string | undefined | null, refs: AudioRef[]): AudioRef[] {
  if (!refs?.length) return []
  const inHtml = extractMediaSrcs(html || "", /audio|source/)
  if (inHtml.size === 0) return refs
  return refs.filter((r) => !refInHtml(r, inHtml))
}
