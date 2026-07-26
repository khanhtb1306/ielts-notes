# Handoff Prompt: IELTS Foundation Review

File này dùng để đưa cho một agent/người khác tiếp tục khai thác dữ liệu LangGo, slides mới, daily challenge mới, rồi tối ưu nội dung ôn tập trong repo.

## Prompt Tổng

Bạn đang làm trong repo `D:\Individual\ielts-foundation-review`.

Mục tiêu: cập nhật và tối ưu app ôn tập Pre-IELTS/Foundation IELTS cho học viên. App active nằm trong `next/` và đọc content từ `source/`, `final/`, `slides/`, `audio/`. Ưu tiên hiện tại là bổ sung dữ liệu mới từ LangGo/slides, chuẩn hoá thành data ôn tập, rồi rút gọn nội dung theo hướng Final-first để học nhanh trước bài test.

Làm việc theo nguyên tắc:

- Không sửa raw LangGo trong `source/daily/lesson-XX/**` theo dialect hoặc wording riêng, vì đó là dữ liệu nguồn.
- Notes và metadata tự viết dùng tiếng Việt learner-facing, ví dụ tiếng Anh dùng British English.
- `next/src/data/` là generated, không sửa tay.
- App active là React trong `next/`; legacy `web/`, `build.mjs`, root `index.html`, `dist/` chỉ để reference.
- Khi làm bài LangGo cho học viên: chỉ lưu nháp nếu chưa được yêu cầu nộp. Không dựa vào autosave; cần bấm `Lưu nháp` và kiểm tra API `class-challenge/save-draft` trả `success: true`.

## Hiện Trạng Project

- Repo có 2 stack:
  - Active: `next/` gồm Vite + React 19 + TypeScript + Tailwind + shadcn/ui + Zustand + React Router HashRouter.
  - Legacy: `web/` + `build.mjs`, giữ để tham chiếu.
- Content chính nằm ở:
  - Notes markdown: `source/pronunciation/*.md`, `source/grammar/*.md`, `source/speaking/*.md`.
  - Daily challenge normalized: `source/daily/lesson-XX/` và `source/daily/lesson-misc/`.
  - Taxonomy: `source/daily/topics-map.json`.
  - Final packet: `final/google-doc-pre-course/tong-hop-kien-thuc-khoa-pre.md`.
  - Speaking topic sheets: `final/google-doc-pre-course/suggested-vocab/*.docx`.
  - Slides: `slides/*.pptx`.
  - Audio: `audio/` và daily audio manifests.
- Pipeline React:
  - `next/scripts/preprocess.mjs` đọc `source/` + enrich/final → sinh `next/src/data/`.
  - `next/scripts/vite-plugin-assets.mjs` serve/copy audio/image assets.
  - `next/src/pages/FinalPage.tsx` hiển thị Final packet + Speaking sheets + Final Speaking bank + checklist.
  - `next/src/lib/grading.ts` chấm Practice.
  - `next/src/lib/sample-pool.ts` tạo bộ Practice seeded.

## Trạng Thái Dữ Liệu Gần Nhất Từ Chat

- Đã có Lesson 1-16 Notes và daily sets đến Lesson 18 trong LangGo session.
- Repo trước đó đã được cập nhật Lesson 16 + Break 3 + Final canonical packet và build pass.
- LangGo class context:
  - `contractId`: `1780455880vwydc1i2ehir`
  - `classId`: `177286917873dop75b27mv`
  - API base: `https://api-estudy.langgo.vn/api/v1`
- Daily đã thao tác gần đây:
  - `85818` / `challenge_id=34744`: `[PRE IELTS] LESSON 18 - CHALLENGE 1`, đã lưu nháp rồi sau đó trạng thái list báo đã nộp lúc `25/07/2026 09:38`.
  - `85819` / `challenge_id=34745`: `[PRE IELTS] LESSON 18 - CHALLENGE 2`, đã điền Vocabulary, để Speaking trống, lưu nháp rồi list báo đã nộp lúc `25/07/2026 10:24`.
  - `86065`: STT 44 `[PRE IELTS] LESSON 19 - SPEAKING CHALLENGE`, chỉ mở xem, không điền, không lưu nháp, không nộp.
  - `86121` / `challenge_id=35058`: STT 45 `[PRE IELTS ] LESSON 19 - MOCK TEST`, đã điền 50 câu và bấm `Lưu nháp`; API `class-challenge/save-draft` trả `success: true`. Chưa nộp.
- Lưu ý lớn: LangGo có thể có cơ chế autosave hoặc trạng thái server thay đổi theo thao tác người dùng/giáo viên, nhưng trong phiên này chỉ xác nhận chắc chắn khi có request `class-challenge/save-draft`. Đừng giả định draft đã lưu nếu chưa thấy response thành công.

