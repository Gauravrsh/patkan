/* Patkan content script. No ES imports: content scripts are classic scripts. */
(() => {
  "use strict";

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
      selectors: ["div.ql-editor[contenteditable='true']", "rich-textarea div[contenteditable='true']"],
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
  let restingLabel = "Type // to Patkan";

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

  function ensureUI() {
    if (pillHost) return;
    pillHost = document.createElement("div");
    pillHost.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;z-index:2147483646;";
    shadow = pillHost.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = `
      :host { all: initial; }
      .pill, .chip {
        position: fixed;
        font: 500 12px/1 ui-sans-serif, system-ui, -apple-system, sans-serif;
        border-radius: 999px;
        border: 1px solid rgba(120,90,60,.28);
        background: #fffaf3;
        color: #3a2c1e;
        box-shadow: 0 2px 10px rgba(60,40,20,.12);
        cursor: pointer;
        user-select: none;
        display: none;
        align-items: center;
        gap: 6px;
        padding: 6px 10px;
        transition: opacity .15s ease, transform .15s ease;
      }
      .pill.show, .chip.show { display: inline-flex; }
      .pill:hover { background: #fff3e3; }
      .spin { animation: sp .7s linear infinite; display:inline-block; }
      @keyframes sp { to { transform: rotate(360deg); } }
      .chip { gap: 4px; padding: 4px 6px; background: #fff; }
      .chip button {
        all: unset;
        cursor: pointer;
        padding: 3px 8px;
        border-radius: 999px;
        font: 500 11px/1 ui-sans-serif, system-ui, sans-serif;
        color: #3a2c1e;
      }
      .chip button:hover { background: #f2e7d8; }
    `;
    pill = document.createElement("div");
    pill.className = "pill";
    pill.innerHTML = '<span class="ico">✦</span><span class="lbl">Type // to Patkan</span>';
    pill.addEventListener("mousedown", (e) => {
      e.preventDefault();
      run();
    });

    chip = document.createElement("div");
    chip.className = "chip";
    const undoBtn = document.createElement("button");
    undoBtn.textContent = "Undo";
    undoBtn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      undo();
    });
    const panelBtn = document.createElement("button");
    panelBtn.textContent = "Open panel";
    panelBtn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      chrome.runtime.sendMessage({ type: "PATKAN_OPEN_PANEL" });
    });
    chip.append(undoBtn, panelBtn);

    shadow.append(style, pill, chip);
    document.documentElement.appendChild(pillHost);
  }

  function place(el) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    pill.style.left = Math.max(8, r.right - pill.offsetWidth - 12) + "px";
    pill.style.top = Math.max(8, r.bottom - pill.offsetHeight - 10) + "px";
    chip.style.left = Math.max(8, r.right - chip.offsetWidth - 12) + "px";
    chip.style.top = Math.max(8, r.top - chip.offsetHeight - 8) + "px";
  }

  function showPill(show, label) {
    ensureUI();
    pill.classList.toggle("show", show);
    if (label) pill.querySelector(".lbl").textContent = label;
    if (show) place(target);
  }

  function showChip(show) {
    ensureUI();
    chip.classList.toggle("show", show);
    if (show) place(target);
  }

  /* Beat labels. The user must never wonder whether Patkan is done. */
  function setPhase(phase, engine) {
    ensureUI();
    busy = phase === "drafting" || phase === "sharpening";
    const spinning = busy;
    pill.querySelector(".ico").innerHTML = spinning ? '<span class="spin">◠</span>' : "✦";
    let label = restingLabel;
    if (phase === "drafting") label = "Drafting…";
    else if (phase === "sharpening") label = "Sharpening — one moment";
    else if (phase === "ready") {
      label =
        engine === "primary"
          ? "Ready"
          : engine === "fallback"
            ? "Ready — backup engine"
            : "Ready — offline draft";
    }
    pill.querySelector(".lbl").textContent = label;
    pill.classList.toggle("show", busy || phase === "ready" || pill.classList.contains("show"));
    if (target) target.style.opacity = busy ? "0.55" : "";
    if (phase === "ready") {
      setTimeout(() => {
        if (!busy) pill.querySelector(".lbl").textContent = restingLabel;
      }, 1000);
    }
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
      lastOriginal = null;
      showChip(false);
      reportFeedback(false);
    }
  }

  /** The wall is a doorway, not a dead end: one tap opens sign-in. */
  function showLimitCta(message) {
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

  async function run() {
    if (busy || !target) return;
    const raw = readText(target).replace(/\/\/\s*$/, "").trim();
    if (raw.length < 3) return;

    lastOriginal = readText(target);
    sendAnyway = false;
    setPhase("drafting");
    showChip(false);

    const settings = await chrome.runtime.sendMessage({ type: "PATKAN_GET_SETTINGS" });

    // Progressive disclosure: a zero-network scaffold lands instantly so the
    // composer is never empty while the model works.
    const scaffold = await chrome.runtime.sendMessage({
      type: "PATKAN_SCAFFOLD",
      payload: { text: raw, persona: settings?.persona, dialect: host.dialect, intensity: settings?.intensity },
    });
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
      restingLabel = `Type // to Patkan · ${Math.max(0, res.limit - res.used)} left today`;
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
    const prev = target.style.backgroundColor;
    target.style.transition = "background-color .4s ease";
    target.style.backgroundColor = "rgba(255,180,80,.16)";
    setTimeout(() => {
      target.style.backgroundColor = prev;
    }, 600);
    if (res.assumptions?.length) toast("Assumed: " + res.assumptions.join(" · "));
    showChip(true);
    setTimeout(() => showChip(false), 8000);
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
        if (!busy && document.activeElement !== target) showPill(false);
      }, 200);
    },
    true,
  );

  function maybeShowPill() {
    if (!target) return;
    const words = readText(target).trim().split(/\s+/).filter(Boolean).length;
    showPill(words >= 5 && !busy);
  }

  document.addEventListener(
    "input",
    (e) => {
      const el = findComposer(e.target);
      if (!el) return;
      target = el;
      maybeShowPill();
      const text = readText(el);
      if (/\/\/\s*$/.test(text)) {
        run();
      }
    },
    true,
  );

  document.addEventListener(
    "keydown",
    (e) => {
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

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === "PATKAN_TRIGGER") run();
    if (msg?.type === "PATKAN_INSERT" && target) {
      lastOriginal = readText(target);
      const ok = writeText(target, msg.payload.text);
      if (!ok) toast("Couldn't insert here — the prompt is still in the panel.");
      else showChip(true);
    }
  });
})();
