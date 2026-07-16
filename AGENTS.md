# Agent Notes

## Project Shape

- Static offline Pre-IELTS notes + daily practice app. Runtime entrypoint = root `index.html` (self-contained; kể cả mở `file://`).
- **Không bao giờ sửa `index.html` bằng tay** — đó là output của `build.mjs`.
- Content ở `source/`, presentation ở `web/`, build ở `build.mjs`. Bundle output = `index.html` (inline) + `dist/daily/lesson-XX.js` (lazy-loaded chunks).
- Scope hiện tại: Lesson 1–15 Notes + 16 daily lessons (L1-15 + `lesson-misc` Break/ôn) + Final Practice generator.

## Content sources

### Notes (markdown)
- `source/pronunciation/*.md`
- `source/grammar/*.md`
- `source/speaking/*.md`
- Frontmatter: `title`, `lesson`, `priority` (high|normal), `vi`.
- File name prefix `NN-` giữ thứ tự (`orderOf()`).

### Notes enrich (json)
- `web/enrich/meta.json` — goals, principles, course map, final review, vocab bank, read guide.
- `web/enrich/audio.json` — audio bank cho Speaking (`[[audio:N]]` marker trong markdown).
- `web/enrich/ipa.json` — IPA chart data.

### Daily (json) — Nguồn: LangGo Challenge API đã normalize
Mỗi lesson một folder `source/daily/lesson-XX/`:
- `manifest.json` — challenges của lesson (id, title, note, deadline, totalQuestion, rawFile).
- `content.json` — content blocks với `rawHtml`, `audioRefs`, `imageRefs`.
- `exercises.json` — questions kèm submission đã có (userAnswer/correctAnswer/resultAnswer).
- `scripts.json` — audio transcripts (đã cover với audio manifest).
- `submission.json` — điểm + comment + userAnswer full.
- `audio/manifest.json` — mỗi audio có `sourceUrl` + `localFile` + `script`.
- `images/manifest.json` — mỗi image `url` + `localFile`.
- `raw/challenge-NN-XXXXX.json` — bản gốc để build trích `answer.answers[]` (options + đáp án).

### Daily taxonomy
- `source/daily/topics-map.json` — sửa tay:
  - `topicLabels`: `{ key: { label, skill, needsNotes? } }`
  - `noteKeywords`: `{ "chuỗi lowercase trong note": ["topic-key", ...] }`
  - `lessonTopicHints`: `{ "lesson-XX": ["topic-key", ...] }`  (topic đầu = core, các topic sau = review)
  - `questionOverrides` / `blockOverrides`: `{ "question-XXX": [{ key, role }] }`
  - `speakingQuestions`: bộ câu hỏi Final Speaking Test.
  - `practicePresets`: preset cho generator (`id, label, totalQuestions, mix[{topic,percent}], questionTypes`).

## Build pipeline (`build.mjs`)

Main steps:
1. `loadDir('pronunciation'|'grammar'|'speaking')` — Notes markdown.
2. `loadDaily()`:
   - Đọc `topics-map.json` → tạo `ctx` (noteKeywords, hints, overrides, speakingQuestions, presets).
   - Với mỗi `lesson-XX/`: `normalizeLesson()` = merge content + exercises + submission + raw challenges (để lấy options) + audio/image manifests. Tag topics qua `tagWithTopics()`. Group exercises theo challenge.
   - Emit `dist/daily/lesson-XX.js` (chunk `window.__DAILY__[key]`).
   - Build `topicsIndex` (chỉ chứa refs `{ lessonKey, kind, itemId, role, qkind }`, giữ inline nhẹ).
3. Concat 4 module JS: `app.js` + `daily.js` + `topics.js` + `practice.js` + bootstrap `window.APP.init()`.
4. `safeJson()` escape `</script>` để nhúng an toàn.
5. Replace 3 marker trong `template.html`: `/*__STYLES__*/`, `/*__DATA__*/`, `/*__APP__*/`.

## Client architecture

