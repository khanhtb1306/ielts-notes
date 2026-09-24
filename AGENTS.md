# Agent Notes

## Project Shape

Repo tổ chức theo **khóa học**. Mỗi khóa là một thư mục `courses/<course-id>/` chứa 3 khối nội dung (`notes/`, `daily/`, `final/`). App (`1-code/`) dùng chung cho mọi khóa.

- **`1-code/`** — code. Chỉ có `1-code/next/` (Vite + React 19 + TypeScript + Tailwind + shadcn/ui + Zustand + React Router (HashRouter)). Deploy = GitHub Pages qua `.github/workflows/deploy.yml`. Legacy vanilla đã bị xoá.
- **`courses/<course-id>/`** — nội dung một khóa. Hiện có `courses/pre-ielts/`:
  - **`notes/`** — nội dung ôn tập nguồn: `grammar/`, `pronunciation/`, `speaking/` (markdown), `enrich/` (json), `audio/` (wav phản xạ Notes).
  - **`daily/`** — học hàng ngày: `lessons/` (LangGo normalized), `audio/` (mp3).
  - **`final/`** — ôn cuối khóa: `google-doc-pre-course/` (tài liệu giáo viên).

Ngoài ra: `scripts/` (audit/import/download).

**Scope hiện tại**: 2 khóa.
- `pre-ielts` — Notes + 20 daily sets (L1-19 + `lesson-misc`) + Final Practice generator + Final packet giáo viên.
- `ifa-ielts` (IELTS Foundation A) — 12 daily challenge (L1-6 + break) + **Speaking Part 1**: 7 handout khung trả lời + ngân hàng 13 lesson cho luyện phản xạ.

> **Multi-course**: `preprocess.mjs` đọc `pre-ielts` qua hằng `COURSE_ID`, và đọc thêm `ifa-ielts` qua `IFA_COURSE_ID` (chỉ phần Speaking, emit module độc lập `src/data/ifa-speaking.ts`). Điều hướng chia nhóm theo khóa trong `NAV_GROUPS` ([1-code/next/src/lib/nav.ts](1-code/next/src/lib/nav.ts)). Chưa có course switcher / URL segment theo khóa / namespace localStorage theo khóa — làm sau nếu cần.

### IFA Speaking pipeline
1. HTML handout gốc (artifact của giáo viên) đặt ở `courses/ifa-ielts/source/speaking/` — **gitignored** (`courses/*/source/`), chỉ dùng để trích.
2. `node scripts/parse-ifa-speaking.mjs` → sinh `courses/ifa-ielts/notes/enrich/speaking-handouts.json` + `speaking-bank.json` (JSON sạch, **không mang HTML/CSS/JS**).
3. `preprocess.mjs` đọc 2 file JSON đó → `1-code/next/src/data/ifa-speaking.ts`. Thiếu file thì degrade về mảng rỗng, không vỡ build `pre-ielts`.
4. UI: [IfaSpeakingPage](1-code/next/src/pages/IfaSpeakingPage.tsx) (ghép câu) + [IfaSpeakingDrillPage](1-code/next/src/pages/IfaSpeakingDrillPage.tsx) (luyện phản xạ).

> Thêm lesson Speaking mới: thả HTML vào `source/speaking/`, chạy lại `parse-ifa-speaking.mjs`, restart dev. Parser tự nhận file mới; UI render số slot động nên lesson dùng 4 slot vẫn chạy. **Không đặt regex bóc chuỗi hiển thị trong UI** — parser phải sinh sẵn `topicLabel` / `audience` / `grammarFocus`.

## Web-consumed (RANH GIỚI QUAN TRỌNG)

Repo chỉ giữ **nội dung được đưa lên web**. Tài liệu nguồn không lên web (overview.md ghi chú, `*.network-response` dump HTTP, `*.pptx` slide, ảnh grammar-final rời) đã bị **xoá** vì đã được số hóa thành json/nội dung chuẩn. Ranh giới web xác định bằng: `1-code/next/scripts/preprocess.mjs` (build-time đọc content), `1-code/next/scripts/vite-plugin-assets.mjs` (serve/copy assets), `.github/workflows/deploy.yml` (chỉ build `1-code/next` → `dist/`).

### Web-consumed — KHÔNG được di chuyển/xoá (preprocess đọc hoặc assets serve)
- `1-code/next/**` (trừ `src/data/` generated + gitignored).
- `courses/<id>/notes/{grammar,pronunciation,speaking}/*.md`, `courses/<id>/notes/enrich/*.json` (gồm `topics-map.json` — config toàn app), `courses/<id>/notes/audio/**`.
- Mỗi lesson (`courses/<id>/daily/lessons/lesson-XX/`): `manifest.json`, `content.json`, `exercises.json`, `scripts.json`, `submission.json`, `audio/manifest.json`, `images/**`, **`raw/*.json`**.
- `courses/<id>/daily/audio/**`.
- `courses/<id>/final/google-doc-pre-course/**`.

