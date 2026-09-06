import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { blockedResponse, classifyClient, corsHeadersFor } from "@/lib/patkan-access.server";

/**
 * Text-free product analytics intake.
 *
 * Accepts a small batch of shape-only events from the website and the
 * extension. No prompt text, no free text of any kind, no IP address is
 * stored — only which section was seen, for how long, and which actions
 * happened.
 */

const PAGE_EVENTS = [
  "page_viewed",
  "section_seen",
  "section_dwell",
  "scroll_depth",
  "playground_input_started",
  "playground_compiled",
  "playground_copied",
  "download_clicked",
  "privacy_modal_viewed",
  "share_clicked",
  "nav_clicked",
  "exit_section",
] as const;

const EXTENSION_EVENTS = [
  "extension_initialized",
  "trigger_detected",
  "injection_failed",
  "transform_rejected",
  "quota_limit_reached",
  "account_connect_viewed",
  "account_connect_success",
] as const;

const short = z.string().trim().min(1).max(60);

const pageEvent = z.object({
  kind: z.literal("page").optional(),
  event: z.enum(PAGE_EVENTS),
  section: short.optional(),
  path: z.string().max(120).optional(),
  value: z.number().int().min(0).max(3_600_000).optional(),
  device: z.enum(["mobile", "desktop"]).optional(),
  referrerHost: z.string().max(120).optional(),
  meta: z.record(z.string().max(40), z.union([z.string().max(60), z.number(), z.boolean()])).optional(),
});

const extensionEvent = z.object({
  kind: z.literal("extension"),
  event: z.enum(EXTENSION_EVENTS),
  host: z.string().max(120).optional(),
  surface: short.optional(),
  reason: short.optional(),
  value: z.number().int().min(0).max(3_600_000).optional(),
  version: z.string().max(20).optional(),
});

const payload = z.object({
  sessionId: z.string().min(6).max(60),
  subject: z.string().max(80).optional(),
  events: z.array(z.union([extensionEvent, pageEvent])).min(1).max(50),
});

async function hash(value: string): Promise<string> {
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export const Route = createFileRoute("/api/public/events")({
  server: {
    handlers: {
      OPTIONS: ({ request }) =>
        new Response(null, { status: 204, headers: corsHeadersFor(request, "POST") }),
      POST: async ({ request }) => {
        const CORS = corsHeadersFor(request, "POST");
        if (classifyClient(request) === "blocked") return blockedResponse(request, "POST");

        const raw = await request.text();
        if (raw.length > 20_000) return new Response(null, { status: 204, headers: CORS });

        let parsed: z.infer<typeof payload>;
        try {
          parsed = payload.parse(JSON.parse(raw));
        } catch {
          return new Response(null, { status: 204, headers: CORS });
        }

        const visitorHash = await hash(parsed.subject ?? parsed.sessionId);
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const pageRows = parsed.events
          .filter((e): e is z.infer<typeof pageEvent> => e.kind !== "extension")
          .map((e) => ({
            session_id: parsed.sessionId,
            visitor_hash: visitorHash,
            path: e.path ?? "/",
            event: e.event,
            section: e.section ?? null,
            value_int: e.value ?? null,
            device: e.device ?? null,
            referrer_host: e.referrerHost ?? null,
            meta: e.meta ?? {},
          }));

        const extRows = parsed.events
          .filter((e): e is z.infer<typeof extensionEvent> => e.kind === "extension")
          .map((e) => ({
            subject_hash: visitorHash,
            event: e.event,
            host: e.host ?? null,
            surface: e.surface ?? null,
            reason: e.reason ?? null,
            value_int: e.value ?? null,
            version: e.version ?? null,
          }));

        try {
          if (pageRows.length) await supabaseAdmin.from("page_events").insert(pageRows);
          if (extRows.length) await supabaseAdmin.from("extension_events").insert(extRows);
        } catch (err) {
          console.error("patkan events: insert failed", err);
        }

        return new Response(null, { status: 204, headers: CORS });
      },
    },
  },
});
