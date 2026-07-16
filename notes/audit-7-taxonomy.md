# Phase 7 — Taxonomy Consistency Audit + Fix

_Applied fixes to `source/daily/topics-map.json` reflecting Phase 3 findings + noise reduction from broad `noteKeywords`._

## TL;DR

- Kết quả: **curriculum findings 13 → 3, media findings 39 → 20**.
- Bundle build xanh, syntax check pass, 106/140 blocks + 247/318 questions vẫn được tag (giảm nhẹ 2 blocks + 2 questions vì bỏ tag trùng).
- `topicsIndex` size 84.2KB (tăng 9KB vì thêm domain keyword catch, thêm refs cho appearance/hobbies/health-illness).

## Changes applied

### 1. Trimmed broad single-word `noteKeywords`

Bỏ các keyword quá phổ quát gây false-positive M6/M7 và over-tag `review` role:

- `"present"` — matches "at present", "presently".
- `"past"` — matches "in the past", "past exam".
- `"future"` — matches "in the future".
- `"will"` — matches auxiliary "will" trong mọi câu.
- `"going to"` — matches "going to the library" (preposition).
- `"time"` — matches "sometimes", "some time", "time it right".

### 2. Added tighter compound + domain keywords

Bổ sung để catch content thực tế cover speaking topics thay vì chỉ dựa vào challenge.note generic:

- `"telling time"` → `reading-stress-time` (L5)
- `"be going to"` → `future-tenses` (compound safe)
- `"future tenses"` → `future-tenses` (compound safe)
- `"describing people"`, `"clothes"`, `"appearance"` → `appearance` (L7-L8 content)
- `"free time"`, `"weekend"`, `"entertainment"` → `hobbies` (L12-L13 content)
- `"kitchen"`, `"bedroom"`, `"living room"` → `house` (L10-L12 content)
- `"vacation"`, `"holidays"` → `trip` (L13-L14 content)
- `"stressed"`, `"headache"`, `"toothache"` → `health-illness` (L15 vocab)

### 3. Fixed `lessonTopicHints` per Phase 3 pedagogical assessment

| Lesson | Before | After | Reason |
|--------|--------|-------|--------|
| lesson-06 | `[nouns-quantifiers]` | `[nouns-quantifiers, job]` | L6 dạy job vocab + 8 job questions |
| lesson-07 | `[nouns-quantifiers, job]` | `[nouns-quantifiers, appearance]` | L7 dạy clothes/describing people, không phải job |
| lesson-09 | `[adjectives, family]` | `[adjectives, personality]` | Challenge note "Speaking (Personality)" |
| lesson-10 | `[articles-determiners, personality]` | `[articles-determiners, house]` | L10 dạy "Objects in the house" |
| lesson-11 | `[prepositions]` | `[prepositions, house]` | Challenge note "Speaking (House, room)" |
| lesson-12 | `[present-tenses, house]` | `[present-tenses, hobbies]` | Challenge note "Free time at home, Entertainment" |
| lesson-13 | `[past-tenses, hobbies]` | `[past-tenses, trip]` | Challenge note "Vacation, Travelling" |
| lesson-14 | `[future-tenses, trip]` | `[future-tenses]` | L14 = Shopping, không phải trip |

## Impact — Coverage improvements

| Topic | Blocks tagged (before → after) | Questions tagged (before → after) |
|-------|-------------------------------|-----------------------------------|
| `appearance` | 0 → 6 blocks (L7, L8, L14) | 0 → 54 questions (L3, L5, L7, L8, L12, L14) |
| `hobbies` | 0 → có blocks | 2 → có thêm questions |
| `health-illness` | 0 → 2 blocks (L1, L14) | 0 → 6 questions (L1, L4, L7, L9, L10) |
| `trip` | patchy → nhiều hơn ở L15 |  |

## Remaining findings (không phải bug)

### X1 — Topic pure speaking không có daily practice questions (2)

- `hometown`: có note nhưng speakingQuestions bank là output duy nhất (daily không có questions về hometown).
- `daily-routine`: tương tự.

Đây là **by-design**: speaking topics đặc trưng cho Final Speaking Test bank, không phải daily exercises. Không cần fix code, chỉ ghi rõ trong topic-detail UI (đã có "Bộ câu hỏi Final Test" section).

### X4 — `word-classes: needsNotes` — chưa có note

Sẽ được xử lý trong Phase 8 (viết `source/grammar/00-word-classes.md`).

## Files modified

- [source/daily/topics-map.json](../source/daily/topics-map.json) — noteKeywords + lessonTopicHints.

## Verification

- `npm run build` xanh: 106 blocks / 247 questions tagged (từ 108 / 249 → giảm 2 do bỏ tag trùng của single-word keywords).
- Bundle syntax check pass.
- No regression in existing tests (không có test suite).
