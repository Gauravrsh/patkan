// Packages the Patkan extension for every desktop browser we support.
//
//   Chromium family (Chrome, Edge, Opera) -> public/patkan-extension.zip
//   Firefox (MV3, sidebar_action)         -> public/patkan-extension-firefox.zip
//
// Safari cannot be packaged here: Apple requires xcrun safari-web-extension-converter
// plus a signed Xcode build. The Chromium folder is the input for that conversion.
//
// Run: bun scripts/build-extension.mjs

import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const src = resolve(root, "extension");
const out = resolve(root, "public");
const tmp = resolve(root, ".tmp-extension");

const base = JSON.parse(readFileSync(resolve(src, "manifest.json"), "utf8"));

/**
 * A fork points its build at its own server:
 *   PATKAN_API_BASE="https://your-host.example" bun scripts/build-extension.mjs
 * Without it the build targets Patkan's own server, which only serves patkan.in.
 */
const apiBase = (process.env.PATKAN_API_BASE || "https://patkan.lovable.app").replace(/\/$/, "");

/** Rewrite the packed copy's DEFAULT_API_BASE and host permission. */
function applyApiBase(dir, manifest) {
  const corePath = resolve(dir, "patkan-core.js");
  const core = readFileSync(corePath, "utf8").replace(
    /export const DEFAULT_API_BASE = "[^"]*";/,
    `export const DEFAULT_API_BASE = "${apiBase}";`,
  );
  writeFileSync(corePath, core);
  manifest.host_permissions = manifest.host_permissions.map((h) =>
    h === "https://patkan.lovable.app/*" ? `${apiBase}/*` : h,
  );
  return manifest;
}

/** Firefox MV3: no service_worker, no sidePanel, needs an explicit add-on id. */
function firefoxManifest(manifest) {
  const m = structuredClone(manifest);
  m.background = { scripts: ["background.js"], type: "module" };
  delete m.side_panel;
  m.sidebar_action = {
    default_panel: "sidepanel.html",
    default_title: "Patkan",
    default_icon: { 128: "icon128.png" },
  };
  m.permissions = m.permissions.filter((p) => p !== "sidePanel");
  m.browser_specific_settings = {
    gecko: { id: "patkan@patkan.in", strict_min_version: "115.0" },
  };
  return m;
}

function pack(name, manifest) {
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  cpSync(src, tmp, { recursive: true });
  writeFileSync(
    resolve(tmp, "manifest.json"),
    JSON.stringify(applyApiBase(tmp, structuredClone(manifest)), null, 2) + "\n",
  );
  const zip = resolve(out, name);
  rmSync(zip, { force: true });
  execFileSync("zip", ["-r", "-q", zip, "."], { cwd: tmp });
  rmSync(tmp, { recursive: true, force: true });
  console.log("built", name);
}

console.log("api base:", apiBase);
pack("patkan-extension.zip", base);
pack("patkan-extension-firefox.zip", firefoxManifest(base));
