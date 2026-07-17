// scripts/normalize-contractions.mjs
//
// Quét toàn bộ source/daily/lesson-*/exercises.json và với mỗi
// submission.correctAnswer.input_N array:
//   1. Trim leading/trailing spaces trong từng biến thể.
//   2. Với mỗi biến thể chứa contraction (don't, won't, ...) hoặc full form
//      (do not, will not, ...), tự động thêm biến thể chuyển đổi tương ứng.
//   3. Dedupe.
//
// Chỉ xử lý contraction UNAMBIGUOUS (bỏ 's/'d vì có 2 nghĩa is/has hoặc had/would).
// Idempotent — chạy nhiều lần không sinh thêm variant.

import fs from "node:fs"
import path from "node:path"

const ROOT = path.resolve("source/daily")

// Cặp contraction ↔ full form. Chỉ list các cặp KHÔNG ambiguous.
const PAIRS = [
  ["don't", "do not"],
  ["doesn't", "does not"],
  ["didn't", "did not"],
  ["won't", "will not"],
  ["wouldn't", "would not"],
  ["shouldn't", "should not"],
  ["couldn't", "could not"],
  ["can't", "cannot"],
  ["mustn't", "must not"],
  ["mightn't", "might not"],
  ["needn't", "need not"],
  ["shan't", "shall not"],
  ["oughtn't", "ought not"],
  ["isn't", "is not"],
  ["aren't", "are not"],
  ["wasn't", "was not"],
  ["weren't", "were not"],
  ["hasn't", "has not"],
  ["haven't", "have not"],
  ["hadn't", "had not"],
  ["I'm", "I am"],
  ["I've", "I have"],
  ["I'll", "I will"],
  ["you're", "you are"],
  ["you've", "you have"],
  ["you'll", "you will"],
  ["we're", "we are"],
  ["we've", "we have"],
  ["we'll", "we will"],
  ["they're", "they are"],
  ["they've", "they have"],
  ["they'll", "they will"],
  ["he'll", "he will"],
  ["she'll", "she will"],
  ["it'll", "it will"],
  ["let's", "let us"],
]

// Build both directions: contraction → full, và full → contraction.
// Preserve casing when swapping.
function swapVariants(str) {
  const variants = new Set()
  for (const [a, b] of PAIRS) {
    // Try replace a → b (case-insensitive, whole-word)
    const reA = new RegExp(`(^|[\\s(])${escapeRegex(a)}(?=$|[\\s.,!?)])`, "i")
    const mA = str.match(reA)
    if (mA) {
      const replaced = str.replace(reA, (m, pre) => pre + preserveCase(m.slice(pre.length), b))
      if (replaced !== str) variants.add(replaced)
      continue // đã swap 1 lần, không cần thử full→contract cho cùng string
    }
    const reB = new RegExp(`(^|[\\s(])${escapeRegex(b)}(?=$|[\\s.,!?)])`, "i")
    const mB = str.match(reB)
    if (mB) {
      const replaced = str.replace(reB, (m, pre) => pre + preserveCase(m.slice(pre.length), a))
      if (replaced !== str) variants.add(replaced)
    }
  }
  return [...variants]
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function preserveCase(src, tgt) {
  // Preserve simple casing: if src starts uppercase, capitalize tgt's first char.
  if (!src || !tgt) return tgt
  const firstChar = src.replace(/^\W+/, "")[0]
  if (firstChar && firstChar === firstChar.toUpperCase()) {
    return tgt.charAt(0).toUpperCase() + tgt.slice(1)
  }
  return tgt
}

let filesChanged = 0
let totalAdds = 0
let totalTrims = 0
const perLesson = {}

const lessons = fs
  .readdirSync(ROOT)
  .filter((n) => fs.statSync(path.join(ROOT, n)).isDirectory() && n.startsWith("lesson-"))
  .sort()

for (const lessonKey of lessons) {
  const file = path.join(ROOT, lessonKey, "exercises.json")
  if (!fs.existsSync(file)) continue
  const raw = fs.readFileSync(file, "utf-8")
  const data = JSON.parse(raw)
  let changed = false
  let addsHere = 0
  let trimsHere = 0

  for (const q of data.questions || []) {
    const sub = q.submission
    if (!sub || !sub.correctAnswer || typeof sub.correctAnswer !== "object") continue
    if (Array.isArray(sub.correctAnswer)) continue // single-choice / multi-select — skip
    for (const key of Object.keys(sub.correctAnswer)) {
      const arr = sub.correctAnswer[key]
      if (!Array.isArray(arr)) continue

      // 1. Trim
      const trimmed = arr.map((v) => {
        if (typeof v !== "string") return v
        const t = v.trim()
        if (t !== v) trimsHere++
        return t
      })

      // 2. Add contraction variants
      const set = new Set(trimmed.filter((v) => typeof v === "string"))
      const originalSize = set.size
      for (const v of [...set]) {
        for (const alt of swapVariants(v)) {
          if (!set.has(alt)) {
            set.add(alt)
            addsHere++
          }
        }
      }

      // 3. Only write back if changed
      const nextArr = [...trimmed.filter((v) => typeof v !== "string"), ...set]
      const nextArrStr = JSON.stringify(nextArr)
      const prevArrStr = JSON.stringify(arr)
      if (nextArrStr !== prevArrStr) {
        sub.correctAnswer[key] = nextArr
        changed = true
      }
      // catch trim-only changes
      if (JSON.stringify(trimmed) !== JSON.stringify(arr) && set.size === originalSize) {
        sub.correctAnswer[key] = trimmed
        changed = true
      }
    }
  }

  if (changed) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf-8")
    filesChanged++
    totalAdds += addsHere
    totalTrims += trimsHere
    perLesson[lessonKey] = { adds: addsHere, trims: trimsHere }
  }
}

console.log(`[normalize-contractions] Files changed: ${filesChanged}/${lessons.length}`)
console.log(`[normalize-contractions] Total variants added: ${totalAdds}`)
console.log(`[normalize-contractions] Total leading/trailing spaces trimmed: ${totalTrims}`)
if (Object.keys(perLesson).length) {
  console.log(`[normalize-contractions] Per lesson:`)
  for (const [k, v] of Object.entries(perLesson)) {
    console.log(`  ${k}: +${v.adds} variants, ${v.trims} trims`)
  }
}
