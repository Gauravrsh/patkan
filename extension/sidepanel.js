import {
  PERSONAS,
  DIALECTS,
  INTENSITIES,
  DEFAULT_API_BASE,
  dialectForHost,
  localScaffold,
} from "./patkan-core.js";


const chrome = globalThis.browser ?? globalThis.chrome;

const $ = (id) => document.getElementById(id);
let persona = "auto";
let dialect = "markdown";
let intensity = "standard";
let output = "";

function renderChips(containerId, items, current, onPick) {
  const el = $(containerId);
  el.innerHTML = "";
  for (const item of items) {
    const b = document.createElement("button");
    b.textContent = item.label;
    b.setAttribute("aria-pressed", String(item.id === current));
    b.addEventListener("click", () => onPick(item.id));
    el.appendChild(b);
  }
}

function renderControls() {
  renderChips("personas", PERSONAS, persona, async (id) => {
    persona = id;
    await chrome.storage.local.set({ persona });
    renderControls();
  });
  renderChips("dialects", DIALECTS, dialect, (id) => {
    dialect = id;
    renderControls();
  });
  renderChips("intensities", INTENSITIES, intensity, async (id) => {
    intensity = id;
    await chrome.storage.local.set({ intensity });
    renderControls();
  });
}

function setUsage(used, limit) {
  if (typeof used !== "number" || typeof limit !== "number") return;
  $("usage").textContent = `${Math.max(0, limit - used)} left today`;
}


async function loadTemplates(settings) {
  if (!settings.session?.access_token) {
    $("note").innerHTML =
      'Running in ghost mode. <a href="#" id="signin">Connect an account</a> for saved frameworks.';
    $("signin")?.addEventListener("click", (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: (settings.apiBase || DEFAULT_API_BASE) + "/connect" });
    });
    return;
  }
  try {
    const res = await fetch(
      (settings.apiBase || DEFAULT_API_BASE).replace(/\/$/, "") + "/api/public/templates",
      { headers: { Authorization: "Bearer " + settings.session.access_token } },
    );
    const data = await res.json();
    for (const t of data.templates || []) {
      const o = document.createElement("option");
      o.value = t.instruction || "";
      o.textContent = t.name;
      $("template").appendChild(o);
    }
    $("note").textContent = "Signed in. Your saved frameworks are available above.";
  } catch {
    $("note").textContent = "Signed in, but frameworks couldn't load.";
  }
}

let activeHost = null;

async function init() {
  const settings = await chrome.runtime.sendMessage({ type: "PATKAN_GET_SETTINGS" });
  persona = settings?.persona || persona;
  intensity = settings?.intensity || intensity;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
      activeHost = new URL(tab.url).hostname;
      dialect = dialectForHost(activeHost);
    }
  } catch {
    /* keep the default dialect */
  }
  renderControls();
  if (settings?.usage) setUsage(settings.usage.used, settings.usage.limit);
  chrome.runtime.sendMessage({ type: "PATKAN_FETCH_USAGE" }).then((usage) => {
    if (usage) setUsage(usage.used, usage.limit);
  });
  loadTemplates(settings || {});
}

function showLimitNote(res) {
  $("note").innerHTML = "";
  const span = document.createElement("span");
  span.textContent = (res?.error || "Daily limit reached.") + " ";
  $("note").appendChild(span);
  if (res?.requiresSignIn) {
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = "Sign in to keep going";
    a.addEventListener("click", (e) => {
      e.preventDefault();
      chrome.runtime.sendMessage({ type: "PATKAN_OPEN_SIGNIN" });
    });
    $("note").appendChild(a);
  }
}

$("go").addEventListener("click", async () => {
  const text = $("input").value.trim();
  if (text.length < 3) return;
  $("go").disabled = true;
  $("go").textContent = "Sharpening…";
  $("assumed").textContent = "";
  $("clarifiers").innerHTML = "";
  $("copy").disabled = true;
  $("insert").disabled = true;
  // Beat 1: instant local draft, visibly provisional.
  $("out").textContent = localScaffold(text, { persona, dialect, intensity });
  $("out").style.opacity = "0.6";
  $("note").textContent = "Drafting… sharpening this, hold on.";
  const res = await chrome.runtime.sendMessage({
    type: "PATKAN_TRANSFORM",
    payload: {
      text,
      persona,
      dialect,
      intensity,
      customInstruction: $("template").value || null,
      host: activeHost,
      surface: "extension-panel",
    },
  });
  $("go").disabled = false;
  $("go").textContent = "Patkan it";
  $("out").style.opacity = "1";
  if (!res?.ok) {
    if (res?.limitReached) {
      showLimitNote(res);
      setUsage(res.used, res.limit);
      $("out").textContent = "";
      return;
    }
    $("note").textContent = res?.error || "Transform failed.";
    $("copy").disabled = false;
    $("insert").disabled = false;
    return;
  }

  output = res.prompt;
  $("out").textContent = output;
  $("note").textContent =
    res.engine === "primary"
      ? "Ready"
      : res.engine === "fallback"
        ? "Ready — backup engine"
        : "Ready — offline draft";
  $("copy").disabled = false;
  $("insert").disabled = false;
  if (res.assumptions?.length) $("assumed").textContent = "Assumed: " + res.assumptions.join(" · ");
  for (const c of res.clarifiers || []) {
    const b = document.createElement("button");
    b.textContent = "+ " + c.label;
    b.addEventListener("click", async () => {
      b.disabled = true;
      const again = await chrome.runtime.sendMessage({
        type: "PATKAN_TRANSFORM",
        payload: {
          text,
          persona,
          dialect,
          intensity,
          refinement: c.refinement,
          host: activeHost,
          surface: "extension-panel",
        },
      });
      b.disabled = false;
      if (again?.ok) {
        output = again.prompt;
        $("out").textContent = output;
        setUsage(again.used, again.limit);
      } else if (again?.limitReached) {
        showLimitNote(again);
      }
    });
    $("clarifiers").appendChild(b);
  }
  setUsage(res.used, res.limit);
});

$("copy").addEventListener("click", async () => {
  await navigator.clipboard.writeText(output);
  $("copy").textContent = "Copied";
  chrome.runtime.sendMessage({ type: "PATKAN_FEEDBACK", payload: { accepted: true } });
  setTimeout(() => ($("copy").textContent = "Copy"), 1400);
});

$("insert").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  chrome.tabs.sendMessage(tab.id, { type: "PATKAN_INSERT", payload: { text: output } }, () => {
    if (chrome.runtime.lastError) $("note").textContent = "Patkan doesn't run on this page.";
    else chrome.runtime.sendMessage({ type: "PATKAN_FEEDBACK", payload: { accepted: true } });
  });
});


$("options").addEventListener("click", () => chrome.runtime.openOptionsPage());

init();
