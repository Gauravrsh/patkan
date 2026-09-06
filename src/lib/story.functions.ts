import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface SectionRow {
  section: string;
  reach: number; // share of sessions that saw it
  holdMs: number | null; // median dwell
  drop: number; // share of sessions whose last section it was
  assist: number | null; // download rate seen vs not seen, in points
}

export interface FunnelStep {
  step: string;
  count: number;
}

export interface StoryStats {
  windowDays: number;
  sessions: number;
  visitors: number;
  funnel: FunnelStep[];
  sections: SectionRow[];
  scrollDepth: { depth: number; share: number }[];
  devices: { key: string; count: number }[];
  referrers: { key: string; count: number }[];
  extension: {
    initialized: number;
    triggers: number;
    injectionFailures: number;
    injectionFailureRate: number | null;
    quotaWalls: number;
    rejections: number;
    failuresByHost: { key: string; count: number }[];
  };
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  return Math.round(s[Math.floor(s.length / 2)]!);
}

function tally(values: (string | null)[], limit = 8) {
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

export const getStoryStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { days?: number } | undefined) => ({
    days: Math.min(90, Math.max(1, input?.days ?? 14)),
  }))
  .handler(async ({ data, context }): Promise<StoryStats> => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError) throw new Error("Could not verify access.");
    if (!isAdmin) throw new Error("Forbidden");

    const since = new Date(Date.now() - data.days * 86400000).toISOString();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [pageRes, extRes] = await Promise.all([
      supabaseAdmin
        .from("page_events")
        .select("session_id, visitor_hash, event, section, value_int, device, referrer_host")
        .gte("created_at", since)
        .limit(50000),
      supabaseAdmin
        .from("extension_events")
        .select("event, host, reason")
        .gte("created_at", since)
        .limit(50000),
    ]);

    const rows = pageRes.data ?? [];
    const ext = extRes.data ?? [];

    const sessions = new Set(rows.map((r) => r.session_id));
    const sessionCount = sessions.size;

    const downloadSessions = new Set(
      rows.filter((r) => r.event === "download_clicked").map((r) => r.session_id),
    );

    const seenBySection = new Map<string, Set<string>>();
    const dwellBySection = new Map<string, number[]>();
    const exitBySection = new Map<string, Set<string>>();

    for (const r of rows) {
      if (!r.section) continue;
      if (r.event === "section_seen") {
        const set = seenBySection.get(r.section) ?? new Set<string>();
        set.add(r.session_id);
        seenBySection.set(r.section, set);
      } else if (r.event === "section_dwell" && typeof r.value_int === "number") {
        const list = dwellBySection.get(r.section) ?? [];
        list.push(r.value_int);
        dwellBySection.set(r.section, list);
      } else if (r.event === "exit_section") {
        const set = exitBySection.get(r.section) ?? new Set<string>();
        set.add(r.session_id);
        exitBySection.set(r.section, set);
      }
    }

    const baselineDownload = sessionCount ? downloadSessions.size / sessionCount : 0;

    const sections: SectionRow[] = [...seenBySection.entries()]
      .map(([section, sessionsSeen]) => {
        const withDownload = [...sessionsSeen].filter((s) => downloadSessions.has(s)).length;
        const rateSeen = sessionsSeen.size ? withDownload / sessionsSeen.size : 0;
        return {
          section,
          reach: sessionCount ? sessionsSeen.size / sessionCount : 0,
          holdMs: median(dwellBySection.get(section) ?? []),
          drop: sessionCount ? (exitBySection.get(section) ?? 0) / sessionCount : 0,
          assist: sessionCount ? rateSeen - baselineDownload : null,
        };
      })
      .sort((a, b) => b.reach - a.reach);

    const countSessions = (event: string) =>
      new Set(rows.filter((r) => r.event === event).map((r) => r.session_id)).size;

    const funnel: FunnelStep[] = [
      { step: "viewed", count: sessionCount },
      { step: "typed", count: countSessions("playground_input_started") },
      { step: "compiled", count: countSessions("playground_compiled") },
      { step: "downloaded", count: downloadSessions.size },
      { step: "installed", count: ext.filter((e) => e.event === "extension_initialized").length },
    ];

    const depthCounts = [25, 50, 75, 100].map((depth) => {
      const reached = new Set(
        rows.filter((r) => r.event === "scroll_depth" && r.value_int === depth).map((r) => r.session_id),
      ).size;
      return { depth, share: sessionCount ? reached / sessionCount : 0 };
    });

    const triggers = ext.filter((e) => e.event === "trigger_detected").length;
    const failures = ext.filter((e) => e.event === "injection_failed");

    return {
      windowDays: data.days,
      sessions: sessionCount,
      visitors: new Set(rows.map((r) => r.visitor_hash)).size,
      funnel,
      sections,
      scrollDepth: depthCounts,
      devices: tally(rows.filter((r) => r.event === "page_viewed").map((r) => r.device)),
      referrers: tally(rows.filter((r) => r.event === "page_viewed").map((r) => r.referrer_host)),
      extension: {
        initialized: ext.filter((e) => e.event === "extension_initialized").length,
        triggers,
        injectionFailures: failures.length,
        injectionFailureRate: triggers ? failures.length / triggers : null,
        quotaWalls: ext.filter((e) => e.event === "quota_limit_reached").length,
        rejections: ext.filter((e) => e.event === "transform_rejected").length,
        failuresByHost: tally(failures.map((e) => e.host)),
      },
    };
  });
