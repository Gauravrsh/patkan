/**
 * Browser-side, text-free analytics emitter.
 *
 * Queues shape-only events and flushes them in small batches. Nothing the
 * visitor types is ever collected — only which section was on screen, for how
 * long, and which buttons were pressed.
 */

const ENDPOINT = "/api/public/events";
const SESSION_KEY = "patkan.session";
const VISITOR_KEY = "patkan.visitor";

export type PageEventName =
  | "page_viewed"
  | "section_seen"
  | "section_dwell"
  | "scroll_depth"
  | "playground_input_started"
  | "playground_compiled"
  | "playground_copied"
  | "download_clicked"
  | "privacy_modal_viewed"
  | "share_clicked"
  | "nav_clicked"
  | "exit_section";

interface QueuedEvent {
  event: PageEventName;
  section?: string;
  path?: string;
  value?: number;
  device?: "mobile" | "desktop";
  referrerHost?: string | undefined;
  meta?: Record<string, string | number | boolean>;
}

let queue: QueuedEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let wired = false;

function optedOut(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.doNotTrack === "1" || (window as unknown as { doNotTrack?: string }).doNotTrack === "1";
}

function randomId(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function readId(storage: Storage, key: string): string {
  const existing = storage.getItem(key);
  if (existing) return existing;
  const fresh = randomId();
  storage.setItem(key, fresh);
  return fresh;
}

function ids(): { sessionId: string; subject: string } | null {
  try {
    return {
      sessionId: readId(sessionStorage, SESSION_KEY),
      subject: readId(localStorage, VISITOR_KEY),
    };
  } catch {
    return null;
  }
}

function send(events: QueuedEvent[], beacon: boolean) {
  const id = ids();
  if (!id || events.length === 0) return;
  const body = JSON.stringify({ ...id, events });
  try {
    if (beacon && navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }));
      return;
    }
    void fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* analytics must never break the page */
  }
}

export function flushEvents(beacon = false) {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (queue.length === 0) return;
  const batch = queue;
  queue = [];
  send(batch, beacon);
}

export function trackEvent(
  event: PageEventName,
  detail: Omit<QueuedEvent, "event"> = {},
): void {
  if (typeof window === "undefined" || optedOut()) return;

  queue.push({
    event,
    path: window.location.pathname,
    device: window.innerWidth < 768 ? "mobile" : "desktop",
    ...detail,
  });

  if (!wired) {
    wired = true;
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flushEvents(true);
    });
    window.addEventListener("pagehide", () => flushEvents(true));
  }

  if (queue.length >= 10) {
    flushEvents();
    return;
  }
  if (!timer) timer = setTimeout(() => flushEvents(), 5000);
}

/** Referrer host, without the path (which can carry query text). */
export function referrerHost(): string | undefined {
  try {
    return document.referrer ? new URL(document.referrer).hostname : undefined;
  } catch {
    return undefined;
  }
}
