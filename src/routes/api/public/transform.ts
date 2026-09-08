import { createFileRoute } from "@tanstack/react-router";

import {
  MAX_INPUT_CHARS,
  buildMetaSystemPrompt,
  buildMetaUserMessage,
  classifyLocal,
  dailyLimitFor,
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
import { recordEvent, type Outcome } from "@/lib/patkan-telemetry.server";
import {
  blockedResponse,
  classifyClient,
  consumeIpQuota,
  corsHeadersFor,
  IP_DAILY_CEILING,
} from "@/lib/patkan-access.server";



function jsonWith(body: unknown, status: number, cors: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...cors },
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
  host?: string | null;
  surface?: string | null;
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
      OPTIONS: ({ request }) =>
        new Response(null, { status: 204, headers: corsHeadersFor(request, "POST") }),
      POST: async ({ request }) => {
        const CORS_HEADERS = corsHeadersFor(request, "POST");
        const json = (body: unknown, status = 200) => jsonWith(body, status, CORS_HEADERS);
        if (classifyClient(request) === "blocked") return blockedResponse(request, "POST");
        const startedAt = Date.now();

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
        const subjectKind = userId ? "user" : "device";
        const limit = dailyLimitFor(Boolean(userId));
        const host = (payload.host ?? "").slice(0, 80) || null;
        const surface = (payload.surface ?? "web").slice(0, 40);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const day = today();

        const persona = getPersona(payload.persona);
        const dialect = getDialect(payload.dialect).id;
        const intensity: Intensity = payload.intensity ?? "standard";
        const { intent, complexity } = classifyLocal(text);
        const wantsStream = payload.stream !== false;

        // Awaited, never `void`: on the worker runtime a promise still in flight
        // when the response closes is dropped, which silently lost every
        // streamed transform from the record.
        const telemetry = (
          extra: Partial<Parameters<typeof recordEvent>[1]> & { outcome: Outcome },
        ) =>
          recordEvent(supabaseAdmin, {
            subjectKind,
            subjectKey,
            host,
            surface,
            persona: persona.id,
            dialect,
            intensity,
            intent,
            inputChars: text.length,
            latencyMs: Date.now() - startedAt,
            ...extra,
          });

        // When a ghost signs in mid-day, their device usage follows them so the
        // limit can't be reset by simply signing in.
        if (userId && deviceId) {
          void supabaseAdmin.rpc("merge_device_usage", {
            _device_key: `device:${deviceId}`,
            _user_key: subjectKey,
            _day: day,
          });
        }

        // Exact-match cache: identical inputs replay instantly, free of quota.
        const hash = await cacheKey({
          text,
          persona: persona.id,
          dialect,
          intensity,
          customInstruction: payload.customInstruction,
          refinement: payload.refinement,
        });
        // Both reads run together: back-to-back round trips were pure dead air
        // at the front of every transform.
        const [cacheRead, counterRead] = await Promise.all([
          supabaseAdmin
            .from("prompt_cache")
            .select("id, output_text, engine, hit_count")
            .eq("input_hash", hash)
            .maybeSingle(),
          supabaseAdmin
            .from("usage_counters")
            .select("count")
            .eq("subject_key", subjectKey)
            .eq("day", day)
            .maybeSingle(),
        ]);
        const cached = cacheRead.data;
        const usedBefore = counterRead.data?.count ?? 0;

        if (cached) {
          void supabaseAdmin
            .from("prompt_cache")
            .update({ hit_count: cached.hit_count + 1, last_hit_at: new Date().toISOString() })
            .eq("id", cached.id);
          const parsed = splitMeta(cached.output_text);
          if (parsed.prompt) {
            await telemetry({
              outcome: "ok",
              cached: true,
              engine: cached.engine,
              outputChars: parsed.prompt.length,
            });
            if (!wantsStream) {
              return json({
                ...parsed,
                dialect,
                intent,
                intensity,
                engine: cached.engine,
                cached: true,
                persona: persona.id,
                used: usedBefore,
                limit,
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
                  cached: true,
                  used: usedBefore,
                  limit,
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

        // Both allowance claims run together — the outcome is unchanged, only
        // the waiting is. Shared ceiling per IP stops new device ids from
        // multiplying the free allowance.
        const [ipAllowed, quotaRes] = await Promise.all([
          consumeIpQuota(supabaseAdmin, request, day),
          supabaseAdmin.rpc("consume_quota", {
            _subject_key: subjectKey,
            _day: day,
            _limit: limit,
          }),
        ]);

        const row = Array.isArray(quotaRes.data) ? quotaRes.data[0] : quotaRes.data;
        const allowed = Boolean(row?.allowed);
        const nextCount = row?.used ?? usedBefore;

        /** Give a claimed transform back when it never produced a prompt. */
        const refund = async () => {
          await supabaseAdmin
            .from("usage_counters")
            .update({ count: Math.max(0, nextCount - 1), updated_at: new Date().toISOString() })
            .eq("subject_key", subjectKey)
            .eq("day", day);
        };

        // The two allowance claims run together for speed, so the personal
        // counter may already be charged when the shared network wall refuses
        // the request. Hand it straight back — a refused request must never
        // cost someone a transform.
        if (!ipAllowed) {
          if (allowed) await refund();
          await telemetry({ outcome: "limited" });
          return json(
            {
              error: `This network has used its ${IP_DAILY_CEILING} Patkan transforms for today. The counter resets at midnight UTC.`,
              limitReached: true,
              used: usedBefore,
              limit,
            },
            429,
          );
        }

        if (quotaRes.error) {
          console.error("patkan quota: rpc failed", quotaRes.error);
          return json({ error: "Couldn't check your daily allowance. Try again." }, 500);
        }

        if (!allowed) {
          await telemetry({ outcome: "limited" });
          return json(
            {
              error: userId
                ? `You've used all ${limit} transforms for today. The counter resets at midnight UTC.`
                : `You've used all ${limit} free transforms for today. Sign in for ${dailyLimitFor(true)} a day, or wait for the reset.`,
              limitReached: true,
              requiresSignIn: !userId,
              used: nextCount,
              limit,
            },
            429,
          );
        }

        /** Give a claimed transform back when it never produced a prompt. */
        const refund = async () => {
          await supabaseAdmin
            .from("usage_counters")
            .update({ count: Math.max(0, nextCount - 1), updated_at: new Date().toISOString() })
            .eq("subject_key", subjectKey)
            .eq("day", day);
        };

        if (!hasEngine()) {
          await refund();
          await telemetry({ outcome: "error" });
          return json({ error: "AI is not configured." }, 500);
        }

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

        if (!wantsStream) {
          let full = "";
          let engine: EngineId = "local";
          let ttfb: number | undefined;
          for await (const chunk of streamCompile(messages, { quick: intensity === "light" })) {
            ttfb ??= Date.now() - startedAt;
            engine = chunk.engine;
            full += chunk.delta;
          }
          const parsed = splitMeta(full);
          if (!parsed.prompt) {
            await refund();
            await telemetry({ outcome: "empty", engine, ttfbMs: ttfb });
            return json({ error: "The AI returned an empty prompt. Try again." }, 502);
          }
          await supabaseAdmin.from("prompt_cache").upsert(
            { input_hash: hash, input_text: text, output_text: full, engine },
            { onConflict: "input_hash" },
          );
          await telemetry({
            outcome: "ok",
            engine,
            ttfbMs: ttfb,
            outputChars: parsed.prompt.length,
          });
          return json({
            ...parsed,
            dialect,
            intent,
            intensity,
            engine,
            persona: persona.id,
            used: nextCount,
            limit,
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
            let ttfb: number | undefined;
            try {
              for await (const chunk of streamCompile(messages, { quick: intensity === "light" })) {
                ttfb ??= Date.now() - startedAt;
                if (chunk.engine !== engine) {
                  engine = chunk.engine;
                  send({ type: "engine", engine });
                }
                full += chunk.delta;
                send({ type: "delta", delta: chunk.delta });
              }

              const parsed = splitMeta(full);
              if (!parsed.prompt) {
                await refund();
                await telemetry({ outcome: "empty", engine, ttfbMs: ttfb });
                send({ type: "error", error: "The AI returned an empty prompt. Try again." });
              } else {
                await supabaseAdmin.from("prompt_cache").upsert(
                  { input_hash: hash, input_text: text, output_text: full, engine },
                  { onConflict: "input_hash" },
                );
                await telemetry({
                  outcome: "ok",
                  engine,
                  ttfbMs: ttfb,
                  outputChars: parsed.prompt.length,
                });
                send({
                  type: "done",
                  ...parsed,
                  engine,
                  used: nextCount,
                  limit,
                  signedIn: Boolean(userId),
                });
              }
            } catch (err) {
              console.error("patkan transform: stream failed", err);
              await refund();
              await telemetry({ outcome: "error", engine, ttfbMs: ttfb });
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
