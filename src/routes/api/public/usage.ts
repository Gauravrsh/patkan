import { createFileRoute } from "@tanstack/react-router";

import { dailyLimitFor } from "@/lib/patkan-core";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, authorization, x-patkan-device",
  "Access-Control-Max-Age": "86400",
};

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
    return ((await res.json()) as { id?: string }).id ?? null;
  } catch {
    return null;
  }
}

/** Read-only allowance check so the UI can show "N left today" before the wall. */
export const Route = createFileRoute("/api/public/usage")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: CORS_HEADERS }),
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const deviceId = (
          url.searchParams.get("deviceId") ?? request.headers.get("x-patkan-device") ?? ""
        ).slice(0, 80);
        const userId = await resolveUserId(request.headers.get("authorization"));
        if (!userId && !deviceId) {
          return new Response(JSON.stringify({ error: "Missing device identifier." }), {
            status: 400,
            headers: { "content-type": "application/json", ...CORS_HEADERS },
          });
        }

        const subjectKey = userId ? `user:${userId}` : `device:${deviceId}`;
        const limit = dailyLimitFor(Boolean(userId));
        const day = new Date().toISOString().slice(0, 10);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data } = await supabaseAdmin
          .from("usage_counters")
          .select("count")
          .eq("subject_key", subjectKey)
          .eq("day", day)
          .maybeSingle();

        const used = data?.count ?? 0;
        return new Response(
          JSON.stringify({
            used,
            limit,
            remaining: Math.max(0, limit - used),
            signedIn: Boolean(userId),
            day,
          }),
          {
            headers: { "content-type": "application/json", "cache-control": "no-store", ...CORS_HEADERS },
          },
        );
      },
    },
  },
});
