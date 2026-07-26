# Agent Notes

## Project Shape

Repo chia làm **4 nhóm thư mục**:

- **`1-code/`** — code. Chỉ có `1-code/next/` (Vite + React 19 + TypeScript + Tailwind + shadcn/ui + Zustand + React Router (HashRouter)). Deploy = GitHub Pages qua `.github/workflows/deploy.yml`. Legacy vanilla đã bị xoá.
- **`2-notes/`** — nội dung ôn tập nguồn: `grammar/`, `pronunciation/`, `speaking/` (markdown), `enrich/` (json), `audio/` (wav phản xạ Notes).
- **`3-daily/`** — học hàng ngày: `lessons/` (LangGo normalized), `audio/` (mp3), `slides/` (pptx).
- **`4-final/`** — ôn cuối khóa: `google-doc-pre-course/` (tài liệu giáo viên).

Ngoài ra: `scripts/` (audit/import/download).

**Scope hiện tại**: Notes + 20 daily sets (L1-19 + `lesson-misc`) + Final Practice generator + Final packet giáo viên.

## Content sources

### Notes (markdown)
- `2-notes/pronunciation/*.md`
- `2-notes/grammar/*.md`
- `2-notes/speaking/*.md`
- Frontmatter: `title`, `lesson`, `priority` (high|normal), `vi`.
- File name prefix `NN-` giữ thứ tự (`orderOf()`).

### Notes enrich (json)
- `2-notes/enrich/meta.json` — goals, principles, course map, final review, vocab bank, read guide.
- `2-notes/enrich/audio.json` — audio bank cho Speaking (`[[audio:N]]` marker trong markdown).
- `2-notes/enrich/ipa.json` — IPA chart data.

### Daily (json) — Nguồn: LangGo Challenge API đã normalize
Mỗi lesson một folder `3-daily/lessons/lesson-XX/`:
- `manifest.json` — challenges của lesson (id, title, note, deadline, totalQuestion, rawFile).
- `content.json` — content blocks với `rawHtml`, `audioRefs`, `imageRefs`.
- `exercises.json` — questions kèm submission đã có (userAnswer/correctAnswer/resultAnswer).
- `scripts.json` — audio transcripts (đã cover với audio manifest).
- `submission.json` — điểm + comment + userAnswer full.
- `audio/manifest.json` — mỗi audio có `sourceUrl` + `localFile` + `script`.
- `images/manifest.json` — mỗi image `url` + `localFile`.
- `raw/challenge-NN-XXXXX.json` — bản gốc để build trích `answer.answers[]` (options + đáp án).

### Daily taxonomy
- `3-daily/lessons/topics-map.json` — sửa tay:
  - `topicLabels`: `{ key: { label, skill, needsNotes? } }`
  - `noteKeywords`: `{ "chuỗi lowercase trong note": ["topic-key", ...] }`
  - `lessonTopicHints`: `{ "lesson-XX": ["topic-key", ...] }`  (topic đầu = core, các topic sau = review)
  - `questionOverrides` / `blockOverrides`: `{ "question-XXX": [{ key, role }] }`
  - `speakingQuestions`: bộ câu hỏi Final Speaking Test.
  - `practicePresets`: preset cho generator (`id, label, totalQuestions, mix[{topic,percent}], questionTypes`).

## React pipeline (`1-code/next/`)

- **Preprocess**: [1-code/next/scripts/preprocess.mjs](1-code/next/scripts/preprocess.mjs). Đọc `2-notes/`, `3-daily/lessons/`, `4-final/` → sinh typed TS modules vào `1-code/next/src/data/`:
  - `notes.ts` — docs + meta + audio bank + IPA + finalPacket.
  - `topics.ts` — topicsIndex + topicLabels + speakingQuestions + presets.
  - `daily-index.ts` — LessonSummary[].
  - `daily/lesson-XX.ts` — Lesson chunks (lazy import).
  - `daily-loader.ts` — key → () => Promise<Lesson>.
- **Asset serving**: [1-code/next/scripts/vite-plugin-assets.mjs](1-code/next/scripts/vite-plugin-assets.mjs). URL trình duyệt giữ ổn định (`/audio/*` ← `2-notes/audio`, `/audio/daily/*` ← `3-daily/audio`, `/source/daily/*/images/*` ← `3-daily/lessons`, `/final/google-doc-pre-course/*` ← `4-final`). Build copy sang `1-code/next/dist/`.
- **Types**: [1-code/next/src/types/content.ts](1-code/next/src/types/content.ts) — Question, Block, Lesson, TopicRef, Preset, FinalPacket...
- **Router**: HashRouter → `/#/daily/lesson-01`.
- **State (Zustand)**: `data.ts` (selector), `practice.ts` (session), `history.ts` (`ielts-practice-history`), `flashcard.ts` (`ielts-flashcard-progress`), `progress.ts` (`ielts-final-progress`), `theme.ts` (`ielts-theme`), `ui.ts` (search + menu).
- **Grading**: [1-code/next/src/lib/grading.ts](1-code/next/src/lib/grading.ts).
- **Sampling**: [1-code/next/src/lib/sample-pool.ts](1-code/next/src/lib/sample-pool.ts) — seeded Mulberry32.
- **Markdown**: [1-code/next/src/lib/markdown.ts](1-code/next/src/lib/markdown.ts) — mdToHtml (hỗ trợ ảnh + link) → `dangerouslySetInnerHTML`.
- **UI**: shadcn/ui components handcrafted trong `1-code/next/src/components/ui/`.

