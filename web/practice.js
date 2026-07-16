/* ================================================================
 * practice.js - Final Practice (generator + interactive runner)
 *
 * Registers 3 pages: `practice` (topic-mix form + preset picker +
 * history), `practice-runner` (question-by-question quiz),
 * `practice-result` (score + breakdown + review sai).
 * ================================================================ */
(function bootPractice() {
  const APP = window.APP;
  if (!APP) { console.error("practice.js: APP not initialized"); return; }
  const { esc } = APP.helpers;

  APP.NAV.push(["practice", "Final Practice", "🎯"]);
  APP.TITLE.practice = "Final Practice · Generator";
  APP.TITLE["practice-runner"] = "Đang làm bài";
  APP.TITLE["practice-result"] = "Kết quả";
  APP.SUB.practice = "Chọn preset hoặc tùy chỉnh tỷ lệ topic → shuffle → làm → chấm";
  APP.SUB["practice-runner"] = "";
  APP.SUB["practice-result"] = "";
  APP.EYEBROW.practice = "Final Practice";
  APP.EYEBROW["practice-runner"] = "Final Practice · Runner";
  APP.EYEBROW["practice-result"] = "Final Practice · Result";

  const SESSION_PREFIX = "ielts-practice-session-";
  const HISTORY_KEY = "ielts-practice-history";
  const MAX_HISTORY = 50;

  /* ============== Utility: pool sampling ============== */
  function xrand(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(arr, rnd) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function samplePool(config) {
    const idx = APP.data.topicsIndex || { topics: {} };
    const total = config.total || 20;
    const seed = config.seed || Math.floor(Math.random() * 1e9);
    const rnd = xrand(seed);
    const allowedTypes = new Set(config.questionTypes || ["fill_blank", "single_choice", "multi_select", "matching"]);
    const allowedRoles = new Set(config.roles || ["core", "review", "preview"]);
    // Note: require r.qkind (excludes untyped/info refs even if their qkind is somehow whitelisted)
    const gather = (topic) => {
      const t = idx.topics[topic];
      if (!t) return [];
      return (t.refs || []).filter((r) =>
        r.kind === "question" &&
        allowedRoles.has(r.role) &&
        r.qkind && r.qkind !== "info" && allowedTypes.has(r.qkind)
      );
    };
    // Pre-filter topics that have no available candidates → auto-redistribute their % to the rest.
    const skipped = [];
    const validMix = [];
    for (const m of (config.mix || [])) {
      const cand = gather(m.topic);
      if (!cand.length) {
        skipped.push({ topic: m.topic, percent: m.percent, reason: idx.topics[m.topic] ? "no matching questions" : "topic not found" });
        continue;
      }
      validMix.push({ topic: m.topic, percent: m.percent, candidates: cand });
    }
    if (!validMix.length) {
      return { questions: [], shortages: [], skipped, seed };
    }
    // Renormalize % over valid topics only, then largest-remainder round to `total`.
    const sumPct = validMix.reduce((s, m) => s + m.percent, 0) || 1;
    const raw = validMix.map((m) => ({ topic: m.topic, exact: (m.percent / sumPct) * total, candidates: m.candidates }));
    const floors = raw.map((r) => ({ ...r, n: Math.floor(r.exact), remain: r.exact - Math.floor(r.exact) }));
    let sum = floors.reduce((s, r) => s + r.n, 0);
    const sortedByRemain = floors.slice().sort((a, b) => b.remain - a.remain);
    let i = 0;
    while (sum < total && i < sortedByRemain.length) { sortedByRemain[i].n += 1; sum++; i++; }
    while (sum > total) { const idx2 = floors.findIndex((f) => f.n > 0); floors[idx2].n--; sum--; }

    const picked = [];
    const shortages = [];
    for (const f of floors) {
      if (f.n <= 0) continue;
      const shuffled = shuffle(f.candidates, rnd);
      const take = shuffled.slice(0, f.n).map((r) => ({ ...r, topic: f.topic }));
      if (take.length < f.n) shortages.push({ topic: f.topic, wanted: f.n, got: take.length });
      picked.push(...take);
    }
    return { questions: shuffle(picked, rnd), shortages, skipped, seed };
  }

  /* ============== Session storage ============== */
  function saveSession(session) {
    try { sessionStorage.setItem(SESSION_PREFIX + session.id, JSON.stringify(session)); } catch (e) {}
  }
  function loadSession(id) {
    try { return JSON.parse(sessionStorage.getItem(SESSION_PREFIX + id)); } catch (e) { return null; }
  }
  function loadHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch (e) { return []; }
  }
  function pushHistory(entry) {
    const list = loadHistory();
    list.unshift(entry);
    if (list.length > MAX_HISTORY) list.length = MAX_HISTORY;
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(list)); } catch (e) {}
  }
  function uid() { return "s" + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36); }

  /* ============== Page: Practice generator form ============== */
  function practicePage() {
    const presets = APP.data.presets || [];
    const labels = APP.data.topicLabels || {};
    const idx = APP.data.topicsIndex || { topics: {} };
    const topicKeys = (idx.order || Object.keys(idx.topics || {}));
    const topicOptions = topicKeys.map((k) => {
      const l = (labels[k] && labels[k].label) || k;
      const skill = (labels[k] && labels[k].skill) || "";
      const n = ((idx.topics[k] && idx.topics[k].refs) || []).filter((r) => r.kind === "question").length;
      return `<option value="${esc(k)}" data-skill="${esc(skill)}">${esc(l)} (${n} câu)</option>`;
    }).join("");
    const presetOpts = presets.map((p) => `<option value="${esc(p.id)}">${esc(p.label)}</option>`).join("");
    const history = loadHistory().slice(0, 5).map((h) => {
      const dt = new Date(h.submittedAt).toLocaleString();
      const pct = h.total ? Math.round((h.score / h.total) * 100) : 0;
      return `<li><a href="#" data-open-result="${esc(h.id)}"><b>${pct}%</b> · ${h.score}/${h.total} · ${esc(dt)} · ${esc(h.presetLabel || "custom")}</a></li>`;
    }).join("");

    return `<section class="hero practice-hero"><span class="tag">Generator</span>
      <h2>Final Practice</h2>
      <p>Chọn preset chuẩn từ đề mẫu, hoặc tùy chỉnh tỷ lệ % topic; bấm Generate để sinh phiên quiz shuffle. Chấm điểm client-side.</p>
    </section>
    <section class="practice-page practice-form" id="practiceForm">
      <div class="form-row">
        <label>Preset
          <select id="presetSel">
            <option value="">— Custom —</option>
            ${presetOpts}
          </select>
        </label>
        <label>Tổng số câu
          <input type="number" id="totalInput" min="5" max="200" value="30">
        </label>
        <label>Random seed (optional)
          <input type="text" id="seedInput" placeholder="để trống = ngẫu nhiên">
        </label>
      </div>
      <div class="form-row">
        <label>Loại câu:
          <span class="qtypes">
            <label><input type="checkbox" name="qtype" value="fill_blank" checked> fill_blank</label>
            <label><input type="checkbox" name="qtype" value="single_choice" checked> single_choice</label>
            <label><input type="checkbox" name="qtype" value="multi_select" checked> multi_select</label>
            <label><input type="checkbox" name="qtype" value="matching" checked> matching</label>
          </span>
        </label>
        <label>Vai trò:
          <span class="qtypes">
            <label><input type="checkbox" name="qrole" value="core" checked> core</label>
            <label><input type="checkbox" name="qrole" value="review" checked> review</label>
            <label><input type="checkbox" name="qrole" value="preview" checked> preview</label>
          </span>
        </label>
      </div>

      <h3>Mix topic (%)</h3>
      <table class="mix-table">
        <thead><tr><th>Topic</th><th style="width:100px">%</th><th style="width:80px">Câu</th><th style="width:60px"></th></tr></thead>
        <tbody id="mixBody"></tbody>
      </table>
      <div class="mix-add">
        <select id="addTopicSel"><option value="">+ Thêm topic…</option>${topicOptions}</select>
        <button class="btn ghost" id="addTopicBtn" type="button">Thêm</button>
        <span class="mix-total muted">Tổng %: <b id="mixTotalPct">0</b> · Câu: <b id="mixTotalN">0</b></span>
      </div>

      <div class="form-actions">
        <button class="btn" id="generateBtn" type="button">🎲 Generate</button>
        <button class="btn ghost" id="resetMixBtn" type="button">Reset mix</button>
      </div>
      <div id="genWarn"></div>
    </section>

    ${history ? `<section class="practice-page practice-history">
      <h3>5 phiên gần nhất</h3>
      <ol class="history-list">${history}</ol>
    </section>` : ""}`;
  }

  APP.wirers.practice = function () {
    const presetSel = document.getElementById("presetSel");
    const totalInp = document.getElementById("totalInput");
    const seedInp = document.getElementById("seedInput");
    const mixBody = document.getElementById("mixBody");
    const addSel = document.getElementById("addTopicSel");
    const addBtn = document.getElementById("addTopicBtn");
    const totalPctEl = document.getElementById("mixTotalPct");
    const totalNEl = document.getElementById("mixTotalN");
    const genBtn = document.getElementById("generateBtn");
    const resetBtn = document.getElementById("resetMixBtn");
    const genWarn = document.getElementById("genWarn");
    const labels = APP.data.topicLabels || {};
    const presets = APP.data.presets || [];

    function addRow(topic, percent) {
      if ([...mixBody.querySelectorAll("tr")].some((tr) => tr.dataset.topic === topic)) return;
      const l = (labels[topic] && labels[topic].label) || topic;
      const tr = document.createElement("tr");
      tr.dataset.topic = topic;
      tr.innerHTML = `<td>${esc(l)}</td><td><input type="number" min="0" max="100" step="1" value="${percent}" class="mix-pct"></td><td class="mix-n">—</td><td><button class="btn ghost mix-del" type="button">×</button></td>`;
      mixBody.appendChild(tr);
      tr.querySelector(".mix-pct").addEventListener("input", updateTotals);
      tr.querySelector(".mix-del").onclick = () => { tr.remove(); updateTotals(); };
    }
    function updateTotals() {
      const total = parseInt(totalInp.value, 10) || 0;
      let sumPct = 0;
      mixBody.querySelectorAll("tr").forEach((tr) => {
        const pct = parseFloat(tr.querySelector(".mix-pct").value) || 0;
        sumPct += pct;
        tr.querySelector(".mix-n").textContent = Math.round((pct / 100) * total);
      });
      totalPctEl.textContent = sumPct.toFixed(0);
      totalNEl.textContent = String(total);
      totalPctEl.style.color = Math.abs(sumPct - 100) > 0.5 ? "#dc2626" : "#059669";
    }
    function applyPreset(id) {
      const p = presets.find((x) => x.id === id);
      mixBody.innerHTML = "";
      if (!p) { updateTotals(); return; }
      totalInp.value = String(p.totalQuestions || 30);
      (p.mix || []).forEach((m) => addRow(m.topic, m.percent));
      // set qtype checkboxes
      const types = new Set(p.questionTypes || ["fill_blank", "single_choice", "multi_select", "matching"]);
      document.querySelectorAll('input[name="qtype"]').forEach((cb) => cb.checked = types.has(cb.value));
      updateTotals();
    }

    presetSel.onchange = () => applyPreset(presetSel.value);
    totalInp.oninput = updateTotals;
    addBtn.onclick = () => { if (addSel.value) { addRow(addSel.value, 10); updateTotals(); addSel.value = ""; } };
    resetBtn.onclick = () => { mixBody.innerHTML = ""; presetSel.value = ""; updateTotals(); };

    genBtn.onclick = () => {
      const mix = [...mixBody.querySelectorAll("tr")].map((tr) => ({
        topic: tr.dataset.topic,
        percent: parseFloat(tr.querySelector(".mix-pct").value) || 0
      })).filter((m) => m.percent > 0);
      if (!mix.length) { genWarn.innerHTML = `<div class="callout warn">Cần chọn ít nhất 1 topic có % > 0.</div>`; return; }
      const sumPct = mix.reduce((s, m) => s + m.percent, 0);
      if (Math.abs(sumPct - 100) > 0.5) { genWarn.innerHTML = `<div class="callout warn">Tổng % phải bằng 100 (hiện: ${sumPct}).</div>`; return; }
      const total = parseInt(totalInp.value, 10) || 30;
      const seed = seedInp.value.trim() ? parseInt(seedInp.value.trim(), 10) || hashCode(seedInp.value.trim()) : Math.floor(Math.random() * 1e9);
      const types = [...document.querySelectorAll('input[name="qtype"]:checked')].map((cb) => cb.value);
      const roles = [...document.querySelectorAll('input[name="qrole"]:checked')].map((cb) => cb.value);
      const config = { mix, total, seed, questionTypes: types, roles };
      const sampled = samplePool(config);
      if (!sampled.questions.length) { genWarn.innerHTML = `<div class="callout warn">Không có câu nào match filter. Nới lỏng loại câu / vai trò / topic.</div>`; return; }
      const skippedMsg = (sampled.skipped && sampled.skipped.length)
        ? `<div class="callout tip"><b>Đã bỏ qua topic không có câu:</b> ${sampled.skipped.map((s) => `${esc(s.topic)} (${s.percent}%)`).join(", ")}. Đã phân bổ lại % cho các topic còn lại để đạt đủ ${config.total} câu.</div>`
        : "";
      const shortMsg = sampled.shortages.length
        ? `<div class="callout tip"><b>Một số topic không đủ câu:</b> ${sampled.shortages.map((s) => `${esc(s.topic)} (${s.got}/${s.wanted})`).join(", ")}. Vẫn tiến hành.</div>`
        : "";
      const presetId = presetSel.value;
      const presetLabel = presetId ? (presets.find((p) => p.id === presetId) || {}).label : "custom";
      const sessionId = uid();
      const session = {
        id: sessionId,
        config,
        presetId,
        presetLabel,
        questions: sampled.questions,
        answers: {},
        startedAt: Date.now()
      };
      saveSession(session);
      genWarn.innerHTML = skippedMsg + shortMsg;
      setTimeout(() => APP.go("practice-runner", { sessionId }), 200);
    };

    document.querySelectorAll("[data-open-result]").forEach((a) => a.onclick = (e) => {
      e.preventDefault(); APP.go("practice-result", { historyId: a.dataset.openResult });
    });
    updateTotals();
  };
  function hashCode(s) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return h >>> 0; }

  /* ============== Page: Practice runner ============== */
  async function practiceRunnerPage(opts) {
    const sid = opts && opts.sessionId;
    if (!sid) return `<pre class="callout warn">Không có sessionId.</pre>`;
    const session = loadSession(sid);
    if (!session) return `<pre class="callout warn">Phiên đã hết hạn. <a href="#" data-go-practice>Về Generator</a></pre>`;
    // Load all needed lessons
    const lessonKeys = [...new Set(session.questions.map((q) => q.lessonKey))];
    let lessons;
    try { lessons = await Promise.all(lessonKeys.map((k) => APP.loadDailyLesson(k))); }
    catch (e) { return `<pre class="callout warn">Không tải được lessons: ${esc(e.message)}</pre>`; }
    const byKey = {}; lessonKeys.forEach((k, i) => { byKey[k] = lessons[i]; });
    // Hydrate questions
    const hydrated = session.questions.map((ref) => {
      const L = byKey[ref.lessonKey];
      const all = flattenQ(L);
      const q = all.find((x) => x.id === ref.itemId);
      return q ? { ref, q } : null;
    }).filter(Boolean);
    if (!hydrated.length) return `<pre class="callout warn">Không hydrate được câu hỏi nào.</pre>`;

    return `<section class="practice-page practice-runner" data-sid="${esc(sid)}">
      <div class="runner-head">
        <span class="tag">Runner</span>
        <b>${hydrated.length} câu</b>
        <span class="muted"> · preset: ${esc(session.presetLabel || "custom")} · seed: ${session.config.seed}</span>
        <button class="btn ghost runner-exit" type="button" data-exit>← Thoát</button>
      </div>
      <div class="runner-progress-bar"><i id="runnerBar"></i></div>
      <div class="runner-body">
        ${hydrated.map((h, i) => renderRunnerQuestion(h.q, h.ref, i, hydrated.length, session.answers[i])).join("")}
      </div>
      <div class="runner-actions">
        <button class="btn" id="runnerSubmit" type="button">✅ Submit &amp; Chấm</button>
      </div>
      <script type="application/json" id="runnerHydrated">${JSON.stringify(hydrated).replace(/</g, "\\u003c")}<\/script>
    </section>`;
  }
  function flattenQ(L) {
    if (Array.isArray(L.questions)) return L.questions;
    const out = []; (L.exerciseGroups || []).forEach((g) => (g.questions || []).forEach((q) => out.push(q))); return out;
  }

  function renderRunnerQuestion(q, ref, i, total, prevAnswer) {
    const header = `<div class="rq-head"><b>Câu ${i + 1}/${total}</b> · <span class="muted">${esc(ref.topic || "?")}</span> · <span class="qtype-badge">${esc(q.kind || "?")}</span></div>`;
    const prompt = `<div class="qprompt">${q.promptHtml || esc(q.prompt || "")}</div>`;
    const audios = (q.audioRefs || []).map((a) =>
      `<div class="inline-audio"><audio controls preload="none" src="${esc(a.localFile || a.url)}"></audio></div>`).join("");
    const imgs = (q.imageRefs || []).map((r) => `<figure class="ex-img"><img loading="lazy" src="${esc(r.localFile || r.url)}" alt=""></figure>`).join("");
    let input = "";
    const namePrefix = `rq-${i}-`;
    if (q.kind === "single_choice") {
      input = `<div class="rq-opts">` + (q.options || []).map((o) =>
        `<label class="rq-opt"><input type="radio" name="${namePrefix}v" value="${esc(o.id)}"${prevAnswer === o.id ? " checked" : ""}> ${o.html || esc(o.text || "")}</label>`
      ).join("") + `</div>`;
    } else if (q.kind === "multi_select") {
      const set = new Set(Array.isArray(prevAnswer) ? prevAnswer : []);
      input = `<div class="rq-opts">` + (q.options || []).map((o) =>
        `<label class="rq-opt"><input type="checkbox" name="${namePrefix}v" value="${esc(o.id)}"${set.has(o.id) ? " checked" : ""}> ${o.html || esc(o.text || "")}</label>`
      ).join("") + `</div>`;
    } else if (q.kind === "fill_blank") {
      const blanks = (q.blanks || [{}]);
      const prev = Array.isArray(prevAnswer) ? prevAnswer : [];
      if (q.bodyHtml) {
        // Inline runner: replace each blank-slot with a live <input>. Aria-labels use blank index.
        const filled = String(q.bodyHtml).replace(/<span class="blank-slot" data-blank="(\d+)"><\/span>/g,
          (_m, n) => {
            const k = parseInt(n, 10);
            const v = prev[k] || "";
            return `<input type="text" class="blank-input" data-blank="${n}" name="${namePrefix}b${k}" value="${esc(v)}" aria-label="Ô ${k + 1}">`;
          });
        input = `<div class="rq-fill-body">${filled}</div>`;
      } else {
        input = `<div class="rq-blanks">` + blanks.map((b, k) =>
          `<label class="rq-blank">Ô ${k + 1}: <input type="text" name="${namePrefix}b${k}" value="${esc(prev[k] || "")}" placeholder="gõ đáp án"></label>`).join("") + `</div>`;
      }
    } else if (q.kind === "matching") {
      const pairs = q.pairs || [];
      const rightOptions = pairs.map((p, k) => ({ key: p.rightId || String(k), label: p.right || "" }));
      const prev = Array.isArray(prevAnswer) ? prevAnswer : [];
      input = `<table class="rq-match"><tbody>` + pairs.map((p, k) => {
        const opts = rightOptions.map((r) => `<option value="${esc(r.key)}"${prev[k] === r.key ? " selected" : ""}>${esc(r.label)}</option>`).join("");
        return `<tr><td>${esc(p.left || "")}</td><td><select name="${namePrefix}m${k}"><option value="">-- chọn --</option>${opts}</select></td></tr>`;
      }).join("") + `</tbody></table>`;
    } else {
      input = `<div class="muted"><em>Loại câu ${esc(q.kind)} không chấm tự động — bỏ qua.</em></div>`;
    }
    return `<article class="rq" data-i="${i}" data-kind="${esc(q.kind)}">${header}${prompt}${imgs}${audios ? `<div class="block-audios">${audios}</div>` : ""}${input}</article>`;
  }

  APP.wirers["practice-runner"] = function (opts) {
    const sid = opts && opts.sessionId;
    const session = loadSession(sid);
    if (!session) return;
    const hydratedNode = document.getElementById("runnerHydrated");
    const hydrated = JSON.parse(hydratedNode.textContent);
    const bar = document.getElementById("runnerBar");
    function updateBar() {
      const answered = Object.keys(session.answers).length;
      bar.style.width = Math.round((answered / hydrated.length) * 100) + "%";
    }
    document.querySelectorAll(".rq").forEach((art) => {
      const i = +art.dataset.i;
      const kind = art.dataset.kind;
      art.querySelectorAll("input,select,textarea").forEach((inp) => {
        inp.oninput = inp.onchange = () => {
          session.answers[i] = collectAnswer(art, kind);
          saveSession(session);
          updateBar();
        };
      });
    });
    document.querySelector("[data-exit]").onclick = () => APP.go("practice");
    document.getElementById("runnerSubmit").onclick = () => {
      const graded = gradeSession(session, hydrated);
      session.result = graded;
      session.submittedAt = Date.now();
      saveSession(session);
      pushHistory({
        id: session.id,
        presetId: session.presetId,
        presetLabel: session.presetLabel,
        config: session.config,
        score: graded.score,
        total: graded.total,
        breakdown: graded.breakdown,
        answers: session.answers,
        questions: session.questions,
        submittedAt: session.submittedAt
      });
      APP.go("practice-result", { sessionId: session.id });
    };
    updateBar();
  };
  function collectAnswer(art, kind) {
    if (kind === "single_choice") { const c = art.querySelector('input[type="radio"]:checked'); return c ? c.value : null; }
    if (kind === "multi_select") { return [...art.querySelectorAll('input[type="checkbox"]:checked')].map((c) => c.value); }
    if (kind === "fill_blank") {
      // Prefer inline slots (data-blank attribute) sorted by numeric index; fall back to sequential inputs.
      const slots = [...art.querySelectorAll('.blank-input[data-blank]')];
      if (slots.length) {
        const arr = [];
        for (const s of slots) {
          const idx = parseInt(s.dataset.blank, 10);
          if (!Number.isFinite(idx)) continue;
          arr[idx] = s.value.trim();
        }
        for (let i = 0; i < arr.length; i++) if (arr[i] == null) arr[i] = "";
        return arr;
      }
      return [...art.querySelectorAll('input[type="text"]')].map((i) => i.value.trim());
    }
    if (kind === "matching") { return [...art.querySelectorAll("select")].map((s) => s.value); }
    return null;
  }

  function normStr(s) { return String(s == null ? "" : s).toLowerCase().trim().replace(/\s+/g, " "); }
  function gradeSession(session, hydrated) {
    let score = 0;
    const total = hydrated.length;
    const breakdown = {};
    const detail = [];
    hydrated.forEach((h, i) => {
      const q = h.q; const ans = session.answers[i]; const topic = h.ref.topic;
      const b = breakdown[topic] = breakdown[topic] || { correct: 0, total: 0 };
      b.total++;
      let ok = false;
      if (q.kind === "single_choice") {
        const correct = (q.correctAnswer || [])[0];
        ok = ans && String(ans) === String(correct);
      } else if (q.kind === "multi_select") {
        const c = new Set((q.correctAnswer || []).map(String));
        const a = new Set((ans || []).map(String));
        ok = c.size === a.size && [...c].every((x) => a.has(x));
      } else if (q.kind === "fill_blank") {
        const blanks = q.blanks || [];
        ok = blanks.length > 0 && blanks.every((b, k) => {
          const user = normStr((ans || [])[k]);
          const accepted = (b.answers || []).map(normStr);
          return accepted.length ? accepted.includes(user) : false;
        });
      } else if (q.kind === "matching") {
        const pairs = q.pairs || [];
        ok = pairs.length > 0 && pairs.every((p, k) => String((ans || [])[k]) === String(p.rightId || k));
      }
      if (ok) { score++; b.correct++; }
      detail.push({ i, q, ans, ok, topic });
    });
    return { score, total, breakdown, detail };
  }

  /* ============== Page: Practice result ============== */
  function practiceResultPage(opts) {
    const sid = opts && (opts.sessionId || opts.historyId);
    let session = sid ? loadSession(sid) : null;
    if (!session && opts && opts.historyId) {
      const h = loadHistory().find((x) => x.id === opts.historyId);
      if (h) session = { id: h.id, config: h.config, questions: h.questions, answers: h.answers, presetLabel: h.presetLabel, submittedAt: h.submittedAt, result: { score: h.score, total: h.total, breakdown: h.breakdown, detail: [] } };
    }
    if (!session || !session.result) return `<pre class="callout warn">Không có kết quả cho phiên này.</pre>`;
    const r = session.result;
    const pct = r.total ? Math.round((r.score / r.total) * 100) : 0;
    const breakdown = Object.entries(r.breakdown || {}).map(([t, b]) => {
      const p = b.total ? Math.round((b.correct / b.total) * 100) : 0;
      const label = (APP.data.topicLabels[t] && APP.data.topicLabels[t].label) || t;
      return `<div class="result-row"><div class="result-label">${esc(label)}</div>
        <div class="result-bar"><i style="width:${p}%"></i></div>
        <div class="result-num">${b.correct}/${b.total} · ${p}%</div></div>`;
    }).join("");
    const wrongList = (r.detail || []).filter((d) => !d.ok).map((d) => {
      return `<article class="qcard">
        <div class="block-badges"><span class="topic-badge">${esc(d.topic)}</span><span class="q-bad">× sai</span></div>
        <div class="qprompt">${d.q.promptHtml || esc(d.q.prompt || "")}</div>
        <div class="rq-user-answer"><b>Bạn trả lời:</b> <code>${esc(JSON.stringify(d.ans))}</code></div>
        <div class="rq-correct-answer"><b>Đáp án đúng:</b> <code>${esc(JSON.stringify(d.q.correctAnswer || (d.q.blanks || []).map((b) => b.answers)))}</code></div>
        ${d.q.explanationHtml ? `<details class="explain-details" open><summary>Giải thích</summary>${d.q.explanationHtml}</details>` : ""}
      </article>`;
    }).join("");
    return `<section class="hero result-hero"><span class="tag">Kết quả</span>
      <h2>${pct}% · ${r.score}/${r.total} câu đúng</h2>
      <p class="muted">Preset: ${esc(session.presetLabel || "custom")} · Submit: ${esc(new Date(session.submittedAt || Date.now()).toLocaleString())}</p>
    </section>
    <section class="practice-page result-breakdown">
      <h3>Breakdown theo topic</h3>
      ${breakdown || "<p class='muted'>Không có breakdown.</p>"}
    </section>
    ${wrongList ? `<section class="practice-page result-wrong">
      <h3>Câu sai (${(r.detail || []).filter((d) => !d.ok).length})</h3>
      ${wrongList}
    </section>` : `<section class="practice-page"><div class="callout tip"><b>Hoàn hảo! 🎉</b> Không có câu sai.</div></section>`}
    <div class="result-actions">
      <button class="btn ghost" data-back-practice type="button">← Về Generator</button>
      <button class="btn" data-retry type="button" data-sid="${esc(session.id)}">🔁 Làm lại session này (cùng seed)</button>
    </div>`;
  }
  APP.wirers["practice-result"] = function () {
    document.querySelectorAll("[data-back-practice]").forEach((b) => b.onclick = () => APP.go("practice"));
    document.querySelectorAll("[data-retry]").forEach((b) => b.onclick = () => {
      const sid = b.dataset.sid;
      const old = loadSession(sid); if (!old) return;
      const sampled = samplePool(old.config);
      const newId = uid();
      const newSession = { id: newId, config: old.config, presetId: old.presetId, presetLabel: old.presetLabel, questions: sampled.questions, answers: {}, startedAt: Date.now() };
      saveSession(newSession);
      APP.go("practice-runner", { sessionId: newId });
    });
    document.querySelectorAll("[data-go-practice]").forEach((a) => a.onclick = (e) => { e.preventDefault(); APP.go("practice"); });
  };

  APP.renderers.practice = practicePage;
  APP.renderers["practice-runner"] = practiceRunnerPage;
  APP.renderers["practice-result"] = practiceResultPage;
})();
