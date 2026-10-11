import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface EventCount {
  event: string;
  source: "website" | "extension";
  d1: number;
  d7: number;
  d30: number;
  all: number;
}

export interface RecentEvent {
  at: string;
  source: "website" | "extension";
  event: string;
  where: string | null;
  section: string | null;
  device: string | null;
}

export interface EventStats {
  generatedAt: string;
  counts: EventCount[];
  recent: RecentEvent[];
  transforms: { d1: number; d7: number; d30: number; all: number };
}

/** Admin-only, query-on-visit: reads the raw event tables every time the page opens. */
export const getEventStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<EventStats> => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError) throw new Error("Could not verify access.");
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const now = Date.now();
    const since = (days: number) => new Date(now - days * 86400000).toISOString();

    const [pageRes, extRes, pageRecent, extRecent, trRes] = await Promise.all([
      supabaseAdmin.from("page_events").select("event, created_at").limit(100000),
      supabaseAdmin.from("extension_events").select("event, created_at").limit(100000),
      supabaseAdmin
        .from("page_events")
        .select("created_at, event, path, section, device")
        .order("created_at", { ascending: false })
        .limit(50),
      supabaseAdmin
        .from("extension_events")
        .select("created_at, event, host, surface")
        .order("created_at", { ascending: false })
        .limit(50),
      supabaseAdmin.from("transform_events").select("created_at").limit(100000),
    ]);
    const firstError = [pageRes, extRes, pageRecent, extRecent, trRes].find((r) => r.error)?.error;
    if (firstError) throw new Error("Could not read events.");

    const t1 = since(1);
    const t7 = since(7);
    const t30 = since(30);

    const tally = (rows: { event: string; created_at: string }[], source: EventCount["source"]) => {
      const map = new Map<string, EventCount>();
      for (const r of rows) {
        const c = map.get(r.event) ?? { event: r.event, source, d1: 0, d7: 0, d30: 0, all: 0 };
        c.all++;
        if (r.created_at >= t30) c.d30++;
        if (r.created_at >= t7) c.d7++;
        if (r.created_at >= t1) c.d1++;
        map.set(r.event, c);
      }
      return [...map.values()].sort((a, b) => b.all - a.all);
    };

    const recent: RecentEvent[] = [
      ...(pageRecent.data ?? []).map((r) => ({
        at: r.created_at,
        source: "website" as const,
        event: r.event,
        where: r.path,
        section: r.section,
        device: r.device,
      })),
      ...(extRecent.data ?? []).map((r) => ({
        at: r.created_at,
        source: "extension" as const,
        event: r.event,
        where: r.host ?? r.surface,
        section: null,
        device: null,
      })),
    ]
      .sort((a, b) => (a.at < b.at ? 1 : -1))
      .slice(0, 50);

    const tr = trRes.data ?? [];
    return {
      generatedAt: new Date(now).toISOString(),
      counts: [...tally(pageRes.data ?? [], "website"), ...tally(extRes.data ?? [], "extension")],
      recent,
      transforms: {
        d1: tr.filter((r) => r.created_at >= t1).length,
        d7: tr.filter((r) => r.created_at >= t7).length,
        d30: tr.filter((r) => r.created_at >= t30).length,
        all: tr.length,
      },
    };
  });
