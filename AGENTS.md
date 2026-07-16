# Agent Notes

## Project Shape

Repo hiện có **2 stack song song** trong quá trình migrate:

- **React app (chuẩn mới, active)**: `next/` — Vite + React 19 + TypeScript + Tailwind + shadcn/ui + Zustand + React Router 6 (HashRouter). Deploy target = GitHub Pages qua `.github/workflows/deploy.yml`.
- **Vanilla app (legacy, giữ để reference)**: `web/` + `build.mjs` + root `index.html`. Vẫn build được (`npm run build` ở repo root) nhưng không còn được active phát triển.

Content chung ở `source/` (markdown + JSON). Cả 2 stack đều đọc từ đó.

**Scope hiện tại**: Lesson 1–15 Notes + 16 daily lessons (L1-15 + `lesson-misc` Break/ôn) + Final Practice generator.

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

## React pipeline (`next/`, chuẩn hiện tại)

- **Preprocess**: [next/scripts/preprocess.mjs](next/scripts/preprocess.mjs) port từ vanilla `build.mjs`. Đọc `source/` → sinh typed TS modules vào `next/src/data/`:
  - `notes.ts` — 26 docs + meta + audio bank + IPA.
  - `topics.ts` — topicsIndex + topicLabels + speakingQuestions + presets.
  - `daily-index.ts` — 16 LessonSummary.
  - `daily/lesson-XX.ts` — 16 Lesson chunks (lazy import).
  - `daily-loader.ts` — key → () => Promise<Lesson>.
- **Asset serving**: [next/scripts/vite-plugin-assets.mjs](next/scripts/vite-plugin-assets.mjs). Dev: middleware serve `/audio/*` + `/source/daily/*/images/*` từ repo root. Build: copy sang `next/dist/`.
- **Types**: [next/src/types/content.ts](next/src/types/content.ts) — Question, Block, Lesson, TopicRef, Preset...
- **Router**: HashRouter → `/#/daily/lesson-01`. 12 routes (Landing, Course, 3 Notes, Final, Daily index/detail, Topics index/detail, Practice/Runner/Result).
- **State (Zustand)**:
  - `data.ts` — thin selector over generated data.
  - `practice.ts` — current session (sessionStorage).
  - `history.ts` — max 50 entries (localStorage persist, key `ielts-practice-history`).
  - `flashcard.ts` — Leitner per scope (`ielts-flashcard-progress`).
  - `progress.ts` — Final Review checklist (`ielts-final-progress`).
  - `theme.ts` — light/dark/system (`ielts-theme`).
  - `ui.ts` — search + mobile menu.
- **Grading**: [next/src/lib/grading.ts](next/src/lib/grading.ts) — 5 kinds. Fill_blank normalize case + whitespace.
- **Sampling**: [next/src/lib/sample-pool.ts](next/src/lib/sample-pool.ts) — seeded Mulberry32 + largest-remainder rounding.
- **Markdown**: [next/src/lib/markdown.ts](next/src/lib/markdown.ts) — mdToHtml → `dangerouslySetInnerHTML`.
- **UI**: shadcn/ui components handcrafted trong [next/src/components/ui/](next/src/components/ui/).

## Legacy vanilla pipeline (`build.mjs`, still functional)

Giữ để reference / rollback. Đầu vào giống hệt (`source/`). Output: root `index.html` + `dist/daily/lesson-XX.js`. Không active phát triển. Chi tiết pipeline cũ:

1. `loadDir()` — Notes markdown.
2. `loadDaily()` normalize lesson + tag topics + build topicsIndex.
3. Emit `dist/daily/lesson-XX.js` chunks + inline `__DATA__`.
4. Concat 4 module JS + replace 3 markers trong `web/template.html`.

Client: `web/app.js` (shell + Notes) + `web/daily.js` + `web/topics.js` + `web/practice.js` extend qua `window.APP`.

## Commands

**React (chuẩn)**:

