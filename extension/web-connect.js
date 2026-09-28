/* Runs on the Patkan web app. Receives the session handed over by /connect. */
(() => {
  "use strict";
  const chrome = globalThis.browser ?? globalThis.chrome;
  const TRUSTED_ORIGINS = ["https://patkan.in", "https://www.patkan.in"];

  // Only accept a small, well-formed session object — never arbitrary data.
  function validSession(p) {
    if (!p || typeof p !== "object") return false;
    if (typeof p.access_token !== "string" || p.access_token.length > 8192) return false;
    if (p.refresh_token != null && (typeof p.refresh_token !== "string" || p.refresh_token.length > 1024)) return false;
    if (p.expires_at != null && typeof p.expires_at !== "number") return false;
    return JSON.stringify(p).length < 16384;
  }

  window.addEventListener("message", (event) => {
    if (event.source !== window || event.origin !== window.location.origin) return;
    if (!TRUSTED_ORIGINS.includes(event.origin)) return;
    const data = event.data;
    if (!data || data.type !== "PATKAN_SESSION") return;
    if (!validSession(data.payload)) return;
    Promise.resolve(chrome.runtime.sendMessage({ type: "PATKAN_SET_SESSION", payload: data.payload }))
      .catch(() => {})
      .then(() => window.postMessage({ type: "PATKAN_SESSION_ACK" }, window.location.origin));
  });

  // Let the page know the extension is installed.
  window.postMessage({ type: "PATKAN_EXTENSION_READY" }, window.location.origin);
})();
