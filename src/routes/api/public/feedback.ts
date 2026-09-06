import { createFileRoute } from "@tanstack/react-router";

import { blockedResponse, classifyClient, corsHeadersFor } from "@/lib/patkan-access.server";

import { hashSubject } from "@/lib/patkan-telemetry.server";



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

/**
 * Acceptance reporting. Only the client knows whether the compiled prompt was
 * actually kept and sent, so the extension reports it against the subject's
 * most recent transform.
 */
export const Route = createFileRoute("/api/public/feedback")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: CORS_HEADERS }),
      POST: async ({ request }) => {
        let body: { deviceId?: string; accepted?: boolean };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return new Response(null, { status: 204, headers: CORS_HEADERS });
        }

        const userId = await resolveUserId(request.headers.get("authorization"));
        const deviceId = (body.deviceId ?? request.headers.get("x-patkan-device") ?? "").slice(0, 80);
        if (!userId && !deviceId) return new Response(null, { status: 204, headers: CORS_HEADERS });

        const subjectHash = await hashSubject(userId ? `user:${userId}` : `device:${deviceId}`);
        const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: latest } = await supabaseAdmin
          .from("transform_events")
          .select("id")
          .eq("subject_hash", subjectHash)
          .is("accepted", null)
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latest) {
          await supabaseAdmin
            .from("transform_events")
            .update({ accepted: Boolean(body.accepted) })
            .eq("id", latest.id);
        }

        return new Response(null, { status: 204, headers: CORS_HEADERS });
      },
    },
  },
});
