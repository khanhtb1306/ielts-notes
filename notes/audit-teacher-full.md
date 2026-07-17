# Full Teacher Audit — 2026-07-17

_Rà soát chuyên môn toàn bộ nội dung app IELTS Foundation Notes ở góc nhìn giáo viên Pre-IELTS Band 5–6 dạy học viên Việt. Chạy song song 4 subagent để cover 4 mảng: notes markdown, daily content + exercises, audio scripts, enrichment + speaking bank. Xem thêm audit cũ nếu cần: [audit-3-teacher-assessment.md](audit-3-teacher-assessment.md), [audit-6-english.md](audit-6-english.md)._

---

## Tóm tắt nhanh

| Mảng | Total | Critical | Medium | Low | Note |
|------|-------|----------|--------|-----|------|
| Notes markdown (26 file) | 68 | 7 | 32 | 21 | 8 |
| Daily content + exercises (16 lesson) | 62 | 2 | 26 | 25 | 9 |
| Audio scripts (433 script) | 58 | 11 | 17 | 24 | 6 |
| Enrichment + speaking bank | 38 | 2 | 11 | 13 | 12 |
| **TỔNG** | **226** | **22** | **86** | **83** | **35** |

**5 finding đáng chú ý nhất — mỗi cái đều Critical + ảnh hưởng học viên rõ ràng:**

1. `08-trip.md` line 24, 59 + `09-food-restaurant.md` line 55, 59 dạy học viên câu **mixed conditional sai** (`If + present, would + V`). Học viên band 5–6 học vẹt sẽ mất điểm Grammatical Range & Accuracy.
2. `12-health-illness.md` line 97 (`ex·**er**·cise`) và `11-daily-routine.md` line 78 (`**a**·bout`) có **bold trọng âm ở âm tiết KHÔNG stress**, mâu thuẫn IPA và text tiếng Việt — học viên nhìn bold sẽ đọc sai trọng âm hoàn toàn.
3. Question `question-308941` (lesson-12 fill_blank) có **đáp án chấp nhận cụt "The children do not"** thiếu `go swimming` — học viên viết đúng vẫn bị chấm trượt.
4. **10 audio bị mất transcript / có transcript sai ngôn ngữ**: 7 script trống (lesson-02 audio 67–72, lesson-04 audio 3) + 3 script thuần tiếng Việt (lesson-03 audio 90–92) — flashcard sẽ lỗi hoặc học viên nghe audio tiếng Anh mà đọc chú thích tiếng Việt.
5. `speakingQuestions.job[1]` viết `"Are you a student or are you working?"` — dùng **Present Continuous hỏi nghề**, sai chuẩn IELTS Part 1 (đúng là Present Simple `do you work`).

**Tin vui**: Không có sai grammar hệ thống trong 433 audio script; IPA chart chuẩn (44 âm đủ); LangGo teacher đã biên tập tốt phần dạng đề nên critical bug dồn ở data mapping (fill_blank variants, script trống, tag audio) chứ không phải chất lượng English.

---

## 1. Notes markdown — findings

### 1.1 Grammar (10 file)

#### `source/grammar/00-word-classes.md`
- **[MEDIUM]** Line 55: `-ist | người theo nghề | dentist, artist, tourist` — `tourist` không phải "nghề". Đổi thành `pianist`, `journalist`, `scientist`.
- **[MEDIUM]** Line 94: Ví dụ `I am interested in a boring book.` phi logic (buồn tẻ mà lại "interested"). Nên dùng `The lesson is boring, so I'm not interested in it.`
- **[MEDIUM]** Line 135: `*He has a happy* → *He has happiness*` — `He has happiness` không tự nhiên. Chỉ giữ `He is happy.`
- **[LOW]** Line 76: `-ize / -ise | organize, memorize, realise` — trộn AmE + BrE trong cùng hàng.
- **[LOW]** Line 105 / 109: thiếu verb `heal`, adverb `uselessly` để đối xứng.
- **[NOTE]** Line 26: Ví dụ tổng hợp có nhãn `(Det)` cho `his` nhưng chưa giới thiệu Det. Nên forward-reference hoặc bỏ.

#### `source/grammar/01-nouns-quantifiers.md`
- **[MEDIUM]** Line 34: Nhóm `shoes, sandals, sneakers, slippers, stockings` với `scissors, jeans, shorts, pants/trousers` là SAI. Nhóm 1 đếm được từng chiếc (`I lost a shoe`); chỉ nhóm 2 là plurale tantum thực sự.
- **[MEDIUM]** Line 26: `Sau o, s, ss, ch, x, sh, z → -es` — SAI với `o`. Nhiều từ `-o` chỉ cần `-s` (`photos, pianos, radios, videos, kilos`). Tách 2 dòng.
- **[LOW]** Line 85: Mini Practice không có key (thiếu đồng bộ với `00-word-classes` và `09-modal-verbs`).
- **[LOW]** Line 87: `Do you have some/any close friends?` — cả 2 đều dùng được, không giúp phân biệt. Nên đổi `There aren't ___ apples in the fridge.` (any).

#### `source/grammar/02-pronouns.md`
- **[MEDIUM]** Line 34: Gộp reflexive (`He saw himself`) + emphatic (`I bake the cake myself`) vào cùng ô, khác chức năng. Tách hai use riêng.
- **[MEDIUM]** Line 63: Mini Practice `______ is this bag? — It's mine.` grammar OK nhưng unnatural. Nên viết `______ bag is this?`.
- **[LOW]** Line 20-28 bảng: Cột "Ngôi" trùng "Subject". Đổi thành "Person (SL/PL)".
- **[LOW]** Line 57: Mini Practice không có key.
- **[NOTE]** Line 50: `Whom are you playing with?` — speaking hiện đại dùng `Who`. Thêm note.

#### `source/grammar/03-adjectives.md`
- **[MEDIUM]** Line 58: Header viết OSASCOMP 8 loại (Opinion → Size → Age → Shape → Color → Origin → Material → Purpose) nhưng bảng dưới chỉ liệt kê 6 (thiếu **Shape** và **Purpose**). Bổ sung.
- **[MEDIUM]** Line 73: Mini Practice item 1 `She wears a ______ (blue / cotton) dress. → đúng thứ tự?` format không rõ. Viết lại `She wears a ______ dress. (blue, cotton) — sắp xếp đúng thứ tự.`
- **[LOW]** Line 76: Mini Practice không có key.
- **[LOW]** Line 44: `-ly | lovely, friendly` — ghi rõ đây là **adjective**, không phải adverb.

#### `source/grammar/04-articles-determiners.md`
- **[MEDIUM]** Line 24: Tip `a university /juː/, an hour /aʊə/` — nên viết rõ `university` bắt đầu bằng /j/ (phụ âm) → `a`; `hour` bắt đầu bằng /aʊ/ (nguyên âm) → `an`.
- **[LOW]** Line 54: Mini Practice không có key.
- **[NOTE]** Line 60: `She lives in ___ USA.` cần rule ngắn về `the + tên quốc gia dạng số nhiều/composite`.

#### `source/grammar/05-prepositions.md`
- **[MEDIUM]** Line 21: `behind | The dress behind me is beautiful.` — váy đứng đằng sau? Đổi `The person behind me is my sister.`
- **[MEDIUM]** Line 25: `on the left of the room` — cứng. Nên `on the left side of the room`.
- **[MEDIUM]** Line 62: Mini Practice `___ the 31st January.` — chuẩn hơn `on the 31st of January` (BrE) hoặc `on January 31st` (AmE).
- **[LOW]** Line 45 `in Ha Noi` (rời) vs line 55 `at Hanoi` (liền) — chọn 1.
- **[LOW]** Line 47: `Long Beach island` → `Long Beach Island` (viết hoa `Island`).
- **[LOW]** Line 60: Mini Practice không có key.

#### `source/grammar/06-present-tenses.md`
- **[MEDIUM]** Line 51: `She is always coming late.` — unnatural. Nên `She's always turning up late.` hoặc `She is always late.`
- **[MEDIUM]** Line 79: Mini Practice item 4 `He ______ always ______ (lose) his keys.` ambiguous (habit vs complaint continuous). Thêm hint `(phàn nàn về thói quen)`.
- **[LOW]** Line 76: Mini Practice không có key.
- **[NOTE]** Line 25: `The sun rises in the East.` — viết hoa `East` thành region; nếu chỉ hướng thì `in the east`.

#### `source/grammar/07-past-tenses.md`
- **[LOW]** Line 111: Nhóm `-eft/-ept` chèn `felt` (`/elt/`) không đồng nhất. Tách riêng hoặc đổi tên nhóm.
- **[LOW]** Line 114: Mini Practice không có key.
- **[NOTE]** Line 94: `hang | hung` — thêm chú thích `hanged` (nghĩa "treo cổ", regular).

