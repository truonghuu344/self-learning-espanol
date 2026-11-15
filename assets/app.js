(() => {
  "use strict";

  // ---------- Helpers ----------
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const DAY = 864e5;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const icon = (name, style = "") => `<svg class="i" style="${style}"><use href="#i-${name}"/></svg>`;
  const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const todayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const norm = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[¿?¡!.,…]/g, "").replace(/\.\.\./g, "").replace(/^(el|la|los|las) /, "").replace(/\s+/g, " ").trim();

  // ---------- Data index ----------
  const TOPICS = window.TOPICS, GRAMMAR = window.GRAMMAR;
  const WORDS = [];
  TOPICS.forEach(t => t.words.forEach(([es, vi, ex, exVi]) => WORDS.push({ key: `${t.id}|${es}`, topic: t.id, es, vi, ex, exVi })));
  const topicById = Object.fromEntries(TOPICS.map(t => [t.id, t]));
  const wordsOf = id => id === "all" ? WORDS : WORDS.filter(w => w.topic === id);

  // ---------- Persistence ----------
  const STORE_KEY = "es.progress.v2";
  const defaults = () => ({ cards: {}, days: {}, read: {}, answers: 0, correct: 0,
    settings: { goal: 20, newPerDay: 10, rate: 0.85, voice: "" } });
  let S = defaults();
  try { const raw = localStorage.getItem(STORE_KEY); if (raw) S = Object.assign(defaults(), JSON.parse(raw)); S.settings = Object.assign(defaults().settings, S.settings); } catch (e) {}
  const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) {} };

  // ---------- Spaced repetition (Leitner-style) ----------
  const INTERVALS = [0, 1, 2, 4, 8, 16, 32]; // days per box
  const MAX_BOX = INTERVALS.length - 1;
  const KNOWN_BOX = 3;
  const card = key => S.cards[key];
  const isKnown = key => (card(key)?.box ?? -1) >= KNOWN_BOX;
  const isLearning = key => { const c = card(key); return c && c.box < KNOWN_BOX; };
  const isDue = key => { const c = card(key); return c && c.due <= Date.now(); };

  function rate(key, grade) { // grade: 0 again, 1 hard, 2 good
    const c = S.cards[key] || { box: 0, due: 0, reps: 0, lapses: 0 };
    if (grade === 0) { c.box = 0; c.lapses++; c.due = Date.now() + 60e3; }
    else if (grade === 1) { c.box = Math.max(1, c.box); c.due = Date.now() + Math.max(1, INTERVALS[c.box] / 2) * DAY; }
    else { c.box = Math.min(MAX_BOX, c.box + 1); c.due = Date.now() + INTERVALS[c.box] * DAY; }
    c.reps++;
    S.cards[key] = c;
    logActivity();
  }
  function markKnown(key, on) {
    if (on) S.cards[key] = Object.assign(S.cards[key] || { reps: 0, lapses: 0 }, { box: 4, due: Date.now() + INTERVALS[4] * DAY });
    else delete S.cards[key];
    save();
  }
  function logActivity() {
    const k = todayKey();
    S.days[k] = (S.days[k] || 0) + 1;
    save();
    refreshChrome();
  }
  function streakDays() {
    let n = 0, d = new Date();
    if (!S.days[todayKey(d)]) d = new Date(Date.now() - DAY);
    while (S.days[todayKey(d)]) { n++; d = new Date(d.getTime() - DAY); }
    return n;
  }
  const dueCount = (topic = "all") => wordsOf(topic).filter(w => isDue(w.key)).length;
  const newCount = (topic = "all") => wordsOf(topic).filter(w => !card(w.key)).length;
  const newStudiedToday = () => S.days["new:" + todayKey()] || 0;

  // ---------- Speech ----------
  let voices = [];
  function loadVoices() {
    if (!("speechSynthesis" in window)) return;
    voices = speechSynthesis.getVoices().filter(v => /^es(-|_|$)/i.test(v.lang));
  }
  if ("speechSynthesis" in window) { loadVoices(); speechSynthesis.onvoiceschanged = () => { loadVoices(); if (route === "settings") renderSettings(); }; }
  function speak(text) {
    if (!("speechSynthesis" in window)) { toast("Trình duyệt không hỗ trợ đọc giọng nói"); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/\.\.\./g, "").replace(/[—]/g, ""));
    u.lang = "es-ES"; u.rate = S.settings.rate;
    const v = voices.find(v => v.name === S.settings.voice) || voices.find(v => v.lang === "es-ES") || voices[0];
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  }
  document.addEventListener("click", e => {
    const s = e.target.closest(".say"); if (s) speak(s.textContent);
    const b = e.target.closest("[data-speak]"); if (b) { e.stopPropagation(); speak(b.dataset.speak); }
  });

  // ---------- Toast ----------
  let toastT;
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2200); }

  // ---------- Theme ----------
  function applyThemeBtn() {
    const dark = document.documentElement.dataset.theme === "dark";
    $("#themeBtn").innerHTML = `${icon(dark ? "sun" : "moon")}<span>${dark ? "Chế độ sáng" : "Chế độ tối"}</span>`;
  }
  $("#themeBtn").onclick = () => {
    const t = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem("es.theme", t); } catch (e) {}
    applyThemeBtn();
  };

  // ---------- Chrome (sidebar, topbar) ----------
  function refreshChrome() {
    const done = S.days[todayKey()] || 0, goal = S.settings.goal;
    $("#goalText").textContent = `${Math.min(done, goal)}/${goal}`;
    $("#goalBar").style.width = Math.min(100, done / goal * 100) + "%";
    $("#chipStreak").textContent = streakDays();
    $("#chipKnown").textContent = WORDS.filter(w => isKnown(w.key)).length;
    const due = dueCount();
    $$("[data-due-badge]").forEach(b => { b.hidden = !due; b.textContent = due; });
  }
  window.addEventListener("scroll", () => $("#topbar").classList.toggle("scrolled", scrollY > 4), { passive: true });

  // ---------- Router ----------
  const TITLES = { home: "Tổng quan", vocab: "Từ vựng", review: "Ôn tập", practice: "Luyện tập", grammar: "Ngữ pháp", settings: "Cài đặt" };
  let route = "home", keyHandler = null;
  function go() {
    const [r, arg] = (location.hash.replace(/^#\/?/, "") || "home").split("/");
    route = TITLES[r] ? r : "home";
    keyHandler = null;
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    $$(".view").forEach(v => v.classList.toggle("active", v.id === "view-" + route));
    $$("[data-route]").forEach(a => a.classList.toggle("active", a.dataset.route === route));
    $("#crumb").innerHTML = `Español / <strong>${TITLES[route]}</strong>`;
    document.title = `${TITLES[route]} · Español`;
    ({ home: renderHome, vocab: renderVocab, review: renderReviewSetup, practice: renderPracticeSetup, grammar: renderGrammar, settings: renderSettings })[route](arg);
    scrollTo({ top: 0 });
  }
  window.addEventListener("hashchange", go);
  document.addEventListener("keydown", e => {
    if (!keyHandler || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.matches("input, select, textarea") && !["Enter", "Escape"].includes(e.key)) return;
    keyHandler(e);
  });

  const topicOptions = (sel, withAll = true) =>
    (withAll ? `<option value="all"${sel === "all" ? " selected" : ""}>Tất cả chủ đề</option>` : "") +
    TOPICS.map(t => `<option value="${t.id}"${t.id === sel ? " selected" : ""}>${t.icon}  ${t.name}</option>`).join("");

  // ---------- Home ----------
  function renderHome() {
    const h = new Date().getHours();
    const greet = h < 11 ? "¡Buenos días!" : h < 18 ? "¡Buenas tardes!" : "¡Buenas noches!";
    const done = S.days[todayKey()] || 0, goal = S.settings.goal, pct = Math.min(1, done / goal);
    const known = WORDS.filter(w => isKnown(w.key)).length;
    const learning = WORDS.filter(w => isLearning(w.key)).length;
    const acc = S.answers ? Math.round(S.correct / S.answers * 100) : null;
    const due = dueCount(), fresh = Math.min(newCount(), Math.max(0, S.settings.newPerDay - newStudiedToday()));
    const C = 2 * Math.PI * 56;
    const days = [...Array(7)].map((_, i) => { const d = new Date(Date.now() - (6 - i) * DAY); return { d, n: S.days[todayKey(d)] || 0 }; });
    const maxN = Math.max(goal, ...days.map(x => x.n));
    const wd = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

    $("#view-home").innerHTML = `
      <div class="card hero" style="margin-top:12px">
        <div style="z-index:1">
          <div class="eyebrow">${greet}</div>
          <h1>${due ? `Bạn có ${due} thẻ cần ôn hôm nay` : fresh ? `Sẵn sàng học ${fresh} từ mới?` : "Bạn đã hoàn thành hôm nay 🎉"}</h1>
          <p>Học đều mỗi ngày một chút hiệu quả hơn học dồn. Hệ thống sẽ tự nhắc lại từ đúng lúc bạn sắp quên.</p>
          <div class="actions">
            <a class="btn btn-accent btn-lg" href="#/review">${icon("cards")} Bắt đầu ôn tập</a>
            <a class="btn btn-ghost btn-lg" href="#/practice">${icon("target")} Luyện tập nhanh</a>
          </div>
        </div>
        <div class="ring-wrap">
          <div class="ring">
            <svg width="132" height="132"><circle cx="66" cy="66" r="56" fill="none" stroke="currentColor" stroke-opacity=".12" stroke-width="10"/>
            <circle cx="66" cy="66" r="56" fill="none" stroke="var(--gold)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct)}" style="transition:stroke-dashoffset .6s"/></svg>
            <div class="lbl"><div><strong>${Math.min(done, goal)}</strong><small>/ ${goal} lượt</small></div></div>
          </div>
        </div>
      </div>

      <div class="stats">
        <div class="card stat"><div class="k">${icon("check", "width:14px;height:14px;color:var(--success)")} Đã thuộc</div><div class="v">${known}</div><div class="s">trên ${WORDS.length} từ</div></div>
        <div class="card stat"><div class="k">${icon("cards", "width:14px;height:14px;color:var(--gold)")} Đang học</div><div class="v">${learning}</div><div class="s">${due} thẻ đến hạn</div></div>
        <div class="card stat"><div class="k">${icon("target", "width:14px;height:14px;color:var(--accent)")} Độ chính xác</div><div class="v">${acc === null ? "—" : acc + "%"}</div><div class="s">${S.answers} câu đã trả lời</div></div>
        <div class="card stat"><div class="k">${icon("flame", "width:14px;height:14px;color:var(--accent)")} Chuỗi ngày</div><div class="v">${streakDays()}</div>
          <div class="week">${days.map(x => `<div class="d"><div class="b ${x.n ? "on" : ""}" style="height:${Math.max(4, x.n / maxN * 40)}px"></div>${wd[x.d.getDay()]}</div>`).join("")}</div></div>
      </div>

      <h2 class="section-title">Chủ đề <small>${TOPICS.length} chủ đề · ${WORDS.length} từ</small></h2>
      <div class="topics">${TOPICS.map(t => {
        const ws = wordsOf(t.id), k = ws.filter(w => isKnown(w.key)).length;
        return `<a class="card topic" href="#/vocab/${t.id}" style="color:inherit;text-decoration:none">
          <div class="t-head"><div class="emo">${t.icon}</div><span class="level">${t.level}</span></div>
          <h3>${t.name}</h3>
          <div><div class="progress"><i style="width:${k / ws.length * 100}%"></i></div>
          <div class="meta" style="margin-top:8px"><span>${k}/${ws.length} đã thuộc</span><span>${Math.round(k / ws.length * 100)}%</span></div></div>
        </a>`;
      }).join("")}</div>`;
  }

  // ---------- Vocabulary ----------
  const V = { topic: "all", q: "", filter: "all" };
  function renderVocab(arg) {
    if (arg && topicById[arg]) V.topic = arg;
    $("#view-vocab").innerHTML = `
      <div class="page-head"><div><h1>Từ vựng</h1><p>Bấm 🔊 để nghe, bấm ✓ để đánh dấu từ đã thuộc.</p></div>
        <a class="btn" href="#/review" id="vStudy">${icon("cards")} Học chủ đề này</a></div>
      <div class="toolbar">
        <select class="select" id="vTopic" aria-label="Chủ đề">${topicOptions(V.topic)}</select>
        <label class="search">${icon("search")}<span class="sr-only">Tìm kiếm</span><input id="vQ" placeholder="Tìm theo tiếng Tây Ban Nha hoặc tiếng Việt…" value="${esc(V.q)}"></label>
        <div class="segmented" id="vFilter">${[["all", "Tất cả"], ["new", "Chưa học"], ["learning", "Đang học"], ["known", "Đã thuộc"]]
          .map(([k, l]) => `<button data-f="${k}" class="${V.filter === k ? "active" : ""}">${l}</button>`).join("")}</div>
      </div>
      <div class="card vocab-table" id="vList"></div>`;
    $("#vTopic").onchange = e => { V.topic = e.target.value; drawList(); };
    $("#vQ").oninput = e => { V.q = e.target.value; drawList(); };
    $("#vFilter").onclick = e => { const b = e.target.closest("button"); if (!b) return; V.filter = b.dataset.f; $$("#vFilter button").forEach(x => x.classList.toggle("active", x === b)); drawList(); };
    $("#vStudy").onclick = () => { R.topic = V.topic; };
    drawList();
  }
  function drawList() {
    const q = norm(V.q);
    const list = wordsOf(V.topic).filter(w => {
      if (q && !norm(w.es).includes(q) && !norm(w.vi).includes(q)) return false;
      if (V.filter === "new") return !card(w.key);
      if (V.filter === "learning") return isLearning(w.key);
      if (V.filter === "known") return isKnown(w.key);
      return true;
    });
    const box = $("#vList");
    if (!list.length) { box.innerHTML = `<div class="empty">Không có từ nào phù hợp.</div>`; return; }
    box.innerHTML = `<div class="vrow head"><div>Tây Ban Nha</div><div>Tiếng Việt</div><div>Mức độ nhớ</div><div></div></div>` +
      list.map(w => {
        const b = card(w.key)?.box ?? -1;
        return `<div class="vrow">
          <div><div class="es">${esc(w.es)}</div>${w.ex ? `<div class="ex">${esc(w.ex)}</div>` : ""}</div>
          <div class="vi">${esc(w.vi)}</div>
          <div class="mastery" title="Hộp ${Math.max(0, b)}/${MAX_BOX}">${[1, 2, 3, 4, 5].map(i => `<i class="${b >= i ? "on" : ""}"></i>`).join("")}</div>
          <div class="acts">
            <button class="icon-btn" data-speak="${esc(w.es)}" aria-label="Nghe ${esc(w.es)}">${icon("volume", "width:16px;height:16px")}</button>
            <button class="icon-btn ${isKnown(w.key) ? "on" : ""}" data-known="${esc(w.key)}" aria-label="Đánh dấu đã thuộc">${icon("check", "width:16px;height:16px")}</button>
          </div></div>`;
      }).join("");
    box.onclick = e => {
      const b = e.target.closest("[data-known]"); if (!b) return;
      const k = b.dataset.known, on = !isKnown(k);
      markKnown(k, on); refreshChrome(); drawList();
      toast(on ? "Đã đánh dấu là đã thuộc" : "Đã bỏ đánh dấu");
    };
  }

  // ---------- Review (flashcards + SRS) ----------
  const R = { topic: "all", queue: [], i: 0, flipped: false, total: 0, stats: [0, 0, 0] };
  function renderReviewSetup() {
    const due = dueCount(R.topic);
    const allowNew = Math.max(0, S.settings.newPerDay - newStudiedToday());
    const fresh = Math.min(newCount(R.topic), allowNew);
    $("#view-review").innerHTML = `
      <div class="page-head"><div><h1>Ôn tập</h1><p>Flashcard lặp lại ngắt quãng: từ bạn nhớ tốt sẽ xuất hiện thưa dần, từ hay quên sẽ được ôn lại sớm.</p></div></div>
      <div class="study">
        <div class="card" style="padding:28px">
          <label style="font-size:13px;color:var(--muted);font-weight:500">Chủ đề</label>
          <select class="select" id="rTopic" style="width:100%;margin-top:6px">${topicOptions(R.topic)}</select>
          <div class="stats" style="grid-template-columns:1fr 1fr;margin-top:18px">
            <div class="card stat" style="box-shadow:none"><div class="k">Đến hạn ôn</div><div class="v" style="color:var(--accent)">${due}</div></div>
            <div class="card stat" style="box-shadow:none"><div class="k">Từ mới hôm nay</div><div class="v" style="color:var(--success)">${fresh}</div><div class="s">Giới hạn ${S.settings.newPerDay} từ/ngày</div></div>
          </div>
          <button class="btn btn-accent btn-lg" id="rStart" style="width:100%;margin-top:18px" ${due + fresh ? "" : "disabled"}>Bắt đầu (${due + fresh} thẻ) ${icon("arrow")}</button>
          ${due + fresh ? "" : `<p style="text-align:center;color:var(--muted);margin-top:14px;font-size:14px">Không còn thẻ nào cho hôm nay. <a href="#/practice">Luyện tập thêm</a> hoặc <a href="#" id="rExtra">học thêm 5 từ mới</a>.</p>`}
        </div>
      </div>`;
    $("#rTopic").onchange = e => { R.topic = e.target.value; renderReviewSetup(); };
    $("#rStart").onclick = () => startReview(fresh);
    const ex = $("#rExtra"); if (ex) ex.onclick = e => { e.preventDefault(); startReview(5, true); };
  }
  function startReview(nNew, extra) {
    const ws = wordsOf(R.topic);
    const due = shuffle(ws.filter(w => isDue(w.key)));
    const fresh = ws.filter(w => !card(w.key)).slice(0, nNew).map(w => Object.assign({}, w, { isNew: true }));
    if (!due.length && !fresh.length) { toast(extra ? "Bạn đã học hết từ trong chủ đề này" : "Không có thẻ nào"); return; }
    Object.assign(R, { queue: [...due, ...fresh], i: 0, flipped: false, stats: [0, 0, 0] });
    R.total = R.queue.length;
    drawCard();
  }
  function drawCard() {
    if (R.i >= R.queue.length) return reviewDone();
    const w = R.queue[R.i];
    R.flipped = false;
    const doneN = R.i;
    $("#view-review").innerHTML = `
      <div class="study" style="margin-top:12px">
        <div class="study-top">
          <a class="btn btn-ghost btn-icon" href="#/review" aria-label="Thoát" title="Thoát (Esc)">✕</a>
          <div class="progress"><i style="width:${doneN / R.queue.length * 100}%"></i></div>
          <div class="count">${doneN}/${R.queue.length}</div>
        </div>
        <div class="flash" id="flash" role="button" tabindex="0" aria-label="Lật thẻ">
          <div class="flash-inner">
            <div class="face front">
              <span class="tag">${w.isNew ? "🌱 Từ mới" : "🔁 Ôn tập"} · ${topicById[w.topic].name}</span>
              <button class="icon-btn speak" data-speak="${esc(w.es)}" aria-label="Nghe">${icon("volume", "width:16px;height:16px")}</button>
              <div class="word">${esc(w.es)}</div>
              <span class="hint">Bấm vào thẻ hoặc nhấn <kbd>Space</kbd> để xem nghĩa</span>
            </div>
            <div class="face back">
              <span class="tag">${esc(w.es)}</span>
              <button class="icon-btn speak" data-speak="${esc(w.ex || w.es)}" aria-label="Nghe câu ví dụ">${icon("volume", "width:16px;height:16px")}</button>
              <div class="mean">${esc(w.vi)}</div>
              ${w.ex ? `<div class="ex">“${esc(w.ex)}”</div><div class="ex-vi">${esc(w.exVi || "")}</div>` : ""}
            </div>
          </div>
        </div>
        <div id="rActions"><button class="btn btn-lg reveal" id="rReveal">Hiện nghĩa <kbd>Space</kbd></button></div>
        <div class="shortcuts"><span><kbd>Space</kbd> lật thẻ</span><span><kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> đánh giá</span><span><kbd>S</kbd> nghe</span><span><kbd>Esc</kbd> thoát</span></div>
      </div>`;
    setTimeout(() => speak(w.es), 200);
    $("#flash").onclick = flip;
    $("#rReveal").onclick = flip;
    keyHandler = e => {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); flip(); }
      else if (e.key.toLowerCase() === "s") speak(w.es);
      else if (e.key === "Escape") location.hash = "#/review";
      else if (R.flipped && ["1", "2", "3"].includes(e.key)) grade(+e.key - 1);
    };
  }
  function flip() {
    const w = R.queue[R.i];
    $("#flash").classList.toggle("flipped");
    if (R.flipped) return;
    R.flipped = true;
    const c = card(w.key), box = c?.box ?? 0;
    const nextGood = INTERVALS[Math.min(MAX_BOX, box + 1)];
    const fmt = d => d < 1 ? "hôm nay" : d === 1 ? "1 ngày" : `${d} ngày`;
    $("#rActions").innerHTML = `<div class="rate">
      <button class="again" data-g="0">Quên <small><kbd>1</kbd> · ôn lại ngay</small></button>
      <button class="hard" data-g="1">Khó <small><kbd>2</kbd> · ${fmt(Math.max(1, INTERVALS[Math.max(1, box)] / 2))}</small></button>
      <button class="good" data-g="2">Nhớ <small><kbd>3</kbd> · ${fmt(nextGood)}</small></button></div>`;
    $("#rActions").onclick = e => { const b = e.target.closest("[data-g]"); if (b) grade(+b.dataset.g); };
  }
  function grade(g) {
    const w = R.queue[R.i];
    if (w.isNew && !card(w.key)) { S.days["new:" + todayKey()] = newStudiedToday() + 1; }
    rate(w.key, g);
    R.stats[g]++;
    if (g === 0) { const again = Object.assign({}, w, { isNew: false }); R.queue.splice(Math.min(R.queue.length, R.i + 4), 0, again); }
    R.i++;
    drawCard();
  }
  function reviewDone() {
    keyHandler = e => { if (e.key === "Enter") location.hash = "#/"; };
    const [a, h, g] = R.stats;
    $("#view-review").innerHTML = `
      <div class="study" style="margin-top:12px"><div class="card result">
        <div style="font-size:48px">🎉</div>
        <h1 style="margin-top:8px">¡Muy bien!</h1>
        <p class="grade" style="margin-top:6px">Bạn đã hoàn thành ${R.total} thẻ trong phiên này.</p>
        <div class="stats" style="grid-template-columns:repeat(3,1fr);margin-top:22px">
          <div class="card stat" style="box-shadow:none"><div class="k">Nhớ</div><div class="v" style="color:var(--success)">${g}</div></div>
          <div class="card stat" style="box-shadow:none"><div class="k">Khó</div><div class="v" style="color:var(--gold)">${h}</div></div>
          <div class="card stat" style="box-shadow:none"><div class="k">Quên</div><div class="v" style="color:var(--danger)">${a}</div></div>
        </div>
        <div class="actions"><a class="btn btn-ghost" href="#/">Về tổng quan</a><a class="btn" href="#/practice">Luyện tập ${icon("arrow")}</a></div>
      </div></div>`;
  }

  // ---------- Practice (quiz sessions) ----------
  const MODES = { es2vi: "Tây Ban Nha → Việt", vi2es: "Việt → Tây Ban Nha", listen: "Nghe & chọn", type: "Gõ từ" };
  const P = { topic: "all", mode: "es2vi", len: 10, qs: [], i: 0, score: 0, wrong: [], answered: false };
  function renderPracticeSetup() {
    $("#view-practice").innerHTML = `
      <div class="page-head"><div><h1>Luyện tập</h1><p>Mỗi phiên gồm nhiều câu hỏi, có chấm điểm và tổng kết từ sai ở cuối.</p></div></div>
      <div class="study"><div class="card" style="padding:28px;display:flex;flex-direction:column;gap:18px">
        <div><label style="font-size:13px;color:var(--muted);font-weight:500">Chủ đề</label>
          <select class="select" id="pTopic" style="width:100%;margin-top:6px">${topicOptions(P.topic)}</select></div>
        <div><div style="font-size:13px;color:var(--muted);font-weight:500;margin-bottom:6px">Dạng bài</div>
          <div class="segmented" id="pMode">${Object.entries(MODES).map(([k, l]) => `<button data-m="${k}" class="${P.mode === k ? "active" : ""}">${l}</button>`).join("")}</div></div>
        <div><div style="font-size:13px;color:var(--muted);font-weight:500;margin-bottom:6px">Số câu</div>
          <div class="segmented" id="pLen">${[5, 10, 20].map(n => `<button data-n="${n}" class="${P.len === n ? "active" : ""}">${n} câu</button>`).join("")}</div></div>
        <button class="btn btn-accent btn-lg" id="pStart">Bắt đầu ${icon("arrow")}</button>
      </div></div>`;
    $("#pTopic").onchange = e => P.topic = e.target.value;
    $("#pMode").onclick = e => { const b = e.target.closest("button"); if (!b) return; P.mode = b.dataset.m; $$("#pMode button").forEach(x => x.classList.toggle("active", x === b)); };
    $("#pLen").onclick = e => { const b = e.target.closest("button"); if (!b) return; P.len = +b.dataset.n; $$("#pLen button").forEach(x => x.classList.toggle("active", x === b)); };
    $("#pStart").onclick = () => startPractice();
    keyHandler = e => { if (e.key === "Enter") startPractice(); };
  }
  function startPractice(words) {
    const pool = wordsOf(P.topic);
    let picks = words || shuffle(pool).slice(0, P.len);
    while (!words && picks.length < P.len) picks = picks.concat(shuffle(pool).slice(0, P.len - picks.length));
    Object.assign(P, { qs: picks, i: 0, score: 0, wrong: [] });
    drawQ();
  }
  function distractors(w) {
    const same = WORDS.filter(x => x.topic === w.topic && x.key !== w.key && x.vi !== w.vi);
    const other = WORDS.filter(x => x.topic !== w.topic && x.vi !== w.vi);
    return shuffle(same).concat(shuffle(other)).slice(0, 3);
  }
  function drawQ() {
    if (P.i >= P.qs.length) return practiceDone();
    const w = P.qs[P.i];
    P.answered = false;
    const head = `<div class="study-top">
        <a class="btn btn-ghost btn-icon" href="#/practice" aria-label="Thoát">✕</a>
        <div class="progress gold"><i style="width:${P.i / P.qs.length * 100}%"></i></div>
        <div class="count">${P.i + 1}/${P.qs.length}</div></div>`;
    if (P.mode === "type") {
      $("#view-practice").innerHTML = `<div class="study" style="margin-top:12px">${head}
        <div class="card quiz-card">
          <div class="prompt-label">Viết bằng tiếng Tây Ban Nha</div>
          <div class="prompt">${esc(w.vi)}</div>
          <input class="answer-input" id="ans" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Nhập câu trả lời…" aria-label="Câu trả lời">
          <div class="accent-keys">${["á", "é", "í", "ó", "ú", "ñ", "ü", "¿", "¡"].map(c => `<button type="button">${c}</button>`).join("")}</div>
          <div class="feedback" id="fb"><button class="btn" id="chk">Kiểm tra <kbd>Enter</kbd></button><button class="btn btn-ghost" id="skip">Không biết</button></div>
        </div></div>`;
      const inp = $("#ans"); inp.focus();
      $(".accent-keys").onclick = e => { if (e.target.tagName === "BUTTON") { inp.setRangeText(e.target.textContent, inp.selectionStart, inp.selectionEnd, "end"); inp.focus(); } };
      const check = give => {
        if (P.answered) return next();
        const ok = !give && norm(inp.value) === norm(w.es) && inp.value.trim() !== "";
        inp.classList.add(ok ? "correct" : "wrong"); inp.readOnly = true;
        answer(w, ok);
        $("#fb").innerHTML = `<span class="msg ${ok ? "ok" : "no"}">${ok ? "¡Correcto!" : "Đáp án đúng:"} ${esc(w.es)}</span><button class="btn" id="nx">Tiếp <kbd>Enter</kbd></button>`;
        $("#nx").onclick = next;
      };
      $("#chk").onclick = () => check(false); $("#skip").onclick = () => check(true);
      keyHandler = e => { if (e.key === "Enter") { e.preventDefault(); check(false); } else if (e.key === "Escape") location.hash = "#/practice"; };
      return;
    }
    const opts = shuffle([w, ...distractors(w)]);
    const showEs = P.mode === "vi2es";
    const label = { es2vi: "Từ này nghĩa là gì?", vi2es: "Chọn từ tiếng Tây Ban Nha đúng", listen: "Nghe và chọn nghĩa đúng" }[P.mode];
    const prompt = P.mode === "listen"
      ? `<button class="btn btn-lg" data-speak="${esc(w.es)}" style="margin:6px 0">${icon("volume")} Nghe lại</button>`
      : `<div class="prompt">${esc(showEs ? w.vi : w.es)}</div>`;
    $("#view-practice").innerHTML = `<div class="study" style="margin-top:12px">${head}
      <div class="card quiz-card">
        <div class="prompt-label">${label}</div>
        ${prompt}
        ${P.mode === "es2vi" ? `<button class="icon-btn" style="margin:6px auto 0" data-speak="${esc(w.es)}" aria-label="Nghe">${icon("volume", "width:16px;height:16px")}</button>` : ""}
        <div class="options" id="opts">${opts.map((o, i) => `<button class="option" data-i="${i}"><kbd>${i + 1}</kbd><span>${esc(showEs ? o.es : o.vi)}</span></button>`).join("")}</div>
        <div class="feedback" id="fb"></div>
      </div></div>`;
    if (P.mode !== "vi2es") setTimeout(() => speak(w.es), 200);
    const choose = i => {
      if (P.answered) return;
      const ok = opts[i] === w;
      $$("#opts .option").forEach((b, j) => { b.disabled = true; if (opts[j] === w) b.classList.add("correct"); else if (j === i) b.classList.add("wrong"); });
      answer(w, ok);
      if (P.mode === "vi2es") speak(w.es);
      $("#fb").innerHTML = `<span class="msg ${ok ? "ok" : "no"}">${ok ? "¡Correcto! 🎉" : `${esc(w.es)} = ${esc(w.vi)}`}</span><button class="btn" id="nx">Tiếp <kbd>Enter</kbd></button>`;
      $("#nx").onclick = next;
    };
    $("#opts").onclick = e => { const b = e.target.closest(".option"); if (b) choose(+b.dataset.i); };
    keyHandler = e => {
      if (["1", "2", "3", "4"].includes(e.key)) choose(+e.key - 1);
      else if (e.key === "Enter" && P.answered) next();
      else if (e.key.toLowerCase() === "s") speak(w.es);
      else if (e.key === "Escape") location.hash = "#/practice";
    };
  }
  function answer(w, ok) {
    P.answered = true;
    S.answers++; if (ok) { S.correct++; P.score++; } else P.wrong.push(w);
    if (!ok) { const c = S.cards[w.key]; if (c) { c.box = 0; c.due = Date.now(); } else S.cards[w.key] = { box: 0, due: Date.now(), reps: 0, lapses: 1 }; }
    else if (!S.cards[w.key]) S.cards[w.key] = { box: 1, due: Date.now() + DAY, reps: 1, lapses: 0 };
    logActivity();
  }
  const next = () => { P.i++; drawQ(); };
  function practiceDone() {
    const pct = Math.round(P.score / P.qs.length * 100);
    const grade = pct === 100 ? "¡Perfecto! Không sai câu nào." : pct >= 80 ? "¡Excelente! Rất tốt." : pct >= 50 ? "¡Bien! Cố thêm chút nữa." : "Đừng nản — ôn lại các từ sai nhé.";
    const uniq = [...new Map(P.wrong.map(w => [w.key, w])).values()];
    $("#view-practice").innerHTML = `<div class="study" style="margin-top:12px"><div class="card result">
      <div class="prompt-label" style="color:var(--muted)">${MODES[P.mode]} · ${P.topic === "all" ? "Tất cả chủ đề" : topicById[P.topic].name}</div>
      <div class="score" style="color:${pct >= 80 ? "var(--success)" : pct >= 50 ? "var(--gold)" : "var(--danger)"}">${pct}%</div>
      <p class="grade">${P.score}/${P.qs.length} câu đúng · ${grade}</p>
      ${uniq.length ? `<div class="mistakes"><h3>Từ cần ôn lại (${uniq.length})</h3><ul>${uniq.map(w => `<li><span class="say">${esc(w.es)}</span><span style="color:var(--ink-2)">${esc(w.vi)}</span></li>`).join("")}</ul></div>` : ""}
      <div class="actions">
        <a class="btn btn-ghost" href="#/practice">Đổi bài</a>
        ${uniq.length ? `<button class="btn btn-ghost" id="pRetryWrong">Làm lại từ sai</button>` : ""}
        <button class="btn btn-accent" id="pAgain">Phiên mới <kbd>Enter</kbd></button>
      </div></div></div>`;
    $("#pAgain").onclick = () => startPractice();
    const rw = $("#pRetryWrong"); if (rw) rw.onclick = () => startPractice(shuffle(uniq));
    keyHandler = e => { if (e.key === "Enter") startPractice(); };
  }

  // ---------- Grammar ----------
  function renderGrammar(arg) {
    $("#view-grammar").innerHTML = `
      <div class="page-head"><div><h1>Ngữ pháp</h1><p>Những điểm ngữ pháp nền tảng nhất. Bấm vào từ gạch chân để nghe phát âm.</p></div>
        <span class="chip">${GRAMMAR.filter(g => S.read[g.id]).length}/${GRAMMAR.length} bài đã đọc</span></div>
      <div class="grammar-layout">
        <nav class="card toc" aria-label="Mục lục">${GRAMMAR.map((g, i) => `<a href="#/grammar/${g.id}"><span>${i + 1}. ${g.title}</span>${S.read[g.id] ? icon("check", "width:14px;height:14px;color:var(--success)") : ""}</a>`).join("")}</nav>
        <div>${GRAMMAR.map((g, i) => `<article class="card lesson" id="g-${g.id}">
          <h2><span style="color:var(--muted);font-size:16px">${String(i + 1).padStart(2, "0")}</span> ${g.title} <span class="level">${g.level}</span></h2>
          ${g.html}
          <div style="margin-top:18px;display:flex;justify-content:flex-end">
            <button class="btn ${S.read[g.id] ? "btn-ghost" : ""}" data-read="${g.id}">${S.read[g.id] ? icon("check", "width:16px;height:16px;color:var(--success)") + " Đã đọc" : "Đánh dấu đã đọc"}</button></div>
        </article>`).join("")}</div>
      </div>`;
    $("#view-grammar").onclick = e => {
      const b = e.target.closest("[data-read]"); if (!b) return;
      const id = b.dataset.read; S.read[id] = !S.read[id]; save();
      const y = scrollY; renderGrammar(); scrollTo({ top: y });
    };
    if (arg) setTimeout(() => { const el = $("#g-" + arg); if (el) el.scrollIntoView({ behavior: "smooth" }); }, 30);
  }

  // ---------- Settings ----------
  function renderSettings() {
    const st = S.settings;
    const seg = (id, vals, cur, fmt) => `<div class="segmented" id="${id}">${vals.map(v => `<button data-v="${v}" class="${v === cur ? "active" : ""}">${fmt(v)}</button>`).join("")}</div>`;
    $("#view-settings").innerHTML = `
      <div class="page-head"><div><h1>Cài đặt</h1><p>Tiến độ được lưu ngay trên trình duyệt của bạn, không cần tài khoản.</p></div></div>
      <div class="card settings">
        <div class="setting"><div><h3>Mục tiêu mỗi ngày</h3><p>Số lượt ôn tập / trả lời câu hỏi mỗi ngày.</p></div>${seg("sGoal", [10, 20, 30, 50], st.goal, v => v)}</div>
        <div class="setting"><div><h3>Từ mới mỗi ngày</h3><p>Số từ mới tối đa được đưa vào phần Ôn tập mỗi ngày.</p></div>${seg("sNew", [5, 10, 20], st.newPerDay, v => v)}</div>
        <div class="setting"><div><h3>Tốc độ đọc</h3><p>Tốc độ phát âm của giọng đọc.</p></div>${seg("sRate", [0.7, 0.85, 1], st.rate, v => ({ 0.7: "Chậm", 0.85: "Vừa", 1: "Bình thường" })[v])}</div>
        <div class="setting"><div><h3>Giọng đọc</h3><p>${voices.length ? `${voices.length} giọng tiếng Tây Ban Nha có trên thiết bị.` : "Không tìm thấy giọng tiếng Tây Ban Nha — thử Chrome hoặc Edge."}</p></div>
          <div style="display:flex;gap:8px"><select class="select" id="sVoice" ${voices.length ? "" : "disabled"}><option value="">Tự động</option>${voices.map(v => `<option ${v.name === st.voice ? "selected" : ""}>${esc(v.name)}</option>`).join("")}</select>
          <button class="btn btn-ghost btn-icon" data-speak="Hola, ¿cómo estás?" aria-label="Thử giọng">${icon("volume")}</button></div></div>
        <div class="setting"><div><h3>Sao lưu tiến độ</h3><p>Tải xuống hoặc khôi phục tiến độ học (file .json) để chuyển sang máy khác.</p></div>
          <div style="display:flex;gap:8px"><button class="btn btn-ghost" id="sExport">Xuất</button><label class="btn btn-ghost">Nhập<input type="file" id="sImport" accept="application/json" hidden></label></div></div>
        <div class="setting"><div><h3>Xóa toàn bộ tiến độ</h3><p>Không thể hoàn tác.</p></div><button class="btn btn-danger" id="sReset">Xóa tiến độ</button></div>
      </div>`;
    const bindSeg = (id, key, cast) => $("#" + id).onclick = e => { const b = e.target.closest("button"); if (!b) return; st[key] = cast(b.dataset.v); save(); refreshChrome(); renderSettings(); toast("Đã lưu cài đặt"); };
    bindSeg("sGoal", "goal", Number); bindSeg("sNew", "newPerDay", Number); bindSeg("sRate", "rate", Number);
    $("#sVoice").onchange = e => { st.voice = e.target.value; save(); speak("Hola"); };
    $("#sExport").onclick = () => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 2)], { type: "application/json" }));
      a.download = `espanol-tien-do-${todayKey()}.json`; a.click(); URL.revokeObjectURL(a.href);
    };
    $("#sImport").onchange = e => {
      const f = e.target.files[0]; if (!f) return;
      f.text().then(t => { const d = JSON.parse(t); if (!d.cards) throw 0; S = Object.assign(defaults(), d); S.settings = Object.assign(defaults().settings, d.settings); save(); refreshChrome(); renderSettings(); toast("Đã khôi phục tiến độ"); })
        .catch(() => toast("File không hợp lệ"));
    };
    $("#sReset").onclick = () => {
      const b = $("#sReset");
      if (b.dataset.confirm) { const keep = S.settings; S = defaults(); S.settings = keep; save(); refreshChrome(); renderSettings(); toast("Đã xóa tiến độ"); }
      else { b.dataset.confirm = "1"; b.textContent = "Bấm lần nữa để xác nhận"; setTimeout(() => { if (b.isConnected) { delete b.dataset.confirm; b.textContent = "Xóa tiến độ"; } }, 4000); }
    };
  }

  // ---------- Migrate v1 progress ----------
  try {
    const old = JSON.parse(localStorage.getItem("es_known") || "null");
    if (Array.isArray(old) && old.length && !Object.keys(S.cards).length) {
      old.forEach(k => { if (WORDS.some(w => w.key === k)) S.cards[k] = { box: 4, due: Date.now() + INTERVALS[4] * DAY, reps: 1, lapses: 0 }; });
      save(); localStorage.removeItem("es_known");
    }
  } catch (e) {}

  applyThemeBtn();
  refreshChrome();
  go();
})();
