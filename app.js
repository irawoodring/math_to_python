(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const STORE_KEY = "m2p-progress-v1";
  const TIMEOUT_MS = 5000;

  // ---------- saved progress ----------
  let progress = { solved: {}, revealed: {}, streak: 0, cat: "all", current: null };
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY));
    if (saved && typeof saved === "object") progress = Object.assign(progress, saved);
  } catch (_) { /* storage unavailable */ }
  const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(progress)); } catch (_) {} };

  // ---------- Python worker ----------
  let worker = null, pyReady = false, nextId = 1;
  const pending = new Map();

  function startWorker() {
    pyReady = false;
    setCheckButton();
    worker = new Worker("worker.js");
    worker.onmessage = (ev) => {
      const msg = ev.data;
      if (msg.type === "ready") { pyReady = true; setCheckButton(); }
      else if (msg.type === "fatal") {
        $("check").textContent = "Python failed to load";
        showFeedback("bad", "Couldn't load Python", `<p>${esc(msg.message)}</p><p>Check your internet connection and reload the page.</p>`);
      } else if (msg.type === "result" && pending.has(msg.id)) {
        const { resolve, timer } = pending.get(msg.id);
        clearTimeout(timer);
        pending.delete(msg.id);
        resolve(msg.result);
      }
    };
  }

  function runCheck(payload) {
    return new Promise((resolve) => {
      const id = nextId++;
      const timer = setTimeout(() => {
        pending.delete(id);
        worker.terminate();
        startWorker();
        resolve({ status: "error", kind: "Timeout", message: "Your code ran for too long and was stopped.",
          hints: ["Huge numbers, like a**b**c with big values, or very long loops take a long time. Check your exponents and range() limits."] });
      }, TIMEOUT_MS);
      pending.set(id, { resolve, timer });
      worker.postMessage(Object.assign({ id }, payload));
    });
  }

  // ---------- helpers ----------
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function tex(el, src, display = true) {
    if (window.katex) katex.render(src, el, { displayMode: display, throwOnError: false });
    else el.textContent = src;
  }
  function texString(src) {
    return window.katex ? katex.renderToString(src, { throwOnError: false }) : esc(src);
  }

  function randomValue([lo, hi, kind]) {
    if (kind === "int") return lo + Math.floor(Math.random() * (hi - lo + 1));
    const v = lo + Math.random() * (hi - lo);
    return Math.round(v * 100) / 100;
  }
  function makeTrials(p, count = 40) {
    const trials = (p.edges || []).map((e) => Object.assign({}, e));
    for (let i = 0; i < count; i++) {
      const t = {};
      for (const [name, spec] of Object.entries(p.vars)) t[name] = randomValue(spec);
      trials.push(t);
    }
    return trials;
  }

  // ---------- state ----------
  let list = [];   // problems in the current category
  let idx = 0;     // index into list
  let hintShown = false;

  const current = () => list[idx];

  function setCheckButton() {
    const b = $("check");
    b.disabled = !pyReady;
    b.textContent = pyReady ? "Check" : "Loading Python…";
  }

  function buildCategorySelect() {
    const sel = $("category");
    const opts = [["all", "All topics"]].concat(Object.entries(CATEGORIES));
    sel.innerHTML = opts.map(([k, v]) => {
      const n = k === "all" ? PROBLEMS.length : PROBLEMS.filter((p) => p.cat === k).length;
      return `<option value="${k}">${esc(v)} (${n})</option>`;
    }).join("");
    if (!opts.some(([k]) => k === progress.cat)) progress.cat = "all";
    sel.value = progress.cat;
    sel.addEventListener("change", () => {
      progress.cat = sel.value;
      setList();
      const firstUnsolved = list.findIndex((p) => !progress.solved[p.id]);
      show(firstUnsolved >= 0 ? firstUnsolved : 0);
    });
  }

  function setList() {
    list = progress.cat === "all" ? PROBLEMS.slice() : PROBLEMS.filter((p) => p.cat === progress.cat);
  }

  function renderDots() {
    $("dots").innerHTML = list.map((p, i) => {
      const cls = [progress.solved[p.id] ? "solved" : progress.revealed[p.id] ? "revealed" : "", i === idx ? "current" : ""].join(" ");
      const label = `Problem ${i + 1}: ${p.title}${progress.solved[p.id] ? " (solved)" : ""}`;
      return `<li><button type="button" class="${cls}" data-i="${i}" aria-label="${esc(label)}" title="${esc(p.title)}"${i === idx ? ' aria-current="true"' : ""}>${i + 1}</button></li>`;
    }).join("");
  }

  function renderStats() {
    $("solved-count").textContent = PROBLEMS.filter((p) => progress.solved[p.id]).length;
    $("total-count").textContent = PROBLEMS.length;
    $("streak").textContent = progress.streak;
  }

  function show(i) {
    idx = (i + list.length) % list.length;
    const p = current();
    progress.current = p.id;
    save();
    hintShown = false;

    $("problem-cat").textContent = CATEGORIES[p.cat];
    $("problem-level").textContent = "●".repeat(p.level) + "○".repeat(3 - p.level);
    $("problem-level").setAttribute("aria-label", `Difficulty ${p.level} of 3`);
    $("problem-title").textContent = p.title;
    tex($("problem-math"), p.tex);
    $("problem-vars").innerHTML = Object.entries(p.vars).map(([name, spec]) =>
      `<code>${esc(name)}</code>`).join(" ") +
      (Object.values(p.vars).some((s) => s[2] === "int") ? ` <span class="muted">(${Object.entries(p.vars).filter(([, s]) => s[2] === "int").map(([n]) => n).join(", ")} ${Object.values(p.vars).filter((s) => s[2] === "int").length > 1 ? "are integers" : "is an integer"})</span>` : "");
    $("solved-badge").hidden = !progress.solved[p.id];
    $("position").textContent = `${idx + 1} / ${list.length}`;
    $("hint").hidden = true;
    $("feedback").innerHTML = "";
    const ans = $("answer");
    ans.value = "";
    autosize();
    $("editor-wrap").className = "editor";
    renderDots();
    renderStats();
    ans.focus({ preventScroll: true });
  }

  function showFeedback(kind, title, html) {
    const fb = $("feedback");
    fb.innerHTML = `<div class="fb-${kind} pop"><p class="fb-title">${esc(title)}</p>${html}</div>`;
  }

  function hintList(hints) {
    const uniq = [...new Set(hints || [])];
    return uniq.length ? `<ul>${uniq.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>` : "";
  }

  function varsLine(vars) {
    return Object.entries(vars).map(([k, v]) => `${esc(k)} = ${esc(v)}`).join(", ");
  }

  // ---------- checking ----------
  async function check() {
    if (!pyReady) return;
    const p = current();
    const code = $("answer").value;
    if (!code.trim()) { showFeedback("info", "Type an expression first", ""); return; }
    const btn = $("check");
    btn.disabled = true;
    btn.textContent = "Checking…";
    const intVars = Object.entries(p.vars).filter(([, s]) => s[2] === "int").map(([n]) => n);
    const res = await runCheck({ student: code, ref: p.py, trials: makeTrials(p), varNames: Object.keys(p.vars), intVars });
    setCheckButton();
    if (current() !== p) return; // user moved on

    const editor = $("editor-wrap");
    if (res.status === "correct") {
      editor.className = "editor good";
      const first = !progress.solved[p.id];
      progress.solved[p.id] = true;
      progress.streak += 1;
      save();
      $("solved-badge").hidden = false;
      const alt = normalize(code) === normalize(p.py) ? "" :
        `<p>Another way to write it: <code>${esc(p.py)}</code></p>`;
      showFeedback("good", first ? "Correct!" : "Correct again!",
        `<p>Your expression matched on ${res.tested} sets of random test values.</p>${alt}<p>${esc(p.note)}</p>`);
      renderDots(); renderStats();
      $("next-btn").focus({ preventScroll: true });
      return;
    }

    editor.className = "editor bad";
    progress.streak = 0;
    save();
    renderStats();

    if (res.status === "wrong") {
      showFeedback("bad", "Not quite",
        `<p>Python ran your expression, but it doesn't match for these values:</p>
         <table class="compare">
           <tr><th>When</th><td>${varsLine(res.vars)}</td></tr>
           <tr><th>Yours gives</th><td>${esc(res.got)}</td></tr>
           <tr><th>Expected</th><td>${esc(res.expected)}</td></tr>
         </table>
         ${res.why ? `<p>${esc(res.why)}</p>` : ""}
         ${hintList(res.hints)}`);
    } else {
      const where = res.vars ? `<p>Values used: <code>${varsLine(res.vars)}</code></p>` : "";
      showFeedback("bad", res.kind === "SyntaxError" ? "Python couldn't read that" : "Your code raised an error",
        `<p><span class="errname">${esc(res.kind)}</span>: ${esc(res.message)}</p>${where}${hintList(res.hints)}`);
    }
  }

  const normalize = (s) => s.replace(/\s+/g, "").replace(/^importmath;?/, "");

  // ---------- events ----------
  function autosize() {
    const t = $("answer");
    t.style.height = "auto";
    t.style.height = t.scrollHeight + "px";
  }

  function wire() {
    const ans = $("answer");
    // wrap the editor so we can color its border
    ans.parentElement.id = "editor-wrap";

    $("answer-form").addEventListener("submit", (e) => { e.preventDefault(); check(); });
    ans.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); check(); }
    });
    ans.addEventListener("input", () => {
      autosize();
      $("editor-wrap").className = "editor";
    });

    $("hint-btn").addEventListener("click", () => {
      const h = $("hint");
      h.innerHTML = `<strong>Hint:</strong> ${esc(current().hint)}`;
      h.hidden = false;
      hintShown = true;
    });

    $("reveal-btn").addEventListener("click", () => {
      const p = current();
      if (!progress.solved[p.id]) { progress.revealed[p.id] = true; progress.streak = 0; save(); }
      showFeedback("info", "One correct answer",
        `<p><code>${esc(p.py)}</code></p><p>${esc(p.note)}</p><p>Try typing it yourself and press Check. Other equivalent answers are accepted too.</p>`);
      renderDots(); renderStats();
    });

    $("next-btn").addEventListener("click", () => show(idx + 1));
    $("next-nav").addEventListener("click", () => show(idx + 1));
    $("prev").addEventListener("click", () => show(idx - 1));
    $("shuffle").addEventListener("click", () => {
      const pool = list.map((p, i) => i).filter((i) => !progress.solved[list[i].id] && i !== idx);
      const all = list.map((p, i) => i).filter((i) => i !== idx);
      const from = pool.length ? pool : all;
      if (from.length) show(from[Math.floor(Math.random() * from.length)]);
    });
    $("dots").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-i]");
      if (b) show(Number(b.dataset.i));
    });
    $("reset").addEventListener("click", () => {
      if (!confirm("Reset all saved progress on this device?")) return;
      progress = { solved: {}, revealed: {}, streak: 0, cat: progress.cat, current: null };
      save();
      show(idx);
    });
  }

  // ---------- cheat sheet ----------
  const CHEATS = [
    ["3x", "3*x", "No implicit multiplication"],
    ["x^2", "x**2", "^ is XOR in Python!"],
    ["\\frac{a+b}{c+d}", "(a + b) / (c + d)", "Fraction bars group; parentheses must too"],
    ["\\sqrt{x}", "math.sqrt(x)", "or x**0.5"],
    ["\\sqrt[n]{x}", "x**(1/n)", "Parenthesize the exponent"],
    ["e^x", "math.exp(x)", "math.e is the constant"],
    ["\\pi", "math.pi", ""],
    ["|x|", "abs(x)", "Built in, no math. needed"],
    ["\\ln x,\\ \\log_{10} x,\\ \\log_b x", "math.log(x), math.log10(x), math.log(x, b)", "math.log is natural log"],
    ["\\sin^2 x", "math.sin(x)**2", "Radians, not degrees"],
    ["\\lfloor x \\rfloor,\\ \\lceil x \\rceil", "math.floor(x), math.ceil(x)", "int(x) truncates toward 0"],
    ["\\lfloor a/b \\rfloor,\\ a \\bmod b", "a // b, a % b", ""],
    ["n!,\\ \\binom{n}{k}", "math.factorial(n), math.comb(n, k)", "! isn't an operator"],
    ["\\sum_{i=1}^{n} f(i)", "sum(f(i) for i in range(1, n + 1))", "range excludes its end"],
    ["\\prod_{i=1}^{n} f(i)", "math.prod(f(i) for i in range(1, n + 1))", ""],
    ["=,\\ \\neq,\\ \\le,\\ \\ge", "==, !=, <=, >=", "= alone assigns"],
    ["\\land,\\ \\lor,\\ \\lnot", "and, or, not", ""],
    ["a \\le x < b", "a <= x < b", "Chained comparisons work"],
  ];
  function buildCheatSheet() {
    $("cheat-body").innerHTML = CHEATS.map(([m, py, note]) =>
      `<tr><td>${texString(m)}</td><td><code>${esc(py)}</code></td><td>${esc(note)}</td></tr>`).join("");
  }

  // ---------- boot ----------
  function boot() {
    buildCategorySelect();
    setList();
    wire();
    buildCheatSheet();
    startWorker();
    const start = list.findIndex((p) => p.id === progress.current);
    show(start >= 0 ? start : 0);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
