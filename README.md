# IELTS Foundation Notes

Web ôn tập Pre-IELTS. App là React + Vite, không mở trực tiếp bằng `file://` (browser chặn ES module).

## Cấu trúc thư mục (4 nhóm)

```
1-code/            ← Code
  next/            React app (Vite + React 19 + TS + Tailwind + Zustand)

2-notes/           ← Nội dung ôn tập nguồn
  grammar/         Grammar notes (.md)
  pronunciation/   Pronunciation notes (.md)
  speaking/        Speaking notes (.md)
  enrich/          meta.json / audio.json / ipa.json
  audio/           Audio phản xạ cho Notes (.wav)

3-daily/           ← Học hàng ngày
  lessons/         Daily sets normalize từ LangGo API (lesson-01..19 + lesson-misc)
  audio/           Audio cho daily (mp3)
  slides/          Slide gốc (.pptx)

4-final/           ← Ôn cuối khóa
  google-doc-pre-course/   Tài liệu giáo viên gửi (md + ảnh + audio + speaking sheets)

scripts/           Script audit / import / download bổ sung
```

Mỗi daily lesson (`3-daily/lessons/lesson-XX/`) gồm: `manifest.json`, `content.json`, `exercises.json`, `scripts.json`, `submission.json`, `audio/manifest.json`, `images/*`, `raw/challenge-XX-YYYYY.json`.

## Chạy app

```bash
npm run dev       # Vite dev server (http://127.0.0.1:5173)
npm run build     # build vào 1-code/next/dist
npm run preview   # preview build
```

Chạy từ repo root (các script proxy sang `1-code/next`). Mở `http://127.0.0.1:5173/#/final`.

## Pipeline

- `1-code/next/scripts/preprocess.mjs` đọc `2-notes/`, `3-daily/lessons/`, `4-final/` → sinh typed TS modules vào `1-code/next/src/data/` (gitignored). Chạy tự động qua `predev` / `prebuild`.
- `1-code/next/scripts/vite-plugin-assets.mjs` serve/copy audio + ảnh + final packet. URL trình duyệt giữ ổn định (`/audio/*`, `/audio/daily/*`, `/source/daily/.../images`, `/final/google-doc-pre-course/*`).

## Sửa nội dung

- **Notes**: sửa `.md` trong `2-notes/{grammar,pronunciation,speaking}/`, restart dev để chạy lại preprocess.
- **Audio Notes**: thả file vào `2-notes/audio/`, thêm entry vào `2-notes/enrich/audio.json` (map theo số câu trong markdown).
- **Daily**: thả folder chuẩn vào `3-daily/lessons/lesson-XX/`, restart dev.
- **Taxonomy / Presets**: sửa `3-daily/lessons/topics-map.json` (topicLabels, noteKeywords, lessonTopicHints, questionOverrides/blockOverrides, speakingQuestions, practicePresets).
- **Final packet**: cập nhật `4-final/google-doc-pre-course/`.

## Nguyên tắc

- Bám sát nội dung slide + LangGo daily challenge.
- Giữ nguyên ví dụ tiếng Việt, không rút gọn.
- English variant = British English (BrE) cho Notes tự viết.
- Notes-first UI; interactive quiz chỉ dùng cho `practice`.
- Không sửa `1-code/next/src/data/` bằng tay — đó là output generate.
