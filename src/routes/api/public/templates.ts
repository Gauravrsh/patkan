import { createFileRoute } from "@tanstack/react-router";

import { blockedResponse, classifyClient, corsHeadersFor } from "@/lib/patkan-access.server";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";



function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...CORS_HEADERS },
  });
}

export const Route = createFileRoute("/api/public/templates")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: CORS_HEADERS }),
      GET: async ({ request }) => {
        const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
        if (!token) return json({ error: "Sign in to load your frameworks." }, 401);

        const url = process.env["SUPABASE_URL"];
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
        if (!url || !key) return json({ error: "Backend is not configured." }, 500);

        // Acts as the signed-in user, so RLS scopes the rows.
        const supabase = createClient<Database>(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: {
            fetch: (input, init) => {
              const h = new Headers(init?.headers);
              h.set("apikey", key);
              h.set("Authorization", `Bearer ${token}`);
              return fetch(input, { ...init, headers: h });
            },
          },
        });

        const { data, error } = await supabase
          .from("prompt_templates")
          .select("id, title, system_instruction")
          .order("updated_at", { ascending: false })
          .limit(50);

        if (error) {
          console.error("patkan templates: read failed", error);
          return json({ error: "Could not load your frameworks." }, 502);
        }

        return json({
          templates: (data ?? []).map((t) => ({
            id: t.id,
            name: t.title,
            instruction: t.system_instruction,
          })),
        });
      },
    },
  },
});
