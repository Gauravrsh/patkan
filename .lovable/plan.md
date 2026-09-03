# Engine model selection + response cache for Patkan

## Context

The Nous catalogue has no Hermes model (Hermes-4 is retired). We pick the model; Nous only hosts it. Per-call volume is ~1,900 tokens in + ~600 out (~$0.0001–0.002 per transform depending on model). No model ever learns across calls — the API is stateless; any "learning" must be built by us and is out of scope.

## Recommended configuration

- Primary: `qwen/qwen3.7-flash` ($0.024/$0.104 per 1M) — ~10,400 prompts per ₹100. Strong instruction following, optional reasoning so it streams fast.
- Secondary fallback: `z-ai/glm-4.7-flash` ($0.048/$0.320) — ~4,000 prompts per ₹100.
- Existing fallback stays: Lovable AI gateway Gemini, then local scaffold. Order: Nous -> Gemini -> local.
- Keep the `HERMES_MODEL` env override (rename to `PATKAN_ENGINE_MODEL`); no user-facing model picker.
- UI label: drop "Hermes" wording. Use `Sharpening…`, `Ready`, `Ready — offline draft`. Engine field values become `primary` / `fallback` / `local`.

## New: normalized exact-match response cache

- New table `prompt_cache` (public schema, with GRANTs + RLS): columns `id`, `input_hash` (unique, sha256 of normalized input + persona + intensity + dialect), `input_text`, `output_text`, `engine`, `hit_count`, `created_at`, `last_hit_at`. Read/write via service role only (server-side); no direct user access.
- Normalization: lowercase, trim, collapse whitespace.
- Flow in `src/routes/api/public/transform.ts`: check cache before calling any engine; on hit, stream the stored output immediately (also improves the "magic" speed); on miss, run the engine chain and store the result.
- No fuzzy/percent matching in this round — near-identical strings can need different outputs, and stale replays would quietly hurt quality.
- Quota behavior: cache hits should not consume the daily quota (decision to confirm — recommended: hits are free).

## Build steps

1. Update `src/lib/patkan-engines.server.ts`: rename default model constant, set primary `qwen/qwen3.7-flash`, add `z-ai/glm-4.7-flash` as second Nous attempt before Gemini; rename engine ids to `primary`/`fallback`/`local` (update `meta`/`done` SSE payloads accordingly).
2. Create `prompt_cache` table migration with GRANTs + RLS + service-role-only access.
3. Wire cache lookup/store into `src/routes/api/public/transform.ts` (normalize + sha256, hit -> replay SSE, miss -> store after done).
4. Rename "Hermes" UI strings in `src/routes/index.tsx`, `extension/content.js`, `extension/sidepanel.js`, `extension/background.js` to neutral wording; update the approved PRD text accordingly.
5. Update `src/lib/patkan-stream.ts` engine labels if needed.
6. Benchmark primary model on 5 real sloppy-text samples across personas (engineer, PM, marketer, writer); verify streaming first token under ~2s.
7. End-to-end check: three-beat flow on web UI and extension, cache hit replay, quota untouched on hits.

## Notes

- Free-tier models exist (6) but are finance/coding-tuned or force reasoning; not recommended as primary. Could serve as a last free fallback later.
- Per-user learning (few-shot injection from a user's history) is a possible future feature; explicitly out of scope.
