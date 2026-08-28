import { PERSONAS, DEFAULT_API_BASE } from "./patkan-core.js";

const $ = (id) => document.getElementById(id);
let persona = "product-manager";
let output = "";

function renderPersonas() {
  $("personas").innerHTML = "";
  for (const p of PERSONAS) {
    const b = document.createElement("button");
    b.textContent = p.label;
    b.setAttribute("aria-pressed", String(p.id === persona));
    b.addEventListener("click", async () => {
      persona = p.id;
      await chrome.storage.local.set({ persona });
      renderPersonas();
    });
    $("personas").appendChild(b);
  }
}

function setUsage(used, limit) {
  if (typeof used === "number") $("usage").textContent = `${used}/${limit} today`;
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

async function init() {
  const settings = await chrome.runtime.sendMessage({ type: "PATKAN_GET_SETTINGS" });
  persona = settings?.persona || persona;
  renderPersonas();
  if (settings?.usage) setUsage(settings.usage.used, settings.usage.limit);
  loadTemplates(settings || {});
}

$("go").addEventListener("click", async () => {
  const text = $("input").value.trim();
  if (text.length < 3) return;
  $("go").disabled = true;
  $("go").textContent = "Patkan…";
  const res = await chrome.runtime.sendMessage({
    type: "PATKAN_TRANSFORM",
    payload: { text, persona, customInstruction: $("template").value || null },
  });
  $("go").disabled = false;
  $("go").textContent = "Patkan it";
  if (!res?.ok) {
    $("note").textContent = res?.error || "Transform failed.";
    return;
  }
  output = res.prompt;
  $("out").textContent = output;
  $("copy").disabled = false;
  $("insert").disabled = false;
  setUsage(res.used, res.limit);
});

$("copy").addEventListener("click", async () => {
  await navigator.clipboard.writeText(output);
  $("copy").textContent = "Copied";
  setTimeout(() => ($("copy").textContent = "Copy"), 1400);
});

$("insert").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  chrome.tabs.sendMessage(tab.id, { type: "PATKAN_INSERT", payload: { text: output } }, () => {
    if (chrome.runtime.lastError) $("note").textContent = "Patkan doesn't run on this page.";
  });
});

$("options").addEventListener("click", () => chrome.runtime.openOptionsPage());

init();
