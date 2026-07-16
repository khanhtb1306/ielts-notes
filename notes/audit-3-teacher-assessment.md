# Phase 3 — Pedagogical Assessment (Teacher Hat)

_Manual assessment bổ sung cho [audit-3-curriculum-map.md](audit-3-curriculum-map.md). Nhận định từ góc nhìn giáo viên dạy Pre-IELTS Band 5–6 cho học viên Việt._

## Bức tranh tổng thể

Course structure theo LangGo là 3 giai đoạn rõ rệt:

| Giai đoạn | Lessons | Trọng tâm | Đánh giá pedagogical |
|-----------|---------|-----------|----------------------|
| 1. Pronunciation Foundation | L1–L5 | Vowels, Consonants, IPA reading, Time, Stress. Vocabulary theo cụm (DO/HAVE/GET/GO/TAKE/MAKE). | **Coherent.** Phát âm là nền tảng chuẩn cho Pre-IELTS. Chỉ hơi thiếu: L5 có 5 note tag nhưng exercises của L5 chưa cover `reading-stress-time` → gap thực tế. |
| 2. Grammar Foundations | L6–L11 | Nouns/quantifiers, Pronouns, Adjectives, Articles/Determiners, Prepositions. | **Coherent** nhưng thiếu 1 note quan trọng (`word-classes`). Speaking topic đi kèm mỗi lesson (job, appearance, family, personality, house) chưa được tagger nhận diện vì text bài dùng vocab chuyên biệt, không dùng keyword generic. |
| 3. Tenses + Extended Speaking | L12–L15 + misc | Present, Past, Future, Modals. Speaking mở rộng (entertainment, trip, food, health). | **Coherent** — L15 đặc biệt dày (79 tag hit) vì tổng ôn. `lesson-misc` là buffer review. |

## Đánh giá per lesson

### lesson-01 · Vowels foundation
- **Notes**: `01-vowels.md`, `01-self.md`. Đủ với target lesson (giới thiệu vowels + tự giới thiệu).
- **Study blocks**: 12 tag hit. Có 2 collocations blocks (VOCABULARY: DO) + 3 vowels blocks (phát âm 8 nguyên âm) — đúng ý challenge.note "Vocabulary (do) | Pronunciation (Vowels) | Vocabulary (have)".
- **Exercises**: 16 câu (fill_blank + open_or_video + matching). Tag hits collocations[9] vowels[12] — cân đối.
- **Gap**: Không có note dedicated cho `collocations` (chỉ có `04-collocations.md` tag cho L2-L5). L1 học DO collocations mà học viên phải đọc note của L2 → sequence hơi lệch. **Đề xuất Phase 8**: mở rộng `04-collocations.md` frontmatter thành `lessons: Lesson 1-5` HOẶC tách note riêng cho L1.

### lesson-02 · Vowels + GET / GO
- **Coherent**. 17 câu collocations, 13 câu vowels, dài tay. Note bao đủ.
- **Gap nhỏ**: `04-collocations.md` frontmatter `lessons: Lesson 2-5` — L1 vẫn thiếu như trên.

### lesson-03 · Consonants + TAKE + Everyday things
- **Coherent**. 9 câu collocations + 6 câu consonants + 6 câu vowels ôn.
- **Notes**: đầy đủ.

### lesson-04 · Consonants + MAKE + Talking/Moving verbs
- **Coherent**. Tương tự L3.
- **Note nhỏ**: Có 1 câu adjectives tag ra, 1 câu family, 1 câu trip — có thể là câu ôn tổng hợp. OK.

### lesson-05 · Pronunciation review + Time
- **Coherent** nhưng **gap X5**: `reading-stress-time` là hint core nhưng 0 exercise tag. Trong `challenge.note` có "Listening (Telling time)" và "Pronunciation" — nhưng keyword extractor không match "telling time" (chỉ có `"time":  ["reading-stress-time"]`).
- **Đề xuất Phase 8**: thêm blockOverride/questionOverride tag các câu L5 về `reading-stress-time`, hoặc mở rộng `noteKeywords` với `"telling time"` và `"time"` (đã có "time" nhưng match với "sometimes", "sometime" nên broad quá).

### lesson-06 · Nouns & Quantifiers + Jobs vocab
- **Coherent**. 8 câu tag `job` — thực sự có content về nghề nghiệp.
- **Gap**: hint = `nouns-quantifiers` only (không có `job` trong hints), nhưng có 3 job blocks. Đề xuất add `job` vào `lessonTopicHints[lesson-06]` để tag core.

