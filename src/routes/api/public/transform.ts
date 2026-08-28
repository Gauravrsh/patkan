import { createFileRoute } from "@tanstack/react-router";

import {
  DAILY_FREE_LIMIT,
  MAX_INPUT_CHARS,
  META_SYSTEM_PROMPT,
  buildMetaUserMessage,
  getPersona,
} from "@/lib/patkan-core";

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

export const Route = createFileRoute("/api/public/transform")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: CORS_HEADERS }),
      POST: async ({ request }) => {
        let payload: {
          text?: string;
          persona?: string;
          deviceId?: string;
          customInstruction?: string | null;
        };
        try {
          payload = (await request.json()) as typeof payload;
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

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return json({ error: "AI is not configured." }, 500);

        const persona = getPersona(payload.persona);

        let res: Response;
        try {
          res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "google/gemini-3.7-flash",
              messages: [
                { role: "system", content: META_SYSTEM_PROMPT },
                { role: "user", content: buildMetaUserMessage(text, persona, payload.customInstruction) },
              ],
            }),
          });
        } catch (err) {
          console.error("patkan transform: gateway fetch failed", err);
          return json({ error: "Could not reach the AI service. Try again." }, 502);
        }

        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          console.error("patkan transform: gateway error", res.status, detail);
          if (res.status === 429) {
            return json({ error: "The AI service is rate limited right now. Try again in a moment." }, 429);
          }
          if (res.status === 402) {
            return json({ error: "Patkan's AI credits are exhausted. The owner needs to top up." }, 402);
          }
          return json({ error: "The AI service failed to respond." }, 502);
        }

        const data = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        let prompt = (data.choices?.[0]?.message?.content ?? "").trim();
        prompt = prompt.replace(/^```[a-z]*\n?/i, "").replace(/```$/, "").trim();

        if (!prompt) {
          return json({ error: "The AI returned an empty prompt. Try again." }, 502);
        }

        if (existing) {
          await supabaseAdmin
            .from("usage_counters")
            .update({ count: used + 1, updated_at: new Date().toISOString() })
            .eq("id", existing.id);
        } else {
          await supabaseAdmin
            .from("usage_counters")
            .insert({ subject_key: subjectKey, day, count: 1 });
        }

        return json({
          prompt,
          persona: persona.id,
          used: used + 1,
          limit: DAILY_FREE_LIMIT,
          signedIn: Boolean(userId),
        });
      },
    },
  },
});
