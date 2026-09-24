# IELTS Foundation Notes · React app

Vite + React 19 + TypeScript + Tailwind + shadcn/ui. App active của repo (legacy vanilla đã bị gỡ).

## Setup

```bash
cd 1-code/next
npm install
```

## Local dev

```bash
npm run dev
```

Mở http://localhost:5173. `predev` hook tự động chạy `scripts/preprocess.mjs` để sinh `src/data/*` từ `2-notes/`, `3-daily/lessons/`, `4-final/`. Chỉnh nội dung nguồn thì cần restart dev server hoặc chạy lại `npm run preprocess`.

## Production build

```bash
npm run build
npm run preview   # local preview via http-server
```

Output: `dist/`. Assets bao gồm audio (`dist/audio/daily/*`) và images (`dist/source/daily/*/images/*`) do `vite-plugin-assets` copy sang.

## Deploy — GitHub Pages

Đã có [.github/workflows/deploy.yml](../.github/workflows/deploy.yml) tại repo root. Mỗi push vào `main`:

1. CI checkout, install `1-code/next/`, chạy build với `VITE_BASE=/ielts-foundation-notes/`.
2. Upload `1-code/next/dist` làm Pages artifact.
3. Deploy vào `github-pages` environment.

Trong Settings → Pages, chọn source **"GitHub Actions"**.

## Architecture

- **Routing**: HashRouter (URL dạng `#/daily/lesson-01`). An toàn cho GH Pages subpath.
- **Data**: `scripts/preprocess.mjs` sinh:
  - `src/data/notes.ts` — markdown notes + finalPacket.
  - `src/data/topics.ts` — topics + speakingQuestions + presets.
  - `src/data/daily-index.ts` — LessonSummary[].
  - `src/data/daily/lesson-XX.ts` — Lesson chunks (lazy imported).
- **Types**: [src/types/content.ts](src/types/content.ts) — Question, Block, TopicRef, Lesson.
- **State**: Zustand stores in [src/stores/](src/stores/):
  - `data.ts` — read-only wrapper cho generated data.
  - `practice.ts` — current session + sessionStorage.
  - `history.ts` — max 50 entries + localStorage persist.
  - `flashcard.ts` — tiến độ lật thẻ từ vựng IFA (`ifa-vocab-progress`): mỗi thẻ `known | learning` + số lần gặp.
  - `progress.ts` — Final Review checklist.
  - `theme.ts` — dark/light/system.
  - `ui.ts` — search + mobile menu.
  - `voice.ts` — giọng đọc + tốc độ TTS.
  - `ifa-speaking.ts` — câu trả lời đã lưu ở trang Khung trả lời IFA.
- **Grading**: [src/lib/grading.ts](src/lib/grading.ts) — port `gradeSession`.
- **Sampling**: [src/lib/sample-pool.ts](src/lib/sample-pool.ts) — port `samplePool` (seeded random + largest-remainder).
- **Markdown**: [src/lib/markdown.ts](src/lib/markdown.ts) — port `mdToHtml`, dùng `dangerouslySetInnerHTML`.
- **UI**: shadcn/ui-style components handcrafted trong [src/components/ui/](src/components/ui/).
- **Assets**: [scripts/vite-plugin-assets.mjs](scripts/vite-plugin-assets.mjs) serve audio + images + final packet (đọc từ `2-notes`/`3-daily`/`4-final`) trong dev + copy vào `dist/` khi build.

## Ghi chú

- `src/data/` được sinh tự động — đã gitignore.
- Legacy vanilla đã bị gỡ khỏi repo; React là stack duy nhất.