### lesson-07 · Quantifiers + Clothes + Describing people
- **Study blocks**: chỉ 4 tag hit — thấp so với 63 exercise questions. Vì challenge.note dài (5 challenge) nhưng blocks HTML nghèo chữ (chủ yếu là listening transcript short).
- **Gap X5**: `job` hint nhưng 0 block/question tag. Thực tế L7 có VOCABULARY (clothes) — không phải job. Đề xuất **thay hint** `job` → `appearance` HOẶC `nouns-quantifiers` only. `job` core hơn ở L6.

### lesson-08 · Pronouns + Clothes + Describing people (video)
- **Coherent** cho pronouns. 8 câu pronouns rõ ràng.
- **Gap X5**: `appearance` hint core nhưng 0 tag. Thực tế speaking video challenge yêu cầu describe người. Đề xuất **thêm questionOverride** cho các câu open_or_video có prompt về "describe" → tag `appearance` core.

### lesson-09 · Adjectives + Personality speaking
- **Coherent**. 10 câu adjectives + 3 câu personality.
- **Gap X5**: `family` hint core (`lessonTopicHints[lesson-09]: [adjectives, family]`) nhưng 0 tag `family` block/question. Thực tế L9 có 1 câu family fill_blank được tag. Nhưng challenge.note L9 nói "Speaking (Personality)" không phải family. Đề xuất **thay hint** `family` → `personality`. Note `03-family.md` mapping với L9 cũng nên chuyển sang mapping L4-L5 (nơi có nhiều family exercises).

### lesson-10 · Articles/Determiners + Personality
- **Coherent** cho articles. 11 câu articles + 3 câu personality.
- **Gap X5**: `personality` hint core nhưng 0 tag block/question tag `personality`. Thực tế L10 có 1 block + 3 question về personality (từ challenge.note "Grammar (Determiners)" + "Speaking (Personality)"). Vẫn count! Cần verify nhưng nhìn coverage matrix report thì `personality` có xuất hiện: `blocks: lesson-09(1)`, `questions: lesson-09(3)`. Sai lesson? → **thực chất personality dance ở L9 chứ không L10**. Đề xuất **swap** hints:
  - `lesson-09` hint = `[adjectives, personality]` (thay `family`)
  - `lesson-10` hint = `[articles-determiners, house]` (thay `personality`) — vì L10 study nhiều về "Objects in the house".

### lesson-11 · Prepositions + House review
- **Coherent**. 15 câu prepositions.
- **Nhỏ**: house block/question không cần đưa vào hint (đã cover ở L12).

### lesson-12 · Present tenses + Free time at home
- **Coherent**. 7 câu present tenses + 8 câu house.
- **Ghi chú**: challenge note "Speaking (Entertainment, Family, House)" — không rõ có bao gồm `hobbies` không? Nếu có thì thêm hint.

### lesson-13 · Past tenses + Vacations + Travelling
- **Coherent**. 6 câu past tenses + 8 câu trip.
- **Gap X5**: `hobbies` hint core nhưng 0 tag. Thực tế L13 speaking = "Travelling" không phải hobbies. Đề xuất **thay hint** `hobbies` → `trip`. `hobbies` topic đã có 7Q trong speakingQuestions bank — nên map về L12 (Free time) hoặc L14 (Shopping).
- **Note gap**: `07-weekend.md` (frontmatter `lessons: Lesson 13`) → nhưng topicGuess không match `hobbies` vì filename slug là "weekend". Note thực tế content là hobbies (movies, books, sports). **Đề xuất**: đổi tên file `07-weekend.md` → `07-hobbies.md` HOẶC thêm `topic: hobbies` frontmatter (breaking schema) HOẶC (simplest) thêm dòng đầu note "Chủ đề: Hobbies & Free time" để keyword "hobb" match.

### lesson-14 · Future tenses + Shopping
- **Coherent**. 5 câu future.
- **Nhỏ**: `trip` hint có tag nhưng L14 challenge = "Shops, shopping" không phải trip. Đề xuất thay hint `trip` → `future-tenses` only (2 hint là dư).

### lesson-15 · Modal verbs + Trip + Restaurants + Health
- **Rất dày và coherent**. L15 là tổng ôn: 19 câu modal + 20 câu food + 2 câu trip.
- **Notes**: đủ 3 note (modal, food, health).
- **Xuất sắc** cho pedagogical arc.

### lesson-misc · Review/Break
- **Thiếu note markdown** (`notes markdown 0`). Cover matrix cho thấy các câu ôn tổng hợp: 12 single_choice + 13 multi_select + 21 fill_blank + 30 open_or_video. Đây là bài ôn cuối khoá.
- **Đề xuất Phase 8/9**: thêm 1 note `13-final-review.md` (hoặc tương tự) framing "Tuần cuối: kiểm tra tổng hợp" — dạng roadmap cho học viên tự ôn.

## Actionable summary (input cho Phase 7 + Phase 8)

### Fix `lessonTopicHints` (Phase 7)

Bảng thay đổi đề xuất:

