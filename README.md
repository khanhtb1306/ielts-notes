# IELTS Foundation Notes

Web ôn tập dạng sổ tay cho giai đoạn Pre-IELTS (đã học đến Lesson 15). Mở `index.html` bằng Chrome hoặc Edge là dùng được offline.

## Kiến trúc

Nội dung và web được tách riêng để dễ bảo trì và tái sử dụng:

- `source/**/*.md` — **nguồn nội dung DUY NHẤT**, là các doc markdown sạch, cô đọng, dùng lại độc lập được:
  - `source/pronunciation/` — IPA, phụ âm, nguyên âm, đọc phiên âm, collocations (Lesson 1–5).
  - `source/grammar/` — nouns, pronouns, adjectives, determiners, prepositions, present/past/future tenses, modal verbs.
  - `source/speaking/` — self, job, family, appearance, personality, house, weekend, trip, food & restaurant.
- `web/` — phần trình bày, KHÔNG chứa nội dung học:
  - `template.html`, `styles.css`, `app.js`.
  - `web/enrich/meta.json` — goals, course map, final review, vocab bank, read guide.
  - `web/enrich/audio.json` — map audio theo số câu hỏi.
  - `web/enrich/ipa.json` — dữ liệu bảng IPA (nguyên âm/phụ âm + từ ví dụ).
- `build.mjs` — gộp `source` + `web` → sinh `index.html` self-contained.
- `audio/` — file nghe từ trung tâm, nhúng đúng vào từng mục Speaking qua marker `[[audio:N]]`.

## Tính năng web

- **Màu theo mục**: mỗi khu vực có màu nhấn riêng (Pronunciation teal, Grammar indigo, Speaking violet, Final green...).
- **Bảng IPA tương tác**: 12 monophthongs + 8 diphthongs + 24 consonants; bấm ô để nghe từ ví dụ.
- **Hộp phát âm từ bất kỳ**: gõ từ → nghe. Offline dùng Web Speech API (giọng máy); online lấy thêm IPA + audio giọng người thật từ Free Dictionary API (miễn phí, không cần key).
- **Final Review**: 2 phần (Speaking tất cả chủ đề + Kiến thức đã học) với checkbox lưu tiến độ trong trình duyệt (localStorage).
- **Tìm kiếm, mục lục, chip nhảy nhanh, right-rail "Trong trang này"**.
- **Responsive**: desktop (có right-rail), tablet, mobile (drawer menu).

## Quy trình sửa nội dung

1. Sửa file trong `source/**/*.md` (hoặc `web/enrich/*.json`).
2. Chạy build:
   ```
   npm run build
   ```
3. Mở lại `index.html`.

Chạy kèm server tĩnh (tự build trước):
```
npm start
```

## Nguyên tắc nội dung

- Bám sát nội dung slide (Lesson 1–15), không thêm ý ngoài giáo trình.
- Bố cục mỗi mục grammar: khái niệm → công thức → cách dùng → dấu hiệu → ví dụ → bẫy lỗi.
- Speaking giữ nguyên ví dụ thật, thêm audio và gợi ý luyện nói.