> ⚠️ **`raw/*.json` trông giống dữ liệu thô nhưng preprocess ĐỌC nó** (`collectRawQuestions(join(dir,"raw"))`) để lấy options + đáp án. `content.json`/`exercises.json` KHÔNG chứa options — phải ghép với `raw/` lúc build. **TUYỆT ĐỐI KHÔNG xoá/di chuyển `raw/`.**

> ⚠️ `scripts/normalize-daily-lessons.mjs` (import one-off, KHÔNG chạy trong dev/build/CI) **GHI `overview.md` vào `courses/<id>/daily/lessons/lesson-XX/`** khi regenerate. Nếu chạy lại script này, xoá lại `overview.md` mới sinh (không lên web).

### Quy ước cho content mới
Khi thêm file, tự hỏi: **preprocess/assets-plugin có đọc nó để lên web không?** Có → đặt ở vị trí web-consumed đúng chuẩn. Không (tài liệu nguồn thuần) → không commit vào repo web (lưu ngoài).

## Content sources

> Đường dẫn dưới đây dùng `courses/<id>/` (hiện `<id>` = `pre-ielts`).

### Notes (markdown)
- `courses/<id>/notes/pronunciation/*.md`
- `courses/<id>/notes/grammar/*.md`
- `courses/<id>/notes/speaking/*.md`
- Frontmatter: `title`, `lesson`, `priority` (high|normal), `vi`.
- File name prefix `NN-` giữ thứ tự (`orderOf()`).

### Notes enrich (json)
- `courses/<id>/notes/enrich/meta.json` — goals, principles, course map, final review, vocab bank, read guide.
- `courses/<id>/notes/enrich/audio.json` — audio bank cho Speaking (`[[audio:N]]` marker trong markdown).
- `courses/<id>/notes/enrich/ipa.json` — IPA chart data.
- `courses/<id>/notes/enrich/topics-map.json` — config toàn app (taxonomy + Speaking bank + Final Practice presets). Xem "App content config" bên dưới.

### Daily (json) — Nguồn: LangGo Challenge API đã normalize
Mỗi lesson một folder `courses/<id>/daily/lessons/lesson-XX/`:
- `manifest.json` — challenges của lesson (id, title, note, deadline, totalQuestion, rawFile).
- `content.json` — content blocks với `rawHtml`, `audioRefs`, `imageRefs`.
- `exercises.json` — questions kèm submission đã có (userAnswer/correctAnswer/resultAnswer).
- `scripts.json` — audio transcripts (đã cover với audio manifest).
- `submission.json` — điểm + comment + userAnswer full.
- `audio/manifest.json` — mỗi audio có `sourceUrl` + `localFile` + `script`.
- `images/manifest.json` — mỗi image `url` + `localFile`.
- `raw/challenge-NN-XXXXX.json` — bản gốc để build trích `answer.answers[]` (options + đáp án).

### App content config (taxonomy + Speaking + Final Practice)
- `courses/<id>/notes/enrich/topics-map.json` — config toàn app, sửa tay (KHÔNG phải dữ liệu daily; đặt cùng `enrich/` với meta/audio/ipa):
  - `topicLabels`: `{ key: { label, skill, needsNotes? } }`
  - `noteKeywords`: `{ "chuỗi lowercase trong note": ["topic-key", ...] }`
  - `lessonTopicHints`: `{ "lesson-XX": ["topic-key", ...] }`  (topic đầu = core, các topic sau = review)
  - `questionOverrides` / `blockOverrides`: `{ "question-XXX": [{ key, role }] }`
  - `speakingQuestions`: bộ câu hỏi Final Speaking Test.
  - `practicePresets`: preset cho generator (`id, label, totalQuestions, mix[{topic,percent}], questionTypes`).

## React pipeline (`1-code/next/`)

- **Preprocess**: [1-code/next/scripts/preprocess.mjs](1-code/next/scripts/preprocess.mjs). Đọc `courses/<id>/{notes,daily/lessons,final}` (đường dẫn qua hằng `COURSE_ID`) → sinh typed TS modules vào `1-code/next/src/data/`:
  - `notes.ts` — docs + meta + audio bank + IPA + finalPacket.
  - `topics.ts` — topicsIndex + topicLabels + speakingQuestions + presets.
  - `daily-index.ts` — LessonSummary[].
  - `daily/lesson-XX.ts` — Lesson chunks (lazy import).
  - `daily-loader.ts` — key → () => Promise<Lesson>.