| Lesson | Hiện tại | Đề xuất | Lý do |
|--------|----------|---------|-------|
| lesson-06 | `[nouns-quantifiers]` | `[nouns-quantifiers, job]` | L6 có 3 job blocks + 8 job questions thật |
| lesson-07 | `[nouns-quantifiers, job]` | `[nouns-quantifiers, appearance]` | L7 dạy clothes/describing people, không phải job |
| lesson-09 | `[adjectives, family]` | `[adjectives, personality]` | Challenge.note nói "Speaking (Personality)" |
| lesson-10 | `[articles-determiners, personality]` | `[articles-determiners, house]` | L10 dạy "Objects in the house" |
| lesson-12 | `[present-tenses, house]` | `[present-tenses, hobbies]` | Challenge.note "Free time at home, Entertainment" = hobbies |
| lesson-13 | `[past-tenses, hobbies]` | `[past-tenses, trip]` | Challenge.note "Vacation, Travelling" |
| lesson-14 | `[future-tenses, trip]` | `[future-tenses]` (bỏ trip) | L14 = Shopping, không phải trip |
| lesson-15 | `[modal-verbs, food-restaurant]` | `[modal-verbs, food-restaurant, health-illness]` | L15 cover cả 3 |

### Fix note file mapping (Phase 8)

- Đổi `source/speaking/07-weekend.md` → `07-hobbies.md` HOẶC thêm keyword "Hobbies" ngay đầu body. Frontmatter update `title: Hobbies / Weekend / Free time`.
- Update `source/speaking/03-family.md` frontmatter: `lessons: Lesson 4-8` (thay vì `Lesson 9`) — vì family exercises phân bố L4→L8, còn L9 core = personality.
- Update `source/pronunciation/04-collocations.md` frontmatter: `lessons: Lesson 1-5` (thay `Lesson 2-5`) — L1 cũng dạy collocations DO.
- Update `source/speaking/09-food-restaurant.md` frontmatter: `lessons: Lesson 13-15` (thay `Lesson 15`) — food cover xuyên L13-L15.
- Update `source/speaking/12-health-illness.md` frontmatter: `lessons: Lesson 15` (giữ) — hint update cần khớp.

### Viết note mới (Phase 8)

- **`word-classes`** (needsNotes: true) — HIGH priority. Note ngắn (~1 page) giải thích N/V/Adj/Adv cho học viên Việt, đặt file `source/grammar/00-word-classes.md` (số 00 để hiển thị trước).
- **`lesson-misc` overview** — MEDIUM priority. 1 note dạng "Final Review Break" framing cách sử dụng lesson-misc để ôn.

### Cải thiện `noteKeywords` (Phase 7)

- Bỏ single-word `"do"`, `"go"`, `"take"`, `"make"`, `"present"`, `"past"`, `"future"`, `"will"`, `"time"` — quá broad, gây false-positive tag review.
- Thêm compound: `"describing people"` → `["appearance"]`, `"telling time"` → `["reading-stress-time"]`, `"free time"` → `["hobbies"]`, `"weekend"` → `["hobbies"]`, `"clothes"` → `["appearance"]`, `"objects in the house"` → `["house"]`, `"vacation"` → `["trip"]`, `"shopping"` → `["future-tenses"]`.
- Thêm domain vocab để đúng lesson tag core hơn:
  - `"employee"`, `"engineer"`, `"teacher"`, `"doctor"`, `"nurse"` → `["job"]`
  - `"brother"`, `"sister"`, `"parent"`, `"mother"`, `"father"` → `["family"]`
  - `"kitchen"`, `"bedroom"`, `"living room"`, `"bathroom"` → `["house"]`
  - `"stressed"`, `"headache"`, `"toothache"`, `"cold"` → `["health-illness"]`

### Thêm blockOverrides / questionOverrides (Phase 4)

- L5 vowels/reading-stress-time: các câu về "Telling time" nên override tag `reading-stress-time` role=core.
- L8 pronouns/appearance: các câu open_or_video mô tả người nên override tag `appearance` role=core.
- L9 personality: 3 câu tag `personality` hiện đang ở L9 chưa hint → sau khi swap hints thì tag tự khớp.

## Kết luận

Curriculum foundation solid — 25 notes + 16 lessons align tốt với 3-stage structure (Pronunciation → Grammar → Tenses+Speaking). Vấn đề chính là **tagger noise** khiến speaking topic core bị ẩn đi trong dashboard. Sau khi apply các fix ở Phase 7 + 8, coverage matrix sẽ phản ánh đúng ý đồ sư phạm của LangGo.

Không phát hiện lesson nào misplaced content nghiêm trọng. Không phát hiện topic key drift (X8 sạch). Không phát hiện block ở sai lesson (X7 sạch — với heuristic hiện tại).