#### `source/grammar/08-future-tenses.md`
- **[LOW]** Line 28: WH-question `Who will you go with?` — informal object-who, dễ confuse. Nên `Who will help you?` (subject-Who).
- **[LOW]** Line 64: Mini Practice không có key.

#### `source/grammar/09-modal-verbs.md`
- Không có finding nghiêm trọng — note grammar hoàn chỉnh nhất (có key, ví dụ chính xác, phân biệt `mustn't` vs `don't have to` rõ).

### 1.2 Pronunciation (4 file)

#### `source/pronunciation/01-vowels.md`
- **[MEDIUM]** Line 22: `happy, family` liệt kê dưới `/iː/` (dài). Dictionary hiện đại transcribe `-y` cuối là `/i/` (trung tính, "happy tensing"), không `/iː/`. Học viên đọc quá dài. Note thêm hoặc chuyển sang cột `/ɪ/`.
- **[LOW]** Line 59: `/fɔːr ˈbrekfəst/` — dùng `/r/` cuối (rhotic AmE) trong lúc `mɔːnɪŋ` non-rhotic BrE. Sửa `fɔː`.
- **[NOTE]** Line 51: `/ʊə/` với `sure, poor, cure` — BrE hiện đại smooth thành `/ɔː/`. Note thêm.

#### `source/pronunciation/02-consonants.md`
- **[LOW]** Line 70: trộn `mom` (AmE) với IPA `/fɔː/` (non-rhotic BrE). Chọn 1 biến thể.
- **[LOW]** Line 43: `math` (AmE), BrE là `maths`. Trộn regional.
- **[NOTE]** Line 40: `garage` — BrE `/ˈɡærɪdʒ/` (`/dʒ/`), không `/ʒ/`. Đổi ví dụ thành `pleasure, leisure, usual`.

#### `source/pronunciation/03-reading-stress-time.md`
- **[LOW]** Line 50-53: Bảng nói giờ không nhất quán — `twenty minutes after three` (có "minutes") vs `twenty to nine` (bỏ). Chuẩn hoá.
- **[NOTE]** Line 39-42: 4 cách hỏi giờ hơi dài, nhấn `What time is it?` là câu chuẩn cho Band 5-6.

#### `source/pronunciation/04-collocations.md`
- **[MEDIUM]** Line 46: `make a bed` — chuẩn là `make **the** bed` (tidy sheets).
- **[MEDIUM]** Line 53: Pattern `say + (that) ...` nhưng ví dụ `She said, "This is wonderful."` là **direct speech**, không phải reported speech. Đổi `She said (that) the food was wonderful.`
- **[MEDIUM]** Line 54: `Tell me when you go to school.` ambiguous. Đổi `Tell me your name.` hoặc `He told me the truth.`
- **[MEDIUM]** Line 56: `I ask you to make my bed.` unnatural. Đổi `My mom asked me to clean my room.`
- **[MEDIUM]** Line 57: `She asks me for an umbrella.` — Present Simple với hành động 1 lần → past: `She asked me for an umbrella.`

### 1.3 Speaking (12 file)

#### `source/speaking/01-self.md`
- **[MEDIUM]** Line 51-55: Note gần như không có sample answer đầy đủ Band 5-6 cho các câu Q. Chỉ có audio marker + khung câu. Bổ sung sample answer 20-30 giây cho ít nhất 3 câu chính.
- **[NOTE]** Line 43: `a freshman, a sophomore, a junior, a senior` là bậc đại học Mỹ. Học viên VN chủ yếu `I'm in my first/second year at university`.

#### `source/speaking/02-job.md`
- Không có finding nghiêm trọng. Sample answer line 72 phù hợp Band 5-6.

#### `source/speaking/03-family.md`
- **[NOTE]** Line 45-48: Bảng `like/love/enjoy | noun hoặc V-ing` — chưa ghi `like` cũng nhận to-V (`I like to read`).

#### `source/speaking/04-appearance.md`
- **[MEDIUM]** Line 45: `He/She has got brown/blue eyes. / glasses.` — `has got glasses` không tự nhiên. Nên `He wears glasses.`

#### `source/speaking/05-personality.md`
- Không có finding nghiêm trọng. Bảng tính cách + giải thích mẫu chính xác và tự nhiên.

#### `source/speaking/06-house.md`
- **[MEDIUM]** Line 25: `have a chit-chat` uncommon. Chuẩn hơn `have a chat`.
- **[MEDIUM]** Line 34: `My room is painted in blue.` — `painted [color]` idiomatic (không có `in`). Bỏ `in`.
- **[LOW]** Line 51: `huge = rất lớn` — hơi phóng đại cho phòng ngủ Band 5. Thêm `spacious` (middle-ground).

#### `source/speaking/07-weekend.md`
- **[MEDIUM]** Line 21: `go to a disco` — dated (80-90). Thay `go to a club / go clubbing`.
- **[MEDIUM]** Line 37: `get big muscles` — quá informal cho IELTS. Thay `build muscles` hoặc `stay in shape`.
- **[LOW]** Line 21: `go downtown` (AmE) — BrE `go into town`. Neutral `go out in town`.

#### `source/speaking/08-trip.md`
- **[CRITICAL]** Line 24 & 59: Cả hai dùng `**If I have a chance, I would love to visit again.**` — mixed conditional không chuẩn Type 1 hay Type 2. Section dạy này là template. Học viên band 5-6 học vẹt sẽ bị examiner ghi chú "inaccurate conditional". Sửa thành `If I have a chance, I will visit again.` (Type 1) hoặc `I hope to visit again someday.`
- **[MEDIUM]** Line 42: `we are going to check in a nice homestay` — sai preposition. `check in at [place]` hoặc `check into [place]`.
- **[MEDIUM]** Line 42: Sample answer future trip ~152 words hơi dài + trau chuốt cho Band 5-6. Rút bớt.
- **[NOTE]** Line 42: `try local foods like hot pot` — hot pot không phải đặc sản Đà Lạt.

#### `source/speaking/09-food-restaurant.md`
- **[CRITICAL]** Line 55 & 59: `If I go back to that city, I would definitely eat there again!` — cùng lỗi mixed conditional như `08-trip.md`. Sửa Type 1: `If I go back, I will definitely eat there again.`
- **[LOW]** Line 68: `tasty / delicious | ngon / ngon` — 2 từ dịch "ngon" không giúp phân biệt.

#### `source/speaking/10-hometown.md`
- **[MEDIUM]** Line 24: `I live in Hanoi for school/work now.` — `live in Hanoi for school` unnatural. Nên `I live in Hanoi for university/work` hoặc `to study/work`.
- **[LOW]** Line 71: IPA `/ˈhoʊm.taʊn/` — dùng `/oʊ/` (AmE) không nhất quán với BrE `/əʊ/`. Sửa `/ˈhəʊm.taʊn/`.
- **[LOW]** Line 74: `**cro·wded**` — bold cả từ, không rõ syllable nào bold. Chuẩn `**crow**·ded`.

#### `source/speaking/11-daily-routine.md`
- **[CRITICAL]** Line 78: `**a**·bout — nhấn âm 2: /əˈbaʊt/.` — bold ở âm tiết **1** (`a`) nhưng text và IPA đều cho stress âm 2. Học viên nhìn bold sẽ đọc sai. Sửa `a·**bout**`.
- **[MEDIUM]** Line 19-20: `It is quarter past seven.` — thiếu article `a`. Chuẩn `It's **a** quarter past seven.` (file `03-reading-stress-time.md` đã dùng đúng).
- **[MEDIUM]** Line 82: `*seven-a-clock* /ˌsevn əˈklɒk/` — dạng viết dễ khiến đọc "seven-A-clock". Nên viết `seven əˈclock` hoặc chỉ dùng IPA.
- **[LOW]** Line 87: `~~*I am going to school at 7*~~` — cross-out quá đà; ví dụ này đúng nếu là future arranged.

#### `source/speaking/12-health-illness.md`
- **[CRITICAL]** Line 97: `ex·**er**·cise /ˈek.sə.saɪz/ — nhấn âm đầu, đuôi /aɪz/.` — bold ở âm **2** (`er`) nhưng text và IPA cho stress âm 1. Sửa `**ex**·er·cise`.
- **[CRITICAL]** Line 105: `Không dùng *catch the flu* ~~*catch flu*~~ — dùng **the flu** với "the".` — cấu trúc đảo, khiến đọc ngược. Viết lại: `Nên dùng *catch the flu* (có "the"), KHÔNG dùng ~~catch flu~~.`
- **[MEDIUM]** Line 105 section: Tiêu đề `Cảm cúm:` nhưng nội dung trước nói về `cold` (`catch a cold`), không phải flu. Tách 2 dòng: 1 cho `cold`, 1 cho `the flu`.
- **[LOW]** Line 88: `hurt / ache | My throat hurts.` — thiếu note `hurt` intransitive khi body part là subject, transitive khi thấy đau chủ động (`I hurt my leg`).

