/* Patkan content script. No ES imports: content scripts are classic scripts. */
(() => {
  "use strict";

  const HOSTS = [
    {
      id: "chatgpt",
      match: /(^|\.)chatgpt\.com$|(^|\.)chat\.openai\.com$/,
      selectors: ["#prompt-textarea", "div.ProseMirror[contenteditable='true']", "textarea[data-id]"],
    },
    {
      id: "claude",
      match: /(^|\.)claude\.ai$/,
      selectors: ["div.ProseMirror[contenteditable='true']", "div[contenteditable='true']"],
    },
    {
      id: "gemini",
      match: /(^|\.)gemini\.google\.com$/,
      selectors: ["div.ql-editor[contenteditable='true']", "rich-textarea div[contenteditable='true']"],
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

  function setBusy(on) {
    busy = on;
    ensureUI();
    pill.querySelector(".ico").innerHTML = on ? '<span class="spin">◠</span>' : "✦";
    pill.querySelector(".lbl").textContent = on ? "Patkan…" : "Type // to Patkan";
    if (target) target.style.opacity = on ? "0.55" : "";
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

  /* ---------- core action ---------- */

  function undo() {
    if (target && lastOriginal != null) {
      writeText(target, lastOriginal);
      lastOriginal = null;
      showChip(false);
    }
  }

  async function run() {
    if (busy || !target) return;
    const raw = readText(target).replace(/\/\/\s*$/, "").trim();
    if (raw.length < 3) return;

    lastOriginal = readText(target);
    setBusy(true);
    showChip(false);

    const settings = await chrome.runtime.sendMessage({ type: "PATKAN_GET_SETTINGS" });
    const res = await chrome.runtime.sendMessage({
      type: "PATKAN_TRANSFORM",
      payload: { text: raw, persona: settings?.persona },
    });

    setBusy(false);

    if (!res || !res.ok) {
      const msg = res?.error || "Patkan failed.";
      toast(res?.requiresSignIn ? msg + " Open the Patkan panel to sign in." : msg);
      return;
    }

    const wrote = writeText(target, res.prompt);
    if (!wrote) {
      try {
        await navigator.clipboard.writeText(res.prompt);
        toast("This editor blocked the rewrite — the prompt is on your clipboard.");
      } catch {
        toast("Couldn't write here. Open the Patkan panel to copy the prompt.");
      }
      return;
    }

    const prev = target.style.backgroundColor;
    target.style.transition = "background-color .4s ease";
    target.style.backgroundColor = "rgba(255,180,80,.16)";
    setTimeout(() => {
      target.style.backgroundColor = prev;
    }, 600);
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
