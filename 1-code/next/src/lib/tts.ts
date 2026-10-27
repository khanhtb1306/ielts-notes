// Speech synthesis + external dictionary lookup helpers.

let cachedVoices: SpeechSynthesisVoice[] = []

function loadVoices() {
  cachedVoices = (window.speechSynthesis?.getVoices() || []).slice()
}

if (typeof window !== "undefined" && window.speechSynthesis) {
  loadVoices()
  window.speechSynthesis.onvoiceschanged = loadVoices
}

export function getEnglishVoices(): SpeechSynthesisVoice[] {
  return cachedVoices.filter((v) => /^en/i.test(v.lang))
}

export type Accent = "en-GB" | "en-US"

/** English voices that match the requested accent, falling back to all if none. */
export function getVoicesForAccent(accent: Accent): SpeechSynthesisVoice[] {
  const en = getEnglishVoices()
  const tag = accent === "en-US" ? /en[-_]?us/i : /en[-_]?gb/i
  const matched = en.filter((v) => tag.test(v.lang) || tag.test(v.name))
  return matched.length ? matched : en
}

export function ttsSupported(): boolean {
  return typeof window !== "undefined" && !!window.speechSynthesis
}

/**
 * Quality order per accent. The matching-accent "Natural/Neural" engine wins,
 * then any voice tagged with that accent, then any modern engine, then anything
 * English. Without this the browser hands back an arbitrary — often robotic —
 * voice.
 */
const ACCENT_PREFERENCE: Record<Accent, RegExp[]> = {
  "en-GB": [
    /google uk english female/i,
    /google uk english/i,
    /microsoft (libby|sonia|ryan).*natural/i,
    /\b(natural|neural)\b.*\ben-?gb\b/i,
    /en-?gb/i,
    /\b(natural|neural)\b/i,
    /google.*english/i,
  ],
  "en-US": [
    /google us english/i,
    /microsoft (aria|jenny|guy|michelle).*natural/i,
    /\b(natural|neural)\b.*\ben-?us\b/i,
    /en-?us/i,
    /\b(natural|neural)\b/i,
    /google.*english/i,
  ],
}

/** Best available voice name for `accent`, or "" when nothing sensible exists. */
export function preferredVoiceName(
  voices: SpeechSynthesisVoice[] = getEnglishVoices(),
  accent: Accent = "en-GB"
): string {
  for (const re of ACCENT_PREFERENCE[accent]) {
    const hit = voices.find((v) => re.test(v.name) || re.test(v.lang))
    if (hit) return hit.name
  }
  return voices[0]?.name || ""
}

export interface SpeakOptions {
  voiceName?: string
  rate?: number
  accent?: Accent
}

/**
 * Central speech entry point. Pass the user's saved prefs (via `useSpeak`) so
 * every "Nghe" button across the app reads with one consistent voice/accent.
 */
export function speak(text: string, opts: SpeakOptions = {}): boolean {
  if (typeof window === "undefined" || !window.speechSynthesis) return false
  if (!text.trim()) return false
  const { voiceName, rate = 0.9, accent = "en-GB" } = opts
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  const enVoices = getEnglishVoices()
  const name = voiceName || preferredVoiceName(enVoices, accent)
  const voice = enVoices.find((v) => v.name === name)
  if (voice) {
    u.voice = voice
    u.lang = voice.lang
  } else {
    u.lang = accent
  }
  u.rate = rate
  window.speechSynthesis.speak(u)
  return true
}

export function stopSpeaking(): void {
  if (ttsSupported()) window.speechSynthesis.cancel()
}

export interface DictResult {
  ipa: string
  audio: string
}

export async function dictLookup(word: string): Promise<DictResult | null> {
  try {
    const res = await fetch(
      "https://api.dictionaryapi.dev/api/v2/entries/en/" + encodeURIComponent(word),
      { cache: "force-cache" }
    )
    if (!res.ok) return null
    const j = await res.json()
    const entry = j[0] || {}
    const ph = entry.phonetics || []
    const audio = ph.map((p: { audio?: string }) => p.audio).filter(Boolean)[0] || ""
    const ipa = entry.phonetic || ph.map((p: { text?: string }) => p.text).filter(Boolean)[0] || ""
    return { ipa, audio }
  } catch {
    return null
  }
}

export function playUrl(url: string): boolean {
  try {
    const el = new Audio(url)
    void el.play()
    return true
  } catch {
    return false
  }
}
