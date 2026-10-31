import { expect, test } from "bun:test";
import { safeNextPath, setupProfileUrl } from "../src/lib/onboarding";

test("sign-in always routes through profile setup with the original destination", () => {
  expect(setupProfileUrl("/library")).toBe("/setup-profile?next=%2Flibrary");
});

test("next path rejects off-site destinations", () => {
  expect(safeNextPath("//evil.com")).toBe("/#playground");
  expect(safeNextPath("https://evil.com")).toBe("/#playground");
  expect(safeNextPath("/connect")).toBe("/connect");
});
