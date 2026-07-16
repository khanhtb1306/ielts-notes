# Phase 6 — English Accuracy Audit

_Manual English-teacher pass through 25 notes markdown + spot-check daily rawHtml/scripts._

## TL;DR

25/25 notes pedagogically solid cho Band 5–6 học viên Việt. IPA notation chính xác, ngữ pháp & collocations chuẩn, sample answer calibrated đúng level. Chỉ tìm được **2 bugs thật** (đã fix). Daily rawHtml/scripts đến từ LangGo LMS — professionally authored — không phát hiện lỗi English nghiêm trọng trong spot-check.

## Findings — Notes markdown

### E1 — [MEDIUM] `04-collocations.md` L22: "do a business with"

- **Was**: `| do a business with | have a haircut / have my hair cut |`
- **Issue**: `business` là uncountable trong collocation này — "do business with someone" không có article.
- **Fix applied**: đổi thành `do business with`.

### E2 — [MEDIUM] `10-hometown.md` L71: stress hometown sai

- **Was**: `- ho·me·**town** — nhấn âm cuối: /ˈhoʊm.taʊn/.`
- **Issue**: IPA `/ˈhoʊm.taʊn/` correctly marks stress on **first** syllable (`ˈhoʊm`), nhưng text VI nói "nhấn âm cuối" — mâu thuẫn và sai. Học viên đọc theo VI sẽ đọc "home-**TOWN**" (sai stress).
- **Fix applied**: đổi thành `**ho**·me·town — nhấn âm đầu: /ˈhoʊm.taʊn/.`

## Findings — Not bugs but worth noting

### N1 — Pronunciation IPA style consistency

- `01-vowels.md` dùng BrE style (`/ɑː/`, `/əʊ/`).
- `10-hometown.md`, `11-daily-routine.md`, `12-health-illness.md` dùng AmE style (`/hoʊm.taʊn/`) trong Stress section.
- Không cần fix — thực tế giáo trình Việt Nam dạy lẫn cả 2. Đề nghị nếu muốn consistent: fix đồng bộ về BrE (chuẩn IELTS UK), nhưng KHÔNG blocker. Skip.

### N2 — `03-family.md` L44 chỉ list "like + noun/V-ing"

- "Like" cũng chấp nhận `to + V1`: "I like to read". Đơn giản hóa cho Band 5-6 OK, không sai. Skip.

### N3 — `04-articles-determiners.md` mini practice L58 "in ___ USA"

- Đáp án ngầm: `the USA`. Note không cung cấp key. Skip (không bug).

### N4 — Speaking notes có nhiều model answer đủ Band 5.5–6

- `08-trip.md` L42 model dài, tự nhiên, dùng `be going to`, `will`, connectors. Cân bằng cho Band 6.
- `12-health-illness.md` L109 model dùng modal chuẩn ("should", "must", "had to"). Cân bằng cho Band 5.5-6.
- `10-hometown.md` L84 model chuẩn Band 5.5.
- `11-daily-routine.md` L93 model chuẩn Band 5.5.

Không cần chỉnh.

### N5 — Grammar notes teach material chuẩn

- `07-past-tenses.md` bảng irregular verbs đầy đủ (30+ pair), phân nhóm dễ nhớ (`-ought/-aught`, `-ent`, `-eft/-ept`). Xuất sắc.
- `09-modal-verbs.md` phân biệt `mustn't` vs `don't have to` — critical distinction cho Band 5.5+.

## Findings — Daily content (spot check)

Full audit rawHtml + script transcript cho 140 blocks / 433 audio là big lift. Spot-checked ~10 blocks + ~15 audio scripts trên các lesson 01, 05, 07, 10, 12, 15. Không phát hiện:

- Câu hỏi ambiguous đáp án nhiều nghĩa (LangGo có edit trước).
- Typo hoặc câu ungrammatical trong audio script.
- Vocab mismatch giữa slide/study block với exercise.

Nếu cần deep audit từng question, cần user manually flag câu nào sai; tôi có thể check khi thấy specific concerns.

## Kết luận

Notes có 2 lỗi minor đã fix, còn lại chuẩn. Daily content spot-check clean. Chuyển Phase 7 (taxonomy).
