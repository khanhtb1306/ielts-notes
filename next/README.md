# IELTS Foundation Notes · React app

Vite + React 19 + TypeScript + Tailwind + shadcn/ui migrate của [../](../) vanilla app.

## Setup

```bash
cd next
npm install
```

## Local dev

```bash
npm run dev
```

Mở http://localhost:5173. `predev` hook tự động chạy `scripts/preprocess.mjs` để sinh `src/data/*` từ `../source/`. Chỉnh markdown / JSON trong `../source/` thì cần restart dev server hoặc chạy lại `npm run preprocess`.

## Production build

```bash
npm run build
npm run preview   # local preview via http-server
```

Output: `dist/`. Assets bao gồm audio (`dist/audio/daily/*`) và images (`dist/source/daily/*/images/*`) do `vite-plugin-assets` copy sang.

## Deploy — GitHub Pages

Đã có [.github/workflows/deploy.yml](../.github/workflows/deploy.yml) tại repo root. Mỗi push vào `main`:

1. CI checkout, install `next/`, chạy build với `VITE_BASE=/ielts-foundation-notes/`.
2. Upload `next/dist` làm Pages artifact.
3. Deploy vào `github-pages` environment.

Trong Settings → Pages, chọn source **"GitHub Actions"**.

## Architecture

- **Routing**: HashRouter (URL dạng `#/daily/lesson-01`). An toàn cho GH Pages subpath.
- **Data**: `scripts/preprocess.mjs` port từ vanilla `build.mjs`. Sinh:
  - `src/data/notes.ts` — 26 markdown notes.
  - `src/data/topics.ts` — 26 topics + speakingQuestions + presets.
  - `src/data/daily-index.ts` — 16 LessonSummary.
  - `src/data/daily/lesson-XX.ts` — 16 Lesson chunks (lazy imported).
- **Types**: [src/types/content.ts](src/types/content.ts) — Question, Block, TopicRef, Lesson.
- **State**: Zustand stores in [src/stores/](src/stores/):
  - `data.ts` — read-only wrapper cho generated data.
  - `practice.ts` — current session + sessionStorage.
  - `history.ts` — max 50 entries + localStorage persist.
  - `flashcard.ts` — Leitner box per scope + localStorage persist.
  - `progress.ts` — Final Review checklist.
  - `theme.ts` — dark/light/system.
  - `ui.ts` — search + mobile menu.
- **Grading**: [src/lib/grading.ts](src/lib/grading.ts) — port `gradeSession`.
- **Sampling**: [src/lib/sample-pool.ts](src/lib/sample-pool.ts) — port `samplePool` (seeded random + largest-remainder).
- **Markdown**: [src/lib/markdown.ts](src/lib/markdown.ts) — port `mdToHtml`, dùng `dangerouslySetInnerHTML`.
- **UI**: shadcn/ui-style components handcrafted trong [src/components/ui/](src/components/ui/).
- **Assets**: [scripts/vite-plugin-assets.mjs](scripts/vite-plugin-assets.mjs) serve `../audio/*` + `../source/daily/*/images/*` trong dev + copy vào `dist/` khi build.

## Ghi chú

- `src/data/` được sinh tự động — đã gitignore.
- Vanilla version (`../web/`, `../build.mjs`, `../index.html`, `../dist/`) vẫn còn để so sánh. Có thể xóa sau khi React version stable.
