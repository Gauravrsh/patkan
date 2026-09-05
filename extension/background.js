import { DEFAULT_API_BASE, getPersona, localScaffold } from "./patkan-core.js";


const chrome = globalThis.browser ?? globalThis.chrome;

// Chromium (Chrome/Edge/Opera) has sidePanel; Firefox has sidebarAction instead.
const hasSidePanel = Boolean(chrome.sidePanel?.open);

chrome.runtime.onInstalled.addListener(() => {
  Promise.resolve(chrome.sidePanel?.setPanelBehavior?.({ openPanelOnActionClick: true })).catch(() => {});
});

// Firefox: the toolbar click has no side panel behaviour, so open the sidebar.
if (!hasSidePanel && chrome.action?.onClicked) {
  chrome.action.onClicked.addListener(() => {
    chrome.sidebarAction?.open?.();
  });
}

async function openPanel() {
  if (hasSidePanel) {
    const w = await chrome.windows.getCurrent();
    try {
      await chrome.sidePanel.open({ windowId: w.id });
    } catch {
      /* user gesture may have expired */
    }
    return;
  }
  try {
    await chrome.sidebarAction?.open?.();
  } catch {
    /* Firefox requires a user gesture; the toolbar button still works */
  }
}

async function getSettings() {
  const stored = await chrome.storage.local.get([
    "apiBase",
    "persona",
    "zeroDataMode",
    "session",
    "disabledHosts",
    "usage",
    "intensity",
  ]);
  return {
    apiBase: stored.apiBase || DEFAULT_API_BASE,
    persona: stored.persona || "product-manager",
    zeroDataMode: Boolean(stored.zeroDataMode),
    session: stored.session || null,
    disabledHosts: stored.disabledHosts || [],
    usage: stored.usage || null,
    intensity: stored.intensity || "standard",
  };
}

async function getDeviceId() {
  const { deviceId } = await chrome.storage.local.get("deviceId");
  if (deviceId) return deviceId;
  const id = crypto.randomUUID();
  await chrome.storage.local.set({ deviceId: id });
  return id;
}

async function transform({ text, persona, dialect, intensity, customInstruction, refinement, host, surface }) {
  const settings = await getSettings();
  const deviceId = await getDeviceId();
  const headers = { "content-type": "application/json", "x-patkan-device": deviceId };
  if (settings.session?.access_token) {
    headers.Authorization = "Bearer " + settings.session.access_token;
  }

  let res;
  try {
    res = await fetch(settings.apiBase.replace(/\/$/, "") + "/api/public/transform", {
      method: "POST",
      headers,
      body: JSON.stringify({
        text,
        persona: getPersona(persona || settings.persona).id,
        dialect: dialect || "markdown",
        intensity: intensity || settings.intensity,
        deviceId,
        customInstruction: customInstruction || null,
        refinement: refinement || null,
        host: host || null,
        surface: surface || "extension-panel",
        stream: false,
      }),
    });
  } catch {
    return { ok: false, error: "Can't reach Patkan. Check your connection." };
  }

  let data = {};
  try {
    data = await res.json();
  } catch {
    return { ok: false, error: "Patkan returned an unreadable response." };
  }

  if (!res.ok || !data.prompt) {
    if (typeof data.used === "number") {
      await chrome.storage.local.set({
        usage: { used: data.used, limit: data.limit, day: new Date().toISOString().slice(0, 10) },
      });
    }
    return {
      ok: false,
      error: data.error || "Transform failed.",
      limitReached: Boolean(data.limitReached),
      requiresSignIn: Boolean(data.requiresSignIn),
      used: data.used,
      limit: data.limit,
    };
  }

  await chrome.storage.local.set({ usage: { used: data.used, limit: data.limit, day: new Date().toISOString().slice(0, 10) } });
  return {
    ok: true,
    prompt: data.prompt,
    engine: data.engine || "local",
    assumptions: data.assumptions || [],
    clarifiers: data.clarifiers || [],
    used: data.used,
    limit: data.limit,
  };
}

/** Live allowance read, so "N left today" is right before the first transform. */
async function fetchUsage() {
  const settings = await getSettings();
  const deviceId = await getDeviceId();
  const headers = { "x-patkan-device": deviceId };
  if (settings.session?.access_token) {
    headers.Authorization = "Bearer " + settings.session.access_token;
  }
  try {
    const res = await fetch(
      settings.apiBase.replace(/\/$/, "") + "/api/public/usage?deviceId=" + encodeURIComponent(deviceId),
      { headers },
    );
    const data = await res.json();
    if (typeof data.used !== "number") return null;
    const usage = {
      used: data.used,
      limit: data.limit,
      remaining: data.remaining,
      signedIn: Boolean(data.signedIn),
      day: new Date().toISOString().slice(0, 10),
    };
    await chrome.storage.local.set({ usage });
    return usage;
  } catch {
    return null;
  }
}

/** Did the user keep the rewritten prompt? Only the client can know. */
async function reportFeedback(accepted) {
  const settings = await getSettings();
  const deviceId = await getDeviceId();
  const headers = { "content-type": "application/json", "x-patkan-device": deviceId };
  if (settings.session?.access_token) {
    headers.Authorization = "Bearer " + settings.session.access_token;
  }
  try {
    await fetch(settings.apiBase.replace(/\/$/, "") + "/api/public/feedback", {
      method: "POST",
      headers,
      body: JSON.stringify({ deviceId, accepted: Boolean(accepted) }),
    });
  } catch {
    /* telemetry is best-effort */
  }
}

async function openSignIn() {
  const settings = await getSettings();
  await chrome.tabs.create({ url: settings.apiBase.replace(/\/$/, "") + "/connect" });
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "PATKAN_TRANSFORM") {
    transform(msg.payload).then(sendResponse);
    return true;
  }
  if (msg?.type === "PATKAN_SCAFFOLD") {
    const p = msg.payload || {};
    sendResponse({ text: localScaffold(p.text, { persona: p.persona, dialect: p.dialect, intensity: p.intensity }) });
    return false;
  }
  if (msg?.type === "PATKAN_GET_SETTINGS") {
    getSettings().then(sendResponse);
    return true;
  }
  if (msg?.type === "PATKAN_FETCH_USAGE") {
    fetchUsage().then(sendResponse);
    return true;
  }
  if (msg?.type === "PATKAN_FEEDBACK") {
    reportFeedback(msg.payload?.accepted).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg?.type === "PATKAN_OPEN_SIGNIN") {
    openSignIn().then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg?.type === "PATKAN_SET_SESSION") {
    chrome.storage.local.set({ session: msg.payload }).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg?.type === "PATKAN_OPEN_PANEL") {
    openPanel().then(() => sendResponse({ ok: true }));
    return true;
  }
  return false;
});


chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "patkan-transform") return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) chrome.tabs.sendMessage(tab.id, { type: "PATKAN_TRIGGER" }).catch(() => {});
});
