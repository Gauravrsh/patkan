# Engine model selection for Patkan's transform

## Decision needed

The Nous catalogue has no Hermes model (Hermes-4 is retired). From the live 382-model catalogue, benchmarked and priced for one job only: sloppy text -> expert prompt (~2,500 tokens/call).

## Recommended configuration

- Primary: `qwen/qwen3.7-flash` ($0.024/$0.104 per 1M tokens) — strong instruction following, optional reasoning (fast streaming), ~$0.0002 per transform.
- Secondary fallback: `z-ai/glm-4.7-flash` ($0.048/$0.320) — sharp structured output.
- Existing fallback stays: Lovable AI gateway Gemini, then local scaffold. Order: Nous -> Gemini -> local.
- Keep `HERMES_MODEL` env override; no user-facing model picker (per approved PRD).
- UI label: stop calling it "Hermes" — label the engine honestly, e.g. `Ready` / `Ready — Patkan engine` / `Ready — offline draft`.

## Build steps (once model choice is confirmed)

1. Update `DEFAULT_HERMES_MODEL` in `src/lib/patkan-engines.server.ts` to the confirmed model id.
2. Update the PRD to reflect that Hermes is unavailable and the engine is the confirmed model.
3. Rename UI strings that say "Hermes" ("Hermes is sharpening this…") to neutral engine wording in `src/routes/index.tsx`, `extension/content.js`, `extension/sidepanel.js`.
4. Benchmark the confirmed model on 5 real sloppy-text samples across personas (engineer, PM, marketer, writer) and verify streaming latency under ~2s to first token.
5. Run a full transform through the web UI and the extension to confirm the three-beat flow works end to end with the new engine.

## Notes

- Hermes (and every hosted LLM) is stateless — it does not learn across calls. If per-user learning is ever wanted, it must be built (store input->output pairs, inject as few-shot examples). Not in scope here.
- Models with mandatory reasoning (glm-5.3, qwen3.8-max, kimi-k3) were rejected: they add latency and cost a rewrite task does not need.
