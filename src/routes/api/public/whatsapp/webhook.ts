import { createFileRoute } from "@tanstack/react-router";

/**
 * WhatsApp Cloud API webhook.
 * GET: Meta verification handshake (echo hub.challenge when token matches).
 * POST: acknowledge only; no payload is processed or stored until signature
 * verification (X-Hub-Signature-256 with the app secret) is added.
 */
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
      POST: async () => new Response("ok", { status: 200 }),
    },
  },
});
