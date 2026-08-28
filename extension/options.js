import { PERSONAS, INTENSITIES, DEFAULT_API_BASE } from "./patkan-core.js";

const $ = (id) => document.getElementById(id);

for (const p of PERSONAS) {
  const o = document.createElement("option");
  o.value = p.id;
  o.textContent = p.label;
  $("persona").appendChild(o);
}

for (const i of INTENSITIES) {
  const o = document.createElement("option");
  o.value = i.id;
  o.textContent = i.label;
  $("intensity").appendChild(o);
}

const stored = await chrome.storage.local.get(["persona", "apiBase", "zeroDataMode", "intensity"]);
$("persona").value = stored.persona || "auto";
$("intensity").value = stored.intensity || "standard";
$("apiBase").value = stored.apiBase || DEFAULT_API_BASE;
$("zero").checked = Boolean(stored.zeroDataMode);

$("save").addEventListener("click", async () => {
  await chrome.storage.local.set({
    persona: $("persona").value,
    intensity: $("intensity").value,
    apiBase: $("apiBase").value.trim() || DEFAULT_API_BASE,
    zeroDataMode: $("zero").checked,
  });
  $("saved").textContent = "Saved";
  setTimeout(() => ($("saved").textContent = ""), 1500);
});
