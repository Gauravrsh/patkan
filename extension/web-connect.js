/* Runs on the Patkan web app. Receives the session handed over by /connect. */
(() => {
  "use strict";
  const chrome = globalThis.browser ?? globalThis.chrome;

  window.addEventListener("message", (event) => {
    if (event.source !== window || event.origin !== window.location.origin) return;
    const data = event.data;
    if (!data || data.type !== "PATKAN_SESSION") return;
    Promise.resolve(chrome.runtime.sendMessage({ type: "PATKAN_SET_SESSION", payload: data.payload }))
      .catch(() => {})
      .then(() => window.postMessage({ type: "PATKAN_SESSION_ACK" }, window.location.origin));
  });

  // Let the page know the extension is installed.
  window.postMessage({ type: "PATKAN_EXTENSION_READY" }, window.location.origin);
})();
