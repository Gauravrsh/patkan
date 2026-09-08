/**
 * Patkan's transform engines, in fallback order.
 *
 * 1. Primary (Nous, qwen3-next-80b-a3b-instruct) — best measured compile quality.
 * 2. Secondary (Nous, llama-4-maverick) — fastest, one quality point behind.
 * 3. Tertiary (Nous, glm-4.5-air) — cheapest safety net.
 * 4. Quick (Nous, glm-4.7-flash) — the sub-2s condensed mode, tried first there.
 * 5. Lovable AI gateway — silent last resort when Nous is down or rate limited.
 *
 * The system block is byte-identical on every call and always the first
 * message, so providers that price cached prefix reads (the GLM engines) bill
 * the instruction block at the cached rate automatically.
 *
 * All endpoints are OpenAI-compatible, so one SSE reader serves them. The
 * caller receives deltas plus the id of the engine that actually produced
 * them, so the UI can label the result honestly.
 */

export type EngineId =
  | "primary"
  | "secondary"
  | "tertiary"
  | "quick"
  | "gateway"
  | "fallback"
  | "local";


export interface EngineMessage {
  role: "system" | "user";
  content: string;
}

export interface EngineChunk {
  engine: EngineId;
  delta: string;
}

const NOUS_URL = "https://inference-api.nousresearch.com/v1/chat/completions";
const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

/**
 * Model catalogues rotate ids. The env vars let the engines be repointed
 * without a deploy; the constants are the current defaults, chosen on measured
 * quality-per-rupee: strongest first, fastest second, cheapest third.
 */
const DEFAULT_PRIMARY_MODEL = "qwen/qwen3-next-80b-a3b-instruct";
const DEFAULT_SECONDARY_MODEL = "meta-llama/llama-4-maverick";
const DEFAULT_TERTIARY_MODEL = "z-ai/glm-4.5-air";
const DEFAULT_QUICK_MODEL = "z-ai/glm-4.7-flash";
const GATEWAY_MODEL = "google/gemini-3.7-flash";


interface Attempt {
  engine: EngineId;
  url: string;
  key: string;
  model: string;
  authHeader: "bearer" | "lovable";
}

/**
 * An engine that just answered "at capacity" will almost certainly say the same
 * thing to the next request. Remembering that for a short while removes a dead
 * second from the front of every transform while the upstream is saturated.
 */
const COOLDOWN_MS = 120_000;
const MAX_COOLDOWN_MS = 600_000;
/** How long we wait for an engine's first word before moving to the next one. */
const FIRST_TOKEN_TIMEOUT_MS = 6_000;

const cooldownUntil = new Map<string, number>();

/**
 * Rolling per-engine capacity counters. A model that starts refusing traffic is
 * the single failure that made transforms slow last time; the health check and
 * the usage screen read these so it is visible the day it starts.
 */
export interface EngineHealth {
  engine: EngineId;
  model: string;
  attempts: number;
  rateLimited: number;
  errors: number;
  firstWordMs: number[];
  coolingDown: boolean;
}

const health = new Map<string, EngineHealth>();

function healthFor(a: Attempt): EngineHealth {
  const key = attemptKey(a);
  let entry = health.get(key);
  if (!entry) {
    entry = {
      engine: a.engine,
      model: a.model,
      attempts: 0,
      rateLimited: 0,
      errors: 0,
      firstWordMs: [],
      coolingDown: false,
    };
    health.set(key, entry);
  }
  return entry;
}

export function engineHealthSnapshot(): Array<
  Omit<EngineHealth, "firstWordMs"> & { firstWordMedianMs: number | null }
> {
  return [...health.values()].map((h) => {
    const sorted = [...h.firstWordMs].sort((a, b) => a - b);
    const median = sorted.length ? sorted[Math.floor(sorted.length / 2)]! : null;
    return {
      engine: h.engine,
      model: h.model,
      attempts: h.attempts,
      rateLimited: h.rateLimited,
      errors: h.errors,
      coolingDown: h.coolingDown,
      firstWordMedianMs: median,
    };
  });
}

function attemptKey(a: Attempt): string {
  return `${a.engine}:${a.model}`;
}

function isCoolingDown(a: Attempt): boolean {
  const until = cooldownUntil.get(attemptKey(a));
  if (!until) return false;
  if (Date.now() >= until) {
    cooldownUntil.delete(attemptKey(a));
    healthFor(a).coolingDown = false;
    return false;
  }
  return true;
}

function startCooldown(a: Attempt, retryAfter?: string | null) {
  const seconds = Number(retryAfter);
  const ms =
    Number.isFinite(seconds) && seconds > 0
      ? Math.min(MAX_COOLDOWN_MS, seconds * 1000)
      : COOLDOWN_MS;
  cooldownUntil.set(attemptKey(a), Date.now() + ms);
  healthFor(a).coolingDown = true;
  console.warn(`patkan engine ${a.engine} (${a.model}) cooling down for ${Math.round(ms / 1000)}s`);
}