## Commands

Chạy từ repo root (script proxy sang `1-code/next`):

```bash
npm run dev       # http://127.0.0.1:5173
npm run build     # tsc -b && vite build → 1-code/next/dist
npm run preview   # local preview
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
- **English variant = British English (BrE)** cho Notes + `2-notes/enrich/meta.json`. Áp dụng khi thêm/sửa ví dụ:
  - Từ vựng: `mum` (not `mom`), `maths` (not `math`), `film` (not `movie` for cinema context), `at the weekend` (not `on the weekend`), `flat` (not `apartment`), `lift` (not `elevator`), `go clubbing` / `go into town` (not `disco` / `downtown`), `build muscle` (not `get big muscles`).
  - IPA: non-rhotic (`fɔː` not `fɔːr`), `/əʊ/` not `/oʊ/` cho `home/go/no/hope`.
  - **Ngoại lệ**: `3-daily/lessons/lesson-XX/**` là raw từ LangGo, không sửa dialect ở đây (lệch nguồn). Chỉ áp dụng cho Notes tự viết.
- Notes-first UI: reveal câu đúng chỉ ở Practice runner + result. Study/Exercises tabs của Daily luôn hiển thị đáp án (đây là chế độ ôn).
- Khi thêm lesson daily: thả folder chuẩn vào `3-daily/lessons/lesson-XX/` (manifest + 5 json + audio + images + raw) rồi restart `npm run dev` để `predev` sinh lại `src/data/`.
- Sửa taxonomy → `3-daily/lessons/topics-map.json` → restart dev.
- Thêm route mới: (1) thêm entry vào [1-code/next/src/lib/nav.ts](1-code/next/src/lib/nav.ts) NAV array, (2) tạo page component trong `1-code/next/src/pages/`, (3) add `<Route>` trong [1-code/next/src/App.tsx](1-code/next/src/App.tsx).
- Thêm Notes audio: file vào `2-notes/audio/`, entry vào `2-notes/enrich/audio.json`. Map theo số `num` khớp với `[[audio:N]]` marker trong markdown.
- Thêm shadcn/ui component mới: handcraft vào `1-code/next/src/components/ui/` (không dùng `npx shadcn add` vì network flaky).

## Common Pitfalls

- **HashRouter đường dẫn**: URL luôn có `#/`. `<Link to="/daily">` → `#/daily`. Đừng dùng `BrowserRouter` vì GH Pages sẽ 404 trên deep links.
- **File path assets**: URL trình duyệt (`/audio/daily/...`, `/source/daily/.../images`, `/final/...`) giữ ổn định; nguồn đĩa đã regroup sang `2-notes`/`3-daily`/`4-final` và được map trong `vite-plugin-assets.mjs`. Đừng đổi URL convention.
- **Preprocess không watch**: sửa file trong `2-notes/` hoặc `3-daily/` thì phải restart `npm run dev` để chạy lại `predev` hook. Không tự động hot-reload data.
- **`src/data/` là generated**: đã gitignore, không commit.
- **TypeScript 6+ deprecates `baseUrl`**: chỉ dùng `paths` alone trong tsconfig.

## GitHub

- Remote `origin`: `https://github.com/khanhtb1306/ielts-foundation-notes.git` (private, default `main`).

## Experimental / Not Yet Wired

- Không còn — mọi thứ đã wired vào routes.

## Roadmap

- [x] Fine-tune per-question topic tagging (đã cải thiện trong audit Phase 7 — thu hẹp `noteKeywords`, thêm compound domain keywords).
- [x] Thêm markdown notes cho `hometown`, `daily-routine`, `health-illness` (đã có).
- [x] Migrate sang React (10 milestone M0-M10 đã complete — `1-code/next/`).
- [x] Xoá vanilla legacy (`web/` + `build.mjs` + `index.html` + `dist/` cũ) — đã gỡ.
- [ ] Fuse.js fuzzy search cross-page (M9 skip).
- [ ] Prereq badge trên Daily card + "Giáo viên nói gì" section trong Topic detail (cần schema migration).
- [ ] Extract text từ `slides/*.pptx` để cross-check curriculum (optional, cần dev-dep).
