import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import {
  IP_LIMIT,
  MAX_VERIFY_ATTEMPTS,
  OTP_TTL_SECONDS,
  PHONE_LIMIT,
  generateOtp,
  hmacHex,
  normalizeE164,
  sendOtpTemplate,
  syntheticEmail,
  timingSafeEqual,
} from "./whatsapp-otp.server";

const phoneInput = z.object({
  dialCode: z.string().min(1).max(5),
  national: z.string().min(4).max(20),
});

function pepper() {
  const p = process.env["WHATSAPP_OTP_PEPPER"];
  if (!p) throw new Error("Sign-in is not configured");
  return p;
}

export const requestWhatsappOtp = createServerFn({ method: "POST" })
  .inputValidator((d) => phoneInput.parse(d))
  .handler(async ({ data }) => {
    const phone = normalizeE164(data.dialCode, data.national);
    if (!phone) return { ok: false as const, error: "Enter a valid WhatsApp number." };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const secret = pepper();
    const ip = getRequestHeader("cf-connecting-ip") || getRequestHeader("x-forwarded-for")?.split(",")[0] || "";
    const ipHash = ip ? await hmacHex(secret, `ip:${ip.trim()}`) : null;

    const since = (m: number) => new Date(Date.now() - m * 60_000).toISOString();
    const { count: phoneCount, error: e1 } = await supabaseAdmin
      .from("whatsapp_otp_challenges")
      .select("id", { count: "exact", head: true })
      .eq("phone_e164", phone)
      .gte("created_at", since(PHONE_LIMIT.windowMinutes));
    if (e1) throw new Error("Could not send code");
    if ((phoneCount ?? 0) >= PHONE_LIMIT.count)
      return { ok: false as const, error: "Too many codes requested. Try again in 15 minutes." };
    if (ipHash) {
      const { count: ipCount } = await supabaseAdmin
        .from("whatsapp_otp_challenges")
        .select("id", { count: "exact", head: true })
        .eq("request_ip_hash", ipHash)
        .gte("created_at", since(IP_LIMIT.windowMinutes));
      if ((ipCount ?? 0) >= IP_LIMIT.count)
        return { ok: false as const, error: "Too many codes requested. Try again later." };
    }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000).toISOString();
    const { data: row, error: insErr } = await supabaseAdmin
      .from("whatsapp_otp_challenges")
      .insert({
        phone_e164: phone,
        code_hash: await hmacHex(secret, `otp:${phone}:${code}`),
        expires_at: expiresAt,
        request_ip_hash: ipHash,
      })
      .select("id")
      .single();
    if (insErr || !row) throw new Error("Could not send code");

    const sent = await sendOtpTemplate(phone, code);
    if (!sent.ok) {
      await supabaseAdmin
        .from("whatsapp_otp_challenges")
        .update({ delivery_status: "failed", delivery_error: { send: sent.error }, consumed_at: new Date().toISOString() })
        .eq("id", row.id);
      return { ok: false as const, error: "We couldn't send a code to this number. Check it is on WhatsApp." };
    }
    await supabaseAdmin
      .from("whatsapp_otp_challenges")
      .update({ wa_message_id: sent.messageId, delivery_status: "accepted" })
      .eq("id", row.id);
    return { ok: true as const, phone, expiresAt, ttlSeconds: OTP_TTL_SECONDS };
  });

export const verifyWhatsappOtp = createServerFn({ method: "POST" })
  .inputValidator((d) => phoneInput.extend({ code: z.string().regex(/^\d{6}$/) }).parse(d))
  .handler(async ({ data }) => {
    const phone = normalizeE164(data.dialCode, data.national);
    if (!phone) return { ok: false as const, error: "Enter a valid WhatsApp number." };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const secret = pepper();

    const { data: ch } = await supabaseAdmin
      .from("whatsapp_otp_challenges")
      .select("id, code_hash, expires_at, attempts")
      .eq("phone_e164", phone)
      .is("consumed_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!ch || new Date(ch.expires_at).getTime() < Date.now())
      return { ok: false as const, error: "This code has expired. Request a new one." };
    if (ch.attempts >= MAX_VERIFY_ATTEMPTS)
      return { ok: false as const, error: "Too many wrong tries. Request a new code." };

    const hash = await hmacHex(secret, `otp:${phone}:${data.code}`);
    if (!timingSafeEqual(hash, ch.code_hash)) {
      await supabaseAdmin.from("whatsapp_otp_challenges").update({ attempts: ch.attempts + 1 }).eq("id", ch.id);
      return { ok: false as const, error: "That code is not right. Try again." };
    }
    const { data: consumed } = await supabaseAdmin
      .from("whatsapp_otp_challenges")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", ch.id)
      .is("consumed_at", null)
      .select("id");
    if (!consumed?.length) return { ok: false as const, error: "This code was already used. Request a new one." };

    const email = syntheticEmail(await hmacHex(secret, `phone:${phone}`));
    const { data: ident } = await supabaseAdmin
      .from("whatsapp_identities")
      .select("user_id")
      .eq("phone_e164", phone)
      .maybeSingle();
    if (!ident) {
      const { data: created, error: cErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { whatsapp_phone: phone, auth_method: "whatsapp" },
      });
      if (cErr || !created.user) {
        console.error("createUser failed", cErr);
        throw new Error("Could not sign you in");
      }
      const { error: iErr } = await supabaseAdmin
        .from("whatsapp_identities")
        .insert({ phone_e164: phone, user_id: created.user.id });
      if (iErr) throw new Error("Could not sign you in");
    } else {
      await supabaseAdmin.from("whatsapp_identities").update({ verified_at: new Date().toISOString() }).eq("phone_e164", phone);
    }

    const { data: link, error: lErr } = await supabaseAdmin.auth.admin.generateLink({ type: "magiclink", email });
    if (lErr || !link.properties?.hashed_token) {
      console.error("generateLink failed", lErr);
      throw new Error("Could not sign you in");
    }
    return { ok: true as const, tokenHash: link.properties.hashed_token };
  });