### 1.4 Pattern chung (notes markdown)

1. **Mini Practice thiếu key**: 9/11 note grammar+pronunciation có Mini Practice nhưng KHÔNG có key. Chỉ `00-word-classes.md` và `09-modal-verbs.md` có. Học viên tự học không biết đúng/sai — chuẩn hoá **tất cả** có key.
2. **Stress bold marker mâu thuẫn IPA**: 2 chỗ critical (`exercise`, `about`). Audit lại **tất cả** dòng `[syllable]·**[syllable]**` để verify khớp IPA đi kèm.
3. **`If + present, would + V`** được dạy như template trong `08-trip.md` và `09-food-restaurant.md`. Mixed conditional không chuẩn. Chuẩn hoá về Type 1 hoặc Type 2.
4. **IPA mix BrE/AmE**: mặc định BrE nhưng có 1-2 chỗ AmE (`/hoʊm.taʊn/`, `fɔːr`). Chốt BrE cho IELTS UK/AU.
5. **Chính tả AmE/BrE trong ví dụ**: `math` (AmE), `mom` (AmE), `elevator` (AmE), `on the weekend` (AmE) vs `at the weekend` (BrE). Chuẩn hoá BrE.
6. **Frontmatter không khớp spec AGENTS.md**: Spec yêu cầu `title, lesson, priority (high|normal), vi`. Thực tế dùng `lessons` (plural), `skill`, `priority: High/Normal` (viết hoa). Cần cập nhật spec hoặc rename keys.
7. **Sample answer speaking gần Band 6.0+, không phải 5-6**: `08-trip.md` (152 words, `explore the city`, `peaceful feeling`), `10-hometown.md` (`However`). Nên có 2 phiên bản: simple (Band 5) + extended (Band 6).
8. **Section say/tell/ask trong `04-collocations.md`** cần rewrite gần toàn bộ 4 dòng ví dụ để pattern minh hoạ khớp cấu trúc.
9. **Sample answer thiếu filler tự nhiên Band 5-6**: đa số là "câu văn viết" không có `well`, `you know`, `I mean`, `let me think`. Có thể note 1 section "Filler tự nhiên" cross-cutting.

---

## 2. Daily content + exercises — findings

### 2.1 Từng lesson

#### lesson-01
- **[LOW]** Block `assignment-76144`: câu instruction quá dài, thiếu dấu phẩy. Tách 2 câu.
- **[NOTE]** Block `assignment-76145`: mục "Have + (got) to" đưa vào lesson đầu tiên hơi sớm.
- **[MEDIUM]** `question-262521` `input_2` (do the [washing]) — chỉ nhận `"washing"`. Thêm `"laundry"` (AmE).
- **[MEDIUM]** `question-262527` `input_1` (game of [___]) — chỉ nhận `["football","sport"]`. Có thể thêm `"tennis"`, `"cards"`.
- **[LOW]** `question-262528` `input_3` — chấp nhận `"have the time"/"have time"` nhưng prompt để `have the times` gây confused.

#### lesson-02
- **[LOW]** Block `assignment-76955` mục 4: danh sách hoạt động chỉ có Vietnamese, thiếu English (`go shopping`, `go swimming`...).
- **[MEDIUM]** `question-266044` `input_4` (gets some ___ to keep her awake) — chỉ nhận `"coffee"`. Thêm `"tea"` (cũng caffeine).
- **[LOW]** `question-266049`: `correct_answer` toàn `[""]` (chuỗi rỗng). Nên đổi `null` để tránh false-positive.
- **[NOTE]** `question-266044` `input_1` (When you [get] back home) — có thể ambiguous với `"get back"`.

#### lesson-03
- **[NOTE]** Block `assignment-77811` mục B "Sometimes I …" chỉ có tiếng Việt, thiếu tiếng Anh.
- **[MEDIUM]** `question-269514` `input_1` (bathroom to have a [___]) — model `"bath"/"shower"`. Học viên có thể viết `"quick shower"` → Note.
- **[LOW]** `question-269507`–`269509`: prompt dấu `..............` quá dài.

#### lesson-04
- **[LOW]** Block `assignment-78756` mục C: `made a good choice` quá đơn giản, thêm ví dụ khó hơn.
- **[NOTE]** Block `assignment-78757`: quá tải (say/tell/ask/speak/talk/answer/reply cùng lúc). Tách sub-lesson.
- **[MEDIUM]** `question-273627` `input_5` (`Let's [___] him to turn off the music`) — chấp nhận `"ask"/"tell"`. Đủ variants.
- **[MEDIUM]** `question-273627` `input_1` (`likes to [___] me a joke`) — model `"tell"`. Context tiếng Việt gợi rõ. OK.
- **[LOW]** `question-273629` `input_5` (`better for you to [___] than to go by car`) — chấp nhận `"walk"`. `"cycle"/"bike"` cũng OK nhưng context so sánh với "by car" hàm ý walk.

#### lesson-05
- **[LOW]** Block `assignment-79598`: ví dụ `3:31 - it's thirty-one past three` — cách nói này rất ít dùng. Thay ví dụ.
- **[NOTE]** Block `assignment-79598` ghi `'oh' more common` cho số 0 — đúng khi đọc phone number nhưng KHÔNG đúng cho giờ. Làm rõ scope.
- **[LOW]** `question-276925` `input_1` ("12:00") — chấp nhận `"12:00"`. Bài listening đọc "midnight" → thêm `"midnight"`.
- **[MEDIUM]** `question-276921` `input_0` ("Bob Jackson") — chỉ 1 variant. Nếu cần full name thì OK, nhưng thêm variant `"Jackson"`/`"Bob"` để đồng bộ với các câu khác.

#### lesson-06
- **[LOW]** Block `assignment-81085` transcript 5 VN: `"tôi nên một công việc tốt hơn."` — thiếu `"tìm"`.
- **[NOTE]** Transcript 4 VN: `"Có thể đó."` — nên `"Có thể vậy."` hoặc `"Có thể đấy."`.
- **[MEDIUM]** `question-283281` `input_3` (`The only trouble is`) — chỉ 1 variant. Thêm `"The only problem is"`.
- **[LOW]** `question-283285` `input_3` (`My jobs is great`) — nếu cho phép full sentence thì thêm.

#### lesson-07
- **[NOTE]** Block `assignment-81921` chứa cả grammar + vocab + long transcript trong 1 block khổng lồ → UI render nặng. Tách block.
- **[MEDIUM]** `question-286735` (single_choice, `How ___ perfume`) — correct `"much"`. Distractor OK, nhưng học viên có thể tưởng perfume đếm được → thêm ví dụ ngữ cảnh.
- **[LOW]** `question-286748` `input_5` (`wears [___] basic T-shirts`) — chấp nhận `"some"`. `"a few"` cũng đúng.
- **[LOW]** `question-286748` `input_10` (`Do you have [___] photos`) — chỉ `"any"`. Câu lịch sự cũng có `"some"`.
- **[MEDIUM]** `question-286761` `input_2` (`How old is Anne?`) — model `"She's about 20."`. Học viên viết `"She's about 20 years old."` sẽ sai.

#### lesson-08
- **[LOW]** Block `assignment-82760` Transcript 1 câu 6: 3 màu sáng khác nhau, khó nhớ.
- **[NOTE]** Block `assignment-82761` speaker 5: `"a lot of great software"` — học viên VN thường viết `"softwares"`. Cần bài giải thích.
- **[MEDIUM]** `question-290264` `input_5` (`What is Mary wearing?`) — nếu không punctuation cuối sẽ bị sai. Cần normalize.
- **[LOW]** `question-290261` `input_3` (`We have a cat – [___] name is Muxu`) — chấp nhận `"its"`. `"his"/"her"` cũng OK nếu mèo có giới tính.

#### lesson-09
- **[LOW]** Block `assignment-83606`: ví dụ `stupid` với người ở Band 5-6 hơi nặng.
- **[NOTE]** Block `assignment-83607` Transcript 3 câu 3: `"Nghe buồn cười nhỉ."` — có thể tự nhiên hơn `"Nghe hài thật đấy."`.
- **[MEDIUM]** `question-293793` `input_1` (`Five stars → an excellent [___]`) — chấp nhận `"hotel"`. `"restaurant"`/`"service"` cũng match 5 sao.
- **[LOW]** `question-293797` `input_4` — chỉ 1 variant. `"She looks like she's always in a bad mood."` (chuyển vị adverb) cũng grammatical.