## Workflow Lấy Daily Challenge Mới Từ LangGo

Nhiệm vụ: lấy challenge mới từ LangGo, lưu raw API, normalize vào repo, cập nhật taxonomy/topic nếu cần, rồi verify build.

Các bước:

 1. Mở LangGo bằng Chrome DevTools hoặc browser đã đăng nhập.
 2. Vào `https://study.langgo.vn/contract-in-class/1780455880vwydc1i2ehir/daily-challenge`.
 3. Reload danh sách để thấy challenge mới. Ghi lại STT, title, `class_challenge_id` trong URL `/daily-challenge/do/<id>` hoặc `/edit/<id>`.
 4. Mở bài, đọc network requests:
    - `class-challenge/get`
    - `student-challenge/get`
    - `class-challenge/get-draft`
    - `challenge/get-assignment`
    - `challenge/get-question`
 5. Lưu raw responses vào temp hoặc `source/daily/<lesson>/raw/` tuỳ workflow hiện có. Không xoá/mutate dữ liệu gốc.
 6. Nếu cần làm bài cho học viên:
    - Chỉ điền phần xác định được từ đề/audio/script/API.
    - Speaking/video/Google Docs để trống nếu user yêu cầu.
    - Chỉ bấm `Lưu nháp`, không bấm `Nộp bài` nếu chưa được user xác nhận.
    - Sau khi lưu, kiểm tra request `class-challenge/save-draft` trả `success: true` và response chứa đủ answers.
 7. Để đưa vào app ôn tập, tạo/cập nhật folder chuẩn:
    - `source/daily/lesson-XX/manifest.json`
    - `source/daily/lesson-XX/content.json`
    - `source/daily/lesson-XX/exercises.json`
    - `source/daily/lesson-XX/scripts.json`
    - `source/daily/lesson-XX/submission.json`
    - `source/daily/lesson-XX/audio/manifest.json`
    - `source/daily/lesson-XX/images/manifest.json`
    - `source/daily/lesson-XX/raw/challenge-NN-XXXXX.json`
 8. Nếu là Break/review không thuộc lesson cụ thể, dùng `source/daily/lesson-misc/`.
 9. Cập nhật `source/daily/topics-map.json` nếu bài có topic mới hoặc tagging sai.
10. Chạy verify:
    - `cd next`
    - `npm run preprocess`
    - `npm run build`

## Workflow Lấy Slides Mới

Nhiệm vụ: thêm slides mới và khai thác nội dung cần ôn, không biến toàn bộ slide thành ghi chú dài dòng.

Các bước:

1. Đặt file `.pptx` mới vào `slides/`, giữ tên rõ: `Lesson 17.pptx`, `Lesson 18.pptx`, `Lesson 19.pptx`, hoặc tên đúng nguồn.
2. Extract text từ slides nếu cần. Có thể dùng script riêng hoặc dev dependency, nhưng không commit tooling nặng nếu chưa cần.
3. Đối chiếu slide với:
   - Final canonical packet: `final/google-doc-pre-course/tong-hop-kien-thuc-khoa-pre.md`
   - Existing notes: `source/grammar`, `source/pronunciation`, `source/speaking`
   - Daily exercises: `source/daily/**/exercises.json`
4. Chỉ bổ sung notes khi slide có kiến thức thiếu hoặc ví dụ tốt cho Final.
5. Không copy toàn bộ slide vào notes. Tách thành:
   - Rules cần nhớ.
   - Common mistakes.
   - Exam/Final patterns.
   - 3-5 ví dụ chất lượng.
   - Quick drill nếu thật sự cần.
6. Nếu thêm audio speaking, thêm file vào `audio/` và entry trong `web/enrich/audio.json` theo marker `[[audio:N]]`.
7. Chạy `cd next && npm run preprocess && npm run build`.

## Tiêu Chí Rút Gọn Và Tối Ưu Ôn Tập

Mục tiêu không phải nhồi thêm nội dung, mà là giảm tải để ôn Final hiệu quả.

Ưu tiên giữ:

- Kiến thức xuất hiện trong Final packet hoặc Mock Test.
- Cấu trúc/câu hỏi lặp lại trong nhiều daily challenge.
- Lỗi sai học viên từng gặp hoặc dạng dễ mất điểm.
- Speaking prompts có khả năng vào Final Speaking.
- Bảng/tóm tắt giúp chọn nhanh đáp án.

Ưu tiên bỏ/ẩn/chuyển xuống phụ lục:

- Ví dụ trùng lặp nhiều lần.
- Giải thích quá dài nhưng không giúp làm bài.
- Raw transcript dài không có câu hỏi đi kèm.
- Vocabulary quá hiếm, không có trong Final/daily/slides.
- Nội dung Speaking chỉ là yêu cầu quay video/link submission, không phải kiến thức ôn.

