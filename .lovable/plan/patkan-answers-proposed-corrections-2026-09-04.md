# Patkan: answers + proposed corrections

## 1. How the logged-in section works today

- Auth page `/auth` offers Google (via the Cloud OAuth broker) and email/password.
- After sign-in, a Supabase session is stored in the browser and a `profiles` row is created by a database trigger.
- `/_authenticated/*` is a client-only gate: no user → redirect to `/auth`. `/library` is the only page behind it.
- `/connect` posts the session tokens to the extension via `postMessage`; the extension's `web-connect.js` stores them in `chrome.storage.local`.
- The extension then sends `Authorization: Bearer <token>` on every transform, which (a) lifts the 10/day ghost quota and (b) enables `GET /api/public/templates` to return the user's saved frameworks under RLS.
- Without sign-in everything still works in ghost mode, quota-limited by device ID.

## 2. How the user sees the prompt library

Today: only on the website, at `/library` — a CRUD list of "frameworks" (title + system instruction, optionally public). Inside the extension it appears only as a dropdown in the side panel, populated from `/api/public/templates`.

Does the user need it? Under the invisible-layer thesis, mostly no. A framework only matters when someone repeatedly wants a non-default house style. Recommendation: keep the concept, drop the web CRUD surface as a headline feature, and let a framework be saved from the extension itself ("save this style") — the website becomes an install/connect page, not a destination.-------let it be as it is. We will come to it later. DO not make any changes for this point.

## 3. Invisible-layer consequence (what we stop building)

If the user never leaves their LLM, these lose priority: the web transform playground as a product surface, the Library management UI, public/shared frameworks, persona chips, the intensity picker. What still matters: the in-place `//` trigger, latency, dialect auto-detection, quota, and a one-click connect. This plan assumes that direction unless you say otherwise.--------no action on this question for now. We will come to it later.

## 4. Coverage: where Patkan runs today

Content script matches (from `extension/manifest.json`):

- chatgpt.com
- chat.openai.com
- claude.ai
- gemini.google.com

Dialect mapping: Claude → XML, ChatGPT → Markdown, Gemini → Sectioned, everything else → Markdown.

Notably missing despite being in the PRD: Notion AI.

### Missing high-share desktop surfaces

Global:

- Microsoft Copilot (copilot.microsoft.com) and Copilot in Office/Edge sidebar
- Perplexity (perplexity.ai)
- Grok (grok.com, and x.com's Grok panel)
- DeepSeek (chat.deepseek.com)
- Meta AI (meta.ai)
- Mistral Le Chat (chat.mistral.ai)
- Google AI Studio (aistudio.google.com) — heavy developer usage
- Poe (poe.com)
- Notion AI (notion.so), plus Slack AI and Gemini in Gmail/Docs as second-wave targets
- Kimi (kimi.com), Qwen Chat (chat.qwen.ai)

India-specific weight (desktop): ChatGPT dominant, Gemini boosted by carrier bundling, Perplexity Pro bundled free with Airtel (very large installed base), Copilot via Windows/Edge default, DeepSeek and Meta AI meaningful. Krutrim and Sarvam exist but are low desktop share — skip.

Proposed phase 1 additions: Perplexity, Copilot, Grok, DeepSeek, Meta AI, Le Chat, AI Studio. Phase 2: Notion AI, Poe, Kimi, Qwen. Each needs an editor adapter (contenteditable / ProseMirror / Lexical / plain textarea) plus a dialect mapping.--------this is top priority enhancement to be done, right now.

## 5. Auth: what is actually wrong

Confirmed from the signup request: the confirmation email's `redirect_to` was
`https://id-preview--<project>.lovable.app/auth?next=/library`.

That is the **editor preview host**, which sits behind Lovable's own preview access gate. So the confirmation link lands the user on a Lovable sign-in screen asking for email and password — a Lovable login, not a Patkan login. It is not a bug in Patkan's auth code; it is the wrong redirect origin for a shared email link.-------okay, fix it. Send it to live patkan. Currently when I am trying to signup on [patkan.lovable.app](http://patkan.lovable.app) I never receive the email in my inbox.

Two secondary issues:

- Email confirmation is on, which forces a round trip through email before a first transform. For an invisible-layer tool this is friction with little value.
- The confirmation email itself is sent from the default backend sender, so it reads as generic rather than as Patkan.

### Proposed fix

1. Send auth emails to the canonical public origin (`https://patkan.lovable.app`) instead of `window.location.origin` whenever the current origin is a preview host. Same for the Google OAuth `redirect_uri` fallback.
2. Decide on confirmation: either turn on auto-confirm so email sign-up is instant, or keep confirmation and make the post-confirm landing go straight to `/connect`.
3. Fix the hydration warning currently thrown on `/auth` (server/client markup mismatch from the redirect effect) so the page does not remount on load.

## 6. Technical notes

- Redirect origin helper lives next to `safeNext()` in `src/routes/auth.tsx`; `emailRedirectTo` and `redirect_uri` both consume it.
- New host support is three edits per host: `manifest.json` matches + `host_permissions`, a dialect entry in `extension/patkan-core.js` and `src/lib/patkan-core.ts`, and an adapter entry in `extension/content.js`.
- Auto-confirm is a backend auth setting, not code.

## Open decisions for you

- Auto-confirm email sign-up, or keep the confirmation step? ‐------keep it. Upon clicking the button in email, it should land back on patkan.
- Which of the phase-1 hosts do you want in the first pass?
- Keep the web Library page, or reduce the site to install + connect?-------keep it for now, we'll see what to do with it later.