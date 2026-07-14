(function clientApp() {
  const DATA = window.__DATA__ || { docs: [], meta: {}, audio: [], ipa: {} };
  const DOCS = DATA.docs;
  const AUDIO = DATA.audio;
  const IPA = DATA.ipa || {};
  const M = DATA.meta || {};

  const NAV = [
    ["stage", "Current Stage", "🎯"],
    ["course", "Course Map", "🗺️"],
    ["pronunciation", "Pronunciation", "🔊"],
    ["grammar", "Grammar", "📐"],
    ["speaking", "Speaking", "💬"],
    ["final", "Final Review", "🏁"],
  ];
  const SUB = {
    stage: M.stageSub, course: M.courseSub, pronunciation: M.pronSub,
    grammar: M.grammarSub, speaking: M.speakingSub, final: M.reviewSub,
  };
  const TITLE = { stage: "Current Stage", course: "Course Map", pronunciation: "Pronunciation Notes", grammar: "Grammar Notes", speaking: "Speaking Notes", final: "Final Review · Pre-IELTS" };
  const state = { page: "stage" };

  const el = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[m]));
  const inline = (s) =>
    esc(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  const slug = (s) =>
    String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

  /* ================= Speech ================= */
  let VOICES = [];
  function loadVoices() { VOICES = (window.speechSynthesis ? speechSynthesis.getVoices() : []) || []; }
  if (window.speechSynthesis) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
  function enVoices() { return VOICES.filter((v) => /^en/i.test(v.lang)); }
  function pickVoice() {
    const sel = el("voiceSel");
    const list = enVoices();
    if (sel && sel.value) { const f = list.find((v) => v.name === sel.value); if (f) return f; }
    return list[0] || null;
  }
  function speak(text) {
    if (!window.speechSynthesis) return false;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice(); if (v) u.voice = v;
    u.lang = "en-US";
    const r = el("rateSel"); u.rate = r ? parseFloat(r.value) : 0.9;
    speechSynthesis.speak(u);
    return true;
  }
  async function dictLookup(word) {
    try {
      const res = await fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + encodeURIComponent(word), { cache: "force-cache" });
      if (!res.ok) return null;
      const j = await res.json();
      const entry = j[0] || {};
      const ph = entry.phonetics || [];
      const audio = ph.map((p) => p.audio).filter(Boolean)[0] || "";
      const ipa = entry.phonetic || ph.map((p) => p.text).filter(Boolean)[0] || "";
      return { ipa, audio };
    } catch (e) { return null; }
  }
  const audioEl = new Audio();
  function playUrl(url) { try { audioEl.src = url; audioEl.play(); return true; } catch (e) { return false; } }

  /* ================= Audio bank ================= */
  const audioById = (n) => AUDIO.find((a) => String(a.num) === String(n));
  const audioHtml = (a) => a
    ? '<div class="inline-audio"><span class="audio-title">🎧 Audio trung tâm: ' + esc(a.title) +
      '</span><audio controls preload="none" src="' + esc(a.file) + '"></audio></div>'
    : "";

  /* ================= Markdown ================= */
  function mdToHtml(md) {
    const lines = md.split(/\r?\n/); const out = []; let i = 0;
    function table() {
      const rows = [];
      while (i < lines.length && /^\|.*\|\s*$/.test(lines[i])) rows.push(lines[i++]);
      if (rows.length < 2) return;
      const cells = (r) => r.split("|").slice(1, -1).map((x) => x.trim());
      const head = cells(rows[0]); const body = rows.slice(2).map(cells);
      out.push('<div class="table-wrap"><table><thead><tr>' + head.map((h) => `<th>${inline(h)}</th>`).join("") +
        "</tr></thead><tbody>" + body.map((r) => "<tr>" + r.map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>").join("") + "</tbody></table></div>");
    }
    function list(ordered) {
      const items = []; const re = ordered ? /^\d+\.\s+(.+)/ : /^[-*]\s+(.+)/;
      while (i < lines.length && re.test(lines[i])) items.push(lines[i++].replace(re, "$1"));
      const tag = ordered ? "ol" : "ul";
      out.push(`<${tag}>` + items.map((x) => `<li>${inline(x)}</li>`).join("") + `</${tag}>`);
    }
    function blockquote() {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ""));
      let kind = "tip", title = "";
      const head = buf[0] && buf[0].match(/^\[!(warn|tip)\]\s*(.*)$/i);
      if (head) { kind = head[1].toLowerCase(); title = head[2]; buf.shift(); }
      out.push(`<div class="callout ${kind}">` + (title ? `<b>${inline(title)}</b>` : "") + mdToHtml(buf.join("\n")) + "</div>");
    }
    while (i < lines.length) {
      const line = lines[i];
      if (!line.trim()) { i++; continue; }
      const au = line.match(/^\[\[audio:(\d+)\]\]\s*$/);
      if (au) { out.push(audioHtml(audioById(au[1]))); i++; continue; }
      if (/^>\s?/.test(line)) { blockquote(); continue; }
      if (/^\|.*\|\s*$/.test(line)) { table(); continue; }
      const h = line.match(/^(#{1,4})\s+(.+)/);
      if (h) { const lv = h[1].length; out.push(`<h${lv} id="${slug(h[2])}">${inline(h[2])}</h${lv}>`); i++; continue; }
      if (/^\d+\.\s+/.test(line)) { list(true); continue; }
      if (/^[-*]\s+/.test(line)) { list(false); continue; }
      const paras = [];
      while (i < lines.length && lines[i].trim() && !/^(#{1,4})\s+/.test(lines[i]) && !/^\|.*\|\s*$/.test(lines[i]) &&
        !/^[-*]\s+/.test(lines[i]) && !/^\d+\.\s+/.test(lines[i]) && !/^>\s?/.test(lines[i]) && !/^\[\[audio:\d+\]\]/.test(lines[i]))
        paras.push(lines[i++]);
      out.push(`<p>${inline(paras.join(" "))}</p>`);
    }
    return out.join("\n");
  }

  const skillLabel = { pronunciation: "Pronunciation", grammar: "Grammar", speaking: "Speaking" };
  function badges(doc) {
    let b = `<span class="badge skill">${skillLabel[doc.type] || doc.type}</span>`;
    if (doc.lesson) b += `<span class="badge lesson">${esc(doc.lesson)}</span>`;
    if (/high/i.test(doc.priority)) b += `<span class="badge hi">Ưu tiên cao</span>`;
    return `<div class="badges">${b}</div>`;
  }
  function docSection(doc) {
    return `<article class="note-section searchable" id="doc-${doc.id}">${badges(doc)}<div class="note-content">${mdToHtml(doc.markdown)}</div>` +
      `<div class="source">Nguồn: ${esc(doc.file)}</div></article>`;
  }
  function chips(type) {
    const list = DOCS.filter((d) => d.type === type);
    if (!list.length) return "";
    return `<div class="chips">` + list.map((d) => `<button class="chip" data-goto="doc-${d.id}">${esc(d.title)}</button>`).join("") + `</div>`;
  }

  /* ================= Pages ================= */
  function heroOf(tag, title, text) {
    return `<section class="hero"><span class="tag">${esc(tag)}</span><h2>${esc(title)}</h2><p>${esc(text)}</p></section>`;
  }
  function stagePage() {
    const goals = (M.goals || []).map((g) => `<li>${esc(g)}</li>`).join("");
    const pr = (M.principles || []).map((p) => `<article class="note-card searchable"><h2>${esc(p.title)}</h2><p>${esc(p.text)}</p></article>`).join("");
    return heroOf("Đã học đến Lesson 15", M.stageTitle || "", M.stageIntro || "") +
      `<section class="note-card"><h2>Mục tiêu giai đoạn hiện tại</h2><ol>${goals}</ol></section>` +
      `<section class="note-grid">${pr}</section>`;
  }
  function coursePage() {
    const rows = (M.lessons || []).map((l) =>
      `<article class="course-row searchable"><div class="lesson-no">${l.n}</div><div><span class="tag">Lesson ${l.n}</span>` +
      `<h3>${esc(l.title)}</h3><p>${esc(l.focus)}</p><p><b>Nên xem:</b> ${esc(l.note)}</p><div class="source">${esc(l.source)}</div></div></article>`).join("");
    return heroOf("Lesson 1–15", "Course Map", M.courseIntro || "") + `<section class="course-map">${rows}</section>`;
  }
  function pronToolHtml() {
    const voiceOpts = enVoices().map((v) => `<option value="${esc(v.name)}">${esc(v.name)}</option>`).join("");
    return `<section class="pron-tool searchable">
      <h2>🗣️ Phát âm từ bất kỳ</h2>
      <p class="hint">Gõ một từ tiếng Anh rồi bấm Nghe. Có mạng sẽ hiện IPA và giọng người thật; không mạng dùng giọng máy.</p>
      <div class="pron-row">
        <input class="pron-input" id="pronInput" placeholder="Ví dụ: comfortable, delicious, restaurant..." />
        <button class="btn" id="pronBtn">🔊 Nghe</button>
        <button class="btn ghost" id="pronTts">Giọng máy</button>
      </div>
      <div class="pron-controls">
        ${voiceOpts ? `<label>Giọng <select id="voiceSel">${voiceOpts}</select></label>` : ""}
        <label>Tốc độ <input type="range" id="rateSel" min="0.5" max="1.1" step="0.1" value="0.9"></label>
      </div>
      <div class="pron-result" id="pronResult"></div>
    </section>`;
  }
  function ipaGrid(items, colorFn) {
    return `<div class="ipa-grid">` + items.map((s) =>
      `<button class="ipa-tile" data-word="${esc(s.word)}" style="--tile:${colorFn(s)}">` +
      `<div class="sym">/${esc(s.ipa)}/</div><div class="ex">${esc(s.word)}</div><div class="spk">🔊 nghe</div></button>`).join("") + `</div>`;
  }
  function pronunciationPage() {
    const mono = IPA.monophthongs || [], diph = IPA.diphthongs || [], cons = IPA.consonants || [];
    const vColor = (s) => (s.vi === "dài" ? "#4f46e5" : s.vi === "không nhấn" ? "#64748b" : "#0ea5e9");
    const chart = `<section class="note-card searchable">
      <h2>🔤 Bảng IPA tương tác</h2>
      <div class="ipa-legend">
        <span><i class="dot long"></i>Nguyên âm dài</span>
        <span><i class="dot short"></i>Nguyên âm ngắn</span>
        <span><i class="dot diph"></i>Nguyên âm đôi</span>
        <span><i class="dot voiced"></i>Phụ âm hữu thanh</span>
        <span><i class="dot unvoiced"></i>Phụ âm vô thanh</span>
      </div>
      <h3>Monophthongs · Nguyên âm đơn (12)</h3>${ipaGrid(mono, vColor)}
      <h3>Diphthongs · Nguyên âm đôi (8)</h3>${ipaGrid(diph, () => "#7c3aed")}
      <h3>Consonants · Phụ âm (24)</h3>${ipaGrid(cons, (s) => (s.voiced ? "#059669" : "#f97316"))}
    </section>`;
    return heroOf("Lesson 1–5", "Pronunciation Notes", M.pronSub || "") + pronToolHtml() + chart +
      DOCS.filter((d) => d.type === "pronunciation").map(docSection).join("");
  }
  function grammarPage() {
    return heroOf("Up to Lesson 15", "Grammar Notes", M.grammarSub || "") + chips("grammar") +
      DOCS.filter((d) => d.type === "grammar").map(docSection).join("");
  }
  function speakingPage() {
    const rg = (M.readGuide || []).map((r) =>
      `<div class="read-card searchable"><b>${esc(r.topic)}</b><div class="read-line">${esc(r.text)}</div>` +
      `<div class="source">Nhấn: ${esc(r.stress)}<br>Grammar: ${esc(r.grammar)}</div></div>`).join("");
    const guide = rg ? `<section class="note-card"><h2>Cách đọc nhanh các câu mẫu</h2><div class="read-grid">${rg}</div></section>` : "";
    return heroOf("A1–A2 first", "Speaking Notes", M.speakingSub || "") + chips("speaking") + guide +
      DOCS.filter((d) => d.type === "speaking").map(docSection).join("");
  }

  /* ================= Final Review + progress ================= */
  const LS_KEY = "ielts-final-progress";
  function getProgress() { try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch (e) { return {}; } }
  function setProgress(p) { try { localStorage.setItem(LS_KEY, JSON.stringify(p)); } catch (e) {} }
  function examItem(id, page, label, sub) {
    const done = getProgress()[id] ? " done" : "";
    const checked = getProgress()[id] ? " checked" : "";
    return `<label class="exam-item${done}" data-id="${id}"><input type="checkbox"${checked}>` +
      `<span><span class="exam-label">${esc(label)}</span>${sub ? `<span class="exam-sub">${esc(sub)}</span>` : ""}` +
      `<a href="#" class="exam-go" data-page="${page}" data-doc="doc-${id}" style="font-size:12px">→ Mở bài</a></span></label>`;
  }
  function finalPage() {
    const sp = DOCS.filter((d) => d.type === "speaking");
    const know = DOCS.filter((d) => d.type === "grammar" || d.type === "pronunciation");
    const part1 = sp.map((d) => examItem(d.id, "speaking", d.title, d.lesson)).join("");
    const part2 = know.map((d) => examItem(d.id, d.type, d.title, d.lesson)).join("");
    const vocab = Object.entries(M.vocab || {}).map(([t, ws]) =>
      `<h3>${esc(t)}</h3><p>${ws.map((w) => `<span class="chip-word">${esc(w)}</span>`).join("")}</p>`).join("");
    return heroOf("Kỳ thi cuối · Pre-IELTS", M.reviewTitle || "Final Review", M.reviewIntro || "") +
      `<div class="progress"><i id="progBar"></i></div>` +
      `<section class="exam-part"><div class="exam-head"><span class="num">1</span><h2>Speaking · tất cả chủ đề đã học</h2></div><div class="exam-grid">${part1}</div></section>` +
      `<section class="exam-part"><div class="exam-head"><span class="num">2</span><h2>Kiến thức đã học · Grammar & Pronunciation</h2></div><div class="exam-grid">${part2}</div></section>` +
      `<section class="note-card vocab searchable"><h2>Vocabulary Bank</h2>${vocab}</section>`;
  }

  const renderers = { stage: stagePage, course: coursePage, pronunciation: pronunciationPage, grammar: grammarPage, speaking: speakingPage, final: finalPage };

  /* ================= UI wiring ================= */
  function updateProgress() {
    const items = document.querySelectorAll("#content .exam-item");
    if (!items.length) return;
    const done = document.querySelectorAll("#content .exam-item.done").length;
    const bar = el("progBar"); if (bar) bar.style.width = Math.round((done / items.length) * 100) + "%";
  }
  function buildNav() {
    el("nav").innerHTML = NAV.map(([id, label, ico]) =>
      `<button data-page="${id}"${id === state.page ? ' class="active"' : ""}><span class="ico">${ico}</span>${label}</button>`).join("");
    el("nav").querySelectorAll("button").forEach((b) => b.onclick = () => go(b.dataset.page));
  }
  function buildToc() {
    const hs = [...el("content").querySelectorAll(".note-content h2, .note-card > h2, .exam-head h2, .pron-tool h2")].slice(0, 60);
    const html = hs.map((h) => { if (!h.id) h.id = slug(h.textContent); return `<a data-goto="${h.id}">${esc(h.textContent)}</a>`; }).join("");
    el("toc").innerHTML = "<b>Mục lục</b>" + hs.map((h) => `<button data-goto="${h.id}">${esc(h.textContent)}</button>`).join("");
    el("rail").innerHTML = html ? `<div class="rail-inner"><b>Trong trang này</b>${html}</div>` : "";
    document.querySelectorAll("[data-goto]").forEach((n) => n.onclick = (e) => {
      e.preventDefault(); const t = document.getElementById(n.dataset.goto);
      if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
      el("side").classList.remove("open");
    });
  }
  function wirePage() {
    // chips
    document.querySelectorAll(".chip[data-goto]").forEach((c) => c.onclick = () => {
      const t = document.getElementById(c.dataset.goto); if (t) t.scrollIntoView({ behavior: "smooth" });
    });
    // IPA tiles
    document.querySelectorAll(".ipa-tile").forEach((t) => t.onclick = () => {
      document.querySelectorAll(".ipa-tile.playing").forEach((x) => x.classList.remove("playing"));
      t.classList.add("playing"); setTimeout(() => t.classList.remove("playing"), 900);
      speak(t.dataset.word);
    });
    // pronounce tool
    const inp = el("pronInput");
    if (inp) {
      const run = async () => {
        const w = inp.value.trim(); if (!w) return;
        const res = el("pronResult"); res.className = "pron-result show"; res.innerHTML = "Đang tra...";
        speak(w);
        const d = await dictLookup(w);
        if (d && (d.ipa || d.audio)) {
          res.innerHTML = (d.ipa ? `<span class="ipa-big">${esc(d.ipa)}</span> ` : "") +
            (d.audio ? `<button class="btn ghost" id="humanBtn" style="padding:6px 12px">🔊 Giọng người thật</button>` : "");
          if (d.audio) el("humanBtn").onclick = () => playUrl(d.audio);
        } else {
          res.innerHTML = "Đã đọc bằng giọng máy. (Không có mạng hoặc không tìm thấy từ trong từ điển.)";
        }
      };
      el("pronBtn").onclick = run;
      inp.onkeydown = (e) => { if (e.key === "Enter") run(); };
      el("pronTts").onclick = () => { if (inp.value.trim()) speak(inp.value.trim()); };
    }
    // exam checkboxes
    document.querySelectorAll("#content .exam-item").forEach((item) => {
      const cb = item.querySelector("input");
      cb.onchange = () => { const p = getProgress(); if (cb.checked) p[item.dataset.id] = true; else delete p[item.dataset.id]; setProgress(p); item.classList.toggle("done", cb.checked); updateProgress(); };
    });
    document.querySelectorAll("#content .exam-go").forEach((a) => a.onclick = (e) => {
      e.preventDefault(); e.stopPropagation(); go(a.dataset.page, a.dataset.doc);
    });
    updateProgress();
  }
  function applySearch() {
    const q = el("search").value.toLowerCase().trim();
    document.querySelectorAll(".searchable").forEach((n) => n.classList.toggle("hidden", q && !n.textContent.toLowerCase().includes(q)));
  }
  function render(scrollToId) {
    document.querySelector(".app").dataset.page = state.page;
    el("eyebrow").textContent = state.page === "final" ? "Kỳ thi cuối · Pre-IELTS" : "Pre-IELTS · up to Lesson 15";
    el("title").textContent = TITLE[state.page];
    el("subtitle").textContent = SUB[state.page] || "";
    el("content").innerHTML = renderers[state.page]();
    buildNav(); buildToc(); wirePage(); applySearch();
    el("side").classList.remove("open");
    if (scrollToId) { const t = document.getElementById(scrollToId); if (t) { t.scrollIntoView(); return; } }
    window.scrollTo(0, 0);
  }
  function go(page, scrollToId) { state.page = page; el("search").value = ""; render(scrollToId); }

  el("search").oninput = applySearch;
  el("menu").onclick = () => el("side").classList.toggle("open");
  el("closeMenu").onclick = () => el("side").classList.remove("open");
  buildNav();
  render();
})();
