# Phase 8 — Fill Curriculum Gaps

_Actions applied per Phase 3 pedagogical assessment._

## Changes

### 1. Added missing note: `word-classes` (HIGH priority)

- **File**: [source/grammar/00-word-classes.md](../source/grammar/00-word-classes.md)
- **Content**: ~200-line note dạy 4 loại từ N/V/Adj/Adv, suffix nhận diện, common mistake VN, mini practice 6 câu.
- **Frontmatter**: `lessons: Lesson 6-15` (bao trùm giai đoạn grammar).
- **Priority**: High.
- Đã cleared `needsNotes: true` flag trong `topicLabels.word-classes`.

### 2. Note frontmatter `lessons` accuracy fix

Update mapping để badge "Lesson X" trên Notes page chính xác hơn với daily coverage:

- `04-collocations.md`: `Lesson 2-5` → `Lesson 1-5` (L1 cũng dạy DO collocations).
- `03-family.md`: `Lesson 9` → `Lesson 4-9` (family exercises phân bố L4-L14 với peak L4-L9).
- `09-food-restaurant.md`: `Lesson 15` → `Lesson 13-15` (food xuyên suốt 3 lesson cuối).

### 3. `07-weekend.md` → surface `hobbies` topic mapping

Không rename file (giữ tương thích), nhưng update:

- `title: Weekend / Free time` → `title: Hobbies · Weekend & Free time`
- Add opening paragraph explaining: "Chủ đề `hobbies` trong Speaking bank tương ứng với note này."
- `lessons: Lesson 13` → `Lesson 12-13` (L12 challenge = Free time at home).

Bây giờ khi user vào topic-detail `hobbies` (Speaking bank), chưa link trực tiếp qua note markdown (app không có cross-link Notes→Topic), nhưng note title đã nêu rõ topic mapping.

## Kết quả

- Notes total: 25 → 26 files.
- Curriculum findings: 3 → 3 (unchanged — 3 finding còn lại là by-design gap):
  1. `hometown` note không có daily question — expected (pure speaking topic).
  2. `daily-routine` note không có daily question — expected.
  3. `word-classes` note vừa thêm cũng chưa có daily question — expected (meta-topic).
  Cả 3 topic này vẫn dùng speakingQuestions bank trong Final Speaking Test và cung cấp lý thuyết cho các bài practice ở chủ đề chi tiết hơn.
- Bundle syntax check: pass.

## Chưa làm (deferred)

- **`lesson-misc` overview note**: Phase 3 flagged "thiếu note". Skip vì đây là review/break lesson, không cần lý thuyết mới. Nếu user muốn viết roadmap note cho tuần cuối, xin phép trong Phase 9.
- **`practicePresets` regenerate**: `word-classes` topic có preset 22% nhưng 0 daily question. Preset chạy vẫn OK vì `samplePool` auto-redistribute — nhưng ideally cần tag một số câu adjectives/adverbs với `word-classes` để tận dụng bank. Cần user OK trước khi override — nhiều loại thay đổi.
