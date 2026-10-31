import { createFileRoute } from "@tanstack/react-router";

/**
 * WhatsApp Cloud API webhook.
 * GET: Meta verification handshake.
 * POST: verifies X-Hub-Signature-256 with META_APP_SECRET, stores every delivery
 * in whatsapp_webhook_events, then applies message statuses to OTP challenges.
 */
async function verifySignature(raw: string, header: string | null, secret: string) {
  if (!header?.startsWith("sha256=")) return false;
  const { hmacHex, timingSafeEqual } = await import("@/lib/whatsapp-otp.server");
  return timingSafeEqual(await hmacHex(secret, raw), header.slice(7));
}

type Status = { id?: string; status?: string; timestamp?: string; errors?: unknown };

export const Route = createFileRoute("/api/public/whatsapp/webhook")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const mode = url.searchParams.get("hub.mode");
        const token = url.searchParams.get("hub.verify_token");
        const challenge = url.searchParams.get("hub.challenge") ?? "";
        const expected = process.env["WHATSAPP_VERIFY_TOKEN"] || "patkan_wa_verify_7f9c2d1b8e4a";
        if (mode === "subscribe" && token === expected && /^[\w-]{1,200}$/.test(challenge)) {
          return new Response(challenge, { status: 200, headers: { "content-type": "text/plain" } });
        }
        return new Response("Forbidden", { status: 403 });
      },
      POST: async ({ request }) => {
        const secret = process.env["META_APP_SECRET"];
        if (!secret) return new Response("Not configured", { status: 500 });
        const raw = await request.text();
        if (raw.length > 4 * 1024 * 1024) return new Response("Too large", { status: 413 });
        if (!(await verifySignature(raw, request.headers.get("x-hub-signature-256"), secret))) {
          return new Response("Unauthorized", { status: 401 });
        }
        let payload: any;
        try {
          payload = JSON.parse(raw);
        } catch {
          return new Response("Bad JSON", { status: 400 });
        }
        const { hmacHex, shouldAdvanceStatus } = await import("@/lib/whatsapp-otp.server");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const deliveryId = await hmacHex("delivery", raw);
        const field = payload?.entry?.[0]?.changes?.[0]?.field ?? "unknown";

        const { data: existing } = await supabaseAdmin
          .from("whatsapp_webhook_events")
          .select("id, processed_at")
          .eq("delivery_id", deliveryId)
          .maybeSingle();
        if (existing?.processed_at) return new Response("ok", { status: 200 });
        let eventId = existing?.id;
        if (!eventId) {
          const { data: ins, error } = await supabaseAdmin
            .from("whatsapp_webhook_events")
            .insert({ delivery_id: deliveryId, event: `whatsapp.${field}`, payload })
            .select("id")
            .single();
          if (error || !ins) return new Response("Store failed", { status: 500 });
          eventId = ins.id;
        }

        try {
          for (const entry of payload?.entry ?? []) {
            for (const change of entry?.changes ?? []) {
              for (const s of (change?.value?.statuses ?? []) as Status[]) {
                if (!s.id || !s.status) continue;
                const { data: ch } = await supabaseAdmin
                  .from("whatsapp_otp_challenges")
                  .select("id, delivery_status")
                  .eq("wa_message_id", s.id)
                  .maybeSingle();
                if (!ch || !shouldAdvanceStatus(ch.delivery_status, s.status)) continue;
                await supabaseAdmin
                  .from("whatsapp_otp_challenges")
                  .update({
                    delivery_status: s.status,
                    delivery_error: (s.errors as never) ?? null,
                    status_at: s.timestamp ? new Date(Number(s.timestamp) * 1000).toISOString() : null,
                  })
                  .eq("id", ch.id);
              }
            }
          }
          await supabaseAdmin
            .from("whatsapp_webhook_events")
            .update({ processed_at: new Date().toISOString(), processing_error: null })
            .eq("id", eventId);
        } catch (e) {
          await supabaseAdmin
            .from("whatsapp_webhook_events")
            .update({ processing_error: String(e).slice(0, 1000) })
            .eq("id", eventId);
          return new Response("Processing failed", { status: 500 });
        }
        return new Response("ok", { status: 200 });
      },
    },
  },
});