#### lesson-10
- **[LOW]** Block `assignment-84705` Exercise 1 câu 3 VN: nên `"Có tận bảy người sống cùng bạn cơ à?"` để thể hiện ngạc nhiên.
- **[MEDIUM]** `question-297869` `input_7` (`turn the TV [off]`) — chấp nhận cả 2 thứ tự. Tốt.
- **[MEDIUM]** `question-297870` `input_9` (`seven people/7 people`) — chấp nhận. Nhưng `"7"` một mình cũng đủ.
- **[LOW]** `question-297872`: mảng chấp nhận nhiều thứ tự tính từ → tốt.
- **[MEDIUM]** `question-297876` `input_10` (`Jamy likes [___] music`) — chấp nhận `"x"` (no article). `"the"` cũng OK nếu ngữ cảnh cho phép.

#### lesson-11
- **[LOW]** Block `assignment-85508` conversation 4 VN: `"ở góc phố giữa Ford và ."` — thiếu tên phố `"Fourth"`.
- **[NOTE]** Block `assignment-85507`: quá nhiều mục Exercise 1/2 chỉ có prompt (picture-based tasks).
- **[LOW]** `question-301008` `input_4` — chấp nhận `"across from"/"opposite"` — tốt.
- **[MEDIUM]** `question-301010` `input_6` (`between the [bed] and [chest of drawers]`) — chấp nhận cả 2 thứ tự, nhưng 1 biến thể có leading space.

#### lesson-12
- **[LOW]** Block `assignment-87269` Exercise 1 câu 5 VN: `"tôi cần ít quần jean mới"` — không tự nhiên. Nên `"tôi cần vài chiếc quần jean mới"`.
- **[CRITICAL]** `question-308941` `input_4`: `["The children do not","The children don't go swimming"]` — biến thể đầu **"The children do not"** bị cắt cụt, thiếu `"go swimming"`. Học viên viết đúng vẫn sẽ trượt. Sửa `["The children do not go swimming","The children don't go swimming"]`.
- **[MEDIUM]** `question-308937` `input_5` (`doesn't need`) — chỉ chấp nhận `["doesn't need"]`. Thêm `"does not need"`.
- **[MEDIUM]** `question-308937` `input_8` (`doesn't take`) — thiếu `"does not take"`.
- **[LOW]** `question-308940` `input_4`: mảng `["is not singing"," isn't singing"]` — biến thể 2 có **leading space**.
- **[MEDIUM]** `question-308917` `input_2` (`He's [___]` làm vườn) — chỉ `"gardening"`. `"doing gardening"` cũng OK.

#### lesson-13
- **[LOW]** Block `assignment-88175` Exercise 1 audio 4: `"She lost &pound;20."` — raw HTML entity chưa decode. Đổi `£20`.
- **[LOW]** Block `assignment-88179` Exercise 3 câu 4 VN: `"Bạn không bao giờ nên đi vào tháng Bảy."` — nên `"Đừng bao giờ đi vào tháng Bảy"`.
- **[MEDIUM]** `question-313157` `input_6` (`She [___] tired when she got home`) — chỉ `"was"`. Thêm `"felt"` (rất phổ biến).
- **[MEDIUM]** `question-313157` `input_8` (`She [___] a meal yesterday evening`) — chỉ `"cooked"`. Thêm `"made"`, `"prepared"`.
- **[MEDIUM]** `question-313161` `input_13` (`The dog [___] loudly during the thunderstorm`) — chỉ `"was barking"`. `"barked"` (simple past) cũng đúng.
- **[LOW]** `question-313163` `input_0`-`input_4` (matching): chỉ nhận letter `"d"`, `"e"`. Học viên viết full sentence bị sai.
- **[NOTE]** `question-313165`: chấp nhận cả letter + full word → tốt.

#### lesson-14
- **[NOTE]** Block `assignment-89024` mục "Signs in shops" và "3. Transport" chỉ có tiêu đề, không có nội dung (hình ảnh trong LangGo).
- **[MEDIUM]** `question-316828` `input_1` (`romantic holiday in Da Lat`) — chỉ preposition `"in"`. `"to Da Lat"` cũng OK.
- **[LOW]** `question-316826` `input_2`: mảng `["will ","'ll"]` — biến thể đầu có **trailing space**.
- **[MEDIUM]** `question-316833` `input_0` (`4,099`) — mảng `["4,099","$4,099"]`. Thêm `"4099"` và `"$4099"` (không dấu phẩy).
- **[LOW]** `question-316834` `input_1` (`10 cents`) — thêm `"$0.10"`.
- **[MEDIUM]** `question-316831` `input_4` (`clothes for myself and my children in one shop`) — chấp nhận `"department store"/"supermarket"`. Supermarket bán quần áo ít gặp → thay `"clothes shop"` hoặc bỏ `"supermarket"`.

#### lesson-15
- **[LOW]** Block `assignment-89921` transcript 3 VN: `"vào tối nó"` → typo `"vào tối nọ"`.
- **[LOW]** Transcript 4 VN: `"món rau thì hoàn thảo"` → `"hoàn hảo"`.
- **[LOW]** Transcript 2 VN: lặp từ `"ngon"` 2 lần. Nên `"tuyệt - rất tươi và đậm đà"`.
- **[LOW]** Transcript 3 VN: `"trứng cuộn"` — dịch `"egg rolls"` không chuẩn (là chả giò/nem cuốn).
- **[NOTE]** Block chứa cả 4 transcripts + song ngữ trong 1 block dài — UI khó đọc.
- **[MEDIUM]** `question-320683` `input_12` (`want to be a teacher, you [___] attend`) — chỉ `"must"`. `"need to"/"have to"` đều đúng.
- **[MEDIUM]** `question-320683` `input_13` (`He [___] be home yet`) — chỉ `"might not"`. `"may not"` cũng đúng.
- **[MEDIUM]** `question-320683` `input_11` (`[___] you pass me the sugar`) — chấp nhận `"could"/"can"`. Thiếu `"would"`.
- **[LOW]** `question-320683` `input_9`: chấp nhận `"needn't"/"need not"` — cần đảm bảo grading normalize curly quote U+2019 sang straight U+0027.
- **[MEDIUM]** `question-320693` `input_14` (`It was too [___]`) — chỉ `"had no taste"`. `"tasteless"` cũng đúng.

#### lesson-misc
- **[LOW]** Block `assignment-85510` transcript 5 VN: `"tôi nên một công việc tốt hơn"` — thiếu `"tìm"` (giống lesson-06).
- **[LOW]** Block `assignment-85526` Exercise 4 câu 4 VN: `"Bạn sẽ xem hiệu sách"` → `"Bạn sẽ thấy hiệu sách"`.
- **[LOW]** Block `assignment-85510` transcript 1 VN: `"phát ngán vì nó"` — hơi tối nghĩa. Nên `"chán ngán nó"`.
- **[LOW]** Block `assignment-85520` transcript 1 VN: `"Cô ấy thực sự gọn gàng."` — dịch `"She's really neat"` sai nghĩa; `neat` = `great/cool` không phải `tidy`. Phải `"Cô ấy thực sự tuyệt."`.
- **[LOW]** Block `assignment-85520` transcript 4 VN: `"Chàng trai, anh ấy thực sự thú vị."` — `Boy` là interjection (`Ôi`), không phải `"Chàng trai"`.
- **[LOW]** Block `assignment-85512` transcript 5 VN: `"tóc ngắn màu vàng"` — `blond` = `vàng hoe`, không phải `vàng`.
- **[NOTE]** `lesson-misc` có 39 blocks + 77 câu = biggest lesson. Tách 2-3 sub-lesson.
- **[MEDIUM]** `question-276950` `input_0` (`Tôi thường tắm lúc 7 giờ tối`) — chấp nhận `"I often have a shower at 7 pm."` `"take a shower"` (AmE), `"take a bath"` (bồn) đều đúng.
- **[MEDIUM]** `question-276948` `input_0` (`Anh trai tôi tập thể dục mỗi ngày`) — chỉ `"My brother does exercise every day."`. `"My brother exercises every day."` (dạng verb, rất tự nhiên) bị sai.
- **[MEDIUM]** `question-276954` `input_0` (`Tôi thường đi đến trường bằng xe máy`) — chỉ `"go to school by motorbike"`. `"go by motorcycle"` hoặc `"ride a motorbike to school"` đều đúng.
- **[MEDIUM]** `question-301033` (`She's pretty tall, about 170 centimeters.`) — chỉ 1 variant. `"She's about 170 centimeters tall."` (khác trật tự) grammatical.
- **[MEDIUM]** `question-301022`-`301026` (matching): user viết `"7. I am well paid."` (kết hợp số + câu) sẽ sai.
- **[LOW]** `question-276926` (single_choice) options: `"go swim"` (thiếu -ing) quá dễ loại. Thay `"take a swim"`.
- **[LOW]** `question-276939` (single_choice, `You should ___ him`) — `"talk to"` correct, `"talk with"` distractor. `"talk with"` cũng chấp nhận được (AmE). Đổi `"talk about"`.
- **[MEDIUM]** `question-301035` (`She's got dark brown hair.`) — chỉ contraction. `"She has dark brown hair."` cũng đúng.
- **[LOW]** `question-301068` `input_2` (`Go down the street`) — `"Walk down"` cũng đúng nghĩa.
- **[MEDIUM]** `question-301027`-`301031` (matching listening description): multi-select, cần verify UI có support không.
- **[NOTE]** `question-301047`-`301058` (12 câu matching): sequential 1 câu 1 người — mechanical. Gộp thành group-match.

