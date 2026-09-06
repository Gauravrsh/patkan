import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface DayPoint {
  day: string;
  ghost: number;
  signedIn: number;
}

export interface Breakdown {
  key: string;
  count: number;
}

export interface EngineStat {
  engine: string;
  count: number;
  p50: number | null;
  p95: number | null;
  ttfbP50: number | null;
}

export interface BusinessStats {
  totalUsers: number;
  newUsers: number;
  activeSignedIn: number;
  activeGhostDevices: number;
  returningSubjects: number;
  frameworksTotal: number;
  frameworksNew: number;
  surfaces: Breakdown[];
}

export interface AdminStats {
  windowDays: number;
  total: number;
  perDay: DayPoint[];
  cacheHitRate: number;
  engines: EngineStat[];
  errorRate: number;
  emptyRate: number;
  limitedCount: number;
  acceptanceRate: number | null;
  acceptanceSample: number;
  hosts: Breakdown[];
  personas: Breakdown[];
  dialects: Breakdown[];
  ghostWalls: number;
  ghostWallDevices: number;
  estimatedUsd: number;
  business: BusinessStats;
}


function percentile(values: number[], p: number): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return Math.round(sorted[idx]!);
}

function topCounts(values: (string | null)[], limit = 8): Breakdown[] {
  const map = new Map<string, number>();
  for (const v of values) {
    if (!v) continue;
    map.set(v, (map.get(v) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** Rough per-million-token rates for the engines Patkan calls. */
const RATES: Record<string, { in: number; out: number }> = {
  primary: { in: 0.024, out: 0.104 },
  fallback: { in: 0.048, out: 0.32 },
  local: { in: 0, out: 0 },
};

export const getAdminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { days?: number } | undefined) => ({
    days: Math.min(90, Math.max(1, input?.days ?? 14)),
  }))
  .handler(async ({ data, context }): Promise<AdminStats> => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError) throw new Error("Could not verify access.");
    if (!isAdmin) throw new Error("Forbidden");

    const since = new Date(Date.now() - data.days * 86400000).toISOString();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("transform_events")
      .select(
        "created_at, subject_kind, subject_hash, host, surface, persona, dialect, engine, cached, input_chars, output_chars, latency_ms, ttfb_ms, outcome, accepted",
      )
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(20000);
    if (error) throw new Error("Could not load analytics.");

    const events = rows ?? [];
    const total = events.length;

    const dayMap = new Map<string, DayPoint>();
    for (const e of events) {
      const day = e.created_at.slice(0, 10);
      const point = dayMap.get(day) ?? { day, ghost: 0, signedIn: 0 };
      if (e.subject_kind === "user") point.signedIn += 1;
      else point.ghost += 1;
      dayMap.set(day, point);
    }

    const served = events.filter((e) => e.outcome === "ok");
    const cacheHits = served.filter((e) => e.cached).length;

    const engineIds = [...new Set(served.map((e) => e.engine ?? "unknown"))];
    const engines: EngineStat[] = engineIds
      .map((id) => {
        const subset = served.filter((e) => (e.engine ?? "unknown") === id);
        const lat = subset.map((e) => e.latency_ms).filter((n): n is number => typeof n === "number");
        const ttfb = subset.map((e) => e.ttfb_ms).filter((n): n is number => typeof n === "number");
        return {
          engine: id,
          count: subset.length,
          p50: percentile(lat, 50),
          p95: percentile(lat, 95),
          ttfbP50: percentile(ttfb, 50),
        };
      })
      .sort((a, b) => b.count - a.count);

    const rated = events.filter((e) => typeof e.accepted === "boolean");
    const accepted = rated.filter((e) => e.accepted).length;

    const walls = events.filter((e) => e.outcome === "limited" && e.subject_kind === "device");

    let estimatedUsd = 0;
    for (const e of served) {
      if (e.cached) continue;
      const rate = RATES[e.engine ?? "primary"] ?? RATES["primary"]!;
      // ~4 characters per token, plus the meta-prompt overhead already in input_chars.
      estimatedUsd += ((e.input_chars + 1200) / 4 / 1e6) * rate.in;
      estimatedUsd += (e.output_chars / 4 / 1e6) * rate.out;
    }

    return {
      windowDays: data.days,
      total,
      perDay: [...dayMap.values()].sort((a, b) => a.day.localeCompare(b.day)),
      cacheHitRate: served.length ? cacheHits / served.length : 0,
      engines,
      errorRate: total ? events.filter((e) => e.outcome === "error").length / total : 0,
      emptyRate: total ? events.filter((e) => e.outcome === "empty").length / total : 0,
      limitedCount: events.filter((e) => e.outcome === "limited").length,
      acceptanceRate: rated.length ? accepted / rated.length : null,
      acceptanceSample: rated.length,
      hosts: topCounts(events.map((e) => e.host)),
      personas: topCounts(events.map((e) => e.persona)),
      dialects: topCounts(events.map((e) => e.dialect)),
      ghostWalls: walls.length,
      ghostWallDevices: new Set(walls.map((e) => e.subject_hash)).size,
      estimatedUsd: Math.round(estimatedUsd * 10000) / 10000,
    };
  });

export const getMyAdminAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: Boolean(data) };
  });
