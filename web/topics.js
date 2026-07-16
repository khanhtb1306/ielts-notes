/* ================================================================
 * topics.js - Daily Practice · By Topic (cross-lesson)
 *
 * Registers 2 pages: `topics` (index of all topics grouped by skill)
 * and `topic-detail` (aggregates content blocks + questions from
 * all lessons for one topic). Uses APP.loadDailyLesson from daily.js.
 * ================================================================ */
(function bootTopics() {
  const APP = window.APP;
  if (!APP) { console.error("topics.js: APP not initialized"); return; }
  const { esc } = APP.helpers;

  APP.NAV.push(["topics", "Daily · Topic", "🏷️"]);
  APP.TITLE.topics = "Daily Practice · Theo Chủ Đề";
  APP.TITLE["topic-detail"] = "Chủ đề";
  APP.SUB.topics = "Gom xuyên suốt các chủ đề Grammar / Pronunciation / Vocabulary / Speaking";
  APP.SUB["topic-detail"] = "";
  APP.EYEBROW.topics = "Daily · By Topic";
  APP.EYEBROW["topic-detail"] = "Daily · By Topic";

  const SKILL_ORDER = ["grammar", "pronunciation", "vocabulary", "speaking", "listening"];
  const SKILL_LABEL = { grammar: "Grammar", pronunciation: "Pronunciation", vocabulary: "Vocabulary", speaking: "Speaking", listening: "Listening" };

  /* ============== Topics index page ============== */
  function topicsIndexPage() {
    const idx = APP.data.topicsIndex || { topics: {}, order: [] };
    const labels = APP.data.topicLabels || {};
    const topicKeys = idx.order || Object.keys(idx.topics || {});
    if (!topicKeys.length) {
      return `<section class="hero"><span class="tag">Topics</span><h2>Chưa có topics index</h2>
        <p>Chạy <code>npm run build</code> để sinh <code>dist/topics-index.js</code>.</p></section>`;
    }
    // group by skill
    const groups = {};
    topicKeys.forEach((k) => {
      const meta = labels[k] || {};
      const skill = meta.skill || (idx.topics[k] && idx.topics[k].skill) || "misc";
      (groups[skill] = groups[skill] || []).push(k);
    });
    const order = SKILL_ORDER.concat(Object.keys(groups).filter((s) => !SKILL_ORDER.includes(s)));
    const sections = order.map((skill) => {
      const list = groups[skill]; if (!list) return "";
      const cards = list.map((k) => {
        const t = idx.topics[k] || {};
        const meta = labels[k] || {};
        const label = meta.label || t.label || k;
        const refs = t.refs || [];
        const nCore = refs.filter((r) => r.role === "core").length;
        const nReview = refs.filter((r) => r.role === "review").length;
        const nPreview = refs.filter((r) => r.role === "preview").length;
        const lessons = [...new Set(refs.map((r) => r.lessonKey))].sort();
        const needs = meta.needsNotes ? `<span class="need-notes-badge">chưa có notes</span>` : "";
        return `<article class="topic-card searchable" data-topic="${esc(k)}">
          <div class="topic-card-head">
            <h3>${esc(label)}${needs}</h3>
            <span class="topic-skill">${esc(SKILL_LABEL[skill] || skill)}</span>
          </div>
          <p class="muted topic-count">${refs.length} item · ${nCore} core · ${nReview} review · ${nPreview} preview</p>
          <p class="muted topic-lessons">Có mặt trong: ${lessons.length ? lessons.map((l) => `<span class="mini-chip">${esc(l.replace("lesson-", "L"))}</span>`).join("") : "—"}</p>
          <div class="topic-actions"><button class="btn" data-open-topic="${esc(k)}">Mở chủ đề →</button></div>
        </article>`;
      }).join("");
      return `<section class="topic-section">
        <h2>${esc(SKILL_LABEL[skill] || skill)}</h2>
        <div class="topic-grid">${cards}</div>
      </section>`;
    }).join("");
    return `<section class="hero topics-hero"><span class="tag">${topicKeys.length} chủ đề</span>
      <h2>Daily Practice · Theo Chủ Đề</h2>
      <p>Gom mọi content block + câu hỏi thuộc cùng chủ đề, xuyên suốt 16 lessons. Phân biệt <span class="role-badge role-core">core</span> · <span class="role-badge role-review">review</span> · <span class="role-badge role-preview">preview</span> để biết bài chính vs ôn lại vs chuẩn bị.</p>
    </section>${sections}`;
  }

  APP.wirers.topics = function () {
    document.querySelectorAll("[data-open-topic]").forEach((b) => {
      b.onclick = () => APP.go("topic-detail", { topicKey: b.dataset.openTopic, tab: "study" });
    });
    document.querySelectorAll(".topic-card").forEach((c) => c.addEventListener("click", (e) => {
      if (e.target.closest("[data-open-topic]")) return;
      APP.go("topic-detail", { topicKey: c.dataset.topic, tab: "study" });
    }));
  };

  /* ============== Topic detail page ============== */
  async function topicDetailPage(opts) {
    const key = (opts && opts.topicKey) || "";
    const tab = (opts && opts.tab) || "study";
    const idx = APP.data.topicsIndex || { topics: {} };
    const t = idx.topics[key];
    if (!t) return `<pre class="callout warn">Không tìm thấy topic: ${esc(key)}</pre>`;
    const meta = APP.data.topicLabels[key] || {};
    const label = meta.label || t.label || key;
    const refs = t.refs || [];

    // Determine which lessons to load
    const lessonKeys = [...new Set(refs.map((r) => r.lessonKey))].sort();
    let lessons;
    try { lessons = await Promise.all(lessonKeys.map((k) => APP.loadDailyLesson(k))); }
    catch (e) { return `<pre class="callout warn">Không tải được lessons: ${esc(e.message)}</pre>`; }
    const byKey = {};
    lessonKeys.forEach((k, i) => { byKey[k] = lessons[i]; });

    // Gather actual items by topic refs
    const blockItems = [];
    const questionItems = [];
    const audioItems = [];
    refs.forEach((r) => {
      const L = byKey[r.lessonKey]; if (!L) return;
      if (r.kind === "block") {
        const b = (L.contentBlocks || []).find((x) => x.id === r.itemId);
        if (b) blockItems.push({ lessonKey: r.lessonKey, role: r.role, block: b });
      } else if (r.kind === "question") {
        const q = flattenQuestions(L).find((x) => x.id === r.itemId);
        if (q) questionItems.push({ lessonKey: r.lessonKey, role: r.role, question: q });
      } else if (r.kind === "audio") {
        const a = (L.audio || []).find((x) => x.id === r.itemId);
        if (a) audioItems.push({ lessonKey: r.lessonKey, role: r.role, audio: a });
      }
    });

    const tabs = ["study", "exercises", "flashcard", "questions"].map((tv) =>
      `<button class="tab-btn${tv === tab ? " active" : ""}" data-tab="${tv}" data-topic="${esc(key)}">${
        tv === "study" ? "📖 Study" : tv === "exercises" ? "📝 Exercises" : tv === "flashcard" ? "🎴 Flashcard" : "❓ Câu hỏi Speaking"
      }</button>`).join("");

    let body;
    if (tab === "exercises") body = renderTopicExercises(questionItems);
    else if (tab === "flashcard") body = renderTopicFlashcard(audioItems, blockItems, key);
    else if (tab === "questions") body = renderSpeakingQuestions(key);
    else body = renderTopicStudy(blockItems);

    const skillLbl = SKILL_LABEL[meta.skill] || meta.skill || "";
    const needs = meta.needsNotes ? `<span class="need-notes-badge">chưa có notes</span>` : "";
    const head = `<section class="hero topics-hero"><a href="#" class="back-link" data-back-topics>← Danh sách chủ đề</a>
      <span class="tag">${esc(skillLbl)}</span>
      <h2>${esc(label)}${needs}</h2>
      <p class="muted">${refs.length} item · trải qua ${lessonKeys.length} lesson: ${lessonKeys.map((l) => esc(l.replace("lesson-", "L"))).join(", ")}</p>
    </section>
    <div class="tabs">${tabs}</div>`;
    return `<div class="topic-detail" data-topic="${esc(key)}">${head}<div class="tab-panel">${body}</div></div>`;
  }
  function flattenQuestions(L) {
    if (Array.isArray(L.questions)) return L.questions;
    const out = [];
    (L.exerciseGroups || []).forEach((g) => (g.questions || []).forEach((q) => out.push(q)));
    return out;
  }
  function renderTopicStudy(items) {
    if (!items.length) return `<p class="muted">Chủ đề này không có content block trong daily.</p>`;
    return items.map(({ lessonKey, role, block }) => {
      const body = block.html || `<p>${esc(block.text || "")}</p>`;
      const audios = (block.audioRefs || []).map((a) =>
        `<div class="inline-audio"><span class="audio-title">🎧 ${esc(a.script || "audio")}</span>
        <audio controls preload="none" src="${esc(a.localFile || a.url)}"></audio></div>`).join("");
      return `<article class="content-block searchable">
        <div class="block-badges"><span class="lesson-src-badge">${esc(lessonKey.replace("lesson-", "Lesson "))}</span><span class="role-badge role-${role}">${role}</span></div>
        <div class="block-body">${body}</div>
        ${audios ? `<div class="block-audios">${audios}</div>` : ""}
      </article>`;
    }).join("");
  }
  function renderTopicExercises(items) {
    if (!items.length) return `<p class="muted">Chủ đề này không có exercise trong daily.</p>`;
    // Reuse renderQuestion from daily.js via APP.renderers? We copy the minimum shape here.
    return items.map(({ lessonKey, role, question: q }) => {
      const label = `<div class="block-badges"><span class="lesson-src-badge">${esc(lessonKey.replace("lesson-", "Lesson "))}</span><span class="role-badge role-${role}">${role}</span></div>`;
      return `<article class="qcard searchable">${label}<div class="qprompt">${q.promptHtml || esc(q.prompt || "")}</div>${renderAnswerBlock(q)}${q.explanationHtml ? `<details class="explain-details"><summary>Giải thích</summary>${q.explanationHtml}</details>` : ""}</article>`;
    }).join("");
  }
  function renderAnswerBlock(q) {
    switch (q.kind) {
      case "single_choice":
      case "multi_select": {
        const opts = (q.options || []).map((o) => {
          const c = q.correctAnswer && q.correctAnswer.includes(o.id);
          return `<li class="qopt${c ? " correct" : ""}">${o.html || esc(o.text || "")}${c ? "<span class='qopt-tag'>✓ đúng</span>" : ""}</li>`;
        }).join("");
        return opts ? `<ul class="qopts">${opts}</ul>` : "";
      }
      case "fill_blank": {
        if (APP.helpers.renderFillBlankReview) return APP.helpers.renderFillBlankReview(q);
        const blanks = (q.blanks || []).map((b, i) =>
          `<div class="qblank"><span class="qblank-idx">${i + 1}.</span> <code>${esc((b.answers || []).join(" / "))}</code></div>`).join("");
        return blanks;
      }
      case "matching": {
        const rows = (q.pairs || []).map((p) => `<tr><td>${esc(p.left || "")}</td><td>${esc(p.right || "")}</td></tr>`).join("");
        return rows ? `<table class="qmatch"><thead><tr><th>Word</th><th>Meaning</th></tr></thead><tbody>${rows}</tbody></table>` : "";
      }
      default: return "";
    }
  }
  function renderTopicFlashcard(audioItems, blockItems, topicKey) {
    const cards = [];
    audioItems.forEach(({ audio: a, lessonKey }) => {
      if (!a.script) return;
      cards.push({
        id: "au-" + a.id,
        front: `<div class="fc-hint">${esc(lessonKey.replace("lesson-", "L"))}</div>${esc(a.script)}`,
        back: `<div class="inline-audio"><audio controls autoplay preload="none" src="${esc(a.localFile || a.url)}"></audio></div>`,
        kind: "audio"
      });
    });
    if (!cards.length) return `<p class="muted">Chủ đề này chưa có audio+transcript để làm flashcard.</p>`;
    return `<div class="flashcard-wrap" data-topic="${esc(topicKey)}" data-total="${cards.length}">
      <div class="fc-progress">Thẻ <span class="fc-cur">1</span>/${cards.length} · <span class="fc-known">0</span> đã thuộc</div>
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
      <script type="application/json" class="fc-deck">${JSON.stringify(cards).replace(/</g, "\\u003c")}<\/script>
    </div>`;
  }
  function renderSpeakingQuestions(key) {
    const meta = APP.data.topicLabels[key] || {};
    if (meta.skill !== "speaking") return `<p class="muted">Tab này chỉ áp dụng cho chủ đề Speaking.</p>`;
    const bank = (APP.data.speakingQuestions || {})[key] || [];
    if (!bank.length) return `<p class="muted">Chưa có câu hỏi trong topics-map.json cho chủ đề này.</p>`;
    return `<section class="speaking-bank">
      <h3>Bộ câu hỏi Final Test · ${esc(meta.label || key)}</h3>
      <ol class="speaking-qlist">${bank.map((q) => `<li>${esc(q.q)}${q.subQuestions ? `<ul>${q.subQuestions.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>` : ""}</li>`).join("")}</ol>
      ${meta.needsNotes ? `<p class="muted"><em>Chủ đề này chưa có notes markdown — cần soạn source/speaking/<code>${esc(key)}</code>.md sau.</em></p>` : ""}
    </section>`;
  }

  APP.wirers["topic-detail"] = function (opts) {
    document.querySelectorAll("[data-back-topics]").forEach((a) => a.onclick = (e) => { e.preventDefault(); APP.go("topics"); });
    document.querySelectorAll(".tab-btn").forEach((b) => b.onclick = () => APP.go("topic-detail", { topicKey: b.dataset.topic, tab: b.dataset.tab }));
    wireTopicFlashcard(opts && opts.topicKey);
  };
  function wireTopicFlashcard(topicKey) {
    const wrap = document.querySelector(".flashcard-wrap[data-topic]");
    if (!wrap) return;
    const deckNode = wrap.querySelector(".fc-deck");
    const deck = JSON.parse(deckNode.textContent);
    const card = wrap.querySelector(".flashcard");
    const front = card.querySelector(".fc-front");
    const back = card.querySelector(".fc-back");
    const curEl = wrap.querySelector(".fc-cur");
    const knownEl = wrap.querySelector(".fc-known");
    const lsKey = `ielts-topic-${topicKey}-flashcard`;
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

  APP.renderers.topics = topicsIndexPage;
  APP.renderers["topic-detail"] = topicDetailPage;
})();
