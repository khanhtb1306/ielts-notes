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

export function ttsSupported(): boolean {
  return typeof window !== "undefined" && !!window.speechSynthesis
}

/**
 * Quality order for English voices. Notes use British English, so BrE voices win,
 * then modern "Natural/Neural" engines, then anything English. Without this the
 * browser hands back an arbitrary voice — often a robotic legacy one.
 */
const VOICE_PREFERENCE: RegExp[] = [
  /google uk english female/i,
  /google uk english/i,
  /microsoft (libby|sonia|ryan).*natural/i,
  /\b(natural|neural)\b.*\ben-?gb\b/i,
  /en-?gb/i,
  /google us english/i,
  /\b(natural|neural)\b/i,
  /google.*english/i,
]

/** Best available English voice name, or "" when nothing sensible exists. */
export function preferredVoiceName(voices: SpeechSynthesisVoice[] = getEnglishVoices()): string {
  for (const re of VOICE_PREFERENCE) {
    const hit = voices.find((v) => re.test(v.name) || re.test(v.lang))
    if (hit) return hit.name
  }
  return voices[0]?.name || ""
}

export function speak(text: string, voiceName?: string, rate = 0.9): boolean {
  if (typeof window === "undefined" || !window.speechSynthesis) return false
  if (!text.trim()) return false
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  const enVoices = getEnglishVoices()
  const name = voiceName || preferredVoiceName(enVoices)
  const voice = enVoices.find((v) => v.name === name)
  if (voice) {
    u.voice = voice
    u.lang = voice.lang
  } else {
    u.lang = "en-GB"
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
