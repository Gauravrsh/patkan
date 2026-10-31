/**
 * WhatsApp OTP helpers (server only).
 * The approved Meta template `patkan_login_otp_1` says "Expires in 3 minutes",
 * so OTP_TTL_SECONDS is locked at 180 and must not change without a new template.
 */
export const OTP_TTL_SECONDS = 180;
export const OTP_TEMPLATE_NAME = "patkan_login_otp_1";
export const OTP_TEMPLATE_LANG = "en";
export const MAX_VERIFY_ATTEMPTS = 5;
export const PHONE_LIMIT = { count: 3, windowMinutes: 15 };
export const IP_LIMIT = { count: 10, windowMinutes: 60 };

/** Digits-only E.164 with leading "+". Returns null when invalid. */
export function normalizeE164(dialCode: string, national: string): string | null {
  const cc = dialCode.replace(/\D/g, "");
  let num = national.replace(/\D/g, "");
  if (!cc || cc.length > 3) return null;
  num = num.replace(/^0+/, "");
  if (num.startsWith(cc) && (cc + num).length > 15) num = num.slice(cc.length);
  const full = cc + num;
  if (full.length < 8 || full.length > 15) return null;
  return `+${full}`;
}

export function generateOtp(): string {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return String(buf[0] % 1_000_000).padStart(6, "0");
}

export async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function syntheticEmail(phoneHash: string): string {
  return `wa_${phoneHash.slice(0, 24)}@wa.patkan.in`;
}


export function otpTemplateBody(toDigits: string, code: string) {
  return {
    messaging_product: "whatsapp",
    to: toDigits,
    type: "template",
    template: {
      name: OTP_TEMPLATE_NAME,
      language: { code: OTP_TEMPLATE_LANG },
      components: [
        { type: "body", parameters: [{ type: "text", text: code }] },
        { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: code }] },
      ],
    },
  };
}

export async function sendOtpTemplate(toE164: string, code: string) {
  const token = process.env["WHATSAPP_ACCESS_TOKEN"];
  const phoneId = process.env["WHATSAPP_PHONE_NUMBER_ID"];
  if (!token || !phoneId) throw new Error("WhatsApp is not configured");
  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(otpTemplateBody(toE164.replace(/^\+/, ""), code)),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`WhatsApp send failed [${res.status}]: ${text}`);
    return { ok: false as const, error: text.slice(0, 2000) };
  }
  let id: string | null = null;
  try {
    id = JSON.parse(text)?.messages?.[0]?.id ?? null;
  } catch {
    /* ignore */
  }
  return { ok: true as const, messageId: id };
}

const RANK: Record<string, number> = { pending: 0, accepted: 1, sent: 2, delivered: 3, read: 4, failed: 5 };
/** Never let an older "sent" overwrite "delivered"/"read". "failed" always wins. */
export function shouldAdvanceStatus(current: string, next: string): boolean {
  return (RANK[next] ?? 0) > (RANK[current] ?? 0);
}