function attempts(): Attempt[] {
  const list: Attempt[] = [];
  const nousKey = process.env["NOUS_API_KEY"];
  if (nousKey) {
    const nous = (engine: EngineId, model: string): Attempt => ({
      engine,
      url: NOUS_URL,
      key: nousKey,
      model,
      authHeader: "bearer",
    });
    list.push(nous("primary", process.env["PATKAN_ENGINE_MODEL"] || DEFAULT_PRIMARY_MODEL));
    list.push(
      nous("secondary", process.env["PATKAN_ENGINE_SECONDARY_MODEL"] || DEFAULT_SECONDARY_MODEL),
    );
    list.push(
      nous("tertiary", process.env["PATKAN_ENGINE_TERTIARY_MODEL"] || DEFAULT_TERTIARY_MODEL),
    );
    list.push(nous("quick", process.env["PATKAN_ENGINE_QUICK_MODEL"] || DEFAULT_QUICK_MODEL));
  }
  const lovableKey = process.env["LOVABLE_API_KEY"];
  if (lovableKey) {
    list.push({
      engine: "gateway",
      url: GATEWAY_URL,
      key: lovableKey,
      model: GATEWAY_MODEL,
      authHeader: "lovable",
    });
  }
  return list;
}

/**
 * Healthy engines first; a cooling-down engine is only a last resort. In quick
 * mode the fast, cheap engine leads and the quality engines back it up.
 */
function orderedAttempts(quick: boolean): Attempt[] {
  const all = attempts();
  const ranked = quick
    ? [...all.filter((a) => a.engine === "quick"), ...all.filter((a) => a.engine !== "quick")]
    : all;
  const warm = ranked.filter((a) => !isCoolingDown(a));
  const cold = ranked.filter((a) => isCoolingDown(a));
  return [...warm, ...cold];
}

export function hasEngine(): boolean {
  return attempts().length > 0;
}

async function openStream(
  attempt: Attempt,
  messages: EngineMessage[],
  signal: AbortSignal,
): Promise<Response | null> {
  healthFor(attempt).attempts += 1;
  try {
    const res = await fetch(attempt.url, {
      method: "POST",
      signal,
      headers:
        attempt.authHeader === "bearer"
          ? { "content-type": "application/json", Authorization: `Bearer ${attempt.key}` }
          : {
              "content-type": "application/json",
              "Lovable-API-Key": attempt.key,
              "X-Lovable-AIG-SDK": "fetch",
            },

      body: JSON.stringify({
        model: attempt.model,
        stream: true,
        messages,
        // Short rewrites don't need chain-of-thought; it only adds latency.
        ...(attempt.authHeader === "bearer" ? { reasoning: { enabled: false } } : {}),
      }),
    });
    if (!res.ok || !res.body) {
      const detail = await res.text().catch(() => "");
      console.error(`patkan engine ${attempt.engine} (${attempt.model}) failed`, res.status, detail.slice(0, 400));
      if (res.status === 429) healthFor(attempt).rateLimited += 1;
      else healthFor(attempt).errors += 1;
      // "At capacity" or an upstream wobble: stop paying the round trip for it.
      if (res.status === 429 || res.status >= 500) {
        startCooldown(attempt, res.headers.get("retry-after"));
      }
      return null;
    }
    return res;
  } catch (err) {
    console.error(`patkan engine ${attempt.engine} (${attempt.model}) unreachable`, err);
    healthFor(attempt).errors += 1;
    startCooldown(attempt);
    return null;
  }
}

/**
 * Streams the compiled prompt from the first engine that answers. Yields the
 * engine id with every chunk so the route can forward it to the client.
 */
export async function* streamCompile(
  messages: EngineMessage[],
  opts?: { quick?: boolean },
): AsyncGenerator<EngineChunk> {
  const decoder = new TextDecoder();

  for (const attempt of orderedAttempts(opts?.quick ?? false)) {
    const startedAt = Date.now();

    // The deadline covers only the wait for the first word. Once tokens flow we
    // never abort — the generation is already running and billed.
    const controller = new AbortController();
    let deadline: ReturnType<typeof setTimeout> | undefined = setTimeout(() => {
      console.warn(`patkan engine ${attempt.engine} (${attempt.model}) silent past first-word deadline`);
      startCooldown(attempt);
      controller.abort();
    }, FIRST_TOKEN_TIMEOUT_MS);
    const clearDeadline = () => {
      if (deadline !== undefined) {
        clearTimeout(deadline);
        deadline = undefined;
      }
    };

    const res = await openStream(attempt, messages, controller.signal);
    if (!res?.body) {
      clearDeadline();
      continue;
    }

    const reader = res.body.getReader();
    let buffer = "";
    let produced = false;

    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const chunk = trimmed.slice(5).trim();
          if (!chunk || chunk === "[DONE]") continue;
          try {
            const parsed = JSON.parse(chunk) as {
              choices?: Array<{ delta?: { content?: string } }>;
            };
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              if (!produced) {
                clearDeadline();
                const entry = healthFor(attempt);
                entry.firstWordMs.push(Date.now() - startedAt);
                if (entry.firstWordMs.length > 50) entry.firstWordMs.shift();
              }
              produced = true;
              yield { engine: attempt.engine, delta };
            }

          } catch {
            /* ignore a malformed chunk */
          }
        }
      }
    } catch (err) {
      console.error(`patkan engine ${attempt.engine} (${attempt.model}) stream broke`, err);
    } finally {
      clearDeadline();
    }

    // Only fall through to the next engine when this one produced nothing at
    // all — a stream that broke mid-way has already reached the client.
    if (produced) return;
  }
}