Cách viết lại notes:

- Mỗi topic nên có `Quick rule`, `When to use`, `Common mistakes`, `Mini drill`.
- Tiếng Việt giải thích ngắn, ví dụ tiếng Anh rõ và BrE khi tự viết.
- Một rule chỉ nên có 2-4 ví dụ; nếu cần nhiều hơn thì đưa vào Practice pool.
- Với Grammar, ưu tiên bảng quyết định nhanh: dấu hiệu nhận biết, form, ví dụ, bẫy.
- Với Speaking, ưu tiên answer frames có thể tái dùng, không viết bài mẫu quá dài.

## Prompt Mẫu Cho Agent Khai Thác Daily Mới

```text
Bạn đang ở repo D:\Individual\ielts-foundation-review. Hãy lấy daily challenge mới từ LangGo cho class contract 1780455880vwydc1i2ehir.

Yêu cầu:
- Mở trang Daily Challenge và xác định bài mới nhất chưa có trong repo.
- Lấy raw API responses: get-assignment, get-question, get-draft, student-challenge/get, class-challenge/get.
- Không nộp bài. Nếu cần thao tác trên bài, chỉ bấm Lưu nháp sau khi đã điền phần chắc chắn và phải xác nhận save-draft success=true.
- Normalize dữ liệu vào source/daily/lesson-XX/ hoặc source/daily/lesson-misc/ theo schema hiện có.
- Download/copy audio/images nếu API có refs; cập nhật manifests.
- Cập nhật source/daily/topics-map.json nếu topic mới hoặc tagging sai.
- Chạy cd next && npm run preprocess && npm run build.
- Trả về tóm tắt: challenge id, class_challenge_id, title, số câu, asset count, files changed, verify result, chỗ còn nghi ngờ.
```

## Prompt Mẫu Cho Agent Khai Thác Slides Mới

```text
Bạn đang ở repo D:\Individual\ielts-foundation-review. Hãy khai thác slides mới trong slides/ để cập nhật app ôn tập.

Yêu cầu:
- Liệt kê slides hiện có và xác định file mới/chưa được phản ánh trong notes/daily/final.
- Extract text từ PPTX nếu cần, nhưng không copy thô toàn bộ vào notes.
- Đối chiếu với final/google-doc-pre-course/tong-hop-kien-thuc-khoa-pre.md, source/grammar, source/pronunciation, source/speaking, source/daily/topics-map.json.
- Đề xuất phần nào nên thêm, phần nào nên bỏ qua vì trùng hoặc không phục vụ Final.
- Nếu sửa notes, viết ngắn gọn theo format Final-first: Quick rule, Common mistakes, Mini drill.
- Giữ tiếng Việt learner-facing và BrE cho ví dụ tự viết.
- Chạy cd next && npm run preprocess && npm run build.
- Trả về tóm tắt thay đổi và danh sách nội dung đã cố tình không đưa vào vì gây nhiễu.
```

## Prompt Mẫu Cho Agent Tối Ưu Nội Dung Ôn Tập

```text
Bạn đang ở repo D:\Individual\ielts-foundation-review. Hãy audit nội dung ôn tập để giảm tải và tối ưu cho Final.

Mục tiêu:
- Giảm trùng lặp, giảm note dài, giữ phần có giá trị làm bài cao.
- Ưu tiên Final packet, Mock Test, daily challenges mới nhất, Speaking final questions.

Việc cần làm:
- Đọc final/google-doc-pre-course/tong-hop-kien-thuc-khoa-pre.md.
- Đọc source/daily/topics-map.json và các lesson daily mới nhất.
- Đọc notes trong source/grammar, source/pronunciation, source/speaking.
- Tạo danh sách nội dung: Keep, Merge, Shorten, Move to appendix, Remove.
- Nếu chỉnh sửa, làm từng bước nhỏ và chạy build sau mỗi nhóm thay đổi lớn.
- Không xoá raw data. Không sửa generated next/src/data.
- Trả về bảng: file, vấn đề, hành động, lý do, rủi ro.
```

## Kiểm Tra Sau Khi Cập Nhật

Chạy các lệnh:

```bash
cd next
npm run preprocess
npm run build
```

Nếu có thay đổi media/data lớn, chạy thêm ở root:

```bash
node scripts/audit-media.mjs
node scripts/audit-curriculum.mjs
node scripts/audit-data.mjs
```

Checklist trước khi kết thúc:

- Không sửa `next/src/data/` bằng tay.
- Không commit `.cursor/`, `.vscode/`, token API, network response chứa secrets.
- Không nộp bài LangGo nếu user chưa cho phép.
- Nếu chỉ lưu nháp, phải có bằng chứng `save-draft` success.
- App build pass.
- Ghi rõ phần còn nghi ngờ hoặc cần user/giáo viên xác nhận.