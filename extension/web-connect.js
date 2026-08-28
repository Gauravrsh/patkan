/* Runs on the Patkan web app. Receives the session handed over by /connect. */
window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  const data = event.data;
  if (!data || data.type !== "PATKAN_SESSION") return;
  chrome.runtime.sendMessage({ type: "PATKAN_SET_SESSION", payload: data.payload }, () => {
    window.postMessage({ type: "PATKAN_SESSION_ACK" }, window.location.origin);
  });
});

// Let the page know the extension is installed.
window.postMessage({ type: "PATKAN_EXTENSION_READY" }, window.location.origin);