- **Asset serving**: [1-code/next/scripts/vite-plugin-assets.mjs](1-code/next/scripts/vite-plugin-assets.mjs). URL trình duyệt giữ ổn định (`/audio/*` ← `courses/<id>/notes/audio`, `/audio/daily/*` ← `courses/<id>/daily/audio`, `/source/daily/*/images/*` ← `courses/<id>/daily/lessons`, `/final/google-doc-pre-course/*` ← `courses/<id>/final`). Build copy sang `1-code/next/dist/`.
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
- **English variant = British English (BrE)** cho Notes + `courses/<id>/notes/enrich/meta.json`. Áp dụng khi thêm/sửa ví dụ:
  - Từ vựng: `mum` (not `mom`), `maths` (not `math`), `film` (not `movie` for cinema context), `at the weekend` (not `on the weekend`), `flat` (not `apartment`), `lift` (not `elevator`), `go clubbing` / `go into town` (not `disco` / `downtown`), `build muscle` (not `get big muscles`).
  - IPA: non-rhotic (`fɔː` not `fɔːr`), `/əʊ/` not `/oʊ/` cho `home/go/no/hope`.
  - **Ngoại lệ**: `courses/<id>/daily/lessons/lesson-XX/**` là raw từ LangGo, không sửa dialect ở đây (lệch nguồn). Chỉ áp dụng cho Notes tự viết.
- Notes-first UI: reveal câu đúng chỉ ở Practice runner + result. Study/Exercises tabs của Daily luôn hiển thị đáp án (đây là chế độ ôn).
- Khi thêm lesson daily: thả folder chuẩn vào `courses/<id>/daily/lessons/lesson-XX/` (manifest + 5 json + audio + images + raw) rồi restart `npm run dev` để `predev` sinh lại `src/data/`.
- Sửa taxonomy → `courses/<id>/notes/enrich/topics-map.json` → restart dev.
- Thêm route mới: (1) thêm entry vào [1-code/next/src/lib/nav.ts](1-code/next/src/lib/nav.ts) NAV array, (2) tạo page component trong `1-code/next/src/pages/`, (3) add `<Route>` trong [1-code/next/src/App.tsx](1-code/next/src/App.tsx).
- Thêm Notes audio: file vào `courses/<id>/notes/audio/`, entry vào `courses/<id>/notes/enrich/audio.json`. Map theo số `num` khớp với `[[audio:N]]` marker trong markdown.
- Thêm shadcn/ui component mới: handcraft vào `1-code/next/src/components/ui/` (không dùng `npx shadcn add` vì network flaky).

## Common Pitfalls

- **HashRouter đường dẫn**: URL luôn có `#/`. `<Link to="/daily">` → `#/daily`. Đừng dùng `BrowserRouter` vì GH Pages sẽ 404 trên deep links.
- **File path assets**: URL trình duyệt (`/audio/daily/...`, `/source/daily/.../images`, `/final/...`) giữ ổn định; nguồn đĩa nằm ở `courses/<id>/{notes,daily,final}` và được map trong `vite-plugin-assets.mjs`. Đừng đổi URL convention.
- **Preprocess không watch**: sửa file trong `courses/<id>/notes/` hoặc `courses/<id>/daily/` thì phải restart `npm run dev` để chạy lại `predev` hook. Không tự động hot-reload data.
- **`src/data/` là generated**: đã gitignore, không commit.
- **TypeScript 6+ deprecates `baseUrl`**: chỉ dùng `paths` alone trong tsconfig.

## GitHub

- Remote `origin`: `https://github.com/khanhtb1306/ielts-notes.git` (private, default `main`).

## Experimental / Not Yet Wired

- Không còn — mọi thứ đã wired vào routes.

## Roadmap

- [x] Fine-tune per-question topic tagging (đã cải thiện trong audit Phase 7 — thu hẹp `noteKeywords`, thêm compound domain keywords).
- [x] Thêm markdown notes cho `hometown`, `daily-routine`, `health-illness` (đã có).
- [x] Migrate sang React (10 milestone M0-M10 đã complete — `1-code/next/`).
- [x] Xoá vanilla legacy (`web/` + `build.mjs` + `index.html` + `dist/` cũ) — đã gỡ.
- [ ] Fuse.js fuzzy search cross-page (M9 skip).
- [ ] Prereq badge trên Daily card + "Giáo viên nói gì" section trong Topic detail (cần schema migration).
