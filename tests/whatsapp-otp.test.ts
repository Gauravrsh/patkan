import { expect, test } from "bun:test";
import { OTP_TTL_SECONDS, normalizeE164, shouldAdvanceStatus, otpTemplateBody } from "../src/lib/whatsapp-otp.server";

test("OTP expiry is locked to 3 minutes to match the approved template", () => {
  expect(OTP_TTL_SECONDS).toBe(180);
});
test("normalizes global numbers", () => {
  expect(normalizeE164("91", "098765 43210")).toBe("+919876543210");
  expect(normalizeE164("1", "(415) 555-0100")).toBe("+14155550100");
  expect(normalizeE164("44", "12")).toBeNull();
});
test("older sent status never overwrites delivered", () => {
  expect(shouldAdvanceStatus("delivered", "sent")).toBe(false);
  expect(shouldAdvanceStatus("accepted", "delivered")).toBe(true);
});
test("template uses patkan_login_otp_1 with code in body and copy button", () => {
  const b = otpTemplateBody("919876543210", "123456");
  expect(b.template.name).toBe("patkan_login_otp_1");
  expect(b.template.components[1]?.parameters[0]?.text).toBe("123456");
});
