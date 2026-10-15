/* Patkan content script. No ES imports: content scripts are classic scripts. */
(() => {
  "use strict";

  // Firefox exposes promise-based APIs on `browser`; Chromium on `chrome`.
  const chrome = globalThis.browser ?? globalThis.chrome;

  const GENERIC = ["textarea", "div[contenteditable='true']", "[role='textbox'][contenteditable='true']"];

  const HOSTS = [
    {
      id: "chatgpt",
      dialect: "markdown",
      match: /(^|\.)chatgpt\.com$|(^|\.)chat\.openai\.com$/,
      selectors: ["#prompt-textarea", "div.ProseMirror[contenteditable='true']", "textarea[data-id]"],
    },
    {
      id: "claude",
      dialect: "xml",
      match: /(^|\.)claude\.ai$/,
      selectors: ["div.ProseMirror[contenteditable='true']", "div[contenteditable='true']"],
    },
    {
      id: "gemini",
      dialect: "sectioned",
      match: /(^|\.)gemini\.google\.com$/,
      selectors: [
        "rich-textarea div.ql-editor[contenteditable='true']",
        "div.ql-editor[contenteditable='true']",
        "rich-textarea [contenteditable='true']:not(.ql-clipboard)",
        "[aria-label*='prompt for Gemini' i][contenteditable='true']",
        "[role='textbox'][contenteditable='true']",
        "textarea",
      ],
    },
    {
      id: "aistudio",
      dialect: "sectioned",
      match: /(^|\.)aistudio\.google\.com$/,
      selectors: ["textarea[aria-label*='prompt' i]", "ms-autosize-textarea textarea", ...GENERIC],
    },
    {
      id: "perplexity",
      dialect: "markdown",
      match: /(^|\.)perplexity\.ai$/,
      selectors: ["textarea[placeholder]", "div#ask-input[contenteditable='true']", ...GENERIC],
    },
    {
      id: "copilot",
      dialect: "markdown",
      match: /(^|\.)copilot\.microsoft\.com$/,
      selectors: ["textarea#userInput", "textarea[data-testid='composer-input']", ...GENERIC],
    },
    {
      id: "grok",
      dialect: "markdown",
      match: /(^|\.)grok\.com$/,
      selectors: ["textarea[aria-label*='Ask' i]", ...GENERIC],
    },
    {
      id: "deepseek",
      dialect: "markdown",
      match: /(^|\.)chat\.deepseek\.com$/,
      selectors: ["textarea#chat-input", ...GENERIC],
    },
    {
      id: "metaai",
      dialect: "sectioned",
      match: /(^|\.)meta\.ai$/,
      selectors: ["div[contenteditable='true'][role='textbox']", ...GENERIC],
    },
    {
      id: "lechat",
      dialect: "markdown",
      match: /(^|\.)chat\.mistral\.ai$/,
      selectors: ["div.ProseMirror[contenteditable='true']", ...GENERIC],
    },
    {
      id: "poe",
      dialect: "markdown",
      match: /(^|\.)poe\.com$/,
      selectors: ["textarea[class*='GrowingTextArea']", ...GENERIC],
    },
    {
      id: "notion",
      dialect: "markdown",
      match: /(^|\.)notion\.so$/,
      selectors: [
        "div[contenteditable='true'][data-content-editable-leaf='true']",
        "div[role='textbox'][contenteditable='true']",
      ],
    },
    {
      id: "kimi",
      dialect: "markdown",
      match: /(^|\.)kimi\.com$/,
      selectors: ["div[contenteditable='true'].chat-input-editor", ...GENERIC],
    },
    {
      id: "qwen",
      dialect: "markdown",
      match: /(^|\.)chat\.qwen\.ai$/,
      selectors: ["textarea#chat-input", ...GENERIC],
    },
  ];


  const host = HOSTS.find((h) => h.match.test(location.hostname));
  if (!host) return;

  let pillHost = null;
  let shadow = null;
  let pill = null;
  let chip = null;
  let target = null;
  let lastOriginal = null;
  let busy = false;
  let sendAnyway = false;
  let restingLabel = "End with // to turn into prompt";
  let siteOff = false;
  let runId = 0;
  let lastResult = null;
  let hintShown = false;
  chrome.storage.local.get("disabledHosts").then((s) => {
    siteOff = (s.disabledHosts || []).includes(location.hostname);
    applySiteState();
  }).catch(() => {});

  /* ---------- text read / write ---------- */

  function readText(el) {
    if (!el) return "";
    return el.tagName === "TEXTAREA" ? el.value : el.innerText;
  }

  function writeText(el, text) {
    try {
      if (el.tagName === "TEXTAREA") {
        const setter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype,
          "value",
        ).set;
        setter.call(el, text);
        el.dispatchEvent(new Event("input", { bubbles: true }));
        return true;
      }
      el.focus();
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      // execCommand fires the beforeinput/input pairs ProseMirror, Lexical and
      // Quill listen for; assigning innerText silently desyncs their model.
      const ok = document.execCommand("insertText", false, text);
      if (!ok) return false;
      return readText(el).trim().length > 0;
    } catch {
      return false;
    }
  }

  /* ---------- shadow UI ---------- */

  function hostIsDark() {
    let el = target || document.body;
    while (el && el.nodeType === 1) {
      const c = getComputedStyle(el).backgroundColor;
      const m = c.match(/\d+(\.\d+)?/g);
      if (m && (m.length < 4 || +m[3] > 0.5)) {
        const [r, g, b] = m.map(Number);
        return 0.2126 * r + 0.7152 * g + 0.0722 * b < 128;
      }
      el = el.parentElement;
    }
    return matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function applyTheme() {
    if (pillHost) pillHost.classList.toggle("dark", hostIsDark());
    if (shadow) shadow.host.dataset.theme = hostIsDark() ? "dark" : "light";
  }

  function applySiteState() {
    if (!pill) return;
    pill.classList.toggle("off", siteOff);
    tipText.textContent = siteOff ? "Patkan is off on this site" : "End with // to turn into prompt";
    tipBtn.textContent = siteOff ? "Turn on here" : "Turn off here";
  }

  let tip = null, tipText = null, tipBtn = null, hideTipTimer = null;

  function ensureUI() {
    if (pillHost) return;
    pillHost = document.createElement("div");
    pillHost.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;z-index:2147483646;";
    shadow = pillHost.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = `
      :host { all: initial; --bg:#fffaf3; --fg:#1c1917; --bd:rgba(28,25,23,.18); --hv:#f2e7d8; }
      :host([data-theme="dark"]) { --bg:#262321; --fg:#f5efe6; --bd:rgba(255,255,255,.16); --hv:#36312d; }
      .badge {
        position: fixed; width: 22px; height: 22px; box-sizing: border-box;
        border-radius: 6px; background: #1c1917; border: 1px solid rgba(255,255,255,.14);
        color: #ff6b00; font: 700 11px/20px ui-monospace, SFMono-Regular, Menlo, monospace;
        letter-spacing: -1px; text-align: center; cursor: pointer; user-select: none;
        display: none; box-shadow: 0 1px 4px rgba(0,0,0,.18); opacity: .92;
      }
      .badge.show { display: block; }
      .badge:hover { opacity: 1; }
      .badge.off { color: #8a817a; opacity: .55; }
      .tip, .pill, .chip {
        position: fixed; font: 500 12px/1.2 ui-sans-serif, system-ui, -apple-system, sans-serif;
        background: var(--bg); color: var(--fg); border: 1px solid var(--bd);
        border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,.14);
        display: none; align-items: center; gap: 8px; padding: 6px 10px; user-select: none;
      }
      .tip.show, .pill.show, .chip.show { display: inline-flex; }
      button { all: unset; cursor: pointer; padding: 3px 8px; border-radius: 6px;
        font: 600 11px/1 ui-sans-serif, system-ui, sans-serif; color: var(--fg); }
      button:hover { background: var(--hv); }
      .tip button { color: #ff6b00; }
      .spin { animation: sp .7s linear infinite; display:inline-block; color:#ff6b00; }
      @keyframes sp { to { transform: rotate(360deg); } }
      .chip { padding: 3px 4px; }
    `;
    pill = document.createElement("div");
    pill.className = "badge";
    pill.textContent = "//";
    pill.setAttribute("role", "button");
    pill.setAttribute("aria-label", "End with // to turn into prompt");
    pill.addEventListener("mousedown", (e) => {
      e.preventDefault();
      if (!siteOff) run();
    });
    pill.addEventListener("mouseenter", () => showTip(true));
    pill.addEventListener("mouseleave", () => scheduleHideTip());

    tip = document.createElement("div");
    tip.className = "tip";
    tipText = document.createElement("span");
    tipBtn = document.createElement("button");
    tipBtn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      toggleSite();
    });
    tip.append(tipText, tipBtn);
    tip.addEventListener("mouseenter", () => clearTimeout(hideTipTimer));
    tip.addEventListener("mouseleave", () => scheduleHideTip());

    // In-flight status with an always-available exit.
    busyEl = document.createElement("div");
    busyEl.className = "pill";
    const spin = document.createElement("span");
    spin.className = "spin";
    spin.textContent = "◠";
    const busyLbl = document.createElement("span");
    busyLbl.textContent = "Transforming…";
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      cancel();
    });
    busyEl.append(spin, busyLbl, cancelBtn);

    chip = document.createElement("div");
    chip.className = "chip";
    const undoBtn = document.createElement("button");
    undoBtn.textContent = "Undo";
    undoBtn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      undo();
    });
    chip.append(undoBtn);

    shadow.append(style, pill, tip, busyEl, chip);
    document.documentElement.appendChild(pillHost);
    applySiteState();
  }
  let busyEl = null;

  function showTip(show) {
    ensureUI();
    clearTimeout(hideTipTimer);
    tip.classList.toggle("show", show);
    if (show) place(target);
  }
  function scheduleHideTip(ms = 250) {
    clearTimeout(hideTipTimer);
    hideTipTimer = setTimeout(() => tip && tip.classList.remove("show"), ms);
  }

  async function toggleSite() {
    const s = await chrome.storage.local.get("disabledHosts");
    const list = new Set(s.disabledHosts || []);
    siteOff = !siteOff;
    if (siteOff) list.add(location.hostname);
    else list.delete(location.hostname);
    await chrome.storage.local.set({ disabledHosts: [...list] });
    track(siteOff ? "site_disabled" : "site_enabled", { reason: location.hostname.slice(0, 60) });
    applySiteState();
  }

  function place(el) {
    if (!el || !pill) return;
    const r = el.getBoundingClientRect();
    // Badge sits just outside the composer's top-right corner so it never covers text.
    const bx = Math.min(window.innerWidth - 30, r.right - 11);
    const by = Math.max(4, r.top - 11);
    pill.style.left = bx + "px";
    pill.style.top = by + "px";
    tip.style.left = Math.max(8, bx + 22 - tip.offsetWidth) + "px";
    tip.style.top = Math.max(4, by - tip.offsetHeight - 6) + "px";
    for (const x of [busyEl, chip]) {
      x.style.left = Math.max(8, bx - x.offsetWidth - 6) + "px";
      x.style.top = Math.max(4, by - 4) + "px";
    }
  }

  function showPill(show) {
    ensureUI();
    applyTheme();
    pill.classList.toggle("show", show);
    if (show) {
      place(target);
      if (!hintShown && !siteOff) {
        hintShown = true;
        showTip(true);
        scheduleHideTip(3000);
      }
    } else tip.classList.remove("show");
  }

  function showChip(show) {
    ensureUI();
    applyTheme();
    chip.classList.toggle("show", show);
    if (show) place(target);
  }

  function setPhase(phase) {
    ensureUI();
    busy = phase === "drafting" || phase === "sharpening";
    applyTheme();
    busyEl.classList.toggle("show", busy);
    if (busy) place(target);
    if (target) target.style.opacity = busy ? "0.55" : "";
  }

  function cancel() {
    if (!busy) return;
    runId++;
    setPhase("idle");
    if (target && lastOriginal != null) writeText(target, lastOriginal);
    track("transform_cancelled");
  }

  function toast(text) {
    ensureUI();
    const el = document.createElement("div");
    el.className = "pill show";
    el.style.cssText += "left:50%;transform:translateX(-50%);top:24px;cursor:default;";
    el.textContent = text;
    shadow.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  function showSendAnyway() {
    ensureUI();
    if (shadow.querySelector(".sendAnyway")) return;
    const el = document.createElement("div");
    el.className = "pill show sendAnyway";
    el.style.cssText += "left:50%;transform:translateX(-50%);top:64px;";
    el.textContent = "Send anyway";
    el.addEventListener("mousedown", (ev) => {
      ev.preventDefault();
      sendAnyway = true;
      el.remove();
      toast("Sending your draft as-is.");
    });
    shadow.appendChild(el);
    setTimeout(() => el.remove(), 6000);
  }

  /* ---------- core action ---------- */

  // Set once a rewrite lands; resolved to accepted/discarded so quality is measurable.
  let pendingFeedback = false;

  function reportFeedback(accepted) {
    if (!pendingFeedback) return;
    pendingFeedback = false;
    chrome.runtime.sendMessage({ type: "PATKAN_FEEDBACK", payload: { accepted } }).catch(() => {});
  }

  function undo() {
    if (target && lastOriginal != null) {
      writeText(target, lastOriginal);
      lastResult = null;
      showChip(false);
      reportFeedback(false);
      track("transform_rejected");
    }
  }

  /** The wall is a doorway, not a dead end: one tap opens sign-in. */
  function showLimitCta(message) {
    track("quota_limit_reached");
    ensureUI();
    const existing = shadow.querySelector(".limitCta");
    if (existing) existing.remove();
    const el = document.createElement("div");
    el.className = "pill show limitCta";
    el.style.cssText += "left:50%;transform:translateX(-50%);top:24px;max-width:min(520px,90vw);text-align:center;";
    el.textContent = message;
    el.addEventListener("mousedown", (ev) => {
      ev.preventDefault();
      chrome.runtime.sendMessage({ type: "PATKAN_OPEN_SIGNIN" });
      el.remove();
    });
    shadow.appendChild(el);
    setTimeout(() => el.remove(), 12000);
  }

  function track(event, detail) {
    chrome.runtime
      .sendMessage({ type: "PATKAN_TRACK", payload: { event, host: host.id, surface: "extension-inline", ...detail } })
      .catch(() => {});
  }

  async function run(cleanText) {
    if (busy || !target || siteOff) return;
    track("trigger_detected");
    const raw = typeof cleanText === "string" ? cleanText : readText(target).replace(/\/\/\s*$/, "").trim();
    if (raw.length < 3) return;

    lastOriginal = typeof cleanText === "string" ? cleanText : readText(target);
    sendAnyway = false;
    const myRun = ++runId;
    setPhase("drafting");
    showChip(false);

    const settings = await chrome.runtime.sendMessage({ type: "PATKAN_GET_SETTINGS" });

    // Progressive disclosure: a zero-network scaffold lands instantly so the
    // composer is never empty while the model works.
    const scaffold = await chrome.runtime.sendMessage({
      type: "PATKAN_SCAFFOLD",
      payload: { text: raw, persona: settings?.persona, dialect: host.dialect, intensity: settings?.intensity },
    });
    if (myRun !== runId) return;
    if (scaffold?.text) writeText(target, scaffold.text);
    setPhase("sharpening");

    const res = await chrome.runtime.sendMessage({
      type: "PATKAN_TRANSFORM",
      payload: {
        text: raw,
        persona: settings?.persona,
        dialect: host.dialect,
        intensity: settings?.intensity,
        host: host.id,
        surface: "extension-inline",
      },
    });

    if (myRun !== runId) return; // cancelled: the user's words are already back
    if (!res || !res.ok) {
      setPhase("ready", "local");
      // Nothing is lost: the user's own words go straight back.
      if (lastOriginal != null) writeText(target, lastOriginal);
      if (res?.limitReached) {
        restingLabel = "Daily limit reached — sign in";
        showLimitCta(
          res.requiresSignIn
            ? "Daily limit reached — tap to sign in and keep going"
            : "Daily limit reached — resets at midnight UTC",
        );
        setPhase("idle");
        return;
      }
      toast(res?.error || "Patkan failed.");
      return;
    }

    const wrote = writeText(target, res.prompt);
    setPhase("ready", res.engine || "primary");
    if (typeof res.used === "number" && typeof res.limit === "number") {
      restingLabel = `End with // to turn into prompt · ${Math.max(0, res.limit - res.used)} left today`;
    }
    if (!wrote) {
      try {
        await navigator.clipboard.writeText(res.prompt);
        toast("This editor blocked the rewrite — the prompt is on your clipboard.");
      } catch {
        toast("Couldn't write here. Open the Patkan panel to copy the prompt.");
      }
      return;
    }

    pendingFeedback = true;
    lastResult = res.prompt;
    const prev = target.style.backgroundColor;
    target.style.transition = "background-color .4s ease";
    target.style.backgroundColor = "rgba(255,180,80,.16)";
    setTimeout(() => {
      target.style.backgroundColor = prev;
    }, 600);
    if (res.assumptions?.length) toast("Assumed: " + res.assumptions.join(" · "));
    // Undo stays until the user sends or starts a new transform — no timer.
    showChip(true);
  }


  /* ---------- wiring ---------- */

  function findComposer(node) {
    if (!node) return null;
    for (const sel of host.selectors) {
      if (node.matches?.(sel)) return node;
      const closest = node.closest?.(sel);
      if (closest) return closest;
    }
    return null;
  }

  document.addEventListener(
    "focusin",
    (e) => {
      const el = findComposer(e.target);
      if (el) {
        target = el;
        maybeShowPill();
      }
    },
    true,
  );

  document.addEventListener(
    "focusout",
    () => {
      setTimeout(() => {
        if (!busy && document.activeElement !== target && !tip?.matches(":hover")) showPill(false);
      }, 200);
    },
    true,
  );

  function maybeShowPill() {
    if (!target) return;
    const text = readText(target).trim();
    showPill(text.length >= 3 || siteOff || !!chip?.classList.contains("show"));
  }

  /* Trigger guards. `//` at the end of a real sentence fires Patkan; `//`
     inside a URL (https://…), after a backslash escape (\//), or mid-word
     (a//b) must not. The trailing slashes are stripped immediately so Enter
     cannot submit untransformed text during the short idle window. */
  const TRIGGER_AT_END = /(?<![:\\/])\/\/[ \t]*$/;
  const IDLE_MS = 150;
  let idleTimer = null;
  let pendingCleanText = null;

  function shouldTrigger(text) {
    if (!TRIGGER_AT_END.test(text)) return false;
    const before = text.replace(/\/\/[ \t]*$/, "");
    if (/\\$/.test(before)) return false; // escaped: \// never fires
    // Only the word glued to the trigger is checked: "https://x.com//" or
    // "a//b//" must not fire, but a link earlier in the prompt must not block it.
    const lastToken = (before.match(/\S*$/) || [""])[0];
    if (lastToken.includes("//")) return false;
    // Any real text qualifies: a lone word or short fragment is exactly the
    // "rough thought" Patkan exists for. Only truly empty input is refused.
    return before.trim().length >= 3;
  }

  function stripTrigger(text) {
    return text.replace(/\/\/[ \t]*$/, "");
  }


  document.addEventListener(
    "input",
    (e) => {
      const el = findComposer(e.target);
      if (!el) return;
      target = el;
      maybeShowPill();

      const text = readText(el);

      if (!siteOff && shouldTrigger(text)) {
        if (idleTimer) clearTimeout(idleTimer);
        const clean = stripTrigger(text);
        writeText(el, clean);
        lastOriginal = clean;
        pendingCleanText = clean;
        idleTimer = setTimeout(() => {
          idleTimer = null;
          if (target === el && pendingCleanText) {
            const current = readText(el).trimEnd();
            if (current === pendingCleanText.trimEnd()) run(pendingCleanText);
            pendingCleanText = null;
          }
        }, IDLE_MS);
        return;
      }

      if (pendingCleanText) {
        const current = text.trimEnd();
        if (current !== pendingCleanText.trimEnd()) {
          pendingCleanText = null;
          if (idleTimer) clearTimeout(idleTimer);
          idleTimer = null;
        }
      }
    },
    true,
  );


  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape" && busy) {
        e.preventDefault();
        cancel();
        return;
      }
      if (e.key === "Enter" && !e.shiftKey && pendingCleanText) {
        const el = findComposer(e.target);
        if (el === target) {
          e.preventDefault();
          e.stopPropagation();
          if (idleTimer) clearTimeout(idleTimer);
          idleTimer = null;
          run(pendingCleanText);
          pendingCleanText = null;
          return;
        }
      }
      if (busy && e.key === "Enter" && !e.shiftKey && !sendAnyway) {
        const el = findComposer(e.target);
        if (el === target) {
          e.preventDefault();
          e.stopPropagation();
          toast("Almost there — Patkan is still sharpening this prompt.");
          showSendAnyway();
          return;
        }
      }
      if (!busy && e.key === "Enter" && !e.shiftKey && pendingFeedback) {
        const el = findComposer(e.target);
        // Sent with the rewrite in place = the rewrite was accepted.
        if (el === target) {
          reportFeedback(true);
          lastOriginal = null;
          lastResult = null;
          showChip(false);
        }
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && lastOriginal != null) {
        const el = findComposer(document.activeElement);
        if (el === target) {
          e.preventDefault();
          undo();
        }
      }
    },
    true,
  );

  window.addEventListener("scroll", () => place(target), true);
  window.addEventListener("resize", () => place(target));

  // Show the remaining allowance before the user hits the wall, not after.
  chrome.runtime
    .sendMessage({ type: "PATKAN_FETCH_USAGE" })
    .then((usage) => {
      if (usage && typeof usage.remaining === "number") {
        restingLabel = `End with // to turn into prompt · ${usage.remaining} left today`;
      }
    })
    .catch(() => {});


  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === "PATKAN_INSERT" && target) {
      lastOriginal = readText(target);
      const ok = writeText(target, msg.payload.text);
      if (!ok) {
        track("injection_failed", { reason: "write-failed" });
        toast("Couldn't insert here — the prompt is still in the panel.");
      }
      else showChip(true);
    }
  });
})();
