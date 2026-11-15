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
  const TOPICS = window.TOPICS, GRAMMAR = window.GRAMMAR, PATH = window.PATH, TIPS = window.TIPS;
  const WORDS = [];
  TOPICS.forEach(t => t.words.forEach(([es, vi, ex, exVi]) => WORDS.push({ key: `${t.id}|${es}`, topic: t.id, es, vi, ex, exVi })));
  const topicById = Object.fromEntries(TOPICS.map(t => [t.id, t]));
  const wordsOf = id => id === "all" ? WORDS : WORDS.filter(w => w.topic === id);

  // ---------- Persistence ----------
  const STORE_KEY = "es.progress.v2";
  const defaults = () => ({ cards: {}, days: {}, read: {}, answers: 0, correct: 0,
    xp: 0, login: { last: "", streak: 0, best: 0, claimed: "" }, freezes: 0, ach: {}, passed: {}, goalHit: {},
    st: { reviews: 0, typed: 0, listen: 0, perfect: 0 },
    settings: { goal: 20, newPerDay: 10, rate: 0.85, voice: "" } });
  let S = defaults();
  const hydrate = d => { const D = defaults(); S = Object.assign(D, d); ["settings", "login", "st"].forEach(k => S[k] = Object.assign(defaults()[k], d[k])); };
  try { const raw = localStorage.getItem(STORE_KEY); if (raw) hydrate(JSON.parse(raw)); } catch (e) {}
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
    S.st.reviews++;
    gainXP([1, 3, 5][grade]);
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
    if (S.days[k] >= S.settings.goal && !S.goalHit[k]) {
      S.goalHit[k] = true;
      gainXP(50);
      celebrate("🎯", "Hoàn thành mục tiêu hôm nay!", `Bạn đã đạt ${S.settings.goal} lượt học. Thưởng +50 XP.`);
    }
    checkAchievements();
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
  const knownCount = () => WORDS.filter(w => isKnown(w.key)).length;

  // ---------- XP & levels ----------
  const RANKS = ["Principiante", "Aprendiz", "Estudiante", "Explorador", "Viajero", "Conversador", "Hablante", "Experto", "Maestro", "Leyenda"];
  const RANKS_VI = ["Người mới", "Học việc", "Học viên", "Nhà thám hiểm", "Lữ khách", "Người trò chuyện", "Người nói thạo", "Chuyên gia", "Bậc thầy", "Huyền thoại"];
  const needFor = lvl => 100 + 50 * (lvl - 1); // XP để lên từ lvl -> lvl+1
  function levelInfo(xp = S.xp) {
    let lvl = 1, base = 0;
    while (xp >= base + needFor(lvl)) { base += needFor(lvl); lvl++; }
    const r = Math.min(RANKS.length - 1, Math.floor((lvl - 1) / 2));
    return { lvl, into: xp - base, need: needFor(lvl), rank: RANKS[r], rankVi: RANKS_VI[r] };
  }
  function gainXP(n) {
    if (!n) return;
    const before = levelInfo().lvl;
    S.xp += n;
    xpPop(n);
    const after = levelInfo();
    if (after.lvl > before) celebrate("⭐", `Lên cấp ${after.lvl}!`, `Danh hiệu mới: ${after.rank} · ${after.rankVi}. Tiếp tục phát huy nhé!`);
  }
  function xpPop(n) {
    const chip = $("#chipXP"); if (!chip) return;
    const r = chip.getBoundingClientRect();
    const el = document.createElement("div");
    el.className = "xp-pop"; el.textContent = `+${n} XP`;
    el.style.left = (r.left + r.width / 2) + "px"; el.style.top = (r.bottom + 4) + "px";
    document.body.appendChild(el);
    chip.classList.remove("bump"); void chip.offsetWidth; chip.classList.add("bump");
    setTimeout(() => el.remove(), 1100);
  }

  // ---------- Modal / celebrations ----------
  const modalQueue = [];
  let modalOpen = false;
  function modal(html, onReady) {
    modalQueue.push({ html, onReady });
    if (!modalOpen) nextModal();
  }
  function nextModal() {
    const m = modalQueue.shift();
    const root = $("#modal");
    if (!m) { root.hidden = true; modalOpen = false; return; }
    modalOpen = true;
    root.hidden = false;
    root.innerHTML = `<div class="modal-card card" role="dialog" aria-modal="true">${m.html}</div>`;
    const close = $("[data-close]", root); if (close) close.focus();
    if (m.onReady) m.onReady(root);
  }
  function closeModal() { nextModal(); }
  $("#modal").addEventListener("click", e => { if (e.target.id === "modal" || e.target.closest("[data-close]")) closeModal(); });
  document.addEventListener("keydown", e => { if (modalOpen && (e.key === "Escape" || e.key === "Enter")) { e.preventDefault(); e.stopImmediatePropagation(); closeModal(); } }, true);
  function celebrate(emoji, title, body) {
    modal(`<div class="confetti" aria-hidden="true">${[...Array(18)].map((_, i) => `<i style="--x:${(i * 37) % 100}%;--d:${(i % 6) * .08}s;--c:${["var(--accent)", "var(--gold)", "var(--success)"][i % 3]}"></i>`).join("")}</div>
      <div class="modal-emoji">${emoji}</div><h2>${title}</h2><p>${body}</p>
      <button class="btn btn-accent btn-lg" data-close style="margin-top:20px;width:100%">Tuyệt vời!</button>`);
  }

  // ---------- Achievements ----------
  const loginBest = () => Math.max(S.login.best, S.login.streak);
  const ACH = [
    { id: "first", icon: "🌱", name: "Bước đầu tiên", desc: "Ôn tấm thẻ đầu tiên", xp: 10, test: () => S.st.reviews >= 1, prog: () => [S.st.reviews, 1] },
    { id: "rev50", icon: "🃏", name: "Chăm chỉ", desc: "Ôn 50 thẻ", xp: 50, prog: () => [S.st.reviews, 50] },
    { id: "rev300", icon: "📚", name: "Mọt sách", desc: "Ôn 300 thẻ", xp: 150, prog: () => [S.st.reviews, 300] },
    { id: "known10", icon: "🔟", name: "Mười từ đầu tiên", desc: "Thuộc 10 từ", xp: 30, prog: () => [knownCount(), 10] },
    { id: "known50", icon: "🧠", name: "Trí nhớ tốt", desc: "Thuộc 50 từ", xp: 100, prog: () => [knownCount(), 50] },
    { id: "known150", icon: "🏛️", name: "Kho từ vựng", desc: "Thuộc 150 từ", xp: 250, prog: () => [knownCount(), 150] },
    { id: "topic", icon: "🏅", name: "Bậc thầy chủ đề", desc: "Thuộc hết một chủ đề", xp: 80, prog: () => { const b = TOPICS.map(t => [wordsOf(t.id).filter(w => isKnown(w.key)).length, t.words.length]).sort((x, y) => y[0] / y[1] - x[0] / x[1])[0]; return b; } },
    { id: "correct100", icon: "✅", name: "Trăm câu đúng", desc: "Trả lời đúng 100 câu", xp: 80, prog: () => [S.correct, 100] },
    { id: "perfect", icon: "💯", name: "Hoàn hảo", desc: "Đạt 100% một phiên luyện tập từ 10 câu", xp: 50, prog: () => [S.st.perfect, 1] },
    { id: "typist", icon: "⌨️", name: "Gõ phím thần tốc", desc: "Gõ đúng 25 từ", xp: 60, prog: () => [S.st.typed, 25] },
    { id: "listener", icon: "🎧", name: "Đôi tai vàng", desc: "Nghe đúng 25 câu", xp: 60, prog: () => [S.st.listen, 25] },
    { id: "grammar", icon: "📐", name: "Nhà ngữ pháp", desc: "Đọc hết các bài ngữ pháp", xp: 100, prog: () => [GRAMMAR.filter(g => S.read[g.id]).length, GRAMMAR.length] },
    { id: "stage1", icon: "🚩", name: "Qua chặng đầu", desc: "Hoàn thành chặng 1 của lộ trình", xp: 100, prog: () => { const u = PATH[0].units; return [u.filter(unitDone).length, u.length]; } },
    { id: "path", icon: "🏆", name: "Về đích", desc: "Hoàn thành toàn bộ lộ trình", xp: 500, prog: () => [ALL_UNITS.filter(unitDone).length, ALL_UNITS.length] },
    { id: "goal1", icon: "🎯", name: "Đúng mục tiêu", desc: "Đạt mục tiêu ngày lần đầu", xp: 20, prog: () => [Object.keys(S.goalHit).length, 1] },
    { id: "goal10", icon: "📈", name: "Kỷ luật thép", desc: "Đạt mục tiêu ngày 10 lần", xp: 150, prog: () => [Object.keys(S.goalHit).length, 10] },
    { id: "login3", icon: "🔥", name: "Khởi động", desc: "Chuỗi đăng nhập 3 ngày", xp: 30, prog: () => [loginBest(), 3] },
    { id: "login7", icon: "🔥", name: "Một tuần trọn vẹn", desc: "Chuỗi đăng nhập 7 ngày", xp: 100, prog: () => [loginBest(), 7] },
    { id: "login30", icon: "🌋", name: "Không thể cản", desc: "Chuỗi đăng nhập 30 ngày", xp: 500, prog: () => [loginBest(), 30] },
    { id: "lvl5", icon: "⭐", name: "Ngôi sao đang lên", desc: "Đạt cấp 5", xp: 0, prog: () => [levelInfo().lvl, 5] },
    { id: "owl", icon: "🦉", name: "Cú đêm", desc: "Học sau 22 giờ", xp: 15, test: () => new Date().getHours() >= 22, prog: () => [S.ach.owl ? 1 : 0, 1] },
    { id: "bird", icon: "🐦", name: "Chim sớm", desc: "Học trước 7 giờ sáng", xp: 15, test: () => new Date().getHours() < 7, prog: () => [S.ach.bird ? 1 : 0, 1] }
  ];
  let checking = false;
  function checkAchievements() {
    if (checking) return; checking = true;
    ACH.forEach(a => {
      if (S.ach[a.id]) return;
      const ok = a.test ? a.test() : (() => { const [v, t] = a.prog(); return v >= t; })();
      if (!ok) return;
      S.ach[a.id] = Date.now();
      gainXP(a.xp);
      celebrate(a.icon, "Huy hiệu mới: " + a.name, `${a.desc}.${a.xp ? ` Thưởng +${a.xp} XP.` : ""}`);
    });
    checking = false;
    save();
  }

  // ---------- Daily login streak ----------
  const DAILY = [10, 15, 20, 25, 30, 40, 100];
  function checkLogin() {
    const L = S.login, t = todayKey();
    if (L.last === t) return;
    const gap = L.last ? Math.round((new Date(t) - new Date(L.last)) / DAY) : 99;
    let usedFreeze = false;
    if (gap === 1) L.streak++;
    else if (gap === 2 && S.freezes > 0) { S.freezes--; L.streak++; usedFreeze = true; }
    else L.streak = 1;
    L.last = t;
    L.best = Math.max(L.best, L.streak);
    save();
    showCheckIn(usedFreeze);
  }
  const cycleDay = () => ((S.login.streak - 1) % 7) + 1;
  function weekStrip() {
    const cd = cycleDay(), claimed = S.login.claimed === todayKey();
    return `<div class="checkin-days">${DAILY.map((xp, i) => {
      const d = i + 1, st = d < cd || (d === cd && claimed) ? "done" : d === cd ? "today" : "";
      return `<div class="cday ${st} ${d === 7 ? "big" : ""}"><small>Ngày ${d}</small><div class="cico">${st === "done" ? "✓" : d === 7 ? "🎁" : "⚡"}</div><b>+${xp}</b></div>`;
    }).join("")}</div>`;
  }
  function claimDaily() {
    if (S.login.claimed === todayKey()) return;
    const cd = cycleDay();
    S.login.claimed = todayKey();
    gainXP(DAILY[cd - 1]);
    if (cd === 7 && S.freezes < 3) { S.freezes++; toast("🛡️ Nhận thêm 1 khiên bảo vệ chuỗi!"); }
    checkAchievements();
    save(); refreshChrome();
    if (route === "rewards" || route === "home") go();
  }
  function showCheckIn(usedFreeze) {
    const L = S.login;
    modal(`<div class="modal-emoji">🔥</div>
      <h2>Chuỗi đăng nhập: ${L.streak} ngày</h2>
      <p>${usedFreeze ? "🛡️ Bạn đã lỡ một ngày, nhưng khiên bảo vệ đã giữ lại chuỗi cho bạn! " : L.streak === 1 && L.best > 1 ? "Chuỗi đã bắt đầu lại — cố gắng giữ thật lâu nhé! " : "Chào mừng quay lại! "}Điểm danh để nhận thưởng hôm nay.</p>
      ${weekStrip()}
      <button class="btn btn-accent btn-lg" id="claimBtn" style="margin-top:20px;width:100%">Nhận +${DAILY[cycleDay() - 1]} XP</button>
      <p style="font-size:12px;margin-top:10px">Ngày thứ 7 tặng thêm 1 khiên bảo vệ chuỗi (tối đa 3).</p>`,
      root => { $("#claimBtn", root).onclick = () => { claimDaily(); closeModal(); }; });
  }

  // ---------- Roadmap helpers ----------
  const ALL_UNITS = PATH.flatMap((s, si) => s.units.map(([type, id], ui) => ({ type, id, stage: si, idx: ui })));
  const unitKey = u => u.type + ":" + u.id;
  const unitDone = u => (u.type === "g" || u[0] === "g") ? !!S.read[u.id || u[1]] : !!S.passed[u.id || u[1]];
  function unitState(i) {
    const u = ALL_UNITS[i];
    if (unitDone(u)) return "done";
    const firstOpen = ALL_UNITS.findIndex(x => !unitDone(x));
    return i === firstOpen ? "current" : i < firstOpen ? "open" : "locked";
  }
  const unitName = u => u.type === "t" ? topicById[u.id].name : GRAMMAR.find(g => g.id === u.id).title;

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
    $("#chipStreak").textContent = S.login.streak;
    const L = levelInfo();
    $("#chipLvl").textContent = L.lvl;
    $("#chipXPbar").style.width = (L.into / L.need * 100) + "%";
    $("#chipXP").title = `Cấp ${L.lvl} · ${L.into}/${L.need} XP để lên cấp`;
    const unclaimed = S.login.claimed !== todayKey();
    $$("[data-reward-badge]").forEach(b => b.hidden = !unclaimed);
    const due = dueCount();
    $$("[data-due-badge]").forEach(b => { b.hidden = !due; b.textContent = due; });
  }
  window.addEventListener("scroll", () => $("#topbar").classList.toggle("scrolled", scrollY > 4), { passive: true });

  // ---------- Router ----------
  const TITLES = { home: "Tổng quan", path: "Lộ trình", tips: "Mẹo & kinh nghiệm", rewards: "Phần thưởng", vocab: "Từ vựng", review: "Ôn tập", practice: "Luyện tập", grammar: "Ngữ pháp", settings: "Cài đặt" };
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
    document.body.classList.remove("drawer-open");
    ({ home: renderHome, path: renderPath, tips: renderTips, rewards: renderRewards, vocab: renderVocab, review: renderReviewSetup, practice: renderPracticeSetup, grammar: renderGrammar, settings: renderSettings })[route](arg);
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
        <div class="card stat"><div class="k">${icon("flame", "width:14px;height:14px;color:var(--accent)")} Chuỗi ngày học</div><div class="v">${streakDays()}</div>
          <div class="week">${days.map(x => `<div class="d"><div class="b ${x.n ? "on" : ""}" style="height:${Math.max(4, x.n / maxN * 40)}px"></div>${wd[x.d.getDay()]}</div>`).join("")}</div></div>
      </div>

      ${homeExtras()}

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

  const tipOfDay = () => TIPS[Math.floor(Date.now() / DAY) % TIPS.length];
  function homeExtras() {
    const i = ALL_UNITS.findIndex(u => !unitDone(u));
    const u = ALL_UNITS[i], L = levelInfo(), tip = tipOfDay();
    const unclaimed = S.login.claimed !== todayKey();
    return `<div class="duo">
      <div class="card next-card">
        <div class="k-label">Lộ trình · Bước tiếp theo</div>
        ${u ? `<div class="next-row"><div class="unit-dot current">${u.type === "t" ? topicById[u.id].icon : "📐"}</div>
          <div><h3>${unitName(u)}</h3><p>Chặng ${u.stage + 1}: ${PATH[u.stage].title} · ${u.type === "t" ? "Từ vựng + bài kiểm tra" : "Bài ngữ pháp"}</p></div></div>
          <div class="progress" style="margin-top:14px"><i style="width:${ALL_UNITS.filter(unitDone).length / ALL_UNITS.length * 100}%"></i></div>
          <div class="meta-row"><span>${ALL_UNITS.filter(unitDone).length}/${ALL_UNITS.length} bài</span><a href="#/path">Xem lộ trình →</a></div>`
        : `<h3>🏆 Bạn đã hoàn thành lộ trình!</h3><p>Hãy tiếp tục ôn tập mỗi ngày để giữ từ vựng.</p>`}
      </div>
      <div class="card level-card">
        <div class="k-label">Cấp độ & phần thưởng</div>
        <div class="next-row"><div class="lvl-badge">${L.lvl}</div><div><h3>${L.rank}</h3><p>${L.rankVi} · ${S.xp} XP</p></div></div>
        <div class="progress gold" style="margin-top:14px"><i style="width:${L.into / L.need * 100}%"></i></div>
        <div class="meta-row"><span>${L.need - L.into} XP nữa lên cấp ${L.lvl + 1}</span>
          ${unclaimed ? `<button class="link-btn" id="homeClaim">🎁 Điểm danh nhận thưởng</button>` : `<a href="#/rewards">🔥 ${S.login.streak} ngày · Xem →</a>`}</div>
      </div>
    </div>
    <div class="card tip-card">
      <div class="tip-ico">${tip.icon}</div>
      <div><div class="k-label">Mẹo hôm nay · ${tip.cat}</div><h3>${tip.title}</h3><p>${tip.body}</p></div>
      <a class="link-btn" href="#/tips" style="align-self:center">Thêm mẹo →</a>
    </div>`;
  }

  // ---------- Roadmap ----------
  let openUnit = null;
  function renderPath() {
    const doneN = ALL_UNITS.filter(unitDone).length;
    let gi = 0;
    $("#view-path").innerHTML = `
      <div class="page-head"><div><h1>Lộ trình học</h1><p>Đi lần lượt từng bài từ A1 đến A2. Bài từ vựng hoàn thành khi bạn đạt từ 80% trong bài kiểm tra; bài ngữ pháp hoàn thành khi bạn đọc xong.</p></div>
        <span class="chip">${doneN}/${ALL_UNITS.length} bài · ${Math.round(doneN / ALL_UNITS.length * 100)}%</span></div>
      ${PATH.map((st, si) => {
        const units = st.units.map(() => ALL_UNITS[gi++]);
        const sDone = units.filter(unitDone).length;
        return `<section class="stage">
          <div class="stage-head">
            <div class="stage-num ${sDone === units.length ? "done" : ""}">${sDone === units.length ? "✓" : si + 1}</div>
            <div style="flex:1"><h2>${st.title} <span class="level">${st.level}</span></h2><p>${st.desc}</p></div>
            <div class="stage-prog"><small>${sDone}/${units.length}</small><div class="progress"><i style="width:${sDone / units.length * 100}%"></i></div></div>
          </div>
          <div class="units">${units.map(u => {
            const idx = ALL_UNITS.indexOf(u), state = unitState(idx), k = unitKey(u);
            const isOpen = openUnit ? openUnit === k : state === "current";
            const ico = u.type === "t" ? topicById[u.id].icon : "📐";
            let detail = "";
            if (isOpen && state !== "locked") {
              if (u.type === "t") {
                const ws = wordsOf(u.id), studied = ws.filter(w => card(w.key)).length, kn = ws.filter(w => isKnown(w.key)).length;
                detail = `<div class="unit-detail">
                  <div class="unit-steps">
                    <div class="ustep ${studied ? "ok" : ""}"><b>1</b><div><strong>Học từ vựng</strong><small>${studied}/${ws.length} từ đã học · ${kn} đã thuộc</small></div><button class="btn btn-ghost" data-act="learn" data-id="${u.id}">Học với flashcard</button></div>
                    <div class="ustep"><b>2</b><div><strong>Xem danh sách từ</strong><small>Nghe phát âm và đọc câu ví dụ</small></div><a class="btn btn-ghost" href="#/vocab/${u.id}">Mở từ vựng</a></div>
                    <div class="ustep ${S.passed[u.id] ? "ok" : ""}"><b>3</b><div><strong>Bài kiểm tra</strong><small>10 câu tổng hợp · cần đạt 80% · +50 XP</small></div><a class="btn ${S.passed[u.id] ? "btn-ghost" : "btn-accent"}" href="#/practice/test-${u.id}">${S.passed[u.id] ? "Làm lại" : "Làm bài kiểm tra"}</a></div>
                  </div></div>`;
              } else {
                detail = `<div class="unit-detail"><div class="unit-steps">
                  <div class="ustep ${S.read[u.id] ? "ok" : ""}"><b>1</b><div><strong>Đọc bài ngữ pháp</strong><small>Đọc xong bấm "Đánh dấu đã đọc" · +20 XP</small></div><a class="btn ${S.read[u.id] ? "btn-ghost" : "btn-accent"}" href="#/grammar/${u.id}">${S.read[u.id] ? "Đọc lại" : "Bắt đầu đọc"}</a></div>
                </div></div>`;
              }
            }
            return `<div class="unit ${state} ${isOpen ? "open" : ""}">
              <button class="unit-row" data-unit="${k}" ${state === "locked" ? 'aria-disabled="true"' : ""}>
                <div class="unit-dot ${state}">${state === "done" ? "✓" : state === "locked" ? "🔒" : ico}</div>
                <div class="unit-txt"><strong>${unitName(u)}</strong><small>${u.type === "t" ? `Từ vựng · ${topicById[u.id].words.length} từ` : "Ngữ pháp"}</small></div>
                <span class="unit-tag">${state === "done" ? "Hoàn thành" : state === "current" ? "Đang học" : state === "locked" ? "Chưa mở" : "Đã mở"}</span>
              </button>${detail}</div>`;
          }).join("")}</div></section>`;
      }).join("")}`;
    $("#view-path").onclick = e => {
      const r = e.target.closest("[data-unit]");
      if (r) {
        if (r.getAttribute("aria-disabled")) { toast("🔒 Hoàn thành bài trước để mở khóa"); return; }
        openUnit = openUnit === r.dataset.unit ? "__none" : r.dataset.unit; renderPath(); return;
      }
      const a = e.target.closest("[data-act=learn]");
      if (a) { R.topic = a.dataset.id; location.hash = "#/review"; }
    };
  }

  // ---------- Tips ----------
  let tipCat = "Tất cả";
  function renderTips() {
    const cats = ["Tất cả", ...new Set(TIPS.map(t => t.cat))];
    const list = TIPS.filter(t => tipCat === "Tất cả" || t.cat === tipCat);
    const tod = tipOfDay();
    $("#view-tips").innerHTML = `
      <div class="page-head"><div><h1>Mẹo & kinh nghiệm</h1><p>Phương pháp học hiệu quả, mẹo phát âm, ngữ pháp và kinh nghiệm thực tế từ người đi trước.</p></div></div>
      <div class="card tip-card featured"><div class="tip-ico">${tod.icon}</div><div><div class="k-label">⭐ Mẹo hôm nay · ${tod.cat}</div><h3>${tod.title}</h3><p>${tod.body}</p></div></div>
      <div class="toolbar" style="margin-top:20px"><div class="segmented" id="tipCats">${cats.map(c => `<button class="${c === tipCat ? "active" : ""}" data-c="${c}">${c}</button>`).join("")}</div></div>
      <div class="tips-grid">${list.map(t => `<article class="card tip"><div class="tip-head"><span class="tip-ico sm">${t.icon}</span><span class="level">${t.cat}</span></div><h3>${t.title}</h3><p>${t.body}</p></article>`).join("")}</div>`;
    $("#tipCats").onclick = e => { const b = e.target.closest("button"); if (b) { tipCat = b.dataset.c; renderTips(); } };
  }

  // ---------- Rewards ----------
  function renderRewards() {
    const L = levelInfo(), unl = ACH.filter(a => S.ach[a.id]).length;
    const claimed = S.login.claimed === todayKey();
    const ladder = RANKS.map((r, i) => ({ r, vi: RANKS_VI[i], lvl: i * 2 + 1 }));
    $("#view-rewards").innerHTML = `
      <div class="page-head"><div><h1>Phần thưởng</h1><p>Học để nhận XP, lên cấp, mở khóa huy hiệu và giữ chuỗi đăng nhập mỗi ngày.</p></div></div>
      <div class="duo">
        <div class="card level-hero">
          <div class="lvl-badge big">${L.lvl}</div>
          <div style="flex:1;min-width:0"><div class="k-label">Cấp độ hiện tại</div><h2>${L.rank}</h2><p>${L.rankVi}</p>
            <div class="progress gold" style="margin-top:12px;height:10px"><i style="width:${L.into / L.need * 100}%"></i></div>
            <div class="meta-row"><span>${L.into}/${L.need} XP</span><span>Tổng ${S.xp} XP</span></div></div>
        </div>
        <div class="card streak-card">
          <div class="streak-top"><div><div class="k-label">Chuỗi đăng nhập</div><h2>🔥 ${S.login.streak} ngày</h2><p>Kỷ lục: ${loginBest()} ngày · 🛡️ ${S.freezes}/3 khiên</p></div>
            <button class="btn ${claimed ? "btn-ghost" : "btn-accent"}" id="rwClaim" ${claimed ? "disabled" : ""}>${claimed ? "Đã nhận hôm nay ✓" : `Nhận +${DAILY[cycleDay() - 1]} XP`}</button></div>
          ${weekStrip()}
        </div>
      </div>

      <h2 class="section-title">Cách nhận XP</h2>
      <div class="xp-rules card">${[["🃏", "Ôn một thẻ", "+1 → +5"], ["✅", "Trả lời đúng", "+10"], ["📐", "Đọc bài ngữ pháp", "+20"], ["🎯", "Đạt mục tiêu ngày", "+50"], ["🚩", "Qua bài kiểm tra lộ trình", "+50"], ["🔥", "Điểm danh hằng ngày", "+10 → +100"], ["🏅", "Mở khóa huy hiệu", "+10 → +500"]]
        .map(([i, n, x]) => `<div class="xp-rule"><span>${i}</span><div>${n}</div><b>${x}</b></div>`).join("")}</div>

      <h2 class="section-title">Huy hiệu <small>${unl}/${ACH.length} đã mở khóa</small></h2>
      <div class="ach-grid">${ACH.map(a => {
        const [v, t] = a.prog(), got = !!S.ach[a.id];
        return `<div class="card ach ${got ? "got" : ""}"><div class="ach-ico">${a.icon}</div><div style="min-width:0;flex:1"><strong>${a.name}</strong><small>${a.desc}</small>
          ${got ? `<span class="ach-date">✓ ${new Date(S.ach[a.id]).toLocaleDateString("vi-VN")}</span>` : `<div class="progress" style="margin-top:8px;height:5px"><i style="width:${Math.min(100, v / t * 100)}%"></i></div><span class="ach-date">${Math.min(v, t)}/${t}</span>`}</div>
          ${a.xp ? `<span class="ach-xp">+${a.xp}</span>` : ""}</div>`;
      }).join("")}</div>

      <h2 class="section-title">Danh hiệu</h2>
      <div class="ranks">${ladder.map(x => `<div class="rank ${L.lvl >= x.lvl ? "got" : ""}"><b>Cấp ${x.lvl}+</b><span>${x.r}</span><small>${x.vi}</small></div>`).join("")}</div>`;
    const b = $("#rwClaim"); if (b) b.onclick = claimDaily;
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
  const MODES = { mix: "Tổng hợp", es2vi: "Tây Ban Nha → Việt", vi2es: "Việt → Tây Ban Nha", listen: "Nghe & chọn", type: "Gõ từ" };
  const P = { test: null, qmode: "es2vi", topic: "all", mode: "mix", len: 10, qs: [], i: 0, score: 0, wrong: [], answered: false };
  function renderPracticeSetup(arg) {
    P.test = null;
    if (arg && arg.startsWith("test-") && topicById[arg.slice(5)]) {
      const id = arg.slice(5);
      Object.assign(P, { test: id, topic: id, mode: "mix", len: 10 });
      startPractice();
      P.test = id;
      return;
    }
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
    const qm = P.qmode = P.mode === "mix" ? ["es2vi", "vi2es", "listen", "es2vi"][Math.random() * 4 | 0] : P.mode;
    const head = `<div class="study-top">
        <a class="btn btn-ghost btn-icon" href="#/practice" aria-label="Thoát">✕</a>
        <div class="progress gold"><i style="width:${P.i / P.qs.length * 100}%"></i></div>
        <div class="count">${P.i + 1}/${P.qs.length}</div></div>`;
    if (qm === "type") {
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
    const showEs = qm === "vi2es";
    const label = { es2vi: "Từ này nghĩa là gì?", vi2es: "Chọn từ tiếng Tây Ban Nha đúng", listen: "Nghe và chọn nghĩa đúng" }[qm];
    const prompt = qm === "listen"
      ? `<button class="btn btn-lg" data-speak="${esc(w.es)}" style="margin:6px 0">${icon("volume")} Nghe lại</button>`
      : `<div class="prompt">${esc(showEs ? w.vi : w.es)}</div>`;
    $("#view-practice").innerHTML = `<div class="study" style="margin-top:12px">${head}
      <div class="card quiz-card">
        <div class="prompt-label">${label}</div>
        ${prompt}
        ${qm === "es2vi" ? `<button class="icon-btn" style="margin:6px auto 0" data-speak="${esc(w.es)}" aria-label="Nghe">${icon("volume", "width:16px;height:16px")}</button>` : ""}
        <div class="options" id="opts">${opts.map((o, i) => `<button class="option" data-i="${i}"><kbd>${i + 1}</kbd><span>${esc(showEs ? o.es : o.vi)}</span></button>`).join("")}</div>
        <div class="feedback" id="fb"></div>
      </div></div>`;
    if (qm !== "vi2es") setTimeout(() => speak(w.es), 200);
    const choose = i => {
      if (P.answered) return;
      const ok = opts[i] === w;
      $$("#opts .option").forEach((b, j) => { b.disabled = true; if (opts[j] === w) b.classList.add("correct"); else if (j === i) b.classList.add("wrong"); });
      answer(w, ok);
      if (qm === "vi2es") speak(w.es);
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
    if (ok && P.qmode === "type") S.st.typed++;
    if (ok && P.qmode === "listen") S.st.listen++;
    gainXP(ok ? 10 : 2);
    if (!ok) { const c = S.cards[w.key]; if (c) { c.box = 0; c.due = Date.now(); } else S.cards[w.key] = { box: 0, due: Date.now(), reps: 0, lapses: 1 }; }
    else if (!S.cards[w.key]) S.cards[w.key] = { box: 1, due: Date.now() + DAY, reps: 1, lapses: 0 };
    logActivity();
  }
  const next = () => { P.i++; drawQ(); };
  function practiceDone() {
    const pct = Math.round(P.score / P.qs.length * 100);
    const grade = pct === 100 ? "¡Perfecto! Không sai câu nào." : pct >= 80 ? "¡Excelente! Rất tốt." : pct >= 50 ? "¡Bien! Cố thêm chút nữa." : "Đừng nản — ôn lại các từ sai nhé.";
    const uniq = [...new Map(P.wrong.map(w => [w.key, w])).values()];
    if (pct === 100 && P.qs.length >= 10) S.st.perfect++;
    let testMsg = "";
    if (P.test) {
      const name = topicById[P.test].name;
      if (pct >= 80) {
        const first = !S.passed[P.test];
        S.passed[P.test] = Date.now();
        if (first) { gainXP(50); testMsg = `<div class="callout ok-callout">✅ Bạn đã vượt qua bài kiểm tra <b>${name}</b> · +50 XP. Bài tiếp theo trong lộ trình đã mở!</div>`; }
        else testMsg = `<div class="callout ok-callout">✅ Bạn lại vượt qua bài kiểm tra <b>${name}</b>.</div>`;
      } else testMsg = `<div class="callout">Cần đạt từ 80% để qua bài <b>${name}</b>. Ôn lại các từ sai rồi thử lại nhé!</div>`;
    }
    checkAchievements(); save();
    $("#view-practice").innerHTML = `<div class="study" style="margin-top:12px"><div class="card result">
      <div class="prompt-label" style="color:var(--muted)">${P.test ? "Bài kiểm tra lộ trình" : MODES[P.mode]} · ${P.topic === "all" ? "Tất cả chủ đề" : topicById[P.topic].name}</div>
      <div class="score" style="color:${pct >= 80 ? "var(--success)" : pct >= 50 ? "var(--gold)" : "var(--danger)"}">${pct}%</div>
      <p class="grade">${P.score}/${P.qs.length} câu đúng · ${grade}</p>
      ${testMsg}
      ${uniq.length ? `<div class="mistakes"><h3>Từ cần ôn lại (${uniq.length})</h3><ul>${uniq.map(w => `<li><span class="say">${esc(w.es)}</span><span style="color:var(--ink-2)">${esc(w.vi)}</span></li>`).join("")}</ul></div>` : ""}
      <div class="actions">
        ${P.test ? `<a class="btn btn-ghost" href="#/path">Về lộ trình</a>` : `<a class="btn btn-ghost" href="#/practice">Đổi bài</a>`}
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
      const id = b.dataset.read; S.read[id] = !S.read[id];
      if (S.read[id] && !S.ach["read:" + id]) { S.ach["read:" + id] = 1; gainXP(20); }
      if (S.read[id]) logActivity(); else save();
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
      f.text().then(t => { const d = JSON.parse(t); if (!d.cards) throw 0; hydrate(d); save(); refreshChrome(); renderSettings(); toast("Đã khôi phục tiến độ"); })
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

  document.addEventListener("click", e => { if (e.target.closest("#homeClaim")) showCheckIn(false); });

  // ---------- Mobile drawer ----------
  $("#menuBtn").onclick = () => document.body.classList.toggle("drawer-open");
  $("#scrim").onclick = () => document.body.classList.remove("drawer-open");

  applyThemeBtn();
  refreshChrome();
  go();
  checkLogin();
  checkAchievements();
  refreshChrome();
})();
