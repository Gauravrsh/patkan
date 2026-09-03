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

export type EngineId = "primary" | "fallback" | "local";

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
      engine: "fallback",
      url: NOUS_URL,
      key: nousKey,
      model: process.env["PATKAN_ENGINE_SECONDARY_MODEL"] || DEFAULT_SECONDARY_MODEL,
      authHeader: "bearer",
    });
  }
  const lovableKey = process.env["LOVABLE_API_KEY"];
  if (lovableKey) {
    list.push({
      engine: "fallback",
      url: GATEWAY_URL,
      key: lovableKey,
      model: GATEWAY_MODEL,
      authHeader: "lovable",
    });
  }
  return list;
}

export function hasEngine(): boolean {
  return attempts().length > 0;
}

async function openStream(attempt: Attempt, messages: EngineMessage[]): Promise<Response | null> {
  try {
    const res = await fetch(attempt.url, {
      method: "POST",
      headers:
        attempt.authHeader === "bearer"
          ? { "content-type": "application/json", Authorization: `Bearer ${attempt.key}` }
          : {
              "content-type": "application/json",
              "Lovable-API-Key": attempt.key,
              "X-Lovable-AIG-SDK": "fetch",
            },
      body: JSON.stringify({ model: attempt.model, stream: true, messages }),
    });
    if (!res.ok || !res.body) {
      const detail = await res.text().catch(() => "");
      console.error(`patkan engine ${attempt.engine} (${attempt.model}) failed`, res.status, detail.slice(0, 400));
      return null;
    }
    return res;
  } catch (err) {
    console.error(`patkan engine ${attempt.engine} (${attempt.model}) unreachable`, err);
    return null;
  }
}

/**
 * Streams the compiled prompt from the first engine that answers. Yields the
 * engine id with every chunk so the route can forward it to the client.
 */
export async function* streamCompile(messages: EngineMessage[]): AsyncGenerator<EngineChunk> {
  const decoder = new TextDecoder();

  for (const attempt of attempts()) {
    const res = await openStream(attempt, messages);
    if (!res?.body) continue;

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
    }

    // Only fall through to the next engine when this one produced nothing at
    // all — a stream that broke mid-way has already reached the client.
    if (produced) return;
  }
}
