# Ghi chú cần user quyết định

_Log ambiguous decisions & deferred proposals. Không phải mọi mục đều blocker — nhiều mục chỉ là note để bạn biết trạng thái._

## Tổng kết audit + fix (Phase 0 → 9)

Đã hoàn tất 10 phase. Tất cả audit report ở [notes/audit-*.md](notes/). Bundle build xanh, syntax check pass mọi lần.

### Metrics thay đổi

| Metric | Baseline | Sau audit |
|---|---|---|
| Notes markdown | 25 | 26 (+word-classes) |
| Blocks tagged | 108/140 | 106/140 |
| Questions tagged | 249/318 | 247/318 |
| Topics | 26 | 26 |
| Curriculum findings | 13 | 3 (all expected) |
| Media findings | 39 | 20 (all LOW false-positive) |
| Data integrity findings | 7 | 7 (all D3, known LangGo API gap) |
| Web/UX bugs | 2 real | 0 (fixed W1 + W2) |
| English accuracy bugs | 2 | 0 (fixed) |

### Code changes committed to workspace (chưa `git commit`)

- [web/daily.js](web/daily.js) — W1 fix: `loadDailyLesson` clear pending on failure để retry được.
- [web/practice.js](web/practice.js) — W2 fix: history entry lưu `detail` để result screen xem được câu sai cho history.
- [source/daily/topics-map.json](source/daily/topics-map.json) — Phase 7 taxonomy fixes: trim noteKeywords, add compound keywords, fix lessonTopicHints per pedagogical assessment; Phase 8 cleared word-classes needsNotes flag.
- [source/pronunciation/*.md](source/pronunciation/) — 4 notes: teacher intro added, 04-collocations "do a business with" → "do business with".
- [source/grammar/*.md](source/grammar/) — 9 grammar notes: teacher intro added. New note `00-word-classes.md` written.
- [source/speaking/*.md](source/speaking/) — 10-hometown stress fix, 03-family + 07-weekend + 09-food-restaurant frontmatter `lessons:` mapping accuracy.

## Vẫn cần bạn quyết định

### Q1 — Extract pptx slides?

Repo có `slides/Lesson 1.pptx` → `Lesson 15.pptx` (15 file, ~70 MB). Chưa wire vào app.

- **A**: Extract text từ pptx → cross-check với Notes/Daily. Cần thêm dev-dep (`pizzip` + `xml2js` hoặc parse thủ công XML). Est. 30-60 min work.
- **B**: Bỏ qua. Curriculum mapping hiện tại đã cover Notes + Study blocks + Daily + Speaking (4 lớp).
- **Đang chọn**: B (bỏ qua).

Ping tôi nếu muốn A.

### Q2 — Fill 7 missing audio scripts trong lesson-02 + lesson-04?

Đã note trong `source/daily/script-coverage-report.json`: API LangGo không trả script cho 7 audio.

- **A**: Tôi suy luận từ block text xung quanh (best-effort, không nghe được mp3) → có thể sai. 
- **B**: Chấp nhận silent audio (UI play được, chỉ thiếu transcript).
- **Đang chọn**: B.

### Q3 — Rename `07-weekend.md` → `07-hobbies.md`?

Đã tạm giữ tên file, chỉ update `title` frontmatter thành "Hobbies · Weekend & Free time". Nếu rename thật:

- Pro: filename slug khớp topic key `hobbies` → auto-tagger khớp.
- Con: breaking URL nếu ai đang bookmark note trong app.
- **Đang chọn**: giữ nguyên filename, đã cải thiện title.

### Q4 — Deferred code changes (Phase 9)

3 tính năng cần schema migration + code, chưa apply:

- **Prereq badge trên Daily card**: thêm `topicLabels[key].prereqNotes` → render badge "Đọc note X trước" trong Daily · By Lesson index.
- **"Giáo viên nói gì" section trong Topic-detail**: thêm `topicLabels[key].teacherNote` → render section trong topic detail page.
- **Cross-link Notes ↔ Topic**: tăng UX nhưng cần code trong `web/topics.js` để show related note file.

Ping tôi nếu muốn apply bất kỳ cái nào.

### Q5 — 3 remaining curriculum findings (MEDIUM, by-design)

- `hometown`, `daily-routine`, `word-classes` có note nhưng 0 daily question tag. Đây là **by-design**:
  - `hometown` + `daily-routine`: pure speaking topic, dùng qua speakingQuestions bank chứ không qua daily exercises.
  - `word-classes`: meta-topic (bao adjectives + adverbs + nouns...). Practice bank có thể tag double vào adjectives + word-classes nhưng cần user override tay.

Không action. Nếu muốn `word-classes` có practice, cần bạn manually tag một số câu adjectives → word-classes.

### Q6 — Roadmap `AGENTS.md` cần update

Roadmap hiện tại có:

```
- [ ] Fine-tune per-question topic tagging (hiện đang tag theo challenge, over-tag khi challenge cover nhiều topic).
- [ ] Thêm markdown notes cho `hometown`, `daily-routine`, `health-illness` (đánh dấu `needsNotes: true`).
- [ ] Cân nhắc migrate sang React sau khi feature ổn định.
```

Ba dòng đầu đã lỗi thời:
- Line 1: tagging đã fine-tune trong Phase 7.
- Line 2: 3 note đã có sẵn (pull trước đó), `needsNotes: true` cleared cho word-classes trong Phase 8.

**Đề xuất update `AGENTS.md` Roadmap** — nếu bạn OK tôi sẽ apply.

## Files phụ trợ sinh trong quá trình audit (không commit)

Tôi để trong `scripts/` để chạy lại bất kỳ lúc nào:

- `scripts/audit-media.mjs` — Phase 1 media integrity audit.
- `scripts/audit-curriculum.mjs` — Phase 3 curriculum mapping.
- `scripts/audit-data.mjs` — Phase 4 data integrity.

Chạy `node scripts/audit-*.mjs` bất kỳ lúc nào để verify.

## Bảo hành phase gần

Sau khi apply hết 10 phase fix, nếu bạn phát hiện:

- Regression daily rendering → chạy `node scripts/audit-data.mjs` để check.
- Practice pool empty → check topicsIndex sau build (`Topics: 26 topics (tagged: 106/247)` từ stdout).
- Note không render đúng → syntax check bundle (`node -e "..."`) — đã pass sau mỗi phase.
