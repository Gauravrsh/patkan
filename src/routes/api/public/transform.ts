import { createFileRoute } from "@tanstack/react-router";

import {
  DAILY_FREE_LIMIT,
  MAX_INPUT_CHARS,
  buildMetaSystemPrompt,
  buildMetaUserMessage,
  classifyLocal,
  getDialect,
  getPersona,
  splitMeta,
  type Intensity,
} from "@/lib/patkan-core";
import {
  hasEngine,
  streamCompile,
  type EngineId,
  type EngineMessage,
} from "@/lib/patkan-engines.server";


const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, authorization, x-patkan-device",
  "Access-Control-Max-Age": "86400",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...CORS_HEADERS },
  });
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

async function resolveUserId(authHeader: string | null): Promise<string | null> {
  const token = authHeader?.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return null;
  try {
    const res = await fetch(`${url}/auth/v1/user`, {
      headers: { apikey: key, Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const user = (await res.json()) as { id?: string };
    return user.id ?? null;
  } catch {
    return null;
  }
}

interface Payload {
  text?: string;
  persona?: string;
  dialect?: string;
  intensity?: Intensity;
  deviceId?: string;
  customInstruction?: string | null;
  refinement?: string | null;
  stream?: boolean;
}

/** Normalized exact-match cache key: identical sloppy inputs replay for free. */
async function cacheKey(input: {
  text: string;
  persona: string;
  dialect: string;
  intensity: string;
  customInstruction?: string | null | undefined;
  refinement?: string | null | undefined;
}): Promise<string> {
  const normalized = input.text.toLowerCase().trim().replace(/\s+/g, " ");
  const material = [
    normalized,
    input.persona,
    input.dialect,
    input.intensity,
    (input.customInstruction ?? "").toLowerCase().trim().replace(/\s+/g, " "),
    (input.refinement ?? "").toLowerCase().trim().replace(/\s+/g, " "),
  ].join("|");
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(material, "utf8").digest("hex");
}

export const Route = createFileRoute("/api/public/transform")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: CORS_HEADERS }),
      POST: async ({ request }) => {
        let payload: Payload;
        try {
          payload = (await request.json()) as Payload;
        } catch {
          return json({ error: "Invalid JSON body." }, 400);
        }

        const text = (payload.text ?? "").trim();
        if (!text) return json({ error: "Nothing to transform." }, 400);
        if (text.length > MAX_INPUT_CHARS) {
          return json({ error: `Input is too long (max ${MAX_INPUT_CHARS} characters).` }, 400);
        }

        const userId = await resolveUserId(request.headers.get("authorization"));
        const deviceId = (payload.deviceId ?? request.headers.get("x-patkan-device") ?? "").slice(0, 80);
        if (!userId && !deviceId) {
          return json({ error: "Missing device identifier." }, 400);
        }
        const subjectKey = userId ? `user:${userId}` : `device:${deviceId}`;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const day = today();

        const persona = getPersona(payload.persona);
        const dialect = getDialect(payload.dialect).id;
        const intensity: Intensity = payload.intensity ?? "standard";
        const { intent, complexity } = classifyLocal(text);
        const wantsStream = payload.stream !== false;

        // Exact-match cache: identical inputs replay instantly, free of quota.
        const hash = await cacheKey({
          text,
          persona: persona.id,
          dialect,
          intensity,
          customInstruction: payload.customInstruction,
          refinement: payload.refinement,
        });
        const { data: cached } = await supabaseAdmin
          .from("prompt_cache")
          .select("id, output_text, engine, hit_count")
          .eq("input_hash", hash)
          .maybeSingle();

        if (cached) {
          void supabaseAdmin
            .from("prompt_cache")
            .update({ hit_count: cached.hit_count + 1, last_hit_at: new Date().toISOString() })
            .eq("id", cached.id);
          const parsed = splitMeta(cached.output_text);
          if (parsed.prompt) {
            if (!wantsStream) {
              return json({
                ...parsed,
                dialect,
                intent,
                intensity,
                engine: cached.engine,
                cached: true,
                persona: persona.id,
                used: 0,
                limit: DAILY_FREE_LIMIT,
                signedIn: Boolean(userId),
              });
            }
            const encoder = new TextEncoder();
            const replay = new ReadableStream<Uint8Array>({
              start(controller) {
                const send = (event: unknown) =>
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
                send({ type: "meta", dialect, intent, intensity, persona: persona.id });
                send({ type: "engine", engine: cached.engine });
                send({ type: "delta", delta: cached.output_text });
                send({
                  type: "done",
                  ...parsed,
                  engine: cached.engine,
                  used: 0,
                  limit: DAILY_FREE_LIMIT,
                  signedIn: Boolean(userId),
                });
                controller.close();
              },
            });
            return new Response(replay, {
              headers: {
                "content-type": "text/event-stream",
                "cache-control": "no-store",
                connection: "keep-alive",
                ...CORS_HEADERS,
              },
            });
          }
        }

        const { data: existing } = await supabaseAdmin
          .from("usage_counters")
          .select("id, count")
          .eq("subject_key", subjectKey)
          .eq("day", day)
          .maybeSingle();

        const used = existing?.count ?? 0;
        if (used >= DAILY_FREE_LIMIT) {
          return json(
            {
              error: userId
                ? `You've used all ${DAILY_FREE_LIMIT} transforms for today. The counter resets at midnight UTC.`
                : `You've used all ${DAILY_FREE_LIMIT} free transforms for today. Sign in to keep going tomorrow, or wait for the reset.`,
              limitReached: true,
              requiresSignIn: !userId,
              used,
              limit: DAILY_FREE_LIMIT,
            },
            429,
          );
        }

        if (!hasEngine()) return json({ error: "AI is not configured." }, 500);

        const messages: EngineMessage[] = [
          { role: "system", content: buildMetaSystemPrompt(dialect) },
          {
            role: "user",
            content: buildMetaUserMessage(text, persona, {
              intensity,
              intent,
              complexity,
              customInstruction: payload.customInstruction,
              refinement: payload.refinement,
            }),
          },
        ];

        const nextCount = used + 1;
        const bumpUsage = async () => {
          if (existing) {
            await supabaseAdmin
              .from("usage_counters")
              .update({ count: nextCount, updated_at: new Date().toISOString() })
              .eq("id", existing.id);
          } else {
            await supabaseAdmin.from("usage_counters").insert({ subject_key: subjectKey, day, count: 1 });
          }
        };

        if (!wantsStream) {
          let full = "";
          let engine: EngineId = "local";
          for await (const chunk of streamCompile(messages)) {
            engine = chunk.engine;
            full += chunk.delta;
          }
          const parsed = splitMeta(full);
          if (!parsed.prompt) return json({ error: "The AI returned an empty prompt. Try again." }, 502);
          await bumpUsage();
          await supabaseAdmin.from("prompt_cache").upsert(
            { input_hash: hash, input_text: text, output_text: full, engine },
            { onConflict: "input_hash" },
          );
          return json({
            ...parsed,
            dialect,
            intent,
            intensity,
            engine,
            persona: persona.id,
            used: nextCount,
            limit: DAILY_FREE_LIMIT,
            signedIn: Boolean(userId),
          });
        }

        const encoder = new TextEncoder();

        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            const send = (event: unknown) =>
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
            send({ type: "meta", dialect, intent, intensity, persona: persona.id });

            let full = "";
            let engine: EngineId = "local";
            try {
              for await (const chunk of streamCompile(messages)) {
                if (chunk.engine !== engine) {
                  engine = chunk.engine;
                  send({ type: "engine", engine });
                }
                full += chunk.delta;
                send({ type: "delta", delta: chunk.delta });
              }

              const parsed = splitMeta(full);
              if (!parsed.prompt) {
                send({ type: "error", error: "The AI returned an empty prompt. Try again." });
              } else {
                await bumpUsage();
                await supabaseAdmin.from("prompt_cache").upsert(
                  { input_hash: hash, input_text: text, output_text: full, engine },
                  { onConflict: "input_hash" },
                );
                send({
                  type: "done",
                  ...parsed,
                  engine,
                  used: nextCount,
                  limit: DAILY_FREE_LIMIT,
                  signedIn: Boolean(userId),
                });
              }
            } catch (err) {
              console.error("patkan transform: stream failed", err);
              send({ type: "error", error: "The stream broke mid-transform. Try again." });
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "content-type": "text/event-stream",
            "cache-control": "no-store",
            connection: "keep-alive",
            ...CORS_HEADERS,
          },
        });
      },
    },
  },
});

