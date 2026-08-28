# Patkan — Browser Extension V1

## What we're building

A Chrome/Edge extension that turns a lazy sentence into a rigorously structured prompt, plus a small
web app for the landing page, sign-in, and your saved prompt Library.

Two ways to use it:
1. **In place** — on chatgpt.com, claude.ai and gemini.google.com, type your rough text, end with `//`,
   and it rewrites inside the chat box.
2. **Side panel** — click the Patkan icon anywhere; type, transform, then Insert or Copy.

## PRD corrections carried into this plan

These are deliberate deviations from the PRD, based on the critique:

- **"Saves tokens" is dropped.** Structured prompts are longer. The claim becomes "fewer wasted retries".
- **`Tab` is not the trigger.** Tab is used by the host sites for focus and suggestions. Trigger is `//`
  at the end of the text, plus a click on the floating pill, plus `Cmd/Ctrl+Shift+K`.
- **Sub-500ms is met by a local template, not the LLM.** A deterministic scaffold appears instantly with
  zero network; the AI enrichment replaces it a second later. Nothing ever hangs on a blank box.
- **Ghost Mode is capped.** 10 transforms per device per day. After 10, sign-in is required. The 10/day
  cap continues to apply after sign-in in V1 (revisit once real cost data exists).
- **Plasmo is not used.** This project builds on TanStack Start. The extension is a hand-written
  Manifest V3 extension (React + Tailwind, rendered in a Shadow DOM so host site styles can't clash),
  packaged into a downloadable zip. Same result, toolchain that actually runs here.
- **Zero-Data Mode is not the default.** Default is: prompt text is sent to the AI endpoint, never stored.
  Zero-Data Mode instead disables all logging and Library sync, and is stated plainly rather than as a
  privacy slogan we can't prove.
- **Hover menu ("+ Add Edge Cases") is deferred.** It is a second paid AI call for a feature few will find.
  V1 ships Undo only.
- **Persona focus: Product Manager first.** UX Writer and Marketer personas ship as presets, but the
  quality bar and demo are built around PM output.

## Scope of V1

**Extension**
- Content script on 3 whitelisted hosts; detects focus in the composer.
- Floating pill (subtle sparkle) appears after ~5 words. Tooltip: "Type // to Patkan".
- Trigger → text dims, spinner → local scaffold appears → AI-enriched version replaces it, briefly highlighted.
- **Undo**: original text stored in memory, restored by an inline chip or `Cmd/Ctrl+Z`.
- **Clipboard fallback**: if writing back into the host editor fails, the result is copied and a toast says so.
- Side panel: textarea, persona dropdown, transform, Insert into page / Copy, Save to Library (signed in).
- Options page: persona default, Zero-Data Mode, host on/off toggles, usage counter, sign-in state.

**Web app (this project)**
- Landing page: what it does, live before/after demo, install instructions, download the extension zip.
- Google sign-in.
- Library: create, edit, delete your own persona templates; browse public ones.
- Transform endpoint the extension calls.

**Backend**
- `profiles` (tier, zero_data_mode), `prompt_templates` (title, system_instruction, is_public),
  `usage_counters` (device or user id, day, count) for the 10/day cap. RLS + grants on all three.
- Transform runs server-side through the Lovable AI gateway on a fast model; the key never reaches the browser.
- Rate limiting and a daily spend ceiling enforced server-side, not in the extension.

## Output format

The rewritten prompt uses XML tags as specced:

```text
<role>...</role>
<context>...</context>
<task>...</task>
<constraints>...</constraints>
```

## Build order

1. Backend: tables, RLS, transform endpoint with quota + local-scaffold contract.
2. Web app: landing, auth, Library, extension download.
3. Extension core: manifest, background worker, side panel, options page, auth handoff from the web app.
4. Host adapters: ChatGPT, Claude, Gemini — pill, trigger, injection, undo, fallback.
5. Package the zip, verify install and end-to-end flow.

## Technical notes

- MV3 extension source lives in `extension/`, zipped into `public/` for download; the site serves it via a
  fetch+blob download button (direct links fail in preview).
- Host editors are ProseMirror/Lexical/Slate — text is written via `beforeinput`/paste events, never
  `innerText`. Each host is an isolated adapter module with its own selector set so one site's redesign
  can't break the others.
- UI inside the page renders into a Shadow DOM with Tailwind scoped to it.
- Extension → server calls hit a `/api/public/*` route with its own auth: signed-in users send a Supabase
  bearer token; ghost users send a device id that the server quota-checks.
- Auth in the extension uses `chrome.identity` against the web app's sign-in, then stores the session in
  `chrome.storage.local`.
- Content scripts request the minimum host permissions (3 domains), not `<all_urls>` — this matters for
  Chrome Web Store review and for how scary the install prompt looks.

## Known risks

- **Store review.** A content script reading text on chatgpt.com needs a clear privacy policy and
  justification. Plan for a review round, not instant publish.
- **Adapter rot.** Host sites redesign. Mitigation: fallback to clipboard, plus a visible "report broken site" link.
- **Retention.** Rewriting alone is a novelty. The Library is what makes it sticky, so it ships in V1 rather than Phase 2.
