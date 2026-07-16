/* ================================================================
 * daily.js - Daily Practice · By Lesson
 *
 * Registers 2 pages: `daily` (16-card index) and `daily-lesson`
 * (per-lesson detail with 3 tabs: Study / Exercises / Flashcard).
 * Lazy-loads dist/daily/lesson-XX.js on demand and caches into
 * window.__DAILY__[key]. Works with file:// (no fetch, uses
 * <script src=…> injection).
 * ================================================================ */
(function bootDaily() {
  const APP = window.APP;
  if (!APP) { console.error("daily.js: APP not initialized"); return; }
  const { esc, slug, mdToHtml } = APP.helpers;

  APP.NAV.push(["daily", "Daily · Lesson", "📅"]);
  APP.TITLE.daily = "Daily Practice · Theo Lesson";
  APP.TITLE["daily-lesson"] = "Daily · Lesson";
  APP.SUB.daily = "16 challenge sets từ giáo trình (Lesson 1–15 + Break)";
  APP.SUB["daily-lesson"] = "";
  APP.EYEBROW.daily = "Daily · By Lesson";
  APP.EYEBROW["daily-lesson"] = "Daily · By Lesson";

  /* ============== Lazy loader ============== */
  window.__DAILY__ = window.__DAILY__ || {};
  const dailyCache = {};
  const pending = {};
  function loadDailyLesson(key) {
    if (dailyCache[key]) return Promise.resolve(dailyCache[key]);
    if (window.__DAILY__[key]) { dailyCache[key] = window.__DAILY__[key]; return Promise.resolve(dailyCache[key]); }
    if (pending[key]) return pending[key];
    pending[key] = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = `dist/daily/${key}.js`;
      s.onload = () => {
        const data = window.__DAILY__[key];
        if (!data) { reject(new Error(`No data for ${key} after load`)); return; }
        dailyCache[key] = data;
        resolve(data);
      };
      s.onerror = () => reject(new Error(`Failed to load dist/daily/${key}.js`));
      document.head.appendChild(s);
    });
    return pending[key];
  }
  APP.loadDailyLesson = loadDailyLesson;

  /* ============== Daily index page ============== */
  function dailyIndexPage() {
    const idx = APP.data.dailyIndex || [];
    if (!idx.length) {
      return `<section class="hero"><span class="tag">Daily</span><h2>Chưa có dữ liệu daily</h2>
        <p>Chạy <code>npm run build</code> để normalize <code>source/daily/*</code>.</p></section>`;
    }
    const cards = idx.map((l) => {
      const pct = l.correctRate != null ? Math.round(l.correctRate * 100) : null;
      const bar = pct != null
        ? `<div class="mini-bar"><i style="width:${pct}%"></i></div><span class="mini-bar-label">${pct}% · ${l.totalCorrect || 0}/${l.totalQuestion || 0}</span>`
        : `<span class="mini-bar-label muted">Chưa chấm</span>`;
      const notes = (l.challenges || []).map((c) => `<li>${esc(c.note || c.title)}</li>`).join("");
      return `<article class="daily-card searchable" data-key="${esc(l.key)}">
        <div class="daily-card-head"><span class="daily-no">${esc(l.number || "•")}</span>
          <div><h3>${esc(l.label)}</h3><p class="muted">${(l.challenges || []).length} challenge · ${l.totalQuestion || 0} câu</p></div></div>
        <ul class="daily-notes">${notes}</ul>
        ${bar}
        <div class="daily-actions">
          <button class="btn" data-open="${esc(l.key)}">Mở lesson →</button>
        </div>
      </article>`;
    }).join("");
    return `<section class="hero daily-hero"><span class="tag">16 lessons</span>
      <h2>Daily Practice · Theo Lesson</h2>
      <p>Bài tập daily từ LangGo, đã chuẩn hóa. Bấm vào lesson để xem nội dung + đề + đáp án + flashcard.</p></section>
      <div class="daily-grid">${cards}</div>`;
  }
  APP.wirers.daily = function () {
    document.querySelectorAll(".daily-card [data-open]").forEach((b) => {
      b.onclick = () => APP.go("daily-lesson", { lessonKey: b.dataset.open, tab: "study" });
    });
    document.querySelectorAll(".daily-card").forEach((c) => {
      c.addEventListener("click", (e) => {
        if (e.target.closest("[data-open]")) return;
        APP.go("daily-lesson", { lessonKey: c.dataset.key, tab: "study" });
      });
    });
  };

  /* ============== Daily lesson detail page ============== */
  async function dailyLessonPage(opts) {
    const key = (opts && opts.lessonKey) || "";
    const tab = (opts && opts.tab) || "study";
    if (!key) return `<p>Chưa chọn lesson.</p>`;
    let data;
    try { data = await loadDailyLesson(key); }
    catch (e) { return `<pre class="callout warn">Không tải được ${esc(key)}: ${esc(e.message)}</pre>`; }
    const summary = (APP.data.dailyIndex || []).find((x) => x.key === key) || {};
    const tabs = ["study", "exercises", "flashcard"].map((t) =>
      `<button class="tab-btn${t === tab ? " active" : ""}" data-tab="${t}" data-key="${esc(key)}">${
        t === "study" ? "📖 Study" : t === "exercises" ? "📝 Exercises" : "🎴 Flashcard"
      }</button>`).join("");
    let body;
    if (tab === "exercises") body = renderExercises(data);
    else if (tab === "flashcard") body = renderFlashcard(data, key);
    else body = renderStudy(data);
    const head = `<section class="hero daily-hero"><a href="#" class="back-link" data-back>← Quay lại danh sách</a>
      <span class="tag">${esc(summary.number ? "Lesson " + summary.number : "Daily")}</span>
      <h2>${esc(summary.label || data.title || key)}</h2>
      <p class="muted">${(data.challenges || []).map((c) => esc(c.note || c.title)).join(" · ")}</p></section>
      <div class="tabs">${tabs}</div>`;
    return `<div class="daily-detail" data-key="${esc(key)}">${head}<div class="tab-panel">${body}</div></div>`;
  }

  /* ---------- Study renderer ---------- */
  function renderStudy(data) {
    const blocks = (data.contentBlocks || []);
    if (!blocks.length) return `<p class="muted">Lesson này không có content block.</p>`;
    return blocks.map((b, i) => {
      const audios = (b.audioRefs || []).map(audioRefHtml).join("");
      const imgs = (b.imageRefs || []).map((r) => `<figure class="ex-img"><img loading="lazy" src="${esc(r.localFile || r.url)}" alt=""></figure>`).join("");
      const topics = (b.topics || []).map((t) => topicBadge(t)).join("");
      const body = b.html || `<p>${esc(b.text || "")}</p>`;
      return `<article class="content-block searchable" id="block-${esc(b.id || i)}">
        <div class="block-badges">${topics}<span class="challenge-badge">Challenge ${esc(b.challengeNumber || "?")}</span></div>
        <div class="block-body">${body}</div>
        ${audios ? `<div class="block-audios">${audios}</div>` : ""}
        ${imgs}
      </article>`;
    }).join("");
  }
  function audioRefHtml(a) {
    return `<div class="inline-audio"><span class="audio-title">🎧 ${esc(a.script || a.text || "audio")}</span>
      <audio controls preload="none" src="${esc(a.localFile || a.url)}"></audio></div>`;
  }
  function topicBadge(t) {
    const key = typeof t === "string" ? t : t.key;
    const role = typeof t === "string" ? "core" : (t.role || "core");
    const lbl = (APP.data.topicLabels[key] && APP.data.topicLabels[key].label) || key;
    return `<span class="topic-badge role-${role}">${esc(lbl)} · <em>${role}</em></span>`;
  }

  /* ---------- Exercises renderer ---------- */
  function renderExercises(data) {
    const groups = data.exerciseGroups || [{ id: "all", title: "Tất cả", questions: data.questions || [] }];
    if (!groups.length) return `<p class="muted">Lesson này không có exercise.</p>`;
    return groups.map((g) => {
      const questions = (g.questions || []).map(renderQuestion).join("");
      return `<section class="exercise-group">
        <h3 class="exercise-head">${esc(g.title || "Exercise")}</h3>
        ${g.introHtml ? `<div class="exercise-intro">${g.introHtml}</div>` : ""}
        ${questions}
      </section>`;
    }).join("");
  }
  // Fill-blank review: hydrate `<span class="blank-slot" data-blank="N">` with correct answers
  // and demote the legacy per-blank list to a collapsible "Danh sách đáp án" details block.
  function hydrateBlankSlots(bodyHtml, blanks) {
    if (!bodyHtml) return "";
    const bl = blanks || [];
    return String(bodyHtml).replace(/<span class="blank-slot" data-blank="(\d+)"><\/span>/g, (m, n) => {
      const idx = parseInt(n, 10);
      const b = bl[idx];
      const ans = b && Array.isArray(b.answers) ? b.answers.join(" / ") : "";
      return `<span class="blank-slot filled" data-blank="${n}">${esc(ans)}</span>`;
    });
  }
  function renderFillBlankReview(q) {
    const blanks = q.blanks || [];
    const legend = blanks.length
      ? `<details class="explain-details fill-legend"><summary>Danh sách đáp án (${blanks.length})</summary>${
          blanks.map((b, i) =>
            `<div class="qblank"><span class="qblank-idx">${i + 1}.</span> <code>${esc((b.answers || []).join(" / "))}</code></div>`
          ).join("")
        }</details>`
      : "";
    if (q.bodyHtml) {
      const hydrated = hydrateBlankSlots(q.bodyHtml, blanks);
      return `<div class="fill-body">${hydrated}</div>${legend}`;
    }
    // Fallback: no answerTemplate → fall back to the numbered accepted-answer list only.
    if (!blanks.length) return "";
    return `<div class="qblanks-label muted">Đáp án đúng:</div>` +
      blanks.map((b, i) =>
        `<div class="qblank"><span class="qblank-idx">${i + 1}.</span> <code>${esc((b.answers || []).join(" / "))}</code>${b.explanationHtml ? `<div class="qblank-explain">${b.explanationHtml}</div>` : ""}</div>`
      ).join("");
  }
  APP.helpers.hydrateBlankSlots = hydrateBlankSlots;
  APP.helpers.renderFillBlankReview = renderFillBlankReview;

  function renderQuestion(q) {
    const audios = (q.audioRefs || []).map(audioRefHtml).join("");
    const imgs = (q.imageRefs || []).map((r) => `<figure class="ex-img"><img loading="lazy" src="${esc(r.localFile || r.url)}" alt=""></figure>`).join("");
    const topics = (q.topics || []).map(topicBadge).join("");

    if (q.kind === "info") {
      const hasBody = (q.promptHtml && q.promptHtml.trim()) || (q.prompt && q.prompt.trim()) || (q.explanationHtml && q.explanationHtml.trim()) || imgs || audios;
      if (!hasBody) return "";
      const explainInfo = q.explanationHtml ? `<div class="qinfo-explain">${q.explanationHtml}</div>` : "";
      return `<article class="qcard qcard-info searchable" id="q-${esc(q.id)}">
        <div class="block-badges">${topics}<span class="qtype-badge">info</span></div>
        <div class="qprompt">${q.promptHtml || esc(q.prompt || "")}</div>
        ${imgs}
        ${audios ? `<div class="block-audios">${audios}</div>` : ""}
        ${explainInfo}
      </article>`;
    }

    let answerBlock = "";
    switch (q.kind) {
      case "single_choice":
      case "multi_select": {
        const opts = (q.options || []).map((o) => {
          const isCorrect = q.correctAnswer && q.correctAnswer.includes(o.id);
          const isUser = q.userAnswer && q.userAnswer.includes(o.id);
          const cls = isCorrect ? "qopt correct" : (isUser ? "qopt wrong" : "qopt");
          const tag = isCorrect ? "<span class='qopt-tag'>✓ đáp án đúng</span>" : (isUser ? "<span class='qopt-tag'>× bạn đã chọn</span>" : "");
          return `<li class="${cls}">${o.html || esc(o.text || "")}${tag}</li>`;
        }).join("");
        answerBlock = opts ? `<ul class="qopts">${opts}</ul>` : "";
        break;
      }
      case "fill_blank": {
        answerBlock = renderFillBlankReview(q);
        break;
      }
      case "matching": {
        const pairs = q.pairs || [];
        if (!pairs.length) {
          answerBlock = `<div class="qopen muted">Không có dữ liệu ghép cặp cho câu này.</div>`;
          break;
        }
        const rows = pairs.map((p) =>
          `<tr><td>${esc(p.left || "")}</td><td>${esc(p.right || "")}</td></tr>`).join("");
        answerBlock = `<table class="qmatch"><thead><tr><th>Word</th><th>Meaning</th></tr></thead><tbody>${rows}</tbody></table>`;
        break;
      }
      case "open_or_video":
      default: {
        const ua = q.userAnswer;
        if (typeof ua === "string") {
          const isUrl = /^https?:/.test(ua);
          answerBlock = `<div class="qopen"><b>Đã nộp:</b> ${isUrl ? `<a href="${esc(ua)}" target="_blank" rel="noopener">${esc(ua)}</a>` : esc(ua)}</div>`;
        } else if (Array.isArray(ua)) {
          answerBlock = `<div class="qopen"><b>Đã nộp:</b><ul>${ua.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>`;
        } else {
          answerBlock = `<div class="qopen muted">Yêu cầu tự soạn (video / text).</div>`;
        }
      }
    }
    const explain = q.explanationHtml ? `<details class="explain-details"><summary>Giải thích</summary>${q.explanationHtml}</details>` : "";
    return `<article class="qcard searchable" id="q-${esc(q.id)}">
      <div class="block-badges">${topics}<span class="qtype-badge">${esc(q.kind || "?")}</span>${q.correct === true ? "<span class='q-ok'>✓ đúng</span>" : (q.correct === false ? "<span class='q-bad'>× sai</span>" : "")}</div>
      <div class="qprompt">${q.promptHtml || esc(q.prompt || "")}</div>
      ${imgs}
      ${audios ? `<div class="block-audios">${audios}</div>` : ""}
      ${answerBlock}
      ${explain}
    </article>`;
  }

  /* ---------- Flashcard renderer ---------- */
  function buildDeck(data) {
    const cards = [];
    (data.audio || []).forEach((a) => {
      if (!a.script) return;
      cards.push({ id: "au-" + a.id, front: a.script, back: audioRefHtml(a), kind: "audio" });
    });
    (data.vocabPairs || []).forEach((p, i) => {
      cards.push({ id: "vp-" + i, front: p.term, back: `<div class="fc-meaning">${esc(p.meaning || "")}</div>`, kind: "vocab" });
    });
    return cards;
  }
  function renderFlashcard(data, lessonKey) {
    const deck = buildDeck(data);
    if (!deck.length) return `<p class="muted">Chưa có material cho flashcard (thiếu script + vocab pairs).</p>`;
    return `<div class="flashcard-wrap" data-lesson="${esc(lessonKey)}" data-total="${deck.length}">
      <div class="fc-progress">Thẻ <span class="fc-cur">1</span>/${deck.length} · <span class="fc-known">0</span> đã thuộc</div>
      <div class="flashcard" tabindex="0">
        <div class="fc-face fc-front"></div>
        <div class="fc-face fc-back" hidden></div>
      </div>
      <div class="fc-controls">
        <button class="btn ghost" data-fc="prev">← Prev</button>
        <button class="btn" data-fc="flip">Lật thẻ (Space)</button>
        <button class="btn ghost" data-fc="next">Next →</button>
      </div>
      <div class="fc-mark">
        <button class="btn ghost" data-fc="again">Học lại (1)</button>
        <button class="btn ghost" data-fc="hard">Còn khó (2)</button>
        <button class="btn" data-fc="known">Đã thuộc (3)</button>
      </div>
      <script type="application/json" class="fc-deck">${JSON.stringify(deck).replace(/</g, "\\u003c")}<\/script>
    </div>`;
  }

  /* ============== Wire daily-lesson ============== */
  APP.wirers["daily-lesson"] = function (opts) {
    document.querySelectorAll("[data-back]").forEach((a) => a.onclick = (e) => { e.preventDefault(); APP.go("daily"); });
    document.querySelectorAll(".tab-btn").forEach((b) => b.onclick = () => APP.go("daily-lesson", { lessonKey: b.dataset.key, tab: b.dataset.tab }));
    wireFlashcard(opts && opts.lessonKey);
  };

  function wireFlashcard(lessonKey) {
    const wrap = document.querySelector(".flashcard-wrap");
    if (!wrap) return;
    const deckNode = wrap.querySelector(".fc-deck");
    if (!deckNode) return;
    const deck = JSON.parse(deckNode.textContent);
    const card = wrap.querySelector(".flashcard");
    const front = card.querySelector(".fc-front");
    const back = card.querySelector(".fc-back");
    const curEl = wrap.querySelector(".fc-cur");
    const knownEl = wrap.querySelector(".fc-known");
    const lsKey = `ielts-daily-${lessonKey}-flashcard`;
    let progress = {};
    try { progress = JSON.parse(localStorage.getItem(lsKey)) || {}; } catch (e) {}
    let idx = 0;
    function paint() {
      const c = deck[idx];
      front.innerHTML = c.front;
      back.innerHTML = c.back;
      back.hidden = true; front.hidden = false;
      curEl.textContent = String(idx + 1);
      knownEl.textContent = String(Object.values(progress).filter((v) => v && v.box >= 3).length);
    }
    function flip() { const f = back.hidden; back.hidden = !f; front.hidden = f; }
    function goto(n) { idx = (n + deck.length) % deck.length; paint(); }
    function mark(box) {
      const c = deck[idx];
      progress[c.id] = { box, lastSeen: Date.now() };
      try { localStorage.setItem(lsKey, JSON.stringify(progress)); } catch (e) {}
      goto(idx + 1);
    }
    wrap.querySelector('[data-fc="prev"]').onclick = () => goto(idx - 1);
    wrap.querySelector('[data-fc="next"]').onclick = () => goto(idx + 1);
    wrap.querySelector('[data-fc="flip"]').onclick = flip;
    wrap.querySelector('[data-fc="again"]').onclick = () => mark(1);
    wrap.querySelector('[data-fc="hard"]').onclick = () => mark(2);
    wrap.querySelector('[data-fc="known"]').onclick = () => mark(3);
    card.addEventListener("click", flip);
    card.focus();
    document.addEventListener("keydown", onKey);
    function onKey(e) {
      if (!document.body.contains(wrap)) { document.removeEventListener("keydown", onKey); return; }
      if (e.target.matches("input,textarea,select")) return;
      if (e.code === "Space") { e.preventDefault(); flip(); }
      else if (e.key === "ArrowLeft") goto(idx - 1);
      else if (e.key === "ArrowRight") goto(idx + 1);
      else if (e.key === "1") mark(1);
      else if (e.key === "2") mark(2);
      else if (e.key === "3") mark(3);
    }
    paint();
  }

  APP.renderers.daily = dailyIndexPage;
  APP.renderers["daily-lesson"] = dailyLessonPage;
})();