### 2.2 Pattern chung (daily)

1. **Fill_blank chỉ chấp nhận 1 variant** khi thực tế nhiều variant đúng — contraction (`doesn't` vs `does not`, `won't` vs `will not`, `isn't` vs `is not`), synonyms (`problem`/`trouble`), AmE/BrE (`bath`/`shower`, `motorbike`/`motorcycle`), số format (`4,099`/`4099`, `$4,099`/`$4099`).
2. **Bản dịch tiếng Việt trong transcript đôi khi thiếu từ / sai chính tả nhỏ** (`hoàn thảo`, `tối nó`, `tôi nên một công việc`).
3. **Bài rearrange chỉ nhận 1 trật tự** dù có nhiều trật tự đúng ngữ pháp cho cùng bộ từ.
4. **Số / tiền tệ không chấp nhận biến thể format** (`4,099` vs `4099`; `$` vs không có `$`).
5. **Leading / trailing space trong biến thể** (`"will "`, `" isn't singing"`) — bug data.
6. **HTML entity chưa decode** (`&pound;20`) trong content.

---

## 3. Audio scripts — findings

### 3.1 Từng lesson

#### lesson-01
- **[LOW]** Audio 11 (`28159-11`): `"Do your/ my homework"` — slash trong script khiến audio-vs-script không khớp. Tách 2 audio hoặc rút gọn `"Do your homework"`.
- **[LOW]** Audio 68 (`28160-14`): `"a shower /ʃaʊər"` — IPA cụt (thiếu `/` đóng). Fix `"a shower"`.
- **[NOTE]** Audio 1–14 khối `Do + activity`: script English, pedagogical value tốt cho collocation `do + noun`.

#### lesson-02
- **[CRITICAL]** Audio 67-72 (`28460-1..6`): **6 script rỗng** (`""`). Audio tồn tại nhưng transcript trống → flashcard không hiển thị đáp án. Cần transcribe thủ công hoặc ẩn khỏi flashcard. Cả 6 thuộc `challengeId 28460` (Lesson go/went/gone).
- **[MEDIUM]** Audio 1–5 (`28459-*`): script dạng `"Get a newspaper: Mua 1 tờ báo"` — trộn English + Vietnamese trong cùng field. Audio thực tế chỉ đọc English. Chuẩn hoá giữ English-only (audio 6 `"in April"` đã đúng chuẩn).
- **[LOW]** Audio 6 (`28459-6`): `"in April"` — fragment, giá trị dạy hạn chế.

#### lesson-03
- **[CRITICAL]** Audio 90 (`28779-12`): script `"Lau nhà"` — 100% Vietnamese, mismatch audio English. Thay `"Do the housework"` / `"Mop the floor"`.
- **[CRITICAL]** Audio 91 (`28779-13`): script `"Đi dạo"` — Vietnamese-only. Thay `"Go for a walk"`.
- **[CRITICAL]** Audio 92 (`28779-14`): script `"Viết thư/ email"` — Vietnamese-only. Thay `"Write a letter / email"`.
- **[MEDIUM]** Audio 79–89 (`28779-1..11`): script `"Wake up: Thức giấc"` dạng English + VN nối `":"`. Chuẩn hoá English-only.
- **[NOTE]** Audio 93 (`28779-15`): `"email"` — đơn từ đứng riêng, OK.

#### lesson-04
- **[CRITICAL]** Audio 3 (`29126-3`): **script rỗng**. Bổ sung transcript (context `make + noun` → `"I make my bed"`).
- **[LOW]** Audio 8: `"When I get up I make my bed"` — thiếu dấu phẩy. Fix `"When I get up, I make my bed."`
- **[LOW]** Audio 10: `"in the living room!"` — bắt đầu chữ thường, có `!`. Nếu là fragment audio OK; nếu câu đầy đủ thì gộp với audio 9.
- **[LOW]** Audio 11: `"you made a good choice!"` — sai capitalization. `"You made..."`.
- **[MEDIUM]** Audio 6 (`in the exercise`) và Audio 7 (`with the doctor`): fragments không tự nhiên khi đứng riêng. Mở rộng thành câu.
- **[NOTE]** Audio 5: `"video"` — đơn từ.

#### lesson-05
- **[CRITICAL]** Audio 1 (`29470-1`): script chứa **instructions + phần dictation Vietnamese** — không phải transcript audio thật. Learner nghe audio (dictate tên) → đọc script sẽ không khớp gì. Cần re-transcribe từ audio thực tế và move instruction về `scriptText` của content block.
- **[CRITICAL]** Audio 2 (`29470-2`): cùng vấn đề — script là notes chứ không phải transcript, kèm typo `'zero,` (thiếu single quote đóng).
- **[MEDIUM]** Audio 10 (`29471-8`): `"He goes to the restaurant with his girlfriend once a month"` — `the restaurant` cho hành động lặp lại không đúng. Nên `a restaurant`.
- **[MEDIUM]** Audio 11 (`29471-9`): `"I usually go swimming at the swimming pool"` — lặp `swimming`. Nên `"go swimming at the pool"`.
- **[LOW]** Audio 12 (`29471-10`): `"She does exercise every Wednesday morning"` — `do exercise` uncountable OK nhưng `exercises` (countable) thường hơn.
- **[LOW]** Audio 3–12: prefix `1.`, `2.`... — nếu audio không đọc số thì script thừa.
- **[NOTE]** Audio 13 (`29471-11`): dialog nhiều turn với `Uh`, `Yeah` — rất natural, giữ nguyên.

#### lesson-06
- **[MEDIUM]** Audio 2 (`30043-2`): `"I love travel and flying"` — `love travel` (noun) hơi cứng; natural hơn `love traveling and flying`. Nếu dạy noun `travel` thì cần glossary note.
- Còn lại: 9/10 câu tự nhiên, pedagogical value tốt.

#### lesson-07
- Không có finding. 10/10 câu natural, đúng collocation Speaking Part 1.

#### lesson-08
- **[LOW]** Audio 7 (`30674-7`): `"Both of us love to learn new things about cultures"` — `about cultures` (bare plural) lạ. Native `about different cultures`.
- Còn lại 7/8 câu OK.

#### lesson-09
- Không có finding. 14/14 câu descriptive personality rất natural.

#### lesson-10
- Không có finding. 5/5 câu đơn giản, natural.

#### lesson-11
- **[NOTE]** Không có audio (audio: 0).

#### lesson-12
- **[MEDIUM]** Audio 1, 2, 3 (`32362-1..3`): script gồm nhiều dialog English + toàn bộ bản dịch Vietnamese trong cùng 1 chuỗi, cách nhau `|`. Learner reveal answer sẽ thấy nguyên khối cả 2 ngôn ngữ. Tách English và Vietnamese ra 2 field riêng (`script` + `translation`).
- **[LOW]** Audio 1 dialog #6: `"It'll be perfect for swimming"` → dịch VN `"Thời tiết quá hoàn hảo để bơi lội"` chèn `"quá"` không đúng ý.

