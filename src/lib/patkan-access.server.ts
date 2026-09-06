/**
 * Access control for the public Patkan API.
 *
 * The source is open; this server is not a public utility. Browser calls are
 * accepted only from Patkan's own origins (or, for a self-hosted copy, from the
 * origins named in PATKAN_ALLOWED_ORIGINS). Non-browser callers — the packaged
 * extension, curl — send no Origin header and can't be identified by it, so they
 * are additionally held under a per-IP daily ceiling.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

export const BLOCKED_MESSAGE =
  "This Patkan server only serves patkan.in. Patkan is open source — run your own copy with your own AI key.";

/** Daily ceiling for one IP address across every device id it invents. */
export const IP_DAILY_CEILING = Number(process.env["PATKAN_IP_DAILY_CEILING"] ?? 50) || 50;

const DEFAULT_ORIGINS = [
  "https://patkan.in",
  "https://www.patkan.in",
  "https://patkan.lovable.app",
];

function configuredOrigins(): string[] {
  const raw = process.env["PATKAN_ALLOWED_ORIGINS"];
  if (!raw) return DEFAULT_ORIGINS;
  return raw
    .split(",")
    .map((o) => o.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

/** Lovable preview/build domains and local development. */
function isTrustedHost(origin: string): boolean {
  try {
    const { hostname, protocol } = new URL(origin);
    if (protocol === "http:" && (hostname === "localhost" || hostname === "127.0.0.1")) return true;
    if (process.env["PATKAN_ALLOWED_ORIGINS"]) return false;
    return hostname.endsWith(".lovable.app") || hostname.endsWith(".lovableproject.com");
  } catch {
    return false;
  }
}

export type ClientKind = "web" | "native" | "blocked";

/**
 * "web" — a browser page on an allowed origin.
 * "native" — no Origin header: the extension worker, a server, or curl.
 * "blocked" — a browser page on some other origin (a fork's site).
 */
export function classifyClient(request: Request): ClientKind {
  const origin = request.headers.get("origin");
  if (!origin || origin === "null") return "native";
  const normalized = origin.replace(/\/$/, "");
  if (normalized.startsWith("chrome-extension://") || normalized.startsWith("moz-extension://")) {
    return "native";
  }
  if (configuredOrigins().includes(normalized) || isTrustedHost(normalized)) return "web";
  return "blocked";
}

/** CORS headers that echo only an allowed origin — never a wildcard. */
export function corsHeadersFor(request: Request, methods: string): Record<string, string> {
  const origin = request.headers.get("origin");
  const kind = classifyClient(request);
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": `${methods}, OPTIONS`,
    "Access-Control-Allow-Headers": "content-type, authorization, x-patkan-device",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  if (origin && kind !== "blocked") headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

export function blockedResponse(request: Request, methods: string): Response {
  return new Response(JSON.stringify({ error: BLOCKED_MESSAGE, blocked: true }), {
    status: 403,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      ...corsHeadersFor(request, methods),
    },
  });
}

function clientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

/**
 * One shared daily ceiling per IP. Stops a scripted caller from minting fresh
 * device ids to farm the free allowance; ordinary users never reach it.
 */
export async function consumeIpQuota(
  admin: SupabaseClient<Database>,
  request: Request,
  day: string,
): Promise<boolean> {
  const ip = clientIp(request);
  if (ip === "unknown") return true;
  const { createHash } = await import("node:crypto");
  const key = `ip:${createHash("sha256").update(ip, "utf8").digest("hex").slice(0, 32)}`;
  try {
    const { data, error } = await admin.rpc("consume_quota", {
      _subject_key: key,
      _day: day,
      _limit: IP_DAILY_CEILING,
    });
    if (error) return true; // never fail closed on a telemetry-grade check
    const row = Array.isArray(data) ? data[0] : data;
    return Boolean(row?.allowed);
  } catch {
    return true;
  }
}
