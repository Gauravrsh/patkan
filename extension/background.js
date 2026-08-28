import { DEFAULT_API_BASE, getPersona } from "./patkan-core.js";

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
});

async function getSettings() {
  const stored = await chrome.storage.local.get([
    "apiBase",
    "persona",
    "zeroDataMode",
    "session",
    "disabledHosts",
    "usage",
  ]);
  return {
    apiBase: stored.apiBase || DEFAULT_API_BASE,
    persona: stored.persona || "product-manager",
    zeroDataMode: Boolean(stored.zeroDataMode),
    session: stored.session || null,
    disabledHosts: stored.disabledHosts || [],
    usage: stored.usage || null,
  };
}

async function getDeviceId() {
  const { deviceId } = await chrome.storage.local.get("deviceId");
  if (deviceId) return deviceId;
  const id = crypto.randomUUID();
  await chrome.storage.local.set({ deviceId: id });
  return id;
}

async function transform({ text, persona, customInstruction }) {
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
        deviceId,
        customInstruction: customInstruction || null,
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
    return {
      ok: false,
      error: data.error || "Transform failed.",
      limitReached: Boolean(data.limitReached),
      requiresSignIn: Boolean(data.requiresSignIn),
    };
  }

  await chrome.storage.local.set({ usage: { used: data.used, limit: data.limit, day: new Date().toISOString().slice(0, 10) } });
  return { ok: true, prompt: data.prompt, used: data.used, limit: data.limit };
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "PATKAN_TRANSFORM") {
    transform(msg.payload).then(sendResponse);
    return true;
  }
  if (msg?.type === "PATKAN_GET_SETTINGS") {
    getSettings().then(sendResponse);
    return true;
  }
  if (msg?.type === "PATKAN_SET_SESSION") {
    chrome.storage.local.set({ session: msg.payload }).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg?.type === "PATKAN_OPEN_PANEL") {
    chrome.windows.getCurrent().then((w) => {
      chrome.sidePanel.open({ windowId: w.id }).catch(() => {});
      sendResponse({ ok: true });
    });
    return true;
  }
  return false;
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "patkan-transform") return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) chrome.tabs.sendMessage(tab.id, { type: "PATKAN_TRIGGER" }).catch(() => {});
});
