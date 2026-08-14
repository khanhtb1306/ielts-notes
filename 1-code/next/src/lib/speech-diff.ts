const ONES = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen",
]
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"]

/** Đọc số theo kiểu British English: 169 -> "one hundred and sixty nine". */
function numberToWords(n: number): string {
  if (!Number.isFinite(n) || n < 0) return String(n)
  if (n < 20) return ONES[n]
  if (n < 100) {
    const t = TENS[Math.floor(n / 10)]
    const r = n % 10
    return r ? `${t} ${ONES[r]}` : t
  }
  if (n < 1000) {
    const h = `${ONES[Math.floor(n / 100)]} hundred`
    const r = n % 100
    return r ? `${h} and ${numberToWords(r)}` : h
  }
  if (n < 1_000_000) {
    const th = `${numberToWords(Math.floor(n / 1000))} thousand`
    const r = n % 1000
    if (!r) return th
    return r < 100 ? `${th} and ${numberToWords(r)}` : `${th} ${numberToWords(r)}`
  }
  return String(n)
}

/** Năm đọc theo cặp: 2001 -> "two thousand and one", 1998 -> "nineteen ninety eight". */
function yearVariants(n: number): string[] {
  const out = [numberToWords(n)]
  if (n >= 1100 && n <= 1999) {
    const hi = Math.floor(n / 100)
    const lo = n % 100
    out.push(lo === 0 ? `${numberToWords(hi)} hundred` : `${numberToWords(hi)} ${numberToWords(lo)}`)
  }
  return out
}

function expandNumbers(raw: string) {
  return raw.replace(/\d+/g, (m) => {
    const n = Number(m)
    if (!Number.isFinite(n)) return m
    if (m.length === 4) return yearVariants(n)[0]
    return numberToWords(n)
  })
}

/**
 * Chuẩn hoá để so sánh: bỏ dấu câu, gạch ngang thành khoảng trắng,
 * số thành chữ, hạ chữ thường.
 */
export function normalizeForCompare(raw: string) {
  return expandNumbers(raw.toLowerCase())
    .replace(/[’‘]/g, "'")
    .replace(/[-–—/]/g, " ")
    .replace(/[^a-z0-9'\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function tokenize(raw: string): string[] {
  const n = normalizeForCompare(raw)
  return n ? n.split(" ") : []
}

export type DiffState = "match" | "missing" | "extra"

export interface DiffToken {
  text: string
  state: DiffState
}

export interface DiffResult {
  tokens: DiffToken[]
  matched: number
  missing: number
  extra: number
  total: number
  accuracy: number
}

/**
 * So khớp từng từ giữa bài mẫu và câu người học nói (LCS).
 * - match   : nói đúng
 * - missing : có trong bài mẫu nhưng chưa nói
 * - extra   : nói thêm, không có trong bài mẫu
 */
export function diffWords(sample: string, said: string): DiffResult {
  const a = tokenize(sample)
  const b = tokenize(said)
  const la = a.length
  const lb = b.length

  const dp: number[][] = Array.from({ length: la + 1 }, () => new Array<number>(lb + 1).fill(0))
  for (let i = la - 1; i >= 0; i--) {
    for (let j = lb - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }

  const tokens: DiffToken[] = []
  let i = 0
  let j = 0
  let matched = 0
  let missing = 0
  let extra = 0

  while (i < la && j < lb) {
    if (a[i] === b[j]) {
      tokens.push({ text: a[i], state: "match" })
      matched++
      i++
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      tokens.push({ text: a[i], state: "missing" })
      missing++
      i++
    } else {
      tokens.push({ text: b[j], state: "extra" })
      extra++
      j++
    }
  }
  while (i < la) {
    tokens.push({ text: a[i], state: "missing" })
    missing++
    i++
  }
  while (j < lb) {
    tokens.push({ text: b[j], state: "extra" })
    extra++
    j++
  }

  return {
    tokens,
    matched,
    missing,
    extra,
    total: la,
    accuracy: la === 0 ? 0 : Math.round((matched / la) * 100),
  }
}
