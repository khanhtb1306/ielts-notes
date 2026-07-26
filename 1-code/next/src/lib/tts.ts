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

export function speak(text: string, voiceName?: string, rate = 0.9): boolean {
  if (typeof window === "undefined" || !window.speechSynthesis) return false
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  const enVoices = getEnglishVoices()
  const voice = voiceName ? enVoices.find((v) => v.name === voiceName) : enVoices[0]
  if (voice) u.voice = voice
  u.lang = "en-US"
  u.rate = rate
  window.speechSynthesis.speak(u)
  return true
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
