/**
 * Text-free usage/performance telemetry.
 *
 * Nothing here stores prompt or output text — only shapes, sizes, timings and
 * outcomes, plus a one-way hash of the subject so a device can be counted over
 * time without being identifiable.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

export type Outcome = "ok" | "empty" | "error" | "limited";

export interface TransformEvent {
  subjectKind: "user" | "device";
  subjectKey: string;
  host?: string | null | undefined;
  surface?: string | null | undefined;
  persona?: string | undefined;
  dialect?: string | undefined;
  intensity?: string | undefined;
  intent?: string | undefined;
  engine?: string | undefined;
  cached?: boolean | undefined;
  inputChars?: number | undefined;
  outputChars?: number | undefined;
  latencyMs?: number | undefined;
  ttfbMs?: number | undefined;
  outcome: Outcome;
}

export async function hashSubject(subjectKey: string): Promise<string> {
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(subjectKey, "utf8").digest("hex");
}

/** Fire-and-forget: telemetry must never add latency or break a transform. */
export async function recordEvent(
  admin: SupabaseClient<Database>,
  event: TransformEvent,
): Promise<void> {
  try {
    await admin.from("transform_events").insert({
      subject_kind: event.subjectKind,
      subject_hash: await hashSubject(event.subjectKey),
      host: event.host ?? null,
      surface: (event.surface ?? "web").slice(0, 40),
      persona: event.persona ?? null,
      dialect: event.dialect ?? null,
      intensity: event.intensity ?? null,
      intent: event.intent ?? null,
      engine: event.engine ?? null,
      cached: Boolean(event.cached),
      input_chars: event.inputChars ?? 0,
      output_chars: event.outputChars ?? 0,
      latency_ms: event.latencyMs ?? null,
      ttfb_ms: event.ttfbMs ?? null,
      outcome: event.outcome,
    });
  } catch (err) {
    console.error("patkan telemetry: insert failed", err);
  }
}
