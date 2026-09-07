import { createFileRoute } from "@tanstack/react-router";

import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

const THRESHOLDS = { errorRate: 0.05, p95Ms: 12000, primaryShare: 0.7 };

function percentile(values: number[], p: number): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return Math.round(sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))]!);
}

/**
 * Daily health digest. Nous/gateway failures fall through to the backup engine
 * silently, so this makes a degraded primary visible instead of invisible.
 */
export const Route = createFileRoute("/api/public/cron/health")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const unauthorized = await authenticateCronRequest(request);
        if (unauthorized) return unauthorized;

        const since = new Date(Date.now() - 86400000).toISOString();
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: rows, error } = await supabaseAdmin
          .from("transform_events")
          .select("engine, outcome, latency_ms, cached")
          .gte("created_at", since)
          .limit(20000);

        if (error) {
          return new Response(JSON.stringify({ error: "query failed" }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }

        const events = rows ?? [];
        const total = events.length;
        const errors = events.filter((e) => e.outcome === "error" || e.outcome === "empty").length;
        const live = events.filter((e) => e.outcome === "ok" && !e.cached);
        const primary = live.filter((e) => e.engine === "primary").length;
        const p95 = percentile(
          live.map((e) => e.latency_ms).filter((n): n is number => typeof n === "number"),
          95,
        );

        // Silence alarm: quota charged but nothing recorded means the
        // instrumentation is down, not that the day was quiet.
        const sinceDay = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        const { data: counters } = await supabaseAdmin
          .from("usage_counters")
          .select("subject_key, count")
          .gte("day", sinceDay)
          .limit(20000);
        const charged = (counters ?? [])
          .filter((c) => !c.subject_key.startsWith("ip:"))
          .reduce((sum, c) => sum + (c.count ?? 0), 0);
        const recorded = events.filter((e) => !e.cached && e.outcome !== "limited").length;

        const errorRate = total ? errors / total : 0;
        const primaryShare = live.length ? primary / live.length : 1;

        const breaches: string[] = [];
        if (errorRate > THRESHOLDS.errorRate) {
          breaches.push(`error rate ${(errorRate * 100).toFixed(1)}%`);
        }
        if (p95 !== null && p95 > THRESHOLDS.p95Ms) breaches.push(`p95 latency ${p95}ms`);
        if (live.length >= 10 && primaryShare < THRESHOLDS.primaryShare) {
          breaches.push(`primary engine served only ${(primaryShare * 100).toFixed(0)}%`);
        }

        if (charged > 0 && recorded < charged) {
          breaches.push(`instrumentation gap: ${charged} charged, ${recorded} recorded`);
        }

        if (breaches.length) {
          console.error("patkan health digest: THRESHOLD BREACH", { breaches, total, errorRate, p95, primaryShare });
        } else {
          console.log("patkan health digest: ok", { total, errorRate, p95, primaryShare });
        }

        return new Response(
          JSON.stringify({ total, errorRate, p95, primaryShare, charged, recorded, breaches }),
          { headers: { "content-type": "application/json", "cache-control": "no-store" } },
        );
      },
    },
  },
});
