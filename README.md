# IELTS Foundation Notes

Web ôn tập Pre-IELTS (đã học đến Lesson 16). App active nằm trong `next/` (React + Vite); không mở trực tiếp bằng `file://` vì browser chặn ES module.

## Hai lớp nội dung

App có **6 mảng Notes cũ** + **3 mảng Daily mới**:

| Route             | Mô tả |
| ----------------- | ----- |
| `stage`           | Current Stage — mục tiêu giai đoạn |
| `course`          | Course Map — 16 lessons trên slide |
| `pronunciation`   | Pronunciation Notes (Lesson 1–5) + IPA tương tác + hộp phát âm |
| `grammar`         | Grammar Notes tổng hợp |
| `speaking`        | Speaking Notes theo chủ đề |
| `final`           | Final Review — checklist ôn tất cả trước thi |
| **`daily`**       | **Daily · By Lesson** — 17 daily sets (L1-16 + Break) đã normalize từ LangGo API, có tab Study / Exercises / Flashcard |
| **`topics`**      | **Daily · By Topic** — gom content + câu hỏi xuyên suốt theo chủ đề (Grammar / Pronunciation / Vocabulary / Speaking), có `core / review / preview` |
| **`practice`**    | **Final Practice** — generator chọn preset / tỷ lệ % topic → shuffle → làm interactive → chấm điểm + history |

## Kiến trúc

```
source/
├── pronunciation/*.md   ← notes lesson 1–5
├── grammar/*.md         ← notes tổng hợp
├── speaking/*.md        ← notes theo chủ đề
└── daily/               ← DAILY (API normalized)
    ├── topics-map.json      ← taxonomy + speaking Q bank + practice presets (edit tay)
    ├── lesson-01/
    │   ├── manifest.json    ← metadata challenges
    │   ├── content.json     ← nội dung learn (blocks + rawHtml)
    │   ├── exercises.json   ← câu hỏi (kèm submission)
    │   ├── scripts.json     ← transcript audio
    │   ├── submission.json  ← điểm + đáp án đã nộp
    │   ├── audio/manifest.json
    │   ├── images/*.png + manifest.json
    │   └── raw/challenge-XX-YYYYY.json  ← nguyên bản API để trích options
    └── lesson-02/ ... lesson-16/ + lesson-misc/

web/
├── template.html    ← khung DOM
├── styles.css       ← toàn bộ CSS (kèm 3 accent màu cho daily/topics/practice)
├── app.js           ← shell + Notes renderer + APP namespace
├── daily.js         ← `daily` + `daily-lesson` (lazy load dist/daily/*.js)
├── topics.js        ← `topics` + `topic-detail` (dùng APP.loadDailyLesson)
├── practice.js      ← `practice` + `practice-runner` + `practice-result`
└── enrich/*.json    ← meta / audio / ipa cho Notes

audio/               ← file mp3 downloaded (giữ đúng path relative cho file://)
dist/                ← build output (gitignored)
└── daily/lesson-XX.js  ← 1 chunk / lesson, lazy load qua <script src>
```

`build.mjs` gộp tất cả → `index.html` self-contained (nội tuyến CSS + notes data + daily index + topics index + presets + bundled JS 4 module).

## Chạy React App

```bash
npm run dev            # Vite dev server tại http://127.0.0.1:5173
npm run build          # build React app vào next/dist
npm run preview        # preview build tại http://127.0.0.1:5174
```

Mở `http://127.0.0.1:5173/#/final` khi dev, hoặc `http://127.0.0.1:5174/#/final` sau khi chạy preview.

## Legacy Vanilla

Legacy app vẫn giữ để reference. Chỉ dùng khi cần rollback:

```bash
npm run legacy:build
npm run legacy:start
npm run legacy:serve
```

Sanity check JS syntax sau khi build:

```bash
node -e "const fs=require('fs'); const html=fs.readFileSync('index.html','utf8'); const scripts=[...html.matchAll(/<script>([\\s\\S]*?)<\\/script>/g)].map(m=>m[1]); scripts.forEach((s,i)=>{ try{ new Function(s); console.log('#'+i+': OK ('+s.length+' bytes)'); }catch(e){ console.error('#'+i+': '+e.message); } });"
```

## Sửa taxonomy / Presets

Sửa `source/daily/topics-map.json`:

- `topicLabels` — label + skill cho từng topic key
- `noteKeywords` — chuỗi con trong `challenge.note` (đã lowercase) → topic key
- `lessonTopicHints` — hint chủ đề chính cho mỗi lesson (dùng khi keyword không match)
- `questionOverrides` / `blockOverrides` — chỉ định thủ công (VD: `"question-266036": [{"key":"collocations","role":"core"}]`)
- `speakingQuestions` — bộ câu hỏi Final Test theo topic (hiện lên tab "Câu hỏi Speaking" của topic detail)
- `practicePresets` — các preset cho Final Practice

Chạy `npm run build` để reflect.

## Thêm lesson mới hoặc nội dung Notes mới

- Notes: thêm/sửa `.md` trong `source/{pronunciation,grammar,speaking}/`, chạy build.
- Daily: thả folder `source/daily/lesson-XX/` theo chuẩn (manifest + 5 json + audio + images + raw); build tự pick up.
- Audio Notes: thả file vào `audio/`, thêm entry vào `web/enrich/audio.json` (map theo số câu hỏi trong markdown).

## Nguyên tắc

- Bám sát nội dung slide + LangGo daily challenge.
- Giữ nguyên ví dụ Vietnamese, không rút gọn.
- Notes-first UI, minimal chrome. Interactive quiz chỉ dùng cho `practice`.
- **Không sửa `index.html` bằng tay** — đó là output.