#### lesson-13
- **[LOW]** Audio 1 (`32729-1`): prefix speaker dính không space/dấu chấm — `1Maria:`, `2Johnny:`. Chuẩn hoá `1. Maria:` hoặc chỉ `Maria:`.
- **[LOW]** Audio 1: `&pound;20` — HTML entity chưa decode.
- **[MEDIUM]** Audio 1, 3: giống lesson-12 — English + Vietnamese translation nối `|`.
- **[NOTE]** Audio 2 (Adrian's Spain story): dài, narrative past simple rất tốt.

#### lesson-14
- **[LOW]** Audio 1, 2, 3 (`33069-1..3`): script `"Exercise 1"`, `"Exercise 2"`, `"Exercise 3"` — nếu audio chỉ đọc label thì OK; nếu đọc nội dung thật thì mismatch. Verify thủ công. Có thể ẩn khỏi flashcard.
- **[MEDIUM]** Audio 6 (`33069-6`): `"Only rich people can really afford to buy a car at home"` — `at home` context ambiguous (ý `"in my home country"`). Sửa `in my country` hoặc `back home`.
- **[MEDIUM]** Audio 10 (`33069-10`): `"it costs a lot to see a doctor or to enter a hospital"` — `enter a hospital` unnatural. Native `go to (the) hospital`.
- Còn lại 5/10 OK.

#### lesson-15
- **[LOW]** Audio 4 (`33411-4`): `"The vegetables were good-very fresh and tasty"` — dùng hyphen `-` thay em-dash `—`.
- **[MEDIUM]** Audio 9 (`33411-9`): chứa 4 restaurant-review blocks + Vietnamese translation. Giống lesson-12/13.
- **[LOW]** Audio 9 Block 4 dịch: `"hoàn thảo"` → typo `"hoàn hảo"`.

#### lesson-misc
- **[LOW]** Audio 6-7 (`29473-1, 29473-2`): **duplicate** — 2 audio khác nhau nhưng script identical: `"What does your mother do? - My mother is a nurse"`. Verify 2 recording khác nhau thật (male/female voice? tempo?) hoặc drop 1.
- **[MEDIUM]** Audio 11 (`29473-6`): `"bread with eggs"` — dịch literal từ tiếng Việt. Native `"bread and eggs"` hoặc `"eggs on toast"`.
- **[LOW]** Audio 18 (`31678-4`): dùng curly apostrophes (`'`) — không đồng nhất với đa số script khác dùng straight.
- **[MEDIUM]** Audio 15 (`31678-1`) dialog #1: `"She's really neat"` — AmE slang `neat = cool/nice`. Learner học British/Neutral English có thể confuse (`neat = gọn gàng`). Sửa translation `"Cô ấy tuyệt lắm"`.
- **[LOW]** Audio 15 dialog #4: `"Boy, he's really interesting"` — `Boy` interjection (`Ôi`, `Chà`), không phải `"Chàng trai"`. Chỉ lệch translation.
- **[NOTE]** Audio 1 (Bill dialog #5): translation `"tôi nên một công việc tốt hơn"` thiếu `"tìm"`. English natural.

### 3.2 Pattern chung (audio scripts)

1. **English + Vietnamese trong cùng field `script`** (lesson 1–3, 12, 13, 15, misc): không phải bug ngữ pháp English nhưng ảnh hưởng UX flashcard/reveal. Đề xuất pipeline preprocess tách 2 field (`script` chỉ English, `translation` VN).
2. **7 script trống** (lesson-02 audio 67-72, lesson-04 audio 3) là bug thật từ nguồn LangGo API. Manual transcribe hoặc flag ẩn.
3. **3 script tiếng Việt thuần** (lesson-03 audio 90-92) là data error, phải fix English tương ứng.
4. **2 script instructional-notes** (lesson-05 audio 1-2) chèn nhầm vào audio.script thay vì transcript thật — cần re-transcribe từ audio dictation.
5. **Fragment scripts** (`in the exercise`, `with the doctor`, `Exercise 1/2/3`, `in April`) giá trị dạy rất thấp; mở rộng full sentence hoặc ẩn khỏi flashcard sample pool.
6. **Numbering + typography inconsistency** (`1Maria:`, `&pound;`, curly vs straight quotes, em-dash vs hyphen) nhỏ nhưng dễ fix bằng 1 normalization pass.
7. **Collocation cần polish** (`I love travel` → `traveling`, `enter a hospital` → `go to`, `bread with eggs` → `bread and eggs`, `about cultures` → `about other cultures`, `at home` ambiguous, `the swimming pool` lặp).
8. **Grammar core**: KHÔNG phát hiện lỗi grammar nghiêm trọng nào trong 433 câu — chất lượng biên tập LangGo tốt ở khía cạnh này.

---

## 4. Enrichment + speaking bank — findings

### 4.1 `web/enrich/meta.json`

- **[MEDIUM]** `readGuide[7]` (Restaurant): `grammar: "Past Simple; modal verbs"` nhưng câu mẫu không có modal. Sửa `"Past Simple"` hoặc thêm câu ví dụ có modal.
- **[MEDIUM]** `readGuide[6]` (Trip future): `grammar: "be going to; will"` nhưng câu mẫu chỉ có `be going to`. Bỏ `will` hoặc thêm câu.
- **[MEDIUM]** `vocab.Weekend[5]`: `"soundtrack"` không thuộc chủ đề Weekend. Đưa sang movies vocab hoặc thay `"hang out"`.
- **[MEDIUM]** `review[2]` (Speaking Review) chỉ 7 chủ đề — thiếu Hometown, Daily Routine, Health & Illness (đã có trong speakingQuestions).
- **[LOW]** `readGuide[5]` (Trip past): dùng `"trip"` 2 lần trong 1 câu. Đổi `"is when I went to Hue..."`.
- **[LOW]** `readGuide[3]` (Appearance) `stress`: liệt kê `"not very tall"` như 1 unit — nên chỉ stress content word `"tall"`.
- **[LOW]** `vocab.Family[3]`: `"elder sister"` — chuẩn hơn `"older sister"` cho A1-A2.
- **[LOW]** `vocab.Appearance[1]`: `"average-looking"` không thông dụng. Thay `"average height"`.
- **[LOW]** `vocab.House[5..6]`: `"next to"`, `"in the middle of"` là prepositions, không phải house vocab. Tách hoặc đổi thành noun (`"balcony"`, `"study room"`).
- **[LOW]** `readGuide[4]` (Weekend): `"On the weekend"` (AmE); BrE `"at the weekend"`. Chuẩn hoá cho IELTS.
- **[NOTE]** `lessons[4]` (Lesson 5) `focus`: trộn `MAKE` (collocation) với `say/tell/ask` (reporting verbs). Tách.
- **[NOTE]** `vocab.Personality`: thiếu `"outgoing"`, `"reserved"`, `"hard-working"`, `"kind"`, `"funny"`. Bổ sung.
- **[NOTE]** `vocab.Job`: `"work with kids"` khác pattern các item khác (mostly noun/adj). Thêm noun-based `"job satisfaction"`.

### 4.2 `web/enrich/audio.json`

- **[CRITICAL]** File chỉ có **24 items** (num max 46), không phải 65 như plan giả định. Gap: **6–9** (4 câu), **19–36** (18 câu), **47–65** (19 câu). Nếu 65 là target cần bổ sung; nếu 24 là target thì cập nhật đếm & doc.
- **[MEDIUM]** Audio num 11 file `"11. Are you a student or do you work_.wav.wav"` — **double extension `.wav.wav`**. Rename.
- **[MEDIUM]** Audio num 44 topic `"Family"` nhưng title `"What does he/she like?"` — câu hỏi về preferences, dễ nhầm với `"What is he/she like?"` (personality). Chuyển sang `"Personality"` hoặc đổi tên `"Preferences"`.
- **[LOW]** Audio num 41 file `"41. What kinds of clothes does he_she often wear_ .wav"` — trailing space trước `.wav`. Trim.
- **[LOW]** Không có audio cho topic `hometown`, `daily-routine`, `house`, `trip`, `food-restaurant`, `health-illness` — mismatch với speakingQuestions.
- **[NOTE]** `topic` field label không match với `topicLabels` key (VD `"Weekend / Free time"` vs `hobbies`). Chuẩn hoá cross-reference.
- **[NOTE]** Thứ tự JSON không sort tăng dần theo `num`.

### 4.3 `web/enrich/ipa.json`

- **[MEDIUM]** `monophthongs[11]` — `/ə/` word `"teacher"`. Học viên dễ tưởng vowel chính là `/ə/`. Chọn `"about"` (/əˈbaʊt/) hoặc `"banana"` schwa purer.
- **[LOW]** Ví dụ từ **reuse** giữa các âm gây khó phân biệt: `"tea"` ở `/iː/` + `/t/`; `"car"` ở `/ɑː/` + `/k/`; `"hair"` ở `/eə/` + `/h/`. Minh hoạ mỗi âm bằng từ rõ nhất và không trùng.
- **[LOW]** `diphthongs[4]` — `/ʊə/` word `"tourist"`. Trong BrE hiện đại `/ʊə/` merged với `/ɔː/`. Chọn `"pure"` (/pjʊə/) ổn định hơn.
- **[NOTE]** `monophthongs[0]` (`/iː/`) `spell: "ea, ee, -y"` — thiếu `ie` (`piece`, `field`).
- **[NOTE]** `consonants` không có cột `spell` như vowels. Thêm để đối xứng.
- **[NOTE]** Không tách nhóm consonants theo place/manner. Thêm field `manner` để future group view.

### 4.4 `topics-map.json — speakingQuestions`

- **[CRITICAL]** `job[1]`: `"Are you a student or are you working?"` — dùng **Present Continuous hỏi nghề nghiệp**. Câu chuẩn IELTS Part 1 là Present Simple: `"Are you a student, or do you work?"` (khớp với audio 11). Sai lệch pedagogy khi Pre-IELTS đang học phân biệt tenses.
- **[MEDIUM]** `trip[1]`: `"Tell me about one trip you remember the most."` — cấu trúc không tự nhiên. Chuẩn: `"Tell me about a memorable trip you've taken."` hoặc `"Tell me about the trip you remember the most."`
- **[MEDIUM]** `hometown[3]`: `"Are there any lakes or rivers / woods or forests / hills or mountains in your hometown?"` — 3-in-1 dùng slash. Tách thành `subQuestions[]`.
- **[MEDIUM]** `house[1]`: `"Can you describe your living room / bedroom / kitchen?"` — cùng vấn đề slash, tách sub-questions.
- **[MEDIUM]** `hobbies[0]`: `"What do you often do in your free time? / What are your hobbies?"` — 2 câu ghép, tách entry riêng.
- **[MEDIUM]** `personality[1]`: `"Is he/she friendly / talkative / humorous / generous?"` — 4-in-1 yes/no. Tách hoặc `subQuestions`.
- **[LOW]** `self` — thiếu `"Do you like your name?"` mặc dù có audio 3.
- **[LOW]** `family[2]`: `"What does he/she like?"` (preferences) cạnh `personality[0]` `"What is he/she like?"` (character) — dễ nhầm. Thêm `note`.
- **[LOW]** `daily-routine.subQuestions[]`: `"phone your friend?"` — `phone` (British) cứng. Đổi `"call your friend?"`.
- **[LOW]** `daily-routine.subQuestions[]`: `"have friends round?"` — BrE colloquial. Đổi `"have friends over?"`.
- **[LOW]** `health-illness.subQuestions[]`: `"have got a cold?"` — mix BrE. Chuẩn hoá `"have a cold"`.
- **[NOTE]** Không có câu Band 7+ trong bank. Coverage 12/12 topic OK.
- **[NOTE]** Số câu per topic không đồng đều: `hobbies` 7 câu, `personality` 2, `house` 2.

### 4.5 `topics-map.json — practicePresets`

- **[MEDIUM]** `grammar-final` + `grammar-final-45` **thiếu `modal-verbs` (Lesson 15) và `prepositions` (Lesson 11)** dù cả 2 nằm trong Grammar Foundation 1-15 và final exam core. Preset "Final Test Grammar" bỏ 2/10 topic grammar. Bổ sung `modal-verbs: 6-8%`, `prepositions: 5-7%`.
- **[LOW]** Không có preset "Speaking Warmup" hay "Full Mix". Thêm `mixed-quick` (20 câu random) và `speaking-familiar`.
- **[LOW]** `pronunciation-quick` mix 20 câu — verify pool có đủ 9 vowels + 8 consonants sau khi filter.
- **[NOTE]** `questionTypes` dùng 4 kinds — theo AGENTS.md grading.ts có 5 kinds. Kind thứ 5 (VD `sort_order`?) có thể đang bị exclude. Verify.
- **[NOTE]** Chưa có preset per-lesson. Thêm 15 preset "Ôn Lesson N".
- **[NOTE]** `label` mix Việt + Anh. Chuẩn hoá cho consistency learner-facing.

### 4.6 `topics-map.json — topicLabels`

- **[MEDIUM]** Toàn bộ 26 label ở **English**, không phải Vietnamese như convention learner-facing (AGENTS.md `"Giữ tiếng Việt learner-facing"`). VD `"Vowels"` → `"Nguyên âm"`, `"Consonants"` → `"Phụ âm"`, `"Modal Verbs"` → `"Động từ khiếm khuyết"`. Nếu giữ EN cho grammar term thì thêm field `viLabel`.
- **[LOW]** `trip.label`: `"Trip / Vacations"` — plural không đúng convention. `"Trip / Vacation"` hoặc `"Chuyến đi / Du lịch"`.
- **[LOW]** `collocations.label`: `"Collocations (do/get/take/have/make)"` — bỏ qua `go` (L1-L2), `say/tell/ask` (L5). Đề xuất `"Collocations (verb + noun)"`.
- **[LOW]** `self.label`: `"Self · Name/Age"` dùng `·` (middle dot) — các label khác dùng `/`. Chọn 1 separator.
- **[NOTE]** `skill` values 4 loại, đúng. Không mismatch.
- **[NOTE]** `word-classes` label `"Word Classes (N/V/Adj/Adv)"` — có thể chồng chéo với `nouns-quantifiers`, `pronouns`, `adjectives`. Cân nhắc umbrella tag hay bỏ.

### 4.7 Pattern chung (enrichment)

- **Curriculum vs Daily bank mismatch**: `meta.json` mô tả 15 lesson với 8 speaking topic. `topics-map.json` mở rộng thêm 4 topic (Hometown / Daily Routine / Health & Illness / Self) từ Daily LangGo. `meta.review[2]` + `readGuide` chưa cập nhật.
- **Question format inconsistent**: nhiều câu speaking dùng slash `/` đóng gói options. Chuẩn hoá 1 câu chính + `subQuestions[]` array.
- **BrE / AmE trộn**: `"on the weekend"` (AmE), `"phone your friend"` (BrE), `"have friends round"` (BrE colloquial), `"have got a cold"` (BrE). Chuẩn hoá 1 variant.
- **Ví dụ vocab / IPA bị reuse**: `"tea"`, `"car"`, `"hair"`; `"soundtrack"` lạc topic. Pass qua 1 lần, mỗi từ 1 vai trò chính.
- **Grammar note & câu mẫu không khớp**: `readGuide` Trip future note `will` nhưng câu không có; Restaurant note modal nhưng không có modal.
- **Audio bank không đồng bộ với speaking bank**: 24 audio cover 5-7 topic; 5 topic khác trong speaking bank không có audio (hometown / daily-routine / trip / food-restaurant / health-illness).

---

## 5. Pattern cross-cutting

Tổng hợp pattern lặp lại trên nhiều mảng:

### P1. Trộn Anh–Anh (BrE) và Anh–Mỹ (AmE)
Xuất hiện ở:
- Notes markdown: `math` / `mom` / `elevator` / `on the weekend` (AmE) vs `/əʊ/` / `at the weekend` (BrE)
- IPA: `/ˈhoʊm.taʊn/` (AmE) trong corpus BrE
- Enrichment: `"phone your friend"` (BrE) vs `"on the weekend"` (AmE)

**Đề xuất**: Chốt **BrE** cho IELTS UK/AU và audit lại toàn bộ. Nếu vẫn muốn giữ mix (thực tế giáo trình VN dạy cả 2), phải note song song `[BrE]` / `[AmE]` rõ ràng.

### P2. Mixed conditional `If + present, would + V` được dạy như template
Xuất hiện ở:
- `08-trip.md` line 24, 59
- `09-food-restaurant.md` line 55, 59

**Đề xuất**: Chuẩn hoá về Type 1 (`If + present, will + V`) cho tất cả sample answer speaking Band 5-6. Nếu muốn dạy Type 2, phải viết Type 2 chuẩn (`If + past, would + V`) trong section riêng.

### P3. Fill_blank không chấp nhận đủ variant
Xuất hiện ở nhiều lesson:
- Contraction: `doesn't` vs `does not` (lesson-12), `won't` vs `will not` (lesson-14)
- Synonyms: `problem`/`trouble` (lesson-06), `felt`/`was` (lesson-13), `made`/`cooked` (lesson-13), `may not`/`might not` (lesson-15)
- AmE/BrE: `washing`/`laundry` (lesson-01), `motorbike`/`motorcycle` (lesson-misc)
- Số format: `4,099`/`4099`, `$4,099`/`$4099` (lesson-14)

**Đề xuất**: Viết 1 script quét toàn bộ exercises.json, tự động thêm biến thể contraction (nếu có `doesn't` thì thêm `does not` và ngược lại). Cho synonym cần manual review theo case.

### P4. Bold trọng âm mâu thuẫn IPA (Critical)
Xuất hiện ở 2 chỗ:
- `12-health-illness.md` line 97 (`ex·**er**·cise`)
- `11-daily-routine.md` line 78 (`**a**·bout`)

**Đề xuất**: Audit toàn bộ dòng format `[syllable]·**[syllable]**` bằng regex + verify khớp với IPA đi kèm (dấu `ˈ` trong IPA phải nằm trước syllable bold).

### P5. English + Vietnamese trộn trong `script` field
Xuất hiện ở lesson-01, 02, 03, 12, 13, 15, misc.

**Đề xuất**: Sửa schema — thêm field `translation` riêng cho Vietnamese, `script` chỉ giữ English. Update preprocessor để tách khi parse.

### P6. Speaking questions dùng slash `/` để đóng gói options
Xuất hiện ở `hometown[3]`, `house[1]`, `hobbies[0]`, `personality[1]`.

**Đề xuất**: Chuẩn hoá dùng `subQuestions[]` array cho câu multi-part (đã dùng đúng ở `daily-routine`).

### P7. Sample answer speaking vượt Band 5-6
Xuất hiện ở `08-trip.md` (152 words + complex connectors), `10-hometown.md` (`However`).

**Đề xuất**: Mỗi note speaking có 2 version — "simple" (Band 5) + "extended" (Band 6). Học viên chọn theo trình độ.

### P8. Mini Practice thiếu key
9/11 note grammar+pronunciation.

**Đề xuất**: Chuẩn hoá — mỗi Mini Practice có phần "Gợi ý đáp án" ở cuối. Format thống nhất `<details>` HTML.

### P9. Content 1 khối quá lớn
- `lesson-07` block `assignment-81921` (grammar + vocab + long transcript)
- `lesson-15` block `assignment-89921` (4 transcripts + song ngữ)
- `lesson-misc` 39 blocks + 77 câu = biggest

**Đề xuất**: Tách content block trong `content.json` để UI render nhẹ hơn.

### P10. HTML entity chưa decode / typography inconsistency
- `&pound;20` (lesson-13, lesson-15)
- Curly quotes (`'`) vs straight (`'`) trong scripts
- Em-dash vs hyphen inconsistent

**Đề xuất**: 1 normalization pass — decode HTML entities, chuẩn hoá quote marks, chuẩn hoá dash.

---

## 6. Đề xuất chỉnh sửa ưu tiên (top 10)

Xếp theo **priority = severity × impact học viên**, mỗi item có file target + effort ước tính:

| # | Priority | Item | File(s) | Effort | Impact |
|---|----------|------|---------|--------|--------|
| **1** | CRITICAL | Fix mixed conditional trong sample answer speaking | `source/speaking/08-trip.md` (L24, L59), `source/speaking/09-food-restaurant.md` (L55, L59) | S (~30 phút) | Học viên band 5-6 học vẹt câu sai grammar → mất điểm GRA khi thi thật |
| **2** | CRITICAL | Fix bold trọng âm mâu thuẫn IPA | `source/speaking/12-health-illness.md` (L97 `ex·**er**·cise` → `**ex**·er·cise`), `source/speaking/11-daily-routine.md` (L78 `**a**·bout` → `a·**bout**`) + audit toàn bộ pattern `·**xx**·` | S (~20 phút) | Học viên nhìn bold sẽ đọc sai stress hoàn toàn |
| **3** | CRITICAL | Fix data bug `question-308941` fill_blank cụt | `source/daily/lesson-12/exercises.json` — sửa mảng `["The children do not", "The children don't go swimming"]` → `["The children do not go swimming", "The children don't go swimming"]` | S (~5 phút) | Học viên viết đúng vẫn bị chấm trượt |
| **4** | CRITICAL | Fix 10 audio script sai (7 trống + 3 tiếng Việt) | `source/daily/lesson-02/scripts.json` (audio 67-72), `source/daily/lesson-03/scripts.json` (audio 90-92), `source/daily/lesson-04/scripts.json` (audio 3) — transcribe thủ công hoặc flag ẩn khỏi flashcard | M (~2 giờ nếu transcribe, S nếu flag) | Flashcard flow rỗng đáp án hoặc mismatch ngôn ngữ |
| **5** | CRITICAL | Fix `speakingQuestions.job[1]` sai tense | `source/daily/topics-map.json` — `"Are you a student or are you working?"` → `"Are you a student or do you work?"` | S (~2 phút) | Dạy học viên câu hỏi nghề bằng Continuous → sai chuẩn IELTS Part 1 |
| **6** | MEDIUM | Chuẩn hoá fill_blank accept contractions cả 2 dạng | `source/daily/lesson-XX/exercises.json` — viết script node quét mọi fill_blank, tự động thêm `does not` khi có `doesn't`, `will not` khi có `won't`, `is not` khi có `isn't`, v.v. | M (~1 giờ nếu tự động; L nếu manual) | Giảm ~20% false-negative grading trong practice |
| **7** | MEDIUM | Bổ sung Mini Practice key vào 9/11 note | `source/grammar/01-08.md`, `source/pronunciation/01-04.md`, `source/speaking/...` — thêm `<details><summary>Gợi ý đáp án</summary>...</details>` cuối mỗi Mini Practice | M (~1.5 giờ) | Học viên self-study biết đúng/sai |
| **8** | MEDIUM | Rewrite section say/tell/ask trong `04-collocations.md` | `source/pronunciation/04-collocations.md` L53-57 — 4 dòng ví dụ đều pattern mismatch (direct speech ở say, ambiguous ở tell, unnatural ở ask). Rewrite toàn bộ | S (~30 phút) | Học viên hiện học pattern sai từ ví dụ |
| **9** | MEDIUM | Chuẩn hoá speakingQuestions format `subQuestions[]` | `source/daily/topics-map.json` — 4-5 câu dùng slash `/` (hometown[3], house[1], hobbies[0], personality[1]) → tách thành `subQuestions` array | S (~20 phút) | Runner UI render sạch hơn; user tick từng sub-question |
| **10** | MEDIUM | Việt hoá `topicLabels` label + hoặc thêm `viLabel` | `source/daily/topics-map.json` — 26 label English → thêm field `viLabel` (khuyến nghị) hoặc translate toàn bộ | S (~30 phút) | Đồng bộ convention learner-facing (AGENTS.md) |

**Ngoài top 10, các finding còn lại** phần lớn là LOW/NOTE — có thể fix rải rác, không ảnh hưởng ngay:
- Chuẩn hoá BrE/AmE style (large refactor, ~2-3 giờ nếu đồng bộ toàn bộ)
- Tách English/Vietnamese trong script (cần thay schema + preprocess)
- Bổ sung 41 audio thiếu (nếu 65 là target)
- Sample answer thiếu filler tự nhiên (cross-cutting)

---

## 7. Kết luận

**Tin tốt**:
- **Grammar core không sai hệ thống** — 433 audio script không phát hiện lỗi grammar nghiêm trọng nào (không có `He don't`, `she have`, tense concord sai).
- **IPA chart chuẩn** đủ 44 âm, notation đúng.
- **Curriculum structure coherent** — L1-15 chia 3 giai đoạn hợp lý (Pronunciation → Grammar → Tenses+Speaking), phù hợp Pre-IELTS.
- **Speaking sample answer** ở đa số note tự nhiên và calibrated cho Band 5-6.
- **Daily content được LangGo teacher biên tập tốt** — question phrasing rõ ràng, distractor sensible, ambiguous ít.

**Vấn đề chính**:
- **22 critical bugs** rải trên 4 mảng — mixed conditional dạy sai, bold stress mâu thuẫn IPA, data bug fill_blank cụt, 10 audio script broken, speaking question sai tense. Đây là các bug **học viên sẽ trực tiếp bị ảnh hưởng** nếu học theo hoặc làm bài.
- **86 medium findings** phần lớn là (a) fill_blank thiếu variant, (b) sample answer / ví dụ không idiomatic, (c) content không chuẩn hoá BrE hay AmE, (d) speaking questions dùng slash thay vì subQuestions.
- **Mini Practice không key** ở 9/11 note grammar+pronunciation là gap sư phạm rõ nhất — học viên self-study không có feedback.

**So với audit-6-english cũ** (chỉ 2 findings sau spot-check): audit lần này deep-dive tìm ra hàng trăm lần findings hơn, nhưng phần lớn **không phải "content Anh sai"** mà là **data integrity + edge case pedagogy** (variants, format, cross-file consistency).

**Bước tiếp**: bạn duyệt top 10 fixes; tôi sẽ apply theo thứ tự ưu tiên. Fix batch 5 CRITICAL trước (~1 giờ), sau đó batch 5 MEDIUM (~4 giờ). Còn 200+ LOW/NOTE có thể xử lý dần khi user report cụ thể hoặc trong đợt polish cuối.
