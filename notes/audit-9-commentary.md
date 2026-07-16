# Phase 9 — Teacher Commentary Layer

_Light-touch pedagogical framing added to notes lacking pedagogical intro._

## Changes

### 1. Grammar notes — "Vì sao bài này quan trọng" prepended (9/9)

Added 1-2-line teacher framing at top of each grammar note, right after H1 heading, linking mỗi topic đến specific IELTS skill/section:

- [01-nouns-quantifiers.md](../source/grammar/01-nouns-quantifiers.md) → Writing Task 1/2 khung sườn câu; countable/uncountable lỗi Band 4-5.
- [02-pronouns.md](../source/grammar/02-pronouns.md) → Speaking/Writing cohesion — bỏ lặp danh từ để lên Band 5.5+.
- [03-adjectives.md](../source/grammar/03-adjectives.md) → Speaking Part 1-2 describe people; OSASCOMP order + `-ed`/`-ing`.
- [04-articles-determiners.md](../source/grammar/04-articles-determiners.md) → Writing GRA (Grammatical Range & Accuracy); `a/an/the` lỗi phổ biến nhất VN.
- [05-prepositions.md](../source/grammar/05-prepositions.md) → Task 1 map/process; `in/on/at` lỗi Band 4.5.
- [06-present-tenses.md](../source/grammar/06-present-tenses.md) → Speaking Part 1 70%.
- [07-past-tenses.md](../source/grammar/07-past-tenses.md) → Speaking Part 2 kể chuyện quá khứ.
- [08-future-tenses.md](../source/grammar/08-future-tenses.md) → Speaking Part 3 speculation.
- [09-modal-verbs.md](../source/grammar/09-modal-verbs.md) → Writing Task 2 opinion + Speaking Part 3.

### 2. Pronunciation notes — teacher intro added (4/4)

- [01-vowels.md](../source/pronunciation/01-vowels.md) → Speaking + Listening cặp min-pair (sheep/ship).
- [02-consonants.md](../source/pronunciation/02-consonants.md) → 3 âm khó cho VN: `/θ/`, `/ð/`, `/ʃ/`.
- [03-reading-stress-time.md](../source/pronunciation/03-reading-stress-time.md) → Pronunciation 25% điểm Speaking.
- [04-collocations.md](../source/pronunciation/04-collocations.md) → Lexical Resource.

### 3. Speaking notes — NOT modified

Speaking notes hầu như đã có framing inherent (Q&A structure) + intro paragraph mô tả chủ đề. Không add teacher note để tránh dài dòng.

### 4. Common mistakes section

- **Đã có sẵn** trong grammar notes qua `> [!warn] Bẫy thường gặp` callouts (đã có từ trước).
- Notes speaking mới (hometown, daily-routine, health-illness, word-classes) đã có section "Common Mistakes" từ trước.
- **Skip** thêm section thứ hai để tránh trùng lặp.

## Deferred (không apply)

Các cải tiến sau **có giá trị nhưng cần schema migration + code change** — chưa apply mà log lại cho user quyết định trong lần tiếp theo:

- **Prereq badge trên Daily card**: cần thêm `prereqNotes` field vào `manifest.json` hoặc `topics-map.json > topicLabels[key].prereqNotes`, update [build.mjs](../build.mjs) `clientData`, và render badge trong [web/daily.js](../web/daily.js) `dailyIndexPage`. Log vào NOTES-FOR-USER.
- **"Giáo viên nói gì" section trong topic-detail**: cần `topicLabels[key].teacherNote` field, update [web/topics.js](../web/topics.js) `topicDetailPage`. Log vào NOTES-FOR-USER.
- **Lesson-misc overview note**: skip (đây là break/review, không cần lý thuyết).

## Verification

- `npm run build`: xanh, 26 notes docs (từ 26 — không đổi).
- Bundle syntax check: pass.

## Kết luận

Grammar + Pronunciation notes giờ có **teacher hat framing** ngay đầu → học viên hiểu ngay "vì sao đọc note này" trước khi vào chi tiết.