**`web/app.js`** publish `window.APP` — shell + Notes:
- `APP.state = { page, opts }`, `APP.data = { docs, meta, audio, ipa, dailyIndex, topicsIndex, topicLabels, speakingQuestions, presets }`.
- `APP.NAV`, `APP.TITLE`, `APP.SUB`, `APP.EYEBROW`, `APP.renderers`, `APP.wirers` — extend qua `push()` / assignment.
- `APP.helpers.{el, esc, inline, slug, mdToHtml, audioHtml, audioById, speak, dictLookup, playUrl, ...}`.
- `APP.go(page, opts)`, `APP.render(scrollToId)`, `APP.buildNav()`, `APP.init()`.
- `render()` async: renderer trả string hoặc Promise<string>.

**`web/daily.js`** — Daily · By Lesson:
- `APP.loadDailyLesson(key)` — inject `<script src="dist/daily/lesson-XX.js">`, cache vào `window.__DAILY__`.
- Renderers: `daily` (index 16 card), `daily-lesson` (detail + tabs Study/Exercises/Flashcard).

**`web/topics.js`** — Daily · By Topic:
- Renderers: `topics` (grouped by skill), `topic-detail` (aggregates via refs, tab Study/Exercises/Flashcard/Speaking Q).

**`web/practice.js`** — Final Practice:
- `samplePool({ mix, total, seed, questionTypes, roles })` — seeded random per topic, largest-remainder rounding.
- Session lưu `sessionStorage`. History lưu `localStorage` (`ielts-practice-history`, max 50).
- Renderers: `practice` (form + preset picker + 5 phiên gần nhất), `practice-runner` (question-by-question), `practice-result` (score + breakdown + review sai).
- Grading: single_choice/multi_select bằng ID; fill_blank case-insensitive normalize; matching bằng rightId.

## Commands

- Build: `npm run build`
- Dev serve: `npm start` (build + http-server) hoặc `npm run serve`
- Syntax check bundle:
  ```
  node -e "const fs=require('fs'); const h=fs.readFileSync('index.html','utf8'); [...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].forEach((m,i)=>{try{new Function(m[1]);console.log('#'+i+':OK')}catch(e){console.error('#'+i+':'+e.message)}})"
  ```

Không có test / lint / CI.

## Editing Guidance

- Giữ tiếng Việt learner-facing.
- Notes-first UI, chỉ page `practice` mới có interactive quiz.
- Không sửa `index.html` bằng tay.
- Khi thêm lesson daily: thả folder chuẩn (manifest + 5 json + audio + images + raw) rồi build.
- Sửa taxonomy → `source/daily/topics-map.json` → build.
- Thêm route mới: append `NAV`, `TITLE`, `SUB` vào từng `bootXxx()` module IIFE, add renderer + wirer. Đừng đụng vào `app.js` cho page mới.
- Thêm Notes audio: file vào `audio/`, entry vào `web/enrich/audio.json` (map theo số câu trong markdown).
- Thêm accent color cho page mới: sửa `styles.css` phần `.app[data-page="X"]`.

## Common Pitfalls

- **`</script>` trong template literal** sẽ đóng tag `<script>` sớm. Luôn viết `<\/script>` trong `.js` khi có tag script trong string.
- **File path relative**: audio ở `audio/daily/lesson-XX/...` (repo root). Image ở `source/daily/lesson-XX/images/...`. Cả 2 relative từ `index.html` ở repo root — không đụng.
- **Lazy load qua `<script src>` chạy trên `file://`** vì browser cho phép; nhưng `fetch()` thì không. Đừng chuyển sang fetch.
- **Không lint script inside HTML**: chỉ có thể catch lỗi qua `new Function()` — chạy sanity check sau mọi build.

## GitHub

- Remote `origin`: `https://github.com/khanhtb1306/ielts-foundation-notes.git` (private, default `main`).

## Experimental / Not Yet Wired

- Không còn — mọi thứ đã wired vào routes.

## Roadmap

- [ ] Fine-tune per-question topic tagging (hiện đang tag theo challenge, over-tag khi challenge cover nhiều topic).
- [ ] Thêm markdown notes cho `hometown`, `daily-routine`, `health-illness` (đánh dấu `needsNotes: true`).
- [ ] Cân nhắc migrate sang React sau khi feature ổn định.
