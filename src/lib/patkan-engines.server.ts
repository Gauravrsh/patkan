/**
 * Patkan's transform engines, in fallback order.
 *
 * 1. Primary (Nous Research inference API, qwen3.7-flash) — the prompt compiler.
 * 2. Quality fallback (Nous, glm-4.7-flash) — if the primary errors.
 * 3. Lovable AI gateway — silent fallback when Nous is down or rate limited.
 *
 * All endpoints are OpenAI-compatible, so one SSE reader serves them. The
 * caller receives deltas plus the id of the engine that actually produced
 * them, so the UI can label the result honestly.
 */

export type EngineId = "primary" | "secondary" | "gateway" | "fallback" | "local";

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
 * without a deploy; the constants are the current defaults.
 */
const DEFAULT_PRIMARY_MODEL = "qwen/qwen3.7-flash";
const DEFAULT_SECONDARY_MODEL = "z-ai/glm-4.7-flash";
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

function attemptKey(a: Attempt): string {
  return `${a.engine}:${a.model}`;
}

function isCoolingDown(a: Attempt): boolean {
  const until = cooldownUntil.get(attemptKey(a));
  if (!until) return false;
  if (Date.now() >= until) {
    cooldownUntil.delete(attemptKey(a));
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
  console.warn(`patkan engine ${a.engine} (${a.model}) cooling down for ${Math.round(ms / 1000)}s`);
}

function attempts(): Attempt[] {
  const list: Attempt[] = [];
  const nousKey = process.env["NOUS_API_KEY"];
  if (nousKey) {
    list.push({
      engine: "primary",
      url: NOUS_URL,
      key: nousKey,
      model: process.env["PATKAN_ENGINE_MODEL"] || DEFAULT_PRIMARY_MODEL,
      authHeader: "bearer",
    });
    list.push({
      engine: "secondary",
      url: NOUS_URL,
      key: nousKey,
      model: process.env["PATKAN_ENGINE_SECONDARY_MODEL"] || DEFAULT_SECONDARY_MODEL,
      authHeader: "bearer",
    });
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

/** Healthy engines first; a cooling-down engine is only a last resort. */
function orderedAttempts(): Attempt[] {
  const all = attempts();
  const warm = all.filter((a) => !isCoolingDown(a));
  const cold = all.filter((a) => isCoolingDown(a));
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
      // "At capacity" or an upstream wobble: stop paying the round trip for it.
      if (res.status === 429 || res.status >= 500) {
        startCooldown(attempt, res.headers.get("retry-after"));
      }
      return null;
    }
    return res;
  } catch (err) {
    console.error(`patkan engine ${attempt.engine} (${attempt.model}) unreachable`, err);
    startCooldown(attempt);
    return null;
  }
}

/**
 * Streams the compiled prompt from the first engine that answers. Yields the
 * engine id with every chunk so the route can forward it to the client.
 */
export async function* streamCompile(messages: EngineMessage[]): AsyncGenerator<EngineChunk> {
  const decoder = new TextDecoder();

  for (const attempt of orderedAttempts()) {
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
              if (!produced) clearDeadline();
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