```bash
cd next
npm install
npm run dev       # http://localhost:5173
npm run build     # tsc -b && vite build → next/dist
npm run preview   # local preview
```

**Vanilla legacy**:

```bash
npm run build     # ở repo root, output → index.html + dist/daily/*.js
npm start         # build + http-server
```

**Audit scripts** (giữ ở repo root `scripts/`):

```bash
node scripts/audit-media.mjs
node scripts/audit-curriculum.mjs
node scripts/audit-data.mjs
```

Không có test / lint / CI ngoài GH Pages deploy (`.github/workflows/deploy.yml`).

## Editing Guidance (React chuẩn)

- Giữ tiếng Việt learner-facing.
- Notes-first UI: reveal câu đúng chỉ ở Practice runner + result. Study/Exercises tabs của Daily luôn hiển thị đáp án (đây là chế độ ôn).
- Khi thêm lesson daily: thả folder chuẩn vào `source/daily/lesson-XX/` (manifest + 5 json + audio + images + raw) rồi restart `npm run dev` để `predev` sinh lại `src/data/`.
- Sửa taxonomy → `source/daily/topics-map.json` → restart dev.
- Thêm route mới: (1) thêm entry vào [next/src/lib/nav.ts](next/src/lib/nav.ts) NAV array, (2) tạo page component trong `next/src/pages/`, (3) add `<Route>` trong [next/src/App.tsx](next/src/App.tsx).
- Thêm Notes audio: file vào `audio/`, entry vào `web/enrich/audio.json` (React app đọc chung file này qua preprocess). Map theo số `num` khớp với `[[audio:N]]` marker trong markdown.
- Thêm shadcn/ui component mới: handcraft vào `next/src/components/ui/` (không dùng `npx shadcn add` vì network flaky).

## Common Pitfalls

- **HashRouter đường dẫn**: URL luôn có `#/`. `<Link to="/daily">` → `#/daily`. Đừng dùng `BrowserRouter` vì GH Pages sẽ 404 trên deep links.
- **File path assets**: audio ở `audio/daily/lesson-XX/...` + image ở `source/daily/lesson-XX/images/...`. Preprocess giữ nguyên path → `assetsPlugin` serve/copy tương ứng. Đừng đổi convention.
- **Preprocess không watch**: sửa file trong `source/` thì phải restart `npm run dev` để chạy lại `predev` hook. Không tự động hot-reload data.
- **`src/data/` là generated**: đã gitignore, không commit.
- **TypeScript 6+ deprecates `baseUrl`**: chỉ dùng `paths` alone trong tsconfig.

### Legacy vanilla pitfalls (chỉ áp dụng nếu edit `web/`)

- `</script>` trong template literal → viết `<\/script>` để escape.
- Lazy load qua `<script src>` chạy trên `file://`; đừng chuyển sang `fetch()`.
- Không lint script inside HTML, chỉ catch qua `new Function()`.

## GitHub

- Remote `origin`: `https://github.com/khanhtb1306/ielts-foundation-notes.git` (private, default `main`).

## Experimental / Not Yet Wired

- Không còn — mọi thứ đã wired vào routes.

## Roadmap

- [x] Fine-tune per-question topic tagging (đã cải thiện trong audit Phase 7 — thu hẹp `noteKeywords`, thêm compound domain keywords).
- [x] Thêm markdown notes cho `hometown`, `daily-routine`, `health-illness` (đã có).
- [x] Migrate sang React (10 milestone M0-M10 đã complete — `next/`).
- [ ] Sau khi verify React version stable, xoá vanilla `web/` + `build.mjs` + root `index.html` + `dist/` cũ.
- [ ] Fuse.js fuzzy search cross-page (M9 skip).
- [ ] Prereq badge trên Daily card + "Giáo viên nói gì" section trong Topic detail (cần schema migration).
- [ ] Extract text từ `slides/*.pptx` để cross-check curriculum (optional, cần dev-dep).
